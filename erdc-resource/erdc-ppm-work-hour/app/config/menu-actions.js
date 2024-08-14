define([
    'erdcloud.kit',
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js')
], function (ErdcKit, actions, actionUtils) {
    let menuActions = {
        // 工时创建
        PPM_MY_TIMESHEET_ADD: function (vm) {
            vm.$router.push({
                path: 'my-work-hour/create'
            });
        },
        // 工时导出
        PPM_MY_TIMESHEET_EXPORT: function (vm) {
            const getExportRequestData = (data, requestData) => {
                let exportFields = data.selectedColumns.map((item) => {
                    return item.attrName;
                });
                let params = {
                    businessName: 'TimesheetGroupExport',
                    templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1742793393306587137',
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
                className: 'erd.cloud.ppm.timesheet.entity.TimesheetGroup',
                getExportRequestData
            };
            actions.export(vm, params);
        },
        // 项目-登记工时
        PPM_PROJECT_TIMESHEET_ADD(vm, props = {}) {
            let { destroy } = actionUtils.useFreeComponent({
                template: `
                    <work-hour-register
                        ref="dialog"
                        :visible="visible"
                        :init-data="formData"
                        @closed="onClosed"
                        @no-close-saved="onCloseSaved"
                        v-bind="customProps">
                    </work-hour-register>`,
                components: {
                    WorkHourRegister: ErdcKit.asyncComponent(
                        ELMP.resource(
                            'ppm-component/ppm-components/WorkHourRecord/components/WorkHourRegister/index.js'
                        )
                    )
                },
                data() {
                    return {
                        visible: true,
                        formData: {},
                        customProps: {}
                    };
                },
                created() {
                    this.formData = vm?.customFormData;
                    this.customProps = props;
                },
                methods: {
                    onClosed(hasSaved) {
                        // 触发刷新
                        hasSaved && vm.refresh();
                        // 销毁实例
                        destroy();
                    },
                    // 保存，但不关闭时触发的刷新
                    onCloseSaved() {
                        vm.refreshForm().then((data) => {
                            this.$refs.dialog.refreshTimeData(data || {});
                        });
                    }
                }
            });
        },
        // 任务-登记工时
        PPM_TASK_TIMESHEET_ADD(vm) {
            menuActions['PPM_PROJECT_TIMESHEET_ADD'](vm);
        },
        // 督办任务-登记工时
        PPM_DISCRETE_TASK_TIMESHEET_ADD(vm) {
            menuActions['PPM_PROJECT_TIMESHEET_ADD'](vm);
        },
        // 项目工时记录-编辑
        PPM_PROJECT_TIMESHEET_UPDATE(vm, row) {
            menuActions['PPM_PROJECT_TIMESHEET_ADD'](vm, { oid: row.oid });
        },
        // 项目工时记录-删除
        PPM_PROJECT_TIMESHEET_DELETE(vm, row) {
            actions.deleteItem(vm, row);
        },
        // 任务工时记录-编辑
        PPM_TASK_TIMESHEET_UPDATE(vm, row) {
            menuActions['PPM_PROJECT_TIMESHEET_UPDATE'](vm, row);
        },
        // 任务工时记录-删除
        PPM_TASK_TIMESHEET_DELETE(vm, row) {
            menuActions['PPM_PROJECT_TIMESHEET_DELETE'](vm, row);
        },
        // 督办任务工时记录-编辑
        PPM_DISCRETE_TASK_TIMESHEET_UPDATE(vm, row) {
            menuActions['PPM_PROJECT_TIMESHEET_UPDATE'](vm, row);
        },
        // 督办任务工时记录-删除
        PPM_DISCRETE_TASK_TIMESHEET_DELETE(vm, row) {
            menuActions['PPM_PROJECT_TIMESHEET_DELETE'](vm, row);
        },
        // 工时统计-导出
        PPM_TIMESHEET_LIST_EXPORT(vm) {
            const getExportRequestData = (data, requestData) => {
                let exportFields = data.selectedColumns.map((item) => {
                    return item.attrName;
                });
                requestData.className = 'erd.cloud.ppm.timesheet.entity.Timesheet';
                let params = {
                    businessName: 'TimesheetExport',
                    templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1742454282779611137',
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
                className: 'erd.cloud.ppm.timesheet.entity.Timesheet',
                getExportRequestData
            };
            actions.export(vm, params);
        },
        // 项目工时记录-导出
        PPM_PROJECT_TIMESHEET_EXPORT(vm) {
            menuActions['PPM_TIMESHEET_LIST_EXPORT'](vm);
        },
        // 计划工时记录-导出
        PPM_TASK_TIMESHEET_EXPORT(vm) {
            menuActions['PPM_TIMESHEET_LIST_EXPORT'](vm);
        },
        // 督办任务工时记录-导出
        PPM_DISCRETE_TASK_TIMESHEET_EXPORT(vm) {
            menuActions['PPM_TIMESHEET_LIST_EXPORT'](vm);
        },
        // 项目工时记录-导入
        PPM_PROJECT_TIMESHEET_IMPORT(vm) {
            function handleParams(params) {
                params.customParams = _.extend({}, params.customParams, {
                    className: 'erd.cloud.ppm.timesheet.entity.Timesheet',
                    contextRef: vm.oid,
                    typeReference: vm.customFormData?.typeOid
                });
                return params;
            }
            let params = {
                businessName: 'TimeSheetImport',
                importType: 'excel',
                handleParams
            };
            actions.import(vm, params);
        },
        // 计划工时记录-导入
        PPM_TASK_TIMESHEET_IMPORT(vm) {
            menuActions['PPM_PROJECT_TIMESHEET_IMPORT'](vm);
        },
        // 督办任务工时记录-导入
        PPM_DISCRETE_TASK_TIMESHEET_IMPORT(vm) {
            menuActions['PPM_PROJECT_TIMESHEET_IMPORT'](vm);
        }
    };

    return menuActions;
});
