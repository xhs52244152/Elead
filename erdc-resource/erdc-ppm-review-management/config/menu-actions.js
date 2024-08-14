define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-utils/locale/index.js'),
    'erdc-kit'
], function (commonActions, commonHttp, utils, { i18n }, famUtils) {
    const i18nMappingObj = utils.languageTransfer(i18n);
    const commonUtils = {
        commonDocDelete: (vm, { docIds = [], folderIds = [] }) => {
            let requestArr = [];
            vm.$confirm(i18nMappingObj.isDelete, i18nMappingObj.confirmDelete, {
                distinguishCancelAndClose: true,
                confirmButtonText: i18nMappingObj.confirm,
                cancelButtonText: i18nMappingObj.cancel,
                type: 'warning'
            })
                .then(() => {
                    // 因为文档服务和DOC服务不在用一个服务，所以文档删除和文件夹删除调用不同接口
                    if (docIds.length) {
                        requestArr.push(
                            commonHttp.deleteByIds({
                                url: '/document/deleteByIds',
                                data: {
                                    catagory: 'DELETE',
                                    oidList: docIds
                                }
                            })
                        );
                    }
                    if (folderIds.length) {
                        requestArr.push(
                            commonHttp.deleteByIds({
                                url: '/fam/deleteByIds',
                                data: {
                                    catagory: 'DELETE',
                                    oidList: folderIds
                                }
                            })
                        );
                    }
                    Promise.all(requestArr).then(() => {
                        vm.$message({ type: 'success', message: i18nMappingObj.deleteSuccess });
                        vm.refresh();
                    });
                })
                .catch();
        },
        invalidAndEffective: (vm, data, statusVal) => {
            // statusVal 生效传参为VALID、失效传参为INVALID
            vm.$confirm(
                statusVal === 'INVALID' ? vm.i18nMappingObj.confirmInvalidation : vm.i18nMappingObj.confirmValidation,
                statusVal === 'INVALID' ? vm.i18n.confirmInvali : vm.i18n.confirmVali,
                {
                    distinguishCancelAndClose: true,
                    confirmButtonText: vm.i18nMappingObj.confirm,
                    cancelButtonText: vm.i18nMappingObj.cancel,
                    type: 'warning'
                }
            ).then(() => {
                vm.$famHttp({
                    url: '/element/update',
                    method: 'post',
                    data: {
                        action: 'UPDATE',
                        attrRawList: [
                            {
                                attrName: 'status',
                                value: statusVal
                            }
                        ],
                        className: vm.className,
                        oid: data.oid
                    }
                }).then((resp) => {
                    if (resp.code === '200') {
                        vm.$message({
                            type: 'success',
                            message: vm.i18nMappingObj['success']
                        });
                        vm.refresh();
                    }
                });
            });
        },
        commonRemoveRelated: (vm, row, it) => {
            vm.tabsConfig = it;
            commonActions.deleteItem(vm, row, {
                title: i18nMappingObj.removeTips
            });
        },
        commonUpdate(vm, { data = {}, successCallBack }) {
            commonHttp
                .commonUpdate({
                    data: data
                })
                .then((resp) => {
                    if (successCallBack && _.isFunction(successCallBack)) {
                        successCallBack(resp);
                    } else {
                        vm.$message({
                            type: 'success',
                            message: i18nMappingObj.success
                        });
                        vm.refresh();
                    }
                });
        }
    };
    return function () {
        // let projectInfo = getData();
        // let containerRef = `OR:${projectInfo?.containerRef.key}:${projectInfo?.containerRef.id}`;
        const _ = require('underscore');
        return {
            // 业务管理-要素库-编辑
            VIEW_ELEMENT_UPDATE: (vm, data) => {
                vm.showDialog = true;
                vm.oid = data.oid;
                vm.formDialogTitle = vm.i18nMappingObj['editReviewElements'];
                vm.layoutName = 'UPDATE';
            },
            // 业务管理-要素库-删除
            VIEW_ELEMENT_DELETE: (vm, data) => {
                commonActions.deleteItem(vm, data, { url: '/element/delete' });
            },
            // 业务管理-要素库-批量删除
            VIEW_ELEMENT_BATCH_DELETE: (vm, selected) => {
                commonActions.batchDeleteItems(vm, selected, { url: '/element/deleteByIds' });
            },
            // 业务管理-要素库-设置状态
            VIEW_ELEMENT_SET_STATUS: (vm, data) => {
                let stateKey = 'erd.cloud.cbb.review.entity.ReviewElement#status';
                commonActions.setStatus(vm, data, { rowKey: 'oid', setStateFunc, stateKey, getStatusList });
                function setStateFunc(value) {
                    let params = {
                        action: 'UPDATE',
                        className: 'erd.cloud.cbb.review.entity.ReviewElement',
                        rawDataVoList: [
                            {
                                action: 'UPDATE',
                                attrRawList: [
                                    {
                                        attrName: 'status',
                                        value: value
                                    }
                                ],
                                className: 'erd.cloud.cbb.review.entity.ReviewElement',
                                oid: data.oid
                            }
                        ]
                    };

                    return vm.$famHttp({
                        url: '/element/saveOrUpdate',
                        method: 'post',
                        data: params
                    });
                }
                function getStatusList() {
                    return new Promise((resolve) => {
                        vm.$famHttp({
                            method: 'POST',
                            url: '/fam/type/component/enumDataList',
                            params: {
                                realType: 'erd.cloud.cbb.review.enums.ReviewElementState'
                            }
                        })
                            .then((res) => {
                                let stateOptions = [];
                                stateOptions = res.data.map((item) => {
                                    return {
                                        label: item.value,
                                        value: item.name,
                                        disabled:
                                            item.value === data['erd.cloud.cbb.review.entity.ReviewElement#status']
                                    };
                                });
                                let { value: state } =
                                    data?.attrRawList?.find(
                                        (item) => item.attrName === 'erd.cloud.cbb.review.entity.ReviewElement#status'
                                    ) || {};
                                if (state === 'DRAFT') {
                                    stateOptions = stateOptions.filter((item) => item.value !== 'INVALID');
                                }
                                if (state !== 'DRAFT') {
                                    stateOptions = stateOptions.filter((item) => item.value !== 'DRAFT');
                                }
                                resolve(stateOptions);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    });
                }
            },
            // 业务管理-要素库-批量编辑
            VIEW_ELEMENT_BATCH_UPDATE: async (vm, selected) => {
                // 状态为草稿不可批量编辑
                let draftList = selected.filter((item) => {
                    return vm.getState(item) === 'DRAFT';
                });
                if (draftList.length) {
                    return vm.$message.info(vm.i18nMappingObj.draftStatusNotEdited);
                }
                let containerRef = vm.$store?.state?.app?.container?.oid || '';
                commonActions.batchEdit(vm, selected, {
                    rowKey: 'oid',
                    containerRef,
                    roleList: await getRoleList(),
                    beforeSubmit,
                    stateUrl: '/fam/type/component/enumDataList',
                    hideStateField: ['DRAFT'], // 批量设置状态不需要显示草稿
                    defaultStateParams: {
                        realType: 'erd.cloud.cbb.review.enums.ReviewElementState'
                    }
                });
                // 责任角色拉下数据
                function getRoleList() {
                    return new Promise((resolve) => {
                        vm.$famHttp({
                            method: 'GET',
                            url: '/fam/role/list',
                            params: {
                                appName: 'PPM',
                                isGetVirtualRole: false
                            }
                        })
                            .then((res) => {
                                let roleList = [];
                                roleList = res.data.map((item) => {
                                    return {
                                        label: item.displayName,
                                        value: item.oid
                                    };
                                });
                                resolve(roleList);
                            })
                            .catch((error) => {
                                console.error(error);
                            });
                    });
                }
                // 确定
                function beforeSubmit(value) {
                    return new Promise((resolve) => {
                        let attrRawList = [];
                        let nameArr = ['description', 'content'];
                        value.forEach((item) => {
                            // 批量编辑为input的组件如果为空则默认为清空
                            if (nameArr.includes(item.attrName)) {
                                attrRawList.push({
                                    attrName: item.attrName,
                                    value: item.selectValue
                                });
                            } else {
                                if (item.selectValue) {
                                    attrRawList.push({
                                        attrName: item.attrName,
                                        value: item.selectValue
                                    });
                                }
                            }
                        });

                        let rawDataVoList = selected.map((item) => {
                            return {
                                action: 'UPDATE',
                                attrRawList,
                                className: vm.className,
                                oid: item['oid']
                            };
                        });
                        resolve(rawDataVoList);
                    });
                }
            },
            // 业务管理-要素库-裁剪
            REVIEW_ELEMENT_LINK_SET_SCALABLE: (vm, selected) => {
                if (!selected.length) {
                    return vm.$message.info(vm.i18nMappingObj.pleaseSelectData);
                }
                vm.showCroppDialog = true;
            },
            // 评审配置-质量目标-批量删除
            REVIEW_QUALITY_BATCH_DELETE: (vm, selected) => {
                commonActions.batchDeleteItems(vm, selected, { url: '/element/deleteByIds' });
            },
            // 评审配置-质量目标-裁剪
            REVIEW_QUALITY_SET_SCALABLE: (vm, selected) => {
                if (!selected.length) {
                    return vm.$message.info(vm.i18nMappingObj.pleaseSelectData);
                }
                vm.showCroppDialog = true;
            },
            // 评审配置-质量目标-失效
            REVIEW_QUALITY_DISABLE: (vm, data) => {
                // 生效传参为VALID、失效传参为INVALID
                commonUtils.invalidAndEffective(vm, data, 'INVALID');
            },
            // 评审配置-质量目标-生效
            REVIEW_QUALITY_ENABLE: (vm, data) => {
                // 生效传参为VALID、失效传参为INVALID
                commonUtils.invalidAndEffective(vm, data, 'VALID');
            },
            // 评审配置-质量目标-上移
            REVIEW_QUALITY_MOVE_UP: (vm, data) => {
                // moveDirection为移动方向，MOVE_UP上移 MOVE_DOWN下移
                vm.setMove(data, 'MOVE_UP');
            },
            // 评审配置-质量目标-下移
            REVIEW_QUALITY_MOVE_DOWN: (vm, data) => {
                vm.setMove(data, 'MOVE_DOWN');
            },
            // 评审配置-质量目标-创建子节点
            REVIEW_QUALITY_CREATE_Child: (vm, data) => {
                vm.showFormDialog = true;
                vm.oid = '';
                vm.formDialogTitle = vm.i18nMappingObj.createChildNodes;
                vm.layoutName = 'CREATE';
                vm.parentRefId = data.oid;
            },
            // 评审配置-质量目标-创建同级节点
            REVIEW_QUALITY_CREATE_Brother: (vm, data) => {
                vm.showFormDialog = true;
                vm.oid = '';
                vm.formDialogTitle = vm.i18nMappingObj.createPeerNodes;
                vm.layoutName = 'CREATE';
                vm.parentRefId = data.parentRef;
            },
            // 评审配置-质量目标-删除
            REVIEW_QUALITY_DELETE: (vm, data) => {
                commonActions.deleteItem(vm, data, { url: '/element/delete' });
            },
            // 评审配置-交付件-裁剪
            REVIEW_DELIVERY_SET_SCALABLE: (vm, selected) => {
                if (!selected.length) {
                    return vm.$message.info(vm.i18nMappingObj.pleaseSelectData);
                }
                vm.showCroppDialog = true;
            },
            // 评审配置-交付件-创建
            REVIEW_DELIVERY_CREATE: (vm) => {
                vm.showFormDialog = true;
                vm.oid = '';
                vm.formDialogTitle = vm.i18nMappingObj['createViewDeliverables'];
                vm.layoutName = 'CREATE';
            },
            // 评审配置-交付件-编辑
            REVIEW_DELIVERY_UPDATE: (vm, data) => {
                vm.showFormDialog = true;
                vm.oid = data.oid;
                vm.formDialogTitle = vm.i18nMappingObj['editViewDeliverables'];
                vm.layoutName = 'UPDATE';
            },
            // 评审配置-交付件-删除
            REVIEW_DELIVERY_DELETE: (vm, data) => {
                commonActions.deleteItem(vm, data, { url: '/element/delete' });
            },
            // 评审配置-交付件-批量删除
            REVIEW_DELIVERY_BATCH_DELETE: (vm, selected) => {
                commonActions.batchDeleteItems(vm, selected, { url: '/element/deleteByIds' });
            },
            // 评审配置-交付件-生效
            REVIEW_DELIVERY_ENABLE: (vm, data) => {
                commonUtils.invalidAndEffective(vm, data, 'VALID');
            },
            // 评审配置-交付件-失效
            REVIEW_DELIVERY_DISABLE: (vm, data) => {
                commonUtils.invalidAndEffective(vm, data, 'INVALID');
            },
            // 评审配置-质量目标-创建
            REVIEW_QUALITY_CREATE: (vm) => {
                vm.showFormDialog = true;
                vm.oid = '';
                vm.formDialogTitle = vm.i18nMappingObj['createQualityObjectives'];
                vm.layoutName = 'CREATE';
                vm.parentRefId = 'OR:erd.cloud.cbb.review.entity.QualityObjective:-1';
            },
            // 评审配置-质量目标-编辑
            REVIEW_QUALITY_UPDATE: (vm, data) => {
                vm.showFormDialog = true;
                vm.oid = data.oid;
                vm.parentRefId = 'OR:erd.cloud.cbb.review.entity.QualityObjective:-1';
                vm.formDialogTitle = vm.i18nMappingObj['editingQualityObjectives'];
                vm.layoutName = 'UPDATE';
            },
            // 风险创建
            PPM_PROJECT_REVIEW_PROCESS_RISK_LIST_CREATE: (vm) => {
                vm.$router.push({
                    path: '/erdc-ppm-risk/create',
                    query: {
                        fromProcess: true,
                        processId: vm.oid,
                        isCreateRelation: true,
                        roleAObjectRef: vm.oid,
                        pid: vm.projectId,
                        projectName: vm.formData.projectRef,
                        relationClassName: 'erd.cloud.ppm.review.entity.ReviewObjectRelationLink'
                    }
                });
            },
            // 问题创建
            PPM_PROJECT_REVIEW_PROCESS_ISSUE_LIST_CREATE: (vm) => {
                vm.$router.push({
                    path: '/erdc-ppm-issue/issue/create',
                    query: {
                        fromProcess: true,
                        processId: vm.oid,
                        isCreateRelation: true,
                        roleAObjectRef: vm.oid,
                        pid: vm.projectId,
                        projectName: vm.formData.projectRef,
                        relationClassName: 'erd.cloud.ppm.review.entity.ReviewObjectRelationLink'
                    }
                });
            },
            // 督办任务增加
            PPM_PROJECT_REVIEW_PROCESS_DISCRETE_TASK_LIST_ADD: (vm) => {
                vm.handleAdd();
            },
            // 问题增加
            PPM_PROJECT_REVIEW_PROCESS_ISSUE_LIST_ADD: (vm) => {
                vm.handleAdd();
            },
            // 风险增加
            PPM_PROJECT_REVIEW_PROCESS_RISK_LIST_ADD: (vm) => {
                vm.handleAdd();
            },
            // 督办任务创建
            PPM_PROJECT_REVIEW_PROCESS_DISCRETE_TASK_LIST_CREATE: (vm) => {
                utils.openDiscreteTaskPage('create', {
                    query: {
                        pid: vm.projectId,
                        projectName: vm.formData?.projectName || vm.formData?.projectRef || '',
                        fromProcess: true,
                        processId: vm.oid,
                        isCreateRelation: true,
                        roleAObjectRef: vm.oid,
                        // 来源=评审，只读
                        source: JSON.stringify({ value: 'REVIEW', readonly: true }),
                        relationClassName: 'erd.cloud.ppm.review.entity.ReviewObjectRelationLink'
                    }
                });
            },
            // 问题批量删除
            PPM_PROJECT_REVIEW_PROCESS_ISSUE_LIST_REMOVE: (vm, selected) => {
                commonActions.batchDeleteItems(vm, selected, {
                    useDefaultClass: true,
                    tip: '移除成功',
                    confirmRemove: '确认移除',
                    isRemove: '是否移除?'
                });
            },
            // 风险批量删除
            PPM_PROJECT_REVIEW_PROCESS_RISK_LIST_REMOVE: (vm, selected) => {
                commonActions.batchDeleteItems(vm, selected, {
                    useDefaultClass: true,
                    tip: '移除成功',
                    confirmRemove: '确认移除',
                    isRemove: '是否移除?'
                });
            },
            // 督办任务批量删除
            PPM_PROJECT_REVIEW_PROCESS_DISCRETE_TASK_LIST_REMOVE: (vm, selected) => {
                commonActions.batchDeleteItems(vm, selected, {
                    useDefaultClass: true,
                    tip: '移除成功',
                    confirmRemove: '确认移除',
                    isRemove: '是否移除?'
                });
            },
            // 督办任务删除
            PPM_PROJECT_REVIEW_PROCESS_DISCRETE_TASK_OPERATE_REMOVE: (vm, data) => {
                commonActions.deleteItem(vm, data, {
                    tip: '移除成功',
                    confirmRemove: '确认移除',
                    isRemove: '是否移除?'
                });
            },
            // 风险删除
            PPM_PROJECT_REVIEW_PROCESS_RISK_OPERATE_REMOVE: (vm, data) => {
                commonActions.deleteItem(vm, data, {
                    tip: '移除成功',
                    confirmRemove: '确认移除',
                    isRemove: '是否移除?'
                });
            },
            // 问题删除
            PPM_PROJECT_REVIEW_PROCESS_ISSUE_OPERATE_REMOVE: (vm, data) => {
                commonActions.deleteItem(vm, data, {
                    tip: '移除成功',
                    confirmRemove: '确认移除',
                    isRemove: '是否移除?'
                });
            },
            //评审单列表
            PPM_PROJECT_REVIEW_START_PROCESS: (vm) => {
                vm.showDialog = true;
            },
            //评审单裁剪
            PPM_PROJECT_REVIEW_PROCESS_REVIEW_ITEM_CROPPED: (vm, data) => {
                vm.cutItem(data);
            },
            //评审单恢复
            PPM_PROJECT_REVIEW_PROCESS_REVIEW_ITEM_RECOVER: (vm, data) => {
                vm.recoverItem(data);
            },
            PPM_PROJECT_REVIEW_PROCESS_APPROVE: (vm, row) => {
                if (row.isGroupRow) return;
                utils.openProcessPage(vm, row, 'erdc-portal-web');
            },
            //下载报告
            PPM_PROJECT_REVIEW_DOWNLOAD_REPORT: (vm, data) => {
                const authCode =
                    data.attrRawList.find(
                        (item) => item.attrName === 'erd.cloud.ppm.review.entity.ReviewObject#reportAuthorizeCode'
                    )?.value || '';
                const fileId =
                    data.attrRawList.find(
                        (item) => item.attrName === 'erd.cloud.ppm.review.entity.ReviewObject#reportFileStoreId'
                    )?.value || '';
                famUtils.downloadFile(fileId, authCode);
            }
        };
    };
});
