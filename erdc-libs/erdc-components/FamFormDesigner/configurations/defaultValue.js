define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js'), 'fam:kit', 'underscore'], function (
    ConfigurationMixin
) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        mixins: [ConfigurationMixin],
        components: {
            FormWidget: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/FormWidget.js'))
        },
        template: `
            <FormWidget
                :widget="innerWidget"
                v-bind="scope"
                :form.sync="innerWidget.schema"
                :readonly="readonly"
                :label="i18n.defaultValue"
                field="defaultValue"
                :scope="scope"
                :required="false"
                hide-error-message
                :has-error="false"
                disableValidate
                :hidden="false"
                :readonly-component="readonlyComponent"
                :emitFieldEvent="emitFieldEvent"
            ></FormWidget>
        `,
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js')
            };
        },
        computed: {
            innerWidget() {
                const widget = _.clone(this.widget);
                const schema = _.clone(this.widget.schema);
                schema.label = this.i18n.defaultValue;
                schema.required = false;
                delete schema.nameI18nJson;

                const requestConfig = schema?.props?.row?.requestConfig;
                if (schema.field === 'classifyReference' || requestConfig?.url.includes('classify/tree')) {
                    // 分类属性 增加typeName 过滤下拉列表
                    if (requestConfig?.data) {
                        schema.props.row.requestConfig.data.typeName = this.designer?.vm?.typeName;
                    }

                    // 去除parentId 避免树组件渲染失败
                    requestConfig.transformResponse = [
                        (data) => {
                            let jsonData = JSON.parse(data);
                            if (jsonData?.data?.length === 1 && jsonData.data[0].parentId) {
                                delete jsonData.data[0].parentId;
                            }
                            return jsonData;
                        }
                    ];
                }
                schema.field = 'defaultValue';
                widget.schema = schema;
                return widget;
            }
        },
        methods: {
            readonlyComponent(componentName) {
                if (typeof componentName === 'string') {
                    return this.$store.getters['component/readonlyComponent'](componentName);
                }
                return componentName;
            },
            emitFieldEvent(eventName, schema) {
                if (eventName === 'input') {
                    this.setSchemaValue(schema.field, schema.defaultValue);
                }
            }
        }
    };
});
