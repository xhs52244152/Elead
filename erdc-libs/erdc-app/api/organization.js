define(['fam:http', 'underscore', ELMP.resource('erdc-app/api/common.js')], function () {
    const axios = require('fam:http');
    const _ = require('underscore');
    const store = require('fam:store');
    const commonApi = require(ELMP.resource('erdc-app/api/common.js'));
    return {
        fetchOrganizationListByParentKey(payload, options) {
            return commonApi.fetchListByParentKey(
                _.extend({ className: store.getters.className('organization') }, payload),
                options
            );
        },
        fetchOrganizationByOId(oid) {
            return commonApi.fetchObjectAttr(oid);
        }
    };
});
