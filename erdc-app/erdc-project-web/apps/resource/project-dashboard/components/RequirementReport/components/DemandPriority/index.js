define([
    'text!' + ELMP.resource('project-dashboard/components/RequirementReport/components/DemandPriority/index.html'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js',
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-dashboard/mixin.js'),
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, echarts, ErdcKit, store, dashMixin) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                myChartResize: () => {},
                xAxisData: [],
                seriesData: []
            };
        },
        created() {},
        mounted() {
            setTimeout(() => {
                this.getData();
            }, 500);
        },
        components: {
            DashboardConfig: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/DashboardConfig/index.js')
            )
        },
        mixins: [dashMixin],
        computed: {
            oid() {
                return this.$route.query.pid;
            }
        },
        methods: {
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                if (document.getElementById('demandPriority')) {
                    const myChart = echarts.init(document.getElementById('demandPriority'));
                    // 绘制图表
                    myChart.setOption({
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'cross',
                                crossStyle: {
                                    color: '#999'
                                }
                            }
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: this.xAxisData,
                                axisPointer: {
                                    type: 'shadow'
                                }
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                minInterval: 1
                            }
                        ],
                        series: [
                            {
                                type: 'bar',
                                itemStyle: {
                                    color: ({ dataIndex }) => {
                                        return this.chartColors[dataIndex];
                                    }
                                },
                                data: this.seriesData
                            }
                        ]
                    });
                    this.myChartResize = () => {
                        // 重新绘制 ECharts 实例
                        myChart.resize();
                    };
                    // 组件销毁前解绑事件处理程序
                    this.$once('hook:beforeDestroy', () => {
                        window.removeEventListener('resize', this.myChartResize);
                    });
                    // 监听窗口大小变化
                    window.addEventListener('resize', this.myChartResize);
                }
            },
            getData() {
                this.backData = {};
                this.$famHttp({
                    url: '/ppm/communal/getEchartsOption',
                    data: {
                        primaryObjectOid: this.oid,
                        echartsType: 'BAR',
                        typeName: store.state.classNameMapping.require
                    },
                    className: this.projectClassName,
                    method: 'POST'
                })
                    .then((res) => {
                        this.xAxisData = res?.data.series[0].data.map((item) => item.name);
                        this.seriesData = res?.data.series[0].data.map((item) => item.value);
                        this.drawLine();
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
            }
        }
    };
});
