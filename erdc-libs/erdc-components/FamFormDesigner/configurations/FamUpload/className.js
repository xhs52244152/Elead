define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18nMappingObj.className"
            field="props.action"
        >
            <erd-input
                v-if="!readonly"
                v-model="schema.props.className"
                v-bind="props"
                clearable
            ></erd-input>
            <span v-else>
                {{schema.props.className}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    className: this.getI18nByKey('className'),
                    pleaseInput: this.getI18nByKey('请输入')
                }
            };
        },
        methods: {
            onChange() {
                const props = this.widget.schema.props;
                this.$set(props, 'className', this.schema.className);
                this.setSchemaValue('props', props);
            }
        }
    };
});
