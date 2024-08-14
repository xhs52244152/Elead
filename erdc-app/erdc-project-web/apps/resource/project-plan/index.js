define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/index.html'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (ErdcKit, template) {
    return {
        template,
        components: {
            PlanContainer: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/PlanContainer/index.js')),
            FormTabs: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/FormTabs/index.js'))
        }
    };
});
