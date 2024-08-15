define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessTitle/template.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessTitle/index.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'BpmProcessTitle',
        template,
        components: {
            BpmProcessIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessNavigation/components/BpmProcessIcon/index.js'))
        },
        props: {
            processDefinitionKey: String,
            activities: Array,
            vertical: Boolean,
            viewActivityId: String
        },
        data() {
            return {
                collapsed: true,
                newActivities: []
            };
        },
        created() {
            if (this.activities.length > 0) {
                let newActivities = [], info = { children: [] };
                for (let i = 0; i < this.activities.length; i++) {
                    if (i === 0) {
                        newActivities.push(this.activities[i]);
                    }
                    else {
                        info.children.push(this.activities[i]);
                        i === this.activities.length - 1 && (newActivities.push(info));
                    }
                }
                this.newActivities = newActivities;
            }
        },
        methods: {
            translateActivity(activity) {
                return activity?.properties?.name || '--';
            }
        }
    };
});
