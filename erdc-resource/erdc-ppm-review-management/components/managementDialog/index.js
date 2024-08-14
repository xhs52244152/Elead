//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.func('erdc-ppm-review-management/components/managementDialog/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    'erdc-kit'
], function (template, ErdcKit, commonActions, { i18nMappingObj }, FamKit) {
    return {
        template,
        props: {
            showDialog: {
                typeof: Boolean,
                default: false
            },
            title: {
                typeof: String,
                default: i18nMappingObj.startProcess // 发起流程
            },
            visible: {
                type: Boolean,
                default: false
            },
            className: {
                type: String,
                default: 'erd.cloud.cbb.review.entity.ReviewCategory'
            },
            oid: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    selectData: this.getI18nByKey('selectData')
                },
                isSaving: false,
                formData: {
                    type: '',
                    point: ''
                },
                variableData: [],
                typeData: [],
                originData: [],
                pointData: [],
                pointArrData: [],
                treeProps: {
                    children: 'childList',
                    label: 'displayName',
                    id: 'value'
                }
            };
        },
        created() {
            // setTimeout(() => {
            this.loadReviewMethod();
            // }, 1000);
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            formConfigs() {
                return [
                    {
                        field: 'type',
                        label: i18nMappingObj.reviewType, // 评审类型
                        required: true,
                        slots: {
                            component: 'typeComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'point',
                        label: i18nMappingObj.reviewPoints, // 评审点
                        required: true,
                        slots: {
                            component: 'variableComponent'
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            loadReviewMethod() {
                let params = {
                    productOid: this.oid
                };
                this.$famHttp({
                    url: '/element/reviewCategory/getByProductOid',
                    method: 'GET',
                    className: 'erd.cloud.cbb.review.entity.ReviewCategory',
                    params: params // 放在地址栏里
                }).then((resp) => {
                    let resdata = resp.data || [];
                    this.originData = JSON.parse(JSON.stringify(resdata));
                    if (resdata.length) {
                        this.typeData = resdata.map((item) => {
                            return {
                                value: item.oid,
                                reviewType: item.reviewType,
                                displayName: item.name
                            };
                        });
                    }
                });
            },
            handleTypesChange(data) {
                if (data) {
                    if (this.formData.point) {
                        this.formData.point = '';
                    }
                    let params = {
                        oid: data
                    };
                    this.$famHttp({
                        url: '/element/reviewCategory/listTreeByOid',
                        method: 'GET',
                        className: 'erd.cloud.cbb.review.entity.ReviewCategory',
                        params: params // 放在地址栏里
                    }).then((resp) => {
                        let resdata = resp.data || [];
                        this.pointData = JSON.parse(JSON.stringify(resdata));
                        this.variableData = resdata;
                        // 多维转一位数组
                        this.pointArrData = FamKit.TreeUtil.flattenTree2Array(FamKit.deepClone(this.pointData), {
                            childrenField: 'childList'
                        });
                    });
                }
            },
            handleConfirm() {
                if (!this.formData.type || !this.formData.point) {
                    this.$message({
                        showClose: true,
                        message: this.i18nMappingObj.selectData,
                        type: 'error'
                    });
                    return false;
                }
                const selectDataA = this.originData.filter((item) => item.oid === this.formData.type);
                const selectDataB = this.pointArrData.filter((item) => item.oid === this.formData.point.oid);
                let selectData = {
                    type: selectDataA,
                    point: selectDataB
                };
                const params = {
                    reviewPointOid: this.formData.point?.oid,
                    projectOid: this.$route.query.pid
                };
                this.$famHttp({
                    url: '/ppm/review/findReviewData/',
                    method: 'post',
                    className: this.className,
                    data: params
                }).then((res) => {
                    let businessData = res.data || {};
                    // 用于区分业务对象是否相同
                    businessData.typeOid = this.formData?.point?.oid || '';
                    // 用于草稿页面重新调接口去获取人员数据
                    businessData.urlConfig = {
                        className: this.className,
                        data: params
                    };
                    businessData = [businessData];
                    let engineModelKey =
                        this.typeData.find((item) => item.value === this.formData.type)?.reviewType || '';
                    //流程key + ':setReviewInfo' 用于区分评审流程和决策流程
                    localStorage.setItem(engineModelKey + ':setReviewInfo', JSON.stringify(selectData));
                    let customGetProcessFunc = () => {
                        return new Promise((resolve) => {
                            let obj = {
                                data: [
                                    {
                                        engineModelKey
                                    }
                                ]
                            };
                            resolve(obj);
                        });
                    };
                    let oid = this.$store.state.space.object.containerRef || {};
                    commonActions.startProcess(this, {
                        containerRef: oid,
                        businessData,
                        customGetProcessFunc
                    });
                });
                this.innerVisible = false;
            },
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        }
    };
});
