define([
    'erdcloud.kit',
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js')
], function (ErdcKit, commonActions, store, ppmUtils) {
    return {
        /*html*/
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
            },
            businessData: {
                type: Array,
                default: () => []
            }
        },
        components: {
            FolderListDetail: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListDetail/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                tableData: []
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
            },
            businessSource() {
                return this.businessData[0]?.businessSource || '';
            },
            businessProjectOid() {
                return this.businessData[0]?.projectOid;
            }
        },
        created() {
            this.tableData = ErdcKit.deepClone(this.businessData);
        },
        methods: {
            getIconStyle(data) {
                return JSON.parse(data);
            },
            changeTableConfig(config) {
                let self = this;
                config.addOperationCol = false;
                config.toolbarConfig.actionConfig = {};
                config.toolbarConfig.fuzzySearch = {
                    show: true, // 是否显示普通模糊搜索，默认显示
                    searchCondition: ['name', 'identifierNo'],
                    isLocalSearch: true
                };
                config.tableRequestConfig.transformResponse = [
                    (data) => {
                        let resData;
                        try {
                            resData = (data && JSON.parse(data)) || {};
                            if (['deliverables', 'deliverablesRow'].includes(self.businessSource)) {
                                resData.data.records = self.tableData.filter((item) => item['status'] === 'INWORK');
                            }
                        } catch (error) {
                            resData = data && JSON.parse(data);
                        }
                        return resData;
                    }
                ];
                config.fieldLinkConfig.linkClick = (row) => {
                    this.openDocument(row);
                };
                return config;
            },
            // 打开文档详情
            openDocument(row) {
                // 代表是文件夹
                if (row.idKey === this.$store.getters.className('subFolder')) {
                    this.$refs.folderList?.onCheck(row);
                    return;
                }
                // 跳转
                ppmUtils.openPage({
                    appName: 'erdc-project-web',
                    routeConfig: {
                        path: '/space/project-folder/document/detail',
                        query: {
                            pid: this.businessProjectOid,
                            oid: row.oid,
                            title: row.name
                        }
                    }
                });
                this.dialogVisible = false;
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
