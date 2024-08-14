// 存放全局注册的方法
define([ELMP.resource('ppm-component/ppm-common-actions/index.js')], function (actions) {
    let menuActions = function () {
        return {
            // 预算导出
            PPM_BUDGET_EXPORT(vm) {
                const exportRequestDatae = {
                    businessName: 'BudgetExport',
                    templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1813880398986526722',
                    useDefaultExport: false,
                    exportFields: [
                        'erd.cloud.ppm.budget.entity.BudgetSubject#identifierNo',
                        'erd.cloud.ppm.budget.entity.BudgetSubject#name',
                        'erd.cloud.ppm.budget.entity.BudgetSubject#category'
                    ],
                    customParams: {
                        useDefaultTemplate: true,
                        exportType: 'excel'
                    },
                    tableSearchDto: {
                        className: vm.subjectClassName,
                        tableKey: 'BudgetExportLinkView',
                        relationshipRef: vm.budgetOid
                    }
                };
                let params = {
                    className: vm.subjectClassName,
                    exportRequestDatae
                };
                actions.allExport(vm, params);
            },
            // 设置模板按钮事件
            PPM_BUDGET_TEMPLATE_SETTEMPLATE: (vm) => {
                vm.openChooseTemplate();
            },
            // 预算 行操作-设置状态
            PPM_BUDGET_PUBLISH: (vm, row) => {
                vm.handleSetStatus(row);
            },
            // 批量移除科目与预算的关联关系
            PPM_BUDGET_DELETE: (vm) => {
                vm.handleDeleteLink();
            },
            // 单个移除科目与预算的关联关系
            PPM_BUDGET_LINK_SUBJECT_DELETE: (vm, row) => {
                vm.handleDeleteLink(row);
            },
            // 预算增加科目关联关系（增加root）
            PPM_BUDGET_TEMPLATE_ADD_SUBJECT: (vm) => {
                vm.handleAddSubjectLink();
            },
            // 预算增加科目关联关系(增加同级)
            PPM_BUDGET_LINK_SUBJECT_ADD: (vm, row) => {
                vm.handleAddSubjectLink(row, false);
            },
            // 预算增加科目关联关系(增加子级)
            PPM_BUDGET_LINK_SUBJECT_ADD_CHILD: (vm, row) => {
                vm.handleAddSubjectLink(row, true);
            },
            // 阶段对应详细金额列表-新增
            PPM_BUDGET_OBJECT_AMOUNT_ADD: (vm) => {
                vm.handleAdd();
            },
            // 阶段对应详细金额列表-删除
            PPM_BUDGET_OBJECT_AMOUNT_DELETE_BATCH: (vm) => {
                vm.handleRemove();
            },
            // 阶段对应详细金额列表-行内删除
            PPM_BUDGET_OBJECT_AMOUNT_DELETE: (vm, row) => {
                vm.handleRemove(row);
            },
            // 预算发起流程
            PPM_BUDGET_START_WORKFLOW: (vm) => {
                vm.handleStartBudgetWorkflow();
            }
        };
    };
    return menuActions;
});
