define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/AdvancedSignConfigure/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/AdvancedSignConfigure/style.css'),
    'erdcloud.kit'
], function(PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'AdvancedSignConfigure',
        template,
        mixins: [PropertiesPanelMixin],
        components: {
            EditableTable: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/editor/components/EditableTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                expanded: true
            };
        },
        computed: {
            column() {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'fieldName',
                        title: this.i18n.fieldName,
                    },
                    {
                        prop: 'fieldKey',
                        title: this.i18n.fieldKey,
                    },
                    {
                        prop: 'signTemplateKey',
                        title: this.i18n.signTemplateKey,
                        tips: this.i18n.signTemplateKeyTips,
                        slots: {
                            default: 'sign-template-key'
                        }
                    }
                ];
            },
            rules() {
                return {

                };
            },
            tableData() {
                return this.formatEchoData();
            },
            defaultTableData() {
                return [
                    {
                        fieldName: this.i18n.completeByRef,
                        fieldKey: 'completeByRef',
                        signTemplateKey: '',
                    },
                    {
                        fieldName: this.i18n.endTime,
                        fieldKey: 'endTime',
                        signTemplateKey: '',
                    },
                    {
                        fieldName: this.i18n.userComment,
                        fieldKey: 'userComment',
                        signTemplateKey: '',
                    },
                    {
                        fieldName: this.i18n.userEvent,
                        fieldKey: 'userEvent',
                        signTemplateKey: '',
                    },
                    {
                        fieldName: this.i18n.roleRef,
                        fieldKey: 'roleRef',
                        signTemplateKey: '',
                    }
                ];
            }
        },
        methods: {
            formatEchoData() {
                let tableData = this.isGlobalConfiguration ? this.template?.signConfig : this.nodeInfo?.signConfig;
                tableData = tableData?.length ? tableData : ErdcKit.deepClone(this.defaultTableData);
                return tableData;
            },
            onEditClosed() {
                this.updateTemplate('signConfig', 'signConfig', this.tableData);
            },
            handleAfterEnter(row) {
                this.$refs['textareaRef_' + row.fieldKey]?.focus();
            }
        }
    };
});
