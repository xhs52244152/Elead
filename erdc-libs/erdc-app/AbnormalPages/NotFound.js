define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        /*html*/
        template: `
            <abnormal-common-page
                title="404"
                tip="notFoundTip"
                fileName="404.svg"
            ></abnormal-common-page>
        `,
        components: {
            AbnormalCommonPage: ErdcKit.asyncComponent(
                ELMP.resource('erdc-app/AbnormalPages/components/AbnormalCommonPage/index.js')
            )
        }
    };
});
