define([ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js'), 'fam:kit'], function (
    DeepFieldVisitorMixin
) {
    const FamKit = require('fam:kit');
    return {
        mixins: [DeepFieldVisitorMixin],

        /*html*/
        template: `
            <div
                @click="onWidgetClick(widget, $event)"
                class="fam-form-widget"
                :data-widget-id="widget.id"
                :class="{
                  'pb-16': designer && widget.container
                }"
            >
                <slot name="widget-prepend"></slot>
                <component
                    v-if="widget.container"
                    :key="widget.id"
                    :is="getContainerComponent(widget)"
                    :form="form"
                    :schema="schema"
                    :designer="designer"
                    :widget="widget"
                    :readonly="readonly"
                    :form-readonly="formReadonly"
                    :readonly-component="readonlyComponent"
                    :preventLoading="preventLoading"
                    :scope="innerScope"
                    :hide-error-message="hideErrorMessage"
                    :current-invalid-field="currentInvalidField"
                    :last-line-child-class="lastLineChildClass"
                    :is-designer-form="isDesignerForm"
                    :app-name="appName"
                    @container-mousemove="onContainerMouseMove"
                    @component:mounted="handleComponentMounted"
                    v-on="$listeners"
                >
                    <template
                        v-for="(slot, name) in scopedSlots"
                        v-slot:[name]="slotProps"
                    >
                        <slot :name="name" v-bind="slotProps"></slot>
                    </template>
                    <template
                        v-for="(slot, name) in $scopedSlots"
                        v-slot:[name]="scope"
                    >
                        <slot :name="name" v-bind="scope"></slot>
                    </template>
                </component>

                <FamDynamicFormItem
                    v-else
                    ref="formItem"
                    :key="widget.id"
                    v-bind="schema"
                    :field="field || schema.field || hyphenateComponentName(schema.props.name)"
                    :label="schema.label"
                    :name-i18n-json="schema.nameI18nJson"
                    :tooltip-i18n-json="schema.tooltipI18nJson"
                    :readonly="formReadonly || schema.readonly"
                    :readonly-component="schema.readonlyComponent || readonlyComponent(schema.component)"
                    :form-data="form"
                    :label-width="labelWidth || (schema.col <= 3 ? 'auto' : (3 / schema.col * 100 + '%'))"
                    :custom-class="schema.class"
                    :label-position="labelPosition"
                    :validate-msg="validateMsg[schema.field]"
                    :has-error="!disableValidate && !validateFields[schema.field]"
                    :show-message="false"
                    :show-error-message="showErrorMessage"
                    :props="schema.props"
                    :preventLoading="preventLoading"
                    :listeners="schemaListeners"
                    :is-designer-form="isDesignerForm"
                    :app-name="appName"
                    :hidden="$attrs.hidden === undefined ? schema.hidden : $attrs.hidden"

                    @blur="emitFieldEvent('blur', schema, $event)"
                    @focus="emitFieldEvent('focus', schema, $event)"
                    @input="emitFieldEvent('input', schema, $event)"
                    @change="emitFieldEvent('change', schema, $event)"
                    @component:mounted="handleComponentMounted"
                    v-on="schema.checkboxListeners"
                >
                    <template #label>
                        <slot name="label"
                              :form-config="schema"
                              :data="form"
                              :readonly="formReadonly || schema.readonly"
                        ></slot>
                    </template>
                    <template #tooltip>
                        <slot name="tooltip"
                              :form-config="schema"
                              :data="form"
                              :readonly="formReadonly || schema.readonly"
                        ></slot>
                    </template>
                    <template #readonly>
                        <!-- slot名字会被Vue转换成小写，因此需要处理 -->
                        <slot
                            v-if="isSlot"
                            :name="hyphenateComponentName(schema.props.name)"
                            :form-config="schema"
                            :data="form"
                            :readonly="formReadonly || schema.readonly"
                        >
                        </slot>
                        <slot 
                            v-else
                            name="readonly"
                            :form-config="schema"
                            :data="form"
                            :readonly="formReadonly || schema.readonly"
                        ></slot>
                    </template>
                    <template #component="scope">
                        <!-- slot名字会被Vue转换成小写，因此需要处理 -->
                        <slot
                            v-if="isSlot"
                            :name="hyphenateComponentName(schema.props.name)"
                            :form-config="schema"
                            :data="form"
                            :readonly="formReadonly || schema.readonly"
                            :onFocus="() => emitFieldEvent('focus', schema, $event)"
                        >
                        </slot>   
                        <slot 
                            v-else
                            name="component" 
                            :form-config="schema"
                            :data="form"
                            :readonly="formReadonly || schema.readonly"
                            :onFocus="() => emitFieldEvent('focus', schema, $event)"
                        ></slot>
                    </template>
                    <template #checkbox>
                        <slot 
                            name="checkbox" 
                            :form-config="schema"
                            :data="form"
                            :readonly="formReadonly || schema.readonly"
                        ></slot>
                    </template>
                </FamDynamicFormItem>
                <slot name="widget-append"></slot>
            </div>

        `,
        components: {
            FamDynamicFormItem: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/FamDynamicFormItem.js')
            )
        },
        props: {
            form: Object,
            widget: Object,
            field: String,
            designer: Object,
            readonly: Boolean,
            formReadonly: Boolean,
            disableValidate: Boolean,
            preventLoading: Boolean,
            hideErrorMessage: Boolean,
            currentTargetErrorMassage: Boolean,
            currentInvalidField: String,
            labelWidth: String,
            labelPosition: {
                type: String,
                default: 'right'
            },
            validateFields: {
                type: Object,
                default() {
                    return {};
                }
            },
            validateMsg: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonlyComponent: Function,
            emitFieldEvent: {
                type: Function,
                default() {
                    return () => {
                        // do nothing
                    };
                }
            },
            scope: Object,
            schemaMapper: {
                type: Object,
                default() {
                    return {};
                }
            },
            eachSchema: Function,
            vm: Object,
            isDesignerForm: Boolean,
            lastLineChildClass: {
                type: Function,
                default: () => ''
            },
            appName: String
        },
        inject: {
            scopedSlots: {
                default: () => ({})
            },
            getFunctions: {
                default: () => () => ({})
            },
            getVariables: {
                default: () => () => ({})
            }
        },
        computed: {
            functions() {
                return (this.getFunctions && this.getFunctions()) || {};
            },
            variables() {
                return (this.getVariables && this.getVariables()) || {};
            },
            showErrorMessage() {
                return (
                    this.currentTargetErrorMassage &&
                    !this.disableValidate &&
                    !this.hideErrorMessage &&
                    this.currentInvalidField === this.schema.field
                );
            },
            isSlot() {
                return (
                    typeof this.widget?.schema?.component === 'string' &&
                    FamKit.isSameComponentName(this.widget?.schema?.component, 'slot')
                );
            },
            innerScope() {
                return this.scope ?? this.$props;
            },
            schema() {
                const schema = this.widget.schema;
                const mappedSchema =
                    this.mapSchema(schema, {
                        widget: this.widget,
                        updateSchema: (field, value) => {
                            return this.setFieldValue(schema, field, value);
                        }
                    }) ||
                    schema ||
                    {};
                if (this.eachSchema) {
                    return this.eachSchema(mappedSchema, {
                        widget: this.widget,
                        updateSchema: (field, value) => {
                            return this.setFieldValue(schema, field, value);
                        }
                    });
                }
                return mappedSchema;
            },
            mapSchema() {
                return this.schemaMapper[this.widget.schema?.field] || ((schema) => schema);
            },
            schemaListeners() {
                const schema = this.widget.schema;
                if (schema?.listeners) {
                    const events = this.widget.events?.filter((event) => !event.disabled) || [];
                    const functions = this.functions;

                    return _.mapObject(schema.listeners, (listener, eventName) => {
                        if (typeof listener === 'function') {
                            return listener;
                        }
                        const enabledEvent = _.some(events, { name: eventName });
                        const func = functions[listener];
                        if (typeof func === 'function') {
                            func.bind(this.vm || this.$parent?.$parent || this.$parent);
                        }
                        return enabledEvent ? func : undefined;
                    });
                }
            }
        },
        methods: {
            onWidgetClick(widget, event) {
                if (widget.id === event.target.closest('.fam-form-widget')?.getAttribute('data-widget-id')) {
                    this.$emit('select-widget', widget, event);
                }
            },
            getContainerComponent(widget) {
                return this.hyphenate(widget.schema.component);
            },
            onContainerMouseMove() {
                this.$emit('container-mousemove');
            },
            getSlot(schema, slotName) {
                const slots = schema.slots || {};
                return slots[slotName] || slotName;
            },
            hyphenateComponentName(slotName) {
                return this.hyphenate(slotName);
            },
            updateValidateTooltip() {
                if (this.$refs.formItem) {
                    this.$refs.formItem.updateValidateTooltip();
                }
            },
            focus() {
                if (this.$refs.formItem) {
                    this.$refs.formItem.focus();
                }
            },
            hyphenate(componentName) {
                return typeof componentName === 'string' ? FamKit.hyphenate(componentName) : componentName;
            },
            useComponent() {
                return this.$refs.formItem && this.$refs.formItem.$refs.component;
            },
            handleComponentMounted(...args) {
                this.$emit('component:mounted', ...args);
            }
        }
    };
});
