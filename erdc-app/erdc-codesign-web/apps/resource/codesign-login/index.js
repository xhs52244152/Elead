define([
    'text!' + ELMP.resource('codesign-login/index.html'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js')
], function (template, coDesignConfig) {
    const axios = require('fam:http');
    const { apiPrefix } = coDesignConfig;
    return {
        template,
        mounted() {
            // 判断是否已经登录
            axios
                .get(`${apiPrefix}/api/getLoginInfo`)
                .then((res) => {
                    if (res?.data?.isLogin) {
                        // 已经登录的话，存个标识
                        localStorage.setItem('isDesktop', true);
                        // 如果已经登录就直接进
                        this.$router.push('/container/codesign-list/list');
                    } else {
                        // 未登录就跳到登录页去登录
                        location.href = '/erdc-app/erdc-codesign-web/apps/resource/codesign-login/plugin/index.html';
                    }
                })
                .catch(() => {
                    location.href = '/erdc-app/erdc-codesign-web/apps/resource/codesign-login/plugin/index.html';
                });
        }
    };
});
