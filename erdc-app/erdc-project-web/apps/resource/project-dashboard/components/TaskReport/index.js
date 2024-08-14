define([
    'text!' + ELMP.resource('project-dashboard/components/TaskReport/index.html'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js',
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, echarts, ErdcKit, store) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                viewTableHeight: 320,
                defaultCollectId: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                currentPlanSet: '',
                collectOid: ''
            };
        },
        created() {},
        mounted() {},
        methods: {
            drawLine() {
                // 基于准备好的dom，初始化echarts实例
                let myChart = echarts.init(document.getElementById('taskChart'));
                // 绘制图表
                myChart.setOption({
                    tooltip: {
                        trigger: 'item'
                    },
                    series: [
                        {
                            name: 'Access From',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: 1048, name: 'Search Engine' },
                                { value: 735, name: 'Direct' }
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                });
            }
        },
        components: {
            CompletionRateDistribut: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/TaskReport/components/CompletionRateDistribut/index.js')
            ),
            PlanSetDistribut: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/TaskReport/components/PlanSetDistribut/index.js')
            ),
            StateDistribut: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/TaskReport/components/StateDistribut/index.js')
            ),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            DashboardConfig: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/DashboardConfig/index.js')
            ),
            TaskList: ErdcKit.asyncComponent(ELMP.resource('project-task/components/TaskList/index.js'))
        }
    };
});
