/*

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/StateManagementAdd/index.html'),
    'css!' + ELMP.resource('biz-lifecycle/components/StateManagementAdd/style.css')
], function (template) {
    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/StateManagementAdd/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    addState: this.getI18nByKey('添加状态'),
                    enterCode: this.getI18nByKey('请输入编码'),
                    enterLetter: this.getI18nByKey('请输入大小写字母'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    application: this.getI18nByKey('应用'),
                    state: this.getI18nByKey('状态'),
                    enable: this.getI18nByKey('启用'),
                    stop: this.getI18nByKey('停用'),
                    describe: this.getI18nByKey('描述'),
                    failedDetail: this.getI18nByKey('获取详情失败'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    createFailure: this.getI18nByKey('创建失败')
                },
                formData: {},
                editableAttr: ['enabled'],
                loading: false
            };
        },
        watch: {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            data() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18n.internalName, // 内部名称
                        labelLangKey: 'moveToNode',
                        disabled: false,
                        hidden: false,
                        required: !this.oid,
                        readonly: !!this.oid,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '' || value === undefined) {
                                        callback(
                                            new Error(`${this.i18nMappingObj['pleaseEnter']} ${this.i18n.internalName}`)
                                        );
                                    } else if (value.match(/[^a-zA-Z_.]/gi)) {
                                        callback(new Error(this.i18nMappingObj['enterLetter']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            // placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            maxlength: 30
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18n.name, // 名称
                        labelLangKey: 'moveToNode',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            i18nName: '名称',
                            required: true,
                            max: 50
                        },
                        col: 12
                    },
                    {
                        field: 'enabled',
                        component: 'custom-select',
                        label: this.i18nMappingObj['state'],
                        labelLangKey: 'moveToNode',
                        disabled: false,
                        hidden: false,
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: [
                                    {
                                        name: this.i18nMappingObj['enable'],
                                        value: 'true'
                                    },
                                    {
                                        name: this.i18nMappingObj['stop'],
                                        value: 'false'
                                    }
                                ]
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['describe'],
                        labelLangKey: 'moveToNode',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            i18nName: '描述',
                            type: 'textarea'
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            this.getFormData();
        },
        methods: {
            formChange() {
                // do nothing
            },
            getFormData() {
                if (!this.oid) {
                    this.formData = {
                        enabled: 'true'
                    };
                    return;
                }
                this.$famHttp({
                    url: '/fam/getByOid' + '?oid=' + this.oid
                })
                    .then((resp) => {
                        const { data } = resp || {};
                        Object.keys(data).forEach((item) => {
                            if (item.includes('I18nJson')) {
                                data[item] = {
                                    value: data[item]
                                };
                            }
                            if (item === 'enabled') {
                                data[item] = data[item] ? 'true' : 'false';
                            }
                        });
                        this.formData = data;
                    })
                    .catch((error) => {
                        console.error(error);
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || this.i18nMappingObj['failedDetail']
                        // });
                    });
            },
            onSubmit() {
                this.submit();
            },
            submit() {
                const { dynamicForm } = this.$refs;
                let url = '/fam/create';
                if (this.oid) {
                    url = '/fam/update';
                }
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                const serializeData = dynamicForm.serializeEditableAttr();

                                serializeData.forEach((item) => {
                                    if (item.attrName.includes('I18nJson')) {
                                        item.value = item.value?.value || {};
                                    }
                                    if (item.attrName === 'enabled') {
                                        if (!_.isBoolean(item.value)) {
                                            item.value = item.value === 'true';
                                        }
                                    }
                                });

                                const attrRawList = serializeData;
                                this.$famHttp({
                                    url,
                                    data: {
                                        attrRawList,
                                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState',
                                        oid: this.oid
                                    },
                                    method: 'POST'
                                })
                                    .then((resp) => {
                                        this.$message({
                                            type: 'success',
                                            message: this.i18nMappingObj['createSuccess']
                                        });
                                        this.$emit('onsubmit', resp);
                                        this.toogleShow();
                                    })
                                    .catch((error) => {
                                        console.error(error);
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject(new Error(this.i18nMappingObj['createFail']));
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            }
        },
        components: {}
    };
});
