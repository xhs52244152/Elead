define([ELMP.resource('erdc-cbb-components/utils/index.js')], function (utils) {
    // 建议使用erdc-cbb-components/utils的通用详情跳转方法，该方法后续会移除
    // 查看对象详情
    async function goToDetail(row, customRoute) {
        return utils.goToDetail(row, customRoute);
    }

    return {
        goToDetail
    };
});
