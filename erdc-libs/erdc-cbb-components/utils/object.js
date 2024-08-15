define(['erdcloud.store', 'erdcloud.router'], function (store, router) {
    const ErdcHttp = require('erdcloud.http');
    return {
        /**
         * 获取对象属性
         * @param {string} oid
         */
        fetchObjectAttr(oid, data) {
            const className = oid?.split(':')?.[1];
            const params = {
                oid,
                ...data
            };
            return ErdcHttp({
                url: '/fam/attr',
                className,
                params,
                method: 'GET'
            });
        },
        // 对象检出
        handleCheckOut({ oid, className }) {
            return new Promise((resolve, reject) => {
                ErdcHttp({
                    url: '/fam/common/checkout',
                    params: {
                        oid
                    },
                    className,
                    method: 'GET'
                })
                    .then((resp) => {
                        if (resp?.success) {
                            const oid = resp?.data?.rawData?.oid?.value || '';
                            resolve(oid);
                        } else {
                            reject();
                        }
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        // 对象检入
        handleCheckIn({ oid, note, className }) {
            return ErdcHttp({
                url: '/fam/common/checkin',
                params: {
                    note,
                    oid
                },
                className,
                method: 'PUT'
            });
        },
        // 获取对象单个属性
        getObjectProperties(row, property) {
            let attrObj = {};
            if (_.isArray(row?.attrRawList) && row.attrRawList.length) {
                attrObj = _.find(row.attrRawList, (item) => new RegExp(`${property}$`).test(item?.attrName)) || {};
            } else if (_.isObject(row?.rawData) && !_.isEmpty(row.rawData)) {
                attrObj = row.rawData?.[property] || {};
            }
            return attrObj;
        },
        getAppNameByResource() {
            const resourcePath = store.getters['route/matchResourcePath'](
                router.currentRoute,
                store.state.route.resources
            );
            if (resourcePath && resourcePath.length > 0) {
                const appName = [...resourcePath].reverse().reduce((prev, resource) => {
                    return prev ? prev : store.getters.appNameByResourceKey(resource.identifierNo);
                }, '');
                if (typeof appName === 'string') {
                    return window.encodeURIComponent(appName);
                }
            }

            return 'plat';
        }
    };
});
