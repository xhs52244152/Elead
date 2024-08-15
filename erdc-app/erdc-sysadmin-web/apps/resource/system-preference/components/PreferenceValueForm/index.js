define([
    'erdc-kit',
    'text!' + ELMP.resource('system-preference/components/PreferenceValueForm/index.html'),
    'css!' + ELMP.resource('system-preference/components/PreferenceValueForm/style.css')
], function (ErdcKit, template) {
    const store = require('fam:store');

    return {
        template,
        props: {
            oid: {
                type: String | Array,
                default: ''
            },
            formData: {
                type: Object,
                default() {
                    return {};
                }
            },
            data: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean
        },
        components: {},
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-preference/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    configValue: this.getI18nByKey('configValue'),
                    configurationItem: this.getI18nByKey('configurationItem')
                },
                unfold: true,
                customComponent: [],
                componentRefName: ''
            };
        },
        watch: {
            componentRefName(nv) {
                if (nv) {
                    if (nv === 'erd-switch') {
                        try {
                            this.formDataMailResource.configValue = JSON.parse(this.formDataMailResource.configValue);
                        } catch {
                            this.formDataMailResource.configValue = true;
                        }
                    }
                }
            }
        },
        computed: {
            itemFormData() {
                return {
                    displayName: this.formData?.displayName || ''
                };
            },
            formDataMailResource: {
                get() {
                    // realType 为 object 的时候, 取到的 configValue 可能是一个对象或者一个数组, 不为 object 时, configValue 应该为一个字符串
                    let configValue =
                        this.data.realType === 'object'
                            ? JSON.parse(this.formData?.data?.configValue || '{}')
                            : this.formData?.data?.configValue || '';
                    return {
                        configValue: configValue
                    };
                },
                set() {}
            },
            appList: function () {
                return store.state.app.appNames || [];
            },
            formConfigItem() {
                return [
                    {
                        field: 'displayName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['configurationItem'],
                        readonly: true,
                        col: 12
                    }
                ];
            },
            formConfig() {
                let componentRefName = this.componentRefName;
                let componentsJson = this.formData?.componentsJson;
                try {
                    componentsJson = JSON.parse(this.formData?.componentsJson);
                } catch (error) {
                    componentsJson = {};
                }
                let row = componentsJson?.props?.row || {};
                if (componentRefName === 'custom-virtual-enum-select') {
                    row = {
                        componentName: 'virtual-select',
                        clearNoData: true,
                        requestConfig: {
                            url: '/fam/type/component/enumDataList',
                            viewProperty: 'value',
                            valueProperty: 'name',
                            params: {
                                realType: this.data?.dataKey || ''
                            },
                            method: 'POST'
                        }
                    };
                }
                const formConfig = [
                    {
                        field: 'configValue',
                        component: componentRefName,
                        label: this.i18nMappingObj['configValue'],
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        col: 24,
                        ...componentsJson,
                        props: {
                            'item-name': this.data?.dataKey || '',
                            'visible-btn': true,
                            'maxlength': 9999999999,
                            ...componentsJson.props,
                            'row': {
                                ...row,
                                ...componentsJson?.props?.row
                            }
                        }
                    }
                ];
                return formConfig;
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.init();
            });
        },
        methods: {
            init() {
                if (this.data.realType === 'object') {
                    // 使用自定义上传的组件
                    this.customComponent = [];
                    const configFileIds = this.formData?.data?.fileId || [];
                    const authorizeCode = this.formData?.data?.authorizeCode || {};
                    configFileIds.forEach((fileId) => {
                        const formData = JSON.parse(this.formData?.data?.configValue || '{}');
                        this.customComponent.push({
                            component: (apply) =>
                                ErdcKit.downloadFile(fileId, authorizeCode[fileId], true, (url) => {
                                    require([url], (module) => {
                                        module('', (options) => apply(options));
                                    });
                                }, false, false),
                            formData: formData
                        });
                    });
                } else {
                    this.getComponent();
                }
            },
            formChange(isChanged) {
                this.$emit('form-change', isChanged);
            },
            submit() {
                return new Promise((resolve, reject) => {
                    if (this.data.realType === 'object') {
                        const promiseAll = this.formChangeData();
                        Promise.all(promiseAll)
                            .then((res) => {
                                // let formData = {};
                                // res.forEach((item) => {
                                //     formData[item.id] = item.configValue;
                                // });
                                resolve(res[0]);
                            })
                            .catch(reject);
                    } else {
                        const { preferenceForm } = this.$refs;
                        preferenceForm
                            .submit()
                            .then(({ valid, data }) => {
                                if (valid) {
                                    resolve(data?.configValue ?? '');
                                } else {
                                    reject(new Error('请填入正确的配置值信息'));
                                }
                            })
                            .catch(reject);
                    }
                });
            },
            formChangeData() {
                const { preferenceForm } = this.$refs;
                const promiseAll = [];
                preferenceForm.forEach((ref) => {
                    promiseAll.push(ref.submit());
                });
                return promiseAll;
            },
            // 获取组件下拉列表数据，防止多次请求数据
            getComponent() {
                this.$famHttp({
                    url: '/fam/type/component/listData'
                })
                    .then((resp) => {
                        const { data } = resp;
                        data.forEach((item) => {
                            if (item.oid === this.data.componentRef) {
                                this.componentRefName = ErdcKit.hyphenate(item.name);
                            }
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        }
    };
});
