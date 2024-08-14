define([
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-workflow-resource/locale/index.js')
], function (commonActionsUtils, ppmUtils, { i18nMappingObj }) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const utils = {
        commonProjectConfig: function () {
            return {
                className: 'erd.cloud.ppm.project.entity.Project',
                props: {
                    showTable: false,
                    slots: {
                        beforeTable: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                        )
                    },
                    slotsProps: {
                        beforeTable: {
                            className: 'erd.cloud.ppm.project.entity.Project',
                            modelMapper: {
                                'lifecycleStatus.status': (data) => {
                                    return data['lifecycleStatus.status']?.displayName;
                                },
                                'templateInfo.templateReference': (data) => {
                                    return data['templateInfo.templateReference']?.displayName || '';
                                },
                                'typeReference': (data) => {
                                    return data['typeReference']?.displayName || '';
                                },

                                'productLineRef': (data) => {
                                    return data['productLineRef']?.displayName || '';
                                },
                                'projectRef': (data) => {
                                    return data['projectRef']?.displayName || '';
                                }
                            }
                        }
                    }
                },
                methods: {
                    getData({ customFormData, processKey }) {
                        let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                        return customFormData?.formJson ? customFormData.formJson : businessData;
                    }
                },
                hooks: {
                    setBeforeCreate(vm) {
                        utils.registerRoleInfo(vm);
                    }
                }
            };
        },
        commonTaskConfig: function () {
            return {
                className: 'erd.cloud.ppm.plan.entity.Task',
                props: {
                    showTable: false,
                    slots: {
                        beforeTable: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                        )
                    },
                    slotsProps: {
                        beforeTable: {
                            className: 'erd.cloud.ppm.plan.entity.Task',
                            modelMapper: {
                                'lifecycleStatus.status': (data) => {
                                    return data['lifecycleStatus.status']?.displayName;
                                },
                                'typeReference': (data) => {
                                    return data['typeReference'].displayName;
                                },
                                'projectRef': (data) => {
                                    return data['projectRef'].displayName;
                                },
                                'parentTask': (data) => {
                                    return data['parentTask'].displayName;
                                },
                                'collectRef': (data) => {
                                    return data['collectRef'].displayName;
                                },
                                'resAssignments': (data) => {
                                    return data['resAssignments'].displayName;
                                },
                                'reviewPointRef': (data) => {
                                    return data['reviewPointRef'].displayName;
                                }
                            }
                        }
                    }
                },
                methods: {
                    // 业务对象数据
                    getData: (vm) => utils.commonGetData(vm)
                },
                hooks: {
                    setBeforeCreate(vm) {
                        utils.registerRoleInfo(vm);
                    },
                    beforeSubmitFinalData({ data, vm, resolve }) {
                        if (vm.processStep === 'launcher') {
                            let checkData = {
                                taskOidList: vm.businessData.map((item) => {
                                    return item.oid;
                                }),
                                sign: vm.processInfos.key
                            };
                            commonActionsUtils.commonCheckPreTaskTime(vm, checkData, () => {
                                resolve(data);
                            });
                        } else {
                            resolve(data);
                        }
                    }
                }
            };
        },
        commonGetData: function (vm) {
            let { processKey, customFormData } = vm;
            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
            let result = customFormData?.formJson ? customFormData.formJson : businessData;
            let configProps = store.state.commonBusinessConfig[processKey].props;
            // 批量发起要展示表格
            if (result.length > 1) {
                configProps.showTable = true;
                configProps.slots.beforeTable = '';
            } else {
                configProps.showTable = false;
                configProps.slots.beforeTable = ErdcKit.asyncComponent(
                    ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                );
            }
            return result;
        },
        commonRequireConfig: function () {
            return {
                className: 'erd.cloud.ppm.require.entity.Requirement',
                props: {
                    showTable: false,
                    slots: {
                        beforeTable: ErdcKit.asyncComponent(
                            ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                        )
                    },
                    slotsProps: {
                        beforeTable: {
                            className: 'erd.cloud.ppm.require.entity.Requirement',
                            formSlots: {
                                'files': ErdcKit.asyncComponent(
                                    ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')
                                ),
                                'projects': ErdcKit.asyncComponent(
                                    ELMP.resource('requirement-list/components/AssProject/index.js')
                                ),
                                'identifier-no': ErdcKit.asyncComponent(
                                    ELMP.resource('ppm-workflow-resource/components/commonIdentifierNo/index.js')
                                )
                            },
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
                                    return data['projectRef']?.displayName;
                                },
                                'submitTime': (data) => {
                                    return data['submitTime']?.displayName;
                                },
                                'expectCompletionTime': (data) => {
                                    return data['expectCompletionTime']?.displayName;
                                }
                            }
                        }
                    }
                },
                methods: {
                    // 业务对象数据
                    getData(vm) {
                        return utils.commonGetData(vm);
                    }
                },
                hooks: {
                    setBeforeCreate(vm) {
                        utils.registerRoleInfo(vm);
                    }
                }
            };
        },
        // 自定义流程选人
        registerRoleInfo: function (vm, changeUrlConfig) {
            let { processKey, businessData } = vm;
            let oid = businessData.map((item) => {
                return item.oid;
            });
            const getRoleInfo = async (row) => {
                if (row.memberType === 'ROLE') {
                    let result = await getRoleRequest(oid, row.parentId);
                    return result;
                } else {
                    return [];
                }
            };
            const echoPerson = async (data) => {
                for (let i = 0; i < data.length; i++) {
                    let tableData = data[i]?.tableData || [];
                    for (let j = 0; j < tableData.length; j++) {
                        let roleInfo = tableData[j];
                        if (roleInfo.memberType === 'ROLE') {
                            let result = await getRoleRequest(oid, roleInfo.parentId);
                            // 如果只有一个人就回显，否则不会显
                            roleInfo.participantRef = result.map((item) => {
                                return item.oid;
                            });
                            roleInfo.participantRefList = result;
                        }
                    }
                }
                return data;
            };
            // 回显责任人
            vm.$store.dispatch('bpmProcessPanel/setAfterEcho', {
                key: processKey,
                processState: vm.processStep,
                resource: {
                    handlerConf: echoPerson
                }
            });
            // 点击下拉选择人员触发的方法
            vm.$store.dispatch('bpmProcessPanel/setTeamMember', {
                key: processKey,
                func: getRoleInfo
            });
            function getRoleRequest(businessOidList, roleOid) {
                let urlConfig = {
                    url: '/ppm/communal/getUsersForWorkflow',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    method: 'POST',
                    data: {
                        businessOidList,
                        roleOid
                    }
                };
                if (_.isFunction(changeUrlConfig)) {
                    urlConfig = changeUrlConfig(urlConfig);
                }
                return new Promise((resolve) => {
                    vm.$famHttp(urlConfig).then((res) => {
                        resolve(res.data || []);
                    });
                });
            }
        },
        // 注册技术评审流程或决策评审流程人员信息
        registerTROrDCPRoleInfo: function (vm, Data) {
            let businessData = Data;
            const stateMaps = ['launcher', 'draft'];
            stateMaps.forEach((state) => {
                vm.$store.dispatch('bpmProcessPanel/setAfterEcho', {
                    key: vm.processKey,
                    processState: state,
                    resource: {
                        handlerConf: getMethod
                    }
                });
            });
            async function getMethod(data) {
                let reviewRolePrincipals = businessData?.[0]?.reviewRolePrincipals || {};
                // 如果是草稿页面就重新掉接口获取人员信息，防止团队人员改变数据不正确
                if (Object.keys(vm.draftInfos).length !== 0) {
                    const customformJson = vm.draftInfos?.baseStartProcessDto?.customformJson;
                    let urlConfig = {};
                    if (typeof customformJson === 'string') {
                        urlConfig = JSON.parse(customformJson)?.formJson?.[0].urlConfig || {};
                    }
                    reviewRolePrincipals = await getRoleInfo(urlConfig);
                }
                // const resData = businessData?.[0]?.reviewRolePrincipals?.responsibilityRoleRef || [];
                // const roleData = businessData?.[0]?.reviewRolePrincipals?.reviewRoleRef || [];
                const { responsibilityRoleRef: resData, reviewRoleRef: roleData } = reviewRolePrincipals;
                if ((resData?.length || roleData?.length) && data?.length) {
                    const mapParticipant = (ol) => ol.oid;
                    // const mapParticipantList = (ol) => ol;
                    const participantRef = resData.map(mapParticipant);
                    // const participantRefList = resData.map(mapParticipantList);
                    const roleDataRef = roleData.map(mapParticipant);
                    // const roleDataRefList = roleData.map(mapParticipantList);
                    data.forEach((el) => {
                        if (el.nodeKey === 'Submittals') {
                            el.tableData[0].participantRef = participantRef;
                            el.tableData[0].participantRefList = resData;
                        }
                        if (el.nodeKey === 'SelfCheck') {
                            el.tableData[0].participantRef = roleDataRef;
                            el.tableData[0].participantRefList = roleData;
                        }
                    });
                }
                return data;
            }
            function getRoleInfo(urlConfig) {
                return new Promise((resolve, reject) => {
                    vm.$famHttp({
                        url: '/ppm/review/findReviewData/',
                        method: 'post',
                        ...urlConfig
                    })
                        .then((res) => {
                            resolve(res.data?.reviewRolePrincipals || {});
                        })
                        .catch(() => {
                            reject({});
                        });
                });
            }
        },
        commonChangeConfig: function () {
            return {
                props: {
                    showTable: false,
                    title: i18nMappingObj.businessForm,
                    slots: {
                        beforeTable: ErdcKit.asyncComponent(
                            ELMP.func('erdc-ppm-project-change/components/BusinessForm/index.js')
                        )
                    },
                    businessKey: 'typeOid',
                    actionName: 'startChangeProcess'
                },
                methods: {
                    getData: function (vm) {
                        let reviewItemList = vm.draftInfos?.baseForm?.businessForm?.reviewItemList || [];
                        let { processKey, customFormData } = vm;
                        let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                        let result = customFormData?.formJson ? customFormData.formJson : businessData || [{}];
                        const pboLinkDtos = vm.processInfos?.pboLinkDtos || [];
                        const pboLinkArr = pboLinkDtos.filter((item) => item.linkType === 'REVIEW');
                        if (pboLinkArr.length && result.length) {
                            result[0].roleBObjectRef = pboLinkArr[0].roleBObjectRef;
                        } else if (reviewItemList.length > 0) {
                            result[0].roleBObjectRef = reviewItemList[0].oid;
                        }
                        return result;
                    }
                },
                hooks: {
                    beforeSubmit(vm, type) {
                        return new Promise((resolve) => {
                            vm.$refs.beforeTable
                                .validate(type)
                                .then((result) => {
                                    resolve(result);
                                })
                                .catch((err) => {
                                    resolve(err);
                                });
                        });
                    },
                    beforeSubmitValidate(vm, result) {
                        let data = JSON.parse(result);
                        let valid = data?.formJson?.[0]?.valid;
                        let message = data?.formJson?.[0]?.message;
                        return {
                            data: result,
                            valid: valid === undefined,
                            message: message ? message : ''
                        };
                    },
                    beforeSubmitFinalData({ vm, resolve, originData }) {
                        if (vm.processStep === 'launcher') {
                            // 将流程标题存储在customformJson中传给后端
                            let processTitle = originData.baseForm.processBasicInfo.processName;
                            let customFormData = JSON.parse(originData.baseStartProcessDto.customformJson || {});
                            customFormData.formJson[0].changeObject.attrRawList.push({
                                attrName: 'name',
                                value: processTitle
                            });
                            originData.baseStartProcessDto.customformJson = JSON.stringify(customFormData);
                            originData.baseForm.actionName = vm.actionName;
                            originData.baseForm.businessForm.reviewItemList = [];
                            originData.baseForm.businessFormJsonStr = JSON.stringify(
                                originData?.baseForm?.businessForm
                            );
                            resolve(originData);
                        } else {
                            // 如果是重新提交就要传actionName
                            if (vm.processInfos?.nodeMap?.node?.highLightedActivities?.[0] === 'resubmit') {
                                originData.baseForm.actionName = 'submitChangeProcess';
                            }
                            originData.baseForm.businessForm.reviewItemList = vm.businessData.map((item) => {
                                return { oid: item.roleBObjectRef };
                            });
                            originData.baseForm.businessFormJsonStr = JSON.stringify(
                                originData?.baseForm?.businessForm || {}
                            );
                            resolve(originData);
                        }
                    }
                }
            };
        }
    };
    const store = {
        state: {
            commonBusinessConfig: {
                // 入库审批流程
                PPM_DOC_RELEASED: {
                    props: {
                        showTable: false,
                        title: i18nMappingObj.businessForm,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/DocumentObject/index.js')
                            )
                        }
                    },
                    methods: {
                        getData({ customFormData, processKey }) {
                            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                            return customFormData?.formJson ? customFormData.formJson : businessData;
                        }
                    },
                    hooks: {
                        beforeSubmit(vm, type) {
                            return new Promise((resolve) => {
                                vm.$refs.beforeTable
                                    .validate(type)
                                    .then((result) => {
                                        resolve(result);
                                    })
                                    .catch((err) => {
                                        resolve(err);
                                    });
                            });
                        },
                        beforeSubmitValidate(vm, result) {
                            let data = JSON.parse(result);
                            let { message, valid } = data?.formJson?.[0] || {};
                            return {
                                data: result,
                                valid: valid === undefined,
                                message: message || ''
                            };
                        }
                    }
                },
                PPM_TASK_CHANGE: utils.commonChangeConfig(),
                // 团队发起变更
                PPM_TEAM_CHANGE: utils.commonChangeConfig(),
                // 其他发起变更
                PPM_OTHER_CHANGE: utils.commonChangeConfig(),
                // 多类型发起变更
                PPM_MULTI_CHANGE: utils.commonChangeConfig(),
                // 文档,交付件审批流程
                PPM_DOC_APPROVAL: {
                    props: {
                        showTable: false,
                        title: i18nMappingObj.businessForm,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/DeliveryObject/index.js')
                            )
                        }
                    },
                    methods: {
                        getData: function (vm) {
                            let { processKey, customFormData, processStep } = vm;
                            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                            let result = customFormData?.formJson ? customFormData.formJson : businessData || [{}];
                            let businessSource = result[0]?.businessSource || '';
                            // 交付件审批流程
                            if (['deliverables', 'deliverablesRow'].includes(businessSource)) {
                                if (processStep === 'launcher' && vm.$route.name !== 'workflowDraft') {
                                    let newResult = [];
                                    result.forEach((item) => {
                                        item?.deliverableTableData?.forEach((deliverableItem) => {
                                            deliverableItem.attrRawList.map((attrRawItem) => {
                                                if (attrRawItem.label === 'erd.cloud.cbb.doc.entity.EtDocument#icon') {
                                                    attrRawItem.displayName = attrRawItem.value;
                                                }
                                                if (attrRawItem.attrName === 'lifecycleStatus.status') {
                                                    attrRawItem.attrName = 'statusDisplayName';
                                                }
                                                if (attrRawItem.attrName === 'typeReference') {
                                                    attrRawItem.attrName = 'typeDisplayName';
                                                }
                                                return attrRawItem;
                                            });
                                            deliverableItem.attrRawList.push({
                                                attrName: 'createUser',
                                                displayName: {
                                                    displayName: deliverableItem.attrRawList.find(
                                                        (row) => row.attrName === 'createBy'
                                                    ).displayName
                                                }
                                            });
                                            newResult.push({
                                                objectRef: item['erd.cloud.ppm.common.entity.Delivery#objectRef'],
                                                projectOid: item.projectOid,
                                                deliverableSelectOid: result[0]?.deliverableSelectOid || '',
                                                businessSource: item.businessSource,
                                                status:
                                                    deliverableItem.attrRawList.find(
                                                        (row) => row.attrName === 'statusDisplayName'
                                                    )?.value || '',
                                                ...deliverableItem,
                                                deliverableObj: {
                                                    ...item
                                                }
                                            });
                                        });
                                    });
                                    result = newResult;
                                }
                            }
                            return result;
                        }
                    },
                    hooks: {
                        beforeSubmit(vm, type) {
                            return new Promise((resolve) => {
                                vm.$refs.beforeTable
                                    .validate(type)
                                    .then((result) => {
                                        vm.businessData = result;
                                        resolve(result);
                                    })
                                    .catch((err) => {
                                        resolve(err);
                                    });
                            });
                        },
                        beforeSubmitValidate(vm, result) {
                            let data = JSON.parse(result);
                            let { valid, message } = data?.formJson?.[0] || {};
                            return {
                                data: result,
                                valid: valid === undefined,
                                message
                            };
                        },
                        beforeSubmitFinalData({ vm, resolve, originData }) {
                            let reviewItemList = [];
                            vm.businessData.forEach((item) => {
                                reviewItemList.push({ oid: item.oid });
                            });
                            originData.baseForm.actionName = vm.actionName;
                            originData.baseForm.businessForm.reviewItemList = reviewItemList;
                            originData.baseForm.businessFormJsonStr = JSON.stringify(reviewItemList);
                            resolve(originData);
                        }
                    }
                },
                // 预算审批流程
                budgetApproval: {
                    props: {
                        showTable: false,
                        title: i18nMappingObj.businessForm,
                        businessKey: 'componentKey', // businessData中的key，对应值用于区分流程的审批对象是否改变，如果改变就要重新加载页面
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/BudgetObject/index.js')
                            )
                        }
                    },
                    methods: {
                        getData({ customFormData, processKey }) {
                            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                            return customFormData?.formJson ? customFormData.formJson : businessData;
                        }
                    },
                    hooks: {
                        setBeforeCreate(vm) {
                            const func = (urlConfig) => {
                                urlConfig.url = '/ppm/communal/getUsersForWorkflow';
                                urlConfig.data.processTemplateKey = 'budgetApproval';
                                return urlConfig;
                            };
                            utils.registerRoleInfo(vm, func);
                        },
                        // 提交前获取数据
                        beforeSubmit(vm, type) {
                            return new Promise((resolve) => {
                                vm.$refs.beforeTable
                                    .validate(type)
                                    .then((result) => {
                                        resolve(result);
                                    })
                                    .catch((err) => {
                                        resolve(err);
                                    });
                            });
                        },
                        // 提交前获取数据后的校验，result为beforeSubmit方法resolve的数据
                        beforeSubmitValidate(vm, result) {
                            let data = JSON.parse(result);
                            let valid = data?.formJson?.valid;
                            let message = data?.formJson?.message;
                            return {
                                data: result,
                                valid: valid === false ? false : true,
                                message: message || ''
                            };
                        },
                        // 流程最终提交的数据
                        async beforeSubmitFinalData({ vm, resolve, originData }) {
                            if (originData.baseForm?.businessForm?.reviewItemList) {
                                // reviewItemList目前所知为哪些对象oid关联该流程（流程记录中通过对象oid即可查询对应流程信息）
                                originData.baseForm.businessForm.reviewItemList = (
                                    vm.businessData[0]?.allLinkOids || []
                                ).map((linkOid) => {
                                    return {
                                        oid: linkOid
                                    };
                                });
                            }
                            // 驳回时，需要将已选择的节点linkOid保存到数据库，便于重新提交节点提交后，后端对比哪些数据做了移除（去修改对应状态）
                            if (originData.baseSubmitTaskDto?.routeFlag == '-1' && vm.businessData[0]) {
                                // 驳回时，将当前已选择的数据保存到oldAllLinkOids
                                vm.businessData[0].oldAllLinkOids = vm.businessData[0].allLinkOids;
                                let customformJson = JSON.parse(originData.baseSubmitTaskDto.customformJson || {});
                                customformJson.formJson = vm.businessData;
                                originData.baseSubmitTaskDto.customformJson = JSON.stringify(customformJson);
                            }
                            resolve(originData);
                        }
                    }
                },
                // 项目变更
                PPM_PROJECT_CHANGE: {
                    props: {
                        showTable: false,
                        title: i18nMappingObj.businessForm,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.func('erdc-ppm-project-change/components/BusinessForm/index.js')
                            )
                        },
                        businessKey: 'typeOid',
                        actionName: 'startChangeProcess'
                    },
                    methods: {
                        getData: function (vm) {
                            let reviewItemList = vm.draftInfos?.baseForm?.businessForm?.reviewItemList || [];
                            let { processKey, customFormData } = vm;
                            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                            let result = customFormData?.formJson ? customFormData.formJson : businessData || [{}];
                            const pboLinkDtos = vm.processInfos?.pboLinkDtos || [];
                            const pboLinkArr = pboLinkDtos.filter((item) => item.linkType === 'REVIEW');
                            if (pboLinkArr.length && result.length) {
                                result[0].roleBObjectRef = pboLinkArr[0].roleBObjectRef;
                            } else if (reviewItemList.length > 0) {
                                result[0].roleBObjectRef = reviewItemList[0].oid;
                            }
                            return result;
                        }
                    },
                    hooks: {
                        beforeSubmit(vm, type) {
                            return new Promise((resolve) => {
                                vm.$refs.beforeTable
                                    .validate(type)
                                    .then((result) => {
                                        resolve(result);
                                    })
                                    .catch((err) => {
                                        resolve(err);
                                    });
                            });
                        },
                        beforeSubmitValidate(vm, result) {
                            let data = JSON.parse(result);
                            let valid = data?.formJson?.[0]?.valid;
                            let message = data?.formJson?.[0]?.message;
                            return {
                                data: result,
                                valid: valid === undefined,
                                message: message ? message : ''
                            };
                        },
                        beforeSubmitFinalData({ vm, resolve, originData }) {
                            if (vm.processStep === 'launcher') {
                                // 将流程标题存储在customformJson中传给后端
                                let processTitle = originData.baseForm.processBasicInfo.processName;
                                let customFormData = JSON.parse(originData.baseStartProcessDto.customformJson || {});
                                customFormData.formJson[0].changeObject.attrRawList.push({
                                    attrName: 'name',
                                    value: processTitle
                                });
                                originData.baseStartProcessDto.customformJson = JSON.stringify(customFormData);
                                originData.baseForm.actionName = vm.actionName;
                                originData.baseForm.businessForm.reviewItemList = [];
                                originData.baseForm.businessFormJsonStr = JSON.stringify(
                                    originData?.baseForm?.businessForm
                                );
                                resolve(originData);
                            } else {
                                // 如果是重新提交就要传actionName
                                if (vm.processInfos?.nodeMap?.node?.highLightedActivities?.[0] === 'resubmit') {
                                    originData.baseForm.actionName = 'submitChangeProcess';
                                }
                                originData.baseForm.businessForm.reviewItemList = vm.businessData.map((item) => {
                                    return { oid: item.roleBObjectRef };
                                });
                                originData.baseForm.businessFormJsonStr = JSON.stringify(
                                    originData?.baseForm?.businessForm || {}
                                );
                                resolve(originData);
                            }
                        }
                    }
                },
                // 决策评审流程
                DcpReview: {
                    props: {
                        showTable: false,
                        title: i18nMappingObj.businessForm,
                        useKey: 'DcpReview',
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/ReviewList/index.js')
                            )
                        },
                        businessKey: 'typeOid'
                    },
                    methods: {
                        // 业务对象数据
                        getData(vm) {
                            // 如果是草稿页面
                            if (vm.$route.name === 'workflowDraft') {
                                let { reviewItemList } = vm.draftInfos.baseForm.businessForm;
                                let [{ reviewItems, reviewObject, urlConfig, types, milestoneTableData }] = vm
                                    .customFormData?.formJson || [{}];
                                let reviewDraft = [
                                    {
                                        reviewItems,
                                        reviewObject,
                                        oid: reviewItemList[0].oid,
                                        urlConfig,
                                        types: types || '',
                                        milestoneTableData: milestoneTableData || []
                                    }
                                ];
                                return reviewDraft;
                            } else {
                                const pboLinkDtos = vm.processInfos?.pboLinkDtos || [];
                                // 审批流程会取值
                                let pboLinkArr = pboLinkDtos.filter((item) => item.linkType === 'REVIEW');
                                // 发起流程取值
                                const businessData = JSON.parse(
                                    localStorage.getItem(vm.processKey + ':businessData') || '[]'
                                );
                                if (pboLinkArr.length) {
                                    const { types, milestoneTableData } = vm.customFormData?.formJson?.[0] || '';
                                    pboLinkArr[0] = { ...pboLinkArr[0], types, milestoneTableData };
                                }
                                return (pboLinkArr.length && pboLinkArr) || businessData;
                            }
                        }
                    },
                    hooks: {
                        setBeforeCreate(vm, Data) {
                            utils.registerTROrDCPRoleInfo(vm, Data);
                        },
                        beforeSubmit(vm) {
                            return new Promise((resolve) => {
                                // 后端说因为/ppm/review/syncElement这个接口在删除数据，要等待这个接口处理完之后才能点击，先暂时这么处理，后续在优化
                                let timer = setInterval(() => {
                                    if (vm.$refs.beforeTable.showReviewElements) {
                                        clearInterval(timer);
                                        resolve(vm.businessData);
                                    }
                                }, 500);
                            });
                        },
                        beforeSubmitValidate(vm, result) {
                            let obj = {
                                data: result,
                                valid: true
                            };
                            const reviewAction = JSON.parse(localStorage.getItem('reviewConfig'));
                            const node = vm.processInfos?.nodeMap?.node;
                            let key = vm.$route.query?.taskDefKey || (node && node.highLightedActivities[0]);
                            if (['Review'].includes(key)) {
                                if (reviewAction) {
                                    if (!reviewAction.reviewConclusion) {
                                        obj.valid = false;
                                        obj.message = vm.i18nMappingObj.conclution;
                                    }
                                } else {
                                    obj.valid = false;
                                    obj.message = vm.i18nMappingObj.conclution;
                                }
                            }
                            return obj;
                        },
                        beforeSubmitFinalData({ data, vm, resolve }) {
                            if (_.isObject(data?.baseStartProcessDto?.customformJson)) {
                                let businessData = JSON.parse(
                                    localStorage.getItem(vm.processKey + ':businessData') || '[]'
                                );
                                data.baseStartProcessDto.customformJson = JSON.stringify(businessData);
                            }
                            const node = vm.processInfos?.nodeMap?.node;
                            const reviewAction = JSON.parse(localStorage.getItem('reviewConfig'));
                            if (reviewAction?.reviewElementList) {
                                vm.$message({
                                    showClose: true,
                                    message: i18nMappingObj.notAllowed, // 数据初始化未完成，不允许提交
                                    type: 'error'
                                });
                                return false;
                            }
                            let key =
                                vm.$route.query?.processDefinitionKey ||
                                vm.$route.query?.taskDefKey ||
                                (node && node.highLightedActivities[0]) ||
                                vm.processInfos?.key ||
                                '';
                            if (key === 'DcpReview') {
                                data.baseForm.actionName = 'startReviewProcess';
                            } else if (
                                ['DrawUp', 'Submittals', 'SelfCheck', 'Review', 'Approve', 'SignAndIssue'].includes(key)
                            ) {
                                data.baseForm.actionName = 'submitReviewProcess';
                                data.baseForm.businessForm.reviewItemList = vm.businessData.map((item) => {
                                    return { oid: item.roleBObjectRef };
                                });
                                data.baseForm.businessFormJsonStr = JSON.stringify(data?.baseForm?.businessForm || {});

                                if (['Review'].includes(key)) {
                                    if (reviewAction) {
                                        let { reviewConclusion } = reviewAction;
                                        if (!reviewConclusion) {
                                            vm.$message({
                                                showClose: true,
                                                message: vm.i18nMappingObj.conclution,
                                                type: 'error'
                                            });
                                            return false;
                                        }
                                        reviewConclusion = false;
                                    } else {
                                        return false;
                                    }
                                    localStorage.setItem('reviewConfig', JSON.stringify(reviewAction));
                                }
                            }
                            if (
                                data.baseForm?.currTaskInfo?.baseSubmitTaskDto?.customformJson &&
                                vm.$route.name === 'workflowDraft'
                            ) {
                                data.baseForm.currTaskInfo.baseSubmitTaskDto.customformJson = '{}';
                            }
                            if (data?.baseStartProcessDto?.customformJson?.customformJson) {
                                const innerProperty = data.baseStartProcessDto.customformJson.customformJson;
                                data.baseStartProcessDto.customformJson = innerProperty;
                            }
                            resolve(data);
                        }
                    }
                },
                //技术评审流程
                TechnicalReview: {
                    props: {
                        showTable: false,
                        title: i18nMappingObj.businessForm,
                        useKey: 'TechnicalReview',
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/ReviewList/index.js')
                            )
                        },
                        businessKey: 'typeOid'
                    },
                    methods: {
                        // 业务对象数据
                        getData(vm) {
                            const isWorkflowDraft = vm.$route.name === 'workflowDraft';
                            if (!isWorkflowDraft && !vm.$route.query?.processDefinitionKey) {
                                if (
                                    Array.isArray(vm.$props.processInfos.pboLinkDtos) &&
                                    vm.$props.processInfos.pboLinkDtos.length
                                ) {
                                    let pbObjArr = vm.$props.processInfos.pboLinkDtos.filter(
                                        (item) => item.linkType === 'REVIEW'
                                    );
                                    const { types, milestoneTableData } = vm.customFormData?.formJson?.[0] || '';
                                    pbObjArr[0] = { ...pbObjArr[0], types, milestoneTableData };
                                    return pbObjArr;
                                } else {
                                    return [];
                                }
                            } else if (isWorkflowDraft) {
                                let { reviewItemList } = vm.$props.draftInfos.baseForm.businessForm;
                                const { reviewItems, reviewObject, typeOid, urlConfig, types, milestoneTableData } =
                                    vm.$props.customFormData.formJson[0];
                                return [
                                    {
                                        reviewItems: reviewItems,
                                        reviewObject: reviewObject,
                                        oid: reviewItemList[0].oid,
                                        types,
                                        milestoneTableData: milestoneTableData || [],
                                        ...(typeOid ? { typeOid } : {}),
                                        ...(urlConfig ? { urlConfig } : {}) // 已保存的草稿单应当写入urlConfig
                                    }
                                ];
                            } else {
                                let businessData = JSON.parse(
                                    localStorage.getItem(vm.processKey + ':businessData') || '[]'
                                );
                                return businessData;
                            }
                        }
                    },
                    hooks: {
                        beforeSubmit(vm) {
                            return new Promise((resolve) => {
                                // 后端说因为/ppm/review/syncElement这个接口在删除数据，要等待这个接口处理完之后才能点击，先暂时这么处理，后续在优化
                                let timer = setInterval(() => {
                                    if (vm.$refs.beforeTable.showReviewElements) {
                                        clearInterval(timer);
                                        resolve(vm.businessData);
                                    }
                                }, 500);
                            });
                        },
                        beforeSubmitValidate(vm, result) {
                            let obj = {
                                data: result,
                                valid: true
                            };
                            const reviewAction = JSON.parse(localStorage.getItem('reviewConfig'));
                            const node = vm.processInfos?.nodeMap?.node;
                            let key = vm.$route.query?.taskDefKey || (node && node.highLightedActivities[0]);
                            if (['PreReview', 'Review'].includes(key)) {
                                if (reviewAction) {
                                    if (!reviewAction.reviewConclusion) {
                                        obj.valid = false;
                                        obj.message = vm.i18nMappingObj.conclution;
                                    }
                                } else {
                                    obj.valid = false;
                                    obj.message = vm.i18nMappingObj.conclution;
                                }
                            }
                            return obj;
                        },
                        beforeSubmitFinalData({ data, vm, resolve }) {
                            if (data.baseStartProcessDto && _.isObject(data.baseStartProcessDto.customformJson)) {
                                let businessData = JSON.parse(
                                    localStorage.getItem(vm.processKey + ':businessData') || '[]'
                                );
                                data.baseStartProcessDto.customformJson = JSON.stringify(businessData);
                            }
                            const node = vm.processInfos?.nodeMap?.node;
                            const reviewAction = JSON.parse(localStorage.getItem('reviewConfig'));
                            if (reviewAction && reviewAction.reviewElementList) {
                                vm.$message({
                                    showClose: true,
                                    message: i18nMappingObj.notAllowed, // 数据初始化未完成，不允许提交
                                    type: 'error'
                                });
                                return false;
                            }
                            let key =
                                vm.$route.query?.processDefinitionKey ||
                                vm.$route.query?.taskDefKey ||
                                (node && node.highLightedActivities[0]);
                            if (['TechnicalReview', undefined].includes(key)) {
                                data.baseForm.actionName = 'startReviewProcess';
                            } else if (
                                [
                                    'DrawUp',
                                    'Submittals',
                                    'SelfCheck',
                                    'PreReview',
                                    'Review',
                                    'Approve',
                                    'SignAndIssue'
                                ].includes(key)
                            ) {
                                data.baseForm.actionName = 'submitReviewProcess';
                                let businessData = [...vm.businessData];
                                if (data.baseForm.businessForm.reviewItemList.length) {
                                    data.baseForm.businessForm.reviewItemList = [];
                                }
                                data.baseForm.businessForm.reviewItemList.push({
                                    oid: businessData[0]?.roleBObjectRef
                                });
                                data.baseForm.businessFormJsonStr = JSON.stringify(data?.baseForm?.businessForm || {});
                                if (['PreReview', 'Review'].includes(key)) {
                                    if (reviewAction) {
                                        let { reviewConclusion } = reviewAction;
                                        if (!reviewConclusion) {
                                            vm.$message({
                                                showClose: true,
                                                message: vm.i18nMappingObj.conclution,
                                                type: 'error'
                                            });
                                            return false;
                                        }
                                        reviewConclusion = false;
                                    } else {
                                        return false;
                                    }
                                    localStorage.setItem('reviewConfig', JSON.stringify(reviewAction));
                                }
                            }
                            if (vm.$route.name === 'workflowDraft') {
                                if (
                                    !!data.baseForm &&
                                    data.baseForm.currTaskInfo &&
                                    data.baseForm.currTaskInfo.baseSubmitTaskDto &&
                                    data.baseForm.currTaskInfo.baseSubmitTaskDto.customformJson
                                ) {
                                    data.baseForm.currTaskInfo.baseSubmitTaskDto.customformJson = '{}';
                                }
                            }
                            if (
                                !!data.baseStartProcessDto &&
                                data.baseStartProcessDto.customformJson &&
                                data.baseStartProcessDto.customformJson.customformJson
                            ) {
                                const innerProperty = data.baseStartProcessDto.customformJson.customformJson;
                                data.baseStartProcessDto.customformJson = innerProperty;
                            }
                            resolve(data);
                        },
                        setBeforeCreate(vm, Data) {
                            utils.registerTROrDCPRoleInfo(vm, Data);
                        }
                    }
                },
                // 督办任务完工审批流程
                SupervisionTaskWF: {
                    className: 'erd.cloud.ppm.plan.entity.DiscreteTask',
                    props: {
                        showTable: false,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                            )
                        },
                        slotsProps: {
                            beforeTable: {
                                className: 'erd.cloud.ppm.plan.entity.DiscreteTask',
                                modelMapper: {
                                    'holderRef': (data) => {
                                        return data['holderRef']?.displayName || '';
                                    },
                                    'typeReference': (data) => {
                                        return data['typeReference']?.displayName || '';
                                    },
                                    'lifecycleStatus.status': (data) => {
                                        return data['lifecycleStatus.status']?.displayName;
                                    }
                                },
                                // 自定义link点击（编码点击）
                                linkClick: (vm, attrName, data) => {
                                    const ErdcStore = require('erdcloud.store');
                                    let row = ppmUtils.newDeserializeAttr(data.rawData || {});
                                    // 项目OID
                                    let pid =
                                        row.holderRef || vm.$route.query.pid || ErdcStore?.state?.space?.object?.oid;
                                    // 跳转督办任务详情
                                    ppmUtils.openDiscreteTaskPage(
                                        'detail',
                                        {
                                            query: {
                                                pid: pid || '' // 项目OID
                                            }
                                        },
                                        row
                                    );
                                }
                            }
                        }
                    },
                    methods: {
                        // 业务对象数据
                        getData({ customFormData, processKey }) {
                            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                            return customFormData?.formJson ? customFormData.formJson : businessData;
                        }
                    },
                    hooks: {
                        setBeforeCreate(vm) {
                            utils.registerRoleInfo(vm);
                        }
                    }
                },
                // 项目任务审批流程
                PPM_PLAN_APPROVE: utils.commonTaskConfig(),
                // 任务完工审批流程
                TASK_CLOSE: utils.commonTaskConfig(),
                // 问题流程
                PPM_ISSUE: {
                    className: 'erd.cloud.ppm.issue.entity.Issue',
                    props: {
                        showTable: false,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                            )
                        },
                        slotsProps: {
                            beforeTable: {
                                className: 'erd.cloud.ppm.issue.entity.Issue'
                            }
                        }
                    },
                    methods: {
                        // 业务对象数据
                        getData(vm) {
                            return utils.commonGetData(vm);
                        }
                    },
                    hooks: {
                        setBeforeCreate(vm) {
                            utils.registerRoleInfo(vm);
                        }
                    }
                },
                // 风险流程
                PPM_RISK: {
                    className: 'erd.cloud.ppm.risk.entity.Risk',
                    props: {
                        showTable: false,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')
                            )
                        },
                        slotsProps: {
                            beforeTable: {
                                className: 'erd.cloud.ppm.risk.entity.Risk',
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
                                    'submitTime': (data) => {
                                        return data['submitTime']?.displayName;
                                    },
                                    'projectRef': (data) => {
                                        return data['projectRef']?.displayName;
                                    },
                                    'organizationRef': ({ displayName }) => {
                                        return displayName;
                                    }
                                }
                            }
                        }
                    },
                    methods: {
                        // 业务对象数据
                        getData(vm) {
                            return utils.commonGetData(vm);
                        }
                    },
                    hooks: {
                        setBeforeCreate(vm) {
                            utils.registerRoleInfo(vm);
                        }
                    }
                },
                // 需求评审流程
                PPM_REQUIRE_PENDINGR: utils.commonRequireConfig(),
                // 需求分配流程
                PPM_REQUIRE_TODO: utils.commonRequireConfig(),
                // 需求验证流程
                PPM_REQUIRE_PENDINGT: utils.commonRequireConfig(),
                // 项目立项
                PPM_PROJECT_START: utils.commonProjectConfig(),
                // 项目重启
                PROJECT_RESTART: utils.commonProjectConfig(),
                // 项目暂停
                PROJECT_PAUSE: utils.commonProjectConfig(),
                // 项目关闭
                PPM_PROJECT_CLOSE: utils.commonProjectConfig(),
                // 项目终止流程
                PROJECT_STOP: utils.commonProjectConfig(),
                // 工时审批流程
                WorkHourApproval: {
                    props: {
                        showTable: false,
                        slots: {
                            beforeTable: ErdcKit.asyncComponent(
                                ELMP.resource('ppm-workflow-resource/components/WorkHourList/index.js')
                            )
                        }
                    },
                    methods: {
                        // 业务对象数据
                        getData({ customFormData, processKey }) {
                            let businessData = JSON.parse(localStorage.getItem(processKey + ':businessData') || '[]');
                            return customFormData?.formJson ? customFormData.formJson : businessData;
                        }
                    },
                    hooks: {
                        setBeforeCreate(vm) {
                            utils.registerRoleInfo(vm);
                        }
                    }
                }
            }
        },
        mutations: {
            ADD_CATEGORY_CONFIG(state, { category, config }) {
                state.commonBusinessConfig[category] = config;
            }
        },
        actions: {
            addBusinessConfig({ commit }, playpoad) {
                commit('ADD_CATEGORY_CONFIG', playpoad);
            }
        },
        getters: {
            getBusinessConfig: (state) => (processKey) => {
                const commonBusinessConfig = state.commonBusinessConfig;
                const commonConfigPageData = commonBusinessConfig[processKey];
                return commonConfigPageData;
            }
        }
    };
    return store;
});
