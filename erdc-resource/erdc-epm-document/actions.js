define([
    ELMP.func('erdc-epm-document/config/operateAction.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (operateAction, viewCfg, utils) {
    const ErdcKit = require('erdc-kit');
    const ErdcHttp = require('erdcloud.http');
    const skipValidate = [
        'PDM_EPM_DOCUMENT_CREATE',
        'PDM_EPM_IMPORT',
        'PDM_EPM_EXPORT',
        'PDM_EPM_DOCUMENT_BATCH_DOWNLOAD'
    ];

    const actionNameMap = {
        PDM_EPM_DOCUMENT_REVOKE_UPDATE: '撤销编辑',
        PDM_EPM_DOCUMENT_REVISE: '修订',
        PDM_EPM_DOCUMENT_DELETE: '删除',
        PDM_EPM_DOCUMENT_SET_STATE: '设置状态',
        PDM_EPM_DOCUMENT_SAVE: '保存',
        PDM_EPM_DOCUMENT_SAVE_AS: '另存为',
        PDM_EPM_DOCUMENT_MOVE: '移动',
        PDM_EPM_DOCUMENT_RENAME: '重命名',
        PDM_EPM_DOCUMENT_UPDATE_OWNER: '更改所有者',
        PDM_EPM_DOCUMENT_BATCH_DOWNLOAD: '批量下载文件',
        PDM_EPM_DOCUMENT_ADD_TO_BASE_LINE: '添加至基线',
        PDM_EPM_DOCUMENT_DETAIL_ADD_TO_BASE_LINE: '添加至基线',
        PDM_EPM_DOCUMENT_ADD_TO_WORKSPACE: '添加至工作区',
        PDM_EPM_DOCUMENT_COMPARE_INFO: '信息比较',
        PDM_EPM_DOCUMENT_WORKSPACE_UPDATE: '在工作区编辑',
        PDM_EPM_DOCUMENT_CREATE_ISSUE_REPORT: '发起问题报告',
        PDM_EPM_DOCUMENT_CREATE_CHANGE_REQUEST: '发起变更请求',
        PDM_EPM_DOCUMENT_BATCH_APPROVAL_PROCESS: '批量审批流程'
    };

    function handleBatchValidate(vm, data, params, actionName, changeType) {
        if (!data.length) {
            return vm.$message({
                type: 'warning',
                message: '请选择数据'
            });
        }

        // TODO: 临时处理方式，更好的方式是fam在触发事件时，传入actionName。
        let moduleName = viewCfg.epmDocumentViewTableMap.toolBarOperationName;
        if (actionName === 'PDM_EPM_DOCUMENT_ADD_TO_WORKSPACE' || actionName === 'PDM_EPM_DOCUMENT_ADD_TO_BASE_LINE') {
            moduleName = 'PDM_EPM_DOCUMENT_ADD_TO';
        } else if (
            actionName === 'PDM_EPM_DOCUMENT_CREATE_ISSUE_REPORT' ||
            actionName === 'PDM_EPM_DOCUMENT_CREATE_CHANGE_REQUEST'
        ) {
            moduleName = 'PDM_EPM_DOCUMENT_CHANGE';
        }

        const oids = data.map((row) => row.oid);
        let className = oids[0]?.split(':')?.[1];
        ErdcHttp({
            url: '/epm/menu/before/validator',
            className,
            data: {
                actionName,
                moduleName,
                multiSelect: oids
            },
            method: 'POST'
        }).then((res) => {
            if (res.data && res.data.passed) {
                handleActionExecute(vm, data, params, actionName, changeType);
            } else {
                const messageDtoList = res.data.messageDtoList ?? [];
                const formattedData = messageDtoList.map((item) => {
                    const rowData = _.find(data, { oid: item.oid }) || {};
                    const baseData = ErdcKit.deserializeArray(rowData?.attrRawList || [], {
                        valueKey: 'displayName',
                        isI18n: true
                    });
                    return {
                        ...item,
                        ...baseData,
                        ..._.reduce(
                            rowData?.attrRawList,
                            (prev, next) => {
                                const attrName = next?.attrName?.split('#')?.reverse()?.[0] || next?.attrName || '';
                                return {
                                    ...prev,
                                    [attrName]: next?.displayName || ''
                                };
                            },
                            {}
                        )
                    };
                });

                const dialogIns = operateAction.mountRefuseTip();
                dialogIns.open(formattedData, actionNameMap[actionName]).then((forceContinue) => {
                    if (forceContinue) {
                        const passList = data.filter(
                            (item) => formattedData.findIndex((fItem) => fItem.oid === item.oid) < 0
                        );
                        //信息比较如果只有一条非草稿数据不比较,两条以上才比较
                        if (actionName == 'PDM_EPM_DOCUMENT_COMPARE_INFO' && passList.length == 1) {
                            return false;
                        }
                        passList.length && handleActionExecute(vm, passList, params, actionName, changeType);
                    }
                });
            }
        });
    }

    function handleActionExecute(vm, data, params = {}, actionName, changeType) {
        const actionMap = {
            PDM_EPM_DOCUMENT_CREATE: operateAction.createEpmDocument,
            PDM_EPM_DOCUMENT_UPDATE: operateAction.handleEdit,
            PDM_EPM_DOCUMENT_REVOKE_UPDATE: operateAction.handleReEdit,
            PDM_EPM_DOCUMENT_SAVE: operateAction.handleSave,
            PDM_EPM_DOCUMENT_DELETE: operateAction.handleDelete,
            PDM_EPM_DOCUMENT_REVISE: operateAction.handleReversion,
            PDM_EPM_DOCUMENT_SET_STATE: operateAction.handleSetStatus,
            PDM_EPM_DOCUMENT_SAVE_AS: operateAction.handleSaveAs,
            PDM_EPM_DOCUMENT_MOVE: operateAction.handleMove,
            PDM_EPM_DOCUMENT_BATCH_EDIT_ATTR: operateAction.handleBatchUpdateAttr,
            PDM_EPM_DOCUMENT_RENAME: operateAction.handleRename,
            PDM_EPM_DOCUMENT_UPDATE_OWNER: operateAction.handleModifyOwner,
            PDM_EPM_DOCUMENT_BATCH_DOWNLOAD: operateAction.handleBatchDownload,
            PDM_EPM_DOCUMENT_ADD_TO_BASE_LINE: operateAction.addToBaseLine,
            PDM_EPM_DOCUMENT_DETAIL_ADD_TO_BASE_LINE: operateAction.addToBaseLine,
            PDM_EPM_DOCUMENT_ADD_TO_WORKSPACE: operateAction.addToWorkspace,
            PDM_EPM_DOCUMENT_WORKSPACE_UPDATE: operateAction.editInWorkspaceUpdate,
            PDM_EPM_DOCUMENT_TEMPLATE_CREATE: operateAction.createEpmDocumentTemplate,
            PDM_EPM_DOCUMENT_TEMPLATE_UPDATE: operateAction.editEpmDocumentTemplate,
            PDM_EPM_DOCUMENT_TEMPLATE_DELETE: operateAction.deleteEpmDocumentTemplate,
            PDM_EPM_DOCUMENT_COMPARE_INFO: operateAction.handleInfoCompare,
            PDM_EPM_DOCUMENT_CREATE_ISSUE_REPORT: operateAction.handleCreateChange,
            PDM_EPM_DOCUMENT_CREATE_CHANGE_REQUEST: operateAction.handleCreateChange,
            PDM_EPM_DOCUMENT_CREATE_CHANGE_REPORT: operateAction.handleCreateChange,
            PDM_EPM_DOCUMENT_ASSOCIATION_UPDATE: operateAction.handleUpdateAssociation,
            PDM_EPM_DOCUMENT_BATCH_APPROVAL_PROCESS: operateAction.handleBatchApprovalProcess,
            PDM_EPM_EXPORT: operateAction.exportEpmDocument,
            PDM_EPM_IMPORT: operateAction.importEpmDocument,
            EPM_DOC_STRUCT_COMPARE: operateAction.compareStruct
        };

        actionMap[actionName] && actionMap[actionName].call(vm, data, params.inTable, changeType);
    }

    function handleAction(vm, data, params = {}, actionName, changeType = null) {
        if ((params.inTable && params.isBatch && !skipValidate.includes(actionName)) || params.beforeValidator) {
            handleBatchValidate(vm, data, params, actionName, changeType);
        } else {
            handleActionExecute(vm, data, params, actionName, changeType);
        }
    }

    return {
        // 创建
        PDM_EPM_DOCUMENT_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_CREATE');
        },
        // 编辑
        PDM_EPM_DOCUMENT_UPDATE: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_UPDATE');
        },
        // 撤销编辑
        PDM_EPM_DOCUMENT_REVOKE_UPDATE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_REVOKE_UPDATE');
        },
        // 保存
        PDM_EPM_DOCUMENT_SAVE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_SAVE');
        },
        // 删除
        PDM_EPM_DOCUMENT_DELETE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_DELETE');
        },
        // 修订
        PDM_EPM_DOCUMENT_REVISE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_REVISE');
        },
        // 设置状态
        PDM_EPM_DOCUMENT_SET_STATE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_SET_STATE');
        },
        // 另存为
        PDM_EPM_DOCUMENT_SAVE_AS(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_SAVE_AS');
        },
        // 移动
        PDM_EPM_DOCUMENT_MOVE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_MOVE');
        },
        // 批量编辑属性
        PDM_EPM_DOCUMENT_BATCH_EDIT_ATTR(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_BATCH_EDIT_ATTR');
        },
        // 重命名
        PDM_EPM_DOCUMENT_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_RENAME');
        },
        // 更改所有者
        PDM_EPM_DOCUMENT_UPDATE_OWNER(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_UPDATE_OWNER');
        },
        //批量下载文件
        PDM_EPM_DOCUMENT_BATCH_DOWNLOAD(vm, row, params) {
            // 处理表格数据
            let data = [];
            _.isEmpty(row) ? (data = utils.getViewTableData(vm)) : (data = row);
            handleAction(vm, data, params, 'PDM_EPM_DOCUMENT_BATCH_DOWNLOAD');
        },
        // 添加至基线
        PDM_EPM_DOCUMENT_ADD_TO_BASE_LINE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_ADD_TO_BASE_LINE');
        },
        // 详情页添加至基线
        PDM_EPM_DOCUMENT_DETAIL_ADD_TO_BASE_LINE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_DETAIL_ADD_TO_BASE_LINE');
        },
        // 添加至工作区
        PDM_EPM_DOCUMENT_ADD_TO_WORKSPACE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_ADD_TO_WORKSPACE');
        },
        // 在工作区编辑
        PDM_EPM_DOCUMENT_WORKSPACE_UPDATE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_WORKSPACE_UPDATE');
        },
        // 创建模型模板
        PDM_EPM_DOCUMENT_TEMPLATE_CREATE(vm, row, params) {
            handleActionExecute(vm, row, params, 'PDM_EPM_DOCUMENT_TEMPLATE_CREATE');
        },
        // 编辑模型模板
        PDM_EPM_DOCUMENT_TEMPLATE_UPDATE(vm, row, params) {
            handleActionExecute(vm, row, params, 'PDM_EPM_DOCUMENT_TEMPLATE_UPDATE');
        },
        // 删除模型模板
        PDM_EPM_DOCUMENT_TEMPLATE_DELETE(vm, row, params) {
            handleActionExecute(vm, row, params, 'PDM_EPM_DOCUMENT_TEMPLATE_DELETE');
        },
        PDM_EPM_DOCUMENT_COMPARE_INFO(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_COMPARE_INFO');
        },
        // 创建问题报告
        PDM_EPM_DOCUMENT_CREATE_ISSUE_REPORT(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_CREATE_ISSUE_REPORT', 'PR');
        },
        // 创建变更请求
        PDM_EPM_DOCUMENT_CREATE_CHANGE_REQUEST(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_CREATE_CHANGE_REQUEST', 'ECR');
        },
        // 创建变更通告
        PDM_EPM_DOCUMENT_CREATE_CHANGE_REPORT(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_CREATE_CHANGE_REPORT', 'ECN');
        },
        // 编辑关联
        PDM_EPM_DOCUMENT_ASSOCIATION_UPDATE(vm, row, params) {
            handleActionExecute(vm, row, params, 'PDM_EPM_DOCUMENT_ASSOCIATION_UPDATE');
        },
        // 模型批量审批流程
        PDM_EPM_DOCUMENT_BATCH_APPROVAL_PROCESS(vm, row, params) {
            handleAction(vm, row, params, 'PDM_EPM_DOCUMENT_BATCH_APPROVAL_PROCESS');
        },
        // 导出
        PDM_EPM_EXPORT(vm, row, params) {
            handleActionExecute(vm, row, params, 'PDM_EPM_EXPORT');
        },
        // 导入
        PDM_EPM_IMPORT(vm, row, params) {
            handleActionExecute(vm, row, params, 'PDM_EPM_IMPORT');
        },
        // 结构比较
        EPM_DOC_STRUCT_COMPARE(vm, row, params, actionData, moduleName) {
            moduleName = moduleName || 'PDM_EPM_DOCUMENT_STRUCT_MENU';
            if (!Array.isArray(row)) row = [row];
            handleAction(vm, row, { ...params, beforeValidator: true, moduleName }, 'EPM_DOC_STRUCT_COMPARE');
        }
    };
});
