define([ELMP.resource('ppm-utils/index.js'), ELMP.func('erdc-ppm-issue/locale/index.js')], function (
    globalUtils,
    { i18n }
) {
    const i18nMappingObj = globalUtils.languageTransfer(i18n);
    const ErdcKit = require('erdcloud.kit');
    const router = require('erdcloud.router');
    return {
        'erd.cloud.ppm.issue.entity.Issue': {
            create: {
                title: i18nMappingObj.createIssue,
                layoutName: 'CREATE',
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        files: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        ),
                        proposer: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/SubmitterSelect/index.js')
                        )
                    }
                },
                formHeight: 'calc(100% - 12px)',
                props: {
                    formBefore: {
                        checkNameTips: i18nMappingObj.pleaseEnterIssueName
                    },
                    formSlotsProps({ formData }) {
                        return {
                            files: {
                                operationConfigName: 'PPM_ATTACH_PER_OP_MENU'
                            },
                            proposer: {
                                showType: ['USER'],
                                handleChange(userInfo) {
                                    if (userInfo && userInfo.length) {
                                        userInfo = userInfo[0];
                                        formData.organizationRef = userInfo.orgIds?.[0] || '';
                                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                        formData.organizationRef_defaultValue = {
                                            oid: userInfo?.orgIds?.[0] || '',
                                            displayName: userInfo?.orgName?.split(';')[0] || ''
                                        };
                                    } else {
                                        formData.organizationOid = '';
                                        formData.organizationRef = '';
                                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                        formData.organizationRef_defaultValue = {};
                                    }
                                }
                            }
                        };
                    },
                    formProps() {
                        const { $route } = router.app;
                        return {
                            schemaMapper: {
                                projectRef(schema) {
                                    // 在工作台创建的项目可选，项目空间创建时项目默认使用当前项目且不可选
                                    if ($route.query.pid) {
                                        schema.readonly = true;
                                    }
                                }
                            }
                        };
                    }
                },
                hooks: {
                    beforeEcho: async function (vm) {
                        const { $route } = router.app;
                        const famStore = require('fam:store');
                        const dayjs = require('dayjs');
                        let data = {};
                        let currentUser = famStore.state.app?.user;
                        const ErdcStore = require('erdcloud.store');
                        // 只有在项目空间才会给默认值
                        const storeObj = ErdcStore?.state?.space?.object;
                        if (ErdcStore.state.route.resources.identifierNo === 'erdc-project-web' && storeObj) {
                            data.projectRef = `${storeObj.identifierNo},${storeObj.name}`;
                        }

                        // 工作台-流程-评审页面-创建问题是需要将项目带出
                        if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                            if ($route.query.pid) {
                                data.projectRef = $route.query.projectName;
                            }
                        }

                        // 提出人默认当前登录人
                        data.proposer = [currentUser];
                        // 提出时间默认当天
                        data.submitTime = dayjs(new Date()).format('YYYY-MM-DD');
                        // 问题优先级默认低
                        data.priority = 'LOW';
                        // 默认带出当前登陆人的部门
                        data.organizationRef = currentUser.orgIds?.[0] || '';
                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                        data.organizationRef_defaultValue = {
                            oid: currentUser.orgIds[0],
                            displayName: currentUser.orgName.split(';')[0]
                        };
                        vm.form = data;
                    },
                    beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                        const { $route } = router.app;
                        formData.attrRawList = formData.attrRawList.map((item) => {
                            if (item.attrName === 'proposer' && item.value instanceof Array)
                                item.value = item.value[0]?.oid;
                            return item;
                        });
                        if ($route.query.pid) {
                            formData.attrRawList.push({
                                attrName: 'projectRef',
                                value: $route.query.pid
                            });
                        }
                        // 组织参数处理
                        formData.attrRawList.push({
                            attrName: 'organizationRef',
                            value: vm.formData.organizationRef
                        });
                        let files = _.find(formData.attrRawList, { attrName: 'files' })?.value || [];
                        if (files && files.length) {
                            formData.contentSet = [];
                            _.each(files, (id) => {
                                formData.contentSet.push({
                                    id,
                                    actionFlag: 1,
                                    source: 0,
                                    role: 'SECONDARY'
                                });
                            });
                        }
                        delete formData.oid;

                        // 如果fromProcess为true,则代表是从流程页面创建风险跳转过来的
                        if ($route?.query?.isCreateRelation) {
                            formData.relationList = [
                                {
                                    className:
                                        $route?.query?.relationClassName || 'erd.cloud.ppm.common.entity.BusinessLink',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: $route?.query?.roleAObjectRef
                                        }
                                    ]
                                }
                            ];
                            formData.associationField = 'roleBObjectRef';
                        }
                        // 项目变更-问题创建
                        if ($route.query.createType === 'projectChange' && $route.query.changeOid) {
                            formData.associationField = 'roleBObjectRef';
                            formData.relationList = [
                                {
                                    action: 'CREATE',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: $route.query.changeOid
                                        }
                                    ],
                                    className: 'erd.cloud.ppm.change.entity.AffectedData'
                                }
                            ];
                        }
                        // 保存草稿
                        if (isSaveDraft) formData.isDraft = true;
                        let tip = isSaveDraft
                            ? i18nMappingObj.draftCreateSuccessfully
                            : i18nMappingObj.issueCreatedSuccessfully;
                        let oid = vm.$store.state?.space?.object?.containerRef;
                        // 从工作台创建 需要将选中的项目id拿到进行获取项目信息然后取到项目中的organizationRef
                        if (oid) {
                            formData.containerRef = oid;
                            next(formData, tip);
                        } else {
                            let currentProjectId =
                                _.find(formData.attrRawList, { attrName: 'projectRef' })?.value || '';
                            globalUtils.getProjectData(currentProjectId).then((res) => {
                                formData.containerRef = res.containerRefOid;
                                next(formData, tip);
                            });
                        }
                    },
                    afterSubmit: function ({ vm, responseData, cancel }) {
                        const { $router, $route } = router.app;
                        // 如果fromProcess为true,则代表是从流程页面创建风险跳转过来的
                        if ($route?.query?.isCreateRelation) {
                            cancel();
                        } else if ($route?.query?.createType === 'projectChange') {
                            // 项目变更创建
                            let { appName, backRouteConfig } = vm.$route.query;
                            let routeConfig = JSON.parse(backRouteConfig || '{}');
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                // 如果是当前应用内跳转就不需要再跳转，这种情况只针对跨应用跳转
                                const ErdcStore = require('erdcloud.store');
                                if (ErdcStore.state.route.resources.identifierNo === appName) return;
                                const visitedRoutes = vm.$store.getters['route/visitedRoutes'];
                                if (visitedRoutes.length) vm.$router.push(visitedRoutes[0]);
                                else {
                                    $router.push({
                                        path: '/space/erdc-ppm-issue',
                                        query: {
                                            pid: $route.query.pid
                                        }
                                    });
                                }
                            });
                            localStorage.setItem('change:project:createOid', responseData);
                            globalUtils.openPage({
                                routeConfig,
                                appName
                            });
                        } else {
                            vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                if (ErdcStore.state.route.resources.identifierNo === 'erdc-project-web') return;
                                const visitedRoutes = vm.$store.getters['route/visitedRoutes'];
                                if (visitedRoutes.length) vm.$router.push(visitedRoutes[0]);
                                else {
                                    $router.push({
                                        path: '/erdc-ppm-issue'
                                    });
                                }
                            });
                            let { name: title } = vm.$refs.detail[0].$refs.beforeForm.formData || {};
                            let pid = vm.$route.query?.pid || vm.formData?.projectRef;
                            const path = '/space/erdc-ppm-issue/issue/detail';
                            const appName = 'erdc-project-web';
                            const ErdcStore = require('erdcloud.store');
                            const query = {
                                title,
                                pid,
                                oid: responseData
                            };
                            ErdcStore.state.route.resources.identifierNo !== appName
                                ? window.open(
                                      `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(path, query)}`,
                                      appName
                                  )
                                : $router.push({
                                      path,
                                      query
                                  });
                        }
                    },
                    beforeCancel({ goBack }) {
                        goBack();
                    }
                }
            },
            edit: {
                title: i18nMappingObj.editIssue,
                editableAttr: ['identifierNo'],
                tabs: [
                    {
                        name: i18nMappingObj.detailInfo,
                        activeName: 'detail'
                    },
                    {
                        name: i18nMappingObj.related,
                        activeName: 'related',
                        basicProps: {
                            relatedData: [
                                {
                                    businessKey: 'task'
                                },
                                {
                                    businessKey: 'issue'
                                },
                                {
                                    businessKey: 'risk'
                                },
                                {
                                    businessKey: 'require'
                                }
                            ]
                        },
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/Related/index.js')
                        )
                    },
                    {
                        name: i18nMappingObj.associated,
                        activeName: 'passiveLinkRelated',
                        basicProps: {
                            relatedData: [
                                {
                                    routerName: 'taskDetail',
                                    businessKey: 'passiveLinkTask'
                                },
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
                            ]
                        },
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/Related/index.js')
                        )
                    }
                ],
                formHeight: 'calc(100% - 12px)',
                layoutName: 'UPDATE',
                slots: {
                    formBefore: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                    ),
                    formSlots: {
                        files: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        ),
                        proposer: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/SubmitterSelect/index.js')
                        )
                    }
                },
                modelMapper: {
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'typeReference': (data) => {
                        return data['typeReference']?.oid || '';
                    },
                    'projectRef': (data) => {
                        return data['projectRef'].displayName;
                    },
                    'proposer': (data) => {
                        return data['proposer'].users;
                    }
                },
                props: {
                    formBefore: {
                        checkNameTips: i18nMappingObj.pleaseEnterIssueName
                    },
                    formSlotsProps({ formData }) {
                        return {
                            files: {
                                operationConfigName: 'PPM_ATTACH_PER_OP_MENU'
                            },
                            proposer: {
                                showType: ['USER'],
                                handleChange(userInfo) {
                                    if (userInfo && userInfo.length) {
                                        userInfo = userInfo[0];
                                        formData.organizationRef = userInfo.orgIds?.[0] || '';
                                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                        formData.organizationRef_defaultValue = {
                                            oid: userInfo?.orgIds?.[0] || '',
                                            displayName: userInfo?.orgName?.split(';')[0] || ''
                                        };
                                    } else {
                                        formData.organizationOid = '';
                                        formData.organizationRef = '';
                                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                        formData.organizationRef_defaultValue = {};
                                    }
                                }
                            }
                        };
                    }
                },
                hooks: {
                    beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                        formData?.attrRawList.some((el) => {
                            if (el.attrName === 'projectManager' && Array.isArray(el.value)) {
                                el.value = el.value[0].oid;
                                return;
                            }
                        });
                        formData?.attrRawList.some((el) => {
                            if (el.attrName === 'proposer' && Array.isArray(el.value)) {
                                el.value = el.value[0].oid;
                                return;
                            }
                        });
                        // 所属部门参数处理
                        formData.attrRawList.push({
                            attrName: 'organizationRef',
                            value: _.isArray(vm.formData?.organizationRef?.value)
                                ? vm.formData?.organizationRef?.value?.[0]
                                : vm.formData?.organizationRef
                        });
                        formData.attrRawList = formData?.attrRawList.filter((item) => item.attrName !== 'files');
                        // 保存草稿
                        if (isSaveDraft) {
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.isDraft = true;
                        }
                        let oid = vm.$store.state.space.object.containerRef || {};
                        formData.containerRef = oid;
                        next(formData, i18nMappingObj.issueEditSuccessfully);
                    },
                    afterSubmit: function ({ responseData, vm }) {
                        const router = require('erdcloud.router');
                        const { $router, $route } = router.app;
                        vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                            $router.push({
                                path: '/space/erdc-ppm-issue/issue/detail',
                                query: {
                                    pid: $route.query.pid,
                                    title: vm.formData.name,
                                    oid: responseData,
                                    componentRefresh: true
                                }
                            });
                        });
                    },
                    beforeCancel({ goBack }) {
                        goBack();
                    }
                }
            },
            detail: {
                title: function (formData) {
                    if (!formData.name) return '';
                    return formData.name + '; ' + formData.identifierNo;
                },
                slots: {
                    formSlots: {
                        files: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                        )
                    },
                    formSlotsValue: {
                        files: {
                            formType: 'detail'
                        }
                    }
                },
                modelMapper: {
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'templateInfo.templateReference': (data) => {
                        return data['templateInfo.templateReference'].displayName;
                    },
                    'typeReference': (data) => {
                        return data['typeReference']?.displayName;
                    },
                    'projectRef': (data) => {
                        return data['projectRef'].displayName;
                    },
                    'workLoad': (data) => {
                        return data['workLoad'].displayName;
                    },
                    'organizationRef': (data) => {
                        return data['organizationRef'].displayName;
                    }
                    // 'responsiblePerson': ({ users }) => {
                    //     return users;
                    // },
                    // 'proposer': ({ users }) => {
                    //     return users;
                    // },
                },
                props: {
                    formSlotsProps: {
                        files: {
                            operationConfigName: 'PPM_ATTACH_DETAIL_OP_MENU'
                        }
                    }
                },
                actionKey: 'PPM_ISSUE_OPERATE_MENU',
                formHeight: 'calc(100% - 12px)',
                showSpecialAttr: true,
                keyAttrs: function (formData) {
                    const infoListData = [
                        {
                            name: formData?.['responsiblePerson_defaultValue']?.[0]?.displayName || '',
                            label: i18nMappingObj.personResponsible,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['lifecycleStatus.status'],
                            label: i18nMappingObj.status,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['dueDate']?.split(' ')[0] || '',
                            label: i18nMappingObj.exceptedCompletionTime,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        },
                        {
                            name: formData['projectRef'],
                            label: i18nMappingObj.belongProject,
                            img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                        }
                    ];
                    return infoListData;
                },
                tabs: [
                    {
                        name: i18nMappingObj.detailInfo,
                        activeName: 'detail'
                    },
                    {
                        name: i18nMappingObj.related,
                        activeName: 'related',
                        basicProps: {
                            relatedData: [
                                {
                                    businessKey: 'task'
                                },
                                {
                                    businessKey: 'issue'
                                },
                                {
                                    businessKey: 'risk'
                                },
                                {
                                    businessKey: 'require'
                                }
                            ]
                        },
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/Related/index.js')
                        )
                    },
                    {
                        name: i18nMappingObj.associated,
                        activeName: 'passiveLinkRelated',
                        basicProps: {
                            relatedData: [
                                {
                                    routerName: 'taskDetail',
                                    businessKey: 'passiveLinkTask'
                                },
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
                            ]
                        },
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/Related/index.js')
                        )
                    },
                    {
                        name: i18nMappingObj.handleTask,
                        activeName: 'handleTask',
                        component: ErdcKit.asyncComponent(ELMP.resource('project-handle-task/views/list/index.js')),
                        basicProps: {
                            type: 'related'
                        }
                    },
                    {
                        name: i18nMappingObj.processRecords,
                        activeName: 'processRecords',
                        component: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                        )
                    }
                ],
                layoutName: 'DETAIL',
                hooks: {}
            }
        }
    };
});
