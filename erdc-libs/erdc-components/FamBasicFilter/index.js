define([
    'text!' + ELMP.resource('erdc-components/FamBasicFilter/index.html'),
    'css!' + ELMP.resource('erdc-components/FamBasicFilter/style.css'),
    'fam:kit'
], function (template, css1, FamKit) {
    return {
        template,
        props: {
            mainModelType: String,
            // 可选字段，没有就根据主类型查询
            conditionColumnsList: {
                type: Array,
                default() {
                    return [];
                }
            },
            columnsList: {
                type: Array,
                default() {
                    return [];
                }
            },
            maxNumber: {
                type: Number,
                default: 4
            },
            showData: {
                type: Array,
                default() {
                    return [];
                }
            },
            viewRef: String,
            tableKey: {
                type: String,
                default: ''
            }
        },
        components: {
            ComponentWidthLabel: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        data() {
            return {
                basicFilterConditions: [],
                showMoreBasicFilter: false,
                searchKey: '',
                moreBasicFilterField: [],
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamBasicFilter/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['add_conditions', 'clear_conditions']),
                allConditionList: [],
                currentConditions: [],
                // 回显填充数据
                renderData: []
            };
        },
        computed: {
            formattedBasicFilterConditions() {
                return this.basicFilterConditions?.map((item) => {
                    const column = this.columnsList?.find((column) => item.oid && column.oid === item.oid) || item;
                    this.$set(item, 'componentJson', column.componentJson);
                    return item;
                });
            }
        },
        watch: {
            showMoreBasicFilter(val) {
                if (val) {
                    document.body.addEventListener('click', this.hideMoreBasicFilter);
                } else {
                    document.body.removeEventListener('click', this.hideMoreBasicFilter);
                }
            },
            showData: {
                immediate: true,
                handler(val) {
                    this.renderData = val;
                    // 初始值为空时，条件值置空
                    if (val.length < 1) {
                        this.basicFilterConditions.forEach((item) => {
                            item.value = '';
                        });
                    }
                }
            },
            mainModelType: {
                immediate: true,
                handler(val) {
                    if (this.conditionColumnsList.length < 1 && val && !this.tableKey) {
                        this.fetchConditionByType(val).then((resp) => {
                            this.allConditionList = (resp?.data?.headers || []).filter((item) => item.filterAble);
                        });
                    }
                }
            },
            // 传的条件
            conditionColumnsList: {
                immediate: true,
                handler(val) {
                    this.allConditionList = val || [];
                }
            },
            columnsList: {
                immediate: true,
                handler(val) {
                    if (this.tableKey) {
                        this.allConditionList = val;
                    }
                }
            },
            viewRef: {
                immediate: true,
                handler(nv) {
                    // 获取localstorage
                    if (nv) {
                        this.fnBasicFilter(this.allConditionList);
                    }
                }
            },
            // 全部条件
            allConditionList: {
                handler(value) {
                    this.fnBasicFilter(value);
                },
                immediate: true
            },
            basicFilterConditions: {
                handler(value = []) {
                    let result = [];
                    let { allConditionList } = this;
                    let basicFilterConditionsName = value.map((item) => {
                        return item.attrName;
                    });

                    allConditionList.forEach((item) => {
                        if (!basicFilterConditionsName.includes(item.attrName)) {
                            result.push({
                                ...item,
                                isShow: true
                            });
                        }
                    });

                    this.moreBasicFilterField = result;
                },
                immediate: true
            }
        },
        methods: {
            // 隐藏更多基础筛选下拉选择框
            hideMoreBasicFilter(e) {
                const filtersContainer = document.querySelector('.more-base-filters-container');
                const filtersBtn = this.$refs.FamBasicFilter.querySelector('.fam-basicfilter-popover-btn');
                if (!filtersBtn.contains(e.target) && !filtersContainer.contains(e.target)) {
                    this.showMoreBasicFilter = false;
                }
            },
            // 获取当前视图基础筛选
            fnBasicFilter(value) {
                let { maxNumber, renderData, fnComponentHandle, getDefaultOper } = this;
                // 获取localstorage
                const basicFilterConditions = this.$store.getters.getPreferenceConfig({
                    viewOid: this.viewRef,
                    type: 'baseFilter'
                });
                // 仅在视图表格中需要有这个记忆功能
                if (basicFilterConditions && this.viewRef) {
                    const attrNames = (value || []).map((item) => item.attrName);
                    this.basicFilterConditions = basicFilterConditions.filter((item) => {
                        return !!attrNames.includes(item.attrName);
                    });
                } else {
                    this.basicFilterConditions = (value || []).slice(0, maxNumber)?.map((item) => {
                        let initData =
                            renderData.filter((data) => {
                                return data.attrName === item.attrName;
                            })?.[0] || {};
                        let value = initData?.value1 ?? '';
                        if (initData?.value2) value = [value, initData.value2];
                        let showComponent = fnComponentHandle(item.componentName).showComponent;
                        return {
                            ...item,
                            showComponent,
                            operator: getDefaultOper(item.componentName),
                            options: item.options || [],
                            value
                        };
                    });
                }
            },
            // 每个条件的封装组件回调函数
            fnComponentCallback(resp) {
                if (resp) {
                    let findCondition = this.basicFilterConditions.find((ite) => ite.field == resp.field);
                    findCondition && (findCondition.valueDisplayName = resp?.label || '');
                }
            },
            // 更多基础筛选字段搜索
            onMoreBasicFilterSearch() {
                let searchKey = this.searchKey;
                this.moreBasicFilterField.forEach((item) => {
                    item.isShow = new RegExp(searchKey).test(item.label);
                });
            },
            // 移除基础筛选条件
            removeBasicFilter(condition) {
                this.basicFilterConditions = this.basicFilterConditions.filter((item) => {
                    return item !== condition;
                });
                this.showMoreBasicFilter = false;
                this.fnOnConditionChange();
                if (this.viewRef) {
                    this.$store.commit('PREFERENCE_CONFIG', {
                        config: {
                            configType: 'viewTableConfig',
                            type: 'baseFilter',
                            viewOid: this.viewRef,
                            _this: this
                        },
                        resource: this.basicFilterConditions
                    });
                }
            },
            // 清空全部基础筛选条件值
            clearAllBasicFilter() {
                this.basicFilterConditions.forEach((item) => {
                    this.$refs[item.attrName]?.[0].onClear(true);
                });

                this.$nextTick(() => {
                    this.fnOnConditionChange();
                });
            },
            // 添加基础筛选条件
            addBasicFilter(condition) {
                let { maxNumber, fnComponentHandle, getDefaultOper } = this;
                if (this.basicFilterConditions.length >= maxNumber) {
                    return this.$message.warning({
                        message: `筛选条件不能超过${maxNumber}个`,
                        showClose: true
                    });
                }

                let showComponent = fnComponentHandle(condition.componentName).showComponent;
                this.basicFilterConditions.push({
                    ...condition,
                    showComponent,
                    operator: getDefaultOper(condition.componentName),
                    options: condition.options || [],
                    value: ''
                });

                // 收起面板
                this.showMoreBasicFilter = false;

                // 新添加的组件自动获取焦点，下拉款要展开
                this.$nextTick(() => {
                    let compRef = condition.attrName;
                    this.$refs?.[compRef]?.[0]?.focus();
                });
                if (this.viewRef) {
                    this.$store.commit('PREFERENCE_CONFIG', {
                        config: {
                            configType: 'viewTableConfig',
                            viewOid: this.viewRef,
                            type: 'baseFilter',
                            _this: this
                        },
                        resource: this.basicFilterConditions
                    });
                }
            },
            // 条件变更
            fnOnConditionChange() {
                let newConditions = this.getConditions();

                if (JSON.stringify(newConditions) !== JSON.stringify(this.currentConditions)) {
                    this.currentConditions = newConditions;
                    this.$emit('condition-change', newConditions);
                    this.$emit('input', newConditions);
                }
            },
            // 获取条件数据
            getConditions() {
                return this.basicFilterConditions
                    .filter((item) => {
                        if (_.isString(item.value)) return item.value.trim() !== '';
                        else return (item.value ?? '') !== '';
                    })
                    .map((item) => {
                        let value = Array.isArray(item.value)
                            ? item.value.filter((item) => item !== undefined).join(',')
                            : item.value;

                        return {
                            attrName: item.attrName,
                            oper: item.operator,
                            value1: value,
                            logicalOperator: 'AND',
                            isCondition: true
                        };
                    });
            },
            onFilterFocus() {
                this.showMoreBasicFilter = false;
            },
            // 获取基础筛选各组件默认操作符
            getDefaultOper(componentName) {
                let showComponent = this.fnComponentHandle(componentName).showComponent;
                return (
                    this.$store.getters.getBasicFilterOper(componentName) ||
                    this.$store.getters.getBasicFilterOper(showComponent) ||
                    'EQ'
                );
            },
            // 根据主类型查询可搜索字段
            fetchConditionByType(mainModelType) {
                return this.$famHttp({
                    url: '/fam/table/head',
                    method: 'POST',
                    data: {
                        className: mainModelType,
                        attrGroupName: 'ViewDefaultConditions',
                        isJoint: true
                    }
                });
            }
        }
    };
});
