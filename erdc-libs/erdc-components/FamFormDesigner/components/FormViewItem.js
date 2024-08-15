define([
    'text!' + ELMP.resource('erdc-components/FamFormDesigner/components/FormViewItemTemplate.html'),
    'vuedraggable'
], function (template, VueDraggable) {
    const FamKit = require('fam:kit');

    return {
        components: {
            FormWidget: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/FormWidget.js')),
            VueDraggable
        },
        template,
        props: {
            designer: Object,
            parentWidget: Object,
            widgetList: Array,
            // 关闭拖拽
            readonly: Boolean,
            // 显示为只读表单
            formReadonly: Boolean,
            form: Object,
            scope: Object,
            lastLineChildClass: {
                type: Function,
                default: () => ''
            },
            isDesignerForm: Boolean
        },
        data() {
            return {
                // 表单项拖拽信息
                resizeData: {
                    mouseX: 0,
                    widget: null,
                    parent: null,
                    target: null,
                    resizing: false
                },
                futureIndex: null
            };
        },
        computed: {
            // 当前选中的widget
            selected() {
                return this.designer.selected;
            },
            widgets: {
                get() {
                    return this.widgetList || [];
                },
                set(widgetList) {
                    this.$emit('update:widgetList', widgetList);
                    this.$emit('change', widgetList);
                    this.$nextTick(() => {
                        this.setPanelPadding();
                    });
                }
            }
        },
        methods: {
            setPanelPadding() {
                const contractionPanels = document.querySelectorAll('.ContractionPanel');
                contractionPanels.forEach((item) => {
                    const closestParent = item.closest('.classification-content');
                    if (closestParent) {
                        const closestParentPanel = closestParent.previousElementSibling;
                        if (closestParentPanel) {
                            item.style.paddingLeft = parseInt(closestParentPanel.style.paddingLeft || 0) + 16 + 'px';
                        }
                    }
                });
            },
            onDragAdd(evt) {
                const newIndex = evt.newIndex;
                if (this.parentWidget.widgetList && !!this.parentWidget.widgetList[newIndex]) {
                    this.designer.setSelected(this.parentWidget.widgetList[newIndex]);
                }
                this.$nextTick(() => {
                    this.parentWidget.widgetList.forEach((widget) => {
                        widget.parentWidget = this.parentWidget.id || null;
                    });
                });
            },
            handleDragEnd() {
                if (typeof this.futureIndex === 'number' && typeof this.movingIndex === 'number') {
                    // this.widgets = arrayMove([...this.widgets], this.movingIndex, this.futureIndex);
                    this.$nextTick(() => {
                        this.futureIndex = null;
                    });
                }
                document.querySelectorAll('.fam-form-view__content.chosen').forEach(function (el) {
                    el.classList.remove('chosen');
                });
            },
            handleMove(e) {
                if (e.from === e.to && e.to) {
                    const { index, futureIndex } = e.draggedContext;
                    this.futureIndex = futureIndex;
                    this.movingIndex = index;
                } else {
                    if (e.to) {
                        e.to.classList.add('chosen');
                    }
                    this.futureIndex = null;
                }
            },
            setSelected(widget, index) {
                this.designer.setSelected(widget, index);
            },
            removeWidget(index) {
                this.designer.removeWidget(this.parentWidget, index);
            },
            onResizeMouseDown(widget, e) {
                if (e.stopPropagation) e.stopPropagation();

                this.resizeData.mouseX = e.pageX;
                this.resizeData.widget = widget;
                this.resizeData.target = e.target;
                this.resizeData.parent = e.target.parentElement;
                this.resizeData.resizing = widget;

                document.documentElement.addEventListener('mousemove', this.onMouseMove);
                document.documentElement.addEventListener('mouseup', this.onResizeMouseUp);
                e.target.setCapture && e.target.setCapture();
            },
            onResizeMouseUp() {
                document.documentElement.removeEventListener('mousemove', this.onMouseMove);
                document.documentElement.removeEventListener('mouseup', this.onResizeMouseUp);
                this.resizeData.resizing = null;
                this.resizeData.target &&
                    this.resizeData.target.releaseCapture &&
                    this.resizeData.target.releaseCapture();
                setTimeout(() => {
                    this.setSelected(this.resizeData.widget);
                }, 0);
            },
            onMouseMove(e) {
                const deltaX = this.snapToGrid(e.pageX - this.resizeData.mouseX);
                if (this.resizeData.parent && this.resizeData.widget) {
                    if (Math.abs(deltaX) >= this.resizeData.parent.clientWidth / 24) {
                        const schema = this.resizeData.widget.schema || { col: 24 };
                        schema.col = Number(schema.col) + (deltaX < 0 ? -1 : 1);

                        schema.col = schema.col <= 1 ? 1 : schema.col;
                        schema.col = schema.col >= 24 ? 24 : schema.col;
                        schema.columnNumber = schema.col;

                        this.$set(this.resizeData.widget, 'schema', schema);
                        this.$nextTick(() => {
                            this.resizeData.mouseX = e.pageX;
                            this.$emit('container-mousemove');
                        });
                    }
                }
            },
            snapToGrid(pendingX) {
                return pendingX;
            },
            onContainerMouseMove() {
                this.$emit('container-mousemove');
            },
            readonlyComponent(componentName) {
                if (typeof componentName === 'string') {
                    return this.$store.getters['component/readonlyComponent'](componentName);
                }
                return componentName;
            }
        }
    };
});
