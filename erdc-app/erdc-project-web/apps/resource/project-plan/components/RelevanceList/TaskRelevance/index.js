define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-plan/components/RelevanceList/TaskRelevance/index.html'),
    ELMP.resource('project-plan/mixins/common-mixins.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.resource('project-plan/components/RelevanceList/style.css')
], function (ErdcKit, store, template, commonMixins, commonHttp, globalUtils) {
    return {
        name: 'task_list_component',
        template: template,
        props: {
            poid: String,
            containerRefOid: String,
            taskTableKey: String
        },
        mixins: [commonMixins],
        data() {
            return {
                readonly: false,
                selectList: [],
                lefttableList: [],
                stateOptions: [],
                currentState: '',
                showList: true, // 显示列表还是表单数据
                i18nMappingObj: {
                    edit: this.getI18nByKey('edit'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter'),
                    pleaseSelect: this.getI18nByKey('pleaseSelect'),
                    pleaseUpload: this.getI18nByKey('pleaseUpload'),
                    enable: this.getI18nByKey('enable'),
                    disable: this.getI18nByKey('disable'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteAssociation: this.getI18nByKey('deleteAssociation'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    pleaseCheckSelect: this.getI18nByKey('pleaseSelectData'),
                    confirmSelect: this.getI18nByKey('confirm'),
                    whetherDelete: this.getI18nByKey('whetherDelete'),
                    checkDelete: this.getI18nByKey('deleteConfirm'),
                    save: this.getI18nByKey('save'),
                    whetherRemoveTask: this.getI18nByKey('whetherRemoveTask'),
                    confirmRemoval: this.getI18nByKey('confirmRemoval'),
                    pleaseSelectAssociatePlan: this.getI18nByKey('pleaseSelectAssociatePlan'),
                    saveSuccess: this.getI18nByKey('saveSuccess'),
                    pleaseEnterKeyword: this.getI18nByKey('pleaseEnterKeyword')
                },
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                state: '', // 表单状态
                relevanList: [],
                responsiblePerson: '',
                scheduledEndTime: '',
                scheduledStartTime: '',
                taskOptions: [],
                taskDialogVisible: false,
                rowLinkOid: '',
                rowProjectName: ''
            };
        },
        computed: {
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#name', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#timeInfo.scheduledStartTime', //
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#responsiblePerson', //
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#createBy', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#timeInfo.scheduledEndTime', //erd.cloud.ppm.plan.entity.Task#updateBy
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status', //erd.cloud.ppm.plan.entity.Task#updateBy
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
                let { poid, taskTableKey } = this;
                let requestData = { relationshipRef: poid };
                if (this.$route.query.baselined) {
                    requestData.baselined = '';
                }
                let config = {
                    tableKey: taskTableKey || 'TaskBusinessLinkView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        pagination: {
                            // 隐藏分页
                            showPagination: false
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: requestData,
                            // 更多配置参考axios官网
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
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: 'PPM_TASK_TASK_OPERATE_MENU',
                                containerOid: this.containerRefOid,
                                isDefaultBtnType: true,
                                className: 'erd.cloud.ppm.plan.entity.Task',
                                objectOid: this.poid
                            }
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
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
            defaultTableHeight() {
                return document.documentElement.clientHeight - 152;
            },
            projectInfo() {
                return store.state.projectInfo;
            }
        },
        mounted() {
            this.getLifeStateData();
        },
        methods: {
            onCommand(data, row) {
                const eventClick = {
                    TASK_TASK_LIST_EDIT: this.editPlanRelev,
                    TASK_TASK_LIST_DELETE: this.handlerDelete
                };
                eventClick[data.name](row);
            },
            openDetail(row) {
                globalUtils.openDetail(row);
            },
            actionClick(data) {
                const eventClick = {
                    TASK_TASK_ADD: this.addPlanRelev,
                    TASK_TASK_DELETE: this.batchDelete
                };
                eventClick[data.name]();
            },
            getActionConfig() {
                return {
                    name: 'PPM_TASK_TASK_OPERATE_LIST_MENU',
                    objectOid: this.poid,
                    className: 'erd.cloud.ppm.common.entity.BusinessLink'
                };
            },
            getLifeStateData() {
                if (!this.poid) return;
                let params = {
                    successionType: 'SET_STATE',
                    branchIdList: [this.poid],
                    className: 'erd.cloud.ppm.plan.entity.Task'
                };
                this.statesRequest(params)
                    .then((res) => {
                        this.stateOptions = res.data[this.poid].map((item) => {
                            return {
                                label: item.displayName,
                                value: item.name,
                                disabled: item.displayName === this.currentState
                            };
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            // 复选框全选
            selectAllEvent(data) {
                this.selectList = data.records;
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
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
                this.deleteData(this.selectList, 'batch');
            },
            deleteData(selecteds, type = '') {
                this.$confirm(this.i18nMappingObj.whetherRemoveTask, this.i18nMappingObj.confirmRemoval, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirmSelect,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    // 可调接口移除的oid
                    let oidList = selecteds.filter((item) => !item.whetherAdd).map((item) => item.oid);

                    let afterRemoteRemove = () => {
                        // 未保存的做前端移除
                        let selectedOids = selecteds.map((item) => {
                            return item.oid;
                        });
                        let table = this.$refs.famViewTable.getTableInstance('advancedTable', 'instance');
                        table.tableData = table.tableData.filter((item) => {
                            return !selectedOids.includes(item.oid);
                        });

                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.deleteSuccess
                        });

                        if (type === 'batch') this.selectList = [];
                    };

                    if (oidList.length > 0) {
                        // 调接口移除
                        let params = {
                            category: 'DELETE',
                            oidList,
                            className: selecteds[0]?.idKey || 'erd.cloud.ppm.common.entity.BusinessLink'
                        };
                        this.deleteByIdsRequest(params).then(() => {
                            afterRemoteRemove();
                        });
                    } else {
                        afterRemoteRemove();
                    }
                });
            },
            remoteMethod(query) {
                if (query) {
                    this.$famHttp({
                        method: 'GET',
                        url: '/ppm/listByKey',
                        data: {
                            className: 'erd.cloud.ppm.plan.entity.Task',
                            keyword: query
                        }
                    })
                        .then((res) => {
                            if (res.success) {
                                this.taskOptions = res.data;
                            }
                        })
                        .catch(() => {
                            this.taskOptions = [];
                        });
                } else {
                    this.taskOptions = [];
                }
            },
            handlerSaveApplication(row) {
                if (!row['erd.cloud.ppm.plan.entity.Task#name']) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectAssociatePlan
                    });
                }
                let { poid } = this;
                let params = {
                    attrRawList: [
                        {
                            attrName: 'roleAObjectRef',
                            value: poid
                        },
                        {
                            attrName: 'roleBObjectRef',
                            value: row['erd.cloud.ppm.plan.entity.Task#name']
                        }
                    ],
                    className: 'erd.cloud.ppm.common.entity.BusinessLink'
                };

                this.createRequest(params)
                    .then((resp) => {
                        if (resp.success) {
                            // 更新行数据（调attr接口刷新）
                            let oid = row['erd.cloud.ppm.plan.entity.Task#name'];
                            this.updateRowByRemote(oid, row).then(() => {
                                this.$set(row, 'whetherAdd', false);
                                row.oid = resp.data;

                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.saveSuccess,
                                    showClose: true
                                });
                            });
                        }
                    })
                    .catch(() => {});
            },
            hanlderCancel(row, data) {
                let listTableData = this.$refs.famViewTable.$refs.FamAdvancedTable.tableData;
                listTableData.splice(data.rowIndex, 1);
            },
            handlerDelete(row) {
                this.deleteData([row]);
            },
            getValueMeth(row, slot) {
                let slotArr,
                    slotStr = '';
                if ((slotArr = slot.match(/#(\S*):/))) {
                    slotStr = 'erd.cloud.ppm.plan.entity.Task' + '#' + slotArr[1];
                }
                let value = row[slotStr];
                // if (value) {
                //     if (slotStr.includes('status')) {
                //         // this.stateOptions;
                //         return value == '1' ? '已完成' : '待执行';
                //     }
                // }
                return value;
            },
            addPlanRelev() {
                this.rowLinkOid = '';
                this.rowProjectName = '';
                this.taskDialogVisible = true;
                // let listTableData = this.$refs.famViewTable.$refs.FamAdvancedTable.tableData;
                // listTableData.unshift({
                //     'erd.cloud.ppm.plan.entity.Task#name': '',
                //     'erd.cloud.ppm.plan.entity.Task#responsiblePerson': '',
                //     'erd.cloud.ppm.plan.entity.Task#timeInfo.scheduledStartTime': '',
                //     'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status': '',
                //     'erd.cloud.ppm.plan.entity.Task#timeInfo.scheduledEndTime': '',
                //     'oid': Date.now()
                // });
                // this.$set(listTableData[0], 'whetherAdd', true);
            },
            editPlanRelev(row) {
                this.rowLinkOid = row.oid;
                this.rowProjectName = row['erd.cloud.ppm.plan.entity.Task#projectRef']?.split(',')?.[1];
                this.taskDialogVisible = true;
            },
            afterTaskRelateChange(isEdit) {
                let { i18n } = this;
                let message = isEdit ? i18n.editSuccess : i18n.addedSuccess;
                this.$message({
                    type: 'success',
                    message,
                    showClose: true
                });

                this.$refs.famViewTable.refreshTable();
            },
            edit() {
                this.state = 'edit';
                // this.showList = false;
            },
            updateRowByRemote(oid = '', row = {}) {
                return new Promise((resolve) => {
                    commonHttp
                        .commonAttr({
                            data: { oid }
                        })
                        .then((resp) => {
                            let className = store.state.classNameMapping.task;
                            let attrRawList = Object.values(resp.data.rawData || {});
                            row.attrRawList = attrRawList;
                            attrRawList.forEach((item) => {
                                let attrName = `${className}#${item.attrName}`;
                                row[attrName] = item.displayName || item.value;
                            });

                            resolve();
                        });
                });
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamMemberSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamMemberSelect/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            AddTaskRelateDialog: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/RelevanceList/AddTaskRelateDialog/index.js')
            )
        }
    };
});
