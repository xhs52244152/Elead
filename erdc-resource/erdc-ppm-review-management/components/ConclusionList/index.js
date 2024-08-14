define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/ConclusionList/index.html'),
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/ConclusionList/style.css')
], function (ErdcKit, template, commonMixin, { i18nMappingObj }) {
    const subReviewComponent = {
        template,
        props: {
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
            processKey: String
        },
        mixins: [commonMixin],
        data() {
            return {
                panelUnfold: true,
                panelUnfoldTwo: true,
                className: 'erd.cloud.ppm.review.entity.ReviewConclusion',
                typeTableData: [],
                dataList: [],
                reviewDataList: [],
                formData: {},
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                i18nMappingObj: {
                    conclute: this.getI18nByKey('conclute'),
                    description: this.getI18nByKey('description'),
                    keyWord: this.getI18nByKey('keyWord')
                },
                formReviewData: {}
            };
        },
        components: {
            // 基础表格
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        created() {
            this.getRequestData();
        },
        computed: {
            trialTitle() {
                // let key = this.$route.query?.taskDefKey || this.leafNode?.highLightedActivities[0] || '';
                // const titleMaps = {
                //     DcpReview: {
                //         Review: i18nMappingObj.auditConclusion // 审核结论
                //     },
                //     TechnicalReview: {
                //         PreReview: i18nMappingObj.preExaminationConclusion, //预审结论
                //         Review: i18nMappingObj.reviewConclusion // 正审结论
                //     }
                // };
                // return titleMaps[this.processKey]?.[key] || i18nMappingObj.auditConclusion;
                return i18nMappingObj.auditConclusion;
            },
            viewTableConfig() {
                const _this = this;
                // let { oid, createLink } = this;
                let config = {
                    tableKey: 'ReviewConclusionView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: {
                                className: 'erd.cloud.ppm.review.entity.ReviewConclusion',
                                viewRef: '',
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.ppm.review.entity.ReviewConclusion#reviewObjectRef',
                                        oper: 'EQ',
                                        logicalOperator: 'AND',
                                        sortOrder: 1,
                                        isCondition: true,
                                        value1: _this.formInfo
                                    }
                                ]
                            },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                placeholder: _this.i18nMappingObj.keyWord,
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            moreOperateList: []
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                        },
                        pagination: {
                            // 分页
                            showPagination: false, // 是否显示分页
                            pageSize: 20
                        },

                        fieldLinkConfig: {
                            fieldLink: false,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.project.entity.Project#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'status',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    }
                ];
            },
            conclusionFlag() {
                let key =
                    this.$route.query?.taskDefKey ||
                    (this.leafNode.highLightedActivities && this.leafNode?.highLightedActivities[0]);
                return ['Review', 'PreReview'].includes(key);
            },
            conclusionTableFlag() {
                let key = this.$route.query?.taskDefKey || this.leafNode?.highLightedActivities[0] || '';
                if (
                    (this.processKey === 'TechnicalReview' && key === 'PreReview') ||
                    (this.processKey === 'DcpReview' && key === 'Review')
                ) {
                    // 技术评审-预审节点&决策评审-审核节点不显示审核结论表格
                    return false;
                } else {
                    return true;
                }
            },
            formConfigs() {
                return [
                    {
                        field: 'conclusion',
                        label: this.i18nMappingObj.conclute,
                        required: true,
                        slots: {
                            component: 'typeComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'description',
                        label: this.i18nMappingObj.description,
                        required: true,
                        component: 'erd-input',
                        col: 12
                    }
                ];
            },
            defaultTableHeight() {
                return document.body.clientHeight - 243;
            }
        },
        methods: {
            getSlotsName(slotsField) {
                return slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            onFieldChange() {
                let self = this;
                if (this.formData.conclusion && this.formData.description) {
                    this.reviewConfig.reviewConclusion = true;
                    let reviewConclusion = {
                        attrRawList: [
                            {
                                attrName: 'reviewObjectRef',
                                value: self.formInfo
                            },
                            {
                                attrName: 'conclusion',
                                value: this.formData.conclusion
                            },
                            {
                                attrName: 'description',
                                value: this.formData.description
                            }
                        ],
                        className: 'erd.cloud.ppm.review.entity.ReviewConclusion'
                    };
                    this.$emit('ready', { type: 'reviewConclusion', reviewConclusion: reviewConclusion });
                } else {
                    this.reviewConfig.reviewConclusion = false;
                }
                localStorage.setItem('reviewConfig', JSON.stringify(this.reviewConfig));
            },
            removeItem() {},
            getRequestData() {
                this.$famHttp({
                    method: 'GET',
                    url: '/fam/dictionary/tree/WfReviewConclusionType'
                })
                    .then((res) => {
                        if (res.success) {
                            this.reviewDataList = res.data;
                        }
                    })
                    .catch(() => {
                        this.reviewDataList = [];
                    });
            }
        }
    };
    return subReviewComponent;
});
