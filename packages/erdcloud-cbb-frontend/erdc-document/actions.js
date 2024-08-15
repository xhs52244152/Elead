// 存放全局注册的方法

define([
    ELMP.func('erdc-document/config/operateAction.js'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (operateAction, viewCfg, utils) {
    const ErdcKit = require('erdc-kit');
    const ErdcHttp = require('erdcloud.http');
    const skipValidate = ['DOC_CREATE', 'DOC_IMPORT', 'DOC_EXPORT', 'DOC_BATCH_DOWNLOAD'];

    const actionNameMap = {
        DOC_CANCEL_UPDATE: '撤销编辑',
        DOC_REVERSION: '修订',
        DOC_DELETE: '删除',
        DOC_SET_STATUS: '设置状态',
        DOC_SAVE: '保存',
        DOC_SAVE_AS: '另存为',
        DOC_MOVE: '移动',
        DOC_RENAME: '重命名',
        DOC_MODIFY_OWNER: '更改所有者',
        DOC_BATCH_DOWNLOAD: '批量下载文件',
        DOC_REPLACE_CONTENT: '替换主要内容源',
        DOC_ADD_BASELINE: '添加至基线',
        DOC_COMPARE: '信息比较',
        DOC_CREATE_ISSUE_REPORT: '发起问题报告',
        DOC_CREATE_CHANGE: '发起变更请求',
        DOC_BATCH_REVIEW_PROCESS: '批量审批流程'
    };

    function handleBatchValidate(vm, data, params, actionName, changeType) {
        if (!data.length) {
            return vm.$message({
                type: 'warning',
                message: '请选择数据'
            });
        }

        let moduleName = viewCfg.docViewTableMap.validatorName;
        if (['DOC_CREATE_ISSUE_REPORT', 'DOC_CREATE_CHANGE'].includes(actionName)) {
            moduleName = 'CHANGE';
        }

        const oids = data.map((row) => row.oid);
        let className = oids[0]?.split(':')?.[1];
        ErdcHttp({
            url: '/document/menu/before/validator',
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
                const messageDtoList = res?.data?.messageDtoList || [];
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
                        if (actionName == 'DOC_COMPARE' && passList.length == 1) {
                            return false;
                        }
                        passList.length && handleActionExecute(vm, passList, params, actionName, changeType);
                    }
                });
            }
        });
    }

    function handleActionExecute(vm, data, params, actionName, changeType) {
        const actionMap = {
            DOC_TEMPLATE_CREATE: operateAction.handleCreateTemplate,
            DOC_TEMPLATE_EDIT: operateAction.handleEditTemplate,
            DOC_CREATE: operateAction.handleCreate,
            DOC_UPDATE: operateAction.handleEdit,
            DOC_CANCEL_UPDATE: operateAction.handleCancelEdit,
            DOC_REVERSION: operateAction.handleReversion,
            DOC_DELETE: operateAction.handleDelete,
            DOC_SET_STATUS: operateAction.handleSetState,
            DOC_SAVE: operateAction.handleSave,
            DOC_SAVE_AS: operateAction.handleSaveAs,
            DOC_MOVE: operateAction.handleMove,
            DOC_BATCH_UPDATE_ATTR: operateAction.handleBatchUpdateAttr,
            DOC_RENAME: operateAction.handleRename,
            DOC_MODIFY_OWNER: operateAction.handleModifyOwner,
            DOC_DOWNLOAD: operateAction.handleDownload,
            // DOC_BATCH_DOWNLOAD: operateAction.handleDownload,
            DOC_BATCH_DOWNLOAD: operateAction.handleBatchDownload,
            DOC_REPLACE_CONTENT: operateAction.handleReplaceContent,
            DOC_ADD_BASELINE: operateAction.handleAddToBaseline,
            // 导出
            DOC_EXPORT: operateAction.exportDocument,
            // 导入
            DOC_IMPORT: operateAction.importDocument,
            // 在线预览
            DOC_ONLINE_PREVIEW: operateAction.handleFilePreview,
            // 在线编辑
            DOC_ONLINE_UPDATE: operateAction.handleFileUpdate,
            //信息比较
            DOC_COMPARE: operateAction.handleInfoCompare,
            DOC_CREATE_ISSUE_REPORT: operateAction.handleCreateChange,
            DOC_CREATE_CHANGE: operateAction.handleCreateChange,
            // 文档批量审批流程
            DOC_BATCH_REVIEW_PROCESS: operateAction.handleBatchApprovalProcess,
            //打开主要url
            DOC_POEN_URL: operateAction.handleOpenURL,
            // 结构比较
            DOC_STRUCT_COMPARE: operateAction.compareStruct
        };

        actionMap[actionName] && actionMap[actionName].call(vm, data, params?.inTable, changeType);
    }

    function handleAction(vm, data, params, actionName, changeType = null) {
        if ((params?.inTable && params?.isBatch && !skipValidate.includes(actionName)) || params.beforeValidator) {
            handleBatchValidate(vm, data, params, actionName, changeType);
        } else {
            handleActionExecute(vm, data, params, actionName, changeType);
        }
    }

    return {
        // 创建文档模板
        DOC_TEMPLATE_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_TEMPLATE_CREATE');
        },
        // 编辑文档模板
        DOC_TEMPLATE_EDIT: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_TEMPLATE_EDIT');
        },
        // 创建
        DOC_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_CREATE');
        },
        // 编辑
        DOC_UPDATE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_UPDATE');
        },
        // 撤销编辑
        DOC_CANCEL_UPDATE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_CANCEL_UPDATE');
        },
        // 修订
        DOC_REVERSION: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_REVERSION');
        },
        // 删除
        DOC_DELETE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_DELETE');
        },
        // 设置状态
        DOC_SET_STATUS: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_SET_STATUS');
        },
        // 保存
        DOC_SAVE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_SAVE');
        },
        // 另存为
        DOC_SAVE_AS: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_SAVE_AS');
        },
        // 移动
        DOC_MOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_MOVE');
        },
        // 重命名
        DOC_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_RENAME');
        },
        // 更改所有者
        DOC_MODIFY_OWNER: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_MODIFY_OWNER');
        },
        // 下载文件
        DOC_DOWNLOAD: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_DOWNLOAD');
        },
        // 批量编辑属性
        DOC_BATCH_UPDATE_ATTR(vm, row, params) {
            handleAction(vm, row, params, 'DOC_BATCH_UPDATE_ATTR');
        },
        // // 批量下载文件(原有的)
        // DOC_BATCH_DOWNLOAD: (vm, row, params) => {
        //     handleAction(vm, row, params, 'DOC_BATCH_DOWNLOAD');
        // },
        //批量下载文件
        DOC_BATCH_DOWNLOAD(vm, row, params) {
            // 处理表格数据
            let data = [];
            _.isEmpty(row) ? (data = utils.getViewTableData(vm)) : (data = row);
            handleAction(vm, data, params, 'DOC_BATCH_DOWNLOAD');
        },
        // 重新分配生命周期
        DOC_RESTATUS: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_RESTATUS');
        },
        // 替换主要内容源
        DOC_REPLACE_CONTENT: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_REPLACE_CONTENT');
        },
        // 添加至基线
        DOC_ADD_BASELINE: (vm, row, params) => {
            if (vm.handleToBaseline) return vm.handleToBaseline();
            handleAction(vm, row, params, 'DOC_ADD_BASELINE');
        },
        // 在线预览
        DOC_ONLINE_PREVIEW: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_ONLINE_PREVIEW');
        },
        // 在线编辑
        DOC_ONLINE_UPDATE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_ONLINE_UPDATE');
        },
        //信息比较
        DOC_COMPARE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_COMPARE');
        },
        // 创建问题报告
        DOC_CREATE_ISSUE_REPORT: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_CREATE_ISSUE_REPORT', 'PR');
        },
        // 创建变更请求
        DOC_CREATE_CHANGE: (vm, row, params) => {
            handleAction(vm, row, params, 'DOC_CREATE_CHANGE', 'ECR');
        },
        // 文档批量审批流程
        DOC_BATCH_REVIEW_PROCESS(vm, row, params) {
            handleAction(vm, row, params, 'DOC_BATCH_REVIEW_PROCESS');
        },
        //打开主要URL
        DOC_POEN_URL(vm, row, params) {
            handleAction(vm, row, params, 'DOC_POEN_URL');
        },
        // 导出
        DOC_EXPORT(vm, row, params) {
            handleAction(vm, row, params, 'DOC_EXPORT');
        },
        // 导入
        DOC_IMPORT(vm, row, params) {
            handleAction(vm, row, params, 'DOC_IMPORT');
        },
        // 结构比较
        DOC_STRUCT_COMPARE(vm, row, params, actionData, moduleName) {
            moduleName = moduleName || 'DOC_STRUCT_OP_MENU';
            if (!Array.isArray(row)) row = [row];
            handleAction(vm, row, { ...params, beforeValidator: true, moduleName }, 'DOC_STRUCT_COMPARE');
        }
    };
});
