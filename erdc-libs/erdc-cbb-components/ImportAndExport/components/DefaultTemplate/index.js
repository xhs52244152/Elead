define([
    'text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/DefaultTemplate/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'DefaultTemplate',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            Transfer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ImportAndExport/components/Transfer/index.js')
            )
        },
        props: {
            transferHeight: Number,
            tableData: {
                type: Array,
                default() {
                    return [];
                }
            },
            formConfigs: {
                type: Array,
                default() {
                    return [];
                }
            },
            fields: {
                type: Array,
                default() {
                    return [];
                }
            },
            formData: Object,
            transferTitle: String,
            baseInfoUnfold: {
                type: Boolean,
                default: true
            },
            transferUnfold: {
                type: Boolean,
                default: true
            }
        },
        computed: {
            innerFields: {
                get() {
                    return this.fields;
                },
                set(val) {
                    this.$emit('update:fields', val);
                }
            },
            innerBaseInfoUnfold: {
                get() {
                    return this.baseInfoUnfold;
                },
                set(val) {
                    this.$emit('update:baseInfoUnfold', val);
                }
            },
            innerTransferUnfold: {
                get() {
                    return this.transferUnfold;
                },
                set(val) {
                    this.$emit('update:transferUnfold', val);
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js')
            };
        }
    };
});
