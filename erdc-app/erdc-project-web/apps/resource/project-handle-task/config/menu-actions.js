define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-handle-task/locale/index.js')
], function (actions, globalUtils, store, { i18n }) {
    const i18nMappingObj = globalUtils.languageTransfer(i18n);
    const deleteOp = {
        isRemove: i18nMappingObj['removeTipsInfo'], // 是否移除督办任务？
        confirmRemove: i18nMappingObj['removeConfirm'], // 移除关联
        tip: i18nMappingObj['successfullyRemoved'] // 移除成功
    };
    const handleTaskUtils = {
        createRelation: (vm, source) => {
            globalUtils.openDiscreteTaskPage('create', {
                query: {
                    createType: 'related',
                    relatedOid: vm.$route.query?.oid || '',
                    // 来源，只读
                    source: source ? JSON.stringify({ value: source, readonly: true }) : ''
                }
            });
        },
        removeRelation: (vm, data) => {
            let extendParams = {
                className: vm.relateClassName,
                ...deleteOp
            };
            actions.deleteItem(vm, data, extendParams);
        },
        edit: (vm, data) => {
            globalUtils.openDiscreteTaskPage(
                'edit',
                {
                    query: {}
                },
                data
            );
        },
        // isTableList当前是否在督办任务列表页面
        delete: (vm, data, isTableList) => {
            let extendParams;
            // 是否在督办任务列表页面
            if (!isTableList) {
                const router = require('erdcloud.router');
                const { $route } = router.app;
                let pathObj = globalUtils.getDiscreteTaskPath('list');
                let listRoute = {
                    path: pathObj.path,
                    query: {
                        pid: $route.query.pid || '', // 项目oid
                        needRefreshTable: true
                    }
                };
                extendParams = { listRoute };
            }
            actions.deleteItem(vm, data, extendParams);
        }
    };
    return {
        // 督办任务-详情页面-设置状态
        PPM_PROJECT_DISCRETE_TASK_INFO_OPER_SET_STATUS: (vm, data, isTableList) => {
            let stateKey = isTableList ? vm.className + '#lifecycleStatus.status' : 'lifecycleStatus.status';
            actions.setStatus(vm, data, { stateKey });
        },
        // 督办任务-详情页面-发起流程
        PPM_PROJECT_DISCRETE_TASK_INFO_OPER_INIT_PROCESS: (vm, data) => {
            let containerRef = globalUtils.getContainerRef();
            actions.startProcess(vm, { businessData: [{ oid: data.oid }], containerRef });
        },
        // 工作台-督办任务-创建
        SUPER_TASK_CREATE: (vm) => {
            globalUtils.openDiscreteTaskPage('create', {
                query: {
                    createType: 'portal' // 代表工作台进入我的督办的创建
                }
            });
        },
        // 项目应用下-督办任务-创建
        PPM_PROJECT_DISCRETE_TASK_CREATE: (vm) => {
            globalUtils.openDiscreteTaskPage('create', {
                query: {
                    createType: 'inProjectMenu' // 代表项目内创建
                }
            });
        },
        // 工作台、项目应用行按钮 通用 督办任务-编辑
        PPM_PROJECT_DISCRETE_TASK_LIST_OPER_EDIT: (vm, data) => {
            handleTaskUtils.edit(vm, data);
        },
        // 督办任务-详情页面-编辑
        PPM_PROJECT_DISCRETE_TASK_INFO_OPER_EDIT: (vm, data) => {
            handleTaskUtils.edit(vm, data);
        },
        // 工作台、项目应用行按钮 通用 督办任务-删除
        PPM_PROJECT_DISCRETE_TASK_LIST_OPER_DELETE: (vm, data, isTableList) => {
            handleTaskUtils.delete(vm, data, isTableList);
        },
        // 督办任务-详情页面-删除
        PPM_PROJECT_DISCRETE_TASK_INFO_OPER_DELETE: (vm, data) => {
            handleTaskUtils.delete(vm, data, false);
        },
        // 问题-督办任务-创建
        ISSUE_DISCRETE_TASK_CREATE_ADD: (vm) => {
            handleTaskUtils.createRelation(vm, 'ISSUE');
        },
        // 问题-督办任务-增加
        ISSUE_DISCRETE_TASK_LINK_CREATE: (vm) => {
            vm.showDialog = true;
        },
        // 问题-督办任务-移除
        ISSUE_DISCRETE_TASK_LINK_DELETE: (vm, data) => {
            actions.batchDeleteItems(vm, data, {
                useDefaultClass: vm.relateClassName,
                ...deleteOp
            });
        },
        // 问题-督办任务-移除关联
        ISSUE_DISCRETE_TASK_DELETE: (vm, data) => {
            handleTaskUtils.removeRelation(vm, data);
        },
        // 风险-督办任务-创建
        RISK_DISCRETE_TASK_CREATE_ADD: (vm) => {
            handleTaskUtils.createRelation(vm, 'RISK');
        },
        // 风险-督办任务-增加
        RISK_DISCRETE_TASK_LINK_CREATE: (vm) => {
            vm.showDialog = true;
        },
        // 风险-督办任务-移除
        RISK_DISCRETE_TASK_LINK_DELETE: (vm, data) => {
            actions.batchDeleteItems(vm, data, {
                useDefaultClass: vm.relateClassName,
                ...deleteOp
            });
        },
        // 风险-督办任务-移除关联
        RISK_DISCRETE_TASK_DELETE: (vm, data) => {
            handleTaskUtils.removeRelation(vm, data);
        },
        // 需求-督办任务-创建
        REQUIREMENT_DISCRETE_TASK_CREATE_ADD: (vm) => {
            handleTaskUtils.createRelation(vm, 'RQUIREMENT');
        },
        // 需求-督办任务-增加
        REQUIREMENT_DISCRETE_TASK_LINK_CREATE: (vm) => {
            vm.showDialog = true;
        },
        // 需求-督办任务-移除
        REQUIREMENT_DISCRETE_TASK_LINK_DELETE: (vm, data) => {
            actions.batchDeleteItems(vm, data, {
                useDefaultClass: vm.relateClassName,
                ...deleteOp
            });
        },
        // 需求-督办任务-移除关联
        REQUIREMENT_DISCRETE_TASK_DELETE: (vm, data) => {
            handleTaskUtils.removeRelation(vm, data);
        }
    };
});
