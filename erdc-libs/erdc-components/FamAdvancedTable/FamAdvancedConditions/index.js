/**
 * 高级搜索条件
 *
 vue组件components引入
 # 组件声明
 components: {
      FamAdvancedConditions: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedConditions/index.js'))
    }

 {
        field: '',          // 字段
        operator: '',       // 操作
        value: '',         // 值
    }
 * **/
/**
 * @module 公共组件
 * @component FamAdvancedConditions -- 高级搜索
 * @props { FamAdvancedConditionsProps } - 移步查看FamAdvancedConditionsProps描述
 * @description 高级搜索公共组件
 * @author Mr.JinFeng
 * @example FamTableToolbar/index.html
 *
 * 组件声明
 * components: {
 *   FamAdvancedConditions: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedConditions/index.js'))
 * }
 *
 * @typedef { Object }   FamAdvancedConditionsProps
 * @property { boolean } visible -- 显示隐藏组件
 * @property { string }  title -- 条件列选择弹框的标题（FamTableColSet）
 * @property { Array<Object> }   conditionColumnsList -- 条件列集合
 * @property { Array<Object> }   conditionDtoListDefault -- 回显默认值
 * @property { boolean } footerBtnShow -- 底部操作按钮是否显示
 * @property { boolean } addFirstConditions -- 是否首次添加一个空条件选择框
 * @property { string }  maxHeight -- 条件弹窗最大高度
 * @property { string }  valueKey -- 条件列选择弹框数据的valueKey，默认oid
 * @property { string }  showLabel -- 条件列选择弹框数据的labelKey，默认label

 * @typedef { Array } conditionColumnsList
 * @typedef { Object } Item -- 条件每列的项介绍，必须要的字段
 * @property { string } field -- 选中列model字段
 * @property { string } operator -- 操作表达式model字段
 * @property { string } componentName -- 根据字段类型映射的表单组件名称
 * @property { string } showComponent -- 当前字段+操作表达式，需要显示的组件名（比如日期+区间需要显示日期范围框）
 * @property { Object<T> } value -- 当前条件的表单值
 * @events TODO
 */
