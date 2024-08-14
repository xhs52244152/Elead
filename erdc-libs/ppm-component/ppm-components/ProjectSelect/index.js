define([
    'erdcloud.kit',
    'text!' + ELMP.resource('ppm-component/ppm-components/ProjectSelect/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/ProjectSelect/index.css')
], function (ErdcKit, template) {
    return {
        template,
        name: 'ProjectSelect',
        props: {
            multiple: Boolean,
            value: String | Array,
            label: {
                type: String,
                default: '项目'
            },
            type: {
                type: String,
                default() {
                    return 'widthLabel';
                }
            },
            clearable: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            placeholder: {
                type: String,
                default() {
                    return '请输入关键词';
                }
            },
            readonly: Boolean,
            requestData: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        components: {
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        data() {
            return {
                loading: false,
                options: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                }
            };
        },
        computed: {
            dataValue: {
                get() {
                    return this.value;
                },
                set(value) {
                    this.$emit('input', value);
                }
            }
        },
        watch: {
            dataValue(val) {
                console.log(val);
                this.$emit('change', val);
            }
        },
        created() {
            // 获取最近访问的作为初始选项
            // this.fetchGetRecentItems().then((data) => {
            //     this.options = data.map((item) => {
            //         return {
            //             ...item,
            //             oid: item.oid,
            //             displayName: item.name
            //         };
            //     });
            // });
        },
        methods: {
            searchProjMethod(keyword) {
                let handler = () => {
                    this.loading = true;
                    let { requestData } = this;
                    this.$famHttp({
                        url: '/ppm/listByKey',
                        method: 'GET',
                        data: {
                            className: 'erd.cloud.ppm.project.entity.Project',
                            keyword,
                            tmplTemplated: false,
                            ...requestData
                        }
                    })
                        .then((resp) => {
                            this.options = (resp?.data || []).map((item) => {
                                item.displayName = item.displayName.split(',')?.[1];
                                return item;
                            });
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                };

                if (this.$listeners['before-search']) {
                    this.$listeners['before-search']({
                        next: handler
                    });
                } else {
                    handler();
                }
            },
            fetchGetRecentItems() {
                return new Promise((resolve, reject) => {
                    this.loading = true;
                    this.$famHttp({
                        url: '/ppm/getVisiteds',
                        method: 'GET',
                        data: {
                            className: 'erd.cloud.ppm.project.entity.Project'
                        }
                    })
                        .then((resp) => {
                            resolve(resp.data);
                        })
                        .catch(() => {
                            reject();
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            }
        }
    };
});
