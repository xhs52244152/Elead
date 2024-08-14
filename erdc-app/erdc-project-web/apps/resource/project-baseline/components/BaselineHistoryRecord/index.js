define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-baseline/components/BaselineHistoryRecord/index.html'),
    ELMP.resource('ppm-store/index.js')
], function (ErdcKit, template, store) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('CbbBaseline');
    return {
        template,
        components: {
            'history-record': ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/HistoryRecord/index.js'))
        },
        provide() {
            return {
                //工具栏操作按钮配置
                toolActionConfig: {
                    className: 'erd.cloud.pdm.part.entity.EtPartReferenceLink',
                    tableKey: 'PartReferenceLinksView',
                    actionName: 'BASELINE_HISTORY_OPERATE'
                }
            };
        },
        data() {
            return {
                className: store.state.classNameMapping.baseline,
                i18nLocalePath: ELMP.resource('project-baseline/components/BaselineHistoryRecord/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'checkData',
                    'upToThree',
                    'baselineComparison',
                    'code',
                    'name',
                    'status',
                    'version',
                    'type',
                    'context',
                    'lifecycleStatus',
                    'createdBy',
                    'createTime',
                    'updateBy',
                    'updateTime'
                ])
            };
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            oid() {
                return this.$route.query.oid || '';
            },
            compareClassName() {
                return this.getViewTableMapping({ tableName: 'baseline' })?.className || '';
            }
        },
        methods: {
            viewTableConfig(defaultViewTableConfig) {
                const { i18nMappingObj, viewHistoryVersion } = this;
                defaultViewTableConfig.columns = [
                    {
                        attrName: 'identifierNo', // 属性key
                        label: i18nMappingObj.code // 属性名称
                    },
                    {
                        attrName: 'name', // 属性key
                        label: i18nMappingObj.name // 属性名称
                    },
                    {
                        attrName: 'version', // 属性key
                        label: i18nMappingObj.version // 属性名称
                    },
                    {
                        attrName: 'typeReference', // 属性key
                        label: i18nMappingObj.type // 属性名称
                    },
                    {
                        attrName: 'containerRef', // 属性key
                        label: i18nMappingObj.context // 属性名称
                    },
                    {
                        attrName: 'lifecycleStatus.status', // 属性key
                        label: i18nMappingObj.lifecycleStatus // 属性名称
                    },
                    {
                        attrName: 'createBy', // 属性key
                        label: i18nMappingObj.createdBy // 属性名称
                    },
                    {
                        attrName: 'updateBy',
                        label: i18nMappingObj.updateBy,
                        width: 110
                    },
                    {
                        attrName: 'createTime',
                        label: i18nMappingObj.createTime
                    },
                    {
                        attrName: 'updateTime',
                        label: i18nMappingObj.updateTime
                    }
                ];
                defaultViewTableConfig.fieldLinkConfig = {
                    fieldLink: true,
                    // 是否添加列超链接
                    fieldLinkName: `identifierNo`,
                    linkClick: (row) => {
                        // 超链接事件
                        viewHistoryVersion(row);
                    }
                };
                return defaultViewTableConfig;
            },
            viewHistoryVersion: function (row) {
                if (row.oid !== this.oid) {
                    this.$router.push({
                        path: '/space/project-baseline/baseline/detail',
                        query: {
                            pid: this.$route.query.pid,
                            oid: row.oid,
                            title: row.name
                        }
                    });
                }
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                const eventClick = {
                    BASELINE_COMPARE: this.handleInfoCompare
                };

                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            //比较相关信息
            handleInfoCompare(data) {
                if (data.length < 1) {
                    this.$message.warning(this.i18nMappingObj.checkData);
                    return;
                }
                if (data.length > 3) {
                    this.$message.warning(this.i18nMappingObj.upToThree);
                    return;
                }
                // this.$store.commit('CbbBaseline/compareData', {
                //     oids: data.map((item) => item.oid)
                // });
                this.$store.commit('infoCompare/SET_INFO_COMPARE', {
                    className: this.compareClassName || '',
                    infoCompare: data.map((item) => item.oid) || []
                });
                this.$router.push({
                    path: '/space/project-baseline/baseline/infoCompare',
                    query: {
                        pid: this.$route.query.pid || '',
                        title: this.i18nMappingObj.baselineComparison
                    }
                });
            }
        }
    };
});
