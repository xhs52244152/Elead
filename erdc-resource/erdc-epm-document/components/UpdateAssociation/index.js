define([
    'text!' + ELMP.func('erdc-epm-document/components/UpdateAssociation/index.html'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    'css!' + ELMP.func('erdc-epm-document/components/UpdateAssociation/index.css')
], function (template, viewCfg) {
    const ErdcKit = require('erdc-kit');
    const partClassName = 'erd.cloud.pdm.part.entity.EtPart';

    return {
        name: 'UpdateAssociation',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            rowData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            inTable: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-epm-document/locale/index.js'),
                loading: false,
                visible: true,
                treeOnlyKey: '_id',
                typeList: [],
                showDialog: false,
                cloneTableData: [],
                tableMaxHeight: 300
            };
        },
        computed: {
            className() {
                return viewCfg.epmDocumentViewTableMap?.className;
            },
            tableData() {
                return this.$refs.famAdvancedTable.tableData;
            },
            pageTitle() {
                return this.inTable
                    ? `${this.rowData[`${this.className}#typeReference`]}-${this.rowData[`${this.className}#identifierNo`]
                    },${this.rowData[`${this.className}#name`]},${this.rowData[`${this.className}#version`]}`
                    : `${this.rowData.typeReference}-${this.rowData.identifierNo},${this.rowData.name},${this.rowData.version}`;
            },
            pageIcon() {
                return this.inTable ? this.rowData[`${this.className}#icon`] : this.rowData.icon;
            },
            viewTypes() {
                return [
                    {
                        label: this.i18n['部件'],
                        className: partClassName,
                        tableKey: 'EpmChoosePartView'
                    }
                ];
            },
            associationCfg() {
                return {
                    title: this.i18n['增加对象'],
                    viewTypesList: this.viewTypes
                };
            },

            viewTableConfig() {
                const _this = this;
                return {
                    tableMaxHeight: 450,
                    vm: _this,
                    customColums: [
                        {
                            index: 2,
                            col: {
                                prop: 'icon',
                                title: ' ',
                                width: 40,
                                extraCol: true,
                                align: 'center'
                            }
                        }
                    ],
                    columns: [
                        {
                            attrName: 'identifierNo',
                            label: this.i18n['编码'],
                            treeNode: true,
                            width: 142
                        },
                        {
                            attrName: 'name',
                            label: this.i18n['名称'],
                            width: 155
                        },
                        {
                            attrName: 'version',
                            label: this.i18n['版本']
                        },
                        {
                            attrName: 'buildType',
                            label: this.i18n['关联类型'],
                            width: 135
                        },
                        {
                            attrName: 'lifecycleStatus.status',
                            label: this.i18n['生命周期状态'],
                            width: 102
                        },
                        {
                            attrName: 'containerRef',
                            label: this.i18n['上下文'],
                            width: 92
                        },
                        {
                            attrName: 'ownedByRef',
                            label: this.i18n['所有者'],
                            width: 129
                        },
                        {
                            attrName: 'securityLabel',
                            label: this.i18n['密级'],
                            width: 72
                        },
                        {
                            attrName: 'folderRef',
                            label: this.i18n['文件夹'],
                            width: 88
                        },
                        {
                            attrName: 'createBy',
                            label: this.i18n['创建者'],
                            width: 136
                        },
                        {
                            attrName: 'updateBy',
                            label: this.i18n['修改者'],
                            width: 136
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18n['创建时间'],
                            width: 163
                        },
                        {
                            attrName: 'updateTime',
                            label: this.i18n['更新时间'],
                            width: 157
                        }
                    ],
                    firstLoad: true,
                    tableBaseConfig: {
                        'maxLine': 20,
                        'min-height': 200,
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        'rowConfig': {
                            isCurrent: true,
                            isHover: true,
                            keyField: this.treeOnlyKey
                        },
                        'columnConfig': {
                            resizable: true // 是否允许调整列宽
                        },
                        'showOverflow': true, // 溢出隐藏显示省略号
                        'treeNode': 'identifierNo', //必须设置树节点显示的位置
                        'treeConfig': {
                            reserve: true,
                            expandAll: true,
                            children: 'children',
                            iconOpen: 'erd-iconfont erd-icon-triangle-down',
                            iconClose: 'erd-iconfont erd-icon-triangle-right'
                        },
                        'checkbox-config': {
                            checkStrictly: true
                        }
                    },
                    tableData: [],
                    // 视图的高级表格配置，使用继承方式，参考高级表格用法
                    toolbarConfig: {
                        // 工具栏
                        valueKey: 'attrName',
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: true, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        customRefresh: true,
                        fuzzySearch: {
                            placeholder: '请输入关键词搜索',
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        // 基础筛选
                        basicFilter: {
                            show: false
                        },
                        actionConfig: {},
                        secondaryBtn: [
                            {
                                type: 'default',
                                class: '',
                                icon: '',
                                label: '关联现有部件',
                                onclick: () => {
                                    this.addReleation();
                                }
                            }
                        ]
                    },
                    pagination: {
                        showPagination: false // 是否显示分页
                    },
                    addSeq: true,
                    addCheckbox: true, // 是否添加复选框（勾选事件可参考vxe-table官网提供事件）
                    addOperationCol: false // 是否添加操作列（该列需要自己写插槽，prop固定operation）
                };
            }
        },
        async mounted() {
            await Promise.all([
                // 查关联类型可选值
                this.getTypeList(),
                // 表格数据处理成树结构
                this.initTableData()
            ]);
        },
        methods: {
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
            },
            async initTableData() {
                let tableRawData = await this.getTableRawData();
                this.$refs.famAdvancedTable.tableData = tableRawData.map((rowData) => {
                    let data = this.flattenTableRawData(rowData);
                    data[this.treeOnlyKey] = Date.now() * Math.random();
                    // 记录关联类型的值
                    data._buildTypeVal = String((rowData.buildType && rowData.buildType.value) || '');

                    if (rowData.children) {
                        data.children = rowData.children.map((childrenData) => {
                            let newChildrenData = this.flattenTableRawData(childrenData);
                            newChildrenData[this.treeOnlyKey] = Date.now() * Math.random();
                            // 记录关联类型的值
                            newChildrenData._buildTypeVal = String(
                                (childrenData.buildType && childrenData.buildType.value) || ''
                            );
                            return newChildrenData;
                        });
                    }
                    return data;
                });

                this.cloneTableData = this.tableData;

                // 初始化表格数据后设置所有数据展开
                this.$nextTick(() => {
                    this.$refs.famAdvancedTable.$refs.erdTable.$refs.xTable.setAllTreeExpand(true);
                });
            },
            getTableRawData() {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/buildRules',
                        params: {
                            epmBranchOid: this.rowData.branchVid || this.rowData.vid,
                            className: this.className
                        },
                        method: 'get'
                    }).then((resp) => {
                        if (resp.success) {
                            resolve(resp.data);
                        } else {
                            reject(resp.message);
                        }
                    });
                });
            },
            flattenTableRawData(data) {
                return ErdcKit.deserializeAttr(data, {
                    valueMap: {
                        'lifecycleStatus.status': ({ displayName }) => {
                            return displayName || '';
                        },
                        'containerRef': ({ displayName }) => {
                            return displayName || '';
                        },
                        'ownedByRef': ({ displayName }) => {
                            return displayName || '';
                        },
                        'securityLabel': ({ displayName }) => {
                            return displayName || '';
                        },
                        'folderRef': ({ displayName }) => {
                            return displayName || '';
                        },
                        'createBy': ({ displayName }) => {
                            return displayName || '';
                        },
                        'updateBy': ({ displayName }) => {
                            return displayName || '';
                        }
                    }
                });
            },
            getTypeList() {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/relationType',
                        params: {
                            className: this.className
                        },
                        method: 'get'
                    }).then((resp) => {
                        if (resp.success) {
                            this.typeList = resp.data;
                            resolve(resp.data);
                        } else {
                            reject(resp.message);
                        }
                    });
                });
            },

            // 关联现有部件
            addReleation() {
                let multipleSelection = this.$refs.famAdvancedTable?.fnGetCurrentSelection() || [];
                let onlyEpm = !multipleSelection.some((item) => item.oid.indexOf('EpmDocument') === -1);

                if (!multipleSelection.length || !onlyEpm || multipleSelection.length > 1) {
                    this.$message.warning(this.i18n['勾选一个模型']);
                    return false;
                }

                this.showDialog = true;
            },

            canShowBuildTypeList(buildType) {
                // 3: 计算的; 1: 无关联; 2: 被动关联;  7: 主动关联
                if (_.isEmpty(buildType) || ['3'].includes(buildType)) {
                    return false;
                }
                return true;
            },
            // 如果选择了主动关联,就要判断关联关系
            checkRelation(val, row) {
                // 1. 一个部件下面挂载的模型只能有一个“主动关联”
                // 2. 一个模型无论挂载在几个部件下，只能有一个“主动关联”
                // 是否“主动关联”状态  3: 计算的; 1: 无关联; 2: 被动关联;  7: 主动关联
                const isActiveState = (target) => +target === 7;
                if (!isActiveState(val)) {
                    return false;
                }

                // 指定list下是否有多个“主动关联”状态
                const isActivedByList = (list) => {
                    if (_.isEmpty(list)) {
                        return false;
                    }
                    let activeCount = 0;
                    _.each(list, (d) => {
                        if (isActiveState(d._buildTypeVal)) {
                            activeCount++;
                        }
                    });
                    return activeCount > 1;
                };
                // 相同模型“主动关联”的次数
                let count = 0;
                for (let part of this.tableData) {
                    const children = part.children;
                    if (_.isEmpty(children)) {
                        break;
                    }
                    // 1
                    if (isActivedByList(children)) {
                        this.$message.warning(this.i18n['部件只能有一个主动关联']);
                        return;
                    }
                    // 2
                    let rowOid = row.oid;
                    for (let child of children) {
                        if (isActiveState(child._buildTypeVal) && child.oid === rowOid) {
                            count++;
                        }
                    }
                }
                if (count > 1) {
                    this.$message.warning(this.i18n['模型只能被主动关联一次']);
                }
            },
            submit(data) {
                if (!data.length) {
                    // return next();
                    return;
                }
                let res = [];
                _.each(data, (part) => {
                    let flattenPart = part;
                    // 拷贝勾选的模型, 同时更新唯一识别Key；不然表格勾选时会有问题
                    let epmList = this.cloneSelections();
                    // 组装成树结构
                    flattenPart.children = [].concat(epmList);
                    res.push(flattenPart);
                });
                // 按业务规则去重
                // 业务要求CAD编辑关联表的父节点只能是部件；对非部件父节点增加关联部件后，要移除原有的非部件父节点
                this.$refs.famAdvancedTable.tableData = ErdcKit.deepClone(
                    this.deWeight(this.tableData.concat(res)).filter((d) => !(d.oid.indexOf('EpmDocument') > -1))
                );
                this.cloneTableData = this.tableData;
                this.$nextTick(() => {
                    this.$refs.famAdvancedTable.$refs.erdTable.$refs.xTable.setAllTreeExpand(true);
                });
            },
            cloneSelections() {
                // 拷贝勾选的模型, 同时更新唯一识别Key；不然表格勾选时会有问题
                let selections = ErdcKit.deepClone(this.$refs.famAdvancedTable?.fnGetCurrentSelection() || []);
                _.each(selections, (d) => {
                    d[this.treeOnlyKey] = Date.now() * Math.random();
                    // 默认无关联
                    d.buildType = '无关联';
                    d._buildTypeVal = '1';
                });
                return selections;
            },
            deWeight(list) {
                if (_.isEmpty(list)) {
                    return list;
                }
                const compareFn = (a, b) => a.some((d) => d.oid === b.oid);
                return list.reduce((acc, cur) => {
                    /**
                     * 业务去重规则：
                     * 1. 存在相同父节点时，父节点的children里有没有勾选的模型？
                     *  1.1 有，按父节点直接去重
                     *  1.2 无，children里追加勾选的模型
                     * 2. 不存在相同父节点时，不去重
                     */
                    if (compareFn(acc, cur)) {
                        // 找到相同项，拿他的 children 跟 勾选项合并去重
                        let target = {};
                        _.each(acc, (d) => {
                            if (d.oid === cur.oid) {
                                target = d;
                            }
                        });
                        if (!_.isEmpty(target.children)) {
                            let cloneSelections = this.cloneSelections();
                            target.children = this.deWeight(target.children.concat(cloneSelections));
                        }
                        return acc;
                    }
                    return acc.concat(cur);
                }, []);
            },
            confirm() {
                let res = [];
                let isPart = (val) => val.indexOf('OR:erd.cloud.pdm.part.entity.EtPart') > -1;
                // 反向组装关联关系
                for (let d of this.tableData) {
                    let children = d.children;
                    if (!isPart(d.oid) || _.isEmpty(children)) {
                        break;
                    }
                    let links = children.map((child) => {
                        return {
                            epmVid: child.vid,
                            partVid: d.vid,
                            relationType: child._buildTypeVal
                        };
                    });
                    res = res.concat(links);
                }
                // 拦截不合理数据
                if (_.isEmpty(res)) {
                    this.$message.warning(this.i18n['未作修改']);
                    return false;
                }
                this.loading = true;
                this.$famHttp({
                    url: '/fam/saveBuildRules',
                    method: 'POST',
                    className: this.className,
                    data: res
                })
                    .then((res) => {
                        if (res.success) {
                            this.$emit('success');
                            this.close();
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            close() {
                this.visible = false;
                this.$emit('close');
            },
            customRefresh() {
                this.$confirm(this.i18n['确认刷新'], this.i18n['提示'], {
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                })
                    .then(() => {
                        this.initTableData();
                    })
                    .catch(() => { });
            },
            // 高级表格列头配置成功后回调，手动恢复表格数据
            headerSubmitSuccess() {
                this.$refs.famAdvancedTable.tableData = this.cloneTableData;
            }
        }
    };
});
