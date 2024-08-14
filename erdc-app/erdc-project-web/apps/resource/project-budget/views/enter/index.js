define([
    'text!' + ELMP.resource('project-budget/views/enter/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-budget/views/enter/style.css')
], function (template, ErdcKit) {
    return {
        template,
        name: 'budgetEnter',
        components: {
            BudgetInfo: ErdcKit.asyncComponent(ELMP.resource('project-budget/views/list/index.js')),
            Report: ErdcKit.asyncComponent(ELMP.resource('project-budget/views/enter/report/index.js')),
            CommonCard: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Card/index.js'))
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                activeName: 'budgetInfo',
                budgetInfo: null, // 预算对象信息（内部值）
                budgetDisplayInfo: null, // 预算对象信息（显示值）
                budgetState: null, // 预算对象状态
                isBaseline: false, // 是否为基线的数据
                isFull: false // 卡片是否最大化状态
            };
        },
        computed: {
            // 是否显示 核算信息 页签。预算状态 = ['已审批'] && 非基线数据
            showCheckInfo () {
                return ['APPROVED'].includes(this.budgetState) && !this.isBaseline;
            }
        },
        methods: {
            getBudgetInfo({ budgetInfo, budgetDisplayInfo, budgetState }) {
                this.budgetState = budgetState;
                this.budgetInfo = budgetInfo;
                this.budgetDisplayInfo = budgetDisplayInfo;
            },
            isBaselineData(isBaseline) {
                this.isBaseline = isBaseline;
            },
            // 卡片最大化/最小化
            fullscreenAfter(isFull) {
                this.isFull = isFull;
            },
            refreshReport() {
                // 刷新报表
                this.$refs['reportRef']?.refreshReport();
            }
        }
    };
});
