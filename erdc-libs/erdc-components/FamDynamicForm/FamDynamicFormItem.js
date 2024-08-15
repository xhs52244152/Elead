define([
    ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js'),
    '@erdcloud/erdcloud-ui',
    'fam:kit'
], function (DeepFieldVisitorMixin, { ExDialogEventCapture, ContractionPanelEventCapture }) {
    const FamKit = require('fam:kit');

    return {
        mixins: [DeepFieldVisitorMixin, ExDialogEventCapture, ContractionPanelEventCapture],

        /*html*/
        template: `
            <erd-form-item
                :class="{
                  'fam-dynamic-form__quill-editor': hyphenate(component) === 'erd-quill-editor',
                  'is-error': hasError,
                  'invisible': hidden,
                  [customClass || '']: true,
                  'fam-dynamic-form__item': true,
                  'fam-dynamic-form__item-readonly': readonly
                }"
                :prop="field"
                :show-message="showMessage"
                :label-width="labelWidth"
            >
                <template #label>
                    <slot
                        v-if="label"
                        name="label"
                    >
                        <div :class="{
                            'el-form-item__label': true,
                            'fam-dynamic-form__label': true,
                            'fam-dynamic-form__label--readonly': readonly,
                            'fam-dynamic-form__label--required': required,
                            'fam-dynamic-form__label--right': labelPosition === 'right'
                        }">
                            <slot
                                v-if="tooltip || tooltipI18nJson"
                                name="tooltip"
                            >
                                <erd-tooltip
                                    placement="top"
                                    :tabindex="-1"
                                    :openDelay="800"
                                >
                                    <template #content><span v-html="translateFormLabel(tooltipI18nJson, tooltip)"></span></template>
                                    <erd-button
                                        class="help-btn"
                                        type="text"
                                        icon="erd-iconfont erd-icon-help"
                                    ></erd-button>
                                </erd-tooltip>
                            </slot>
                            <span
                                v-if="required && labelPosition === 'right'"
                                class="fam-dynamic-form__label--required-identifier"
                            >*</span>
                            <erd-show-tooltip
                                placement="top-start"
                                :content="translateFormLabel(nameI18nJson, label)"
                                :tabindex="-1"
                                class="fam-dynamic-form__label--labelText truncate"
                                padding-width="12"
                                :openDelay="800"
                                flex
                            >
                              <span class="w-100p truncate">{{translateFormLabel(nameI18nJson, label)}}</span>
                            </erd-show-tooltip>
                            <span
                                v-if="required && labelPosition !== 'right'"
                                class="fam-dynamic-form__label--required-identifier"
                            >*</span>
                        </div>
                    </slot>
                </template>
                <slot
                    v-if="readonly"
                    name="readonly"
                >
                    <component
                        v-if="readonlyComponent"
                        :is="hyphenate(readonlyComponent)"
                        style="width: 100%"
                        :value="getFieldValue(props.echoField || field)"
                        :default-value="defaultValue || getFieldValue(props.echoField || field)"
                        :is-designer-form="isDesignerForm"
                        :is-layout-widget="true"
                        :app-name="innerAppName"
                        v-bind="props"
                        v-on="cleanListeners"
                        :form-config="$props"
                        :form-data="formData"
                        @input="value => setFieldValue(props.echoField || field, value)"
                        readonly
                    ></component>
                    <template v-else>
                        <erd-show-tooltip 
                            :content="[ '', null, undefined ].indexOf(getFieldValue(field)) > -1 ? '--' : getFieldValue(field) + ''" 
                            placement="top"
                            popper="fam-tooltip-max-width"
                            :tabindex="-1"
                            :openDelay="800"
                            flex
                        >
                            <template v-slot:show-tooltip-title>
                                <i 
                                    v-if="type === 'icon'"
                                    :class="getFieldValue(field)"
                                ></i>
                                <span
                                    v-else
                                    class="title_text title-whitespace-pre-line"
                                    :class="{'title_text_textarea': props.type === 'textarea' && hyphenate(component) === 'erd-input'}"
                                    v-fam-clamp="{ truncationStyle: 'inline' }"
                                    v-on="cleanListeners"
                                >
                                    <fam-link v-if="props.path" :form-data="formData" :link-name="getFieldValue(field)" v-bind="props"></fam-link>
                                    <span v-else>{{[ '', null, undefined ].indexOf(getFieldValue(field)) > -1 ? '--' : getFieldValue(field)}}</span>
                                </span>
                            </template>
                        </erd-show-tooltip>
                    </template>
                </slot>
                <slot
                    v-if="!readonly"
                    :name="$scopedSlots.default ? 'default' : 'component'"
                >
                    <!--选人控件需要default-value-->
                    <component
                        ref="component"
                        style="width: 100%"
                        :is="formComponent"
                        :value="getFieldValue(field)"
                        :disabled="disabled"
                        :is-designer-form="isDesignerForm"
                        :is-layout-widget="true"
                        :app-name="innerAppName"
                        :default-value="defaultValue"
                        :security-label="securityLabel"
                        :form-data="formData"
                        v-bind.sync="props"
                        :hidden="hidden"
                        :preventLoading="preventLoading"
                        @blur="emitFieldEvent('blur', $event)"
                        @focus="emitFieldEvent('focus', $event)"
                        @input="emitFieldEvent('input', $event)"
                        @change="emitFieldEvent('change', $event)"
                        @hook:mounted="onComponentMounted"
                        v-on="cleanListeners"
                    ></component>
                </slot>
                
                <slot v-if="!readonly" name="checkbox">
                    <erd-tooltip
                        :content="i18n.inherit"
                        popper-class="el-tooltip__arrow-hide"
                        :open-delay="800"
                    >
                        <erd-checkbox
                            v-if="checkbox"
                            v-model="formData[field + '_checked']"
                            :disabled="checkboxDisabled"
                            @change="emitFieldEvent('checkboxChange', $event)"
                            style="margin-left: 8px;"
                        ></erd-checkbox>
                    </erd-tooltip>
                </slot>

                <erd-tooltip
                    v-if="showErrorMessage && validateMsg && !hideErrorMessage"
                    :value="true"
                    ref="validateTooltip"
                    popper-class="fam-dynamic-form__error-tips"
                    placement="top-end"
                    :transition="''"
                    :tabindex="-1"
                    manual
                >
                    <div style="position: absolute;width: 16px;height: 100%;right: 0;visibility: hidden;"></div>
                    <template #content>
                        {{validateMsg || ''}}
                    </template>
                </erd-tooltip>
            </erd-form-item>
        `,
        components: {
            FamShowTooltip: FamKit.asyncComponent(ELMP.resource('erdc-components/FamShowTooltip/index.js')),
            DynamicFormPlaceholder: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/accessory/FamDynamicFormPlaceholder/index.js')
            )
        },
        props: {
            field: String,
            label: String,
            nameI18nJson: Object,
            col: [String, Number],
            customClass: String,
            required: Boolean,
            readonly: Boolean,
            tooltip: String,
            tooltipI18nJson: Object,
            type: String,
            props: {
                type: Object,
                default() {
                    return {};
                }
            },
            listeners: Object,
            disabled: Boolean,
            component: [Object, String],
            readonlyComponent: [Object, String],
            preventLoading: Boolean,

            // 是否显示错误信息
            showErrorMessage: Boolean,
            labelPosition: {
                type: String,
                default: 'right'
            },
            validateMsg: {
                type: String,
                default: ''
            },
            formData: {
                type: Object,
                default() {
                    return {};
                }
            },
            // ElForm Native Attribute
            showMessage: Boolean,
            hasError: Boolean,
            labelWidth: String,
            checkbox: Boolean,
            checkboxDisabled: {
                type: Boolean,
                default: false
            },
            isDesignerForm: Boolean,
            appName: String,
            defaultValue: [String, Object, Array, Boolean],
            hidden: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamDynamicForm/locale/index.js'),
                hideErrorMessage: false
            };
        },
        computed: {
            cleanListeners() {
                return _.mapObject(this.listeners, (listener) => {
                    return _.isFunction(listener) ? listener : undefined;
                });
            },
            innerAppName() {
                return this.props.appName || this.appName;
            },
            securityLabel() {
                return this.props.securityLabel || this.formData.securityLabel;
            },
            formComponent() {
                let component = this.component;
                if(this.FamKit.isSameComponentName(component, 'ErdQuillEditor')) {
                    console.warn('[Deprecated] 请勿直接使用 ErdQuillEditor 组件');
                    component = 'FamQuillEditor';
                }
                return this.hyphenate(component);
            }
        },
        watch: {
            showErrorMessage() {
                this.$nextTick(() => {
                    this.updateValidateTooltip();
                });
            },
            validateMsg() {
                this.$nextTick(() => {
                    this.updateValidateTooltip();
                });
            }
        },
        beforeCreate() {
            this.FamKit = FamKit;
        },
        mounted() {
            this.handleTooltipUpdate = () => {
                this.$nextTick(() => {
                    this.updateTooltip();
                });
            };
            this.handleUnfoldChange = (visible) => {
                this.$nextTick(() => {
                    this.hideErrorMessage = !visible;
                });
            };
            this.$on('drag-end', this.handleTooltipUpdate);
            this.$on('fullscreen', this.handleTooltipUpdate);
            this.$on('updateTooltip', this.handleTooltipUpdate);
            this.$on('unfold-change', this.handleUnfoldChange);
        },
        beforeDestroy() {
            this.FamKit = null;
            this.$off('updateTooltip', this.handleTooltipUpdate);
            this.$off('drag-end', this.handleTooltipUpdate);
            this.$off('fullscreen', this.handleTooltipUpdate);
            this.$off('unfold-change', this.handleUnfoldChange);
        },
        methods: {
            updateTooltip() {
                if (this.showErrorMessage) {
                    this.updateValidateTooltip();
                }
                this.$refs.component?.$refs?.['custom-select']?.blur();
                this.$refs.component?.$refs?.['input']?.blur();
                this.$refs.component?.$refs?.['select']?.blur();
                this.$refs.component?.$refs?.['famDict']?.$refs?.['select'].blur();
                this.$refs.component?.$refs?.['famDictItemSelect']?.$refs?.['select'].blur();
            },
            onComponentMounted() {
                this.$emit('component:mounted', this.field, this.$refs.component);
            },
            focus() {
                if (this.$refs.component && _.isFunction(this.$refs.component.focus)) {
                    this.$refs.component.focus();
                }
            },
            emitFieldEvent(eventType, $event) {
                let value = $event;
                if (eventType === 'blur') {
                    if (FamKit.isSameComponentName('erd-input', this.component) && !this.props?.noTrim) {
                        value = $event.target.value.trim();
                    }
                }
                if (eventType === 'input') {
                    this.setFieldValue(this.field, $event);
                }
                this.$emit(eventType, value);
            },
            updateValidateTooltip() {
                const $tooltip = this.$refs.validateTooltip;
                if ($tooltip) {
                    $tooltip.updatePopper();
                }
            },
            translateFormLabel(nameI18nJson, label) {
                return FamKit.translateI18n(nameI18nJson) || label;
            },
            hyphenate(componentName) {
                return typeof componentName === 'string' ? FamKit.hyphenate(componentName) : componentName;
            }
        }
    };
});
