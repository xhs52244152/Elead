// 存放全局注册的方法
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    ELMP.resource('ppm-utils/locale/index.js')
], function (commonActions, store, utils, ErdcStore, projectI18n) {
    const i18nMappingObjInfo = utils.languageTransfer(projectI18n.i18n);
    const getI18n = (val) => {
        return i18nMappingObjInfo[val] || '';
    };
    return new Promise((resolve) => {
        let data = {
            // 项目发起流程
            PROJECT_START_PROCESS: (vm, data) => {
                let containerRef = utils.getContainerRef() || data?.containerRef || '';
                // 暂时注释，需求待定
                // utils.getProcess(data.oid).then((res) => {
                //     console.log(res);
                // });
                commonActions.startProcess(vm, { containerRef, businessData: [data] });
            },
            // 项目单个设置状态
            PROJECT_SET_STATUS: (vm, data, isTableList) => {
                let lifecycleStatus = vm.$store.state?.space?.object?.['lifecycleStatus.status'] || '';
                let stateKey = isTableList ? vm.className + '#lifecycleStatus.status' : 'lifecycleStatus.status';
                commonActions.setStatus(vm, data, { setStateFunc, stateKey });
                function setStateFunc(value) {
                    let params = {
                        oid: data.oid,
                        targetState: value
                    };
                    params.currentState = isTableList
                        ? _.find(data.attrRawList, { attrName: stateKey })?.value
                        : lifecycleStatus;

                    return vm.$famHttp({
                        url: 'ppm/project/updateState',
                        method: 'get',
                        className: store.state.classNameMapping.project,
                        params: params
                    });
                }
            },
            // 项目编辑
            PROJECT_UPDATE: (vm, data, isTableList) => {
                vm.infoData = vm.infoData || vm.formData;
                if (isTableList) {
                    let moduleUrl = '/space/project-space/edit';
                    let { value: state } =
                        data.attrRawList.find(
                            (item) => item.attrName === 'erd.cloud.ppm.project.entity.Project#lifecycleStatus.status'
                        ) || {};
                    if (state === 'DRAFT') {
                        moduleUrl = '/container/project-space/edit';
                    }
                    vm.$router.push({
                        path: moduleUrl,
                        query: {
                            pid: data.oid,
                            status: data['erd.cloud.ppm.project.entity.Project#lifecycleStatus.status'],
                            title:
                                getI18n('edit') +
                                ` ${data['erd.cloud.ppm.project.entity.Project#name']} ` +
                                getI18n('project')
                        }
                    });
                } else {
                    vm.$router.push({
                        path: !data['templateInfo.tmplTemplated']
                            ? '/space/project-space/edit'
                            : '/erdc-ppm-template/template/edit',
                        query: {
                            pid: data.oid,
                            status: vm.infoData['lifecycleStatus.status'] || '',
                            templateTitle: getI18n('edit') + ` ${data?.name} ` + getI18n('template'),
                            title: getI18n('edit') + ` ${data?.name} ` + getI18n('project')
                        }
                    });
                }
            },
            // 项目单个删除
            PROJECT_DELETE: (vm, data, isTableList) => {
                const extendParams = {};
                if (!isTableList)
                    extendParams.listRoute = {
                        path: '/project-list'
                    };
                commonActions.deleteItem(vm, data, extendParams);
            },

            // 项目创建
            PROJECT_CREATE: (vm) => {
                if (
                    ErdcStore.state.route.resources.identifierNo === 'erdc-project-web' ||
                    ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web'
                ) {
                    vm.$router.push({
                        path: '/container/project-space/create'
                    });
                } else {
                    vm.$router.push({
                        path: '/erdc-ppm-template/template/create'
                    });
                }
            },

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
            },

            // 项目模板生效
            PROJECT_TEMPLATE_ENABLE: (vm, data, isTableList) => {
                let params = {
                    attrRawList: [
                        {
                            attrName: 'templateInfo.tmplEnabled',
                            value: true
                        }
                    ],
                    className: store.state.classNameMapping.project,
                    oid: data.oid
                };
                vm.$confirm(getI18n('wantPerformOperation'), getI18n('tip'), {
                    confirmButtonText: getI18n('confirm'),
                    cancelButtonText: getI18n('cancel'),
                    type: 'warning'
                })
                    .then(() => {
                        vm.$famHttp({
                            url: '/ppm/update',
                            method: 'post',
                            data: params
                        }).then((resp) => {
                            if (resp.code === '200') {
                                vm.$message({
                                    type: 'success',
                                    message: getI18n('success')
                                });
                                if (isTableList) {
                                    vm.refreshTable();
                                } else {
                                    vm.refresh(data.oid);
                                }
                            }
                        });
                    })
                    .catch(() => {
                        vm.$message({
                            type: 'info',
                            message: vm.i18nMappingObj['cancel']
                        });
                    });
            },
            // 项目模板失效
            PROJECT_TEMPLATE_DISABLE: (vm, data, isTableList) => {
                let params = {
                    attrRawList: [
                        {
                            attrName: 'templateInfo.tmplEnabled',
                            value: false
                        }
                    ],
                    className: store.state.classNameMapping.project,
                    oid: data.oid
                };
                vm.$confirm(getI18n('wantPerformOperation'), getI18n('tip'), {
                    confirmButtonText: getI18n('confirm'),
                    cancelButtonText: getI18n('cancel'),
                    type: 'warning'
                })
                    .then(() => {
                        vm.$famHttp({
                            url: '/ppm/update',
                            method: 'post',
                            data: params
                        }).then((resp) => {
                            if (resp.code === '200') {
                                vm.$message({
                                    type: 'success',
                                    message: getI18n('success')
                                });
                                if (isTableList) {
                                    vm.refreshTable();
                                } else {
                                    vm.refresh(data.oid);
                                }
                            }
                        });
                    })
                    .catch(() => {
                        vm.$message({
                            type: 'info',
                            message: vm.i18nMappingObj['cancel']
                        });
                    });
            },
            // 项目模板编辑
            PROJECT_TEMPLATE_UPDATE: (vm, data) => {
                vm.$router.push({
                    path: '/space/erdc-ppm-template/template/edit',
                    query: {
                        pid: data.oid,
                        templateTitle: getI18n('edit') + ` ${data['name']} ` + getI18n('template')
                    }
                });
            },
            // 项目模板删除
            PROJECT_TEMPLATE_DELETE: (vm, data, isTableList) => {
                const extendParams = {};
                vm.refresh = vm.refreshTable;
                if (!isTableList)
                    extendParams.listRoute = {
                        name: 'templateManagement'
                    };
                commonActions.deleteItem(vm, data, extendParams);
            }
        };
        resolve(data);

        // return menuActions;
    });
});
