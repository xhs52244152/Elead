define([
    'text!' + ELMP.resource('project-budget/components/Reports/TotalExpenses/index.html'),
    'erdcloud.kit',
    ELMP.resource('project-budget/components/Reports/config/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-budget/utils/index.js'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js'
], function (template, ErdcKit, reportConfig, ppmStore, budgetUtils, echarts) {
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
                return this.i18n['budgetExecutionInfoReport'] || ''; // 总预算执行
            },
            // 项目oid
            projectOid() {
                // 此处不能用ppmStore.state?.projectInfo?.oid，因为如果项目之间切换时，还未切到最新项目
                return this.$route.query.pid;
            },
            // 金额单位
            unitLabel() {
                return this.budgetDisplayInfo?.[`${this.budgetClassName}#unit`] || '';
            }
        },
        methods: {
            // 加载数据
            async loadData() {
                let res = await reportConfig.api.totalExpenses(this, {
                    contextOId: this.projectOid
                });
                if (!res.success) {
                    return;
                }
                /**
                 * 总预算执行 图表的数据返回结构：
                 * {
                    budgetValue: {
                        total: 348923 // 总预算
                    },
                    costValue: {
                        total: 38273 // 总支出
                    }
                }
                 */
                let data = res.data || {};
                // yAxisData = ['总支出', '总预算']
                let yAxisData = [this.i18n['totleExpenditure'] || '', this.i18n['totalCostBudget'] || ''];
                let ratio = 0; // 支出占比
                if (data?.costValue?.total && data?.budgetValue?.total) {
                    ratio = data?.costValue?.total / data?.budgetValue?.total;
                }
                let seriesData = [
                    // 总支出
                    [data?.costValue?.total || 0, yAxisData[0], ratio, '#00a854'],
                    // 总预算
                    [data?.budgetValue?.total || 0, yAxisData[1], null, '#2779ff']
                ];
                this.renderChart(yAxisData, seriesData);
            },
            // 渲染图表
            renderChart(yAxisData, seriesData) {
                let series = [
                    {
                        type: 'bar',
                        /**
                         * 格式：[x轴值, y轴值, 百分比, 颜色]
                         * [[12, '总支出', 43, '#00a854'], [54, '总预算', null,'#2779ff']]
                         */
                        data: seriesData,
                        barWidth: 20, // 宽度
                        label: {
                            show: true,
                            position: 'right',
                            width: 120,
                            overflow: 'break', // 换行，配置width有效
                            formatter: this.labelFormatter
                        },
                        itemStyle: {
                            // 设置颜色
                            color: function (params) {
                                return params.data[3]; // 每个柱子的颜色
                            },
                            borderRadius: [0, 10, 10, 0] // 圆角
                        }
                    }
                ];
                console.log(`${this.title} 图表数据`, series);
                let grid = this.calculateGrid(this.$refs['chartRef']);
                let itemWidth = this.calculateItemWidth(this.$refs['chartRef'], grid);
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
                    grid: grid,
                    tooltip: {
                        trigger: 'item',
                        appendTo: 'body', // 将tooltip直接附加到body元素上
                        formatter: (e) => {
                            return e.marker + e.name + ': ' + this.labelFormatter(e);
                        }
                    },
                    xAxis: {
                        type: 'value',
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: '#c9ced5' // 设置轴线颜色
                            }
                        },
                        axisLabel: {
                            show: false
                        }
                    },
                    yAxis: {
                        type: 'category',
                        data: yAxisData,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#c9ced5' // 设置轴线颜色
                            }
                        },
                        axisLabel: {
                            width: itemWidth,
                            overflow: 'truncate', // 截断，超出显示...配置width有效
                            textStyle: {
                                color: '#89919f' // 设置标签颜色
                            }
                        },
                        // 坐标轴刻度相关设置
                        axisTick: {
                            show: false
                        }
                    },
                    series: series
                });
                this.myChartResize = () => {
                    let grid = this.calculateGrid(this.$refs['chartRef']);
                    let itemWidth = this.calculateItemWidth(this.$refs['chartRef'], grid);
                    myChart.setOption({
                        grid: grid,
                        yAxis: {
                            axisLabel: {
                                width: itemWidth
                            }
                        }
                    });
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
            labelFormatter(e) {
                if (!e?.data?.length) {
                    return '';
                }
                // 支出占比
                let ratio = e.data[2] || e.data[2] === 0 ? Math.round(e.data[2] * 10000) / 100 + '%' : '';
                return (
                    budgetUtils.formatAmountUnit(e.data[0] || 0, this.unitLabel) +
                    (ratio ? `, ${this.$t('proportionValue', { value: ratio })}` : '')
                );
            },
            // 计算得到grid
            calculateGrid(dom) {
                let grid = {
                    top: 40,
                    bottom: 40,
                    left: 85,
                    right: 120
                };
                if (!dom) {
                    return grid;
                }
                let clientWidth = dom.clientWidth;
                let clientHeight = dom.clientHeight;
                if (clientWidth > 600) {
                    grid.left = '15%';
                    grid.right = '18%';
                }
                if (clientHeight > 500) {
                    grid.top = 80;
                    grid.bottom = 80;
                }
                return grid;
            },
            // 计算图表y轴左侧label占用的宽度
            calculateItemWidth(dom, grid) {
                let clientWidth = dom?.clientWidth || 400;
                let itemWidth = 60; // 坐标轴左侧占用的宽度
                if (grid?.left) {
                    if (typeof grid.left === 'string' && grid.left.includes('%')) {
                        itemWidth = (Number(grid.left.replace('%', '')) / 100) * clientWidth;
                    } else {
                        itemWidth = Number(grid.left);
                    }
                }
                return itemWidth - 10; // 减去误差
            },
            // （外部组件也会调用）重新加载数据
            reloadData() {
                this.loadData();
            }
        }
    };
});
