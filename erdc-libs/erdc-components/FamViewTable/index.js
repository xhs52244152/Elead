/**
 * @module 视图表格
 * @component 视图表格组件
 * @props { FamViewTableProps } -- 查看FamViewTableProps描述
 * @description 基于高级表格封装的视图表格组件
 * @author Mr.JinFeng
 * @example 细节配置查看README.md文件。 参考页面例子：fam_viewtable_demo/index.js
 * 组件声明
 * components: {
 *   FamViewTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
 * }
 *
 * @typedef { Object } FamViewTableProps
 * @property { Object } viewTableConfig -- 视图表格配置对象
 * @property { string } viewType -- 视图类型（system: 系统，person：个人）, 默认default
 *
 * @events TODO
 */
define([
    'text!' + ELMP.resource('erdc-components/FamViewTable/index.html'),
    'css!' + ELMP.resource('erdc-components/FamViewTable/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    return {
        template,
        props: {
            viewTableConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            viewType: {
                type: String,
                default() {
                    return 'person';
                }
            },

            // 视图表格固定高度，优先级最高
            viewTableHeight: {
                type: [String, Number]
            },

            // 视图表格自适应高度，优先级最低
            isAdaptiveHeight: {
                type: Boolean,
                default: true
            },

            // 视图表格最大高度
            tableMaxHeight: {
                type: Number
            },
            // 是否为全局搜索列表
            isGlobalSearchList: {
                type: Boolean,
                default: false
            },
            isRelationalView: Boolean,
            // 在关系视图中使用，需要传对应的产品oid
            formOid: String,
            // 启用表格滚动加载，启用后不显示分页组件，采用滚动加载
            enableScrollLoad: Boolean,
            isDesignerForm: Boolean,
            isLayoutWidget: {
                type: Boolean,
                default: false
            },
            maxLine: Number,
            beforeLoadHead: Function,
            appName: String
        },
        components: {
            FamInfoTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js')),
            FamViewNavbar: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/FamViewNavbar/index.js')),
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ViewForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/ViewForm/index.js'))
        },
        data() {
            return {
                viewOid: '',
                viewInfo: '', // 当前视图对象信息
                defaultViewOid: '', // 默认视图
                defaultViewInfo: null,

                // 表格配置
                viewTableMenuRow: {},
                columnsWidth: {},
                typeNames: [],
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamViewTable/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    编辑: this.getI18nByKey('编辑'),
                    删除: this.getI18nByKey('删除'),
                    另存为视图: this.getI18nByKey('另存为视图'),
                    是否放弃编辑: this.getI18nByKey('是否放弃编辑'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    operation: this.getI18nByKey('操作'),
                    提示: this.getI18nByKey('提示'),
                    高级筛选: this.getI18nByKey('高级筛选')
                },
                viewForm: {
                    oid: '',
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false
                },
                isChanged: false,
                $table: {}, // vxe-table 组件的refs对象
                $erdTable: {}, // ErdTable 组件的refs对象
                $advancedTable: {}, // FamAdvancedTable 组件的refs对象
                advancedFilterActive: false, //高级筛选激活
                classifySearchActive: false, //分类筛选激活
                viewsBasicFilters: [], // 视图表格基础筛选
                hyperlinkObj: {
                    isHyperlinkUrl: false,
                    isLinkToViewTable: false,
                    oid: ''
                }
            };
        },
        watch: {
            tableKey() {
                this.defaultViewOid = '';
                this.viewOid = '';
                this.$refs.FamAdvancedTable.tableLoading = true;
            }
        },

        created() {
            let params = FamKit.getParams();
            if (params.isHyperlinkUrl) {
                this.hyperlinkObj.oid = params.oid;
                this.hyperlinkObj.isHyperlinkUrl = true;
                if (params.isLinkToViewTable === 'true') {
                    this.hyperlinkObj.isLinkToViewTable = true;
                    delete params.oid;
                }
                delete params.isHyperlinkUrl;
                delete params.isLinkToViewTable;

                // 清除url参数, 避免手动刷新页面后 过滤条件被保留
                window.location.hash = FamKit.joinUrl(window.location.hash.split('?')[0], params);
            }
        },
        activated() {
            this.setStoreMainModelType();
        },
        computed: {
            allSlots() {
                let slots = [...this.slotsField];
                return Array.from(new Set(slots));
            },
            tableKey() {
                return this.viewTableConfig.tableKey || '';
            },
            showTitle() {
                if (Object.keys(this.viewTableConfig).includes('showTitle')) {
                    return !!this.viewTableConfig.showTitle;
                }
                /**
                 * 显示表格标题的规则
                 * 1. 当前视图表格被放到主内容区域，嵌套不超过4层
                 * 2. 当前显示的视图表格允许显示标题
                 */
                let $parent = this.$parent;
                let count = 4;

                while (!$parent?.$el?.classList?.contains('fam-main') && count > 0) {
                    $parent = $parent.$parent;
                    count--;
                }

                return (
                    $parent.$el?.classList?.contains('fam-main') &&
                    this.$route.matched.some((route) => route.meta?.showRouteTitle)
                );
            },
            isShowNavbar() {
                if (this.isGlobalSearchList || _.isEmpty(this.viewTableConfig)) {
                    return false;
                }
                if (this.isLayoutWidget || this.viewTableConfig.tableConfig?.useCodeConfig) {
                    return !this.viewTableConfig.viewMenu?.hiddenNavBar;
                }
                return this.viewTableMenuRow.viewConfigItems?.includes('hasView') ?? true;
            },
            viewTableTitle() {
                return this.viewTableConfig.viewTableTitle || '';
            },
            staticViewTableTitle() {
                return this.viewTableConfig.staticTitle;
            },
            menuConfig() {
                return this.viewTableConfig.viewMenu || {};
            },
            tableCofig() {
                let tableConfig = this.viewTableConfig.tableConfig || {};
                if (!this.isDynamicLoad) {
                    if (tableConfig.pagination && !_.isBoolean(tableConfig.pagination.showPagination)) {
                        tableConfig.pagination.showPagination = true;
                    }
                }
                if (this.viewTableMenuRow.pageSize) {
                    if (tableConfig.pagination) {
                        tableConfig.pagination.pageSize = this.viewTableMenuRow.pageSize;
                    }
                }
                return tableConfig;
            },
            isDynamicLoad() {
                if (this.viewInfo?.loadType) {
                    return this.viewInfo.loadType === 'dynamicLoad';
                }
                return this.enableScrollLoad;
            },
            isStreamline() {
                return this.viewTableMenuRow.pageStyle === 'easy';
            },
            viewInfoRow() {
                return this.viewInfo || {};
            },
            // 自定义插槽字段
            slotsField() {
                return (this.tableCofig?.slotsField || []).map((item) => {
                    return `column:${item.type}:${item.prop}:content`;
                });
            },
            advancedTableConfig() {
                let config = {
                    main: 'viewRender', // 主标识，如果是视图渲染（viewRender），表格拿到viewOid才会进行调用接口渲染，否则不做任何处理，避免报错
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/view/table/page', // 表格数据接口
                        params: {}, // 路径参数
                        method: 'post', // 请求方法（默认get）
                        data: {
                            className: this.viewInfo?.mainModelType // 当前视图主类型
                        }
                    },
                    searchParamsKey: 'searchKey',
                    isDeserialize: true, // 是否反序列数据源
                    firstLoad: true, // 进入页面就执行查询
                    toolbarConfig: {
                        // 工具栏
                        requestConfig: () => ({
                            url: '/fam/view/getSearchFields',
                            method: 'POST',
                            params: {
                                isAttrAddModelName: true,
                                searchCondition: 'VIEWSEARCH'
                            },
                            data: this.defaultViewInfo?.typeNames
                        }),
                        fuzzySearch: {
                            width: 350,
                            show: false // 是否显示普通模糊搜索，默认显示
                        }
                    },
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        method: 'POST',
                        // method: 'GET',
                        url: '/fam/view/table/head',
                        appName: this.appName,
                        data: {
                            className: this.viewInfo?.mainModelType // 当前视图主类型
                        }
                    },
                    sortFixRight: true, // 排序图标是否显示在右边
                    columnWidths: this.columnWidths, // 设置列宽，配置>接口返回>默认
                    addOperationCol: true, // 是否添加操作列（该列需要自己写插槽，prop固定operation）
                    addCheckbox: true,
                    fieldLinkConfig: {
                        fieldLink: true // 是否添加列超链接
                        // fieldLinkName: 'nameI18nJson',                   // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        // linkClick: (row) => {
                        //     // 超链接事件
                        //     this.linkClick(row);
                        // }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    pagination: {
                        // 分页
                        pageSize: 20
                    }
                };
                return $.extend(true, config, this.tableCofig, { firstLoad: !this.hyperlinkObj.isLinkToViewTable });
            },
            // 是否显示高级筛选
            showMoreSearch() {
                let isViewConfigShowed = this.viewTableMenuRow.viewConfigItems?.includes('advancedSearch') ?? true;
                if (this.isLayoutWidget || this.viewTableConfig.tableConfig?.useCodeConfig) {
                    return this.viewTableConfig.tableConfig?.toolbarConfig?.showMoreSearch ?? isViewConfigShowed;
                }
                return isViewConfigShowed;
            },
            // 是否显示分类搜索
            showClassifySearch() {
                let isViewConfigShowed = this.viewTableMenuRow.viewConfigItems?.includes('classifySearch') ?? false;
                if (this.isLayoutWidget || this.viewTableConfig.tableConfig?.useCodeConfig) {
                    return this.viewTableConfig.tableConfig?.toolbarConfig?.showMoreSearch ?? isViewConfigShowed;
                }
                return isViewConfigShowed;
            },
            showNavBar() {
                return this.menuConfig?.showNavBar || null;
            }
        },
        methods: {
            /**
             * 获取视图表格实例
             * @param { String } tableType 必填，表格类型 vxeTable baseTable advancedTable
             * @param { String } type 选填，获取数据类型，不传时，获取对应表格类型提供的所有数据以及方法
             * @returns
             */
            getTableInstance(tableType, type) {
                if (!tableType) {
                    return null;
                }
                const tables = {
                    vxeTable: this.$refs?.FamAdvancedTable?.getTableInstance('vxeTable') || {},
                    baseTable: this.$refs?.FamAdvancedTable?.getTableInstance('baseTable') || {},
                    advancedTable: {
                        instance: this.$refs?.FamAdvancedTable || {},
                        refreshTable: (...arg) => {
                            return this.$refs?.FamAdvancedTable?.fnRefreshTable(...arg);
                        },
                        selection: this.$refs?.FamAdvancedTable?.fnGetCurrentSelection() || [],
                        pagination: this.$refs?.FamAdvancedTable?.pagination || {},
                        requestConfig: this.$refs?.FamAdvancedTable?.fnGetRequestConfig() || {}
                    }
                };

                return type ? tables[tableType][type] : tables[tableType];
            },
            // 视图菜单切换
            fnViewChange(data) {
                if (data?.oid) {
                    this.fnGetViewInfo(data.oid);
                }
                this.classifySearchActive = false;
                this.advancedFilterActive = false;
                if (this.$refs?.FamAdvancedTable) {
                    this.$refs.FamAdvancedTable.addFilterWithViewInfo(false);
                }
            },
            // 视图菜单查询完成回调操作
            fnViewNavCallBack(resp) {
                this.viewTableMenuRow = resp?.data || {};

                // 全局搜索时 去除操作列
                if (this.isGlobalSearchList) {
                    let viewConfigItems = this.viewTableMenuRow.viewConfigItems;
                    if (viewConfigItems) {
                        viewConfigItems = viewConfigItems.replace('operate', '');
                    }
                    this.viewTableMenuRow.viewConfigItems = viewConfigItems;
                }
                this.defaultViewOid =
                    (this.viewTableMenuRow.tableViewVos || []).find((item) => item.isDefault)?.oid || '';
            },
            fetchViewInfoByOid(oid) {
                return this.$famHttp({
                    url: '/fam/view/getViewInfo',
                    appName: this.appName,
                    params: {
                        viewOId: oid
                    }
                });
            },
            fnGetViewInfo(viewOid) {
                this.fetchViewInfoByOid(viewOid)
                    .then((resp) => {
                        let data = resp?.data || {};
                        if (_.isFunction(this.beforeLoadHead)) {
                            this.beforeLoadHead(data, () => {
                                this.viewInfoEcho(data);
                            });
                        } else {
                            this.viewInfoEcho(data);
                        }
                    })
                    .finally(() => {
                        this.$nextTick(() => {
                            if (this.defaultViewOid === this.viewOid) {
                                this.defaultViewInfo = this.viewInfo;
                                return;
                            }
                            if (this.defaultViewOid && this.defaultViewInfo?.oid !== this.defaultViewOid) {
                                window.requestIdleCallback(() => {
                                    this.fetchViewInfoByOid(this.defaultViewOid).then(({ data }) => {
                                        this.defaultViewInfo = data;
                                    });
                                });
                            }
                        });
                    });
            },
            viewInfoEcho(data) {
                this.viewsBasicFilters =
                    data.baseFilterFieldDtos?.map((item) => {
                        return {
                            ...item.constraintDefinitionDto,
                            ...item,
                            filterAble: true,
                            oid: item.attrRef
                        };
                    }) || [];
                // 处理数据回显
                data &&
                    Object.keys(data).forEach((key) => {
                        if (key && key.includes('I18nJson')) {
                            // 回显处理
                            let newJI18nsonVal = {
                                value: { ...data[key] }
                            };
                            data[key] = newJI18nsonVal;
                        }
                    });
                this.viewInfo = data;
                this.setStoreMainModelType();

                // 如果修改的当前的视图，需要刷新视图数据联动，如果视图改变了，oid改变会自动触发刷新
                if (this.viewOid === data?.oid) {
                    this.$refs?.FamAdvancedTable?.refreshViewTableAndConditions(data);
                } else {
                    this.viewOid = data?.oid;
                }
                this.typeNames = data?.typeNames || [];
            },
            fnShowFormDialog() {
                let conditionDtos = this.$refs['FamAdvancedTable']?.conditionDtoList || [];
                let newColumns = this.$refs['FamAdvancedTable']?.columns || [];
                this.viewInfo['conditionDtos'] = conditionDtos?.map((ite) => ite);
                this.viewInfo['fieldsDto'] = newColumns.filter((ite) => {
                    ite['locked'] = true; // 当前显示列，都设置锁定
                    return !ite.extraCol;
                }); // 过滤拓展列，比如操作，复选框这种
                this.viewForm.visible = true;
            },
            fnFormChange(changed) {
                this.isChanged = changed;
            },
            // 关闭弹窗表单
            fnCloseForm() {
                let tips = this.i18nMappingObj['是否放弃编辑'];
                let title = this.i18nMappingObj['提示'];
                if (this.isChanged) {
                    this.$confirm(tips, title, {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }).then(() => {
                        this.toggleShow();
                    });
                } else {
                    this.toggleShow();
                }
            },
            // 另存为
            fnFormSubmit(formRef) {
                this.viewForm.loading = true;
                this.$refs[formRef]
                    .submit()
                    .then(() => {
                        this.$refs['FamViewNavbar']?.fnGetViewNavbar(); // 刷新视图列表
                        this.toggleShow();
                    })
                    .finally(() => {
                        this.viewForm.loading = false;
                    });
            },

            toggleShow() {
                this.viewForm = {
                    oid: '',
                    visible: false,
                    loading: false,
                    editable: false,
                    readonly: false
                };
            },
            refreshTable(...arg) {
                this.$refs?.FamAdvancedTable?.fnRefreshTable(...arg);
            },
            fnGetCurrentSelection() {
                return this.$refs.FamAdvancedTable.fnGetCurrentSelection();
            },
            switchAdvancedFilter() {
                this.classifySearchActive = false;
                this.advancedFilterActive = true;
                this.$refs?.FamAdvancedTable?.addFilterWithViewInfo('advancedFilter');
                this.setViewNavbar();
            },
            switchClassifySearch() {
                this.classifySearchActive = true;
                this.advancedFilterActive = false;
                this.$refs.FamAdvancedTable?.addFilterWithViewInfo('classifySearch');
                this.setViewNavbar();
            },
            setViewNavbar() {
                this.$refs?.FamViewNavbar?.setActiveName();
            },
            // 存入当前视图主类型到 store
            setStoreMainModelType() {
                if (this.$route.name !== 'AdvancedSearch') {
                    this.$store.commit('setGlobalSearchConsum', {
                        key: 'mainModelType',
                        value: this.viewInfo?.mainModelType || ''
                    });
                }
            }
        }
    };
});
