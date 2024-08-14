define([
    'text!' + ELMP.resource('project-baseline/components/ProjectRelationObject/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.resource('project-baseline/components/ProjectRelationObject/index.css')
], function (template, store, utils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            BudgetList: ErdcKit.asyncComponent(ELMP.resource('project-budget/views/list/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-baseline/components/ProjectRelationObject/locale/index.js'),
                i18nMappingObj: {
                    project: this.getI18nByKey('project'),
                    task: this.getI18nByKey('task'),
                    require: this.getI18nByKey('require'),
                    milestone: this.getI18nByKey('milestone'),
                    budget: this.getI18nByKey('budget')
                },
                activeName: 'project',
                tableHeight: ''
            };
        },
        computed: {
            vm() {
                return this;
            },
            masterRef() {
                return this.$route.query.masterRef;
            },
            relationClassName() {
                // 里程碑className也是Task
                if (this.activeName === 'milestone') {
                    return 'erd.cloud.ppm.plan.entity.Task';
                }
                return store.state.classNameMapping[this.activeName];
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: this.relationClassName + '#name',
                        type: 'default'
                    },
                    {
                        prop: this.relationClassName + '#completionRate',
                        type: 'default'
                    },
                    {
                        prop: this.relationClassName + '#planInfo.completionRate',
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            className() {
                return store.state.classNameMapping.baseline;
            },
            tabsData() {
                return [
                    {
                        activeName: 'project',
                        name: this.i18nMappingObj.project
                    },
                    {
                        activeName: 'milestone',
                        name: this.i18nMappingObj.milestone
                    },
                    {
                        activeName: 'task',
                        name: this.i18nMappingObj.task
                    },
                    {
                        activeName: 'require',
                        name: this.i18nMappingObj.require
                    },

                    {
                        activeName: 'budget',
                        name: this.i18nMappingObj.budget
                    }
                ];
            },
            tableKey() {
                const tableKeys = {
                    project: 'ProjectBaselineRelationView',
                    task: 'TaskBaselineRelationView',
                    require: 'RequirementBaselineRelationView',
                    milestone: 'MilestoneBaselineRelationView'
                };
                return tableKeys[this.activeName];
            },
            projectOid() {
                return this.$route.query.pid;
            },
            oid() {
                return this.$route.query.oid;
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: _this.tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: { showOverflow: true },
                        tableRequestConfig: {
                            url: '/baseline/view/table/page',
                            data: {
                                relationshipRef: _this.oid,
                                className: 'erd.cloud.cbb.baseline.entity.BaselineMember',
                                baselined: true
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true
                            }
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            }
        },
        mounted() {
            this.tableHeight = document.body.clientHeight - 306;
        },
        methods: {
            openDetail(row) {
                let { masterRef } = this.formData || {};
                if (this.activeName === 'project') {
                    this.$router.push({
                        path: 'space/project-space/projectInfo',
                        query: {
                            pid: this.projectOid,
                            masterRef
                        }
                    });
                } else {
                    const changeRouteConfig = (route) => {
                        route.query.baselined = true;
                        return route;
                    };
                    utils.openDetail(row, { changeRouteConfig });
                }
            },
            getCompletionRate(row, percentSign = '') {
                let key = this.activeName === 'task' ? 'planInfo.completionRate' : 'completionRate';
                let percentKey = `${this.relationClassName}#${key}`;
                if (row[percentKey] === '（安全信息）') {
                    return '——';
                }
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            },
            getSlotName(name) {
                return `column:default:${this.relationClassName}#${name}:content`;
            }
        }
    };
});
