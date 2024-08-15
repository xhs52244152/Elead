define(['erdcloud.store', ELMP.resource('erdc-app/api/common.js')], function (store, commonApi) {
    const famHttp = require('fam:http');
    const FamKit = require('fam:kit');

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
        },

        // 查询按钮权限
        menuQuery(name, objectOid) {
            return new Promise((resolve) => {
                famHttp({
                    url: '/fam/menu/query',
                    method: 'POST',
                    data: {
                        name,
                        objectOid
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        const { actionLinkDtos } = data || {};
                        const buttonGroup = FamKit.structActionButton(actionLinkDtos);
                        resolve(buttonGroup.filter((item) => !item.hide && item.enabled).map((item) => item.name));
                    })
                    .catch(() => {
                        resolve([]);
                    });
            });
        }
    };
});
