define([
    'fam:kit',
    'fam:store',
    'text!' + ELMP.resource('erdc-components/FamSpaceSelect/template.html'),
    'css!' + ELMP.resource('erdc-components/FamSpaceSelect/style.css')
], function (FamKit, store, template) {
    const { TreeUtil } = FamKit;

    // 【最近访问】限制的显示数量
    const VISITED_LIMITS = 5;
    // 业务对象限制的显示数量
    const LIST_LIMITS = 10;

    return {
        template,
        props: {
            value: String,
            // 是否开启搜索功能
            searchable: {
                type: Boolean,
                default: true
            },
            // 是否使用远程搜索
            remote: {
                type: Boolean,
                default: true
            },
            // 非远程时显示的对象
            list: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 空间类型名称`
            typeName: String,

            // 其它配置
            props: {
                type: Object,
                default() {
                    return {
                        // 展示字段
                        labelKey: 'name',
                        // 选中字段
                        valueKey: 'oid',
                        limits: LIST_LIMITS,
                        visitedLimits: VISITED_LIMITS
                    };
                }
            },
            // 下拉接口自定义传参
            extendParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            readonly: Boolean | String,
            textStyle: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                popoverVisible: false,
                keyword: '',
                innerList: this.list,
                filteredList: [],
                favoritesList: [],
                searchList: [],
                spaceObject: null,
                page: {
                    pageIndex: 1,
                    pageSize: 20
                },
                i18nLocalePath: ELMP.resource('erdc-components/FamSpaceSelect/locale/index.js'),
                i18nMappingObj: {
                    pleaseEnter: this.getI18nByKey('请输入'),
                    recentVisited: this.getI18nByKey('最近访问'),
                    myCollection: this.getI18nByKey('我的收藏'),
                    searchResult: this.getI18nByKey('搜索结果'),
                    allItems: this.getI18nByKey('查看所有产品'),
                    nodata: this.getI18nByKey('暂无数据')
                },
                asyncQueryId: '',
                asyncQueryComplete: false,
                space: this.$store.state.space,
                currentSpaceLabel: this.$store.state.space.objectMap[this.value].name
            };
        },
        watch: {
            space: {
                deep: true,
                immediate: true,
                handler(space) {
                    if(space.objectMap[this.value].name) {
                        this.currentSpaceLabel = space.objectMap[this.value].name
                    }
                }
            },
            value: function () {
                this.setSpaceObject();
            },
            typeName: {
                deep: true,
                handler(typeName) {
                    if (typeName) {
                        this.getList(typeName, this.keyword).then((list) => {
                            this.innerList = list;
                        });
                    }
                }
            }
        },
        created() {
            this.getList().then((list) => {
                this.innerList = list;
                this.filteredList = list;
                this.favoritesList = FamKit.deepClone(list);
                this.setSpaceObject();
            });
        },
        mounted() {
            try {
                this.$refs.spaceScrollbar.$refs.wrap.onscroll = this.onScroll;
            } catch (error) {
                console.error(error);
            }
        },
        beforeDestroy() {
            try {
                this.$refs.spaceScrollbar.$refs.wrap.onscroll = null;
            } catch (error) {
                console.error(error);
            }
        },
        methods: {
            setSpaceObject() {
                let oid = this.value;
                let spaceObject = null;
                if (this.getObjectAttrValue(this.spaceObject, this.props.valueKey) !== oid) {
                    spaceObject = TreeUtil.getNode(this.innerList, {
                        target: (node) => {
                            return oid === this.getObjectAttrValue(node, this.props.valueKey);
                        }
                    });
                }
                if (!spaceObject && oid) {
                    this.fetchAttr(oid).then(({ data }) => {
                        this.spaceObject = FamKit.deserializeAttr(data.rawData);
                    });
                } else {
                    this.spaceObject = spaceObject;
                }
            },
            onSearch: _.debounce(async function (val) {
                if (!val.trim()) {
                    this.filteredList = FamKit.deepClone(this.favoritesList);
                    return;
                }
                this.page.pageIndex = 1;
                this.asyncQueryId = '';
                const children = await this.getFilteredList();
                this.searchList = [
                    {
                        _isVirtual: true,
                        [this.props.labelKey]: this.i18nMappingObj.searchResult,
                        [this.props.valueKey]: '',
                        children
                    }
                ];
                this.filteredList = FamKit.deepClone(this.searchList);
            }, 150),
            onScroll: _.debounce(async function (event) {
                if (this.keyword) {
                    let { offsetHeight, scrollTop, scrollHeight } = event.target;

                    if (offsetHeight + scrollTop + 30 >= scrollHeight && !this.asyncQueryComplete) {
                        this.page.pageIndex++;
                        const originChildren = this.searchList[0].children;
                        const newList = await this.getFilteredList();
                        this.searchList[0].children = [...originChildren, ...newList];
                        this.filteredList = this.searchList;
                    }
                }
            }, 150),
            // 前端搜索，根据 props.labelKey 字段搜索
            async getFilteredList() {
                const searchList = await this.getSearchListByKey([]);
                if (searchList)
                    return searchList.map((item) => {
                        return {
                            oid: item.oid,
                            [this.props.labelKey]: item.attrRawList.find((subItem) => subItem.attrName === 'name')
                                ?.value,
                            typeOid: item.typeReference
                        };
                    });
            },
            getSearchListByKey() {
                const className = store.getters.className(this.typeName);
                return this.$famHttp({
                    url: '/fam/search',
                    data: {
                        className,
                        pageIndex: this.page.pageIndex,
                        pageSize: this.page.pageSize,
                        asyncQueryId: this.asyncQueryId,
                        deleteNoPermissionData: true,
                        conditionDtoList: [
                            {
                                attrName: `${className}#name`,
                                oper: 'LIKE',
                                value1: this.keyword,
                                logicalOperator: 'AND',
                                isCondition: true
                            }
                        ]
                    },
                    method: 'post'
                }).then(async (res) => {
                    const { records = [], asyncQueryId = '', complete = false } = res?.data || {};

                    this.asyncQueryComplete = complete;
                    // 初次加载, 获取到asyncQueryId后 再次加载
                    if (!this.asyncQueryId) {
                        this.asyncQueryId = asyncQueryId;
                        return await this.getSearchListByKey();
                    }
                    return records;
                });
            },
            getList() {
                return new Promise((resolve) => {
                    Promise.all([this.getFavoritesList('VISIT'), this.getFavoritesList('FAVORITE')]).then((args) => {
                        let result = ['recentVisited', 'myCollection'].map((item, index) => {
                            const data = Array.isArray(args?.[index]?.data) ? args?.[index]?.data : [];
                            return {
                                _isVirtual: true,
                                [this.props.labelKey]: this.i18nMappingObj[item],
                                [this.props.valueKey]: '',
                                children:
                                    data.map((subItem) => {
                                        return {
                                            oid: subItem.roleBObjectRef,
                                            [this.props.labelKey]: subItem.roleBDisplayName,
                                            typeOid: subItem.typeReference
                                        };
                                    }) || []
                            };
                        });
                        resolve(result);
                    });
                });
            },
            fetchObjectList(typeName, keyword) {
                return this.$famHttp({
                    url: '/fam/search',
                    data: {
                        keyword,
                        className: store.getters.className(typeName),
                        pageSize: LIST_LIMITS,
                        pageIndex: 1
                    },
                    method: 'post'
                });
            },
            getFavoritesList(type) {
                return this.$famHttp({
                    url: '/common/favorites/getFavoritesList',
                    data: {
                        type,
                        roleBObjectKey: store.getters.className(this.typeName),
                        tmplTemplated: JSON.parse(this.readonly)
                    },
                    method: 'post'
                });
            },
            getObjectAttrValue(object, field) {
                return object && FamKit.getObjectValue(object, field);
            },
            onSpaceClick() {
                this.keyword = '';
            },
            onChange(spaceObject) {
                this.$emit('change', spaceObject.oid, spaceObject);
                this.$refs.spacePopover?.doClose();
            },
            onPopoverVisibleChange(visible) {
                this.popoverVisible = visible;
                if (visible) {
                    this.$nextTick(() => {
                        this.$refs.search.focus();
                    });
                }
            },
            fetchAttr(oid) {
                return this.$famHttp({
                    url: '/fam/attr',
                    className: store.getters.className(this.typeName),
                    data: {
                        oid,
                        typeOid: this.spaceObject?.typeOid || this.$route.query.typeOid
                    }
                });
            },
            close() {
                this.$refs.spacePopover?.doClose();
            }
        }
    };
});
