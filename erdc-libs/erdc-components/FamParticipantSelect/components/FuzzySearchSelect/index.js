define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/components/FuzzySearchSelect/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/components/FuzzySearchSelect/style.css')
], function (template, utils) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            value: {
                type: [String, Array, Object],
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            props: {
                type: Object,
                default: () => {
                    return {
                        children: 'childList',
                        label: 'displayName'
                    };
                }
            },
            nodeKey: {
                type: String,
                default: 'oid'
            },
            multiple: Boolean,
            defaultValue: {
                type: [Object, Array, Object],
                default() {
                    return null;
                }
            },
            placeholder: {
                type: String,
                default: '姓名/工号/邮件地址，支持批量输入/粘贴，用“;”隔开'
            },
            type: String,
            defaultMode: String,
            className: String,
            queryScope: String,
            requestConfig: {
                type: Object,
                default() {
                    return null;
                }
            },
            queryParams: Object,
            selectData: {
                type: [Object, Array],
                default() {
                    return [];
                }
            },
            appName: String,
            threeMemberEnv: Boolean,
            filterSecurityLabel: Boolean,
            securityLabel: String
        },
        components: {
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
                searchValue: '',
                loading: false,
                tableData: [],
                innerColumn: [
                    {
                        prop: 'displayName',
                        title: '姓名',
                        minWidth: '87',
                        sort: false,
                        fixed: ''
                    },
                    {
                        prop: 'code',
                        title: '工号',
                        minWidth: '87',
                        sort: false,
                        fixed: ''
                    },
                    {
                        prop: 'orgName', // 列数据字段key
                        title: '部门', // 列头部标题
                        minWidth: '160', // 列宽度
                        sort: false, // 是否需要排序
                        fixed: '' // 是否固定列
                    }
                ],
                isFirst: true,
                containerOid: this.$store.state.space?.context?.oid || ''
            };
        },
        computed: {
            innerSelectData: {
                get() {
                    return this.selectData || [];
                },
                set(selectData) {
                    if (selectData) {
                        const newData = selectData?.filter((item) => item.checked);
                        const selectValue = selectData.reduce((prev, item) => {
                            if (item.checked) {
                                prev.push(item[this.nodeKey]);
                            }
                            return prev;
                        }, []);
                        this.$emit('input', this.multiple ? selectValue : selectValue?.[0] || '');
                        this.$emit('change', this.multiple ? selectValue : selectValue?.[0] || '', newData);
                    }
                    this.$emit('update:select-data', selectData);
                }
            },
            column: {
                get() {
                    return this.innerColumn;
                },
                set(column) {
                    this.innerColumn = column;
                }
            }
        },
        watch: {
            searchValue(value) {
                this.onSearch(value);
            },
            value(newVal) {
                this.innerSelectData.forEach((item) => {
                    this.$set(
                        item,
                        'checked',
                        this.multiple ? newVal.includes(item[this.nodeKey]) : newVal === item[this.nodeKey]
                    );
                });
                this.tableData.forEach((item) => {
                    if (newVal.includes(item[this.nodeKey])) {
                        this.$set(item, 'checked', true);
                    } else {
                        this.$set(item, 'checked', false);
                    }
                });
            },
            innerSelectData: {
                immediate: true,
                handler() {
                    if (this.isFirst) {
                        this.onSearch();
                        this.isFirst = false;
                    }
                }
            }
        },
        create() {},
        mounted() {
            if (this.multiple) {
                this.$nextTick(() => {
                    this.column.unshift({
                        prop: 'checkbox', // 列数据字段key
                        type: 'checkbox', // 特定类型 复选框[checkbox] 单选框[radio]
                        minWidth: '48', // 列宽度
                        width: '48',
                        align: 'center',
                        fixed: '' // 是否固定列
                    });
                    const InputElement = $(this.$refs.searchValue.$el).find('input');
                    // 复制
                    $(InputElement).on('copy', () => {
                        // 仅仅勾选了数据情况下自定义复制的内容
                        if (this.innerSelectData.length) {
                            let text = this.innerSelectData.map((item) => item.name).join(';');
                            utils
                                .copyTxt(text)
                                .then(() => {
                                    this.$message({
                                        message: '复制成功',
                                        type: 'success',
                                        showClose: true
                                    });
                                })
                                .catch(() => {
                                    this.$message({
                                        message: '复制失败',
                                        type: 'error',
                                        showClose: true
                                    });
                                });
                        }
                    });
                });
            }
        },
        methods: {
            onSearch: function (value) {
                const _this = this;

                this.searchFn(value, _this);
            },
            searchFn: _.debounce(function (value, _this) {
                let data = {
                    keywords: value,
                    isGetDisable: false,
                    filterThreeMember: this.threeMemberEnv
                };
                if (this.filterSecurityLabel) {
                    data.securityLabel = this.securityLabel;
                }
                if (this.queryScope === 'teamRole') {
                    data = {
                        userSearchKey: value,
                        containerOid: _this.containerOid,
                        isQueryByPath: true,
                        getAllUser: false,
                        roleCode: 'PARTICIPANT/CCB',
                        ...data
                    };
                }
                if (this.queryScope === 'team') {
                    data = {
                        userSearchKey: value,
                        containerOid: _this.containerOid,
                        getAllUser: false,
                        ...data
                    };
                }
                const componentCon = {
                    ...this.requestConfig,
                    ...this.queryParams,
                    data: {
                        ...data,
                        ...this.requestConfig?.data,
                        ...this.queryParams?.data
                    },
                    headers: {
                        'App-Name': this.appName,
                        ...this.requestConfig?.headers,
                        ...this.queryParams?.headers
                    }
                };
                this.$famHttp(componentCon).then((resp) => {
                    let { userInfoList } = resp?.data || {};
                    let tableData = userInfoList || resp?.data || [];
                    const selectDataKeys = _this.selectData.map((item) => item[_this.nodeKey]).filter((item) => item);
                    // 下边逻辑为调接口逻辑
                    tableData.forEach((item) => {
                        if (selectDataKeys.includes(item[_this.nodeKey])) {
                            this.$set(item, 'checked', true);
                        } else {
                            this.$set(item, 'checked', false);
                        }
                    });
                    _this.tableData = tableData;
                });
            }, 300),
            // 设置是否可以选中
            checkMethod({ row }) {
                return true;
            },
            cellClick(event) {
                this.$refs?.searchValue?.focus();
            },
            selectAllEvent({ checked }) {
                if (checked) {
                    const selectData = FamKit.deepClone(this.innerSelectData);
                    const innerSelectData = this.objectArrayRemoveDuplication(
                        [...selectData, ...this.tableData],
                        this.nodeKey
                    );
                    this.innerSelectData = innerSelectData || [];
                } else {
                    const innerSelectData = this.innerSelectData.filter((item) => {
                        return !this.tableData.find((ite) => ite[this.nodeKey] === item[this.nodeKey]);
                    });
                    this.innerSelectData = innerSelectData || [];
                }
            },
            selectChangeEvent({ row, checked }) {
                if (this.multiple) {
                    if (checked) {
                        const selectData = FamKit.deepClone(this.innerSelectData);
                        selectData.unshift(row);
                        const innerSelectData = this.objectArrayRemoveDuplication(selectData, this.nodeKey);
                        this.$set(this, 'innerSelectData', innerSelectData);
                    } else {
                        const innerSelectData = this.innerSelectData.filter(
                            (item) => item[this.nodeKey] !== row[this.nodeKey]
                        );
                        this.$set(this, 'innerSelectData', innerSelectData);
                    }
                    return;
                }
                this.$set(this, 'innerSelectData', checked ? [row] : []);
            },
            // 数组对象去重
            objectArrayRemoveDuplication(objectArr = [], key) {
                const has = {};
                return objectArr.reduce((pre, next) => {
                    if (!has[next[key]]) {
                        has[next[key]] = true;
                        pre.push(next);
                    }
                    return pre;
                }, []);
            },
            focus() {
                this.$refs.searchValue.focus();
            }
        }
    };
});
