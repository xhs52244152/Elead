define([
    'text!' + ELMP.resource('erdc-components/FamViewTable/ViewForm/components/AddTimelineDialog/index.html')
], function (template) {
    return {
        template,
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            dialogTitle: {
                type: String,
                default: ''
            },
            formConfigs: {
                type: Array,
                default: () => []
            },
            selectedTimeline: {
                type: Array,
                default: () => []
            }
        },
        computed: {
            showDialog: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        watch: {
            visible: {
                handler(val) {
                    if (val) {
                        this.$set(this.form, 'timeLineFiled', this.selectedTimeline);
                    }
                },
                immediate: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamViewTable/ViewForm/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消')
                },
                form: {}
            };
        },
        methods: {
            onSave() {
                this.$emit('update:selectedTimeline', this.form.timeLineFiled);
                this.showDialog = false;
            },
            onCancel() {
                this.showDialog = false;
            }
        }
    };
});
