define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.type"
                field="props.type"
            >
                <erd-select
                    v-if="!readonly"
                    v-model="type"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseSelect"
                >
                    <erd-option
                        :label="i18nMappingObj.text"
                        value="basics"
                    ></erd-option>
                    <erd-option
                        :label="i18nMappingObj.textarea"
                        value="textarea"
                    ></erd-option>
                </erd-select>
                <span v-else>
                    {{ translated }}
                </span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    type: this.getI18nByKey('类型'),
                    text: this.getI18nByKey('文本框'),
                    textarea: this.getI18nByKey('文本域'),
                    pleaseSelect: this.getI18nByKey('请选择')
                }
            };
        },
        computed: {
            type: {
                get() {
                    return this.schema?.props?.type || 'basics';
                },
                set(type) {
                    const props = this.schema.props || {};
                    this.$set(props, 'type', type);
                    this.setSchemaValue('props', props);
                }
            },
            translated() {
                let langKey = this.type || 'basics';
                langKey = langKey === 'basics' ? 'text' : langKey || 'text';
                return this.i18nMappingObj[langKey];
            }
        }
    };
});
