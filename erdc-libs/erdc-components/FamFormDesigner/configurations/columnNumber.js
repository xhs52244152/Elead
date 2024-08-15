define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.grid"
                field="col"
                :tooltip="i18nMappingObj.columnNumberTips"
            >
                <erd-input-number
                    v-if="!readonly"
                    v-model.number="col"
                    :maxlength="2"
                    type="number"
                    :min="1"
                    :max="24"
                    :disabled="widget.block"
                    v-bind="props"
                    @change="handleChange"
                ></erd-input-number>
                <span v-else>{{col}}</span>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    'grid': this.getI18nByKey('栅格'),
                    'columnNumberTips': this.getI18nByKey('columnNumberTips'),
                }
            };
        },
        computed: {
            col: {
                get() {
                    return this.schema.col;
                },
                set(value) {
                    this.setSchemaValue('col', value);
                    this.setSchemaValue('columnNumber', value);
                }
            }
        },
        methods: {
            handleChange() {
                let value = Number((this.col + '').replace(/^(0+)|\D+/g, ''));
                if (value !== value) {
                    value = 12;
                }
                value = value > 24 ? 24 : value;
                value = value <= 1 ? 1 : value;
                this.col = value;
            }
        }
    };
});
