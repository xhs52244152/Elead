define([
    ELMP.resource('erdc-components/FamResizableMixin.js'),
    'css!' + ELMP.resource('erdc-components/FamResizableContainer/style.css')
], function (ResizableMixin) {
    return {
        mixins: [ResizableMixin],
        /*html*/
        template: `
            <div ref="box"
                 :class="['fam-resizable-container position-relative flex-nowrap grow-1', vertical ? 'flex-column vertical' : 'flex-row']">
                <div class="fam-resizable-container__left" :style="leftStyle" ref="containerLeft">
                    <slot :name="vertical ? 'top' : 'left'" :leftStyle="leftStyle"></slot>
                </div>
                <div v-if="!hideSeparatist" class="fam-resizable-container__separatist" @dblclick="handleDblClick">
                    <slot name="handle">
                        <div ref="handle" class="fam-resizable-container__separatist-handle">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </slot>
                </div>
                <div class="fam-resizable-container__right flex grow-1 overflow-hidden flex-column">
                    <slot :name="vertical ? 'bottom' : 'right'"></slot>
                </div>
            </div>
        `,
        props: {
            left: {
                type: Object,
                default() {
                    return {
                        width: '240px',
                        minWidth: 200,
                        maxWidth: '50%'
                    };
                }
            },
            right: {
                type: Object,
                default() {
                    return {
                        minWidth: 200
                    };
                }
            },
            top: {
                type: Object,
                default() {
                    return {
                        height: '50%',
                        minHeight: 100,
                        maxWidth: '70%'
                    };
                }
            },
            bottom: {
                type: Object,
                default() {
                    return {
                        minHeight: 100
                    };
                }
            },
            hideSeparatist: Boolean,
            vertical: Boolean
        },
        computed: {
            leftStyle() {
                return this.vertical
                    ? {
                          height: this.top.height || '100px'
                      }
                    : {
                          width: this.left.width || '240px'
                      };
            },
            rightStyle() {
                return this.vertical
                    ? {
                          height: this.bottom.height || '100px'
                      }
                    : {
                          width: this.right.width || '240px'
                      };
            }
        },
        watch: {
            hideSeparatist(hideSeparatist) {
                this.$nextTick(() => {
                    if (!this.resize && !hideSeparatist) {
                        this.resize = this.$el.querySelector('.fam-resizable-container__separatist');
                        this.dragControllerDiv(this.vertical ? 'tb' : 'lr');
                    } else if (this.resize && hideSeparatist) {
                        this.resize.removeEventListener('mousedown', this.handleResizeMousedown);
                        this.resize = null;
                    }
                });
            }
        },
        mounted() {
            this.resize = this.$el.querySelector('.fam-resizable-container__separatist');
            this.domStart = this.$el.querySelector('.fam-resizable-container__left');
            this.domEnd = this.$el.querySelector('.fam-resizable-container__right');
            this.domBox = this.$el;
            this.$nextTick(() => {
                this.dragControllerDiv(this.vertical ? 'tb' : 'lr');
            });
        },
        methods: {
            setDragItemFlex() {
                const dragBox = this.$refs.box;
                const childsLen = dragBox.children.length;

                for (let i = 0; i < childsLen; i++) {
                    const node = dragBox.children[i];
                    if (!node.style.width && i !== 1) {
                        // 如果没有定义宽度，则flex=1
                        node.style.flex = 1;
                    }
                }
            },
            handleDblClick(event) {
                this.$emit('separatist-dblclick', event);
            }
        }
    };
});
