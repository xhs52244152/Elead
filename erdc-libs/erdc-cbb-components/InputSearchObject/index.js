define([
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'text!' + ELMP.resource('erdc-cbb-components/InputSearchObject/index.html'),
    'css!' + ELMP.resource('erdc-cbb-components/InputSearchObject/index.css')
], function (cbbUtils, template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'InputSearchObject',
        template,
        components: {
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            value: [Boolean],
            className: [String],
            pageConfig: {
                type: Object,
                default() {
                    return {
                        sizes: [5, 10, 20, 50, 100],
                        layout: 'total, prev, next,jumper'
                    };
                }
            },
            tableKey: [String],
            editRow: [Object],
            info: [Object],
            condition: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/InputSearchObject/locale/index.js'),
                objectList: [],
                keyword: '',
                pageSize: 10,
                total: 0,
                currentPage: 1,
                emptyImgSrc: ELMP.resource('erdc-app/images/empty.svg')
            };
        },
        computed: {
            columns() {
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n?.['编码']
                    },
                    {
                        prop: 'name',
                        title: this.i18n?.['名称']
                    },
                    {
                        prop: 'version',
                        title: this.i18n?.['版本']
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n?.['生命周期']
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n?.['上下文']
                    }
                ];
            },
            dataValue: {
                get() {
                    return this.value;
                },
                set(newVal) {
                    return newVal;
                }
            }
        },
        methods: {
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
            },
            handlefocus() {
                this.$emit('input', false);
            },
            handleRemoteMethod() {
                ErdcKit.debounceFn(() => {
                    this.getPageData();
                }, 1000);
            },
            getPageData() {
                const _this = this;
                let data = {
                    className: _this.className,
                    searchKey: _this.keyword,
                    pageIndex: _this.currentPage,
                    pageSize: _this.pageSize,
                    conditionDtoList: [
                        ...[
                            {
                                attrName: `${this.className}#lifecycleStatus.status`,
                                oper: 'NE',
                                sortOrder: 9,
                                value1: 'DRAFT'
                            }
                        ],
                        ...this.condition
                    ]
                };

                let appName = this.appName || cbbUtils.getAppNameByResource();
                _this
                    .$famHttp({
                        url: '/fam/search',
                        data,
                        appName,
                        className: this.className,
                        method: 'post'
                    })
                    .then((res) => {
                        const { success } = res;
                        if (success) {
                            _this.objectList = res?.data?.records.map((item) => {
                                const obj = {};
                                item.attrRawList.forEach((v) => {
                                    obj[v.attrName] = v?.displayName;
                                    if (v.attrName === 'icon') {
                                        obj[v.attrName] = v?.value;
                                    }
                                    if (v.attrName === 'patternDesc') {
                                        obj[v.attrName] = v?.value;
                                    }
                                    if (v.attrName === 'lifecycleStatus.status') {
                                        obj[v.attrName] = {
                                            value: v?.value,
                                            displayName: v?.displayName
                                        };
                                    }
                                });
                                return {
                                    ...item,
                                    ...obj
                                };
                            });
                            _this.total = Number(res?.data?.total);
                        }
                    });
            },
            handleSizeChange(val) {
                this.pageSize = val;
                this.handleRemoteMethod();
            },
            handleCurrentChange(val) {
                this.currentPage = val;
                this.handleRemoteMethod();
            },
            handleChooseData(data) {
                if (!data.accessToView) {
                    return;
                }
                this.$emit('callback', [data]);
                this.$emit('input', false);
            },
            handleChooseObject() {
                this.$emit('chooseObject');
            },
            handleClose() {
                this.$emit('input', false);
            }
        }
    };
});
