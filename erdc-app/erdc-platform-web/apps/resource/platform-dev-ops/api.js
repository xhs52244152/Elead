define(['erdcloud.http'], function (axios) {
    return {
        /**
         * 获取服务列表
         */
        fetchServices() {
            return axios.get('/platform/service/list');
        },
        /**
         * 获取缓存空间
         * @param {Object} params 参数
         * @param {number} params.pageIndex
         * @param {number} params.pageSize
         * @param {string} params.service
         * @param {string} params.name
         */
        fetchCacheRegions({ pageIndex, pageSize, service, name }) {
            return axios.get('/fam/v1/cache/regions', {
                service,
                params: {
                    name,
                    pageIndex,
                    pageSize
                }
            });
        },
        /**
         * 清理所有缓存
         * @param {Object} params 参数
         * @param {string} params.service
         * @param {boolean} params.errorMessage
         */
        clearAllCaches({ service, errorMessage }) {
            return axios.get('/fam/v1/cache/clearAll', {
                service,
                errorMessage
            });
        },
        /**
         * 清理指定缓存
         * @param {Object} data 参数
         * @param {string[]} regions 缓存空间
         * @param {string} service
         * @param {boolean} errorMessage
         */
        clearCaches({ regions, service, errorMessage }) {
            return axios({
                url: '/fam/v1/cache/clear',
                method: 'post',
                errorMessage,
                service,
                data: regions
            });
        },
        /**
         * 获取缓存键
         * @param {string} region 缓存空间
         * @param {number} [pageIndex = 1]
         * @param {number} [pageSize = 20]
         * @param {string} service
         * @param {string} name
         */
        fetchCacheKeys({ region, pageIndex = 1, pageSize = 20, name, service } = {}) {
            return axios.get('/fam/v1/cache/keys', {
                service,
                params: {
                    region,
                    name,
                    pageIndex,
                    pageSize
                }
            });
        },
        /**
         * 删除缓存
         * @param {string} region 缓存空间
         * @param {string} service
         * @param {string[]} keys 需要删除的缓存键
         */
        deleteCacheKeys({ keys, region, service }) {
            return axios({
                url: '/fam/v1/cache/evict',
                method: 'post',
                service,
                params: {
                    region
                },
                data: keys
            });
        },
        /**
         * 获取缓存信息
         * @param {string} region 缓存空间
         * @param {string} service
         * @param {string} key
         */
        fetchCacheInfo({ region, service, key }) {
            return axios.get('/fam/v1/cache/get', {
                service,
                params: {
                    region,
                    key
                }
            });
        },
        /**
         * 刷新所有缓存
         * @param {string} service
         */
        refreshAllCaches({ service }) {
            return axios.get('/fam/v1/cache/refreshAllCache', {
                service
            });
        }
    };
});
