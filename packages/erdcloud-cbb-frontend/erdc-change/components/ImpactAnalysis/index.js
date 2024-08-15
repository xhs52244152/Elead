define([
    'text!' + ELMP.func('erdc-change/components/ImpactAnalysis/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/components/RelatedObject/mixin.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, utils, viewCfg, mixin, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const className = viewCfg.otherClassNameMap.includeIn;

    return {
        name: 'ChangeImpactAnalysis',
        template,
        components: {
            FamParticipantSelect: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/index.js')
            ),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js'))
        },
        props: {
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            isShow: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            probOid: String,
            type: String,
            title: {
                type: String,
                default: '影响分析'
            },
            containerRef: String,
            folderRef: String,
            //区分是创建还是详情页面进入
            isDetailsEntry: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            vm: Object,
            // 自定义参数appName
            appName: String
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                panelUnfold: true,
                addList: [], // 新增数据
                tableData: [], // 表格显示数据
                dataType: 'priority_type',
                isAdd: false,
                createList: [],
                setContainer: '',
                // 参与者选择
                queryParams: {
                    data: {
                        appName: this.appName || cbbUtils.getAppNameByResource(),
                        isGetVirtualRole: true
                    }
                },
                // 参与者范围
                queryScope: 'fullTenant',
                isSaving: false
            };
        },
        mixins: [mixin],
        computed: {
            currentContainerRef() {
                return this.setContainer || this.containerRef;
            },
            oid() {
                return this.vm?.containerOid || this.probOid;
            },
            columns() {
                const columns = [
                    {
                        prop: 'checkbox', // 列数据字段key
                        type: 'checkbox', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'name', // 属性名
                        title: this.i18n['influencing'], // 字段名
                        sortAble: false,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'executor',
                        title: this.i18n['executor'],
                        sortAble: false,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'priority',
                        title: this.i18n['priority'],
                        sortAble: false,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'typeReference',
                        title: this.i18n['type'],
                        sortAble: false,
                        editRender: {},
                        className: 'editIcon'
                    },
                    {
                        prop: 'operation',
                        title: this.i18n.operation,
                        sortAble: false,
                        width: 120
                    }
                ];
                return columns;
            },
            // 优先级
            priorityRow() {
                return {
                    componentName: 'CustomVirtualEnumSelect',
                    clearNoData: true,
                    dataKey: 'erd.cloud.cbb.change.enums.RequestPriority'
                };
            },
            // 类型下拉框row配置
            typeReferenceRow() {
                return {
                    componentName: 'virtual-select',
                    clearNoData: true,
                    requestConfig: {
                        url: '/fam/type/typeDefinition/findAccessTypes',
                        viewProperty: 'displayName',
                        valueProperty: 'typeOid',
                        params: {
                            typeName: 'erd.cloud.impact.analysis',
                            accessControl: false,
                            containerRef: this.$route.query.pid ? this.currentContainerRef : ''
                        }
                    }
                };
            },
            validRules() {
                //自定义message提示语
                let { i18n } = this;
                return {
                    name: [{ required: true, message: `${i18n.pleaseEnter}-${i18n.influencing}` }],
                    executor: [{ required: true, message: `${i18n.pleaseEnter}-${i18n.executor}` }],
                    priority: [{ required: true, message: `${i18n.pleaseEnter}-${i18n.priority}` }],
                    typeReference: [{ required: true, message: `${i18n.pleaseEnter}-${i18n.type}` }]
                };
            },
            actionConfig() {
                return {
                    name: 'CHANGE_REQUEST_AFFECTED_ANALYSE_MENU',
                    objectOid: '',
                    containerOid: this.$store.state.space?.context?.oid || '',
                    className: this.$route.meta.className || ''
                };
            }
        },
        created() {
            if (this.type) {
                this?.vm?.$on('GetChangeContainer', (nv) => {
                    if (nv) this.setContainer = nv;
                });
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv) this.getTableList(nv);
                }
            },
            tableData: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        /* empty */
                    }
                }
            }
        },
        methods: {
            async getTableList(relationshipRef) {
                this.tableData = await this.changeProcessTableGetList({
                    className,
                    tableKey: 'ChangeOrderRelationChangeActivityView',
                    relationshipRef
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
            submit(data) {
                if (!data.length) {
                    // return next();
                    return;
                }
                this.addList = data;
                this.tableData = [...this.tableData, ...data];
            },
            getData() {
                return new Promise((resolve) => {
                    let oids = [];
                    this.tableData.map((item) => {
                        if (!item.isNew && item.oid) oids.push(item.oid);
                    });
                    resolve(oids);
                });
            },
            handlerAdd() {
                if (this.isAdd) {
                    this.$message.warning(this.i18n.pleaseSaveData);
                } else if (!this.currentContainerRef) {
                    this.$message.warning(this.i18n.pleaseSelectContext);
                    return;
                } else if (this.tableData.length >= 20) {
                    //影响分析限定20条
                    this.$message.warning(this.i18n.upToItems);
                    return;
                } else {
                    // 随机生成一个id
                    const randomId = Math.random() * (10000000000000000000 - 100000000000000000) + 100000000000000000;
                    this.tableData.push({
                        id: randomId,
                        name: '',
                        executor: '',
                        priority: '',
                        typeReference: '',
                        editFlag: true,
                        isNew: true
                    });
                    this.isAdd = true;
                    this.refreshData();
                }
            },
            handlerRemove() {
                const { i18n, selectChangeArr } = this;
                if (!selectChangeArr || !selectChangeArr.length) {
                    this.$message({
                        type: 'warning',
                        message: i18n.selectTip
                    });
                    return;
                }
                // 已绑定的数据
                const deleteIds = selectChangeArr.filter((item) => item.oid).map((item) => item.oid);
                // 新增数据
                const filterData = selectChangeArr.filter((item) => !item.oid).map((item) => item.id);

                this.$confirm(i18n.deleteBatchTip, i18n.deleteTip, {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }).then(() => {
                    // 已关联的和新增的都要做前端移除
                    let allRemoveItems = [...deleteIds, ...filterData];
                    if (allRemoveItems.length) {
                        const indicesToRemove = function (array) {
                            return array.reduce((acc, obj, index) => {
                                if (allRemoveItems.find((bObj) => bObj === obj.id || bObj === obj.oid)) {
                                    acc.push(index);
                                }
                                return acc;
                            }, []);
                        };
                        // 从a数组中移除与b数组中共享的对象
                        indicesToRemove(this.tableData)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.tableData.splice(index, 1));
                        this.isAdd = false;
                    }
                    if (deleteIds.length) {
                        this.$famHttp({
                            url: '/fam/deleteByIds',
                            method: 'delete',
                            params: {},
                            data: {
                                oidList: deleteIds,
                                className
                            }
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: i18n.deleteSuccess,
                                showClose: true
                            });
                            this.refreshData();
                            //更新页面数据
                            this.getTableList(this.oid);
                            this.isAdd = false;
                        });
                    }
                });
            },
            handlerConfirm(row) {
                if (this.isSaving) return;

                let { i18n } = this;
                if (!row.name) {
                    this.$message.warning(i18n.nameNotEmpty);
                    return false;
                }
                if (!row.executor) {
                    this.$message.warning(i18n.executorNotEmpty);
                    return false;
                }
                if (!row.priority) {
                    this.$message.warning(i18n.priorityNotEmpty);
                    return false;
                }
                if (!row.typeReference) {
                    this.$message.warning(i18n.typeNotEmpty);
                    return false;
                }

                const data = {
                    containerRef: this.currentContainerRef,
                    className: viewCfg.ecaChangeTableView.className,
                    typeReference: row.typeReference,
                    attrRawList: [
                        {
                            attrName: 'name',
                            value: row.name
                        },
                        {
                            attrName: 'executor',
                            value: row.executor
                        },
                        {
                            attrName: 'priority',
                            value: row.priority
                        },
                        {
                            attrName: 'folderRef',
                            value: this.folderRef
                        }
                    ]
                };

                this.isSaving = true;
                this.$famHttp({
                    url: '/fam/create',
                    data,
                    method: 'POST'
                })
                    .then((res) => {
                        this.isSaving = false;
                        this.$message.success(this.i18n.createSuccess);
                        if (res.data) this.createList.push(res.data);
                        this.isAdd = false;
                        row.editFlag = false;
                        row.isNew = false;
                        row.oid = res.data;
                        //如果是详情页面进入,保存数据之后跟变更请求建立关联
                        if (this.isDetailsEntry) {
                            this.handleAnalysisLink(res.data, row);
                        }
                    })
                    .catch(() => {
                        this.isSaving = false;
                    });
            },
            // 选中用户
            fnMemberSelect(row, memberIds, members) {
                row.executor = memberIds || '';
                row.executorObj = memberIds ? members : [];
                row.executorName = memberIds ? members.map((m) => m.displayName)?.join() : '';
            },
            changePriority(value, data, row) {
                if (data) this.$set(row, 'priorityName', data.name);
            },
            changeType(value, data, row) {
                if (data) this.$set(row, 'typeReferenceName', data.displayName);
            },
            /**
             * 自定义判断什么时候显示tooltip
             * @param {*} data
             * @returns
             */
            contentMethod(data) {
                const { row, cell, column, type } = data;
                if (type === 'header') {
                    return column?.title || null;
                }
                if ($(cell).width()) {
                    if ($(cell).find('span').width() >= $(cell).width() - 32) {
                        return row?.[column.property] || null;
                    } else {
                        return '';
                    }
                }
            },
            // 表格单元格校验样式
            // eslint-disable-next-line no-unused-vars
            tableCellClassName({ row, rowIndex, columnIndex, column }) {
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
            checkboxAll({ records = [] }) {
                this.selectChangeArr = records;
            },
            selectChangeEvent({ records = [] }) {
                this.selectChangeArr = records;
            },
            // 点击编辑单元格
            editActive({ row, column }) {
                this.$set(row, `editIcon-${row.id}-${column.property}`, true);

                if (row[column.property] && _.keys(this.validRules).includes(column.property)) {
                    this.$set(row, `validerror-${row.id}-${column.property}`, false);
                }
                if (column.property == 'displayName') {
                    this.$set(row, `editCell-displayName`, true);
                } else {
                    this.$set(row, `editCell-displayName`, false);
                }

                // 点击设置默认获取焦点
                if (column.property == 'name') {
                    this.$nextTick(() => {
                        this.$refs.nameInput.$el.querySelector('input').focus();
                    });
                }
                if (column.property == 'statusName') {
                    this.$nextTick(() => {
                        this.$refs.statusSelect.showPanel();
                        this.$refs.statusSelect.focus();
                    });
                }
                if (column.property === 'code') {
                    this.$nextTick(() => {
                        this.$refs.codeInput.$el.querySelector('input').focus();
                    });
                }
            },
            inputCallback(value, data) {
                const { row, column } = data;
                this.$set(row, column.property, value.trim());
            },
            // 点击单元格触发点击事件前事件
            beforeEditMethod({ row }) {
                return row.editFlag ?? false;
            },
            // 关闭单元格点击状态
            editClosed({ row, column }) {
                if (['displayName'].includes(column.property)) {
                    utils.trimI18nJson(row.nameI18nJson);
                    row[column.property] = row[column.property].trim();
                }
                if (row && !row[column.property] && _.keys(this.validRules).includes(column.property)) {
                    // this.$refs.erdTable.$refs.xTable.setEditCell(row, column);
                    this.$set(row, `validerror-${row.id}-${column.property}`, true);
                }
            },
            /* 图标 */
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList, row?.idKey || viewCfg.prChangeTableView.className);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return row[`${viewCfg.prChangeTableView.className}#icon`];
            },
            //建立关联
            handleAnalysisLink(analysisOid, row) {
                this.$famHttp({
                    url: '/fam/create',
                    data: {
                        attrRawList: [
                            {
                                attrName: 'roleBObjectRef',
                                value: analysisOid
                            },
                            {
                                attrName: 'roleAObjectRef',
                                value: this.oid
                            }
                        ],
                        action: 'CREATE',
                        className: viewCfg.otherClassNameMap.includeIn
                    },
                    method: 'POST'
                }).then((resp) => {
                    // 更新关联数据
                    row.oid = resp.data;
                });
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                //问题报告
                let eventClick = {
                    CHANGE_REQUEST_AFFECTED_ANALYSE_MENU_ADD: this.handlerAdd,
                    CHANGE_REQUEST_AFFECTED_ANALYSE_MENU_REMOVE: this.handlerRemove
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            }
        }
    };
});
