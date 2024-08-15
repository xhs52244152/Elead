define([
    'text!' + ELMP.resource('erdc-cbb-components/InfoCompare/index.html'),
    ELMP.resource('erdc-cbb-components/InfoCompare/store.js'),
    'css!' + ELMP.resource('erdc-cbb-components/InfoCompare/index.css')
], function (template, store) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('infoCompare');

    return {
        name: 'InfoCompare',
        template,
        components: {
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            FamAssociationObject: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAssociationObject/index.js'))
        },
        beforeRouteEnter(to, from, next) {
            ErdcStore.registerModule('infoCompare', store);
            next();
        },
        props: {
            className: String,
            tableKey: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/InfoCompare/locale/index.js'),
                isOnlyDifferentChecked: false,
                gridOptions2: {
                    border: true,
                    showOverflow: false,
                    height: document.documentElement.clientHeight - 89,
                    showHeader: false,
                    columns: [],
                    data: [],
                    scrollY: {
                        enabled: true
                    },
                    scrollX: {
                        enabled: true
                    }
                },
                data: null,
                checkAll: true,
                isCheckIdList: [], // 选中的
                isIndeterminate: false,
                checkboxLists: [],
                keys: 'identifierNo',
                // 增加对象
                objectForm: {
                    visible: false,
                    title: '',
                    viewTypesList: (viewTypesList) => {
                        viewTypesList.push({
                            label: this.i18n['基线'],
                            className: 'erd.cloud.cbb.baseline.entity.Baseline',
                            tableKey: 'BaselineView'
                        });
                        return _.filter(viewTypesList, (item) => this.innerClassName === item.className);
                    },
                    leftTableColumns: this.leftTableColumns,
                    excluded: []
                },
                loading: false
            };
        },
        computed: {
            ...mapGetters(['getCompareDataList']),
            tableData() {
                return this.getCompareDataList(this.innerClassName) || [];
            },
            innerClassName() {
                return this.className || this.$route.query?.className || '';
            },
            innerTableKey() {
                return this.tableKey || this.$route.query?.tableKey || '';
            },
            // 增加对象列头配置
            leftTableColumns() {
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        title: '编码',
                        width: 140
                    },
                    {
                        prop: 'name',
                        title: '名称',
                        width: 200
                    },
                    {
                        prop: 'typeReference',
                        title: '类型'
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: '状态'
                    }
                ];
            },
            appName() {
                return this.$route.meta.appName || 'PDM';
            }
        },
        watch: {
            tableData: {
                immediate: true,
                handler: function (nv) {
                    this.objectForm.excluded = _.map(nv, `${this.innerClassName}#identifierNo`);
                }
            }
        },
        mounted() {
            //初始化管理比较项
            this.initOptions().then((res) => {
                this.checkboxLists = res?.data || [];
                this.isCheckIdList = res.data.map((item) => item[this.keys]); //默认全选
                this.initData();
            });
        },
        methods: {
            initData() {
                let _this = this;
                //上一个请求没有结束不允许请求
                if (this.loading) return false;
                this.loading = true;
                this.$famHttp({
                    url: `/fam/compare`,
                    data: {
                        isOnlyDifferent: this.isOnlyDifferentChecked,
                        oids: _.map(this.tableData, 'oid') || [], //取仓库存的oids
                        optionList: this.isCheckIdList //全选传空数组表示全部
                    },
                    className: this.innerClassName,
                    method: 'POST'
                })
                    .then((res) => {
                        this.data = res?.data;
                        let dataKeys = this.handleKeysSort();
                        let myColumns = this.handleColumns();

                        let mydData = [];
                        dataKeys.map((key) => {
                            let objTmp = {};
                            let options = this.data[key];
                            objTmp['col0'] = options.name;
                            if (options.isSimple) {
                                //只添加第一个对象的值，用于作比较
                                objTmp[`col1`] = _this.i18n['未发现区别'];
                                mydData.push(objTmp);
                            } else {
                                //比较项是数组，其他模块是对象
                                if (options.value.constructor === Array) {
                                    //如果是执行项，第一项为空，第二项为名称
                                    if (key == 'objects') {
                                        objTmp = { col0: '', col1: options.name };
                                        options.value.forEach((val, index) => {
                                            objTmp[`col${index + 2}`] = val['caption'];
                                        });
                                        mydData.push(objTmp);
                                    }
                                } else if (options.value.constructor === Object) {
                                    //属性要单独处理key
                                    if (key == 'attributeMap') {
                                        for (let key1 in options.value) {
                                            let attrObj = this.handleAttrName(key1);
                                            objTmp['col1'] = attrObj.attributeMapkeyfieldDisplayName;
                                            //属性-有值
                                            if (options.value[key1].length) {
                                                _.each(options.value[key1], function (item, index) {
                                                    objTmp[`col${index + 2}`] = item || '--';
                                                });
                                            } else {
                                                //属性-没有值 杠杆表示
                                                this.handleEmptyData(objTmp, myColumns);
                                            }
                                            mydData.push(ErdcKit.deepClone(objTmp));
                                        }
                                    } else {
                                        //其他动态模块
                                        ['true', 'false'].forEach((key) => {
                                            //仅显示不同时不用显示相同的选项
                                            if (key == 'true' && !this.isOnlyDifferentChecked) {
                                                objTmp['col1'] = _this.i18n['相同'];
                                                //取true里面的值
                                                let resultData = options.value[key];
                                                //处理数据结果
                                                this.handleResultData(mydData, resultData, objTmp, myColumns);
                                            } else if (key == 'false') {
                                                objTmp['col1'] = _this.i18n['不相同'];
                                                //取false里面的值
                                                let resultData = options.value[key];
                                                //处理数据结果
                                                this.handleResultData(mydData, resultData, objTmp, myColumns);
                                            }
                                        });
                                    }
                                }
                            }
                        });

                        this.gridOptions2.data = mydData;
                        this.gridOptions2.columns = myColumns;
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            //处理动态模块的数据
            handleResultData(mydData, resultData, objTmp, myColumns) {
                //如果false的值是空就结束
                if (_.isEmpty(resultData)) {
                    //把前一个objTmp清空
                    this.handleEmptyData(objTmp, myColumns);
                    mydData.push(ErdcKit.deepClone(objTmp));
                    return false;
                }

                resultData?.forEach((list) => {
                    list.forEach((data, index) => {
                        if (data) {
                            objTmp[`col${index + 2}`] = data?.caption || '--';
                        } else {
                            objTmp[`col${index + 2}`] = '--';
                        }
                    });
                    mydData.push(ErdcKit.deepClone(objTmp));
                });
            },
            //处理空数据，杠杆表示
            handleEmptyData(objTmp, myColumns) {
                myColumns.forEach((item, index) => {
                    if (index > 1) {
                        objTmp[`col${index}`] = '--';
                    }
                });
            },
            //处理属性的key,切割名称
            handleAttrName(key1) {
                let attributeMapkey = key1.split('(')[1];
                attributeMapkey = attributeMapkey.split(')')[0];
                attributeMapkey = attributeMapkey.split(',');
                let attributeMapkeyfieldDisplayName = attributeMapkey[1].split('=')[1];
                return {
                    attributeMapkeyfieldDisplayName
                };
            },
            //处理标题有几列
            handleColumns() {
                let myColumns = [
                    {
                        field: 'col0',
                        fixed: 'left',
                        width: 150
                    },
                    {
                        field: 'col1',
                        width: 100,
                        fixed: 'left'
                    }
                ];
                this.data?.objects.value?.forEach((val, index) => {
                    myColumns.push({ field: `col${index + 2}`, minWidth: 200 });
                });

                return myColumns;
            },
            initOptions() {
                return this.$famHttp({
                    url: '/fam/options',
                    data: {
                        className: this.innerClassName
                    },
                    method: 'GET'
                });
            },
            //处理数据的排序，执行项、属性排在前面
            handleKeysSort() {
                let dataKeys = Object.keys(this.data);
                for (let i = 0; i < dataKeys.length; i++) {
                    if (dataKeys[i] == 'objects' && i !== 0) {
                        let tmpValue = dataKeys[0];
                        dataKeys[0] = dataKeys[i];
                        dataKeys[i] = tmpValue;
                    } else if (dataKeys[i] == 'attributeMap' && i !== 0) {
                        let tmpValue = dataKeys[1];
                        dataKeys[1] = dataKeys[i];
                        dataKeys[i] = tmpValue;
                    }
                }
                return dataKeys;
            },
            // 通用行合并函数（将相同多列数据合并为一行）
            rowspanMethod({ row, _rowIndex, column, visibleData }) {
                const fields = ['col1', 'col0'];
                const cellValue = row[column.property];
                if (cellValue && fields.includes(column.property)) {
                    const prevRow = visibleData[_rowIndex - 1];
                    let nextRow = visibleData[_rowIndex + 1];
                    if (prevRow && prevRow[column.property] === cellValue && row['col0'] == prevRow['col0']) {
                        if (cellValue == this.i18n['未发现区别']) {
                            return { rowspan: 1, colspan: this.gridOptions2.columns.length - 1 };
                        }
                        return { rowspan: 0, colspan: 0 };
                    } else {
                        let countRowspan = 1;
                        let countColspan = 1;
                        //不同模块的不相同要分开展示，不需要合并
                        while (nextRow && nextRow[column.property] === cellValue && row['col0'] == nextRow['col0']) {
                            nextRow = visibleData[++countRowspan + _rowIndex];
                        }

                        if (row['col0'] !== '属性') {
                            // let splitProperty = column.property.split('l');
                            // let currentIndex = Number(splitProperty[1]);
                            // let nextCol = row[`col${currentIndex + 1}`];
                            if (column.property == `col1` && row[column.property] == this.i18n['未发现区别']) {
                                //未发现区别列，只展示一列
                                countColspan = this.gridOptions2.columns.length - 1;
                                countRowspan = 1;
                            }
                        }
                        if (countRowspan > 1 || countColspan > 1) {
                            return { rowspan: countRowspan, colspan: countColspan };
                        }
                    }
                } else {
                    // const prevRow = visibleData[_rowIndex - 1];
                    // let nextRow = visibleData[_rowIndex + 1];
                    let splitProperty = column.property.split('l');
                    let currentIndex = Number(splitProperty[1]);
                    //相同行:从第三行开始，后面的节点隐藏掉
                    //未发现区别行:从第二行开始，后面的节点隐藏掉
                    if (
                        (currentIndex >= 3 && row[`col1`] == this.i18n['相同']) ||
                        (currentIndex >= 2 && row[`col1`] == this.i18n['未发现区别'])
                    ) {
                        return { rowspan: 0, colspan: 0 };
                    } else if (row['col0'] !== '属性') {
                        let countColspan = 1;
                        if (row[`col${currentIndex - 1}`] == this.i18n['相同']) {
                            //相同 合并第三列后面的所有项
                            countColspan = this.gridOptions2.columns.length - 2;
                        }
                        if (countColspan > 1) {
                            return { rowspan: 1, colspan: countColspan };
                        }
                    }
                }
            },
            // 点击全选
            handleCheckAllChange(val) {
                let { keys, checkboxLists } = this;
                let idList = checkboxLists.map((x) => x[keys]);
                this.isCheckIdList = val ? idList : [];
                this.isIndeterminate = false;
                this.initData();
            },
            // 点击 某一项
            handleCheckedChange(value) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === this.checkboxLists.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < this.checkboxLists.length;
                this.initData();
            },
            handleOnlyDifferent() {
                this.initData();
            },
            cellStyle({ row, column }) {
                let styleObject = {
                    fontWeight: '700',
                    color: '#333',
                    backgroundColor: '#f9fbfd'
                };
                if ((row.col0 == '' && column.colSpan == 1) || column.field == 'col0') {
                    return styleObject;
                }
                if (column.field == 'col1') {
                    if (row['col1'] == this.i18n['未发现区别']) {
                        return {
                            textAlign: 'center'
                        };
                    } else {
                        return styleObject;
                    }
                }
            },
            // 增加对象提交前处理
            beforeSubmit(data, next) {
                if (!_.isArray(data) || (_.isArray(data) && !data.length)) {
                    return next();
                }
                if (this.tableData.length + data.length > 10) {
                    return this.$message.warning(this.i18n['不能超过10条']);
                }
                let tableData = ErdcKit.deepClone(this.tableData) || [];
                tableData = _.chain(tableData).union(data).uniq('oid').value();
                this.$store.commit('infoCompare/SET_INFO_COMPARE', {
                    className: this.innerClassName || '',
                    infoCompare: tableData || []
                });
                this.$message.success(this.i18n['增加对象成功']);
                _.isFunction(next) && next();
                this.$nextTick(() => {
                    this.initData();
                });
            },
            handleAddObject() {
                this.objectForm.visible = true;
                this.objectForm.title = this.i18n['增加比较对象'];
            },
            handleReturn() {
                this.$router.go(-1);
            }
        }
    };
});
