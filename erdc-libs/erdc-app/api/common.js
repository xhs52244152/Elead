define(['erdcloud.http'], function (axios) {
    return {
        /**
         * 创建对象
         * @param { attrRawList: Array, relationList: Array, oid: string, typeReference: string } payload
         */
        createObject(payload) {
            return axios.post('/fam/create', payload);
        },
        /**
         * 更新对象
         * @param { attrRawList: Array, relationList: Array, oid: string, typeReference: string } payload
         */
        updateObject(payload) {
            return axios.post('/fam/update', payload);
        },
        /**
         * 获取对象属性
         * @param {string} oid
         */
        fetchObjectAttr(oid, data) {
            const className = oid?.split(':')?.[1];
            const params = {
                oid,
                ...data
            }
            return axios.get('/fam/attr', {
                className,
                params
            });
        },
        /**
         * 获取对象属性
         * @param {string} oid
         */
        fetchObjectAttrByType(oid, typeOid) {
            const className = oid?.split(':')?.[1];
            return axios.get('/fam/attrByTypeOid', {
                className,
                params: {
                    oid,
                    typeOid
                }
            });
        },
        /**
         * 逐层获取树列表数据
         * @param { string } className
         * @param { string } appNames - 按应用查询
         * @param { string } containerRef
         * @param { boolean } isGetLinkCount - 是否返回关联对象计数
         * @param { string } parentKey
         * @param { Object } options
         */
        fetchListByParentKey(payload, options) {
            const { className, appNames, containerRef, parentKey } = payload;
            return axios.get('/fam/listByParentKey', {
                params: {
                    className,
                    appNames,
                    containerRef,
                    parentKey,
                    ...payload
                },
                ...options
            });
        },
        fetchServiceRouteInfo() {
            return axios.post('/fam/core/common/getServiceRouteInfo');
        },
        fetchUserMe() {
            return axios.get('/fam/user/me');
        },
        fetchUserList(payload) {
            return axios.post(
                '/fam/user/page',
                _.extend(
                    {
                        current: 1,
                        size: window.ELCONF.pageSize
                    },
                    payload
                )
            );
        },
        fetchTenantList() {
            return axios.get('/fam/user/tenant/list');
        },
        fetchI18n() {
            return axios.get('/fam/public/i18n/languages');
        },
        fetchObjectAttrByOId(oid) {
            let className = oid?.split(':')?.[1];
            return axios.get('/fam/attr', {
                className,
                params: {
                    oid
                }
            });
        }
    };
});
