define([
    'fam:store'
], function () {

    const _ = require('underscore');
    const store = require('fam:store');

    const state = {
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
        widgets: []
    };

    const mutations = {
        PUSH_WIDGET(state, widget) {
            const widgets = state.widgets;
            state.widgets = [...widgets, widget];
        }
    };

    const actions = {
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
            return Promise.all(_.map(widgets, widget => {
                return Promise.all(
                    _.union(
                        [
                            dispatch('registerWidget', {
                                key: widget.key,
                                category: widget.category,
                                name: widget.name,
                                schema: widget.schema,
                                configurations: widget.configurations
                            })
                        ],
                        _.map(widget.configurations, configuration => {
                            if (_.isObject(configuration)) {
                                const component = _.clone(configuration);
                                // 统一追加组件命名空间
                                component.name = 'fam-form-widget-' + component.name;
                                return store.dispatch('component/registerImplement', component);
                            }
                            return Promise.resolve();
                        })
                    )
                );
            }));
        }
    };

    function registerModule(parentStore) {
        parentStore.registerModule('famFormDesigner', {
            namespaced: true,
            state,
            mutations,
            actions
        });
    }

    return {
        registerModule
    };
});
