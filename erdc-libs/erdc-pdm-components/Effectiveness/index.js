define([
    'text!' + ELMP.resource('erdc-pdm-components/Effectiveness/index.html'),
    'css!' + ELMP.resource('erdc-pdm-components/Effectiveness/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'Effectiveness',
        template,
        components: {
            FamPlanning: ErdcKit.asyncComponent(ELMP.resource('erdc-app/AbnormalPages/Planning.js'))
        }
    };
});
