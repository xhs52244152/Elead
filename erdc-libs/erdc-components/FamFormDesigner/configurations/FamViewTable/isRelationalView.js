define(['fam:store', 'fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    store,
    FamKit,
    ConfigurationMixin
) {
    const _ = require('underscore');

    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
            <fam-dynamic-form-item
                :label="i18nMappingObj.label"
                field="props.isRelationalView"
                :disabled="disabled"
            >
                <template v-if="!readonly">
                    <fam-boolean
                        v-model="isRelationalView"
                        type="basic"
                        :disabled="disabled"
                        v-bind="props">
                    </fam-boolean>
                </template>
                <span v-else>
                    {{ display }}
                </span>
            </fam-dynamic-form-item>
        `,
        inject: ['typeOid', 'attributeList'],
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    label: this.getI18nByKey('relationView')
                },
                attributes: []
            };
        },
        watch: {},
        computed: {
            disabled() {
                // 当前选择了关联属性，就代表着这个视图就是一个关联视图，关联属性设置为是，并且不可修改
                return !!this.schema.field;
            },
            display() {
                return this.schema?.props?.isRelationalView ? '是' : '否';
            },
            isRelationalView: {
                get() {
                    return this.schema?.props?.isRelationalView ?? false;
                },
                set(isRelationalView) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'isRelationalView', isRelationalView, this, '.');
                    this.setSchemaValue('props', props);
                }
            }
        },
        methods: {}
    };
});
