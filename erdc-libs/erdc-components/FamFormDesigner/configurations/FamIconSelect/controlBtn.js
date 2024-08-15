define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.showBtn"
                field="props.visibleBtn"
            >
                <erd-checkbox
                    v-model="showBtn" 
                    v-bind="props"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    showBtn: this.getI18nByKey('是否显示按钮')
                }
            };
        },
        computed: {
            showBtn: {
                get() {
                    return this.schema?.props?.visibleBtn || false;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'visibleBtn', val);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
