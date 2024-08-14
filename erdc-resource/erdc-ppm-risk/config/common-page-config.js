define([
    'dayjs',
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    ELMP.func('erdc-ppm-risk/locale/index.js')
], function (dayjs, utils, ErdcStore, { i18n }) {
    const ErdcKit = require('erdcloud.kit');
    const i18nMappingObj = utils.languageTransfer(i18n);
    const router = require('erdcloud.router');
    return function (getData) {
        return {
            'erd.cloud.ppm.risk.entity.Risk': {
                create: {
                    title: i18nMappingObj.createRisks,
                    editableAttr: ['grade', 'projectRef'],
                    layoutName: 'CREATE',
                    formHeight: 'calc(100% - 12px)',
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
                    props: {
                        formBefore: {
                            checkNameTips: i18nMappingObj.enterName
                        },
                        formSlotsProps(vm) {
                            let { formData } = vm;
                            return {
                                files: {
                                    operationConfigName: 'PPM_ATTACH_PER_OP_MENU'
                                },
                                proposer: {
                                    showType: ['USER'],
                                    handleChange(userInfo) {
                                        if (userInfo && userInfo.length) {
                                            userInfo = userInfo[0];
                                            // vm.$refs.detail[0].$refs.layoutForm.form.description = '00000000000';
                                            formData.organizationRef = userInfo.orgIds?.[0] || '';
                                            // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                                            formData.organizationRef_defaultValue = {
                                                oid: userInfo?.orgIds?.[0] || '',
                                                displayName: userInfo?.orgName?.split(';')[0] || ''
                                            };

                                            // vm.$refs.detail[0].$refs.layoutForm.form.organizationRef =
                                            //     userInfo.orgIds?.[0] || '';
                                            // vm.$refs.detail[0].$refs.layoutForm.form.organizationRef_defaultValue = {
                                            //     oid: userInfo.orgIds?.[0] || '',
                                            //     displayName: userInfo.orgName || ''
                                            // };
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
                        onFieldChange: function (formData, field) {
                            if (['influenceLevel', 'probability'].includes(field)) {
                                let object = {
                                    LOW: 1,
                                    MIDDLE: 2,
                                    HIGH: 3
                                };
                                let grade = '';
                                if (formData.influenceLevel && formData.probability) {
                                    let num = object[formData.influenceLevel] + object[formData.probability];
                                    if (num < 4) grade = 'LOW';
                                    else if (num === 4) grade = 'MIDDLE';
                                    else grade = 'HIGH';
                                }

                                return (formData = {
                                    ...formData,
                                    grade: grade
                                });
                            }
                            return formData;
                        },
                        beforeEcho: async function (vm) {
                            const store = require('fam:store');
                            const { $route } = router.app;
                            let data = {};

                            let currentUser = store.state.app.user;
                            // 只有在项目空间才会给默认值
                            if (ErdcStore.state?.space) data.projectRef = ErdcStore?.state?.space?.object?.name;

                            // 工作台-流程-评审页面-创建风险是需要将项目带出
                            if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                                if ($route.query.pid) {
                                    data.projectRef = $route.query.projectName;
                                }
                            }

                            data['proposer'] = [currentUser];
                            data.organizationRef = currentUser.orgIds[0] || '';
                            // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                            data.organizationRef_defaultValue = {
                                oid: currentUser.orgIds[0],
                                displayName: currentUser.orgName.split(';')[0]
                            };
                            data['grade'] = 'LOW';
                            data['submitTime'] = dayjs(new Date()).format('YYYY-MM-DD');
                            // setTimeout(() => {
                            //     next(data);
                            // }, 1000);
                            vm.form = data;
                        },

                        beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                            const { $route } = router.app;
                            // formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            formData.attrRawList = formData.attrRawList.map((item) => {
                                if (item.attrName === 'proposer' && item.value instanceof Array)
                                    item.value = item.value[0]?.oid;
                                return item;
                            });
                            let projectInfo = getData();

                            if (ErdcStore.state?.space) {
                                formData.attrRawList.forEach((item) => {
                                    if (item.attrName === 'projectRef') {
                                        item.value = projectInfo.oid;
                                    }

                                    // 这里先测试下
                                    // if (item.attrName === 'proposer') {
                                    //     item.value = item.value.oid;
                                    // }
                                });
                            }
                            // 工作台-流程-评审页面-创建风险
                            if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                                if ($route.query.pid) {
                                    formData.attrRawList.forEach((item) => {
                                        if (item.attrName === 'projectRef') {
                                            item.value = $route.query.pid;
                                        }
                                    });
                                }
                            }

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
                                            $route?.query?.relationClassName ||
                                            'erd.cloud.ppm.common.entity.BusinessLink',
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
                            // 项目变更-风险创建
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
                            let tip = isSaveDraft ? i18nMappingObj.draftSuccessfully : i18nMappingObj.riskSuccessfully;
                            let oid = vm.$store.state?.space?.object?.containerRef;
                            // 从工作台创建 需要将选中的项目id拿到进行获取项目信息然后取到项目中的organizationRef
                            if (oid) {
                                formData.containerRef = oid;
                                next(formData, tip);
                            } else {
                                let currentProjectId =
                                    _.find(formData.attrRawList, { attrName: 'projectRef' })?.value || '';
                                utils.getProjectData(currentProjectId).then((res) => {
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
                                        let pathObj = utils.getDiscreteTaskPath('list');
                                        erdcKit.open(pathObj.path, {
                                            appName: pathObj.appName
                                        });
                                    }
                                });
                                localStorage.setItem('change:project:createOid', responseData);
                                utils.openPage({
                                    routeConfig,
                                    appName
                                });
                            } else {
                                let { name: title } = vm.$refs.detail[0].$refs.beforeForm.formData || {};
                                vm.$store.dispatch('route/delVisitedRoute', $route).then(() => {
                                    let params = {
                                        oid: responseData
                                    };
                                    // 工作台创建完后要跳转到项目空间里，需要带上项目的id
                                    if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                                        $router.push({
                                            path: '/erdc-ppm-risk/myRisk/list'
                                        });
                                        params.pid = vm.formData.projectRef;
                                        const appName = 'erdc-project-web';
                                        const targetPath = '/space/erdc-ppm-risk/detail';
                                        let query = {
                                            pid: vm.formData.projectRef,
                                            oid: responseData
                                        };
                                        // path组装query参数
                                        let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                                        window.open(url, appName);
                                    } else {
                                        $router.push({
                                            path: '/space/erdc-ppm-risk/detail',
                                            params,
                                            query: {
                                                pid: $route.query.pid,
                                                title,
                                                oid: responseData
                                            }
                                        });
                                    }
                                });
                            }

                            // cancel();
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                },
                edit: {
                    title: i18nMappingObj.editRisks,
                    formHeight: 'calc(100% - 12px)',
                    editableAttr: ['projectRef', 'grade'],
                    tabs: [
                        {
                            name: i18nMappingObj.detailedInformation,
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
                            name: i18nMappingObj.isRelated,
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
                        // {
                        //     name: '督办任务',
                        //     activeName: 'handleTask',
                        //     component: ErdcKit.asyncComponent(ELMP.resource('project-handle-task/index.js'))
                        // },
                        // {
                        //     name: '流程记录',
                        //     activeName: 'processRecords',
                        //     component: ErdcKit.asyncComponent(
                        //         ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                        //     )
                        // }
                    ],
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
                    props: {
                        formBefore: {
                            checkNameTips: i18nMappingObj.riskSuccessfully
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
                                            formData.organizationRef_defaultValue = {};
                                        }
                                    }
                                }
                            };
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
                            return data['projectRef']?.displayName || '';
                        },
                        'organizationRef': (e, data) => {
                            return data['organizationRef']?.displayName;
                        },
                        'proposer': (data) => {
                            return data['proposer']?.users || [];
                        }
                    },
                    hooks: {
                        onFieldChange: function (formData, field) {
                            if (['influenceLevel', 'probability'].includes(field)) {
                                let object = {
                                    LOW: 1,
                                    MIDDLE: 2,
                                    HIGH: 3,
                                    低: 1,
                                    中: 2,
                                    高: 3
                                };
                                let grade = '';
                                if (formData.influenceLevel && formData.probability) {
                                    let num = object[formData.influenceLevel] + object[formData.probability];
                                    if (num < 4) grade = 'LOW';
                                    else if (num === 4) grade = 'MIDDLE';
                                    else grade = 'HIGH';
                                }

                                return (formData = {
                                    ...formData,
                                    grade: grade
                                });
                            }
                            return formData;
                        },
                        beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                            let projectInfo = getData();
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'projectRef') {
                                    el.value = projectInfo.oid;
                                }
                            });
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
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }
                            let { id, key } = getData()?.containerRef || {};
                            formData.containerRef = `OR:${key}:${id}`;
                            next(formData, i18nMappingObj.riskEditSuccessfully);
                        },
                        afterSubmit: function ({ responseData, vm }) {
                            const router = require('erdcloud.router');
                            const { $router, $route } = router.app;
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                $router.push({
                                    path: '/space/erdc-ppm-risk/detail',
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
                        return formData.name + '; ' + formData.identifierNo;
                    },
                    showSpecialAttr: true,
                    formHeight: 'calc(100% - 12px)',
                    actionKey: 'PPM_RISK_OPERATE_MENU',
                    slots: {
                        formSlots: {
                            files: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                            )
                        }
                    },
                    props: {
                        formSlotsProps: {
                            files: {
                                operationConfigName: 'PPM_ATTACH_DETAIL_OP_MENU'
                            }
                        }
                    },
                    keyAttrs: function (formData) {
                        const infoListData = [
                            {
                                name: formData?.['responsiblePerson_defaultValue']?.[0]?.displayName || '',
                                label: i18nMappingObj.leading,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['lifecycleStatus.status'],
                                label: i18nMappingObj.status,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_o.png')
                            },
                            {
                                name: formData['dueDate']?.split(' ')[0] || '',
                                label: i18nMappingObj.expectedCompletionTime,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_s.png')
                            },
                            {
                                name: formData['projectRef'],
                                label: i18nMappingObj.project,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_t.png')
                            }
                        ];
                        return infoListData;
                    },
                    tabs: [
                        {
                            name: i18nMappingObj.detailedInformation,
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
                            name: i18nMappingObj.isRelated,
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
                            name: i18nMappingObj.supervisionTasks,
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
                        'dueDate': (data) => {
                            return data['dueDate']?.displayName;
                        },
                        'projectRef': (data) => {
                            return data['projectRef']?.displayName;
                        },
                        'organizationRef': ({ displayName }) => {
                            return displayName;
                        }
                    },
                    hooks: {}
                }
            }
        };
    };
});
