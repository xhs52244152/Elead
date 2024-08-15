define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.showBtn"
                field="props.button"
                :label-width="labelWidth"
            >
                <erd-checkbox
                    v-model="showBtn" 
                    v-bind="props"
                    :border="false"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    showBtn: this.getI18nByKey('显示按钮样式')
                }
            };
        },
        computed: {
            showBtn: {
                get() {
                    return this.schema?.props?.button || false;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'button', val);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
