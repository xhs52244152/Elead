define([
    ELMP.func('erdc-workspace/api.js'),
    ELMP.func('erdc-workspace/config/operateAction.js'),
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.func('erdc-workspace/locale/index.js'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js')
], function (Api, operateAction, viewCfg, locale, coDesignConfig) {
    const ErdcKit = require('erdc-kit');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const { codesignActionNameMap, codesignActionMap, codesignActionValidate, codesignregisterHandle } = coDesignConfig;

    const actionNameMap = {
        PDM_WORKSPACE_LIST_CREATE: '创建',
        PDM_WORKSPACE_EDIT: '编辑',
        PDM_WORKSPACE_LIST_DELETE: '删除',
        PDM_WORKSPACE_DELETE: '删除',
        PDM_WORKSPACE_CHECKIN: '检入',
        PDM_WORKSPACE_CHECKOUT: '检出',
        PDM_WORKSPACE_UNCHECKOUT: '取消检出',
        PDM_WORKSPACE_REMOVE: '从工作区移除对象',
        PDM_WORKSPACE_ADD_PART: '新增部件',
        PDM_WORKSPACE_ADD_EPM: '新增模型',
        PDM_WORKSPACE_REFRESH: '更新已过期版本',
        ...codesignActionNameMap
    };

    function handleBatchValidate(vm, data, params, actionName) {
        if (!data || !data.length) {
            return vm.$message({
                type: 'warning',
                message: i18n.selectTip
            });
        }
        // TODO: 临时处理方式，更好的方式是fam在触发事件时，传入actionName。
        let moduleName = viewCfg.workspaceViewTableMap.toolBarOperationName;
        const oids = data.map((row) => row.relationOid || row.oid);
        ErdcHttp({
            url: Api.beforeValidator,
            className: viewCfg.workspaceViewTableMap.className,
            data: {
                actionName,
                moduleName,
                multiSelect: oids
            },
            method: 'POST'
        }).then((res) => {
            if (res.data && res.data.passed) {
                handleActionExcute(vm, data, params, actionName);
            } else {
                const messageDtoList = res.data.messageDtoList ?? [];
                const formattedData = messageDtoList.map((item) => {
                    const rowData = _.find(data, (row) => (row.relationOid || row.oid) === item.oid) || {};
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
                            (item) => formattedData.findIndex((fItem) => fItem.oid === item.relationOid) < 0
                        );
                        passList.length && handleActionExcute(vm, passList, params, actionName);
                    }
                });
            }
        });
    }

    function handleActionExcute(vm, data, params = {}, actionName) {
        const actionMap = {
            PDM_WORKSPACE_LIST_CREATE: operateAction.createWorkspace,
            PDM_WORKSPACE_EDIT: operateAction.editWorkspace,
            PDM_WORKSPACE_LIST_DELETE: operateAction.handleDelete,
            PDM_WORKSPACE_DELETE: operateAction.handleDelete,
            PDM_WORKSPACE_CHECKIN: operateAction.handleRelationObjCheckin,
            PDM_WORKSPACE_CHECKOUT: operateAction.handleRelationObjCheckout,
            PDM_WORKSPACE_UNCHECKOUT: operateAction.handleRelationObjUnCheckout,
            PDM_WORKSPACE_REMOVE: operateAction.handleRelationObjRemove,
            PDM_WORKSPACE_ADD_PART: operateAction.handleRelationObjAddPart,
            PDM_WORKSPACE_ADD_EPM: operateAction.handleRelationObjAddEpm,
            PDM_WORKSPACE_REFRESH: operateAction.handleRelationObjRefrsh,
            ...codesignActionMap(operateAction)
        };

        actionMap[actionName] && actionMap[actionName].call(vm, data, params.inTable);
    }

    function handleAction(vm, data, params = {}, actionName) {
        if (
            params.inTable &&
            params.isBatch &&
            [
                'PDM_WORKSPACE_LIST_CREATE',
                'PDM_WORKSPACE_LIST_DELETE',
                'PDM_WORKSPACE_DELETE',
                'PDM_WORKSPACE_ADD_PART',
                'PDM_WORKSPACE_ADD_EPM',
                'PDM_WORKSPACE_REFRESH',
                ...codesignActionValidate
            ].indexOf(actionName) == -1
        ) {
            handleBatchValidate(vm, data, params, actionName);
        } else {
            handleActionExcute(vm, data, params, actionName);
        }
    }

    return {
        // 创建
        PDM_WORKSPACE_LIST_CREATE: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_WORKSPACE_LIST_CREATE');
        },
        // 编辑
        PDM_WORKSPACE_EDIT: (vm, row, params) => {
            handleAction(vm, row, params, 'PDM_WORKSPACE_EDIT');
        },
        // 删除
        PDM_WORKSPACE_LIST_DELETE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_LIST_DELETE');
        },
        // 行内删除
        PDM_WORKSPACE_DELETE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_DELETE');
        },
        // 检入
        PDM_WORKSPACE_CHECKIN(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_CHECKIN');
        },
        // 检出
        PDM_WORKSPACE_CHECKOUT(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_CHECKOUT');
        },
        // 取消检出
        PDM_WORKSPACE_UNCHECKOUT(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_UNCHECKOUT');
        },
        // 从工作区移除对象
        PDM_WORKSPACE_REMOVE(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_REMOVE');
        },
        // 新增部件
        PDM_WORKSPACE_ADD_PART(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_ADD_PART');
        },
        // 新增模型
        PDM_WORKSPACE_ADD_EPM(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_ADD_EPM');
        },
        // 更新已过期版本
        PDM_WORKSPACE_REFRESH(vm, row, params) {
            handleAction(vm, row, params, 'PDM_WORKSPACE_REFRESH');
        },
        /* 
        codesign
        */
        ...codesignregisterHandle(handleAction)
    };
});
