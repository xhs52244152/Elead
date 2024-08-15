define([
    'text!' + ELMP.resource('erdc-cbb-workflow/base-info/ChangeApprovalBaseInfo/index.html'),
    ELMP.resource('erdc-cbb-workflow/app/mixin.js')
], function (template, mixin) {
    const ErdcKit = require('erdc-kit');
    const FamStore = require('erdcloud.store');
    // 上下文ContainerKey
    const containerKey = 'erd.cloud.foundation.core.container.entity.ScalableContainer';

    return {
        name: 'ChangeApprovalBaseInfo',
        template,
        mixins: [mixin],
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js')),
            ProcessGuide: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-workflow/components/ProcessGuide/index.js')),
            ProcessBasicInfo: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-workflow/components/ProcessBasicInfo/index.js')
            )
        },
        props: {
            // 回显的基本信息
            basicInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 表单数据
            bindCommonForm: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-cbb-workflow/base-info/ChangeApprovalBaseInfo/locale/index.js'),
                // 上下文ContainerKey
                containerKey,
                formData: {},
                formId: 'DETAIL',
                guideUnfold: true,
                infoUnfold: true,
                queryLayoutParams: {
                    name: 'FLOWDETAIL'
                    // attrRawList: [
                    //     {
                    //         attrName: 'layoutSelector',
                    //         value: 'FLOWDETAIL'
                    //     }
                    // ]
                }
            };
        },
        computed: {
            innerFormData: {
                get() {
                    return this.formData;
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            oid() {
                const data = JSON.parse(this.basicInfos?.currTaskInfo?.baseSubmitTaskDto?.customformJson || '{}');
                const formJson = data?.formJson || [];
                return formJson?.[0]?.oid || '';
            },
            className() {
                return this?.oid?.split(':')[1] || '';
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    nv && this.getAttrData();
                }
            }
        },
        methods: {
            getAttrData() {
                const { oid, className } = this;
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'GET',
                    data: {
                        oid,
                        className
                    }
                }).then((resp) => {
                    let result = resp.data;
                    let data = ErdcKit.deserializeAttr(result.rawData, {
                        valueMap: {
                            'containerRef': ({ displayName }) => {
                                return displayName || '';
                            },
                            'identifierNo': (e) => {
                                return e || '';
                            },
                            'category': ({ displayName }) => {
                                return displayName || '';
                            },
                            'issuePriority': ({ displayName }) => {
                                return displayName || '';
                            },
                            'requestPriority': ({ displayName }) => {
                                return displayName || '';
                            },
                            'typeReference': ({ displayName }) => {
                                return displayName || '';
                            },
                            'cycleTime': ({ displayName }) => {
                                return displayName || '';
                            },
                            'ownedByRef': ({ displayName }) => {
                                return displayName;
                            },
                            'createBy': ({ displayName }) => {
                                return displayName;
                            },
                            'updateBy': ({ displayName }) => {
                                return displayName;
                            },
                            'organizationRef': ({ displayName }) => {
                                return displayName || '';
                            },
                            'needDate': ({ displayName }) => {
                                return displayName || '';
                            },
                            'resolutionDate': ({ displayName }) => {
                                return displayName || '';
                            },
                            'lifecycleStatus.status': ({ displayName }) => {
                                return displayName || '';
                            },
                            //工作负责人
                            'roleAssignee': ({ users }) => {
                                return users || '';
                            },
                            //审阅者
                            'roleReviewer': ({ users }) => {
                                return users || '';
                            }
                        }
                    });

                    const businessData = _.isArray(data) ? data : [data];
                    const containerRef = result?.rawData?.['containerRef']?.oid || '';
                    // 缓存数据格式
                    const reviewObject = { ['flowChangeRequest']: businessData, containerRef };
                    FamStore.dispatch('cbbWorkflowStore/SET_REVIEW_OBJECT_ACTION', reviewObject).then(() => {});

                    this.formData = data;

                    // 在变更请求流程时记录一个 oid => identifierNo 的映射 , 用于在创建变更通告时获取当前变更请求的数据
                    if ('erd.cloud.cbb.change.entity.EtChangeRequest' === className) {
                        this.$store.commit('Change/requestToNoticeMap', [oid, this?.formData?.identifierNo?.value]);
                    }
                });
            }
        }
    };
});
