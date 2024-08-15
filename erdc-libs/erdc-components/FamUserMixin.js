define(['erdc-kit'], function (FamKit) {
    const cache = {};
    return {
        created() {
            this.cachedUsers = cache;
        },
        methods: {
            setCachedUsers(value) {
                _.extend(cache, value);
            },
            fetchAndSetData(value) {
                if (cache[value]) {
                    return Promise.resolve(cache[value]);
                }
                return this.$famHttp({
                    url: '/fam/attr',
                    className: value.split(':')[1],
                    errorMessage: false,
                    params: {
                        oid: value
                    }
                }).then((res) => {
                    const rawData = res.data?.rawData;
                    let object = {};
                    if (rawData) {
                        object = FamKit.deserializeAttr(rawData, {
                            valueMap: {
                                orgName: 'departmentName'
                            }
                        });
                        object.displayName = object.displayNameCn;
                        object.orgName = object.department;
                        cache[value] = object;
                    }
                    return Promise.resolve(object);
                });
            }
        }
    };
});
