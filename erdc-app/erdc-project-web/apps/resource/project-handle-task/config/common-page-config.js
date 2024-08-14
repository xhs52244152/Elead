define([
    'fam:http',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('project-handle-task/locale/index.js'),
    ELMP.resource('ppm-store/index.js')
], function (famHttp, globalUtils, { i18n }, store) {
    const i18nMappingObj = globalUtils.languageTransfer(i18n);
    const ErdcKit = require('erdcloud.kit');
    const router = require('erdcloud.router');
    // 来源字段
    const getSourceMap = function () {
        const { $route } = router.app;
        let source = $route.query?.['source'];
        try {
            if (!source) {
                source = {};
            } else {
                source = JSON.parse(source);
            }
        } catch (error) {
            source = {};
        }
        return Object.assign(
            {
                value: '',
                readonly: false
            },
            source || {}
        );
    };
    // 根据query配置的backRouteConfig跳转回去，返回true=可通过此方式并已跳转，false=不能通过此方式跳转
    const goBackRoute = function (delRoute = true, isRefresh = false) {
        const { $route, $store } = router.app;
        let { appName, backRouteConfig } = $route.query;
        if (backRouteConfig) {
            let routeConfig = JSON.parse(backRouteConfig || '{}');
            delRoute && $store.dispatch('route/delVisitedRoute', $route);
            routeConfig.query.needRefreshTable = isRefresh;
            globalUtils.openPage({
                routeConfig,
                appName
            });
            return true;
        }
        return false;
    };
    return {
        'erd.cloud.ppm.plan.entity.DiscreteTask': {
            create: {
                title: i18nMappingObj.createHandletask,
                layoutName: 'CREATE',
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        proposer: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/SubmitterSelect/index.js')
                        )
                    }
                },
                formHeight: 'calc(100% - 12px)',
                props: {
                    formBefore: {
                        // checkNameTips: i18nMappingObj.pleaseEnterIssueName
                    },
                    formSlotsProps({ formData }) {
                        return {
                            proposer: {
                                showType: ['USER'],
                                handleChange(userInfo) {
                                    if (userInfo && userInfo.length) {
                                        userInfo = userInfo[0];
                                        formData.organizationRef = userInfo.orgIds?.[0] || '';
                                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                        formData.organizationRef_defaultValue = {
                                            oid: userInfo?.orgIds?.[0] || '',
                                            displayName: userInfo?.orgName || ''
                                        };
                                    } else {
                                        formData.organizationOid = '';
                                        formData.organizationRef = '';
                                        formData.organizationRef_defaultValue = {};
                                    }
                                }
                            }
                        };
                    },
                    formProps(vm) {
                        const { $route } = router.app;
                        return {
                            schemaMapper: {
                                // 来源
                                dtSource(schema) {
                                    schema.readonly = !!getSourceMap()?.readonly;
                                },
                                // 所属项目
                                holderRef(schema) {
                                    const ErdcStore = require('erdcloud.store');
                                    // 在工作台创建的项目可选，项目空间创建时项目默认使用当前项目且不可选
                                    if ($route.query.pid || ErdcStore?.state?.space?.object?.oid) {
                                        schema.readonly = true;
                                    }
                                }
                            }
                        };
                    }
                },
                hooks: {
                    onFieldChange: function (formData, field, nVal) {
                        let params = {
                            field,
                            oid: '',
                            formData: formData,
                            nVal
                        };
                        params.changeFields = [
                            'timeInfo.scheduledStartTime',
                            'timeInfo.scheduledEndTime',
                            'planInfo.duration'
                        ];
                        params.fieldMapping = {
                            scheduledStartTime: 'timeInfo.scheduledStartTime',
                            scheduledEndTime: 'timeInfo.scheduledEndTime',
                            duration: 'planInfo.duration'
                        };
                        globalUtils.fieldsChange(params);
                        return formData;
                    },
                    beforeEcho: function (vm) {
                        // 创建时，才有vm
                        if (!vm?.$el) {
                            return;
                        }
                        const { $route } = router.app;
                        const famStore = require('fam:store');
                        const ErdcStore = require('erdcloud.store');
                        let data = {};
                        let currentUser = famStore?.state?.user;
                        // 提出人默认当前登录人
                        data.proposer = [currentUser];
                        // 默认带出当前登陆人的部门
                        data.organizationRef = currentUser.orgIds?.[0] || '';
                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                        data.organizationRef_defaultValue = {
                            oid: currentUser.orgIds[0],
                            displayName: currentUser.orgName.split(';')[0]
                        };
                        // 来源字段
                        data.dtSource = getSourceMap().value || '';
                        // 所属项目，只有在项目空间才会给默认值
                        if (ErdcStore.state?.space) data.holderRef = ErdcStore?.state?.space?.object?.name;

                        // 工作台-流程-评审页面-创建督办任务是需要将项目带出
                        if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                            if ($route.query.pid) {
                                data.holderRef = $route.query.projectName;
                            }
                        }
                        vm.form = data;
                    },
                    beforeSubmit: async function ({ formData, next, isSaveDraft, vm }) {
                        const { $route } = router.app;
                        const ErdcStore = require('erdcloud.store');
                        formData.attrRawList = formData.attrRawList.map((item) => {
                            if (item.attrName === 'proposer' && item.value instanceof Array)
                                item.value = item.value[0]?.oid;
                            return item;
                        });
                        formData.attrRawList.push({
                            attrName: 'organizationRef',
                            value: vm.formData.organizationRef
                        });
                        formData?.attrRawList.some((el) => {
                            if (el.attrName === 'projectRef') {
                                el.value = vm.projectOid;
                            }
                        });
                        // 来源
                        if (!formData.attrRawList.some((el) => el.attrName === 'dtSource')) {
                            formData.attrRawList.push({
                                attrName: 'dtSource',
                                value: vm.$refs.detail[0].$refs?.layoutForm?.form.dtSource
                            });
                        }
                        // 如果在项目应用下（工作台下是可以编辑的，输入什么值就录入什么值）
                        if ($route.query.pid || ErdcStore?.state?.space?.object?.oid) {
                            // 所属项目
                            formData.attrRawList = formData.attrRawList.filter((el) => el.attrName !== 'holderRef');
                            formData.attrRawList.push({
                                attrName: 'holderRef',
                                value: $route.query.pid || ErdcStore?.state?.space?.object?.oid || ''
                            });
                        }
                        // 关联 督办任务创建
                        if ($route.query?.createType === 'related') {
                            formData.relationList = [
                                {
                                    action: 'CREATE',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: $route.query?.relatedOid
                                        }
                                    ],
                                    className: 'erd.cloud.ppm.common.entity.BusinessLink'
                                }
                            ];
                            formData.associationField = 'roleBObjectRef';
                        } else if ($route.query?.createType === 'RelationDiscrete') {
                            const self = vm;
                            formData.relationList = [
                                {
                                    className: 'erd.cloud.ppm.review.entity.ReviewObjectRelationLink',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: self.oid
                                        }
                                    ]
                                }
                            ];
                            formData.associationField = 'roleBObjectRef';
                            formData.className = 'erd.cloud.ppm.plan.entity.DiscreteTask';
                        } // 如果fromProcess为true,则代表是从流程页面创建风险跳转过来的
                        else if ($route.query?.isCreateRelation) {
                            formData.relationList = [
                                {
                                    className: $route.query?.relationClassName,
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: $route.query?.roleAObjectRef
                                        }
                                    ]
                                }
                            ];
                            formData.associationField = 'roleBObjectRef';
                        }
                        // 项目变更-督办任务创建
                        if (vm.$route.query.createType === 'projectChange' && vm.$route.query.changeOid) {
                            formData.associationField = 'roleBObjectRef';
                            formData.relationList = [
                                {
                                    action: 'CREATE',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: vm.$route.query.changeOid
                                        }
                                    ],
                                    className: 'erd.cloud.ppm.change.entity.AffectedData'
                                }
                            ];
                        }
                        // 如果有所属项目，则获取对应项目的信息
                        let toProjectOid = formData.attrRawList?.find((el) => el.attrName == 'holderRef')?.value;
                        if (toProjectOid) {
                            let res = await famHttp({
                                method: 'GET',
                                url: '/ppm/attr',
                                className: store.state.classNameMapping.project,
                                params: {
                                    oid: toProjectOid
                                }
                            });
                            let data = res?.data?.rawData || {};
                            let toProjectInfos = ErdcKit.deserializeAttr(data, {
                                valueMap: {
                                    containerRef: (e) => {
                                        return e?.oid || '';
                                    }
                                }
                            });
                            formData.containerRef = toProjectInfos.containerRef;
                        } else {
                            // 获取督办的containerRef
                            let { data } = await famHttp({
                                url: '/fam/peferences/DiscreteTaskPoolContainerOId',
                                method: 'GET'
                            });
                            formData.containerRef = data;
                        }
                        // 督办任务-创建，删除oid
                        delete formData.oid;
                        next(formData, i18nMappingObj.createSuccessTips);
                    },
                    afterSubmit: function ({ vm, responseData, cancel }) {
                        const { $route } = router.app;
                        // 如果fromProcess为true,则代表是从流程页面创建风险跳转过来的
                        if ($route?.query?.isCreateRelation) {
                            cancel();
                        } else if ($route?.query?.relatedOid || $route?.query?.createType === 'projectChange') {
                            let { appName, backRouteConfig } = vm.$route.query;
                            let routeConfig = JSON.parse(backRouteConfig || '{}');
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                // 如果是当前应用内跳转就不需要再跳转，这种情况只针对跨应用跳转
                                const ErdcStore = require('erdcloud.store');
                                if (ErdcStore.state.route.resources.identifierNo === appName) return;
                                const erdcKit = require('erdc-kit');
                                const visitedRoutes = vm.$store.getters['route/visitedRoutes'];
                                if (visitedRoutes.length) {
                                    vm.$router.push(visitedRoutes[0]);
                                } else {
                                    let pathObj = globalUtils.getDiscreteTaskPath('list');
                                    erdcKit.open(pathObj.path, {
                                        appName: pathObj.appName
                                    });
                                }
                            });
                            $route?.query?.relatedOid && (routeConfig.query.needRefreshTable = true);
                            $route?.query?.createType === 'projectChange' &&
                                localStorage.setItem('change:project:createOid', responseData);
                            globalUtils.openPage({
                                routeConfig,
                                appName
                            });
                        }
                        // else if ($route?.query?.createType === 'projectChange') {
                        //     // 项目变更创建
                        //     let visitedRoutes = vm.$store.getters['route/visitedRoutes'].filter(
                        //         (item) => item.name === 'workflowLauncher' || item.name === 'workflowDraft'
                        //     );
                        //     visitedRoutes.length && (visitedRoutes[0].params.createOid = responseData);
                        //     cancel();
                        // }
                        else {
                            vm.$store.dispatch('route/delVisitedRoute', $route);
                            let formData = vm.$refs?.detail?.[0]?.$refs?.beforeForm?.formData || {};
                            // 打开督办任务详情页面
                            globalUtils.openDiscreteTaskPage(
                                'detail',
                                {
                                    query: {}
                                },
                                {
                                    oid: responseData,
                                    name: formData?.name || ''
                                }
                            );
                        }
                    },
                    beforeCancel({ goBack }) {
                        const { $route } = router.app;
                        if ($route?.query?.relatedOid) {
                            const ErdcStore = require('erdcloud.store');
                            ErdcStore.dispatch('route/delVisitedRoute', $route);
                            let { appName, backRouteConfig } = $route.query;
                            let routeConfig = JSON.parse(backRouteConfig || '{}');
                            globalUtils.openPage({
                                routeConfig,
                                appName
                            });
                        }
                        // 根据query配置的backRouteConfig跳转
                        else if (goBackRoute(true, false)) {
                            return;
                        } else {
                            goBack();
                        }
                    }
                }
            },
            edit: {
                title: i18nMappingObj.editHandleTask,
                editableAttr: ['identifierNo'],
                tabs: (data) => {
                    if (!data?.oid?.value) {
                        return [];
                    }
                    return [
                        {
                            name: i18nMappingObj.detailedInformation,
                            activeName: 'detail'
                        },
                        {
                            name: i18nMappingObj.deliverable,
                            activeName: 'DeliveryDetail',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/DeliveryDetails/index.js')
                            ),
                            basicProps: {
                                poid: data?.oid?.value,
                                // 关联的项目oid
                                relationProjectOid: data?.['holderRef']?.oid
                            }
                        },
                        {
                            name: i18nMappingObj.attach,
                            activeName: 'Attach',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/Attach/index.js')
                            ),
                            basicProps: {
                                oid: data?.oid?.value
                            }
                        },
                        {
                            name: i18nMappingObj.relation,
                            activeName: 'RelevanceList',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/RelevanceList/index.js')
                            ),
                            basicProps: {
                                fromObject: 'handleTask',
                                poid: data?.oid?.value,
                                excludeItems: ['task'], // 不显示关联 任务
                                taskTableKey: 'ActiveLinkTaskView',
                                relateTaskProps: {
                                    isHandleTask: true
                                }
                            }
                        },
                        {
                            name: i18nMappingObj.associated,
                            activeName: 'passiveLinkRelated',
                            basicProps: {
                                relatedData: [
                                    {
                                        routerName: 'issueDetail',
                                        businessKey: 'passiveLinkIssue'
                                    },
                                    {
                                        routerName: 'riskDetail',
                                        businessKey: 'passiveLinkRisk'
                                    },
                                    {
                                        businessKey: 'passiveLinkRequire'
                                    }
                                ],
                                idKey: 'oid'
                            },
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/Related/index.js')
                            )
                        }
                    ];
                },
                formHeight: 'calc(100% - 12px)',
                layoutName: 'UPDATE',
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        proposer: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/SubmitterSelect/index.js')
                        )
                    }
                },
                modelMapper: {
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'proposer': (data) => {
                        return data['proposer'].users;
                    },
                    'holderRef': (data) => {
                        return data['holderRef'].displayName;
                    }
                },
                props: {
                    formBefore: {},
                    formSlotsProps({ formData }) {
                        return {
                            proposer: {
                                showType: ['USER'],
                                handleChange(userInfo) {
                                    if (userInfo && userInfo.length) {
                                        userInfo = userInfo[0];
                                        formData.organizationRef = userInfo.orgIds?.[0] || '';
                                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                        formData.organizationRef_defaultValue = {
                                            oid: userInfo?.orgIds?.[0] || '',
                                            displayName: userInfo?.orgName || ''
                                        };
                                    } else {
                                        formData.organizationOid = '';
                                        formData.organizationRef = '';
                                        formData.organizationRef_defaultValue = {};
                                    }
                                }
                            }
                        };
                    }
                },
                hooks: {
                    onFieldChange: function (formData, field, nVal) {
                        let params = {
                            field,
                            oid: '',
                            formData: formData,
                            nVal
                        };
                        params.changeFields = [
                            'timeInfo.scheduledStartTime',
                            'timeInfo.scheduledEndTime',
                            'planInfo.duration'
                        ];
                        params.fieldMapping = {
                            scheduledStartTime: 'timeInfo.scheduledStartTime',
                            scheduledEndTime: 'timeInfo.scheduledEndTime',
                            duration: 'planInfo.duration'
                        };
                        globalUtils.fieldsChange(params);
                        return formData;
                    },
                    beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                        let verificationKeys = [
                            { key: 'planInfo.actualDuration', name: i18nMappingObj.actualWorkingHours },
                            { key: 'planInfo.workload', name: i18nMappingObj.estimatedWorkingHours },
                            { key: 'planInfo.duration', name: i18nMappingObj.duration },
                            { key: 'planInfo.completionRate', name: i18nMappingObj.finishingRate }
                        ];
                        const verificationData = (verificationKeys, data, draft) => {
                            let verificationName;
                            let reg = /^\d+(\.\d)?$/;
                            for (let res of verificationKeys) {
                                let key = res.key;
                                let value = data.attrRawList.find((item) => item.attrName === key)?.value || '';
                                if (!reg.test(value) && value && !draft) {
                                    verificationName = res.name;
                                    break;
                                }
                            }
                            return verificationName;
                        };
                        let verificationName = verificationData(verificationKeys, formData);
                        if (verificationName) {
                            return vm.$message({
                                type: 'info',
                                message: verificationName + i18nMappingObj.validityTips
                            });
                        }
                        formData?.attrRawList.some((el) => {
                            if (el.attrName === 'proposer' && Array.isArray(el.value)) {
                                el.value = el.value[0].oid;
                                return;
                            }
                        });
                        formData.attrRawList.push({
                            attrName: 'organizationRef',
                            value: _.isArray(vm.formData?.organizationRef?.value)
                                ? vm.formData?.organizationRef?.value?.[0]
                                : vm.formData?.organizationRef
                        });
                        let completionRate = ErdcKit.deserializeAttr(formData?.attrRawList);
                        if (
                            completionRate['planInfo.completionRate'] &&
                            Number(completionRate['planInfo.completionRate']) > 100
                        ) {
                            return vm.$message({
                                type: 'info',
                                message: i18nMappingObj.percentTips
                            });
                        }
                        formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                        formData?.attrRawList.some((el) => {
                            if (el.attrName === 'projectRef') {
                                el.value = store.state.projectInfo.oid;
                            }
                        });
                        next(formData);
                    },
                    afterSubmit: function ({ cancel }) {
                        setTimeout(() => {
                            cancel();
                        }, 500);
                    },
                    beforeCancel({ goBack }) {
                        goBack((defaultRouter) => {
                            const { $router } = router.app;
                            defaultRouter.query.needRefreshTable = true; // 主要用于编辑成功后回退到列表页面时，刷新列表
                            $router.push(defaultRouter);
                        });
                    }
                }
            },
            detail: {
                title: function (formData) {
                    if (!formData.name) return '';
                    return formData.name + '; ' + formData.identifierNo;
                },
                slots: {},
                props: {},
                actionKey: 'PPM_PROJECT_DISCRETE_TASK_INFO_OPER_MENU',
                formHeight: 'calc(100% - 12px)',
                showSpecialAttr: true,
                keyAttrs: function (formData) {
                    const infoListData = [
                        {
                            name: formData.responsiblePeople_defaultValue?.[0]?.displayName || '',
                            label: i18nMappingObj.responsiblePeople,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['lifecycleStatus.status'],
                            label: i18nMappingObj.state,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['timeInfo.scheduledStartTime']?.split(' ')[0] || '',
                            label: i18nMappingObj.scheduledStartTime,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['timeInfo.scheduledEndTime']?.split(' ')[0] || '',
                            label: i18nMappingObj.scheduledEndTime,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        }
                    ];
                    return infoListData;
                },
                tabs: (data) => {
                    if (!data?.oid?.value) {
                        return [];
                    }
                    const { $route } = router.app;
                    let tabs = [
                        {
                            name: i18nMappingObj.detailedInformation,
                            activeName: 'detail'
                        },
                        {
                            name: i18nMappingObj.deliverable,
                            activeName: 'deliverable',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/DeliveryDetails/index.js')
                            ),
                            basicProps: {
                                poid: data?.oid?.value,
                                // 关联的项目oid
                                relationProjectOid: data?.['holderRef']?.oid
                            }
                        },
                        {
                            name: i18nMappingObj.attach,
                            activeName: 'attach',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/Attach/index.js')
                            ),
                            basicProps: {
                                oid: data?.oid?.value
                            }
                        },
                        {
                            name: i18nMappingObj.relation,
                            activeName: 'RelevanceList',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/RelevanceList/index.js')
                            ),
                            basicProps: {
                                fromObject: 'handleTask',
                                poid: data?.oid?.value,
                                excludeItems: ['task'], // 不显示关联 任务
                                taskTableKey: 'ActiveLinkTaskView',
                                relateTaskProps: {
                                    isHandleTask: true
                                }
                            }
                        },
                        {
                            name: i18nMappingObj.associated,
                            activeName: 'passiveLinkRelated',
                            basicProps: {
                                relatedData: [
                                    {
                                        routerName: 'issueDetail',
                                        businessKey: 'passiveLinkIssue'
                                    },
                                    {
                                        routerName: 'riskDetail',
                                        businessKey: 'passiveLinkRisk'
                                    },
                                    {
                                        businessKey: 'passiveLinkRequire'
                                    }
                                ],
                                idKey: 'oid'
                            },
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/Related/index.js')
                            )
                        },
                        {
                            name: i18nMappingObj.workload,
                            activeName: 'workload',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/WorkHourRecord/index.js')
                            ),
                            basicProps: {
                                oid: $route.query.oid,
                                className: store.state.classNameMapping.DiscreteTask,
                                workHourClassName: store.state.classNameMapping.DiscreteTime,
                                topMenuActionName: 'PPM_DISCRETE_TASK_TIMESHEET_LIST_MENU',
                                optMenuActionName: 'PPM_DISCRETE_TASK_TIMESHEET_OPERATE_MENU',
                                tableKey: 'DiscreteTaskTimesheetView'
                            }
                        },
                        {
                            name: i18nMappingObj.processRecords,
                            activeName: 'processRecords',
                            component: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                            )
                        }
                    ];
                    return tabs;
                },
                layoutName: 'DETAIL',
                modelMapper: {
                    'typeReference': (data) => {
                        return data['typeReference']?.displayName || '';
                    },
                    'holderRef': (data) => {
                        return data['holderRef']?.displayName || '';
                    },
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    }
                },
                hooks: {}
            }
        }
    };
});
