define([
    'text!' + ELMP.func('erdc-document/components/DialogConfirm/index.html'),
    'css!' + ELMP.func('erdc-document/components/DialogConfirm/style.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'DialogConfirm',
        template,
        components: {
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            width: {
                type: String,
                default: '400px'
            },
            visible: Boolean,
            inTable: Boolean,
            title: String,
            confirmTitle: String,
            tips: String,
            className: String,
            type: String,
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
            reversionData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            urlConfig: {
                type: Object,
                default: function () {
                    return {
                        delete: '/fam/common/rename'
                    };
                }
            },
            // 参与者选择
            queryParams: {
                type: Object,
                default: () => {
                    return {
                        data: {
                            appName: 'PDM',
                            isGetVirtualRole: true
                        }
                    }
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                deleteType: 1,
                loading: false,
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
                    // this.visible = val
                }
            },
            options() {
                return [
                    { label: '删除最大版本的最新小版本', value: 1, disabled: this.hasDraft },
                    { label: '删除最大版本', value: 2, disabled: this.hasDraft },
                    { label: '删除对象', value: 3, disabled: false }
                ];
            },
            hasDraft() {
                if (this.type === 'delete') {
                    const attrName = 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status';

                    return (
                        this.rowList?.findIndex((row) => {
                            const findStatus = row.attrRawList?.find((item) => item.attrName === attrName);
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
        mounted() {},
        methods: {
            confirm() {
                this.submit();
            },
            submit() {
                const { type, urlConfig, className, inTable } = this;
                const master = 'erd.cloud.cbb.doc.entity.EtDocumentMaster';
                let url = '';
                let method = 'POST';
                let data = {};
                switch (type) {
                    case 'delete':
                        url = urlConfig.batchDelete;
                        method = 'DELETE';
                        data = {
                            oidList: this.getDeleteOids(),
                            category: 'DELETE'
                        };
                        break;
                    case 'reversion': {
                        url = inTable ? urlConfig.batchRevision : urlConfig.revision;
                        const formData = new FormData();
                        formData.append('oid', this.reversionData?.[0]?.oid);

                        method = 'POST';
                        data = inTable ? this.reversionData.map((i) => i.oid) : formData;
                        break;
                    }
                    default:
                        break;
                }

                data.className = this.deleteType === 3 ? master : className;

                this.loading = true;

                this.$famHttp({
                    url,
                    data,
                    method
                })
                    .then((res) => {
                        const oid = !inTable ? res.data : null;
                        this.$message.success('操作成功');
                        this.$emit('success', oid);
                        this.close();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            getDeleteOids() {
                const { rowList, deleteType } = this;
                let propName = '';
                switch (deleteType) {
                    case 1:
                        propName = 'oid';
                        break;
                    case 2:
                        propName = this.inTable ? 'branchVid' : 'vid';
                        break;
                    case 3:
                        propName = 'masterRef';
                        break;
                    default:
                        break;
                }

                return rowList.map((item) => item[propName]);
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
