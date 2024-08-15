define([
    'text!' + ELMP.resource('platform-api/components/VersionCompareSelect/version-compare-select.html'),
    'css!' + ELMP.resource('platform-api/components/VersionCompareSelect/version-compare-select.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            currentId: {
                type: String,
                default: ''
            },
            list: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('platform-api/views/ApiManagement/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '当前版本',
                    '基线版本',
                    '请选择不同的版本',
                    '选择版本不能为空',
                    '请选择版本'
                ]),
                visible: false,
                formData: {
                    version: '',
                    versionId: ''
                },
                labelWidth: '80px'
            };
        },
        computed: {
            formConfigs() {
                const { i18nMappingObj } = this;
                const config = [
                    {
                        field: 'version',
                        label: i18nMappingObj.基线版本,
                        required: true,
                        slots: {
                            component: 'baseId'
                        }
                    },
                    {
                        field: 'versionId',
                        label: i18nMappingObj.当前版本,
                        required: true,
                        slots: {
                            component: 'newId'
                        }
                    }
                ];
                return config;
            }
        },
        watch: {
            currentId: {
                handler: function (newVal) {
                    this.formData.versionId = newVal;
                },
                immediate: true
            }
        },
        mounted() {},
        methods: {
            show() {
                this.visible = true;
            },
            submit() {
                const form = this.formData;

                if (form.version === '' || form.versionId === '') {
                    this.$message({
                        message: this.i18nMappingObj.选择版本不能为空,
                        type: 'warning'
                    });
                    return;
                }

                if (form.version === form.versionId) {
                    this.$message({
                        message: this.i18nMappingObj.请选择不同的版本,
                        type: 'warning'
                    });
                    return;
                }
                this.visible = false;
                const routeName = this.$route.query.docType === 'rest' ? 'compareRest' : 'compareDubbo';
                this.$router.push({
                    path: routeName,
                    query: {
                        serviceName: this.$route.query.serviceName,
                        appName: this.$route.query.appName,
                        docType: this.$route.query.docType
                    },
                    params: {
                        baseId: this.formData.version,
                        newId: this.formData.versionId,
                        list: this.list
                    }
                });
            },
            cancel() {
                this.visible = false;
            }
        }
    };
});
