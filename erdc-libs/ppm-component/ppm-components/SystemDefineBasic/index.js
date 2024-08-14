define([
    'text!' + ELMP.resource('ppm-component/ppm-components/SystemDefineBasic/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('ppm-component/ppm-components/SystemDefineBasic/style.css')
], function (template, ErdcKit) {
    return {
        template,
        props: {
            layoutName: {
                type: String,
                default: 'DETAIL'
            },
            className: {
                type: String,
                default: ''
            },
            moduleTitle: {
                type: String,
                default: ''
            },
            detailUrl: {
                type: String,
                default: '/cbb/attr'
            },
            treeDetail: {
                type: Object,
                default: {}
            },
            tabListData: {
                type: Array,
                default: () => []
            },
            // 对象oid
            oid: String
        },
        data() {
            return {
                basicUnfold: true,
                editableAttrs: ['parentRef'],
                formClassName: '',
                formData: {
                    parentRef: ''
                }
            };
        },
        created() {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        watch: {
            // moduleTitle: {
            //     handler(nVal, oVal) {
            //         if (nVal && oVal) {
            //             setTimeout(() => {
            //                 // this.getFormAttrData(this.oid);
            //             }, 300);
            //         }
            //     },
            //     immediate: true
            // },
            treeDetail(val) {
                if (val && val.oid) {
                    this.getFormAttrData(val.oid);
                }
            },
            oid: {
                handler(nVal) {
                    if (nVal) {
                        setTimeout(() => {
                            this.getFormAttrData(nVal);
                        }, 300);
                    }
                },
                immediate: true
            }
        },
        methods: {
            queryLayoutParams() {
                return {
                    name: this.layoutName,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.layoutName
                        // }
                    ]
                };
            },
            handleEdit() {
                this.$emit('edit-data', this.formData);
            },
            getParentPath(id) {
                this.formData.parentRef = '';
                return new Promise((resolve) => {
                    this.$famHttp({
                        url:
                            this.$route.path === '/erdc-ppm-products'
                                ? '/cbb/productInfo/getParentPathName'
                                : '/cbb/heavyTeam/getParentPathName',
                        params: { oid: id },
                        className: this.className,
                        method: 'get'
                    }).then((res) => {
                        if (res.code === '200') {
                            let path = '';
                            if (res.data) {
                                let resoult = res.data.split('/');
                                path = resoult.at(-1);
                            }
                            resolve(path || '');
                        }
                    });
                });
            },
            // 查询接口请求
            fetchGetFormData(oid) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: this.detailUrl,
                        className: this.className,
                        method: 'get',
                        data: {
                            oid: oid
                        }
                    })
                        .then((resp) => {
                            if (resp.code === '200') {
                                resolve(resp.data?.rawData || {});
                            } else {
                                reject();
                            }
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            getFormAttrData(val) {
                // 查询表单信息
                if (val) {
                    this.fetchGetFormData(val).then(async (res) => {
                        let data = ErdcKit.deserializeAttr(res, {
                            valueMap: {
                                nameI18nJson: (e, data) => {
                                    return data['nameI18nJson']?.displayName || '';
                                },
                                type: (e, data) => {
                                    return data['type']?.value || '';
                                },
                                status: (e, data) => {
                                    return data['status']?.displayName || '';
                                },
                                category: (e, data) => {
                                    return data['category']?.displayName || '';
                                },
                                reviewCategoryRef: (e, data) => {
                                    return data['reviewCategoryRef']?.displayName || '';
                                },
                                reviewType: (e) => {
                                    return e?.value || '';
                                },
                                createBy: ({ users }) => {
                                    return users;
                                },
                                updateBy: ({ users }) => {
                                    return users;
                                },
                                responsibilityRoleRef: (e) => {
                                    return e?.oid || '';
                                },
                                configTab: (e) => {
                                    let tabs = e.value?.split(',') || [];
                                    let submitTabsData = [];
                                    this.tabListData.forEach((item) => {
                                        if (tabs.includes(item.value)) {
                                            submitTabsData.push(item.oid);
                                        }
                                    });
                                    return submitTabsData;
                                    // return data['configTab']?.displayName || '';
                                }
                            }
                        });
                        this.formData = data;
                        if (this.$route.path == '/erdc-ppm-products' || this.$route.path === '/erdc-ppm-heavy-team') {
                            this.formData.parentRef = await this.getParentPath(val);
                        }
                    });
                }
            },
            refresh() {
                this.getFormAttrData(this.oid);
            }
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        }
    };
});
