define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <erd-ex-dialog
                :title="i18n.launchProcess"
                :visible.sync="showDialog"
                width="400px"
            >
                <main style="display: flex;justify-content: center;">
                    <div>
                        <span 
                            :style="getFontSize()">
                            {{i18n.pleaseSelect}}
                        </span>
                        <div 
                            v-for="(item, index) of processData"
                            :key="item.oid"
                            :style="getStyle(index)"
                        >
                            <erd-radio 
                                v-model="form.selectData"
                                :label="item.oid"
                            >{{item.name}}</erd-radio>
                        </div>
                    </div>
                </main>
                <template #footer>
                    <erd-button type="primary" @click="confirm">{{i18n.confirm}}</erd-button>
                    <erd-button @click="cancel">{{i18n.cancel}}</erd-button>
                </template>
            </erd-ex-dialog>
        `,
        props: {
            visible: Boolean,
            processData: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
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
            processData: {
                handler(data) {
                    if (data.length) {
                        this.form.selectData = data[0].oid;
                    }
                },
                immediate: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/SelectProcess/locale/index.js'),
                form: { selectData: '' }
            };
        },
        methods: {
            confirm() {
                let result = _.find(this.processData, { oid: this.form.selectData });
                this.$emit('confirm', result);
                this.showDialog = false;
            },
            cancel() {
                this.showDialog = false;
            },
            getStyle(index) {
                return `padding-bottom: ${index < this.processData.length - 1 ? 12 : 0}px`;
            },
            getFontSize() {
                return 'margin-bottom: 8px;display: block;color: var(--colorTextPlaceholder); font-size: var(--fontSizeMini); line-height: 20px;';
            }
        }
    };
});
