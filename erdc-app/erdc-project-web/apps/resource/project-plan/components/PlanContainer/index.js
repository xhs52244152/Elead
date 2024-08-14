define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/PlanContainer/index.html'),
    'css!' + ELMP.resource('project-plan/components/PlanContainer/index.css')
], function (ErdcKit, template) {
    const listTabsComponent = {
        name: 'PlanContainer',
        template: template,
        data() {
            return {
                activeName: 'PlanTreeTable',
                tabsList: [
                    {
                        value: 'PlanTreeTable',
                        label: '树结构'
                    },
                    {
                        value: 'Gantt',
                        label: '甘特图'
                    }
                ],
                showList: true
            };
        },
        components: {
            PlanTreeTable: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/PlanTreeTable/index.js')),
            Gantt: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/Gantt/index.js'))
        },
        methods: {}
    };
    return listTabsComponent;
});
