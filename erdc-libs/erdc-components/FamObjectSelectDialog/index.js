define([
    'fam:kit',
    'text!' + ELMP.resource('erdc-components/FamObjectSelectDialog/index.html'),
    'css!' + ELMP.resource('erdc-components/FamObjectSelectDialog/style.css')
], function (FamKit, template) {
    return {
        template,
        props: {
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
            }
        },
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamFilterCombination: FamKit.asyncComponent(ELMP.resource('erdc-components/FamFilterCombination/index.js')),
            FamTableColSet: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamObjectSelectDialog/locale/index.js'),
                i18nMappingObj: {
                    inputTips: this.getI18nByKey('tips_input_number_or_name'),
                    selectDataTips: this.getI18nByKey('tips_select_data')
                },
                tableColumns: [],
                conditions: [],
                dataTableKey: '',
                fnResolve: null,
                multiple: true
            };
        },
        computed: {
            viewTableConfig() {
                return {
                    tableBaseConfig: {
                        showOverflow: true,
                        columnConfig: {
                            resizable: true
                        }
                    },
                    tableRequestConfig: {
                        url: '/fam/view/table/page',
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
                    columns: this.tableColumns,
                    toolbarConfig: {
                        showConfigCol: true,
                        showMoreSearch: false,
                        showRefresh: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        }
                    },
                    firstLoad: true,
                    addSeq: true,
                    addCheckbox: this.multiple,
                    addRadio: !this.multiple,
                    fieldLinkConfig: {
                        fieldLink: false
                    }
                };
            },
            tableRequestConfigData() {
                const { className, dataTableKey } = this;
                return {
                    className,
                    tableKey: dataTableKey,
                    ...this.extendParams,
                    conditionDtoList: [...this.conditions, ...(this.extendParams.conditionDtoList || [])]
                };
            },
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(data) {
                    this.$emit('update:visible', data);
                }
            }
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
                    _.isFunction(this.fnResolve) && this.fnResolve(selection);
                    this.dialogVisible = false;
                    this.$emit('submit', selection);
                };

                if (!selection || (Array.isArray(selection) && !selection.length)) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.NullPrompt
                    });
                }
                // 如果有前置处理
                if (this.$listeners['before-submit']) {
                    this.$emit('before-submit', selection, next);
                } else {
                    next();
                }
            },

            // 弹出层显示时
            onOpenDialog() {
                // 初始化列配置
                let { columns, className, $store } = this;
                let { columns: configColumns, tableKey } = $store.getters['FamObjectSelect/getConfig'](className);

                // tableKey处理
                this.dataTableKey = this.tableKey || tableKey;

                // 列配置处理
                if (_.isArray(columns) && columns.length > 0) {
                    configColumns = columns;
                }

                this.tableColumns = configColumns.map((item) => {
                    return {
                        ...item,
                        isDisable: false,
                        label: item.title,
                        attrName: item.prop
                    };
                });

                this.$emit('open', ...arguments);
            },
            /**
             * 提取对象的attrRawList中的对应字段值的显示名
             * @param {*} item
             * @returns
             */
            getObjectDisplayNames(item = {}) {
                let result = {};
                let fields = this.tableColumns.map((item) => item.prop);
                item.attrRawList.forEach((attr) => {
                    let attrName = attr.attrName.split('#')?.[1];
                    if (!fields.includes(attrName)) return;
                    result[attrName] = attr.displayName || attr.value || item[attrName];
                });
                return result;
            },

            // 筛选条件变更时
            onConditionChange(conditions = []) {
                this.conditions = conditions;
                this.$refs.famAdvancedTable.fnRefreshTable();
            }
        }
    };
});
