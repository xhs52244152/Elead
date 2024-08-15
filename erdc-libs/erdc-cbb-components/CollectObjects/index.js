define(['text!' + ELMP.resource('erdc-cbb-components/CollectObjects/index.html'), 'erdc-kit', 'underscore'], function (
    template
) {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'CollectObjects',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            tableData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            className: {
                type: String,
                required: true
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/CollectObjects/locale/index.js'),
                // 源数据
                sourceData: [],
                // 选中数据
                selectedData: [],
                // 搜索关键字
                searchKey: '',
                // 全量按钮
                fullButtonList: [],
                // 加载中
                loading: false
            };
        },
        computed: {
            // 单个按钮
            buttonInfo() {
                const showButtonList = ErdcKit.deepClone(this.showButtonList) || [];
                return showButtonList?.shift?.() || {};
            },
            // 移除按钮
            operInfo() {
                return {
                    label: this.i18n['移除'],
                    onclick: this.collectionEvent,
                    COLLECT_OBJECT_DISABLED: !this.selectedData.length
                };
            },
            // 下拉按钮
            pulldownList() {
                const showButtonList = ErdcKit.deepClone(this.showButtonList) || [];
                showButtonList?.shift?.();
                showButtonList?.push?.(this.operInfo);
                return showButtonList;
            },
            // 过滤出来的按钮
            filterButtonList() {
                const fullButtonList = ErdcKit.deepClone(this.fullButtonList) || [];
                const filterButtonList = _.chain(fullButtonList)
                    .reduce((prev, next) => {
                        !_.some(prev, (item) => item?.label === next?.label) &&
                            prev.push({ ...next, onclick: this.collectionEvent });
                        return prev;
                    }, [])
                    .value();
                return filterButtonList;
            },
            // 展示出来的按钮
            showButtonList() {
                let showButtonList = ErdcKit.deepClone(this.filterButtonList) || [];

                const fullButtonList = ErdcKit.deepClone(this.fullButtonList) || [];

                showButtonList = _.map(showButtonList, (item) => {
                    const COLLECT_OBJECT_DISABLED = this.selectedData.length
                        ? _.every(this.selectedData, (sitem) => {
                            let typeName = this?.className || '';

                            if (sitem?.oid) {
                                typeName = sitem?.oid?.split(':')[1] || '';
                            }

                            if (sitem?.versionOid) {
                                typeName = sitem?.versionOid?.split(':')[1] || '';
                            }

                            const fullShowButtonList =
                                _.filter(fullButtonList, (sitem) => sitem?.label === item?.label) || [];

                            return _.every(fullShowButtonList, (sitem) => sitem?.modelAClass !== typeName);
                        })
                        : true;
                    return {
                        ...item,
                        COLLECT_OBJECT_DISABLED
                    };
                });
                return showButtonList;
            },
            defaultColumn() {
                return [
                    {
                        type: 'seq',
                        align: 'center',
                        fixed: 'left',
                        width: 48
                    },
                    {
                        type: 'checkbox',
                        align: 'center',
                        fixed: 'left',
                        width: 40
                    },
                    {
                        prop: 'identifierNo', // 列数据字段key
                        title: this.i18n['编码'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'name',
                        title: this.i18n['名称'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'version',
                        title: this.i18n['版本'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'ruleName',
                        title: this.i18n['收集规则'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n['生命周期状态'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n['上下文'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'createBy',
                        title: this.i18n['创建者'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'createTime',
                        title: this.i18n['创建时间'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'updateBy',
                        title: this.i18n['修改者'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'updateTime',
                        title: this.i18n['更新时间'], // 列头部标题
                        props: {
                            formatter: this.formatterDisplayName
                        }
                    },
                    {
                        prop: 'operation',
                        title: this.i18n['操作'] // 列头部标题
                    }
                ];
            },
            innerColumn() {
                return this.column.length ? this.column : this.defaultColumn;
            },
            // 表格展示数据
            innerTableData() {
                return _.filter(ErdcKit.deepClone(this.sourceData), (item) => item.COLLECT_OBJECT_SHOW) || [];
            }
        },
        watch: {
            tableData: {
                handler: function (nv) {
                    // 源数据
                    this.sourceData = _.map(ErdcKit.deepClone(nv) || [], (item) => ({
                        ...item,
                        COLLECT_OBJECT_SHOW: true
                    }));
                },
                immediate: true
            }
        },
        created() {
            this.initButtonList();
        },
        methods: {
            // 初始化表格取值
            formatterDisplayName({ cellValue, column, row }) {
                cellValue =
                    _.find(row?.attrRawList, (item) => new RegExp(`^(?!Link#).*${column?.field}$`).test(item?.attrName))
                        ?.displayName || cellValue;
                if (column?.field === 'ruleName' && !cellValue) {
                    cellValue = this.i18n['初始选定'] || '初始选定';
                }
                return cellValue;
            },
            // 是否收集进来的
            showAssociatedInfo({ column, row }) {
                return _.some(row?.attrRawList, (item) =>
                    new RegExp(`^(?!Link#).*${column?.field}$`).test(item?.attrName)
                );
            },
            // 获取收集信息
            getAssociatedInfo({ cellValue, row }) {
                cellValue =
                    _.find(row?.attrRawList, (item) => new RegExp('roleAObjectRef$').test(item?.attrName))
                        ?.displayName || cellValue;
                return cellValue;
            },
            // 收集事件
            collectionEvent(row) {
                if (!this.selectedData.length) {
                    return this.$message.info(this.i18n['请先勾选数据']);
                }
                row.oid ? this.addCollectObject(row) : this.removeCollectObject(row);
            },
            // 添加收集对象
            addCollectObject(row) {
                let idKey = this?.className || '',
                    ruleOidList = [];

                const fullButtonList = _.filter(this.fullButtonList, (item) => item?.label === row?.label) || [];

                _.each(this.selectedData, (item) => {
                    if (item?.versionOid) {
                        idKey = item?.versionOid?.split(':')[1] || '';
                    } else {
                        const idKeyInfo =
                            _.find(item?.attrRawList, (item) => new RegExp('idKey$').test(item?.attrName)) || {};

                        if (!_.isEmpty(idKeyInfo) && idKeyInfo?.value) {
                            idKey = idKeyInfo?.value;
                        }
                    }
                    _.each(fullButtonList, (sitem) => {
                        if (sitem?.modelAClass === idKey) {
                            ruleOidList.push(sitem?.oid);
                        }
                    });
                });

                ruleOidList = _.uniq(ruleOidList);

                let oidList =
                    _.map(this.selectedData, (item) => {
                        return item?.versionOid || item?.oid || '';
                    }) || [];

                oidList = _.uniq(oidList);

                // const ruleOidList = _.chain(this.fullButtonList).filter(item => item?.label === row?.label && row?.modelAClass === typeName).map('oid').value() || [];

                this.loading = true;

                this.getCollectDataApi({ oidList, ruleOidList })
                    .then((resp) => {
                        if (resp.success) {
                            let tableData = resp?.data || [];
                            if (tableData.length) {
                                for (let i = tableData.length - 1; i >= 0; i--) {
                                    for (let j = 0; j < this.sourceData.length; j++) {
                                        if (
                                            tableData[i]?.versionOid ===
                                            (this.sourceData[j]?.versionOid || this.sourceData[j]?.oid)
                                        ) {
                                            tableData.splice(i, 1);
                                        }
                                    }
                                }

                                tableData = _.map(tableData, (item) => {
                                    return { ...item, COLLECT_OBJECT_SHOW: true };
                                });

                                this.sourceData = ErdcKit.deepClone(this.sourceData).concat(tableData);
                            } else {
                                this.$message.success(this.i18n['没有可收集的相关对象']);
                            }
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 获取数据对象数据
            getCollectDataApi(data) {
                return this.$famHttp({
                    url: '/fam/getCollectData',
                    method: 'post',
                    data,
                    className: this.className
                });
            },
            // 移除当个收集对象
            removeCollectObjectOne({ row }) {
                this.$confirm(this.i18n['确定要移除这些数据吗？'], this.i18n['提示'], {
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                })
                    .then(() => {
                        this.loading = true;

                        for (let i = 0; i < this.sourceData.length; i++) {
                            if (row?.oid === this.sourceData[i]?.oid) {
                                this.sourceData.splice(i, 1);
                                break;
                            }
                        }

                        for (let i = 0; i < this.selectedData.length; i++) {
                            if (row?.oid === this.selectedData[i]?.oid) {
                                this.selectedData.splice(i, 1);
                                break;
                            }
                        }

                        return this.$message.success(this.i18n['数据移除成功']);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 移除收集对象
            removeCollectObject() {
                if (
                    _.every(this.selectedData, (item) => {
                        return !_.some(item?.attrRawList, (sitem) => new RegExp('ruleName$').test(sitem?.attrName));
                    })
                ) {
                    return this.$message.warning(this.i18n['初始选定的对象不能移除']);
                }

                this.$confirm(this.i18n['确定要移除这些数据吗？'], this.i18n['提示'], {
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                })
                    .then(() => {
                        this.loading = true;

                        const selectedData =
                            _.filter(this.selectedData, (item) =>
                                _.some(item?.attrRawList, (sitem) => new RegExp('ruleName$').test(sitem?.attrName))
                            ) || [];

                        for (let i = 0; i < selectedData.length; i++) {
                            for (let j = this.sourceData.length - 1; j >= 0; j--) {
                                if (selectedData[i]?.oid === this.sourceData[j]?.oid) {
                                    this.sourceData.splice(j, 1);
                                }
                            }
                        }

                        // 清空所选数据
                        const records =
                            _.filter(
                                this.selectedData,
                                (item) =>
                                    !_.some(item?.attrRawList, (sitem) => new RegExp('ruleName$').test(sitem?.attrName))
                            ) || [];
                        this.checkboxAll({ records });

                        return records.length
                            ? this.$message.warning(this.i18n['初始选定的对象不能移除'])
                            : this.$message.success(this.i18n['数据移除成功']);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 初始化按钮
            initButtonList() {
                this.getButtonListApi().then((resp) => {
                    if (resp.success) {
                        const data = resp?.data?.records || [];

                        this.fullButtonList = _.chain(data)
                            .map((item) => {
                                const newItem = _.reduce(
                                    item?.attrRawList,
                                    (prev, next) => ({ ...prev, [next.attrName]: next.value }),
                                    {}
                                );

                                return {
                                    ...item,
                                    ...newItem,
                                    label: newItem['expression']?.customJson?.name || ''
                                };
                            })
                            .sortBy((item) => {
                                return +item?.expression?.customJson?.sort;
                            })
                            .value();
                    }
                });
            },
            // 获取按钮api
            getButtonListApi() {
                return this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        className: 'erd.cloud.foundation.type.entity.TypeConfigRule',
                        conditionDtoList: [
                            {
                                attrName: 'action',
                                value1: 'COLLECT',
                                oper: 'EQ'
                            }
                        ]
                    }
                });
            },
            // 搜索关键字
            searchKeyChange(val) {
                let sourceData = ErdcKit.deepClone(this.sourceData) || [];
                if (val) {
                    sourceData = _.map(sourceData, (item) => {
                        const matchingRule = _.pick(item, (value, key) => {
                            return _.chain(this.innerColumn).map('prop').compact().value().some(item => new RegExp(`${item}$`).test(key));
                        });
                        const COLLECT_OBJECT_SHOW = _.some(matchingRule, (value) => {
                            return value?.toLowerCase()?.includes(val?.toLowerCase());
                        });
                        return {
                            ...item,
                            COLLECT_OBJECT_SHOW
                        };
                    });
                } else {
                    sourceData = _.map(sourceData, (item) => ({ ...item, COLLECT_OBJECT_SHOW: true }));
                }
                this.sourceData = ErdcKit.deepClone(sourceData) || [];
            },
            // 复选框选中单条数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框选中全部数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            // 获取收集对象数据
            getData() {
                return _.map(ErdcKit.deepClone(this.selectedData), (item) => _.omit(item, 'COLLECT_OBJECT_SHOW'));
            },
            // 数据能否勾选
            checkMethod({ row }) {
                return row?.accessToView;
            },
            // 单行移除按钮是否禁用
            getRemoveObjectDisabled({ row }) {
                let accessToView = !row?.accessToView;
                if (
                    !accessToView &&
                    !_.some(row?.attrRawList, (item) => new RegExp('ruleName$').test(item?.attrName))
                ) {
                    accessToView = !accessToView;
                }
                return accessToView;
            }
        }
    };
});
