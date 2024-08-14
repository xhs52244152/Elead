//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.func('erdc-ppm-review-management/components/DetailDialog/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.func('erdc-ppm-review-management/components/DetailDialog/index.css')
], function (template, ErdcKit) {
    return {
        template,
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            formInfo: {
                type: String,
                default: () => {
                    return '';
                }
            },
            leafNode: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            tabsData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            businessData: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    selectData: this.getI18nByKey('selectData'),
                    detaiInfo: this.getI18nByKey('detaiInfo')
                },
                containerRefOid: '',
                isSubmission: '',
                isSaving: false,
                activeName: 'ReviewElements'
            };
        },
        created() {
            this.loadReviewMethod();
        },
        computed: {
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
            handleCancel() {
                this.dialogVisible = false;
            },
            loadReviewMethod() {
                let key =
                    this.$route.query?.processDefinitionKey ||
                    (this.leafNode.highLightedActivities && this.leafNode?.highLightedActivities[0]) ||
                    this.$route.query?.taskDefKey;
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
                        this.activeName = 'ReviewElements';
                        break;
                    case 'SUBMITTALS':
                    case 'SELF_CHECK':
                    case 'SELFCHECK':
                    case 'DRAW_UP':
                    case 'DRAWUP':
                        this.activeName = 'ReviewElements';
                        this.isSubmission = true;
                        break;
                    case 'PREREVIEW':
                        this.isSubmission = false;
                        this.activeName = 'ReviewDetail';
                        break;
                    case 'REVIEW':
                    case 'APPROVE':
                    case 'SIGN_AND_ISSUE':
                    case 'SIGNANDISSUE':
                    case 'COMPLETED':
                    case 'Activator':
                        this.isSubmission = false;
                        this.activeName = 'ReviewDetail';
                        break;
                    default:
                        break;
                }
            },

            handleTabClick() {}
        },
        components: {
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
            QualityRecord: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/qualityRecord/index.js')
            )
        }
    };
});
