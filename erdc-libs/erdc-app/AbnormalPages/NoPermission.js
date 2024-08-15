define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        /*html*/
        template: `
            <abnormal-common-page
                :title="show403 ? 403 : ''"
                :tip="tips"
                fileName="403.svg"
            ></abnormal-common-page>
        `,
        components: {
            AbnormalCommonPage: ErdcKit.asyncComponent(
                ELMP.resource('erdc-app/AbnormalPages/components/AbnormalCommonPage/index.js')
            )
        },
        props: {
            show403: {
                type: Boolean,
                default: true
            },
            tips: {
                type: String,
                default: 'noPermissionTip'
            }
        }
    };
});
