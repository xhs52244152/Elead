define(['erdcloud.http'], function (axios) {
    return {
        /**
         * 设置所有应用上下线
         * @param {string} id
         * @param {boolean} status
         */
        changeOnline({ id, status }) {
            return axios.put(`/platform/mfe/apps/status/${id}/${status}`);
        },

        /**
         * 更新应用信息
         * @param {Object} params
         */
        updateInform(params) {
            return axios.put('/platform/mfe/apps/update', params);
        },

        /**
         * 获取应用配置原始信息
         * @param {String} pkgCode
         */
        getConfigData(params) {
            return axios.get('/platform/mfe/config/original/info', { params: params });
        },

        /**
         * 获取应用配置信息值
         */
        getConfigValue(params) {
            return axios.get('/platform/mfe/config', { params: params });
        },

        /**
         * 保存应用配置信息
         */
        saveConfigValue(params) {
            return axios.post('/platform/mfe/config', params);
        },

        /**
         * 资源版本内容更新
         */
        updateVersionInfo(id, params) {
            return axios.put(`/platform/mfe/apps/version/${id}`, params);
        },

        /**
         * 资源包切换版本
         */
        changeVersion({ srcId, targetId }) {
            return axios.put(
                '/platform/mfe/apps/version/change',
                { srcId, targetId },
                { headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' } }
            );
        },

        /**
         * 获取应用列表
         */
        getAppList() {
            return axios.get('/platform/application/list', { pageIndex: 1, pageSize: 1000 });
        },

        /**
         * 获取应用详细信息
         */
        getAppDetail(id) {
            return axios.get(`/platform/mfe/apps/detail/${id}`);
        },

        /**
         * 获取分组列表
         */
        getGroupData() {
            return axios.get('/platform//mfe/group/list');
        },

        /**
         * 保存分组信息
         */
        saveGroup(params) {
            return axios.post('/platform/mfe/group/save', params);
        },

        /**
         * 保存分组信息
         */
        deleteGroup(id) {
            return axios.delete(`/platform/mfe/group/${id}`);
        },

        /**
         * 还原微前端
         */
        backMicro(params) {
            return axios.post('/platform/mfe/apps/import', null, { params: params });
        },

        /**
         * 备份微前端
         */
        copyMicro() {
            return axios.get('/platform/mfe/apps/export');
        }
    };
});
