define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/DeliveryDetails/component/AddDeliverables/index.html'),
    'css!' + ELMP.resource('project-plan/components/DeliveryDetails/component/AddDeliverables/index.css'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js')
], function (ErdcKit, template, css1, store, utils) {
    return {
        template,
        props: {
            selectType: {
                type: String,
                default: 'checkbox'
            },
            selectedData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            isAddContainerRef: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                tableLoading: false,
                // 当前来源
                source: '',
                sourceOptions: [],
                // 当前类型
                className: '',
                classOptions: [],
                productOptions: [],
                // 当前tableKey
                tableKey: '',
                // 筛选查询条件
                conditionDtoList: [],
                showLabelKey: 'oid',
                leftTableData: [],
                rightTableData: [],
                searchRightKey: '',
                // 分页
                pagination: {
                    pageSize: 20, // 每页多少条数据
                    pageIndex: 1, // 第几页
                    total: 1 // 总共有多少条数据
                },
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                i18nMappingObj: {
                    optionalObject: this.getI18nByKey('optionalObject'),
                    selectedObject: this.getI18nByKey('selectedObject'),
                    source: this.getI18nByKey('source'),
                    type: this.getI18nByKey('type'),
                    pleaseEnterSearch: this.getI18nByKey('pleaseEnterSearch'),
                    deleteAll: this.getI18nByKey('deleteAll'),
                    code: this.getI18nByKey('code'),
                    name: this.getI18nByKey('name'),
                    version: this.getI18nByKey('version'),
                    lifeCycle: this.getI18nByKey('lifeCycle'),
                    affiliatedProject: this.getI18nByKey('affiliatedProject'),
                    context: this.getI18nByKey('context'),
                    controls: this.getI18nByKey('controls'),
                    product: this.getI18nByKey('product')
                }
            };
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamBasicFilter: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamBasicFilter/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        watch: {
            source: {
                handler(val) {
                    let { sourceOptions } = this;
                    this.classOptions = sourceOptions
                        .find((item) => item.value === val)
                        ?.vo.map((item) => ({ ...item, label: item.displayName, value: item.key }));
                    this.tableKey = this.classOptions?.[0].tableKey;
                    this.className = this.classOptions?.[0].value;
                    // 查询表格数据
                    this.$refs['leftTable'] && this.$refs['leftTable'].fnRefreshTable();
                }
            },
            className: {
                handler(val) {
                    this.pagination.pageSize = 20;
                    this.pagination.pageIndex = 1;
                    this.tableKey = this.classOptions?.find((item) => item.key === val)?.tableKey;
                    // 查询表格数据
                    this.$refs['leftTable'] && this.$refs['leftTable'].fnRefreshTable();
                }
            }
        },
        computed: {
            defaultSelecteRow() {
                return this.selectedData[0]?.oid || '';
            },
            slotsField() {
                return [
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.cbb.doc.entity.EtDocument#identifierNo', // 编码
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.cbb.doc.entity.EtDocument#name', // 名称
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.cbb.doc.entity.EtDocument#version', // 版本
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status', // 生命周期
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.cbb.doc.entity.EtDocument#containerRef', // 所属项目
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            leftTableColumns() {
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: this.selectType,
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        attrName: 'erd.cloud.cbb.doc.entity.EtDocument#identifierNo',
                        label: this.i18nMappingObj.code,
                        width: 140
                    },
                    {
                        prop: 'name', // 交付件名称
                        attrName: 'erd.cloud.cbb.doc.entity.EtDocument#name',
                        label: this.i18nMappingObj.name
                    },
                    {
                        prop: 'version',
                        attrName: 'erd.cloud.cbb.doc.entity.EtDocument#version',
                        label: this.i18nMappingObj.version,
                        width: 50
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        attrName: 'erd.cloud.cbb.doc.entity.EtDocument#lifecycleStatus.status',
                        label: this.i18nMappingObj.lifeCycle,
                        width: 80
                    },
                    {
                        prop: 'containerRef',
                        attrName: 'erd.cloud.cbb.doc.entity.EtDocument#containerRef',
                        label: this.i18nMappingObj.affiliatedProject,
                        width: 80
                    }
                ];
            },
            rightTableColumns() {
                return [
                    {
                        prop: 'identifierNo',
                        title: this.i18nMappingObj.code,
                        width: 140
                    },
                    {
                        prop: 'name', // 交付件名称
                        title: this.i18nMappingObj.name
                    },
                    {
                        prop: 'version',
                        title: this.i18nMappingObj.version,
                        width: 80
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18nMappingObj.lifeCycle,
                        width: 80
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18nMappingObj.context,
                        width: 80
                    },
                    {
                        title: this.i18nMappingObj.controls,
                        prop: 'operation',
                        width: 50,
                        slots: {
                            default: 'operation'
                        }
                    }
                ];
            },
            rightTableVisibleData() {
                let { searchRightKey, rightTableData } = this;
                return rightTableData.filter((item) => {
                    let regexp = new RegExp(searchRightKey);
                    return regexp.test(item.name) || regexp.test(item.identifierNo);
                });
            },
            allColumnsList() {
                this.leftTableData?.forEach((leftRow) => {
                    let isSelected = this.rightTableData.some(
                        (rightRow) => leftRow[this.showLabelKey] === rightRow[this.showLabelKey]
                    );
                    leftRow.isSelected = isSelected; // 是否选中
                });
                return this.leftTableData;
            },
            viewTableConfig() {
                const _this = this;
                const {
                    source,
                    className,
                    tableKey,
                    conditionDtoList,
                    leftTableColumns,
                    rightTableData,
                    getObjectDisplayNames,
                    isAddContainerRef
                } = this;
                const { pageSize, pageIndex } = this.pagination;

                return {
                    firstLoad: true,
                    columns: leftTableColumns,
                    tableRequestConfig: {
                        url: '/ppm/view/table/page', // 表格数据接口
                        method: 'post',
                        isFormData: false, // 是否表单数据查询，如果是表单，则表格内不做任何参数处理，全部要外部表单传入内部无法处理
                        className,
                        data: {
                            className,
                            conditionDtoList: [
                                ...conditionDtoList,
                                {
                                    attrName: 'erd.cloud.cbb.doc.entity.EtDocument#appName',
                                    oper: 'EQ',
                                    value1: source
                                },
                                // 过滤知识库文档
                                {
                                    attrName: 'erd.cloud.cbb.doc.entity.EtDocument#containerRef',
                                    oper: 'NE',
                                    value1: 'OR:erd.cloud.foundation.core.container.entity.ScalableContainer:1793486205488635905'
                                }
                            ],
                            pageSize,
                            pageIndex,
                            tableKey,
                            deleteNoPermissionData: true
                        },
                        transformResponse: [
                            function (resp) {
                                const resData = resp && JSON.parse(resp);
                                // 处理数据格式
                                let fields = leftTableColumns.map((item) => item.prop);
                                const leftTableData = resData.data.records?.map((item) => {
                                    return {
                                        ...item,
                                        ...getObjectDisplayNames(item, fields),
                                        checked: !!rightTableData.find((rightData) => rightData.oid === item.oid)
                                    };
                                });
                                _this.$set(resData.data, 'records', leftTableData);
                                // this.rightTableData = this.leftTableData.filter((item) => item.oid === this.defaultSelecteRow);
                                // 更新分页数据
                                // this.pagination.pageIndex = data.pageIndex;
                                // this.pagination.pageSize = data.pageSize;
                                // this.pagination.total = Number(data.total);
                                this.tableLoading = false;
                                return resData;
                            }
                        ]
                    },
                    toolbarConfig: {
                        showConfigCol: false,
                        showMoreSearch: false,
                        showRefresh: false,
                        fuzzySearch: {
                            show: false
                        }
                    },
                    slotsField: this.slotsField,
                    pagination: {
                        // 分页
                        pageIndex: 1,
                        showPagination: false, // 是否显示分页
                        pageSize: 20
                    },
                    tableBaseConfig: {
                        'show-overflow': 'tooltip',
                        'row-config': { keyField: 'oid' },
                        'checkbox-config': { checkField: 'checked' },
                        'height': 'auto'
                    },
                    tableBaseEvent: {
                        'checkbox-change': this.onLeftSelectChange,
                        'checkbox-all': this.onLeftCkeckAll,
                        'radio-change': this.onLeftRadioChange
                    }
                };
            }
        },
        created() {
            // 查询并设置默认来源及类型
            this.fetchSourceAndType().then((resp) => {
                this.tableLoading = false;
                if (resp.code === '200')
                    this.sourceOptions =
                        resp.data.map((item) => ({ ...item, label: item.appName, value: item.appName })) || [];
                this.source = this.sourceOptions?.[0].value;
            });
        },
        methods: {
            // 左表格数据变化
            onLeftTableDataChange(data) {
                this.leftTableData = data;
            },
            // 左表格单选
            onLeftRadioChange({ newValue }) {
                newValue ? (this.rightTableData = [newValue]) : (this.rightTableData = []);
            },
            // 获取选择数据
            getSelected() {
                return {
                    source: this.source,
                    selectData: this.rightTableData || []
                };
            },
            // 查询并来源及类型
            fetchSourceAndType() {
                this.tableLoading = true;
                return this.$famHttp({
                    url: '/ppm/communal/pageSelectComponentData',
                    className: store.state.classNameMapping.project
                });
            },
            // 基础筛选
            onConditionChange(conditions) {
                this.conditionDtoList = conditions;
                this.$refs['leftTable'].fnRefreshTable();
            },
            // 左表格勾选触发
            onLeftSelectChange({ row, checked }) {
                if (checked) {
                    this.rightTableData.push(row);
                } else {
                    this.rightTableData = this.rightTableData.filter((item) => item.oid !== row.oid);
                }
            },
            // 左表格全选
            onLeftCkeckAll({ checked }) {
                if (checked) {
                    this.$refs['leftTable'].$refs['erdTable'].$table.getCheckboxRecords().forEach((item) => {
                        let isSelcted = !!this.$refs.rightTable.$table.getRowById(item.oid);
                        if (!isSelcted) this.rightTableData.push(item);
                    });
                } else {
                    this.rightTableData = this.rightTableData.filter((item) => {
                        return !this.$refs['leftTable'].$refs['erdTable'].$table.getRowById(item.oid);
                    });
                }
            },
            // 右表格 单个取消
            onRightClear(row) {
                this.rightTableData = this.rightTableData.filter((item) => item.oid !== row.oid);
                let $leftTable = this.$refs['leftTable'].$refs['erdTable'].$table;
                // 取消左表格对应勾选
                if (this.selectType === 'checkbox') {
                    $leftTable.setCheckboxRow(row, false);
                } else {
                    $leftTable.clearRadioRow();
                }
            },
            // 右表格 全取消
            onAllDelete() {
                this.rightTableData = [];
                let $leftTable = this.$refs['leftTable'].$refs['erdTable'].$table;
                // 取消左表格对应勾选
                if (this.selectType === 'checkbox') {
                    $leftTable.setAllCheckboxRow(false);
                } else {
                    $leftTable.clearRadioRow();
                }
            },
            /**
             * 提取对象的attrRawList中的对应字段值的显示名
             * @param {*} data
             * @param {*} fields
             * @returns
             */
            getObjectDisplayNames(data = {}, fields = []) {
                let result = {};

                data.attrRawList.forEach((attr) => {
                    let attrName = attr.attrName.split('#')?.[1];
                    if (!fields.includes(attrName)) return;
                    if (!data[attrName] || attrName === 'containerRef')
                        result[attrName] = attr.displayName || attr.value;
                });

                return result;
            }
        }
    };
});
