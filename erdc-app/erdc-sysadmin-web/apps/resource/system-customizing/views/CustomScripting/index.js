define(['text!' + ELMP.resource('system-customizing/views/CustomScripting/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        components: {
            systemDynamicTable: ErdcKit.asyncComponent(
                ELMP.resource('system-customizing/components/DynamicScriptTable/index.js')
            ),
            systemDynamicForm: ErdcKit.asyncComponent(
                ELMP.resource('system-customizing/components/DynamicScriptForm/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomScripting/locale/index.js'),
                i18nMappingObj: {
                    dynamicScriptManagement: this.getI18nByKey('动态脚本管理'),
                    createDynamicScript: this.getI18nByKey('创建动态脚本'),
                    updateDynamicScript: this.getI18nByKey('编辑动态脚本'),
                    ok: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消')
                },
                dialogVisible: false,
                dialogType: 'create',
                detailInfo: {},
                isLoading: false
            };
        },
        computed: {
            dialogTitle() {
                return this.dialogType === 'create'
                    ? this.i18nMappingObj.createDynamicScript
                    : this.i18nMappingObj.updateDynamicScript;
            }
        },
        methods: {
            submit() {
                this.$refs.systemDynamicForm.submit(() => {
                    this.$refs.systemDynamicTable.refreshTable();
                });
            },
            changeDialogStatus(status, dialogType, detailInfo) {
                this.dialogVisible = status;
                this.dialogType = dialogType;
                this.detailInfo = detailInfo;
            }
        }
    };
});
