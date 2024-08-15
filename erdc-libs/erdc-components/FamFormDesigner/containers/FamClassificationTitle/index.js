define([
    'fam:kit',
    'vuedraggable',
    ELMP.resource('erdc-components/FamFormDesigner/components/FormViewItem.js'),
    'underscore',
    'css!' + ELMP.resource('erdc-components/FamFormDesigner/containers/FamClassificationTitle/style.css')
], function (FamKit, VueDraggable, FormViewItem) {
    return {
        components: {
            FormWidget: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/FormWidget.js')),
            VueDraggable,
            FormViewItem
        },
        /* html */
        template: `
            <div>
                <erd-contraction-panel v-if="!hideTitle" :unfold.sync="unfold" :title="title">
                    <template #tips v-if="tipsSlot">
                        <slot :name="tipsSlot" ></slot>
                    </template>
                </erd-contraction-panel>
                <div v-show="unfold" :class="['classification-content', lastLineChildClass(widget.widgetList)]">
                    <FormViewItem
                        v-if="designer"
                        :form="form"
                        :designer="designer"
                        :parent-widget="widget"
                        :widget-list.sync="widget.widgetList"
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
                        v-else-if="widget"  
                        :gutter="8"
                        justify-content="space-around"
                    >
                        <erd-col
                            v-for="childWidget in widget.widgetList"
                            v-show="!childWidget.schema.hidden"
                            :class="{'fam-dynamic-form--hidden': childWidget.schema.hidden}"
                            :key="childWidget.id"
                            :span="childWidget.block ? 24 : childWidget.schema.col"
                        >
                            <FormWidget
                                :widget="childWidget"
                                :form="form"
                                :reaodnly="readonly"
                                :form-readonly="formReadonly"
                                :readonly-component="readonlyComponent"
                                :last-line-child-class="lastLineChildClass"
                                :scope="scope"
                                v-bind="scope"
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
                </div>
            </div>
            
        `,
        // >
        props: {
            form: Object,
            readonly: Boolean,
            formReadonly: Boolean,
            designer: Object,
            widget: Object,
            parentWidget: Object,
            schema: Object,
            scope: Object,
            showErrorMessage: Boolean,
            readonlyComponent: Function,
            lastLineChildClass: {
                type: Function,
                default: () => ''
            }
        },
        inject: ['scopedSlots'],
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    classTitle: this.getI18nByKey('分类标题')
                },
                lan: this.$store.state.i18n?.lang || 'zh_cn',
                newIndex: 0,
                unfold: this.schema?.props?.unfold === undefined ? true : this.schema?.props?.unfold
            };
        },
        computed: {
            tipsSlot: function () {
                return this.schema?.props?.tipsSlot;
            },
            unfoldTransition: {
                get() {
                    return this.unfold;
                },
                set(val) {
                    this.$emit('update:unfold', val);
                }
            },
            hideTitle() {
                return this.schema?.props?.hideTitle;
            },
            title() {
                return this.schema?.nameI18nJson?.[this.lan] || this.schema?.label || this.i18nMappingObj['classTitle'];
            },
            isSlot() {
                return FamKit.isSameComponentName(this.schema?.component, 'slot');
            }
        },
        methods: {
            onMouseMove() {
                this.$emit('container-mousemove');
            },
            hyphenateSlotName(slotName) {
                return FamKit.hyphenate(slotName);
            }
        }
    };
});
