define(['erdcloud.kit'], function (ErdcKit) {
    return {
        template: `
            <erd-ex-dialog
                :visible.sync="dialogVisible"
                :title="dialogTitle"
                size="large"
            >
                <my-knowledge-list
                    ref="myKnowledgeList"
                    class="h-100p" 
                    :is-process="true"
                ></my-knowledge-list>
                <template #footer>
                    <erd-button
                        type="primary"
                        @click="confirm"
                        >{{ $t('confirm') }}</erd-button
                    >
                    <erd-button @click="cancel">{{ $t('cancel') }}</erd-button>
                </template>
            </erd-ex-dialog>
        `,
        components: {
            myKnowledgeList: ErdcKit.asyncComponent(ELMP.resource('my-knowledge/views/list/index.js'))
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {};
        },
        computed: {
            dialogTitle() {
                return '增加文档';
            },
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        methods: {
            cancel() {
                this.dialogVisible = false;
            },
            confirm() {
                let result = this.$refs.myKnowledgeList.$refs.myKnowledgeTable.$refs.FamAdvancedTable.selectData;
                this.$emit('confirm', result);
            }
        }
    };
});
