define([
    'text!' + ELMP.resource('erdc-pdm-components/ConfirmDialog/index.html'),
    'css!' + ELMP.resource('erdc-pdm-components/ConfirmDialog/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ConfirmDialog',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            width: {
                type: String,
                default: '400px'
            },
            visible: Boolean,
            title: String,
            confirmTitle: String,
            tips: String,
            className: String,
            type: String,
            inTable: false,
            columns: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            rowList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            urlConfig: {
                type: Object,
                default: function () {
                    return {
                        batchDelete: '',
                        batchRevision: ''
                    };
                }
            },
            deleteOptions: {
                type: Object,
                default: function () {
                    return {
                        masterClassName: ''
                    };
                }
            },
            hasContent: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/ConfirmDialog/locale/index.js'),
                deleteType: 1,
                loading: false,
                // 参与者选择
                queryParams: {
                    data: {
                        appName: 'PDM',
                        isGetVirtualRole: true
                    }
                },
                // 参与者范围
                queryScope: 'fullTenant'
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
            hasDraft() {
                if (this.type === 'delete') {
                    const attrName = 'lifecycleStatus.status';
                    return (
                        this.rowList.findIndex((row) => {
                            let findStatus = '';
                            if (row.attrRawList) {
                                findStatus = row.attrRawList.find((item) => item.attrName?.includes(attrName));
                            } else {
                                findStatus = row?.['lifecycleStatus.status'];
                            }
                            return findStatus && findStatus.value == 'DRAFT';
                        }) > -1
                    );
                }
                return false;
            }
        },
        watch: {
            hasDraft: {
                handler(newVal) {
                    if (newVal) {
                        this.deleteType = 3;
                    }
                },
                immediate: true
            }
        },
        mounted() {
            document.body.appendChild(this.$el);
        },
        methods: {
            confirm() {
                const { type } = this;

                let request = null;
                switch (type) {
                    case 'delete':
                        request = this.handleDelete();
                        break;
                    case 'reversion':
                        request = this.handleReversion().then((resp) => {
                            this.$emit('success', resp.data);
                        });
                        break;
                    // 有表格插槽(基础版)
                    case 'base':
                        this.$emit('success');
                        this.close();
                        break;
                    // 无表格插槽
                    default:
                        this.$emit('success');
                        this.close();
                        break;
                }

                request
                    .then(() => {
                        this.$message.success('操作成功');
                        this.$emit('success');
                        this.close();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            handleDelete() {
                const { className, urlConfig, deleteType, rowList, inTable, deleteOptions } = this;

                let clazzName = '';
                let propName = '';
                switch (deleteType) {
                    case 1:
                        propName = 'oid';
                        clazzName = className;
                        break;
                    case 2:
                        propName = inTable ? 'branchVid' : 'vid';
                        clazzName = className;
                        break;
                    case 3:
                        propName = 'masterRef';
                        clazzName = deleteOptions.masterClassName;
                        break;
                    default:
                        break;
                }

                this.loading = true;

                return this.$famHttp({
                    url: urlConfig.batchDelete,
                    data: {
                        oidList: rowList.map((item) => item[propName]),
                        className: clazzName,
                        category: 'DELETE'
                    },
                    method: 'DELETE'
                });
            },
            handleReversion() {
                const { rowList, urlConfig } = this;
                this.loading = true;
                let data = rowList.map((i) => i.oid);
                return this.$famHttp({
                    url: urlConfig.batchRevision,
                    className: data[0]?.split(':')?.[1],
                    data,
                    method: 'POST'
                });
            },
            cancel() {
                this.close();
            },
            close() {
                this.innerVisible = !this.innerVisible;
                this.$emit('close');
                this.$emit('update:visible', this.innerVisible);
            }
        }
    };
});
