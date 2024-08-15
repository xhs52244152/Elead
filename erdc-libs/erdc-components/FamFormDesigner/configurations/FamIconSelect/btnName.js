define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.btnName"
                field="props.btnName"
            >
                <erd-input 
                    v-if="!readonly"
                    v-model="btnName" 
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseInput"
                ></erd-input>
                <span v-else>{{schema.defaultValue}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    btnName: this.getI18nByKey('按钮名称')
                }
            };
        },
        computed: {
            btnName: {
                get() {
                    return this.schema?.props?.btnName || '更改图标';
                },
                set(val) {
                    const props = this.schema.props || {};

                    this.$set(props, 'btnName', val);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
