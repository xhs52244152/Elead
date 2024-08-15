define([
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/components/FileClassificationEdit/index.html')
], function (api, template) {

    const formDefault = {
        tid: '',
        code: '',
        name: '',
        icon: ''
    };

    return {
        template,
        props: {
            fileType: {
                type: Object
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys(['name', 'code', 'icon', 'pleaseEnter', 'selectIcon']),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    saveSuccess: this.getI18nByKey('保存成功')
                },

                visible: false,
                formData: Object.assign({}, formDefault),
            };
        },
        computed: {
            isEdit() {
                return !!this.fileType;
            },
            title() {
                return this.isEdit ? this.i18nMappingObj.edit : this.i18nMappingObj.create;
            },
            formConfig() {
                const { i18nMappingObj, toLowerCase, isEdit } = this;

                const formConfig = [
                    {
                        field: 'code',
                        component: 'erd-input',
                        label: i18nMappingObj.code,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.code)}`
                        }
                    },
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
                        field: 'icon',
                        component: 'FamIconSelect',
                        label: i18nMappingObj.icon,
                        type: 'icon',
                        required: true,
                        props: {
                            title: this.i18nMappingObj.selectIcon,
                            visibleBtn: true,
                            btnName: this.i18nMappingObj.selectIcon
                        }
                    }
                ];
                return formConfig;
            }
        },
        methods: {
            show() {
                if (this.isEdit) {
                    this.setFileType();
                } else {
                    this.formData = JSON.parse(JSON.stringify(formDefault));
                }
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
            setFileType() {
                const properties = ['id', 'code', 'name', 'icon'];

                const fileType = this.fileType ?? {};
                const tempObj = {};
                properties.forEach((key) => {
                    tempObj[key] = fileType[key] ?? '';
                });

                this.formData = tempObj;
            },
            create(data) {
                api.fileType
                    .create(data)
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
                api.fileType
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
                    code: '',
                    name: '',
                    icon: ''
                };
            }
        }
    };
});
