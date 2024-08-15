/**
 * 组件
 * @type {import('./index.d.ts').Component}
 * @type {import('./index.d.ts').ComponentDefinition}
 * @type {import('./index.d.ts').ValidatorRule}
 */
define(['fam:kit', 'underscore', 'vue'], function () {
    const FamKit = require('fam:kit');
    const _ = require('underscore');
    const Vue = require('vue');

    return {
        namespaced: true,
        state: {
            // 组件
            definitions: {},
            // 组件只读映射 a组件的只读显示为b
            readonlyMapping: {},
            // 必填校验规则
            requiredValidatorMapping: {},
            // 组件配置信息，用于属性定义表单和类型属性表单
            propertiesMapping: {},
            // 表单常见组件校验规则
            validators: {},
            categories: [
                {
                    key: 'basic',
                    name: '基础组件',
                    nameI18nJson: { zh_cn: '基础组件', en_us: 'Basic Components' }
                },
                {
                    key: 'high-order',
                    name: '高级组件',
                    nameI18nJson: { zh_cn: '高级组件', en_us: 'High-Level Components' }
                },
                {
                    key: 'custom',
                    name: '自定义组件',
                    nameI18nJson: { zh_cn: '自定义组件', en_us: 'Custom Components' }
                }
            ],
            widgets: [],
            // 组件数据操作处理
            translationMapping: {}
        },
        mutations: {
            PUSH_DEFINITION(state, definition) {
                const definitions = state.definitions || {};
                definitions[FamKit.pascalize(definition.name)] = definition;
                state.definitions = definitions;
                if (!_.isString(definition.component)) {
                    Vue.component(definition.name, definition.component);
                }
            },
            PUSH_READONLY_MAP(state, payload) {
                state.readonlyMapping = _.extend(state.readonlyMapping, {
                    [payload.componentName]: payload.readonlyComponentName
                });
            },
            PUSH_TRANSLATION_MAP(state, payload) {
                state.translationMapping = _.extend(state.translationMapping, {
                    [payload.componentName]: payload.translation
                });
            },
            /**
             *
             * @param state
             * @param {ValidatorRule} validator
             */
            PUSH_VALIDATOR: (state, validator) => {
                state.validators = {
                    ...state.validators,
                    [validator.type]: validator
                };
            },
            PUSH_REQUIRED_VALIDATOR_MAP: (state, { componentName, validatorType }) => {
                state.requiredValidatorMapping = {
                    ...state.requiredValidatorMapping,
                    [FamKit.pascalize(componentName)]: validatorType
                };
            },
            PUSH_WIDGET(state, widget) {
                const widgets = state.widgets;
                state.widgets = [...widgets, widget];
            },
            PUSH_PROPERTIES_MAP(state, { componentName, properties }) {
                state.propertiesMapping = {
                    ...state.propertiesMapping,
                    [FamKit.pascalize(componentName)]: properties
                };
            }
        },
        actions: {
            /**
             *
             * @param commit
             * @param {ValidatorRule} validator
             */
            registerValidator({ commit }, validator) {
                return Promise.resolve(commit('PUSH_VALIDATOR', validator));
            },
            registerComponentDefinitions({ dispatch, state }, definitionList) {
                return Promise.all(
                    _.chain(definitionList)
                        .filter((definition) => !definition.skipRegister)
                        .map((definition) => dispatch('registerComponentDefinition', definition))
                        .value()
                );
            },
            registerComponentDefinition({ commit, state }, definition) {
                return new Promise((resolve, reject) => {
                    // 组件名必填
                    if (!definition.name) {
                        reject(new Error('component name is required.'));
                    }
                    // 组件不可重复注册
                    if (state.definitions[definition.name]) {
                        return resolve();
                    }
                    if (!definition.component && !definition.resourceUrl) {
                        resolve();
                        return;
                    }
                    if (definition.sync && definition.resourceUrl) {
                        require([definition.resourceUrl], function (component) {
                            definition.component = component;
                            commit('PUSH_DEFINITION', definition);
                            resolve(definition);
                        }, function onError(e) {
                            reject();
                        });
                    } else if (definition.resourceUrl) {
                        definition.component = (resolve) => {
                            require([definition.resourceUrl], function (component) {
                                resolve(component);
                            }, function onError(e) {
                                reject();
                            });
                        };
                        commit('PUSH_DEFINITION', definition);
                        resolve(definition);
                    } else {
                        commit('PUSH_DEFINITION', definition);
                        resolve(definition);
                    }
                });
            },
            registerReadonlyComponent({ dispatch, commit }, { componentName, readonly }) {
                return new Promise((resolve) => {
                    dispatch('registerComponentDefinition', readonly).then(() => {
                        commit('PUSH_READONLY_MAP', {
                            componentName,
                            readonlyComponentName: readonly.name
                        });
                        resolve();
                    });
                });
            },
            registerTranslationComponent({ dispatch, commit }, { componentName, translation }) {
                return new Promise((resolve) => {
                    commit('PUSH_TRANSLATION_MAP', {
                        componentName,
                        translation: translation
                    });
                    resolve();
                });
            },
            /**
             * 注册组件
             * @param commit
             * @param dispatch
             * @param state
             * @param { Component } component
             */
            registerComponent({ commit, dispatch, state }, component) {
                const { definition, requiredValidator, properties, readonly, translation } = component;

                const asyncTasks = [];

                if (!definition.skipRegister) {
                    asyncTasks.push(dispatch('registerComponentDefinition', definition));
                }

                // 注册只读组件
                if (readonly) {
                    asyncTasks.push(
                        dispatch('registerReadonlyComponent', {
                            readonly,
                            componentName: definition.name
                        })
                    );
                }

                if (translation) {
                    asyncTasks.push(
                        dispatch('registerTranslationComponent', {
                            translation,
                            componentName: definition.name
                        })
                    );
                }

                // 注册必填校验规则
                if (requiredValidator) {
                    const validator =
                        typeof requiredValidator === 'function'
                            ? {
                                  type: definition.name + '-required-validator',
                                  validator: requiredValidator
                              }
                            : requiredValidator;
                    asyncTasks.push(dispatch('registerValidator', validator));
                    commit('PUSH_REQUIRED_VALIDATOR_MAP', {
                        componentName: definition.name,
                        validatorType: validator.type
                    });
                }

                if (properties) {
                    commit('PUSH_PROPERTIES_MAP', {
                        componentName: definition.name,
                        properties: properties
                    });
                }

                return Promise.all(asyncTasks);
            },
            registerComponents({ dispatch, state, commit }, components) {
                return Promise.all(_.map(components, (component) => dispatch('registerComponent', component)));
            },
            // 注册widget的组件
            registerWidget({ commit, state }, widget) {
                return new Promise((resolve, reject) => {
                    if (_.some(state.widgets, { key: widget.key })) {
                        reject(new Error(`Widget key [${widget.key}] had been registered.`));
                    } else {
                        commit('PUSH_WIDGET', widget);
                        resolve(widget);
                    }
                });
            },
            registerWidgets({ dispatch }, widgets) {
                return Promise.all(
                    _.map(widgets, (widget) => {
                        return Promise.all(
                            _.union(
                                [
                                    // dispatch('registerWidget', {
                                    //     key: widget.key,
                                    //     category: widget.category,
                                    //     name: widget.name,
                                    //     schema: widget.schema,
                                    //     configurations: widget.configurations,
                                    //     nolabel: widget.nolabel
                                    // })
                                    dispatch('registerWidget', { ...widget })
                                ],
                                _.map(widget.configurations, (configuration) => {
                                    if (_.isObject(configuration)) {
                                        const conf = _.clone(configuration);
                                        // 统一追加组件命名空间
                                        let componentName = 'fam-form-widget-' + conf.name;
                                        conf.definition = {
                                            resourceUrl: conf.resourceUrl,
                                            component: conf.component,
                                            name: componentName,
                                            sync: false
                                        };

                                        return dispatch('registerComponent', conf);
                                    }
                                    return Promise.resolve();
                                })
                            )
                        );
                    })
                );
            }
        },
        getters: {
            readonlyComponent(state) {
                return function (componentName) {
                    const pascalizedName = FamKit.pascalize(componentName);
                    return state.readonlyMapping[pascalizedName] || state.readonlyMapping[componentName];
                };
            },
            componentTranslation(state) {
                return function (componentName) {
                    const pascalizedName = FamKit.pascalize(componentName);
                    return state.translationMapping[pascalizedName] || state.translationMapping[componentName];
                };
            },
            isConfigRegistered(state) {
                return function (name) {
                    const componentName1 = 'fam-form-widget-' + name;
                    const componentName2 = FamKit.pascalize('fam-form-widget-' + name);
                    const isRegistered = (componentNames) =>
                        componentNames.some((name) => {
                            return state.definitions.hasOwnProperty(name);
                        });
                    return isRegistered([componentName1, componentName2]);
                };
            },
            getWidgetByKey(state) {
                return function (widgetKey) {
                    const widgets = state.widgets;
                    return widgets.find((widget) => FamKit.isSameComponentName(widget.key, widgetKey));
                };
            }
        }
    };
});
