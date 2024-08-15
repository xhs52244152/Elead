/**
 * @module 公共组件
 * @component FamTableToolbar
 * @props { FamTableToolbarProps } - props参数引用
 * @description 视图表格头部组件
 * @author Mr.JinFeng
 * @example 可参考FamAdvancedTable组件页面使用代码，也可以查看README.md介绍
 * 组件声明
 * components: {
 *   FamTableToolbar: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTableToolbar/index.js'))
 * }
 *
 * @typedef { Object } FamTableToolbarProps
 * @property { Object } toolbarConfig -- 头部组件配置，具体查看README.md文件介绍
 * @property { Array } columnsHeader -- 表格列头数据，组件内置使用的列配置组件需要使用这个数据源，头部组件会做一些逻辑处理，数据过滤等
 * @property { Array } tableSelectData -- 表格选中的数据，用于控制部分按钮是否启用
 * @property { Array } conditionDtoListDefault -- 高级条件回显数据源
 */
define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/FamTableToolbar/index.html'),
    // 'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/FamTableToolbar/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            tableKey: {
                type: String,
                default: ''
            },
            // 当前表格配置信息
            tableViewsInfo: {
                type: Object,
                default: () => ({})
            },
            // 当前视图信息
            viewInfo: {
                type: Object | String,
                default() {
                    return '';
                }
            },
            // 头部配置内容
            toolbarConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 表格列头数据，配置列要用
            columnsHeader: {
                type: Array,
                default() {
                    return [];
                }
            },
            defaultColumns: {
                type: Array,
                default() {
                    return [];
                }
            },
            tableSelectData: {
                type: [Object, Array],
                default() {
                    return [];
                }
            },
            // 高级条件回显
            conditionDtoListDefault: {
                type: Array | String,
                default() {
                    return [];
                }
            },
            // 条件字段
            conditionColumnsList: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 基础筛选回显数据
            basicFilterData: {
                type: Array,
                default() {
                    return [];
                }
            },
            isLayoutWidget: {
                type: Boolean,
                default: false
            },
            // 表格主类型
            mainModelType: String,
            // 视图表格oid
            viewRef: String,
            searchStr: String
        },
        data() {
            return {
                colSettingVisible: false, // 列配置是否显示
                showPopover: false,
                advancedVisible: false, // 高级搜索
                currentConditions: [], // 当前高级搜索条件
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamAdvancedTable/FamTableToolbar/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['moreActions', 'pleaseInput', '字段设置']),
                showBasicFilter: true,
                showAdvancedFilter: false,
                showClassifySearch: false,
                contextOid: this.$store?.state?.space?.context?.oid
            };
        },
        components: {
            FamTableColSet: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            ),
            FamAdvancedConditions: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamAdvancedConditions/index.js')
            ),
            FamActionButton: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FamBasicFilter: FamKit.asyncComponent(ELMP.resource('erdc-components/FamBasicFilter/index.js')),
            famClassifySearch: FamKit.asyncComponent(ELMP.resource('erdc-components/famClassifySearch/index.js')),
        },
        computed: {
            innerConditionColumnsList() {
                this.conditionColumnsList.forEach((i) => {
                    if (i.componentJson) {
                        i.componentJson = JSON.parse(i.componentJson);
                        i.componentJson.props = i.componentJson.props || {};
                        i.componentJson.props.showWordLimit = false;
                        i.componentJson = JSON.stringify(i.componentJson);
                    } else {
                        i.componentJson = JSON.stringify({
                            props: {
                                showWordLimit: false
                            }
                        });
                    }
                });
                return this.conditionColumnsList;
            },
            defaultReqParams() {
                return this.toolbarConfig?.defaultReqParams;
            },
            columnSetList() {
                return this.columnsHeader.filter(
                    (item) => !item.extraCol && !['operation', 'icon'].includes(item.attrName)
                );
            },
            // 配置列
            configColVisible() {
                if (this.isLayoutWidget || this.toolbarConfig.useCodeConfig) {
                    return this.toolbarConfig?.showConfigCol;
                }

                // 视图表格 配置按钮状态从接口配置项获取
                const tableViewConfig = this.tableViewsInfo.viewConfigItems?.includes('config');
                return tableViewConfig ?? this.toolbarConfig?.showConfigCol;
            },
            // 是否显示刷新
            showRefresh() {
                if (this.isLayoutWidget || this.toolbarConfig.useCodeConfig) {
                    return this.toolbarConfig.showRefresh;
                }

                // 视图表格 刷新按钮状态从接口配置项获取
                const tableViewRefresh = this.tableViewsInfo.viewConfigItems?.includes('refresh');
                return tableViewRefresh ?? this.toolbarConfig.showRefresh;
            },
            fuzzySearch() {
                return this.toolbarConfig?.fuzzySearch || {};
            },
            // 普通搜索
            fuzzySearchVisible() {
                return this.fuzzySearch.show ?? true;
            },
            fuzzySearchPlaceholder() {
                return this.fuzzySearch.placeholder || this.i18nMappingObj.pleaseInput;
            },
            fuzzySearchClearable() {
                return (this.fuzzySearch.clearable ?? '') === '' ? true : this.fuzzySearch.clearable;
            },
            // 批量操作列表
            moreOperList() {
                return this.toolbarConfig?.moreOperateList || [];
            },
            // 主按钮
            mainBtn() {
                return this.toolbarConfig?.mainBtn || '';
            },
            // 次要按钮
            secondaryBtn() {
                return this.toolbarConfig?.secondaryBtn || [];
            },
            // 功能按钮
            actionConfig() {
                const actionConfig = {
                    containerOid: this.contextOid || '',
                    ...this.toolbarConfig?.actionConfig
                };
                return actionConfig || {};
            },
            // 功能按钮
            beforeValidatorQuery() {
                const beforeValidatorQuery = {
                    containerOid: this.contextOid || '',
                    ...this.toolbarConfig?.beforeValidatorQuery
                };
                return beforeValidatorQuery || {};
            },
            // 功能按钮
            isDefaultBtnType() {
                return this.toolbarConfig?.actionConfig?.isDefaultBtnType;
            },
            vm() {
                return this.toolbarConfig?.vm || this;
            },
            args() {
                return [this.vm, this.tableSelectData, this.toolbarConfig?.actionCustomParams || []];
            },
            // 是否使用功能按钮
            showActionButton() {
                return this.actionConfig?.name;
            },
            // 表格选中数据
            tableSelectList() {
                return this.tableSelectData || [];
            },
            valueKey() {
                return this.toolbarConfig.valueKey || 'oid';
            },
            // 基础筛选
            basicFilter() {
                return this.toolbarConfig.basicFilter || {};
            },
            // 是否需要基础搜索
            useBasicFilter() {
                return !!this.basicFilter.show;
            },
            // 最大基础搜索栏位数量
            basicFilterLength() {
                return this.basicFilter.maxNumber ?? 4;
            },
            // 基础筛选条件获取所需类型
            basicFilterClassName() {
                return this.basicFilter?.className || this.mainModelType;
            },
            innerSearchStr: {
                get() {
                    return this.searchStr;
                },
                set(val) {
                    this.$emit('update:searchStr', val);
                }
            }
        },
        watch: {
            // 默认条件
            conditionDtoListDefault: {
                deep: false,
                immediate: true,
                handler(nv) {
                    this.currentConditions = (nv || []).map((item) => item);
                }
            },
            showAdvancedFilter: {
                handler(val) {
                    // 高级筛选不渲染时
                    if (!val) this.onAdvancedHeightChange(0);
                }
            },
            showClassifySearch: {
                handler(val) {
                    // 分类搜索不渲染时
                    if (!val) this.onAdvancedHeightChange(0);
                }
            },
            fuzzySearchVisible: {
                handler(nv) {
                    if (!nv) {
                        this.innerSearchStr = '';
                        this.fnSearch();
                    }
                }
            }
        },
        methods: {
            // 点击控制图标触发事件 刷新按钮，列配置按钮
            fnControlIcon(type) {
                this.$emit('fn-control-icon', type);
            },
            fnSearch() {
                this.$emit('searchTable', this.innerSearchStr);
            },
            // 高级搜索确认回调
            fnAdvancedConditionsSubmit(callResp) {
                this.currentConditions = callResp || [];
                this.$emit('onsubmit', callResp, 'advancedCondition');
            },
            // tag移除
            fnHandleTagClose(row) {
                this.currentConditions.splice(this.currentConditions.map((item) => item.field).indexOf(row.field), 1);
                this.$emit('clearTagCondition', row.field);
            },
            // 列配置提交回调函数
            fnColSettingSubmit(callResp) {
                this.$emit('onsubmit', callResp, 'colSetting');
            },
            // 显示列配置弹框
            fnShowColSetting() {
                this.colSettingVisible = true;
            },
            // 清空工具栏的条件
            fnClear() {
                this.innerSearchStr = '';
                this.currentConditions = [];
            },
            // 根据传入条件，清除对应的tag，如果op是all，那么直接全部清空
            fnClearConditionsTag(clearAttr = [], op = 'default') {
                if (op === 'all') {
                    this.currentConditions = [];
                } else {
                    this.currentConditions = this.currentConditions.filter((ite) => clearAttr.indexOf(ite.attrName));
                }
            },
            // 刷新表格
            fnRefreshTable() {
                // 给外面抛出自定义刷新处理
                if (this.toolbarConfig?.customRefresh) {
                    this.$emit('custom-refresh');
                } else {
                    this.$nextTick(() => {
                        this.innerSearchStr = '';
                        this.$emit('refresh', { conditions: 'all', searchStr: '' });
                    });
                }
            },
            // 显示高级搜索弹框
            fnShowAdvanced() {
                this.showPopover = !this.showPopover;
                this.advancedVisible = !this.advancedVisible;
            },
            // 功能按钮点击事件
            actionClick(value, data) {
                this.$emit('action-click', value, data);
            },
            // 设置高级筛选显示状态
            setAdvancedFilterStatus(status) {
                this.showAdvancedFilter = status;
            },
            // 设置分类搜索显示状态
            setClassifySearchStatus(status) {
                this.showClassifySearch = status;
            },
            // 设置基础筛选显示状态
            setShowBasicFilter(show = false) {
                this.showBasicFilter = show;
            },
            onAdvancedHeightChange(height) {
                this.$emit('height-change', height);
            },
            // 基础筛选条件变更
            onBasicFilterChange(conditions) {
                this.$emit('basic-filter', conditions);
            },
            // 高级筛选-确定
            onAdvancedFilterSubmit(conditions) {
                this.$emit('advanced-filter', conditions);
            },
            // 高级筛选-确定
            onClassifySearchSubmit(conditions) {
                this.$emit('classify-search', conditions);
            },
            loaded(data) {
                this.$emit('loaded', data);
            },
            handleFuzzySearchInput(value) {
                this.innerSearchStr = value.trim();
            }
        }
    };
});
