define([
    'vue',
    'underscore',
    'erdcloud.store',
    'erdcloud.router',
    'erdcloud.http',
    'erdcloud.i18n',
    'erdc-kit',
    ELMP.resource('erdc-app/screen-lock.js')
], function (Vue, _, store, router, ErdcloudHttp, ErdcloudI18n, ErdcKit, screenLock) {
    // 处理url路由前缀
    async function routePrefix(config) {
        // unSubPrefix  不传config.className的情况下不替换前缀
        let className =
            config.className || (!config.unSubPrefix && (config.params?.className || config.data?.className));
        if (!className && config.data && config.data instanceof FormData) {
            className = config.data.get('className');
        }
        if (!className && !config.service) return config;
        if (config.service && store.getters.getServicePath) {
            const regexp = /^\/?[^/]+/;
            let prefix = store.getters.getServicePath(config.service);
            if (prefix && regexp.test(config.url)) {
                config.url = config.url.replace(regexp, `/${prefix}`).replace('//', '/');
            }
        } else {
            if (!className) return config;
            config.url = ErdcKit.urlServicePrefix(config.url, className);
        }
        return config;
    }

    /**
     * 根据axios配置
     *
     * 匹配规则（按照顺序）：
     * 0. 如果自定义了 appId 请求头，则以自定义的为准
     * 1. 如果指定了className，尝试使用 className 匹配应用名
     * 2. 尝试使用当前高亮的菜单匹配
     * 3. 使用平台应用 erdcloud
     * @param {Object} config
     * @returns {Object}
     */
    function appId(config) {
        if (typeof config.headers['App-Name'] !== 'undefined') {
            return config;
        }
        if (typeof config.headers.appId !== 'undefined') {
            config.headers['App-Name'] = config.headers.appId;
            return config;
        }
        const appName = config.appId || config.appName;
        if (typeof appName !== 'undefined') {
            config.headers['App-Name'] = appName;
            return config;
        }

        const className = config.className || config.params?.className || config.data?.className;
        if (className) {
            const appName = store.getters.appNameByClassName(className);
            if (typeof appName === 'string') {
                config.headers['App-Name'] = window.encodeURIComponent(appName);
                return config;
            }
        }
        const resourcePath = store.getters['route/matchResourcePath'](router.currentRoute, store.state.route.resources);
        if (resourcePath && resourcePath.length > 0) {
            const appName = [...resourcePath].reverse().reduce((prev, resource) => {
                return prev ? prev : store.getters.appNameByResourceKey(resource.identifierNo);
            }, '');
            if (typeof appName === 'string') {
                config.headers['App-Name'] = window.encodeURIComponent(appName);
                return config;
            }
        }
        config.headers['App-Name'] = 'plat';
        return config;
    }

    // 默认请求头
    function defaultHeaders(config) {
        config.headers = {
            ...ErdcKit.defaultHeaders(),
            ...config.headers
        };
        return appId(config);
    }

    ErdcloudHttp.interceptors.request.use(routePrefix);
    ErdcloudHttp.interceptors.request.use(defaultHeaders);
    ErdcloudHttp.interceptors.response.use(
        function (response) {
            const status = response?.data?.code || response.status;
            if (Number(status) === 401 && !screenLock.lockingStatus()) {
                Vue.prototype.$msgbox
                    .confirm(ErdcloudI18n.translate('sessionLose'), ErdcloudI18n.translate('info'), {
                        confirmButtonText: ErdcloudI18n.translate('confirm'),
                        cancelButtonText: ErdcloudI18n.translate('cancel')
                    })
                    .then(() => {
                        window.location.reload();
                    });
                return Promise.reject(response);
            }
            return response;
        },
        function (response) {
            let responseData = response.data || {};
            const status = responseData.code || responseData.status || response.status;
            if (Number(status) === 401) {
                Vue.prototype.$msgbox
                    .confirm(ErdcloudI18n.translate('sessionLose'), ErdcloudI18n.translate('info'), {
                        confirmButtonText: ErdcloudI18n.translate('confirm'),
                        cancelButtonText: ErdcloudI18n.translate('cancel')
                    })
                    .then(() => {
                        window.location.reload();
                    });
            }
            return Promise.reject(response);
        }
    );
    ErdcloudHttp.interceptors.response.use(function (response) {
        const { config, data } = response;
        if (config?.type === 'file' || config?.responseType === 'blob') {
            // 文件流接口
            return response;
        } else if (response?.success) {
            // 标准接口
            return response;
        } else {
            if (!data.success) {
                if (data?.message && (_.isUndefined(config.errorMessage) || config.errorMessage)) {
                    Vue.prototype.$message({
                        type: 'error',
                        message: data?.message,
                        showClose: true,
                        duration: ErdcKit.getDurationByMessage(data?.message, 'error')
                    });
                }
                return Promise.reject(response.data);
            }
            return Promise.resolve(response);
        }
    });

    ErdcloudHttp.interceptors.response.use(function (response) {
        const { config } = response;
        if (config?.type === 'file' || config?.responseType === 'blob') {
            // 文件流接口
            return response;
        } else {
            return Promise.resolve(response.data);
        }
    });
});
