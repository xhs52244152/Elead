define([
    'text!' + ELMP.resource('project-baseline/components/InfoCompare/index.html'),
    'css!' + ELMP.resource('project-baseline/components/InfoCompare/index.css')
], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('CbbBaseline');
    const { mapGetters: infoCompareMapGetters } = createNamespacedHelpers('infoCompare');
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'projectBaselineInfoCompare',
        template,
        components: {
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            AttributeCompare: ErdcKit.asyncComponent(
                ELMP.resource('project-baseline/components/InfoCompare/components/attributeCompare/index.js')
            ),
            RelationObject: ErdcKit.asyncComponent(
                ELMP.resource('project-baseline/components/InfoCompare/components/relationObject/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-baseline/components/InfoCompare/locale/index.js'),
                activeName: 'attribute',
                tabsRefresh: {
                    attribute: new Date().getTime().toString(),
                    relationObj: new Date().getTime().toString()
                },
                settingColsData: {},
                isOnlyDifferentChecked: false,
                checkboxDisabled: false,
                viewType: '',
                // 子类型
                childTypes: [],
                childType: '',
                // 增加对象
                objectForm: {
                    visible: false,
                    title: ''
                },
                urlConfig: {
                    data: {
                        conditionDtoList: [],
                        deleteNoPermissionData: false
                    }
                },
                dataOids: [],
                isHideCheckbox: false //是否显示页面仅显示不同checkbox按钮，默认显示
            };
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            ...infoCompareMapGetters(['getCompareDataList']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'baseline' });
            },
            className() {
                return this.viewTableMapping?.className || '';
            },
            tableKey() {
                return this.viewTableMapping?.tableKey || '';
            },
            // 列头前缀
            columnHeaderPrefix() {
                return this.className ? `${this.className}#` : '';
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
                        prop: `${this.columnHeaderPrefix}identifierNo`,
                        title: this.i18n.code, //编码
                        width: 140
                    },
                    {
                        prop: `${this.columnHeaderPrefix}name`,
                        title: this.i18n.name, //名称
                        width: 200
                    },
                    {
                        prop: `${this.columnHeaderPrefix}typeReference`,
                        title: this.i18n.type //类型
                    },
                    {
                        prop: `${this.columnHeaderPrefix}lifecycleStatus.status`,
                        title: this.i18n.status //状态
                    }
                ];
            },
            viewTypes() {
                return [
                    {
                        label: this.i18n.baseline,
                        value: this.className
                    }
                ];
            },
            tableData() {
                return this.getCompareDataList(this.className) || [];
            },
            pageTitle() {
                return {
                    isShowTag: false,
                    title: this.i18n.baselineComparison,
                    isShowPulldown: false,
                    staticTitle: true
                };
            },
            oid() {
                return this.route?.params?.oid;
            },
            tabs() {
                let { i18n, oid } = this;
                let tabs = [
                    {
                        key: 'attribute',
                        label: i18n.property,
                        clazz: 'attribute-panel',
                        componentName: 'AttributeCompare',
                        ref: 'AttributeCompareRef',
                        props: {
                            key: this.tabsRefresh['attribute'] || new Date().getTime().toString(),
                            oid,
                            isOnlyDifferent: this.isOnlyDifferentChecked,
                            dataOids: this.dataOids,
                            ...this.$attrs
                        },
                        eventMethods: {
                            refresh: () => {
                                this.$set(this.tabsRefresh, 'relationObject', new Date().getTime().toString());
                            }
                        }
                    },
                    {
                        key: 'relationObject',
                        label: i18n.relationObject,
                        clazz: 'relation-object-panel',
                        componentName: 'RelationObject',
                        ref: 'RelationObject',
                        props: {
                            key: this.tabsRefresh['relationObj'] || new Date().getTime().toString(),
                            oid,
                            dataOids: this.dataOids,
                            settingColsData: this.settingColsData,
                            isOnlyDifferent: this.isOnlyDifferentChecked,
                            ...this.$attrs
                        },
                        eventMethods: {
                            refresh: () => {
                                this.$set(this.tabsRefresh, 'attribute', new Date().getTime().toString());
                            },
                            settingCols: (data) => {
                                this.settingCols(data);
                            },
                            hideBtn: (val) => {
                                this.hideCheckbox(val); // 在相关对象-预算tab页，隐藏页面仅显示不同checkbox
                            }
                        }
                    }
                ];
                return tabs;
            }
        },
        mounted() {
            if (_.isArray(this.viewTypes) && this.viewTypes.length > 0) {
                this.viewType = this.viewTypes[0].value;
                this.viewTypeChange();
            }
        },
        methods: {
            handleClickTab(val) {
                if (val === 'attribute') this.isHideCheckbox = true;
            },
            hideCheckbox(val) {
                if (val === 'erd.cloud.ppm.budget.entity.Budget') this.isHideCheckbox = false;
                else this.isHideCheckbox = true;
            },
            settingCols(data) {
                this.settingColsData[data.key] = data.columns;
            },
            refreshCurrentData() {
                this.$nextTick(() => {
                    if (this.activeName === 'relationObject') {
                        let currentActiveName = this.$refs.RelationObject?.[0]?.activeName;
                        this.$refs.RelationObject?.[0]?.handleClick({ name: currentActiveName });
                    } else {
                        this.$set(this.tabsRefresh, this.activeName, new Date().getTime().toString());
                    }
                });
            },
            handleOnlyDifferent() {
                this.checkboxDisabled = true;
                this.refreshCurrentData();
                setTimeout(() => {
                    this.checkboxDisabled = false;
                }, 1000);
            },
            handleAddObject() {
                this.objectForm.visible = true;
                this.objectForm.title = this.i18n.addComparisonObject; //增加比较对象
            },
            // 增加对象提交前处理
            beforeSubmit(data, next) {
                if (!_.isArray(data) || (_.isArray(data) && !data.length)) {
                    return next();
                }
                if (this.tableData.length + data.length > 3) {
                    this.$message.warning(this.i18n.upToThree);
                    return;
                }
                this.addChangeAttrObj({ data, next, tip: this.i18n.addObjectSuccess });
            },
            // 增加对象
            addChangeAttrObj({ data, next, tip }) {
                this.dataOids = data && data.map((item) => item.oid);
                this.refreshCurrentData();
                next();
                // let concatOids = _.map(this.tableData, (item) => ErdcKit.deepClone(item)).concat(dataOids);
                // this.$famHttp({
                //     url: `/fam/compare`,
                //     data: {
                //         isOnlyDifferent: false,
                //         oids: concatOids, //取仓库存的oids
                //         optionList: [], //全选传空数组表示全部
                //         attributeConfig: 'ppmBaselineCompareShowField'
                //     },
                //     className: this.className,
                //     method: 'POST'
                // }).then(() => {
                //     this.$message.success(tip);
                //     _.isFunction(next) && next();
                //     this.refreshCurrentData();
                // });
            },
            // 关联对象数据处理
            afterRequest({ data, callback }) {
                data = _.map(data, (item) => {
                    let newRow = {};
                    _.each(item?.attrRawList, (sitem) => {
                        newRow[sitem?.attrName] = sitem?.displayName || '';
                    });
                    return {
                        ...newRow,
                        ...item
                    };
                });
                //过滤现有的对象
                data = data && data.filter((item) => !this.tableData.includes(item.oid));
                _.isFunction(callback) && callback(data);
            },
            loadAccessTypes(paramsData) {
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    method: 'GET',
                    data: paramsData,
                    appName: 'PPM'
                });
            },
            viewTypeChange() {
                this.loadAccessTypes({
                    typeName: this.viewType,
                    accessControl: false,
                    containerRef: ''
                }).then((res) => {
                    if (res.success) {
                        this.childTypes = res.data;
                        if (_.isArray(this.childTypes) && this.childTypes.length > 0) {
                            this.childTypeChange(this.childTypes[0].typeOid);
                        }
                    }
                });
            },
            // 二级类型切换
            childTypeChange(typeOid) {
                this.childType = typeOid;
                //类型查询的数据格式
                this.urlConfig.data.conditionDtoList = [
                    {
                        attrName: `${this.columnHeaderPrefix}lifecycleStatus.status`,
                        oper: 'NOT_IN',
                        value1: 'DRAFT',
                        logicalOperator: 'AND',
                        isCondition: true
                    },
                    {
                        attrName: `${this.columnHeaderPrefix}typeReference`,
                        oper: 'EQ',
                        value1: typeOid,
                        logicalOperator: 'AND',
                        isCondition: true
                    },
                    {
                        attrName: `${this.columnHeaderPrefix}identifierNo`,
                        oper: 'NOT_IN',
                        value1: this.$route.query.codeList,
                        logicalOperator: 'AND',
                        isCondition: true
                    }
                ];
            }
        }
    };
});
