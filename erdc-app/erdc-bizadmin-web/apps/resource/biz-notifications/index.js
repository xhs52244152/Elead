define(['vue', 'erdcloud.kit'], function (Vue, erdcloudKit) {
    return {
        template:
            '<div id="system-notify_ctt" class="system-notify_ctt h_100p">' +
            '    <component\n' +
            '        :is="componentName"\n' +
            '        :row="row"\n' +
            '        @switch-component="switchComponent"\n' +
            '\n' +
            '    ></component>\n' +
            '</div>',
        data: function () {
            const componentName = 'NotifyList';
            return {
                componentName: componentName,
                row: {}
            };
        },
        components: {
            NotifyList: erdcloudKit.asyncComponent(ELMP.resource('biz-notifications/components/NotifyList/index.js')),
            NotifyType: erdcloudKit.asyncComponent(ELMP.resource('biz-notifications/components/NotifyType/index.js')),
            NotifyTemplate: erdcloudKit.asyncComponent(
                ELMP.resource('biz-notifications/components/NotifyTemplate/index.js')
            ),
            NotDisturb: erdcloudKit.asyncComponent(ELMP.resource('biz-notifications/components/NotDisturb/index.js')),
            FamInfoTitle: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js'))
        },
        methods: {
            switchComponent: function (component, row) {
                this.row = row || {};
                this.componentName = component;
            }
        }
    };
});
