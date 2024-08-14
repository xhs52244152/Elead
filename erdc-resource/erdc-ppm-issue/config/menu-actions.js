define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.func('erdc-ppm-issue/locale/index.js'),
    'EventBus'
], function (actions, globalUtils, { i18n }, EventBus) {
    const i18nMappingObj = globalUtils.languageTransfer(i18n);
    return function (getData) {
        let projectInfo = getData();
        let containerRef = `OR:${projectInfo?.containerRef?.key}:${projectInfo?.containerRef?.id}`;
        const utils = {
            commonRemoveRelated: (vm, row, it) => {
                vm.tabsConfig = it;
                actions.deleteItem(vm, row, {
                    title: i18nMappingObj.removeTips
                });
            },
            issueExport: (vm) => {
                const getExportRequestData = (data, requestData) => {
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    let params = {
                        businessName: 'IssueExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1745260228997775361',
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
                    tableRef: 'issueList',
                    getExportRequestData
                };
                actions.export(vm, params);
            }
        };
        return {
            // 编辑
            PPM_ISSUE_UPDATE: (vm, data) => {
                vm.$router.push({
                    path: '/issue/edit',
                    params: {
                        oid: data.oid
                    },
                    query: {
                        title: `${i18nMappingObj.edit}${data.name || data['erd.cloud.ppm.issue.entity.Issue#name']}`,
                        oid: data.oid,
                        pid: vm.$route.query.pid || data.projectRef
                    }
                });
            },
            // 单个删除
            PPM_ISSUE_OPERATE_DELETE: (vm, data, isTableList = false) => {
                actions.deleteItem(vm, data, {
                    listRoute: isTableList
                        ? null
                        : {
                              path: 'space/erdc-ppm-issue',
                              query: {
                                  pid: vm.$route.query.pid || data.projectRef
                              }
                          }
                });
            },
            // 单个发起流程
            PPM_ISSUE_OPERATE_PROCESS: (vm, row) => {
                EventBus.off('PPMProcessSuccessCallback');
                EventBus.once('PPMProcessSuccessCallback', () => {
                    if (vm.refresh) vm.refresh(row.oid);
                });
                actions.startProcess(vm, { containerRef, businessData: [row] });
            },
            // 多个问题发起流程
            PPM_ISSUE_LIST_PROCESS: (vm, businessData) => {
                actions.startProcess(vm, { businessData, containerRef, type: 'batch' });
            },
            // 单个设置状态
            PPM_ISSUE_OPERATE_SET_STATUS: (vm, data, isTableList = false) => {
                actions.setStatus(vm, data, {
                    title: i18nMappingObj.setIssueStatus,
                    stateKey: isTableList ? vm.className + '#' + 'lifecycleStatus.status' : 'lifecycleStatus.status'
                });
            },
            // 复制
            PPM_ISSUE_OPERATE_COPY: (vm, row, isTableList = false) => {
                let extendParams = {};
                if (isTableList) {
                    extendParams.nameKey = `${vm.className}#name`;
                    extendParams.creatorId = row.attrRawList.find(
                        (item) => item.attrName === `${vm.className}#createBy`
                    )?.value.id;
                }

                actions.copyItem(vm, row, extendParams);
            },
            // 关联 问题移除问题关联
            ISSUE_ISSUE_DELETE: utils.commonRemoveRelated,
            // 关联 问题移除风险关联
            ISSUE_RISK_DELETE: utils.commonRemoveRelated,
            // 关联 问题移除任务关联
            ISSUE_TASK_DELETE: utils.commonRemoveRelated,
            // 关联 问题移除需求关联
            ISSUE_REQUIREMENT_DELETE: utils.commonRemoveRelated,
            // 批量删除问题
            PPM_ISSUE_LIST_DELETE: (vm, selected) => {
                actions.batchDeleteItems(vm, selected);
            },
            // 创建
            PPM_ISSUE_CREATE: (vm) => {
                vm.$router.push({
                    path: '/container/erdc-ppm-issue/issue/create',
                    query: {
                        pid: vm.$route.query.pid
                    }
                });
            },
            // 我的问题导出
            ISSUE_EXPORT: (vm) => {
                utils.issueExport(vm);
            },
            // 项目详情问题导出
            PPM_ISSUE_EXCEL_EXPORT: (vm) => {
                utils.issueExport(vm);
            },
            // 项目详情问题导入
            PPM_ISSUE_EXCEL_IMPORT: (vm) => {
                function handleParams(params) {
                    params.customParams = _.extend({}, params.customParams, {
                        className: vm.className,
                        projectId: vm.projectOid
                    });
                    return params;
                }
                let params = {
                    businessName: 'IssueImport',
                    importType: 'excel',
                    className: 'erd.cloud.ppm.project.entity.Issue',
                    handleParams
                };
                actions.import(vm, params);
            },
            // 批量设置状态
            PPM_ISSUE_LIST_SET_STATUS: (vm, selected) => {
                actions.batchSetStatus(vm, selected, {
                    title: i18nMappingObj.setIssueStatus
                });
            }
        };
    };
});
