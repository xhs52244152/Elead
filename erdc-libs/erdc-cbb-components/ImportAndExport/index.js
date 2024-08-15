define([
    'text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/index.html'),
    ELMP.resource('erdc-cbb-components/ImportAndExport/components/Notify/index.js')
], function (template, Notify) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ImportAndExport',
        template,
        props: {
            visible: Boolean,
            title: String,
            type: {
                type: String,
                default: 'import'
            },
            dialogProps: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
                loading: false
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            innerTitle() {
                return this.title ? this.title : this.i18n?.[this.type === 'import' ? '导入' : '导出'];
            },
            component() {
                const url = `erdc-cbb-components/ImportAndExport/components/${this.type.charAt(0).toUpperCase() + this.type.slice(1)}/index.js`;
                return {
                    ref: this.type,
                    is: ErdcKit.asyncComponent(ELMP.resource(url)),
                    props: {
                        ...this.$attrs
                    }
                };
            }
        },
        methods: {
            confirm() {
                this[`${this.type}Confirm`]();
            },
            // 导入
            importConfirm() {
                const getData = this.$refs?.import?.getData();
                const { fileId, importTypeInfo } = getData || {};

                if (!fileId?.length) {
                    return this.$message.error(this.i18n?.['请上传文件']);
                }
                if (_.isEmpty(importTypeInfo)) {
                    return this.$message.error(this.i18n?.['请选择导入类型']);
                }

                const { business, value: className, label: name } = importTypeInfo || {};
                const businessName = _.isObject(business) ? business[this.type] : business || '';

                const data = {
                    businessName,
                    fileId: fileId.join(',') || '',
                    customParams: {
                        className,
                        ...(importTypeInfo.customParams || {})
                    },
                    sheetCount: 0
                };

                this.loading = true;

                this.$famHttp({
                    url: '/fam/import',
                    className,
                    method: 'post',
                    data
                })
                    .then(() => {
                        this.cancel();
                        Notify.onImportSuccess({
                            vm: this,
                            name
                        });
                    })
                    .catch(() => {
                        Notify.onImportError({
                            vm: this,
                            goTo(vm, notify, defaultGoTo) {
                                vm.cancel();
                                defaultGoTo(vm, notify, { activeTabName: 'taskTabPanelImport' });
                            }
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 导出
            exportConfirm() {},
            cancel() {
                this.innerVisible = false;
            }
        }
    };
});
