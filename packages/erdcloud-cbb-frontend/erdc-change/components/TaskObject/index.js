define([
    'text!' + ELMP.func('erdc-change/components/TaskObject/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/components/RelatedObject/mixin.js'),
    ELMP.func('erdc-change/store.js')
], function (template, utils, cbbUtils, viewCfg, mixin) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('Change');

    return {
        name: 'ChangeTaskObject',
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            RelatedObject: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/RelatedObject/index.js')),
            BatchSetValue: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/BatchSetValue/index.js')),
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
            title: {
                type: String,
                default: '受影响的对象'
            },
            type: String,
            actionConfig: {
                type: Object,
                default: () => {
                    return {
                        name: '',
                        objectOid: '',
                        className: ''
                    };
                }
            },
            probOid: String,
            selectedList: Array,
            // 受影响的对象修订后的数据追加到产生的对象
            objectAppendData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            //是否是详情页面进入
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
                tableData: [], // 表格显示数据
                selectedData: [], // 表格选中数据
                reversionData: [], // 修订后的数据
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
                selectedViewType: '',
                selectedChildType: '',
                actionData: {}
            };
        },
        mixins: [mixin],
        computed: {
            ...mapGetters(['getRelatedChangeObject']),
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
                    version,
                    this.commonColumnsMap['lifecycleStatus.status'],
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
            defaultBtnConfig() {
                return {
                    label: '操作',
                    type: ''
                };
            },
            urlConfig() {
                return {
                    data: {
                        // typeReference: this.selectedChildType ?? ''
                    }
                };
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
                    affected: 'CHANGE_ACTIVITY_CREATE_AFFECTED_MENU',
                    product: 'CHANGE_ACTIVITY_CREATE_PRODUCER_MENU'
                };
            },
            buttonActionConfig() {
                return {
                    name: this.actionNameMap[this.type],
                    objectOid: this.oid,
                    containerOid: this.containerRef || '',
                    className: this.$route.meta.className
                };
            }
        },
        created() {
            // this.vm = this;
            if (this.type === 'product') {
                this?.vm?.$on('setReversionData', (nv) => {
                    if (nv && nv.length) this.tableData = [...this.tableData, ...nv];
                });
            }
            //修订成功之后，清空勾选的数据
            if (this.type == 'affected') {
                this?.vm?.$on('clearAffectedListSelectData', () => {
                    this.handleClearData();
                });
            }
        },
        mounted() {
            //变更任务才请求数据
            if (
                this.type === 'affected' &&
                this.$route.meta.openType == 'create' &&
                this.$route.meta.className == viewCfg.ecaChangeTableView.className
            ) {
                if (this.getRelatedChangeObject.length == 0) {
                    return false;
                }
                this.getTableList(this.getRelatedChangeObject, true);
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        const value = [nv];
                        if (this.type === 'affected') this.getTableList(value);
                        if (this.type == 'product') this.getProductTable(nv);
                    }
                }
            },
            objectAppendData: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.tableData = [...this.tableData, ...nv];
                    }
                }
            },
            selectedList: {
                immediate: true,
                handler(nv) {
                    if (nv && nv.length) {
                        const data = nv.map((item) => item.oid);
                        this.getTableList(data, true);
                    }
                }
            }
        },
        methods: {
            handleClearData() {
                //清空erdTable组件勾选的数据
                let xTable = this.$refs['erdTable']?.getTableInstance('vxeTable', 'instance');
                xTable?.clearCheckboxRow();
                //清空已经选中的数据
                this.selectedData = [];
            },
            getActionConfig(row) {
                const operateName = this.getOperateMapping({ tableName: row.idKey });
                return {
                    name: operateName,
                    objectOid: row.oid,
                    className: row.idKey
                };
            },
            refreshTable() {
                this.$refs.famViewTable.refreshTable();
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
                    url: '/fam/type/typeDefinition/findNotAccessTypes',
                    method: 'GET',
                    data: {
                        typeName
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
                    // this.$refs.assRef?.clearData();
                }
            },
            beforeSubmit() {},
            afterRequest({ data, callback }) {
                const { className } = this.associationCfg;

                let result = data?.map((item) => {
                    let obj = {};
                    _.each(item.attrRawList, (res) => {
                        if (res.attrName.indexOf(className + '#') !== -1) {
                            obj[res.attrName.split('#')[1]] = res.displayName;
                        }
                    });
                    item['iconColor'] = this.getIconStyle(item);
                    return { ...item, ...obj, checked: false };
                });
                callback(result);
            },
            submit(data) {
                if (!data.length) {
                    return;
                }
                const result = data.map((item) => {
                    item['selected'] = true;
                    return item;
                });
                this.addList = result;
                this.tableData = [...this.tableData, ...result];
            },
            // 获取受影响的对象
            getTableList(oidLit, isBool = false) {
                if (!oidLit) return;
                this.$famHttp({
                    url: '/change/affected/listByIds',
                    data: oidLit,
                    className: viewCfg.prChangeTableView.className,
                    method: 'POST'
                }).then((res) => {
                    this.tableData = [
                        ...this.addList,
                        ...(res?.data?.records || []).map((row) => {
                            row.selected = isBool;
                            return utils.coverDataFromAttrRowList(row);
                        })
                    ];
                });
            },
            // 获取产生的对象
            async getProductTable(relationshipRef, isBool) {
                this.tableData = (
                    await this.changeProcessTableGetList({
                        className: viewCfg.otherClassNameMap.changeRecord,
                        tableKey: 'changeActivityAfterRelationView',
                        relationshipRef,

                        lastestVersion: false,
                        addCheckoutCondition: false
                    })
                ).map((item) => {
                    item.selected = isBool;
                    return item;
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
                    className: viewCfg.documentTableView.className,
                    tableKey: viewCfg.documentTableView.tableKey
                });
                this.initSelectView();
                this.showDialog = true;
            },
            handlerCollect() {},
            // 这里用于外部调用收集相关对象后通过ref调用的更新 ， 期望与删除行为趋向一致
            handlerCreateRelation(
                list = [],
                className = viewCfg.ecaChangeTableView.className,
                relationClassName = viewCfg.otherClassNameMap.affectedActivityData
            ) {
                let uniqueList = list.filter((item) => !this.tableData.find((d) => d.oid === item.oid));
                if (!uniqueList.length) return;
                // 如果当前列表是受影响的对象列表 并且 处于流程页面 并且 是 变更任务流程中
                if (
                    'affected' === this.type &&
                    'workflowActivator' === this?.$route?.name &&
                    'eca_submit' === this?.$route?.query?.taskDefKey
                ) {
                    let onError = () => this.$message.error(this.$i18n['收集关联对象添加失败']);
                    this.$famHttp({
                        url: `/change/attr?className=${className}&oid=${this.oid}`
                    }).then((r) => {
                        let rawData = r?.data?.rawData || {},
                            typeReference = rawData.typeReference?.oid,
                            containerRef = rawData.containerRef?.oid;

                        if (this.oid && typeReference && containerRef) {
                            this.$famHttp({
                                url: '/change/update',
                                method: 'post',
                                data: {
                                    attrRawList: [],
                                    // 暂时只有变更任务流程内的受影响对象表格会用到
                                    className,
                                    oid: this.oid,
                                    containerRef,
                                    typeReference,
                                    contentSet: [],
                                    relationList: list.map((item) => ({
                                        action: 'CREATE',
                                        relationField: 'roleAObjectRef',
                                        className: relationClassName,
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item.oid
                                            }
                                        ]
                                    }))
                                }
                            })
                                .then(() => {
                                    // 这里需要标记 selected 表示已经绑定上去的
                                    this.tableData.push(...list.map((item) => ({ ...item, selected: true })));
                                })
                                .catch(onError);
                        } else {
                            onError();
                        }
                    });
                } else {
                    this.tableData.push(...list);
                }
            },
            handleGoDetail(data) {
                //流程查看详情,需添加返回按钮
                // 目前已知部件可以从relationOid取className
                cbbUtils.goToDetail(
                    data,
                    { query: { backButton: true }, skipMode: 'replace' },
                    utils.getClassNameKey(data)
                );
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
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
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                let eventClick = {
                    CHANGE_ACTIVITY_CREATE_AFFECTED_MENU_ADD: this.handlerAdd, //变更通告 > 变更任务 > 创建 > 受影响的对象
                    CHANGE_ACTIVITY_CREATE_PRODUCER_MENU_ADD: this.handlerAdd //变更通告 > 变更任务 > 创建 > 产生的对象-移除
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            }
        }
    };
});
