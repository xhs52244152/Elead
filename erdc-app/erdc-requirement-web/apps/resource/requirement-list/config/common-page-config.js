define([ELMP.resource('ppm-utils/index.js'), ELMP.resource('requirement-list/locale/index.js')], function (
    ppmUtils,
    locale
) {
    const ErdcKit = require('erdcloud.kit');
    const store = require('erdcloud.store');
    const i18n = ppmUtils.languageTransfer(locale.i18n);
    let getConfigs = function (getData) {
        return {
            'erd.cloud.ppm.require.entity.Requirement': {
                create: {
                    title: i18n.createReq,
                    layoutName: 'CREATE',
                    showDraftBtn: false,
                    formHeight: 'calc(100% - 12px)',
                    slots: {
                        formBefore: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                        ),
                        formSlots: {
                            'status': {
                                template: `<div>${i18n.planning}</div>`,
                                data() {
                                    return {};
                                }
                            },
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                            ),
                            'proposer': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/SubmitterSelect/index.js')
                            ),
                            'parent-requirement': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ParentTask/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            checkNameTips: i18n.inputReqNameTips,
                            getContainerRef: utils.getContainerRef
                        },
                        formSlotsProps({ formData }) {
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            return {
                                'proposer': {
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
                                },
                                'files': {
                                    operationConfigName: 'PPM_ATTACH_PER_OP_MENU'
                                },
                                'parent-requirement': {
                                    currentObjectOid: '',
                                    params: {
                                        className: 'erd.cloud.ppm.require.entity.Requirement',
                                        projectOid: $route.query.pid,
                                        requireOid: ''
                                    }
                                }
                            };
                        }
                    },
                    hooks: {
                        beforeEcho: async function (vm) {
                            const dayjs = require('dayjs');
                            let data = {};
                            let currentUser = store.state?.app?.user || '';
                            data.proposer = [currentUser];
                            data.organizationRef = currentUser.orgIds?.[0] || '';
                            data.organizationOid = currentUser.orgIds?.[0] || '';
                            // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                            data.organizationRef_defaultValue = {
                                oid: currentUser.orgIds[0],
                                displayName: currentUser.orgName.split(';')[0]
                            };
                            // 提出时间默认当天
                            data.submitTime = dayjs(new Date()).format('YYYY-MM-DD');

                            vm.form = data;
                        },
                        beforeSubmit: async function ({ formData, next, isSaveDraft, vm }) {
                            // 数据格式处理
                            formData = utils.commonDataHandler(formData, getData, 'create');
                            // 如果是当前应用内跳转就不需要再跳转，这种情况只针对跨应用跳转
                            const ErdcStore = require('erdcloud.store');
                            let isProjectSpace = ErdcStore.state.route.resources.identifierNo === 'erdc-project-web';
                            if (!isProjectSpace) formData.containerRef = await utils.getContainerRef();

                            formData.attrRawList = formData.attrRawList.map((item) => {
                                if (item.attrName === 'proposer' && item.value instanceof Array)
                                    item.value = item.value[0]?.oid;
                                return item;
                            });
                            // 组织参数处理
                            formData.attrRawList.push({
                                attrName: 'organizationRef',
                                value: vm.formData.organizationRef
                            });

                            // 项目oid处理
                            formData.attrRawList.push({
                                attrName: 'projectRef',
                                value: formData.oid
                            });
                            delete formData.oid;
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? i18n.draftSuccessfully : i18n.reqSuccessfully;

                            next(formData, tip);
                        },
                        afterSubmit: function ({ vm, responseData, cancel }) {
                            const router = require('erdcloud.router');
                            const { $router, $route } = router.app;
                            vm.$store.dispatch('route/delVisitedRoute', $route);
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
                                        let pathObj = ppmUtils.getDiscreteTaskPath('list');
                                        erdcKit.open(pathObj.path, {
                                            appName: pathObj.appName
                                        });
                                    }
                                });
                                localStorage.setItem('change:project:createOid', responseData);
                                ppmUtils.openPage({
                                    routeConfig,
                                    appName
                                });
                            } else {
                                let pid = vm.$route.query.pid;
                                // 延迟500毫秒调跳转,因为后端在保存责任人这个字段有延迟，如果立即跳转有时候详情接口不会返回责任人字段
                                setTimeout(() => {
                                    $router.push({
                                        path: pid
                                            ? `/space/requirement-list/require/detail`
                                            : `/requirement-list/require/detail`,
                                        query: {
                                            oid: responseData,
                                            pid: vm.$route.query.pid
                                        }
                                    });
                                }, 500);
                            }
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                },
                edit: {
                    title: i18n.editReq,
                    showDraftBtn: false,
                    editableAttr: ['identifierNo'],
                    formHeight: 'calc(100% - 12px)',
                    tabs: () => {
                        const router = require('erdcloud.router');
                        const { $route } = router.app;
                        const query = {
                            isCreateRelation: true,
                            roleAObjectRef: $route?.query?.oid,
                            pid: $route?.query?.pid || '',
                            relationClassName: 'erd.cloud.ppm.common.entity.BusinessLink'
                        };
                        return [
                            {
                                name: i18n.detailedInformation,
                                activeName: 'detail'
                            },
                            {
                                name: i18n.related,
                                activeName: 'related',
                                basicProps: {
                                    relatedData: [
                                        {
                                            businessKey: 'task'
                                        },
                                        {
                                            businessKey: 'issue',
                                            createPageRoute: {
                                                path: '/erdc-ppm-issue/issue/create',
                                                query
                                            }
                                        },
                                        {
                                            businessKey: 'risk',
                                            createPageRoute: {
                                                path: '/erdc-ppm-risk/create',
                                                query
                                            }
                                        },
                                        {
                                            businessKey: 'require',
                                            createPageRoute: {
                                                path: '/requirement-list/require/create',
                                                query
                                            }
                                        }
                                    ]
                                },
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('ppm-component/ppm-components/Related/index.js')
                                )
                            },
                            {
                                name: i18n.isRelated,
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
                        ];
                    },
                    layoutName: 'UPDATE',
                    slots: {
                        formBefore: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')
                        ),
                        formSlots: {
                            'status': {
                                props: {
                                    value: String
                                },
                                template: `<div>{{ value }}</div>`,
                                data() {
                                    return {};
                                }
                            },
                            'files': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                            ),
                            'projects': ErdcKit.asyncComponent(
                                ELMP.resource('requirement-list/components/AssProject/index.js')
                            ),
                            'proposer': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/SubmitterSelect/index.js')
                            ),
                            'parent-requirement': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ParentTask/index.js')
                            )
                        }
                    },
                    props: {
                        formBefore: {
                            checkNameTips: i18n.inputReqNameTips
                        },
                        formProps: {
                            customAssemblyData({ rawData }) {
                                return {
                                    status: rawData['lifecycleStatus.status'],
                                    projects: rawData['oid']
                                };
                            }
                        },
                        formSlotsProps({ formData }) {
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            return {
                                'proposer': {
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
                                },
                                'files': {
                                    operationConfigName: 'PPM_ATTACH_PER_OP_MENU'
                                },
                                'parent-requirement': {
                                    currentObjectOid: formData?.parentRequirement,
                                    params: {
                                        className: 'erd.cloud.ppm.require.entity.Requirement',
                                        projectOid: $route.query.pid,
                                        requireOid: $route.query.oid
                                    }
                                }
                            };
                        }
                    },
                    modelMapper: {
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'status': (data) => {
                            return data['status']?.displayName;
                        },
                        'projects': (data) => {
                            return data['oid']?.value;
                        },
                        'typeReference': (data) => {
                            return data['typeReference']?.oid || '';
                        },
                        'proposer': (data) => {
                            return data['proposer']?.users || [];
                        },
                        'parentRequirement': (data) => {
                            return data['parentRequirement']?.oid;
                        }
                    },
                    hooks: {
                        beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                            // 数据格式处理
                            formData = utils.commonDataHandler(formData, getData);
                            // 组织参数处理
                            formData.attrRawList.push({
                                attrName: 'organizationRef',
                                value: _.isArray(vm.formData?.organizationRef?.value)
                                    ? vm.formData?.organizationRef?.value?.[0]
                                    : vm.formData?.organizationRef
                            });

                            // 保存草稿
                            if (isSaveDraft) {
                                formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                                formData.isDraft = true;
                            }
                            next(formData, i18n.reqEditSuccessfully);
                        },
                        afterSubmit: function ({ cancel }) {
                            // 打开提示弹窗
                            cancel();
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                },
                detail: {
                    title: function (formData) {
                        return formData.name ? formData.name + '; ' + formData.identifierNo : '--; --';
                    },
                    actionKey: function () {
                        const ErdcStore = require('erdcloud.store');
                        let identifierNo = ErdcStore.state.route.resources.identifierNo;
                        let actionKeyMap = {
                            'erdc-requirement-web': 'PPM_REQUIRE_OPERATE_MENU',
                            'erdc-portal-web': 'PPM_REQUIREMENT_OPREATE_DETAIL',
                            'erdc-project-web': 'PPM_REQUIRE_OPERATE_MENU'
                        };
                        return actionKeyMap[identifierNo];
                    },
                    tabs: () => {
                        const router = require('erdcloud.router');
                        const { $route } = router.app;
                        let sceneName = $route.meta.sceneName;
                        let flag = sceneName == 'requireLibrary' || sceneName == 'projectDataRequirement';
                        const query = {
                            isCreateRelation: true,
                            roleAObjectRef: $route?.query?.oid,
                            pid: $route?.query?.pid || '',
                            relationClassName: 'erd.cloud.ppm.common.entity.BusinessLink'
                        };
                        return [
                            {
                                name: i18n.detailedInformation,
                                activeName: 'detail'
                            },
                            {
                                name: i18n.related,
                                activeName: 'related',
                                basicProps: {
                                    relatedData: [
                                        {
                                            businessKey: 'task'
                                        },
                                        {
                                            businessKey: 'issue',
                                            createPageRoute: {
                                                path: '/erdc-ppm-issue/issue/create',
                                                query
                                            }
                                        },
                                        {
                                            businessKey: 'risk',
                                            createPageRoute: {
                                                path: '/erdc-ppm-risk/create',
                                                query
                                            }
                                        },
                                        {
                                            businessKey: 'require',
                                            createPageRoute: {
                                                path: '/requirement-list/require/create',
                                                query
                                            }
                                        }
                                    ]
                                },
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('ppm-component/ppm-components/Related/index.js')
                                )
                            },
                            {
                                name: i18n.isRelated,
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
                                name: i18n.supervisionTasks,
                                activeName: 'handleTask',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-handle-task/views/list/index.js')
                                ),
                                basicProps: {
                                    type: 'related'
                                }
                            },
                            {
                                name: i18n.processRecords,
                                activeName: 'processRecords',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                                )
                            }
                        ];
                    },
                    props: {
                        formSlotsProps: {
                            files: {
                                operationConfigName: 'PPM_ATTACH_DETAIL_OP_MENU'
                            }
                        },
                        formProps: {
                            customAssemblyData({ rawData }) {
                                return {
                                    status: rawData['lifecycleStatus.status'],
                                    projects: rawData['oid']
                                };
                            }
                        }
                    },
                    formHeight: 'calc(100% - 12px)',
                    showSpecialAttr: true,
                    keyAttrs: function (formData) {
                        console.log(formData);
                        const infoListData = [
                            {
                                name: formData.proposer_defaultValue?.[0]?.displayName || '',
                                label: i18n.proposer,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['lifecycleStatus.status'],
                                label: i18n.status,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['expectCompletionTime']?.split(' ')[0] || '',
                                label: i18n.expectedCompletionTime,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_s.png')
                            },
                            {
                                name: formData['submitTime']?.split(' ')[0] || '',
                                label: i18n.proposedTime,
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_t.png')
                            }
                        ];
                        return infoListData;
                    },
                    slots: {
                        formSlots: {
                            files: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                            ),
                            projects: ErdcKit.asyncComponent(
                                ELMP.resource('requirement-list/components/AssProject/index.js')
                            )
                        }
                    },
                    layoutName: 'DETAIL',
                    modelMapper: {
                        'organizationRef': (data) => {
                            return data['organizationRef']?.displayName;
                        },
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (data) => {
                            return data['templateInfo.templateReference'].displayName;
                        },
                        'projects': (data) => {
                            return data['oid']?.value;
                        },
                        'typeReference': (data) => {
                            return data['typeReference']?.displayName;
                        },
                        'projectRef': (data) => {
                            return data['projectRef']?.displayName;
                        },
                        'parentRequirement': (data) => {
                            return data['parentRequirement']?.displayName;
                        },
                        'submitTime': (data) => {
                            return data['submitTime']?.displayName;
                        },
                        'expectCompletionTime': (data) => {
                            return data['expectCompletionTime']?.displayName;
                        }
                    },
                    hooks: {}
                }
            }
        };
    };

    let utils = {
        commonDataHandler(formData, getData, type = '') {
            const router = require('erdcloud.router');
            const { $route } = router.app;
            let newFormData = ErdcKit.deepClone(formData);
            newFormData.attrRawList = newFormData.attrRawList
                .filter((filterData) => {
                    return filterData.attrName !== 'parentRequirement';
                })
                .map((data) => {
                    if (data.attrName === 'projectManager') {
                        if (Array.isArray(data.value)) {
                            data.value = data.value?.[0]?.oid;
                        }
                    } else if (data.attrName === 'parent-requirement') {
                        data.attrName = 'parentRequirement';
                    }
                    return data;
                });

            // 文件处理
            let files = _.find(newFormData.attrRawList, { attrName: 'files' })?.value || [];
            if (files && files.length && type === 'create') {
                newFormData.contentSet = files.map((id) => {
                    return {
                        id,
                        actionFlag: 1,
                        source: 0,
                        role: 'SECONDARY'
                    };
                });
            }

            let relationList = [];
            // 父节点参数处理
            let parentRequirement = _.find(newFormData.attrRawList, { attrName: 'parentRequirement' })?.value || [];
            relationList.push({
                className: 'erd.cloud.ppm.require.entity.RequirementLink',
                attrRawList: [
                    {
                        attrName: 'roleAObjectRef',
                        value: parentRequirement
                    }
                ]
            });
            // 项目参数处理
            let contextInfo = getData();
            contextInfo &&
                contextInfo.oid &&
                relationList.push({
                    className: 'erd.cloud.ppm.require.entity.RequirementAssignLink',
                    attrRawList: [
                        {
                            attrName: 'roleAObjectRef',
                            value: contextInfo.oid
                        }
                    ]
                });

            // 如果是从关联页面创建问题
            if ($route?.query?.isCreateRelation) {
                relationList.push({
                    attrRawList: [
                        {
                            attrName: 'roleAObjectRef',
                            value: $route?.query?.roleAObjectRef
                        }
                    ],
                    className: $route?.query?.relationClassName || 'erd.cloud.ppm.common.entity.BusinessLink'
                });
            }
            // 项目变更-需求创建
            if ($route.query.createType === 'projectChange' && $route.query.changeOid) {
                relationList.push({
                    action: 'CREATE',
                    attrRawList: [
                        {
                            attrName: 'roleAObjectRef',
                            value: $route.query.changeOid
                        }
                    ],
                    className: 'erd.cloud.ppm.change.entity.AffectedData'
                });
            }
            if (relationList.length > 0) {
                newFormData.associationField = 'roleBObjectRef';
            }
            newFormData.relationList = relationList;

            // 移除部分不需要的参数
            newFormData.attrRawList = newFormData.attrRawList.filter((item) => {
                return !['files', 'status', 'parentRequirement'].includes(item.attrName);
            });

            return newFormData;
        },
        // 获取需求空间ContainerRef
        getContainerRef() {
            const axios = require('fam:http');
            // 如果是当前应用内跳转就不需要再跳转，这种情况只针对跨应用跳转
            const ErdcStore = require('erdcloud.store');
            let isProjectSpace = ErdcStore.state.route.resources.identifierNo === 'erdc-project-web';
            return axios({
                url: '/fam/peferences/RequirementPoolContainerRef',
                method: 'GET'
            }).then((resp) => {
                return isProjectSpace ? 'default' : resp.data;
            });
        }
    };

    return getConfigs;
});
