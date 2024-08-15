define([], function () {
    const axios = require('erdcloud.http');

    return {
        createObject({ className, data }) {
            return axios({
                url: '/fam/create',
                method: 'POST',
                className,
                data
            });
        },
        updateObject({ className, data }) {
            return axios({
                url: '/fam/update',
                method: 'POST',
                className,
                data
            });
        },
        fetchLayoutByOId(layoutId) {
            return axios({
                url: '/fam/type/layout/get',
                className: 'erd.cloud.foundation.layout.entity.LayoutDefinition',
                data: {
                    id: layoutId.split(':').at(-1) || layoutId
                }
            });
        },
        fetchObjectByOid(oid) {
            return axios({
                url: '/fam/attr',
                className: oid.split(':')[1],
                params: {
                    oid: oid
                }
            });
        }
    };
});
