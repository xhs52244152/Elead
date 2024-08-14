define([
    'erdcloud.kit',
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js')
], function (ErdcKit, commonActions, store) {
    return {
        template: `
            <erd-ex-dialog
                :visible.sync="dialogVisible"
                :title="dialogTitle"
                size="large"
            >
                <folder-list-detail
                    ref="folderListDetail"
                    v-bind="$attrs"
                    :change-table-config="changeTableConfig"
                    :is-adaptive-height="false"
                >
                    <template #column:default:icon="{ data }">
                        <i
                            v-if="data.row.idKey === documentClassName"
                            :class="getIconStyle(data.row.icon).iconClass"
                            :style="getIconStyle(data.row.icon).iconStyle"
                        ></i>
                        <i v-else :class="data.row.icon"></i>
                    </template>
                </folder-list-detail> 
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
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        components: {
            FolderListDetail: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListDetail/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('ppm-workflow-resource/locale/index.js')
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            dialogTitle() {
                return this.i18n.addDocument;
            },
            documentClassName() {
                return store.state.classNameMapping.document;
            }
        },
        methods: {
            getIconStyle(data) {
                return JSON.parse(data);
            },
            changeTableConfig(config) {
                config.addOperationCol = false;
                config.toolbarConfig.actionConfig = {};
                config.fieldLinkConfig.linkClick = (row) => {
                    this.openDocument(row);
                };
                return config;
            },
            openDocument(row) {
                let { containerRef } = this;
                let extendParams = {
                    openType: 'detail',
                    oid: row.oid,
                    extendParams: { roleType: '' },
                    beforeCancel: this.refresh,
                    className: this.documentClassName,
                    showEditBtn: false
                };
                commonActions.openDocument(this, { containerRef, extendParams });
            },
            confirm() {
                let result = this.$refs.folderListDetail.$refs.famAdvancedTable.selectData;
                this.$emit('confirm', result);
            },
            cancel() {
                this.dialogVisible = false;
            },
            folderClassName() {
                return this.$store.getters.className('subFolder');
            }
        }
    };
});
