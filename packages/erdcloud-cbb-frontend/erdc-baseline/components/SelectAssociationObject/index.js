define([
    'text!' + ELMP.func('erdc-baseline/components/SelectAssociationObject/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineSelectAssociationObject',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            leftDisabled: {
                type: String,
                default: 'accessToView'
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                visible: false,
                viewTypes: [],
                viewType: '',
                childTypes: [],
                childType: '',
                leftTableData: [],
                rightTableData: [],
                // 添加基线时候,备份的rightTableData
                rightTableDataTemp: [],
                searchLeftKey: '',
                searchRightKey: '',
                pagination: {
                    currentPage: 1,
                    pageSize: 20,
                    total: 0
                }
            };
        },
        watch: {
            rightTableDataTempFilter: function () {
                this.$nextTick(() => {
                    this.$refs.rightTable.$refs.xTable.setAllCheckboxRow(true);
                });
            }
        },
        computed: {
            columnsForTransfer() {
                return [
                    {
                        type: 'checkbox',
                        prop: 'checkbox',
                        width: 40
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code,
                        minWidth: 150,
                        props: {
                            'show-overflow': 'title'
                        }
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name,
                        minWidth: 150,
                        props: {
                            'show-overflow': 'title'
                        }
                    },
                    {
                        prop: 'version',
                        title: this.i18n.version,
                        width: 100
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: this.i18n.lifecycleStatus,
                        minWidth: 150
                    },
                    {
                        prop: 'containerRef',
                        title: this.i18n.context,
                        minWidth: 250,
                        props: {
                            'show-overflow': 'title'
                        }
                    }
                ];
            },
            rightTableDataTempFilter() {
                if (this.searchRightKey) {
                    return this.rightTableDataTemp.filter((i) => i.name.indexOf(this.searchRightKey) > -1);
                } else {
                    return this.rightTableDataTemp;
                }
            }
        },
        methods: {
            open: function () {
                this.searchLeftKey = '';
                this.searchRightKey = '';
                this.visible = true;
                this.loadViewTypes().then((viewTypes) => {
                    this.viewTypes = viewTypes;
                    if (viewTypes && viewTypes.length) {
                        this.viewType = viewTypes[0].value;
                        this.viewTypeChange();
                    }
                });
            },
            viewTypeChange() {
                this.loadChildTypes().then(() => {
                    if (this.childTypes && this.childTypes.length > 0) {
                        this.childType = this.childTypes[0].typeName;
                        this.childTypeChange();
                    }
                });
            },
            loadViewTypes: function () {
                return Promise.resolve([
                    {
                        label: '文档',
                        value: 'erd.cloud.cbb.doc.entity.EtDocument'
                    },
                    {
                        label: '部件',
                        value: 'erd.cloud.pdm.part.entity.EtPart'
                    },
                    {
                        label: '模型',
                        value: 'erd.cloud.pdm.epm.entity.EpmDocument'
                    }
                ]);
            },
            loadChildTypes: function () {
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                    method: 'GET',
                    data: {
                        typeName: this.viewType
                    }
                }).then((res) => {
                    this.childTypes = res.data;
                });
            },
            // 二级类型切换
            childTypeChange() {
                this.pagination.currentPage = 1;
                this.loadLeftData();
            },
            handleSearchLeft() {
                this.loadLeftData();
            },
            loadLeftData() {
                let conditionDtoList = [
                    {
                        attrName: 'lifecycleStatus.status',
                        oper: 'NE',
                        value1: 'DRAFT'
                    }
                ];
                if (this.searchLeftKey) {
                    conditionDtoList.push({
                        attrName: 'name',
                        oper: 'LIKE',
                        value1: this.searchLeftKey,
                        logicalOperator: 'AND',
                        isCondition: true
                    });
                }
                return this.$famHttp({
                    url: '/fam/search',
                    method: 'post',
                    data: {
                        className: this.childType,
                        pageIndex: this.pagination.currentPage,
                        pageSize: this.pagination.pageSize,
                        conditionDtoList: conditionDtoList
                    }
                }).then((resp) => {
                    let {
                        data: { relationObjMap = {}, records = [] }
                    } = resp;
                    // records = _.filter(records || [], item => item?.accessToView); //不能过滤 有分页显示问题
                    this.leftTableData = records
                        .filter((item) => item)
                        .map((item) => {
                            return {
                                ...item,
                                ...ErdcKit.deserializeArray(item.attrRawList, {
                                    valueKey: 'displayName',
                                    isI18n: true
                                }),
                                createBy:
                                    relationObjMap[`OR:erd.cloud.foundation.principal.entity.User:${item.createBy}`]
                                        ?.displayName || item.createBy,
                                updateBy:
                                    relationObjMap[`OR:erd.cloud.foundation.principal.entity.User:${item.updateBy}`]
                                        ?.displayName || item.updateBy
                            };
                        });
                    this.pagination.currentPage = resp.data.pageIndex;
                    this.pagination.pageSize = resp.data.pageSize;
                    this.pagination.total = resp.data.total * 1;
                });
            },
            handleSelectionChangeLeft({ checked, row }) {
                if (checked) {
                    this.rightTableDataTemp.push(row);
                    this.$refs.rightTable.$refs.xTable.setCheckboxRow(row, true);
                } else {
                    let index = this.rightTableDataTemp.findIndex((i) => i.oid === row.oid);
                    this.rightTableDataTemp.splice(index, 1);
                }
            },
            handleSelectionChangeRight({ checked, row }) {
                if (!checked) {
                    let index = this.rightTableDataTemp.findIndex((i) => i.oid === row.oid);
                    this.rightTableDataTemp.splice(index, 1);
                    let unSelectedRow = this.leftTableData.find((i) => i.oid === row.oid);
                    if (unSelectedRow) {
                        this.$refs.leftTable.$refs.xTable.setCheckboxRow(unSelectedRow, false);
                    }
                }
            },
            handleSelectionAllChangeLeft({ checked }) {
                const records = this.$refs.leftTable.$refs.xTable.getCheckboxRecords();
                this.$refs.leftTable.$refs.xTable.setCheckboxRow(records, checked);
                if (checked) {
                    this.rightTableDataTemp = records;
                    this.$refs.rightTable.$refs.xTable.setCheckboxRow(records, checked);
                } else {
                    this.rightTableDataTemp = [];
                }
            },
            handleSelectionAllChangeRight({ checked }) {
                if (!checked) {
                    const list = this.leftTableData.filter(
                        (item) => this.rightTableDataTemp.findIndex((ritem) => ritem.oid === item.oid) >= 0
                    );
                    this.$refs.leftTable.$refs.xTable.setCheckboxRow(list, false);
                    this.rightTableDataTemp = [];
                }
            },
            reset() {
                this.rightTableDataTemp = [];
                this.$refs.leftTable.$refs.xTable.clearSelected();
                this.$refs.rightTable.$refs.xTable.clearSelected();
            },
            cancel() {
                this.$emit('cancel');
                this.reset();
                this.visible = false;
            },
            confirm() {
                this.$emit('done', this.rightTableDataTemp);
                this.reset();
                this.visible = false;
            }
        }
    };
});
