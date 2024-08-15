define([
    ELMP.func('erdc-change/config/operateAction.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/locale/index.js')
], function (operateAction, viewCfg, locale) {
    const ErdcHttp = require('erdcloud.http');
    const ErdcKit = require('erdc-kit');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    const actionNameMap = {
        CHANGE_ISSUE_DELETE: i18n['delete'],
        CHANGE_REQUEST_DELETE: i18n['delete'],
        CHANGE_ORDER_DELETE: i18n['delete'],
        CHANGE_ACTIVITY_DELETE: i18n['delete'],
        CHANGE_ISSUE_SET_STATUS: i18n['state'],
        CHANGE_REQUEST_SET_STATUS: i18n['state'],
        CHANGE_ORDER_SET_STATUS: i18n['state'],
        CHANGE_ACTIVITY_SET_STATUS: i18n['state'],
        CHANGE_ISSUE_SAVE_AS: i18n['saveAs'],
        CHANGE_REQUEST_SAVE_AS: i18n['saveAs'],
        CHANGE_ORDER_SAVE_AS: i18n['saveAs'],
        CHANGE_ACTIVITY_SAVE_AS: i18n['saveAs'],
        CHANGE_ISSUE_MOVE: i18n['move'],
        CHANGE_REQUEST_MOVE: i18n['move'],
        CHANGE_ORDER_MOVE: i18n['move'],
        CHANGE_ACTIVITY_MOVE: i18n['move'],
        CHANGE_ISSUE_RENAME: i18n['rename'],
        CHANGE_REQUEST_RENAME: i18n['rename'],
        CHANGE_ORDER_RENAME: i18n['rename'],
        CHANGE_ACTIVITY_RENAME: i18n['rename'],
        CHANGE_ISSUE_MODIFY_OWNER: i18n['owner'],
        CHANGE_REQUEST_MODIFY_OWNER: i18n['owner'],
        CHANGE_ORDER_MODIFY_OWNER: i18n['owner'],
        CHANGE_ACTIVITY_MODIFY_OWNER: i18n['owner'],
        CHANGE_ISSUE_CREATE_CHANGE_REQUEST: i18n['createECR'],
        CHANGE_REQUEST_CREATE_CHANGE_ORDER: i18n['createECN']
    };
    const tableViewMap = {
        PR: 'prChangeTableView',
        ECR: 'ecrChangeTableView',
        ECN: 'ecnChangeTableView',
        ECA: 'ecaChangeTableView'
    };

    function handleBatchValidate(vm, data, params, actionName, type) {
        // 过滤子节点数据
        data = data.filter((item) => !item.isChild);
        const config = viewCfg?.[tableViewMap[type]];
        if (!data.length) {
            return vm.$message({
                type: 'warning',
                message: '请选择数据'
            });
        }

        const oids = data.map((row) => row.oid);
        ErdcHttp({
            url: '/change/menu/before/validator',
            className: config.className,
            data: {
                actionName,
                moduleName: config.listOperateName,
                multiSelect: oids
            },
            method: 'POST'
        }).then((res) => {
            if (res.data && res.data.passed) {
                handleActionExecute(vm, data, params, actionName, type, config);
            } else {
                const formattedData = res.data.messageDtoList.map((item) => {
                    const baseData = ErdcKit.deserializeArray(
                        data.find((rItem) => rItem.oid === item.oid).attrRawList,
                        {
                            valueKey: 'displayName',
                            isI18n: true
                        }
                    );
                    return {
                        ...item,
                        ...baseData
                    };
                });

                const dialogIns = operateAction.mountRefuseTip();
                dialogIns.open(formattedData, actionNameMap[actionName]).then((forceContinue) => {
                    if (forceContinue) {
                        const passList = data.filter(
                            (item) => formattedData.findIndex((fItem) => fItem.oid === item.oid) < 0
                        );
                        passList.length && handleActionExecute(vm, passList, params, actionName, type);
                    }
                });
            }
        });
    }
    function handleActionExecute(vm, data, params, actionName, type) {
        const config = viewCfg?.[tableViewMap[type]];
        const actionMap = {
            // 问题报告
            CHANGE_ISSUE_CREATE: operateAction.handleCreate,
            CHANGE_ISSUE_EDIT: operateAction.handleEdit,
            CHANGE_ISSUE_DELETE: operateAction.handleDelete,
            CHANGE_ISSUE_RENAME: operateAction.handleRename,
            CHANGE_ISSUE_SET_STATUS: operateAction.handleSetState,
            CHANGE_ISSUE_MOVE: operateAction.handleMove,
            CHANGE_ISSUE_CREATE_CHANGE_REQUEST: operateAction.handleCreateOther,
            CHANGE_ISSUE_MODIFY_OWNER: operateAction.handleModifyOwner,
            // 变更请求
            CHANGE_REQUEST_CREATE: operateAction.handleCreate,
            CHANGE_REQUEST_EDIT: operateAction.handleEdit,
            CHANGE_REQUEST_DELETE: operateAction.handleDelete,
            CHANGE_REQUEST_RENAME: operateAction.handleRename,
            CHANGE_REQUEST_SET_STATUS: operateAction.handleSetState,
            CHANGE_REQUEST_MOVE: operateAction.handleMove,
            CHANGE_REQUEST_CREATE_CHANGE_ORDER: operateAction.handleCreateOther,
            CHANGE_REQUEST_MODIFY_OWNER: operateAction.handleModifyOwner,
            // 变更通告
            CHANGE_ORDER_CREATE: operateAction.handleCreate,
            CHANGE_ORDER_EDIT: operateAction.handleEdit,
            CHANGE_ORDER_DELETE: operateAction.handleDelete,
            CHANGE_ORDER_RENAME: operateAction.handleRename,
            CHANGE_ORDER_SET_STATUS: operateAction.handleSetState,
            CHANGE_ORDER_MOVE: operateAction.handleMove,
            CHANGE_ORDER_MODIFY_OWNER: operateAction.handleModifyOwner,
            // 变更任务
            CHANGE_ACTIVITY_EDIT: operateAction.handleEdit,
            CHANGE_ACTIVITY_DELETE: operateAction.handleDelete,
            CHANGE_ACTIVITY_RENAME: operateAction.handleRename,
            CHANGE_ACTIVITY_SET_STATUS: operateAction.handleSetState,
            CHANGE_ACTIVITY_MOVE: operateAction.handleMove,
            CHANGE_ACTIVITY_MODIFY_OWNER: operateAction.handleModifyOwner,
            CHANGE_ACTIVITY_REVERSION: operateAction.handleReversion,
            CHANGE_ACTIVITY_COLLECTOR: operateAction.handleCollector,
            CHANGE_ACTIVITY_REMOVE: operateAction.handleRemove,
            CHANGE_PRODUCE_REMOVE: operateAction.handleRemove,
            CHANGE_PRODUCE_BATCH_UPDATE_ATTR: operateAction.handleBatchUpdateAttr
        };

        actionMap[actionName] && actionMap[actionName].call(vm, data, params?.inTable, type, config);
    }

    function handleAction(vm, data, params, actionName, type) {
        const createList = ['CHANGE_ISSUE_CREATE', 'CHANGE_REQUEST_CREATE', 'CHANGE_ORDER_CREATE'];
        if (params?.inTable && params?.isBatch && !createList.includes(actionName)) {
            handleBatchValidate(vm, data, params, actionName, type);
        } else {
            handleActionExecute(vm, data, params, actionName, type);
        }
    }

    return {
        // 问题报告
        // 创建
        CHANGE_ISSUE_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_CREATE', 'PR');
        },
        // 编辑
        CHANGE_ISSUE_EDIT: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_EDIT', 'PR');
        },
        // 删除
        CHANGE_ISSUE_DELETE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_DELETE', 'PR');
        },
        // 设置状态
        CHANGE_ISSUE_SET_STATUS: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_SET_STATUS', 'PR');
        },
        // 移动
        CHANGE_ISSUE_MOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_MOVE', 'PR');
        },
        // 重命名
        CHANGE_ISSUE_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_RENAME', 'PR');
        },
        // 创建变更请求
        CHANGE_ISSUE_CREATE_CHANGE_REQUEST: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_CREATE_CHANGE_REQUEST', 'PR');
        },
        // 更改所有者
        CHANGE_ISSUE_MODIFY_OWNER: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ISSUE_MODIFY_OWNER', 'PR');
        },

        // 变更请求
        // 创建
        CHANGE_REQUEST_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_CREATE', 'ECR');
        },
        // 编辑
        CHANGE_REQUEST_EDIT: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_EDIT', 'ECR');
        },
        // 删除
        CHANGE_REQUEST_DELETE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_DELETE', 'ECR');
        },
        // 重命名
        CHANGE_REQUEST_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_RENAME', 'ECR');
        },
        // 设置状态
        CHANGE_REQUEST_SET_STATUS: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_SET_STATUS', 'ECR');
        },
        // 移动
        CHANGE_REQUEST_MOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_MOVE', 'ECR');
        },
        // 创建变更通告
        CHANGE_REQUEST_CREATE_CHANGE_ORDER: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_CREATE_CHANGE_ORDER', 'ECR');
        },
        // 更改所有者
        CHANGE_REQUEST_MODIFY_OWNER: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_REQUEST_MODIFY_OWNER', 'ECR');
        },
        // 变更通告
        // 创建
        CHANGE_ORDER_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_CREATE', 'ECN');
        },
        // 编辑
        CHANGE_ORDER_EDIT: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_EDIT', 'ECN');
        },
        // 删除
        CHANGE_ORDER_DELETE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_DELETE', 'ECN');
        },
        // 重命名
        CHANGE_ORDER_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_RENAME', 'ECN');
        },
        // 设置状态
        CHANGE_ORDER_SET_STATUS: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_SET_STATUS', 'ECN');
        },
        // 移动
        CHANGE_ORDER_MOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_MOVE', 'ECN');
        },
        // 更改所有者
        CHANGE_ORDER_MODIFY_OWNER: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ORDER_MODIFY_OWNER', 'ECN');
        },
        // 变更任务
        // 编辑
        CHANGE_ACTIVITY_EDIT: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_EDIT', 'ECA');
        },
        // 删除
        CHANGE_ACTIVITY_DELETE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_DELETE', 'ECA');
        },
        // 重命名
        CHANGE_ACTIVITY_RENAME: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_RENAME', 'ECA');
        },
        // 设置状态
        CHANGE_ACTIVITY_SET_STATUS: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_SET_STATUS', 'ECA');
        },
        // 移动
        CHANGE_ACTIVITY_MOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_MOVE', 'ECA');
        },
        // 更改所有者
        CHANGE_ACTIVITY_MODIFY_OWNER: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_MODIFY_OWNER', 'ECA');
        },
        // 修订
        CHANGE_ACTIVITY_REVERSION: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_REVERSION', 'ECA');
        },
        // 收集相关对象
        CHANGE_ACTIVITY_COLLECTOR: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_COLLECTOR', 'ECA');
        },
        // 移除
        CHANGE_ACTIVITY_REMOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_ACTIVITY_REMOVE', 'ECA_ACTIVITY');
        },
        // 产生的影响
        // 查看有效性
        CHANGE_PRODUCE_VISIT_EFFECT: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_PRODUCE_VISIT_EFFECT', 'ECA');
        },
        // 在CAD打开
        CHANGE_PRODUCE_OPEN_IN_CAD: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_PRODUCE_OPEN_IN_CAD', 'ECA');
        },
        // 设置有效性
        CHANGE_PRODUCE_SET_EFFECT: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_PRODUCE_SET_EFFECT', 'ECA');
        },
        // 批量修改BOM
        CHANGE_PRODUCE_BATCH_UPDATE_BOM: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_PRODUCE_BATCH_UPDATE_BOM', 'ECA');
        },
        // 批量修改属性
        CHANGE_PRODUCE_BATCH_UPDATE_ATTR: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_PRODUCE_BATCH_UPDATE_ATTR', 'ECA');
        },
        // 移除
        CHANGE_PRODUCE_REMOVE: (vm, row, params) => {
            handleAction(vm, row, params, 'CHANGE_PRODUCE_REMOVE', 'ECA_PRODUCE');
        }
    };
});
