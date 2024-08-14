define([
    'text!' + ELMP.resource('project-dashboard/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, ErdcKit) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                reportShow: {
                    issue: true,
                    risk: true,
                    requirement: true,
                    project: true,
                    task: true
                }
            };
        },
        created() {},
        mounted() {},
        computed: {
            oid() {
                return this.$route.query.pid;
            }
        },
        methods: {},
        components: {
            RiskReport: ErdcKit.asyncComponent(ELMP.resource('project-dashboard/components/RiskReport/index.js')),
            ProjectReport: ErdcKit.asyncComponent(ELMP.resource('project-dashboard/components/ProjectReport/index.js')),
            IssueReport: ErdcKit.asyncComponent(ELMP.resource('project-dashboard/components/IssueReport/index.js')),
            taskReport: ErdcKit.asyncComponent(ELMP.resource('project-dashboard/components/TaskReport/index.js')),
            RequirementReport: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/RequirementReport/index.js')
            )
        }
    };
});
