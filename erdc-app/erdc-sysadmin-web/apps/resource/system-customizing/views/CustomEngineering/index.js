define(['text!' + ELMP.resource('system-customizing/views/CustomEngineering/index.html'), 'erdc-kit'], function (
    template,
    utils
) {
    const FamKit = require('fam:kit');
    return {
        template,
        components: {
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            PluginForm: FamKit.asyncComponent(ELMP.resource('system-customizing/components/PluginForm/index.js')),
            UploadJar: FamKit.asyncComponent(ELMP.resource('system-customizing/components/UploadJar/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomEngineering/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'confirmDel',
                    'delProject',
                    'Confirm',
                    'Cancel',
                    'successDel',
                    'releaseSuccess',
                    'offlineSuccess',
                    'uploadSource',
                    'uploadSourceSuccess',
                    'createdSuccess',
                    'projectManagement',
                    'uploadJar',
                    'creationProject',
                    'operationSucceeReleased',
                    'operationSucceeDisabled',
                    'create',
                    'release',
                    'deactivate',
                    'uploadSourceCode',
                    'updateSourceCode',
                    'downloadSourceCode',
                    'downloadJar',
                    'name',
                    'type',
                    'beloneService',
                    'status',
                    'version',
                    'beloneApplication',
                    'creator',
                    'createTime'
                ]),
                projectVisible: false,
                uploadJarVisible: false,
                uploadSourceCodeVisible: false,
                formData: {},
                oid: '',
                projectLoading: false,
                searchKey: '',
                selectList: {
                    type: {
                        attrName: 'type',
                        model: '',
                        placeholder: '请选择类型',
                        options: []
                    },
                    status: {
                        attrName: 'status',
                        model: '',
                        placeholder: '请选择状态',
                        options: []
                    },
                    service: {
                        attrName: 'serviceId',
                        model: '',
                        placeholder: '请选择服务',
                        options: []
                    }
                }
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((item) => item.meta.showRouteTitle);
            },
            viewTableConfig() {
                return {
                    vm: this,
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/platform/plugin/page',
                        data: {
                            pageSize: 20,
                            pageIndex: 1,
                            searchKey: this.searchKey,
                            type: this.selectList.type.model,
                            status: this.selectList.status.model,
                            serviceId: this.selectList.service.model
                        },
                        method: 'POST'
                    },
                    toolbarConfig: {
                        showRefresh: true,
                        fuzzySearch: {
                            show: false
                        }
                    },
                    tableBaseConfig: {
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left',
                        columnConfig: {
                            resizable: true
                        },
                        showOverflow: true
                    },
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    addSeq: true,
                    columns: [
                        {
                            attrName: 'name',
                            label: this.i18n.name,
                            width: 200
                        },
                        {
                            attrName: 'typeName',
                            label: this.i18n.type,
                            width: 100
                        },
                        {
                            attrName: 'serviceName',
                            label: this.i18n.beloneService,
                            width: 100
                        },
                        {
                            attrName: 'statusName',
                            label: this.i18n.status
                        },
                        {
                            attrName: 'version',
                            label: this.i18n.version
                        },
                        {
                            attrName: 'appName',
                            label: this.i18n.beloneApplication,
                            width: 160
                        },
                        {
                            attrName: 'creatorName',
                            label: this.i18n.creator
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18n.createTime
                        },
                        {
                            attrName: 'operation',
                            label: this.i18n.operation,
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            minWidth: 100
                        }
                    ]
                };
            },
            dataConfig() {
                return [
                    {
                        field: 'sourceFileId',
                        component: 'fam-upload',
                        label: this.i18nMappingObj.uploadSource,
                        required: true,
                        readonly: false,
                        validators: [], // 需要校验
                        props: {
                            accept: '*',
                            fileListType: 'none',
                            multiple: false,
                            limit: 1,
                            action: '/file/file/site/storage/v1/upload'
                        },
                        col: 24
                    }
                ];
            }
        },
        created() {
            ['type', 'status', 'service'].forEach((type) => {
                this.getOptionList(type);
            });
        },
        methods: {
            handleFilterChange() {
                this.refreshTable();
            },
            getOptionList(type) {
                let url = '/platform/enumDataList';
                let method = 'POST';
                let params = {};
                switch (type) {
                    case 'type':
                        params.realType = 'erd.cloud.core.plugin.domain.enums.PluginType';
                        break;
                    case 'status':
                        params.realType = 'erd.cloud.core.plugin.domain.enums.PluginStatus';
                        break;
                    case 'service':
                        url = '/platform/service/getAllServiceInfoVo';
                        method = 'GET';
                        break;
                    default:
                        break;
                }
                this.$famHttp({
                    url,
                    method,
                    params
                })
                    .then((resp) => {
                        const result = resp?.data.map((item) => {
                            return {
                                label: item.displayName || item.value,
                                value: item.id || item.name
                            };
                        });
                        this.selectList[type].options = result || [];
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            },
            refreshTable() {
                this.$refs.famAdvancedTable.fnRefreshTable();
            },
            actionClick(value, data) {
                this?.[value.name]?.(data);
            },

            // 创建
            onCreate() {
                this.projectVisible = true;
            },

            // 删除
            onDelete(data) {
                const id = data?.id || '';
                this.$confirm(this.i18nMappingObj.delProject, this.i18nMappingObj.confirmDel, {
                    type: 'warning',
                    confirmButtonText: this.i18nMappingObj.Confirm,
                    cancelButtonText: this.i18nMappingObj.Cancel
                }).then(() => {
                    this.$famHttp({
                        url: '/platform/plugin/delete',
                        data: {
                            id
                        },
                        method: 'post'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.successDel,
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },

            // 上传JAR
            onUploadJar() {
                this.uploadJarVisible = true;
            },

            // 上传源码
            onUploadSource(data) {
                this.oid = data?.oid || '';
                this.uploadSourceCodeVisible = true;
            },

            // 更新源码
            onUpdateSource(data) {
                this.oid = data?.oid || '';
                this.uploadSourceCodeVisible = true;
            },

            // 发布
            onRelease(data) {
                const id = data?.id || '';
                this.$famHttp({
                    url: '/platform/plugin/release',
                    data: {
                        id
                    },
                    method: 'post'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message:
                            data?.type === 'LIB'
                                ? this.i18nMappingObj.operationSucceeReleased
                                : this.i18nMappingObj.releaseSuccess,
                        showClose: true
                    });
                    this.refreshTable();
                });
            },

            // 下线
            onDownLine(data) {
                const id = data?.id || '';
                this.$famHttp({
                    url: '/platform/plugin/downLine',
                    data: {
                        id
                    },
                    method: 'post'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message:
                            data?.type === 'LIB'
                                ? this.i18nMappingObj.operationSucceeDisabled
                                : this.i18nMappingObj.offlineSuccess,
                        showClose: true
                    });
                    this.refreshTable();
                });
            },

            // 下载源码
            onDownLoadSource(data) {
                utils.downloadFile(data?.sourceFileId || '', data.sourceToken, true);
            },

            // 下载JAR
            onDownloadJar(data) {
                utils.downloadFile(data?.jarFileId || '', data.jarToken, true);
            },

            // 上传Jar确定按钮
            onSubmitJar() {
                const { uploadJar } = this.$refs;
                uploadJar.submit().then((formData) => {
                    if (formData) {
                        this.$famHttp({
                            url: '/platform/plugin/uploadJar',
                            data: formData,
                            method: 'post'
                        }).then(() => {
                            this.uploadJarVisible = false;
                            this.refreshTable();
                        });
                    }
                });
            },

            // 上传源码按钮
            onUploadSourceCode() {
                const { dynamicForm } = this.$refs;
                dynamicForm.submit().then(({ valid }) => {
                    if (valid) {
                        this.$famHttp({
                            url: '/platform/plugin/uploadSourceFile',
                            data: {
                                id: this.oid.split(':')[2],
                                sourceFileId: this.formData.sourceFileId[0]
                            },
                            method: 'post'
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.uploadSourceSuccess,
                                showClose: true
                            });
                            this.uploadSourceCodeVisible = false;
                            this.refreshTable();
                        });
                    }
                });
            },
            showRelease(row) {
                return row.status !== 'HAVE_RELEASED' && row.type !== 'SERVER';
            },
            showDownLine(row) {
                return row.status === 'HAVE_RELEASED';
            },
            showDownloadJar(row) {
                return Boolean(row.jarFileId);
            },
            showUploadSourceCode(row) {
                return Boolean(!row.sourceFileId);
            },
            showUpdateSource(row) {
                return Boolean(row.sourceFileId);
            },
            showDownLoadSource(row) {
                return Boolean(row.sourceFileId);
            },
            showDelete(row) {
                return row.status !== 'HAVE_RELEASED';
            },

            // 创建
            onSubmitCreate() {
                const { pluginForm } = this.$refs;
                pluginForm.submit().then((data) => {
                    this.projectLoading = true;
                    this.$famHttp({
                        url: '/platform/plugin/create',
                        data,
                        method: 'post'
                    })
                        .then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.createdSuccess,
                                showClose: true
                            });
                            this.projectVisible = false;
                            this.refreshTable();
                        })
                        .finally(() => {
                            this.projectLoading = false;
                        });
                });
            }
        }
    };
});
