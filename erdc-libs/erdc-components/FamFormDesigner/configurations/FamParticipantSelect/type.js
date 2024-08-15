define(['fam:kit', ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (
    FamKit,
    ConfigurationMixin
) {
    return {
        mixins: [ConfigurationMixin],

        /*html*/
        template: `
        <fam-dynamic-form-item
            :label="i18n.queryTarget"
            field="type"
            :tooltip="i18nMappingObj.tooltip"
            :label-width="labelWidth"
            :disabled="disabled"
        >
        <erd-select 
            v-if="!readonly"
            v-model="type"
            class="w-100p"
            :disabled="disabled"
            filterable
            clearable
        >
            <erd-option
                v-for="item in typeArr"
                :key="item.value"
                :label="item.displayName"
                :value="item.value">
            </erd-option>
        </erd-select>
            <span v-else>
                {{multipleText}}
            </span>
        </fam-dynamic-form-item>
        `,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    tooltip: this.getI18nByKey('setQueryTarget')
                }
            };
        },
        watch: {
            type: {
                deep: true,
                immediate: true,
                handler(type) {
                    if(type === undefined) {
                        const props = this.schema.props || {};
                        FamKit.setFieldValue(props, 'type', 'USER', this, '.');
                        FamKit.setFieldValue(props, 'showType', ['USER'], this, '.');
                        this.setSchemaValue('props', props);
                    }
                }
            }
        },
        computed: {
            disabled() {
                // 当前widget如果是AttributeWidget (从属性面板拖拽出来的)，则禁止修改field
                return this.widget.flag === 'ATTR';
            },
            type: {
                get() {
                    return this.schema.props?.type || '';
                },
                set(type) {
                    const props = this.schema.props || {};
                    FamKit.setFieldValue(props, 'type', type, this, '.');
                    FamKit.setFieldValue(props, 'showType', [type], this, '.');
                    this.setSchemaValue('props', props);
                }
            },
            typeArr() {
                const typeArr = [
                    {
                        displayName: this.i18n.USER,
                        value: 'USER'
                    },
                    {
                        displayName: this.i18n.ROLE,
                        value: 'ROLE'
                    },
                    {
                        displayName: this.i18n.GROUP,
                        value: 'GROUP'
                    },
                    {
                        displayName: this.i18n.ORG,
                        value: 'ORG'
                    }
                ];
                return typeArr;
            },
            multipleText() {
                return this.typeArr.find((item) => this.type === item.value)?.displayName;
            }
        }
    };
});
