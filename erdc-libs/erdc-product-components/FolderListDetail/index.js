define([
    'text!' + ELMP.resource('erdc-product-components/FolderListDetail/index.html'),
    'erdcloud.i18n',
    'css!' + ELMP.resource('erdc-product-components/FolderListDetail/style.css')
], function (template, { currentLanguage }) {
    const FamKit = require('fam:kit');
    const store = require('fam:store');

    return {
        template,
        components: {
            // 基础表格
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FolderListConfig: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListConfig/index.js')), // 编辑子类型
            FolderListMove: FamKit.asyncComponent(ELMP.resource('erdc-product-components/FolderListMove/index.js')), // 编辑子类型
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FolderDetail: FamKit.asyncComponent(
                ELMP.resource('erdc-product-components/FolderListDetail/FolderDetail.js')
            )
        },
        props: {
            folderObject: {
                type: Object,
                default() {
                    return {};
                }
            },
            containerRef: String,
            // 面包屑
            breadLabel: String,
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            toolbarOperationType: {
                type: String,
                default: ''
            },
            rowOperationType: {
                type: String,
                default: ''
            },
            vm: {
                type: Object,
                default() {
                    return null;
                }
            },
            slotsField: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            changeTableConfig: Function,
            isAdaptiveHeight: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/FolderListDetail/locale/index.js'),
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    create: this.getI18nByKey('创建'),
                    tips: this.getI18nByKey('提示'),
                    moreAction: this.getI18nByKey('更多操作'),
                    description: this.getI18nByKey('描述'),
                    operation: this.getI18nByKey('操作'),
                    name: this.getI18nByKey('显示名称'),
                    innerName: this.getI18nByKey('内部名称'),
                    dataType: this.getI18nByKey('数据类型'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirm: this.getI18nByKey('确认'),
                    cancel: this.getI18nByKey('取消'),
                    mobileNode: this.getI18nByKey('请选择移动的节点'),
                    viewAttr: this.getI18nByKey('查看属性'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败'),
                    createFolder: this.getI18nByKey('创建文件夹'),
                    editFolder: this.getI18nByKey('编辑文件夹'),
                    createItemVersion: this.getI18nByKey('创建版本对象'),
                    createItem: this.getI18nByKey('创建普通对象'),
                    moveTo: this.getI18nByKey('移动到'),
                    moveFolder: this.getI18nByKey('请选择移动的对象文件'),
                    moveFailed: this.getI18nByKey('moveFailed'),
                    checkoutSuccessfully: this.getI18nByKey('检出成功'),
                    checkinSuccessfully: this.getI18nByKey('检入成功'),
                    reviseSuccessfully: this.getI18nByKey('修订成功'),
                    deleteBranchVersionSuccessfully: this.getI18nByKey('删除最大版本成功'),
                    deleteObjectVersionSuccessfully: this.getI18nByKey('删除对象成功'),
                    deleteLastVersionSuccessfully: this.getI18nByKey('删除最新版本成功')
                },
                treeHeight: '100%',
                is: '',
                dialogVisible: false,
                moveVisible: false,
                detailTitle: '属性列表',
                title: '',
                openType: 'create',
                formType: 'FOLDER_FORM',
                typeOid: '',
                rowData: {}, // 编辑时当前行数据
                rowPropertyMap: {},
                pagination: {
                    pageSize: 10, // 每页多少条数据
                    currentPage: 1, // 第几页
                    total: 0 // 总共有多少条数据
                },
                viewData: [],
                formPageData: [],
                categoryData: '',
                useComponentName: 'custom-select', // 组件名
                typeInfoData: {},
                tableHeight: '450',
                mainBtnList: [
                    {
                        label: '创建文件夹'
                    }
                ],
                formData: {
                    nameI18nJson: {
                        attrName: 'nameI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_us: '',
                            en_gb: ''
                        }
                    },
                    descriptionI18nJson: {
                        attrName: 'descriptionI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_us: '',
                            en_gb: ''
                        }
                    },
                    name: ''
                },
                columnHeader: [],
                listData: [],
                selectChangeArr: [], // 勾选的数据
                selectRadio: [], // 单选框数据
                queryId: '', // 表头queryId
                searchValue: '',
                isDisabled: false,
                typeAttrGlobal: false,
                actionConfig: {
                    name: 'MENU_MODEL_MANAGER',
                    // objectOid: 'OR:erd.cloud.foundation.core.menu.entity.MenuModule:1603635020008636417'
                    objectOid: this.oid
                },
                detailVisible: false,
                currentRow: {},
                containerOid: store.state.space?.context?.oid
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            columns() {
                let column = [];
                return [...column, ...this.columnHeader];
            },
            lan() {
                return currentLanguage();
            },
            viewTableConfig() {
                let formData = {
                    folderRef: this.oid
                };
                let tableConfig = {
                    oid: this.oid,
                    vm: this.vm,
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    dataKey: 'data.records',
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/folder/getFolderMemberPage', // 表格数据接口
                        data: formData, // 路径参数
                        // isFormData: true,
                        method: 'post' // 请求方法（默认get）
                    },
                    isDeserialize: true,
                    firstLoad: false, // 首次进入就加载数据（在钩子里面执行）
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
                    addOperationCol: true, // 是否添加操作列（该列需要自己写插槽，prop固定operation）
                    addCheckbox: true,
                    addSeq: true,
                    fieldLinkConfig: {
                        fieldLink: true, // 是否添加列超链接
                        fieldLinkName: 'name',
                        linkClick: (row) => {
                            // 超链接事件
                            this.handleRowLink(row);
                        }
                    },
                    toolbarConfig: {
                        valueKey: 'attrName',
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true, // 是否显示刷新表格，默认显示
                        moreOperateList: []
                    },
                    tableBaseEvent: {
                        // 基础表格的事件，参考vxe官方API(这里事件官方写什么名称就是什么，不能驼峰命名)
                        'checkbox-change': this.selectChangeEvent,
                        'checkbox-all': this.selectAllEvent
                    },
                    columns: this.columns,
                    slotsField: this.innerSlotsField
                };
                tableConfig.toolbarConfig = _.extend(tableConfig.toolbarConfig, {
                    actionConfig: {
                        name: this.toolbarOperationType || 'MENU_ACTION_FOLDER',
                        containerOid: this.containerOid
                    }
                });
                return _.isFunction(this.changeTableConfig) ? this.changeTableConfig(tableConfig) : tableConfig;
            },
            treeSelectList() {
                let newTreeList = JSON.parse(JSON.stringify(this.viewData));
                const treeOidArr = this.selectChangeArr.map((item) => item.id);

                const newTree = (data) => {
                    _.each(data, (item) => {
                        if (item.oid === this.oid) {
                            item.disabled = true;
                        }
                    });
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
                        displayName: '文件夹',
                        id: '-1',
                        children: newTreeList
                    }
                ];
            },
            pulldownList() {
                return [
                    {
                        label: '编辑',
                        actionName: 'edit',
                        disabled: false,
                        hide: false
                    },
                    // {
                    //     label: '移动',
                    //     actionName: 'move',
                    //     disabled: false,
                    //     hide: true
                    // },
                    {
                        label: '删除',
                        actionName: 'delete',
                        disabled: false,
                        hide: false
                    }
                ];
            },
            oid() {
                return this.folderObject?.oid || '';
            },
            innerSlotsField() {
                let slotsField = [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation', // 字段名
                        type: 'default' // 头部文本插槽
                    },
                    {
                        prop: 'displayName', // 字段名
                        type: 'default' // 头部文本插槽
                    },
                    {
                        prop: 'icon', // 字段名
                        type: 'default' // 头部文本插槽
                    },
                    {
                        prop: 'createBy',
                        type: 'default'
                    },
                    {
                        prop: 'updateBy',
                        type: 'default'
                    }
                ];
                return _.union(slotsField, this.slotsField);
            }
        },
        watch: {
            folderObject(folderObject) {
                if (folderObject?.oid) {
                    this.actionConfig.objectOid = folderObject?.oid;
                    this.reloadTable();
                }
            },
            containerRef() {
                this.getTree();
            }
        },
        mounted() {
            if (this?.$store?.state?.app?.typeAttrGlobal) {
                this.typeAttrGlobal = true;
            }
            this.tableHeight = document.documentElement.clientHeight - 252;
            if (this.containerRef) this.getTree();
        },
        methods: {
            reloadTable() {
                this.getHead();
            },
            getActionConfig(row) {
                return {
                    name: this.rowOperationType || 'MENU_MODEL_MANAGER',
                    // objectOid: 'OR:erd.cloud.foundation.core.menu.entity.MenuModule:1603635020008636417'
                    objectOid: row.oid,
                    className: row.idKey
                };
            },
            getTree() {
                const paramData = {
                    className: this.$store.getters.className('subFolder'),
                    containerRef: this.containerRef
                };
                this.$famHttp({
                    url: '/fam/listAllTree',
                    data: paramData,
                    method: 'get'
                }).then((resp) => {
                    let { data } = resp;
                    this.viewData = data;
                });
            },
            // 获取表头
            getHead() {
                this.$famHttp({
                    url: '/fam/table/head',
                    method: 'post',
                    data: {
                        pageIndex: 1,
                        pageSize: 20,
                        attrNames: [],
                        className: this.$store.getters.className('subFolder')
                    }
                }).then((res) => {
                    this.queryId = res?.data?.queryId;
                    let headers = res?.data?.headers;
                    let arr = [];
                    _.each(headers, (item) => {
                        arr.push({
                            attrName: item.attrName,
                            label: item.label
                        });
                    });
                    arr.unshift({
                        attrName: 'icon',
                        label: '',
                        width: 40,
                        align: 'center'
                    });
                    this.columnHeader = arr;
                    this.$nextTick(() => {
                        this.$refs['famAdvancedTable']?.fnRefreshTable();
                    });
                });
            },
            // 搜索
            search: _.debounce(function (val) {
                let [...arr] = this.formPageData;
                this.filterColumns(val, arr);
            }, 300),
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.formPageData;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                data.forEach((e) => {
                    let { displayName, attrName } = e;
                    if (displayName.includes(res) || attrName.includes(res)) {
                        if (searchData.indexOf(e) === -1) {
                            searchData.push(e);
                        }
                    }
                });

                this.viewData = searchData;
            },
            /**
             * checkbox
             * 复选框
             * @checkbox-all="selectAllEvent"
             @checkbox-change="selectChangeEvent"
             * **/
            selectAllEvent(data) {
                const records = data?.$table.getCheckboxRecords();
                this.selectChangeArr = records || [];
            },
            selectChangeEvent(data) {
                const records = data?.$table.getCheckboxRecords();
                this.selectChangeArr = records || [];
            },
            selectRadioChange(data) {
                this.selectRadio = data.row;
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
                    if (item.children && item.children.length) {
                        this.checkFather(item.children);
                    }
                    item.checked = true;
                });
            },
            // 子节点选中，如果非全部子节点选中，则父节点为半选中状态
            relationFather(row) {
                var parent = this.$refs.FamAdvancedTable.$refs.xTable.getParentRow(row);
                if (parent) {
                    if (!row.checked) {
                        parent.checked = false;
                        this.relationFather(parent);
                    }
                }
            },
            visibleChange() {
                // do nothing
            },
            onCommand(command, data) {
                switch (command.name) {
                    case 'MENU_MODULE_FOLDER_EDIT':
                        this.onEdit(data);
                        break;
                    case 'move':
                        this.onMove(data);
                        break;
                    case 'MENU_MODULE_FOLDER_DELETE':
                        this.onDelete(data);
                        break;
                    // 检出
                    case 'DEMO_FOLDER_VERSION_CHECKOUT':
                        this.onCheckout(data);
                        break;
                    // 检入
                    case 'DEMO_FOLDER_VERSION_CHECKIN':
                        this.onCheckin(data);
                        break;
                    // 修订
                    case 'DEMO_FOLDER_VERSION_REVISE':
                        this.onRevise(data);
                        break;
                    // 删除最大版本
                    case 'DEMO_FOLDER_VERSION_DEL_BRANCH':
                        this.onDeleteBranchVersion(data);
                        break;
                    // 删除对象
                    case 'DEMO_FOLDER_VERSION_DEL_OBJECT':
                        this.onDeleteVersionObj(data);
                        break;
                    // 删除最新版本
                    case 'DEMO_FOLDER_VERSION_DEL_LAST':
                        this.onDeleteLastVersion(data);
                        break;
                    default:
                }
            },
            // 创建文件夹
            onCreate() {
                this.rowData = {};
                this.title = this.i18nMappingObj.createFolder;
                this.dialogVisible = true;
                this.formType = 'FOLDER_FORM';
                this.openType = 'create';
                this.is = 'FolderListConfig';
            },
            // 创建项目版本
            onCreateItemVersion() {
                // 打开创建弹窗
                this.title = this.i18nMappingObj.createItemVersion;
                this.dialogVisible = true;
                this.formType = 'ITEM_VERSION_FORM';
                this.openType = 'createItemVersion';
                this.is = 'FolderListConfig';
            },
            // 创建普通对象
            onCreateItem() {
                // 打开创建弹窗
                this.title = this.i18nMappingObj.createItem;
                this.dialogVisible = true;
                this.formType = 'ITEM_FORM';
                this.openType = 'createItem';
                this.is = 'FolderListConfig';
            },
            onEdit(row) {
                this.rowData = row;
                this.title = this.i18nMappingObj.editFolder;
                this.dialogVisible = true;
                this.formType = 'FOLDER_FORM';
                this.openType = 'edit';
                this.is = 'FolderListConfig';
            },
            // 批量移动
            onMove() {
                // 先获取到表格的所有勾选数据，判断数量，有就通行，没有就报错
                const selectData = this.$refs['famAdvancedTable'].fnGetCurrentSelection();
                if (selectData.length) {
                    const folder = selectData.some(
                        (item) => item.typeName === 'erd.cloud.foundation.core.folder.entity.SubFolder'
                    );
                    if (folder) {
                        this.$message.warning(this.i18nMappingObj.moveFailed);
                    } else {
                        this.title = this.i18nMappingObj.moveTo;
                        this.rowData = selectData;
                        this.dialogVisible = true;
                        this.formType = 'FOLDER_MOVE_FORM';
                        this.openType = 'moveFolder';
                        this.is = 'FolderListMove';
                    }
                } else {
                    this.$message.warning(this.i18nMappingObj.moveFolder);
                }
            },
            onDetail(row) {
                this.rowData = row;
                this.title = this.i18nMappingObj.viewAttr;
                this.dialogVisible = true;
                this.openType = 'detail';
                this.is = 'FolderListConfig';
            },
            onDelete(row) {
                const data = {
                    oid: row.oid,
                    className: row.idKey
                };
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['tips'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: data,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteSuccessfully'],
                            showClose: true
                        });
                        this.$emit('refresh-tree', { oid: this.oid });
                    });
                });
            },

            // 检出
            onCheckout(data) {
                this.$famHttp({
                    url: '/fam/common/checkout',
                    className: data.idKey,
                    params: {
                        oid: data.oid,
                        note: ''
                    },
                    method: 'GET'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18nMappingObj['checkoutSuccessfully'],
                        showClose: true
                    });
                    this.$emit('refresh-tree', { oid: this.oid });
                });
            },
            // 检入
            onCheckin(data) {
                this.$famHttp({
                    url: `/example/common/checkin?oid=${data.oid}&note=''`,
                    method: 'PUT'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18nMappingObj['checkinSuccessfully'],
                        showClose: true
                    });
                    this.$emit('refresh-tree', { oid: this.oid });
                });
            },
            // 修订
            onRevise(data) {
                this.$famHttp({
                    url: `/example/common/revision?oid=${data.oid}&note=''`,
                    method: 'POST'
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: this.i18nMappingObj['reviseSuccessfully'],
                        showClose: true
                    });
                    this.$emit('refresh-tree', { oid: this.oid });
                });
            },
            // 删除最大版本
            onDeleteBranchVersion(data) {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['tips'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: `/example/delete?oid=${data.branchId}`,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteBranchVersionSuccessfully'],
                            showClose: true
                        });
                        this.$emit('refresh-tree', { oid: this.oid });
                    });
                });
            },
            // 删除对象
            onDeleteVersionObj(data) {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['tips'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: `/example/delete?oid=${data.masterRef}`,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteObjectVersionSuccessfully'],
                            showClose: true
                        });
                        this.$emit('refresh-tree', { oid: this.oid });
                    });
                });
            },
            // 删除最新版本
            onDeleteLastVersion(data) {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['tips'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: `/example/delete?oid=${data.oid}`,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteLastVersionSuccessfully'],
                            showClose: true
                        });
                        this.$emit('refresh-tree', { oid: this.oid });
                    });
                });
            },
            onSubmit(oid) {
                // this.getDetail();

                // if (this.openType == 'create') {
                this.$emit('refresh-tree', { oid });
                // this.$refs['famAdvancedTable'].fnRefreshTable();
                // this?.$parent?.$children[0].getListTree();
                // }
            },
            refresh(data) {
                this.$emit('refresh-tree', data);
            },
            actionClick(type) {
                const eventClick = {
                    // 创建版本对象
                    DEMO_FOLDER_ITEM_VERSION_CREATE: this.onCreateItemVersion,
                    // 创建文件夹
                    MENU_MODULE_FOLDER_CREATE: this.onCreate,
                    // 创建普通对象
                    DEMO_FOLDER_ITEM_CREATE: this.onCreateItem,
                    // 批量移动
                    DEMO_FOLDER_MOVE: this.onMove
                };
                eventClick[type.name] && eventClick[type.name]();
            },
            // 修改获取表格的数据,将后端属性名前添加前缀
            handlerData(tableData, callback) {
                tableData.forEach((item) => {
                    item.createBy = item?.createUser?.displayName;
                    item.updateBy = item?.updateUser?.displayName;
                    item.ownedByRef = item?.ownedByRef?.displayName;
                    Object.keys(item).forEach((ite) => {
                        item[`${item.idKey}#${ite}`] = item[ite];
                    });
                });
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        (value === '' || value === undefined || value === null) && (item[key] = '--');
                    });
                });
                if (this.$listeners?.['handler-data']) {
                    this.$emit('handler-data', tableData, callback);
                } else {
                    callback(tableData);
                }
            },
            handleRowLink(row) {
                if (row.idKey === this.$store.getters.className('subFolder')) {
                    this.$emit('switch-folder', row);
                } else {
                    this.currentRow = row;
                    this.detailVisible = true;
                }
            }
        }
    };
});
