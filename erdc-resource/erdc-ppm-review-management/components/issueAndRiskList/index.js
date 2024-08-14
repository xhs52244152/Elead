define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/issueAndRiskList/index.html'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/issueAndRiskList/index.css')
], function (ErdcKit, template, { i18nMappingObj }) {
    const subTaskComponent = {
        name: 'issueAndRiskList',
        template: template,
        props: {
            formInfo: {
                type: String,
                default: ''
            },
            projectId: {
                type: String,
                default: ''
            },
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            leafNode: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            currentClickNode: String
        },
        data() {
            return {
                panelUnfold: true,
                // 勾选的数据
                checkData: [],
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    add: this.getI18nByKey('add'),
                    remove: this.getI18nByKey('remove'),
                    addIssues: this.getI18nByKey('addIssues'),
                    addRisk: this.getI18nByKey('addRisk'),
                    addSupervise: this.getI18nByKey('addSupervise')
                },
                activeName: '',
                showDialog: false,
                searchVal: '',
                expandedKeys: [],
                viewId: '',
                // 项目的oid
                parentId: ErdcKit.getParam('pid'),
                tableData: [],
                planOid: '',
                className: 'erd.cloud.ppm.review.entity.ReviewObject',
                moveType: '',
                editRow: {},
                showCopyOrMoveDialog: false,
                tabsList: []
            };
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            ReviewRelationDiscreteTaskView: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/ReviewRelationDiscreteTaskView/index.js')
            ),
            ReviewRelationRiskView: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/ReviewRelationRiskView/index.js')
            ),
            ReviewRelationIssueView: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/ReviewRelationIssueView/index.js')
            )
        },
        created() {},
        watch: {
            formData: {
                handler(val) {
                    const tabsList = [
                        {
                            value: 'ReviewRelationDiscreteTaskView',
                            label: i18nMappingObj.handleTask, //督办任务
                            show: val.associatedDiscreteTask
                        },
                        {
                            value: 'ReviewRelationRiskView',
                            label: i18nMappingObj.risk, // 风险
                            show: val.associatedRisk
                        },
                        {
                            value: 'ReviewRelationIssueView',
                            label: i18nMappingObj.issue, // 问题
                            show: val.associatedIssue
                        }
                    ];
                    this.tabsList = tabsList.filter((item) => item.show);
                    if (!this.tabsList.find((item) => item.value === this.activeName))
                        this.activeName = this.tabsList[0]?.value;
                }
            }
        },
        computed: {
            tableHeight() {
                return document.documentElement.clientHeight - 302;
            },
            title() {
                return this.tabsList
                    .map((item) => {
                        return item.label;
                    })
                    .join('&');
            }
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: '',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            // 复选框全选
            selectAllEvent(data) {
                this.checkData = JSON.parse(JSON.stringify(data.records));
            },
            // 复选框勾选事件
            selectChangeEvent(data) {
                this.checkData = JSON.parse(JSON.stringify(data.records));
            },
            formatData(data) {
                let result =
                    data?.map((item) => {
                        let attrData = {};
                        item.attrRawList.forEach((item) => {
                            attrData[item.attrName] = item.displayName;
                        });
                        return Object.assign(attrData, item);
                    }) || [];
                return result;
            },
            refreshTable() {
                this.$refs[this.activeName] && this.$refs[this.activeName][0]?.refresh();
            }
        }
    };
    return subTaskComponent;
});
