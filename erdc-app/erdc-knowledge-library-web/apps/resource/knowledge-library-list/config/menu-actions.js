define([
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-utils/locale/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.kit'
], function (commonActions, utils, globalI18n, commonHttp, actionsUtils, ppmStore, ErdcKit) {
    const i18nMappingObj = utils.languageTransfer(globalI18n.i18n);
    const getI18n = (val) => {
        return i18nMappingObj[val] || '';
    };
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
        moveData(vm, row) {
            vm.isMove = true;
            vm.currentType = 'edit';
            vm.currentRow = row;
            vm.folderVisible = true;
        },
        createFolder(vm) {
            vm.isMove = false;
            vm.currentType = 'create';
            vm.folderVisible = true;
            vm.currentRow = {};
        },
        startProcess(vm, tableData) {
            let businessData = tableData.map((item) => {
                // 给【知识库】入库审批流程增加文档用
                item.folderObject = vm.currentTreeNode || vm.$route.query.folderObject || {};
                item.containerRef = vm.containerRef || item.containerRef;
                return item;
            });
            commonActions.startProcess(vm, {
                containerRef: ppmStore.state.knowledgeInfo.containerRef,
                businessData,
                urlConfig: {
                    url: '/ppm/communal/getProcessDefDtoForOtherObj',
                    data: businessData.map((item) => {
                        return item.oid;
                    })
                }
            });
        }
    };
    let actions = {
        // 左侧-文件夹创建
        KNOWLEDGE_TREE_SUB_FOLDER_CREATE: (vm) => {
            vm.$router.push({
                path: '/container/knowledge-library-list/folder/create',
                query: {
                    defaultFolder: vm.currentTreeNode.oid,
                    componentRefresh: true
                }
            });
            // commonUtils.createFolder(vm);
        },
        // 右侧-文件夹创建
        KNOWLEDGE_SUB_FOLDER_CREATE: (vm) => {
            vm.$router.push({
                path: '/container/knowledge-library-list/folder/create',
                query: {
                    defaultFolder: vm.currentTreeNode.oid,
                    componentRefresh: true
                }
            });
            // commonUtils.createFolder(vm);
        },
        // 右侧-编辑文件夹
        KNOWLEDGE_SUB_FOLDER_UPDATE: (vm, row) => {
            vm.$router.push({
                path: '/knowledge-library-list/folder/edit',
                query: {
                    defaultFolder: vm.currentTreeNode.oid,
                    containerRef: vm.folderListTreeRef.containerRef,
                    oid: row.oid
                }
            });
        },
        // 左侧-文件夹编辑
        KNOWLEDGE_TREE_SUB_FOLDER_UPDATE: (vm, row) => {
            vm.$router.push({
                path: '/knowledge-library-list/folder/edit',
                query: {
                    defaultFolder: vm.currentTreeNode.oid,
                    oid: row.oid
                }
            });
            // vm.isMove = false;
            // vm.currentType = 'edit';
            // vm.currentRow = row;
            // vm.folderVisible = true;
        },
        // 左侧-文档创建
        KNOWLEDGE_DOCUMENT_CREATE: (vm) => {
            vm.$router.push({
                path: '/container/knowledge-library-list/document/create',
                query: {
                    defaultFolder: vm.currentTreeNode.oid
                }
            });
            // let extendParams = {
            //     extendParams: { roleType: '' },
            //     defaultFolder: vm.currentTreeNode
            // };
            // const beforeSubmit = (data) => {
            //     data.attrRawList.push({
            //         attrName: 'containerRef',
            //         value: vm.containerRef
            //     });
            //     return data;
            // };
            // commonActions.openDocument(vm, { containerRef: vm.containerRef, extendParams, beforeSubmit });
        },
        KNOWLEDGE_TREE_SUB_FOLDER_PERMISSION: (vm, data) => {
            vm.isPermission = true;
            vm.currentRow = data;
        },
        // 右侧表格-行操作-文档-编辑
        KNOWLEDGE_DOCUMENT_UPDATE: (vm, row, isTable) => {
            const openEdit = (checkOid) => {
                const pathMap = {
                    knowledgeList: '/knowledge-library-list/document/edit',
                    myKnowledge: '/my-knowledge/document/edit'
                };
                vm.$router.push({
                    path: pathMap[vm.$route.meta.documentType],
                    query: {
                        oid: checkOid,
                        title: getI18n('edit') + (row.name || row['erd.cloud.cbb.doc.entity.EtDocument#name'])
                    }
                });
            };
            // 文档编辑需要先检出
            vm.$famHttp({
                url: '/document/common/checkout',
                method: 'GET',
                params: {
                    oid: row.oid
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
            // let extendParams = {
            //     openType: 'edit',
            //     oid: row.oid,
            //     extendParams: { roleType: '' },
            //     beforeCancel: vm.refresh
            // };
            // let containerRef = vm.containerRef;
            // commonActions.openDocument(vm, { containerRef, extendParams });
        },
        // 左侧-文件夹-移动
        KNOWLEDGE_TREE_SUB_FOLDER_MOVE: (vm, row) => {
            commonUtils.moveData(vm, row);
        },
        // 文件夹-删除
        KNOWLEDGE_TREE_SUB_FOLDER_DELETE: (vm, row) => {
            // 删除文件夹之后默认跳转到根节点
            const afterSubmit = vm.switchTreeNode;
            commonUtils.commonDocDelete(vm, { folderIds: [row.oid], afterSubmit });
        },
        // 右侧-文件夹-删除
        KNOWLEDGE_SUB_FOLDER_DELETE: (vm, row) => {
            commonUtils.commonDocDelete(vm, { folderIds: [row.oid] });
        },
        // 文档-删除
        KNOWLEDGE_DOCUMENT_DELETE: (vm, row, isTable) => {
            const afterSubmit = () => {
                if (!isTable)
                    vm.$router.push({
                        path: '/knowledge-library-list/knowledge/list'
                    });
            };
            commonUtils.commonDocDelete(vm, { docIds: [row.oid], afterSubmit });
        },
        // 右侧-文件夹-移动
        KNOWLEDGE_SUB_FOLDER_MOVE: (vm, data) => {
            commonUtils.moveData(vm, data);
        },
        KNOWLEDGE_DOCUMENT_MOVE: (vm, data, isTableList) => {
            let oid;
            if (isTableList) {
                oid =
                    vm.$route.meta.documentType === 'knowledgeList'
                        ? vm.folderListTreeRef?.currentFolder?.oid
                        : data.attrRawList.find(
                              (item) => item.attrName === 'erd.cloud.cbb.doc.entity.EtDocument#folderRef'
                          )?.value;
            } else oid = vm.$refs.detail?.[0].$refs.layoutForm.sourceData?.rawData?.folderRef?.value;
            let params = {
                oid, // 文件夹oid
                rowData: [data],
                containerRef: data.containerRef
            };
            actionsUtils.renderMoveDialog({ vm, params, contextTitle: getI18n('context') });
        },
        // 文档-下载
        KNOWLEDGE_DOCUMENT_DOWNLOAD: (vm, row) => {
            utils.downloadFile(row);
        },
        // 文档-设置状态
        KNOWLEDGE_DOCUMENT_SET_STATUS: (vm, row, isTable) => {
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
            let stateKey = isTable ? 'statusDisplayName' : 'lifecycleStatus.status';
            if (vm.$route.meta.documentType === 'myKnowledge' && isTable) {
                stateKey = 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status';
            }
            let extendParams = {
                stateKey,
                setStateFunc: setStateFunc,
                refreshOid: row.oid
            };
            commonActions.setStatus(vm, row, extendParams);
        },
        // 文档-预览
        KNOWLEDGE_DOCUMENT_PREVIEW: (vm, row) => {
            actionsUtils.renderFilePreview(row);
        },
        // 批量删除
        KNOWLEDGE_DELETE: (vm) => {
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
        // 批量发起流程
        DOCUMENT_START_PROCESS: (vm) => {
            let selectData = vm.folderListDetailRef.$refs['famAdvancedTable'].fnGetCurrentSelection();
            if (!selectData.length) {
                return vm.$message({ type: 'info', message: getI18n('pleaseSelectData') });
            }
            if (selectData.find((item) => item.idKey === vm.typeName)) {
                // 所选数据存在文件夹，无法发起流程
                return vm.$message({ type: 'info', message: vm.i18n.startProcessTips });
            }
            commonUtils.startProcess(
                vm,
                selectData.map((item) => {
                    item.documentType = vm.$route.meta.documentType;
                    return item;
                })
            );
        },
        // 【我的知识】-单个发起流程
        KNOWLEDGE_DOCUMENT_START_PROCESS: async (vm, row, tableName) => {
            const keyMap = {
                'lifecycleStatus.status': 'statusDisplayName',
                'typeReference': 'typeDisplayName',
                'createBy': 'createUser'
            };
            if (tableName === 'myKnowledgeTable') {
                Object.keys(row).forEach((key) => {
                    let newKey = key.split('#')?.[1] || key;
                    row[newKey] = row[key];
                    if (Object.keys(keyMap).includes(newKey)) {
                        row[keyMap[newKey]] = row[key];
                        if (newKey === 'createBy') {
                            row[keyMap[newKey]] = row.attrRawList.find((item) => item.attrName === key) || {};
                        }
                    }
                });
            } else {
                const sourceData = vm.$refs.detail?.[0]?.$refs.layoutForm.sourceData || {};
                Object.keys(row).forEach((key) => {
                    row[key.split('#')?.[1] || key] = row[key];
                    if (key === 'createBy') {
                        row[key] = row[key]?.[0]?.displayName;
                    }
                    if (Object.keys(keyMap).includes(key)) {
                        row[keyMap[key]] = sourceData.rawData?.[key]?.['displayName'] || row[key];
                        if (key === 'createBy') {
                            row[keyMap[key]] = sourceData.rawData?.[key].users?.[0] || row[key];
                        }
                    }
                });
            }
            row.documentType = vm.$route.meta.documentType;
            commonUtils.startProcess(vm, [row]);
        },
        // 知识库-团队-增加角色
        KNOWLEDGE_CONTAINERTEAM_ADDROLE: (vm) => {
            vm.onCreateRole();
        },
        // 知识库-团队- 移除角色
        KNOWLEDGE_CONTAINERTEAM_REMOVEROLE: (vm) => {
            vm.onRemove();
        },
        // 【我的知识】- 创建文档
        WORKBENCH_KNOWLEDGE_CREATE: (vm) => {
            vm.$router.push({
                path: '/container/my-knowledge/document/create'
            });
        },
        // 【我的知识】- 批量删除
        WORKBENCH_KNOWLEDGE_DELETE: (vm, data) => {
            if (!data.length) return vm.$message.info(getI18n('pleaseSelectData'));
            let docIds = data.map((item) => {
                return item.oid;
            });
            commonUtils.commonDocDelete(vm, { docIds });
        },
        // 【我的知识】- 批量发起流程
        WORKBENCH_KNOWLEDGE_START_PROCESS: (vm, data) => {
            if (!data.length) return vm.$message.info(getI18n('pleaseSelectData'));
            const documentType = vm.$route.meta.documentType;
            let businessData = data.map((item) => {
                Object.keys(item).forEach((key) => {
                    const keyMap = {
                        'lifecycleStatus.status': 'statusDisplayName',
                        'typeReference': 'typeDisplayName',
                        'createBy': 'createUser'
                    };
                    let noPrefixKey = key.split('#')?.[1];
                    item[noPrefixKey || key] = item[key];
                    if (noPrefixKey === 'icon') {
                        item[noPrefixKey] = ErdcKit.deserializeAttr(item.attrRawList)[key] || item[key];
                    }
                    if (Object.keys(keyMap).includes(noPrefixKey)) {
                        item[keyMap[noPrefixKey]] = item[key];
                        if (noPrefixKey === 'createBy') {
                            item[keyMap[noPrefixKey]] = item.attrRawList.find((item) => item.attrName === key) || {};
                        }
                    }
                });
                item.documentType = documentType;
                return item;
            });
            commonUtils.startProcess(vm, businessData);
        }
    };
    return actions;
});
