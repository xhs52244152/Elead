define([
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-store/index.js'),
    'dayjs',
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    'css!' + ELMP.resource('ppm-workflow-resource/components/ReviewList/index.css')
], function (commonHttp, store, dayjs, commonMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <div class="ppm-process-review">
                <erd-contraction-panel
                    :unfold.sync="basiInfoPanelUnfold"
                    :title="i18nMappingObj.basicInfo"
                    class="process-base-info"
                >
                    <template v-slot:content>
                       <fam-advanced-form
                            ref="initForm"
                            :model.sync="formData"
                            :form-id="formId"
                            :class-name="className"
                            :query-layout-params="queryLayoutParams()"
                            @field:change="onFieldChange"
                        >
                        </fam-advanced-form>
                    </template>
                </erd-contraction-panel>
                
                <milestone-table
                    :process-step="processStep"
                    :business-data="businessData" 
                    v-if="businessData[0]?.types"
                ></milestone-table>

                <div class="position-relative table-container">
                    <div class="mt-20" style="position: relative; cursor: pointer; z-index: 999;display:flex;justify-content: flex-end;">
                        <div style="position: absolute;top: 35px;">
                            <span class="cursor-pointer color-placeholder" @click.stop="handlerClick()">
                                <i style="transform: scale(0.88);" class="erd-iconfont erd-icon-zoom-in"></i>
                            </span>
                        </div>
                    </div>
                    <erd-contraction-panel
                        :unfold.sync="panelUnfold"
                        :title="i18nMappingObj.detailInfo"
                    >
                        <template v-slot:content>
                            <erd-tabs
                                v-model="activeName"
                                @tab-click="handleTabClick"
                                v-if="showReviewElements && (isRefresh || processStep !== 'launcher')"
                            >
                                <erd-tab-pane
                                    v-for="item in tabsData"
                                    :key="item.activeName"
                                    :label="item.name"
                                    :name="item.activeName"
                                    lazy
                                >
                                    <component
                                        :ref="item.activeName"
                                        :is="item.activeName"
                                        :container-ref-oid="containerRefOid"
                                        :formInfo="formInfo"
                                        :leafNode="leafNode"
                                        :currentClickNode="currentClickNode"
                                        :submissionFlag="submissionFlag"
                                        :businessData="businessData"
                                        @ready="refreshData"
                                    ></component>
                                </erd-tab-pane>
                            </erd-tabs>
                        </template>
                    </erd-contraction-panel>
                </div>
                <div v-if="flowFlag">
                    <IssueAndRiskList 
                        :projectId="projectId"
                        :formData="formData"
                        :leafNode="leafNode"
                        :currentClickNode="currentClickNode"
                        :formInfo="formInfo"
                        ref="issueAndRiskList"
                    ></IssueAndRiskList>
                </div>
                <div v-if="ConclusFlag">
                    <ConclusionList 
                        :process-key="processKey" 
                        :formInfo="formInfo"
                        :leafNode="leafNode"
                        :currentClickNode="currentClickNode"
                        @ready="refreshData"
                    ></ConclusionList>
                </div>
                <DetailDialog
                    v-if="showDialog"
                    :visible.sync="showDialog"
                    :tabsData="tabsData"
                    :formInfo="formInfo"
                    :leafNode="leafNode"
                    :businessData="businessData"
                    @ready="refreshData"
                    @getReviewStatus="getReviewStatus"
                ></DetailDialog>
            </div>
        `,
        props: {
            businessData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            processInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 流程key
            processKey: String,
            processStep: String,
            taskInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        mixins: [commonMixin],
        inject: ['draftInfos'],
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            DetailDialog: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/DetailDialog/index.js')
            ),
            ReviewElements: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/reviewElements/index.js')
            ),
            DeliverablesList: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/deliverablesList/index.js')
            ),
            QualityObjectives: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/qualityObjectives/index.js')
            ),
            ReviewDetail: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/reviewELEDetail/index.js')
            ),
            DeliverDetail: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/deliverDetail/index.js')
            ),
            IssueAndRiskList: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/issueAndRiskList/index.js')
            ),
            QualityRecord: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/qualityRecord/index.js')
            ),
            ConclusionList: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/ConclusionList/index.js')
            ),
            MilestoneTable: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/MilestoneTable/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-workflow-resource/components/ReviewList/locale/index.js'),
                i18nMappingObj: {
                    basicInfo: this.getI18nByKey('basicInfo'),
                    detailInfo: this.getI18nByKey('detailInfo'),
                    reviewConclution: this.getI18nByKey('reviewConclution')
                },
                handleTabClickNames: ['ReviewElements'],
                activeName: 'ReviewElements',
                className: store.state.classNameMapping.reviewManagement,
                containerRefOid: '',
                submissionFlag: false,
                leafNode: {},
                showDialog: false,
                flowFlag: false,
                ConclusFlag: false,
                trialFlag: false,
                formData: {},
                plamDate: '',
                oid: '',
                topFlag: '',
                formId: 'CREATE',
                formInfo: '',
                projectId: '',
                panelUnfold: true,
                basiInfoPanelUnfold: true,
                isRefresh: true,
                currentClickNode: '',
                showReviewElements: false
            };
        },
        created() {
            // console.log('#####', this.$route);
            this.getReviewStatus();
            // 流程草稿同步要素库数据
            this.syncElement();
        },
        activated() {
            this.isRefresh = true;
            // 刷新表格数据
            this.$refs.issueAndRiskList.refreshTable();
        },
        deactivated() {
            this.isRefresh = false;
        },
        mounted() {},
        watch: {
            businessOid: {
                handler(val) {
                    this.getFormAttrData(val);
                },
                immediate: true
            },
            showDialog() {
                this.submissionFlag = true;
                const refName = {
                    ReviewElements: 'reviewtable',
                    DeliverablesList: 'deliverREDtable',
                    QualityObjectives: 'reviewQuatable'
                };
                for (let item of this.handleTabClickNames) {
                    const tableRef = this.$refs[item]?.[0]?.$refs[refName[item]];
                    if (tableRef) {
                        tableRef.refreshTable('default');
                    }
                }
            },
            taskInfos(newValueval, oldValue) {
                let newTaskNode = newValueval.taskDefinitionKey;
                let oldTaskNode = oldValue.taskDefinitionKey;
                let currentNode = this.processInfos?.nodeMap?.node?.highLightedActivities[0];
                if (newTaskNode !== oldTaskNode && newTaskNode !== currentNode) {
                    this.currentClickNode = newTaskNode;
                } else if (newTaskNode === currentNode) {
                    this.currentClickNode = '';
                }
            }
        },
        computed: {
            businessOid() {
                return this.businessData[0]?.roleBObjectRef || this.businessData[0]?.oid || undefined;
            },
            tabsData() {
                const _this = this;
                let tabsData = [
                    {
                        name: '评审要素',
                        activeName: 'ReviewElements',
                        isSubmission: _this.getConfigTab('REVIEW_ELEMENT')
                    },
                    {
                        name: '交付件清单',
                        activeName: 'DeliverablesList',
                        isSubmission: _this.getConfigTab('DELIVERY_LIST')
                    },
                    {
                        name: '质量目标',
                        activeName: 'QualityObjectives',
                        isSubmission: _this.getConfigTab('QUALITY_OBJECTIVE')
                    },
                    {
                        name: '评审要素',
                        activeName: 'ReviewDetail',
                        isTemplateDetail: _this.getConfigTab('REVIEW_ELEMENT')
                    },
                    {
                        name: '交付件清单',
                        activeName: 'DeliverDetail',
                        isTemplateDetail: _this.getConfigTab('DELIVERY_LIST')
                    },
                    {
                        name: '质量目标',
                        activeName: 'QualityRecord',
                        isTemplateDetail: _this.getConfigTab('QUALITY_OBJECTIVE')
                    }
                ];
                return tabsData.filter((item) => {
                    return this.isSubmission ? item.isSubmission : item.isTemplateDetail;
                });
            },
            infoText() {
                return JSON.parse(localStorage.getItem(this.processKey + ':setReviewInfo'));
            }
        },
        methods: {
            queryLayoutParams() {
                let { formId } = this;
                return {
                    name: formId,
                    objectOid: formId === 'DETAIL' ? this.businessOid : '',
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: formId
                        // }
                    ]
                };
            },
            // 流程草稿同步要素库数据
            syncElement() {
                if (this.draftInfos?.baseForm?.processBasicInfo?.pboStatus !== 'DRAFT') {
                    this.showReviewElements = true;
                    return;
                }
                this.$famHttp({
                    url: '/ppm/review/syncElement',
                    method: 'GET',
                    params: {
                        reviewObjectOid: this.formInfo
                    }
                }).then((resp) => {
                    this.showReviewElements = true;
                });
            },
            onFieldChange(obj, value) {
                this.$nextTick(() => {
                    this.plamDate = value ? this.dateFormat(value) : '';
                    const isWorkflowDraft = this.$route.name === 'workflowDraft';
                    if (isWorkflowDraft) {
                        this.formData.scheduledEndTime = this.plamDate;
                    }
                    this.createMethod(isWorkflowDraft);
                });
            },
            getConfigTab(name) {
                let { infoText } = this;
                if (infoText && infoText.type && infoText.type[0].configTab) {
                    return infoText.type[0].configTab.includes(name);
                } else if (this.formData && this.formData.configTab) {
                    return this.formData.configTab.includes(name);
                } else {
                    return true;
                }
            },
            dateFormat(date) {
                return dayjs(date).format('YYYY-MM-DD');
            },
            getReviewStatus() {
                const node = this.processInfos?.nodeMap?.node;
                this.leafNode = node;
                let key =
                    this.currentClickNode ||
                    this.$route.query?.processDefinitionKey ||
                    (node && node.highLightedActivities && node.highLightedActivities[0]) ||
                    this.$route.query?.taskDefKey;
                // 已完成的流程需额外设置key code
                if (this.processInfos?.processStatusEnum === 'LIFECYCLE_COMPLETED') {
                    key = 'COMPLETED';
                }
                if (!key) {
                    //区分草稿和流程结束
                    if (this.$route.name === 'workflowActivator') {
                        key = 'Activator';
                    } else {
                        key = 'Draft';
                    }
                } else {
                    key = key.toLocaleUpperCase();
                }
                switch (key) {
                    case 'TECHNICALREVIEW':
                    case 'Draft':
                        this.isSubmission = true;
                        this.formId = 'CREATE';
                        this.activeName = 'ReviewElements';
                        break;
                    case 'SUBMITTALS':
                    case 'SELF_CHECK':
                    case 'SELFCHECK':
                    case 'DRAW_UP':
                    case 'DRAWUP':
                        this.activeName = 'ReviewElements';
                        this.isSubmission = true;
                        this.flowFlag = true;
                        this.formId = 'DETAIL';
                        break;
                    case 'PREREVIEW':
                        this.isSubmission = false;
                        this.activeName = 'ReviewDetail';
                        this.flowFlag = true;
                        this.ConclusFlag = true;
                        this.formId = 'DETAIL';
                        break;
                    case 'REVIEW':
                    case 'APPROVE':
                    case 'SIGN_AND_ISSUE':
                    case 'SIGNANDISSUE':
                    case 'COMPLETED':
                    case 'Activator':
                    case 'CANCEL':
                    case 'APPROVED':
                        this.isSubmission = false;
                        this.activeName = 'ReviewDetail';
                        this.flowFlag = true;
                        this.trialFlag = true;
                        this.ConclusFlag = true;
                        this.formId = 'DETAIL';
                        break;
                    // DCP提交节点
                    case 'DCPREVIEW':
                        this.isSubmission = true;
                        this.activeName = 'ReviewElements';
                        break;
                    default:
                        break;
                }
                setTimeout(() => {
                    this.activeName = this.tabsData[0]?.activeName;
                }, 500);
            },
            handlerClick() {
                this.showDialog = true;
            },
            createMethod(val = false) {
                let { infoText } = this;
                let oid = this.businessData[0] && this.businessData[0].oid;
                if (infoText && infoText.type && infoText.point && !val) {
                    let typeData = infoText && infoText.type[0],
                        pData = infoText && infoText.point[0],
                        prodata = store.state.projectInfo;

                    let parmas = {
                        attrRawList: [
                            {
                                attrName: 'reviewCategoryRef',
                                value: typeData.oid
                            },
                            {
                                attrName: 'reviewPointRef',
                                value: pData.oid
                            },
                            {
                                attrName: 'projectRef',
                                value: prodata.oid
                            },
                            {
                                attrName: 'projectIdentifierNo',
                                value: prodata.identifierNo
                            },
                            {
                                attrName: 'scheduledEndTime',
                                value: this.plamDate
                            }
                        ],
                        containerRef: '',
                        isreviewDraft: true,
                        oid: oid ? oid : ''
                    };
                    if (this.businessData[0] && !this.businessData[0]['reviewObject']) {
                        this.businessData[0]['reviewObject'] = {};
                    }
                    if (this.businessData[0]) this.businessData[0].reviewObject = parmas;
                    localStorage.setItem(this.processKey + ':businessData', JSON.stringify(this.businessData));
                } else {
                    this.businessData[0] &&
                        this.businessData[0].reviewObject &&
                        this.businessData[0].reviewObject.attrRawList.map((item) => {
                            if (item.attrName == 'scheduledEndTime' && this.plamDate) {
                                item.value = this.plamDate;
                            }
                        });
                    if (oid && this.businessData[0] && this.businessData[0].reviewObject) {
                        this.businessData[0].reviewObject.oid = oid;
                    }
                    this.getReviewSources();
                }
            },
            getFormAttrData(value = '') {
                if (value) {
                    this.formInfo = value;
                    commonHttp
                        .commonAttr({
                            data: {
                                oid: value
                            }
                        })
                        .then((res) => {
                            let result = res.data.rawData;
                            // console.log('yyyyew', result);
                            this.formData = ErdcKit.deserializeAttr(result, {
                                valueMap: {
                                    reviewCategoryRef: (e, data) => {
                                        return data['reviewCategoryRef'].displayName;
                                    },
                                    reviewPointRef: (e, data) => {
                                        return data['reviewPointRef'].displayName;
                                    },
                                    domainRef: (e, data) => {
                                        return data['projectRef'].oid;
                                    },
                                    projectIdentifierNo: (e, data) => {
                                        return data['projectIdentifierNo'].displayName;
                                    },
                                    scheduledEndTime: (e, data) => {
                                        return data['scheduledEndTime'].displayName;
                                    },
                                    projectRef: (e, data) => {
                                        return data['projectRef'].displayName;
                                    }
                                }
                            });
                            this.projectId = this.formData.domainRef;
                            const isWorkflowDraft = this.$route.name === 'workflowDraft';
                            if (isWorkflowDraft) {
                                this.createMethod(isWorkflowDraft);
                            }
                            this.getReviewSources();
                            this.getReviewStatus();
                        });
                } else {
                    let { infoText } = this;
                    if (infoText && infoText.type && infoText.point) {
                        let typeData = infoText.type[0],
                            pData = infoText.point[0],
                            prodata = store.state.projectInfo;
                        let attrRawList = {
                            reviewCategoryRef: {
                                attrName: '评审类型',
                                value: typeData.name
                            },
                            reviewPointRef: {
                                attrName: '评审点',
                                value: pData.name
                            },
                            projectRef: {
                                attrName: '项目名称',
                                value: prodata.name
                            },
                            projectIdentifierNo: {
                                attrName: '项目编码',
                                value: prodata.identifierNo
                            },
                            scheduledEndTime: {
                                attrName: 'scheduledEndTime',
                                value: this.plamDate
                            }
                        };
                        this.formData = ErdcKit.deserializeAttr(attrRawList);
                        const dayjs = require('dayjs');
                        this.$set(this.formData, 'createTime', dayjs().format('YYYY-MM-DD'));
                    }
                    this.createMethod();
                }
                // 刷新督办任务、风险、问题列表
                this.$refs.issueAndRiskList?.refreshTable();
            },
            getReviewSources() {
                Promise.all([
                    this.reviewAdd(this.formInfo),
                    this.deliverAdd(this.formInfo),
                    this.reviewQuaAdd(this.formInfo)
                ]).then((res) => {
                    const [reviewData, deliverData, quaData] = res;
                    if (reviewData && deliverData && quaData) {
                        const reviewAction = JSON.parse(localStorage.getItem('reviewConfig'));
                        if (reviewAction && reviewAction.reviewElementList) {
                            reviewAction.reviewElementList = false;
                        }
                        this.refreshData({ type: 'reviewElementList', reviewElementList: reviewData });
                        this.refreshData({ type: 'deliveryList', deliveryList: deliverData });
                        this.refreshData({ type: 'qualityObjectiveList', qualityObjectiveList: quaData });
                    } else {
                        this.reviewConfig.reviewElementList = true;
                        localStorage.setItem('reviewConfig', JSON.stringify(this.reviewConfig));
                    }
                });
            },
            handleTabClick(val) {
                if (!this.handleTabClickNames.includes(val?.name)) {
                    this.handleTabClickNames.push(val?.name);
                }
                this.activeName = val.name;
            },
            refreshData(data) {
                // 流程启动（未保存时）不需要刷新数据
                // if (this.processStep === 'launcher' && Object.keys(this.draftInfos).length === 0) {
                //     return;
                // }
                let key = data.type;
                let value = data[data.type];
                if (Array.isArray(this.businessData) && this.businessData.length) {
                    if (key !== 'reviewConclusion') {
                        if (!this.businessData[0]['reviewItems']) {
                            this.businessData[0]['reviewItems'] = {};
                        }
                        this.businessData[0]['reviewItems'][key] = value;
                        // localStorage.setItem(this.processKey + ':businessData', JSON.stringify(this.businessData));
                    } else {
                        if (!this.businessData[0]['reviewConclusion']) {
                            this.businessData[0]['reviewConclusion'] = {};
                        }
                        this.businessData[0]['reviewConclusion'] = value;
                    }
                }
            }
        }
    };
});
