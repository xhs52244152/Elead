define(['text!' + ELMP.resource('system-customizing/components/UploadJar/index.html')], function (template) {
    return {
        template,
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-customizing/views/CustomEngineering/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    'Confirm',
                    'Cancel',
                    'projectTypeNote',
                    'ownService',
                    'serviceTip',
                    'uploadJar',
                    'projectName',
                    'engineerVersion'
                ]),
                formData: {}
            };
        },
        computed: {
            dataConfig() {
                return [
                    {
                        field: 'serviceRefList',
                        component: 'custom-select',
                        label: this.i18nMappingObj.ownService,
                        disabled: false,
                        hidden: false,
                        required: true,
                        readonly: false,
                        validators: [], // 需要校验
                        tooltip: this.i18nMappingObj.serviceTip,
                        props: {
                            clearable: true,
                            filterable: true,
                            multiple: true,
                            row: {
                                componentName: 'virtual-select',
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'oid', // 显示value的key
                                requestConfig: {
                                    url: '/platform/service/getAllServiceInfoVo'
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'jarFileId',
                        component: 'fam-upload',
                        label: this.i18nMappingObj.uploadJar,
                        required: true,
                        readonly: false,
                        validators: [], // 需要校验
                        props: {
                            'accept': '.jar',
                            'fileListType': 'none',
                            'multiple': false,
                            'limit': 1,
                            'action': '/file/file/site/storage/v1/upload',
                            'on-success': (file) => {
                                const fileId = file?.data || '';
                                if (fileId) {
                                    this.getPluginData(fileId);
                                }
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.projectName,
                        readonly: true,
                        validators: [], // 需要校验
                        props: {},
                        col: 12
                    },
                    {
                        field: 'version',
                        component: 'erd-input',
                        label: this.i18nMappingObj.engineerVersion,
                        readonly: true,
                        validators: [], // 需要校验
                        props: {},
                        col: 12
                    }
                ];
            }
        },
        methods: {
            getPluginData(fileId) {
                this.$famHttp({
                    url: '/platform/plugin/jarInfo',
                    method: 'post',
                    data: {
                        jarFileId: fileId
                    }
                }).then((resp) => {
                    const { data = {} } = resp;
                    this.$set(this.formData, 'name', data?.name || '');
                    this.$set(this.formData, 'version', data?.version || '');
                });
            },
            submit() {
                const { dynamicForm } = this.$refs;

                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                const jarFileId = this.formData?.jarFileId?.[0] || '';
                                const formData = {
                                    ...this.formData,
                                    jarFileId,
                                    type: 'LIB'
                                };
                                resolve(formData);
                            } else {
                                reject();
                            }
                        })
                        .catch(reject);
                });
            }
        }
    };
});
