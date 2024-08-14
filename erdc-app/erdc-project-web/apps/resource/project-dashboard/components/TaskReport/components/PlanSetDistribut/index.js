define([
    'text!' + ELMP.resource('project-dashboard/components/TaskReport/components/PlanSetDistribut/index.html'),
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
                xAxisData: [],
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
        computed: {
            oid() {
                return this.$route.query.pid;
            }
        },
        components: {
            DashboardConfig: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/DashboardConfig/index.js')
            )
        },
        mixins: [dashMixin, mixin],
        methods: {
            drawLine() {
                if (document.getElementById('taskChart2')) {
                    // 基于准备好的dom，初始化echarts实例
                    const myChart = echarts.init(document.getElementById('taskChart2'));
                    // 绘制图表
                    myChart.setOption({
                        tooltip: {
                            trigger: 'axis',
                            axisPointer: {
                                type: 'shadow'
                            }
                        },
                        xAxis: [
                            {
                                type: 'category',
                                data: this.xAxisData
                            }
                        ],
                        yAxis: [
                            {
                                type: 'value',
                                minInterval: 1
                            }
                        ],
                        series: this.seriesData
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
                this.$famHttp({
                    url: '/ppm/communal/getEchartsOption',
                    data: {
                        primaryObjectOid: this.oid,
                        echartsType: 'BAR',
                        chartType: 'barCollect',
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
                        const data = res?.data;
                        this.xAxisData = data.series.map((item) => item.name);
                        const statusArr = Object.keys(data.state2name);
                        this.seriesData = statusArr.map((item) => ({
                            name: data.state2name[item],
                            type: 'bar',
                            barWidth: 30 / (this.xAxisData.length || 1),
                            itemStyle: {
                                color: this.chartStatusColor[item]
                            },
                            data: data.series.map((_item) => {
                                if (!_item.data) return 0;
                                const k = _item.data.find((__item) => __item.status === item);
                                return k?.value || 0;
                            })
                        }));
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
