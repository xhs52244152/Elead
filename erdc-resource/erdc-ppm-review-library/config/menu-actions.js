// 存放全局注册的方法
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/locale/index.js')
], function (commonActions, store, utils, commonHttp, { i18n }) {
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
                vm.i18nMappingObj.confirmInvali,
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
                                    disabled: item.value === data['erd.cloud.cbb.review.entity.ReviewElement#status']
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
        }
    };

    return menuActions;
});
