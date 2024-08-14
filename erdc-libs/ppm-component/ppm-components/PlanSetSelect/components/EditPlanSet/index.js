define([
    'text!' + ELMP.resource('ppm-component/ppm-components/PlanSetSelect/components/EditPlanSet/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    'TreeUtil',
    'fam:kit'
], function (template, store, ErdcKit, commonHttp, TreeUtil, FamKit) {
    return {
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                title: '编辑计划集',
                visible: false,
                projectOid: '',
                // 领域选项
                domainOptions: [],
                // 选择父节点弹窗配置
                parentSelector: {
                    title: '选择父节点',
                    visible: false,
                    value: '',
                    options: [],
                    defaultProps: {
                        children: 'children',
                        label: 'name',
                        value: 'id'
                    }
                },
                tableHeight: '400px'
            };
        },
        computed: {
            projectClass() {
                return store.state.classNameMapping.project;
            },
            className() {
                return 'erd.cloud.ppm.plan.entity.TaskCollect';
            },
            allColumns() {
                return [
                    {
                        label: '计划',
                        attrName: 'name',
                        width: 400,
                        editRender: {
                            autofocus: '.el-input__inner'
                        }
                    },
                    {
                        label: '领域',
                        attrName: 'area',
                    },
                    {
                        label: '操作',
                        attrName: 'operation',
                        width: 70
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            slotsField() {
                return [
                    {
                        prop: 'name',
                        type: 'default'
                    },
                    {
                        prop: 'name',
                        type: 'edit'
                    },
                    {
                        prop: 'area',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            viewTableConfig() {
                const _this = this;
                return {
                    tableBaseConfig: {
                        'showOverflow': true,
                        'edit-config': { trigger: 'click', mode: 'cell', showUpdateStatus: true },
                        'treeNode': 'name',
                        'treeConfig': {
                            childrenField: 'children'
                        }
                    },
                    // 视图的高级表格配置，使用继承方式，参考高级表格用法
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            searchCondition: ['name'],
                            isLocalSearch: true
                        },
                        basicFilter: {
                            show: false
                        },
                        actionConfig: {
                            name: 'PPM_TASK_COLLECT_LIST_MENU',
                            containerOid: '',
                            className: _this.className
                        }
                    },
                    addSeq: true,
                    addCheckbox: true,
                    fieldLinkConfig: {
                        fieldLink: false
                    },
                    pagination: {
                        showPagination: false
                    },
                    slotsField: _this.slotsField,
                    columns: _this.allColumns
                };
            }
        },
        created() {
            this.tableHeight = window.innerHeight - 270 + 'px';
        },
        methods: {
            open(oid) {
                this.visible = true;
                this.projectOid = oid;
                this.refresh();
            },
            close() {
                this.visible = false;
                this.$emit('after-update');
            },
            refresh() {
                this.refreshTableData();
                this.getDomainOptions();
            },
            refreshTableData() {
                let projectDataArr = this.projectOid?.split(':');
                this.$famHttp({
                    url: '/ppm/plan/v1/taskCollect/tree',
                    className: this.projectClass,
                    data: {
                        projectId: projectDataArr?.[2] || ''
                    }
                }).then((resp) => {
                    this.$nextTick(() => {
                        this.$refs.table.tableData = resp.data;
                        // 表格本地搜索源数据
                        this.$refs.table.sourceData = JSON.parse(JSON.stringify(resp.data));
                    });
                });
            },
            getDomainOptions() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/domainType?status=1'
                }).then((resp) => {
                    this.allDomainOptions = (resp.data || []).map((item) => {
                        return {
                            label: item.name,
                            value: item.value
                        };
                    });
                    this.domainOptions = _.clone(this.allDomainOptions).filter((item) => item.value !== '-1');
                });
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_TASK_COLLECT_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            onActionClick({ name }) {
                const eventClick = {
                    TASK_COLLECT_CREATE: this.create,
                    TASK_COLLECT_BATCH_DELETE: this.batchDeleteItems
                };

                let selected = this.$refs.table.fnGetCurrentSelection();
                return eventClick[name] && eventClick[name](selected);
            },
            onCommand({ name }, row) {
                const eventClick = {
                    TASK_COLLECT_DELETE: this.deleteItem,
                    TASK_COLLECT_MOVE_DOWN: (row) => {
                        this.moveItem(row, 1);
                    },
                    TASK_COLLECT_MOVE_UP: (row) => {
                        this.moveItem(row, -1);
                    },
                    TASK_COLLECT_SELECT_PARENT_NODE: this.selectParent
                };
                return eventClick[name] && eventClick[name](row);
            },
            handleConfirm() {
                const { className } = this;
                if (this.$refs.table.sourceData.length < 1) return this.close();
                // 参数组装
                let rawDataVoList = this.handleParams(this.$refs.table.sourceData);

                this.$famHttp({
                    url: '/ppm/saveOrUpdate',
                    calssName: this.projectClass,
                    method: 'POST',
                    data: {
                        className,
                        rawDataVoList
                    }
                }).then(() => {
                    this.$message.success('保存成功');
                    this.close();
                });
            },
            handleParams(data = [], isRoot = true, parent = null) {
                const { className, handleParams } = this;
                return data.map((row, index) => {
                    row.sortOrder = isRoot ? index + 1 : `${parent.sortOrder}.${index + 1}`;
                    row.parentRef = parent?.oid || (isRoot ? `OR:${className}:-1` : '');
                    let attrRawList = ['name', 'area', 'sortOrder', 'projectRef', 'parentRef'].map((key) => ({
                        attrName: key,
                        value: row[key]
                    }));

                    let relationList = handleParams(row.children, false, row);

                    return {
                        action: row.oid ? 'UPDATE' : 'CREATE',
                        appName: 'PPM',
                        attrRawList,
                        relationList,
                        className,
                        associationField: 'parentRef',
                        oid: row.oid
                    };
                });
            },
            create() {
                this.$refs.table.tableData.unshift({
                    name: '',
                    area: -1,
                    projectRef: this.projectOid,
                    children: [],
                    oid: '',
                    id: Date.now().toString(),
                    isNew: true
                });
                this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
            },
            // 遍历删除
            recursionDetele(list, data) {
                list = list.filter((item) => {
                    if (item.children && item.children.length) {
                        item.children = this.recursionDetele(item.children, data);
                    }
                    return item !== data;
                });
                return list;
            },
            deleteItem(data) {
                let vm = this;
                let extendParams = {
                    title: '是否删除？',
                    rowKey: 'oid',
                    listRoute: null
                };

                let { title, rowKey, listRoute } = extendParams;

                vm.$confirm(title, '确认删除', {
                    distinguishCancelAndClose: true,
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 未保存过的数据，直接删除
                    if (!data.oid) {
                        this.$refs.table.tableData = this.recursionDetele(this.$refs.table.tableData, data);
                        this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
                        return vm.$message.success('删除成功');
                    }

                    commonHttp
                        .commonDelete({
                            params: {
                                oid: data[rowKey]
                            }
                        })
                        .then(() => {
                            vm.$message.success('删除成功');
                            if (listRoute) vm.$router.push(listRoute);
                            else vm.refresh();
                        });
                });
            },
            batchDeleteItems(selected) {
                let vm = this;
                let extendParams = {
                    title: '是否删除？',
                    rowKey: 'oid'
                };

                // 勾选校验
                if (!selected.length) {
                    return vm.$message.info('请勾选数据');
                }

                let { title, rowKey } = extendParams;

                vm.$confirm(title, '确认删除', {
                    distinguishCancelAndClose: true,
                    confirmButtonText: '确认',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    // 未保存过的数据，直接删除
                    this.$refs.table.tableData = this.$refs.table.tableData.filter((item) => {
                        return !(selected.includes(item) && !item.oid);
                    });

                    this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
                    let oidList = selected
                        .map((item) => {
                            return item[rowKey];
                        })
                        .filter((item) => item);

                    if (oidList.length === 0) {
                        return vm.$message.success('删除成功');
                    }

                    commonHttp
                        .deleteByIds({
                            data: {
                                catagory: 'DELETE',
                                className: vm.className,
                                oidList
                            }
                        })
                        .then(() => {
                            vm.$message.success('删除成功');
                            vm.refresh();
                        });
                });
            },
            moveItem(data, step) {
                let tableData = this.$refs.table.tableData || [];
                let parentRow = null;
                let currentIndex = -1;
                // 匹配所属父节点
                parentRow = TreeUtil.getNode(tableData, {
                    childrenField: 'children',
                    target(node) {
                        return (node.children || []).find((item) => item === data);
                    }
                });

                // 获取当前index
                let list = parentRow ? parentRow.children : tableData;
                list.forEach((item, index) => {
                    if (item === data) currentIndex = index;
                });
                if (currentIndex < 0) return false;

                // 新的index
                let nextIndex = currentIndex + step;
                // 区分上移、下移 展示不同提示语
                if (nextIndex < 0) {
                    return this.$message.warning('当前节点为第一个节点，不可再上移');
                } else if (nextIndex >= list.length) {
                    return this.$message.warning('当前节点为最后一个节点，不可再下移');
                }

                // 位置交换
                list[nextIndex] = list.splice(currentIndex, 1, list[nextIndex])[0];

                this.$refs.table.tableData = FamKit.deepClone(this.$refs.table.tableData || []);
                this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
                this.$nextTick(() => {
                    this.$refs.table.getTableInstance('vxeTable', 'instance').setAllTreeExpand(true);
                });
            },
            // 选择父节点
            selectParent(row) {
                this.parentSelector.currentRow = row;
                let treeCopy = FamKit.deepClone(this.$refs.table.tableData || []);
                // 从所属父节点中移除
                this.parentSelector.options = this.removeItemFromParent(row, treeCopy);
                this.parentSelector.value = '';
                // 过滤掉未填名称的计划集
                this.parentSelector.options = this.parentSelector.options.filter((item) => item.name);
                // 打开弹窗
                this.parentSelector.visible = true;
            },
            // 选择父节点-确认
            handleParentConfirm() {
                let currentRow = this.parentSelector.currentRow;
                let selected = this.parentSelector.value;
                let selectedRow = TreeUtil.getNode(this.$refs.table.tableData || [], {
                    childrenField: 'children',
                    target(node) {
                        return node.id === selected;
                    }
                });
                // 判断父节点是否选择值
                if (selected) {
                    // 计划集移动父节点点击确认时校验是否可以移动到父节点下
                    this.checkMoveItemToParent(selected).then((resp) => {
                        if (resp.code === '200') {
                            // 从所属父节点中移除
                            this.removeItemFromParent(currentRow, this.$refs.table.tableData);
                            selectedRow.children = selectedRow.children || [];
                            selectedRow.children.push(currentRow);

                            // 循环判断所选父节点是否展开
                            let vxeTable = this.$refs.table.getTableInstance('vxeTable', 'instance');
                            FamKit.deferredUntilTrue(
                                () => {
                                    let parentIsExpand = vxeTable.isTreeExpandByRow(selectedRow);
                                    if (!parentIsExpand) vxeTable.setAllTreeExpand(true);
                                    return parentIsExpand;
                                },
                                () => {}
                            );
                            this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
                            this.parentSelector.visible = false;
                        }
                    });
                } else {
                    let parentRef = currentRow.parentRef;
                    // 判断当前移动的节点是否是顶层节点  若不是则将其移动到顶层
                    if (parentRef.split(':')[1] !== '-1') {
                        // 从所属父节点中移除
                        this.removeItemFromParent(currentRow, this.$refs.table.tableData);
                        currentRow.parentRef = `OR:${this.className}:-1`;
                        this.$refs.table.tableData.push(currentRow);
                        this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
                    }

                    this.parentSelector.visible = false;
                }
            },
            // 计划集移动父节点校验
            checkMoveItemToParent(parentId) {
                return this.$famHttp({
                    url: '/ppm/plan/v1/taskCollect/move/check',
                    method: 'get',
                    className: this.className,
                    data: {
                        parentId: parentId
                    }
                });
            },
            // 从所属父节点中移除
            removeItemFromParent(row, allData = []) {
                // 匹配所属父节点
                let parentRow = TreeUtil.getNode(allData, {
                    childrenField: 'children',
                    target(node) {
                        return (node.children || []).find((item) => item.id === row.id);
                    }
                });
                // 排除当前节点及其子节点
                let list = parentRow ? parentRow.children : allData;
                let index = list.findIndex((item) => item.id === row.id);
                list.splice(index, 1);

                return allData;
            },
            onChangeName(row) {
                let domainData = this.domainOptions.find((item) => item.label === row.name);
                if (domainData) {
                    row.area = domainData.value;
                } else {
                    row.area = -1;
                }
                this.$refs.table.sourceData = JSON.parse(JSON.stringify(this.$refs.table.tableData));
            },
            // 领域字段名称
            domainName(row) {
                return this.allDomainOptions.find((item) => item.value == row.area)?.label;
            }
        }
    };
});
