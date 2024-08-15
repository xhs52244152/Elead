define([
    'erdc-kit',
    'text!' + ELMP.resource('system-menu/views/MenuManagement/index.html'),
    'css!' + ELMP.resource('system-menu/styles/index.css'),
    'fam:kit',
    'erdcloud.kit',
    'underscore'
], function (utils, template) {
    const FamKit = require('fam:kit');
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        // 组件
        components: {
            FamResizableContainer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamResizableContainer/index.js')
            ),
            FamTree: FamKit.asyncComponent(ELMP.resource('erdc-components/FamTree/index.js')),
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            // 人员选择
            FamMemberSelect: ErdcKit.asyncComponent(ELMP.resource('system-menu/components/FamMemberSelect/index.js')),
            // 创建菜单
            CreatMenu: ErdcKit.asyncComponent(ELMP.resource('system-menu/components/CreatMenu/index.js')),
            // 更新菜单
            UpdateMenu: ErdcKit.asyncComponent(ELMP.resource('system-menu/components/UpdateMenu/index.js')),
            FamInfoTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-menu/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    menuManagement: this.getI18nByKey('菜单管理'),
                    moreSubTitle: this.getI18nByKey('菜单最多配置到三级'),
                    createOneMenu: this.getI18nByKey('创建一级菜单'),
                    name: this.getI18nByKey('名称'),
                    code: this.getI18nByKey('编码'),
                    level: this.getI18nByKey('排序'),
                    href: this.getI18nByKey('链接'),
                    icon: this.getI18nByKey('图标'),
                    isShow: this.getI18nByKey('是否显示'),
                    appName: this.getI18nByKey('所属应用'),
                    operation: this.getI18nByKey('操作'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    wxts: this.getI18nByKey('温馨提示'),
                    submit: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    success_delect: this.getI18nByKey('删除菜单成功'),
                    sure_delect: this.getI18nByKey('确认删除'),
                    menu: this.getI18nByKey('菜单'),
                    failedDelect: this.getI18nByKey('删除菜单失败'),
                    createSubmenu: this.getI18nByKey('创建子菜单'),
                    remove: this.getI18nByKey('删除'),
                    edit: this.getI18nByKey('编辑'),
                    menuLimit: this.getI18nByKey('菜单权限'),
                    addPermissions: this.getI18nByKey('addPermissions'),
                    searchTips: this.getI18nByKey('searchTips'),
                    编辑菜单: this.getI18nByKey('编辑菜单')
                },
                // 搜索数据
                searchValue: '',
                // 表格数据
                tableData: [],
                tableDataClone: [],
                needSearchList: ['name', 'identifierNo'], //执行本地搜索需要的列
                visibleCreatMenu: false,
                visibleUpdateMenu: false,
                readonly: false,
                // 当前新增编辑操作的父级oid
                parentRefOid: '',
                // 当前编辑的oid
                eidtOid: '',
                // 当前所属父级的appName
                appName: '',
                // 当前编辑的id
                menuId: '',
                isShowMenu: false,
                lookMenu: false,
                menuName: '',
                menuLevel: 0,
                heightDiff: 196,
                addPowerType: '',
                actionConfig: {
                    name: 'RESOURCE_MANAGER_TABLE_ACTION'
                },
                treeData: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList'
                },
                defaultExpandedKeys: [],
                currentNodeKey: '',
                selectData: {},
                preSelectData: {}
            };
        },
        created: function () {
            this.getMicroapp();
        },
        mounted: function () {
            // do nothing
        },
        computed: {
            queryParams() {
                return {
                    data: {
                        appName: 'ALL',
                        isGetVirtualRole: true,
                        isGetVirtualGroup: true,
                        isDefault: false
                    }
                };
            },
            // 获取国际化 放置计算属性
            column: function () {
                return [
                    {
                        prop: 'checkbox',
                        type: 'checkbox',
                        minWidth: '38',
                        width: '38',
                        fixed: 'left'
                    },
                    {
                        prop: 'name', // 列数据字段key
                        title: this.i18nMappingObj.name, // 列头部标题
                        minWidth: '200', // 列宽度
                        width: '200',
                        fixed: 'left',
                        treeNode: true
                    },
                    {
                        prop: 'identifierNo', // 列数据字段key
                        title: this.i18nMappingObj.code, // 列头部标题
                        minWidth: '170', // 列宽度
                        width: '170'
                    },
                    {
                        prop: 'sort', // 列数据字段key
                        title: this.i18nMappingObj.level, // 列头部标题
                        minWidth: '100', // 列宽度
                        width: '100'
                    },
                    {
                        prop: 'href', // 列数据字段key
                        title: this.i18nMappingObj.href, // 列头部标题
                        minWidth: '', // 列宽度
                        width: ''
                    },
                    {
                        prop: 'icon', // 列数据字段key
                        title: this.i18nMappingObj.icon, // 列头部标题
                        minWidth: '80', // 列宽度
                        width: '80'
                    },
                    {
                        prop: 'isShow', // 列数据字段key
                        title: this.i18nMappingObj.isShow, // 列头部标题
                        minWidth: '100', // 列宽度
                        width: '100'
                    },
                    {
                        prop: 'appName', // 列数据字段key
                        title: this.i18nMappingObj.appName, // 列头部标题
                        minWidth: '100', // 列宽度
                        width: '100'
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: this.i18nMappingObj.operation, // 列头部标题
                        minWidth: '220', // 列宽度
                        width: window.LS.get('lang_current') === 'en_us' ? '100' : '72',
                        fixed: 'right'
                    }
                ];
            },
            tableConfig() {
                return {
                    border: true,
                    rowConfig: {
                        isCurrent: true,
                        isHover: true
                    },
                    columnConfig: {
                        resizable: true
                    },
                    align: 'left',
                    showOverflow: true,
                    treeConfig: {
                        reserve: true,
                        expandAll: true,
                        children: 'children',
                        iconOpen: 'erd-iconfont erd-icon-arrow-down',
                        iconClose: 'erd-iconfont erd-icon-arrow-right'
                    }
                };
            }
        },
        watch: {
            searchValue(val) {
                if (!val) {
                    this.tableData = this.tableDataClone;
                } else {
                    const fuzzySearchColumns = _.chain(this.column)
                        .filter((col) => _.includes(this.needSearchList, col.prop))
                        .map('prop')
                        .compact()
                        .value();
                    this.tableData = FamKit.TreeUtil.filterTreeTable(ErdcKit.deepClone(this.tableDataClone), val, {
                        children: 'children',
                        attrs: fuzzySearchColumns
                    });
                }
            }
        },
        methods: {
            // 展开表格
            expandTable: function () {
                this.$nextTick(() => {
                    const $table = this.$refs['erdTable']?.$table;
                    $table?.setAllTreeExpand(true);
                    $table?.updateData();
                });
            },
            // 获取微应用列表
            getMicroapp() {
                this.$famHttp({
                    url: '/fam/resource/microapp'
                }).then((resp) => {
                    const { data } = resp;
                    this.treeData = data;
                    const firstData = data[0]?.childList?.[0];

                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.$refs['fam-tree']?.$refs.tree?.setCurrentKey(firstData?.oid);
                            this.onCheck(firstData);
                        });
                    }, 300);
                });
            },
            // 获取菜单数据
            getMenuList: function (data) {
                this.$famHttp({
                    url: '/fam/resource/tree',
                    data: {
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        ...data
                    }
                })
                    .then((res) => {
                        this.tableData = res.data || [];
                        this.tableDataClone = ErdcKit.deepClone(this.tableData);
                        this.expandTable();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },

            // 删除菜单数据
            deleteMenu: function () {
                this.$loading({ lock: true });
                this.$famHttp({
                    url: '/fam/delete',
                    method: 'DELETE',
                    params: {
                        className: 'erd.cloud.foundation.core.menu.entity.Resource',
                        oid: this.eidtOid || null
                    }
                })
                    .then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.success_delect
                        });
                        // 更新表格
                        this.getMenuList({
                            identifierNo: this.selectData?.identifierNo
                        });
                        // this.$confirm(this.i18nMappingObj.success_delect, this.i18nMappingObj.wxts, {
                        //     confirmButtonText: this.i18nMappingObj.submit,
                        //     showCancelButton : false,
                        //     type: 'success'
                        // }).then(res=>{
                        //     // 更新表格
                        //     this.getMenuList()
                        // }).catch(error=>{

                        // })
                    })
                    .catch((error) => {
                        console.error(error);
                        this.$message({
                            message: error?.data?.message || this.i18nMappingObj.failedDelect,
                            type: 'error'
                        });
                    })
                    .finally(() => {
                        this.$loading().close();
                    });
            },

            /**
             * 操作
             * type
             * 1-创建子菜单 一二级主菜单有 三级不可再创建
             * 2-编辑
             * 3-删除
             * **/
            getActionConfig(data) {
                return {
                    name: 'RESOURCE_MANAGER',
                    objectOid: data.oid
                };
            },
            onCommand: function (type, data, isReadonly) {
                this.parentRefOid = data?.row?.parentRef || '';
                this.eidtOid = data?.row?.oid || '';
                this.appName = data?.row?.appName || '';
                this.menuId = data?.row?.id || '';
                this.menuLevel = data?.level || 0;
                this.addPowerType = '';

                // 创建
                if (type?.name === 'RESOURCE_SUB_MENU') {
                    this.visibleCreatMenu = true;
                    this.isShowMenu = false;
                    this.lookMenu = false;
                    this.menuLevel = data ? 1 : 0;
                }
                // 编辑
                if (type?.name === 'RESOURCE_EDIT') {
                    this.isShowMenu = false;
                    this.visibleUpdateMenu = true;
                    this.menuName = data?.row?.name || '';
                    this.readonly = !!isReadonly;
                    this.lookMenu = !!isReadonly;
                }
                // 删除
                if (type?.name === 'RESOURCE_DELETE') {
                    if (_.isArray(data?.row?.children) && data?.row?.children.length) {
                        return this.$message.error('当前菜单下含有子菜单，需要先把子菜单删除才能删除');
                    }
                    this.isShowMenu = false;
                    this.$confirm(
                        `${this.i18nMappingObj.sure_delect}【${data?.row?.name || ''}】${this.i18nMappingObj.menu}?`,
                        this.i18nMappingObj.wxts,
                        {
                            confirmButtonText: this.i18nMappingObj.submit,
                            cancelButtonText: this.i18nMappingObj.cancel,
                            type: 'warning'
                        }
                    ).then(() => {
                        this.deleteMenu();
                    });
                }
                // 权限
                if (type?.name === 'RESOURCE_POWER') {
                    this.lookMenu = true;
                    this.menuName = data?.row?.name || '';
                    this.isShowMenu = true;
                    this.addPowerType = 'single';
                    this.visibleUpdateMenu = true;
                    this.readonly = !!isReadonly;
                }
            },
            configureMenuLimit() {
                const records = this.$refs['erdTable'].$table.getCheckboxRecords();
                this.eidtOid = this.getTargetAndParent(_.map(records, 'oid'), this.tableDataClone, 'children');
                if (!this.eidtOid.length) {
                    return this.$message.warning('请勾选需要配置权限的菜单');
                }
                this.menuName = records.map((item) => item.name).join(', ');
                this.lookMenu = false;
                this.isShowMenu = true;
                this.addPowerType = 'multiple';
                this.readonly = false;
                this.visibleUpdateMenu = true;
            },
            /**
             * 在树结构中获取目标及目标对象的所有父级
             * @param {Array} target 目标
             * @param {Object[]} tree 菜单树形数据源
             * @param {String} children 父子关联标识
             */
            getTargetAndParent(target = [], tree = [], children = 'children') {
                const targetLength = target.length;
                const treeLength = tree.length;
                if (!targetLength || !treeLength) {
                    return [];
                }
                let result = [];
                for (let i = 0; i < targetLength; i++) {
                    result = _.union(
                        result,
                        FamKit.TreeUtil.findPath(tree, {
                            childrenField: children,
                            target: { oid: target[i] },
                            isSome: true
                        })
                    );
                }
                return result;
            },
            actionClick(btn) {
                switch (btn.name) {
                    case 'RESOURCE_BATCH_ADD_POWER':
                        this.configureMenuLimit();
                        break;
                    case 'RESOURCE_CREATE_ONE_LEVEL':
                        this.onCommand({ name: 'RESOURCE_SUB_MENU' }, null);
                        break;

                    default:
                        break;
                }
            },
            onCheck(data, node) {
                this.selectData = data;
                if (node?.level !== 1) {
                    this.preSelectData = data;
                    this.getMenuList({
                        identifierNo: data?.identifierNo
                    });
                } else {
                    this.$refs?.['fam-tree']?.$refs.tree?.setCurrentKey(this.preSelectData?.oid);
                    this.$nextTick(() => {
                        this.$el.querySelector('.is-current[role="treeitem"]').focus();
                    });
                }
            },
            onSuccess() {
                this.getMenuList({
                    identifierNo: this.selectData?.identifierNo
                });
            }
        }
    };
});
