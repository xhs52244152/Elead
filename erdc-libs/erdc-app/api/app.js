define(['erdcloud.http'], function (axios) {
    return {
        /**
         * 获取当前用户信息
         */
        fetchUserMe(config) {
            return axios.get('/fam/user/me', {
                ...config
            });
        },
        /**
         * 获取当前用户所有可访问的租户
         */
        fetchTenantList() {
            return axios.get('/fam/user/tenant/list');
        },
        /**
         * 获取当前应用的国际化清单
         */
        fetchI18n() {
            return axios.get('/fam/public/i18n/languages');
        },
        /**
         * 切换租户
         * @param {string} tenantId
         */
        switchTenant(tenantId) {
            return axios.get(`/fam/user/toggle/${tenantId}`);
        },
        /**
         * 获取服务路由信息
         */
        fetchRoutePrefix() {
            return axios.post('/fam/core/common/getServiceRouteInfo');
        },
        fetchAllRelations() {
            return axios.get('/fam/resource/tree', {
                data: {
                    className: 'erd.cloud.foundation.core.menu.entity.Resource'
                }
            });
        }
    };
});
