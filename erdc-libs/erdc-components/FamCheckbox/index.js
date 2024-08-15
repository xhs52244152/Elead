/**
 * # 选项组件
    # 页面调用
    options:  选项列表
    checkedList:  当前选中值 // 数组
    border:  边框  // 默认false
    button:  按钮样式   // 默认false
    
    <FamCheckbox
    type="radio"
    :options="optionsList"
    ></FamCheckbox>

    动态表单使用
    {
        field: 'type',
        component: 'FamCheckbox',
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
define(['css!' + ELMP.resource('erdc-components/FamCheckbox/style.css')], function () {
    return {
        /*html*/
        template: `
            <div id="FamCheckbox" class="fam-checkbox">
                <div>
                    <erd-checkbox-group
                        ref="checkboxGroup"
                        v-model="checkList"
                        @change="changeValue($event)"
                    >
                        <erd-tooltip
                            :disabled="!item.tooltip"
                             v-for="(item,index) in optionsList"
                            :content="item.tooltip"
                            placement="top"
                        >
                            <erd-checkbox
                                v-if="!button"
                                style="margin-right:10px;"
                                :button="button"
                                :border="border"
                                :label="item.value"
                                :disabled="item.disabled"
                            >
                                {{item?.name?.value?.value || item?.label}}
                            </erd-checkbox>
                            <erd-checkbox-button
                                v-else
                                style="margin-right:10px;"
                                :button="button"
                                :border="border"
                                :label="item.value"
                                :disabled="item.disabled"
                            >
                                {{item?.name?.value?.value || item?.label}}
                            </erd-checkbox-button>
                        </erd-tooltip>
                    </erd-checkbox-group>
                </div>
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
            checkedList: {
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
            }
        },
        computed: {
            optionsList() {
                return this.options;
            }
        },
        watch: {
            value: {
                immediate: true,
                handler(val) {
                    if (val) {
                        this.checkList = _.isArray(val) ? val : JSON.parse(val)?.map((item) => String(item));
                    }
                }
            },
            checkedList: {
                immediate: true,
                handler: function (val) {
                    if (val?.length) {
                        this.checkList = val;
                    }
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamBoolean/locale/index.js'),
                i18nMappingObj: {
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    select: this.getI18nByKey('请选择')
                },
                checkList: []
            };
        },
        methods: {
            changeValue(val) {
                this.$emit('input', val);
                this.$refs.checkboxGroup.dispatch('ElFormItem', 'el.form.change', val);
            }
        }
    };
});
