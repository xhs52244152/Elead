define([
    'text!' + ELMP.resource('project-dashboard/components/RiskReport/index.html'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js',
    'erdcloud.kit',
    ELMP.resource('project-dashboard/mixin.js'),
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, echarts, ErdcKit, dashMixin) {
    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            DashboardConfig: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/DashboardConfig/index.js')
            )
        },
        mixins: [dashMixin],
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                myChartBarResize: () => {},
                myChartPieResize: () => {},
                statusList: [],
                selectedStatus: []
            };
        },
        watch: {
            selectedStatus() {
                this.drawPie();
            }
        },
        created() {
            this.getStatusList();
        },
        mounted() {
            setTimeout(() => {
                this.drawBar();
                this.drawPie();
            }, 500);
        },
        computed: {
            oid() {
                return this.$route.query.pid;
            },
            viewTableConfig() {
                const _this = this;
                const requestData = {
                    deleteNoPermissionData: true,
                    conditionDtoList: [
                        {
                            attrName: 'erd.cloud.ppm.risk.entity.Risk#projectRef',
                            oper: 'EQ',
                            value1: _this.$route.query.pid
                        }
                    ]
                };
                return {
                    tableKey: 'DashboardRiskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: { showOverflow: true },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: requestData,
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    return JSON.parse(data);
                                }
                            ]
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        }
                    }
                };
            }
        },
        methods: {
            /**
             * 请求图表数据
             * @param {string} echartsType PIE,BAR
             * @param {array} conditionDtoList
             * @returns {*}
             */
            getEchartsOption(echartsType, conditionDtoList) {
                return this.$famHttp({
                    url: '/ppm/communal/getEchartsOption',
                    method: 'POST',
                    data: {
                        echartsType,
                        typeName: 'erd.cloud.ppm.risk.entity.Risk',
                        pageSearchDto: {
                            className: 'erd.cloud.ppm.risk.entity.Risk',
                            conditionDtoList
                        },
                        primaryObjectOid: this.oid
                    }
                });
            },
            getStatusList() {
                this.$famHttp({
                    url: '/fam/listByKey',
                    method: 'GET',
                    params: {
                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                        showAll: false,
                        targetClass: 'erd.cloud.ppm.risk.entity.Risk',
                        isGetDraft: false
                    }
                }).then((res) => {
                    this.statusList = res.data;
                });
            },
            async drawBar() {
                const { data } = await this.getEchartsOption('BAR', [
                    {
                        attrName: 'erd.cloud.ppm.risk.entity.Risk#projectRef',
                        oper: 'EQ',
                        value1: this.oid
                    }
                ]);
                // 基于准备好的dom，初始化echarts实例.
                if (document.getElementById('riskBarChart')) {
                    const myChart = echarts.init(document.getElementById('riskBarChart'));
                    // 组装每列对应的颜色标识数据
                    let colorIndexList = [];
                    data?.dataset?.source.forEach((item, index) => {
                        colorIndexList.push({
                            type: item['erd.cloud.ppm.risk.entity.Risk'],
                            colorIndex: index
                        });
                    });
                    const setOption = {
                        title: [
                            {
                                text: this.i18n.riskDistribution,
                                textStyle: {
                                    fontSize: 16,
                                    color: 'black'
                                },
                                subtextStyle: {
                                    fontSize: 20,
                                    color: 'black'
                                },
                                textAlign: 'left',
                                y: '14',
                                x: '20'
                            }
                        ],
                        tooltip: {},
                        dataset: data?.dataset || [],
                        xAxis: { type: 'category' },
                        yAxis: [
                            {
                                type: 'value',
                                minInterval: 1
                            }
                        ],
                        series: Array(data?.dataset?.dimensions.length - 1).fill({
                            type: 'bar',
                            itemStyle: {
                                color: ({ data }) => {
                                    let colorIndex = colorIndexList?.find(
                                        (item) => item.type === data['erd.cloud.ppm.risk.entity.Risk']
                                    ).colorIndex;
                                    return this.chartColorList[colorIndex % this.chartColorList.length]; // 设置颜色;
                                }
                            }
                        })
                    };
                    // 绘制图表
                    myChart.setOption(setOption);
                    this.myChartBarResize = () => {
                        // 重新绘制 ECharts 实例
                        myChart.resize();
                    };
                    // 组件销毁前解绑事件处理程序
                    this.$once('hook:beforeDestroy', () => {
                        window.removeEventListener('resize', this.myChartBarResize);
                    });
                    // 监听窗口大小变化
                    window.addEventListener('resize', this.myChartBarResize);
                }
            },
            async drawPie() {
                const { data } = await this.getEchartsOption('PIE', [
                    {
                        attrName: 'erd.cloud.ppm.risk.entity.Risk#projectRef',
                        oper: 'EQ',
                        value1: this.oid
                    },
                    {
                        attrName: 'erd.cloud.ppm.risk.entity.Risk#lifecycleStatus.status',
                        oper: 'IN',
                        value1: this.selectedStatus.join(',')
                    }
                ]);

                // 基于准备好的dom，初始化echarts实例
                if (document.getElementById('riskPieChart')) {
                    const myChart = echarts.init(document.getElementById('riskPieChart'));
                    // 绘制图表
                    myChart.setOption({
                        title: [
                            {
                                text: this.i18n.totalRisks,
                                subtext: data?.total || 0 + '',
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
                                name: this.i18n.byLevel,
                                type: 'pie',
                                radius: ['40%', '70%'],
                                label: {
                                    formatter: '{b} {c} ({d}%)',
                                    position: 'inner'
                                },
                                emphasis: {
                                    label: {
                                        show: false
                                    }
                                },
                                labelLine: {
                                    show: false
                                },
                                itemStyle: {
                                    color: ({ dataIndex }) => {
                                        return this.chartColors[dataIndex];
                                    }
                                },
                                data:
                                    data?.series[0]?.data.filter(
                                        (item) => item?.value && item.value !== '0' && item.value !== 0
                                    ) || []
                            }
                        ]
                    });
                    this.myChartPieResize = () => {
                        // 重新绘制 ECharts 实例
                        myChart.resize();
                    };
                    // 组件销毁前解绑事件处理程序
                    this.$once('hook:beforeDestroy', () => {
                        window.removeEventListener('resize', this.myChartPieResize);
                    });
                    // 监听窗口大小变化
                    window.addEventListener('resize', this.myChartPieResize);
                }
            }
        }
    };
});
