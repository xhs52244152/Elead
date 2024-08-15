define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedGroup/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-components/FamAdvancedGroup/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            visible: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            title: {
                type: String,
                default() {
                    return '';
                }
            },
            mainModelType: String,
            // 可选字段，没有就根据主类型查询
            conditionColumnsList: {
                type: Array,
                default() {
                    return [];
                }
            },
            footerBtnShow: {
                type: Boolean,
                default() {
                    return true;
                }
            },
            addFirstConditions: {
                type: Boolean,
                default() {
                    return true;
                }
            },
            maxHeight: {
                type: String,
                default() {
                    return 'auto';
                }
            },
            valueKey: {
                type: String,
                default() {
                    return 'oid';
                }
            },
            showLabel: {
                type: String,
                default() {
                    return 'label';
                }
            },
            defaultReqParams: {
                type: Object,
                defualt() {
                    return null;
                }
            },
            isGroup: Boolean,
            isPanel: Boolean,
            showAdvancedHistory: Boolean,
            value: {
                type: Array,
                default() {
                    return [];
                }
            },
            fieldTypeList: {
                type: Array,
                default() {
                    return [];
                }
            },
            initType: String,
            showTypeTips: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            counter: {
                type: Number,
                default: 1
            },
            allConditionList: {
                type: Array,
                default() {
                    return [];
                }
            },
            classifyConditionList: {
                type: Array,
                default() {
                    return [];
                }
            },
            requestConfig: Function,
            isClassifySearch: {
                type: Boolean,
                default: false
            },
            canAddCondition: {
                type: Boolean,
                default: true
            },
            canAddConditionGroup: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                defaultConditionTemp: {
                    field: '',
                    operator: '',
                    operationList: [],
                    value: '',
                    fieldType: '',
                    valueDisplayName: ''
                }, // 默认高级搜索条件模板对象
                allColumnsList: [], // 所有可选字段
                conditionsList: [], // 高级搜索条件
                conditionsListCopy: [], // 用于展示的条件
                selectedCol: [], // 选中的字段
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamAdvancedGroup/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'clear',
                    'tips_no_value',
                    'select_too_long',
                    'add_conditions',
                    'add_conditions_group',
                    'search',
                    'expand',
                    'folded',
                    'history_filters',
                    'history_filters_manage',
                    'history_filters_select',
                    'and',
                    'or',
                    'save',
                    'yes',
                    'no'
                ]),
                isExpand: true,
                height: 'auto',
                selectedType: '',
                innerSelectedType: '',
                typePropConfig: { label: 'displayName', value: 'id', key: 'id' },
                isFirst: true
            };
        },
        components: {
            ComponentWidthLabel: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        watch: {
            mainModelType: {
                immediate: true,
                handler(val) {
                    if (this.conditionColumnsList.length < 1 && val) {
                        this.fetchConditionByType(val).then((resp) => {
                            this.allColumnsList = resp?.data || [];
                        });
                    }
                }
            },
            requestConfig() {
                this.fetchConditionByType(this.mainModelType).then((resp) => {
                    this.allColumnsList = resp?.data || [];
                });
            },
            // 传的条件
            conditionColumnsList: {
                immediate: true,
                handler(val) {
                    this.allColumnsList = val || [];
                }
            },
            fieldTypeList: {
                immediate: true,
                handler(val) {
                    if (Array.isArray(val) && val.length === 1 && this.isGroup) {
                        // let fieldKey = this.typePropConfig.value;
                        // this.selectedType = val[0]?.[fieldKey];
                        // if (!val.find((item) => item[fieldKey] === this.selectedType)) {
                        //     this.selectedType = val[0][fieldKey];
                        // }
                    }
                }
            },
            value: {
                immediate: true,
                handler(val) {
                    if (this.isFirst && !_.isEmpty(val)) {
                        this.isFirst = false;
                        this.initConditionsList();
                    }
                }
            },
            classifyConditionList() {
                if (this.isClassifySearch && this.counter > 1) {
                    this.initConditionsList();
                }
            },
            // 高级条件监听
            conditionsList: {
                deep: true,
                handler(nv) {
                    // 如果是一行并且字段为空，则返回空数组
                    this.$emit('input', nv);
                    this.onHeightChange();
                }
            },
            // 条件字段发生改变，处理已选条件过滤
            allColumnsList: {
                deep: true,
                handler(nv) {
                    // 条件改变的时候，过滤当前选中的条件，没有的列清除
                    if (!(nv || []).length) {
                        this.conditionsList = [];
                    } else {
                        let filterRes = this.conditionsList.filter((item) => {
                            return !item.field || nv?.find((ite) => item.field == ite.attrName);
                        });
                        this.conditionsList = filterRes && filterRes.length > 0 ? filterRes : [];
                    }
                }
            },
            // 条件选项发生变化
            columnsList: {
                handler(val = []) {
                    if (!this.isClassifySearch) {
                        this.conditionsList.forEach((item) => {
                            // 如果当前所选不在选项内，则置空
                            if (!val.find((column) => column.attrName === item.field)) {
                                item.field = '';
                                item.operator = '';
                                item.value = '';
                            }
                        });
                    }
                }
            },
            initType: {
                immediate: true,
                handler(val) {
                    this.isGroup && (this.selectedType = val);
                }
            },
            selectedType: {
                handler() {
                    this.innerSelectedType = this.getSelectType(this.innerAllConditionList);
                }
            },
            innerSelectedType: {
                handler(val) {
                    this.isGroup && this.$emit('type-change', val);
                }
            },
            showConditionsList: {
                immediate: true,
                handler(val) {
                    this.$emit('changeConditionsList', val);
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
                }
            },
            columnsList() {
                let { innerSelectedType, isGroup } = this;
                let conditionColumnsList = this.conditionColumnsListCopy || [];
                const defaultReqParams = this.defaultReqParams || {};
                if (defaultReqParams.conditionDtoList?.length) {
                    conditionColumnsList = conditionColumnsList.filter((item) => {
                        return !defaultReqParams.conditionDtoList.find((el) => {
                            return el.attrName === item.attrName;
                        });
                    });
                }

                // 如果是条件组，需要根据所选类型，切换可选字段
                if (isGroup) {
                    conditionColumnsList = conditionColumnsList.filter((item) => {
                        return !innerSelectedType || item?.typeDefinitionRef === innerSelectedType;
                    });
                }

                return conditionColumnsList;
            },
            buttonsList() {
                return [
                    // 操作按钮
                    {
                        name: this.i18nMappingObj['search'],
                        type: 'successHanldClick',
                        btnType: 'primary'
                    },
                    // {
                    //     name: this.i18nMappingObj['save'],
                    //     type: 'saveHanldClick',
                    //     btnType: 'default',
                    //     disabled: true
                    // },
                    {
                        name: this.i18nMappingObj['clear'],
                        type: 'resetHanldClick',
                        btnType: 'default'
                    }
                ];
            },
            showConditionsList() {
                return this.conditionsList || [];
            },
            conditionColumnsListCopy() {
                return JSON.parse(JSON.stringify(this.allColumnsList));
            },
            historyFilter() {
                let { i18nMappingObj } = this;
                return {
                    value: '',
                    options: [
                        // {
                        //     label: '所有的',
                        //     value: 1
                        // },
                        // {
                        //     type: 'link',
                        //     label: i18nMappingObj['history_filters_manage'],
                        //     handleClick: () => {}
                        // }
                    ],
                    label: i18nMappingObj['history_filters'],
                    // placeholder: i18nMappingObj['history_filters_select'],
                    placeholder: '实施中，敬请期待',
                    showComponent: 'erd-ex-select'
                };
            },
            isHiddenRemoveBtn() {
                return this.isClassifySearch && !this.isGroup && this.conditionsList.length === 1;
            },
            isHiddenRelationSelect() {
                return this.isClassifySearch && !this.isGroup;
            },
            relationOptions() {
                let { i18nMappingObj } = this;
                return [
                    {
                        value: 'AND',
                        label: i18nMappingObj['and']
                    },
                    {
                        value: 'OR',
                        label: i18nMappingObj['or']
                    }
                ];
            },
            innerAllConditionList() {
                return this.counter <= 2 ? this.value : this.allConditionList;
            },
            fieldOptions() {
                return this.isClassifySearch ? this.classifyConditionList : this.columnsList;
            }
        },
        mounted() {
            this.onHeightChange();
        },
        methods: {
            initConditionsList() {
                // 国际化加载不出来，因此加了定时器
                setTimeout(() => {
                    let { componentNameMapping, getShowComponentConfig, value = [] } = this;
                    this.conditionsList = value.map((item) => {
                        let obj = FamKit.deepClone(item);
                        delete obj.showComponent;
                        if (!Object.prototype.hasOwnProperty.call(obj, 'componentName')) {
                            obj['componentName'] = 'ErdInput';
                        }
                        obj['componentName'] = componentNameMapping(obj['componentName']);
                        if (obj?.componentName?.includes('EnumSelect')) {
                            const enumData = new FormData();
                            enumData.append('realType', obj.dataKey);
                            obj['requestConfig'] = {
                                data: enumData
                            };
                        }
                        let operationList = obj && (obj?.operationList || []);
                        if (!obj.operator) {
                            obj.operator =
                                operationList && operationList.length > 0 ? operationList[0]?.value || '' : '';
                        }
                        let { componentName, props } = getShowComponentConfig(obj);
                        obj.showComponent = componentName;
                        obj.props = props;
                        if (FamKit.isSameComponentName(componentName, 'fam-organization-select')) {
                            obj.dataType = obj.dataType || 'string';
                        }
                        if (
                            FamKit.isSameComponentName(obj.showComponent, 'custom-select') &&
                            obj.oper?.includes('IN') &&
                            !Array.isArray(obj.value)
                        ) {
                            obj.value = obj?.value?.split(',');
                        }
                        if (['BETWEEN', 'NOT_BETWEEN'].includes(obj.operator)) {
                            try {
                                obj.value = obj?.value?.split(',');
                                obj.value1 = obj?.value1?.split(',');
                            } catch (e) {
                                // do nothing
                            }
                            obj._value1 = obj.value[0];
                            obj._value2 = obj.value[1];
                        } else if (['IN', 'NOT_IN'].includes(obj.operator) && obj.value.includes(',')) {
                            try {
                                obj.value = obj?.value?.split(',');
                                obj.value1 = obj?.value1?.split(',');
                            } catch (e) {
                                // do nothing
                            }
                        }
                        if (['IN_ANY_ONE'].includes(obj.operator)) {
                            obj.placeholder = '';
                        }
                        return obj;
                    });
                }, 50);
            },
            // 获取当前选中属性
            getSelectType(innerAllConditionList) {
                const conditionArray = FamKit.TreeUtil.flattenTree2Array(innerAllConditionList, {
                    childrenField: 'childrenList'
                });
                return conditionArray.find((item) => item.field)?.typeDefinitionRef || '';
            },
            // 删除条件
            fnDeleteCondition(row, index) {
                // 如果是条件组，需要提示确认
                if (row.type === 'group') {
                    this.$confirm('是否删除该条件组的所有条件?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning',
                        customClass: 'advanced-group-confirm-box'
                    }).then(() => {
                        this.conditionsList.splice(index, 1);
                        this.selectedType = '';
                    });
                } else {
                    this.conditionsList.splice(index, 1);
                    this.selectedType = '';
                }
            },
            // 子条件组类型切换
            onChildTypeChange(childType) {
                if (this.isGroup) this.selectedType = childType;
            },
            // 选择属性前，校验类型是否会变
            beforeSelect(event, option, row) {
                if (
                    this.isGroup &&
                    (this.selectedType ?? '') !== '' &&
                    option.typeDefinitionRef !== this.selectedType
                ) {
                    this.$confirm('您选择的属性的类型与第一次不同，请确认是否修改?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                        .then(() => {
                            row.field = option.attrName;
                            this.fnSelectColumn(row);
                        })
                        .catch(() => {
                            event.preventDefault();
                        });
                }
            },
            // 选择列
            fnSelectColumn(row, index) {
                let { getShowComponentConfig, componentNameMapping } = this;
                row.value = ''; // 清空原来值
                this.$refs?.[`fam-member-select-${index}`]?.[0]?.clearInput();
                let columnsListOptions = FamKit.deepClone(this.columnsList);
                if (this.isClassifySearch && this.counter > 1) {
                    columnsListOptions = FamKit.deepClone(this.classifyConditionList);
                }
                delete row.showComponent;
                let filterRes = columnsListOptions.filter((item) => item.attrName == row.field);
                if (filterRes && filterRes.length > 0) {
                    let item = filterRes[0];
                    // 把当前选中对象所有key值给当前行，注意，这里不能用ES的扩展运算符，会生成新对象，这样vue无法监听重新渲染数据
                    Object.keys(item).forEach((key) => {
                        if (key !== 'props') {
                            row[key] = item[key];
                        }
                    });
                    // 当类型管理的属性信息，没有配置组件时，设置默认组件为输入框
                    if (!item.hasOwnProperty('componentName')) {
                        row['componentName'] = 'ErdInput';
                    }
                    row['componentName'] = componentNameMapping(row['componentName']);
                    if (row?.componentName?.includes('EnumSelect')) {
                        const enumData = new FormData();
                        enumData.append('realType', row.dataKey);
                        row['requestConfig'] = {
                            data: enumData
                        };
                    }
                    let operationList = item && (item?.operationList || []);
                    row.operator = operationList && operationList.length > 0 ? operationList[0]?.value || '' : '';
                    let { componentName, props } = getShowComponentConfig(row);
                    row.showComponent = componentName;
                    row.props = props;
                    if (componentName === 'fam-organization-select') {
                        row.dataType = row.dataType || 'string';
                    }
                    if (this.isGroup) this.selectedType = row.typeDefinitionRef;
                }
            },
            componentNameMapping(component) {
                const componentMapping = {
                    'fam-code-generator': 'ErdInput',
                    'fam-i18nbasics': 'ErdInput'
                };
                return componentMapping?.[FamKit.hyphenate(component)] || component || 'ErdInput';
            },
            // 清除属性列选择
            fnClearColumn(row) {
                // 其选项设置为全量
                // this.$set(row, 'clearing', true);
                row.field = '';
                row.operator = '';
                row.value = '';
                this.selectedType = this.getSelectType(this.innerAllConditionList);
            },
            // 添加条件弹窗
            fnShowFieldDialog() {
                // 处理已勾选的列
                this.columnsList.forEach((item) => {
                    // 如果当前条件中有选中某个列，则打开选中列时候默认选中，其他不选中
                    if (this.conditionsList.some((ite) => ite.field === item.attrName)) {
                        item.isSelected = true;
                    } else {
                        item.isSelected = false;
                    }
                });
                this.colSettingVisible = true;
            },
            // 选中条件回调函数
            fnFieldSelectCallBack(resp) {
                let { relationOptions, getShowComponentConfig } = this;
                this.selectedCol = resp?.selectedColumns || []; // 选中列
                if (this.selectedCol && this.selectedCol.length > 0) {
                    // 如果当前条件只有一条并且没有选中字段的，直接清空
                    if (
                        this.conditionsList &&
                        this.conditionsList.length === 1 &&
                        this.conditionsList[0]?.field === ''
                    ) {
                        this.conditionsList = [];
                    }
                }
                // 根据选中列生成条件列表
                for (let i = 0; i < this.selectedCol.length; i++) {
                    const item = this.selectedCol[i];
                    let tempObj = JSON.parse(JSON.stringify(this.defaultConditionTemp));
                    tempObj = { ...tempObj, ...item };
                    tempObj.field = item.attrName || '';
                    tempObj.relation = relationOptions[0]?.value;
                    let operationList = item.operationList || [];
                    tempObj.operator = (operationList && operationList.length > 0 && operationList[0]?.value) || '';
                    if (tempObj?.componentName?.includes('EnumSelect')) {
                        const enumData = new FormData();
                        enumData.append('realType', tempObj.dataKey);
                        tempObj['requestConfig'] = {
                            data: enumData
                        };
                    }
                    let { componentName, props } = getShowComponentConfig(tempObj);
                    tempObj.showComponent = componentName;
                    tempObj.props = props;
                    // 如果存在相同字段，则不插入显示
                    if (!this.conditionsList.some((ite) => ite.field === item.attrName)) {
                        this.conditionsList.push(tempObj);
                    }
                }
            },
            // 每个条件的封装组件回调函数
            fnComponentCallback(resp) {
                if (resp) {
                    let findCondition = this.conditionsList.find((ite) => ite.field === resp.field);
                    findCondition && (findCondition.valueDisplayName = resp?.label || '');
                }
            },
            buttonClick(type) {
                this[type]();
            },
            // 确定
            successHanldClick() {
                let { validate, conditionsList, handleConditions } = this;
                if (validate(conditionsList).result) {
                    this.innerVisible = false;
                    this.$emit('onsubmit', handleConditions(conditionsList));
                    return handleConditions(conditionsList);
                } else {
                    this.$message({
                        message: validate(conditionsList).message,
                        type: 'warning',
                        showClose: true
                    });
                }
            },
            // 操作改变
            fnOperChange(item, index) {
                if (item.showComponent?.includes('select') && item.operator?.includes('IN')) {
                    item.value = [];
                    if (this.$refs?.[`fam-member-select-${index}`]) {
                        this.$refs?.[`fam-member-select-${index}`][0].clearInput();
                    }
                }
            },
            // 取消
            saveHanldClick() {
                this.innerVisible = false;
            },
            // 清空/重置
            resetHanldClick() {
                if (this.isClassifySearch) {
                    this.conditionsList = [
                        {
                            type: 'group',
                            relation: 'AND',
                            childrenList: [],
                            referenceList: [],
                            classifyConditionList: []
                        }
                    ];
                } else {
                    this.conditionsList = [];
                }
                this.$emit('onsubmit', []);
                // this.conditionsList = [JSON.parse(JSON.stringify(this.defaultConditionTemp))]
            },
            // 添加条件
            fnAddConditionItem() {
                let { relationOptions } = this;
                this.conditionsList.push({
                    field: '',
                    operator: '',
                    value: '',
                    relation: relationOptions[0]?.value
                });
            },
            // 添加条件组
            fnAddConditionGroup() {
                let { relationOptions } = this;
                this.conditionsList.push({
                    type: 'group',
                    relation: relationOptions[0]?.value,
                    childrenList: []
                });
            },
            // 容器高度变化
            onHeightChange() {
                this.$nextTick(() => {
                    let height = this.$refs?.famAdvancedGroup?.offsetHeight || 0;
                    let marginBottom = height ? 16 : 0;
                    this.$emit('height-change', height + marginBottom);
                });
            },
            // 切换展开收起状态
            changeExpand(toExpand = false) {
                this.isExpand = toExpand;
                this.onHeightChange();
            },
            // 校验空
            validate(conditions = [], isChildren = false) {
                let message = this.i18nMappingObj.tips_no_value;
                if (this.isClassifySearch) {
                    const hasEmptyPrefix = conditions.some(
                        (item) => item.type === 'group' && (!item.prefixType || !item.prefixClassify)
                    );

                    // 分类查询 如果有空值 则校验失败
                    if (hasEmptyPrefix) {
                        return { result: false, message };
                    }
                    const isOnlyConditionGroup = conditions.every(
                        (item) => item.type === 'group' && !item.childrenList?.length
                    );

                    // 分类查询 无子条件 校验通过
                    if (isOnlyConditionGroup) {
                        return { result: true };
                    }
                }
                let result = true;
                if (isChildren && _.isEmpty(conditions)) {
                    result = false;
                }
                for (const element of conditions) {
                    let item = element;
                    let value = item.value;

                    if (['BETWEEN', 'NOT_BETWEEN'].includes(item.operator) && !this.isCustomDate(item.showComponent)) {
                        value = [item._value1, item._value2].filter(Boolean);
                        item.value = value;
                    }
                    let isEmpty = _.isEmpty(value);
                    if (typeof item.value === 'number') {
                        isEmpty = value === '';
                    } else if (typeof item.value === 'boolean') {
                        isEmpty = false;
                    }

                    if (item.childrenList) {
                        let childResult = this.validate(item.childrenList, true);
                        result = childResult.result && result;
                        message = childResult.message;
                    } else if (
                        (isEmpty || !item.operator) &&
                        this.fnOperatorHandle({ operator: item.operator, value: '' })
                    ) {
                        result = false;
                    }
                    const conditionsValue = _.isArray(item.value) ? item.value.join(',') : item.value;
                    const isOverLength = conditionsValue?.length > 500;
                    if (isOverLength) {
                        result = false;
                        message = this.i18nMappingObj.select_too_long;
                    }
                    if (!result) return { result, message };
                }

                return { result, message };
            },
            getConditions() {
                let { validate, conditionsList, handleConditions } = this;
                let { result, message } = validate(conditionsList);
                if (result) {
                    return handleConditions(conditionsList);
                } else {
                    this.$message({
                        message: message,
                        type: 'warning',
                        showClose: true
                    });
                }
            },

            // 高级筛选格式处理
            handleConditions(conditions, parent) {
                let result = [];
                const dateSpecialOper = ['BETWEEN', 'NOT_BETWEEN']; // 日期特殊操作，区间
                const otherSpecialOper = ['IN', 'NOT_IN']; // 其他特殊操作表达式，包含，不包含
                conditions.forEach((item, index) => {
                    let temp = {
                        logicalOperator: item.relation,
                        sortOrder: index,
                        isCondition: item.type !== 'group',
                        id: item.id,
                        oid: item.oid
                    };

                    if (!temp.isCondition && item.childrenList) {
                        temp.children = this.handleConditions(item.childrenList, item);
                    } else {
                        temp.attrName = item.field;
                        temp.oper = item.operator;
                    }

                    if (this.isClassifySearch) {
                        temp.category = 'CLASSIFY';
                        if (item.prefixType) {
                            result.push({
                                attrName: item.prefixAttrName,
                                oper: 'EQ',
                                value1: item.prefixClassifyOid
                            });
                        } else {
                            if (parent) {
                                temp.attrName = `${parent.prefixType}#${parent.prefixClassify}#${item.field}`;
                            }
                        }
                    }

                    // 区间操作
                    if (dateSpecialOper.includes(temp.oper)) {
                        temp.value1 = item.value[0];
                        temp.value2 = item.value[1];
                    } else if (otherSpecialOper.includes(temp.oper) && (item.value ?? '') !== '') {
                        if (Array.isArray(item.value)) {
                            if (item.value?.[0]?.oid) {
                                temp.value1 = item.value.map((item) => item.oid).join(',');
                            } else {
                                temp.value1 = item.value.join(',');
                            }
                        } else {
                            temp.value1 = item.value;
                        }
                    } else {
                        temp.value1 = item.value;
                    }

                    result.push(temp);
                });

                return result;
            },
            fetchConditionByType(typeName) {
                const requestConfig =
                    typeof this.requestConfig === 'function' ? this.requestConfig() : this.requestConfig;
                return this.$famHttp(
                    requestConfig || {
                        url: '/fam/view/getSearchFields',
                        params: {
                            isAttrAddModelName: true,
                            searchCondition: 'RULECONDITION'
                        },
                        method: 'post',
                        data: [typeName]
                    }
                );
            },
            getShowComponentConfig(column) {
                const newColumn = this.conditionColumnsListCopy.find((item) => item.attrName === column.attrName) || {};
                const mergeColumn = { ...newColumn, ...column };
                const initComponentName = mergeColumn.componentName;
                let componentName = this.fnComponentHandle(initComponentName).showComponent;

                let props = {};
                let componentJson = mergeColumn.componentJson;

                try {
                    componentJson = JSON.parse(componentJson);
                } catch (e) {
                    componentJson = {};
                }
                if (FamKit.isSameComponentName(componentName, 'custom-date-time')) {
                    componentJson.props.row = {
                        dateFormat: mergeColumn?.formatPattern || 'yyyy-MM-dd'
                    };
                }
                if (FamKit.isSameComponentName(componentName, 'ErdDatePicker')) {
                    componentJson.props = {
                        ...componentJson.props,
                        format: mergeColumn?.formatPattern || 'yyyy-MM-dd',
                        valueFormat: mergeColumn?.formatPattern || 'yyyy-MM-dd'
                    };
                }
                if (!_.isEmpty(mergeColumn.props) && !FamKit.isSameComponentName(componentName, 'custom-select')) {
                    componentJson.props = { ...componentJson.props, ...mergeColumn.props };
                }

                let { i18nMappingObj } = this;
                let selectConfig = {
                    name: 'erd-ex-select',
                    props: {
                        options: [
                            {
                                label: i18nMappingObj['yes'],
                                value: true
                            },
                            {
                                label: i18nMappingObj['no'],
                                value: false
                            }
                        ]
                    }
                };
                // 布尔、开关等需要以下拉框展示（UCD）
                let transMap = {
                    'fam-boolean': selectConfig,
                    'erd-switch': selectConfig
                };

                if (transMap[componentName]) {
                    props = transMap[componentName].props || {};
                    componentName = transMap[componentName].name;
                } else {
                    props = componentJson?.props || {};
                }
                if (FamKit.isSameComponentName(componentName, 'fam-participant-select')) {
                    props.threeMemberEnv = props.threeMemberEnv ?? false;
                }
                return {
                    componentName,
                    props
                };
            },
            getComponentRow(row) {
                let result = { ...row };
                if (result?.props?.row) {
                    result = { ...result, ...result.props.row };
                }
                return result;
            },
            isCustomDate(showComponent) {
                return FamKit.isSameComponentName(showComponent, 'CustomDateTime');
            }
        }
    };
});
