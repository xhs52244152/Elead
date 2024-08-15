define([ELMP.resource('platform-mfe/api.js'), 'vue', 'erdcloud.store'], function (api, Vue, store) {
    return {
        /**
         * 设置所有应用上下线
         * @param {string} id
         * @param {boolean} status
         */
        changeStatus(params, refreshTable) {
            api.changeOnline(params).then((res) => {
                if (res.data) {
                    Vue.prototype.$message({
                        type: 'success',
                        message: '保存成功',
                        showClose: true
                    });
                    refreshTable();
                } else {
                    Vue.prototype.$message({
                        type: 'error',
                        message: res.message,
                        showClose: true
                    });
                }
            });
        },

        getCurrentTheme() {
            return store.state.mfe.currentTheme === 'general-ultra';
        }
    };
});
