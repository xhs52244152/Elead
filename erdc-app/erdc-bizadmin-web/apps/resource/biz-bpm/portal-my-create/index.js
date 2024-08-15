define(['text!' + ELMP.resource('biz-bpm/portal-my-create/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'processMyCreate',
        template: template,
        components: {
            MyCreateTable: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/portal-my-create/components/MyCreateTable/index.js')
            )
        },
        data: function () {
            return {};
        }
    };
});
