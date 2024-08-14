// 存放全局注册的方法
define([
    'erdcloud.router',
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-utils/locale/index.js'),
    'EventBus'
], function (Router, actions, utils, { i18n }, EventBus) {
    const i18nMappingObj = utils.languageTransfer(i18n);
    let menuActions = function (getData) {
        let projectInfo = getData();
        let containerRef = `OR:${projectInfo?.containerRef?.key}:${projectInfo?.containerRef?.id}`;
        let commonActions = {
            riskExport: (vm) => {
                const getExportRequestData = (data, requestData) => {
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    requestData.className = vm.className;
                    let params = {
                        businessName: 'RiskExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1747188640197169154',
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
                    tableRef: 'riskList',
                    getExportRequestData
                };
                actions.export(vm, params);
            }
        };
        return {
            /**
             * 风险库-详情-配置组
             * @param { Object } vm - 页面实例
             * @param { Object } data - 数据新增
             * @param  String  isTableList - 当前是列表还是详情
             */
            PPM_RISK_CREATE: (vm) => {
                vm.$router.push({
                    path: '/container/erdc-ppm-risk/create',
                    query: {
                        pid: vm.$route.query.pid || ''
                    }
                });
            },
            PPM_RISK_LIST_DELETE: (vm, selected) => {
                actions.batchDeleteItems(vm, selected);
            },
            PPM_RISK_LIST_SET_STATUS: (vm, selected) => {
                actions.batchSetStatus(vm, selected, {
                    title: i18nMappingObj.setStatus
                });
            },
            RISK_EXPORT: (vm) => {
                commonActions.riskExport(vm);
            },
            PPM_RISK_EXCEL_EXPORT: (vm) => {
                commonActions.riskExport(vm);
            },
            PPM_RISK_EXCEL_IMPORT: (vm) => {
                function handleParams(params) {
                    params.customParams = _.extend({}, params.customParams, {
                        className: vm.className,
                        projectId: vm.projectOid
                    });
                    return params;
                }
                let params = {
                    businessName: 'RiskImport',
                    importType: 'excel',
                    handleParams
                };
                actions.import(vm, params);
            },
            PPM_RISK_OPERATE_SET_STATUS: (vm, data, isTableList = false) => {
                actions.setStatus(vm, data, {
                    title: i18nMappingObj.setStatus,
                    stateKey: isTableList ? vm.className + '#' + 'lifecycleStatus.status' : 'lifecycleStatus.status'
                });
            },
            PPM_RIKE_OPERATE_COPY: (vm, row, isTableList = false) => {
                let extendParams = {};
                if (isTableList) {
                    extendParams.nameKey = `${vm.className}#name`;
                    extendParams.creatorId = row.attrRawList.find(
                        (item) => item.attrName === `${vm.className}#createBy`
                    )?.value.id;
                }

                actions.copyItem(vm, row, extendParams);
            },
            PPM_RISK_OPERATE_DELETE: (vm, data, isTableList = false) => {
                actions.deleteItem(vm, data, {
                    listRoute: isTableList
                        ? null
                        : {
                              path: '/space/erdc-ppm-risk',
                              query: {
                                  pid: vm.$route.query.pid
                              }
                          }
                });
            },
            // 多个风险发起流程
            PPM_RISK_LIST_PROCESS: (vm, businessData) => {
                actions.startProcess(vm, { businessData, containerRef, type: 'batch' });
            },
            // 单个风险发起流程
            PPM_RISK_OPERATE_PROCESS: (vm, row) => {
                EventBus.off('PPMProcessSuccessCallback');
                EventBus.once('PPMProcessSuccessCallback', () => {
                    if (vm.refresh) vm.refresh(row.oid);
                });
                actions.startProcess(vm, { containerRef, businessData: [row] });
            },
            PPM_RISK_UPDATE: (vm, data) => {
                vm.$router.push({
                    path: '/space/erdc-ppm-risk/edit',
                    params: {
                        oid: data.oid
                    },
                    query: {
                        pid: vm.$route.query.pid,
                        oid: data.oid,
                        title: `${i18nMappingObj.edit}${data['name'] || data['erd.cloud.ppm.risk.entity.Risk#name']}`
                    }
                });
            }
        };
    };

    return menuActions;
});
