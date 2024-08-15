define(['text!' + ELMP.resource('erdc-components/FamImport/index.html'), 'erdc-kit'], (template, utils) => {
    return {
        name: 'FamImport',
        template,
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            businessName: {
                type: String,
                default: ''
            },
            requestConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            className: {
                type: String,
                default: null
            },
            limit: {
                type: Number,
                default: 1
            },
            accept: {
                type: String,
                default: '.xlsx'
            },
            addDefaultViewExport: {
                type: Boolean,
                default: false
            },
            isShowTemplate: {
                type: Boolean,
                default: true
            },
            beforeUpload: {
                type: Function,
                default() {
                    return () => true;
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamImport/locale/index.js'),
                fileList: [],
                formData: {},
                loading: false,
                uploadStop: false
            };
        },
        watch: {
            innerVisible: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.init();
                    }
                }
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            dataConfig() {
                return [
                    {
                        field: 'file',
                        component: 'fam-upload',
                        label: this.i18n.uploadFile,
                        props: {
                            accept: this.accept,
                            fileListType: 'none',
                            btnConfig: {
                                disabled: false
                            },
                            action: '/file/file/site/storage/v1/upload',
                            isDownload: false,
                            limit: this.limit,
                            'before-remove': async (file, fileList) => {
                                if (this.uploadStop) {
                                    return true;
                                }
                                return await new Promise((resolve, reject) => {
                                    this.$confirm(this.i18n.isDeleteAttachments, this.i18n.isDelete, {
                                        confirmButtonText: this.i18n['confirm'],
                                        cancelButtonText: this.i18n['cancel'],
                                        type: 'warning'
                                    })
                                        .then((resp) => {
                                            this.deleteFile(file, fileList);
                                            resolve(true);
                                        })
                                        .catch((error) => {
                                            reject(false);
                                        });
                                });
                            },
                            'before-upload': (file) => {
                                this.uploadStop = !this.beforeUpload(file);
                                return !this.uploadStop;
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'fileTemplate',
                        label: this.i18n.downloadTemplate,
                        hidden: !this.isShowTemplate,
                        props: {},
                        slots: {
                            component: 'templateComponent'
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {},
        methods: {
            init() {
                this.$famHttp({
                    url: '/fam/export/template/listByBusinessName',
                    params: {
                        businessName: this.businessName,
                        addDefaultViewExport: this.addDefaultViewExport,
                        className: this.className
                    },
                    method: 'GET'
                }).then((resp) => {
                    const { data } = resp;
                    this.fileList = data;
                });
            },
            onSubmit() {
                const file = this.formData?.file?.[0] || '';
                if (!file) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.uploadFileFirst,
                        showClose: true
                    });
                }
                const { data } = this.requestConfig;
                this.loading = true;
                this.$famHttp({
                    url: '/fam/import',
                    method: 'POST',
                    data: {
                        businessName: this.businessName,
                        fileId: file,
                        className: this.className,
                        ...data
                    }
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18n.systemImport,
                            showClose: true,
                            dangerouslyUseHTMLString: true
                        });
                        /**
                         * visible
                         * success
                         */
                        this.$emit('submit-success-callback', false, true);
                        this.closeBtn();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            closeBtn() {
                this.innerVisible = false;
            },
            onDownload(data) {
                utils
                    .downFile({
                        method: 'get',
                        url: '/fam/export/template/downTemplate',
                        data: {
                            oid: data.oid,
                            className: this.className
                        }
                    })
                    .then((res) => {})
                    .catch((error) => {});
            },
            deleteFile(file) {
                if (!_.isEmpty(this.formData.file)) {
                    this.formData.file = this.formData.file.filter((item) => item !== file.response.data);
                }
            }
        }
    };
});
