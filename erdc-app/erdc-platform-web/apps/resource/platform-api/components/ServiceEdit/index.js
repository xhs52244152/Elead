define([
    'erdcloud.kit',
    'text!' + ELMP.resource('platform-api/components/ServiceEdit/index.html'),
    'css!' + ELMP.resource('platform-api/components/ServiceEdit/index.css')
], function (erdcloudKit, template) {
    const className = 'erd.cloud.apiauth.entity.ApiServiceInfo';

    return {
        template,
        props: {
            service: {
                type: Object
            }
        },
        components: {
            FamMemberSelect: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamMemberSelect/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-api/views/ApiManagement/locale/index.js'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    serviceName: this.getI18nByKey('服务名'),
                    appName: this.getI18nByKey('服务别名'),
                    serviceOwner: this.getI18nByKey('服务所有者'),
                    groupName: this.getI18nByKey('服务分组'),
                    description: this.getI18nByKey('描述'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消')
                },

                visible: false,
                formData: {
                    oid: '',
                    serviceName: '',
                    appName: '',
                    owner: {
                        type: '',
                        value: []
                    },
                    groupName: '',
                    description: '',
                    users: []
                }
            };
        },
        watch: {
            service: {
                deep: true,
                immediate: true,
                handler(newVal) {
                    if (newVal) {
                        this.setServiceInfo();
                    }
                }
            }
        },
        computed: {
            isEdit() {
                return !!this.service;
            },
            title() {
                return this.isEdit ? this.i18nMappingObj.edit : this.i18nMappingObj.create;
            },
            formConfig() {
                const { i18nMappingObj, toLowerCase, formData } = this;

                const formConfig = [
                    {
                        field: 'serviceName',
                        component: 'erd-input',
                        label: i18nMappingObj.serviceName,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.serviceName)}`
                        }
                    },
                    {
                        field: 'appName',
                        component: 'erd-input',
                        label: i18nMappingObj.appName,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.appName)}`
                        }
                    },
                    {
                        field: 'owner',
                        component: 'fam-participant-select',
                        label: i18nMappingObj.serviceOwner,
                        props: {
                            multiple: true,
                            clearable: true,
                            showType: ['USER']
                        },
                        listeners: {
                            change(ids, objectList) {
                                let oids = [];
                                objectList?.forEach((item) => {
                                    oids.push(item.oid);
                                });
                                formData.owner.value = oids;
                            }
                        }
                    },
                    {
                        field: 'groupName',
                        component: 'erd-input',
                        label: i18nMappingObj.groupName,
                        required: true,
                        props: {
                            required: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.groupName)}`
                        }
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
            show() {
                this.visible = true;
            },
            setServiceInfo() {
                const properties = ['oid', 'serviceName', 'appName', 'groupName', 'description', 'users'];

                const service = this.service ?? {};
                const tempObj = {};
                properties.forEach((key) => {
                    tempObj[key] = service[key] ?? '';
                });
                tempObj.owner_defaultValue = service.users;
                if (service.users.length > 0) {
                    let oids = [];
                    service.users.forEach((item) => {
                        oids.push(item.oid);
                    });
                    this.formData.owner.value = oids;
                }
                this.formData = Object.assign(this.formData, tempObj);
            },
            toLowerCase(str) {
                return String.prototype.toLowerCase.call(str);
            },
            confirm() {
                this.$refs.form.submit().then(({ data, valid }) => {
                    if (valid) {
                        this.addService(data);
                    }
                });
            },
            addService(data) {
                const attrRawList = [];
                Object.keys(data).forEach((key) => {
                    let value = data[key];
                    if (key === 'owner') {
                        if (value.value.length > 0) {
                            value = value.value.join(',');
                        } else {
                            value = '';
                        }
                    }

                    const attr = {
                        attrName: key,
                        value
                    };

                    if (key !== 'owner_defaultValue') {
                        attrRawList.push(attr);
                    }
                });

                this.$famHttp({
                    url: data.oid ? '/fam/update' : '/fam/create',
                    method: 'POST',
                    data: {
                        action: data.oid ? 'UPDATE' : 'CREATE',
                        oid: data.oid,
                        className,
                        attrRawList
                    }
                })
                    .then((res) => {
                        if (res.code === '200') {
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
                this.visible = false;
                this.$emit('editSuccess');
            },
            cancel() {
                this.visible = false;
            },
            handleClose() {
                this.formData = {
                    oid: '',
                    serviceName: '',
                    appName: '',
                    owner: {
                        type: '',
                        value: []
                    },
                    groupName: '',
                    description: '',
                    users: []
                };
                this.$emit('close');
            }
        }
    };
});
