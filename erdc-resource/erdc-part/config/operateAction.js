define([
    ELMP.func('erdc-part/api.js'),
    ELMP.func('erdc-part/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/RefuseTips/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.func('erdc-document/components/DialogSave/index.js'),
    ELMP.func('erdc-baseline/baselineSdk.js'),
    ELMP.func('erdc-workspace/workspaceSdk.js'),
    ELMP.func('erdc-part/components/PartCreateViewVersion/index.js'),
    ELMP.resource('erdc-cbb-workflow/app/config/processConstant.js'),
    ELMP.func('erdc-part/locale/index.js')
], function (
    Api,
    viewConfig,
    RefuseTips,
    commonActions,
    DialogSave,
    baselineSdk,
    workspaceSdk,
    CreateViewVersionForm,
    processConstant,
    locale
) {
    const Vue = require('vue');
    const EventBus = require('EventBus');
    const ErdcStore = require('erdcloud.store');
    const ErdcHttp = require('erdcloud.http');
    const ErdcKit = require('erdc-kit');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    // 列表中创建变更
    function handleCreateChange(row, inTable, type) {
        commonActions.handleCreateChange(this, row, { inTable, type });
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
        Dialog.typeName = 'erd.cloud.pdm.part.entity.EtPart';

        const dialogIns = Dialog.$mount();
        document.body.appendChild(dialogIns.$el);

        return dialogIns;
    }

    function getSuccessCallBack(vm, row, inTable) {
        return function handleSuccess() {
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
                vm.refresh(row.oid);

                const { prefixRoute, resourceKey } = vm.$route?.meta || {};
                vm.$router.replace({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                    query: {
                        ..._.pick(vm.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid: row.oid
                    }
                });
                EventBus.emit('refresh:structure', row);
            }
        };
    }

    function createPart() {
        const { prefixRoute, resourceKey } = this.$route?.meta || {};
        this.$router.push({
            path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/create`,
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
        if (!row || (Array.isArray(row) && row.length === 0)) {
            return this.$message.warning(i18n?.selectTip);
        }

        commonActions.setState(
            row,
            viewConfig.partViewTableMap.className,
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

        commonActions.move(row, viewConfig.partViewTableMap.className, getSuccessCallBack(this, row, inTable, false), {
            inTable
        });
    }

    function handleDownload(row) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n?.selectTip);
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
        let lifecycleStatus = '';
        if (inTable) {
            const attrName = 'erd.cloud.pdm.part.entity.EtPart#lifecycleStatus.status';
            lifecycleStatus = row.attrRawList.find((item) => item.attrName === attrName);
        } else {
            lifecycleStatus = this.sourceData['lifecycleStatus.status'];
        }

        let oid = row.oid;
        if (lifecycleStatus && lifecycleStatus.value !== 'DRAFT') {
            try {
                const resp = await handleCheckout(row);
                if (resp) {
                    const rawData = resp.data.rawData;
                    oid = rawData.oid.value;
                }
            } catch (error) {
                this.$message.error(error.message);
            }
        }

        const { prefixRoute, resourceKey } = this.$route?.meta || {};
        if (inTable) {
            this.$router.push({
                path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/edit`,
                query: {
                    ..._.pick(this.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    oid,
                    originPath: 'part/edit',
                    origin: 'list'
                }
            });
        } else {
            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                this.$router.replace({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/edit`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid,
                        originPath: 'part/edit'
                    }
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
            className: viewConfig.partViewTableMap.className,
            title: i18n?.save,
            rowList: Array.isArray(row) ? row : [row],
            urlConfig: {
                save: '/part/common/checkin',
                source: '/part/content/attachment/replace'
            }
        };
        mountDialogSave(props, (data) => {
            if (inTable) {
                this.refresh();
            } else {
                this.refresh(data);
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
        let listRoutePath = `${this.$route?.meta?.prefixRoute}/part/list`;
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

        commonActions.rename(row, viewConfig.partViewTableMap.className, getSuccessCallBack(this, row, inTable, true));
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
            viewConfig.partViewTableMap.className,
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
            return this.$message.warning(i18n?.selectTip);
        }

        commonActions.changeOwner(
            row,
            viewConfig.partViewTableMap.className,
            getSuccessCallBack(this, row, inTable, false),
            { inTable }
        );
    }

    function handleBatchDownload(row) {
        let successCallback = () => {};
        commonActions.batchDownload(row, viewConfig.partViewTableMap.className, successCallback);
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

        commonActions.reversion(row, viewConfig.partViewTableMap.className, successCallback, { inTable });
    }

    // 检出
    function handleCheckout(row) {
        return ErdcHttp(Api.checkout, {
            method: 'GET',
            params: {
                oid: row.oid
            },
            className: row?.oid?.split(':')?.[1]
        });
    }

    function addToBaseLine(row) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n?.selectTip);
        }

        const data = Array.isArray(row) ? row : [row];
        baselineSdk.goBaselineAddPage(data);
    }
    // 添加至工作区
    function addToWorkspace(row) {
        if (Array.isArray(row) && row.length === 0) {
            return this.$message.warning(i18n?.selectTip);
        }

        const data = Array.isArray(row) ? row : [row];
        workspaceSdk.goWorkspaceAddPage(
            data,
            Object.assign(this.$route.query, { workspaceAddToType: 'addToPart', title: i18n?.addToWorkspace })
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

    // 创建版本视图
    function handleViewVersionCreate(row, inTable) {
        const containerOid = inTable ? row.containerRef : this.sourceData?.containerRef?.oid;
        commonActions.mountHandleDialog(CreateViewVersionForm, {
            prop: { oid: row.oid, containerOid, inTable },
            successCallback: (oid) => {
                if (inTable) {
                    this.refresh();
                } else {
                    const { prefixRoute, resourceKey } = this.$route?.meta || {};
                    this.$router.push({
                        path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid
                        }
                    });
                    let data = { oid };
                    EventBus.emit('refresh:structure', data);
                }
            }
        });
    }

    // 批量审批流程
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

    // bom发布流程
    function handleBomReleaseProcess(data, inTable) {
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

        // bom发布流程
        const BOM_RELEASE = processConstant('BOM_RELEASE');
        // 发起流程模板标识
        const engineModelKey = BOM_RELEASE.PROCESS_ID;
        // 发起流程评审对象数据
        const businessData = _.isArray(data) ? data : [data];
        // 评审对象缓存数据格式
        const reviewObject = { [`${BOM_RELEASE.PROCESS_ID}-${BOM_RELEASE.PROCESS_NODE.START}`]: businessData };
        this.$store.dispatch('cbbWorkflowStore/SET_REVIEW_OBJECT_ACTION', reviewObject).then(() => {
            const { oid: containerRef } =
                _.find(businessData[0]?.attrRawList, (item) => item?.attrName?.includes?.('containerRef')) || {};
            return this.$router.push({
                path: `/container/bpm-resource/workflowLauncher/${engineModelKey}`,
                query: {
                    containerRef,
                    parentPath: this.$route?.meta?.parentPath || '',
                    title: 'BOM发布流程',
                    redirect: this.$router.resolve({ name: 'processTodo' })?.route?.path || ''
                }
            });
        });
    }

    //比较相关信息
    function handleInfoCompare(row) {
        const { prefixRoute, resourceKey } = this.$route?.meta || {};
        const data = {
            props: viewConfig.partViewTableMap,
            routePath: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/infoCompare`
        };
        commonActions.handleInfoCompare(this, row, data);
    }

    // 导出
    function exportPart() {
        const vm = this;
        const className = viewConfig.partViewTableMap.className; // 对象className标识

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

    function fetchGetViewList() {
        return ErdcHttp({
            url: '/context/view/all',
            className: 'erd.cloud.pdm.part.view.entity.View'
        });
    }

    async function exportBom(data) {
        let params = {};

        const moduleName = arguments[3];
        const isBomView = moduleName === 'PART_BOM_VIEW_LIST_OPERATE';
        if (isBomView) {
            let selected = Array.isArray(data) ? data : [data];
            if (selected.length < 1) return this.$message.warning('请选择BOM视图');
            let resp = await fetchGetViewList();
            let viewOptions = resp.data || [];
            params = {
                oid: this.vm.containerOid,
                caption: this.vm.caption,
                vid: this.vm.sourceData?.vid?.value,
                masterOid: this.vm.sourceData?.masterRef?.value,
                views: selected.map((item) => {
                    // 匹配视图选项
                    let viewOid = item.attrRawList.find((item) => item.attrName.search('#viewRef') > -1)?.oid;
                    let viewData = viewOptions.find((view) => view.oid === viewOid);
                    return {
                        name: viewData.name,
                        oid: viewData.oid,
                        label: viewData.displayName
                    };
                })
            };
        } else {
            let rootData = this.rootData || {};
            if (_.isEmpty(rootData.viewRef)) return this.$message.warning('无BOM视图，无法导出');

            params = {
                oid: rootData.oid,
                caption: rootData.caption,
                vid: rootData.vid,
                masterOid: rootData.masterRef,
                views: [this.vm.currentView]
            };
        }
        let exportProps = {
            label: i18n?.['BOM结构'],
            className: 'erd.cloud.pdm.part.entity.EtPartUsageLink',
            ...params,
            displayName: params.caption?.replace(/\s/g, '') || 'BOM导出',
            baseColumnList: [
                {
                    displayName: '层级',
                    attrName: 'usageLevel'
                }
            ]
        };

        const dialogProps = {
            width: '1200px'
        };

        // 调用通用导入方法
        commonActions.export(this, { exportType: 'bomExport', exportProps, dialogProps });
    }

    // 导入
    function importPart() {
        let importTypeList = [
            {
                label: i18n?.['部件对象'],
                value: viewConfig.partViewTableMap.className,
                business: {
                    import: 'PartImport',
                    export: 'PartExportTemp'
                }
            },
            {
                label: i18n?.['BOM结构'],
                value: 'erd.cloud.pdm.part.entity.EtPartUsageLink',
                business: {
                    import: 'BomViewImport',
                    export: 'BomViewExportTemp'
                }
            },
            {
                label: i18n?.['CAD模型'],
                value: 'erd.cloud.pdm.epm.entity.EpmBuildRule',
                business: {
                    import: 'PartEpmBuildRuleImport'
                },
                templateData: function getTemplateData() {
                    ErdcKit.downFile({
                        url: '/context/container/getImportTemplate/PartEpmBuildRuleImport'
                    });
                },
                customParams: {
                    appName: ErdcStore.getters.appNameByClassName('erd.cloud.pdm.epm.entity.EpmBuildRule')
                }
            },
            {
                label: i18n?.['描述文档'],
                value: 'erd.cloud.pdm.part.entity.EtPartDescribeLink',
                business: {
                    import: 'PartDescribeLinkImport'
                },
                templateData: function getTemplateData() {
                    ErdcKit.downFile({
                        url: '/context/container/getImportTemplate/PartDescribeLinkImport'
                    });
                },
                customParams: {
                    appName: ErdcStore.getters.appNameByClassName('erd.cloud.pdm.part.entity.EtPartDescribeLink')
                }
            },
            {
                label: i18n?.['参考文档'],
                value: 'erd.cloud.pdm.part.entity.EtPartReferenceLink',
                business: {
                    import: 'PartReferenceLinkImport'
                },
                templateData: function getTemplateData() {
                    ErdcKit.downFile({
                        url: '/context/container/getImportTemplate/PartReferenceLinkImport'
                    });
                },
                customParams: {
                    appName: ErdcStore.getters.appNameByClassName('erd.cloud.pdm.part.entity.EtPartReferenceLink')
                }
            }
        ];

        let moduleName = arguments[3];
        if (moduleName === 'PDM_PART_STRUCT_OPERATE') {
            importTypeList = [
                {
                    label: i18n?.['BOM结构'],
                    value: 'erd.cloud.pdm.part.entity.EtPartUsageLink',
                    business: {
                        import: 'BomViewImport',
                        export: 'BomViewExportTemp'
                    }
                }
            ];
        }
        // 调用通用导入方法
        commonActions.import(this, { importTypeList });
    }

    function compareStruct(data) {
        let moduleName = arguments[3];
        let needBomView = ['PART_BOM_VIEW_LIST_OPERATE', 'PDM_PART_STRUCT_OPERATE'].includes(moduleName);

        // BOM 视图入口
        if (moduleName === 'PART_BOM_VIEW_LIST_OPERATE') {
            // oid, viewRef处理
            data = data.map((item) => ({
                oid: this.$route.query.oid,
                viewRef: item.attrRawList.find((item) => item.attrName.search('#viewRef') > -1)?.oid
            }));
        }

        let path = 'part/constructCompare';
        return commonActions.compareStruct(data, path, this, needBomView);
    }
    return {
        handleCreateChange,
        createPart,
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
        handleBatchDownload,
        handleDownload,
        addToBaseLine,
        addToWorkspace,
        handleBatchUpdateAttr,
        mountDialogSave,
        mountRefuseTip,
        handleViewVersionCreate,
        handleBatchApprovalProcess,
        handleBomReleaseProcess,
        exportPart,
        importPart,
        exportBom,
        handleInfoCompare,
        compareStruct
    };
});
