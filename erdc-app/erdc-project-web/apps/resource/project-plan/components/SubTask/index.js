define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/SubTask/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-plan/mixins/common-mixins.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'css!' + ELMP.resource('project-plan/components/SubTask/index.css')
], function (ErdcKit, template, store, commonMixins, actions) {
    const subTaskComponent = {
        name: 'SubTask',
        template: template,
        props: {
            poid: String,
            containerRefOid: String,
            isTemplate: Boolean
        },
        mixins: [commonMixins],
        data() {
            return {
                tableData: [],
                column: [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        fixed: 'left', // 是否固定列
                        align: 'center' //多选框默认居中显示
                    }
                ],
                // 勾选的数据
                checkData: [],
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                i18nMappingObj: {
                    dataMoveSuccess: this.getI18nByKey('dataMoveSuccess'),
                    downgradTips: this.getI18nByKey('downgradTips'),
                    ExpandOne: this.getI18nByKey('ExpandOne'),
                    ExpandTwo: this.getI18nByKey('ExpandTwo'),
                    ExpandThree: this.getI18nByKey('ExpandThree'),
                    ExpandAll: this.getI18nByKey('ExpandAll'),
                    level: this.getI18nByKey('level'),
                    disassociation: this.getI18nByKey('disassociation'),
                    editSuccess: this.getI18nByKey('editSuccess'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    pleaseSelect: this.getI18nByKey('pleaseSelect'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    deleteTipsInfo: this.getI18nByKey('deleteTipsInfo'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    setTaskStatus: this.getI18nByKey('setTaskStatus'),
                    setStateSuccess: this.getI18nByKey('setStateSuccess'),
                    batchSetStateInfo: this.getI18nByKey('batchSetStateInfo'),
                    sddSubtask: this.getI18nByKey('sddSubtask'),
                    createSubTask: this.getI18nByKey('createSubTask'),
                    whetherMoveSubtask: this.getI18nByKey('whetherMoveSubtask'),
                    confirmMove: this.getI18nByKey('confirmMove'),
                    moveSuccess: this.getI18nByKey('moveSuccess')
                },
                taskLink: 'erd.cloud.ppm.plan.entity.TaskLink', //erd.cloud.ppm.plan.entity.Task
                keyword: null,
                showDialog: false,
                expandedKeys: [],
                treeProps: {
                    children: 'childrenList',
                    label: 'name'
                },
                viewId: 'OR:erd.cloud.foundation.core.tableview.entity.TableView:1664177739982213121',
                // 项目的oid
                parentId: ErdcKit.getParam('pid'),
                treeData: [],
                planOid: '',
                className: 'erd.cloud.ppm.plan.entity.Task',
                moveType: '',
                editRow: {},
                showCopyOrMoveDialog: false
            };
        },
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            CopyOrMove: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/CopyOrMove/index.js'))
        },
        computed: {
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'icon',
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
            projectOid() {
                return this.$route.query.pid;
            },
            treeConfig() {
                return {
                    transform: true,
                    rowField: 'oid',
                    parentField: 'parentRef'
                };
            },
            viewTableConfig() {
                let _this = this;
                // 判断是否项目模板
                let tmplTemplated = !!(store.state.projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid);
                let params = {
                    // conditionDtoList: [
                    //     {
                    //         attrName: 'erd.cloud.ppm.plan.entity.Task#parentTask',
                    //         oper: 'EQ',
                    //         value1: _this.poid,
                    //         logicalOperator: 'AND',
                    //         isCondition: true,
                    //         sortOrder: 1
                    //     }
                    // ]
                    relationshipRef: _this.poid,
                    tmplTemplated
                };
                if (this.$route.query.baselined) {
                    params.baselined = '';
                }
                // let viewOid = this.$refs.subTask.viewOid;
                let config = {
                    tableKey: tmplTemplated ? 'SubTaskTemplateView' : 'SubTaskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        pagination: {
                            // 隐藏分页
                            showPagination: true
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: params,
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    let records = _this.formatData(resData.data.records || []);
                                    resData.data.records = records || [];
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: 'PPM_SUB_TASK_LIST_MENU',
                                containerOid: this.containerRefOid,
                                isDefaultBtnType: true,
                                className: this.className,
                                objectOid: this.poid
                            }
                        },
                        fieldLinkConfig: {
                            fieldLink: true,
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name',
                            linkClick: (row) => {
                                this.openDetail(row);
                            }
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
            tableHeight() {
                return document.documentElement.clientHeight - 302;
            },
            projectDisabled() {
                return this.isTemplate;
            },
            projectSearchKey() {
                return store.state.projectInfo?.name || '';
            },
            viewRef() {
                return 'OR:erd.cloud.foundation.core.tableview.entity.TableView:1663129407558029313';
            },
            enableScrollLoad() {
                return true;
            }
        },
        created() {
            this.refresh = this.refreshTable;
            this.vm = this;
            this.getFormInfo();
        },
        methods: {
            getFormInfo() {
                if (!this.poid) return;
                this.$famHttp({
                    method: 'GET',
                    url: '/ppm/attr',
                    className: this.className,
                    params: {
                        oid: this.poid
                    }
                }).then((res) => {
                    this.formInfo = res?.data?.rawData || {};
                    this.handleRenderData(this.formInfo);
                });
            },
            handleRenderData(data) {
                this.formData = ErdcKit.deserializeAttr(data, {
                    valueMap: {
                        'projectRef': () => {
                            return store.state.projectInfo.name;
                        },
                        'typeReference': (e, data) => {
                            return data['typeReference']?.displayName || '';
                        },
                        'lifecycleStatus.status': (e, data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'responsiblePerson': ({ users }) => {
                            return users;
                        },
                        'participant': ({ value }) => {
                            return value;
                        },
                        'parentTask': (e) => {
                            return e.displayName;
                        }
                    }
                });
                this.formData['lifecycleStatus.value'] = data['lifecycleStatus.status'].value;
                this.$emit('ready', this.formData);
            },
            copyOrMove(row) {
                if (row) {
                    this.editRow = row;
                    this.moveType = 'single';
                } else {
                    this.moveType = 'batch';
                    if (!this.checkData.length) {
                        return this.$message({
                            type: 'info',
                            message: this.i18nMappingObj.pleaseSelectData
                        });
                    }
                }
                this.showCopyOrMoveDialog = true;
            },
            editCopyOrMoveCancel() {
                this.showCopyOrMoveDialog = false;
            },
            moveToProject(data) {
                let singleParams;
                let eachData = this.moveType === 'batch' ? this.checkData : [this.editRow];
                let batchParams = {
                    action: 'UPDATE',
                    className: this.className,
                    rawDataVoList: []
                };
                eachData.forEach((item) => {
                    // let stateInfo = item.attrRawList.find(
                    //         (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status'
                    //     ),
                    //     state = data.stateValue === 1 ? stateInfo.value : 'PLANNING',
                    //     attrRawList = [
                    //         {
                    //             attrName: 'projectRef',
                    //             value: data.projectOid
                    //         }
                    //     ],
                    //     attrObj = {
                    //         attrName: 'lifecycleStatus.status',
                    //         value: state
                    //     },
                    //     // 如果没选父任务就传项目oid
                    //     relationOid = data.parentInfo?.oid || data.projectOid,
                    //     relationAttrRawList = [{ attrName: 'roleAObjectRef', category: 'HARD', value: relationOid }];
                    // if (stateInfo.category) attrObj.category = stateInfo.category;

                    // attrRawList.push(attrObj);
                    let relationOid = data.parentInfo?.oid || data.projectOid;
                    let relationAttrRawList = [{ attrName: 'roleAObjectRef', category: 'HARD', value: relationOid }];
                    let oid = item.attrRawList.find(
                        (item) => item.attrName === 'erd.cloud.ppm.plan.entity.TaskLink#roleBObjectRef'
                    )?.oid;
                    let attrMap = {
                        parentRef: _.isObject(data.parentInfo)
                            ? data.parentInfo.oid
                            : data.parentInfo || data.projectOid,
                        projectRef: data.projectOid,
                        reserveStatus: +data.stateValue === 1 ? true : false,
                        collectRef: data.currentPlanSet,
                        relation: data.relation,
                        delivery: data.delivery
                    };

                    let attrRawList = Object.keys(attrMap)
                        .filter((key) => !!attrMap[key] || typeof attrMap[key] === 'boolean')
                        .map((key) => ({
                            attrName: key,
                            value: attrMap[key]
                        }));
                    singleParams = {
                        action: 'UPDATE',
                        appName: '',
                        associationField: 'roleAObjectRef',
                        attrRawList: attrRawList,
                        className: this.className,
                        oid,
                        relationList: [
                            {
                                action: 'UPDATE',
                                appName: '',
                                associationField: '',
                                attrRawList: relationAttrRawList,
                                className: this.taskLink,
                                oid: item.oid
                            }
                        ]
                    };
                    if (this.moveType === 'batch') batchParams.rawDataVoList.push(singleParams);
                });

                let reqMethod = this.moveType === 'batch' ? this.saveOrUpdateRequest : this.updateRequest;
                let params = this.moveType === 'batch' ? batchParams : singleParams;
                reqMethod(params).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18nMappingObj.dataMoveSuccess
                    });
                    this.editCopyOrMoveCancel();
                    this.refreshTable();
                });
            },
            getActionConfig() {
                return {
                    name: 'PPM_SUB_TASK_PER_MENU',
                    objectOid: this.poid,
                    className: this.className
                };
            },
            actionClick(data) {
                const eventClick = {
                    TASK_CREATE: this.create,
                    PPM_TASK_REMOVE_LINK: this.copyOrMove
                };
                eventClick[data.name]();
            },
            onCommand(data, row) {
                const eventClick = {
                    PPM_TASK_REMOVE_LINK: this.deleteRow
                    // TASK_MOVE: this.copyOrMove
                };
                eventClick[data.name] && eventClick[data.name](row);
            },
            // 删除一行数据
            deleteRow(row) {
                let params = {
                    catagory: 'DELETE',
                    className: this.taskLink,
                    oidList: [row.oid]
                };
                this.deleteData(params);
            },
            openDetail(row) {
                let collectId = row.attrRawList.find(
                    (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#collectRef'
                );
                let planOid = row.attrRawList.find(
                    (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#oid'
                )?.value;
                this.$router.push({
                    path: '/space/project-plan/planDetail',
                    params: {
                        planOid
                    },
                    query: {
                        planOid,
                        pid: this.projectOid,
                        planTitle: row['erd.cloud.ppm.plan.entity.Task#name'],
                        collectId: collectId?.oid || ''
                    }
                });
            },
            // 复选框全选
            selectAllEvent(data) {
                this.checkData = JSON.parse(JSON.stringify(data.records));
            },
            // 复选框勾选事件
            selectChangeEvent(data) {
                this.checkData = JSON.parse(JSON.stringify(data.records));
            },
            formatData(data) {
                let result =
                    data?.map((item) => {
                        let attrData = {};
                        item.attrRawList.forEach((item) => {
                            attrData[item.attrName] = item.displayName;
                        });
                        return Object.assign(attrData, item);
                    }) || [];
                return result;
            },
            // 创建子任务
            create() {
                const routeNames = {
                    planEdit: 'project-plan/planCreate',
                    planDetail: 'project-plan/planCreate',
                    taskEdit: 'project-task/taskCreate',
                    taskDetail: 'project-task/taskCreate'
                };
                this.$router.push({
                    path: `/space/${routeNames[this.$route.name]}`,
                    params: {
                        // backName: this.$route.name,
                        // activeName: routeNames[this.$route.name] !== 'planCreate' ? 'SubTask' : '',
                        hideDraftBtn: true
                    },
                    query: {
                        pid: this.projectOid,
                        planOid: this.poid,
                        planTitle: this.$route.query?.planTitle || '',
                        createPlanTitle: this.i18nMappingObj.createSubTask,
                        backName: this.$route.name,
                        activeNames: 'SubTask',
                        collectId: this.$route.query?.collectId || ''
                    }
                });
            },
            deleteTask() {
                if (!this.checkData.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectData
                    });
                }
                let params = {
                    catagory: 'DELETE',
                    className: this.taskLink,
                    oidList: []
                };
                params.oidList = this.checkData.map((item) => {
                    return item.oid;
                });
                this.deleteData(params);
            },
            deleteData(params) {
                this.$confirm(this.i18nMappingObj.whetherMoveSubtask, this.i18nMappingObj.confirmMove, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.concel,
                    type: 'warning'
                })
                    .then(() => {
                        this.deleteByIdsRequest(params).then((resp) => {
                            if (resp.success) {
                                this.refreshTable();
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.moveSuccess
                                });
                            }
                        });
                    })
                    .catch(() => {});
            },
            refreshTable() {
                this.$refs.subTaskList.refreshTable('default');
            },
            dialogConfirm() {
                const checkedNodes = this.$refs.tree.getCheckedNodes();
                this.tableData = checkedNodes.map((item) => {
                    let obj = {
                        linkOid: item.oid,
                        oid: item.oid,
                        parentRef: item.parentRef,
                        typeName: item.typeName
                    };
                    return Object.assign(obj, item.attrData);
                });
                this.tableData.forEach((item) => {
                    // console.log('%c [ item ]-205', 'font-size:13px; background:pink; color:#bf2c9f;', item);
                    let parentData = this.tableData.filter((res) => res.oid === item.parentRef);
                    item.hasParent = parentData.length > 0;
                });

                // console.log('%c [  ]-210', 'font-size:13px; background:pink; color:#bf2c9f;', this.tableData);
                setTimeout(() => {
                    this.$refs.subTask.$table.setAllTreeExpand(true);
                }, 0);
                this.showDialog = false;
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
            },
            onKeywordChange(keyword) {
                return this.$refs.tree.filter(keyword);
            }
        }
    };
    return subTaskComponent;
});
