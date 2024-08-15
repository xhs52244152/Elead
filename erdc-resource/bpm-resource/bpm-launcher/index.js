define([
    'text!' + ELMP.func('bpm-resource/bpm-launcher/template.html'),
    'css!' + ELMP.func('bpm-resource/bpm-launcher/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcloudKit = require('erdcloud.kit');
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');
    const PRIORITY = '50';

    return {
        name: 'WorkflowLauncher',
        template,
        components: {
            BpmProcessNavigation: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessNavigation/index.js')
            ),
            BpmFlowchart: ErdcloudKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js')),
            FamAnchorNavigation: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamAnchorNavigation/index.js')
            ),
            BpmProcessBasicInfo: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessBasicInfo/index.js')
            ),
            BpmLauncherParticipant: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmLauncherParticipant/index.js')
            ),
            FamParticipantSelect: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            BpmProcessPartial: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessPartial/index.js')
            ),
            BpmProcessAttachment: ErdcloudKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessAttachment/index.js')
            ),
            BpmProcessVariables: ErdcloudKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessVariables/index.js')
            ),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.func('bpm-resource/bpm-launcher/locale/index.js'),
                // 地址栏获取 params 的数据字段: 流程定义Key
                params: {},
                // 地址栏获取 query 的数据字段: 流程定义Oid、流程分类、流程草稿pboOid、路由跳转类型、上下文
                query: {},
                // 基本信息
                basicInfos: {
                    processName: '',
                    description: ''
                },
                // 处理人配置
                handlerConfiguration: [],
                // 审批人配置
                processRoleConfig: [],
                // 草稿数据
                pboData: {
                    baseForm: {
                        processBasicInfo: {},
                        businessForm: {
                            reviewItemList: []
                        },
                        businessFormJsonStr: '{"reviewItemList":[]}'
                    },
                    baseStartProcessDto: {}
                },
                draftInfos: {},
                // 流程导航折叠
                collapsed: false,
                // 折叠面板是否显示
                isShowBpmLauncherParticipant: true,
                // 流程定义信息
                processDefinition: {},
                // 节点定义信息
                nodeDefinition: [],
                // 设计器xml
                userTaskActivities: {},
                // 所有人员信息
                userRoleMap: {},
                // 全局流程变量
                globalVariable: [],
                // 全局表单布局
                globalFormData: {},
                // 业务对象表单数据
                customFormJson: '{}',
                // 自定义启动接口信息
                customStartInterfaceInfo: {},
                // 附件数据
                attachments: [],
                // 加载中
                loading: false,
                // 上下文
                innerContainerRef: '',
                // 流程图
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: ''
                },
                // 参与者配置加载
                launcherParticipantLoading: true,
                // 默认流程模板面板配置
                defaultProcessPanel: null,
                // 是否缓存
                isActivated: false,
                // 知会人配置
                informForm: {
                    informParticipant: []
                },
                // 开始节点
                startActivity: [],
                launchSubmitLoading: false,
                // 基本信息加载
                basicInfoLoading: false,
                // 是否密级
                isSecret: false,
                isProcessSecurityReadonly: false,
                customUploadBtnMounted: false
            };
        },
        computed: {
            // 发起流程内容
            launcherContent() {
                return [
                    {
                        name: this.i18n.basicInfo, // 基本信息
                        fileId: 'bpmProcessBasicInfo',
                        unfold: true,
                        isTopTransitionTab: true,
                        slotContent: 'bpmProcessBasicInfo',
                        customComponent: !!this.bpmProcessPanel?.bpmProcessBasicInfo
                    },
                    this.partialUrl
                        ? {
                              name: this.i18n.businessObject, // 业务对象
                              fileId: 'bpmProcessPartial',
                              unfold: true,
                              isTopTransitionTab: true,
                              slotContent: 'bpmProcessPartial',
                              customComponent: true
                          }
                        : null,
                    {
                        name: this.i18n.approverConfiguration, // 处理人配置
                        fileId: 'bpmLauncherParticipant',
                        unfold: true,
                        isTopTransitionTab: true,
                        slotContent: 'bpmLauncherParticipant',
                        isHide: !this.isShowBpmLauncherParticipant
                    },
                    {
                        name: this.i18n.informantConfiguration, // 知会人配置
                        fileId: 'bpmProcessInformant',
                        unfold: true,
                        isTopTransitionTab: true,
                        slotContent: 'inform'
                    },
                    {
                        name: this.i18n.attachment, // 附件
                        fileId: 'bpmProcessAttachment',
                        unfold: true,
                        isTopTransitionTab: true,
                        slotContent: 'attachment',
                        slotHeaderRight: 'attachmentHeaderRight'
                    }
                ].filter((i) => i);
            },
            // 发起流程大小切换
            collapsedStyle() {
                return {
                    width: this.collapsed ? 'calc(100% - 64px)' : 'calc(100% - 224px)'
                };
            },
            // 动态配置流程页面
            bpmProcessPanel() {
                return this.$store.getters['bpmProcessPanel/getProcessPanelResource']({
                    processStep: 'launcher',
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: this.startEventActivityId
                });
            },
            // 模板配置业务对象、代码注册业务对象
            partialUrl() {
                if (this.globalFormData?.type === 2) {
                    return 'biz-bpm/LayoutForm/index.js';
                }
                let layoutRef = this.globalFormData?.layoutRef ? `${this.globalFormData.layoutRef}/index.js` : '';
                return (
                    layoutRef ||
                    this.$store.getters['bpmPartial/getResourceUrl']({
                        processDefinitionKey: this.processDefinitionKey,
                        activityId: this.startEventActivityId
                    })
                );
            },
            // 节点列表
            activities() {
                let { activities = [] } = this.userTaskActivities;
                return activities;
            },
            // 用户节点列表
            userTaskList() {
                let userTaskList = [];
                userTaskList = _.chain(this.activities)
                    .filter((item) => item.properties.type === 'userTask')
                    .sortBy((item) => +item.properties.serialnumber)
                    .map((item) => item.activityId)
                    .compact()
                    .value();
                return userTaskList;
            },
            // 流程标识
            processDefinitionKey() {
                return this.processDefinition?.key || this.params.engineModelKey;
            },
            // 当前流程状态： 发起、草稿、处理
            processStatus() {
                return this.params.pboOid ? 'draft' : 'launcher';
            },
            // 开始节点Id
            startEventActivityId() {
                let [startEvent = {}] = _.filter(this.activities, (item) => item.properties.type === 'startEvent');
                let { activityId = '' } = startEvent;
                return activityId;
            },
            // 评审对象oid
            holderRef() {
                let reviewItemList = this.pboData?.baseForm?.businessForm?.reviewItemList || [],
                    oid = '';
                _.isArray(reviewItemList) && reviewItemList.length && (oid = reviewItemList[0]?.oid || '');
                return this.query.holderRef || oid || '';
            },
            // 上下文oid
            containerRef() {
                return this?.query?.containerRef || this.innerContainerRef || '';
            },
            visitedRoutes() {
                return this.$store.getters['route/visitedRoutes'];
            },
            // 是否初始化launcher缓存
            canInitLauncherStore() {
                return this.processDefinitionKey && this.isActivated;
            },
            // 知会人配置
            informFormConfigs() {
                return [
                    {
                        field: 'informParticipant',
                        label: this.i18n.inform, // 知会
                        component: 'FamParticipantSelect',
                        props: {
                            multiple: true,
                            isFetchValue: true,
                            showType: ['USER'],
                            queryMode: ['FUZZYSEARCH'],
                            queryScope: 'fullTenant',
                            appName: this.query?.appName,
                            filterSecurityLabel: this.isSecret,
                            securityLabel: this.securityLabel
                        },
                        col: 24
                    }
                ];
            },
            // 密级
            securityLabel() {
                return this.basicInfos.securityLabel;
            },
            taskInfos() {
                return {
                    globalFormData: this.globalFormData,
                    localFormData: {},
                    globalVariable: this.globalVariable,
                    localVariable: [],
                    processPartial: this.globalFormData
                };
            }
        },
        created() {
            const { params, query } = this.$route || { params: {}, query: {} };
            this.params = params;
            this.query = query;
            this.obtainProcessDetails();
            this.getSecretObjectConfigListByAppName();
        },
        activated() {
            this.isActivated = new Date().getTime();
        },
        watch: {
            holderRef: {
                handler: function (nv) {
                    nv && this.getContainerData(nv);
                },
                immediate: true
            },
            canInitLauncherStore: {
                handler: function (nv) {
                    nv && this.initLauncherStore();
                },
                immediate: true
            },
            securityLabel: {
                handler(val) {
                    this.$set(this.informForm, 'securityLabel', val);
                }
            }
        },
        mounted() {
            this.checkUploadMounted();
        },
        beforeDestroy() {
            let eventObject = this?.$store?.getters?.['bpmProcessPanel/getEventObject'] || {};
            if (!_.isEmpty(eventObject) && eventObject?.[`${this.processDefinitionKey}_${this.processStatus}`]) {
                eventObject[`${this.processDefinitionKey}_${this.processStatus}`] = undefined;
                this.$store.dispatch('bpmProcessPanel/setEventObjectAction', eventObject);
            }
        },
        methods: {
            checkUploadMounted(time) {
                time = time || 1;
                setTimeout(() => {
                    this.customUploadBtnMounted = !!this.$refs.customUploadBtn;
                    if (!this.customUploadBtnMounted && time < 10) {
                        this.checkUploadMounted(time + 1);
                    }
                }, 200);
            },
            // 初始化launcher缓存
            initLauncherStore() {
                this.$store.dispatch('bpmProcessPanel/setEventObjectAction', {
                    [`${this.processDefinitionKey}_${this.processStatus}`]: (callback) =>
                        _.isFunction(callback) && callback(this)
                });
            },
            // 获取流程详情
            obtainProcessDetails() {
                let asyncQueueList = [this.getProcessInformation()];
                this.params.pboOid && asyncQueueList.push(this.fetchDraftData());
                this.loading = true;
                Promise.all(asyncQueueList)
                    .then(async (resp) => {
                        let [processData, draftData] = resp || [];
                        if (_.isObject(processData) && processData.success) {
                            let { data = {} } = processData || {};
                            let {
                                processDefinition = {},
                                processRoleConfig = [],
                                nodeDefinition = [],
                                userTaskActivities = {},
                                globalFormData = [],
                                userRoleMap = {},
                                globalVariable = [],
                                firstUserTasks = []
                            } = data || {};

                            // 基本信息
                            let basicInfos = {
                                ...processDefinition,
                                securityLabel: 'PUBLIC',
                                description: processDefinition.description || processDefinition.name
                            };

                            if (this.params.pboOid && _.isObject(draftData) && draftData.success) {
                                ({ data = {} } = draftData || {});
                                let { userMap: draftUserRoleMap } = data;
                                let { baseForm = {}, baseStartProcessDto = {} } = data;
                                let { processBasicInfo = {} } = baseForm;
                                let { showUserJson, customformJson } = baseStartProcessDto;
                                let { attachments } = data;

                                // 草稿信息
                                this.draftInfos = data;

                                // 基本信息草稿回显
                                basicInfos = {
                                    ...processDefinition,
                                    ...processBasicInfo,
                                    processName: processBasicInfo.processName || processBasicInfo.pboName,
                                    priority: _.isNumber(processBasicInfo.priority)
                                        ? '' + processBasicInfo.priority
                                        : processBasicInfo.priority || PRIORITY
                                };

                                // 处理人配置草稿回显
                                try {
                                    showUserJson = JSON.parse(showUserJson);
                                } catch {
                                    showUserJson = [];
                                }
                                for (let i = 0; i < showUserJson.length; i++) {
                                    let item = showUserJson[i] || {};
                                    for (let j = 0; j < nodeDefinition.length; j++) {
                                        let { localPrincipalConfig = [] } = nodeDefinition[j] || {};
                                        for (let k = 0; k < localPrincipalConfig.length; k++) {
                                            let sitem = localPrincipalConfig[k] || {};
                                            if (
                                                item.actDefId === sitem.nodeKey &&
                                                item.memberType === sitem.memberType &&
                                                item.parentId === sitem.participantRef
                                            ) {
                                                localPrincipalConfig[k] = { ...sitem, ...item };
                                            }
                                        }
                                    }
                                }

                                // 业务对象草稿回显
                                this.customFormJson = customformJson;

                                // 全局流程变量草稿回显
                                let { procInstVariables } = processBasicInfo || {};

                                globalVariable = _.map(globalVariable, (item) => {
                                    return {
                                        ...item,
                                        componentContentJson: _.isObject(procInstVariables)
                                            ? { [item.variableKey]: procInstVariables[item.variableKey] }
                                            : {}
                                    };
                                });

                                // 草稿pbo信息回显
                                this.pboData.baseForm = baseForm;
                                this.pboData.baseStartProcessDto = baseStartProcessDto;

                                // 草稿附件回显
                                this.attachments = attachments;

                                // 人员信息叠加
                                userRoleMap = { ...userRoleMap, ...draftUserRoleMap };
                            }

                            this.processDefinition = processDefinition;
                            this.processRoleConfig = processRoleConfig;
                            this.userTaskActivities = userTaskActivities;
                            this.globalVariable = globalVariable;
                            this.globalFormData = globalFormData?.[0] || {};
                            this.nodeDefinition = nodeDefinition;
                            this.userRoleMap = userRoleMap;
                            this.startActivity = firstUserTasks;

                            // 初始化基本信息
                            this.basicInfos = basicInfos;
                            // 初始化处理人配置
                            this.initHandlerConfiguration({ nodeDefinition, userRoleMap });
                            // 自定义流程启动
                            this.customStartInterface(this.globalFormData);
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                        this.launcherParticipantLoading = !!this.holderRef;
                    });
            },
            // 获取流程信息
            getProcessInformation() {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: `/bpm/processDef/processDefinition/${
                            this.params.engineModelKey || this.query.processDefRef
                        }`,
                        method: 'GET',
                        className: this.$store.getters.className('processDefinition')
                    })
                        .then((resp) => {
                            resolve(resp);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            // 获取草稿数据
            fetchDraftData() {
                let data = new FormData();
                data.append('pboOid', this.params.pboOid);
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/bpm/workflow/findPboDraftInfo',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data
                    })
                        .then((resp) => {
                            resolve(resp);
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            // 获取上下文
            getContainerData(holderRef) {
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: holderRef.split(':')[1],
                        oid: holderRef
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.innerContainerRef = resp.data?.rawData?.containerRef?.oid || '';
                        this.launcherParticipantLoading = false;
                    }
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
                        this.basicInfoLoading = true;
                    });
            },
            // 业务对象密级
            getPartialSecurity({ isSecret, securityLabel }) {
                this.isProcessSecurityReadonly = isSecret;
                this.isSecret = isSecret;
                isSecret && this.$set(this.basicInfos, 'securityLabel', securityLabel);
            },
            // 自定义流程启动
            customStartInterface(globalFormData = {}) {
                if (globalFormData.startInterfaceMasterRefs?.length) {
                    this.$famHttp({
                        url: `bpm/interface/list`,
                        method: 'POST',
                        data: {
                            masterOidList: globalFormData.startInterfaceMasterRefs
                        }
                    }).then((resp) => {
                        this.customStartInterfaceInfo = resp?.data?.[0] || {};
                    });
                }
            },
            // 初始化处理人配置
            initHandlerConfiguration({ nodeDefinition = [] }) {
                nodeDefinition = _.filter(nodeDefinition, (item) => this.userTaskList.indexOf(item.nodeKey) > -1) || [];
                this.handlerConfiguration = _.map(nodeDefinition, (item) => {
                    return {
                        nodeName: item.name || '',
                        nodeKey: item.nodeKey,
                        tableData: _.map(item.localPrincipalConfig || [], (sitem) => _.extend({}, sitem))
                    };
                });
            },
            // 处理人配置是否显示
            showHandlerConfiguration(isShow) {
                this.isShowBpmLauncherParticipant = isShow;
            },
            // 附件上传下载
            attachmentUpLoad() {
                this.$refs.bpmProcessAttachment.onClick();
            },
            // 获取流程密级
            getSecurityLabel(securityLabel) {
                this.$set(this.basicInfos, 'securityLabel', securityLabel);
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
                const { engineModelId, name } = this.processDefinition;
                this.bpmFlowchart.processDefinitionId = engineModelId;
                let displayName = name || this.i18n.flowDiagram;
                this.popover({ field: 'bpmFlowchart', title: displayName, visible: true });
            },
            // 返回上一级
            goBack() {
                const callback = this.$store.getters['bpmProcessPanel/getCallback']({
                    type: 'goBack',
                    key: 'launcher'
                });
                if (_.isFunction(callback)) {
                    callback();
                } else {
                    this.closeCurrentTabPage(({ appName, path }) => {
                        ErdcKit.open(path, {
                            appName
                        });
                    });
                }
            },
            // 成功回调
            successCallback(isDraft) {
                const callback = this.$store.getters['bpmProcessPanel/getCallback']({
                    type: 'successCallback',
                    key: 'launcher'
                });
                if (_.isFunction(callback)) {
                    callback(isDraft);
                } else {
                    this.closeCurrentTabPage(({ appName, path }) => {
                        ErdcKit.open(path, {
                            appName,
                            query: {
                                isRefresh: true
                            }
                        });
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
                    const redirect = route.query.redirect;
                    const currentAppName = window.__currentAppName__;
                    const appName = route.query.appName || currentAppName;
                    const path =
                        currentAppName === 'erdc-portal-web'
                            ? '/biz-bpm/process/draft'
                            : '/biz-bpm/processManagement/template';
                    if (redirect) {
                        ErdcKit.open(redirect, { appName });
                    } else {
                        // 删除后，高亮其右1页签，若右侧无页签，则高亮其左1页签
                        let preRoute = visitedRoutes.at(delItemIndex) || visitedRoutes.at(delItemIndex - 1) || { path };
                        _.isFunction(callback)
                            ? callback({ appName: currentAppName, path })
                            : this.$router.push(preRoute);
                    }
                });
            },
            // 数据组装
            async assembling(skipValidate) {
                let res = {};
                let valid = true;
                let message = [];
                let data = {
                    baseForm: {
                        processBasicInfo: {},
                        businessForm: {
                            reviewItemList: []
                        },
                        businessFormJsonStr: '{"reviewItemList":[]}'
                    },
                    baseStartProcessDto: {}
                };

                // 流程定义标识
                data.processDefKey = this.processDefinitionKey || data.baseStartProcessDto.processDefKey;
                data.baseForm.processBasicInfo.oid = this.draftInfos.oid;

                // 基本信息
                const basicInfo = this.$refs.bpmProcessBasicInfo;
                if (basicInfo) {
                    if (skipValidate) {
                        const result = basicInfo.getData();
                        res = {
                            valid: !!result.processName,
                            data: result,
                            message: this.i18n.pleaseEnterProcessName // 请输入流程名称
                        };
                    } else {
                        res = await basicInfo.validate();
                    }
                    if (res.valid) {
                        data.baseForm.processBasicInfo = { ...data.baseForm.processBasicInfo, ...res.data };
                    } else {
                        valid = res.valid;
                        res.message && message.push(res.message);
                    }
                }

                // 流程变量
                const variables = this.$refs.processVariables;
                if (variables) {
                    if (skipValidate) {
                        res = { valid: true };
                    } else {
                        res = await variables.validate();
                    }
                    if (res.valid) {
                        data.baseForm.processBasicInfo.procInstVariables = variables.getData();
                    } else {
                        valid = res.valid;
                        res.message && message.push(res.message);
                    }
                }

                // 参与者人员
                const participant = this.$refs.bpmLauncherParticipant;
                if (participant) {
                    if (skipValidate) {
                        res = {
                            valid: true,
                            data: participant.getData()
                        };
                    } else {
                        res = await participant.validate();
                    }
                    if (res.valid) {
                        data.baseStartProcessDto = { ...data.baseStartProcessDto, ...{ showUserJson: res.data } };
                    } else {
                        valid = res.valid;
                        res.message && message.push(res.message);
                    }
                }

                // 知会人员
                if (this.informForm.informParticipant.length) {
                    data.baseStartProcessDto.informUserJson = JSON.stringify([
                        {
                            memberId: this.informForm.informParticipant
                        }
                    ]);
                }

                // 评审对象标识
                this.holderRef && (data.baseForm.businessForm.reviewItemList = [{ oid: this.holderRef }]);

                // 业务对象
                const partial = this.$refs.bpmProcessPartial;
                if (this.partialUrl && partial) {
                    if (skipValidate) {
                        res = {
                            valid: true,
                            data: await partial.getData(data)
                        };
                    } else {
                        try {
                            res = await partial.validate(data);
                        } catch (e) {
                            if (Array.isArray(res.message)) {
                                message = message.concat(res.message);
                            } else {
                                message.push(res.message);
                            }
                        }
                    }
                    if (res.valid) {
                        data.baseStartProcessDto = { ...data.baseStartProcessDto, ...{ customformJson: res.data } };
                    } else {
                        valid = res.valid;
                        if (res.message) {
                            if (Array.isArray(res.message)) {
                                message = message.concat(res.message);
                            } else {
                                message.push(res.message);
                            }
                        }
                    }
                }

                // 附件
                const attachment = this.$refs.bpmProcessAttachment;
                res = attachment && (await attachment.getData());

                data.baseStartProcessDto = { ...data.baseStartProcessDto, ...res };

                let preSendData = data;
                if (partial) {
                    preSendData = await partial.beforeSubmit({
                        key: 'launcher',
                        data,
                        valid,
                        message,
                        skipValidate
                    });
                }

                const finalData =
                    (await this.$store.getters['bpmProcessPanel/getProcessBeforeSubmit']({
                        key: 'launcher',
                        data: preSendData,
                        valid,
                        message,
                        skipValidate
                    })) || preSendData;

                return new Promise((resolve, reject) => {
                    if (valid) {
                        resolve(finalData);
                    } else {
                        reject(message);
                    }
                });
            },
            // 发起流程
            async launch() {
                this.launchSubmitLoading = true;
                this.assembling().then(
                    (data) => {
                        data.isDraft = false;
                        let resp;
                        this.startProcessByPbo(data)
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
                                    return this.$message.error(resp.message || this.i18n.launcherFail);
                                }
                                this.$message.success({
                                    message: this.i18n.launcherSuccess,
                                    onClose: () => {
                                        this.successCallback(data.isDraft);
                                    }
                                });
                            })
                            .catch(() => {
                                this.launchSubmitLoading = false;
                            });
                    },
                    (error) => {
                        this.launchSubmitLoading = false;
                        _.each(error, (message) => {
                            setTimeout(() => {
                                this.$message.error(message);
                            }, 0);
                        });
                    }
                );
            },
            // 另存为草稿
            saveAsDraft() {
                this.launchSubmitLoading = true;
                this.assembling(true).then(
                    (data) => {
                        data.isDraft = true;
                        this.startProcessByPbo(data)
                            .then((resp) => {
                                if (!resp.success) {
                                    return this.$message.error(resp.message || this.i18n.draftSaveFail);
                                }
                                this.$message.success({
                                    message: this.i18n.draftSaveSuccess,
                                    onClose: () => {
                                        this.successCallback(data.isDraft);
                                    }
                                });
                            })
                            .catch(() => {
                                this.launchSubmitLoading = false;
                            });
                    },
                    (error) => {
                        this.launchSubmitLoading = false;
                        _.each(error, (message) => {
                            setTimeout(() => {
                                this.$message.error(message);
                            }, 0);
                        });
                    }
                );
            },
            // 启动流程
            startProcessByPbo(data) {
                const { params, rpcInterface, requestMethod } = this.customStartInterfaceInfo || {};
                let customData = {};
                try {
                    if (params) {
                        customData = JSON.parse(params) || {};
                    }
                } catch (e) {
                    // do noting
                }
                const className = this.$store.getters['bpmPartial/getResourceClassName']({
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: this.startEventActivityId
                });
                const headers = this.$store.getters['bpmPartial/getResourceInterfaceHeaders']({
                    processDefinitionKey: this.processDefinitionKey,
                    activityId: this.startEventActivityId
                });
                return this.$famHttp({
                    url: rpcInterface || '/bpm/workflow/start/processbypbo',
                    method: requestMethod || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                    className: className,
                    data: JSON.stringify(_.extend({}, data, customData))
                });
            }
        }
    };
});
