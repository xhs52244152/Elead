define([
    'text!' + ELMP.resource('erdc-permission-components/AddOrEditPermission/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/AddOrEditPermission/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const PERMISSION_MAPPING = {
        grantPermission: 1,
        denialOfPermission: 2,
        absoluteDenialOfPermission: 3,
        noPermission: 4
    };

    return {
        props: {
            dialogTitle: {
                type: String,
                default: ''
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            queryScope: String
        },
        template,
        components: {
            PermissionBaseInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-permission-components/PermissionBaseInfo/index.js')
            ),
            PermissionSettingTable: ErdcKit.asyncComponent(
                ELMP.resource('erdc-permission-components/PermissionSettingTable/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    更新成功: this.getI18nByKey('更新成功')
                },
                dialogVisiable: false,
                editFormData: {},
                editTableData: {},
                iseditscene: true,
                editRowId: '',
                domainRef: '',
                dialogLoading: false
            };
        },
        computed: {
            innerQueryParams() {
                return {
                    roleType: 'Erd-202200000003',
                    ...this.queryParams
                };
            }
        },
        watch: {
            dialogVisiable(newVal) {
                if (!newVal) {
                    this.handlerResetDialog();
                }
            }
        },
        methods: {
            showOrHideDialog(flag, editData, domainRef) {
                this.dialogVisiable = flag;
                this.domainRef = domainRef;
                this.iseditscene = true;
                if (!editData) return;

                this.iseditscene = false;
                const { editFormData, editTableData, editRowId } = editData;
                this.editFormData = editFormData;
                this.editTableData = editTableData;
                this.editRowId = editRowId;
            },
            onHandlerCancel() {
                this.showOrHideDialog(false);
            },
            validateFormSuccess(formData) {
                const validateTableRes = this.$refs.permissionSettingTable.validateTable();
                if (!validateTableRes || !validateTableRes.isSuccess || !validateTableRes.tableData) {
                    return;
                }
                const data = {
                    formData: formData,
                    tableData: validateTableRes.tableData
                };
                // 封装数据，接口保存
                const submitParams = this.getSubmitParams(data);
                const requestUrl = this.iseditscene ? '/fam/access/createRule' : '/fam/access/modifyRule';
                this.handlerSubmit(submitParams, requestUrl);
            },
            getSubmitParams(data) {
                const { formData, tableData } = data;
                const stateName = formData?.statusId;
                const typeName = formData?.typeSelected?.name || formData?.typeSelected?.value;
                const appNames = formData?.appNames;
                const principalTarget = formData?.participant.type;
                let principalRefs = formData?.participant.value;
                const accessPermissions = tableData.map((item) => {
                    const obj = {
                        code: item.id,
                        description: item.permission,
                        permissionType: PERMISSION_MAPPING[item.selectField]
                    };
                    return obj;
                });
                const params = {
                    domainRef: this.domainRef,
                    stateName: stateName,
                    principalTarget: principalTarget,
                    typeName: typeName,
                    accessPermissions: accessPermissions,
                    isOverride: false,
                    appNames
                };
                if (this.iseditscene) {
                    params.principalRefs = principalRefs;
                } else {
                    params.principalRef = principalRefs[0];
                    params.isOverride = true;
                }
                return params;
            },
            handlerSubmit(params, url) {
                this.dialogLoading = true;
                this.$famHttp({
                    url,
                    data: params,
                    method: 'POST',
                    errorMessage: false
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['更新成功'],
                            showClose: true
                        });
                        this.showOrHideDialog(false);
                        this.$emit('operationsuccess');
                    })
                    .catch((res) => {
                        if (res?.code?.includes('601111')) {
                            this.$confirm(res?.message, {
                                title: '提示',
                                confirmButtonText: this.i18nMappingObj.confirm,
                                cancelButtonText: this.i18nMappingObj.cancel,
                                type: 'confirm'
                            }).then(() => {
                                params.isOverride = true;
                                this.handlerSubmit(params, url);
                            });
                        } else {
                            this.$message.error(res.message);
                        }
                    })
                    .finally(() => {
                        this.dialogLoading = false;
                    });
            },
            onHandlerConfirm() {
                this.$refs.permissionBaseInfo.validateForm();
            },
            handlerResetDialog() {
                this.editFormData = {};
                this.editTableData = {};
                this.iseditscene = true;
            }
        }
    };
});
