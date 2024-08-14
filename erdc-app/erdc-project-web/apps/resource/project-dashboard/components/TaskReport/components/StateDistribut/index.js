define([
    'text!' + ELMP.resource('project-dashboard/components/TaskReport/components/StateDistribut/index.html'),
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
                seriesData: [],
                total: 0,
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
                // 基于准备好的dom，初始化echarts实例
                if (document.getElementById('taskChart3')) {
                    const myChart = echarts.init(document.getElementById('taskChart3'));
                    // 绘制图表
                    myChart.setOption({
                        title: [
                            {
                                text: this.i18n.total,
                                subtext: this.total + '',
                                textStyle: {
                                    fontSize: 16,
                                    color: 'black'
                                },
                                subtextStyle: {
                                    fontSize: 20,
                                    color: 'black'
                                },
                                textAlign: 'center',
                                x: '48%',
                                y: '44%'
                            }
                        ],
                        tooltip: {
                            trigger: 'item',
                            formatter: '{a} <br/>{b} : {c} ({d}%)'
                        },
                        series: [
                            {
                                name: this.i18n.planStateSet,
                                type: 'pie',
                                radius: ['30%', '55%'],
                                center: ['50%', '50%'],
                                label: {
                                    formatter: '{b} {c} ({d}%)',
                                    position: 'inner'
                                },
                                data: this.seriesData,
                                emphasis: {
                                    itemStyle: {
                                        shadowBlur: 10,
                                        shadowOffsetX: 0,
                                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                                    }
                                }
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
                        echartsType: 'PIE',
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
                        const { series, total } = res.data || {};
                        this.seriesData =
                            series[0]?.data
                                .filter((item) => item.value !== 0 && item.value !== '0')
                                .map((item) => ({
                                    ...item,
                                    itemStyle: {
                                        color: this.chartStatusColor[item.status]
                                    }
                                })) || [];
                        this.total = total;
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
