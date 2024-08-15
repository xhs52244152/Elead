define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.type"
                field="props.type"
            >
                <erd-ex-select
                    v-if="!readonly"
                    class="block w-100p"
                    v-model="type"
                    v-bind="props"
                    :placeholder="i18nMappingObj.pleaseSelect"
                >
                    <erd-option
                        :label="i18nMappingObj.text"
                        value="text"
                    ></erd-option>
                    <erd-option
                        :label="i18nMappingObj.textarea"
                        value="textarea"
                    ></erd-option>
                </erd-ex-select>
                <span v-else>
                    {{ i18nMappingObj[type || 'text'] || '' }}
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
                    return this.schema?.props?.type || 'text';
                },
                set(type) {
                    const props = this.schema.props || {};
                    this.$set(props, 'type', type);
                    this.setSchemaValue('props', props);
                }
            }
        }
    };
});
