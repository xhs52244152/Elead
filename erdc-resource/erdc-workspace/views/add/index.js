define([
    'text!' + ELMP.func('erdc-workspace/views/add/index.html'),
    ELMP.func('erdc-workspace/api.js'),
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.func('erdc-workspace/config/operateAction.js'),
    'css!' + ELMP.func('erdc-workspace/views/add/index.css')
], function (template, Api, viewConfig, operateAction) {
    const ErdcKit = require('erdc-kit');
    const vuex = require('vuex');
    const { mapGetters, mapMutations } = vuex.createNamespacedHelpers('Workspace');

    return {
        name: 'WorkspaceAdd',
        template,
        components: {
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-workspace/locale/index.js'),
                tableData: [],
                panelUnfold: true,
                formData: {
                    workspace: ''
                },
                workspaceOptions: [],
                selectedRelateObjects: [],
                lastRoute: null,
                objectVisible: false,
                collectForm: {
                    visible: false,
                    title: '',
                    loading: false,
                    tableData: [],
                    className: viewConfig.workspaceViewTableMap.className
                },
                // 子类型数组
                btnLoading: false
            };
        },
        async created() {
            this.loadSelectedData();
            await this.handleWorkspaceSearch();
        },
        beforeRouteEnter(to, from, next) {
            next((vm) => {
                vm.lastRoute = vm.lastRoute || { name: from?.name, params: from?.params, query: from?.query };
            });
        },
        watch: {
            'formData.workspace': {
                immediate: true,
                handler(val, oldVal) {
                    if (val && !oldVal) {
                        this.$refs?.baseFormRef?.clearValidate();
                    }
                }
            }
        },
        computed: {
            ...mapGetters(['getSelectedForAddToWorkspace']),
            workspaceAddToType() {
                return this.$route.query.workspaceAddToType;
            },
            rules() {
                return {
                    workspace: [{ required: true, message: this.i18n.pleaseSelectWorkspace, trigger: 'blur' }]
                };
            },
            viewTypes() {
                let viewTypes = [
                    {
                        label: this.i18n.parts,
                        className: 'erd.cloud.pdm.part.entity.EtPart',
                        tableKey: 'partForm'
                    },
                    {
                        label: this.i18n.model,
                        className: 'erd.cloud.pdm.epm.entity.EpmDocument',
                        tableKey: 'epmDocumentView'
                    }
                ];
                return viewTypes;
            },
            objectFormProps() {
                return {
                    title: this.i18n.addRelateObject,
                    excluded: this.tableData.map((item) => item.identifierNo),
                    viewTypesList: this.viewTypes,
                    leftTableColumns: this.associationObjectLeftColumns
                };
            },
            pageTitle() {
                return {
                    isShowTag: false,
                    title: this.i18n[
                        this.workspaceAddToType === 'editInEpmDocument' ? 'selectWorkspace' : 'addToWorkspace'
                    ],
                    isShowPulldown: false,
                    staticTitle: true
                };
            },
            associationObjectLeftColumns() {
                let columns = ErdcKit.deepClone(this.columns);
                columns.splice(1, 1, {
                    prop: 'icon',
                    title: this.i18n.icon,
                    align: 'center',
                    width: 48
                });
                return columns;
            },
            columns() {
                return [
                    {
                        type: 'checkbox', // 特定类型
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code,
                        slots: {
                            type: 'default'
                        }
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n.lifecyleState
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n.context
                    }
                ];
            }
        },
        methods: {
            ...mapMutations(['setForAddToWorkspace']),
            loadSelectedData() {
                const selectedData = this.getSelectedForAddToWorkspace();
                if (selectedData.length === 0) {
                    return;
                }
                const oidList = selectedData.map((item) => item.oid);
                const className = oidList.at(0).split(':').at(1);
                return this.$famHttp({
                    url: Api.workspaceAddToData,
                    method: 'post',
                    data: {
                        className,
                        oidList
                    }
                }).then((resp) => {
                    const {
                        success,
                        data: { relationObjMap = {}, records = [] }
                    } = resp;
                    if (success) {
                        this.tableData = records.map((item) => {
                            return {
                                ...item,
                                ...ErdcKit.deserializeArray(item.attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                }),
                                createBy:
                                    relationObjMap[`OR:erd.cloud.foundation.principal.entity.User:${item.createBy}`]
                                        ?.displayName || item.createBy,
                                updateBy:
                                    relationObjMap[`OR:erd.cloud.foundation.principal.entity.User:${item.updateBy}`]
                                        ?.displayName || item.updateBy
                            };
                        });
                    }
                    // this.setForAddToWorkspace([]);
                });
            },
            handleNoClick(row) {
                let className = row?.versionOid.split(':')[1] || '';
                if (!className) {
                    console.error('error', row);
                    return;
                }
                let oidKey = row.collect ? 'versionOid' : 'oid';
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                switch (className) {
                    case 'erd.cloud.pdm.part.entity.EtPart':
                        this.$router.push({
                            path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                            query: {
                                ..._.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                }),
                                oid: row[oidKey]
                            }
                        });
                        break;
                    case 'erd.cloud.pdm.epm.entity.EpmDocument':
                        this.$router.push({
                            path: `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/detail`,
                            query: {
                                ..._.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                }),
                                oid: row[oidKey]
                            }
                        });
                        break;
                    case 'erd.cloud.cbb.doc.entity.EtDocument':
                        this.$router.push({
                            path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/detail`,
                            query: {
                                ..._.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                }),
                                oid: row[oidKey]
                            }
                        });
                        break;
                    default:
                        break;
                }
            },
            // 创建工作区
            createWorkspace() {
                operateAction.createWorkspace.call(this, 'addTo');
            },
            handleAssociationDone: function (data) {
                const needAddList = data.filter(
                    (item) => this.tableData.findIndex((sItem) => sItem.oid === item.oid) < 0
                );
                this.tableData.splice(this.tableData.length, 0, ...needAddList);
            },
            handleExistedWorkspaceModeConfirm() {
                return new Promise((resolve) => {
                    this.$refs.baseFormRef.validate((valid) => {
                        if (valid) {
                            const selectedWorkspace = this.workspaceOptions.find(
                                (item) => item.oid === this.formData.workspace
                            );
                            resolve(selectedWorkspace);
                        }
                    });
                });
            },
            async handleConfirm(workspace) {
                this.btnLoading = true;
                const data = {
                    workspaceRef: workspace.oid,
                    confirm: true,
                    memberVoList: this.tableData.map((item) => ({
                        memberOid: item.collect ? item.versionOid : item.oid,
                        name: item.name,
                        memberMasterOid: item.masterRef,
                        version: item.version,
                        identifierNo: item.identifierNo
                    }))
                };
                this.$famHttp({
                    url: Api.workspaceObjectAdd,
                    data,
                    className: viewConfig.workspaceViewTableMap.className,
                    method: 'POST'
                })
                    .then((resp) => {
                        if (resp.success) {
                            // 模型 在工作区编辑跳转到添加至工作区页面  完成后调用工作区检出接口
                            if (this.workspaceAddToType === 'editInEpmDocument') {
                                let paramData = data.memberVoList.map((element) => ({
                                    relationOid: element.memberOid
                                }));
                                operateAction.handleRelationObjCheckout.call(
                                    _.extend({}, this, { oid: workspace.oid }),
                                    paramData
                                );
                            } else {
                                this.$message.success(this.i18n.addToWorkspaceSuccess);
                            }
                            this.handleClose(workspace);
                        }
                        this.btnLoading = false;
                    })
                    .catch(() => {
                        this.btnLoading = false;
                    });
            },
            async handleConfirmBtnClick() {
                if (this.tableData.length === 0) {
                    return this.$message.error(this.i18n.pleaseAddWorkspaceObject);
                }
                const workspaceInfo = await this.handleExistedWorkspaceModeConfirm();
                workspaceInfo && this.handleConfirm(workspaceInfo);
            },
            handleClose(workspace) {
                const { prefixRoute, resourceKey } = this.$route?.meta || {};
                // 完成添加后或关闭时 执行清空缓存数据
                this.setForAddToWorkspace([]);
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    if (workspace && ['editInEpmDocument'].includes(this.workspaceAddToType)) {
                        // 在工作区编辑后，要跳转到工作区内
                        return this.$router.push({
                            path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/detail`,
                            query: {
                                oid: workspace.oid,
                                pid: this.$route.query.pid,
                                activeName: 'relationObj'
                            }
                        });
                    } else if (this.lastRoute && this.lastRoute.name) {
                        delete this.lastRoute?.query?.workspaceAddToType;
                        delete this.lastRoute?.query?.title;
                        return this.$router.push(this.lastRoute);
                    }
                    if (visitedRoutes.length) {
                        return this.$router.push(visitedRoutes.at(0));
                    }
                    this.$nextTick(() => {
                        if (['addToEpmDocument', 'editInEpmDocument'].includes(this.workspaceAddToType)) {
                            this.$router.push({
                                path: `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/list`,
                                query: _.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                })
                            });
                        } else if (['addToPart'].includes(this.workspaceAddToType)) {
                            this.$router.push({
                                path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/list`,
                                query: _.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                })
                            });
                        }
                    });
                });
            },
            handleWorkspaceSearch() {
                return new Promise((resolve) => {
                    this.workspaceOptions = [];
                    this.$famHttp({
                        url: Api.listByKey,
                        data: {
                            className: viewConfig.workspaceViewTableMap.className
                        },
                        method: 'GET'
                    })
                        .then((resp) => {
                            if (resp.success) {
                                this.workspaceOptions = resp.data;
                            } else {
                                this.workspaceOptions = [];
                            }
                            resolve(this.workspaceOptions);
                        })
                        .catch((e) => {
                            resolve([]);
                        });
                });
            },
            // 外部调用
            setWorkspaceForm(data) {
                this.formData.workspace = data;
            },
            handleRelateObjectAdd() {
                this.objectVisible = true;
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            handleRelateObjectGather() {
                let selectedData = this.selectedRelateObjects;
                if (!selectedData.length) {
                    return this.$message.info(this.i18n.selectTip);
                }
                this.popover({
                    field: 'collectForm',
                    visible: true,
                    title: this.i18n.gatherRelateObject,
                    callback: () => {
                        this.collectForm.tableData = ErdcKit.deepClone(selectedData) || [];
                    }
                });
            },
            // 选中收集对象
            collectObjectClick() {
                // 选中的收集对象数据
                let tableData = this.$refs?.collectObjectsRef?.getData?.() || [];

                // 当前勾选的相关对象数据
                const selectedData = this.selectedRelateObjects || [];

                if (tableData.length) {
                    for (let i = tableData.length - 1; i >= 0; i--) {
                        for (let j = 0; j < selectedData.length; j++) {
                            if (tableData[i]?.oid === selectedData[j]?.oid) {
                                tableData.splice(i, 1);
                            }
                        }
                    }
                }

                if (tableData.length) {
                    this.collectForm.loading = true;

                    tableData = _.map(tableData, (item) => {
                        let obj = {};
                        _.each(item?.attrRawList, (sitem) => {
                            obj[sitem.attrName] = sitem?.displayName;
                        });

                        return {
                            ...obj,
                            ...item,
                            ...{ collect: true }
                        };
                    });

                    this.tableData = this.tableData.concat(tableData);

                    this.$message.success(this.i18n['relatedObjectcollectedSuccess']);

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                } else {
                    this.collectForm.loading = true;

                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            this.collectForm.loading = false;
                        }
                    });
                }
            },
            handleSelectedRelateObjectRemove() {
                if (!this.selectedRelateObjects.length) {
                    return this.$message.info(this.i18n.selectTip);
                }
                this.$confirm(this.i18n.removeTip, this.i18n.tips, {
                    confirmButtonText: this.i18n.confirm,
                    cancelButtonText: this.i18n.cancel,
                    customClass: 'confirm-message-tips',
                    type: 'warning'
                })
                    .then(() => {
                        this.tableData = this.tableData.filter(
                            (item) => this.selectedRelateObjects.findIndex((sItem) => sItem.oid == item.oid) == -1
                        );
                        this.selectedRelateObjects = [];
                    })
                    .catch((error) => { });
            },
            handleSelectionAll(data) {
                this.selectedRelateObjects = this.$refs.erdTable.$table.getCheckboxRecords();
            },
            handleSelectionChange(data) {
                this.selectedRelateObjects = this.$refs.erdTable.$table.getCheckboxRecords();
            }
        }
    };
});
