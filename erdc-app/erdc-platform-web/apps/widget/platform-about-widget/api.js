define(['erdcloud.http'], function (axios) {
    return {
        fetchApplicationList() {
            return axios({
                url: '/platform/application/list'
            });
        },
        fetchServiceList({ pageIndex = 1, pageSize = 50 } = {}) {
            return axios({
                url: '/platform/service/list',
                params: {
                    pageIndex,
                    pageSize
                }
            });
        },
        fetchMicroFrontendApplicationList({ pageIndex = 1, pageSize = 50 } = {}) {
            return axios({
                url: '/platform/mfe/apps/page',
                params: {
                    pkgType: 'erdc-app',
                    pageIndex,
                    pageSize
                }
            });
        }
    };
});
