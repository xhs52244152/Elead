define([
    'erdcloud.kit',
    'text!' + ELMP.resource('erdc-components/FamFormDesigner/configurations/template.html'),
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js'),
    'vue',
    'underscore',
    'fam:ccc',
    'fam:kit'
], function (ErdcKit, template, ConfigurationMixin) {
    const Vue = require('vue');
    const CCC = require('fam:ccc');
    const _ = require('underscore');

    const parser = new DOMParser();
    const doc = parser.parseFromString(template, 'text/html');

    const typeTemplateMapping = {
        default: '#fam-widget-configuration-common-tmpl',
        table: '#fam-widget-configuration-table-tmpl',
        separator: '#fam-widget-separator-tmpl'
    };

    function queryTemplate(querySelector) {
        return doc.querySelector(querySelector)?.innerHTML;
    }

    const getWcdComponent = (wcd, skeleton) => {
        const { name, components = {} } = wcd;

        return {
            name: 'fam-form-widget-' + name,
            mixins: [ConfigurationMixin],
            extends: skeleton,
            components,
            props: {
                formData: Object
            },
            data() {
                return {
                    wcd,
                    deferredValue: undefined,
                    i18nLocalePath: wcd.i18n?.uri || ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                    i18nMappingObj: wcd.i18n?.mapping || {
                        pleaseInput: this.getI18nByKey('请输入'),
                        pleaseSelect: this.getI18nByKey('请选择')
                    }
                };
            },
            computed: {
                formItem() {
                    const formItem =
                        typeof this.wcd.formItem === 'function' ? this.wcd.formItem(this) : this.wcd.formItem;
                    if (formItem?.props && this.preventRequired) {
                        delete formItem.props.required;
                    }
                    return typeof this.wcd.formItem === 'function' ? this.wcd.formItem(this) : this.wcd.formItem;
                },
                wcdComponent() {
                    return this.readonly
                        ? this.readonlyComponent(this.formItem?.component || 'erd-input')
                        : this.formItem?.component;
                },
                wcdProps() {
                    const props = _.extend({}, this.formItem?.props || {});
                    if (this.preventRequired) {
                        delete props.required;
                    }
                    return props;
                },
                innerValue: {
                    get() {
                        return this.deferredValue ?? this.getFieldValue(this.wcd.name);
                    },
                    set(value) {
                        if (this.wcdProps.deferred) {
                            this.deferredValue = value;
                        } else {
                            this.setDeepValue(this.wcd.name, value);
                        }
                    }
                }
            },
            mounted() {
                if (
                    typeof this.getDeepValue(this.wcd.name) === 'undefined' &&
                    Object.hasOwn(this.wcd, 'defaultValue')
                ) {
                    this.setDeepValue(this.wcd.name, this.wcd.defaultValue);
                }
            },
            methods: {
                onInput(value) {
                    this.innerValue = value;
                    this.handlerWcdEvent('input', value);
                },
                onBlur() {
                    const value = this.innerValue;
                    if (this.wcdProps.deferred) {
                        this.setDeepValue(this.wcd.name, value);
                    }
                    this.handlerWcdEvent('blur', value);
                },
                onChange(value) {
                    this.handlerWcdEvent('change', value);
                },
                handlerWcdEvent(eventName, value) {
                    const listeners = this.formItem?.listeners || {};
                    const customListener = listeners[eventName];
                    let functor = customListener;
                    let isReturnMode = false;
                    if (typeof customListener === 'string') {
                        try {
                            isReturnMode = /^\s*return\b/.test(customListener);
                            functor = new Function(`${customListener}`).bind(this);
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    if (typeof functor === 'function') {
                        try {
                            if (isReturnMode) {
                                functor.call(this)(value, this);
                            } else {
                                functor.call(this, value);
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                    this.$emit(eventName, value);
                },
                readonlyComponent(componentName) {
                    let result;
                    if (typeof componentName === 'string') {
                        result = this.$store.getters['component/readonlyComponent'](componentName);
                    }
                    if (!result && ErdcKit.isSameComponentName(componentName, 'erd-input')) {
                        result = {
                            template: `
                                <span>{{value || '--'}}</span>
                            `,
                            props: {
                                value: String
                            }
                        };
                    } else {
                        result = componentName;
                    }
                    return result;
                }
            }
        };
    };

    /**
     * @typedef {Object} WidgetConfigDescription
     * @description 用来描述 WidgetConfigurations
     * @property {string} name - 配置项修改的 schema 字段
     * @property {string} [label] - 配置项名称
     * @property {Object} [i18n] - 国际化
     * @property {Object} [i18n.uri] - 国际化文件地址
     * @property {Object} [i18n.mapping] - 配置项国际化映射
     * @property {string} [description] - 配置项用途
     * @property {string} [defaultValue] - 配置项默认值（只在渲染时有用）
     * @property {string} [type] - 配置项类型
     * @property {string} [template] - 自定义渲染
     * @property {Object} [formItem] - 配置项编辑配置
     * @property {Object} [formItem.component] - 配置项展示方式
     * @property {Object} [formItem.props] - 配置项配置
     * @property {{ [eventName: string]: [handler: Function|string] }} [formItem.listeners] - 监听的事件
     */

    /**
     * 根据配置描述生成 Widget 配置设置器
     * @param  {WidgetConfigDescription } wcd
     */
    const generateConfiguration = function (wcd = {}) {
        const template = typeof wcd.template === 'function' ? wcd.template() : wcd.template;
        const defaultTemplate = typeTemplateMapping.default;
        const typeTemplate = typeTemplateMapping[wcd.type] || defaultTemplate;
        let skeleton = Vue.compile(template || queryTemplate(typeTemplate));

        return Vue.extend(getWcdComponent(wcd, skeleton));
    };

    const getConfigurations = function (configs, customize) {
        return CCC.useWidgetConfigs(configs, {
            resourceUrl: (name) => ELMP.resource(`erdc-components/FamFormDesigner/configurations/${name}.js`),
            generateConfiguration,
            customize(name, config) {
                if (name === 'field') {
                    config.props.clearable = true;
                }
                if (typeof customize === 'function') {
                    return customize(name, config) || config;
                }
                return config;
            }
        });
    };

    return {
        getConfigurations,
        generateConfiguration
    };
});
