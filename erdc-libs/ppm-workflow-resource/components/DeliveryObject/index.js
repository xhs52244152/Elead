define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdc-kit',
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'css!' + ELMP.resource('ppm-workflow-resource/components/DeliveryObject/index.css')
], function (ErdcKit, ppmStore, ppmUtils, famUtils, actionsUtils, commonActions) {
    return {
        name: 'DeliveryObject',
        /*html*/
        template: `
            <div class="document-content">
                <common-form
                    ref="form"
                    layout-name="DELIVERY_PROCESS_DETAIL"
                    :class-name="projectClassName"
                    :business-oid="businessProjectOid"
                    :form-slots="formSlots"
                    :readonly="readonly"
                    :business-data="businessData"
                    style="margin-left: 8px;"
                ></common-form>
                <erd-contraction-panel
                    :unfold.sync="panelUnfolds"
                    :title="$t('documentList')"
                    style="padding-left: 24px;"
                >
                    <folder-list-detail
                        ref="documentObject"
                        toolbar-operation-type="PPM_DOCUMENT_APPROVAL_LIST_MENU"
                        :change-table-config="changeTableConfig"
                        :vm="vm"
                        :is-adaptive-height="false"
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
                </erd-contraction-panel>
                <select-document
                    v-if="selectDocumentVisible"
                    :visible.sync="selectDocumentVisible"
                    :folder-object="folderObject"
                    :businessData="businessData"
                    :container-ref="containerRef"
                    @confirm="handleConfirm"
                ></select-document>
            </div>
        `,
        components: {
            FolderListDetail: ErdcKit.asyncComponent(
                ELMP.resource('erdc-product-components/FolderListDetail/index.js')
            ),
            CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js')),
            SelectDocument: ErdcKit.asyncComponent(
                ELMP.resource('ppm-workflow-resource/components/DeliveryObject/components/SelectDocument/index.js')
            )
        },
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            processInfos: {
                type: Object,
                default: () => {}
            },
            processStep: String
        },
        data() {
            return {
                vm: null,
                tableData: [],
                i18nLocalePath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                i18nMappingObj: {
                    objectRef: this.getI18nByKey('objectRef') // 所属任务
                },
                loadings: {},
                typeDictName: 'deliveryType',
                panelUnfolds: true,
                projectClassName: ppmStore.state.classNameMapping.project,
                selectDocumentVisible: false
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
            formSlots() {
                return {
                    'identifier-no': ErdcKit.asyncComponent(
                        ELMP.resource('ppm-workflow-resource/components/commonIdentifierNo/index.js')
                    ),
                    'delivery-form': ErdcKit.asyncComponent(
                        ELMP.resource(
                            'ppm-workflow-resource/components/DeliveryObject/components/DeliveryForm/index.js'
                        )
                    )
                };
            },
            businessProjectOid() {
                return this.businessData[0]?.projectOid;
            },
            documentClassName() {
                return ppmStore.state.classNameMapping.document;
            },
            containerRef() {
                return this.businessData[0]?.containerRef;
            },
            folderObject() {
                return this.businessData[0]?.folderObject;
            },
            businessSource() {
                return this.businessData[0]?.businessSource || '';
            }
        },
        watch: {
            businessData: {
                handler(val) {
                    this.initData(val);
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            // 初始化数据
            initData(val) {
                this.vm = this;
                this.tableData = ErdcKit.deepClone(val);
                if (this.businessSource === 'deliverablesRow') {
                    this.tableData = this.tableData.filter(
                        (item) => item.oid === this.businessData[0]?.deliverableSelectOid
                    );
                }
                this.refresh();
            },
            validate(type) {
                let budgetFormRef = this.$refs.form.$refs['delivery-form'][0];
                let initFormRef = budgetFormRef.$refs.deliveryForm.$refs.initForm;
                let validate = initFormRef.$refs.dynamicForm.validate;
                return new Promise((resolve, reject) => {
                    // 如果是只读状态就直接返回businessData
                    if (this.readonly) {
                        return resolve(this.businessData);
                    }
                    this.businessData = this.tableData;
                    this.businessData[0].deliveryData = budgetFormRef.getData();
                    // 如果是保存草稿就不校验预算布局字段是否必填
                    if (type === 'draft') {
                        return resolve(this.businessData);
                    }
                    validate()
                        .then((res) => {
                            delete this.businessData[0].valid;
                            if (res) resolve(this.businessData);
                        })
                        .catch(() => {
                            let result = ErdcKit.deepClone(this.businessData);
                            result[0].valid = false;
                            result[0].message = this.i18n.businessFormTips;
                            resolve(result);
                        });
                });
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
            },
            refresh() {
                this.$refs.documentObject?.$refs?.famAdvancedTable.fnRefreshTable();
            },
            changeTableConfig(config) {
                let self = this;
                if (this.processStep !== 'launcher') {
                    config.toolbarConfig.showConfigCol = false;
                    config.toolbarConfig.showRefresh = false;
                    config.toolbarConfig.actionConfig = {};
                }
                config.toolbarConfig.moreOperateList = [];
                config.tableBaseConfig.maxLine = 5;
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
                            resData.data.records = self.tableData;
                        } catch (error) {
                            resData = data && JSON.parse(data);
                        }
                        return resData;
                    }
                ];
                config.columns.push({
                    attrName: 'objectRef',
                    label: this.i18nMappingObj.objectRef
                });
                config.fieldLinkConfig.linkClick = (row) => {
                    self.openDocument(row);
                };
                return config;
            },
            handleCommand(key, { row }) {
                const eventMap = {
                    download: this.download,
                    preview: this.preview
                };
                eventMap[key] && eventMap[key](row);
            },
            download(row) {
                ppmUtils.downloadFile(row);
            },
            preview(row) {
                actionsUtils.renderFilePreview(row);
            },
            getIconStyle(data) {
                return JSON.parse(data);
            },
            handleConfirm(data) {
                if (data.find((item) => item.idKey === this.$store.getters.className('subFolder'))) {
                    return this.$message.info(this.i18n.unableToAddFolder); //不能添加文件夹
                }
                let selectOids = data.map((item) => item.oid);
                if (this.tableData.findIndex((item) => selectOids.includes(item.oid)) > -1) {
                    return this.$message.info(this.i18n.uniquenessVerificationFailed); // 唯一性校验失败
                }
                this.tableData = [...this.tableData, ...data];
                this.selectDocumentVisible = false;
                this.isAdd = true;
                this.refresh();
            }
        }
    };
});
