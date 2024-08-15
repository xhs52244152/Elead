define([
    'erdc-kit',
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/views/SiteFiles/index.html')
], function (ErdcKit, api, template) {
    return {
        template: template,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js')
            };
        },
        computed: {
            viewTableConfig() {
                const { i18nMappingObj } = this;

                return {
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: true,
                    addOperationCol: false,
                    columns: [
                        {
                            attrName: 'name',
                            label: i18nMappingObj.fileName,
                            minWidth: '500px'
                        },
                        {
                            attrName: 'size',
                            label: i18nMappingObj.size,
                            width: '120px'
                        },
                        {
                            attrName: 'site',
                            label: i18nMappingObj.inSite,
                            minWidth: '150px'
                        },
                        {
                            attrName: 'createTime',
                            label: i18nMappingObj['创建时间'],
                            width: '150px'
                        },
                        {
                            attrName: 'operation',
                            label: i18nMappingObj.operate,
                            isDisable: true,
                            fixed: 'right',
                            showOverflow: false,
                            width: '80px'
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'size',
                            type: 'default'
                        },
                        {
                            prop: 'site',
                            type: 'default'
                        },
                        {
                            prop: 'operation',
                            type: 'default'
                        }
                    ],
                    tableBaseConfig: {
                        showOverflow: true, // 溢出隐藏显示省略号
                        rowConfig: {
                            keyField: 'id'
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        }
                    },
                    toolbarConfig: {
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        },
                        showConfigCol: true,
                        showMoreSearch: false
                    },
                    tableRequestConfig: {
                        url: api.url.site.files,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    },
                    pagination: {
                        showPagination: true,
                        pageSize: 20
                    }
                };
            }
        },
        methods: {
            onUploadSuccess() {
                this.$refs['famUpload'].$refs.upload.clearFiles();
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            // 返回
            goBack() {
                this.$router.back();
            },

            getFileSize(size) {
                return `${(parseInt(size) / 1024 / 1024).toFixed(3)} MB`;
            },
            getFileSites(row) {
                return row.fileRoutes
                    .map((item) => item.siteCode)
                    .sort()
                    .join(' , ');
            },
            refresh() {
                this.$refs['famAdvancedTable'].fnRefreshTable();
            },
            download(file) {
                ErdcKit.downloadFile(file.fileId, file.authorizeCode, true);
            }
        }
    };
});
