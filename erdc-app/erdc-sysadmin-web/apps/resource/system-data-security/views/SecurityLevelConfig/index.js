define([
    'text!' + ELMP.resource('system-data-security/views/SecurityLevelConfig/index.html'),
    'css!' + ELMP.resource('system-data-security/views/SecurityLevelConfig/style.css')
], function (template) {
    const FamKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            SecurityItemConfig: FamKit.asyncComponent(
                ELMP.resource('system-data-security/components/SecurityItemConfig/index.js')
            ),
            SecurityObjectConfig: FamKit.asyncComponent(
                ELMP.resource('system-data-security/components/SecurityObjectConfig/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-data-security/locale/index.js'),
                activeTab: 'SecurityItemConfig'
            };
        },
        computed: {
            componentConfig() {
                return [
                    {
                        name: this.i18n.levelConfiguration,
                        componentName: 'SecurityItemConfig',
                        props: {}
                    },
                    {
                        name: this.i18n.configureEncryption,
                        componentName: 'SecurityObjectConfig',
                        props: {}
                    }
                ];
            }
        }
    };
});
