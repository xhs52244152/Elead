/**
 * 动态表单组件配置项extends
 * 已识别的场景：
 * 1. 动态表单设计器在线设计时，右侧的组件设置面板需要获取到组件配置列表
 * 2. 定义【类型属性定义】时需要给属性定义提供一套默认的组件选项值
 * 3. 定义【属性字段】时需要给属性提供一套默认的组件选项值
 */
define(['fam:kit', 'underscore'], function() {

    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        computed: {
            widgetDefinitions() {
                return this.$store.state.component?.widgets || [];
            }
        },
        methods: {
            /**
             *
             * @param {string|object} configuration
             * @returns {*}
             */
            getConfigurationComponent(configuration) {
                let result = 'fam-form-widget-';
                if (_.isString(configuration)) {
                    return result + configuration.replace(/\//g, '-');
                } else if (configuration && configuration.name) {
                    return result + configuration.name.replace(/\//g, '-');
                }
                return null;
            },
            /**
             * 通过组件名称获取对应组件widget定义
             * 注意：不一定能获取到widget定义（因为CCC内不一定会包含相关组件的定义），默认使用的是输入框配置信息
             * @param {string} componentName
             * @return {Object} widget
             */
            getWidgetDefinition(componentName) {
                const widgetDefinitions = this.widgetDefinitions;
                const findWidget = (componentName) => {
                    return _.find(widgetDefinitions, (widget) => {
                        return _.includes(
                            _.compact([FamKit.pascalize(widget.key), FamKit.pascalize(widget.schema?.component)]),
                            FamKit.pascalize(componentName)
                        );
                    });
                };
                return findWidget(componentName) || findWidget('erd-input');
            },
            /**
             * 判断一个配置项是否需要显示在页面上
             * @param {string|object} configuration - 配置项定义信息，可能是字符串，也可能是一个VueComponent
             * @param {object} schema - widget的schema信息
             * @returns {boolean}
             */
            isConfigurationShows(configuration, schema) {
                if (typeof configuration.hidden === 'function') {
                    return !configuration.hidden(schema, configuration);
                }
                return !configuration.hidden;
            }
        }
    };
});
