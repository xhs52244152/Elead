define([
    'text!' + ELMP.resource('bpm-resource/components/BpmProcessApproval/index.html'),
    'css!' + ELMP.resource('bpm-resource/components/BpmProcessApproval/index.css'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        props: {
            // 流程信息
            processInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 任务详情
            taskInfos: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 上下文
            containerRef: {
                type: String,
                default: ''
            },
            // 是否密级
            isSecret: {
                type: Boolean,
                default: false
            },
            securityLabel: {
                type: String,
                default: undefined
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('bpm-resource/components/BpmProcessApproval/locale/index.js'),
                formData: {
                    sessionId: '',
                    sessionName: '',
                    nextSessionId: '',
                    router: '',
                    opinion: '',
                    informedUser: {},
                    skipNodeKey: '',
                    skipNodeUser: {}
                },
                // 快捷处理意见
                opinionList: [],
                nextKey: []
            };
        },
        computed: {
            formConfig() {
                return [
                    {
                        field: 'router',
                        label: this.i18n.routing, // 路由选择
                        required: true,
                        hidden: !this.routerList.length,
                        slots: {
                            component: 'routerSelect'
                        },
                        col: 24
                    },
                    {
                        field: 'opinion',
                        label: this.i18n.opinions, // 处理意见
                        required: true,
                        slots: {
                            component: 'opinion'
                        },
                        col: 24
                    },
                    {
                        field: 'informedUser',
                        label: this.i18n.inform, // 知会
                        slots: {
                            component: 'famParticipantSelect'
                        },
                        col: 24
                    },
                    {
                        field: 'skipNodeKey',
                        label: this.i18n.skipNode, // 跳至节点
                        component: 'custom-select',
                        hidden: !this.isShowSkip,
                        props: {
                            clearable: true,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'label', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.skipNodeList
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'skipNodeUser',
                        label: this.i18n.skipNodeHandler, // 跳至节点审批人
                        hidden: !this.formData.skipNodeKey,
                        slots: {
                            component: 'skipNodeUser'
                        },
                        col: 12
                    }
                ];
            },
            // 可选路由
            routerList() {
                const target = _.find(this.taskInfos.taskFormData, (item) => item.id === 'route_flag');
                return target ? _.sortBy(target.formDataMapList, 'sort') || [] : [];
            },
            // 可选跃签节点
            skipNodeList() {
                let { skipSignInfo } = this.taskInfos ?? {};
                skipSignInfo = _.filter(skipSignInfo, (item) => item.skipFlag);
                if (!skipSignInfo?.length) {
                    return [];
                }
                const route = _.find(skipSignInfo, (skip) => skip.routeFlag === this.formData.router);
                const defaultSkip = skipSignInfo?.[0]?.skipActivityList || [];
                const skipList = route ? route.skipActivityList : defaultSkip;
                const allNode = this.processInfos?.nodeMap?.node?.activities || [];

                return _.chain(skipList)
                    .map((key) => {
                        const node = _.find(allNode, (node) => node.activityId === key);
                        if (node) {
                            return {
                                label: node.properties.name,
                                value: node.activityId
                            };
                        }
                    })
                    .compact()
                    .value();
            },
            isShowSkip() {
                let { responsibleRole = '', skipSignInfo = [] } = this.taskInfos || {};
                let target = _.find(skipSignInfo, (item) => item.routeFlag === this.formData.router);
                if (skipSignInfo.length === 1 && skipSignInfo[0].routeFlag === undefined) {
                    target = skipSignInfo[0];
                }
                const { skipFlag = false, skipRoleAclDtoList = [] } = target || {};
                return skipFlag && _.includes(_.map(skipRoleAclDtoList, 'configRoleRef'), responsibleRole);
            }
        },
        watch: {
            taskInfos: {
                immediate: true,
                handler(val) {
                    if (val) {
                        const { taskDefinitionKey = '', name = '' } = val;
                        this.$set(this, 'formData', {
                            sessionId: taskDefinitionKey,
                            sessionName: name,
                            nextSessionId: '',
                            router: '',
                            opinion: '',
                            informedUser: {},
                            skipNodeKey: '',
                            skipNodeUser: {}
                        });
                    }
                }
            },
            routerList: {
                immediate: true,
                handler(val) {
                    this.formData.router = val.length ? val[0]?.key : 0;
                    this.routerChange();
                }
            }
        },
        mounted() {
            this.getOpinionList();
        },
        methods: {
            // 路由
            routerChange() {
                const { processInstanceId, taskDefinitionKey } = this.taskInfos;
                this.$famHttp({
                    url: `/bpm/task/nexttask/${processInstanceId}/${this.formData.router}`,
                    method: 'GET',
                    params: {
                        taskKey: taskDefinitionKey
                    }
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return this.$message.error(resp.message);
                        }
                        this.nextKey = _.map(resp?.data?.data, 'nextKey');
                        this.formData.nextSessionId = this.nextKey.join();
                        this.$emit('next-key', this.nextKey);
                    })
                    .catch((resp) => {
                        this.$message.error(resp.message);
                    });
            },
            // 处理意见
            opinionChange(opinion) {
                this.formData.opinion = opinion;
            },
            // 获取快捷处理意见
            getOpinionList() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/opinion',
                    method: 'get',
                    params: {
                        status: 1
                    }
                })
                    .then((resp) => {
                        this.opinionList = _.map(resp?.data, (item) => ({
                            value: item.displayName
                        }));
                    })
                    .catch((error) => {
                        this.opinionList = [];
                    });
            },
            queryParams(optType) {
                return {
                    url: '/bpm/workitem/users',
                    method: 'GET',
                    data: {
                        processInstanceOid: this.processInfos.oid,
                        taskDefKey: this.taskInfos.taskDefinitionKey,
                        optType,
                        containerOid: optType === 'countersign' ? this.containerRef : '',
                        teamOrignType: 'erd.cloud.bpm.task.business.impl.WorkitemBizServiceImpl'
                    }
                };
            },
            // 跃签
            skipNodeKeyChange() {
                if (!this.formData.skipNodeKey) {
                    this.formData.skipNodeUser = {};
                }
            },
            // 校验流程处理数据
            validate() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve) => {
                    dynamicForm
                        .submit()
                        .then((result) => {
                            result.message = result.message || this.i18n.pleaseFillInOpinions;
                            resolve(result);
                        })
                        .catch((result) => {
                            result.message = result.message || this.i18n.pleaseFillInOpinions;
                            resolve(result);
                        });
                });
            },
            // 获取流程处理数据
            getData() {
                const { dynamicForm } = this.$refs;
                return dynamicForm.serialize();
            }
        }
    };
});
