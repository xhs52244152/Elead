//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.func('erdc-ppm-review-management/components/reviewElements/component/libraryDialog/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/reviewElements/component/libraryDialog/style.css')
], function (template, ErdcKit, commonHttp) {
    return {
        template,
        props: {
            showDialog: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: false
            },
            layoutName: {
                type: String,
                default: 'CREATE'
            },
            formData: {
                type: Object,
                default: {}
            },
            viewReview: {
                type: Boolean,
                default: false
            },
            oid: String,
            className: String,
            leafNode: Object
        },
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel')
                },
                scopedSlots: {},
                formId: 'DETAIL',
                dvaData: {},
                isSaving: false
            };
        },
        created() {
            this.handleRenderData();
            // 为了兼容评审发起流程节点查看详情
            this.formId = this.layoutName === 'DETAIL' ? 'DETAIL' : 'CREATE';
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            memberTitle() {
                return this.dvaData['responsibilityMember'];
            },
            reviewTitle() {
                return this.dvaData['reviewMember'];
            },
            schemaMapper() {
                return {
                    responsibilityMember: function () {}
                };
            },
            operationConfigName() {
                return this.layoutName !== 'DETAIL'
                    ? 'PPM_ATTACH_PER_FULL_OP_MENU'
                    : 'REVIEW_ATTACH_DETAIL_FULL_OP_MENU';
            },
            formIdentifierNo() {
                return this.dvaData[`identifierNo`];
            },
            showUpload() {
                let key =
                    this.$route.query?.processDefinitionKey ||
                    this.$route.query?.taskDefKey ||
                    (this.leafNode?.highLightedActivities && this.leafNode?.highLightedActivities[0]);
                // 提交材料节点可以上传交付件
                return ['Submittals'].includes(key) && this.layoutName !== 'DETAIL';
            }
        },
        methods: {
            queryLayoutParams() {
                return {
                    objectOid: this.oid || '',
                    name: this.formId,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.formId
                        // }
                    ]
                };
            },
            // 处理回显数据
            handleRenderData() {
                const oid = this.formData.oid;
                if (oid) {
                    commonHttp
                        .commonAttr({
                            data: {
                                oid: oid
                            }
                        })
                        .then((res) => {
                            let result = res.data.rawData;
                            this.dvaData = ErdcKit.deserializeAttr(result, {
                                valueMap: {
                                    responsibilityRoleRef: (e, data) => {
                                        return data['responsibilityRoleRef'].displayName;
                                    },
                                    reviewRoleRef: (e, data) => {
                                        return data['reviewRoleRef'].displayName;
                                    },
                                    status: (e, data) => {
                                        return data['status'].displayName;
                                    },
                                    // scalable: (e, data) => {
                                    //     return data['scalable'].displayName;
                                    // },
                                    createBy: ({ users }) => {
                                        return users;
                                    },
                                    updateBy: ({ users }) => {
                                        return users;
                                    },
                                    responsibilityMember: (e, data) => {
                                        return data['responsibilityMember'].displayName;
                                    },
                                    reviewMember: (e, data) => {
                                        return data['reviewMember'].displayName;
                                    }
                                }
                            });
                            // 拟制时责任成员和评审成员无法通用接口获取需要从列表数据中获取
                            if (!this.dvaData?.responsibilityMember) {
                                this.$set(this.dvaData, 'responsibilityMember', this.formData?.responsibilityMember);
                            }
                            if (!this.dvaData?.reviewMember) {
                                this.$set(this.dvaData, 'reviewMember', this.formData?.reviewMember);
                            }
                        });
                }
                // const idKey = 'erd.cloud.ppm.review.entity.WfReviewElement';
                // let formData = {
                //     content: this.formData[`${idKey}#content`],
                //     identifierNo: this.formData[`${idKey}#identifierNo`],
                //     typeReference: this.formData[`${idKey}#typeReference`],
                //     productInfo: '',
                //     area: this.formData[`${idKey}#typeReference`],
                //     responsibilityRoleRef: this.formData[`${idKey}#responsibilityRoleRef`],
                //     category: this.formData[`${idKey}#category`],
                //     status: this.formData[`${idKey}#status`],
                //     description: this.formData[`${idKey}#description`]
                // };
                // this.dvaData = formData;
                // console.log('回显数据：', this.dvaData);
            },
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            Files: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/commonAttach/index.js')),
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        }
    };
});
