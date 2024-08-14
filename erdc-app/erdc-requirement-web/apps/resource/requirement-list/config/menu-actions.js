// 需求库自身的一些操作菜单处理
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('requirement-list/locale/index.js'),
    'erdcloud.store',
    ELMP.resource('ppm-store/index.js')
], function (actions, ppmUtils, locale, ErdcStore, ppmStore) {
    const i18n = ppmUtils.languageTransfer(locale.i18n);
    const requireUtils = {
        verifyBaseline: (vm, selected, actionName, moduleName, next) => {
            // 只有在项目需求才会有基线
            if (selected.length && ErdcStore.state.route.resources.identifierNo === 'erdc-project-web') {
                let multiSelect = _.map(selected, (item) => {
                    return (
                        _.find(item.attrRawList, {
                            attrName: 'erd.cloud.ppm.require.entity.RequirementAssignLink#roleBObjectRef'
                        })?.oid || ''
                    );
                });
                let params = {
                    actionName,
                    extractParamMap: {},
                    moduleName,
                    multiSelect
                };
                // 校验是否是基线
                vm.$famHttp({
                    url: '/ppm/menu/before/validator',
                    method: 'POST',
                    className: 'erd.cloud.ppm.project.entity.Project',
                    data: params
                }).then((res) => {
                    if (res.data?.passed) {
                        next();
                    } else {
                        vm.$message({
                            type: 'error',
                            message: res.data?.messageDtoList[0]?.msg || ''
                        });
                    }
                });
            } else {
                next();
            }
        },
        getTablePath() {
            const pathMaps = {
                'erdc-requirement-web': 'require/list',
                'erdc-portal-web': 'myRequire/list',
                'erdc-project-web': 'projectRequire/list'
            };
            let identifierNo = ErdcStore.state.route.resources.identifierNo;
            return pathMaps[identifierNo];
        }
    };
    let getMenuActions = function (getContainerRef) {
        let menuActions = {
            // 创建需求
            PPM_REQUIREMENT_CREATE_MENU(vm) {
                vm.$router.push({
                    path: 'container/requirement-list/require/create',
                    query: {
                        pid: vm.$route.query.pid || ''
                    }
                });
            },
            PPM_PROJ_REQ_CREATE_MENU(vm, selected) {
                return menuActions['PPM_REQUIREMENT_CREATE_MENU'](vm, selected);
            },
            // 需求导出
            REQUIREMENT_EXPORT(vm) {
                const getExportRequestData = (data, requestData) => {
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    requestData.className = vm.className;
                    let params = {
                        businessName: 'RequireExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1744553998192967682',
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
                    tableRef: 'table',
                    getExportRequestData
                };
                actions.export(vm, params);
            },
            // 需求池-需求导出
            REQUIREMENT_POOL_EXPORT(vm) {
                menuActions['REQUIREMENT_EXPORT'](vm);
            },
            // 需求导入
            REQUIREMENT_IMPORT(vm) {
                function handleParams(params) {
                    params.customParams = _.extend({}, params.customParams, {
                        className: vm.className,
                        projectId: vm.projectOid
                    });
                    return params;
                }
                let params = {
                    businessName: 'RequireImport',
                    importType: 'excel',
                    className: vm.className,
                    handleParams
                };
                actions.import(vm, params);
            },
            REQUIREMENT_POOP_IMPORT(vm) {
                menuActions['REQUIREMENT_IMPORT'](vm);
            },
            // 编辑需求
            PPM_REQUIREMENT_LIST_UPDATE(vm, row) {
                let rowKey = vm.$route.meta.rowKey || 'oid';
                let title = `${i18n.edit}-${row['erd.cloud.ppm.require.entity.Requirement#name'] || row.name}`;
                let routes = {
                    path: '/require/edit',
                    params: {
                        oid: row[rowKey]
                    },
                    query: {
                        oid: row[rowKey],
                        title
                    }
                };
                if (ErdcStore.state.route.resources.identifierNo === 'erdc-project-web') {
                    routes.query.pid = vm.$route.query.pid;
                    routes.query.oid = row[rowKey];
                }
                vm.$router.push(routes);
            },
            // 项目需求列表 编辑需求
            PPM_PROJ_REQ_LIST_UPDATE(vm, row) {
                return menuActions['PPM_REQUIREMENT_LIST_UPDATE'](vm, row);
            },
            // 删除需求
            PPM_REQUIREMENT_LIST_DELETE(vm, row, isTableList) {
                actions.deleteItem(vm, row, {
                    rowKey: 'oid',
                    listRoute: isTableList
                        ? null
                        : {
                            path: requireUtils.getTablePath()
                        }
                });
            },
            // 移除需求
            PPM_REQUIREMENT_REMOVE_MENU(vm, data, isTableList) {
                if (_.isArray(data)) {
                    const next = () => {
                        // 批量移除
                        actions.batchDeleteItems(vm, data, {
                            rowKey: 'oid',
                            useDefaultClass: true,
                            confirmRemove: i18n.confirmRemoval,
                            title: i18n.isRemove,
                            tip: i18n.removeSuccess
                        });
                    };
                    requireUtils.verifyBaseline(
                        vm,
                        data,
                        'PPM_REQUIREMENT_REMOVE_MENU',
                        'PPM_PROJ_REQ_OPREATE_MODULE',
                        next
                    );
                    return;
                }
                // 单个移除
                actions.deleteItem(vm, data, {
                    rowKey: 'oid',
                    confirmRemove: i18n.confirmRemoval,
                    title: i18n.isRemove,
                    listRoute: isTableList
                        ? null
                        : {
                            path: requireUtils.getTablePath()
                        },
                    tip: i18n.removeSuccess
                });
            },
            // 批量删除需求
            PPM_REQUIREMENT_VIEW_DELETE(vm, selected) {
                actions.batchDeleteItems(vm, selected, {
                    rowKey: 'oid',
                    useDefaultClass: true
                });
            },
            // 设置状态
            PPM_REQUIREMENT_LIST_SET_STATE(vm, data, isTableList = false) {
                actions.setStatus(vm, data, {
                    title: i18n.setReqStatus,
                    rowKey: vm.$route.meta.rowKey || 'oid',
                    stateKey: isTableList ? vm.className + '#' + 'lifecycleStatus.status' : 'lifecycleStatus.status'
                });
            },
            // 项目需求列表 设置状态
            PPM_PROJ_REQ_LIST_SET_STATE(vm, data, isTableList) {
                return menuActions['PPM_REQUIREMENT_LIST_SET_STATE'](vm, data, isTableList);
            },
            // 批量设置状态
            PPM_REQUIREMENT_VIEW_SET_STATE(vm, selected) {
                const next = () => {
                    actions.batchSetStatus(vm, selected, {
                        title: i18n.setReqStatus,
                        rowKey: vm.$route.meta.rowKey || 'oid'
                    });
                };
                requireUtils.verifyBaseline(
                    vm,
                    selected,
                    'PPM_PROJ_REQ_VIEW_SET_STATE',
                    'PPM_PROJ_REQ_OPREATE_MODULE',
                    next
                );
            },
            // 项目需求列表 批量设置状态
            PPM_PROJ_REQ_VIEW_SET_STATE(vm, selected) {
                return menuActions['PPM_REQUIREMENT_VIEW_SET_STATE'](vm, selected);
            },
            // 复制
            PPM_REQUIREMENT_LIST_COPY: (vm, row, isTableList = false) => {
                let extendParams = {
                    rowKey: vm.$route.meta.rowKey || 'oid',
                    props: {
                        parentConfig: {
                            show: true,
                            isList: true,
                            label: i18n.parentReq
                        },
                        handleParmas,
                        isDemand: true,
                        isProjectRequire: false
                    }
                };
                function handleParmas(data, _this) {
                    // data.projectOid = _this.form.projectOid;
                    if (isTableList) {
                        data.requireOid = row.relationOid || row.oid;
                    } else {
                        data.requireOid = row.oid;
                    }
                    return data;
                }
                if (isTableList) {
                    extendParams.nameKey = `${vm.className}#name`;
                    extendParams.creatorId = row.attrRawList.find(
                        (item) => item.attrName === `${vm.className}#createBy`
                    )?.value.id;
                }
                const beforeRequest = (params) => {
                    // 需求详情无法获取到需求池oid所以直接写死
                    let parentRef = 'OR:erd.cloud.ppm.require.entity.RequirementPool:1698587354582720513';
                    let projectClassName = ppmStore.state.classNameMapping.project;
                    let attrRawList = params[0]?.attrRawList || {};
                    // 存在两种情况一种是选了所属项目就会有parentRef,不选就没有
                    attrRawList?.some((item) => {
                        if (item.attrName === 'parentRef' && item.value.indexOf(projectClassName) > -1) {
                            return (item.value = parentRef);
                        }
                    });
                    if (!attrRawList?.filter((item) => item.attrName === 'parentRef').length) {
                        attrRawList.push({
                            attrName: 'parentRef',
                            value: parentRef
                        });
                    }
                    return params;
                };
                actions.copyItem(vm, row, extendParams, beforeRequest);
            },
            // 项目需求列表 复制
            PPM_PROJ_REQ_LIST_COPY: (vm, row, isTableList) => {
                return menuActions['PPM_REQUIREMENT_LIST_COPY'](vm, row, isTableList);
            },
            //需求池需求列表 移动
            PPM_PROJ_REQ_LIST_MOVE: (vm, row, isTableList = false) => {
                let extendParams = {
                    rowKey: vm.$route.meta.rowKey || 'oid',
                    props: {
                        parentConfig: {
                            show: true,
                            isList: true,
                            label: i18n.parentReq
                        },
                        isDemand: true,
                        bindProjectData: [],
                        isRequireMove: true,
                        handleParmas
                    }
                };
                function handleParmas(data, _this) {
                    // data.projectOid = _this.form.projectOid;
                    if (isTableList) {
                        data.requireOid = row.relationOid || row.oid;
                    } else {
                        data.requireOid = row.oid;
                    }
                    return data;
                }
                if (isTableList) {
                    extendParams.nameKey = `${vm.className}#name`;
                    extendParams.creatorId = row.attrRawList.find(
                        (item) => item.attrName === `${vm.className}#createBy`
                    )?.value.id;
                }
                // 获取当前需求绑定的项目
                vm.$famHttp({
                    url: '/ppm/listByKey',
                    method: 'GET',
                    data: {
                        tmplTemplated: false,
                        fromProjByReqOid: row.relationOid || row.oid,
                        className: 'erd.cloud.ppm.project.entity.Project'
                    }
                }).then((res) => {
                    extendParams.props.bindProjectData = res.data || [];
                    actions.moveItem(vm, row, extendParams);
                });
            },
            // 风险移动
            PPM_RISK_OPERATE_MOVE: (vm, row) => {
                let extendParams = {
                    rowKey: vm.$route.meta.rowKey || 'oid',
                    props: {
                        isDemand: true,
                        isRisk: true
                    }
                };
                actions.moveItem(vm, row, extendParams);
            },
            // 问题移动
            PPM_ISSUE_OPERATE_MOVE: (vm, row) => {
                let extendParams = {
                    rowKey: vm.$route.meta.rowKey || 'oid',
                    props: {
                        isDemand: true,
                        isIssue: true
                    }
                };
                actions.moveItem(vm, row, extendParams);
            },
            // 单个发起流程
            PPM_REQUIREMENT_LIST_PROCESS: (vm, row, isTableList) => {
                let oid = isTableList
                    ? _.find(row.attrRawList, {
                        attrName: 'erd.cloud.ppm.require.entity.Requirement#oid'
                    })?.value
                    : row.oid;
                const router = require('erdcloud.router');
                const { $route } = router.app;
                getContainerRef($route).then((containerRef) => {
                    actions.startProcess(vm, { containerRef, businessData: [{ oid }] });
                });
            },
            // 项目需求列表 发起流程
            PPM_PROJ_REQ_LIST_PROCESS: (vm, row, isTableList) => {
                return menuActions['PPM_REQUIREMENT_LIST_PROCESS'](vm, row, isTableList);
            },
            // 多个需求发起流程
            PPM_REQUIREMENT_VIEW_PROCESS: (vm, businessData) => {
                const next = () => {
                    const router = require('erdcloud.router');
                    const { $route } = router.app;
                    getContainerRef($route).then((containerRef) => {
                        actions.startProcess(vm, {
                            businessData,
                            containerRef,
                            extendParams: {
                                roleAObjectRef: 'oid',
                                roleBObjectRef: 'oid'
                            },
                            type: 'batch'
                        });
                    });
                };
                requireUtils.verifyBaseline(
                    vm,
                    businessData,
                    'PPM_PROJ_REQ_VIEW_PROCESS',
                    'PPM_PROJ_REQ_OPREATE_MODULE',
                    next
                );
            },
            // 项目需求列表 多个需求发起流程
            PPM_PROJ_REQ_VIEW_PROCESS: (vm, businessData) => {
                return menuActions['PPM_REQUIREMENT_VIEW_PROCESS'](vm, businessData);
            }
        };

        return menuActions;
    };

    return getMenuActions;
});
