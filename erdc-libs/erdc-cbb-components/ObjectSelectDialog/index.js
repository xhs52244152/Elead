define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectSelectDialog/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-pdm-app/store/index.js'),
    'css!' + ELMP.resource('erdc-cbb-components/ObjectSelectDialog/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        props: {
            title: String,

            // 查询对象类型标识
            className: String,

            // 弹出层显示开关
            visible: Boolean,

            // 自定义列配置（默认会根据className从store中获取）
            columns: {
                type: Array,
                default() {
                    return [];
                }
            },

            // 表格key
            tableKey: String,

            // 扩展查询参数
            extendParams: {
                type: Object,
                default() {
                    return {};
                }
            },

            // 基础查询字段
            extendFilterConditions: {
                type: Array,
                default() {
                    return [];
                }
            },

            // 参数处理方法
            handleParams: Function,

            // 列表接口url
            pageUrl: {
                type: String,
                default: '/fam/view/table/page'
            }
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamBasicFilter: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamBasicFilter/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ObjectSelectDialog/locale/index.js'),
                conditions: [],
                fnResolve: null,
                multiple: true,
                tableHeight: 300,
                searchKey: '',
                defaultColumns: [],
                isReady: false
            };
        },
        computed: {
            tableColumns() {
                let { columns, defaultColumns } = this;
                return _.isEmpty(columns) ? defaultColumns : columns;
            },
            viewTableConfig() {
                let { pageUrl, tableColumns, checkMethod } = this;
                return {
                    tableBaseConfig: {
                        showOverflow: true,
                        columnConfig: {
                            resizable: true
                        },
                        radioConfig: {
                            checkMethod
                        }
                    },
                    pagination: {
                        // 分页
                        pageSize: 100
                    },
                    tableRequestConfig: {
                        url: pageUrl,
                        data: this.tableRequestConfigData,
                        method: 'post',
                        className: this.className,
                        isFormData: false,
                        transformResponse: [
                            (data) => {
                                let resData = data;
                                try {
                                    resData = data && JSON.parse(data);

                                    // 处理数据格式
                                    resData.data.records = resData.data.records.map((item) => {
                                        return {
                                            ...item,
                                            ...this.getObjectDisplayNames(item)
                                        };
                                    });
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    columns: tableColumns,
                    toolbarConfig: {
                        showConfigCol: true,
                        showMoreSearch: false,
                        showRefresh: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        }
                    },
                    searchParamsKey: 'searchKey',
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: this.multiple,
                    addRadio: !this.multiple,
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        }
                    ],
                    fieldLinkConfig: {
                        fieldLink: false
                    }
                };
            },
            tableRequestConfigData() {
                const { className, dataTableKey, handleParams } = this;
                let params = {
                    className,
                    tableKey: dataTableKey,
                    ...this.extendParams,
                    conditionDtoList: [...this.conditions, ...(this.extendParams.conditionDtoList || [])]
                };

                return _.isFunction(handleParams) ? handleParams(params) : params;
            },
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(data) {
                    this.$emit('update:visible', data);
                }
            },
            defaultTableKey() {
                let { className } = this;
                let { tableViewMaping } = store.state;

                let tableKey = '';

                Object.values(tableViewMaping).forEach((config) => {
                    if (config.className === className) tableKey = config.tableKey;
                });

                return tableKey;
            },
            filterConditions() {
                let { className } = this;
                return [
                    {
                        label: '类型',
                        attrName: `${className}#typeReference`,
                        componentName: 'CustomVirtualSelect',
                        defaultSelectFirst: true,
                        componentJson: JSON.stringify({
                            props: {
                                defaultSelectFirst: true,
                                row: {
                                    requestConfig: {
                                        method: 'GET',
                                        url: '/fam/type/typeDefinition/findAccessTypes',
                                        data: {
                                            typeName: className,
                                            subTypeEnum: 'ALL',
                                            containerRef: '',
                                            accessControl: 'false'
                                        },
                                        valueProperty: 'typeOid',
                                        viewProperty: 'displayName'
                                    }
                                }
                            }
                        })
                    }
                ].concat(this.extendFilterConditions);
            },
            formattedBasicFilterConditions() {
                return this.filterConditions.map((item) => {
                    return {
                        ...item
                    };
                });
            },
            dataTableKey() {
                return this.tableKey || this.defaultTableKey;
            }
        },
        created() {
            this.tableHeight = window.innerHeight - 250;
            if (_.isEmpty(this.tableColumns)) {
                this.fetchHeaders().then((resp) => {
                    this.defaultColumns = resp?.data?.headers.map((item) => {
                        let attrName = item.attrName.split('#')?.[1] || item.attrName;
                        return {
                            label: item.label,
                            attrName,
                            siDisabled: false,
                            width: attrName === 'icon' ? '48' : ''
                        };
                    });
                });
            }

            // 初始条件加载完毕后
            let { validateDefSelect } = this;
            ErdcKit.deferredUntilTrue(
                () => validateDefSelect(),
                () => {
                    this.isReady = true;
                }
            );
        },
        methods: {
            /**
             * 打开弹出层并在点击确定后触发回调
             * @param {multiple: Boolean} config
             * @returns
             */
            openSelect(config) {
                this.dialogVisible = true;
                this.multiple = config.multiple;
                // 设置基础筛选默认值
                ErdcKit.deferredUntilTrue(
                    () => this.$refs.basicFilter?.basicFilterConditions,
                    () => {
                        this.$refs.basicFilter.basicFilterConditions.forEach((item) => {
                            if (Object.prototype.hasOwnProperty.call(config.value, item.attrName)) {
                                item.value = config.value[item.attrName];
                            }
                        });

                        // 触发重新请求
                        this.$refs.basicFilter?.fnOnConditionChange();
                    }
                );

                return new Promise((resolve) => {
                    this.fnResolve = resolve;
                });
            },

            /**
             * 点击确定
             */
            onSubmit() {
                const { getCheckboxRecords, getRadioRecord } = this.$refs.famAdvancedTable;
                let selection = this.multiple ? getCheckboxRecords() : getRadioRecord();
                if (!selection) {
                    return this.$message.info(this.i18nMappingObj.selectDataTips);
                }

                let next = () => {
                    _.isFunction(this.fnResolve) && this.fnResolve({ selection, conditions: this.conditions });
                    this.dialogVisible = false;
                    this.$emit('submit', selection);
                };

                // 如果有前置处理
                if (this.$listeners['before-submit']) {
                    this.$emit('before-submit', selection, next);
                } else {
                    next();
                }
            },

            // 弹出层显示时
            onOpenDialog() {
                this.$emit('open', ...arguments);
            },
            /**
             * 提取对象的attrRawList中的对应字段值的显示名
             * @param {*} item
             * @returns
             */
            getObjectDisplayNames(item = {}) {
                let result = {};
                let fields = this.tableColumns.map((item) => item.attrName);
                item.attrRawList.forEach((attr) => {
                    let attrName = attr.attrName.search('#') > -1 ? attr.attrName.split('#')?.[1] : attr.attrName;
                    if (!fields.includes(attrName)) return;
                    result[attrName] = attr.displayName || attr.value || item[attrName];
                });
                return result;
            },
            // 判断必选条件是否都选了
            validateDefSelect() {
                let { formattedBasicFilterConditions, conditions } = this;
                return !formattedBasicFilterConditions.some(
                    (item) =>
                        item.defaultSelectFirst && !conditions.map((item) => item.attrName).includes(item.attrName)
                );
            },
            // 筛选条件变更时
            onConditionChange(conditions = []) {
                // 条件切换时，清空关键字
                this.searchKey = '';

                this.conditions = conditions;

                let { validateDefSelect } = this;

                if (validateDefSelect()) {
                    this.$refs.famAdvancedTable?.fnRefreshTable({
                        searchStr: this.searchKey
                    });
                }
            },
            fnSearchTable(searchKey) {
                this.$refs.famAdvancedTable.fnSearchTable(searchKey);
            },
            fetchHeaders() {
                let { className, dataTableKey } = this;
                return this.$famHttp({
                    url: '/fam/view/table/head',
                    method: 'POST',
                    data: {
                        className,
                        tableKey: dataTableKey
                    }
                });
            },
            getIcon(row) {
                let iconAttrName = `${this.className}#icon`;
                let iconData = row.attrRawList.find((item) => item.attrName === iconAttrName);
                return iconData?.value || row.icon;
            },
            checkMethod({ row }) {
                return row.accessToView ?? true;
            }
        }
    };
});
