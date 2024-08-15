define([
    'text!' + ELMP.func('bpm-resource/bpm-activator/template.html'),
    'css!' + ELMP.func('bpm-resource/bpm-activator/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'WorkflowActivator',
        template,
        components: {
            BpmProcessNavigation: ErdcKit.asyncComponent(
                ELMP.resource('erdc-process-components/BpmProcessNavigation/index.js')
            ),
            BpmProcessDetails: ErdcKit.asyncComponent(
                ELMP.resource('bpm-resource/components/BpmProcessDetails/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.func('bpm-resource/bpm-activator/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '提交',
                    '基本信息',
                    '业务对象',
                    '附件',
                    '处理历史记录',
                    '流程处理',
                    '当前处理人',
                    '流程状态',
                    '流程编码',
                    '当前节点',
                    '到期日期',
                    '流程属性',
                    '节点属性',
                    '节点变量校验未通过'
                ]),
                // 流程实例标识
                processInstanceOId: '',
                // 模板标识
                processDefinitionKey: '',
                // 节点标识
                taskDefKey: '',
                // 任务标识
                taskOId: '',
                // 是否只读
                readonly: false,
                // 是否可返回
                isGoBack: false,
                // 跑马灯折叠
                collapsed: false,
                viewActivityId: '',
                nodeMap: {},
                users: [],
                // 当前节点名称
                currentNodeName: '',
                navHeight: document.documentElement.clientHeight - 80,
                detailHeight: document.documentElement.clientHeight - 180,
                // 是否缓存
                isActivated: false,
                isShowBpmActivator: true
            };
        },
        computed: {
            // 流程详情大小切换
            collapsedStyle() {
                return {
                    width: this.collapsed ? 'calc(100% - 64px)' : 'calc(100% - 224px)'
                };
            },
            // 节点
            activities() {
                return this.nodeMap?.node?.activities || [];
            },
            // 当前节点
            currentActivityId() {
                return this.nodeMap?.node?.highLightedActivities || [];
            },
            // 是否初始化activator缓存
            canInitActivatorStore() {
                return this.processDefinitionKey && this.isActivated;
            }
        },
        created() {
            const { params, query } = this.$route || { params: {}, query: {} };
            const { processInstanceOId } = params;
            const { taskDefKey, taskOId, readonly, goBack } = query;
            this.processInstanceOId = processInstanceOId || '';
            this.taskDefKey = taskDefKey || '';
            this.taskOId = taskOId || '';
            this.readonly = readonly === 'true';
            this.isGoBack = goBack !== 'false';
            this.viewActivityId = taskDefKey;
        },
        watch: {
            canInitActivatorStore: {
                handler: function (nv) {
                    nv && this.initActivatorStore();
                },
                immediate: true
            }
        },
        activated() {
            this.isActivated = new Date().getTime();
        },
        beforeDestroy() {
            let eventObject = this?.$store?.getters?.['bpmProcessPanel/getEventObject'] || {};
            if (!_.isEmpty(eventObject) && eventObject?.[`${this.processDefinitionKey}_activator`]) {
                eventObject[`${this.processDefinitionKey}_activator`] = undefined;
                this.$store.dispatch('bpmProcessPanel/setEventObjectAction', eventObject);
            }
        },
        methods: {
            // 初始化activator缓存
            initActivatorStore() {
                this.$store.dispatch('bpmProcessPanel/setEventObjectAction', {
                    [`${this.processDefinitionKey}_activator`]: (callback) =>
                        _.isFunction(callback) && callback(this?.$refs?.bpmProcessDetails || this)
                });
            },
            updateProcessDefinitionKey(processDefinitionKey) {
                this.processDefinitionKey = processDefinitionKey;
            },
            updateActivityId(val = '') {
                const { activityId = '' } = _.find(this.activities, i => i?.properties?.type === 'endEvent') || {};
                this.viewActivityId = val || activityId;
            },
            updateNodeMapChange(nodeMap) {
                this.nodeMap = nodeMap;
                const { activityId = '' } = _.find(this.activities, i => i?.properties?.type === 'endEvent') || {};
                this.viewActivityId = this.viewActivityId || activityId;
            },
            updateTaskDefKeyUsersChange(users) {
                this.users = users;
            },
            switchWorkshopView(activity) {
                this.viewActivityId = activity.activityId;
                this.currentNodeName = activity?.properties?.name || '';
                let { bpmProcessDetails = {} } = this.$refs || {};
                let { getTaskDetail } = bpmProcessDetails;
                getTaskDetail(activity);
            },
            hasSecurityLabel(val) {
                this.isShowBpmActivator = val;
            }
        }
    };
});
