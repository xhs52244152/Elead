/**
 * @module 公共组件
 * @component FamAdvancedTable -- 高级表格组件
 * @props { FamAdvancedTableProps } - props参数引用
 * @description 高级表格组件
 * @author Mr.JinFneg
 * @example 参数配置具体查看README.md文件。
 * 参考页面1：fam_viewtable_demo/index.html（视图表格）
 * 参考页面2：FamViewTable/index.html (基于高级表格封装的视图表格)
 * 参考页面3：fam_member/components/MemberViewTable/index.html
 *
 * 组件声明
 * components: {
 *   FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
 * }
 *
 * @typedef FamAdvancedTableProps 属性名，建议在@props中描述，指向到当前，部分props过多可以统一写一起
 * @property { Object } viewTableConfig -- 高级表格配置对象（具体配置查看README.md）
 * @property { string } viewOid -- 视图id，视图表格展示必传
 * @property { string } tableKey -- 视图表格key，（在系统管理>视图表格里面创建的表格内部名称），视图表格必传
 * @property { Object | string } viewInfo -- 当前视图对象信息
 * @property { string | number } tableMaxHeight -- 表格最大高度
 *
 * @events TODO
 */
define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'underscore',
    ELMP.resource('erdc-components/FamErdTable/index.js'),
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/style.css')
], function (template, fieldTypeMapping, utils, Sortable) {
    const FamKit = require('fam:kit');
    const axios = require('fam:http'); // axios
    const _ = require('underscore');
    const FamErdcTable = require(ELMP.resource('erdc-components/FamErdTable/index.js'));

    const DEFAULT_TABLE_CONFIG = {
        /**
         * 默认分页大小
         * @property {number} pageSize
         */
        pageSize: 20,
        /**
         * 懒加载任务ID
         * @property {string} asyncQueryKey
         */
        asyncQueryKey: 'asyncQueryId',
        /**
         * 是否启用表格滚动加载
         * @property {boolean} enableScrollLoad
         */
        enableScrollLoad: false,
        /**
         * 表格滚动加载阈值，单位像素
         * @property {number} scrollLoadHeightThreshold
         */
        scrollLoadHeightThreshold: 72
    };

    Sortable = Sortable.default || Sortable;

    var vmOptions = function () {
        return {
            template,
            name: 'FamAdvancedTable',
            mixins: [fieldTypeMapping],
            props: {
                // 高级表格配置
                viewTableConfig: {
                    type: Object,
                    default() {
                        return {};
                    }
                },
                isStreamline: {
                    type: Boolean,
                    default: false
                },
                // 视图oid
                viewOid: {
                    type: String,
                    default() {
                        return '';
                    }
                },
                // 视图表格key
                tableKey: {
                    type: String,
                    default() {
                        return '';
                    }
                },
                // 默认视图oid
                defaultViewOid: String,

                // 视图表格链接配置
                hyperlinkObj: {
                    type: Object,
                    default: () => ({})
                },
                // 是否为flex布局的动态表格高度
                isAdaptiveHeight: {
                    type: Boolean,
                    default: false
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
                isEmbedTable: {
                    type: Boolean,
                    default() {
                        return (
                            typeof this.maxLine === 'number' ||
                            typeof this.viewTableConfig?.tableBaseConfig?.maxLine === 'number'
                        );
                    }
                },
                viewTableHeight: {
                    type: [String, Number]
                },
                // 高级表格固定高度，优先级最高
                tableHeight: {
                    type: [String, Number]
                },
                // 表格最大高度，根据应用场景和页面不同，无法统一计算，通过传入控制
                tableMaxHeight: {
                    type: [String, Number]
                },
                // 启用表格滚动加载，启用后不显示分页组件，采用滚动加载
                enableScrollLoad: {
                    type: Boolean,
                    default: DEFAULT_TABLE_CONFIG.enableScrollLoad
                },
                // 动态加载关键词
                asyncQueryKey: {
                    type: String,
                    default: 'asyncQueryId'
                },
                // 判断是否为关系视图
                isRelationalView: Boolean,
                // 视图表格所在的布局的oid
                formOid: String,
                viewsBasicFilters: {
                    type: Array,
                    default: () => []
                },
                isDesignerForm: Boolean,
                isLayoutWidget: {
                    type: Boolean,
                    default: false
                },
                maxLine: Number,
                appName: String
            },
            data() {
                return {
                    i18nLocalePath: ELMP.resource('erdc-components/FamAdvancedTable/locale/index.js'),
                    i18nMappingObj: {
                        loading: this.getI18nByKey('loading'),
                        loadCompleted: this.getI18nByKey('loadCompleted'),
                        loadMore: this.getI18nByKey('loadMore')
                    },
                    tableLoading: false,
                    columnsHeader: [],
                    conditionColumnsList: [],
                    /**
                     * 基础字段说明
                     * show:true -- 用于数据本地筛选器过滤显示隐藏使用
                     * editStatus:0 -- 编辑表格使用 标记编辑状态
                     * clickStatus:{name:0,age:0} -- 编辑表格使用 控制编辑时候的点击状态
                     *
                     * 虚拟滚动 默认 x>20 y>50条数据自动开启
                     * 树形表格：【普通树形表格】 【虚拟滚动+树形表格】 组合使用配合column treeNode属性可开启树形表格
                     * 普通树形表格 -- :tree-config="{children: 'children'}" 不支持虚拟滚动 数据结构{id:123,name:'test',children:[id:456,name]}
                     * id: 10050, parentId 【树形表格+虚拟滚动需要的字段】 transform与children配置不可混用
                     * 虚拟滚动+树形表格 -- :tree-config="{transform:true,rowField: 'id', parentField: 'parentId'},
                     * 对应数据结构需要平铺 非children结构，如果后端返回children结构可使用工具类方法
                     * utils.getTreeArr(data)转成一维数组数据
                     * **/
                    tableData: [],
                    // 分页
                    pagination: {
                        pageSize: DEFAULT_TABLE_CONFIG.pageSize,
                        pageIndex: 1,
                        total: 0,
                        pageSizeChanged: false
                    },
                    // 列
                    columns: [],

                    // 冻结列
                    frozenObj: {
                        type: 'left',
                        count: 0
                    },
                    selectData: [], // 选中数据
                    conditionDtoList: [], // 高级条件
                    searchStr: '', // 模糊文本
                    sortObj: '', // 排序对象
                    queryId: '', // 查询id，表格接口需要使用，在head接口返回
                    firstColField: '', // 首列
                    fieldLinkName: '', // 超链接列字段
                    isDrag: false, // 是否已经拖拽
                    filterOper: ['IS_NULL', 'IS_NOT_NULL'], // 特殊的过滤操作，不用显示表单组件
                    excludeSearchList: ['seq', 'checkbox', 'radio', 'operation'], //执行本地搜索需要排除的列
                    $table: {}, // vxe-table 组件的refs对象
                    $erdTable: {}, // FamErdTable 组件的refs对象
                    diffHeight: 0,
                    basicFilterCondition: [], //基础筛选条件
                    isFilterWithViewInfo: false,
                    instance: this,
                    requestConfig: {},
                    isToolbarMounted: false,
                    isTableMounted: false,
                    // 表格排序会导致页面渲染错误，排序完成强制重新渲染
                    forcedRendering: new Date().getTime(),
                    reqColumnHeader: [], // 视图表格表头的数据
                    className: '',
                    lazy: {
                        // 懒加载执行中
                        loading: false,

                        // 懒加载完成
                        completed: false,

                        // 懒加载任务ID
                        asyncQueryId: '',

                        // api日志懒加载任务ID
                        scrollId: '',

                        // 懒加载失败
                        isError: false,

                        // 定时器
                        timer: null,
                        preData: null,
                        lock: false
                    },
                    dataLoaded: false
                };
            },
            watch: {
                tableData: {
                    handler(nv) {
                        let res = (nv || []).map((item) => item); //利用map获取新数组，避免引用类型修改出错
                        this.$emit('table-data', res, this.isDrag); // 每次数据源发生改变，都提交callback方法把数据源提供出去
                        this.isDrag = false; // 拖动结束后，还原状态
                    },
                    deep: true // 深度监听
                },
                currentSystemLan(nv) {
                    if (nv && !this.tableConfigColumns) {
                        // 接口返回字段国际化处理(刷新表格)
                        this.fnGetViewTableData();
                    }
                },
                viewOid: {
                    immediate: true,
                    handler() {
                        // 配置了超链接 && 不是空间 则通过oid查询列表
                        if (this.hyperlinkObj.isHyperlinkUrl && this.hyperlinkObj.isLinkToViewTable) {
                            this.conditionDtoList = [
                                {
                                    attrName: `${this.mainModelType}#oid`,
                                    oper: 'EQ',
                                    sortOrder: 1,
                                    value: '',
                                    value1: this.hyperlinkObj.oid,
                                    children: []
                                }
                            ];
                            this.fnGetTableHeader().then(() => {
                                this.fnSearchTableList().then(() => {
                                    // 视图配置了链接字段,在首次加载列表后重置
                                    this.conditionDtoList = FamKit.deepClone(this.viewInfo?.conditionDtos || []);
                                    this.$emit('update:hyperlinkObj', {
                                        ...this.hyperlinkObj,
                                        isHyperlinkUrl: false
                                    });
                                });
                            });
                            return;
                        } else if (this.viewInfo?.conditionDtos) {
                            this.conditionDtoList = FamKit.deepClone(this.viewInfo?.conditionDtos || []);
                            this.basicFilterCondition = [];
                        }
                        this.initTable();
                    }
                },
                formOid: {
                    deep: true,
                    immediate: true,
                    handler(formOid) {
                        if (formOid && this.isRelationalView) {
                            this.fnSearchTableList();
                        }
                    }
                },
                // 视图表格配置项变化时, 修改表格列状态
                tableViewsInfo(val, oval) {
                    if (_.isEqual(val, oval)) {
                        return;
                    }
                    if (this.tableConfigColumns) {
                        this.columns = this.handelSpecialCol(this.tableConfigColumns);
                    }
                    if (val.pageSize) {
                        this.pagination.pageSize = val.pageSize;
                    }
                },
                // 视图配置变化的时候, 修改冻结状态
                viewInfo(val) {
                    this.frozenObj = {
                        type: val.frozenType || 'left',
                        count: val.frozenColumns || 0
                    };
                    // 避免表头列表还没返回
                    setTimeout(() => {
                        this.updateFrozenCol();
                    }, 1000);
                },
                viewTableData(nv) {
                    this.tableData = nv || [];
                }
            },
            computed: {
                columnComponentProps() {
                    return this.conditionColumnsList?.reduce((prev, item) => {
                        let componentJson;
                        try {
                            componentJson = JSON.parse(item.componentJson);
                        } catch (e) {
                            componentJson = {};
                        }

                        if (
                            FamKit.isSameComponentName(
                                this.fnComponentHandle(item.componentName)?.showComponent,
                                'custom-select'
                            )
                        ) {
                            componentJson.props = componentJson.props || {};
                            componentJson.props.row = componentJson.props.row || item;
                            componentJson.props.row.componentName = item.componentName;
                        }

                        prev[item.attrName] = componentJson.props || {};
                        return prev;
                    }, {});
                },
                conditionDtoListComputed() {
                    return this.conditionDtoList || [];
                },
                advancedTableHeight() {
                    if (this.viewTableHeight) {
                        return this.viewTableHeight;
                    }
                    if (this.tableHeight) {
                        return this.tableHeight;
                    }
                    if (this.isAdaptiveHeight) {
                        return '100%';
                    }
                    if (this.isEmbedTable) {
                        return 'auto';
                    }
                    if (this.isToolbarMounted && this.isTableMounted && this.$refs?.erdTable) {
                        return this.getHeight();
                    }
                    return 450;
                },
                // 表格最大高度
                innerTableMaxHeight() {
                    return this.tableMaxHeight;
                },
                // 表格固定高度
                innerTableHeight() {
                    if (this.innerTableMaxHeight) {
                        return;
                    }
                    if (typeof this.advancedTableHeight === 'string') {
                        return this.advancedTableHeight;
                    }
                    return this.advancedTableHeight + this.diffHeight;
                },
                // 工具栏配置
                toolbarConfig() {
                    let toolbarConfig = this.viewTableConfigComputed.toolbarConfig || {};
                    let reqConfig = this.viewTableConfigComputed.tableRequestConfig || {};
                    if (reqConfig?.defaultParams) {
                        toolbarConfig.defaultReqParams = reqConfig?.defaultParams;
                    }
                    toolbarConfig.vm = this.viewTableConfigComputed.vm || this;
                    toolbarConfig.actionCustomParams = this.viewTableConfigComputed.actionCustomParams || [];
                    toolbarConfig.useCodeConfig = this.viewTableConfigComputed.useCodeConfig;
                    return toolbarConfig;
                },
                // 如果有视图id和视图表格key，则传入参数
                viewRequestParams() {
                    let viewParam = {};
                    if (this.viewOid) viewParam['viewRef'] = this.viewOid;
                    if (this.tableKey) viewParam['tableKey'] = this.tableKey;
                    return {
                        data: viewParam
                    };
                },
                viewHyperlinkList() {
                    return this.columns.filter((item) => item.isHyperlink).map((item) => item.attrName);
                },
                linkSlots() {
                    if (this.tableKey) {
                        if (this.isLayoutWidget) {
                            return [this.fieldLinkName];
                        }
                        return this.viewHyperlinkList.map((item) => item);
                    }
                    return [this.fieldLinkName];
                },
                // 自定义插槽字段
                slotsField() {
                    return (this.viewTableConfig?.slotsField || []).map((item) => {
                        return `column:${item.type}:${item.prop}`;
                    });
                },
                paginationConfig() {
                    return this.viewTableConfig?.pagination || {};
                },
                // 是否显示分页
                showPagination() {
                    // 1. 外部传入非 undefined，取用外部的值
                    if (this.paginationConfig?.showPagination !== undefined) {
                        return this.paginationConfig?.showPagination;
                    }
                    // 2. 用户切换 pageSize 导致不足 1 页，显示分页
                    if (this.pagination.pageSizeChanged) {
                        return true;
                    }
                    // 3. 不足 1 页时不显示分页
                    return !this.dataLoaded || this.pagination.total > this.pagination.pageSize;
                },
                // 表格选中数据
                selectTableData() {
                    return this.selectData || [];
                },
                viewTableConfigComputed() {
                    return this.viewTableConfig || {};
                },
                tableConfigColumns() {
                    return this.viewTableConfigComputed.columns;
                },
                tableViewsConfig() {
                    if (this.isLayoutWidget || this.viewTableConfigComputed.useCodeConfig) {
                        return;
                    }
                    return this.tableViewsInfo.viewConfigItems;
                },
                treeConfig() {
                    return this.viewTableConfig?.tableBaseConfig?.treeConfig || null;
                },
                sortByRequest() {
                    return this.viewTableConfig?.sortByRequest ?? false;
                },
                // 国际化
                currentSystemLan() {
                    let lan = this.$store.state.i18n?.lang || 'zh_cn'; // 国际化语言
                    // 如果国际化语言发生改变，则需要重新渲染表格列头，分两种，一种是传入的，直接取，一种是接口返回的，切换字段
                    let headerCols;
                    if (this.tableConfigColumns?.length) {
                        headerCols = this.tableConfigColumns;
                        this.columns = this.fnHandlerColumnHeader(headerCols);
                        this.columnsHeader = headerCols;
                    }
                    return lan;
                },
                // 超链接字段配置
                fieldLinkConfig() {
                    return this.viewTableConfigComputed?.fieldLinkConfig || {};
                },
                fieldLinkSlotName() {
                    return `column:default:${this.fieldLinkName}`;
                },
                firstFieldSlotName() {
                    return `column:default:${this.firstColField}`;
                },
                // 用户显示卡片处理
                // 用户列配置
                userFieldConfig() {
                    return this.viewTableConfigComputed?.userFieldConfig || '';
                },
                // 用户列
                userFields() {
                    return this.userFieldConfig?.userFields || [];
                },
                // 用户列映射数据源显示
                userValueMapping() {
                    return (filed, row) => {
                        let users = row?.[filed];
                        if (users && !Array.isArray(users)) users = [users]; // 如果不是数组，则赋值数组
                        return this.userFieldConfig?.fieldMapUser[filed] || users || []; // 优先取配置的
                    };
                },
                // 用户字段插槽名组装
                userSlotsFields() {
                    return (this.userFields || []).map((filed) => {
                        return {
                            slotName: `column:default:${filed}`,
                            filed
                        };
                    });
                },
                quillEditorSlots() {
                    return this.quillEditorColumns
                        .filter((column) => !this.$scopedSlots[column.attrName])
                        .map((column) => {
                            return {
                                slotName: `column:default:${column.attrName}`,
                                filed: column.attrName
                            };
                        });
                },
                quillEditorColumns() {
                    return this.columnsHeader.filter((item) => {
                        return (
                            FamKit.isSameComponentName(item.componentName, 'FamQuillEditor') ||
                            FamKit.isSameComponentName(item.componentName, 'ErdQuillEditor')
                        );
                    });
                },
                defaultColumns() {
                    // 过滤复选框、序号
                    let type = ['checkbox', 'seq'];
                    let attrNames = ['operation', 'icon'];
                    return this.columns.filter((ite) => !type.includes(ite.type) && !attrNames.includes(ite.prop));
                },
                // 表格主类型
                mainModelType() {
                    return this.viewInfo?.mainModelType || '';
                },
                isFilterAble() {
                    return this.viewTableConfig?.isFilterAble ?? true;
                },
                viewRef() {
                    return (
                        this.viewTableConfigComputed?.headerRequestConfig?.data?.viewRef ||
                        this.viewRequestParams?.data?.viewRef ||
                        this.defaultViewOid ||
                        this.viewOid
                    );
                },
                tableBaseEvent() {
                    const tableBaseEvent = this.viewTableConfig?.tableBaseEvent || {};
                    return {
                        ...tableBaseEvent
                    };
                },
                actionPulldownConfig() {
                    return this.viewTableConfig?.actionPulldownConfig || {};
                },
                // 如果传了表格数据，则表格使用默认的表格数据
                viewTableData() {
                    return this.viewTableConfigComputed?.tableData || null;
                },
                showLoadMore() {
                    return this.enableScrollLoad && !this.lazy.completed;
                },
                defaultFooterText() {
                    if (this.lazy.loading) {
                        return this.i18nMappingObj.loading;
                    }
                    if (this.lazy.completed) {
                        return this.i18nMappingObj.loadCompleted;
                    }
                    return this.i18nMappingObj.loadMore;
                },
                firstUnFrozenColumnIndex() {
                    return this.columns.findIndex((item) => {
                        return !item.fixed;
                    });
                },
                scrollY() {
                    return (
                        this.viewTableConfig.tableBaseConfig?.scrollY ||
                        this.viewTableConfig.tableBaseConfig?.['scroll-y'] ||
                        (this.enableScrollLoad ? { enable: true } : null)
                    );
                },
                hideTableToolbar() {
                    return !!this.viewTableConfig?.toolbarConfig?.hidden;
                },
                isDefAsyncQueryKey() {
                    return this.asyncQueryKey === DEFAULT_TABLE_CONFIG.asyncQueryKey;
                }
            },
            components: {
                // 工具栏
                FamTableToolbar: FamKit.asyncComponent(
                    ELMP.resource('erdc-components/FamAdvancedTable/FamTableToolbar/index.js')
                ),
                FamErdTable: FamErdcTable,
                // 人员卡片
                FamUser: FamKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js')),
                FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
                FamIcon: FamKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
            },
            created() {
                // 表格全量数据无需通过Vue劫持，可以大幅提升性能
                this.sourceData = [];
            },
            mounted() {
                this.$nextTick(() => {
                    //  这里之所以将initTable从created中移动到mounted中，是因为在created中无法获取到erd-table的实例
                    this.initTable();
                    setTimeout(() => {
                        // 是否开启拖拽功能
                        if (this.viewTableConfigComputed?.enableDrag) {
                            // 表格注册拖拽
                            this.sortableInit();
                        }
                    }, 350);
                });
            },
            beforeDestroy() {
                clearTimeout(this.lazy.timer);
                this.lazy.timer = null;
                if (this._tableRequestController) {
                    this._tableRequestController.abort();
                    this._tableRequestController = null;
                }
                this._sortable && this._sortable.destroy();
                this._sortable = null;
            },
            methods: {
                setMountedStatus(type) {
                    this[`is${type}Mounted`] = true;
                },
                getHeight() {
                    // 获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
                    const clientHeight = document.documentElement?.clientHeight;
                    let height = clientHeight - FamKit.offset(this.$refs.erdTable.$el).top - 16 - 12;

                    // 表格分页上下间距16
                    if (this.showPagination && !this.enableScrollLoad) {
                        height = height - 28 - 16;
                    } else if (this.enableScrollLoad) {
                        height = height - 16;
                    }
                    return height > 0 ? height : 450;
                },
                /**
                 * 获取高级表表格的实例
                 * @param { String } tableType 必填，表格类型
                 * @param { String } type 选填，数据的类型
                 * @returns
                 */
                getTableInstance(tableType, type) {
                    if (!tableType) {
                        return null;
                    }
                    const tables = {
                        vxeTable: this.$refs?.erdTable?.getTableInstance('vxeTable'),
                        baseTable: {
                            instance: this.$refs?.erdTable || {}
                        }
                    };
                    return type ? tables[tableType]?.[type] : tables[tableType];
                },
                refreshViewTableAndConditions(data) {
                    if (data?.conditionDtos) {
                        this.conditionDtoList = data.conditionDtos.map((ite) => ite);
                    }
                    this.initTable();
                },
                initTable() {
                    // 页码默认大小
                    this.pagination.pageSize =
                        this.tableViewsInfo?.pageSize ||
                        this.viewTableConfigComputed?.pagination?.pageSize ||
                        DEFAULT_TABLE_CONFIG.pageSize;
                    this.pagination.pageIndex = 1;
                    // 表格数据查询(设置firstLoad为true，则首次默认加载数据，否则加载表头)
                    this.viewTableConfigComputed?.firstLoad ? this.fnGetViewTableData() : this.fnGetTableHeader();
                    // this.setFooterTextAlign();
                },
                // 设置footer "加载更多" 文字居中
                setFooterTextAlign() {
                    const tableWidth = this.$refs.erdTable?.$el?.clientWidth;
                    if (tableWidth) {
                        document.querySelector('.fam-advanced-table__footer-row .vxe-cell').style.width = tableWidth;
                    }
                },

                // 显示超链接插槽
                showLinkSlot(slotItem) {
                    if (!this.fieldLinkConfig.fieldLink || this.slotsField.includes(slotItem)) {
                        return false;
                    }
                    if (this.viewHyperlinkList.length) {
                        return true;
                    }
                    return this.fieldLinkName;
                },
                // 拖拽表格渲染行添加类名
                tableRowClassName: function (data) {
                    const { row } = data;
                    const rowClassName =
                        this.viewTableConfig.tableBaseConfig.rowClassName ||
                        this.viewTableConfig.tableBaseConfig['row-class-name'];
                    const outerClassName = typeof rowClassName === 'function' ? rowClassName(data) : rowClassName;
                    const outerClassNameArray = Array.isArray(outerClassName) ? outerClassName : [outerClassName];
                    return (
                        [`js-drag-class js-drag-id-${row.id}`, ...outerClassNameArray].filter(Boolean).join(' ') || ''
                    );
                },
                // 注册表格拖拽功能
                sortableInit: function () {
                    this.$nextTick(() => {
                        // 表格添加拖拽
                        const $table = this.getTableInstance('vxeTable', 'instance');
                        const tbody = $($table?.$el).find('.vxe-table--render-wrapper .vxe-table--body tbody');
                        if (!tbody.length) return;
                        this._sortable = Sortable .create(tbody[0], {
                            animation: 150,
                            draggable: '.js-drag-class', // 定义可拖拽类
                            filter: '.filter-drag', // 定义不可拖拽的过滤的类名 针对树父级 [与disabled-drag区别是在可拖拽元素里面定义且不带样式]
                            onEnd: ({ item }) => {
                                // 监听拖动结束事件
                                // 拖拽后的表格数据
                                const newTableData = utils.getTableDataByDrag({
                                    $table, // 表格vue实例对象
                                    childrenKey: 'children',
                                    tableData: this.tableData, // 表格数据
                                    item // 当前拖拽el
                                });
                                // 重新赋值表格数据
                                this.isDrag = true;
                                this.tableData = [...newTableData];
                                // 强制页面重新刷新
                                this.forcedRendering = new Date().getTime();
                                if (this.viewTableConfigComputed?.enableDrag) {
                                    // 表格注册拖拽
                                    this.$nextTick(() => {
                                        this.sortableInit();
                                    });
                                }
                                // TODO -- 保存后台或者其他操作
                                this.viewTableConfigComputed?.dragCallBack &&
                                    this.viewTableConfigComputed?.dragCallBack([...newTableData]);
                            }
                        });
                    });
                },
                // 处理列头显示
                fnHandlerColumnHeader(columns) {
                    let columnHeader = columns || [];

                    // 是否添加操作列，如果已经存在，则不再添加操作列
                    if (
                        this.tableViewsConfig?.includes('operate') ??
                        (this.viewTableConfigComputed?.addOperationCol &&
                            !columnHeader.find((ite) => ite.attrName == 'operation'))
                    ) {
                        columnHeader.push({
                            attrName: 'operation',
                            label: utils.setTextBySysLanguage({ EN: 'Operation', CN: '操作' }),
                            sortAble: false,
                            extraCol: true, // 额外列，不包含在视图配置中
                            fixed: 'right',
                            width:
                                this.viewTableConfigComputed?.columnWidths?.['operation'] ||
                                (this.$store.state.i18n.lang === 'zh_cn' ? 60 : 92),
                            showOverflow: false
                        });
                    }
                    // 过滤隐藏列，组装列显示的结构
                    let treeNode = this.viewTableConfigComputed?.tableBaseConfig?.treeNode || '';
                    const columnHeaders = columnHeader.filter((ite) => !ite.hide);
                    let handlerColumns = columnHeaders.map((item) => {
                        // attrName是类+属性名，不能截取，因为不用类型可能存在重复的属性名
                        let colField = {
                            prop: item.attrName,
                            title: item.label,
                            sort: item.sortAble,
                            sortBy: item.sortDescend || null,
                            tips: item.toolTipsAble ? item.tips || item.toolTipsContent : null,
                            sortFixRight: this.viewTableConfigComputed?.sortFixRight || false
                        };
                        // 是否固定列
                        // 显示树的节点
                        colField.treeNode = treeNode === item.attrName;
                        if (item.filterAble) {
                            // 如果当前过滤字段是国际化组件，则映射到输入框
                            let showComp = item.componentName;
                            if (showComp && showComp.includes('FamI18nbasics')) {
                                showComp = 'erd-input';
                            } else if (showComp?.includes('EnumSelect')) {
                                const enumData = new FormData();
                                enumData.append('realType', item.dataKey);
                                item['requestConfig'] = {
                                    data: enumData
                                };
                            }
                            // 是否是默认条件，如果是，设置默认值
                            let findDefCondition = this.conditionDtoListComputed?.find(
                                (ite) => ite.attrName == item.attrName
                            );
                            colField.filter = {
                                type: 'dynamicFilter', // 动态过滤，根据字段的组件名称来映射组件
                                operationList: item.operationList,
                                operVal: findDefCondition?.oper || '', // 操作类型
                                value: findDefCondition?.value, // 过滤值
                                submit: this.fnFilterTable,
                                row: { ...item },
                                componentName: FamKit.hyphenate(showComp)
                            };
                            if (findDefCondition?.value) {
                                colField.isCurrentActive = true;
                            }
                        }

                        return { ...item, ...colField };
                    });

                    if (this.fieldLinkConfig.fieldLink && handlerColumns.length) {
                        this.fieldLinkName = this.fieldLinkConfig.fieldLinkName;
                    }

                    handlerColumns = this.handelSpecialCol(handlerColumns);

                    const customColumns =
                        this.viewTableConfigComputed.customColums || this.viewTableConfigComputed.customColumns;
                    if (Array.isArray(customColumns)) {
                        customColumns.forEach((item) => {
                            handlerColumns.splice(item.index, 0, item.col);
                        });
                    } else if (typeof customColumns === 'function') {
                        handlerColumns = customColumns(handlerColumns);
                    }
                    return handlerColumns;
                },
                // 处理特殊列 序号, 选择框, 图标
                handelSpecialCol(handlerColumns) {
                    let hasIcon, hasSeq, hasCheckbox, hasRadio;
                    handlerColumns.forEach((item) => {
                        switch (item.attrName) {
                            case 'icon':
                                hasIcon = true;
                                break;
                            case 'seq':
                                hasSeq = true;
                                break;
                            case 'checkbox':
                                hasCheckbox = true;
                                break;
                            case 'radio':
                                hasRadio = true;
                                break;
                            default:
                                break;
                        }
                    });

                    // 是否增加图标
                    if (
                        this.tableViewsConfig?.includes('icon') ??
                        (this.viewTableConfigComputed?.addIcon && !hasIcon)
                    ) {
                        handlerColumns.unshift({
                            attrName: 'icon',
                            prop: 'icon',
                            title: ' ',
                            width: 48,
                            fixed: 'left',
                            extraCol: true,
                            align: 'center'
                        });
                    }

                    // 是否增加序列 根据UCD，复选框排在序号前面
                    if (
                        this.tableViewsConfig?.includes('number') ??
                        (this.viewTableConfigComputed?.addSeq && !hasSeq)
                    ) {
                        handlerColumns.unshift({
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: this.treeConfig ? 52 : 48,
                            fixed: 'left',
                            extraCol: true, // 额外列，不包含在视图配置中
                            align: this.treeConfig ? 'left' : 'center' //多选框默认居中显示
                        });
                    }

                    // 是否复选框（头部插入）
                    if (
                        this.getTableViewsSelect('multipleChoice') ??
                        (this.viewTableConfigComputed?.addCheckbox && !hasCheckbox)
                    ) {
                        handlerColumns.unshift({
                            prop: 'checkbox', // 列数据字段key
                            type: 'checkbox', // 特定类型 复选框[checkbox] 单选框[radio]
                            width: 40,
                            fixed: 'left',
                            extraCol: true, // 额外列，不包含在视图配置中
                            align: 'center' //多选框默认居中显示
                        });
                    }

                    // 是否增加单选框
                    if (this.getTableViewsSelect('radio') ?? (this.viewTableConfigComputed?.addRadio && !hasRadio)) {
                        handlerColumns.unshift({
                            prop: 'radio', // 列数据字段key
                            type: 'radio', // 特定类型 复选框[checkbox] 单选框[radio]
                            width: 40,
                            fixed: 'left',
                            extraCol: true, // 额外列，不包含在视图配置中
                            align: 'center' //多选框默认居中显示
                        });
                    }

                    return handlerColumns;
                },

                // 更新冻结列
                updateFrozenCol() {
                    // 适配下游特殊配置冻结列
                    if (this.viewTableConfigComputed.useCodeConfig) {
                        return;
                    }
                    const attrColumnsLen = this.columns.filter((item) => !item.extraCol).length;
                    let attrColIndex = 0;
                    this.columns = this.columns.map((item) => {
                        if (!item.extraCol) {
                            attrColIndex++;
                            if (this.frozenObj.type === 'left') {
                                if (attrColIndex <= this.frozenObj.count) {
                                    item.fixed = 'left';
                                } else {
                                    delete item.fixed;
                                }
                            } else {
                                if (attrColIndex > attrColumnsLen - this.frozenObj.count) {
                                    item.fixed = 'right';
                                } else {
                                    delete item.fixed;
                                }
                            }
                        }
                        return item;
                    });
                },
                getTableViewsSelect(type) {
                    if (_.isUndefined(this.tableViewsConfig)) return;
                    return (
                        this.tableViewsConfig?.includes('selectionBox') && this.tableViewsInfo?.selectBoxType === type
                    );
                },
                // 获取表格头
                fnGetTableHeader() {
                    return new Promise((res, rej) => {
                        let columnHeader = [];
                        this.reqColumnHeader = [];
                        let LSColumnHeader = {};
                        new Promise((resolve, reject) => {
                            if (this.viewRef) {
                                LSColumnHeader = this.$store.getters.getPreferenceConfig({
                                    viewOid: this.viewRef
                                });
                            }

                            if (this.tableConfigColumns?.length) {
                                columnHeader = this.tableConfigColumns || [];
                                resolve(columnHeader);
                            } else {
                                let reqConfig = this.viewTableConfigComputed?.headerRequestConfig || {};
                                let defaultConfig = {
                                    url: '/fam/table/head',
                                    method: 'POST',
                                    appName: this.appName
                                };
                                let request = $.extend(true, defaultConfig, this.viewRequestParams, reqConfig);
                                // 高级筛选，参数特殊处理
                                if (this.isFilterWithViewInfo) {
                                    request.data.viewRef = this.defaultViewOid;
                                }
                                this.className = request?.data?.className || '';
                                // 如果是视图渲染，必须拿到视图id才做接口处理，否则不处理
                                if (
                                    ((this.viewTableConfigComputed?.main == 'viewRender' && this.viewOid) ||
                                        this.viewTableConfigComputed?.main != 'viewRender' ||
                                        this.isFilterWithViewInfo) &&
                                    !_.isEmpty(request.data.className)
                                ) {
                                    axios(request)
                                        .then((resp) => {
                                            columnHeader = resp?.data?.headers || [];
                                            this.reqColumnHeader = resp?.data?.headers || [];
                                            if (!_.isEmpty(LSColumnHeader?.colSetting?.selectedColumns)) {
                                                const reqColumnHeaderAttrs = columnHeader.map((item) => item.attrName);
                                                const columnHeaderFilter =
                                                    LSColumnHeader?.colSetting?.selectedColumns?.filter((item) => {
                                                        return reqColumnHeaderAttrs.includes(item.attrName);
                                                    });
                                                columnHeader = columnHeaderFilter.map((item) => {
                                                    const newColumn = columnHeader.find(
                                                        (column) => column.attrName === item.attrName
                                                    );
                                                    return {
                                                        ...item,
                                                        ...newColumn
                                                    };
                                                });
                                            }
                                            this.queryId = resp?.data?.queryId || '';

                                            // 如果是视图表格 则取视图的基础筛选条件配置
                                            if (this.tableKey) {
                                                this.conditionColumnsList = this.viewsBasicFilters;
                                            } else {
                                                // 工具栏高级搜索条件查询(如果外部传入了自定义配置url，则调用方法查询， 否则直接取head的列)
                                                if (this.viewTableConfigComputed?.toolbarConfig.requestConfig?.url) {
                                                    this.fnGetConditionsColumns();
                                                } else {
                                                    this.conditionColumnsList = columnHeader.map((item) => item);
                                                }
                                            }

                                            // 该表格强制不可使用表头过滤
                                            if (!this.isFilterAble) {
                                                columnHeader = columnHeader.map((item) => {
                                                    return {
                                                        ...item,
                                                        filterAble: false
                                                    };
                                                });
                                            }
                                            resolve(columnHeader);
                                        })
                                        .catch((err) => {
                                            reject(err);
                                        });
                                }
                            }
                        })
                            .then((resp) => {
                                const handlerColumns = this.fnHandlerColumnHeader(columnHeader, true); // 处理显示列头
                                if (handlerColumns?.length) {
                                    this.firstColField = columnHeader[0].prop; // 首列
                                }
                                this.columns = handlerColumns;
                                this.columnsHeader = columnHeader;

                                // 视图【锁定列、基础列、操作列】是默认展示表头，其他列可通过显示列设置里面勾选
                                if (!this.tableConfigColumns?.length) {
                                    if (_.isEmpty(LSColumnHeader)) {
                                        if (this.viewOid || this.isFilterWithViewInfo) {
                                            this.columns = handlerColumns.filter((item) => item.isShow ?? true);
                                        }
                                    } else {
                                        if (this.viewOid || this.isFilterWithViewInfo) {
                                            this.columns = handlerColumns.filter((item) => {
                                                if (!_.isEmpty(LSColumnHeader?.colSetting)) {
                                                    return item.isSelected || item.extraCol;
                                                }
                                                return item.isShow ?? true;
                                            });
                                        }
                                        const selectedColumnAttrs =
                                            LSColumnHeader?.colSetting?.selectedColumns?.map((item) => item.attrName) ||
                                            [];
                                        this.columnsHeader = this.reqColumnHeader.map((item) => {
                                            return {
                                                ...item,
                                                isSelected: !!selectedColumnAttrs.includes(item.attrName)
                                            };
                                        });
                                    }
                                }

                                // 获取保存的列配置
                                const LSColumns =
                                    this.$store.getters.getPreferenceConfig({
                                        viewOid: this.viewRef,
                                        type: 'columns'
                                    }) || [];
                                this.refreshPreferenceData(LSColumns);
                                res(resp);
                            })
                            .catch((err) => {
                                rej(err);
                            });
                    });
                },
                // 获取视图表格数据和列头
                fnGetViewTableData(op) {
                    if (op !== 'page') {
                        this.pagination.pageIndex = 1;
                    }
                    // 列头处理
                    if (!['advancedCondition', 'rowFilter', 'page', 'order'].includes(op)) {
                        this.fnGetTableHeader().then(() => {
                            this.fnSearchTableList();
                        });
                    } else {
                        this.fnSearchTableList();
                    }
                },
                getIconValue(row) {
                    return this.getIconObj(row)?.value || '';
                },
                getIconTooltip(row) {
                    const iconContent = this.getIconObj(row);

                    let iconTooltipContent = iconContent?.displayName;

                    if (this.isJSON(iconContent.value)) {
                        const iconInfo = JSON.parse(iconContent.value);
                        const lan = this.$store.state.i18n.lang;
                        if (!_.isEmpty(iconInfo.iconTips?.value)) {
                            iconTooltipContent =
                                iconInfo.iconTips.value[lan] ||
                                iconInfo.iconTips.value.value ||
                                iconContent?.displayName;
                        }
                    }

                    // 当value和displayName 相等时 表示无悬浮提示
                    if (iconTooltipContent === this.getIconValue(row)) {
                        return '';
                    }
                    return iconTooltipContent;
                },
                getIconObj(row) {
                    return row.attrRawList?.find((item) => item.attrName?.split('#').pop() === 'icon');
                },
                // 查询表格数据
                fnSearchTableList({
                    isAppendData = false,
                    asyncQueryId = '',
                    scrollId = '',
                    lazyLoadCount = 0,
                    tempTableData = []
                } = {}) {
                    // 此设定为10次，防止后端出现无限轮询问题
                    if (lazyLoadCount > 10) {
                        this.setTableLoading({
                            loading: false,
                            isError: true,
                            completed: false
                        });
                        return Promise.reject(new Error('加载数据出错，请稍后后再试'));
                    }

                    const controller = new AbortController();

                    this.setTableLoading({
                        loading: true,
                        isError: false,
                        completed: this.lazy.completed
                    });
                    clearTimeout(this.lazy.timer);
                    this.lazy.timer = null;

                    let bodyData = {};
                    let reqConfig = this.viewTableConfigComputed?.tableRequestConfig || {};
                    let config = {
                        signal: controller.signal,
                        appName: this.appName
                    };
                    this._tableRequestController = controller;

                    // 是否是表单参数
                    if (reqConfig?.isFormData) {
                        config = $.extend(true, config, reqConfig);
                    } else {
                        bodyData = {
                            [this.paginationConfig?.indexKey || 'pageIndex']: this.pagination.pageIndex,
                            [this.paginationConfig?.sizeKey || 'pageSize']: this.pagination.pageSize
                        };
                        // 如果外部传入了部分参数，则合并
                        let reqConfigData = { ...reqConfig.data, ...reqConfig.defaultParams };
                        if (reqConfigData && Object.keys(reqConfigData).length > 0) {
                            bodyData = $.extend(true, {}, reqConfigData, bodyData); // { ...reqConfig.data, ...bodyData }
                        }
                        let defaultConditons = bodyData?.conditionDtoList || [];

                        // 如果有高级搜索条件或基础筛选条件，则加入参数
                        if (this.conditionDtoList?.length || this.basicFilterCondition?.length) {
                            const conditionDtoList = this.handleConditionParams(this.conditionDtoList);
                            bodyData['conditionDtoList'] = [
                                ...defaultConditons,
                                ...conditionDtoList,
                                ...this.basicFilterCondition
                            ].filter((item) => !!item);
                        } else {
                            if (!defaultConditons.length) {
                                delete bodyData.conditionDtoList;
                            }
                        }
                        if (this.isRelationalView) {
                            if (this.formOid) {
                                bodyData['relationshipRef'] = this.formOid;
                            } else {
                                this.setTableLoading({
                                    loading: false,
                                    isError: true,
                                    completed: this.lazy.completed
                                });
                                return Promise.reject(new Error('所属视图ID不能为空'));
                            }
                        }
                        if (this.isDesignerForm) {
                            this.setTableLoading({
                                loading: false,
                                isError: true,
                                completed: this.lazy.completed
                            });
                            return Promise.reject(new Error());
                        }
                        // queryId（head接口返回的）
                        if (this.queryId) {
                            bodyData['queryId'] = this.queryId;
                        }
                        // 排序、模糊查询，为空不传参数
                        if (this.searchStr) {
                            bodyData[this.viewTableConfigComputed?.searchParamsKey || 'keyword'] = this.searchStr || '';
                        }
                        if (this.sortObj?.sortOrder) {
                            bodyData[this.viewTableConfigComputed?.sortOrderParamsKey || 'sortBy'] =
                                this.sortObj?.sortOrder || '';
                        }
                        if (this.sortObj?.sortField) {
                            bodyData[this.viewTableConfigComputed?.sortParamsKey || 'orderBy'] =
                                this.sortObj?.sortField || '';
                        }
                        config = $.extend(true, config, reqConfig, { data: bodyData }, this.viewRequestParams);
                    }
                    // 高级筛选，参数特殊处理
                    if (this.isFilterWithViewInfo) {
                        config.data.viewRef = this.defaultViewOid;
                    }

                    if (this.enableScrollLoad) {
                        const asyncQueryValue = asyncQueryId || scrollId;
                        config.data[this.asyncQueryKey] = asyncQueryValue;
                        if (
                            !isAppendData &&
                            !asyncQueryValue &&
                            config.data[this.paginationConfig?.indexKey || 'pageIndex'] === 1
                        ) {
                            config.data[this.asyncQueryKey] = '';
                        }

                        /**
                         * 当请求参数发生变化时需要重新获取asyncQueryKey
                         * 剔除asyncQueryKey后对比请求参数是否一致，如果一致继续进行数据获取
                         * 如果不一致清空asyncQueryKey以及lazy中的asyncQueryKey,重新获取asyncQueryKey进行数据获取
                         * */
                        const prevRequestConfig = FamKit.deepClone(this.requestConfig) || {};
                        const currentRequestConfig = FamKit.deepClone(config);
                        const deleteAttrs = [this.asyncQueryKey, 'pageSize', 'pageIndex', 'page', 'size'];
                        deleteAttrs.forEach((item) => {
                            if (prevRequestConfig.data) {
                                delete prevRequestConfig.data[item];
                            }
                            delete currentRequestConfig.data[item];
                        });
                        if (JSON.stringify(prevRequestConfig) !== JSON.stringify(currentRequestConfig)) {
                            config.data[this.asyncQueryKey] = '';
                            this.lazy[this.asyncQueryKey] = '';
                        }
                    }

                    this.requestConfig = config;
                    const beforeRequest = this.viewTableConfigComputed?.beforeRequest;
                    const $table = this.getTableInstance('vxeTable', 'instance');
                    const axiosFn = (config) => {
                        // 如果是视图渲染，必须拿到视图id才做接口处理，否则不处理
                        return axios(config)
                            .then((resp) => {
                                // 每次查询数据，都要清空选中数据
                                if (!isAppendData) {
                                    this.selectData = [];
                                    this.tableData = [];
                                }
                                let result = resp?.data || {};

                                // 获取数据源，如果设置了dataKey，则根据dataKey来获取，支持多层次的key
                                let tableData = this.viewTableConfigComputed?.dataKey
                                    ? utils.getValueByStr(resp, this.viewTableConfigComputed?.dataKey) || []
                                    : result?.records || [];
                                if (this.enableScrollLoad) {
                                    const asyncQueryVal = result[this.asyncQueryKey] || config.data[this.asyncQueryKey];
                                    if (asyncQueryVal) {
                                        if (this.isDefAsyncQueryKey && !result.complete) {
                                            this.keepAsyncQueryAlive(asyncQueryVal);
                                        }
                                        this.lazy[this.asyncQueryKey] = asyncQueryVal;
                                    }

                                    if (this.isDefAsyncQueryKey) {
                                        lazyLoadCount = ++lazyLoadCount;

                                        // 当前查询是生成查询id，需要重新查询数据
                                        if (!config.data[this.asyncQueryKey]) {
                                            return this.fnSearchTableList({
                                                isAppendData: false,
                                                [this.asyncQueryKey]: result[this.asyncQueryKey],
                                                lazyLoadCount
                                            });
                                        }

                                        this.pagination.pageIndex = result?.pageIndex + 1 || 1;
                                        this.pagination.pageSize = result?.pageSize || 0;

                                        tempTableData = [...tempTableData, ...tableData];
                                        tableData = [...tempTableData];
                                        if (!result.complete && tempTableData.length < this.pagination.pageSize) {
                                            return this.fnSearchTableList({
                                                isAppendData: true,
                                                [this.asyncQueryKey]: asyncQueryVal,
                                                lazyLoadCount,
                                                tempTableData
                                            });
                                        }
                                    }
                                }

                                // 是否需要处理数据，反序列对象属性

                                if (this.viewTableConfigComputed?.isDeserialize) {
                                    tableData = tableData.map((item) => {
                                        return {
                                            ...item,
                                            ...FamKit.deserializeArray((item.attrRawList || [])?.filter(Boolean), {
                                                valueKey: 'displayName',
                                                isI18n: true
                                            })
                                        };
                                    });
                                }
                                if (isAppendData) {
                                    const tbody = $table?.$refs?.tableBody?.$el;
                                    const rows = Array.from(tbody?.querySelectorAll('tr')) || [];
                                    const firstViewRow = rows.find((item) => item.offsetTop >= tbody?.scrollTop);
                                    let lastIndex = firstViewRow ? $table?.getRowNode(firstViewRow).index : 0;
                                    if (lastIndex < 0) {
                                        lastIndex = 0;
                                    }
                                    this.tableData = this.tableData.concat(tableData);
                                    return $table
                                        ?.loadData(this.tableData)
                                        .then(() => {
                                            return new Promise((resolve) => {
                                                this.$nextTick(() => {
                                                    resolve();
                                                });
                                            });
                                        })
                                        .then(() => this.scrollRowIntoView(lastIndex + 3))
                                        .then(() => $table.recalculate(true))
                                        .then(() => $table.refreshScroll())
                                        .then(() => Promise.resolve({ result, resp }));
                                } else {
                                    this.tableData = tableData;
                                    return $table
                                        ?.loadData(this.tableData)
                                        .then(() => Promise.resolve({ result, resp }));
                                }
                            })
                            .then((args) => {
                                return new Promise((resolve) => {
                                    this.$nextTick(() => {
                                        resolve(args);
                                    });
                                });
                            })
                            .then(({ result, resp } = {}) => {
                                if (!result || !resp) {
                                    return Promise.resolve();
                                }
                                // 提供处理数据源方法，赋值新的显示数据源
                                this.$emit('handler-data', this.tableData, (newTableData) => {
                                    if (newTableData) {
                                        this.tableData = newTableData;
                                    }
                                });
                                this.setTableLoading({
                                    loading: false,
                                    isError: false,
                                    completed: result.complete
                                });
                                this.pagination.total = parseInt(result?.total) || 0;
                                this.sourceData = JSON.parse(JSON.stringify(this.tableData)); // 记录总数据源
                                return this.$nextTick().then(() => {
                                    const $table = this.getTableInstance('vxeTable', 'instance');
                                    this.$emit('callback', resp, this.columnsHeader); // 回调
                                    const lastScrollTop = $table?.lastScrollTop;
                                    if (lastScrollTop) {
                                        return $table?.refreshScroll();
                                    }
                                    // 如果表格设置的是全部展开，则刷新表格的时候默认全部展开
                                    if (this.treeConfig?.expandAll) {
                                        return $table?.setAllTreeExpand(true);
                                    }
                                    return Promise.resolve({ result, resp });
                                });
                            })
                            .catch((err) => {
                                this.$emit('handler-error', err);
                                console.error(err);
                                this.setTableLoading({
                                    loading: false,
                                    isError: true,
                                    completed: this.lazy.completed
                                });
                            });
                    };
                    // 如果是传了默认的表格数据，则使用手动传入的表格数据，不会去调用接口
                    if (this.viewTableData) {
                        this.tableData = this.viewTableData;
                        this.sourceData = JSON.parse(JSON.stringify(this.tableData)); // 记录总数据源
                        this.setTableLoading({
                            loading: false,
                            isError: false,
                            completed: true
                        });
                        return Promise.resolve();
                    } else if (
                        (this.viewTableConfigComputed?.main == 'viewRender' && this.viewOid) ||
                        this.viewTableConfigComputed?.main != 'viewRender' ||
                        this.isFilterWithViewInfo
                    ) {
                        if (beforeRequest && _.isFunction(beforeRequest)) {
                            return beforeRequest(config).then((configRes) => {
                                return axiosFn(configRes);
                            });
                        }
                        return axiosFn(config);
                    }
                },
                // 获取高级搜索允许选择的列集合
                fnGetConditionsColumns() {
                    let reqConfig = this.viewTableConfigComputed?.toolbarConfig.requestConfig || {};
                    axios(reqConfig).then((resp) => {
                        this.conditionColumnsList =
                            utils.getValueByStr(resp, this.viewTableConfigComputed?.toolbarConfig?.dataKey || 'data') ||
                            [];
                    });
                },
                // 表格过滤
                fnFilterTable(row) {
                    let filterObj = row?.item || '';
                    let findRes = this.conditionDtoList.find((ite) => ite.attrName === filterObj?.attrName); // 查找当前筛选条件是否存在当前操作的列
                    let operName = '';
                    let displayString = '';
                    if (filterObj?.filter && filterObj?.filter?.operationList?.length > 0) {
                        let findOper = filterObj?.filter?.operationList?.find(
                            (ite) => ite.value === filterObj?.filter?.operVal
                        );
                        if (findOper) {
                            operName = findOper?.displayName;
                        }
                    }
                    if (this.filterOper.indexOf(filterObj?.filter?.operVal) >= 0) {
                        filterObj.filter.value = '';
                    }
                    let componentTranslation = this.$store.getters['component/componentTranslation'](
                        filterObj?.filter?.componentName || filterObj?.componentName
                    );
                    let operVal =
                        typeof componentTranslation === 'function'
                            ? componentTranslation({ value: filterObj?.filter?.value })
                            : filterObj?.filter?.value;
                    displayString = `${filterObj?.label} ${operName} ${operVal}`;
                    const value1 =
                        filterObj?.filter?.value1 !== undefined ? filterObj?.filter?.value1 : filterObj?.filter?.value;
                    if (findRes) {
                        findRes.oper = filterObj?.filter?.operVal;
                        findRes['operator'] = filterObj?.filter?.operVal;
                        findRes.value = filterObj?.filter?.value;
                        findRes.value1 = value1;
                        findRes['displayString'] = displayString;
                    } else {
                        this.conditionDtoList.push({
                            ...filterObj,
                            oper: filterObj?.filter?.operVal,
                            operator: filterObj?.filter?.operVal,
                            value: filterObj?.filter?.value,
                            value1,
                            displayString: displayString
                        });
                    }
                    this.fnGetViewTableData('rowFilter');
                },
                // 列头内容提交回调， op: advancedCondition(高级搜索条件)，colSetting（列配置）
                fnHeaderSubmit(resp = [], op = '') {
                    const preferenceColSetting = this.$store.getters.getPreferenceConfig({
                        configType: 'viewTableConfig',
                        viewOid: this.viewRef,
                        type: 'colSetting'
                    });
                    const selectedColumnsAttrNames =
                        resp?.selectedColumns
                            ?.map((item) => {
                                return item.attrName;
                            })
                            .filter((item) => item) || [];
                    const isHeaderChanged =
                        selectedColumnsAttrNames.length !== preferenceColSetting?.selectedColumns?.length ||
                        !!preferenceColSetting?.selectedColumns?.find((item, index) => {
                            return selectedColumnsAttrNames[index] !== item.attrName;
                        });
                    // 只有视图表格并且有修改操作列时才会做缓存
                    if (this.viewRef && isHeaderChanged) {
                        this.$store.commit('PREFERENCE_CONFIG', {
                            config: {
                                configType: 'viewTableConfig',
                                viewOid: this.viewRef,
                                type: 'colSetting',
                                _this: this
                            },
                            resource: resp
                        });
                        // 处理更新缓存之后,表头信息没有更新,导致操作列回显错误问题
                        const selectedColumnAttrs =
                            resp?.colSetting?.selectedColumns?.map((item) => item.attrName) || [];

                        this.columnsHeader = this.reqColumnHeader.map((item) => {
                            return {
                                ...item,
                                isSelected: !!selectedColumnAttrs.includes(item.attrName)
                            };
                        });
                    }
                    if (op === 'advancedCondition') {
                        this.conditionDtoList = resp.map((item) => {
                            let values = {};
                            values = { value1: item.value };
                            // 根据高级搜索的条件，对应设置到列头的过滤里面，联动
                            let findCol = this.columns.find((ite) => ite.attrName === item.field);
                            if (findCol && findCol.filter) {
                                findCol.filter.value = item.value; // 过滤值
                                findCol.filter.operVal = item.operator; // 操作
                            }
                            return {
                                ...item,
                                oper: item.operator,
                                ...values
                            };
                        });
                        // 如果没高级搜索条件，则需要重置列头
                        this.fnGetViewTableData(this.conditionDtoList.length > 0 ? 'advancedCondition' : '');
                    } else if (op === 'colSetting') {
                        // 列配置
                        let tableColumns = resp?.selectedColumns?.map((ite) => ite) || [];

                        // 选中列存在数据，则把列头数据设置选中和取消选中
                        if (tableColumns.length) {
                            this.columnsHeader?.forEach((item) => {
                                // 不是系统默认字段，并且不是当前勾选的，都取消选中
                                item.isShow = tableColumns.some((ite) => ite.attrName == item.attrName);
                            });
                        }

                        let handlerColumns = this.fnHandlerColumnHeader(tableColumns); // 处理显示列头
                        if (!_.isEmpty(tableColumns) && handlerColumns && handlerColumns.length > 0) {
                            this.firstColField = tableColumns[0].attrName; // 首列
                        }
                        // 配置列勾选显示
                        this.columns = handlerColumns;
                        if (this.viewRef && isHeaderChanged) {
                            let LSColumns =
                                this.$store.getters.getPreferenceConfig({
                                    viewOid: this.viewRef,
                                    type: 'columns'
                                }) || [];
                            this.refreshPreferenceData(LSColumns);
                        }
                        if (op === 'colSetting') {
                            this.pagination.pageIndex = 1;
                        }
                        this.updateFrozenCol();
                        this.fnSearchTableList();
                        this.$emit('header-submit-success');
                    }
                },
                // 根据缓存重新刷新列
                refreshPreferenceData(LSColumns) {
                    if (LSColumns.length) {
                        _.each(this.columns, (col) => {
                            const LSColObj = LSColumns.find((item) => item.attrName === col.attrName);
                            if (LSColObj) {
                                this.$set(col, 'isFixedWidth', LSColObj.isFixedWidth);
                                if (LSColObj.isFixedWidth) {
                                    this.$set(col, 'width', LSColObj.width);
                                }
                            }
                        });
                    }
                },
                // 筛选清除回调事件
                clearFilter(parmas) {
                    let { type, item } = parmas;
                    const viewConditions = FamKit.deepClone(this.viewInfo?.conditionDtos || []);
                    if (type == 1) {
                        this.conditionDtoList = this.conditionDtoList
                            .map((ite) => {
                                const viewConditionObj = viewConditions.find(
                                    (viewCondition) => viewCondition.attrName === item.attrName
                                );
                                if (viewConditionObj) {
                                    // 若清除项是当前视图设置的条件则重置
                                    return viewConditionObj;
                                }
                                if (ite.attrName === item.attrName) {
                                    return;
                                }
                                return ite;
                            })
                            .filter((i) => i);
                        this.$refs['tableToolbar']?.fnClearConditionsTag([item.attrName]);
                    } else {
                        this.conditionDtoList = viewConditions;
                        this.$refs['tableToolbar']?.fnClearConditionsTag([], 'all');
                    }
                    this.fnGetViewTableData('advancedCondition');
                },
                // tag关闭清空高级条件
                tagClearFilter(attrName) {
                    this.conditionDtoList.splice(this.conditionDtoList.map((ite) => ite.attrName).indexOf(attrName), 1);
                    // 清空列头过滤
                    let findCol = this.columns.find((ite) => ite.attrName === attrName);
                    if (findCol && findCol.filter) {
                        findCol.filter.value = ''; // 过滤值
                        findCol.filter.operVal = ''; // 操作
                    }
                    this.fnGetViewTableData('rowFilter');
                },
                // 搜索
                fnSearchTable(searchStr) {
                    this.searchStr = searchStr || '';
                    this.pagination.pageIndex = 1;
                    if (this.toolbarConfig?.fuzzySearch?.isLocalSearch) {
                        this.tableLoading = true;
                        this.tableData = this.performLocalSearch(searchStr);
                        if (this.treeConfig?.expandAll) {
                            this.$nextTick(() => {
                                const $table = this.getTableInstance('vxeTable', 'instance');
                                $table?.setAllTreeExpand(true);
                                $table?.updateData();
                            });
                        }
                        this.tableLoading = false;
                    } else {
                        this.fnGetViewTableData();
                    }
                },
                // 执行本地搜索
                performLocalSearch() {
                    let _this = this,
                        searchCondition = this.toolbarConfig?.fuzzySearch?.searchCondition || [];
                    if (_.isArray(searchCondition) && !searchCondition.length) {
                        searchCondition = _.map(_this.columns, (item) => item.attrName);
                    }
                    searchCondition = _.chain(searchCondition)
                        .filter((item) => _this.excludeSearchList.indexOf(item) === -1)
                        .compact()
                        .value();

                    return FamKit.TreeUtil.filterTreeTable(FamKit.deepClone(_this.sourceData), _this.searchStr, {
                        children: this.treeConfig?.children || 'children',
                        attrs: searchCondition
                    });
                },
                /**
                 * 刷新表格
                 * @param { Object } [refreshConfig] 刷新配置
                 * @param { string } [refreshConfig.searchStr] 模糊查询字符串
                 * @param { 'default'|'all'|string } [refreshConfig.conditions] 重置条件刷新表格 (参数conditions：'default'保留视图默认条件，'all'保留当前全部选中的条件，其他清空)
                 * @param { Object } [refreshConfig.pagination] 分页信息对象
                 */
                fnRefreshTable({ conditions = 'all', pagination, searchStr = this.searchStr } = {}) {
                    // 兼容历史代码
                    if (!_.isObject(arguments[0]) && arguments.length) {
                        conditions = arguments[0];
                        pagination = arguments[1];
                        console.warn(
                            '[deprecated] fnRefreshTable(conditions, pagination) is deprecated, please use fnRefreshTable(params)'
                        );
                    }

                    // 条件保留
                    if (conditions === 'default' && this.viewInfo && this.viewInfo.conditionDtos) {
                        this.conditionDtoList = FamKit.deepClone(this.viewInfo?.conditionDtos || []);
                    } else if (conditions !== 'all') {
                        this.$refs['tableToolbar']?.fnClear();
                        this.conditionDtoList = [];
                    }
                    this.pagination.pageSize = pagination?.pageSize || this.pagination.pageSize;
                    this.pagination.pageIndex = pagination?.pageIndex || 1;
                    this.searchStr = searchStr;
                    this.sortObj = '';
                    // 清空列过滤条件
                    this.columns = this.columns?.map((ite) => {
                        if ((ite?.filter?.value ?? '') !== '') {
                            ite.filter.value = '';
                            ite.filter.operVal = '';
                        }
                        return ite;
                    });
                    this.fnGetViewTableData();
                },
                customRefresh() {
                    this.$emit('custom-refresh');
                },
                // 点击控制图标触发事件 刷新按钮，列配置按钮
                fnControlIcon(type) {
                    this.$emit('fn-control-icon', type);
                },
                // 获取当前表格勾选数据（提供给外部使用）
                fnGetCurrentSelection() {
                    return this.selectData;
                },
                // 获取当前表格是否全选
                getIsCheckAll() {
                    let selectionLength = this.fnGetCurrentSelection().length;
                    let allLength = this.tableData.length;
                    return selectionLength === allLength;
                },
                // 外部获取当前表格的请求数据
                fnGetRequestConfig() {
                    return this.requestConfig;
                },
                /**
                 * checkbox
                 * 复选框
                 * @checkbox-all="selectAllEvent"
                 @checkbox-change="selectChangeEvent"
                 * **/
                selectAllEvent() {
                    const records = this.getTableInstance('vxeTable', 'instance')?.getCheckboxRecords();
                    this.selectData = records || [];
                },
                selectChangeEvent() {
                    const records = this.getTableInstance('vxeTable', 'instance')?.getCheckboxRecords();
                    this.selectData = records || [];
                },
                getCheckboxRecords() {
                    return this.selectData;
                },
                getRadioRecord() {
                    const record = this.getTableInstance('vxeTable', 'instance')?.getRadioRecord();
                    return record || [];
                },
                // 排序
                customSortMethod(sortList) {
                    const sortItem = sortList[0] || {};
                    // 取出第一个排序的列
                    const { property, order } = sortItem;
                    this.sortObj = {
                        sortField: property || '',
                        sortOrder: order || ''
                    };
                    if (this.sortByRequest) {
                        this.fnGetViewTableData('order');
                        return;
                    }
                    if (order) {
                        this.sortByObject(this.tableData, order, property);
                    } else {
                        this.tableData = FamKit.deepClone(this.sourceData);
                    }
                },
                // 在对象中排序
                sortByObject(data, order, property) {
                    // 预先data进行排序，将空值放置到列表最后
                    data.sort((a, b) => {
                        if (b[property] == null && a[property] == null) {
                            return 0;
                        } else if (b[property] == null) {
                            return -1;
                        } else if (a[property] == null) {
                            return 1;
                        }
                    });
                    if (order === 'desc') {
                        data.sort((a, b) => {
                            if (a[property] < b[property]) {
                                return 1;
                            }
                            if (a[property] > b[property]) {
                                return -1;
                            }
                            return 0;
                        });
                    } else if (order === 'asc') {
                        data.sort((a, b) => {
                            if (a[property] > b[property]) {
                                return 1;
                            }
                            if (a[property] < b[property]) {
                                return -1;
                            }
                            return 0;
                        });
                    }
                },
                // 【筛选】
                // 筛选控件submit回调事件 包括自带的确认 取消 回车事件等 【自定义筛选可忽略】
                filterMethod: function (data) {
                    const { item } = data;
                    const value = item.filter?.value || '';
                    // 本地模拟过滤
                    if (item.prop == 'name') {
                        this.tableData = this.tableData.map((item) => {
                            item.show = false;
                            if (value == '' || item.name.toUpperCase() == value.toUpperCase()) {
                                item.show = true;
                            }
                            return item;
                        });
                    }
                    // 接口获取
                },
                // 客制化排序
                customSubmit(type, data) {
                    // 关闭筛选面板
                    this.getTableInstance('vxeTable', 'instance')?.togglePopShow(data.prop);
                },
                // 分页
                fnPageSizeChange(pageSize) {
                    this.pagination.pageIndex = 1;
                    this.pagination.pageSize = pageSize || DEFAULT_TABLE_CONFIG.pageSize;
                    this.pagination.pageSizeChanged = true;
                    this.fnGetViewTableData('page');
                },
                fnCurrentPageChange(currnetPage) {
                    this.pagination.pageIndex = currnetPage;
                    this.fnGetViewTableData('page');
                },
                actionClick(value, data) {
                    this.$emit('action-click', value, data);
                },
                addFilterWithViewInfo(type) {
                    if (this.$refs.tableToolbar) {
                        const { setAdvancedFilterStatus, setClassifySearchStatus } = this.$refs.tableToolbar;
                        if (setAdvancedFilterStatus) {
                            if (!type) {
                                setAdvancedFilterStatus(false);
                                setClassifySearchStatus(false);
                                return;
                            }
                            if (type === 'advancedFilter') {
                                setAdvancedFilterStatus(true);
                                setClassifySearchStatus(false);
                            } else {
                                setClassifySearchStatus(true);
                                setAdvancedFilterStatus(false);
                            }

                            // 切换时，先清空条件
                            this.conditionDtoList = FamKit.deepClone(this.viewInfo?.conditionDtos || []);
                            this.isFilterWithViewInfo = true;
                        }
                    }
                },
                onAdvancedHeightChange(height) {
                    this.diffHeight = -height;
                },
                fnBasicFilter(conditions) {
                    this.pagination.pageIndex = 1;
                    this.basicFilterCondition = conditions;
                    this.fnGetViewTableData('advancedCondition');
                    this.$emit('basic-filter-change', conditions);
                },
                fnAdvancedFilter(conditions, updateHeader) {
                    this.conditionDtoList = [...conditions, ...(this.viewInfo?.conditionDtos || [])];
                    this.basicFilterCondition = [];
                    this.pagination.pageIndex = 1;
                    this.fnGetViewTableData(updateHeader ? '' : 'advancedCondition');
                },
                fnClassifySearch(conditions) {
                    this.conditionDtoList = [...conditions, ...(this.viewInfo?.conditionDtos || [])];
                    this.basicFilterCondition = [];
                    this.pagination.pageIndex = 1;
                    this.fnGetViewTableData('advancedCondition');
                },
                handleConditionParams(conditions = []) {
                    return conditions.map((item) => {
                        return {
                            attrName: item.attrName,
                            oper: item.oper,
                            logicalOperator: item.logicalOperator,
                            sortOrder: item.sortOrder,
                            isCondition: item.isCondition,
                            value: item.value,
                            value1: Array.isArray(item.value1) ? item.value1.join(',') : item.value1,
                            value2: item.value2,
                            children: this.handleConditionParams(item.children || []),
                            category: item.category
                        };
                    });
                },
                resizableChange({ column }) {
                    if (!this.viewRef) return;
                    this.columns.forEach((item) => {
                        if (item.attrName === column.property) {
                            this.$set(item, 'width', column.renderWidth);
                            this.$set(item, 'isFixedWidth', true);
                        }
                        if (item.isFixedWidth) {
                            this.$set(item, 'width', item.width);
                        }
                    });
                    this.$store.commit('PREFERENCE_CONFIG', {
                        config: {
                            configType: 'viewTableConfig',
                            viewOid: this.viewRef,
                            type: 'columns',
                            _this: this
                        },
                        resource: this.columns
                    });
                },
                getActionConfig(row) {
                    return {
                        name: this.actionPulldownConfig?.name || '',
                        objectOid: row.oid,
                        className: this.actionPulldownConfig?.className || this.className || ''
                    };
                },
                onCommand(type, data) {
                    this.$emit('action-pulldown-click', type, data);
                },
                linkClick(data) {
                    if (data.row.accessToView === false) {
                        return;
                    }
                    if (this.viewHyperlinkList.includes(data.column.field)) {
                        const hyperlinkUrl = this.columns.find(
                            (item) => item.attrName === data.column.field
                        )?.hyperlinkUrl;
                        if (hyperlinkUrl) {
                            let urlQuery = FamKit.getParams(hyperlinkUrl);
                            urlQuery = {
                                isHyperlinkUrl: 'true',
                                isLinkToViewTable: String(!urlQuery.oid),
                                oid: '${oid}',
                                ...urlQuery
                            };
                            Object.keys(urlQuery).map((item) => {
                                const matchArr = urlQuery[item].match(/\$\{(.*?)\}/);
                                if (matchArr?.length > 1) {
                                    urlQuery[item] = data.row[`${this.className || ''}#${matchArr[1]}`]; // 返回${}内的内容
                                }
                            });
                            window.open(
                                FamKit.joinUrl(hyperlinkUrl.split('?')[0], urlQuery),
                                `${window.__currentAppName__}_${FamKit.randomString(5)}`
                            );
                            return;
                        }
                    }
                    this.fieldLinkConfig?.linkClick && this.fieldLinkConfig.linkClick(data.row);
                    this.$emit('link-click', data.row);
                },
                handleLoadMoreClick() {
                    if (!this.enableScrollLoad) return;
                    if (this.lazy.loading || this.lazy.completed) return;
                    this.fnSearchTableList({
                        isAppendData: true,
                        [this.asyncQueryKey]: this.lazy[this.asyncQueryKey]
                    });
                },
                /**
                 * 设置表格loading状态
                 */
                setTableLoading({ loading = false, isError = false, completed = false } = {}) {
                    if (this.enableScrollLoad) {
                        if (!this.tableData || this.tableData.length === 0) {
                            this.tableLoading = loading;
                            this.lazy.loading = loading;
                        } else {
                            this.lazy.loading = loading;
                        }
                        if (!loading) {
                            this.tableLoading = loading;
                            this.lazy.loading = loading;
                        }
                    } else {
                        this.tableLoading = loading;
                    }
                    this.lazy.isError = isError;
                    this.lazy.completed = completed;
                },
                keepAsyncQueryAlive(asyncQueryVal) {
                    this.lazy.timer = setTimeout(() => {
                        this.fetchAsyncQueryData(asyncQueryVal)
                            .then(() => {
                                this.keepAsyncQueryAlive(asyncQueryVal);
                            })
                            .catch(() => {
                                clearTimeout(this.lazy.timer);
                                this.lazy.timer = null;
                            });
                    }, 20 * 1000);
                },
                fetchAsyncQueryData(asyncQueryVal) {
                    return axios.get('/fam/core/asyncquery/refresh/data', {
                        params: {
                            [this.asyncQueryKey]: asyncQueryVal
                        }
                    });
                },
                handleScroll({ $table, scrollHeight, scrollTop, isY }) {
                    if (this.enableScrollLoad && isY && this.lastScrollTop - scrollTop < 0) {
                        this.handleScrollLoad({
                            $table,
                            scrollTop,
                            scrollHeight
                        });
                    }
                    this.lastScrollTop = scrollTop;
                },
                handleScrollLoad({ $table, scrollTop, scrollHeight }) {
                    if (this.lazy.completed || this.lazy.loading || this.lazy.lock) return;
                    const clientHeight = $table.$refs.tableBody.$el.clientHeight;
                    const scrollLoadHeightThreshold = DEFAULT_TABLE_CONFIG.scrollLoadHeightThreshold;
                    const isScrollToBottom = scrollTop + clientHeight + scrollLoadHeightThreshold >= scrollHeight;
                    if (isScrollToBottom) {
                        this.fnSearchTableList({
                            isAppendData: true,
                            [this.asyncQueryKey]: this.lazy[this.asyncQueryKey]
                        });
                    }
                },
                loaded(data) {
                    this.$emit('loaded', data);
                },
                /**
                 * 滚动到指定行
                 * @param {Object|number} rowOrIndex
                 */
                async scrollRowIntoView(rowOrIndex) {
                    let row = rowOrIndex;
                    const $table = this.$refs.erdTable.$refs.xTable;
                    if (typeof rowOrIndex === 'number') {
                        row = $table.getData(rowOrIndex);
                    }
                    if (!row) return;
                    // scrollToRow 在此处不适用，因此自行实现滚动
                    const scrollToRow = async () => {
                        const bodyElem = $table.$refs.tableBody.$el;
                        const trElem = bodyElem?.querySelector('[rowid="'.concat($table?.getRowid(row), '"]'));
                        await $table.scrollToRow(row);
                        if (trElem) {
                            await trElem?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'nearest',
                                inline: 'nearest'
                            });
                        }
                        return new Promise((resolve) => {
                            window.requestAnimationFrame(() => {
                                const scrollTop = bodyElem.scrollTop;
                                $table.scrollTo(0, scrollTop);
                                resolve();
                            });
                        });
                    };
                    this.lazy.lock = true;
                    await this.$nextTick();
                    await scrollToRow();
                    this.lazy.lock = false;
                },
                isJSON(str) {
                    if (typeof str == 'string') {
                        try {
                            let obj = JSON.parse(str);
                            if (typeof obj == 'object' && obj) {
                                return true;
                            } else {
                                return false;
                            }
                        } catch (e) {
                            return false;
                        }
                    }
                }
            }
        };
    };

    return vmOptions();
});
