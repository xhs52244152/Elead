define([
    'text!' + ELMP.resource('bpm-resource/components/BpmProcessDetails/template.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmProcessDetails/index.css'),
    'erdcloud.kit',
    'underscore'
], function(template) {
    const ErdcloudKit = require('erdcloud.kit');
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'BpmProcessDetails',
        template,
        components: {
            FamAnchorNavigation: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamAnchorNavigation/index.js')
            ),
            BpmFlowchart: ErdcloudKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            FamActionPulldown: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BpmHandlerDialog: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmHandlerDialog/index.js')
            ),
            BpmProcessBasicInfo: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessBasicInfo/index.js')
            ),
            BpmKeyVariable: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmKeyVariable/index.js')
            ),
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js')),
            BpmParticipantChange: ErdcKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmParticipantChange/index.js')
            ),
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            BpmProcessVariables: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessVariables/index.js')
            ),
            BpmProcessPartial: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessPartial/index.js')
            ),
            BpmProcessHandler: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessHandler/index.js')
            ),
            BpmProcessAttachment: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessAttachment/index.js')
            ),
            BpmProcessRecord: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessRecord/index.js')
            ),
            BpmProcessApproval: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessApproval/index.js')
            ),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            // 流程实例标识
            processInstanceOId: {
                type: String,
                default: ''
            },
            // 节点标识
            taskDefKey: {
                type: String,
                default: ''
            },
            // 任务标识
            taskOId: {
                type: String,
                default: ''
            },
            height: {
                type: Number,
                default: ''
            },
            // 当前节点名称
            currentNodeName: {
                type: String,
                default: ''
            },
            // 是否只读
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmProcessDetails/locale/index.js'),
                // 流程详情
                processInfos: {},
                // 任务详情
                taskInfos: {},
                // 人员信息
                userInfo: [],
                // 业务对象
                processPartial: null,
                customSubmitInterfaceInfo: {},
                // 处理人数据
                handlerConfiguration: [],
                // 审批人数据
                processRoleConfig: [],
                // 人员回显信息
                userRoleMap: {},
                // 下一节点
                nextKey: [],
                // 附件
                processAttachments: [],
                // 历史记录
                processRecord: [],
                // 流程处理
                processApproval: {},
                // 流程变量
                globalVariables: [],
                // 节点变量
                localVariables: [],
                // 上下文
                innerContainerRef: '',
                // Tabs
                activeName: 'processHandler',
                // 流程图
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                },
                // 处理流程功能
                handlerData: {
                    visible: false,
                    handlerType: ''
                },
                // 加减签
                changeHandlerData: {
                    visible: false,
                    title: '',
                    addSignFlag: 0,
                    subSignFlag: false
                },
                detailsBodyHeight: '100%',
                // 加载中
                loading: false,
                bpmProcessHandlerLoading: true,
                pboData: null,
                urgDisabled: false,
                // 是否显示处理人配置
                isShowHandlerConfiguration: true,
                bpmProcessHandlerData: [],
                // 基本信息加载
                basicInfoLoading: true,
                // 是否密级
                isSecret: false,
                customUploadBtnMounted: false
            };
        },
        computed: {
            // 处理流程内容
            activatorContent() {
                return [
                    this.processBasicInfo.processPoint
                        ? {
                            name: this.i18n.processPoint, // 流程指引
                            fileId: 'processPoint',
                            unfold: true,
                            isTopTransitionTab: true,
                            slotContent: 'processPoint'
                        }
                        : null,
                    {
                        name: this.i18n.basicInfo, // 基本信息
                        fileId: 'bpmProcessBasicInfo',
                        unfold: true,
                        isTopTransitionTab: true,
                        slotContent: 'bpmProcessBasicInfo',
                        customComponent: !!this.bpmProcessPanel?.bpmProcessBasicInfo
                    },
                    this.globalVariables?.length
                        ? {
                            name: this.i18n.globalVariable, // 流程属性
                            fileId: 'globalVariable',
                            unfold: true,
                            isTopTransitionTab: true,
                            slotContent: 'globalVariable'
                        }
                        : null,
                    this.localVariables?.length
                        ? {
                            name: this.i18n.localVariable, // 节点属性
                            fileId: 'localVariable',
                            unfold: true,
                            isTopTransitionTab: true,
                            slotContent: 'localVariable'
                        }
                        : null,
                    this.partialUrl
                        ? {
                            name: this.i18n.businessObject, // 业务对象
                            fileId: 'bpmProcessPartial',
                            unfold: true,
                            isTopTransitionTab: true,
                            slotContent: 'bpmProcessPartial',
                            isHide: !this.partialUrl,
                            customComponent: true
                        }
                        : null,
                    {
                        name: this.i18n.attachment, // 附件
                        fileId: 'bpmProcessAttachment',
                        unfold: true,
                        isTopTransitionTab: true,
                        slotContent: 'attachment',
                        slotHeaderRight: 'attachmentHeaderRight'
                    },
                    this.loading
                        ? null
                        : {
                            name: this.i18n.processing, // 流程处理
                            fileId: 'bpmProcessApproval',
                            unfold: true,
                            isTopTransitionTab: true,
                            slotContent: 'bpmProcessApproval',
                            hasTop: true
                        }
                ].filter((i) => i);
            },
            partialUrl() {
                if (!this.processPartial) {
                    return null;
                }
                if (this.processPartial?.type === 2) {
                    return 'biz-bpm/LayoutForm/index.js';
                }

                const layoutRef = this.processPartial?.layoutRef ? `${this.processPartial.layoutRef}/index.js` : '';
                const { processDefinitionKey } = this.processInfos || {};
                const { taskDefinitionKey } = this.taskInfos || {};
                return (
                    layoutRef ||
                    this.$store.getters['bpmPartial/getResourceUrl']({
                        processDefinitionKey,
                        activityId: taskDefinitionKey
                    })
                );
            },
            // 是否详情
            isDetail() {
                return !!(
                    this.processInfos.processStatusEnum !== 'LIFECYCLE_RUNNING' ||
                    this.taskInfos.taskTypeEnum === 'informed' ||
                    this.taskInfos.assignee !== this.$store.state?.app?.user?.id ||
                    !this.taskInfos.isCandidateUser ||
                    this.readonly
                );
            },
            isRollBack() {
                return this.taskInfos.isRollBack;
            },
            // 是否加签减签
            isParticipantChange() {
                const { addSignFlag, subSignFlag } = this.taskInfos;
                return !this.isDetail && !!(addSignFlag || subSignFlag);
            },
            // 人员是否可加减签
            userStatus() {
                let list = {};
                _.each(this.taskInfos.workitemDtos, (item) => {
                    const { key, id } = item.completedByRef;
                    list[`OR:${key}:${id}`] = item.status === 'LIFECYCLE_RUNNING';
                });
                return list;
            },
            // 获取功能按钮配置参数
            getActionConfig() {
                return this.taskOId
                    ? {
                        name: 'BPM_TASK_DETAIL_MORE',
                        objectOid: this.taskOId,
                        className: this.$store.getters.className('workItem')
                    }
                    : {
                        name: 'BPM_TASK_DETAIL_MORE',
                        objectOid: this.processInstanceOId,
                        className: this.$store.getters.className('processInstance')
                    };
            },
            // 基本信息
            basicInfos() {
                return [
                    {
                        field: 'currentNode',
                        name: this.i18n.processNode, // 当前节点
                        icon: 'current-node',
                        value: () => {
                            return this.taskInfos.name || this.currentNodeName || '--';
                        }
                    },
                    {
                        field: 'processStatus',
                        name: this.i18n.processStatus, // 流程状态
                        icon: 'process-state',
                        color: () => {
                            const status = {
                                LIFECYCLE_RUNNING: '#00A854',
                                LIFECYCLE_COMPLETED: '#141C28',
                                LIFECYCLE_SUSPENDED: '#FA8C16',
                                LIFECYCLE_EXCEPTION: '#F04134',
                                LIFECYCLE_UNFINISHED: '#89919F'
                            };
                            return status[this.processInfos.processStatusEnum] || '';
                        },
                        value: () => {
                            return this.processInfos.processStatus || '--';
                        }
                    },
                    {
                        field: 'currentUser',
                        name: this.i18n.currentProcessor, // 当前处理人
                        type: 'user',
                        icon: 'current-processor',
                        value: () => {
                            const { workitemDtos, userRoleMap, assignee } = this.taskInfos;
                            workitemDtos && this.moveValueToFront(workitemDtos, assignee);
                            let list = [];
                            _.each(workitemDtos, (item) => {
                                const { key, id } = item.completedByRef;
                                list.push({ ...item, ...userRoleMap[`OR:${key}:${id}`] });
                            });
                            return list;
                        }
                    },
                    {
                        field: 'processCode',
                        name: this.i18n.processCode, // 流程编码
                        icon: 'process-coding',
                        value: () => {
                            return this.processInfos.processNumber || '--';
                        }
                    },
                    {
                        field: 'dueDate',
                        name: this.i18n.dueDate, // 到期日期
                        icon: 'due-date',
                        value: () => {
                            return (this.taskInfos.dueDate || '--').split(' ')[0];
                        }
                    }
                ];
            },
            processBasicInfo() {
                const nodeInfo = _.find(this.taskInfos.nodeDefinition, (node) => node.nodeKey === this.activityId);
                return {
                    ...this.processInfos,
                    processPoint: nodeInfo?.processPoint || ''
                };
            },
            pboOid() {
                return this.$route?.params?.pboOid || this.processInfos?.pboOId || '';
            },
            // 动态配置流程页面
            bpmProcessPanel() {
                return this.$store.getters['bpmProcessPanel/getProcessPanelResource']({
                    processStep: 'activator',
                    processDefinitionKey: this.processInfos.processDefinitionKey,
                    activityId: this.activityId
                });
            },
            detailHeight() {
                return this.isDetail ? this.height + 56 : this.height;
            },
            activityId() {
                return this.taskInfos.taskDefinitionKey || this.taskDefKey;
            },
            visitedRoutes() {
                return this.$store.getters['route/visitedRoutes'];
            },
            // 评审对象oid
            holderRef() {
                let reviewItemList = this.pboData?.businessForm?.reviewItemList || [],
                    oid = '';
                _.isArray(reviewItemList) && reviewItemList.length && (oid = reviewItemList[0]?.oid || '');
                return oid;
            },
            currTaskInfo() {
                return this.pboData?.currTaskInfo || {};
            },
            customformJson() {
                return this.currTaskInfo.baseSubmitTaskDto?.customformJson || '{}';
            },
            participantChange() {
                const data = _.find(this.handlerConfiguration, (item) => item.nodeKey === this.activityId);
                return data ? [data] : [];
            },
            securityLabel() {
                return this.processInfos.securityLabel;
            },
            isShowBpmProcessDetails() {
                const { hasSecurityLabel } = this.processInfos;
                return _.isBoolean(hasSecurityLabel) ? hasSecurityLabel : true;
            },
            processPointConfig() {
                return [
                    {
                        field: 'processPoint',
                        component: 'erd-input',
                        label: this.i18n.processPoint,
                        readonly: true,
                        col: 24
                    }
                ];
            },
            processPointData() {
                return {
                    processPoint: this.processBasicInfo.processPoint
                };
            }
        },
        watch: {
            processInstanceOId: {
                immediate: true,
                handler: function(n) {
                    n && !this.loading && this.obtainProcessDetails();
                }
            },
            taskOId: {
                immediate: true,
                handler: function(n) {
                    n && !this.loading && this.obtainProcessDetails();
                }
            },
            processInfos: {
                deep: true,
                handler: function(processInfos) {
                    this.$emit('update-node-map', processInfos?.nodeMap || {});
                    this.$emit('update-process-definition-key', processInfos?.processDefinitionKey || '');
                }
            },
            taskInfos: {
                deep: true,
                handler: function(taskInfos) {
                    this.isShowHandlerConfiguration = true;
                    const { taskDefKeyUsers = [], taskDefinitionKey = '' } = taskInfos || {};
                    this.$emit('update-task-defKey-users', taskDefKeyUsers);
                    this.$emit('update-activity-id', taskDefinitionKey);
                }
            },
            holderRef: {
                immediate: true,
                handler: function(nv) {
                    nv && this.getContainerData(nv);
                }
            }
        },
        mounted() {
            this.getSecretObjectConfigListByAppName();
            this.$famHttp({
                url: '/fam/menu/query',
                method: 'POST',
                data: this.getActionConfig
            }).then((resp) => {
                const {
                    data: { actionLinkDtos = [] }
                } = resp;
                const urg =
                    _.find(actionLinkDtos, (item) => item?.actionDto?.name === 'BPM_PROCESS_INSTANCE_URGE') || {};
                this.urgDisabled = !!urg?.actionDto?.enabled;
            });
            setTimeout(() => {
                const detailsHeaderHeight = this.$refs.detailsHeader.offsetHeight || 0;
                const detailsFooterHeight = this.$refs.detailsFooter.offsetHeight || 0;
                this.detailsBodyHeight = `calc(100% - ${detailsHeaderHeight + detailsFooterHeight}px)`;
            }, 300);
            this.checkUploadMounted();
        },
        methods: {
            checkUploadMounted(time) {
                time = time || 1;
                setTimeout(() => {
                    this.customUploadBtnMounted = this.isDetail || !!this.$refs.customUploadBtn;
                    if (!this.customUploadBtnMounted && time < 10) {
                        this.checkUploadMounted(time + 1);
                    }
                }, 200);
            },
            // 重置数据
            restData() {
                this.loading = true;
                // 折叠面板开关
                _.each(this.unfold, (value, key) => {
                    this.unfold[key] = true;
                });
                // 流程详情
                this.processInfos = {};
                // 任务详情
                this.taskInfos = {};
                // 人员信息
                this.userInfo = [];
                // 业务对象
                this.processPartial = {};
                this.customSubmitInterfaceInfo = {};
                // 处理人数据
                this.handlerConfiguration = [];
                // 审批人数据
                this.processRoleConfig = [];
                // 人员回显信息
                this.userRoleMap = {};
                // 附件
                this.processAttachments = [];
                // 历史记录
                this.processRecord = [];
                // 流程处理
                this.processApproval = {};
                // 流程变量
                this.globalVariables = [];
                // 节点变量
                this.localVariables = [];
                this.activeName = 'processHandler';
                // 加载中
                this.loading = false;
            },
            // 获取流程和任务详情
            obtainProcessDetails() {
                this.loading = true;
                this.getProcessDetail();
            },
            // 获取流程详情
            getProcessDetail() {
                this.$famHttp({
                    url: `/bpm/procinst/${this.processInstanceOId}/detail`,
                    method: 'GET'
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.processInfos = resp.data || {};
                            this.processAttachments = resp.data.attachments || [];
                            this.processRecord = resp.data.comments || [];
                            this.userInfo = resp.data.userDtos || [];
                            if (this.processInfos.hasSecurityLabel === false) {
                                this.$message.error(this.i18n.hasSecurityLabelTips);
                                this.$emit('has-security-label', false);
                            }
                        } else {
                            this.$message.error(resp.message);
                        }
                    })
                    .finally(() => {
                        this.getTaskDetail();
                    });
            },
            // 获取任务详情
            getTaskDetail(activity = null) {
                let taskDefKey = this.taskDefKey;
                if (this.processInfos.processStatusEnum === 'LIFECYCLE_COMPLETED' && !this.taskDefKey) {
                    const endEvent = _.find(this.processInfos?.nodeMap?.node?.activities, activity => activity.properties.type === 'endEvent');
                    taskDefKey = endEvent?.activityId || '';
                }
                this.$famHttp({
                    url: `/bpm/task/taskview`,
                    method: 'GET',
                    params:
                        !activity || activity.activityId === this.taskDefKey
                            ? {
                                processInstanceOId: this.processInstanceOId,
                                taskDefKey: taskDefKey,
                                taskOId: this.taskOId
                            }
                            : {
                                processInstanceOId: this.processInstanceOId,
                                taskDefKey: activity.activityId
                            }
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return this.$message.error(resp.message);
                        }
                        const {
                            taskVariables = {},
                            globalVariable,
                            localVariable,
                            taskDefinitionKey,
                            globalFormData,
                            localFormData,
                            nodeDefinition,
                            processRoleConfig,
                            userRoleMap
                        } = resp.data;
                        let componentContentJson = taskVariables;
                        this.globalVariables = _.map(globalVariable, (item) => ({
                            ...item,
                            componentContentJson: _.isObject(componentContentJson?.globalVariable)
                                ? { [item.variableKey]: componentContentJson.globalVariable[item.variableKey] }
                                : {}
                        }));
                        this.localVariables = _.map(localVariable, (item) => ({
                            ...item,
                            componentContentJson: _.isObject(componentContentJson[taskDefinitionKey])
                                ? {
                                    [item.variableKey]: componentContentJson[taskDefinitionKey][item.variableKey]
                                }
                                : {}
                        }));
                        this.processPartial = Object.assign({}, globalFormData?.[0], localFormData?.[0]);
                        this.taskInfos = {
                            ...(resp.data || {}),
                            globalFormData: globalFormData?.[0],
                            localFormData: localFormData?.[0],
                            processPartial: this.processPartial
                        };
                        this.customHandleInterface(this.processPartial);
                        this.handlerConfiguration = _.chain(nodeDefinition)
                            .filter((node) => node.localPrincipalConfig)
                            .map((node) => ({
                                nodeName: node.name,
                                nodeKey: node.nodeKey,
                                nodeType: node.nodeType,
                                tableData: node.localPrincipalConfig
                            }))
                            .value();
                        this.processRoleConfig = processRoleConfig;
                        this.userRoleMap = userRoleMap;
                    })
                    .finally(() => {
                        this.getPboDetail();
                    });
            },
            // 获取业务对象详情 PBO
            getPboDetail() {
                const className = this.$store.getters['bpmPartial/getResourceClassName']({
                    processDefinitionKey: this.processInfos.processDefinitionKey,
                    activityId: this.activityId
                });
                this.$famHttp({
                    url: `/bpm/workflow/findformdata/bypobandnodekey`,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: {
                        actionName: this.$store.getters.className('pbo'),
                        pboOid: this.processInfos.pboOId,
                        sessionId: this.taskDefKey,
                        processDefinitionId: this.processInfos.processDefinitionId,
                        taskId: this.taskOId,
                        executionId: this.processInstanceOId
                    },
                    className: className
                })
                    .then(({ success, message, data = {} }) => {
                        if (!success) {
                            return this.$message.error(message);
                        }
                        this.pboData = data;
                    })
                    .finally(() => {
                        if (this.pboData === null) {
                            this.pboData = {};
                        }
                        this.bpmProcessHandlerLoading = !!this.holderRef;
                        this.loading = false;
                    });
            },
            // 获取下一节点信息
            getNextKey(nextKey) {
                this.nextKey = nextKey;
            },
            // 获取上下文
            getContainerData(holderRef) {
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: holderRef.split(':')[1],
                        oid: holderRef
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            this.innerContainerRef = resp.data?.rawData?.containerRef?.oid || '';
                        }
                    })
                    .finally(() => {
                        this.bpmProcessHandlerLoading = false;
                    });
            },
            // 是否密级
            getSecretObjectConfigListByAppName() {
                this.$famHttp({
                    url: '/fam/access/getSecretObjectConfigListByAppName',
                    method: 'POST',
                    data: {
                        keyword: this.$store.getters.className('processInstance')
                    }
                })
                    .then(({ data }) => {
                        const { secretObjectConfigDtos = [] } = data?.[0] || {};
                        this.isSecret = !!secretObjectConfigDtos.length;
                    })
                    .finally(() => {
                        this.basicInfoLoading = false;
                    });
            },
            // 处理人配置是否显示
            showHandlerConfiguration(isShow) {
                if (!isShow) {
                    const { validate } = this.$refs?.bpmProcessHandler || {};
                    this.bpmProcessHandlerData = _.isFunction(validate) ? validate() : [];
                }
                this.activeName = isShow ? 'processHandler' : 'processRecord';
                this.isShowHandlerConfiguration = isShow;
            },
            // 自定义流程处理
            customHandleInterface(processPartial = {}) {
                if (processPartial.handleInterfaceMasterRefs?.length) {
                    this.$famHttp({
                        url: `bpm/interface/list`,
                        method: 'POST',
                        data: {
                            masterOidList: processPartial.handleInterfaceMasterRefs
                        }
                    }).then((resp) => {
                        this.customSubmitInterfaceInfo = resp?.data?.[0] || {};
                    });
                }
            },
            // 关闭当前页签
            closeCurrentTabPage(callback) {
                let route = this.$route;
                // 获取删除项的index
                let delItemIndex = 0;
                this.visitedRoutes.forEach((item, index) => {
                    if (item.fullPath === route.fullPath) {
                        delItemIndex = index;
                    }
                });

                this.$store.dispatch('route/delVisitedRoute', route).then((visitedRoutes) => {
                    // 删除后，高亮其右1页签，若右侧无页签，则高亮其左1页签
                    let preRoute = visitedRoutes.at(delItemIndex) ||
                        visitedRoutes.at(delItemIndex - 1) || { name: 'processTodo' };
                    let redirect = route.query.redirect;
                    if (redirect) {
                        this.$router.push(preRoute);
                        if (_.isString(redirect)) {
                            redirect = { path: redirect };
                        }
                        this.$router.push(redirect);
                    } else {
                        if (!route.params.pboOid) {
                            this.$router.push(preRoute);
                        }
                        _.isFunction(callback) && callback();
                    }
                });
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '' }) {
                if (!field) {
                    return;
                }
                this[field].title = title;
                this[field].visible = visible;
            },
            // 流程图
            viewFlowChart() {
                const { oid, processName } = this.processInfos;
                this.bpmFlowchart.processDefinitionId = oid;
                this.bpmFlowchart.processInstanceId = oid;
                let displayName = processName || this.i18n.flowDiagram;
                this.popover({ field: 'bpmFlowchart', title: displayName, visible: true });
            },
            // 加减签
            changeHandler() {
                const { addSignFlag, subSignFlag } = this.taskInfos;
                this.changeHandlerData.addSignFlag = addSignFlag;
                this.changeHandlerData.subSignFlag = subSignFlag;
                this.popover({ field: 'changeHandlerData', title: this.i18n.changeHandler, visible: true });
            },
            changeHandlerSubmit() {
                let { validate } = this.$refs?.bpmParticipantChange || {};
                validate().then((resp) => {
                    const { valid, data, message } = resp || {};
                    if (!valid) {
                        return this.$message.error(message);
                    }
                    this.loading = true;
                    const changeData = {};
                    changeData.processInstanceRef = this.processInfos.oid;
                    changeData.memberList = data.memberList;
                    changeData.remark = data.remark;
                    const { changeParticipantApi } = this.$refs.bpmParticipantChange;
                    changeParticipantApi(changeData)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success(resp.message);
                                this.popover({ field: 'changeHandlerData' });
                                this.loading = false;
                                this.obtainProcessDetails();
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            // 更多操作
            actionClick({ name }) {
                const eventClick = {
                    BPM_PROCESS_INSTANCE_URGE: this.processUrging, // 催办
                    BPM_TASK_TODO_DELEGATE: this.processDelegate, // 委派
                    BPM_PROCESS_INSTANCE_SUSPEND: this.processSuspend, // 暂停
                    BPM_PROCESS_INSTANCE_CANCEL_SUSPENSION: this.processCancelSuspend, // 取消暂停
                    BPM_PROCESS_INSTANCE_TERMINATE: this.processTerminate // 终止
                };
                eventClick[name] && eventClick[name]();
            },
            processUrging(user) {
                this.handlerData = {
                    visible: true,
                    handlerType: 'urging',
                    processInstanceOid: this.processInstanceOId,
                    userOids: user?.oid ? [user.oid] : null
                };
            },
            processDelegate() {
                this.handlerData = {
                    visible: true,
                    handlerType: 'delegate',
                    taskOId: [this.taskOId]
                };
            },
            processSuspend() {
                this.handlerData = {
                    visible: true,
                    handlerType: 'suspend',
                    processInstanceOid: this.processInstanceOId,
                    taskId: this.taskInfos?.assignedTaskId,
                    dialogConfig: {
                        width: '400px'
                    }
                };
            },
            processCancelSuspend() {
                this.handlerData = {
                    visible: true,
                    handlerType: 'cancelSuspend',
                    processInstanceOid: this.processInstanceOId,
                    taskId: this.taskInfos?.assignedTaskId,
                    dialogConfig: {
                        width: '400px'
                    }
                };
            },
            processTerminate() {
                this.handlerData = {
                    visible: true,
                    handlerType: 'terminate',
                    processInstanceOid: this.processInstanceOId
                };
            },
            processWithdraw() {
                this.handlerData = {
                    visible: true,
                    handlerType: 'withdraw',
                    taskOId: this.taskOId
                };
            },
            isUrging(user) {
                return this.urgDisabled && user.oid !== this.$store.state.app.user.oid;
            },
            // 数据组装
            async assembling() {
                let valid = true;
                let data = {
                    baseForm: {
                        businessForm: {
                            reviewItemList: []
                        },
                        businessFormJsonStr: '{"reviewItemList":[]}'
                    },
                    baseSubmitTaskDto: {}
                };
                let message = [];

                // 流程实例标识、任务标识
                const { engineProcessId, oid, pboOId } = this.processInfos;
                data.engineProcessId = engineProcessId;
                data.processInstanceRef = oid;
                data.baseSubmitTaskDto.taskId = this.taskInfos.id;
                data.pboOid = pboOId;

                const {
                    localVariable,
                    bpmProcessPartial,
                    bpmProcessAttachment,
                    bpmProcessApproval,
                    bpmProcessHandler
                } = this.$refs;

                // 流程变量
                if (this.localVariables.length) {
                    await localVariable.validate().then((resp) => {
                        if (resp.valid) {
                            data.baseSubmitTaskDto.taskVariables = localVariable.getData();
                            let globalMapping = {};
                            _.each(this.localVariables, (item) => {
                                if (item.refVariableId) {
                                    globalMapping[item.refVariableId] =
                                        data.baseSubmitTaskDto.taskVariables?.[item.variableKey];
                                }
                            });
                            data.baseForm.processBasicInfo = {
                                procInstVariables: globalMapping
                            };
                        } else {
                            valid = resp.valid;
                            message.push(this.i18n.nodeVariableFailed); // 节点变量校验未通过
                        }
                    });
                }

                // 业务对象
                if (this.partialUrl) {
                    const result = await bpmProcessPartial.validate(data);
                    if (result.valid) {
                        data.baseSubmitTaskDto.customformJson = result.data;
                    } else {
                        valid = false;
                        if (result.message) {
                            if (Array.isArray(result.message)) {
                                message = message.concat(result.message);
                            } else {
                                message.push(result.message);
                            }
                        }
                    }
                } else {
                    data.baseSubmitTaskDto.customformJson = '{}';
                }

                // 附件
                let attachment = await bpmProcessAttachment.getData();
                data.baseSubmitTaskDto.uploadFileIds = attachment.uploadFileIds;
                data.baseSubmitTaskDto.deleteFileIds = attachment.deleteFileIds;

                // 流程处理
                let approval = await bpmProcessApproval.validate();
                if (approval.valid) {
                    const {
                        router,
                        opinion,
                        informedUser,
                        skipNodeKey,
                        skipNodeUser,
                        sessionId,
                        sessionName,
                        nextSessionId
                    } = approval.data || {};
                    data.baseSubmitTaskDto = {
                        ...data.baseSubmitTaskDto,
                        routeFlag: router,
                        comment: opinion,
                        informedUser,
                        skipNodeKey,
                        skipNodeUser,
                        sessionId,
                        sessionName,
                        nextSessionId
                    };
                } else {
                    valid = approval.valid;
                    message.push(approval.message);
                }

                // 处理人配置
                let handler = bpmProcessHandler ? bpmProcessHandler.validate() : this.bpmProcessHandlerData;
                if (handler.valid) {
                    data.baseSubmitTaskDto.nextSessionUser = { members: handler.data };
                } else {
                    valid = false;
                    message.push(handler.message);
                }

                let preSendData = data;
                if (bpmProcessPartial) {
                    preSendData = await bpmProcessPartial.beforeSubmit({
                        key: 'activator',
                        data,
                        valid: valid,
                        message: message
                    });
                }

                const finalData = await this.$store.getters['bpmProcessPanel/getProcessBeforeSubmit']({
                    key: 'activator',
                    data: preSendData,
                    valid: valid,
                    message: message
                });

                return new Promise((resolve, reject) => {
                    if (valid) {
                        resolve(finalData);
                    } else {
                        reject(_.flatten(message));
                    }
                });
            },
            // 审批流程
            submit() {
                this.assembling().then(
                    (data) => {
                        const loading = this.$loading();
                        let resp;
                        this.submitInterface(data)
                            .then((response) => {
                                resp = response;
                                if (this.$refs.bpmProcessPartial) {
                                    return Promise.resolve(
                                        this.$refs.bpmProcessPartial.afterSubmitted({
                                            key: 'launcher',
                                            submitData: data,
                                            response: resp
                                        })
                                    );
                                }
                                return Promise.resolve(resp);
                            })
                            .then(() => {
                                if (!resp.success) {
                                    return this.$message.error(resp.message);
                                }
                                this.$message.success({
                                    message: resp.message,
                                    onClose: () => {
                                        this.successCallback();
                                    }
                                });
                            })
                            .finally(() => {
                                loading.close();
                            });
                    },
                    (error) => {
                        _.each(error, (message) => {
                            setTimeout(() => {
                                this.$message.error(message);
                            }, 0);
                        });
                    }
                );
            },
            submitInterface(data) {
                let customData = {};
                try {
                    if (this.customSubmitInterfaceInfo?.params) {
                        customData = JSON.parse(this.customSubmitInterfaceInfo.params) || {};
                    }
                } catch (e) {
                    // do noting
                }
                const className = this.$store.getters['bpmPartial/getResourceClassName']({
                    processDefinitionKey: this.processInfos.processDefinitionKey,
                    activityId: this.activityId
                });
                const headers = this.$store.getters['bpmPartial/getResourceInterfaceHeaders']({
                    processDefinitionKey: this.processInfos.processDefinitionKey,
                    activityId: this.activityId
                });
                return this.$famHttp({
                    url:
                        this.customSubmitInterfaceInfo?.rpcInterface ||
                        '/bpm/workflow/submit/process/submitActivityTask',
                    method: this.customSubmitInterfaceInfo?.requestMethod || 'POST',
                    headers: {
                        ...headers
                    },
                    className: className,
                    data: _.extend({}, data, customData)
                });
            },
            // 附件上传下载
            attachmentUpLoad() {
                this.$refs.bpmProcessAttachment.onClick();
            },
            // 返回上一级
            goBack() {
                const callback = this.$store.getters['bpmProcessPanel/getCallback']({
                    type: 'goBack',
                    key: 'activator'
                });
                if (_.isFunction(callback)) {
                    callback();
                } else {
                    this.$router.go(-1);
                }
            },
            successCallback() {
                const callback = this.$store.getters['bpmProcessPanel/getCallback']({
                    type: 'successCallback',
                    key: 'activator'
                });
                if (_.isFunction(callback)) {
                    callback();
                } else {
                    this.closeCurrentTabPage(() => {
                        ErdcKit.open('/biz-bpm/process/todos', {
                            appName: 'erdc-portal-web',
                            query: {
                                isRefresh: new Date().getTime().toString()
                            }
                        });
                    });
                }
            },
            // 目标对象前置
            moveValueToFront(arr, value) {
                const arrLength = arr?.length || 0;
                let index = -1;
                for (let i = 0; i < arrLength; i++) {
                    if (arr[i]?.completedByRef?.id === value) {
                        index = i;
                        break;
                    }
                }
                if (index > -1) {
                    const [el] = arr.splice(index, 1);
                    arr.unshift(el);
                }
                return arr;
            }
        }
    };
});
