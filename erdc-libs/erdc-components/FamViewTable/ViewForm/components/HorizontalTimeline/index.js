define([
    'text!' + ELMP.resource('erdc-components/FamViewTable/ViewForm/components/HorizontalTimeline/index.html'),
    'vuedraggable',
    'css!' + ELMP.resource('erdc-components/FamViewTable/ViewForm/components/HorizontalTimeline/style.css')
], function (template, VueDraggable) {
    return {
        template,
        components: {
            VueDraggable
        },
        props: {
            originDragData: {
                type: Array,
                default: () => []
            },
            activedDragData: {
                type: Array,
                default: () => []
            }
        },
        computed: {
            dragData: {
                get() {
                    return this.originDragData.map((item) => {
                        const { label, displayName, value, attrName, oid } = item;
                        item.label = label || displayName || '';
                        item.value = value || attrName || oid || '';
                        return item;
                    });
                },
                set(val) {
                    this.$emit(
                        'update:activedDragData',
                        val.map((item) => item.value)
                    );
                }
            }
        },
        methods: {
            deleteDragItem(dragItem) {
                this.dragData = this.dragData.filter((item) => item.value !== dragItem.value);
            }
        }
    };
});
