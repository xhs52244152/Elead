/**
 * @module FamI18nbasics
 * @description 国际化组件
 * @author 申圣鑫
 */

/**
 * @property {Object} value - 国际化对象
 * @property {string} type - 组件类型：基本类型basics，文本框textarea，在表格中使用的特殊显示tableReadOnly
 * @property {Boolean} disabled - 是否可编辑
 * @property {String} i18nName - 属性名称，不传默认去对应的属性
 * @property {Boolean} autofocus - 是否默认选中
 * @property {number} max - 最大输入限制
 * @property {Boolean} required - 是否必填
 * @property {String} popperClass
 * @property {boolean} trimValidator - 在表单中使用需要必填校验时，控制是否去除前后空格后进行校验
 */

define(['fam:kit', 'underscore', 'css!' + ELMP.resource('erdc-components/FamI18nbasics/style.css')], function () {
    const FamKit = require('fam:kit');
    const _ = require('underscore');

    return {
        /*html*/
        template: `
        <div>
            <div class="tableReadOnly flex" v-if="type=='tableReadOnly'">
                <div>
                    <span v-if="i18nInputName">{{i18nInputName}}</span>
                    <span v-else class="text-content">{{i18nMappingObj.pleaseInput}}</span>
                </div>
                <div>
                    <i class="erd-iconfont erd-icon-earth intermation " :class="disabled ? 'is-disabled' : ''" @click.stop="configInternation()"></i>
                </div>
            </div>
            <div class="i18nRoleName" v-if="type=='basics'">
                <erd-input
                    v-model="i18nInputName"
                    :disabled="disabled"
                    style="width: calc(100% - 30px)"
                    @input="i18nChange"
                    @focus="onFocus"
                    @blur="onBlur"
                    :autofocus="autofocus"
                    :maxlength="max"
                    :placeholder="i18nMappingObj.pleaseInput"
                    ref="input">
                </erd-input>
                <i class="erd-iconfont erd-icon-earth intermation" :class="disabled ? 'is-disabled' : ''" @click.stop="configInternation()"></i>
            </div>
            <div class="i18nRoleName" v-if="type=='textarea'">
                <erd-input
                    type="textarea"
                    v-model="i18nInputName"
                    :row="3"
                    :disabled="disabled"
                    @input="i18nChange"
                    @focus="onFocus"
                    @blur="onBlur"
                    style="width: calc(100% - 30px)"
                    show-word-limit
                    :maxlength="max"
                    :autofocus="autofocus"
                    :placeholder="i18nMappingObj.pleaseInput"
                    ref="input">
                </erd-input>
                <i class="erd-iconfont erd-icon-earth intermation" :class="disabled ? 'is-disabled' : ''" @click.stop="configInternation()"></i>
            </div>
            <internationalization
                v-bind="{...$attrs}"
                :visible.sync="internationalizationVisible"
                :form-data="i18nValue"
                :name="i18nName"
                :required="required"
                :type="type"
                :popper-class="popperClass"
                @onsubmit="onSubmit"
            ></internationalization>
        </div>
        `,
        props: {
            value: {
                type: [Object, Array],
                default: null
            },
            label: {
                type: String,
                default: () => {
                    return '';
                }
            },
            type: {
                type: String,
                default: () => {
                    return 'basics';
                }
            },
            disabled: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            i18nName: {
                type: String,
                default: () => {
                    return '';
                }
            },
            autofocus: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            max: {
                type: [Number],
                default: () => {
                    return 300;
                }
            },
            required: {
                type: [Boolean],
                default: () => {
                    return false;
                }
            },
            popperClass: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamI18nbasics/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    pleaseInput: this.getI18nByKey('请输入'),
                    pleaseClick: this.getI18nByKey('请点击'),
                    confirm: this.getI18nByKey('确定'),
                    cencel: this.getI18nByKey('取消')
                },
                internationalizationVisible: false,
                i18nValue: {},
                i18nMap: {
                    CN: 'zh_cn',
                    EN: 'en_us'
                },
                i18nInputName: '',
                lan: this.$store.state.i18n?.lang || 'zh_cn'
            };
        },
        watch: {
            i18nValue(i18nValue) {
                this.i18nInputName =
                    (this.i18nValue?.value && this.i18nValue?.value[this.i18nMap[this.lan] || this.lan]) ||
                    this.i18nValue?.value?.value ||
                    '';
                this.$emit('input', i18nValue);
            },
            value: {
                immediate: true,
                handler(outerValue) {
                    this.i18nValue = _.isString(outerValue?.value)
                        ? {
                              attrName: this.i18nName,
                              value: outerValue
                          }
                        : outerValue;
                }
            },
            autofocus: function () {
                if (this.autofocus) {
                    this.$nextTick(() => {
                        this.$refs.input.$el.querySelector('input').focus();
                    });
                }
            }
        },
        mounted() {
            if (this.autofocus) {
                this.$nextTick(() => {
                    this.$refs.input.$el.querySelector('input').focus();
                });
            }
        },
        methods: {
            onFocus(e) {
                $(e.target).closest('.i18nRoleName').find('i').addClass('is-active');
                this.$emit('focus', e);
            },
            onBlur(e) {
                if (this.type !== 'textarea') {
                    this.i18nInputName = e?.target?.value?.trim() || this.i18nInputName?.trim();
                    this.i18nValue = {
                        ...this.i18nValue,
                        value: {
                            ...this.i18nValue.value,
                            value: this.i18nInputName
                        }
                    };
                }
                $(e.target).closest('.i18nRoleName').find('i').removeClass('is-active');
                this.$emit('blur', e);
            },
            configInternation() {
                if (this.disabled) {
                    return;
                }
                this.i18nValue = {
                    ...this.value
                };
                this.internationalizationVisible = true;
            },
            onSubmit(data) {
                this.i18nValue = {
                    ...data
                };
                this.i18nInputName =
                    (this.i18nValue?.value && this.i18nValue?.value[this.i18nMap[this.lan] || this.lan]) ||
                    this.i18nValue?.value?.value ||
                    '';
            },
            i18nChange(i18nInputName) {
                let newValue = {
                    ...this.value,
                    value: {
                        ...this.value?.value,
                        value: i18nInputName || ''
                    }
                };
                let flag = false;
                _.keys(this.value?.value).forEach((item) => {
                    if (item !== 'value' && this.value?.value?.[this.i18nMap[this.lan] || this.lan]) {
                        flag = true;
                    }
                });
                newValue.value[this.i18nMap[this.lan] || this.lan] = flag ? i18nInputName || '' : '';
                this.i18nValue = newValue;
                this.$emit('input', newValue);
            }
        },
        components: {
            Internationalization: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamInternationalization/index.js')
            )
        }
    };
});
