define([
    'text!' + ELMP.resource('ppm-workflow-resource/components/BudgetObject/components/ChooseSubjectTree/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.kit'
], function (template, ppmStore, ErdcKit) {
    return {
        template,
        components: {
            ProjectBudget: ErdcKit.asyncComponent(ELMP.resource('project-budget/views/list/index.js'))
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: false
            },
            projectOid: String,
            customFilterTableDataFn: Function,
            excludeRootLinkCodes: Array
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                isFullscreen: false
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            // 预算关联科目对象
            budgetLinkClassName() {
                return ppmStore?.state?.classNameMapping?.budgetLink;
            },
            innerTitle() {
                return this.title || this.i18n['addSubjectTree']; // 默认：添加科目树
            }
        },
        methods: {
            onFullscreen(isFullscreen) {
                this.isFullscreen = isFullscreen;
            },
            // 确定
            async handleConfirm() {
                // 获取选中的数据
                let selectedData = this.$refs['budgetTableRef'].getSelectedData(true);
                if (selectedData === false) {
                    return;
                }
                // 获取选中数据的根节点link的code编码集合
                let selectedRootLinkCodes = _.uniq(selectedData.map((r) => r['rootLinkCode']));
                this.$emit('confirm', { selectedRootLinkCodes, cancel: this.handleCancel });
            },
            handleCancel() {
                this.dialogVisible = false;
            }
        }
    };
});
