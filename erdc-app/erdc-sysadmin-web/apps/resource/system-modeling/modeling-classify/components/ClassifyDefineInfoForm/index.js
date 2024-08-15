define([
    'text!' + ELMP.resource('system-modeling/modeling-classify/components/ClassifyDefineInfoForm/index.html'),
    'css!' + ELMP.resource('system-modeling/modeling-classify/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            readonly: Boolean,
            oid: String,
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            parentFormData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            parentId: {
                type: String,
                default: ''
            },
            appName: {
                type: String,
                default: 'plat'
            },
            typeData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            type: {
                type: String,
                default: 'create'
            },
            isApplication: Boolean
        },
        components: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-modeling/modeling-classify/locale/index.js'),
                i18nMappingObj: {
                    codeTip: this.getI18nByKey('codeTip')
                },
                // 租户信息
                defaultTypeName: JSON.parse(localStorage.getItem('tenantId')) + '_',
                innerFormData: {
                    typeName: '',
                    subtypeable: true,
                    icon: 'erd-iconfont erd-icon-triangle-left'
                }
            };
        },
        watch: {
            formData: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (!_.isEmpty(nv)) {
                        _.keys(nv).forEach((key) => {
                            if (this.isCreate) {
                                if (['code'].includes(key) && nv[key]) {
                                    this.$set(this.innerFormData, key, nv[key]);
                                }
                            } else {
                                this.$set(this.innerFormData, key, nv[key]);
                            }
                        });
                    } else {
                        this.innerFormData = {
                            typeName: '',
                            subtypeable: true,
                            icon: 'erd-iconfont erd-icon-triangle-left',
                            instantiable: true
                        };
                    }
                }
            },
            parentFormData: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (!_.isEmpty(nv)) {
                        _.keys(nv).forEach((key) => {
                            if (key.includes('_checked')) {
                                this.checkChange(this.formData[key], key.split('_checked')[0]);
                            }
                        });
                    }
                }
            }
        },
        computed: {
            formConfig() {
                return this.isApplication
                    ? [
                          {
                              field: 'displayName',
                              component: 'erd-input',
                              label: this.i18n.displayName,
                              validators: [],
                              props: {},
                              col: 12
                          },
                          {
                              // 枚举组件时，值选项显示内容
                              field: 'typeName',
                              component: 'erd-input',
                              label: this.i18n.internalName,
                              required: true,
                              props: {},
                              col: 12
                          }
                      ]
                    : [
                          {
                              // 枚举组件时，值选项显示内容
                              field: 'typeName',
                              component: 'erd-input',
                              label: this.i18n.internalName,
                              disabled: this.type === 'ceate',
                              readonly: this.isUpdate,
                              required: true,
                              props: {},
                              validators: [
                                  {
                                      validator: (rule, value, callback) => {
                                          let reg = /[^a-zA-Z0-9_.\- ]/g;
                                          if (value.match(reg)) {
                                              callback(new Error('请输入大小写字母、数字、"_"、"."、"-"'));
                                          } else if (!value.trim()) {
                                              callback(new Error('请填写内部名称'));
                                          } else {
                                              callback();
                                          }
                                      },
                                      trigger: ['blur', 'change']
                                  }
                              ],
                              slots: {
                                  component: 'typeNameComponent',
                                  readonly: 'typeNameReadonly'
                              },
                              col: 12
                          },
                          {
                              field: 'code',
                              component: 'erd-input',
                              label: this.i18n.code,
                              disabled: false,
                              required: true,
                              props: {},
                              col: 12
                          },
                          ...this.propertyConfig
                      ];
            },
            propertyConfig: {
                get() {
                    let propertyConfig = this.propertyMap.map((item) => {
                        const componentAttr = item?.constraintDefinitionDto || {};

                        const compName = componentAttr.componentName;
                        let enumData = new FormData();
                        enumData.append('realType', componentAttr?.dataKey);
                        let componentConf = this.fnComponentHandle(compName, true);
                        let formItemConfig = {
                            field: item?.name,
                            component: compName,
                            label: item?.displayName,
                            disabled: this.innerFormData[item.name + '_checked'],
                            hidden: !!componentAttr.isHidden,
                            readonly: !!componentAttr.isReadonly,
                            required: !!componentAttr.isRequired,
                            validators: [],
                            props: {},
                            checkbox: !['', '0'].includes(this.parentId) && !!item.isExtends,
                            checkboxModel: this.isCreate ? true : this.innerFormData[item.name + '_checked'],
                            checkboxListeners: {
                                checkboxChange: (event) => {
                                    this.checkChange(event, item.name);
                                }
                            },
                            col: 12
                        };
                        if (item.name === 'image') {
                            let componentConfig = {};
                            try {
                                componentConfig = JSON.parse(componentAttr.componentJson);
                            } catch (error) {
                                componentConfig = {};
                            }
                            formItemConfig = {
                                ...formItemConfig,
                                ...componentConfig
                            };
                            formItemConfig.props.acceptList = formItemConfig.props?.acceptList?.join() || '';
                            formItemConfig.props.showNoDataMark = !this.type && this.innerFormData.image_checked;
                        }
                        if (['displayName', 'description'].includes(item.name)) {
                            formItemConfig = {
                                ...formItemConfig,
                                component: 'FamI18nbasics',
                                validators:
                                    item.name === 'description'
                                        ? []
                                        : [
                                              {
                                                  type: 'FamI18nbasicsRequired'
                                              }
                                          ],
                                props: {
                                    clearable: true,
                                    placeholder: '请输入',
                                    type: item.name === 'description' ? 'textarea' : 'basics',
                                    i18nName: item.displayName
                                },
                                col: item.name === 'description' ? 24 : 12
                            };
                        } else if (item.name === 'icon') {
                            formItemConfig.props = {
                                visibleBtn: !this.innerFormData[item.name + '_checked'],
                                btnName: '选择图标'
                            };
                        } else {
                            if (FamKit.isSameComponentName(compName, 'FamBoolean')) {
                                formItemConfig['props'] = {
                                    type: 'basic',
                                    disabled: this.innerFormData[item.name + '_checked']
                                };
                            }
                            if (compName?.toLocaleUpperCase().includes('SELECT')) {
                                const config = this.getConfigTemp(
                                    componentAttr,
                                    enumData,
                                    componentConf.componentConfigs
                                );

                                // 编码规则, 修改header
                                if (item.name === 'numberRuleId') {
                                    config.data.appName = this.appName;
                                }
                                formItemConfig['props'] = {
                                    row: {
                                        componentName: FamKit.hyphenate(compName),
                                        requestConfig: config,
                                        clearNoData: true // value未匹配到option中数据时，清除数据项
                                    }
                                };
                            }
                        }
                        if (item.name === 'sort_order') {
                            formItemConfig['validators'] = [
                                {
                                    trigger: ['blur', 'change'],
                                    validator: (rule, value, callback) => {
                                        if (_.isEmpty(value)) {
                                            callback(new Error('请输入排序'));
                                        } else if (isNaN(Number(value))) {
                                            callback(new Error('请输入数字'));
                                        } else if (!Number.isInteger(Number(value)) || value < 0) {
                                            callback(new Error('请输入正整数'));
                                        } else {
                                            callback();
                                        }
                                    }
                                }
                            ];
                        }
                        if (item.name === 'codeForCodeRule') {
                            formItemConfig['tooltip'] = this.i18nMappingObj.codeTip;
                        }
                        return formItemConfig;
                    });
                    return propertyConfig;
                },
                set(val) {}
            },
            propertyMap() {
                return this.typeData || [];
            },
            isCreate() {
                return this.type === 'create';
            },
            isUpdate() {
                return this.type === 'update';
            }
        },
        mounted() {},
        methods: {
            formChange(isChange) {},
            submit() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = dynamicForm.serialize();
                                let attrRawLists = attrRawList.map((item) => {
                                    if (['displayName', 'description'].includes(item.attrName)) {
                                        item.languageJson = item?.value?.value || {};
                                    }
                                    if (item.attrName === 'typeName' && this.isCreate) {
                                        item.value = this.defaultTypeName + item.value;
                                    }
                                    if (item.attrName === 'image') {
                                        item.value = typeof item.value === 'string' ? item.value : item.value?.join();
                                    }
                                    item = {
                                        ...item,
                                        typePropertyDef:
                                            this.propertyMap.find((ite) => ite.name === item.attrName)?.oid || '',
                                        value: item.value instanceof Object ? item?.value?.value?.value : item.value,
                                        isExtends:
                                            attrRawList.find((ite) => item.attrName + '_checked' === ite.attrName)
                                                ?.value ?? false,
                                        name: item.attrName
                                    };
                                    return item;
                                });
                                resolve(attrRawLists);
                            } else {
                                reject(new Error('请填入正确的分类信息'));
                            }
                        })
                        .catch(reject);
                });
            },
            getConfigTemp(attr, enumData, originConfig) {
                let baseConfig = {};
                let baseMap = {
                    viewProperty: 'value',
                    valueProperty: 'name'
                };
                const isEmptyConfig = _.isEmpty(originConfig);
                if (isEmptyConfig) {
                    baseConfig = {
                        url: '/fam/listByKey',
                        data: {
                            className: attr.dataKey
                        },
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    };
                } else {
                    baseConfig = {
                        ...originConfig,
                        data: enumData,
                        ...baseMap
                    };
                }
                return baseConfig;
            },
            checkChange(isChecked, name) {
                let configItem = this.propertyConfig.find((item) => item.field === name);
                // 创建分类选中继承, 取当前分类(即创建的分类的父级)的数据
                // 更新布局时, 需要取父级数据, 并且在取消选中时还原回当前的数据
                const isBooleanComponent = FamKit.isSameComponentName(configItem.component, 'FamBoolean');
                if (isChecked) {
                    if (this.isCreate) {
                        this.$set(this.innerFormData, name, this.formData[name]);

                        if (isBooleanComponent) {
                            this.$set(this.innerFormData, name, JSON.parse(this.formData[name] || 'false'));
                        }
                    } else {
                        this.$set(this.innerFormData, name, this.parentFormData[name]);

                        if (isBooleanComponent) {
                            this.$set(this.innerFormData, name, JSON.parse(this.parentFormData[name] || 'false'));
                        }
                    }
                    configItem.disabled = true;
                } else {
                    configItem.disabled = false;
                    if (this.isUpdate) {
                        this.$set(this.innerFormData, name, this.formData[name]);

                        if (isBooleanComponent) {
                            this.$set(this.innerFormData, name, JSON.parse(this.formData[name] || 'false'));
                        }
                    }
                }
                this.$set(this.innerFormData, name + '_checked', isChecked);
            }
        }
    };
});
