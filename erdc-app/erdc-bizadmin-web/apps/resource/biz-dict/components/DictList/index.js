/*
    类型基本信息配置
    先引用 kit组件
    BasicInforConfig: FamKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')), // 类型基本信息配置


    <basic-infor-config
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </basic-infor-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-dict/components/DictList/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'fam:http',
    'css!' + ELMP.resource('biz-dict/components/DictList/style.css')
], function (template, fieldTypeMapping) {
    const FamKit = require('erdcloud.kit');

    function getTreeArr(data) {
        let arr = [];
        const treeDataToArr = function (tableData = [], parentId = '-1', id = '', level = 0) {
            tableData.forEach((item) => {
                let levelClassName = 'el-table__row--level-';
                let currentId = id;
                currentId += item.id + '/';
                let currentLevel = level;
                item.level = level;
                item.offsetLeft = level * 16;
                item.trClassName = `${levelClassName}${level}`;
                currentLevel += 1;
                item.pbids = currentId?.substring(0, currentId.length - 1) || '';
                item.parentId = parentId;
                item.expanded = false;
                item.itemShow = false;
                // 标记树父节点
                item.needExpend = false;
                // 标记是否存在父级
                item.hasChildren = false;
                const childrenLen = (item.children && item.children.length) || 0;
                if (childrenLen) {
                    // 标记树父节点
                    item.needExpend = true;
                    // 标记是否存在父级
                    item.hasChildren = true;
                }
                let obj = {};
                Object.keys(item).forEach((key) => {
                    if (key !== 'children') {
                        obj[key] = item[key];
                    }
                });
                arr.push(obj);
                if (childrenLen) {
                    treeDataToArr(item.children, item.id, currentId, currentLevel);
                }
            });
        };
        treeDataToArr(data);
        return arr;
    }

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 数据字典数据
            data: {
                type: [Object],
                default: () => {
                    return {};
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            let self = this;
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-dict/components/DictList/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    deletedSuccessfully: this.getI18nByKey('删除成功'),
                    deleteDailed: this.getI18nByKey('删除失败'),
                    saveSuccessfully: this.getI18nByKey('保存成功'),
                    saveDailed: this.getI18nByKey('保存失败'),
                    itemName: this.getI18nByKey('项名称'),
                    createFirstLevel: this.getI18nByKey('创建一级'),
                    moveOtherNodes: this.getI18nByKey('移动至其他节点'),
                    name: this.getI18nByKey('名称'),
                    pleaseEnterName: this.getI18nByKey('请输入名称'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseEnterNumber: this.getI18nByKey('请输入数据值'),
                    describe: this.getI18nByKey('描述'),
                    pleaseEnterDescribe: this.getI18nByKey('请输入描述'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    pleaseSelectStatus: this.getI18nByKey('请选择状态'),
                    createdSameLevel: this.getI18nByKey('创建同级'),
                    createdChildLevel: this.getI18nByKey('创建子级'),
                    delete: this.getI18nByKey('删除'),
                    more: this.getI18nByKey('更多'),
                    moveUp: this.getI18nByKey('上移'),
                    movedown: this.getI18nByKey('下移'),
                    save: this.getI18nByKey('保存'),
                    reset: this.getI18nByKey('重置'),
                    number: this.getI18nByKey('数据值'),
                    status: this.getI18nByKey('状态'),
                    operation: this.getI18nByKey('操作'),
                    failedDetails: this.getI18nByKey('获取页面详情失败'),
                    whetherReset: this.getI18nByKey('是否重置'),
                    mobileNode: this.getI18nByKey('请选择移动的节点'),
                    draft: this.getI18nByKey('草稿'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用'),
                    numberCode: this.getI18nByKey('numberCode'),
                    codeTips: this.getI18nByKey('codeTips')
                },
                searchValue: '',
                tableData: [],
                lan: this.$store.state.i18n?.lang || 'zh_cn',
                defaultData: [], // 表格默认数据
                validRules: {
                    identifierNo: [
                        {
                            validator: function (rule, value, callback) {
                                const tileData = getTreeArr(JSON.parse(JSON.stringify(self.tableData)));
                                const numbers = tileData.map((item) => item.identifierNo);
                                if (numbers.indexOf(value) !== numbers.lastIndexOf(value)) {
                                    callback(false, new Error(self.i18nMappingObj.valueRepeat));
                                } else {
                                    callback(true);
                                }
                            }
                        }
                    ]
                },
                autoClear: false,
                popperClass: '',

                /***********************************/
                selectChangeArr: [], // 勾选的数据
                visible: false,
                isChanged: false,
                defaultList: undefined,
                watchFn: undefined,
                hasEditCell: true,
                isMoveToFirst: false,
                loading: false
            };
        },
        watch: {
            oid: function () {
                // 刷新列表
                this.getTableData();
                this.selectChangeArr = [];
                this.mountWatch();
            },
            tableData: {
                deep: true,
                handler: function (n) {
                    if (n) {
                        if (this.defaultList === undefined) {
                            this.defaultList = n;
                            this.watchFn = this.$watch('defaultList', {
                                handler: function () {
                                    this.isChanged = true;
                                },
                                deep: true
                            });
                        }
                    }
                }
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            title() {
                return this.data?.name || '';
            },
            treeSelectList() {
                let newTreeList = JSON.parse(JSON.stringify(this.tableData));
                const treeOidArr = this.selectChangeArr.map((item) => item.id);
                const newTree = (data) => {
                    for (let i = 0; i < data.length; i++) {
                        if (treeOidArr.includes(data[i].id)) {
                            data.splice(i, 1);
                            i--;
                        } else if (data[i].children && data[i].children.length) {
                            newTree(data[i].children);
                        }
                    }
                };
                newTree(newTreeList);
                return [
                    {
                        displayName: '移动至一级',
                        id: '-1',
                        children: newTreeList
                    }
                ];
            },
            column() {
                return [
                    // {
                    //     prop: 'sortOrder',
                    //     title: '',
                    //     minWidth: '48',
                    //     className: 'editIcon'
                    // },
                    {
                        minWidth: '40',
                        width: 48,
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'displayName',
                        required: true,
                        title: this.i18nMappingObj['name'],
                        minWidth: '200',
                        treeNode: true,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'identifierNo',
                        required: true,
                        title: this.i18nMappingObj['number'],
                        minWidth: '200',
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'statusName',
                        required: true,
                        title: this.i18nMappingObj['status'],
                        minWidth: '80',
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'code',
                        title: this.i18nMappingObj['numberCode'],
                        tips: this.i18nMappingObj['codeTips'],
                        minWidth: '200',
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'displayDesc',
                        title: this.i18nMappingObj['describe'],
                        minWidth: '200',
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'oper',
                        title: this.i18nMappingObj['operation'],
                        minWidth: '198',
                        fixed: 'right',
                        className: 'editIcon'
                    }
                ];
            },
            statusRow() {
                return {
                    componentName: 'constant-select', // 固定
                    referenceList: [
                        {
                            name: this.i18nMappingObj['draft'],
                            value: '0',
                            disabled: true
                        },
                        {
                            name: this.i18nMappingObj['enable'],
                            value: '1'
                        },
                        {
                            name: this.i18nMappingObj['disable'],
                            value: '2'
                        }
                    ]
                };
            },
            statusMap() {
                return {
                    0: this.i18nMappingObj['draft'],
                    1: this.i18nMappingObj['enable'],
                    2: this.i18nMappingObj['disable']
                };
            },
            isEdit() {
                return this.data?.edit ?? true;
            }
        },
        mounted() {
            setTimeout(() => {
                this.$nextTick(() => {
                    const $table = this.$refs['erdTable']?.$table;
                    $table?.setAllTreeExpand(true);
                    $table?.updateData();
                });
            }, 500);
        },
        methods: {
            /**
             * 自定义判断什么时候显示tooltip
             * @param {*} data
             * @returns
             */
            contentMethod(data) {
                const { row, cell, column, type } = data;
                if (type === 'header') {
                    for (let item of this.column) {
                        if (item.prop === column.field) {
                            if (item.toolTipsAble || item.tips || !column.title) {
                                return null;
                            }
                            return column.title;
                        }
                    }
                }
                if ($(cell).width()) {
                    if ($(cell).find('span').width() >= $(cell).width() - 32) {
                        return row?.[column.property] || null;
                    } else {
                        return '';
                    }
                }
            },
            // 重新获取状态，判断当前表格是否有修改
            mountWatch() {
                this.defaultList = undefined;
                // 切换
                if (_.isFunction(this.watchFn)) {
                    this.watchFn();
                    this.isChanged = false;
                }
            },
            // 初始化获取表格数据
            getTableData() {
                const itemName = this.data.identifierNo;
                this.$famHttp({
                    url: '/fam/dictionary/tree/' + itemName,
                    method: 'GET'
                }).then((resp) => {
                    const { data } = resp;
                    let newData = this.initData(data);
                    this.tableData = this.dataSortBy(newData);
                    this.defaultData = JSON.parse(JSON.stringify(newData));
                    this.refreshData();
                    this.mountWatch();
                });
            },
            // 初始化处理数据，用于生成前端的父子集关系
            initData(data, parentId) {
                data.forEach((item) => {
                    if (!parentId || +parentId === -1) {
                        item.parentId = '-1';
                    } else {
                        item.parentId = parentId;
                    }
                    this.$set(item, 'statusName', this.statusMap[item.status]);
                    if (item.children && item.children.length) {
                        this.initData(item.children, item.id);
                    }
                });
                return data;
            },
            // 表格单元格校验样式
            tableCellClassName({ row, column }) {
                let className = row[`editIcon-${row.id}-${column.property}`] ? 'editIcon' : '';

                if (
                    _.keys(this.validRules).includes(column.property) &&
                    !row[column.property] &&
                    row[`validerror-${row.id}-${column.property}`]
                ) {
                    className += ' erd-table-valid-error';
                }
                className += row.editFlag ? ' newEditFlag' : '';
                if (this.$refs.erdTable.$refs.xTable.isEditByRow(row) && row[`editCell-${column.property}`]) {
                    className += ' editCell';
                }
                return className;
            },
            /* 表格拖拽 start*/
            // 拖拽表格渲染行添加类名
            tableRowClassName({ row }) {
                const ids = `js-drag-id-${row.id} js-drag-parentId-${row.parentId ? row.parentId : ''}`;
                return `js-drag-class ${ids}`;
            },
            // 设置树形父级不可拖拽类名
            setFilterClass: function () {
                this.$nextTick(() => {
                    const $table = this.$refs['erdTable']?.$table;
                    const tbody = $($table?.$el).find('.vxe-table--render-wrapper .vxe-table--body tbody');
                    if (!tbody.length) return;
                    const treeBtn = tbody.find('.vxe-tree--btn-wrapper');
                    if (!treeBtn.length) return;
                    tbody.find('tr').each(function () {
                        let isThreeParent = $(this).find('td:eq(0) .vxe-tree--btn-wrapper').length;
                        if (isThreeParent) {
                            // $(this).addClass('filter-drag')
                        }
                    });
                });
            },
            /* 表格拖拽 end*/

            // 处理数据自定义前端排序
            dataSortBy(data, parentId, sortOrder) {
                data.forEach((item, index) => {
                    if (!item.children) {
                        item.children = [];
                    }
                    if (!parentId || parentId === item.id) {
                        item.sortOrder = `${index + 1}`;
                    } else {
                        item.sortOrder = `${sortOrder}.${index + 1}`;
                        item.parentIdPath = parentId;
                    }
                    if (item.children && item.children.length) {
                        this.dataSortBy(item.children, item.id, item.sortOrder);
                    }
                });
                return data;
            },
            // 构造树
            buildTree(data) {
                let treeList = [];
                let map = {};

                data.forEach((item) => {
                    if (!item.children) {
                        item.children = [];
                    }
                    map[item.id] = item;
                });

                data.forEach((item) => {
                    const parent = map[item.parentId];

                    if (parent && +parent !== -1) {
                        parent.children.push(item);
                    } else {
                        treeList.push(item);
                    }
                });

                return treeList;
            },
            // 重构父节点
            parentIdBuild(data, parentId) {
                data.forEach((item) => {
                    if (parentId && +parentId !== -1) {
                        item.parentId = parentId;
                        item.parentRef = 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:' + parentId;
                        if (item.children && item.children.length) {
                            this.parentIdBuild(item.children, item.id);
                        }
                    }
                });
            },
            // 创建一级
            onCreateFirstLevel() {
                // 随机生成一个id
                const randomId = FamKit.uuid();
                this.tableData.unshift({
                    appName: 'plat',
                    hasChild: false,
                    nameI18nJson: {
                        value: '',
                        zh_cn: '',
                        en_us: ''
                    },
                    children: [],
                    id: randomId,
                    parentId: '-1',
                    parentRef: 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:-1',
                    parentIdPath: '1564190678664589314',
                    descriptionI18nJson: {
                        value: '',
                        zh_cn: '',
                        en_us: ''
                    },
                    itemName: 'role_type',
                    sortOrder: '',
                    status: 0,
                    statusName: this.i18nMappingObj.draft,
                    nameKey: '',
                    displayName: '',
                    displayDesc: ''
                });
                this.$set(this.tableData[0], 'editFlag', true);
                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
                this.refreshTooltip();
            },
            // 创建同级
            onCreateSameLevel(data) {
                const { row, column } = data;

                const findParent = (basicData, parentId, id) => {
                    basicData.forEach((item, j) => {
                        if (item.id === parentId) {
                            let index = 0;
                            item.children.forEach((val, i) => {
                                if (val.id === id) {
                                    index = i;
                                }
                            });
                            // 随机生成一个id
                            const randomId =
                                Math.random() * (10000000000000000000 - 100000000000000000) + 100000000000000000;
                            item.children.splice(index + 1, 0, {
                                appName: 'plat',
                                hasChild: false,
                                children: [],
                                id: randomId,
                                parentId: parentId,
                                parentRef: 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:' + parentId,
                                nameI18nJson: {
                                    value: '',
                                    zh_cn: '',
                                    en_us: ''
                                },
                                parentIdPath: '1564190678664589314',
                                descriptionI18nJson: {
                                    value: '',
                                    zh_cn: '',
                                    en_us: ''
                                },
                                itemName: 'role_type',
                                sortOrder: '',
                                status: 0,
                                statusName: this.i18nMappingObj.draft,
                                nameKey: '',
                                displayName: '',
                                displayDesc: '',
                                editFlag: true
                            });
                            return;
                        } else if (+parentId === -1 && item.id === id) {
                            // 随机生成一个id
                            const randomId = FamKit.uuid();
                            basicData.splice(j + 1, 0, {
                                appName: 'plat',
                                hasChild: false,
                                children: [],
                                id: randomId,
                                parentId: parentId,
                                parentRef: 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:-1',
                                nameI18nJson: {
                                    value: '',
                                    zh_cn: '',
                                    en_us: ''
                                },
                                parentIdPath: '1564190678664589314',
                                descriptionI18nJson: {
                                    value: '',
                                    zh_cn: '',
                                    en_us: ''
                                },
                                itemName: 'role_type',
                                sortOrder: '',
                                status: 0,
                                statusName: this.i18nMappingObj.draft,
                                nameKey: '',
                                displayName: '',
                                displayDesc: '',
                                editFlag: true
                            });
                            return;
                        } else if (item.children && item.children.length) {
                            findParent(item.children, row.parentId, row.id);
                        }
                    });
                };
                findParent(this.tableData, row.parentId, row.id);
                this.$nextTick(() => {
                    this.tableData = this.dataSortBy(this.tableData);
                    this.refreshData();
                    this.refreshTooltip();
                });
            },
            // 创建子级
            onCreateChildLeveel(data) {
                const { row, column } = data;
                let newRow = {};
                const findChildList = (basicData, id) => {
                    basicData.forEach((item) => {
                        if (item.children === undefined) {
                            item.children = [];
                            this.isChanged = true;
                        }
                        if (item.id === id) {
                            // 随机生成一个id
                            const randomId = FamKit.uuid();
                            newRow = {
                                appName: 'plat',
                                hasChild: false,
                                children: [],
                                id: randomId,
                                parentId: id,
                                parentRef: 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:' + id,
                                nameI18nJson: {
                                    value: '',
                                    zh_cn: '',
                                    en_us: ''
                                },
                                parentIdPath: '1564190678664589314',
                                descriptionI18nJson: {
                                    value: '',
                                    zh_cn: '',
                                    en_us: ''
                                },
                                itemName: 'role_type' + randomId,
                                sortOrder: '',
                                status: 0,
                                statusName: this.i18nMappingObj.draft,
                                nameKey: '',
                                displayName: '',
                                displayDesc: '',
                                editFlag: true
                            };
                            item.children.splice(0, 0, newRow);
                        } else {
                            findChildList(item.children, id);
                        }
                    });
                };
                findChildList(this.tableData, row.id);
                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
                setTimeout(() => {
                    this.refreshTooltip();
                }, 200);
            },
            // 删除
            onDelete(data) {
                const { row, column } = data;

                this.$confirm(
                    `${this.i18nMappingObj['confirmDelete']}${row.displayName}?`,
                    this.i18nMappingObj['confirmDelete'],
                    {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }
                ).then(() => {
                    if (row.oid) {
                        this.$famHttp({
                            url: '/fam/delete',
                            params: {
                                oid: row.oid
                            },
                            method: 'DELETE'
                        })
                            .then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj['deletedSuccessfully'],
                                    showClose: true
                                });
                                this.getTableData();
                            })
                            .catch(({ data }) => {
                                // this.$message({
                                //     type: 'error',
                                //     message: data.message || this.i18nMappingObj['deleteDailed'],
                                //     showClose: true
                                // });
                            });
                    } else {
                        const findNode = function (basicData, id) {
                            basicData.forEach((item, index) => {
                                if (item.id === id) {
                                    basicData.splice(index, 1);
                                } else {
                                    if (item.children && item.children.length) {
                                        findNode(item.children, id);
                                    }
                                }
                            });
                        };
                        findNode(this.tableData, row.id);
                        this.tableData = this.dataSortBy(this.tableData);
                        this.refreshData();
                    }
                });
            },
            // 取消
            onCancle(data) {
                const { row, column } = data;

                const findNode = function (basicData, id) {
                    basicData.forEach((item, index) => {
                        if (item.id == id) {
                            basicData.splice(index, 1);
                        } else {
                            if (item.children && item.children.length) {
                                findNode(item.children, id);
                            }
                        }
                    });
                };
                findNode(this.tableData, row.id);
                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
            },
            i18nValueInput(value, data, property) {
                const { row, column } = data;
                const i18nMap = {
                    CN: 'zh_cn',
                    EN: 'en_us'
                };
                row[property] = value?.value;
                row[column.property] = value?.value?.[i18nMap[this.lan]] || value?.value?.value || '';
            },
            customCallback(value, data) {
                const { row, column } = data;
                this.$set(row, 'status', value);
                row[column.property] = this.statusMap[value];
            },
            inputCallback(value, data) {
                const { row, column } = data;
                this.$set(row, column.property, value.trim());
            },
            // 保存全部
            onSaveAll: _.debounce(function () {
                /**
                 * 递归处理接口数据
                 * @param {Array} basicData
                 * @returns
                 */
                const rawDataVoListFn = (basicData) => {
                    return basicData.reduce((data, item) => {
                        let attrRawList = [
                            {
                                attrName: 'itemRef',
                                value: this.data.key
                            },
                            {
                                attrName: 'itemName',
                                value: this.data.identifierNo
                            },
                            {
                                attrName: 'identifierNo',
                                value: item.identifierNo
                            },
                            {
                                attrName: 'systemConfig',
                                value: '1'
                            },
                            {
                                attrName: 'status',
                                value: item.status
                            },
                            {
                                attrName: 'sortOrder',
                                value: item.sortOrder
                            },
                            {
                                attrName: 'nameI18nJson',
                                value: item.nameI18nJson || {}
                            },
                            {
                                attrName: 'descriptionI18nJson',
                                value: item.descriptionI18nJson || {}
                            },
                            {
                                attrName: 'code',
                                value: item.code || ''
                            }
                        ];
                        if (item.parentRef.includes('-1')) {
                            attrRawList.push({
                                attrName: 'parentRef',
                                value: item.parentRef
                            });
                        }
                        let relationList = [];
                        if (item.children && item.children.length) {
                            relationList = rawDataVoListFn(item.children);
                        }
                        data.push({
                            action: item.oid ? 'UPDATE' : 'CREATE',
                            oid: item.oid,
                            appName: this.data.appName,
                            attrRawList,
                            relationList,
                            className: 'erd.cloud.foundation.core.dictionary.entity.DictionaryValue',
                            isDraft: true,
                            associationField: 'parentRef'
                        });
                        return data;
                    }, []);
                };
                this.$refs.erdTable
                    .validTable()
                    .then(() => {
                        const rawDataVoList = rawDataVoListFn(this.tableData);
                        const testData = {
                            className: 'erd.cloud.foundation.core.dictionary.entity.DictionaryValue',
                            rawDataVoList
                        };
                        this.postData(testData).then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj['saveSuccessfully'],
                                showClose: true
                            });
                            this.getTableData();
                        });
                    })
                    .catch(() => {
                        // console.log()
                    });
            }, 500),
            postData(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/fam/saveOrUpdate',
                    data,
                    method: 'post'
                }).finally(() => {
                    this.loading = false;
                });
            },
            // 重置
            onReset() {
                this.$confirm(this.i18nMappingObj['whetherReset'], this.i18nMappingObj['whetherReset'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.tableData = this.dataSortBy(JSON.parse(JSON.stringify(this.defaultData)));
                    this.refreshData();
                    this.isChanged = false;
                    this.mountWatch();
                });
            },
            // 刷新表格数据
            refreshData() {
                this.$nextTick(() => {
                    const $table = this.$refs['erdTable']?.$refs.xTable;
                    setTimeout(() => {
                        $table?.setAllTreeExpand(true);
                        $table?.updateData();
                    }, 0);
                });
            },
            // 刷新列表 tooltip 的位置
            refreshTooltip() {
                this.$nextTick(() => {
                    // 更新Tooltip位置
                    if (this.$refs.validateTooltips && this.$refs.validateTooltips.length) {
                        _.each(this.$refs.validateTooltips, (tooltip) => {
                            tooltip.updatePopper();
                        });
                    } else {
                        this.$refs?.validateTooltips?.updatePopper();
                    }
                });
            },
            // 升序
            upgrade(data) {
                // 寻找父级
                const findParent = (basicData, parentId, row) => {
                    basicData.forEach((item) => {
                        if (item.id === parentId || parentId == '-1') {
                            item.children.forEach((value, index) => {
                                if (value.id === row.id) {
                                    let newRow = item.children.splice(index, 1)[0];
                                    newRow.parentId = item.parentId;
                                    // 查找到当前的元素的父节点所在的位置，去重新处理节点
                                    basicData.push(newRow);
                                }
                            });
                        } else if (item.children && item.children.length) {
                            findParent(item.children, parentId, row);
                        }
                    });
                };
                findParent(this.tableData, data.row.parentId, data.row);
                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
            },
            // 降序
            sortDesc({ row }) {},
            checkboxAll(data) {
                let { checked } = data;
                const tableData = getTreeArr(JSON.parse(JSON.stringify(this.tableData)));
                if (checked) {
                    this.selectChangeArr = tableData;
                    this.checkFather(this.tableData);
                } else {
                    this.tableData.forEach((item) => {
                        this.traverse(item);
                    });
                    this.selectChangeArr = [];
                }
            },
            selectChangeEvent(data) {
                const { $table, row } = data;
                this.relationFather(row);
                if (!data.checked) {
                    this.traverse(row);
                } else {
                    this.checkFather([row]);
                }
                this.selectChangeArr = $table.getCheckboxRecords();
            },
            // 父节点取消
            traverse(obj) {
                if (obj.children) {
                    obj.checked = false;
                    obj.children.forEach((item) => {
                        this.traverse(item);
                    });
                } else {
                    obj.checked = false;
                }
            },
            // 父节点选择，子节点也要都选择上
            checkFather(data) {
                data.forEach((item) => {
                    if (item.children) {
                        this.checkFather(item.children);
                    }
                    item.checked = true;
                });
            },
            // 子节点选中，如果非全部子节点选中，则父节点为半选中状态
            relationFather(row) {
                var parent = this.$refs.erdTable.$refs.xTable.getParentRow(row);
                if (parent) {
                    if (!row.checked) {
                        parent.checked = false;
                        this.relationFather(parent);
                    }
                }
            },
            onMobileNode() {
                if (!this.selectChangeArr.length) {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj['mobileNode'],
                        showClose: true
                    });
                    return;
                }
                this.visible = true;
            },
            // 移动到其他节点
            onsubmit(data) {
                const newId = data[0].value || '';
                if (newId == '-1') {
                    this.onMobileFirst();
                    return;
                }
                const selectIds = this.selectChangeArr.map((item) => item.id);
                const newSelectArr = this.selectChangeArr.map((item) => {
                    delete item.children;
                    return item;
                });

                // 清除被移动的数据
                const buildData = function (data) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].children && data[i].children.length) {
                            buildData(data[i].children);
                        }
                        if (selectIds.includes(data[i].id)) {
                            data.splice(i, 1);
                            i--;
                        }
                    }
                };
                buildData(this.tableData);
                // 被移动的数据，重新构建树结构
                const newSelectTreeData = this.buildTree(newSelectArr);
                // 找到新的位置，将被移动的数据添加到目标位置
                const newTreeData = function (data) {
                    data.forEach((item) => {
                        if (item.id == newId) {
                            item.children = item.children ? item.children : [];
                            item.children.unshift(...newSelectTreeData);
                            return;
                        }
                        if (item.children && item.children.length) {
                            newTreeData(item.children);
                        }
                    });
                };

                newTreeData(this.tableData);

                this.tableData.forEach((item) => {
                    item.parentId = '-1';
                    item.parentRef = 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:-1';
                    if (item.children && item.children.length) {
                        this.parentIdBuild(item.children, item.id);
                    }
                });

                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
                this.refreshTooltip();
            },
            // 移动至一级
            onMobileFirst() {
                if (!this.selectChangeArr.length) {
                    this.$message({
                        type: 'warning',
                        message: '请选择移动的节点！',
                        showClose: true
                    });
                    return;
                }
                if (this.selectChangeArr.find((item) => item.parentId == -1)) {
                    this.$message({
                        type: 'warning',
                        message: '需要选中的节点中，存在第一层级的节点！',
                        showClose: true
                    });
                    return;
                }
                const selectIds = this.selectChangeArr.map((item) => item.id);
                const newSelectArr = this.selectChangeArr.map((item) => {
                    delete item.children;
                    return item;
                });
                // 清除被移动的数据
                const buildData = function (data) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].children && data[i].children.length) {
                            buildData(data[i].children);
                        }
                        if (selectIds.includes(data[i].id)) {
                            data.splice(i, 1);
                            i--;
                        }
                    }
                };
                buildData(this.tableData);
                // 被移动的数据，重新构建树结构
                const newSelectTreeData = this.buildTree(newSelectArr);
                this.tableData.unshift(...newSelectTreeData);
                this.tableData.forEach((item) => {
                    item.parentId = '-1';
                    item.parentRef = 'OR:erd.cloud.foundation.core.dictionary.entity.DictionaryValue:-1';
                    if (item.children && item.children.length) {
                        this.parentIdBuild(item.children, item.id);
                    }
                });
                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
                this.refreshTooltip();
            },
            onCommand(type, data) {
                if (type === 'delete') {
                    this.onDelete(data);
                }
                if (type === 'moveUp') {
                    this.onMoveUp(data);
                }
                if (type === 'moveDown') {
                    this.onMoveDown(data);
                }
            },
            // 上移
            onMoveUp(data) {
                const { row, column } = data;
                const parentId = row.parentId || '-1';

                if (parentId == '-1') {
                    this.tableData.forEach((item, index) => {
                        if (item.id == row.id) {
                            if (index != 0) {
                                const newRow = this.tableData.splice(index, 1)[0];
                                this.tableData.splice(index - 1, 0, newRow);
                            } else {
                                this.$message({
                                    type: 'warning',
                                    message: '当前位置不可上移'
                                });
                            }
                        }
                    });
                } else {
                    const findParent = (data, parentId) => {
                        data.forEach((res, i) => {
                            if (res.id == parentId) {
                                res.children.forEach((item, index) => {
                                    if (item.id == row.id) {
                                        if (index != 0) {
                                            const newRow = res.children.splice(index, 1)[0];
                                            res.children.splice(index - 1, 0, newRow);
                                        } else {
                                            this.$message({
                                                type: 'warning',
                                                message: '当前位置不可上移'
                                            });
                                        }
                                    }
                                });
                                return;
                            }

                            if (res.children && res.children.length) {
                                findParent(res.children, parentId);
                            }
                        });
                    };
                    findParent(this.tableData, parentId);
                }

                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
            },
            // 下移
            onMoveDown(data) {
                const { row, column } = data;
                const parentId = row.parentId || '-1';

                if (parentId == '-1') {
                    for (let i = 0; i < this.tableData.length; i++) {
                        if (this.tableData[i].id == row.id) {
                            if (i < this.tableData.length - 1) {
                                const newRow = this.tableData.splice(i, 1)[0];
                                this.tableData.splice(i + 1, 0, newRow);
                                break;
                            } else {
                                this.$message({
                                    type: 'warning',
                                    message: '当前位置不可下移'
                                });
                            }
                        }
                    }
                } else {
                    const findParent = (data, parentId) => {
                        data.forEach((res, i) => {
                            if (res.id == parentId) {
                                for (let i = 0; i < res.children.length; i++) {
                                    if (res.children[i].id == row.id) {
                                        if (i < res.children.length - 1) {
                                            const newRow = res.children.splice(i, 1)[0];
                                            res.children.splice(i + 1, 0, newRow);
                                            break;
                                        } else {
                                            this.$message({
                                                type: 'warning',
                                                message: '当前位置不可下移'
                                            });
                                        }
                                    }
                                }
                                return;
                            }

                            if (res.children && res.children.length) {
                                findParent(res.children, parentId);
                            }
                        });
                    };
                    findParent(this.tableData, parentId);
                }

                this.tableData = this.dataSortBy(this.tableData);
                this.refreshData();
            }
        },
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            // 移动到其他节点组件
            DictMobileNode: FamKit.asyncComponent(ELMP.resource('biz-dict/components/DictMobileNode/index.js'))
        }
    };
});
