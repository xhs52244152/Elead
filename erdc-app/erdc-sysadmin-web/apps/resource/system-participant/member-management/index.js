define([
    'text!' + ELMP.resource('system-participant/member-management/template.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('system-participant/member-management/style.css')
], function (template, ErdcKit) {
    return {
        template,
        components: {
            OrganizationManager: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/OrganizationManager/index.js')
            ),
            Role: ErdcKit.asyncComponent(ELMP.resource('system-participant/components/Role/index.js')),
            UserGroupManager: ErdcKit.asyncComponent(
                ELMP.resource('system-participant/components/UserGroupManager/index.js')
            )
        },
        data() {
            return {
                showHelp: false,
                activeTab: this.$route?.query?.tab || 'organization',
                // 国际化locale文件地址
                i18nPath: ELMP.resource('system-participant/locale/index.js')
            };
        },
        watch: {
            i18nMappingObj() {
                this.$nextTick(() => {
                    this.$refs.tabPanel?.$forceUpdate();
                });
            }
        }
    };
});
