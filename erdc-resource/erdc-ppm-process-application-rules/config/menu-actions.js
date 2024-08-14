// 存放全局注册的方法
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/locale/index.js')
], function (commonActions, store, utils, commonHttp, { i18n }) {
    const i18nMappingObj = utils.languageTransfer(i18n);
    // 如何使用
    // console.log(i18nMappingObj.confirm);

    let menuActions = {
        PROJECT_EXPORT: (vm) => {
            const getExportRequestData = (data, requestData) => {
                let exportFields = data.selectedColumns.map((item) => {
                    return item.attrName;
                });
                let params = {
                    businessName: 'ProjectExport',
                    templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1714907189133529090',
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
                tableRef: 'famViewTable',
                getExportRequestData
            };
            commonActions.export(vm, params);
        },
        PROJECT_IMPORT: (vm) => {
            function handleParams(params) {
                params.customParams = _.extend({}, params.customParams, {
                    className: vm.className,
                    isTemplate: false
                });
                return params;
            }
            let extendProps = {
                importMethodDisabled: true
            };
            let params = {
                businessName: 'ProjectImport',
                importType: 'excel',
                className: vm.className,
                handleParams,
                extendProps
            };
            commonActions.import(vm, params);
        }
    };

    return menuActions;
});
