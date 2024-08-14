define([
    'erdcloud.kit',
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-utils/locale/index.js'),
    ELMP.resource('ppm-store/index.js')
], function (ErdcKit, utils, commonHttp, globalUtils, { i18n }, store) {
    let i18nMappingObj = {};
    let i18nTimer = setInterval(function () {
        require([ELMP.resource('ppm-utils/index.js')], function (globalUtils) {
            if (globalUtils?.languageTransfer) {
                i18nMappingObj = globalUtils.languageTransfer(i18n);
                clearInterval(i18nTimer);
            }
        });
    }, 1000);
    let actions = {
        // 单个设置状态
        setStatus(vm, data, extendParams = {}) {
            extendParams = {
                title: i18nMappingObj.setStatus,
                rowKey: 'oid',
                stateKey: 'lifecycleStatus.status',
                ...extendParams
            };
            // 设置状态组件参数封装
            let { title, rowKey, stateKey, setStateFunc, getStatusList, refreshOid } = extendParams;
            const props = {
                title,
                showSetStateDialog: true,
                className: vm.className,
                currentRow: {
                    oid: data[rowKey],
                    state: data[stateKey]
                },
                getStatusList
            };
            // 渲染设置状态面板
            utils.renderSetState(props, function onConfirm(value, destroy) {
                let requestMethod;
                if (_.isFunction(setStateFunc)) {
                    requestMethod = setStateFunc(value);
                } else {
                    requestMethod = commonHttp.commonUpdate({
                        data: {
                            attrRawList: [
                                {
                                    attrName: 'lifecycleStatus.status',
                                    value
                                }
                            ],
                            oid: data[rowKey],
                            className: vm.className
                        }
                    });
                }
                requestMethod.then((resp) => {
                    vm.refresh(refreshOid || resp?.data);
                    vm.$message.success(i18nMappingObj.success);
                    // 修改项目后需要更新存在store的项目信息,等待平台更新后ppm在更新
                    setTimeout(() => {
                        store.dispatch('fetchProjectInfo', { id: refreshOid || resp?.data });
                    }, 1000);

                    // 更新平台的store
                    vm.$store.dispatch('space/switchContextByObject', {
                        objectOid: store.state?.projectInfo?.oid,
                        force: true
                    });
                    destroy();
                });
            });
        },
        // 批量设置状态
        batchSetStatus(vm, selected, extendParams = {}) {
            extendParams = {
                title: '设置状态',
                rowKey: 'oid',
                ...extendParams
            };

            // 勾选校验
            if (!selected.length) {
                return vm.$message.info(i18nMappingObj.checkData);
            }

            let stateKey = `${vm.className}#lifecycleStatus.status`,
                state = selected[0][stateKey],
                len = selected.filter((item) => item[stateKey] === state).length;

            if (len !== selected.length) {
                return vm.$message.info(i18nMappingObj.onlySetStatus);
            }

            // 设置状态组件参数封装
            let { title, rowKey, setStateFunc } = extendParams;
            const props = {
                title,
                showSetStateDialog: true,
                className: vm.className,
                currentRow: {
                    state: state,
                    oid: selected[0][rowKey]
                }
            };

            // 渲染设置状态面板
            utils.renderSetState(props, function onConfirm(value, destroy) {
                let rawDataVoList = selected.map((item) => {
                    return {
                        action: 'UPDATE',
                        attrRawList: [
                            {
                                attrName: 'lifecycleStatus.status',
                                value
                            }
                        ],
                        className: vm.className,
                        oid: item[rowKey]
                    };
                });
                let requestMethod;
                if (setStateFunc && _.isFunction(setStateFunc)) {
                    requestMethod = setStateFunc(value);
                } else {
                    requestMethod = commonHttp.saveOrUpdate({
                        data: {
                            action: 'UPDATE',
                            className: vm.className,
                            rawDataVoList
                        }
                    });
                }
                requestMethod.then((resp) => {
                    vm.refresh(resp?.data);
                    vm.$message.success(i18nMappingObj.success);
                    destroy();
                });
            });
        },
        // 单个删除
        deleteItem(vm, data, extendParams = {}) {
            extendParams = {
                title: extendParams.isRemove || i18nMappingObj.isDelete,
                rowKey: 'oid',
                listRoute: null,
                ...extendParams
            };
            let { title, rowKey, listRoute, url, tip, confirmRemove, requestConfig } = extendParams;
            vm.$confirm(title, confirmRemove || i18nMappingObj.confirmDelete, {
                distinguishCancelAndClose: true,
                confirmButtonText: i18nMappingObj.confirm,
                cancelButtonText: i18nMappingObj.cancel,
                type: 'warning'
            }).then(() => {
                commonHttp
                    .commonDelete(
                        {
                            params: {
                                oid: data[rowKey]
                            },
                            ...requestConfig
                        },
                        url
                    )
                    .then(() => {
                        vm.$message.success(tip || i18nMappingObj.deleteSuccess);
                        if (listRoute) {
                            // 关闭当前页面
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                // 跳转至列表
                                vm.$router.push(listRoute);
                            });
                        } else vm.refresh();
                    });
            });
        },
        // 批量删除
        batchDeleteItems(vm, selected, extendParams = {}) {
            extendParams = {
                title: extendParams.isRemove || i18nMappingObj.isDelete,
                rowKey: 'oid',
                useDefaultClass: false,
                ...extendParams
            };

            // 勾选校验
            if (!selected.length) {
                return vm.$message.info(i18nMappingObj.checkData);
            }

            let { title, rowKey, url, useDefaultClass, tip, confirmRemove, requestConfig, className, callback } =
                extendParams;

            vm.$confirm(title, confirmRemove || i18nMappingObj.confirmDelete, {
                distinguishCancelAndClose: true,
                confirmButtonText: i18nMappingObj.confirm,
                cancelButtonText: i18nMappingObj.cancel,
                type: 'warning'
            }).then(() => {
                let oidList = selected.map((item) => {
                    return item[rowKey];
                });
                commonHttp
                    .deleteByIds(
                        {
                            data: {
                                catagory: 'DELETE',
                                className: useDefaultClass ? oidList[0].split(':')[1] : className || vm.className,
                                oidList
                            },
                            ...requestConfig
                        },
                        url
                    )
                    .then((res) => {
                        vm.$message.success(tip || i18nMappingObj.deleteSuccess);
                        // 回调函数
                        if (typeof callback === 'function') {
                            callback.call(vm, res);
                        }
                        vm.refresh();
                    });
            });
        },
        // 复制
        copyItem(vm, row, extendParams = {}, beforeRequest) {
            extendParams = {
                rowKey: 'oid',
                nameKey: 'name',
                creatorId: row.createBy?.id || '',
                props: {},
                ...extendParams
            };

            let { rowKey, nameKey, props: customProps } = extendParams;

            let props = {
                showCopyOrMoveDialog: true,
                type: 'copy',
                className: vm.className,
                currentOid: row[rowKey],
                ...customProps
            };
            utils.renderCopyOrMovePanel(props, function onConfirm(data, destroy) {
                let attrMap = {
                    parentRef: _.isObject(data.parentInfo) ? data.parentInfo.oid : data.parentInfo || data.projectOid,
                    projectRef: data.projectOid,
                    // creator: +data.createValue === 1 ? creatorId : vm.$store.state.app.user.id,
                    ['lifecycleStatus.status']: +data.stateValue !== 1 ? data.newState : '',
                    collectRef: data.currentPlanSet,
                    relation: data.relation,
                    delivery: data.delivery
                };

                let attrRawList = Object.keys(attrMap)
                    .filter((key) => !!attrMap[key] || typeof attrMap[key] === 'boolean')
                    .map((key) => ({
                        attrName: key,
                        value: attrMap[key]
                    }));
                let params = [
                    {
                        attrRawList,
                        oid: row[rowKey],
                        name: row[nameKey]
                    }
                ];
                if (_.isFunction(beforeRequest)) params = beforeRequest(params);
                vm.$famHttp({
                    url: '/ppm/saveAs',
                    method: 'POST',
                    params: {},
                    className: 'erd.cloud.ppm.project.entity.Project',
                    data: params
                }).then(() => {
                    vm.$message.success(i18nMappingObj.replicatingSuccess);
                    vm.refresh(row[rowKey]);
                    destroy();
                });
            });
        },
        // 移动
        moveItem(vm, row, extendParams = {}) {
            extendParams = {
                rowKey: 'oid',
                props: {},
                ...extendParams
            };

            let { rowKey, props: customProps, handleParams } = extendParams;
            let props = {
                showCopyOrMoveDialog: true,
                type: 'move',
                className: vm.className,
                currentOid: row[rowKey],
                ...customProps
            };
            utils.renderCopyOrMovePanel(props, function onConfirm(data, destroy) {
                let attrMap = {
                    parentRef: _.isObject(data.parentInfo) ? data.parentInfo.oid : data.parentInfo || data.projectOid,
                    projectRef: data.projectOid,
                    reserveStatus: +data.stateValue === 1 ? true : false,
                    collectRef: data.currentPlanSet,
                    relation: data.relation,
                    delivery: data.delivery
                };
                // 需求移动参数
                if (props.isRequireMove) {
                    _.extend(attrMap, {
                        fromProjOid: data?.fromProjOid || '',
                        toProjOid: data.projectOid
                    });
                    delete attrMap.projectRef;
                }

                // 问题 风险 移动参数
                if (props.isIssue || props.isRisk) {
                    _.extend(attrMap, {
                        projectRef: data.projectOid
                    });
                    delete attrMap.delivery;
                    delete attrMap.collectRef;
                    delete attrMap.parentRef;
                }

                let attrRawList = Object.keys(attrMap)
                    .filter((key) => !!attrMap[key] || typeof attrMap[key] === 'boolean')
                    .map((key) => ({
                        attrName: key,
                        value: attrMap[key]
                    }));
                let params = {};
                // 问题 风险 处理params
                if (props.isIssue || props.isRisk) {
                    params = {
                        action: 'UPDATE',
                        attrRawList: attrRawList,
                        className: vm.className,
                        oid: row[rowKey]
                    };
                } else {
                    // 如果没选父任务就传项目oid
                    let relationOid = data.parentInfo ? data.parentInfo.oid : data.projectOid;
                    let relationAttrRawList = [{ attrName: 'roleAObjectRef', category: 'HARD', value: relationOid }];

                    params = {
                        action: 'UPDATE',
                        appName: '',
                        associationField: 'roleAObjectRef',
                        attrRawList: attrRawList,
                        className: vm.className,
                        oid: row[rowKey],
                        relationList: [
                            {
                                action: 'UPDATE',
                                appName: '',
                                associationField: '',
                                attrRawList: relationAttrRawList,
                                className: this?.className,
                                oid: this?.editRow?.oid
                            }
                        ]
                    };
                }

                handleParams && _.isFunction(handleParams) && (params = handleParams(params, row));
                commonHttp
                    .commonUpdate({
                        data: params
                    })
                    .then(() => {
                        vm.$message.success(i18nMappingObj.moveSuccess);
                        vm.refresh(row[rowKey]);
                        destroy();
                    });
            });
        },
        /**
         * 发起流程
         * @param {Object} vm 实例对象
         * @param {String} containerRef 获取团队信息
         * @param {Object} urlConfig 请求参数
         * @param {String} type single -> 单个,batch -> 多个
         * @param {Object} extendParams
         * @param {function} customGetProcessFunc 自定义获取流程模板方法
         * @param {function} afterRequest 获取流程模板之后触发的方法
         * @param {function} beforeOpenProcess 打开流程页面之前
         * @param {function} isCheckDraft 获取流程模板数据之前是否要查询草稿数据
         * @param {function} beforeDraft 获取草稿数据之前
         * */
        startProcess(vm, config) {
            let {
                businessData = [],
                urlConfig,
                containerRef = '',
                type = 'single',
                extendParams = {},
                customGetProcessFunc,
                afterRequest,
                beforeOpenProcess,
                isCheckDraft = () => true,
                handleCancel,
                beforeDraft
            } = config;
            // 发起流程
            if (type === 'batch') {
                if (!businessData.length) {
                    return vm.$message({
                        type: 'info',
                        message: i18nMappingObj.checkData
                    });
                }
                let stateKey = `${vm.className}#lifecycleStatus.status`,
                    state = businessData[0][stateKey],
                    len = businessData.filter((item) => item[stateKey] === state).length;

                if (len !== businessData.length) {
                    return vm.$message({
                        type: 'info',
                        message: i18nMappingObj.processInitiated
                    });
                }
                businessData = businessData.map((row) => {
                    let obj = {};
                    let keys = {
                        'identifierNo': 'displayName',
                        'name': 'displayName',
                        'oid': 'value',
                        'projectRef': 'oid',
                        'lifecycleStatus.status': 'displayName',
                        ...extendParams
                    };
                    row?.attrRawList.forEach((item) => {
                        let key = item.attrName.split('#')[1];
                        obj[key] = item[keys[key] || 'value'];
                    });
                    obj.attrRawList = row?.attrRawList || {};
                    return obj;
                });
            }
            let data = businessData.map((item) => {
                return item.oid;
            });
            let params = urlConfig || { data };
            let requestMethod = _.isFunction(customGetProcessFunc)
                ? customGetProcessFunc()
                : commonHttp.getProcessDefDto(params);

            requestMethod.then((res) => {
                let data = res.data;
                _.isFunction(afterRequest) && afterRequest(data);
                if (Array.isArray(data)) {
                    if (data.length >= 2) {
                        utils.renderSelectProcess({ processData: data, showDialog: true }, openProcess);
                    } else if (data.length) {
                        openProcess(data[0]);
                    } else {
                        vm.$message({
                            type: 'info',
                            message: i18nMappingObj.noFoundInformation
                        });
                        _.isFunction(handleCancel) && handleCancel();
                    }
                }
            });
            async function openProcess(data, destroy) {
                let { categoryRef: category, engineModelKey, oid: processDefRef } = data;
                _.isFunction(destroy) && destroy();
                if (_.isFunction(isCheckDraft) && (await isCheckDraft(data))) {
                    let params = new FormData();
                    params.append(
                        'reviewItemId',
                        businessData
                            .map((item) => {
                                return item['oid'];
                            })
                            .join(',')
                    );
                    _.isFunction(beforeDraft) && beforeDraft(params, data);
                    // 校验是否有草稿，有草稿跳转到草稿页面
                    vm.$famHttp({
                        url: '/bpm/workflow/findPboDraftInfo',
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: params
                    }).then((res) => {
                        if (res.data) {
                            let processBasicInfo = res.data?.baseForm?.processBasicInfo || {};
                            let { oid: pboOid, processDefRef, pboName: title } = processBasicInfo;
                            // 查询草稿接口没有返回对应的流程key导致无法把上个路由缓存上，先看看平台接口能不能加。
                            // setBackRoute()
                            vm.$router.push({
                                path: `/container/bpm-resource/workflowDraft/${pboOid}`,
                                query: {
                                    processDefRef,
                                    title
                                }
                            });
                        } else {
                            openProcessPage();
                        }
                    });
                } else {
                    openProcessPage();
                }
                function openProcessPage() {
                    const next = (businessData) => {
                        setBackRoute(engineModelKey);
                        localStorage.setItem(engineModelKey + ':businessData', JSON.stringify(businessData));
                        vm.$router.push({
                            path: `/container/bpm-resource/workflowLauncher/${engineModelKey}`,
                            query: {
                                routeKey: engineModelKey,
                                category,
                                processDefRef,
                                target: '_blank',
                                processDefinitionKey: engineModelKey,
                                containerRef,
                                engineModelKey,
                                appName: 'PPM'
                            }
                        });
                    };
                    if (_.isFunction(beforeOpenProcess)) beforeOpenProcess({ processInfos: data, businessData, next });
                    else next(businessData);
                }
            }
            function setBackRoute(engineModelKey) {
                let { query, path } = vm.$route;
                const route = {
                    path,
                    query
                };
                localStorage.setItem(`${engineModelKey}:launcher:backRoute`, JSON.stringify(route));
            }
        },
        /**
         * 导出
         * @param {Object} fieldParams
         * @param {String} tableRef 视图表格ref
         * @param {Function} getExportRequestData 必传否则不会调用导出接口
         * */
        export(vm, { className, fieldParams, getExportRequestData, tableRef = 'table' }) {
            let tableDom = _.isArray(vm.$refs[tableRef]) ? vm.$refs[tableRef][0] : vm.$refs[tableRef];
            let tableInstance = tableDom?.getTableInstance('advancedTable') || {};
            let requestData = tableInstance?.requestConfig?.data || {};
            // 如果传了fieldParams，就用传过来的fieldParams，否则就取视图表格列头数据
            if (!fieldParams) {
                let columns = tableInstance?.instance?.columns || [];
                fieldParams = {
                    data: columns
                        .filter((item) => item.attrName)
                        .map((item) => {
                            return item.attrName;
                        }),
                    params: { className: className || vm.className }
                };
            }
            vm.$famHttp({
                url: '/ppm/communal/getExportFields',
                method: 'POST',
                className: className || 'erd.cloud.ppm.project.entity.Project',
                ...fieldParams
            }).then((res) => {
                let columnSetList = res.data.map((item) => {
                    return { ...item, label: item.displayName, isDisable: item.isRequired };
                });
                let defaultColumns = columnSetList
                    .filter((item) => item.isChecked || item.isRequired)
                    .map((item) => {
                        item.locked = item.isRequired;
                        return item;
                    });
                const props = {
                    showDialog: true,
                    defaultColumns,
                    columnSetList
                };
                const callback = function (data) {
                    if (_.isFunction(getExportRequestData)) {
                        let params = getExportRequestData(data, requestData);
                        // 增加公共参数 getAllFields 默认true
                        params.tableSearchDto = $.extend({ getAllFields: true }, params?.tableSearchDto);
                        // 删除asyncQueryId参数
                        delete params?.tableSearchDto?.asyncQueryId;
                        vm.$famHttp({
                            url: '/ppm/export',
                            method: 'POST',
                            className: className || 'erd.cloud.ppm.project.entity.Project',
                            data: params
                        }).then((res) => {
                            if (res.success) {
                                utils.renderImportOrExportNotify(vm, {
                                    title: i18nMappingObj.systemExporting,
                                    message: `
                                    <a class="ppm-link-name download-export-file" style="font-size: var(--fontSizeMini)">
                                        ${i18nMappingObj.toImportAndExportView}
                                    </a>`,
                                    params: {
                                        activeTabName: 'taskTabPanelExport'
                                    },
                                    type: 'info',
                                    customClass: 'custom_export_icon'
                                });
                            }
                        });
                    }
                };
                utils.renderExportDialog(props, callback);
            });
        },
        /**
         * 全量导出
         * @param {Object} exportRequestDatae 请求参数
         * */
        allExport(vm, { className, exportRequestDatae }) {
            let params = ErdcKit.deepClone(exportRequestDatae);
            // 增加公共参数 getAllFields 默认true
            params.tableSearchDto = $.extend({ getAllFields: true }, params?.tableSearchDto);
            vm.$famHttp({
                url: '/ppm/export',
                method: 'POST',
                className: className || 'erd.cloud.ppm.project.entity.Project',
                data: params
            }).then((res) => {
                if (res.success) {
                    utils.renderImportOrExportNotify(vm, {
                        title: i18nMappingObj.systemExporting,
                        message: `
                                <a class="ppm-link-name download-export-file" style="font-size: var(--fontSizeMini)">
                                    ${i18nMappingObj.toImportAndExportView}
                                </a>`,
                        params: {
                            activeTabName: 'taskTabPanelExport'
                        },
                        type: 'info',
                        customClass: 'custom_export_icon'
                    });
                }
            });
        },
        /**
         * 导入
         * @param {String} businessName
         * @param {String} importType
         * @param {Function} handleParams
         * */
        import(vm, { businessName, importType, className, handleParams, extendProps = {} }) {
            const props = {
                showDialog: true,
                importType,
                ...extendProps
            };
            const callback = function (data, destroy) {
                let params = {
                    businessName,
                    fileId: data.fileId,
                    customParams: {
                        useDefaultImport: true,
                        importType,
                        allReplace: data.importMethod
                    }
                };
                if (handleParams && _.isFunction(handleParams)) {
                    params = handleParams(params);
                }
                vm.$famHttp({
                    url: '/ppm/import',
                    method: 'POST',
                    className: className || 'erd.cloud.ppm.project.entity.Project',
                    data: params
                }).then((res) => {
                    if (res.success) {
                        vm.$message({
                            type: 'success',
                            message: i18nMappingObj.ImportSuccessful
                        });
                        // if (_.isFunction(vm?.refresh)) vm.refresh();
                        destroy();
                        utils.renderImportOrExportNotify(vm, {
                            title: i18nMappingObj.ImportSuccessful,
                            opts: i18nMappingObj.view
                        });
                    }
                });
            };
            utils.renderImportDialog(props, callback);
        },
        // 批量编辑
        async batchEdit(vm, selected, extendParams = {}) {
            extendParams = {
                title: i18nMappingObj.bulkEdit,
                rowKey: 'oid',
                props: {},
                ...extendParams
            };

            // 勾选校验
            if (!selected.length) {
                return vm.$message.info(i18nMappingObj.checkData);
            }
            let { containerRef, rowKey, roleList, beforeSubmit, stateUrl, defaultStateParams, hideStateField } =
                extendParams;
            vm.$famHttp({
                url: '/fam/type/attribute/listTypeAccessAttribute',
                method: 'GET',
                className: 'fam',
                params: {
                    attrAccessCategory: 'UPDATE',
                    className: vm.className,
                    containerRef
                }
            }).then((res) => {
                let columnName = [i18nMappingObj.applicationCoding, i18nMappingObj.coding];
                let allField = res.data.map((item) => {
                    return {
                        ...item,
                        componentName: item.fieldType,
                        isDisable: columnName.includes(item.displayName) ? true : false,
                        label: item.displayName
                    };
                });
                allField = allField.filter((item) => !columnName.includes(item.displayName));
                const props = {
                    columnSetList: allField,
                    oid: selected[0].oid,
                    validateRules: {},
                    stateField: 'status',
                    getStateUrl: stateUrl ? stateUrl : '/ppm/common/template/states',
                    hideStateField,
                    defaultStateParams,
                    defaultOptions: {
                        responsibilityRoleRef: roleList || [],
                        reviewRoleRef: roleList || [],
                        area: 'domainType',
                        category: 'REVIEW_ELEMENT_TYPE'
                    },
                    className: vm.className,
                    classFamName: vm.classFamName,
                    showDialog: true,
                    ...extendParams.props,
                    tableData: ErdcKit.deepClone(selected),
                    visible: true
                };

                const submitData = (res, destroy) => {
                    vm.$famHttp({
                        url: '/element/saveOrUpdate',
                        className: vm.className,
                        method: 'post',
                        data: {
                            action: 'UPDATE',
                            className: vm.className,
                            rawDataVoList: res
                        }
                    }).then((resp) => {
                        vm.refresh(resp?.data);
                        vm.$message.success(i18nMappingObj.success);
                        destroy();
                    });
                };

                // 渲染设置状态面板
                utils.renderSetEdit(vm, props, function onConfirm(value, destroy) {
                    // 提交前二次处理数据
                    if (beforeSubmit && _.isFunction(beforeSubmit)) {
                        beforeSubmit(value).then((res) => {
                            submitData(res, destroy);
                        });
                    } else {
                        let attrRawList = [];
                        let nameArr = ['description', 'content'];
                        value.forEach((item) => {
                            // 批量编辑为input的组件如果为空则默认为清空
                            if (nameArr.includes(item.attrName)) {
                                attrRawList.push({
                                    attrName: item.attrName,
                                    value: item.selectValue
                                });
                            } else {
                                if (item.selectValue) {
                                    attrRawList.push({
                                        attrName: item.attrName,
                                        value: item.selectValue
                                    });
                                }
                            }
                        });
                        let rawDataVoList = selected.map((item) => {
                            return {
                                action: 'UPDATE',
                                attrRawList,
                                className: vm.className,
                                oid: item[rowKey]
                            };
                        });
                        submitData(rawDataVoList, destroy);
                    }
                });
            });
        },
        /**
         * 打开文档弹窗
         * @param {Object} vm
         * @param {String} containerRef
         * @param {Object} extendParams
         * @param {Function} customSaveData
         * @param {Function} afterRequest
         * */
        openDocument(vm, { containerRef, extendParams, customSaveData, beforeSubmit, afterSubmit }) {
            let props = {
                showDialog: true,
                containerRef,
                uploadUrl: 'document/content/file/upload',
                tableListUrl: '/document/content/attachment/list',
                deleteUrl: '/document/content/attachment/delete',
                downloadUrl: '/document/content/file/download',
                addLinkUrl: 'document/content/attachment/add'
            };
            let className = store.state.classNameMapping.document;
            props = { ...props, ...extendParams };
            const callback = (docVm, destroy) => {
                let { form: data } = docVm;
                if (_.isFunction(customSaveData)) customSaveData(data, destroy);
                else {
                    let requestUrl = '/document/update';
                    let tipsMsg = i18nMappingObj.successfullySaved;
                    let isCreate = !(props.openType === 'detail' || props.openType === 'edit');
                    let params = {
                        attrRawList: [
                            {
                                attrName: 'name',
                                value: data.fileName
                            },
                            {
                                attrName: 'description',
                                value: data.description
                            },
                            {
                                attrName: 'securityLabel',
                                value: data.securityLabel
                            },
                            {
                                attrName: 'securityDate',
                                value: data.securityDate
                            }
                        ],
                        contentSet: [
                            {
                                actionFlag: 1,
                                id: data.fileId,
                                name: data.fileName,
                                role: 'PRIMARY', // 主文件
                                source: 0,
                                location: 'REMOTE'
                            }
                        ],
                        className,
                        oid: data.oid,
                        typeReference: data.typeReference
                    };
                    // 创建需要把附件信息带上，编辑不需要
                    if (isCreate) {
                        requestUrl = '/document/create';
                        tipsMsg = i18nMappingObj.successfullyCreated;
                        params.folderRef = data?.folderRef?.oid || '';

                        _.each(data.Attach, (item) => {
                            params.contentSet.push({
                                source: '0',
                                role: 'SECONDARY', // 附件
                                actionFlag: 1,
                                location: 'REMOTE',
                                id: item.id,
                                name: item.fileName
                            });
                        });
                    } else {
                        if (data?.folderRef?.oid) {
                            params.attrRawList.push({
                                attrName: 'folderRef',
                                value: data.folderRef.oid
                            });
                        }
                    }
                    if (_.isFunction(beforeSubmit)) params = beforeSubmit(params);
                    docVm.isLoading = true;
                    vm.$famHttp({
                        url: requestUrl,
                        method: 'POST',
                        data: params,
                        appName: 'PPM'
                    })
                        .then((res) => {
                            if (res.success) {
                                vm.$message({
                                    type: 'success',
                                    message: tipsMsg
                                });
                                destroy();
                                if (!isCreate) {
                                    // 检入
                                    vm.$famHttp({
                                        url: '/document/common/checkin',
                                        method: 'PUT',
                                        className,
                                        params: {
                                            oid: res.data,
                                            note: ''
                                        }
                                    }).then(() => {
                                        if (_.isFunction(vm.refresh)) vm.refresh();
                                        if (_.isFunction(afterSubmit))
                                            afterSubmit({ data, resData: res.data, destroy });
                                    });
                                } else {
                                    if (_.isFunction(vm.refresh)) vm.refresh();
                                    if (_.isFunction(afterSubmit)) afterSubmit({ data, resData: res.data, destroy });
                                }
                            }
                        })
                        .finally(() => {
                            docVm.isLoading = false;
                        });
                }
            };
            utils.renderDocumentDialog(props, callback);
        }
    };

    return actions;
});
