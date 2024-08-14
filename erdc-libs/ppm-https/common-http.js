define(['fam:http'], function (famHttp) {
    const projectClassName = 'erd.cloud.ppm.project.entity.Project';
    const commonRequest = {
        // 通用详情
        commonAttr(requestConfig) {
            let className = (requestConfig.data?.oid || '').split(':')[1] || projectClassName;
            return famHttp({
                url: '/ppm/attr',
                className,
                ...requestConfig
            });
        },
        // 通用批量删除
        deleteByIds(requestConfig, url) {
            let className = (requestConfig.data?.oidList?.[0] || '').split(':')[1] || projectClassName;
            return famHttp({
                url: url || '/ppm/deleteByIds',
                method: 'DELETE',
                className,
                ...requestConfig
            });
        },
        // 通用批量保存
        saveOrUpdate(requestConfig) {
            return famHttp({
                url: '/ppm/saveOrUpdate',
                method: 'POST',
                className: requestConfig.data?.className || projectClassName,
                ...requestConfig
            });
        },
        // 通用创建
        commonCreate(requestConfig) {
            return famHttp({
                url: '/ppm/create',
                method: 'POST',
                className: requestConfig.data?.className || projectClassName,
                ...requestConfig
            });
        },
        // 通用保存
        commonUpdate(requestConfig) {
            return famHttp({
                url: '/ppm/update',
                method: 'POST',
                className: requestConfig.data?.className || projectClassName,
                ...requestConfig
            });
        },
        // 通用获取生命周期
        fetchStates(requestConfig) {
            return famHttp({
                method: 'POST',
                url: '/ppm/common/template/states',
                className: requestConfig.data?.className || projectClassName,
                ...requestConfig
            });
        },
        // 通用单个删除
        commonDelete(requestConfig, url) {
            let className = (requestConfig.params?.oid || '').split(':')[1] || projectClassName;
            return famHttp({
                url: url || '/ppm/delete',
                className,
                method: 'DELETE',
                ...requestConfig
            });
        },
        // 通用查询类型选项
        findAccessTypes(requestConfig) {
            return famHttp({
                url: '/fam/type/typeDefinition/findAccessTypes',
                appName: 'PPM',
                ...requestConfig
            });
        },
        /**
         * 批量增加关联
         * @param { String } parentRef - 父对象oid
         * @param { Array } childrenArrs - 子对象oid数组
         * @param { String } className
         * */
        batchAddRelate(parentRef, childrenArrs, className) {
            let params = {
                className,
                rawDataVoList: []
            };
            childrenArrs.forEach((oid) => {
                params.rawDataVoList.push({
                    attrRawList: [
                        {
                            attrName: 'roleAObjectRef',
                            value: parentRef
                        },
                        {
                            attrName: 'roleBObjectRef',
                            value: oid
                        }
                    ]
                });
            });
            return commonRequest.saveOrUpdate({ data: params });
        },
        // 获取业务对象的流程信息
        getProcessDefDto(requestConfig) {
            return famHttp({
                method: 'POST',
                url: '/ppm/communal/getProcessDefDto',
                className: requestConfig.data?.className || projectClassName,
                ...requestConfig
            });
        },
        // 获取编码
        getCode(typeId) {
            return new Promise((resolve, reject) => {
                famHttp({
                    url: '/fam/code/getCodeRuleByTypeId',
                    data: {
                        typeId
                    },
                    method: 'GET'
                })
                    .then(async (resp) => {
                        const { data } = resp;
                        if (!data) {
                            reject();
                        }
                        let code = await commonRequest.getCodeData(data?.code || '');
                        resolve(code);
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        getCodeData(ruleCode) {
            return new Promise((resolve, reject) => {
                famHttp({
                    url: '/fam/code/getCode',
                    data: {
                        ruleCode,
                        valueMap: {}
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        resolve(resp?.data || '');
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        getCodeByTypeName(typeName, valueMap = {}, size = 1) {
            return new Promise((resolve, reject) => {
                famHttp({
                    url: '/fam/code/getCodeByTypeName',
                    data: {
                        typeName,
                        valueMap,
                        size
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        let data = resp?.data || [];
                        resolve(size == 1 ? data[0] || '' : data);
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        getByProductOid() {
            return new Promise((resolve, reject) => {
                famHttp({
                    url: '/element/reviewCategory/getByProductOid',
                    method: 'GET',
                    className: 'erd.cloud.cbb.review.entity.ReviewCategory'
                })
                    .then((resp) => {
                        resolve(resp.data);
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        findReviewData(params, className) {
            return new Promise((resolve, reject) => {
                famHttp({
                    url: '/ppm/review/findReviewData/',
                    method: 'post',
                    className,
                    data: params
                })
                    .then((resp) => {
                        resolve(resp.data);
                    })
                    .catch(() => {
                        reject();
                    });
            });
        },
        // 获取评审流程草稿oid
        getReviewDraft(data) {
            return new Promise((resolve, reject) => {
                famHttp({
                    url: '/ppm/plan/v1/getReviewDraft',
                    method: 'POST',
                    data: data.map((item) => {
                        return item.oid;
                    })
                })
                    .then((resp) => {
                        resolve(resp.data);
                    })
                    .catch(() => {
                        reject();
                    });
            });
        }
    };
    return commonRequest;
});
