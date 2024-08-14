define(['erdcloud.kit', ELMP.resource('ppm-utils/index.js')], function (ErdcKit, utils) {
    return {
        name: 'milestoneTable',
        template: `
            <erd-contraction-panel
                :unfold.sync="panelUnfolds"
                :title="$t('associatedMilestone')"
                :style=" processStep === 'activator' ? '' : 'padding-left: var(--largePadding);margin-top: calc(var(--bigSpace) * 2);'"
            >
                <template v-slot:content>
                    <fam-view-table
                        ref="milestoneTable"
                        :is-adaptive-height="false"
                        :view-table-config="viewTableConfig"
                        style="padding-bottom: 0 !important;"
                    ></fam-view-table>
                </template>
            </erd-contraction-panel>
        `,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
        },
        props: {
            businessData: {
                type: Array,
                default: () => []
            },
            processStep: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                panelUnfolds: true
            };
        },
        computed: {
            viewTableConfig() {
                let _this = this;
                return {
                    viewMenu: {
                        hiddenNavBar: true
                    },
                    tableKey: 'ListOfPlansForTheReviewProcess',
                    saveAs: false,
                    tableConfig: {
                        useCodeConfig: true,
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {
                                className: _this.className,
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.ppm.plan.entity.Task#identifierNo',
                                        value1: _this.businessData[0].milestoneTableData[0]['erd.cloud.ppm.plan.entity.Task#identifierNo'],
                                        isCondition: true,
                                        oper: "EQ"
                                    }
                                            
                                ]
                            },
                            transformResponse: [
                                function (data) {
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        // resData.data.records = _this.businessData[0]?.milestoneTableData || [];
                                    } catch (err) {
                                        console.log('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true,
                            showMoreSearch: true,
                            showRefresh: true,
                            fuzzySearch: {
                                show: true,
                                isLocalSearch: true
                            },
                            basicFilter: {
                                show: true
                            }
                        },
                        addSeq: true,
                        addOperationCol: false,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name',
                            linkClick: (row) => {
                                utils.openDetail(row);
                            }
                        },
                        pagination: {
                            showPagination: false
                        }
                    }
                };
            }
        }
    };
});
