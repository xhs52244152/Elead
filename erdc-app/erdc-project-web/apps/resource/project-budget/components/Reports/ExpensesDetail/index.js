define([
    'text!' + ELMP.resource('project-budget/components/Reports/ExpensesDetail/index.html'),
    'erdcloud.kit',
    ELMP.resource('project-budget/components/Reports/config/index.js'),
    ELMP.resource('ppm-store/index.js'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js'
], function (template, ErdcKit, reportConfig, ppmStore, echarts) {
    return {
        template,
        components: {
            CommonCard: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Card/index.js'))
        },
        props: {
            // 预算对象信息（储存内部值）
            budgetInfo: Object,
            // 预算对象信息（储存显示值）
            budgetDisplayInfo: Object,
            // 是否允许显示loading
            canLoading: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                isRootNode: true,
                loading: false,
                myChartResize: () => {}
            };
        },
        computed: {
            // 预算
            budgetClassName() {
                return ppmStore?.state?.classNameMapping?.budget;
            },
            title() {
                return this.i18n['subjectCostValueReport'] || ''; // 各科目费用支出
            },
            // 项目oid
            projectOid() {
                // 此处不能用ppmStore.state?.projectInfo?.oid，因为如果项目之间切换时，还未切到最新项目
                return this.$route.query.pid;
            },
            // 金额单位
            unitLabel() {
                return this.budgetDisplayInfo?.[`${this.budgetClassName}#unit`] || '';
            },
            labelFormatter() {
                return `{b}: {c}${this.unitLabel}({d}%)`;
            }
        },
        methods: {
            // 加载数据
            async loadData() {
                let res = await reportConfig.api.expensesDetail(this, {
                    contextOId: this.projectOid,
                    isRoot: this.isRootNode
                });
                if (!res.success) {
                    return;
                }
                /**
                 * 各科目费用支出 图表的数据返回结构：
                 * {
                    subjects: [
                        {
                            name: '住宿费',
                            // 支出
                            costValue: {
                                total: 3325 // 支出合计
                            }
                        },
                        ...
                    ]
                }
                 */
                let data = res.data || {};
                let seriesData = data?.subjects?.map((r) => {
                    return {
                        name: r['name'],
                        value: r['costValue']?.total || 0
                    };
                });
                this.renderChart(seriesData);
            },
            // 渲染图表
            renderChart(seriesData) {
                let series = [
                    {
                        type: 'pie',
                        center: ['50%', '50%'],
                        radius: ['40%', '70%'],
                        label: {
                            show: true,
                            position: 'outside',
                            color: '#89919f', // 设置颜色
                            formatter: this.labelFormatter
                        },
                        /**
                         * 格式：[{name:'住宿费', value: 333}]
                         */
                        data: seriesData
                    }
                ];
                console.log(`${this.title} 图表数据`, series);
                // 基于准备好的dom，初始化echarts实例
                const myChart = echarts.init(this.$refs['chartRef']);
                if (myChart) {
                    myChart.clear(); // 清空数据
                }
                // 绘制图表
                myChart.setOption({
                    textStyle: {
                        // 图表字体
                        fontFamily: 'AlibabaPuHuiTi-3-55-Regular'
                    },
                    tooltip: {
                        trigger: 'item',
                        appendTo: 'body', // 将tooltip直接附加到body元素上
                        formatter: this.labelFormatter
                    },
                    series: series
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
            },
            // （外部组件也会调用）重新加载数据
            reloadData() {
                this.loadData();
            }
        }
    };
});
