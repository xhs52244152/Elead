/* 
 codesign 本地服务配置,除codesign库外,工作区也要用到这个文件,所以建为全局可访问的文件
*/
define(['vue', ELMP.resource('erdc-pdm-components/CoDesignConfig/locale/index.js')], function (Vue, locale) {
    const _ = require('underscore');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    // codesign本地服务接口前缀
    const port = JSON.parse(localStorage.getItem('CoDesignInfo'))?.['uiport'] || 1459;
    const apiPrefix = `http://localhost:${port}`;
    // 判断codesign环境
    const isDesktop = Boolean(localStorage.getItem('isDesktop'));

    // codesign工作区配置
    const codesignWorkspaceViewTableMap = {
        rowActionName: 'PDM_WORKSPACE_OPERATE_MENU_CO'
    };
    const codesignWorkspaceRelationObjViewTableMap = {
        className: 'erd.cloud.pdm.workspace.entity.WorkspaceMember',
        toolBarActionName: 'PDM_WORKSPACE_BUSINESS_MENU_CO' // 表格工具栏操作名称。针对多条数据
    };
    const codesignWorkspaceRelationObjOper = {
        rowActionName: 'PDM_WORKSPACE_EPM_MENU'
    };
    const codesignActionNameMap = {
        PDM_WORKSPACE_EDIT_CO: '编辑',
        PDM_WORKSPACE_DELETE_CO: '删除',
        PDM_WORKSPACE_ACTIVATION_CO: '激活',
        PDM_WORKSPACE_CHECKIN_CO: '检入',
        PDM_WORKSPACE_CHECKOUT_CO: '检出',
        PDM_WORKSPACE_SYNCHRONOUS_DATA_CO: '同步PDM数据',
        PDM_WORKSPACE_UNCHECKOUT_CO: '取消检出',
        PDM_WORKSPACE_REMOVE_CO: '移除',
        PDM_WORKSPACE_ADD_PART_CO: '新增部件',
        PDM_WORKSPACE_ADD_EPM_CO: '新增模型',
        PDM_WORKSPACE_IMPORT_CO: '导入',
        PDM_WORKSPACE_REFRESH_CO: '更新已过期版本',
        PDM_WORKSPACE_EPM_OPEN: '打开',
        PDM_WORKSPACE_EPM_CHECKIN: '检入',
        PDM_WORKSPACE_EPM_CHECKOUT: '检出',
        PDM_WORKSPACE_EPM_UNCHECKOUT: '取消检出',
        PDM_WORKSPACE_EPM_SYNCHRONOUS_DATA: '同步PDM数据',
        PDM_WORKSPACE_EPM_REMOVE: '移除',
        PDM_WORKSPACE_EPM_MOVE: '移动'
    };
    const codesignActionValidate = [
        'PDM_WORKSPACE_ADD_PART_CO',
        'PDM_WORKSPACE_ADD_EPM_CO',
        'PDM_WORKSPACE_REFRESH_CO',
        'PDM_WORKSPACE_IMPORT_CO'
    ];
    const codesignActionMap = function () {
        const operateAction = arguments[0];
        return {
            PDM_WORKSPACE_ACTIVATION_CO: handleSetMainWorkspace,
            PDM_WORKSPACE_EDIT_CO: operateAction.editWorkspace,
            PDM_WORKSPACE_DELETE_CO: operateAction.handleDelete,
            PDM_WORKSPACE_CHECKIN_CO: handleCheckin,
            PDM_WORKSPACE_CHECKOUT_CO: operateAction.handleRelationObjCheckout,
            PDM_WORKSPACE_UNCHECKOUT_CO: operateAction.handleRelationObjUnCheckout,
            PDM_WORKSPACE_SYNCHRONOUS_DATA_CO: handleSynchroData,
            PDM_WORKSPACE_REMOVE_CO: handleRemove,
            PDM_WORKSPACE_ADD_PART_CO: operateAction.handleRelationObjAddPart,
            PDM_WORKSPACE_ADD_EPM_CO: operateAction.handleRelationObjAddEpm,
            PDM_WORKSPACE_IMPORT_CO: handleImport,
            PDM_WORKSPACE_REFRESH_CO: operateAction.handleRelationObjRefrsh,
            PDM_WORKSPACE_EPM_OPEN: handleOpenCadFile,
            PDM_WORKSPACE_EPM_CHECKIN: handleCheckin,
            PDM_WORKSPACE_EPM_CHECKOUT: operateAction.handleRelationObjCheckout,
            PDM_WORKSPACE_EPM_UNCHECKOUT: operateAction.handleRelationObjUnCheckout,
            PDM_WORKSPACE_EPM_SYNCHRONOUS_DATA: handleSynchroData,
            PDM_WORKSPACE_EPM_REMOVE: handleRemove,
            PDM_WORKSPACE_EPM_MOVE: handleMove
        };
    };
    const codesignregisterHandle = function (callback) {
        return {
            PDM_WORKSPACE_EDIT_CO: (vm, row, params) => {
                callback(vm, row, params, 'PDM_WORKSPACE_EDIT_CO');
            },
            // 行内删除
            PDM_WORKSPACE_DELETE_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_DELETE_CO');
            },
            // 设置 主工作区(激活)
            PDM_WORKSPACE_ACTIVATION_CO: (vm, row, params) => {
                callback(vm, row, params, 'PDM_WORKSPACE_ACTIVATION_CO');
            },
            // 检入
            PDM_WORKSPACE_CHECKIN_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_CHECKIN_CO');
            },
            // 检出
            PDM_WORKSPACE_CHECKOUT_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_CHECKOUT_CO');
            },
            // 取消检出
            PDM_WORKSPACE_UNCHECKOUT_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_UNCHECKOUT_CO');
            },
            // 同步PDM数据(相关对象)
            PDM_WORKSPACE_SYNCHRONOUS_DATA_CO: (vm, row, params) => {
                callback(vm, row, params, 'PDM_WORKSPACE_SYNCHRONOUS_DATA_CO');
            },
            // 从工作区移除对象
            PDM_WORKSPACE_REMOVE_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_REMOVE_CO');
            },
            // 新增部件
            PDM_WORKSPACE_ADD_PART_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_ADD_PART_CO');
            },
            // 新增模型
            PDM_WORKSPACE_ADD_EPM_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_ADD_EPM_CO');
            },
            // 导入（相关对象）
            PDM_WORKSPACE_IMPORT_CO: (vm, row, params) => {
                callback(vm, row, params, 'PDM_WORKSPACE_IMPORT_CO');
            },
            // 更新已过期版本
            PDM_WORKSPACE_REFRESH_CO(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_REFRESH_CO');
            },
            // 打开
            PDM_WORKSPACE_EPM_OPEN(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_OPEN');
            },
            // 捡入
            PDM_WORKSPACE_EPM_CHECKIN(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_CHECKIN');
            },
            // 检出
            PDM_WORKSPACE_EPM_CHECKOUT(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_CHECKOUT');
            },
            // 取消检出
            PDM_WORKSPACE_EPM_UNCHECKOUT(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_UNCHECKOUT');
            },
            // 同步pdm数据
            PDM_WORKSPACE_EPM_SYNCHRONOUS_DATA(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_SYNCHRONOUS_DATA');
            },
            // 移除
            PDM_WORKSPACE_EPM_REMOVE(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_REMOVE');
            },
            // 移动
            PDM_WORKSPACE_EPM_MOVE(vm, row, params) {
                callback(vm, row, params, 'PDM_WORKSPACE_EPM_MOVE');
            }
        };
    };
    /* 
    codesign
    */
    // 判断获取到的数据,返回统一的数据格式(数组)
    function unifiedReturnArray(data, valueName) {
        let oidList = [];
        if (Array.isArray(data)) {
            oidList = data.map((item) => item[valueName]);
        } else {
            oidList = [data?.[valueName]];
        }
        return oidList;
    }
    // 操作前的校验
    function verify(data) {
        // 统一下数据把,转化为数组来判断
        let newData = [];
        if (Object.prototype.toString.call(data) == '[object Object]') {
            newData = [data];
        } else {
            newData = data;
        }
        let isPass = true;
        if (
            newData.every((item) => item?.['relationOid'].split(':')[1] == 'erd.cloud.pdm.part.entity.EtPart') &&
            isDesktop
        ) {
            isPass = false;
            this.$message.info(i18n.verify);
        }
        return isPass;
    }
    function newFileVerify(data) {
        let newData = [];
        if (Object.prototype.toString.call(data) == '[object Object]') {
            newData = [data];
        } else {
            newData = data;
        }
        let isPass = true;
        if (newData.every((item) => item?.['fileStatus'] == 'NEW') && isDesktop) {
            isPass = false;
            this.$message.info(i18n.verify);
        }
        return isPass;
    }
    // 设置主工作区
    function handleSetMainWorkspace(row, inTable) {
        let typeOid = this?.sourceData?.containerRef?.oid || row?.containerRef;
        let displayName = row?.displayName || row?.name;
        const { oid } = row;
        this.$famHttp({
            url: '/fam/attr',
            method: 'GET',
            data: {
                oid: typeOid
            }
        }).then((resp) => {
            const { oid: pid } = resp.data.rawData.holderRef;
            let rawData = {
                displayName,
                oid, //'OR:erd.cloud.pdm.workspace.entity.EpmWorkspace:1778688437593776129',
                pid, //'OR:erd.cloud.pdm.core.container.entity.PdmProduct:1706181556704907266',
                typeOid //'OR:erd.cloud.foundation.core.container.entity.ScalableContainer:1706181557965774850'
            };
            // 设置为主工作区的接口
            this.$famHttp({
                url: `${apiPrefix}/api/setMainWorkspace`,
                method: 'POST',
                data: {
                    oid,
                    rawData
                }
            })
                .then((resp) => {
                    let { success } = resp;
                    if (success) {
                        this.$message.success(i18n.setMainWorkspaceSuccess);
                        if (inTable) {
                            this.$refs?.famViewTable?.refreshTable('default');
                            getMainWorkSpace.call(this);
                        } else {
                            this.refresh(oid);
                        }

                        this.tableLoading = false;
                        // 刷新列表
                    } else {
                        this.$message.success(i18n.setMainWorkspaceFailed);
                    }
                })
                .catch(() => {
                    this.tableLoading = false;
                });
        });
    }
    // 检入
    function handleCheckin(data) {
        let oidList = unifiedReturnArray(data, 'relationOid');
        const workspaceOid = this.oid;
        // 设置为主工作区的接口
        this.$famHttp({
            url: `${apiPrefix}/api/checkIn`,
            method: 'POST',
            data: {
                workspaceOid,
                oidList
            }
        }).then((resp) => {
            let { success } = resp;
            if (success) {
                this.$message.success(i18n.checkinSuccess);
                refreshData.call(this);
            } else {
                this.$message.success(i18n.checkinFail);
            }
        });
    }
    // 同步数据
    function handleSynchroData(data) {
        if (!verify.call(this, data)) {
            return;
        }
        let oidList = unifiedReturnArray(data, 'relationOid');
        const workspaceOid = this.oid;
        // 设置为主工作区的接口
        this.$famHttp({
            url: `${apiPrefix}/api/syncFromPDM`,
            method: 'POST',
            data: {
                workspaceOid,
                oidList
            }
        }).then((resp) => {
            let { success } = resp;
            if (success) {
                this.$message.success(i18n.synchronizedSuccess);
            } else {
                this.$message.success(i18n.synchronizedFailed);
            }
        });
    }
    // 删除
    function handleRemove(data) {
        let list = [];
        if (Array.isArray(data)) {
            list = data.map((item) => {
                return {
                    oid: item['relationOid'],
                    fileStatus: item.fileStatus
                };
            });
        } else {
            list = [
                {
                    oid: data?.['relationOid'],
                    fileStatus: data?.fileStatus
                }
            ];
        }
        const workspaceOid = this.oid;
        this.$confirm(i18n.deleteTip, i18n.delete, {
            confirmButtonText: i18n.confirm,
            cancelButtonText: i18n.cancel,
            type: 'warning'
        }).then(() => {
            // 如果有个filestatus是new就掉用本地接口，不然就调用原有接口加本地接口
            if (list.filter((item) => item.fileStatus == 'NEW').length > 0) {
                let oidList = list.filter((item) => item.fileStatus == 'NEW').map((v) => v.oid);
                removeFunction.call(
                    this,
                    {
                        url: `${apiPrefix}/api/removeFromWorkspace`,
                        data: {
                            workspaceOid,
                            oidList
                        },
                        method: 'POST'
                    },
                    workspaceOid,
                    oidList
                );
            }
            if (list.filter((item) => item.fileStatus != 'NEW').length > 0) {
                let oidList = list.filter((item) => item.fileStatus !== 'NEW').map((v) => v.oid);
                Promise.all([
                    removeFunction.call(this, {
                        url: '/fam/workspace/object/delete',
                        method: 'POST',
                        data: {
                            objOidList: oidList,
                            workspaceOid: this.oid
                        },
                        className: codesignWorkspaceRelationObjViewTableMap.className
                    }),
                    removeFunction.call(
                        this,
                        {
                            url: `${apiPrefix}/api/removeFromWorkspace`,
                            method: 'POST',
                            data: {
                                workspaceOid,
                                oidList
                            }
                        },
                        workspaceOid,
                        oidList
                    )
                ]);
            }
        });
    }
    function removeFunction(config) {
        return new Promise((resolve, reject) => {
            this.$famHttp(config)
                .then((resp) => {
                    let { success } = resp;
                    if (success) {
                        this.$message.success(i18n.deleteSuccess);
                        refreshData.call(this);
                        this.tableLoading = false;
                    } else {
                        this.$message.success(i18n.deleteFailed);
                    }
                    resolve(resp);
                })
                .catch((error) => {
                    this.tableLoading = false;
                    reject(error);
                });
        });
    }
    // 导入(工具端自己弹窗选择文件选择框)
    function handleImport() {
        const workspaceOid = this.oid;
        this.$famHttp({
            url: `${apiPrefix}/api/importToWorkspace`,
            data: {
                workspaceOid
            },
            method: 'POST'
        })
            .then((resp) => {
                let { success } = resp;
                if (success) {
                    this.$message.success(i18n.importSuccess);
                    refreshData.call(this);
                    this.tableLoading = false;
                } else {
                    this.$message.success(i18n.importFailed);
                }
            })
            .catch(() => {
                this.tableLoading = false;
            });
    }
    // 打开会判断cad版本，然后启动cad打开文件,前端只需调用接口告诉工具端,正在执行打开操作
    function handleOpenCadFile(row) {
        if (!verify.call(this, row)) {
            return;
        }
        const { relationOid: documentOid } = row;
        const workspaceOid = this.oid;
        // 设置为主工作区的接口
        this.$famHttp({
            url: `${apiPrefix}/api/openFile`,
            method: 'POST',
            data: {
                workspaceOid,
                documentOid
            }
        }).then((resp) => {
            let { success } = resp;
            if (success) {
                this.$message.success(i18n.openCadFileSuccess);
            } else {
                this.$message.success(i18n.openCadFileFailed);
            }
        });
    }
    // 移动
    function handleMove() {}
    // 获取对象列表数据
    function getCodesignWorkSpaceList() {
        return new Promise((resolve) => {
            if (isDesktop) {
                this.$famHttp({
                    url: `${apiPrefix}/api/getWorkspaceDataList`,
                    method: 'POST',
                    data: {
                        workspaceOid: this.oid
                    }
                }).then((resp) => {
                    resp.data.forEach((item) => {
                        item.attrRawList = [
                            {
                                label: 'erd.cloud.core.vc.ItemRevision#name',
                                attrName: 'erd.cloud.core.vc.ItemRevision#name',
                                value: item.fileName,
                                tooltip: item.fileName,
                                displayName: item.fileName,
                                visible: true
                            },
                            {
                                label: 'erd.cloud.core.vc.ItemRevision#identifierNo',
                                attrName: 'erd.cloud.core.vc.ItemRevision#identifierNo',
                                value: '--',
                                tooltip: '--',
                                displayName: '--',
                                visible: true
                            }
                        ];
                        item['relationOid'] = item.oid;
                    });
                    let list = [];
                    list = resp.data.filter((v) => _.isEmpty(v.rawData));
                    this.coDesignList = list;
                    resolve(list);
                });
            }
        });
    }
    // 文件状态
    function fileStatus(status) {
        let statusMap = {
            EDIT: i18n.edited,
            UNDOWNLOAD: i18n.unDownloaded,
            DOWNLOAD: i18n.downloaded,
            NEW: i18n.new
        };
        return statusMap[status];
    }
    function refreshData() {
        getCodesignWorkSpaceList.call(this).then(() => {
            this.$refs?.famViewTable?.refreshTable('default');
        });
    }
    // 获取主工作区
    function getMainWorkSpace() {
        if (!isDesktop) {
            return;
        }
        return new Promise((resolve, reject) => {
            this.$famHttp({
                url: `${apiPrefix}/api/getMainWorkspace`,
                method: 'GET'
            })
                .then((resp) => {
                    let { data } = resp;
                    this.mainWorkSpaceOid = data?.oid || '';
                    resolve(data);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
    const iterationInfoState = 'erd.cloud.core.vc.ItemRevision#iterationInfo.state';
    return {
        apiPrefix,
        isDesktop,
        codesignWorkspaceViewTableMap,
        codesignWorkspaceRelationObjOper,
        codesignWorkspaceRelationObjViewTableMap,
        codesignActionNameMap,
        codesignActionValidate,
        codesignActionMap,
        codesignregisterHandle,
        getCodesignWorkSpaceList,
        fileStatus,
        iterationInfoState,
        newFileVerify,
        refreshData,
        getMainWorkSpace
    };
});
