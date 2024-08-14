define([
    'text!' + ELMP.resource('project-budget/components/Reports/AccountCompare/index.html'),
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
                isRootNode: true,
                loading: false,
                xAxisData: [],
                maxBudgetValue: 0, // 预算最大值
                myChartResize: () => {}
            };
        },
        computed: {
            // 预算
            budgetClassName() {
                return ppmStore?.state?.classNameMapping?.budget;
            },
            title() {
                return this.i18n['budgetCostCompareReport'] || ''; // 预实对比
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
                let res = await reportConfig.api.accountCompare(this, {
                    contextOId: this.projectOid,
                    isRoot: this.isRootNode
                });
                if (!res.success) {
                    return;
                }
                /**
                 * 预实对比 图表的数据返回结构：
                    data = {
                        stageList: [
                            {
                                name: '阶段1'
                            }
                        ],
                        subjects: [
                            {
                                name: '住宿费',
                                // 预算
                                budgetValue: {
                                    total: 19895 // 预算合计
                                },
                                // 支出
                                costValue: {
                                    total: 8888, // 支出合计
                                    stages: [
                                        {
                                            name: '阶段1',
                                            value: 2222
                                        }
                                    ]
                                }
                            }
                        ]
                    };
                 */
                let data = res.data || {};
                /**
                 * 按阶段统计科目对应预算、支出的费用
                 * stageObj = {
                    阶段1: {
                        // 预算
                        budgetValue: [
                            ['住宿费', 22, '阶段1', 'budget'],
                            ['路费', 32, '阶段1', 'budget'],
                        ],
                        // 支出
                        costValue: [
                            ['住宿费', 20, '阶段1', 'cost'],
                            ['路费', 35, '阶段1', 'cost'],
                        ]
                    }
                };
                 */
                let stageObj = {};
                /**
                 * 按科目统计对应预算总计、支出总计的费用
                 * totalObj = {
                    // 预算
                    budgetValue: [
                        ['住宿费', 222, '合计', 'budget'],
                        ['路费', 444, '合计', 'budget']
                    ],
                    // 支出
                    costValue: [
                        ['住宿费', 222, '合计', 'cost'],
                        ['路费', 444, '合计', 'cost']
                    ]
                };
                 */
                let totalObj = {
                    budgetValue: [],
                    costValue: []
                };
                let xAxisData = [];
                data['stageList']?.forEach((stage) => {
                    // 阶段名称为key
                    stageObj[stage['name']] = {
                        budgetValue: [],
                        costValue: []
                    };
                });
                this.maxBudgetValue = 0;
                data['subjects']?.forEach((subject) => {
                    let subjectName = subject['name']; // 科目名称
                    let totalBudgetValue = subject['budgetValue']?.['total'];
                    xAxisData.push(subjectName);
                    // 预算总计
                    totalObj.budgetValue.push([subjectName, totalBudgetValue, this.i18n['total'], 'budget']);
                    if (Number(totalBudgetValue || 0) > this.maxBudgetValue) {
                        this.maxBudgetValue = Number(totalBudgetValue || 0);
                    }
                    // 支出总计
                    totalObj.costValue.push([subjectName, subject['costValue']?.['total'], this.i18n['total'], 'cost']);
                    // 按阶段添加预算数据
                    subject['budgetValue']?.['stages']?.forEach((stage) => {
                        stageObj[stage['name']].budgetValue.push([
                            subjectName,
                            stage['value'],
                            stage['name'],
                            'budget'
                        ]);
                    });
                    // 按阶段添加支出数据
                    subject['costValue']?.['stages']?.forEach((stage) => {
                        stageObj[stage['name']].costValue.push([subjectName, stage['value'], stage['name'], 'cost']);
                    });
                });
                console.log('=========', xAxisData, totalObj, stageObj);
                this.renderChart(xAxisData, totalObj, stageObj);
            },
            // 渲染图表
            renderChart(xAxisData, totalObj, stageObj) {
                this.xAxisData = xAxisData;
                // 可选颜色数组（目前颜色值是获取的图表自带的颜色）
                const colors = [
                    '#5470c6',
                    '#91cc75',
                    '#fac858',
                    '#ee6666',
                    '#73c0de',
                    '#3ba272',
                    '#fc8452',
                    '#9a60b4',
                    '#ea7ccc'
                ];
                let series = [];
                series.push({
                    name: this.i18n['budgetTotal'], // 预算合计
                    type: 'line', // 折线图
                    /**
                     * data: [['住宿费', 999, '合计', 'budget'], ['路费', 888 '合计', 'budget']]
                     */
                    data: (totalObj?.budgetValue || []).map((itemValue) => {
                        return {
                            value: itemValue
                        };
                    }),
                    itemStyle: {
                        color: '#f04134' // 设置颜色
                    }
                });
                let nameArr = Object.keys(stageObj);
                nameArr.forEach((stageName, index) => {
                    series.push({
                        name: this.i18n['expenditureTotal'], // 支出合计
                        type: 'bar',
                        stack: 'stage', // 堆叠图
                        barMinWidth: 10, // 设置最小宽度
                        barMaxWidth: 20, // 设置最大宽度
                        /**
                         * data: [['住宿费', 323, '阶段1', 'cost'], ['路费', 542, '阶段1', 'cost']]
                         */
                        data: (stageObj[stageName]?.costValue || []).map((itemValue) => {
                            return {
                                value: itemValue,
                                itemStyle: {}
                            };
                        }),
                        itemStyle: {
                            color: colors[index % colors.length] // 设置颜色
                        }
                    });
                });
                this.setValidDataRadius(series); // 给每个柱状图的最后一个有数据的堆叠图添加圆角
                console.log(`${this.title} 图表数据`, series);
                let grid = this.calculateGrid(this.$refs['chartRef']);
                let { count, itemWidth } = this.calculateOptions(this.$refs['chartRef'], grid);
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
                    legend: {
                        show: true,
                        top: 'bottom' // 将图例显示在图表下方
                    },
                    grid: grid,
                    tooltip: {
                        // confine: true, // 是否将 tooltip 框限制在图表的区域内（超出时可能会被截断隐藏）
                        trigger: 'axis',
                        appendTo: 'body', // 将tooltip直接附加到body元素上
                        formatter: (e) => {
                            if (!e?.length) {
                                return '';
                            }
                            let tips = [e[0].axisValueLabel];
                            let budgetTips = []; // 预算
                            let costTips = []; // 支出
                            let newE = Object.assign([], e).reverse();
                            newE.forEach((item) => {
                                let itemTip =
                                    item.marker +
                                    item.data.value[2] +
                                    ': ' +
                                    budgetUtils.formatAmountUnit(item.data.value[1] || 0, this.unitLabel);
                                if (item.data.value[3] === 'budget') {
                                    budgetTips.push(itemTip);
                                } else {
                                    costTips.push(itemTip);
                                }
                            });
                            if (budgetTips?.length) {
                                budgetTips.unshift(this.i18n['budgetAmount']); // 预算
                            }
                            if (costTips?.length) {
                                // 按科目查找
                                let costTotalObj = totalObj?.costValue?.find((r) => r[0] === e[0].data.value[0]) || [];
                                costTips.unshift(
                                    this.i18n['total'] +
                                        ': ' +
                                        budgetUtils.formatAmountUnit(costTotalObj[1] || 0, this.unitLabel)
                                ); // 支出合计
                                costTips.unshift(this.i18n['expensesAmount']); // 支出
                            }
                            return tips.concat(budgetTips).concat(costTips).join('<br>');
                        },
                        // tooltip位置设置，超出屏幕时纠正位置
                        position: function (point, params, dom, rect, size) {
                            var contentWidth = size.contentSize[0]; // 获取 tooltip 内容的宽度
                            var contentHeight = size.contentSize[1]; // 获取 tooltip 内容的高度
                            // 获取图表容器的位置配置信息
                            let containerOp = myChart.getDom().getBoundingClientRect();
                            var x = point[0] + 10; // 鼠标悬停点相对于图表容器的 x 坐标
                            var y = point[1] - contentHeight - 10; // 鼠标悬停点相对于图表容器的 y 坐标
                            // 左侧超出屏幕时
                            if (x < 0 - containerOp.left) {
                                x = 0 - containerOp.left;
                            }
                            // 右侧超出屏幕时
                            if (x > window.innerWidth - contentWidth - containerOp.left) {
                                x = window.innerWidth - contentWidth - containerOp.left;
                            }
                            // 顶部超出屏幕时
                            if (y < 0 - containerOp.top) {
                                y = 0 - containerOp.top;
                            }
                            // 底部超出屏幕时
                            if (y > window.innerHeight - contentHeight - containerOp.top) {
                                y = window.innerHeight - contentHeight - containerOp.top;
                            }
                            return [x, y];
                        }
                    },
                    xAxis: {
                        type: 'category',
                        data: xAxisData,
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#c9ced5' // 设置轴线颜色
                            }
                        },
                        axisLabel: {
                            interval: 0, // 强制所有标签都显示
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
                    yAxis: {
                        type: 'value',
                        name: `${this.i18n['unit']}: ${this.unitLabel}`, // 单位：元
                        nameLocation: 'start', // 位置
                        nameGap: 8, // 坐标轴名称与轴线之间的距离。
                        nameTextStyle: {
                            color: '#89919f', // 设置轴线名称的颜色
                            align: 'right'
                        },
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: '#c9ced5' // 设置轴线颜色
                            }
                        },
                        axisLabel: {
                            textStyle: {
                                color: '#89919f' // 设置标签颜色
                            }
                        }
                    },
                    series: series,
                    dataZoom: [
                        {
                            //第几条数据开始结束
                            startValue: 0,
                            endValue: count,
                            type: 'inside',
                            xAxisIndex: [0],
                            zoomLock: true, //是否锁定选择区域（或叫做数据窗口）的大小。
                            zoomOnMouseWheel: false,
                            moveOnMouseMove: true,
                            preventDefaultMouseMove: false // 是否阻止 mousemove 事件的默认行为。
                        }
                    ]
                });
                this.myChartResize = () => {
                    let grid = this.calculateGrid(this.$refs['chartRef']);
                    let { count, itemWidth } = this.calculateOptions(myChart.getDom(), grid);
                    myChart.setOption({
                        grid: grid,
                        xAxis: {
                            axisLabel: {
                                width: itemWidth
                            }
                        },
                        dataZoom: [
                            {
                                startValue: 0,
                                endValue: count // 更新 dataZoom 组件的 end 值
                            }
                        ]
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
            /**
             * 给每个柱状图的最后一个有数据的堆叠图添加圆角
             */
            setValidDataRadius(series) {
                // 过滤得到堆叠图的Series对象数据
                let barSeries = series.filter((r) => r.type === 'bar' && r.stack === 'stage');
                if (!barSeries?.length || !barSeries[0]?.data?.length) {
                    return;
                }
                // 计算得到每个科目对应最后一个金额为有效（不为空&&大于0）的阶段数据下标
                // 即：计算得到每个柱状图的最后一个有数据的堆叠图的下标
                const stackValidEnd = [];
                for (let i = 0; i < barSeries[0].data.length; ++i) {
                    for (let j = 0; j < barSeries.length; ++j) {
                        const itemData = barSeries[j].data[i];
                        // 判断该阶段的支出金额为有效数据
                        if (itemData && itemData.value && itemData.value[1] > 0) {
                            stackValidEnd[i] = j;
                        }
                    }
                }
                stackValidEnd.forEach((j, i) => {
                    // 判断值有效
                    if (j || j === 0) {
                        let itemData = barSeries[j].data[i];
                        if (!itemData.itemStyle) {
                            itemData.itemStyle = {};
                        }
                        // 给每个柱状图的最后一个堆叠图添加圆角
                        itemData.itemStyle.barBorderRadius = [4, 4, 0, 0];
                    }
                });
            },
            // 计算得到grid
            calculateGrid(dom) {
                let grid = {
                    top: 10,
                    bottom: 50,
                    left: 70,
                    right: 50
                };
                if (!dom) {
                    return grid;
                }
                let clientWidth = dom.clientWidth;
                let clientHeight = dom.clientHeight;
                if (clientWidth > 550) {
                    grid.left = '15%';
                    grid.right = '15%';
                }
                if (clientHeight > 500) {
                    grid.top = 70;
                    grid.bottom = 110;
                } else if (clientHeight > 320) {
                    grid.top = 40;
                    grid.bottom = 80;
                }
                if (grid?.left) {
                    grid.left = Math.max(this.parsePX(grid.left, clientWidth), this.getYLabelWidth());
                }
                return grid;
            },
            // 计算图表显示的数量
            calculateOptions(dom, grid) {
                let itemWidth = 80; // 代表每个刻度占用的宽度（非绝对）
                let clientWidth = dom?.clientWidth || 400;
                let allLength = this.xAxisData?.length || 0;
                let diff = 0; // 坐标轴左右两侧占用的宽度总和
                if (grid?.left) {
                    diff += this.parsePX(grid.left, clientWidth);
                }
                if (grid?.right) {
                    diff += this.parsePX(grid.right, clientWidth);
                }
                let count = Math.round((clientWidth - diff) / itemWidth);
                let minCount = 2;
                count = count > minCount ? count : minCount;
                count = count < allLength ? count : allLength;
                return {
                    count, // 一屏显示的柱子数量
                    itemWidth: (clientWidth - diff) / count - 10 // 每个刻度平均的真实宽度
                };
            },
            parsePX(value, totalPX) {
                let diffPX = 0;
                if (typeof value === 'string' && value.includes('%')) {
                    diffPX = (Number(value.replace('%', '')) / 100) * totalPX;
                } else {
                    diffPX = Number(value);
                }
                return diffPX;
            },
            // y轴左侧label占用的宽度
            getYLabelWidth() {
                let value = Math.ceil(this.maxBudgetValue || 0); // 转整数
                let count = Math.floor(String(value).length / 3); // 逗号数量
                // 字符数量 * 单个字符占用的长度 + 偏差
                return (String(value).length + count) * 8 + 5;
            },
            // （外部组件也会调用）重新加载数据
            reloadData() {
                this.loadData();
            }
        }
    };
});
