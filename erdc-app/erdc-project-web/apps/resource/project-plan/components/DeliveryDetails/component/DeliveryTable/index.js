define([
    'vue',
    'erdcloud.kit',
    'erdc-kit',
    'text!' + ELMP.resource('project-plan/components/DeliveryDetails/component/DeliveryTable/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-plan/mixins/common-mixins.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-https/common-http.js')
], function (
    Vue,
    ErdcKit,
    famUtils,
    template,
    store,
    commonMixins,
    utils,
    commonActions,
    commonActionUtils,
    commonHttp
) {
    return {
        template,
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            UploadTable: ErdcKit.asyncComponent(
                ELMP.resource('project-plan/components/DeliveryDetails/component/UploadDeliverables/index.js')
            ),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js'))
        },
        mixins: [commonMixins],
        props: {
            deliverableTableData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            editDeliveryData: Object,
            isDetail: Boolean,
            poid: String,
            loading: Boolean,
            actionConfigKey: {
                type: String,
                default: 'PPM_Delivery_LINK_PER_MENU'
            },
            readonly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                // // 国际化页面引用对象,
                i18nMappingObj: {
                    remove: this.getI18nByKey('remove'),
                    delete: this.getI18nByKey('delete'),
                    cancel: this.getI18nByKey('cancel'),
                    confirm: this.getI18nByKey('confirm'),
                    tips: this.getI18nByKey('tips'),
                    deleteData: this.getI18nByKey('deleteData'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    // 表头 前端先写死 后面从接口拿
                    source: this.getI18nByKey('source'),
                    deliveryName: this.getI18nByKey('deliveryName'),
                    code: this.getI18nByKey('code'),
                    version: this.getI18nByKey('version'),
                    status: this.getI18nByKey('status'),
                    template: this.getI18nByKey('template'),
                    operation: this.getI18nByKey('operation'),
                    docUpdateSuccessful: this.getI18nByKey('docUpdateSuccessful'),
                    securityLabel: this.getI18nByKey('securityLabel'),
                    mainContent: this.getI18nByKey('mainContent'),
                    deliveryTemplate: this.getI18nByKey('deliveryTemplate'),
                    deliveryTemplateUploaded: this.getI18nByKey('deliveryTemplateUploaded'),
                    deliveryTemplateRemoved: this.getI18nByKey('deliveryTemplateRemoved'),
                    uninvolved: this.getI18nByKey('uninvolved')
                },
                unfoldTable: true,
                tableData: []
            };
        },
        watch: {
            deliverableTableData: {
                handler(val) {
                    this.tableData = ErdcKit.deepClone(val);
                },
                immediate: true
            }
        },
        computed: {
            documentClassName() {
                return store.state.classNameMapping.document;
            },
            documentMasterClassName() {
                return store.state.classNameMapping.documentMaster;
            },
            columns() {
                let tabsData = [
                    {
                        type: 'seq',
                        title: ' ',
                        minWidth: '60',
                        width: '60'
                    },
                    {
                        prop: 'source', // 来源
                        width: '100',
                        title: this.i18nMappingObj.source
                    },
                    {
                        prop: 'name', // 交付件名称
                        title: this.i18nMappingObj.deliveryName,
                        minWidth: 210
                    },
                    {
                        prop: 'identifierNo', // 编码
                        minWidth: 180,
                        title: this.i18nMappingObj.code
                    },
                    {
                        prop: 'version', // 版本
                        title: this.i18nMappingObj.version,
                        minWidth: '60',
                        width: '60'
                    },
                    {
                        prop: 'securityLabel', // 密级
                        title: this.i18nMappingObj.securityLabel,
                        minWidth: '60',
                        width: '60'
                    },
                    {
                        prop: 'mainContent', // 主内容
                        title: this.i18nMappingObj.mainContent,
                        minWidth: '60',
                        width: '60'
                    },
                    {
                        prop: 'lifecycleStatus.status', // 状态
                        title: this.i18nMappingObj.status,
                        minWidth: '100',
                        width: '100'
                    },
                    {
                        prop: 'deliveryTemplate', // 交付件模板
                        title: this.i18nMappingObj.deliveryTemplate,
                        minWidth: 310
                    }
                ];
                if (!this.isDetail) {
                    tabsData.push({
                        prop: 'operation', // 操作
                        title: this.i18nMappingObj.operation,
                        width: 80
                        // fixed: 'right'
                    });
                }
                return tabsData;
            },
            containerRef() {
                return this.$store.state?.space?.object?.containerRef || '';
            }
        },
        methods: {
            // 重新工作和审批中不能上传、删除交付件模板
            isEdit(row) {
                let status = row.attrRawList.find((item) => {
                    return item.attrName === 'lifecycleStatus.status';
                })?.value;
                return !['REVIEWING', 'REWORK'].includes(status);
            },
            // 提交流程后刷新列表数据
            refresh() {
                this.$emit('flow-refresh-data');
            },
            // 模板上传
            uploadTemplate(fileObj, scope) {
                const fileVal = fileObj?.response?.data;
                if (fileVal) {
                    this.$set(scope.row, 'template', `${fileVal}|${fileObj.name}`);
                }
                this.saveData(scope.row);
            },
            // 模板文件预览
            templateFilePreview(row) {
                const fileItem = row['template'];
                const commaIndex = fileItem.indexOf('|');
                if (commaIndex < 0) {
                    return;
                }
                const fileId = fileItem.substring(0, commaIndex);
                const fileName = fileItem.substring(commaIndex + 1);
                // 这里拿到的authCode是交付件的,
                let authCode = row.attrRawList.find((item) => item.attrName === 'templateAuthorizeCode')?.value || '';
                // 需要用交付物的linkOid去查
                if (row.linkOid) {
                    // 根据oid查询其详情authCode
                    commonHttp
                        .commonAttr({
                            data: {
                                oid: row.linkOid
                            }
                        })
                        .then((res = {}) => {
                            let detailData = res.data?.rawData || {};
                            authCode = detailData['templateAuthorizeCode']?.value;
                        });
                }
                setTimeout(() => {
                    famUtils.previewFile({
                        fileName,
                        fileId,
                        authCode
                    });
                }, 500);
            },
            // 模板文件下载
            templateFileDownload(row) {
                const fileItem = row['template'];
                const commaIndex = fileItem.indexOf('|');
                if (commaIndex < 0) {
                    return;
                }
                const fileId = fileItem.substring(0, commaIndex);
                famUtils.downloadFile(fileId, row.templateAuthorizeCode);
            },
            // 移除模板文件
            templateFileRemove(row) {
                this.$confirm(this.i18nMappingObj.whetherDeleteTemplate, this.i18nMappingObj.checkDelete, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.comfirmSelect,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    this.$set(row, 'template', '');
                    this.saveData(row);
                });
            },
            showTemplateFileName(row) {
                const fileItem = row['template'];
                const commaIndex = fileItem.indexOf('|');
                if (commaIndex < 0) {
                    return;
                }
                return fileItem.substring(commaIndex + 1);
            },
            // 保存模板到交付件列表
            saveData(row) {
                this.updateRequest({
                    className: 'erd.cloud.ppm.common.entity.DeliveryLink',
                    containerRef: utils.getContainerRef(),
                    oid: row?.linkOid,
                    attrRawList: [
                        {
                            attrName: 'template',
                            value: row?.template
                        }
                    ]
                }).then(() => {
                    if (row?.template) {
                        this.$message.success(this.i18nMappingObj.deliveryTemplateUploaded);
                    } else {
                        this.$message.success(this.i18nMappingObj.deliveryTemplateRemoved);
                    }
                });
            },
            // 交付件详情
            async openDetail({ row }) {
                const res = await commonHttp.commonAttr({
                    data: {
                        oid: row.oid
                    }
                });
                const rowData = res.data?.rawData || {};

                if (rowData.appName?.value === 'PDM') {
                    const value = rowData.pdmDocumentUrl.value.replace(/%23/g, '#');
                    const url =
                        window.location.hostname === 'localhost'
                            ? `http://plm-sit-rc5.apps.paas.sz.ddns.e-lead.cn${value}`
                            : value;
                    window.open(url);
                    return;
                }
                // 重新工作和审批中不能编辑交付件
                let status = row.attrRawList.find((item) => {
                    return item.attrName === 'lifecycleStatus.status';
                })?.value;
                let showEditBtn = !['REVIEWING', 'REWORK'].includes(status);
                let { editDeliveryData } = this;
                const refreshData = () => {
                    this.$emit('refresh-data', editDeliveryData);
                };
                let params = {
                    containerRef: this.containerRef,
                    extendParams: {
                        openType: 'detail',
                        oid: row.oid,
                        extendParams: { roleType: '' },
                        className: this.documentClassName,
                        beforeCancel: refreshData,
                        showEditBtn
                    },
                    afterSubmit: refreshData
                };
                commonActions.openDocument(this, params);
            },
            getActionConfig(row) {
                let isAudit = this.editDeliveryData.attrRawList?.find(
                    (item) => item.attrName === 'erd.cloud.ppm.common.entity.Delivery#auditingFlag'
                )?.value;
                if (this.actionConfigKey === 'PPM_Delivery_LINK_PER_MENU') {
                    return {
                        name: this.actionConfigKey,
                        objectOid: row.versionOid,
                        className: this.documentClassName,
                        extractParamMap: { isAudit }
                    };
                }
                return {
                    name: this.actionConfigKey,
                    objectOid: this.$route.query?.baselined ? this.poid : this.editDeliveryData.oid,
                    className: 'erd.cloud.ppm.common.entity.Delivery',
                    extractParamMap: { isAudit }
                };
            },
            onCommand(data, row) {
                const eventClick = {
                    DELIVERABLE_DOWNLOAD: this.fileDownload,
                    DELIVERABLE_PREVIEW: this.filePreview,
                    PPM_BUSINESS_LINK_REMOVE: this.onRemove,
                    PPM_D_DELIVERY_INITIATION_PROCESS: this.startProcess
                };
                eventClick[data.name] && eventClick[data.name](row);
            },
            startProcess(row) {
                let businessData = ErdcKit.deepClone(this.editDeliveryData);
                businessData = [businessData].map((item) => {
                    item.deliverableSelectOid = row.oid;
                    item.planOid = this.poid;
                    item.businessSource = 'deliverablesRow';
                    item.projectOid = this.$route.query.pid;
                    return item;
                });
                const afterRequest = (data) => {
                    if (data.length) this.$emit('close-dialog');
                };
                let containerRef = utils.getContainerRef();
                const customGetProcessFunc = () => {
                    return this.$famHttp({
                        method: 'POST',
                        url: '/ppm/communal/getProcessDefDtoForOtherObj',
                        data: [row.oid]
                    });
                };
                commonActions.startProcess(this, {
                    businessData,
                    containerRef,
                    afterRequest,
                    customGetProcessFunc
                });
            },
            // 下载
            fileDownload(row) {
                utils.downloadFile(row);
            },
            // 预览
            filePreview(row) {
                commonActionUtils.renderFilePreview(row);
            },
            // 移除
            onRemove(row) {
                let params = {
                    catagory: 'DELETE',
                    className: 'erd.cloud.ppm.common.entity.DeliveryLink',
                    oidList: [row.linkOid]
                };
                this.$confirm(this.i18nMappingObj.deleteData, this.i18nMappingObj.tips, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.concel,
                    type: 'warning'
                }).then(() => {
                    this.deleteByIdsRequest(params).then((resp) => {
                        if (resp.success) {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess
                            });
                            this.$emit('deleteDeliverySuccess', this.editDeliveryData);
                        }
                    });
                });
            }
        }
    };
});
