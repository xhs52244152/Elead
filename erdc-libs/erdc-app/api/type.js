define(['fam:http', 'fam:store'], function () {

    const axios = require('fam:http');
    const store = require('fam:store');

    return {
        fetchLayoutTypes () {
            const data = new FormData();
            data.append('realType', store.getters.className('layoutTypeEnum'));

            return axios({
                url: '/fam/type/component/enumDataList',
                method: 'post',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                data
            });
        },
        fetchAttributeCategories () {
            const data = new FormData();
            data.append('realType', store.getters.className('attributeCategoryEnum'));

            return axios({
                url: '/fam/type/component/enumDataList',
                method: 'post',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
                },
                data
            });
        },
        createLayout (data) {
            return axios({
                url: '/fam/create',
                method: 'post',
                data: data
            });
        },
        updateLayout (data) {
            return axios({
                url: '/fam/update',
                method: 'post',
                data: data
            });
        },
        fetchLayoutById (id) {
            return axios({
                url: '/fam/type/layout/get',
                method: 'get',
                params: {
                    id
                }
            });
        },
        fetchAttributes (typeOid) {
            return axios({
                url: '/fam/type/layout/find/attribute',
                method: 'get',
                data: {
                    typeOid,
                    attrName: '',
                    componentName: '',
                    attrCategory: ''
                }
            });
        },
        fetchComponentDefinitions () {
            return axios({
                url: '/fam/type/component/listData',
                method: 'get'
            });
        }
    };
});
