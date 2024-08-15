define([
    ELMP.func('erdc-document/api.js'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.func('erdc-document/components/DialogSave/index.js'),
    ELMP.resource('erdc-cbb-components/RefuseTips/index.js'),
    ELMP.func('erdc-document/components/DocumentTemplateForm/index.js'),
    ELMP.func('erdc-baseline/baselineSdk.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    ELMP.resource('erdc-cbb-workflow/app/config/processConstant.js'),
    ELMP.func('erdc-document/locale/index.js')
], function (
    Api,
    viewConfig,
    DialogSave,
    RefuseTips,
    DocumentTemplateForm,
    baselineSdk,
    cbbUtils,
    commonActions,
    processConstant,
    locale
) {
    const ErdcKit = require('erdc-kit');
    const Vue = require('vue');
    const EventBus = require('EventBus');
    const ErdcHttp = require('erdcloud.http');
    const ErdcRouter = require('erdcloud.router');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(locale);

    // 列表中创建变更
    // eslint-disable-next-line no-unused-vars
    function handleCreateChange(row, inTable, type, config) {
        commonActions.handleCreateChange(this, row, { inTable, type, config });
    }

    // eslint-disable-next-line no-unused-vars
    function getSuccessCallBack(vm, row, inTable, props) {
        const route = ErdcRouter?.app?.$route;
        return function handleSuccess(oid) {
            if (inTable) {
                // 获取通用页面注册的回调函数
                const $commonPageVm = vm?.$store?.getters?.['commonPageStore/getCommonPageObject'] || {};
                const callback = $commonPageVm?.[`${row?.oid}_detail`];

                //文档模板刷新
                if (route.name.search('objectTemplateManagement') > -1) {
                    vm?.$refs['famAdvancedTable']?.fnRefreshTable();
                } else {
                    // 执行列表刷新
                    vm.refresh();
                }

                // 执行通用页面刷新
                _.isFunction(callback) &&
                    callback((vm) => {
                        _.isFunction(vm?.componentRefresh) && vm.componentRefresh();
                    });
            } else if (!Array.isArray(row)) {
                if (props?.type === 'sourceContent') {
                    return vm.refresh(oid);
                }
                //文档模板刷新
                if (route.name.search('objectTemplateManagement') > -1) {
                    vm?.$refs['famAdvancedTable']?.fnRefreshTable();
                } else {
                    vm.refresh(row.oid);
                    EventBus.emit('refresh:structure', row);
                }
            }
        };
    }

    // 保存弹窗
    function mountDialogSave(props, successCallback) {
        commonActions.mountHandleDialog(DialogSave, { props, successCallback, urlConfig: () => void 0 });
    }
    // 创建模板
    function mountTemplateDialog(props, scope) {
        commonActions.mountHandleDialog(DocumentTemplateForm, {
            props,
            successCallback: () => scope?.$refs?.famAdvancedTable?.fnRefreshTable(),
            urlConfig: {}
        });
    }
    function mountRefuseTip() {
        const Dialog = new Vue(RefuseTips);

        const dialogIns = Dialog.$mount();
        document.body.appendChild(dialogIns.$el);

        return dialogIns;
    }

    // 创建文档模板
    // eslint-disable-next-line no-unused-vars
    function handleCreateTemplate(row) {
        const props = {
            dialogTitle: i18n.createTemplate
        };
        mountTemplateDialog(props, this);
    }
    // 编辑文档模板
    async function handleEditTemplate(row) {
        let oid = row.oid;
        try {
            const resp = await handleCheckout(row);
            if (resp) {
                const rawData = resp.data.rawData;
                oid = rawData.oid.value;
            }
        } catch (error) {
            this.$message.error(error.message);
        }

        const props = {
            oid,
            dialogTitle: i18n.editTemplate
        };
        mountTemplateDialog(props, this);
    }
    // 创建
    // eslint-disable-next-line no-unused-vars
    function handleCreate(row) {
        const route = ErdcRouter?.app?.$route;
        const { prefixRoute, resourceKey } = route?.meta || {};
        ErdcRouter.push({
            path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/create`,
            query: _.pick(route.query, (value, key) => {
                return ['pid', 'typeOid'].includes(key) && value;
            })
        });
    }

    // 编辑
    async function handleEdit(row, inTable) {
        // 文档非草稿时，需要先"检出"再编辑
        let lifecycleStatus = {};
        let isTemplate = false;
        let oid = row.oid;
        //取检出状态，检出过不用再检出
        let iterationInfoState = {};
        let prefixAttrName = inTable ? 'erd.cloud.cbb.doc.entity.EtDocument#' : '';
        //行编辑
        if (inTable) {
            iterationInfoState = row?.attrRawList?.find((i) => i.attrName == `${prefixAttrName}iterationInfo.state`);
            lifecycleStatus = row?.attrRawList?.find(
                (item) => item.attrName === `${prefixAttrName}lifecycleStatus.status`
            );
            isTemplate = row?.attrRawList?.find(
                (item) => item.attrName === `${prefixAttrName}templateInfo.tmplTemplated`
            )?.value;
        } else {
            //详情
            iterationInfoState = this.sourceData?.['iterationInfo.state'] || {};
            lifecycleStatus = this.sourceData?.['lifecycleStatus.status'] || {};
            isTemplate = this.sourceData?.['templateInfo.tmplTemplated']?.value;
        }
        //非草稿 && 检入状态再检出
        if (
            lifecycleStatus &&
            lifecycleStatus.value !== 'DRAFT' &&
            iterationInfoState &&
            iterationInfoState.value == 'CHECKED_IN'
        ) {
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
            ErdcRouter.push({
                path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/edit`,
                query: {
                    ..._.pick(this.$route.query, (value, key) => {
                        return ['pid', 'typeOid'].includes(key) && value;
                    }),
                    oid,
                    isTemplate
                }
            });
        } else {
            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                ErdcRouter.push({
                    path: `${prefixRoute.split(resourceKey)[0]}erdc-document/document/edit`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        oid,
                        isTemplate
                    }
                });
            });
        }
    }

    // 撤销编辑
    function handleCancelEdit(row, inTable) {
        const h = this.$createElement;
        this.$confirm('', i18n.tips, {
            message: h('div', null, [
                h('div', { class: 'mb-normal', style: 'display: flex;align-item: center;' }, [
                    h('i', { class: 'el-icon-warning', style: 'color:#e6a23c;font-size:24px;' }),
                    h(
                        'span',
                        {
                            style: 'margin-left:8px;font-size:16px;line-height:24px;font-weight:700;'
                        },
                        i18n.isCancelEdit
                    )
                ]),
                h(
                    'p',
                    { style: 'margin-left: 30px;font-weight: normal;font-size: 12px;line-height:18px' },
                    i18n.cancelEdit
                )
            ]),
            customClass: 'cancelEdit',
            confirmButtonText: i18n.confirm,
            cancelButtonText: i18n.cancel
        }).then(() => {
            ErdcHttp({
                url: Api.reCheckout,
                className: viewConfig.docViewTableMap.className,
                data: {
                    oid: row.oid
                },
                method: 'GET'
            }).then((res) => {
                if (inTable) {
                    this.refresh();
                } else if (res.data) {
                    this?.refresh(res.data);
                    // this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                    //     this.$router.replace({
                    //         name: this.$route?.name,
                    //         params: {
                    //             oid: res.data,
                    //             // 跳转详情后要进到那个tab页
                    //             activeName: this.activeName,
                    //             componentRefresh: true
                    //         }
                    //     });
                    // });
                    let data = { oid: res.data };
                    EventBus.emit('refresh:structure', data);
                }
            });
        });
    }

    // 保存
    function handleSave(row, inTable) {
        const props = {
            visible: true,
            disabled: true,
            type: 'save',
            className: viewConfig.docViewTableMap.className,
            title: i18n.save,
            rowList: Array.isArray(row) ? row : [row]
        };
        mountDialogSave(props, (oid) => {
            if (inTable) {
                this.refresh();
            } else {
                let newData = { oid };
                EventBus.emit('refresh:structure', newData);
                this.refresh(oid);

                // 刷新历史记录
                this.$refs.historyRecord?.[0]?.refresh();
                // 刷新被使用
                this.$refs.used?.[0]?.refresh();
            }
        });
    }

    // 替换内容源
    function handleReplaceContent(row, inTable) {
        const props = {
            visible: true,
            inTable,
            type: 'sourceContent',
            className: viewConfig.docViewTableMap.className,
            title: i18n.replace,
            rowList: Array.isArray(row) ? row : [row],
            vm: this
        };
        mountDialogSave(props, getSuccessCallBack(this, row, inTable, props));
    }

    // 批量删除
    function handleDelete(row, inTable) {
        let listRoutePath = `${this.$route?.meta?.prefixRoute}/document/list`;
        commonActions.handleDelete(this, row, { inTable, listRoutePath });
    }

    // 修订
    function handleReversion(row, inTable) {
        let successCallback = (oids) => {
            if (inTable) {
                this.refresh();
            } else if (Array.isArray(oids) && oids.length === 1) {
                this.refresh(oids[0]);
            }
        };

        commonActions.reversion(row, viewConfig.docViewTableMap.className, successCallback, { inTable });
    }

    // 重命名
    function handleRename(row, inTable) {
        const route = ErdcRouter?.app?.$route;
        if (route.name.search('objectTemplateManagement') > -1) {
            row = _.isArray(row) ? row : [row];
            row = _.map(row, (item) => {
                return {
                    ...item,
                    ..._.reduce(
                        item?.attrRawList,
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
            });
        } else if (!inTable) {
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
            return this.$message.warning('请选择数据！');
        }

        commonActions.rename(row, viewConfig.docViewTableMap.className, getSuccessCallBack(this, row, inTable, true));
    }

    // 设置状态
    function handleSetState(row, inTable) {
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
            return this.$message.warning('请选择数据！');
        }

        commonActions.setState(
            row,
            viewConfig.docViewTableMap.className,
            getSuccessCallBack(this, row, inTable, false)
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
        if (Array.isArray(row) && row.length === 0) {
            this.$message.warning('请选择数据！');
        } else {
            commonActions.saveAs(
                row,
                viewConfig.docViewTableMap.className,
                getSuccessCallBack(this, row, inTable, false),
                { inTable }
            );
        }
    }

    // 移动
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
        if (Array.isArray(row) && row.length === 0) {
            this.$message.warning('请选择数据！');
        } else {
            commonActions.move(
                row,
                viewConfig.docViewTableMap.className,
                getSuccessCallBack(this, row, inTable, false),
                {
                    oid: Array.isArray(row) ? null : row.oid,
                    inTable
                }
            );
        }
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
            this.$message.warning('请选择数据！');
        } else {
            commonActions.changeOwner(
                row,
                viewConfig.docViewTableMap.className,
                getSuccessCallBack(this, row, inTable, false),
                { inTable, oid: Array.isArray(row) ? null : row.oid }
            );
        }
    }
    function handleBatchDownload(row) {
        let successCallback = () => {};
        commonActions.batchDownload(row, viewConfig.docViewTableMap.className, successCallback);
    }
    // 检出
    function handleCheckout(row) {
        return ErdcHttp(Api.checkout, {
            method: 'GET',
            params: {
                oid: row.oid
            }
        });
    }
    //取主要内容源
    function getMainContent(oid) {
        return ErdcHttp({
            url: '/document/content/attachment/list',
            params: {
                objectOid: oid,
                roleType: 'PRIMARY'
            }
        }).then((resp) => {
            if (resp.success) {
                if (resp.data.attachmentDataVoList && resp.data.attachmentDataVoList.length) {
                    return resp.data.attachmentDataVoList[0];
                }
            }
            return null;
        });
    }

    // 下载
    async function handleDownload(row) {
        row = _.isArray(row) ? row : [row];

        if (_.isArray(row) && !row?.length) {
            return this.$message.warning('请选择数据！');
        }

        let mainContent = _.map(row, (item) => {
            if (item?.attrRawList) {
                return (
                    _.find(item?.attrRawList || [], (item) => new RegExp('mainContent$').test(item?.attrName))?.value ||
                    ''
                );
            }
            return item?.mainContent || this?.sourceData?.mainContent?.value || '';
        });

        //文档模板列表没有返回mainContent字段，调接口取字段
        if (this.$route.name.search('objectTemplateManagement') > -1) {
            let mainContentResult = await getMainContent(row[0]?.oid);
            mainContent = [mainContentResult.value];
        }

        mainContent = _.compact(mainContent) || [];

        //没有文件下载时提示
        if (!mainContent?.length) {
            return this.$message.info(i18n.noFiles);
        } else {
            // 批量需要遍历下载
            mainContent.forEach((id) => {
                ErdcKit.downFile({
                    url: 'document/content/file/download',
                    method: 'GET',
                    data: {
                        id
                    }
                });
            });
        }
    }
    async function handleOpenURL(row) {
        let mainContentResult = await getMainContent(row.oid);
        if (mainContentResult?.source == 1) {
            window.open(mainContentResult?.value);
        } else if (!mainContentResult) {
            this.$message.info(i18n.noFiles);
            return false;
        } else {
            this.$message.info(i18n.noSupported);
            return false;
        }
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
    function handleAddToBaseline(row) {
        const data = row ? (Array.isArray(row) ? row : [row]) : [];
        if (data.length === 0) {
            this.$message.warning('请选择数据！');
        } else {
            baselineSdk.goBaselineAddPage(data);
        }
    }
    function processFilePreviewConfig() {
        const mainSourceRef = this.$refs?.detail?.[0]?.$refs?.['main-source'][0];
        return mainSourceRef;
    }
    // eslint-disable-next-line no-unused-vars
    function handleFileUpdate(data, params) {
        // 列表逻辑
        if (params && this.editAttach) return this.editAttach(data);

        try {
            const filePreviewRef = processFilePreviewConfig.call(this);
            if (_.isFunction(filePreviewRef?.editAttach)) {
                filePreviewRef.editAttach();
            }
        } catch (e) {
            /* empty */
        }
    }
    // eslint-disable-next-line no-unused-vars
    function handleFilePreview(data, params) {
        // 列表
        if (params && this.previewAttach) return this.previewAttach(data);

        try {
            const filePreviewRef = processFilePreviewConfig.call(this);
            if (_.isFunction(filePreviewRef?.previewAttach)) {
                filePreviewRef.previewAttach();
            }
        } catch (e) {
            /* empty */
        }
    }

    //比较相关信息
    function handleInfoCompare(row) {
        const data = {
            props: viewConfig.docViewTableMap,
            routePath: `${this.$route?.meta?.prefixRoute}/document/infoCompare`
        };
        commonActions.handleInfoCompare(this, row, data);
    }

    // 文档批量审批流程
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

    // 导出
    function exportDocument() {
        const vm = this;
        const className = viewConfig.docViewTableMap.className; // 对象className标识

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
    function importDocument() {
        const importTypeList = [
            {
                label: i18n?.['文档对象'],
                value: viewConfig.docViewTableMap.className,
                business: {
                    import: 'DocImport',
                    export: 'DocExportTemp'
                }
            }
            // {
            //     label: i18n?.['文档参考'],
            //     value: 'erd.cloud.pdm.doc.entity.EtDocumentDependencyLink',
            //     business: {
            //         import: 'BomViewJob',
            //         export: ''
            //     }
            // }
        ];
        // 调用通用导入方法
        commonActions.import(this, { importTypeList });
    }

    function compareStruct(data) {
        let path = 'document/constructCompare';
        return commonActions.compareStruct(data, path, this);
    }

    return {
        handleCreateTemplate,
        handleEditTemplate,
        handleCreate,
        handleEdit,
        handleCancelEdit,
        handleSave,
        handleDelete,
        handleReversion,
        handleSetState,
        handleSaveAs,
        handleMove,
        handleRename,
        handleDownload,
        handleModifyOwner,
        handleReplaceContent,
        handleBatchUpdateAttr,
        handleAddToBaseline,
        mountDialogSave,
        mountRefuseTip,
        handleFilePreview,
        handleFileUpdate,
        handleInfoCompare,
        handleCreateChange,
        handleBatchApprovalProcess,
        handleOpenURL,
        exportDocument,
        importDocument,
        compareStruct,
        handleBatchDownload
    };
});
