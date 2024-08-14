// 存放全局注册的方法
define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'erdc-kit',
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    'erdcloud.i18n',
    'erdcloud.store',
    ELMP.resource('ppm-utils/locale/index.js'),
    'EventBus'
], function (
    commonActions,
    store,
    utils,
    commonHttp,
    ErdcKit,
    commonActionsUtils,
    ErdcI18n,
    ErdcStore,
    globalI18n,
    EventBus
) {
    const i18nMappingObj = utils.languageTransfer(globalI18n.i18n);
    const getI18n = (val) => {
        return i18nMappingObj[val] || '';
    };
    return new Promise((resolve) => {
        const commonUtils = {
            commonDocDelete: (vm, { docIds = [], folderIds = [], afterSubmit }) => {
                vm.$confirm(getI18n('isDelete'), getI18n('confirmDelete'), {
                    distinguishCancelAndClose: true,
                    confirmButtonText: getI18n('confirm'),
                    cancelButtonText: getI18n('cancel'),
                    type: 'warning'
                })
                    .then(() => {
                        let oidList = [...docIds, ...folderIds];
                        if (oidList.length) {
                            commonHttp
                                .deleteByIds({
                                    url: '/document/folder/deleteByOids',
                                    data: {
                                        catagory: 'DELETE',
                                        oidList: oidList
                                    }
                                })
                                .then(() => {
                                    vm.$message({ type: 'success', message: getI18n('deleteSuccess') });
                                    vm.refresh();
                                    vm.folderListTreeRef?.refreshList();
                                    _.isFunction(afterSubmit) && afterSubmit();
                                });
                        }
                    })
                    .catch();
            },
            invalidAndEffective: (vm, data, statusVal) => {
                // statusVal 生效传参为VALID、失效传参为INVALID
                vm.$confirm(
                    statusVal === 'INVALID'
                        ? vm.i18nMappingObj.confirmInvalidation
                        : vm.i18nMappingObj.confirmValidation,
                    vm.i18nMappingObj.confirmInvali,
                    {
                        distinguishCancelAndClose: true,
                        confirmButtonText: vm.i18nMappingObj.confirm,
                        cancelButtonText: vm.i18nMappingObj.cancel,
                        type: 'warning'
                    }
                ).then(() => {
                    vm.$famHttp({
                        url: '/element/update',
                        method: 'post',
                        data: {
                            action: 'UPDATE',
                            attrRawList: [
                                {
                                    attrName: 'status',
                                    value: statusVal
                                }
                            ],
                            className: vm.className,
                            oid: data.oid
                        }
                    }).then((resp) => {
                        if (resp.code === '200') {
                            vm.$message({
                                type: 'success',
                                message: vm.i18nMappingObj['success']
                            });
                            vm.refresh();
                        }
                    });
                });
            },
            commonRemoveRelated: (vm, row, it) => {
                vm.tabsConfig = it;
                commonActions.deleteItem(vm, row, {
                    title: getI18n('removeTips')
                });
            },
            commonUpdate(vm, { data = {}, successCallBack }) {
                commonHttp
                    .commonUpdate({
                        data: data
                    })
                    .then((resp) => {
                        if (successCallBack && _.isFunction(successCallBack)) {
                            successCallBack(resp);
                        } else {
                            vm.$message({
                                type: 'success',
                                message: getI18n('success')
                            });
                            vm.refresh();
                        }
                    });
            },
            commonCollect: (vm, row, isTableList, apiUrl) => {
                const data = {
                    attrRawList: [
                        {
                            attrName: 'roleBObjectRef',
                            value: row.oid
                        },
                        {
                            attrName: 'type',
                            value: 'FAVORITE'
                        }
                    ],
                    className: 'erd.cloud.favorites.entity.FavoritesLink'
                };
                vm.$famHttp({
                    url: apiUrl,
                    data,
                    method: 'post'
                }).then((res) => {
                    if (res.success) {
                        vm.$famHttp({
                            url: '/common/favorites/isFavorited',
                            method: 'POST',
                            data: {
                                roleBObjectRef: row.oid,
                                type: 'FAVORITE'
                            }
                        }).then(() => {
                            vm.$message.success(getI18n('success'));
                        });
                    }
                });
            }
        };

        let menuActions = {
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
            // 项目单个发起变更
            PROJECT_START_CHANGE: (vm, data, isTableList, type) => {
                let customGetProcessFunc = () => {
                    return new Promise((resolve) => {
                        const keyMap = {
                            Gantt: 'TASK',
                            TEAM: 'TEAM'
                        };
                        const value = ['Gantt', 'TEAM'].includes(type) ? keyMap[type] : 'PROJECT_ATTRIBUTE';
                        vm.$famHttp({
                            url: '/ppm/process/getAllProcessDefDto',
                            data: {
                                isInherit: true,
                                operationScenario: 'LAUNCH_PROCESS',
                                className: 'erd.cloud.ppm.change.entity.Change',
                                attrRawList: [
                                    {
                                        attrName: 'changeType',
                                        value
                                    },
                                    {
                                        attrName: 'changeContent',
                                        value: value
                                    }
                                ]
                            },
                            method: 'POST'
                        }).then((res) => {
                            resolve(res);
                        });
                    });
                };
                let projectInfo = {};
                if (isTableList) {
                    data.attrRawList.forEach((item) => {
                        item.attrName = item.attrName.split('#')[1];
                    });
                    projectInfo = ErdcKit.deserializeArray(data.attrRawList || {}, {
                        valueMap: {
                            containerRef: (e) => e.oid,
                            typeReference: (e, data) => {
                                return data['typeReference']?.oid;
                            },
                            projectManager: (e, data) => {
                                return data['projectManager']?.user;
                            }
                        }
                    });
                    projectInfo = _.assign({}, projectInfo, data);
                } else {
                    projectInfo = ErdcKit.deepClone(store.state.projectInfo);
                    let { key, id } = projectInfo.containerRef || {};
                    projectInfo.containerRef = `OR:${key}:${id}`;
                }
                projectInfo.changeType = 'PROJECT_ATTRIBUTE';
                projectInfo.changeContent = 'PROJECT_ATTRIBUTE';
                projectInfo.changeContentName = i18nMappingObj.projectChanged;
                if (type === 'Gantt') {
                    projectInfo.changeType = 'TASK';
                    projectInfo.changeContent = 'TASK';
                    projectInfo.changeContentName = i18nMappingObj.planChanges;
                }
                if (type === 'TEAM') {
                    projectInfo.changeType = 'TEAM';
                    projectInfo.changeContent = 'TEAM';
                    projectInfo.changeContentName = i18nMappingObj.teamChanges;
                }
                // 团队变更需要
                projectInfo.containerTeamRef = vm.$store.state.space?.context?.containerTeamRef;
                commonActions.startProcess(vm, {
                    containerRef: projectInfo?.containerRef || '',
                    businessData: [projectInfo],
                    customGetProcessFunc,
                    isCheckDraft: () => false
                });
            },
            // 计划详情操作发起变更
            TASK_START_CHANGE: (vm, data, isTableList, type) => {
                menuActions.PROJECT_START_CHANGE(vm, data, isTableList, type);
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
                        path: !data['templateInfo.tmplTemplated'] ? '/space/project-space/edit' : 'templateEdit',
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
            // 项目复制
            PROJECT_COPY: (vm, data) => {
                vm.$router.push({
                    path: '/space/project-space/projectCopy',
                    query: {
                        pid: data.oid
                    }
                });
            },
            // 项目另存为模板
            PROJECT_SAVE_AS_TEMPLATE: (vm, data) => {
                vm.$router.push({
                    path: '/space/project-space/saveTemplate',
                    query: {
                        pid: data.oid
                    }
                });
            },
            //项目收藏
            PPM_PROJECT_FAVORIATE: (vm, row, isTableList) => {
                commonUtils.commonCollect(vm, row, isTableList, '/common/create');
            },
            //项目取消收藏
            PPM_PROJECT_CANCEL_FAVORITE: (vm, row, isTableList) => {
                commonUtils.commonCollect(vm, row, isTableList, '/common/update');
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
            PPM_MILESTONE_START_PROCESS: (vm, data) => {
                let draftOid;
                const keys = ['TechnicalReview', 'DcpReview'];
                let containerRef = utils.getContainerRef();
                const beforeOpenProcess = async ({ processInfos, next, businessData }) => {
                    let { engineModelKey } = processInfos || {};
                    if (keys.includes(engineModelKey)) {
                        let className = store.state.classNameMapping.reviewManagement;
                        let reviewCategoryRef = data.attrRawList?.find(
                            (el) => el.attrName == 'erd.cloud.ppm.plan.entity.Task#reviewCategoryRef'
                        );
                        let reviewPointRef = data.attrRawList?.find(
                            (el) => el.attrName == 'erd.cloud.ppm.plan.entity.Task#reviewPointRef'
                        );
                        let reviewPointOid = reviewPointRef?.oid;
                        let params = {
                            reviewPointOid,
                            projectOid: vm.$route.query.pid,
                            taskOidList: [data.oid]
                        };
                        let reviewData = await commonHttp.getByProductOid();
                        commonHttp.findReviewData(params, className).then((resp) => {
                            let businessData = resp;
                            businessData.urlConfig = {
                                className,
                                data: params
                            };
                            businessData.types = 'milestone';
                            businessData.milestoneTableData = [data];
                            localStorage.setItem(
                                engineModelKey + ':setReviewInfo',
                                JSON.stringify({
                                    type: reviewData.filter((item) => item.oid === reviewCategoryRef.oid) || [],
                                    point: [
                                        { oid: reviewPointOid, name: reviewPointRef.displayName, ...reviewPointRef }
                                    ]
                                })
                            );
                            next([businessData]);
                        });
                    } else next(businessData);
                };
                commonActions.startProcess(vm, {
                    containerRef,
                    businessData: [data],
                    beforeOpenProcess,
                    isCheckDraft: async ({ engineModelKey }) => {
                        if (keys.includes(engineModelKey)) {
                            draftOid = await commonHttp.getReviewDraft([data]);
                            return !!draftOid;
                        }
                        return true;
                    },
                    beforeDraft: (params, { engineModelKey }) => {
                        // 只有技术评审流程和决策评审流程才会修改获取草稿数据入参
                        keys.includes(engineModelKey) && params.set('reviewItemId', [draftOid]);
                    }
                });
            },
            // 计划发起流程
            TASK_START_PROCESS: (vm, data) => {
                let draftOid;
                const keys = ['TechnicalReview', 'DcpReview'];
                let containerRef = utils.getContainerRef();
                const beforeOpenProcess = async ({ processInfos, next, businessData }) => {
                    // 当前表单只有评审类型和评审点的oid，拿不到完整的对象，所以从动态表单拿完整的数据
                    let sourceData = vm.$refs.detail?.[0]?.$refs.layoutForm.sourceData || {};
                    let { reviewPointRef, reviewCategoryRef, projectRef, idKey } = sourceData.rawData;
                    let { engineModelKey } = processInfos || {};
                    if (keys.includes(engineModelKey)) {
                        let className = store.state.classNameMapping.reviewManagement;
                        let params = {
                            reviewPointOid: reviewPointRef?.oid,
                            projectOid: vm.$route.query.pid,
                            taskOidList: [data.oid]
                        };
                        let reviewData = await commonHttp.getByProductOid();
                        commonHttp.findReviewData(params, className).then((resp) => {
                            let businessData = resp;
                            let { className } = vm;
                            businessData.urlConfig = {
                                className,
                                data: params
                            };
                            businessData.types = 'milestone';
                            let result = {};
                            let obj = ErdcKit.deserializeAttr(sourceData.rawData, {
                                valueMap: {
                                    responsiblePerson: (e) => {
                                        return e.displayName;
                                    },
                                    reviewCategoryRef: (e) => {
                                        return e.displayName;
                                    },
                                    createTime: (e) => {
                                        return e.displayName;
                                    },
                                    updateTime: (e) => {
                                        return e.displayName;
                                    },
                                    reviewPointRef: (e) => {
                                        return e.displayName;
                                    },
                                    projectRef: (e) => {
                                        return e.displayName;
                                    },
                                    typeReference: (e) => {
                                        return e.displayName;
                                    }
                                }
                            });
                            Object.keys(obj).forEach((key) => {
                                result[className + '#' + key] = obj[key];
                            });
                            result.oid = data.oid;
                            result.name = data.name;
                            result.projectRef = projectRef.oid;
                            result.idKey = idKey.value;
                            result.rawData = ErdcKit.deepClone(sourceData.rawData);
                            businessData.milestoneTableData = [result];
                            reviewPointRef.name = reviewPointRef.displayName;
                            localStorage.setItem(
                                engineModelKey + ':setReviewInfo',
                                JSON.stringify({
                                    type: reviewData.filter((item) => item.oid === reviewCategoryRef.oid) || [],
                                    point: [reviewPointRef]
                                })
                            );
                            next([businessData]);
                        });
                    } else {
                        EventBus.off('PPMProcessSuccessCallback');
                        EventBus.once('PPMProcessSuccessCallback', () => {
                            if (vm.refresh) vm.refresh(data?.oid);
                        });
                        next(businessData);
                    }
                };
                commonActions.startProcess(vm, {
                    containerRef,
                    businessData: [data],
                    beforeOpenProcess,
                    isCheckDraft: async ({ engineModelKey }) => {
                        if (keys.includes(engineModelKey)) {
                            draftOid = await commonHttp.getReviewDraft([data]);
                            return !!draftOid;
                        }
                        return true;
                    },
                    beforeDraft: (params, { engineModelKey }) => {
                        // 只有技术评审流程和决策评审流程才会修改获取草稿数据入参
                        keys.includes(engineModelKey) && params.set('reviewItemId', [draftOid]);
                    }
                });
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
            // 文件夹-创建文件夹
            PROJECT_FOLDER_CREATE: (vm) => {
                vm.$router.push({
                    path: '/container/project-folder/folder/create',
                    query: {
                        pid: vm.$route.query.pid,
                        defaultFolder: vm.folderListTreeRef?.currentFolder?.oid,
                        componentRefresh: true
                        // containerRef: vm.folderListTreeRef.containerRef
                    }
                });
                // if (_.isFunction(vm?.folderListDetailRef?.onCreate)) vm?.folderListDetailRef?.onCreate();
            },
            // 文件夹-创建文档
            DOCUMENT_CREATE: (vm) => {
                vm.$router.push({
                    path: '/container/project-folder/document/create',
                    query: {
                        pid: vm.$route.query.pid,
                        defaultFolder: vm.folderListTreeRef?.currentFolder?.oid || ''
                    }
                });
                // let containerRef = utils.getContainerRef();
                // const beforeSubmit = (data) => {
                //     data.attrRawList.push({
                //         attrName: 'containerRef',
                //         value: containerRef
                //     });
                //     return data;
                // };
                // commonActions.openDocument(vm, {
                //     containerRef,
                //     extendParams: { defaultFolder: vm?.folderListDetailRef?.folderObject || {} },
                //     beforeSubmit
                // });
            },
            // 文件夹-批量删除
            DELETE: (vm) => {
                let selectData = vm.folderListDetailRef.$refs['famAdvancedTable'].fnGetCurrentSelection();
                if (!selectData.length) return vm.$message({ type: 'info', message: getI18n('pleaseSelectData') });
                // 文档
                let docIds = selectData
                    .filter((item) => item.idKey === vm.documentClassName)
                    .map((item) => {
                        return item.oid;
                    });
                // 文件夹
                let folderIds = selectData
                    .filter((item) => item.idKey === vm.$store.getters.className('subFolder'))
                    .map((item) => {
                        return item.oid;
                    });
                commonUtils.commonDocDelete(vm, { docIds, folderIds });
            },
            // 工作台-项目数据-我的文档-批量删除
            WORKBENCH_PROJECT_DOC_LIST_DELETE: (vm, selected) => {
                if (!selected.length) return vm.$message({ type: 'info', message: getI18n('pleaseSelectData') });
                // 文档
                let docIds = selected
                    .filter((item) => item.idKey === vm.documentClassName)
                    .map((item) => {
                        return item.oid;
                    });
                commonUtils.commonDocDelete(vm, { docIds });
            },
            // 文件夹-编辑操作
            SUB_FOLDER_UPDATE: (vm, data) => {
                vm.$router.push({
                    path: '/space/project-folder/folder/edit',
                    query: {
                        pid: vm.$route.query.pid,
                        defaultFolder: data.oid,
                        oid: data.oid
                    }
                });
                // if (_.isFunction(vm?.folderListDetailRef?.onCreate)) vm?.folderListDetailRef?.onEdit(data);
            },
            // 文件夹-操作-移动操作
            SUB_FOLDER_MOVE: (vm, data) => {
                vm.$set(vm?.folderListDetailRef, 'rowData', [data]);
                vm.$set(vm?.folderListDetailRef, 'dialogVisible', true);
                vm.$set(vm?.folderListDetailRef, 'formType', 'FOLDER_MOVE_FORM');
                vm.$set(vm?.folderListDetailRef, 'openType', 'moveFolder');
                vm.$set(vm?.folderListDetailRef, 'is', 'FolderListConfig');
                vm.$set(vm?.folderListDetailRef, 'title', vm?.folderListDetailRef?.i18nMappingObj?.moveTo);
            },
            // 文件夹-操作-文档编辑
            DOCUMENT_UPDATE: (vm, row, isTable) => {
                const openEdit = (checkOid) => {
                    let containerRef = '';
                    let documentType = vm.$route.meta.documentType;
                    if (documentType === 'myDocument') {
                        containerRef = row.containerRef;
                    }
                    const pathMap = {
                        myDocument: '/project-my-document/document/edit',
                        projectDocument: '/space/project-folder/document/edit'
                    };
                    vm.$router.push({
                        path: pathMap[documentType],
                        query: {
                            pid: vm.$route.query.pid || '',
                            oid: checkOid,
                            title: getI18n('edit') + row[isTable ? 'erd.cloud.cbb.doc.entity.EtDocument#name' : 'name'],
                            containerRef
                        }
                    });
                };
                // 文档编辑需要先检出
                vm.$famHttp({
                    url: '/document/common/checkout',
                    method: 'GET',
                    params: {
                        oid: row.oid,
                        pid: vm.$route.query?.pid
                    }
                }).then((resp) => {
                    let checkOid = resp.data.rawData?.oid?.value;
                    if (!isTable && row.oid !== checkOid) {
                        vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                            vm.$router
                                .replace({
                                    ...vm.$route,
                                    query: { ...vm.$route?.query, oid: checkOid }
                                })
                                .then(() => {
                                    // 刷新路由缓存
                                    vm?.routeRefresh();
                                    openEdit(checkOid);
                                });
                        });
                    } else openEdit(checkOid);
                });
            },
            // 工作台-项目数据-我的文档-编辑
            WORKBENCH_PROJECT_DOC_UPDATE: (vm, row, isTableList) => {
                menuActions.DOCUMENT_UPDATE(vm, row, isTableList);
            },
            // 文件预览
            DOCUMENT_PREVIEW: (vm, row) => {
                commonActionsUtils.renderFilePreview(row);
            },
            // 工作台-项目数据-我的文档-预览
            WORKBENCH_PROJECT_DOC_PREVIEW: (vm, row) => {
                menuActions.DOCUMENT_PREVIEW(vm, row);
            },
            // 文件夹-操作-删除操作
            SUB_FOLDER_DELETE: (vm, row) => {
                const afterSubmit = vm.switchTreeNode;
                commonUtils.commonDocDelete(vm, { folderIds: [row.oid], afterSubmit });
            },
            // 文件夹-操作-文档删除
            DOCUMENT_DELETE: (vm, row) => {
                commonUtils.commonDocDelete(vm, { docIds: [row.oid] });
            },
            // 工作台-项目数据-我的文档-文档删除
            WORKBENCH_PROJECT_DOC_DELETE: (vm, row) => {
                menuActions.DOCUMENT_DELETE(vm, row);
            },
            // 文件夹-操作-文档下载
            DOCUMENT_DOWNLOAD: (vm, row) => {
                utils.downloadFile(row);
            },
            // 工作台-项目数据-我的文档-文档下载
            WORKBENCH_PROJECT_DOC_DOWNLOAD: (vm, row) => {
                menuActions.DOCUMENT_DOWNLOAD(vm, row);
            },
            // 文件夹-文档设置状态
            DOCUMENT_SET_STATUS: (vm, row, isTableList) => {
                vm.className = row.idKey;
                const setStateFunc = (value) => {
                    let params = {
                        resetVoList: [
                            {
                                oid: row.oid,
                                stateName: value
                            }
                        ],
                        className: row.idKey
                    };
                    return vm.$famHttp({
                        url: '/document/common/batchResetState',
                        data: params,
                        method: 'POST'
                    });
                };
                let extendParams = {
                    stateKey: isTableList ? 'statusDisplayName' : 'lifecycleStatus.status',
                    setStateFunc: setStateFunc,
                    refreshOid: row.oid
                };
                commonActions.setStatus(vm, row, extendParams);
            },
            // 工作台-项目数据-我的文档-文档设置状态
            WORKBENCH_PROJECT_DOC_SET_STATUS: (vm, row, isTableList) => {
                row.typeName =
                    row.attrRawList?.find((item) => item.attrName === 'erd.cloud.cbb.doc.entity.EtDocument#typeName')
                        ?.value || '';
                row.statusDisplayName =
                    row.attrRawList?.find(
                        (item) => item.attrName === 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status'
                    )?.displayName || '';
                menuActions.DOCUMENT_SET_STATUS(vm, row, isTableList);
            },
            // 文件夹-操作-文档移动
            DOCUMENT_MOVE: (vm, row, isTableList) => {
                if (isTableList) {
                    vm.$set(vm?.folderListDetailRef, 'rowData', [row]);
                    vm.$set(vm?.folderListDetailRef, 'dialogVisible', true);
                    vm.$set(vm?.folderListDetailRef, 'formType', 'FOLDER_MOVE_FORM');
                    vm.$set(vm?.folderListDetailRef, 'openType', 'moveFolder');
                    vm.$set(vm?.folderListDetailRef, 'is', 'FolderListConfig');
                    vm.$set(vm?.folderListDetailRef, 'title', vm?.folderListDetailRef?.i18nMappingObj?.moveTo);
                } else {
                    let params = {
                        oid: vm.$route.query?.folderOid || '',
                        rowData: [row],
                        containerRef: row.containerRef
                    };
                    commonActionsUtils.renderMoveDialog({ vm, params });
                }
            },
            // 基线-设置基线
            PPM_BASELINE_CREATE: (vm) => {
                vm.$router.push({
                    path: 'baseline/create',
                    query: {
                        pid: vm.$route.query.pid
                    }
                });
            },
            // 基线-批量设置状态
            PPM_BASELINE_BATCH_SET_STATUS: (vm, data) => {
                if (!data.length) {
                    return vm.$message({
                        type: 'info',
                        message: getI18n('checkData')
                    });
                }
                vm.openChangeLifecycleDialog(data);
            },
            // 基线--批量删除
            PPM_BASELINE_BATCH_DELETE: (vm, data) => {
                if (!data.length) {
                    return vm.$message({
                        type: 'info',
                        message: getI18n('checkData')
                    });
                }
                commonActions.batchDeleteItems(vm, data, {
                    rowKey: 'masterRef',
                    requestConfig: {
                        className: 'erd.cloud.cbb.baseline.entity.Baseline'
                    }
                });
            },
            // 基线--基线比较
            PPM_BASELINE_COMPARE: (vm, data) => {
                // 这里的vm是基线的，所以他的父是PPM这边的
                let { i18n, pid, compareClassName } = vm.$parent || {};
                if (data.length < 1) {
                    vm.$message.warning(i18n.checkData);
                    return;
                }
                if (data.length > 3) {
                    vm.$message.warning(i18n.upToThree);
                    return;
                }
                // vm.$store.commit('infoCompare/compareData', {
                //     oids: data.map((item) => item.oid)
                // });

                // 增加比较对象弹窗接口用到
                let codeList = data.map((item) => item['erd.cloud.cbb.baseline.entity.Baseline#identifierNo']) || [];
                vm.$store.commit('infoCompare/SET_INFO_COMPARE', {
                    className: compareClassName || '',
                    infoCompare: data.map((item) => item.oid) || []
                });
                vm.$router.push({
                    path: 'baseline/infoCompare',
                    query: {
                        title: i18n.baselineComparison,
                        pid: pid,
                        codeList: codeList.toString()
                    }
                });
            },
            // 项目任务 操作基线对比,   里程碑 操作基线对比
            PPM_BASELINE_TASK_COMPARE: (vm) => {
                menuActions.PPM_BASELINE_REQUIREMENT_COMPARE(vm);
            },
            PPM_BASELINE_BUDGET_COMPARE: (vm) => {
                menuActions.PPM_BASELINE_REQUIREMENT_COMPARE(vm);
            },
            // 项目需求 操作基线对比
            PPM_BASELINE_REQUIREMENT_COMPARE: (vm) => {
                let className =
                    vm.$store.getters['CbbBaseline/getViewTableMapping']({
                        tableName: 'baseline'
                    })?.className || '';
                if (vm.latestOid && vm.latestOid.indexOf('baseline') != -1) {
                    vm.$nextTick(() => {
                        vm.$store.commit('infoCompare/SET_INFO_COMPARE', {
                            className,
                            infoCompare: [vm.latestOid] || []
                        });
                        // vm.$store.commit('CbbBaseline/compareData', {
                        //     oids: [vm.latestOid]
                        // });
                        vm.$router.push({
                            path: '/space/project-baseline/baseline/infoCompare',
                            query: {
                                pid: vm.$route.query.pid || '',
                                title: getI18n('baselineComparison')
                            }
                        });
                    });
                } else {
                    vm.$message({
                        type: 'info',
                        message: getI18n('pleaseSwitchSelectBaseline')
                    });
                }
            },

            // 项目信息 操作基线对比
            PPM_BASELINE_PROJECT_COMPARE: (vm) => {
                let { compareClassName } = vm.$parent || {};
                let getLatestOid = (children) => {
                    let parentElement =
                        children.find(
                            (item) => item.$el.className.indexOf('common-page-detail-info__top__section') != -1
                        ) || {};
                    let customVue = parentElement?.$children?.find(
                        (elem) => elem.$el.className.indexOf('custom-slot-select') != -1
                    );
                    return customVue?.latestOid || '';
                };
                let latestOid = getLatestOid(vm.$children);
                if (latestOid && latestOid.indexOf('baseline') != -1) {
                    vm.$nextTick(() => {
                        vm.$store.commit('infoCompare/SET_INFO_COMPARE', {
                            className: compareClassName || '',
                            infoCompare: [latestOid]
                        });
                        // vm.$store.commit('CbbBaseline/compareData', {
                        //     oids: [latestOid]
                        // });
                        vm.$router.push({
                            path: '/space/project-baseline/baseline/infoCompare',
                            query: {
                                pid: vm.$route.query.pid || '',
                                title: getI18n('baselineComparison')
                            }
                        });
                    });
                } else {
                    vm.$message({
                        type: 'info',
                        message: getI18n('pleaseSwitchSelectBaseline')
                    });
                }
            },
            // 任务列表 | 我的任务-excel导出
            TASK_EXCEL_EXPORT: (vm) => {
                let customRef = '';
                switch (vm.className) {
                    case store.state.classNameMapping.task:
                        customRef = 'taskList';
                        break;
                    case store.state.classNameMapping.DiscreteTask:
                        customRef = 'handleTaskList';
                        break;
                    default:
                        break;
                }
                const getExportRequestData = (data, requestData) => {
                    if (requestData?.conditionDtoList) {
                        // 导出去掉所有计划集
                        requestData.conditionDtoList = requestData.conditionDtoList.filter(
                            (item) =>
                                item.attrName !== 'erd.cloud.ppm.plan.entity.Task#collectRef' ||
                                vm?.currentPlanSet?.trim()
                        );
                    }
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    let isTemplate = !!(store.state.projectInfo['templateInfo.tmplTemplated'] && vm.$route.query.pid);
                    let params = {
                        businessName: 'TaskExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1714907513407754241',
                        useDefaultExport: false,
                        exportFields,
                        customParams: {
                            useDefaultTemplate: true,
                            exportType: 'excel',
                            isTemplate
                        },
                        tableSearchDto: requestData
                    };
                    return params;
                };
                let params = {
                    className: vm.className,
                    tableRef: customRef,
                    getExportRequestData
                };
                commonActions.export(vm, params);
            },
            // 同步责任人
            ContainerTeam_SYNCPERSON: function () {
                require(['fam:http', 'erdcloud-ui'], function (famHttp, erdcloudUI) {
                    let projectId = store.state?.projectInfo?.id;
                    famHttp({
                        url: 'ppm/plan/v1/task/members',
                        method: 'PUT',
                        className: store.state.classNameMapping.project,
                        params: {
                            projectId
                        }
                    }).then(() => {
                        erdcloudUI.Message.success(getI18n('synchronizedResponsible'));
                    });
                });
            },
            // 计划详情操作设置状态
            TASK_SET_STATUS: (vm, data, isTableList, object) => {
                if (object && object === 'handleTask') return;
                if (object && object === 'Gantt') {
                    const { eventsMap } = vm;
                    eventsMap['TASK_SET_STATUS'] && eventsMap['TASK_SET_STATUS'](vm.tableSelectData, true);
                    return;
                }
                async function setStateFunc(value) {
                    let checkData = {
                        taskOidList: [data.oid],
                        sign: value
                    };
                    let requestMethod;
                    await commonActionsUtils.commonCheckPreTaskTime(vm, checkData).then(() => {
                        requestMethod = commonHttp.commonUpdate({
                            data: {
                                attrRawList: [
                                    {
                                        attrName: 'lifecycleStatus.status',
                                        value
                                    }
                                ],
                                oid: data.oid,
                                className: vm.className
                            }
                        });
                    });
                    return requestMethod;
                }
                commonActions.setStatus(vm, data, { setStateFunc });
            },
            // 基线-设置状态
            PPM_BASELINE_SET_STATUS: (vm, data) => {
                vm.openChangeLifecycleDialog(data);
            },
            // 基线-删除
            PPM_BASELINE_DELETE: (vm, data, isTableList) => {
                let extendParams = {
                    rowKey: 'masterRef',
                    requestConfig: {
                        className: 'erd.cloud.cbb.baseline.entity.Baseline'
                    }
                };
                if (isTableList) {
                    vm.refresh = vm.reloadTable;
                } else {
                    extendParams.listRoute = {
                        name: 'projectBaselineList'
                    };
                }
                commonActions.deleteItem(vm, data, extendParams);
            },
            // 基线-编辑
            PPM_BASELINE_UPDATE: (vm, data) => {
                vm.$famHttp({
                    url: '/baseline/common/checkout',
                    method: 'GET',
                    className: store.state.classNameMapping.baseline,
                    params: {
                        oid: data.oid
                    }
                }).then(() => {
                    vm.$router.push({
                        path: `baseline/update`,
                        query: {
                            oid: data.oid,
                            pid: vm.$route.query.pid
                        }
                    });
                });
            },

            // 基线-撤销编辑
            PPM_BASELINE_CANCEL_UPDATE: (vm, data) => {
                vm.handleUnCheckOut(data);
            },
            // 基线-保存
            PPM_BASELINE_SAVE: (vm, data) => {
                vm.handleCheckIn(data);
            },
            // 计划详情操作删除
            TASK_DELETE: (vm, data, isTableList, object) => {
                if (object === 'Gantt') {
                    let { eventsMap } = vm;
                    eventsMap['TASK_DELETE'] && eventsMap['TASK_DELETE'](vm.tableSelectData, true);
                    return;
                }
                let extendParams = {};
                if (!isTableList) {
                    let path = '/space/project-plan/list';
                    extendParams.listRoute = {
                        path,
                        query: {
                            pid: vm.$route.query.pid || ''
                        }
                    };
                }
                commonActions.deleteItem(vm, data, extendParams);
            },
            // 计划详情操作编辑
            TASK_UPDATE: (vm, data, isTableList, object) => {
                let routePath = vm.$route.path;
                const editRoutes = {
                    '/space/project-plan/planDetail': '/planEdit',
                    '/space/project-task/taskDetail': '/taskEdit'
                };
                vm.$router.push({
                    // name: editRoutes[routeName],
                    path: editRoutes[routePath],
                    query: {
                        pid: vm.$route.query.pid || '',
                        planOid: vm.$route.query.planOid,
                        status: data?.['lifecycleStatus.value'] || '',
                        planTitle: getI18n('edit') + `${data?.name || ''}`,
                        collectId: vm.$route.params.currentPlanSet || vm.$route.query.collectId,
                        oid: data.oid
                    }
                });
            },
            // 计划详情操作创建子任务
            TASK_CREATE_SUB: (vm, data) => {
                vm.$router.push({
                    path: '/space/project-plan/planCreate',
                    params: {
                        hideDraftBtn: true
                    },
                    query: {
                        planOid: data?.oid,
                        pid: vm.$route.query.pid,
                        backName: 'planDetail',
                        createPlanTitle: getI18n('createSubTask'),
                        planTitle: vm.$route.query.planTitle,
                        collectId: vm.$route.query.collectId
                    }
                });
            },
            // 计划详情操作复制
            TASK_SAVE_AS: (vm, data) => {
                commonActions.copyItem(vm, data, {
                    rowKey: 'oid',
                    nameKey: 'name',
                    creatorId: (data.CreateBy.value || '').split(':')[2],
                    props: {
                        usePlanSet: true,
                        ObjectType: 'plan',
                        parentConfig: {
                            show: true,
                            isList: false,
                            label: getI18n('parentTask')
                        }
                    }
                });
            },
            // 计划详情操作移动
            TASK_MOVE: (vm, data, isTableList, object) => {
                let rowKey = 'oid';
                let projectInfo = store.state.projectInfo;
                let isTemplate = !!(projectInfo['templateInfo.tmplTemplated'] && vm.$route.query.pid);
                let props = {
                    isTemplate,
                    usePlanSet: true,
                    ObjectType: 'plan',
                    parentConfig: {
                        show: true,
                        isList: false,
                        label: getI18n('parentTask')
                    }
                };
                if (isTableList && object == 'subTask') {
                    data.roleBObjectRef =
                        data.attrRawList.find((item) => {
                            return item.attrName == 'erd.cloud.ppm.plan.entity.TaskLink#roleBObjectRef';
                        })?.oid || '';
                    rowKey = 'roleBObjectRef';
                }
                function handleParams(params, row) {
                    // 处理关联任务字段
                    params.relationList[0].className = row?.TaskLink?.idKey;
                    params.relationList[0].oid = row?.TaskLink?.oid;
                    if (isTableList) {
                        params.relationList[0].className = row?.idKey;
                        params.relationList[0].oid = row?.oid;
                    }
                    return params;
                }
                commonActions.moveItem(vm, data, {
                    rowKey,
                    nameKey: 'name',
                    props: props,
                    handleParams
                });
            },
            // 计划详情操作开始执行任务
            TASK_EXECUTE(vm, data) {
                let updateObj = {
                    data: {
                        attrRawList: [
                            {
                                attrName: 'lifecycleStatus.status',
                                value: 'RUN'
                            }
                        ],
                        oid: data.oid,
                        className: vm.className
                    },
                    successCallBack: (resp) => {
                        vm.$message({
                            type: 'success',
                            message: getI18n('taskExecutedSuccess')
                        });
                        vm.refresh(resp?.data);
                    }
                };
                let checkData = {
                    taskOidList: [data.oid],
                    sign: 'RUN'
                };
                commonActionsUtils.commonCheckPreTaskTime(vm, checkData, () => {
                    commonUtils.commonUpdate(vm, updateObj);
                });
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

            // 关联 任务移除风险关联
            TASK_RISK_LIST_DELETE: commonUtils.commonRemoveRelated,
            // 关联 任务移除问题关联
            TASK_ISSUE_LIST_DELETE: commonUtils.commonRemoveRelated,
            // 关联 任务移除需求关联
            TASK_REQ_LIST_DELETE: commonUtils.commonRemoveRelated,
            // 里程碑创建
            MILESTONE_INFO_CREATE: (vm) => {
                vm.$router.push({
                    path: '/space/project-plan/planCreate',
                    params: {
                        hideDraftBtn: true,
                        currentPlanSet: ''
                    },
                    query: {
                        pid: vm.oid,
                        typeName: 'milestone',
                        backName: 'projectMilestone',
                        createPlanTitle: vm.i18n.createMilestones,
                        hideDraftBtn: true,
                        currentPlanSet: ''
                    }
                });
            },
            // 里程碑列表编辑
            MILESTONE_UPDATE: (vm, data) => {
                vm.$router.push({
                    path: '/space/project-plan/planEdit',
                    query: {
                        pid: vm.oid,
                        planOid: data.oid,
                        planTitle: vm.i18n.edit + `${data['erd.cloud.ppm.plan.entity.Task#name']}`,
                        backName: 'projectMilestone'
                    }
                });
            },
            // 里程碑裁剪
            MILESTONE_CROP: (vm, data) => {
                vm.taskSetCrop([data], false);
            },
            // 里程碑批量裁剪
            MILESTONE_BATCH_CROP: (vm, data) => {
                vm.taskSetCrop(data, true);
            },
            // 里程碑批量设置状态-批量
            MILESTONE_BATCH_SET_STATUS: (vm, data) => {
                vm.taskSetStatus(data, true);
            },
            // 里程碑批量设置状态-单个
            MILESTONE_SET_STATUS: (vm, data) => {
                vm.taskSetStatus([data], false);
            },
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
                commonActions.export(vm, params);
            },
            // 项目-登记工时
            PPM_PROJECT_TIMESHEET_ADD(vm, props = {}) {
                let { destroy } = commonActionsUtils.useFreeComponent({
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
                commonActions.deleteItem(vm, row);
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
                commonActions.export(vm, params);
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
                commonActions.import(vm, params);
            },
            // 计划工时记录-导入
            PPM_TASK_TIMESHEET_IMPORT(vm) {
                menuActions['PPM_PROJECT_TIMESHEET_IMPORT'](vm);
            },
            // 督办任务工时记录-导入
            PPM_DISCRETE_TASK_TIMESHEET_IMPORT(vm) {
                menuActions['PPM_PROJECT_TIMESHEET_IMPORT'](vm);
            },
            // 项目团队-发起变更
            TEAM_START_CHANGE(vm) {
                vm.$famHttp({
                    url: '/ppm/process/validate',
                    method: 'POST',
                    params: {
                        projectOid: vm.$route.query.pid,
                        changeContent: 'TEAM'
                    }
                }).then((res) => {
                    if (!res.data) menuActions.PROJECT_START_CHANGE(vm, [], false, 'TEAM');
                    else vm.$message.error(getI18n('changeErrorTips'));
                });
            },
            // 文档列表发起流程
            PROJECT_DOCUMENT_START_PROCECSS: (vm, tableSelectData) => {
                console.log('tableSelectDatatableSelectData', tableSelectData);
                if (!tableSelectData.length) {
                    return vm.$message.info(vm.i18n.foldersNotCheckData); //未勾选数据，请选择
                }
                if (tableSelectData.find((item) => item.idKey === vm.$store.getters.className('subFolder'))) {
                    return vm.$message.info(vm.i18n.foldersNotAllowed); //所选数据存在文件夹，无法发起流程
                }
                if (tableSelectData.find((item) => item.status !== 'INWORK')) {
                    return vm.$message.info(vm.i18n.foldersHasNotWorkerStatus); //所选数据存在非正在工作状态的文档，无法发起流程
                }

                let businessData = ErdcKit.deepClone(tableSelectData);
                businessData = businessData.map((item) => {
                    item.projectOid = store.state.projectInfo?.oid;
                    item.folderObject = vm.folderListTreeRef?.currentFolder;
                    item.businessSource = 'documentList';
                    return item;
                });
                commonActions.startProcess(vm, {
                    containerRef: vm.containerRef,
                    businessData,
                    urlConfig: {
                        url: '/ppm/communal/getProcessDefDtoForOtherObj',
                        data: businessData.map((item) => {
                            return item.oid;
                        })
                    }
                });
            },
            // 文档操作发起流程
            PROJECT_DOCUMENT_SINGLE_START_PROCESS: (vm, row) => {
                let rowData = ErdcKit.deepClone(row);
                rowData.projectOid = store.state.projectInfo?.oid;
                rowData.businessSource = 'documentList';
                rowData.folderObject = vm.folderListTreeRef?.currentFolder;

                commonActions.startProcess(vm, {
                    containerRef: vm.containerRef,
                    businessData: [rowData],
                    urlConfig: {
                        url: '/ppm/communal/getProcessDefDtoForOtherObj',
                        data: [rowData.oid]
                    }
                });
            }
        };
        resolve(menuActions);
    });
});
