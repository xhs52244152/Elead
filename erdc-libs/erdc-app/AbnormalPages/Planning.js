define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        /*html*/
        template: `
            <abnormal-common-page
                title="comingSoon"
                tip="planningTip"
                fileName="comingSoon.png"
                imgWidth="400"
                :showGoBack="showGoBack"
            ></abnormal-common-page>
        `,
        components: {
            AbnormalCommonPage: ErdcKit.asyncComponent(
                ELMP.resource('erdc-app/AbnormalPages/components/AbnormalCommonPage/index.js')
            )
        },
        computed: {
            showGoBack() {
                return this.$route.meta?.showGoBack;
            }
        }
    };
});
