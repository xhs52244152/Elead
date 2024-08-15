define([
    'text!' + ELMP.resource('system-global-search/views/GlobalSearchManagement/index.html'),
    'css!' + ELMP.resource('system-global-search/styles/style.css')
], function (template) {
    const erdcloudKit = require('erdcloud.kit');

    return {
        template,
        components: {
            GlobalSearchConfigList: erdcloudKit.asyncComponent(
                ELMP.resource('system-global-search/views/GlobalSearchManagement/GlobalSearchConfigList/index.js')
            ),
            ViewManager: erdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/ViewManager/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-global-search/locale/index.js'),
                i18nMappingObj: {},
                componentName: 'GlobalSearchConfigList',
                row: {}
            };
        },
        methods: {
            switchComponent(componentName, row) {
                this.componentName = componentName || 'GlobalSearchConfigList';
                this.row = row;
            },
            callback() {
                this.componentName = 'GlobalSearchConfigList';
            }
        }
    };
});
