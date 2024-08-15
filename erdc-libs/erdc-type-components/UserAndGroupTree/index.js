define([
    'text!' + ELMP.resource('erdc-type-components/UserAndGroupTree/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-type-components/UserAndGroupTree/style.css')
], function (template, fieldTypeMapping) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            containerOid: {
                type: String,
                default: ''
            },
            typeOid: {
                type: String,
                default: ''
            },
            isShowAdd: {
                type: Boolean,
                default: true
            },
            maxHeight: {
                type: Number
            },
            queryParams: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-type-components/AttrPermissionSetting/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入关键字'),
                    whetherDeleteItems: this.getI18nByKey('删除提示'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    deletedSuccessfully: this.getI18nByKey('删除成功'),
                    deleteDailed: this.getI18nByKey('删除失败'),
                    saveFailed: this.getI18nByKey('保存失败'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    addRole: this.getI18nByKey('增加角色'),
                    role: this.getI18nByKey('角色'),
                    addGroup: this.getI18nByKey('增加群组'),
                    userGroup: this.getI18nByKey('群组')
                },
                searchValue: '',
                userAndGroupTreeData: [],
                treeProps: {
                    children: 'childList',
                    label: 'displayName',
                    isLeaf: 'leaf'
                },
                formData: {
                    users: []
                },
                formRules: {
                    user: [
                        {
                            required: true,
                            message: '请选择类型',
                            trigger: 'change'
                        }
                    ]
                },
                dialogVisiable: false,
                options: [],
                scopeData: [],
                childrenList: [],
                currentNodeType: 'ROLE',
                loading: false
            };
        },
        computed: {
            formConfig() {
                const currentNodeType = this.currentNodeType;
                let label = '';
                if (currentNodeType === 'ROLE') {
                    label = this.i18nMappingObj.role;
                } else if (currentNodeType === 'GROUP') {
                    label = this.i18nMappingObj.userGroup;
                }
                return [
                    {
                        field: 'users',
                        component: 'fam-participant-select',
                        label: label,
                        required: true,
                        col: 24,
                        labelWidth: '100px',
                        props: {
                            showType: [currentNodeType],
                            queryScope: 'fullTenant',
                            multiple: true,
                            threeMemberEnv: false,
                            isFetchValue: true
                        }
                    }
                ];
            },
            addDialogTitle() {
                const currentNodeType = this.currentNodeType;
                return currentNodeType === 'ROLE' ? this.i18nMappingObj.addRole : this.i18nMappingObj.addGroup;
            },
            treeHeight() {
                return `${this.maxHeight}px` || '100%';
            }
        },
        watch: {
            searchValue(val) {
                this.$refs.userAndGroupTree.filter(val);
            },
            typeOid() {
                this.getUserAndGroupTreeData();
            }
        },
        mounted() {
            // this.treeHeight = this.maxHeight;
            this.getUserAndGroupTreeData();
        },
        methods: {
            getUserAndGroupTreeData() {
                if (!this.typeOid) return;
                this.$famHttp({
                    url: '/fam/type/typeAttrAccess/principal/tree',
                    params: {
                        containerOid: this.containerOid,
                        typeOid: this.typeOid
                    },
                    method: 'GET'
                })
                    .then((resp) => {
                        this.userAndGroupTreeData = [];
                        if (resp.code === '200' && resp.data) {
                            let selectedNode = null;
                            const data = resp.data.map((parent) => {
                                const childList = parent.childList || [];
                                const newChildList = childList.map((item) => {
                                    item.nodeKey =
                                        item.idKey === 'erd.cloud.foundation.principal.entity.Role' ? 'ROLE' : 'GROUP';
                                    return item;
                                });
                                if (newChildList.length > 0 && !selectedNode) {
                                    selectedNode = newChildList[0] || {};
                                }
                                parent.childList = newChildList;
                                parent.nodeKey =
                                    ['角色', 'ROLE'].indexOf(parent.name.toUpperCase()) !== -1 ? 'ROLE' : 'GROUP';
                                return parent;
                            });
                            this.userAndGroupTreeData = data;
                            this.$nextTick(() => {
                                this.$refs.userAndGroupTree?.setCurrentKey(selectedNode?.key || '');
                                selectedNode && this.$emit('onclick', selectedNode);
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            handleNodeClick(data, node, e, flag) {
                // 如果是关闭，则不触发点击事件
                if (flag) {
                    return;
                }
                if (node.level == 1) {
                    this.$nextTick(() => {
                        this.$refs.userAndGroupTree?.setCurrentKey(this.selectNodeKey);
                    });
                } else {
                    this.selectNodeKey = data.key;
                    this.$emit('onclick', data, node);
                }
            },
            onCreate(scope) {
                // 固定数据不在列表中回显时需要过滤
                let unIds = ['-1', '-2'];
                // 已选中的数据
                this.scopeData = scope?.data?.childList.reduce((pre, cur) => {
                    if (!unIds.includes(cur.id)) {
                        pre.push(cur.oid);
                    }
                    return pre;
                }, []);
                // 回显已选中字段
                this.formData.users = ErdcKit.deepClone(this.scopeData);
                this.childrenList = scope?.data?.childList;
                this.currentNodeType = scope.data.nodeKey;
                this.dialogVisiable = true;
            },
            onDelete(scope) {
                const { data } = scope;
                if (data.oid) {
                    this.$confirm(this.i18nMappingObj['whetherDeleteItems'], this.i18nMappingObj['confirmDelete'], {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }).then(() => {
                        this.$famHttp({
                            url: '/fam/type/typeAttrAccess',
                            method: 'DELETE',
                            params: {
                                principalOid: data.oid,
                                typeOid: this.typeOid
                            }
                        }).then((resp) => {
                            if (resp.code === '200') {
                                this.getUserAndGroupTreeData();
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj['deletedSuccessfully'],
                                    showClose: true
                                });
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: resp?.data?.message || this.i18nMappingObj['deleteDailed'],
                                    showClose: true
                                });
                            }
                        });
                    });
                }
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            handlerAddRoleToTree() {
                if (this.formData.users.length) {
                    this.$refs.addRoleToTreeForm.validate((res) => {
                        if (res) {
                            this.handlerConfirmAddReq();
                        }
                    });
                } else {
                    this.$message.error('请选择数据!');
                }
            },
            handlerConfirmAddReq() {
                /**
                 * 递归处理接口数据
                 * @param {basicData} 基础数据
                 * @returns
                 */
                const rawDataVoListFn = (basicData) => {
                    let data = [];
                    basicData.forEach((item) => {
                        let obj = {};
                        let attrRawList = [
                            {
                                attrName: 'typeReference',
                                value: this.typeOid
                            },
                            {
                                attrName: 'principalReference',
                                value: item
                            }
                        ];
                        (obj = {
                            attrRawList,
                            className: 'erd.cloud.foundation.type.entity.TypeAttrAccessPrincipal'
                        }),
                            data.push(obj);
                    });

                    return data;
                };

                this.loading = true;
                // 保存接口
                const saveOrUpdate = (params) => {
                    this.$famHttp({ url: '/fam/saveOrUpdate', data: params, method: 'POST' })
                        .then((resp) => {
                            if (resp.code === '200') {
                                this.handlerCancelAddRoleToTree();
                                this.getUserAndGroupTreeData();
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: resp?.data?.message || this.i18nMappingObj['saveFailed'],
                                    showClose: true
                                });
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                };
                // 新增的数据
                let updateUsers = this.formData.users.filter((item) => {
                    return !this.scopeData.some((ele) => ele === item);
                });
                // 移除的数据
                let delUsers = this.scopeData.filter((item) => {
                    return !this.formData.users.some((ele) => ele === item);
                });
                // 新增/更新
                if (updateUsers.length) {
                    const rawDataVoList = rawDataVoListFn(updateUsers) || [];
                    let params = {
                        className: 'erd.cloud.foundation.type.entity.TypeAttrAccessPrincipal',
                        rawDataVoList
                    };
                    saveOrUpdate(params);
                } else {
                    this.handlerCancelAddRoleToTree();
                    this.getUserAndGroupTreeData();
                    this.loading = false;
                }
                // 删除
                if (delUsers.length) {
                    let users = this.childrenList
                        .filter((item) => {
                            return delUsers.some((ele) => ele === item.oid);
                        })
                        .map((ite) => ite.idPath);

                    this.$famHttp({
                        url: `/fam/deleteByIds`,
                        params: {},
                        data: {
                            className: 'erd.cloud.foundation.type.entity.TypeAttrAccessPrincipal',
                            oidList: users
                        },
                        method: 'delete'
                    })
                        .then((resp) => {
                            if (resp.code === '200') {
                                this.handlerCancelAddRoleToTree();
                                this.getUserAndGroupTreeData();
                            } else {
                                this.$message({
                                    type: 'error',
                                    message: resp?.data?.message || this.i18nMappingObj['saveFailed'],
                                    showClose: true
                                });
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                }
            },
            handlerCancelAddRoleToTree() {
                // 不能直接把对象赋空，会改变引用
                // this.formData = {};
                this.formData.users = [];
                this.dialogVisiable = false;
            }
        },
        components: {}
    };
});
