define(['vue', 'axios'], function (Vue, axios) {
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    const globalErrorAbortController = new AbortController();
    const defaultInterceptors = {
        request: {
            timestamp: function (config) {
                config.params = {
                    _t: new Date().getTime(),
                    ...config.params
                };
                return config;
            },
            normalize: function (config) {
                // 未填写默认get
                const method = config.method || 'get';
                // 支持参数转换的请求
                const compatMethod = ['get', 'GET'];
                if (!config.params && compatMethod.includes(method)) {
                    config.params = config.data || {};
                }
                config.method = method;

                if (['POST', 'post', 'put', 'PUT'].includes(method)) {
                    config.headers = {
                        'Content-Type': 'application/json;charset=UTF-8',
                        ...config.headers
                    };
                }
                return config;
            },
            globalErrorAbortController: function (config) {
                if (!config?.preventAbort && !config.signal) {
                    config.signal = globalErrorAbortController.signal;
                }
                return config;
            }
        },
        response: {
            errorStatusCode: function (error) {
                return new Promise((resolve, reject) => {
                    let status = error?.response?.status || error.status || error.code;
                    let statusText = error?.response?.statusText || error.statusText;
                    status = [undefined, 'null'].includes(status) ? status : status + '';
                    if (Number(status) === 401) {
                        globalErrorAbortController.abort(new Error('ERR_CANCELED'));
                    }
                    if (
                        status !== 'ERR_CANCELED' &&
                        status !== 'ECONNABORTED' &&
                        (_.isUndefined(error?.config?.errorMessage) || error?.config?.errorMessage)
                    ) {
                        require(['erdcloud.i18n'], function (erdcloudI18n) {
                            let msg = erdcloudI18n.translate(status);
                            if (status && statusText !== 'OK' && msg) {
                                // 取消的请求不需要提示
                                Vue.prototype.$message({
                                    type: 'error',
                                    message: msg,
                                    showClose: true
                                });
                            } else {
                                Vue.prototype.$message.error(erdcloudI18n.translate('ERR_NETWORK'));
                            }
                            reject(error.response || error);
                        });
                    } else {
                        reject(error.response || error);
                    }
                });
            }
        }
    };
    const axiosInstance = axios.create({
        baseURL: window.location.origin
    });
    axiosInstance.interceptors.request.use(defaultInterceptors.request.timestamp);
    axiosInstance.interceptors.request.use(defaultInterceptors.request.normalize);
    axiosInstance.interceptors.request.use(defaultInterceptors.request.globalErrorAbortController);
    function licenseError(error) {
        if (error?.response?.status === 503 && error?.response?.data?.code === 10503) {
            window.location.replace('/fam/erdc/license');
            return new Promise((resolve) => {
                setTimeout(function () {
                    resolve();
                }, 100);
            });
        }
        return Promise.reject(error);
    }
    axiosInstance.interceptors.response.use(function (response) {
        return response;
    }, licenseError);
    axios.interceptors.response.use(function (response) {
        return response;
    }, licenseError);
    axiosInstance.interceptors.response.use(function (response) {
        return response;
    }, defaultInterceptors.response.errorStatusCode);
    // 绑定到实例
    Vue.prototype.$famHttp = axiosInstance;
    return axiosInstance;
});
