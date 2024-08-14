// 存放全局注册的方法
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/locale/index.js'),
    'erdc-kit',
    ELMP.resource('ppm-component/ppm-common-actions/utils.js')
], function (commonActions, store, utils, commonHttp, { i18n }, famUtils, commonActionsUtils) {
    const i18nMappingObj = utils.languageTransfer(i18n);
    // 如何使用
    // console.log(i18nMappingObj.confirm);
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

    let menuActions = {
        PROJECT_EXPORT: (vm) => {
            const getExportRequestData = (data, requestData) => {
                let exportFields = data.selectedColumns.map((item) => {
                    return item.attrName;
                });
                let params = {
                    businessName: 'ProjectExport',
                    templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1714907189133529090',
                    useDefaultExport: false,
                    exportFields,
                    customParams: {
                        useDefaultTemplate: true,
                        exportType: 'excel'
                    },
                    tableSearchDto: requestData
                };
                return params;
            };
            let params = {
                className: vm.className,
                tableRef: 'famViewTable',
                getExportRequestData
            };
            commonActions.export(vm, params);
        },
        PROJECT_IMPORT: (vm) => {
            function handleParams(params) {
                params.customParams = _.extend({}, params.customParams, {
                    className: vm.className,
                    isTemplate: false
                });
                return params;
            }
            let extendProps = {
                importMethodDisabled: true
            };
            let params = {
                businessName: 'ProjectImport',
                importType: 'excel',
                className: vm.className,
                handleParams,
                extendProps
            };
            commonActions.import(vm, params);
        },
        // 业务管理-要素库-创建
        VIEW_ELEMENT_CREATE: (vm) => {
            vm.showDialog = true;
            vm.oid = '';
            vm.formDialogTitle = vm.i18nMappingObj['createReviewElements'];
            vm.layoutName = 'CREATE';
        },

        // 业务管理-要素库-裁剪
        REVIEW_ELEMENT_LINK_SET_SCALABLE: (vm, selected) => {
            if (!selected.length) {
                return vm.$message.info(vm.i18nMappingObj.pleaseSelectData);
            }
            vm.showCroppDialog = true;
        },
        // 业务管理-评审配置-评审要素-删除
        REVIEW_ELEMENT_LINK_REMOVE: (vm, data) => {
            commonActions.deleteItem(vm, data, {
                url: '/element/delete',
                tip: vm.i18nMappingObj['removeSuccess'],
                confirmRemove: vm.i18nMappingObj['confirmRemove'],
                isRemove: vm.i18nMappingObj['IsRemove']
            });
        },
        // 业务管理-评审配置-评审要素-增加
        REVIEW_ELEMENT_LINK_ADD: (vm) => {
            vm.showAlementsDialog = true;
        },
        // 业务管理-评审配置-评审要素-批量删除
        REVIEW_ELEMENT_LINK_BATCH_REMOVE: (vm, selected) => {
            commonActions.batchDeleteItems(vm, selected, {
                url: '/element/deleteByIds',
                tip: vm.i18nMappingObj['removeSuccess'],
                confirmRemove: vm.i18nMappingObj['confirmRemove'],
                isRemove: vm.i18nMappingObj['IsRemove']
            });
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
        }
    };

    return menuActions;
});
