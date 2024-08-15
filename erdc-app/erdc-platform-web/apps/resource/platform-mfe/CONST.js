define(['erdc-kit'], function (ErdcKit) {
    let lan = localStorage.getItem('lang_current') || 'zh-cn';
    let tenantId = '';
    try {
        tenantId = JSON.parse(localStorage.getItem('tenantId'));
    } catch (e) {
        console.error(e);
    }

    let CONST = {
        defaultHeaders: ErdcKit.defaultHeaders(),
        emptyImg: '/erdc-libs/erdc-assets/images/empty.svg'
    };
    return CONST;
});
