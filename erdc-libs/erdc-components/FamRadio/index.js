/**
 * # 选项组件
    # 页面调用
    options:  选项列表
    border:  边框 // 默认false
    button:  按钮样式 // 默认false

    <FamRadio
    :options="optionsList"
    ></FamRadio>

    动态表单使用
    {
        field: 'type',
        component: 'FamRadio',
        label: '类型',
        labelLangKey: 'type',
        disabled: false,
        required: false,
        validators: [],
        hidden: false,
        props: {
            type: 'radio',
            options: [
                {
                    label: '测试1',
                    name:{
                        value: {
                            value: '测试1'
                        }
                    },
                    value: '1'
                },
                {
                    label: '测试2',
                    name:{
                        value: {
                            value: '测试2'
                        }
                    },
                    value: '2'
                },
            ],
        },
        col: 24
    },
 * 
 * **/
define(['fam:kit'], function () {
    const FamKit = require('fam:kit');

    return {
        /*html*/
        template: `
            <div id="FamRadio">
                <erd-radio-group
                    v-model="checkValue"
                    v-for="(item,index) in optionsList"
                    :key="index"
                    :disabled="disabled"
                    v-on="$listeners"
                >
                    <erd-radio
                        v-if="!button"
                        style="margin-right:10px;"
                        :button="button"
                        :border="border"
                        :disabled="item.disabled"
                        :label="item[defaultProps.value]"
                    >
                        {{translateLabel(item)}}
                    </erd-radio>
                    <erd-radio-button
                        v-else
                        style="margin-right:10px;"
                        :button="button"
                        :border="border"
                        :label="item[defaultProps.value]"
                        :disabled="item.disabled"
                    >
                        {{translateLabel(item)}}
                    </erd-radio-button>
                </erd-radio-group>
            </div>
        `,
        props: {
            value: {
                type: [String, Array, Boolean],
                default() {
                    return '';
                }
            },
            options: {
                type: Array,
                default() {
                    return [];
                }
            },
            border: {
                type: Boolean,
                default: false
            },
            button: {
                type: Boolean,
                default: false
            },
            disabled: Boolean,
            defaultProps: {
                type: Object,
                default() {
                    return {
                        label: 'label',
                        value: 'value'
                    };
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
        },
        computed: {
            optionsList() {
                return this.options;
            },
            checkValue: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit('input', value);
                    this.$emit('update:value', value);
                }
            }
        },
        methods: {
            translateLabel(item) {
                return FamKit.translateI18n(item?.name?.value) || item?.[this.defaultProps.label] || '';
            }
        }
    };
});
