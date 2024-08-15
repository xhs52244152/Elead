define([
    'text!' + ELMP.resource('erdc-type-components/SingleAttrPermissionSetting/index.html'),
    'underscore',
    'css!' + ELMP.resource('erdc-type-components/SingleAttrPermissionSetting/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/AttrPermissionSetting/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    permission: this.getI18nByKey('权限'),
                    attr: this.getI18nByKey('属性'),
                    create: this.getI18nByKey('创建'),
                    modify: this.getI18nByKey('修改'),
                    view: this.getI18nByKey('查看'),
                    role: this.getI18nByKey('角色'),
                    readAndWrite: this.getI18nByKey('读写'),
                    onlyRead: this.getI18nByKey('只读'),
                    hidden: this.getI18nByKey('隐藏'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    modifyTable: this.getI18nByKey('表格读写'),
                    updateSuccess: this.getI18nByKey('保存成功'),
                    updateError: this.getI18nByKey('保存失败')
                },
                dialogVisiable: false,
                attrName: '',
                createAccessDisplayName: '',
                permissionTableData: [],
                validRules: {
                    createAccess: [{ required: true }],
                    updateAccess: [{ required: true }],
                    viewAccess: [{ required: true }]
                },
                optionList: [],
                loading: false
            };
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        computed: {
            permissionColumns() {
                return [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'displayName',
                        title: this.i18nMappingObj.role,
                        minWidth: 120
                    },
                    {
                        prop: 'createAccess',
                        title: this.i18nMappingObj.create,
                        minWidth: 120,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'updateAccess',
                        title: this.i18nMappingObj.modify,
                        minWidth: 120,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'viewAccess',
                        title: this.i18nMappingObj.view,
                        minWidth: 120,
                        editRender: {},
                        className: 'editIcon'
                    }
                ];
            },
            rightOptionsList() {
                return [
                    {
                        label: this.i18nMappingObj.modifyTable,
                        value: 'MODIFY'
                    },
                    {
                        label: this.i18nMappingObj.onlyRead,
                        value: 'READONLY'
                    },
                    {
                        label: this.i18nMappingObj.hidden,
                        value: 'HIDDEN'
                    }
                ];
            },
            accessValueMapping() {
                return {
                    HIDDEN: this.i18nMappingObj.hidden,
                    READONLY: this.i18nMappingObj.onlyRead,
                    MODIFY: this.i18nMappingObj.modifyTable
                };
            }
        },
        methods: {
            showOrHidePermissionDialog(flag, typeOid, attrOid, attrName) {
                this.dialogVisiable = flag;
                this.attrName = attrName;
                if (!flag) {
                    this.clearPermissionData();
                } else {
                    this.typeOid = typeOid;
                    this.attrOid = attrOid;
                    this.getPermissionTableData();
                }
            },
            getPermissionTableData() {
                this.$famHttp({
                    url: `/fam/type/typeAttrAccess/${this.typeOid}/${this.attrOid}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        if (resp && resp.code === '200') {
                            this.permissionTableData = resp.data.map((item) => {
                                item.id = item.principalOid;
                                return item;
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            clearPermissionData() {
                this.permissionTableData = [];
                this.attrName = '';
            },
            hanlderCancelPermission() {
                this.showOrHidePermissionDialog(false);
            },
            hanlerSettingPermission() {
                const submitTableData = this.permissionTableData.map((item) => {
                    const obj = {
                        principalReference: item.id,
                        createAccess: item.createAccess,
                        updateAccess: item.updateAccess,
                        viewAccess: item.viewAccess
                    };
                    return obj;
                });
                this.loading = true;
                this.$famHttp({
                    url: `/fam/type/typeAttrAccess/add/${this.typeOid}/${this.attrOid}`,
                    method: 'POST',
                    data: submitTableData
                })
                    .then((resp) => {
                        if (resp && resp.code === '200') {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.updateSuccess,
                                showClose: true
                            });
                            this.showOrHidePermissionDialog(false);
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            customEditorChange(val, data) {
                this.$set(data.row, data.column.property, val);
            },
            editActived({ row, column }) {
                this.setOptionsList(row);
                this.$set(row, `editIcon-${row.id}-${column.property}`, true);
                if (['createAccess', 'updateAccess', 'viewAccess'].indexOf(column.property) !== -1) {
                    this.$nextTick(() => {
                        this.$refs.permissionSelect.toggleMenu();
                        this.$refs.permissionSelect.focus();
                    });
                }
            },
            setOptionsList(row) {
                let filterOptions = [];
                const isReadonly = row.isReadonly;
                const isHidden = row.isHidden;
                if (!isReadonly && !isHidden) {
                    filterOptions = this.rightOptionsList;
                } else if (!isHidden && isReadonly) {
                    filterOptions = this.rightOptionsList.filter((el, index) => {
                        return index > 0;
                    });
                } else {
                    filterOptions = this.rightOptionsList.filter((el, index) => {
                        return index > 1;
                    });
                }
                this.optionList = filterOptions;
            },
            beforeClose(done) {
                this.$refs.permissionSettingTable.$table.clearEdit();
                done();
            }
        }
    };
});
