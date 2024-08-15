define(['erdcloud.store', ELMP.resource('erdc-app/api/common.js')], function (store, commonApi) {
    return {
        fetchOrgListByParentKey(payload, options) {
            return commonApi.fetchListByParentKey(
                {
                    params: _.extend(
                        {
                            className: store.getters.className('organization')
                        },
                        payload
                    )
                },
                options
            );
        },
        createOrganization(payload) {
            return commonApi.createObject(
                _.extend(
                    {
                        className: store.getters.className('organization'),
                        typeReference: null
                    },
                    payload
                )
            );
        },
        updateOrganization(payload) {
            return commonApi.updateObject(
                _.extend(
                    {
                        className: store.getters.className('organization'),
                        typeReference: null
                    },
                    payload
                )
            );
        },
        fetchOrganizationByOId(oid) {
            return commonApi.fetchObjectAttr(oid);
        }
    };
});
