define([
    'text!' + ELMP.resource('biz-bpm/process-instance/template.html'),
    'css!' + ELMP.resource('biz-bpm/process-instance/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'processInstance',
        template,
        components: {
            FamResizableContainer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamResizableContainer/index.js')
            ),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamTree: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            BpmViewTask: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmViewTask/index.js')),
            BpmTerminateForm: ErdcKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmTerminateForm/index.js')
            ),
            BpmDueData: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDueData/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessStatus/index.js')
            ),
            ChangeHandler: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-instance/components/ChangeHandler/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/process-instance/locale/index.js'),
                // 额外入参
                defaultParams: {
                    conditionDtoList: [
                        {
                            attrName: 'processStatus',
                            oper: 'NOT_IN',
                            value1: 'LIFECYCLE_COMPLETED'
                        }
                    ]
                },
                // 加载中
                loading: false,
                // 分类树
                listData: [],
                // 选中分类
                oid: '',
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                },
                // 查看任务对象
                viewTaskForm: {
                    visible: false,
                    title: '',
                    processInstanceId: ''
                },
                // 终止对象
                terminateForm: {
                    visible: false,
                    title: '',
                    processInstanceOid: ''
                },
                // 修改处理人对象
                changeHandlerForm: {
                    visible: false,
                    title: '',
                    oid: '',
                    // 评审对象
                    holderRef: '',
                    // 上下文
                    containerRef: '',
                    // 处理人配置
                    handlerConfiguration: [],
                    // 处理人信息回显
                    userRoleMap: {}
                },
                // 视图表格标题
                viewTableTitle: '',
                left: { width: '240px' }
            };
        },
        computed: {
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'BpmProcessInstanceViewTable', // UserViewTable productViewTable
                    viewTableTitle: this.viewTableTitle,
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        defaultParams: this.defaultParams // body参数
                    },
                    toolbarConfig: {
                        // 工具栏
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            this.viewProcessLog(row);
                        }
                    },
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: '60px'
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('processInstance')}#dueDate`,
                            type: 'default'
                        },
                        {
                            prop: `${this.$store.getters.className('processInstance')}#processStatus`,
                            type: 'default'
                        },
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ],
                    tableBaseEvent: {
                        scroll: _.throttle(() => {
                            let arr =
                                _.chain(this.$refs)
                                    .pick((value, key) => key.indexOf('FamActionPulldown') > -1)
                                    .values()
                                    .value() || [];
                            this.$nextTick(() => {
                                _.each(arr, (item) => {
                                    let [sitem = {}] = item?.$refs?.actionPulldowm || [];
                                    sitem.hide && sitem.hide();
                                });
                            });
                        }, 100)
                    }
                };
            },
            // 插槽名称
            slotName() {
                return {
                    dueDate: `column:default:${this.$store.getters.className('processInstance')}#dueDate:content`,
                    processStatus: `column:default:${this.$store.getters.className(
                        'processInstance'
                    )}#processStatus:content`
                };
            }
        },
        watch: {
            oid(newVal) {
                if (newVal) {
                    if (_.some(this.defaultParams.conditionDtoList, { attrName: 'categoryRef' })) {
                        let obj = _.find(this.defaultParams.conditionDtoList, { attrName: 'categoryRef' }) || {};
                        obj.value1 = newVal;
                    } else {
                        this.defaultParams.conditionDtoList.push({
                            attrName: 'categoryRef',
                            oper: 'EQ',
                            value1: newVal
                        });
                    }
                } else {
                    this.defaultParams.conditionDtoList = _.filter(
                        this.defaultParams.conditionDtoList,
                        (item) => item.attrName !== 'categoryRef'
                    );
                }
                this.$refs?.erdExTree?.$refs.tree?.setCurrentKey(newVal);
                this.refreshTable();
            }
        },
        created() {
            this.getProcessTypeList();
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item)) || [];
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        typeof value !== 'object' && (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            // 获取流程状态
            getStatus({ row }) {
                let { value: status } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('processInstance')}#processStatus`
                    }) || {};
                return status;
            },
            // 获取到期日期
            getDueDate({ row }) {
                let { value: dueDate } =
                    _.find(row.attrRawList, {
                        attrName: `${this.$store.getters.className('processInstance')}#dueDate`
                    }) || {};
                return dueDate;
            },
            // 树结构搜索
            filterNode(value, data) {
                if (!value) return true;
                return data.displayName.indexOf(value) !== -1;
            },
            // 功能按钮点击事件
            actionClick(type, data) {
                const eventClick = {
                    // 暂停
                    BPM_PROCESS_INSTANCE_SUSPEND: this.processHang,
                    // 取消暂停
                    BPM_PROCESS_INSTANCE_CANCEL_SUSPENSION: this.processActivation,
                    // 流程图
                    BPM_PROCESS_INSTANCE_FLOW_DIAGRAM: this.viewFlowChart,
                    // 修改处理人
                    BPM_PROCESS_INSTANCE_MODIFICATION_HANDLER: this.changeHandler,
                    // 终止
                    BPM_PROCESS_INSTANCE_TERMINATE: this.terminate,
                    // 修正
                    BPM_PROCESS_INSTANCE_AMENDMENT: this.correction,
                    // 查看任务
                    BPM_PROCESS_INSTANCE_VIEW_TASK: this.viewTask
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_PROCESS_INSTANCE_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('processInstance')
                };
            },
            // 查看处理记录
            viewProcessLog(row) {
                let { value: processInstanceOId } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('processInstance')}#oid` }) ||
                    {};
                return this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                    query: {
                        taskDefKey: '',
                        taskOId: ''
                    }
                });
            },
            // 获取参与者配置
            getParticipantConf(processInstanceOid) {
                return this.$famHttp({
                    url: `/bpm/procinst/participant/${processInstanceOid}`,
                    method: 'GET'
                });
            },
            // 修改处理人
            changeHandler(row) {
                this.changeHandlerForm.oid = row.oid || '';
                this.getParticipantConf(row.oid).then(async (resp) => {
                    let { success, data = {} } = resp || {};
                    if (success) {
                        let { memberList, userRoleMap = {}, reviewItemList = [] } = data || {};
                        const handlerConfiguration = _.reduce(memberList, (prev, item) => {
                            const { actDefId, nodeName } = item;
                            const prevLength = prev.length;
                            let isCreate = true;
                            for (let i = 0; i < prevLength; i++) {
                                if (prev[i].nodeKey === actDefId) {
                                    prev[i].tableData.push(item);
                                    isCreate = false;
                                    break;
                                }
                            }
                            if (isCreate) {
                                prev.push({
                                    nodeName,
                                    nodeKey: actDefId,
                                    tableData: [item]
                                });
                            }
                            return prev;
                        }, []);
                        this.$set(this.changeHandlerForm, 'handlerConfiguration', handlerConfiguration);
                        this.$set(this.changeHandlerForm, 'userRoleMap', userRoleMap);
                        this.changeHandlerForm.holderRef = reviewItemList[0] || '';
                        if (this.changeHandlerForm.holderRef) {
                            this.getContainerData(this.changeHandlerForm.holderRef);
                        } else {
                            this.popover({
                                field: 'changeHandlerForm',
                                title: this.i18n.changeHandler, // 更改处理人
                                visible: true
                            });
                        }
                    }
                });
            },
            // 获取上下文
            getContainerData(holderRef) {
                const split = holderRef.split(':');
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: split[1],
                        oid: holderRef
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.changeHandlerForm.containerRef = resp.data?.rawData?.containerRef?.oid;
                        }
                    })
                    .finally(() => {
                        this.popover({
                            field: 'changeHandlerForm',
                            title: this.i18n.changeHandler, // 更改处理人
                            visible: true
                        });
                    });
            },
            // 确定修改处理人
            changeHandlerClick() {
                let { validate, getHandlerConf } = this.$refs?.changeHandlerForm || {};
                validate().then((resp) => {
                    let { valid, data: memberList, message } = resp || {},
                        data = {};
                    if (!valid) {
                        return this.$message.error(message || this.i18n.handlerNotInvalid); // 处理人配置不合法
                    }
                    data.processInstanceRef = this.changeHandlerForm.oid || '';
                    data.memberList = memberList;

                    this.changeHandlerApi(data)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(this.i18n.changeHandlerSuccess); // 更改处理人成功
                                this.popover({ field: 'changeHandlerForm' });
                                this.refreshTable();
                            }
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            },
            // 修改处理人接口
            changeHandlerApi(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/procinst/changeInstanceCandidateUser',
                    data,
                    method: 'POST'
                });
            },
            // 查看任务
            viewTask(row) {
                let { oid: processInstanceId } = row || {};
                this.viewTaskForm.processInstanceId = processInstanceId;
                this.popover({ field: 'viewTaskForm', title: this.i18n.viewTask, visible: true }); // 查看任务
            },
            // 修正
            correction() {},
            // 终止
            terminate(row) {
                let { oid: processInstanceOid } = row || {};
                this.terminateForm.processInstanceOid = processInstanceOid;
                this.popover({ field: 'terminateForm', title: '终止', visible: true });
            },
            // 确定终止
            terminateClick() {
                let { terminateForm } = this.$refs || {};
                let { submit } = terminateForm || {};
                submit().then((resp) => {
                    let { valid, data: formData } = resp || {},
                        data = new FormData();
                    if (valid) {
                        formData = { ...formData, processInstanceOid: this.terminateForm.processInstanceOid };
                        _.each(formData, (value, key) => {
                            data.append(key, value);
                        });
                        this.loading = true;
                        this.$famHttp({
                            url: '/bpm/task/stopTask',
                            data,
                            method: 'POST',
                            headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                        })
                            .then(() => {
                                this.$message.success(this.i18n.terminationSuccess); // 终止成功
                                this.refreshTable();
                                this.popover({ field: 'terminateForm' });
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            },
            // 获取流程类型
            getProcessTypeList() {
                this.$famHttp({
                    url: '/bpm/listAllTree',
                    appName: 'ALL',
                    params: {
                        className: this.$store.getters.className('processCategory')
                    }
                }).then(async (resp) => {
                    let { data = [], success } = resp || {};
                    if (success) {
                        this.listData = this.formattedProcessType(data, { parentRef: '-1' }) || [];
                        this.viewTableTitle = this.listData[0]?.displayName;
                    }
                });
            },
            // 初始化流程类型
            initProcessType(item, params) {
                if (params.parentRef && params.parentRef.indexOf('Application:') > -1) {
                    params.parentRef = `OR:` + this.$store.getters.className('processCategory') + ':-1';
                }
                let {
                    id = '',
                    icon,
                    idKey,
                    childList = [],
                    displayName = '',
                    oid = '',
                    isEdit = false,
                    sortOrder = 0,
                    appName
                } = item || {};
                childList.length &&
                    (childList = this.formattedProcessType(childList, {
                        parentRef: item.oid,
                        appName: appName || params.appName
                    }));
                return {
                    id: id || '',
                    parentRef: params.parentRef || '',
                    icon,
                    idKey,
                    oid,
                    childList,
                    displayName,
                    isEdit,
                    displayNameCopy: displayName,
                    sortOrder,
                    appName: appName || params.appName || ''
                };
            },
            // 格式化流程类型
            formattedProcessType(data, params) {
                return _.map(data, (item) => this.initProcessType(item, params));
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 树节点点击回调
            handleNodeClick(data) {
                this.viewTableTitle = data.displayName;
                this.oid = data.oid.indexOf('Application') === -1 ? data.oid : this.oid;
            },
            // 查看流程图
            viewFlowChart(row) {
                let processDefName =
                    row[`${this.$store.getters.className('processInstance')}#processDefRef`] || this.i18n.flowDiagram; // 流程图解
                this.bpmFlowchart.title = processDefName;
                let { oid: processDefinitionId } = row || {};
                this.bpmFlowchart.processDefinitionId = processDefinitionId;
                this.bpmFlowchart.processInstanceId = processDefinitionId;
                this.popover({ field: 'bpmFlowchart', title: processDefName, visible: true });
            },
            // 暂停
            processHang(row) {
                let { oid: processInstanceId } = row || {};
                this.loading = true;
                this.$famHttp({
                    url: `/bpm/procinst/${processInstanceId}/suspend`,
                    method: 'GET'
                })
                    .then((resp) => {
                        this.$message[resp.success ? 'success' : 'error'](
                            this.i18n[resp.success ? 'processPauseSuccess' : 'processPauseFail']
                        );
                        this.refreshTable();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 取消暂停
            processActivation(row) {
                let { oid: processInstanceId } = row || {};
                this.loading = true;
                this.$famHttp({
                    url: `/bpm/procinst/${processInstanceId}/activate`,
                    method: 'GET'
                })
                    .then((resp) => {
                        this.$message[resp.success ? 'success' : 'error'](
                            this.i18n[resp.success ? 'processActivationSuccess' : 'processActivationFail']
                        );
                        this.refreshTable();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            viewTaskFormVisible(visible) {
                this.viewTaskForm.visible = visible;
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            }
        }
    };
});
