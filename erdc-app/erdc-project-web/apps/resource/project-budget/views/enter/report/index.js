define(['text!' + ELMP.resource('project-budget/views/enter/report/index.html'), 'erdcloud.kit'], function (
    template,
    ErdcKit
) {
    return {
        template,
        components: {
            CommonCard: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Card/index.js')),
            AccountCompare: ErdcKit.asyncComponent(
                ELMP.resource('project-budget/components/Reports/AccountCompare/index.js')
            ),
            TotalExpenses: ErdcKit.asyncComponent(
                ELMP.resource('project-budget/components/Reports/TotalExpenses/index.js')
            ),
            ExpensesDetail: ErdcKit.asyncComponent(
                ELMP.resource('project-budget/components/Reports/ExpensesDetail/index.js')
            )
        },
        props: {
            // 预算对象信息（储存内部值）
            budgetInfo: Object,
            // 预算对象信息（储存显示值）
            budgetDisplayInfo: Object,
            // 当前报表是否可见
            isVisible: Boolean,
            // 是否允许显示报表loading
            canLoading: Boolean
        },
        watch: {
            isVisible(newVal, oldVal) {
                // 从不可见切换为可见时 重新绘制报表（解决的问题：图表已初始化并在不可见时（切换到其它tab页签）触发了resize，此时宽高取100%为0导致图表缩在一起）
                if (!!newVal && !oldVal) {
                    this.resizeReport(); // 重新绘制报表
                }
            }
        },
        data() {
            return {};
        },
        computed: {},
        methods: {
            // 重新绘制报表
            resizeReport() {
                this.$refs['accountCompareRef']?.myChartResize();
                this.$refs['totalExpensesRef']?.myChartResize();
                this.$refs['expensesDetailRef']?.myChartResize();
            },
            // 重新刷新报表
            refreshReport() {
                this.$refs['accountCompareRef']?.reloadData();
                this.$refs['totalExpensesRef']?.reloadData();
                this.$refs['expensesDetailRef']?.reloadData();
            }
        }
    };
});