define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/FamAdvancedConditions/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/FamAdvancedConditions/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    var vmOptions = function () {
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
                conditionColumnsList: {
                    type: Array,
                    default() {
                        return [];
                    }
                },
                conditionDtoListDefault: {
                    type: Array | String,
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
                }
            },
            data() {
                return {
                    colSettingVisible: false, // 添加条件弹框（选择属性/列）
                    defaultConditionTemp: {
                        field: '',
                        operator: '',
                        operationList: [],
                        value: '',
                        fieldType: '',
                        valueDisplayName: ''
                    }, // 默认高级搜索条件模板对象
                    conditionsList: [], // 高级搜索条件
                    selectedCol: [], // 选中的字段
                    // 国际化locale文件地址
                    i18nLocalePath: ELMP.resource(
                        'erdc-components/FamAdvancedTable/FamAdvancedConditions/locale/index.js'
                    ),
                    // // 国际化页面引用对象
                    i18nMappingObj: this.getI18nKeys([
                        '添加条件',
                        '请输入',
                        '请选择',
                        '确定',
                        '取消',
                        '清空',
                        '已选条件请输入值'
                    ])
                };
            },
            components: {
                FamTableColSet: FamKit.asyncComponent(
                    ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
                )
            },
            watch: {
                // 高级条件监听
                conditionsList: {
                    deep: true,
                    handler(nv) {
                        // 如果是一行并且字段为空，则返回空数组
                        let newVal = nv;
                        if (nv && nv.length == 1 && nv.find((ite) => !ite.field)) newVal = [];
                        this.$emit('input', newVal);
                    }
                },
                // 条件字段发生改变，处理已选条件过滤
                conditionColumnsList: {
                    deep: true,
                    handler(nv) {
                        // 条件改变的时候，过滤当前选中的条件，没有的列清除
                        if (!(nv || []).length) {
                            this.conditionsList = [
                                {
                                    field: '',
                                    operator: '',
                                    value: ''
                                }
                            ];
                        } else {
                            let filterRes = this.conditionsList.filter((ite) => {
                                return nv?.find((item) => item.attrName == ite.field);
                            });
                            this.conditionsList =
                                filterRes && filterRes.length > 0
                                    ? filterRes
                                    : [
                                          {
                                              field: '',
                                              operator: '',
                                              value: ''
                                          }
                                      ];
                        }
                    }
                },
                // 默认条件
                conditionDtoListDefault: {
                    deep: false,
                    immediate: true,
                    handler(nv) {
                        if (nv && nv.length > 0) {
                            // 如果条件行是空，直接清空
                            if (
                                this.conditionsList &&
                                this.conditionsList.length === 1 &&
                                this.conditionsList.find((ite) => ite.field == '')
                            )
                                this.conditionsList = [];
                            nv.forEach((item) => {
                                if (item?.componentName?.includes('EnumSelect')) {
                                    const enumData = new FormData();
                                    enumData.append('realType', item.dataKey);
                                    item['requestConfig'] = {
                                        data: enumData
                                    };
                                }
                                this.conditionsList.push({
                                    field: item.attrName,
                                    ...item,
                                    showComponent:
                                        item.showComponent || this.fnComponentHandle(item.componentName).showComponent
                                });
                            });
                        } else if (
                            this.addFirstConditions &&
                            !this.conditionDtoListDefaul?.length &&
                            this.conditionsList.length === 0
                        ) {
                            // 如果没有默认条件，默认添加一条
                            this.conditionsList.push({
                                field: '',
                                operator: '',
                                value: ''
                            });
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
                    }
                },
                columnsList() {
                    let conditionColumnsList = this.conditionColumnsList || [];
                    const defaultReqParams = this.defaultReqParams || {};
                    if (defaultReqParams.conditionDtoList?.length) {
                        conditionColumnsList = conditionColumnsList.filter((item) => {
                            return !defaultReqParams.conditionDtoList.find((el) => {
                                return el.attrName === item.attrName;
                            });
                        });
                    }
                    return conditionColumnsList;
                },
                buttonsList() {
                    return [
                        // 操作按钮
                        {
                            name: this.i18nMappingObj['确定'],
                            type: 'successHanldClick',
                            btnType: 'primary'
                        },
                        {
                            name: this.i18nMappingObj['取消'],
                            type: 'cancelHanldClick',
                            btnType: 'default'
                        },
                        {
                            name: this.i18nMappingObj['清空'],
                            type: 'resetHanldClick',
                            btnType: 'default'
                        }
                    ];
                },
                showConditionsList() {
                    return this.conditionsList || [];
                }
            },
            created() {},
            mounted() {},
            methods: {
                // 删除条件
                fnDeleteCondition(row, index) {
                    this.conditionsList.splice(index, 1);
                },
                // 选择列
                fnSelectColumn(row) {
                    row.value = ''; // 清空原来值
                    let filterRes = this.columnsList.filter((item) => item.attrName == row.field);
                    if (filterRes && filterRes.length > 0) {
                        let item = filterRes[0];
                        // 把当前选中对象所有key值给当前行，注意，这里不能用ES的扩展运算符，会生成新对象，这样vue无法监听重新渲染数据
                        Object.keys(item).forEach((key) => {
                            row[key] = item[key];
                        });
                        // 当类型管理的属性信息，没有配置组件时，设置默认组件为输入框
                        if (!item.hasOwnProperty('componentName')) {
                            row['componentName'] = 'ErdInput';
                        }
                        if (row?.componentName?.includes('EnumSelect')) {
                            const enumData = new FormData();
                            enumData.append('realType', row.dataKey);
                            row['requestConfig'] = {
                                data: enumData
                            };
                        }
                        let operationList = item && (item?.operationList || []);
                        row.operator = operationList && operationList.length > 0 && (operationList[0]?.value || '');
                        row.showComponent = this.fnComponentHandle(row.componentName).showComponent;
                    }
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
                        let operationList = item.operationList || [];
                        tempObj.operator = (operationList && operationList.length > 0 && operationList[0]?.value) || '';
                        if (tempObj?.componentName?.includes('EnumSelect')) {
                            const enumData = new FormData();
                            enumData.append('realType', tempObj.dataKey);
                            tempObj['requestConfig'] = {
                                data: enumData
                            };
                        }
                        tempObj.showComponent = this.fnComponentHandle(tempObj.componentName).showComponent;
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
                        if (findCondition) {
                            findCondition.valueDisplayName = resp?.label || '';
                        }
                    }
                },
                buttonClick(type) {
                    this[type]();
                },
                // 确定
                successHanldClick() {
                    const hasEmptyFiled =
                        !this.conditionsList.findIndex((ite) => {
                            return ite.operator !== 'IS_NULL' && ite.operator !== 'IS_NOT_NULL'
                                ? ite.value ?? '' === ''
                                : false;
                        }) !== -1;
                    if (hasEmptyFiled) {
                        this.innerVisible = false;
                        let callResp = this.conditionsList.map((item) => {
                            let findFieldRes = this.columnsList.find((ite) => ite.attrName === item.field);
                            let findOper = item.operationList.find((ite) => ite.value === item.operator);
                            let componentTranslation = this.$store.getters['component/componentTranslation'](
                                item?.componentName
                            );
                            let operVal =
                                typeof componentTranslation === 'function'
                                    ? componentTranslation({ value: item?.value })
                                    : item?.value;

                            item['displayString'] = `${findFieldRes?.label} ${findOper?.displayName} ${
                                item.valueDisplayName || operVal || item.value
                            }`;
                            return item;
                        });
                        this.$emit('onsubmit', callResp);
                    } else {
                        this.$message({
                            message: this.i18nMappingObj['已选条件请输入值'],
                            type: 'warning',
                            showClose: true
                        });
                    }
                },
                // 操作改变
                fnOperChange(item) {
                    if (item.showComponent?.includes('select') && item.operator?.includes('IN')) {
                        item.value = [];
                    }
                },
                // 取消
                cancelHanldClick() {
                    this.innerVisible = false;
                },
                // 清空/重置
                resetHanldClick() {
                    this.conditionsList = [];
                    // this.conditionsList = [JSON.parse(JSON.stringify(this.defaultConditionTemp))]
                }
            }
        };
    };
    return vmOptions();
});
