define([
    'text!' + ELMP.resource('project-dashboard/components/TaskReport/components/CompletionRateDistribut/index.html'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js',
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-dashboard/mixin.js'),
    ELMP.resource('project-dashboard/components/TaskReport/mixin.js'),
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, echarts, ErdcKit, store, dashMixin, mixin) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                myChartResize: () => {},
                yAxisData: [],
                seriesData: [],
                startTime: '',
                endTime: ''
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
        mixins: [dashMixin, mixin],
        computed: {
            oid() {
                return this.$route.query.pid;
            }
        },
        methods: {
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                if (document.getElementById('taskChart1')) {
                    const myChart = echarts.init(document.getElementById('taskChart1'));
                    // 绘制图表
                    myChart.setOption({
                        tooltip: {
                            trigger: 'axis',
                            formatter: '{b} {c}%',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        xAxis: {
                            type: 'value',
                            axisLabel: {
                                formatter: '{value}%'
                            },
                            boundaryGap: [0, 0.01]
                        },
                        yAxis: {
                            type: 'category',
                            data: this.yAxisData
                        },
                        series: [
                            {
                                name: '计划集',
                                type: 'bar',
                                itemStyle: {
                                    color: (params) => {
                                        return this.chartColors[params.dataIndex % this.chartColors.length];
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
                        chartType: 'barCompletion',
                        typeName: store.state.classNameMapping.task,
                        pageSearchDto: {
                            className: store.state.classNameMapping.task,
                            conditionDtoList: [
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                    oper: 'EQ',
                                    value1: this.oid
                                }
                            ].concat(
                                this.startTime
                                    ? [
                                          {
                                              attrName: 'erd.cloud.ppm.plan.entity.Task#timeInfo.scheduledStartTime',
                                              oper: 'GE',
                                              value1: this.startTime
                                          },
                                          {
                                              attrName: 'erd.cloud.ppm.plan.entity.Task#timeInfo.scheduledEndTime',
                                              oper: 'LE',
                                              value1: this.endTime
                                          }
                                      ]
                                    : []
                            )
                        }
                    },
                    className: this.projectClassName,
                    method: 'POST'
                })
                    .then((res) => {
                        this.yAxisData = res?.data.series.map((item) => item.name);
                        this.seriesData = res?.data.series.map((item) => item.data?.[0].value || 0);
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
