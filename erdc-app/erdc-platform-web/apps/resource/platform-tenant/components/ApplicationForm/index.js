define([
    'text!' + ELMP.resource('platform-tenant/components/ApplicationForm/index.html'),
    'css!' + ELMP.resource('platform-tenant/components/ApplicationForm/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            defaultValue: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            ApplicationTable: FamKit.asyncComponent(
                ELMP.resource('platform-tenant/components/ApplicationTable/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-tenant/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    name: this.getI18nByKey('名称'),
                    number: this.getI18nByKey('编码'),
                    description: this.getI18nByKey('描述'),
                    remove: this.getI18nByKey('移除'),
                    version: this.getI18nByKey('版本号'),
                    addApplication: this.getI18nByKey('增加应用'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    addSuccess: this.getI18nByKey('添加应用成功'),
                    addError: this.getI18nByKey('添加应用失败'),
                    removeSuccess: this.getI18nByKey('删除应用成功'),
                    deleteTips: this.getI18nByKey('请选择应用')
                },
                tenantName: '',
                applications: [],
                applicationOpts: [],
                applicationTableData: [],
                defaultProps: {
                    label: 'displayName',
                    value: 'oid',
                    key: 'id'
                }
            };
        },
        computed: {
            isShowOperation() {
                const isShowOperation = this.defaultValue && !this.defaultValue.isDefault ? true : false;
                return isShowOperation;
            }
        },
        watch: {
            'defaultValue.oid': {
                handler(val) {
                    val && this.getTenantDetail(val);
                },
                immediate: true
            }
        },
        mounted() {
            this.initApplicationOpts();
        },
        methods: {
            getTenantDetail(oid) {
                const tenantOid = oid || this.defaultValue.oid;
                this.$famHttp({
                    url: `/platform/tenant/${tenantOid}`,
                    method: 'GET'
                }).then((resp) => {
                    this.tenantName = resp.data.displayName;
                    this.applicationTableData = resp.data.applications;
                });
            },
            initApplicationOpts() {
                this.$famHttp({ url: '/platform/application/list', method: 'GET' }).then((resp) => {
                    this.applicationOpts = resp.data || [];
                });
            },
            handlerAddApplications() {
                if (this.applications.length === 0) {
                    return;
                }
                this.$famHttp({
                    url: `/platform/tenant/link/${this.defaultValue.oid}`,
                    data: this.applications,
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.addSuccess,
                            showClose: true
                        });
                        this.getTenantDetail();
                    })
                    .catch((res) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: res.message || this.i18nMappingObj.addError,
                        //     showClose: true
                        // });
                    });
            },
            removeApplication(data) {
                this.onRemoveFn([data.id]);
            },
            handlerBatchRemove() {
                const selectData = this.$refs.applicationTable.getSelection();
                if (!selectData || selectData.length === 0) {
                    this.$message({ type: 'warning', message: this.i18nMappingObj.deleteTips, showClose: true });
                    return;
                }
                const selectDataIds = selectData.map((item) => {
                    return item.oid;
                });
                this.onRemoveFn(selectDataIds);
            },
            onRemoveFn(selectDataIds) {
                this.$famHttp({
                    url: `/platform/tenant/link/remove/${this.defaultValue.id}`,
                    data: selectDataIds,
                    method: 'POST'
                }).then((resp) => {
                    this.$message({ type: 'success', message: this.i18nMappingObj.removeSuccess, showClose: true });
                    this.getTenantDetail();
                });
            }
        }
    };
});
