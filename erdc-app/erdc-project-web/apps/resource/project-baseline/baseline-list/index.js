define([ELMP.resource('ppm-utils/index.js'), ELMP.resource('ppm-component/ppm-common-actions/index.js')], function (
    utils,
    commonActions
) {
    const ErdcKit = require('erdcloud.kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('CbbBaseline');
    return {
        name: 'projectBaselineList',
        template: `
            <baseline-list
                style="background-color: #fff;"
                ref="BaselineList"
                table-key="ProjectBaselineView"
                action-key="PPM_BASELINE_LIST_MENU"
                row-action-key="PPM_BASELINE_LIST_OPERATE_MENU"
                :extend-params="extendParams"
                :is-need-prompt-info="false"
                :open-detail="openDetail"
                :change-validator-data="changeValidatorData"
                :set-action-config="setActionConfig"
            ></baseline-list>
        `,
        components: {
            BaselineList: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/list/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-baseline/baseline-list/locale/index.js'),
                tableKey: 'ProjectBaselineView',
                // 批量删除用到的className
                className: 'erd.cloud.cbb.baseline.entity.BaselineMaster'
            };
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            extendParams() {
                return {
                    data: {
                        conditionDtoList: [
                            {
                                attrName: 'erd.cloud.cbb.baseline.entity.Baseline#persistableRef',
                                oper: 'EQ',
                                logicalOperator: 'AND',
                                sortOrder: 0,
                                isCondition: true,
                                value1: this.pid
                            }
                        ],
                        containerRef: this.containerRef
                    }
                };
            },
            compareClassName() {
                return this.getViewTableMapping({ tableName: 'baseline' })?.className || '';
            },
            baselineList() {
                return this.$refs.BaselineList;
            },
            containerRef() {
                return this.$store.state?.space?.object?.containerRef || '';
            },
            // 项目oid
            pid() {
                return this.$route.query.pid;
            }
        },
        methods: {
            setActionConfig(data) {
                data.name = 'PPM_BASELINE_LIST_MENU';
                data.containerOid = this.containerRef;
                return data;
            },
            openDetail(row) {
                const isDraft = row.attrRawList.find(
                    (item) => item.attrName === `erd.cloud.cbb.baseline.entity.Baseline#lifecycleStatus.status`
                );
                let title =
                    row.attrRawList.find((item) => item.attrName === 'erd.cloud.cbb.baseline.entity.Baseline#name')
                        ?.displayName || '';
                let oid = row['oid'];
                this.$router.push({
                    path: isDraft.value === 'DRAFT' ? `baseline/update` : `baseline/detail`,
                    query: {
                        oid,
                        title,
                        pid: this.pid,
                        masterRef: row.masterRef
                    }
                });
            },
            refresh() {
                this.baselineList.reloadTable();
            },
            changeValidatorData(data) {
                data.moduleName = 'PPM_BASELINE_LIST_OP_MENU';
                return data;
            }
        }
    };
});
