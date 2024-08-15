define(['text!' + ELMP.resource('erdc-components/FamExport/index.html')], function (template) {
    return {
        name: 'FamExport',
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
            addDefaultViewExport: {
                type: Boolean,
                default: false
            },
            showExportTips: {
                type: Boolean,
                default: true
            }
        },
        components: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamExport/locale/index.js'),
                fileList: [],
                formData: {
                    file: ''
                }
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
            },
            fileList(n) {
                if (n instanceof Array && n.length) {
                    this.$set(this.formData, 'file', n[0]?.oid || '');
                    this.$set(this.formData, 'businessName', n[0]?.businessName || '');
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
                        component: '',
                        label: this.i18n.template,
                        props: {},
                        slots: {
                            component: 'radioComponent'
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            init() {
                this.$famHttp({
                    url: '/fam/export/template/listByBusinessName',
                    params: {
                        businessName: this.businessName,
                        addDefaultViewExport: this.addDefaultViewExport,
                        className: this.className
                    }
                }).then((resp) => {
                    const { data = [] } = resp;
                    this.fileList = data.map((item) => {
                        if (!item.oid) {
                            item.oid = item.businessName;
                        }
                        return item;
                    });
                });
            },
            onChange(value) {
                const data = this.fileList.find((item) => item.oid === value);
                this.$set(this.formData, 'file', data?.oid || '');
                this.$set(this.formData, 'businessName', data?.businessName || '');
            },
            onSubmit() {
                const { data, headers = {} } = this.requestConfig;
                this.$famHttp({
                    url: '/fam/export',
                    method: 'POST',
                    headers,
                    data: {
                        businessName: this.formData.businessName,
                        templateId: this.formData.file,
                        className: this.className,
                        ...data
                    }
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18n.exporting,
                        showClose: true,
                        dangerouslyUseHTMLString: true
                    });
                    this.$emit('submit-success-callback', false, true);
                    this.closeBtn();
                });
            },
            closeBtn() {
                this.innerVisible = false;
            }
        }
    };
});
