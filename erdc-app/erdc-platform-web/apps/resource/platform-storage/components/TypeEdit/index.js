define([
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/components/TypeEdit/index.html')
], function (api, template) {
    return {
        template,
        props: {
            baseType: {
                type: Object
            },
            fileTypes: {
                type: Array,
                required: true,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys(['name', 'code', 'icon', 'pleaseEnter', 'fileClassification', 'fileFormat']),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    saveSuccess: this.getI18nByKey('保存成功')
                },

                visible: false,
                formData: {
                    id: '',
                    defineCode: '',
                    extension: ''
                }
            };
        },
        watch: {
            baseType: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    if (newVal) {
                        this.setBaseType();
                    }
                }
            }
        },
        computed: {
            isEdit() {
                return !!this.baseType;
            },
            title() {
                return this.isEdit ? this.i18nMappingObj.edit : this.i18nMappingObj.create;
            },
            formConfig() {
                const { i18nMappingObj, toLowerCase, isEdit } = this;

                const formConfig = [
                    {
                        field: 'defineCode',
                        label: i18nMappingObj.fileClassification,
                        required: true,
                        slots: {
                            component: 'defineCode'
                        }
                    },
                    {
                        field: 'extension',
                        component: 'erd-input',
                        label: i18nMappingObj.fileFormat,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.name)}`
                        }
                    }
                ];
                return formConfig;
            }
        },
        methods: {
            show() {
                this.visible = true;
            },
            close() {
                this.visible = false;
            },
            toLowerCase(str) {
                return String.prototype.toLowerCase.call(str);
            },
            confirm() {
                this.$refs.form.submit().then(({ data, valid }) => {
                    if (valid) {
                        this.isEdit ? this.edit(data) : this.create(data);
                    }
                });
            },
            setBaseType() {
                const properties = ['id', 'defineCode', 'extension'];

                const baseType = this.baseType ?? {};
                const tempObj = {};
                properties.forEach((key) => {
                    tempObj[key] = baseType[key] ?? '';
                });

                this.formData = tempObj;
            },
            create(data) {
                data = Object.assign({}, data);
                delete data.id;

                api.baseType
                    .create([data])
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.saveSuccess,
                                showClose: true
                            });
                            this.saveSuccess();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     message: err.data.message,
                        //     type: 'error',
                        // });
                    });
            },
            edit(data) {
                const tempData = {
                    name: data.name,
                    icon: data.icon
                };
                api.baseType
                    .edit(data.id, tempData)
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.saveSuccess,
                                showClose: true
                            });
                            this.saveSuccess();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     message: err.data.message,
                        //     type: 'error',
                        // });
                    });
            },
            saveSuccess() {
                this.close();
                this.$emit('saveSuccess');
            },
            onClose() {
                this.formData = {
                    id: '',
                    defineCode: '',
                    extension: ''
                };
            }
        }
    };
});
