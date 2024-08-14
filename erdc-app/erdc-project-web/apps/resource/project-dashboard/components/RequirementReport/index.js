define([
    'text!' + ELMP.resource('project-dashboard/components/RequirementReport/index.html'),
    '/erdc-thirdparty/platform/echarts/dist/echarts.min.js',
    'erdcloud.kit',
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, echarts, ErdcKit) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js')
            };
        },
        created() {},
        components: {
            DemandSources: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/RequirementReport/components/DemandSources/index.js')
            ),
            RequirementStatus: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/RequirementReport/components/RequirementStatus/index.js')
            ),
            DemandPriority: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/RequirementReport/components/DemandPriority/index.js')
            )
        },
        computed: {},
        methods: {}
    };
});
