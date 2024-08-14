// 存放全局注册的方法
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-store/index.js')
], function (actions, commonHttp, ppmStore) {
    const handleUtils = {
        // 修改预算模板的状态
        updateTemplateStatus: async (status, vm, row) => {
            let formData = [
                {
                    attrName: 'status', // 状态字段
                    value: status // 0=草稿，1=失效（未发布），2=已发布
                }
            ];
            let params = {
                className: ppmStore?.state?.classNameMapping?.budgetTemplate, // 预算模板
                attrRawList: formData,
                oid: row.oid
            };
            // 调用通用创建接口
            let res = await commonHttp.commonUpdate({
                data: params
            });
            if (!res.success) {
                return;
            }
            vm.$message.success(vm.i18n.saveSuccess);
            vm.refresh(); // 刷新列表
        }
    };
    let menuActions = function () {
        return {
            // 科目创建
            PPM_BUDGET_SUBJECT_CREATE: (vm) => {
                vm.handleCreate();
            },
            // 科目修改
            PPM_BUDGET_SUBJECT_UPDATE: (vm, row) => {
                vm.handleUpdate(row);
            },
            // 科目删除
            PPM_BUDGET_SUBJECT_DELETE: (vm, row) => {
                actions.deleteItem(vm, row, {
                    rowKey: 'oid' // 删除后没有配置listRoute则会默认执行vm.refresh方法，因此vm需要定义此方法
                });
            },
            // 预算模板创建
            PPM_BUDGET_TEMPLATE_CREATE: (vm) => {
                vm.$router.push({
                    path: 'erdc-ppm-template-budget/template/create'
                });
            },
            // 预算模板修改
            PPM_BUDGET_TEMPLATE_UPDATE: (vm, row) => {
                vm.$router.push({
                    path: 'erdc-ppm-template-budget/template/edit',
                    query: {
                        oid: row.oid
                    }
                });
            },
            // 预算模板删除（预算模板列表单条数据删除、预算模板详情页中删除时 调用）
            PPM_BUDGET_TEMPLATE_DELETE: (vm, row) => {
                let goPath = '/erdc-ppm-template-budget/template/list';
                actions.deleteItem(vm, row, {
                    rowKey: 'oid', // 删除后没有配置listRoute则会默认执行vm.refresh方法，因此vm需要定义此方法
                    listRoute: vm.$route.path !== goPath ? goPath : null
                });
            },
            // 预算模板失效（预算模板列表单条数据失效、预算模板详情页中失效时 调用）
            PPM_BUDGET_TEMPLATE_INVALID: (vm, row) => {
                handleUtils.updateTemplateStatus('1', vm, row);
            },
            // 预算模板发布（预算模板列表单条数据发布、预算模板详情页中发布时 调用）
            PPM_BUDGET_TEMPLATE_PUBLISH: (vm, row) => {
                handleUtils.updateTemplateStatus('2', vm, row);
            },
            // 预算模板-关联科目 新增（root）
            PPM_BUDGET_TEMPLATE_LINK_SUBJECT_ADD: (vm) => {
                vm.handleAddRelation();
            },
            // 预算模板-关联科目 行内新增（增加子级）
            PPM_BUDGET_TEMPLATE_LINK_SUBJECT_ADD_CHILD: (vm, row) => {
                vm.handleAddRelation(row);
            },
            // 预算模板-关联科目 批量移除
            PPM_BUDGET_TEMPLATE_LINK_SUBJECT_REMOVE_BATCH: (vm) => {
                vm.handleDelete();
            },
            // 预算模板-关联科 行内单个删除
            PPM_BUDGET_TEMPLATE_LINK_SUBJECT_REMOVE: (vm, row) => {
                vm.handleDelete(row);
            }
        };
    };
    return menuActions;
});
