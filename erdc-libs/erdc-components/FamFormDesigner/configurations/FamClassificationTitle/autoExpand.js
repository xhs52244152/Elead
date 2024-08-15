define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.autoExpand"
                field="props.unfold"
            >
                <erd-checkbox
                    v-model="showUnfold"
                    v-bind="props"
                ></erd-checkbox>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    autoExpand: this.getI18nByKey('是否默认展开')
                }
            };
        },
        computed: {
            showUnfold: {
                get() {
                    return this.schema?.props?.unfold == undefined ? true : this.schema?.props?.unfold;
                },
                set(val) {
                    const props = this.schema.props || {};
                    this.$set(props, 'unfold', val);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
