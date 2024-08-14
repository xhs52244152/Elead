define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js')
], function (ErdcKit, store, { i18nMappingObj }) {
    return {
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        inject: ['taskInfos', 'processInfos'],
        data() {
            return {
                reviewConfig: {
                    reviewConclusion: false,
                    reviewElementList: false,
                    deliveryList: false,
                    qualityObjectiveList: false
                },
                // 选择显示状态
                showDialog: false,
                extendParams: {
                    data: { deleteNoPermissionData: true, conditionDtoList: [] }
                }
            };
        },
        computed: {
            taskInfosRealtime() {
                return this.taskInfos();
            },
            processInfosRealTime() {
                return this.processInfos();
            }
        },
        methods: {
            afterRequest({ data, callback }) {
                let result = data.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(item.idKey + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            createLink(parentRef, childrenRefs = []) {
                const _this = this;
                return new Promise((resolve, reject) => {
                    let rawDataVoList = childrenRefs.map((child) => {
                        return {
                            attrRawList: [
                                {
                                    attrName: 'roleAObjectRef',
                                    value: parentRef
                                },
                                {
                                    attrName: 'roleBObjectRef',
                                    value: child
                                }
                            ]
                        };
                    });

                    _this.$loading();
                    this.$famHttp({
                        url: '/ppm/saveOrUpdate',
                        method: 'POST',
                        data: {
                            className: 'erd.cloud.ppm.review.entity.ReviewObjectRelationLink',
                            rawDataVoList
                        }
                    })
                        .then((resp) => {
                            _this.$message.success(i18nMappingObj.operationSuccessful);
                            resolve(resp);
                        })
                        .catch(() => {
                            reject();
                        })
                        .finally(() => {
                            _this.$loading().close();
                        });
                });
            },
            getSlotsName(slotsField) {
                return slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            reviewAdd(value) {
                return new Promise((resolve, reject) => {
                    let requestData = {
                        className: store.state.classNameMapping.reviewManagement,
                        conditionDtoList: [
                            {
                                attrName: 'erd.cloud.ppm.review.entity.WfReviewElement#reviewObjectRef',
                                oper: 'EQ',
                                logicalOperator: 'AND',
                                sortOrder: 1,
                                isCondition: true,
                                value1: value ? value : 'OR:erd.cloud.ppm.review.entity.ReviewObject:-1'
                            }
                        ],
                        queryId: '',
                        viewRef: '',
                        tableKey: 'WfReviewElementView'
                    };
                    this.$famHttp({
                        url: '/ppm/view/table/page',
                        method: 'POST',
                        data: requestData
                    })
                        .then((resp) => {
                            let reviewData = resp?.data.records || [];
                            resolve(reviewData);
                        })
                        .catch(() => {
                            reject([]);
                        });
                });
            },
            deliverAdd(value) {
                return new Promise((resolve, reject) => {
                    let requestData = {
                        className: store.state.classNameMapping.reviewManagement,
                        conditionDtoList: [
                            {
                                attrName: 'erd.cloud.ppm.review.entity.WfDeliveryList#reviewObjectRef',
                                oper: 'EQ',
                                logicalOperator: 'AND',
                                sortOrder: 1,
                                isCondition: true,
                                value1: value ? value : 'OR:erd.cloud.ppm.review.entity.ReviewObject:-1'
                            }
                        ],
                        queryId: '',
                        viewRef: '',
                        tableKey: 'WfDeliveryListView'
                    };
                    this.$famHttp({
                        url: '/ppm/view/table/page',
                        method: 'POST',
                        data: requestData
                    })
                        .then((resp) => {
                            let deliverData = resp?.data.records || [];
                            resolve(deliverData);
                        })
                        .catch(() => {
                            reject([]);
                        });
                });
            },
            reviewQuaAdd(value) {
                return new Promise((resolve, reject) => {
                    const oid = value ? value : 'OR:erd.cloud.ppm.review.entity.ReviewObject:-1';
                    this.$famHttp({
                        url: `/ppm/review/wfQualityObjective/listTree?reviewObjectOid=${oid}`,
                        method: 'GET',
                        className: store.state.classNameMapping.reviewManagement
                    })
                        .then((resp) => {
                            let quaData = resp?.data;
                            resolve(quaData);
                        })
                        .catch(() => {
                            reject([]);
                        });
                });
            },
            // 通过递归对数据进行重新赋值
            transformData(obj) {
                let arr = [];
                let idkey = 'erd.cloud.ppm.review.entity.WfQualityObjective#';
                obj.map((item) => {
                    let attrData = item;
                    if (item.createBy && item.updateBy) {
                        item.createBy = null;
                        item.updateBy = null;
                    }
                    item.attrRawList.forEach((item) => {
                        if (item.attrName !== 'createBy' && item.attrName !== 'updateBy') {
                            if (!item.attrName.includes('#')) {
                                attrData[`${idkey}${item.attrName}`] = item.displayName;
                            } else {
                                attrData[item.attrName] = item.displayName;
                            }
                        }
                    });
                    if (item.children) {
                        attrData.children = this.transformData(item.children);
                    }
                    arr.push(attrData);
                });
                return arr;
            },
            /**
             * 获取评审结论
             */
            getWfReviewType() {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        method: 'GET',
                        url: '/fam/dictionary/tree/' + this.typeDictName
                    })
                        .then((resp) => {
                            let data = resp?.data || [];
                            resolve(data);
                        })
                        .catch(() => {
                            reject([]);
                        });
                });
            }
        }
    };
});
