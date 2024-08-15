define([
    ELMP.func('erdc-part/config/operateAction.js'),
    ELMP.func('erdc-part/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (operateAction, viewCfg, utils) {
    const ErdcKit = require('erdc-kit');
    const ErdcHttp = require('erdcloud.http');
    const skipValidate = ['PDM_PART_LIST_CREATE', 'PDM_PART_IMPORT', 'PDM_PART_EXPORT', 'PDM_PART_BATCH_DOWNLOAD_FILE'];

    const actionNameMap = {
        DOC_CANCEL_UPDATE: '撤销编辑',
        PDM_PART_LIST_REVISE: '修订',
        PDM_PART_LIST_DELETE: '删除',
        PDM_PART_LIST_SETSTATES: '设置状态',
        PDM_PART_LIST_SAVE: '保存',
        PDM_PART_LIST_SAVEAS: '另存为',
        PDM_PART_LIST_MOVE: '移动',
        PDM_PART_LIST_RENAME: '重命名',
        PDM_PART_LIST_UPDATEOWNER: '更改所有者',
        PDM_PART_BATCH_DOWNLOAD_FILE: '批量下载文件',
        PDM_PART_ADD_TO_BASE_LINE: '添加至基线',
        PDM_PART_ADD_TO_WORKSPACE: '添加至工作区',
        PDM_COMPARE_INFO: '信息比较',
        PART_CREATE_ISSUE_REPORT: '发起问题报告',
        PART_CREATE_CHANGE: '发起变更请求',
        PDM_PART_BATCH_APPROVAL_PROCESS: '批量审批流程',
        PART_CREATE_BOM_RELEASE: 'BOM发布流程'
    };

    function handleBatchValidate(vm, data, params, actionName, changeType) {
        if (!data.length) {
            return vm.$message({
                type: 'warning',
                message: '请选择数据'
            });
        }

        // TODO: 临时处理方式，更好的方式是fam在触发事件时，传入actionName。
        let moduleName = params.moduleName || viewCfg.partViewTableMap.toolBarOperationName;
        if (actionName === 'PDM_PART_ADD_TO_WORKSPACE' || actionName === 'PDM_PART_ADD_TO_BASE_LINE') {
            moduleName = 'PDM_PART_MENU_ADD_TO';
        } else if (actionName === 'PART_CREATE_ISSUE_REPORT' || actionName === 'PART_CREATE_CHANGE') {
            moduleName = 'PART_CHANGE';
        } else if (
            actionName === 'PDM_PART_BATCH_EDIT_ATTR' ||
            actionName === 'PDM_PART_BATCH_EDIT_BOM' ||
            actionName === 'PDM_PART_BATCH_DOWNLOAD_FILE'
        ) {
            moduleName = 'PART_BATCH_HANDLE';
        } else if (actionName === 'PDM_COMPARE_INFO') {
            moduleName = 'PART_LIST_COMPARE';
        }

        const oids = data.map((row) => row.oid);
        let className = oids[0]?.split(':')?.[1];
        ErdcHttp({
            url: '/part/menu/before/validator',
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
                        if (actionName == 'PDM_COMPARE_INFO' && passList.length == 1) {
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
            PDM_PART_LIST_CREATE: operateAction.createPart,
            PDM_PART_LIST_UPDATE: operateAction.handleEdit,
            PDM_PART_LIST_REVOKEUPDATE: operateAction.handleReEdit,
            PDM_PART_LIST_SAVE: operateAction.handleSave,
            PDM_PART_LIST_DELETE: operateAction.handleDelete,
            PDM_PART_LIST_REVISE: operateAction.handleReversion,
            PDM_PART_LIST_SETSTATES: operateAction.handleSetStatus,
            PDM_PART_LIST_SAVEAS: operateAction.handleSaveAs,
            PDM_PART_LIST_MOVE: operateAction.handleMove,
            PDM_PART_BATCH_EDIT_ATTR: operateAction.handleBatchUpdateAttr,
            PDM_PART_LIST_RENAME: operateAction.handleRename,
            PDM_PART_LIST_UPDATEOWNER: operateAction.handleModifyOwner,
            PDM_PART_BATCH_DOWNLOAD_FILE: operateAction.handleBatchDownload,
            PDM_PART_ADD_TO_BASE_LINE: operateAction.addToBaseLine,
            PDM_PART_ADD_TO_WORKSPACE: operateAction.addToWorkspace,
            PDM_PART_LIST_CREATE_VIEWVERSION: operateAction.handleViewVersionCreate,
            PDM_PART_BATCH_APPROVAL_PROCESS: operateAction.handleBatchApprovalProcess,
            PART_CREATE_BOM_RELEASE: operateAction.handleBomReleaseProcess,
            PDM_COMPARE_INFO: operateAction.handleInfoCompare,
            PART_CREATE_ISSUE_REPORT: operateAction.handleCreateChange,
            PART_CREATE_CHANGE: operateAction.handleCreateChange,
            PDM_PART_IMPORT: operateAction.importPart,
            PDM_PART_EXPORT: operateAction.exportPart,
            PDM_COMPARE_STRUCT: operateAction.compareStruct,
            PDM_PART_BOM_EXPORT: operateAction.exportBom
            // PDM_PART_CREATE_CHANGE_REPORT:operateAction.handleCreateChange,
        };

        actionMap[actionName] && actionMap[actionName].call(vm, data, params.inTable, changeType, params.moduleName);
    }

    function handleAction(vm, data, params = {}, actionName, changeType = null) {
        if ((params.inTable && params.isBatch && !skipValidate.includes(actionName)) || params.beforeValidator) {
            handleBatchValidate(vm, data, params, actionName, changeType);
        } else {
            handleActionExecute(vm, data, params, actionName, changeType);
        }
    }

    return {
        PDM_PART_LIST_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_PART_LIST_CREATE');
        },
        PDM_PART_LIST_UPDATE: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_PART_LIST_UPDATE');
        },
        PDM_PART_LIST_REVOKEUPDATE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_REVOKEUPDATE');
        },
        PDM_PART_LIST_SAVE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_SAVE');
        },
        PDM_PART_LIST_DELETE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_DELETE');
        },
        // 修订
        PDM_PART_LIST_REVISE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_REVISE');
        },
        // 设置状态
        PDM_PART_LIST_SETSTATES(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_SETSTATES');
        },
        // 另存为
        PDM_PART_LIST_SAVEAS(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_SAVEAS');
        },
        PDM_PART_LIST_MOVE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_MOVE');
        },
        // 批量编辑属性
        PDM_PART_BATCH_EDIT_ATTR(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_BATCH_EDIT_ATTR');
        },
        PDM_PART_LIST_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_PART_LIST_RENAME');
        },
        PDM_PART_LIST_UPDATEOWNER(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_UPDATEOWNER');
        },
        // 批量下载文件
        PDM_PART_BATCH_DOWNLOAD_FILE(vm, row, params) {
            // 处理表格数据
            let data = [];
            _.isEmpty(row) ? (data = utils.getViewTableData(vm)) : (data = row);
            handleAction(vm, data, params, 'PDM_PART_BATCH_DOWNLOAD_FILE');
        },
        PDM_PART_ADD_TO_BASE_LINE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_ADD_TO_BASE_LINE');
        },
        // 添加至工作区
        PDM_PART_ADD_TO_WORKSPACE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_ADD_TO_WORKSPACE');
        },
        PDM_PART_LIST_CREATE_VIEWVERSION(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_LIST_CREATE_VIEWVERSION');
        },
        // 批量审批流程
        PDM_PART_BATCH_APPROVAL_PROCESS(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_BATCH_APPROVAL_PROCESS');
        },
        // bom发布流程
        PART_CREATE_BOM_RELEASE(vm, row, params) {
            handleAction(vm, row, params, 'PART_CREATE_BOM_RELEASE');
        },
        //信息比较
        PDM_COMPARE_INFO(vm, row, params) {
            handleAction(vm, row, params, 'PDM_COMPARE_INFO');
        },
        // 创建问题报告
        PART_CREATE_ISSUE_REPORT(vm, row, params) {
            handleAction(vm, row, params, 'PART_CREATE_ISSUE_REPORT', 'PR');
        },
        // 创建变更请求
        PART_CREATE_CHANGE(vm, row, params) {
            handleAction(vm, row, params, 'PART_CREATE_CHANGE', 'ECR');
        },
        // 部件导入
        PDM_PART_IMPORT(vm, row, params, actionData, moduleName) {
            moduleName = moduleName || 'PDM_PART_STRUCT_OPERATE';
            handleAction(vm, row, { ...params, moduleName }, 'PDM_PART_IMPORT');
        },
        // 部件导出
        PDM_PART_EXPORT(vm, row, params) {
            handleAction(vm, row, params, 'PDM_PART_EXPORT');
        },
        // 结构比较
        PDM_COMPARE_STRUCT(vm, row, params, actionData, moduleName) {
            moduleName = moduleName || 'PDM_PART_STRUCT_OPERATE';
            if (!Array.isArray(row)) row = [row];
            handleAction(vm, row, { ...params, beforeValidator: true, moduleName }, 'PDM_COMPARE_STRUCT');
        },
        // BOM 导出数据
        PDM_PART_BOM_EXPORT(vm, row, params, actionData, moduleName) {
            moduleName = moduleName || 'PDM_PART_STRUCT_OPERATE';
            handleAction(vm, row, { ...params, moduleName }, 'PDM_PART_BOM_EXPORT');
        }
        // 创建变更通告
        // PDM_PART_CREATE_CHANGE_REPORT(vm, row, params) {
        //     handleAction(vm, row, params, 'PDM_PART_CREATE_CHANGE_REPORT', 'ECN');
        // },
    };
});
