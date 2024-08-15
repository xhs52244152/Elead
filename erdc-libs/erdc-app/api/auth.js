define(['axios'], function (axios) {
    return {
        /**
         * 登录
         * @param { string } username
         * @param { string } password
         */
        login({ username, password }) {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            return axios.post('/oauth/erdp-token', formData, {
                headers: {
                    Authorization: window.ELCONF?.appAuth
                },
                contentType: false,
                processData: false
            });
        },
        /**
         * AD 域登录
         * @param { string } username
         * @param { string } password
         */
        loginAd({ username, password }) {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            return axios.post('/oauth/ad-token', formData, {
                headers: {
                    Authorization: window.ELCONF?.appAuth
                },
                contentType: false,
                processData: false
            });
        },
        /**
         * 退出登录
         */
        logout() {},
        /**
         * 获取登录公钥
         */
        fetchPublicKey() {
            return axios.get('/fam/public/publickey');
        },
        /**
         * 发送重置密码邮件
         * @param {string} email
         * @param {string} href - 邮件接收的链接
         */
        sendPasswordResetEmail(email, href) {
            return axios.get('/fam/public/resetPwd', {
                params: {
                    email,
                    path: href
                }
            });
        },
        /**
         * 校验重置密码对话
         * @param { string } code - 重置密码流水
         */
        validateResetPasswordSession(code) {
            return axios.get(`/fam/public/pwd/${code}`);
        },
        /**
         * 获取密码校验
         */
        fetchPasswordRules() {
            return axios.get('/fam/public/pwd/check/config');
        },
        /**
         * 重置密码
         * @param { string } code - 重置密码流水
         * @param { string } newPwd - 新密码
         */
        resetPassword(code, newPwd) {
            return axios.post('/fam/public/resetPwd', {
                code,
                newPwd
            });
        },
        /**
         * 切换租户
         * @param {string} tenantId
         */
        switchTenant(tenantId) {
            return axios.get(`/fam/user/toggle/${tenantId}`);
        },
        /**
         * 获取当前用户所有可访问的租户
         */
        fetchTenantList() {
            return axios({
                url: '/fam/user/tenant/list',
                headers: {
                    Authorization: window.localStorage.getItem('__erdcLogin__')
                }
            });
        }
    };
});
