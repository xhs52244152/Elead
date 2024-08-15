define([
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/components/SiteEdit/index.html'),
    'css!' + ELMP.resource('platform-storage/components/SiteEdit/index.css')
], function (Api, template) {
    return {
        template: template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'name',
                        'code',
                        'address',
                        'mainSite',
                        'description',
                        'confirm',
                        'cancel',
                        'pleaseEnter',
                        'siteDetection',
                        'yes',
                        'no',
                        'siteCreatedSuccess'
                    ]),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑')
                },

                visible: false,
                form: {
                    id: '',
                    name: '', // 名称
                    code: '', // 编码
                    serverAddr: '', // 地址
                    active: 0, // 启/停用
                    mainCenter: false, // 是否主站点
                    description: '' // 描述
                }
            };
        },
        computed: {
            // 是否是编辑状态
            isEdit() {
                return !!this.form.id;
            },
            title() {
                return this.isEdit ? this.i18nMappingObj.edit : this.i18nMappingObj.create;
            },
            rules() {
                return {
                    name: [
                        {
                            required: true,
                            message: `${this.i18nMappingObj.pleaseEnter}${this.toLowerCase(this.i18nMappingObj.name)}`,
                            trigger: 'blur'
                        }
                    ],
                    serverAddr: [{ required: true, message: '请输入站点地址', trigger: 'blur' }]
                };
            },
            formConfig() {
                const { form, i18nMappingObj, toLowerCase } = this;

                const formConfig = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: i18nMappingObj.name,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.name)}`
                        }
                    },
                    {
                        field: 'serverAddr',
                        component: 'erd-input',
                        label: i18nMappingObj.address,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.address)}`
                        },
                        col: 20
                    },
                    {
                        slots: {
                            component: 'siteCheck'
                        },
                        col: 4
                    },
                    {
                        field: 'code',
                        component: 'erd-input',
                        label: i18nMappingObj.code,
                        required: true,
                        disabled: this.form.active,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.code)}`
                        }
                    },
                    {
                        field: 'mainCenter',
                        component: 'fam-radio',
                        label: i18nMappingObj.mainSite,
                        props: {
                            options: [
                                {
                                    label: i18nMappingObj.yes,
                                    value: true
                                },
                                {
                                    label: i18nMappingObj.no,
                                    value: false
                                }
                            ]
                        },
                        col: 24
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: i18nMappingObj.description,
                        props: {
                            type: 'textarea',
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.description)}`
                        }
                    }
                ];
                return formConfig;
            }
        },
        methods: {
            show(siteInfo) {
                if (siteInfo) {
                    this.form = Object.assign({}, this.form, siteInfo);
                }
                this.visible = true;
            },
            confirm() {
                this.$refs.form.submit().then(({ valid }) => {
                    if (valid) {
                        if (this.isEdit) {
                            this.editSiteRequest(this.form);
                        } else {
                            this.addSiteRequest(this.form);
                        }
                    }
                });
            },
            cancel() {
                this.visible = false;
            },
            toLowerCase(str) {
                return String.prototype.toLowerCase.call(str);
            },
            onClose() {
                this.form = {
                    id: '',
                    name: '', // 名称
                    code: '', // 编码
                    serverAddr: '', // 地址
                    active: 0, // 启/停用
                    mainCenter: false, // 是否主站点
                    description: '' // 描述
                };
            },

            // 获取站点编码
            getCode() {
                const { form } = this;

                if (!form.serverAddr) return;

                Api.site
                    .health(form.serverAddr)
                    .then((res) => {
                        if (res.success) {
                            this.$message.success(this.i18nMappingObj.success);
                            const data = res.data;
                            this.form.code = data.siteCode;
                            this.form.mainCenter = data.master;
                        }
                    })
                    .catch(() => {});
            },

            addSiteRequest(params) {
                Api.site.add(params).then((res) => {
                    if (res.success) {
                        this.$message({
                            showClose: true,
                            message: this.i18nMappingObj.siteCreatedSuccess,
                            type: 'success'
                        });
                        this.saveSuccess();
                    }
                });
            },

            editSiteRequest(params) {
                const tempParams = {
                    name: params.name,
                    active: params.active,
                    description: params.description,
                    serverAddr: params.serverAddr
                };
                if (!params.active) {
                    tempParams.code = params.code;
                }
                Api.site.edit(params.id, tempParams).then(() => {
                    this.$message({
                        showClose: true,
                        message: '站点编辑成功',
                        type: 'success'
                    });
                    this.saveSuccess();
                });
            },
            saveSuccess() {
                this.visible = false;
                this.$emit('saved');
            }
        }
    };
});
