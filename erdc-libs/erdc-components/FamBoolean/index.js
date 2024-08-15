/**
 * # 布尔组件
    # 页面调用
    type:  basic 单选框 /  select 下拉框
    disabled： 禁用
    <FamBoolean
    type="basic"
    :disabled="disabled"
    ></FamBoolean>

    obj = {
        field: val.name,
        component: 'FamBoolean',
        label: val.displayName,
        labelLangKey: val.displayName,
        disabled: false,
        hidden: componentAttr.isHidden || false,
        readonly: componentAttr.isReadonly || false,
        required: false,
        validators: [],
        props: {
        type: 'basic',
        disabled: val.name + '_checked'
        },
        col: 12,
    }
 * 
 * **/
define([], function () {
    return {
        /*html*/
        template: `
            <div id="FamBoolean">
                <div v-if="readonly" class="bllean-readonly">
                    {{readonlyString}}
                </div>
                <div v-else-if="type == 'basic'">
                    <erd-radio-group
                    v-model="defaultValue"
                    :disabled="disabled">
                        <erd-radio :label="true">{{i18nMappingObj.yes}}</erd-radio>
                        <erd-radio :label="false">{{i18nMappingObj.no}}</erd-radio>
                    </erd-radio-group>
                </div>
                <div v-else-if="type == 'select'">
                    <erd-select 
                    style="width: 100%"
                    v-model="defaultValue"
                    :placeholder="i18nMappingObj.select" 
                    :disabled="disabled" 
                    clearable>
                        <erd-option
                            v-for="item in options"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value">
                        </erd-option>
                    </erd-select>
                </div>
            </div>
        `,
        props: {
            value: {
                type: [String, Boolean],
                default() {
                    return '';
                }
            },
            disabled: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: 'basic'
            },
            readonly: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            defaultValue: {
                get() {
                    return typeof this.value === 'boolean'
                        ? this.value
                        : this.value === 'true'
                        ? true
                        : this.value === 'false'
                        ? false
                        : '';
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            options() {
                return [
                    {
                        value: true,
                        label: this.i18nMappingObj['yes']
                    },
                    {
                        value: false,
                        label: this.i18nMappingObj['no']
                    }
                ];
            },
            readonlyString() {
                if (typeof this.defaultValue === 'boolean') {
                    return this.defaultValue ? this.i18nMappingObj.yes : this.i18nMappingObj.no;
                } else {
                    return '';
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamBoolean/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    select: this.getI18nByKey('请选择')
                }
            };
        }
    };
});
