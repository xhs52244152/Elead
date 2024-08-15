define([
    ELMP.func('erdc-epm-document/api.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/RefuseTips/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.func('erdc-document/components/DialogSave/index.js'),
    ELMP.func('erdc-baseline/baselineSdk.js'),
    ELMP.func('erdc-workspace/workspaceSdk.js'),
    ELMP.func('erdc-epm-document/components/UpdateAssociation/index.js'),
    ELMP.resource('erdc-cbb-workflow/app/config/processConstant.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-epm-document/locale/index.js')
], function (
    Api,
    viewConfig,
    RefuseTips,
    commonActions,
    DialogSave,
    baselineSdk,
    workspaceSdk,
    UpdateAssociation,
    processConstant,
    cbbUtils,
    locale
) {
    const Vue = require('vue');
    const EventBus = require('EventBus');
    const ErdcKit = require('erdc-kit');
    const ErdcHttp = require('erdcloud.http');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    // 列表中创建变更
    function handleCreateChange(row, inTable, type, config) {
        commonActions.handleCreateChange(this, row, { inTable, type, config });
    }

    // 保存弹窗
    function mountDialogSave(props, successCallback) {
        commonActions.mountHandleDialog(DialogSave, {
            props,
            successCallback,
            urlConfig: () => void 0
        });
    }

    function mountRefuseTip() {
        const Dialog = new Vue(RefuseTips);
        Dialog.typeName = 'erd.cloud.pdm.epm.entity.EpmDocument';

        const dialogIns = Dialog.$mount();
        document.body.appendChild(dialogIns.$el);

        return dialogIns;
    }

    function latestVersion(oid) {
        return new Promise((resolve, reject) => {
            ErdcHttp({
                url: '/epm/common/to/latest',
                params: {
                    oid,
                    className: viewConfig.epmDocumentViewTableMap.className
                },
                method: 'GET'
            }).then((res) => {
                if (res.success) {
                    let data = res.data.rawData;
                    resolve(data['oid'].value || '');
                } else {
                    reject();
                }
            });
        });
    }

    // eslint-disable-next-line no-unused-vars
    function getSuccessCallBack(vm, row, inTable, toLatest) {
        return async function handleSuccess() {
            if (inTable) {
                // 获取通用页面注册的回调函数
                const $commonPageVm = vm?.$store?.getters?.['commonPageStore/getCommonPageObject'] || {};
                const callback = $commonPageVm?.[`${row?.oid}_detail`];

                // 执行列表刷新
                vm.refresh();

                // 执行通用页面刷新
                _.isFunction(callback) &&
                    callback((vm) => {
                        _.isFunction(vm?.componentRefresh) && vm.componentRefresh();
                    });
            } else if (!Array.isArray(row)) {
                let oid = row.oid;
                if (toLatest) {
                    oid = await latestVersion(oid);
                }
                vm.refresh(oid);
                vm.$router.replace({
                    path: `${vm.$router.currentRoute?.meta?.prefixRoute}/epmDocument/detail`,
                    query: {
                        ..._.pick(vm.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid
                    }
                });
                EventBus.emit('refresh:structure', row);
            }
        };
    }

    function createEpmDocument() {
        this.$router.push({
            path: `${this.$route?.meta?.prefixRoute}/epmDocument/create`,
            query: _.pick(this.$route.query, (value, key) => {
                return ['pid', 'typeOid'].includes(key) && value;
            })
        });
    }

    function handleSetStatus(row, inTable) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }

        commonActions.setState(
            row,
            viewConfig.epmDocumentViewTableMap.className,
            getSuccessCallBack(this, row, inTable, false)
        );
    }

    function handleMove(row, inTable) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }

        commonActions.move(
            row,
            viewConfig.epmDocumentViewTableMap.className,
            getSuccessCallBack(this, row, inTable, false),
            { inTable }
        );
    }

    function handleDownload(row) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.selectTip);
        }

        const data = row.length ? row : [row];
        const mainContent = data.map((item) => {
            const value = item.attrRawList.find(
                (attr) => attr.attrName === `${this.viewTableMapping.className}#mainContent`
            );
            return value;
        });
        if (mainContent.length) {
            // 批量需要遍历下载
            mainContent.forEach((item) => {
                if (item.value) {
                    ErdcKit.downFile({
                        url: Api.download,
                        method: 'GET',
                        className: this.viewTableMapping.className,
                        data: {
                            id: item.value
                        }
                    });
                }
            });
        }
    }

    // 编辑
    async function handleEdit(row, inTable) {
        // 文档非草稿时，需要先"检出"再编辑
        const query = {
            ..._.pick(this.$route.query, (value, key) => {
                return ['pid', 'typeOid'].includes(key) && value;
            }),
            oid: row.oid,
            originPath: 'epmDocumentEdit'
        };

        !inTable && (row = this?.objectSourceData || row);

        const lifecycleStatus = cbbUtils.getObjectProperties(row, 'lifecycleStatus.status');

        if (lifecycleStatus && lifecycleStatus?.value !== 'DRAFT') {
            query.oid = await cbbUtils.handleCheckOut({
                oid: query.oid,
                className: viewConfig.epmDocumentViewTableMap.className
            });
        }

        if (inTable) {
            query.origin = 'list';
            this.$router.push({
                path: `${this.$route?.meta?.prefixRoute}/epmDocument/edit`,
                query
            });
        } else {
            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                this.$router.replace({
                    path: `${this.$route?.meta?.prefixRoute}/epmDocument/edit`,
                    query
                });
            });
        }
    }

    // 撤销编辑
    function handleReEdit(row, inTable) {
        commonActions.handleReEdit(this, row, { inTable });
    }

    // 保存
    function handleSave(row, inTable) {
        const props = {
            visible: true,
            type: 'save',
            disabled: true,
            className: viewConfig.epmDocumentViewTableMap.className,
            title: i18n.save,
            rowList: Array.isArray(row) ? row : [row],
            urlConfig: {
                save: '/epm/common/checkin',
                source: '/epm/content/attachment/replace'
            }
        };
        mountDialogSave(props, (data) => {
            if (inTable) {
                this.refresh();
            } else {
                this.refresh(data);
                // this.$router.replace({
                //     name: `${this.$router.currentRoute?.meta?.parentPath}/epmDocumentDetail`,
                //     params: {
                //         oid: data
                //     }
                // });
                let newData = { oid: data };
                EventBus.emit('refresh:structure', newData);

                // 刷新历史记录
                this.$refs.historyRecord?.[0]?.refresh();
                // 刷新被使用
                this.$refs.used?.[0]?.refresh();
            }
        });
    }

    function handleDelete(row, inTable) {
        let listRoutePath = `${this.$route?.meta?.prefixRoute}/epmDocument/list`;
        commonActions.handleDelete(this, row, { inTable, listRoutePath });
    }

    // 重命名
    function handleRename(row, inTable) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }

        commonActions.rename(
            row,
            viewConfig.epmDocumentViewTableMap.className,
            getSuccessCallBack(this, row, inTable, true)
        );
    }

    // 另存为
    function handleSaveAs(row, inTable) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }

        commonActions.saveAs(
            row,
            viewConfig.epmDocumentViewTableMap.className,
            getSuccessCallBack(this, row, inTable, false),
            { inTable }
        );
    }

    // 更改所有者
    function handleModifyOwner(row, inTable) {
        if (!inTable) {
            row = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.selectTip);
        }

        commonActions.changeOwner(
            row,
            viewConfig.epmDocumentViewTableMap.className,
            getSuccessCallBack(this, row, inTable, false),
            { inTable }
        );
    }
    function handleBatchDownload(row) {
        let successCallback = () => {};
        commonActions.batchDownload(row, viewConfig.epmDocumentViewTableMap.className, successCallback);
    }
    // 修订
    function handleReversion(row, inTable) {
        let successCallback = (data) => {
            if (inTable) {
                this.refresh();
            } else if (Array.isArray(data) && data.length === 1) {
                const row = { oid: data[0] };
                this.refresh(row.oid);
                EventBus.emit('refresh:structure', row);
            }
        };

        commonActions.reversion(row, viewConfig.epmDocumentViewTableMap.className, successCallback, { inTable });
    }

    function addToBaseLine(row) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.selectTip);
        }

        const data = Array.isArray(row) ? row : [row];
        baselineSdk.goBaselineAddPage(data);
    }
    // 添加至工作区
    function addToWorkspace(row) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n.selectTip);
        }

        const data = Array.isArray(row) ? row : [row];
        workspaceSdk.goWorkspaceAddPage(
            data,
            Object.assign(this.$route.query, {
                workspaceAddToType: 'addToEpmDocument',
                title: i18n.addToWorkspace
            })
        );
    }
    // 在工作区编辑
    function editInWorkspaceUpdate(row) {
        const data = Array.isArray(row) ? row : [row];
        workspaceSdk.goWorkspaceAddPage(
            data,
            Object.assign(this.$route.query, {
                workspaceAddToType: 'editInEpmDocument',
                title: i18n.editInWorkspace
            })
        );
    }

    // 批量编辑属性
    function handleBatchUpdateAttr(row) {
        !_.isArray(row) && (row = [row]);
        if (!_.isArray(row) || (_.isArray(row) && !row.length)) {
            return this.$message.warning('请先勾选数据');
        }
        this.setValue.tableData = ErdcKit.deepClone(row);
        this.setValue.visible = true;
    }

    function mountTemplateDialog(props, scope) {
        commonActions.mountHandleDialog(
            ErdcKit.asyncComponent(ELMP.func('erdc-epm-document/components/EpmDocumentTemplateForm/index.js')),
            {
                props: {
                    ...props,
                    visible: true
                },
                successCallback(vm) {
                    if (props?.oid) {
                        const params = {
                            oid: props?.oid || '',
                            note: vm?.note || '',
                            className: viewConfig.epmDocumentViewTableMap.className
                        };
                        cbbUtils.handleCheckIn(params);
                    }
                    scope.$refs.famAdvancedTable.fnRefreshTable();
                    this.$destroy();
                    if (this.$el.parentNode) {
                        this.$el.parentNode.removeChild(this.$el);
                    }
                },
                close() {
                    this.$destroy();
                    if (this.$el.parentNode) {
                        this.$el.parentNode.removeChild(this.$el);
                    }
                    // 如果处于编辑场景，关闭弹框要刷新当前表格页，获取行数据检出后的最新数据
                    if (props?.oid && !props?.readonly) {
                        const pagination = {};
                        pagination.pageIndex = scope.$refs.famAdvancedTable?.pagination?.pageIndex || 1;
                        scope.$refs.famAdvancedTable.fnRefreshTable('', pagination);
                    }
                }
            }
        );
    }

    // 创建模型模板
    function createEpmDocumentTemplate() {
        const props = {
            className: viewConfig.epmDocumentViewTableMap.className,
            title: i18n.createTemplate
        };
        mountTemplateDialog(props, this);
    }

    // 编辑模型模板
    async function editEpmDocumentTemplate(row) {
        const props = {
            oid: row.oid,
            className: viewConfig.epmDocumentViewTableMap.className,
            title: i18n.editTemplate
        };
        const iterationInfoState = cbbUtils.getObjectProperties(row, 'iterationInfo.state');
        if (iterationInfoState?.value === 'CHECKED_IN') {
            props.oid = await cbbUtils.handleCheckOut(_.omit(props, 'title'));
        }
        mountTemplateDialog(props, this);
    }

    // 查看模型模板
    function viewEpmDocumentTemplate(row) {
        const props = {
            readonly: true,
            oid: row?.oid,
            className: viewConfig.epmDocumentViewTableMap.className,
            title: i18n.viewTemplate
        };
        mountTemplateDialog(props, this);
    }

    // 删除模型模板
    function deleteEpmDocumentTemplate(row) {
        const data = {
            category: 'DELETE',
            oidList: [row.masterRef],
            className: viewConfig.epmDocumentViewTableMap.masterClassName
        };
        this.$confirm(i18n.confirmDelete, i18n.tips, {
            confirmButtonText: i18n.confirm,
            cancelButtonText: i18n.cancel,
            type: 'warning'
        }).then(() => {
            this.$famHttp({ url: '/fam/deleteByIds', data, method: 'DELETE' })
                .then(() => {
                    this.$message({
                        type: 'success',
                        message: i18n.deleteSuccess,
                        showClose: true
                    });
                    this.$refs.famAdvancedTable.fnRefreshTable();
                })
                .catch(() => {});
        });
    }

    //比较相关信息
    function handleInfoCompare(row) {
        const data = {
            props: viewConfig.epmDocumentViewTableMap,
            routePath: `${this.$route?.meta?.prefixRoute}/epmDocument/infoCompare`
        };
        commonActions.handleInfoCompare(this, row, data);
    }

    function mountAssociationDialog(props, successCallback) {
        commonActions.mountHandleDialog(UpdateAssociation, { props, successCallback, urlConfig: () => void 0 });
    }

    function handleUpdateAssociation(row, inTable) {
        const props = {
            rowData: row,
            inTable
        };
        mountAssociationDialog(props, () => {
            this.$message.success(i18n?.['关联成功']);
            if (inTable) {
                this.refresh();
            } else {
                this.$emit('component-refresh');
                let data = { oid: row.oid };
                EventBus.emit('refresh:structure', data);
            }
        });
    }

    // 模型批量审批流程
    function handleBatchApprovalProcess(data, inTable) {
        // inTable 列表页和对象详情页

        // 对象详情启动流程要组装数据
        if (!inTable) {
            data = {
                ...this.objectSourceData,
                attrRawList: _.map(this.objectSourceData?.rawData, (value) => {
                    return { ...value };
                }),
                ..._.reduce(
                    this.objectSourceData?.rawData,
                    (prev, next) => {
                        return {
                            ...prev,
                            [next.attrName]: next.displayName,
                            [`${this.className}#${next.attrName}`]: next.displayName
                        };
                    },
                    {}
                )
            };
        }

        // 批量审批流程
        const BATCH_APPROVAL = processConstant('BATCH_APPROVAL');
        // 发起流程模板标识
        const engineModelKey = BATCH_APPROVAL.PROCESS_ID;
        // 发起流程评审对象数据
        const businessData = _.isArray(data) ? data : [data];
        // 评审对象缓存数据格式
        const reviewObject = { [`${BATCH_APPROVAL.PROCESS_ID}-${BATCH_APPROVAL.PROCESS_NODE.START}`]: businessData };

        this.$store.dispatch('cbbWorkflowStore/SET_REVIEW_OBJECT_ACTION', reviewObject).then(() => {
            const { oid: containerRef } =
                _.find(businessData[0]?.attrRawList, (item) => item?.attrName?.includes?.('containerRef')) || {};
            return this.$router.push({
                path: `/container/bpm-resource/workflowLauncher/${engineModelKey}`,
                query: {
                    containerRef,
                    parentPath: this.$route?.meta?.parentPath || '',
                    title: '批量审批流程'
                }
            });
        });
    }

    // 导出
    function exportEpmDocument() {
        const vm = this;
        const className = viewConfig.epmDocumentViewTableMap.className; // 对象className标识

        const tableInstance = vm.$refs?.famViewTable || {};

        let selection = tableInstance.getTableInstance('advancedTable', 'selection');
        let requestData = tableInstance.getTableInstance('advancedTable', 'requestConfig')?.data;
        let columns = tableInstance.getTableInstance('advancedTable', 'instance')?.columns;

        // 调用通用导出方法
        commonActions.export(vm, {
            exportType: 'viewExport',
            exportProps: { className, selection, requestData, columns }
        });
    }

    // 导入
    function importEpmDocument() {
        const importTypeList = [
            {
                label: i18n?.['模型对象'],
                value: viewConfig.epmDocumentViewTableMap.className,
                business: {
                    import: 'EpmImport',
                    export: 'EpmExportTemp'
                }
            }
            // {
            //     label: i18n?.['模型结构'],
            //     value: 'erd.cloud.pdm.epm.entity.EpmMemberLink',
            //     business: ''
            // }
        ];
        // 调用通用导入方法
        commonActions.import(this, { importTypeList });
    }

    function compareStruct(data) {
        let path = 'epmDocument/constructCompare';
        return commonActions.compareStruct(data, path, this);
    }

    return {
        handleCreateChange,
        createEpmDocument,
        handleEdit,
        handleReEdit,
        handleSave,
        handleDelete,
        handleReversion,
        handleSetStatus,
        handleSaveAs,
        handleMove,
        handleRename,
        handleModifyOwner,
        handleDownload,
        addToBaseLine,
        addToWorkspace,
        editInWorkspaceUpdate,
        handleBatchUpdateAttr,
        mountDialogSave,
        mountRefuseTip,
        createEpmDocumentTemplate,
        editEpmDocumentTemplate,
        deleteEpmDocumentTemplate,
        viewEpmDocumentTemplate,
        handleInfoCompare,
        handleUpdateAssociation,
        handleBatchApprovalProcess,
        exportEpmDocument,
        importEpmDocument,
        compareStruct,
        handleBatchDownload
    };
});
