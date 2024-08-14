define([
    'erdcloud.kit',
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-store/index.js')
], function (ErdcKit, utils, actionsUtils, ppmStore) {
    return {
        name: 'documentObject',
        template: `
            <div class="document-content">
                <folder-list-detail
                    ref="documentObject"
                    toolbar-operation-type="PPM_DOCUMENT_APPROVAL_LIST_MENU"
                    :change-table-config="changeTableConfig"
                    :vm="vm"
                    :is-adaptive-height="isAdaptiveHeight"
                >
                    <template #column:default:operation="{ data }">
                        <div>
                            <erd-dropdown @command="(key) => handleCommand(key, data)" trigger="click">
                                <span class="el-dropdown-link">
                                    <a style="font-size: var(--buttonFontSize);">{{ $t('operation') }}</a><i class="el-icon-arrow-down el-icon--right"></i>
                                </span>
                                <erd-dropdown-menu slot="dropdown">
                                    <erd-dropdown-item command="download">{{ $t('download') }}</erd-dropdown-item>
                                    <erd-dropdown-item command="preview">{{ $t('preview') }}</erd-dropdown-item>
                                </erd-dropdown-menu>
                            </erd-dropdown>
                        </div>
                    </template>
                    <template #column:default:icon="{ data }">
                        <i
                            :class="getIconStyle(data.row.icon).iconClass"
                            :style="getIconStyle(data.row.icon).iconStyle"
                        ></i>
                    </template>
                </folder-list-detail>
                <select-document
                    v-if="selectDocumentVisible && documentType === 'knowledgeList'"
                    :visible.sync="selectDocumentVisible"
                    :folder-object="folderObject"
                    :container-ref="containerRef"
                    @confirm="handleConfirm"
                ></select-document>
                <select-my-document
                    v-if="selectDocumentVisible && documentType === 'myKnowledge'"
                    :visible.sync="selectDocumentVisible"
                    @confirm="addMyDocument"
                ></select-my-document>
            </div>
        `,
        components: {
            FolderListDetail: ErdcKit.asyncComponent(
                ELMP.resource('erdc-product-components/FolderListDetail/index.js')
            ),
            SelectDocument: ErdcKit.asyncComponent(
                ELMP.resource('ppm-workflow-resource/components/DocumentObject/components/SelectDocument/index.js')
            ),
            SelectMyDocument: ErdcKit.asyncComponent(
                ELMP.resource('ppm-workflow-resource/components/DocumentObject/components/SelectMyDocument/index.js')
            ),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
        },
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            processInfos: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                vm: null,
                selectDocumentVisible: false,
                tableData: []
            };
        },
        computed: {
            // 业务对象是否可编辑
            readonly() {
                return !!(
                    this.processInfos?.nodeMap &&
                    this.processInfos?.nodeMap?.node?.highLightedActivities?.[0] !== 'resubmit'
                );
            },
            folderObject() {
                return this.businessData[0]?.folderObject || {};
            },
            containerRef() {
                return this.businessData[0]?.containerRef;
            },
            isAdaptiveHeight() {
                return false;
            },
            documentClassName() {
                return ppmStore.state.classNameMapping.document;
            },
            documentType() {
                return this.businessData[0]?.documentType || '';
            }
        },
        created() {
            this.vm = this;
            this.tableData = ErdcKit.deepClone(this.businessData);
        },
        methods: {
            getIconStyle(data) {
                try {
                    return JSON.parse(data);
                } catch {
                    return data || {};
                }
            },
            changeTableConfig(config) {
                let self = this;
                config.toolbarConfig.fuzzySearch = {
                    isLocalSearch: true
                };
                self.readonly && (config.toolbarConfig.actionConfig = {});
                config.tableBaseConfig.maxLine = 5;
                config.tableRequestConfig.transformResponse = [
                    (data) => {
                        let resData;
                        try {
                            resData = (data && JSON.parse(data)) || {};
                            resData.data.records = self.tableData;
                        } catch (error) {
                            resData = data && JSON.parse(data);
                        }
                        return resData;
                    }
                ];
                config.fieldLinkConfig.linkClick = (row) => {
                    self.openDocument(row);
                };
                return config;
            },
            openDocument(row) {
                const pageInfos = {
                    myKnowledge: {
                        path: '/my-knowledge/document/detail',
                        appName: 'erdc-portal-web'
                    },
                    knowledgeList: {
                        path: '/knowledge-library-list/document/detail',
                        appName: 'erdc-knowledge-library-web'
                    }
                };
                let { appName, path } = pageInfos[row.documentType] || {};
                utils.openPage({
                    appName,
                    routeConfig: {
                        path,
                        query: {
                            oid: row.oid,
                            title: row.name,
                            folderObject: this.folderObject
                        }
                    }
                });
            },
            handleConfirm(data) {
                if (data.find((item) => item.idKey === this.$store.getters.className('subFolder'))) {
                    return this.$message.info(this.i18n.unableToAddFolder); //不能添加文件夹
                }
                let selectOids = data.map((item) => item.oid);
                if (data.filter((item) => item.status !== 'INWORK').length) {
                    return this.$message.info(this.i18n.workTips); // 存在状态为非正在工作的文档，无法添加
                }
                if (data.filter((item) => item.versionState === 'WORKING').length) {
                    return this.$message.info(this.i18n.checkTips); // 存在已检出的文档，无法添加
                }
                if (this.tableData.findIndex((item) => selectOids.includes(item.oid)) > -1) {
                    return this.$message.info(this.i18n.uniquenessVerificationFailed); // 唯一性校验失败
                }
                this.tableData = [
                    ...this.tableData,
                    ...data.map((item) => {
                        item.documentType = this.documentType;
                        return item;
                    })
                ];
                this.selectDocumentVisible = false;
                this.refresh();
            },
            handleCommand(key, { row }) {
                const eventMap = {
                    download: this.download,
                    preview: this.preview
                };
                eventMap[key] && eventMap[key](row);
            },
            download(row) {
                utils.downloadFile(row);
            },
            preview(row) {
                actionsUtils.renderFilePreview(row);
            },
            refresh() {
                this.$refs.documentObject.$refs?.famAdvancedTable.fnRefreshTable();
            },
            validate() {
                return new Promise((resolve) => {
                    let result = this.tableData.map((item) => {
                        item.containerRef = this.containerRef;
                        item.folderObject = this.folderObject;
                        return item;
                    });
                    // 业务表单数据不能为空
                    resolve(result.length ? result : [{ message: this.i18n.processTips, valid: false }]);
                });
            },
            addMyDocument(data) {
                let hasData = data.filter((item) => {
                    return this.tableData.find((data) => data.oid === item.oid);
                });
                if (
                    data.find(
                        (item) =>
                            item.attrRawList.find(
                                (attr) => attr.attrName === 'erd.cloud.cbb.doc.entity.EtDocument#iterationInfo.state'
                            )?.value === 'WORKING'
                    )
                ) {
                    return this.$message.info(this.i18n.checkTips); // 存在已检出的文档，无法添加
                }
                if (
                    data.find(
                        (item) =>
                            item.attrRawList.find(
                                (attr) => attr.attrName === 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status'
                            )?.value !== 'INWORK'
                    )
                ) {
                    return this.$message.info(this.i18n.workTips); // 存在状态为非正在工作的文档，无法添加
                }
                if (hasData.length) {
                    return this.$message.info(this.i18n.uniquenessVerificationFailed); // 唯一性校验失败
                    // const identifierNos = hasData
                    //     .map((item) => {
                    //         return item.identifierNo || item['erd.cloud.cbb.doc.entity.EtDocument#identifierNo'];
                    //     })
                    //     .join('、');
                    // return this.$message.info(this.$t('existsTips', { identifierNos }));
                }
                let result = data.map((item) => {
                    Object.keys(item).forEach((key) => {
                        const keyMap = {
                            'lifecycleStatus.status': 'statusDisplayName',
                            'typeReference': 'typeDisplayName',
                            'createBy': 'createUser'
                        };
                        let noPrefixKey = key.split('#')?.[1];
                        item[noPrefixKey || key] = item[key];
                        if (noPrefixKey === 'icon') {
                            item[noPrefixKey] = ErdcKit.deserializeAttr(item.attrRawList)[key] || item[key];
                        }
                        if (Object.keys(keyMap).includes(noPrefixKey)) {
                            item[keyMap[noPrefixKey]] = item[key];
                            if (noPrefixKey === 'createBy') {
                                item[keyMap[noPrefixKey]] =
                                    item.attrRawList.find((item) => item.attrName === key) || {};
                            }
                        }
                    });
                    item.documentType === this.documentType;
                    return item;
                });
                this.tableData = [...result, ...this.tableData];
                this.selectDocumentVisible = false;
                this.refresh();
            }
        }
    };
});
