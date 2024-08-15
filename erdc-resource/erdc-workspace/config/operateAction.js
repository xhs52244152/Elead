define([
    ELMP.func('erdc-workspace/api.js'),
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.func('erdc-workspace/components/WorkspaceForm/index.js'),
    ELMP.resource('erdc-cbb-components/RefuseTips/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.func('erdc-document/components/DialogSave/index.js'),
    ELMP.func('erdc-workspace/locale/index.js'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js')
], function (Api, viewConfig, WorkspaceForm, RefuseTips, commonActions, DialogSave, locale, coDesignConfig) {
    const Vue = require('vue');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);
    const { isDesktop, newFileVerify, refreshData } = coDesignConfig;

    // 相关对象 检入保存弹窗
    function mountDialogSave(props, customSubmit) {
        commonActions.mountHandleDialog(DialogSave, { props: { ...props, customSubmit }, urlConfig: () => void 0 });
    }

    function mountRefuseTip() {
        const Dialog = new Vue(RefuseTips);
        Dialog.typeName = 'erd.cloud.core.vc.ItemRevision';

        const dialogIns = Dialog.$mount();
        document.body.appendChild(dialogIns.$el);

        return dialogIns;
    }

    function handleDelete(data, inTable) {
        let listRoutePath = `${this.$route?.meta?.prefixRoute}/workspace/list`;
        // 分组情况下，过滤分组行的数据
        let rowList = _.isArray(data) ? data : [data];
        data = _.filter(rowList, (item) => !item?.isGroupRow);
        commonActions.normalDelete(this, data, {
            inTable,
            listRoutePath,
            confirmConfig: {
                message: i18n.deleteTip2,
                title: i18n.tips,
                options: {
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel,
                    customClass: 'confirm-message-tips',
                    type: 'warning'
                }
            }
        });
    }

    function mountTemplateDialog(props, self, type) {
        commonActions.mountHandleDialog(WorkspaceForm, {
            props: { ...props, containerOid: self?.containerRef },
            urlConfig: () => void 0,
            successCallback: async (data) => {
                self?.$message({
                    message: i18n.createSuccess,
                    type: 'success'
                });
                if (type === 'addTo') {
                    await self?.handleWorkspaceSearch();
                    self?.setWorkspaceForm(data);
                } else {
                    self?.$refs?.famViewTable?.refreshTable('default');
                }
            }
        });
    }

    // 创建工作区
    function createWorkspace(type) {
        const props = {
            dialogTitle: i18n.createWorkspace
        };
        mountTemplateDialog(props, this, type);
    }

    // 编辑
    function editWorkspace(row, inTable) {
        const { prefixRoute, resourceKey } = this.$route?.meta || {};
        if (inTable) {
            this.$router.push({
                path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/edit`,
                query: {
                    ..._.pick(this.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    oid: row.oid,
                    originPath: 'workspace/edit'
                }
            });
        } else {
            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                this.$router.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-workspace/workspace/edit`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: row.oid,
                        originPath: 'workspace/edit'
                    }
                });
            });
        }
    }

    function handleWorkspaceObject(config, self, callback) {
        self.$famHttp(config)
            .then(() => {
                if (callback) {
                    callback();
                } else {
                    self.$message({
                        message: i18n.updateSuccess,
                        type: 'success',
                        showClose: true
                    });
                    self.$refs?.famViewTable?.refreshTable('default');
                }
                self.tableLoading = false;
            })
            .catch(() => {
                if (callback) {
                    callback();
                }
                self.tableLoading = false;
            });
    }
    // 相关对象 检入
    function handleRelationObjCheckin(data) {
        let self = this;
        const props = {
            visible: true,
            type: 'save',
            title: i18n.save,
            disabled: true
        };
        let customSubmit = function (Vue) {
            Vue.loading = true;
            let config = {
                url: Api.objectBatchCheckin,
                method: 'get',
                data: {
                    note: Vue.note || '',
                    objOids: data.map((item) => item.relationOid).join(','),
                    workspaceOid: self.oid
                },
                className: viewConfig.workspaceRelationObjViewTableMap.className
            };
            self.$famHttp(config).then(() => {
                self.$message({
                    message: i18n.updateSuccess,
                    type: 'success',
                    showClose: true
                });
                Vue.toggleShow();
                Vue.loading = false;
                self.$refs?.famViewTable?.refreshTable('default');
            });
        };
        mountDialogSave(props, customSubmit);
    }
    // 相关对象 检出
    function handleRelationObjCheckout(data) {
        if (!newFileVerify.call(this, data)) {
            return;
        }
        let objOids = '';
        if (Array.isArray(data)) {
            let filterData = [];
            if (data.filter((item) => item['fileStatus'] == 'NEW').length > 0 && isDesktop) {
                filterData = data.filter((item) => item['fileStatus'] != 'NEW');
            } else {
                filterData = data;
            }
            objOids = filterData.map((item) => item.relationOid).join(',');
        } else {
            objOids = data?.relationOid;
        }
        this.tableLoading = true;
        handleWorkspaceObject(
            {
                url: Api.objectBatchCheckout,
                method: 'get',
                data: {
                    objOids,
                    workspaceOid: this.oid
                },
                className: viewConfig.workspaceRelationObjViewTableMap.className
            },
            this,
            // codesign刷新
            isDesktop
                ? () => {
                      refreshData.call(this);
                  }
                : null
        );
    }
    //相关对象 取消检出
    function handleRelationObjUnCheckout(data) {
        if (!newFileVerify.call(this, data)) {
            return;
        }
        let objOidList = [];
        if (Array.isArray(data)) {
            let filterData = [];
            if (data.filter((item) => item['fileStatus'] == 'NEW').length > 0 && isDesktop) {
                filterData = data.filter((item) => item['fileStatus'] != 'NEW');
            } else {
                filterData = data;
            }
            objOidList = filterData.map((item) => item.relationOid);
        } else {
            objOidList = [data?.relationOid];
        }
        this.tableLoading = true;
        handleWorkspaceObject(
            {
                url: Api.objectBatchUndoCheckout,
                method: 'post',
                data: {
                    objOidList,
                    workspaceOid: this.oid
                },
                className: viewConfig.workspaceRelationObjViewTableMap.className
            },
            this,
            // codesign刷新
            isDesktop
                ? () => {
                      refreshData.call(this);
                  }
                : null
        );
    }
    //从工作区移除对象
    function handleRelationObjRemove(data) {
        this.tableLoading = true;
        handleWorkspaceObject(
            {
                url: Api.objectDelete,
                method: 'post',
                data: {
                    objOidList: data.map((item) => item.relationOid),
                    workspaceOid: this.oid
                },
                className: viewConfig.workspaceRelationObjViewTableMap.className
            },
            this
        );
    }
    //相关对象 新增部件
    function handleRelationObjAddPart() {
        const { prefixRoute, resourceKey } = this.$route?.meta || {};
        let sourceData = this.sourceData || this.vm?.sourceData;
        this.$router.push({
            path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/create`,
            query: {
                ..._.pick(this.$route.query, (value, key) => {
                    return ['pid', 'typeOid'].includes(key) && value;
                }),
                workspaceOid: this.$route.query.oid,
                workspaceContainerRefOid: sourceData?.containerRef?.oid || ''
            }
        });
    }
    //相关对象 新增模型
    function handleRelationObjAddEpm() {
        const { prefixRoute, resourceKey } = this.$route?.meta || {};
        let sourceData = this.sourceData || this.vm?.sourceData;
        this.$router.push({
            path: `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/create`,
            query: {
                ..._.pick(this.$route.query, (value, key) => {
                    return ['pid', 'typeOid'].includes(key) && value;
                }),
                workspaceOid: this.$route.query.oid,
                workspaceContainerRefOid: sourceData?.containerRef?.oid || ''
            }
        });
    }
    //更新已过期版本
    function handleRelationObjRefrsh(data, flag, callback) {
        this.tableLoading = true;
        handleWorkspaceObject(
            {
                url: Api.objectUpdate,
                method: 'post',
                data: {
                    objectOids: data.map((item) => item.relationOid),
                    workspaceOid: this.oid
                },
                className: viewConfig.workspaceRelationObjViewTableMap.className
            },
            this,
            // codesign刷新
            isDesktop
                ? () => {
                      refreshData.call(this);
                  }
                : callback
        );
    }

    return {
        createWorkspace,
        editWorkspace,
        handleDelete,
        mountRefuseTip,
        handleRelationObjCheckin,
        handleRelationObjCheckout,
        handleRelationObjUnCheckout,
        handleRelationObjRemove,
        handleRelationObjAddPart,
        handleRelationObjAddEpm,
        handleRelationObjRefrsh
    };
});
