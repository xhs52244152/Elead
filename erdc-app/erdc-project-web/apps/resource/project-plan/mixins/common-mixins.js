define([], function () {
    const projectClassName = 'erd.cloud.ppm.project.entity.Project';
    return {
        methods: {
            // 通用删除
            deleteByIdsRequest(params) {
                return this.$famHttp({
                    url: '/ppm/deleteByIds',
                    method: 'DELETE',
                    params: {},
                    data: params,
                    className: params.className || projectClassName
                });
            },
            // 通用批量保存
            saveOrUpdateRequest(params) {
                return this.$famHttp({
                    url: '/ppm/saveOrUpdate',
                    method: 'POST',
                    data: params,
                    className: params.className || projectClassName
                });
            },
            // 通用创建
            createRequest(params) {
                return this.$famHttp({
                    url: '/ppm/create',
                    method: 'POST',
                    data: params,
                    className: params.className || projectClassName
                });
            },
            // 通用保存
            updateRequest(params) {
                return this.$famHttp({
                    url: '/ppm/update',
                    method: 'POST',
                    data: params,
                    className: params.className || projectClassName
                });
            },
            // 通用获取生命周期
            statesRequest(params) {
                return this.$famHttp({
                    method: 'POST',
                    url: '/ppm/common/template/states',
                    data: params,
                    className: params.className || projectClassName
                });
            }
        }
    };
});
