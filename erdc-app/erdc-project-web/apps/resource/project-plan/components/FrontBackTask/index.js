define([
    'text!' + ELMP.resource('project-plan/components/FrontBackTask/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-plan/mixins/common-mixins.js'),
    'css!' + ELMP.resource('project-plan/components/FrontBackTask/style.css')
], function (template, ErdcKit, store, commonMixins) {
    let debounceTimer = null;
    return {
        template,
        props: {
            // 当前项目oid
            poid: String,
            containerRefOid: String,
            isTemplate: Boolean,
            vm: Object
        },
        mixins: [commonMixins],
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            Dict: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDict/index.js')),
            AddFrontBackTask: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/AddFrontBackTask/index.js'))
        },
        data() {
            return {
                panelUnfoldA: true,
                panelUnfold: true,
                searchVal: '',
                isSearchDefault: false,
                projOptions: [],
                selectList: [],
                tableData: [],
                title: '前置任务',
                form: {
                    taskOid: '',
                    type: '',
                    num: ''
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                i18nMappingObj: {
                    pleaseCheckSelect: this.getI18nByKey('pleaseSelectData'),
                    comfirmSelect: this.getI18nByKey('confirm'),
                    save: this.getI18nByKey('save'), // 保存
                    edit: this.getI18nByKey('edit'), //
                    remove: this.getI18nByKey('remove'),
                    comfirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    checkDelete: this.getI18nByKey('deleteConfirm'),
                    deleteSucess: this.getI18nByKey('deleteSuccess'),
                    pleaseEnterName: this.getI18nByKey('pleaseEnterName'),
                    pleaseEnterKeyword: this.getI18nByKey('pleaseEnterKeyword'),
                    postTask: this.getI18nByKey('postTask'),
                    delayTimeCheckTips: this.getI18nByKey('delayTimeCheckTips'),
                    saveSuccess: this.getI18nByKey('saveSuccess'),
                    pleaseSelectAppropriateData: this.getI18nByKey('pleaseSelectAppropriateData'),
                    whetherRemovePreTask: this.getI18nByKey('whetherRemovePreTask'),
                    confirmRemoval: this.getI18nByKey('confirmRemoval'),
                    removedSuccess: this.getI18nByKey('removedSuccess'),
                    predecessors: this.getI18nByKey('predecessors')
                },
                nameOptions: [],
                className: 'erd.cloud.ppm.plan.entity.PredecessorLink'
            };
        },
        computed: {
            projectOid() {
                return this.$route.query.pid;
            },
            planOid() {
                return this.$route.query.planOid;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#name', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.PredecessorLink#type', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.PredecessorLink#delay', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    ?.map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            viewTableConfig() {
                let requestData = { relationshipRef: this.poid, tmplTemplated: this.isTemplate };
                if (this.$route.query.baselined) {
                    requestData.baselined = '';
                }
                let config = {
                    tableKey: 'PreTaskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        pagination: {
                            // 隐藏分页
                            showPagination: false
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            // 更多配置参考axios官网
                            data: requestData,
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                placeholder: this.i18nMappingObj.pleaseEnterName
                            },
                            actionConfig: {
                                name: 'PPM_TASK_PREDECESSOR_POST_LIST_MENU',
                                containerOid: this.containerRefOid,
                                className: this.className,
                                isDefaultBtnType: true,
                                objectOid: this.poid
                            }
                        },
                        tableBaseConfig: {
                            'maxLine': 5,
                            'keep-source': true
                        },

                        fieldLinkConfig: {
                            fieldLink: false,
                            // 是否添加列超链接
                            fieldLinkName: '', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: () => {
                                // 超链接事件
                            }
                        },
                        columnWidths: {
                            // operation: '100px'
                        },
                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            viewHouZTableConfig() {
                let requestData = { relationshipRef: this.poid, tmplTemplated: this.isTemplate };
                if (this.$route.query.baselined) {
                    requestData.baselined = '';
                }
                let config = {
                    tableKey: 'PostTaskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        pagination: {
                            // 隐藏分页
                            showPagination: false
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            // 更多配置参考axios官网
                            data: requestData,
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true, // 是否显示配置列，默认显示
                            showMoreSearch: false, // 是否显示高级搜索，默认显示
                            showRefresh: true,
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            }
                        },
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        addSeq: true,
                        addCheckbox: false,
                        addOperationCol: false,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                this.openDetail(row);
                            }
                        },
                        slotsField: [{ prop: 'icon', type: 'default' }]
                    }
                };
                return config;
            }
        },
        methods: {
            onCommand(data, row) {
                const eventClick = {
                    PPM_PREDECESSOR_LINK_UPDATE: this.handlerEdit,
                    PPM_PREDECESSOR_LINK_DELETE: this.handlerDelete
                };
                eventClick[data.name](row);
            },
            getActionConfig() {
                return {
                    name: 'PPM_TASK_PREDECESSOR_POST_LIST_OP_MENU',
                    objectOid: this.poid,
                    className: 'erd.cloud.ppm.common.entity.Delivery'
                };
            },
            actionClick(data) {
                const eventClick = {
                    PPM_PREDECESSOR_LINK_ADD: this.create,
                    PPM_PREDECESSOR_LINK_LIST_DELETE: this.batchDelete
                };
                eventClick[data.name]();
            },
            // 复选框全选
            selectAllEvent(data) {
                this.selectList = data.records;
            },
            handleChange(value) {
                this.form.num = value;
            },
            statusCallback(value, data) {
                const { row, column } = data;
                this.form.type = value;
                this.$set(row, column.property, value);
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
            },
            remoteMethod(query) {
                if (query) {
                    this.$famHttp({
                        method: 'GET',
                        url: '/ppm/listByKey',
                        data: {
                            taskId: this.planOid,
                            projectId: store.state.projectInfo.oid,
                            selectType: 'optionalPredecessor',
                            className: 'erd.cloud.ppm.plan.entity.Task',
                            keyword: query
                        }
                    })
                        .then((res) => {
                            if (res.success) {
                                this.nameOptions = res.data;
                            }
                        })
                        .catch(() => {
                            this.nameOptions = [];
                        });
                } else {
                    this.nameOptions = [];
                }
            },
            projectChange(value, data) {
                const { row, column } = data;
                this.form.taskOid = value.oid;
                this.isSearchDefault = false;
                this.$set(row, column.property, value.name);
            },
            handlerSaveApplication(row) {
                let num = +row['erd.cloud.ppm.plan.entity.PredecessorLink#delay'];
                // if (!this.validateNonNegativeInteger(num)) {
                //     return this.$message({
                //         type: 'info',
                //         message: this.i18nMappingObj.delayTimeCheckTips
                //     });
                // }
                let attrRawList = [
                    {
                        attrName: 'roleAObjectRef',
                        value: this.poid
                    },
                    {
                        attrName: 'roleBObjectRef',
                        value: row.relationOid
                    },
                    {
                        attrName: 'projectRef',
                        value: store.state.projectInfo.oid
                    },
                    {
                        attrName: 'containerRef',
                        value:
                            'OR:' +
                            store.state.projectInfo.containerRef.key +
                            ':' +
                            store.state.projectInfo.containerRef.id
                    },
                    {
                        attrName: 'type',
                        value: row['erd.cloud.ppm.plan.entity.PredecessorLink#type']
                    },
                    {
                        attrName: 'delay',
                        value: num
                    }
                ];
                let attrdata = {
                    attrRawList: attrRawList,
                    className: 'erd.cloud.ppm.plan.entity.PredecessorLink',
                    oid: row.oid,
                    containerRef:
                        'OR:' + store.state.projectInfo.containerRef.key + ':' + store.state.projectInfo.containerRef.id
                };
                this.update(attrdata, row);
            },
            confirm(attrdata, row) {
                this.createRequest(attrdata).then((resp) => {
                    if (resp.success) {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.saveSuccess,
                            showClose: true
                        });
                        this.nameOptions = [];
                        this.refreshTable();
                        this.$set(row, 'whetherAdd', false);
                    }
                });
            },
            update(attrdata, row) {
                this.updateRequest(attrdata).then((resp) => {
                    if (resp.code === '200') {
                        this.refreshTable();
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.saveSuccess,
                            showClose: true
                        });
                        this.vm.refresh(this.poid);
                        this.$set(row, 'whetherAdd', false);
                    }
                });
            },
            refreshTable() {
                this.vm.refresh(this.poid);
                this.$refs.frontBackList.refreshTable('default');
            },
            dialogConfirm(row) {
                let taskOid = row['erd.cloud.ppm.plan.entity.Task#name'];
                let num = +row['erd.cloud.ppm.plan.entity.PredecessorLink#delay'];
                let type = row['erd.cloud.ppm.plan.entity.PredecessorLink#type'];
                if (!this.validateNonNegativeInteger(num)) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.delayTimeCheckTips
                    });
                }
                if (!taskOid || !type) {
                    this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectAppropriateData
                    });
                    return;
                }
                let attrRawList = [
                    {
                        attrName: 'roleAObjectRef',
                        value: this.poid
                    },
                    {
                        attrName: 'roleBObjectRef',
                        value: taskOid
                    },
                    {
                        attrName: 'projectRef',
                        value: store.state.projectInfo.oid
                    },
                    {
                        attrName: 'containerRef',
                        value:
                            'OR:' +
                            store.state.projectInfo.containerRef.key +
                            ':' +
                            store.state.projectInfo.containerRef.id
                    },
                    {
                        attrName: 'type',
                        value: type
                    },
                    {
                        attrName: 'delay',
                        value: num
                    }
                ];
                let attrdata = {
                    attrRawList: attrRawList,
                    className: 'erd.cloud.ppm.plan.entity.PredecessorLink',
                    containerRef:
                        'OR:' + store.state.projectInfo.containerRef.key + ':' + store.state.projectInfo.containerRef.id
                };
                this.confirm(attrdata, row);
            },
            debounceFn(fn, awit) {
                clearTimeout(debounceTimer);
                return (debounceTimer = setTimeout(() => {
                    fn && fn();
                }, awit));
            },
            create() {
                this.$refs.addTask.open();
                // let listTableData = this.$refs.frontBackList.$refs.FamAdvancedTable.tableData;
                // listTableData.unshift({
                //     'erd.cloud.ppm.plan.entity.PredecessorLink#delay': 0,
                //     'erd.cloud.ppm.plan.entity.Task#name': '',
                //     'erd.cloud.ppm.plan.entity.PredecessorLink#type': 'FS',
                //     'isDefault': true,
                //     'idKey': 'erd.cloud.ppm.plan.entity.PredecessorLink',
                //     'createId': this.getRandomNumber()
                // });
                // this.$set(listTableData[0], 'whetherAdd', true);
            },
            validateNonNegativeInteger(number) {
                let pattern = /^\d+$/;
                return pattern.test(number);
            },
            handlerEdit(row) {
                let key = 'erd.cloud.ppm.plan.entity.PredecessorLink#type';
                this.$set(row, key, _.find(row.attrRawList, { attrName: key }).value);
                this.$set(row, 'whetherAdd', true);
                this.$set(row, 'isEdit', true);
            },
            openDetail(row) {
                this.$router.push({
                    path: '/space/project-plan/planDetail',
                    params: {
                        planOid: row['erd.cloud.ppm.plan.entity.Task#oid'],
                        pid: this.projectOid
                    },
                    query: {
                        planOid: row['erd.cloud.ppm.plan.entity.Task#oid'],
                        pid: this.projectOid,
                        planTitle: row['erd.cloud.ppm.plan.entity.Task#name']
                    }
                });
            },
            hanlderCancel(row, data) {
                this.isSearchDefault = false;
                if (!row.isDefault) {
                    this.$refs.frontBackList.$refs.FamAdvancedTable.$refs.erdTable.$refs.xTable.revertData(row);
                    let key = 'erd.cloud.ppm.plan.entity.PredecessorLink#type';
                    this.$set(row, 'whetherAdd', false);
                    this.$set(row, key, _.find(row.attrRawList, { attrName: key }).displayName);
                } else {
                    let listTableData = this.$refs.frontBackList.$refs.FamAdvancedTable.tableData;
                    const index = data.rowIndex;
                    listTableData.splice(index, 1);
                    this.$set(row, 'whetherAdd', false);
                }
            },
            handlerDelete(row) {
                let params = {
                    category: 'DELETE',
                    oidList: [row.oid],
                    className: row.idKey
                };
                this.deleteData(params);
            },
            // 批量删除
            batchDelete() {
                if (!this.selectList.length) {
                    this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseCheckSelect
                    });
                    return;
                }
                let oidList = this.selectList
                    .filter((item) => item.oid)
                    .map((item) => {
                        return item.oid;
                    });
                let params = {
                    category: 'DELETE',
                    oidList,
                    className: this.selectList[0]?.idKey
                };
                this.deleteData(params, 'batch');
            },
            deleteData(params, type = '') {
                this.$confirm(this.i18nMappingObj.whetherRemovePreTask, this.i18nMappingObj.confirmRemoval, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.comfirmSelect,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                })
                    .then(() => {
                        if (type === 'batch') {
                            let listTableData = this.$refs.frontBackList.$refs.FamAdvancedTable.tableData;
                            let createIds = this.selectList
                                .filter((item) => !item.oid)
                                .map((item) => {
                                    return item.createId;
                                });
                            if (createIds.length) {
                                this.$refs.frontBackList.$refs.FamAdvancedTable.tableData = listTableData.filter(
                                    (item) => !createIds.includes(item.createId)
                                );
                            }
                        }
                        if (!params.oidList.length) return;
                        this.deleteByIdsRequest(params).then((resp) => {
                            if (resp.success) {
                                let listTableData = this.$refs.frontBackList.$refs.FamAdvancedTable.tableData;
                                this.$refs.frontBackList.$refs.FamAdvancedTable.tableData = listTableData.filter(
                                    (item) => !params.oidList.includes(item.oid)
                                );
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.removedSuccess
                                });
                                if (type === 'batch') {
                                    this.selectList = [];
                                }
                            }
                        });
                    })
                    .catch(() => {});
            },
            getRandomNumber() {
                let randomNumber = '';
                for (let i = 0; i < 10; i++) {
                    randomNumber += Math.floor(Math.random() * 10);
                }
                let dateNow = Date.now();
                return dateNow + '' + randomNumber;
            }
        }
    };
});
