define([
    'fam:kit',
    'vuedraggable',
    ELMP.resource('erdc-components/FamFormDesigner/components/FormViewItem.js'),
    ELMP.resource('erdc-components/EmitterMixin.js')
], function (FamKit, VueDraggable, FormViewItem, EmitterMixin) {
    return {
        components: {
            FormWidget: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/FormWidget.js')),
            FormViewItem,
            VueDraggable
        },
        mixins: [EmitterMixin],
        /* html */
        template: `
            <erd-tabs
                v-if="schema"
                :class="[lastLineChildClass(widget.widgetList)]"
                v-model="schema.props.activeTab"
                v-bind="schema.props"
            >
                <erd-tab-pane 
                    v-for="(childWidget, index) in widget.widgetList"
                    :name="hyphenateSlotName(childWidget.schema.props.name)" 
                    :label="tabLabel(childWidget.schema.props.label)"
                    :key="childWidget.id"
                >
                    <template v-if="childWidget?.schema?.props?.name === schema.props.activeTab || activeTabs.includes(childWidget?.schema?.props?.name)">
                        <FormViewItem
                            v-if="designer"
                            :form="form"
                            :designer="designer"
                            :parent-widget="childWidget"
                            :widget-list.sync="childWidget.widgetList"
                            :readonly="readonly"
                            :form-readonly="formReadonly"
                            :show-error-message="!scope.hideErrorMessage && scope.currentInvalidField === widget.schema.field"
                            :scope="scope"
                            v-bind="scope"
                            @container-mousemove="onMouseMove"
                        >
                            <template #component>
                                <slot
                                    v-if="isSlot"
                                    :name="hyphenateSlotName(widget.schema.props.name)"
                                    v-bind="{
                                        formConfig: widget.schema,
                                        data: form,
                                        readonly: readonly || widget.readonly
                                    }"
                                >
                                    {{hyphenateSlotName(widget.schema.props.name)}}
                                </slot>
                                <slot 
                                    v-else
                                    :name="getSlot(widget.schema, 'component')" 
                                    v-bind="{
                                        formConfig: widget.schema,
                                        data: form,
                                        readonly: readonly || widget.readonly
                                    }"
                                ></slot>
                            </template>
                        </FormViewItem>
                        <erd-row
                            v-else
                            :gutter="8"
                            justify-content="space-around"
                        >
                            <erd-col
                                v-for="cw in childWidget.widgetList"
                                :class="{'fam-dynamic-form--hidden': cw.schema.hidden}"
                                :key="cw.id"
                                :span="cw.block ? 24 : cw.schema.col"
                            >
                                <FormWidget
                                    v-if="!schema.refreshTab || (schema.refreshTab && schema.props.activeTab === childWidget.schema.props.name)"
                                    :widget="cw"
                                    :form="form"
                                    :reaodnly="readonly"
                                    :form-readonly="formReadonly"
                                    :readonly-component="readonlyComponent"
                                    :last-line-child-class="lastLineChildClass"
                                    v-bind="scope"
                                    :scope="scope"
                                >
                                    <template
                                        v-for="(slot, name) in scopedSlots"
                                        v-slot:[name]="scope"
                                    >
                                        <slot :name="name" v-bind="scope"></slot>
                                    </template>

                                    <template
                                        v-for="(slot, name) in $scopedSlots"
                                        v-slot:[name]="scope"
                                    >
                                        <slot :name="name" v-bind="scope"></slot>
                                    </template>
                                </FormWidget>
                            </erd-col>
                        </erd-row>
                    </template>
                </erd-tab-pane>
            </erd-tabs>
        `,
        props: {
            form: Object,
            readonly: Boolean,
            formReadonly: Boolean,
            designer: Object,
            widget: Object,
            parentWidget: Object,
            schema: Object,
            scope: Object,
            readonlyComponent: Function,
            showErrorMessage: Boolean,
            lastLineChildClass: {
                type: Function,
                default: () => ''
            }
        },
        inject: ['scopedSlots'],
        data() {
            return {
                activeTabs: []
            };
        },
        computed: {
            slotName() {
                return this.formReadonly ? 'readonly' : 'component';
            },
            isSlot() {
                return FamKit.isSameComponentName(this.schema?.component, 'slot');
            }
        },
        watch: {
            'schema.props.activeTab': {
                immediate: true,
                handler(name) {
                    this.activeTabs = [...this.activeTabs, name];
                    this.$nextTick(() => {
                        this.broadcast('FamDynamicFormItem', 'updateTooltip');
                    });
                }
            }
        },
        methods: {
            onMouseMove() {
                this.$emit('container-mousemove');
            },
            hyphenateSlotName(slotName) {
                return FamKit.hyphenate(slotName);
            },
            tabLabel(label) {
                const lang = this.$store?.state?.i18n?.lang || 'zh_cn';
                return label?.value?.[lang] || label?.value?.value || label;
            }
        }
    };
});
