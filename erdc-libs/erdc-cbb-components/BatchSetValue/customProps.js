define([ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js')], function (
    fieldTypeMapping
) {
    const _ = require('underscore');

    return {
        mixins: [fieldTypeMapping],
        props: {
            // 组件额外props
            columnComponentProps: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        methods: {
            // 根据组件名，映射需要显示的组件
            showComponent(row) {
                return this.fnComponentHandle(row?.fieldType).showComponent;
            },
            // 动态渲染组件额外配置
            additionalConfiguration(data) {
                const props = this.generateAdditionalProp({
                    filter: { ...data?.constraintDefinitionDto, operVal: '' },
                    inputType: data?.inputType
                });
                const outterProps = this.columnComponentProps?.[data.attrName] || {};
                const customProps = this.getCustomProps(data);
                return Object.assign({}, props, customProps, outterProps);
            },
            // 组件自定义props
            getCustomProps(data) {
                let compName = this.fnComponentHandle(data?.fieldType).showComponent,
                    componentJson = {};
                try {
                    componentJson = JSON.parse(data?.constraintDefinitionDto?.componentJson);
                } catch {
                    componentJson = {};
                }
                if (_.isEmpty(componentJson?.props)) {
                    componentJson.props = {};
                }
                if (_.isEmpty(componentJson?.props?.row)) {
                    componentJson.props.row = {};
                }
                // 枚举下拉框
                if (data?.constraintDefinitionDto?.componentName === 'CustomVirtualEnumSelect') {
                    componentJson.props.row.enumClass = data?.constraintDefinitionDto?.dataKey;
                }
                // 数据字典
                if (data?.constraintDefinitionDto?.componentName === 'FamDict') {
                    componentJson.props.row.dataKey = data?.constraintDefinitionDto?.dataKey;
                }
                // 选人组件
                if (compName === 'fam-member-select') {
                    componentJson.props.isgetdisable = false;
                }
                componentJson.props.row.componentName = data?.constraintDefinitionDto?.componentName || '';
                componentJson.props.row.dataKey = data?.constraintDefinitionDto?.dataKey;
                componentJson.props.row.dataKey = data?.constraintDefinitionDto?.dataKey;
                data?.constraintDefinitionDto?.maxLength &&
                    (componentJson.props.maxlength = data.constraintDefinitionDto.maxLength);

                let customProps = {};
                Object.keys(componentJson?.props || {}).forEach((key) => {
                    if (!key.includes(' ')) customProps[key] = componentJson.props[key];
                });
                return customProps;
            }
        }
    };
});
