define([
    'text!' + ELMP.func('erdc-change/components/AffectedObjectList/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/components/RelatedObject/mixin.js'),
    ELMP.func('erdc-change/config/viewConfig.js')
], function (template, utils, cbbUtils, mixin, viewCfg) {
    const ErdcKit = require('erdc-kit');
    //映射 受影响的对象-后端固定key
    const effectObjectClassNameMap = {
        [viewCfg.prChangeTableView.className]: viewCfg.otherClassNameMap.reportedAgainst,
        [viewCfg.ecrChangeTableView.className]: viewCfg.otherClassNameMap.relevantRequestData,
        [viewCfg.ecaChangeTableView.className]: viewCfg.otherClassNameMap.affectedActivityData
    };

    return {
        name: 'ChangeAffectedObjectList',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            CollectObjects: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/CollectObjects/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js')),
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
            // 是否显示折叠面板
            isFolded: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            probOid: String,
            title: {
                type: String,
                default: '受影响的对象列表'
            },
            selectedList: Array,
            isDetailsEntry: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            vm: Object
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                panelUnfold: true,
                addList: [], // 新增数据
                firstList: [],
                viewData: [],
                tableData: [], // 表格显示数据
                selectedData: [], // 表格选中数据
                showDialog: false,
                associationCfg: {
                    className: '',
                    tableKey: '',
                    needSelect: true, // 是否需要下拉select选框
                    selectOpts: {
                        disabled: true, // 是否禁用一级下拉框
                        selectUrl: '', // 下拉选框的请求地址
                        className: '', // 下拉选框请求时需要的className,即类型的内部名称
                        containerRef: '', // 上下文的oid
                        defineOpts: [], // 自定义下拉框，如果要自定义二级类型，则可以进一步设置children
                        /**
                         * /common/type/findBySuperKey 动态接口参数
                         * 1. superKey 变更添加受影响对象 ; 批量审批流程/TR审批流程 ; 基线相关对象 ; 添加至工作区
                         * ['change', 'process', 'baseline', 'workSpace']
                         * 2. superKeyServer 用来判断接口前缀
                         */
                        superKey: '',
                        superKeyServer: ''
                    }
                },
                viewTypes: [],
                childTypes: [],
                searchValue: '',
                selectedViewType: '',
                selectedChildType: '',
                urlConfig: {
                    data: {
                        conditionDtoList: []
                    }
                },
                // 收集对象
                collectForm: {
                    visible: false,
                    title: '',
                    tableData: []
                }
            };
        },
        mixins: [mixin],
        computed: {
            oid() {
                return this.vm?.containerOid || this.probOid;
            },
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            className() {
                return this.$route.query.pid?.split(':')?.[1] || '';
            },
            columns() {
                const {
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                } = this.commonColumnsMap;
                return [
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    this.commonColumnsMap['lifecycleStatus.status'],
                    version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                ];
            },
            selectOpts() {
                return this.associationCfg.selectOpts ?? {};
            },
            rootSelectDisabled() {
                return this.selectOpts.disabled;
            },
            getModuleClassName() {
                return this.$route.meta.className || '';
            },
            importTable() {
                const { getUserName } = this;
                //详情不需要,来回切换tab会清空tableData的数据
                if (this.isDetailsEntry) {
                    return false;
                }
                const setData = JSON.parse(localStorage.getItem('saveAsChangeData'));
                const type = this.$route?.query?.type || '';
                let data = [];
                if (setData?.length && type === 'create') {
                    data = setData.map((item) => {
                        if (item.attrRawList) {
                            item['containerRef'] =
                                item?.attrRawList?.find((item) => item.attrName === 'containerRef')?.displayName ||
                                item.containerRef;
                        } else {
                            item['containerRef'] = item?.containerRef?.displayName || item?.containerRef;
                            item['createBy'] = getUserName(item, 'createBy');
                            item['updateBy'] = getUserName(item, 'updateBy');
                        }
                        return { ...item, selected: true };
                    });
                }
                this.addList = data;
                return data;
            },
            //修改左穿梭框的标题
            leftTitle() {
                return this.i18n.allDataList;
            },
            //定制穿梭框左侧的表头
            tableColumns() {
                let { i18n } = this;
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'icon',
                        minWidth: '40',
                        width: '40',
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        title: i18n.identifierNo,
                        width: 140
                    },
                    {
                        prop: 'name',
                        title: i18n.name,
                        width: 100
                    },
                    {
                        prop: 'version',
                        title: i18n.version,
                        width: 50
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        title: i18n.lifecycleStatus
                    },
                    {
                        prop: 'containerRef',
                        title: i18n.context
                    }
                ];
            },
            actionNameMap() {
                return {
                    [viewCfg.prChangeTableView.className]: 'CHANGE_ISSUE_AFFECTED_MENU',
                    [viewCfg.ecrChangeTableView.className]: 'CHANGE_REQUEST_AFFECTED_MENU'
                };
            },
            actionConfig() {
                return {
                    name: this.actionNameMap[this.$route.meta.className],
                    objectOid: this?.oid?.includes('container') ? '' : this?.oid,
                    containerOid: this.containerRef || '',
                    className: this.getModuleClassName
                };
            }
        },
        //刷新浏览器后再执行
        mounted() {
            this?.vm?.$on('relatedToAffected', (nv) => {
                if (nv && nv.length) {
                    const data = nv.filter((item) => item.selected).map((item) => item.oid);
                    if (data && data.length) {
                        this.getTableList(data, true);
                    }
                } else {
                    // 如果关联的PR全移除了，则受影响对象只剩手动添加的了
                    // 还需要加上从接口来的数据 -> firstList
                    this.tableData = [...this.firstList, ...this.addList];
                }
            });
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv && nv?.includes('change')) this.getTableList(nv);
                }
            },
            importTable: {
                immediate: true,
                handler(nv) {
                    if (nv && nv.length) this.tableData = nv;
                }
            },
            tableData: {
                immediate: true,
                handler(nv) {
                    //问题报告行操作创建变更请求，增加关联的PR对象选择当前问题报告并保存
                    if (nv) this.viewData = ErdcKit.deepClone(nv);
                }
            },
            selectedList: {
                immediate: true,
                handler(nv) {
                    if (nv && nv.length) {
                        const data = nv.filter((item) => item.selected).map((item) => item.oid);
                        this.getTableList(data, true);
                    }
                }
            }
        },
        methods: {
            getUserName(data, field) {
                let userData = data[`${field}_defaultValue`] || data[field];
                if (!userData) return '';
                else if (_.isArray(userData)) return userData.map((user) => user.displayName || '').join();
                else if (_.isObject(userData)) return userData.displayName || '';
                else return userData;
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                let eventClick = {
                    CHANGE_ISSUE_AFFECTED_MENU_ADD: this.handlerAdd, //问题报告-增加
                    CHANGE_ISSUE_AFFECTED_MENU_COLLECTOR: this.handlerCollect, //问题报告-收集
                    CHANGE_ISSUE_AFFECTED_MENU_REMOVE: this.handlerRemove, //问题报告-移除

                    CHANGE_REQUEST_AFFECTED_MENU_ADD: this.handlerAdd, //变更请求-增加
                    CHANGE_REQUEST_AFFECTED_MENU_COLLECTOR: this.handlerCollect, //变更请求-收集
                    CHANGE_REQUEST_AFFECTED_MENU_REMOVE: this.handlerRemove //变更请求-移除
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            // ---------------------------  添加关联对象相关 -------------------------------------------------
            async initSelectView() {
                const { associationCfg } = this;

                if (associationCfg.needSelect) {
                    // 需要选框
                    var data = associationCfg.selectOpts;

                    // 注意优先级 selectUrl > defineOpts > superKey
                    if (!_.isEmpty(data.selectUrl)) {
                        // 下拉选框请求地址
                        // 请求下拉选框数据
                        this.viewTypes = await this.getViewTypes();
                    } else if (!_.isEmpty(data.defineOpts) && _.isArray(data.defineOpts)) {
                        // 自定义的固定下拉选项
                        this.viewTypes = data.defineOpts;
                    } else {
                        // 展示默认的下拉选框配置
                        this.viewTypes = [
                            {
                                label: '部件',
                                ...viewCfg.partTableView
                            },
                            {
                                label: '文档',
                                ...viewCfg.documentTableView
                            },
                            {
                                label: '模型',
                                ...viewCfg.epmDocumentTableView
                            }
                        ];
                    }
                }

                let selectViewType = '';
                if (associationCfg.className) {
                    const findView = this.viewTypes.find((item) => item.typeName === associationCfg.className);
                    if (findView) {
                        selectViewType = findView.typeName;
                    }
                } else if (this.viewTypes.length) {
                    selectViewType = this.viewTypes[0].typeName;
                }

                this.viewTypeChange(selectViewType);
            },
            getViewTypes() {
                const { associationCfg } = this;
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                    method: 'GET',
                    data: {
                        typeName: associationCfg.typeName
                    }
                }).then((res) => {
                    return res.data;
                });
            },
            viewTypeChange(typeName) {
                const tableKeyMap = {
                    [viewCfg.partTableView.className]: viewCfg.partTableView.tableKey,
                    [viewCfg.documentTableView.className]: viewCfg.documentTableView.tableKey,
                    [viewCfg.epmDocumentTableView.className]: viewCfg.epmDocumentTableView.tableKey
                };
                this.selectedViewType = typeName;
                this.associationCfg.className = typeName;
                this.associationCfg.tableKey = tableKeyMap[typeName];
                this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    method: 'GET',
                    data: {
                        typeName,
                        accessControl: false,
                        containerRef: ''
                    }
                }).then((res) => {
                    this.childTypes = res.data;
                    if (Array.isArray(this.childTypes) && this.childTypes.length > 0) {
                        this.selectedChildType = this.childTypes[0].typeOid;
                        this.childTypeChange(this.selectedChildType);
                    }
                });
            },
            // 二级类型切换
            childTypeChange(val) {
                if (this.$refs.assRef) {
                    //类型查询的数据格式
                    //受影响的列表不能添加草稿数据，直接过滤草稿数据
                    this.urlConfig.data.conditionDtoList = [
                        {
                            attrName: `${this.selectedViewType}#lifecycleStatus.status`,
                            oper: 'NOT_IN',
                            value1: 'DRAFT',
                            logicalOperator: 'AND',
                            isCondition: true
                        },
                        {
                            attrName: `${this.selectedViewType}#typeReference`,
                            oper: 'EQ',
                            value1: val,
                            logicalOperator: 'AND',
                            isCondition: true
                        }
                    ];
                    // this.$refs.assRef.clearData();
                }
            },
            beforeSubmit() {},
            afterRequest({ data, callback }) {
                const { className } = this.associationCfg;

                let result = data?.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.includes('icon')) {
                            obj[res.attrName.split('#')[1]] = res.value;
                        } else if (res.attrName.indexOf(className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    item['iconColor'] = this.getIconStyle(item);
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            submit(data, isCollect = false) {
                if (!data.length) return;
                const result = (data || []).map((row) => {
                    let hasIcon = false;
                    utils.coverDataFromAttrRowList(row, 'attrRawList', true, (attrObject, format) => {
                        if (attrObject.attrName === 'icon') {
                            hasIcon = true;
                            try {
                                return (row.icon = JSON.parse(attrObject.value));
                            } catch (error) {
                                return format(attrObject);
                            }
                        }

                        return format(attrObject);
                    });
                    if (hasIcon) {
                        row.attrRawList = (row?.attrRawList || []).filter(
                            (attrObject) => !attrObject?.attrName?.includes('icon') || attrObject?.attrName === 'icon'
                        );
                    }
                    row.selected = true;
                    return row;
                });
                // 过滤出tableData中不存在的数据
                const newDataToAdd = result.filter(
                    (newItem) => !this.tableData.some((item) => item.oid === newItem.oid)
                );
                // 将新数据追加到tableData中
                this.addList = newDataToAdd;
                if (this.importTable.length) this.addList = [...this.importTable, ...newDataToAdd];
                this.tableData = [...this.tableData, ...newDataToAdd];
                this.tableData = _.uniq(this.tableData, (item) => item.versionOid || item.oid);

                //如果是详情页面-添加的数据需要实时保存，如果是创建流程时不需要实时保存，点击保存时统一保存
                if (this.isDetailsEntry) {
                    this.handleSaveAddData(this.addList, isCollect);
                }
            },
            // 获取回显数据
            getTableList(ids, isBool = false) {
                if (!ids) return;
                const oidLit = Array.isArray(ids) ? ids : [ids];
                this.$famHttp({
                    url: '/change/affected/listByIds',
                    className: this.getModuleClassName,
                    data: oidLit,
                    method: 'POST'
                }).then((res) => {
                    const data = (res?.data?.records || []).map((row) => {
                        utils.coverDataFromAttrRowList(row, 'attrRawList', true, (attrObject, format) => {
                            if (attrObject.attrName === 'icon') {
                                return (row.icon = attrObject.value || '');
                            }

                            return format(attrObject);
                        });
                        row.selected = isBool;
                        return row;
                    });
                    // 过滤出tableData中不存在的数据
                    const newDataToAdd = data.filter(
                        (newItem) => !this.tableData.some((item) => item.oid === newItem.oid)
                    );
                    if (!Array.isArray(ids)) {
                        this.firstList = newDataToAdd;
                        this.tableData = [...this.tableData, ...this.addList, ...newDataToAdd];
                    } else {
                        // 取手动添加的，和接口查到的
                        const firstList = isBool ? [] : this.firstList;
                        this.tableData = [...firstList, ...this.addList, ...data];
                    }

                    this.tableData = _.uniq(this.tableData, (item) => item.versionOid || item.oid);

                    // 补充LinkOid
                    this.tableData.forEach((item) => {
                        let newData = data.find((it) => it.oid === item.oid || it.versionOid === item.versionOid);
                        item.linkOid = newData?.linkOid || item.linkOid;
                    });
                });
            },
            getData() {
                return new Promise((resolve) => {
                    const data = this.tableData.filter((item) => item.selected);
                    resolve(data);
                });
            },
            handlerAdd() {
                this.associationCfg = _.extend({}, this.associationCfg, {
                    actionName: 'add',
                    ..._.pick(viewCfg.documentTableView, ['className', 'tableKey'])
                });
                this.initSelectView();
                this.showDialog = true;
            },
            handlerRemove() {
                const { i18n, selectedData } = this;
                if (!selectedData || !selectedData.length) {
                    this.$message({
                        type: 'warning',
                        message: i18n.selectTip
                    });
                    return;
                }
                // // 已绑定的数据
                // const deleteIds = selectedData.filter((item) => !item.selected).map((item) => item.linkOid);
                // // 新增数据
                // const filterData = selectedData.filter((item) => item.selected).map((item) => item.oid);

                // 已关联的数据
                const deleteIds = [];
                // 新增数据
                const filterData = [];

                selectedData.forEach((item) => {
                    if (!item.selected) return;
                    if (item.linkOid) deleteIds.push(item.linkOid);
                    else filterData.push(item.oid);
                });

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
                                if (allRemoveItems.find((bObj) => bObj === obj.oid || bObj === obj.linkOid)) {
                                    acc.push(index);
                                }
                                return acc;
                            }, []);
                        };
                        // 从a数组中移除与b数组中共享的对象
                        indicesToRemove(this.tableData)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.tableData.splice(index, 1));
                        indicesToRemove(this.addList)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.addList.splice(index, 1));
                        //删除时,要清空勾选框的数据
                        this.selectedData = [];
                    }
                    // 已关联的还需要调接口删除
                    if (deleteIds.length) {
                        const className = deleteIds[0].split(':')[1];
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
                            //删除时,要清空勾选框的数据
                            this.handleClearData();
                            //过滤删除的数据
                            this.tableData = this.tableData.filter((item) => !deleteIds.includes(item.linkOid));
                        });
                    }
                });
            },
            handleGoDetail(data) {
                //流程查看详情,需添加返回按钮
                cbbUtils.goToDetail(
                    data,
                    { query: { backButton: true }, skipMode: 'replace' },
                    utils.getClassNameKey(data)
                );
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records.map((item) => {
                    item.selected = true;
                    return item;
                });
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records.map((item) => {
                    item.selected = true;
                    return item;
                });
            },
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList, row?.idKey);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
            },
            // 保存添加的数据
            handleSaveAddData(addList, isCollect) {
                //收集对象为空时，也要清空勾选框
                if (addList.length == 0 && isCollect) {
                    this.handleClearData();
                }

                if (!addList.length) return false;
                let effectObjectClassName = effectObjectClassNameMap[this.getModuleClassName];
                //变更单
                let roleAObject = {
                    attrName: 'roleAObjectRef',
                    value: this.oid || ''
                };
                //关联对象
                let concatArray = addList.map((item) => {
                    return {
                        attrRawList: [roleAObject, { attrName: 'roleBObjectRef', value: item.oid }]
                    };
                });
                this.$famHttp({
                    url: '/change/saveOrUpdate',
                    data: {
                        rawDataVoList: concatArray,
                        action: 'CREATE',
                        className: effectObjectClassName
                    },
                    method: 'POST'
                })
                    .then(() => {
                        this.$message.success(this.i18n.addObjSuccess);
                        //添加成功之后清空勾选的数据
                        this.handleClearData();
                    })
                    .catch(() => {
                        //添加检出对象时错误时，再把前面添加的数据过滤掉
                        this.tableData = this.tableData.filter(
                            (newItem) => !addList.some((item) => item.oid === newItem.oid)
                        );
                        //添加失败之后清空勾选的数据
                        this.handleClearData();
                    });
            },

            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '', callback }) {
                this[field].title = title;
                this[field].visible = visible;
                _.isFunction(callback) && callback();
            },
            //收集相关对象
            collectObjectClick() {
                const tableData = this.$refs?.collectObjectsRef?.getData?.();
                const next = () => {
                    this.popover({
                        field: 'collectForm',
                        visible: false,
                        callback: () => {
                            // 清空所选数据
                            // this.checkboxAll({ records: [] });
                        }
                    });
                };

                //调submit方法做一层属性转换跟数据过滤
                this.submit(tableData, true), next();
            },
            // 收集相关对象
            handlerCollect() {
                if (!this.selectedData.length) {
                    return this.$message.info(this.i18n.collectObjData);
                }
                this.popover({
                    field: 'collectForm',
                    visible: true,
                    title: this.i18n.collectObject,
                    callback: () => {
                        this.collectForm.tableData = ErdcKit.deepClone(this.selectedData) || [];
                    }
                });
            },
            handleClearData() {
                //清空erdTable组件勾选的数据
                let xTable = this.$refs['erdTable']?.getTableInstance('vxeTable', 'instance');
                xTable?.clearCheckboxRow();
                //清空已经选中的数据
                this.selectedData = [];
                // 刷新列表数据
                this.getTableList(this.oid, false);
            },
            collectObjectCancel() {
                //关闭弹窗
                this.popover({
                    field: 'collectForm',
                    visible: false
                });
                //清空勾选数据
                this.handleClearData();
            },
            // 搜索
            search(val) {
                ErdcKit.debounceFn(() => {
                    let [...arr] = this.tableData;
                    this.filterColumns(val, arr);
                }, 300);
            },
            // 过滤数据
            filterColumns(val, data) {
                if (!val) {
                    this.viewData = this.tableData;
                    return true;
                }
                const searchData = [];
                const res = val.replace(/\s/gi, '');
                let searchArr = data;
                searchArr.forEach((e) => {
                    let { identifierNo, oldName, name } = e;
                    const rowName = e[`${this.className}#name`];
                    const id = e[`${this.className}#identifierNo`];
                    if (
                        identifierNo?.includes(res) ||
                        id?.includes(res) ||
                        oldName?.includes(res) ||
                        name?.includes(res) ||
                        rowName?.includes(res)
                    ) {
                        if (searchData.indexOf(e) == '-1') {
                            searchData.push(e);
                        }
                    }
                });

                this.viewData = searchData;
            }
        }
    };
});
