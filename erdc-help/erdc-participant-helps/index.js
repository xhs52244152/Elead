define([
    ELMP.resource('erdc-participant-helps/locale/index.js'),
    ELMP.resource('erdc-guideline/index.js'),
    'erdcloud.kit',
    'erdcloud.i18n'
], function (i18nConfig, ErdcHelp) {
    const ErdcKit = require('erdcloud.kit');
    const ErdcI18n = require('erdcloud.i18n');
    const i18n = ErdcI18n.wrap(i18nConfig);

    return function ({ help, route }) {
        return {
            showHelp() {
                return ErdcHelp.useDrawer({ title: help.title, help })
                    .render(
                        ErdcHelp.useDefaultContent({
                            steps: [
                                {
                                    title: i18n.aboutParticipantManagementGuidelines,
                                    key: 'PARTICIPANT_MANAGE',
                                    component: ErdcKit.asyncComponent(
                                        ELMP.resource('erdc-participant-helps/ParticipantManageGuideline/index.js')
                                    ),
                                    active: /^\/system-participant/.test(route.path),
                                    href: '/erdc-app/erdc-sysadmin-web/index.html#/system-participant/member'
                                },
                                {
                                    title: i18n.userLicenseAuthorizationGuideline,
                                    key: 'LICENSE_MANAGE',
                                    component: ErdcKit.asyncComponent(
                                        ELMP.resource('erdc-participant-helps/LicenseAuthorization/index.js')
                                    ),
                                    active: /license/.test(route.path),
                                    href: '/erdc-app/erdc-platform-web/index.html#/platform-license'
                                }
                            ]
                        })
                    )
                    .show();
            }
        };
    };
});
