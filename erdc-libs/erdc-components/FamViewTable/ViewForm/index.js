/**
 * @module 视图
 * @component ViewForm
 * @props { ViewFormProps } - props参数引用
 * @description 视图表单
 * @author Mr.JinFeng
 * @example
 *  <!-- 表单组件 -->
 *  <view-form ref="viewForm"
 v-if="viewForm.visible"
 :oid="viewForm.oid"
 :row="viewRow"
 :table-row="row"
 :table-key="row?.tableKey"
 :visible="viewForm.visible"
 :editable="viewForm.editable"
 :view-type="viewType"
 @form-change="fnFormChange">
  </view-form>
  * 组件声明
  * components: {
  *   viewForm: FamKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/viewForm/index.js'))
  * }
 *
 * @typedef { Object } ViewFormProps
 * @property { string } oid -- 视图数据oid，编辑时候必传
 * @property { boolean } editable -- 是否编辑
 * @property { boolean } readonly -- 是否只读
 * @property { boolean } saveAs -- 是否另存为操作，另存为不需要传递oid，但是要回显当前另存为数据
 * @property { Object } row -- 表单数据，另存为时候通过row来回显
 * @property { String } viewType -- 视图类型（system: 系统，person：个人）
 * @property { String } tableKey -- 视图表格应用key
 * @property { String } tableRow -- 当前视图表格应用行数据

 * @events TODO
 */
define([
    'text!' + ELMP.resource('erdc-components/FamViewTable/ViewForm/template.html'),
    ELMP.resource('erdc-components/FamErdTable/index.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamViewTable/ViewForm/style.css')
], function (template, FamErdTable, utils) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');
    return {
        template,
        components: {
            FiltersConfig: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamViewTable/ViewForm/components/FiltersConfig/index.js')
            ),
            FamErdTable
        },
        props: {
            oid: String,
            editable: {
                type: Boolean,
                default: false
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            // 另存为
            saveAs: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            // 视图行
            row: {
                type: [Object, String],
                default() {
                    return '';
                }
            },
            // 视图类型（system: 系统，person：个人）
            viewType: {
                type: String,
                default() {
                    return 'system';
                }
            },
            // 表格主key
            tableKey: {
                type: String,
                default() {
                    return '';
                }
            },
            // 表格应用行
            tableRow: {
                type: Object,
                default() {
                    return {};
                }
            },
            baseFilterFieldDtos: {
                type: Array,
                default: () => []
            },
            isRelationType: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                form: {
                    frozenType: 'left'
                },
                showForm: false,
                isChanged: false,
                fieldList: [],
                conditionsColumns: [],
                containerId: '',
                shareEnumList: [],
                shareDefault: '',
                hyperLinkDialog: false,
                hiperLinkFormData: {
                    isHyperlink: false,
                    hyperlinkUrl: ''
                },
                tableData: [],
                currentFieldRow: {},
                conditionDtoListDefault: [], // 默认条件
                typeSelected: [],
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamViewTable/ViewForm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    视图名称: this.getI18nByKey('视图名称'),
                    描述: this.getI18nByKey('描述'),
                    设置视图条件: this.getI18nByKey('设置视图条件'),
                    setBasicFilter: this.getI18nByKey('setBasicFilter'),
                    设置显示字段: this.getI18nByKey('设置显示字段'),
                    是否分享: this.getI18nByKey('是否分享'),
                    全局分享: this.getI18nByKey('全局分享'),
                    上下文内分享: this.getI18nByKey('上下文内分享'),
                    不分享: this.getI18nByKey('不分享'),
                    冻结列数: this.getI18nByKey('冻结列数'),
                    已选条件请输入值: this.getI18nByKey('已选条件请输入值'),

                    // 全局定义的国际化
                    type: this.getI18nByKey('类型'),
                    请选择: this.getI18nByKey('请选择'),
                    请输入: this.getI18nByKey('请输入'),
                    请填入正确的信息: this.getI18nByKey('请填入正确的信息'),
                    从左到右冻结的列数: this.getI18nByKey('从左到右冻结的列数'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    updateSuccess: this.getI18nByKey('更新成功'),
                    tips_no_value: this.getI18nByKey('已添加条件请输入值'),
                    select_too_long: this.getI18nByKey('选择条件字符超长'),
                    rightTipSort: this.getI18nByKey('rightTipSort'),
                    rightTipTip: this.getI18nByKey('rightTipTip'),
                    rightTipDisplay: this.getI18nByKey('rightTipDisplay'),
                    rightTipLock: this.getI18nByKey('rightTipLock'),
                    listDisplayConfig: this.getI18nByKey('listDisplayConfig'),
                    loadType: this.getI18nByKey('loadType'),
                    dynamicLoad: this.getI18nByKey('dynamicLoad'),
                    pagination: this.getI18nByKey('pagination'),
                    freezeColCount: this.getI18nByKey('freezeColCount'),
                    leftToRight: this.getI18nByKey('leftToRight'),
                    rightToLeft: this.getI18nByKey('rightToLeft'),
                    moreThan3Tip: this.getI18nByKey('moreThan3Tip')
                },
                fieldTypeList: [],
                fieldCategoryData: [],
                rowConfigRows: [],
                leftSideSearchKey: '',
                rightSideSearchKey: '',
                selectValue: 'all',
                typeOids: [],
                sortDescendList: [],
                selectedFilterIds: [],
                selectedFiltersCopy: [],
                allFilters: []
            };
        },
        computed: {
            selectedTypeDisplayName() {
                return this.buttons?.find((btn) => btn.typeName === this.selectValue)?.displayName;
            },
            isSubmeter() {
                return this.rowConfigRows.some((item) => item.defType !== 0);
            },
            rowConfig() {
                const rowConfig = this.rowConfigRows.find((item) => this.form.typeNames?.includes(item.typeName));
                this.rowConfigRows.forEach((item) => {
                    if (_.isEmpty(this.form.typeNames)) {
                        item.disabled = false;
                    } else if (rowConfig?.defType === 1 && rowConfig?.typeName !== item.typeName) {
                        item.disabled = true;
                    } else if (rowConfig?.defType === 0 && item.defType === 1) {
                        item.disabled = true;
                    }
                });
                return {
                    componentName: 'constant-select',
                    viewProperty: 'displayName',
                    valueProperty: 'typeName',
                    referenceList: this.rowConfigRows
                };
            },

            rightTableColumns() {
                const editRender = { autofocus: '.el-input__inner' };
                return [
                    {
                        title: this.i18n.name,
                        prop: 'label'
                    },
                    {
                        title: this.i18n['宽度'] + '(px)',
                        prop: 'width',
                        editRender: { autofocus: '.el-input__inner' }
                    },
                    {
                        title: this.i18n.href,
                        prop: 'isHyperlink',
                        editRender
                    },
                    {
                        title: this.i18n['排序'],
                        prop: 'sortDescend',
                        editRender
                    },
                    {
                        title: 'Tips',
                        prop: 'toolTipsAble',
                        editRender
                    },
                    {
                        title: this.i18n['默认显示'],
                        prop: 'isShow',
                        editRender
                    },
                    {
                        title: this.i18n.operation,
                        width: 65,
                        prop: 'operation',
                        icon: ''
                    }
                ];
            },
            // 条件字段列表
            conditionsColumnsList: {
                get() {
                    return this.conditionsColumns;
                },
                set(vals) {
                    this.allFilters = vals;
                    this.conditionsColumns = vals;
                }
            },
            buttons() {
                let buttons = this.rowConfigRows.filter((item) => {
                    return this.form.typeNames.includes(item.typeName);
                });
                buttons.unshift({
                    typeName: 'all',
                    displayName: '全部'
                });
                return buttons;
            },
            formLayout() {
                let layout = [
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: '基本信息',
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'nameI18nJson',
                                component: 'FamI18nbasics',
                                label: this.i18nMappingObj['视图名称'],
                                required: this.readonly ? false : true,
                                props: {
                                    clearable: false,
                                    i18nName: this.i18nMappingObj['视图名称']
                                },
                                col: 12,
                                slots: {}
                            },
                            {
                                field: 'typeNames',
                                component: 'custom-select',
                                label: this.i18nMappingObj['type'],
                                required: true,
                                defaultValue: [],
                                validators: [
                                    {
                                        trigger: ['blur', 'change'],
                                        validator: (rule, value, callback) => {
                                            if ((_.isArray(value) && !value.length) || !value) {
                                                callback(
                                                    new Error(
                                                        `${this.i18nMappingObj['请选择']} ${this.i18nMappingObj.type}`
                                                    )
                                                );
                                            } else {
                                                callback();
                                            }
                                        }
                                    }
                                ],
                                props: {
                                    clearable: true,
                                    filterable: true,
                                    multiple: true,
                                    showCheckAll: !this.isSubmeter,
                                    placeholder: this.i18nMappingObj['请选择'],
                                    props: {
                                        disabled: 'disabled'
                                    },
                                    row: this.rowConfig
                                },
                                listeners: {
                                    change: (vals) => {
                                        this.typeOids = vals;
                                        // 获取条件列数据
                                        this.fnGetConditionsField(vals);
                                        // 获取列
                                        this.fnGetFieldList(vals);
                                    },
                                    callback: ({ selected }) => {
                                        this.typeSelected = selected;
                                        this.fieldTypeList = selected.map((item) => {
                                            return {
                                                displayName: item.displayName,
                                                id: item.typeOid,
                                                typeName: item.typeName
                                            };
                                        });
                                    }
                                },
                                col: 12
                            },
                            {
                                field: 'published',
                                label: this.i18nMappingObj['是否分享'],
                                component: 'slot',
                                required: true,
                                defaultValue: this.shareDefault,
                                props: {
                                    name: 'share'
                                },
                                col: 12
                            },
                            {
                                field: 'descriptionI18nJson',
                                component: 'FamI18nbasics',
                                label: this.i18nMappingObj['描述'],
                                validators: [],
                                props: {
                                    type: 'textarea',
                                    row: 3,
                                    clearable: true,
                                    i18nName: this.i18nMappingObj['描述']
                                },
                                col: 24,
                                slots: {}
                            }
                        ]
                    },
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18nMappingObj['setBasicFilter'],
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                class: 'filters-col',
                                field: 'filters',
                                label: '',
                                component: 'slot',
                                props: {
                                    name: 'filters'
                                },
                                col: 24
                            }
                        ]
                    },
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18nMappingObj['设置显示字段'],
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'showColumns',
                                label: '',
                                component: 'slot',
                                props: {
                                    name: 'showcolumns'
                                },
                                col: 24
                            }
                        ]
                    },
                    {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18nMappingObj.listDisplayConfig,
                        props: {
                            unfold: true,
                            style: {
                                marginTop: '16px',
                                marginBottom: '16px'
                            }
                        },
                        children: [
                            {
                                field: 'loadType',
                                label: this.i18nMappingObj.loadType,
                                component: 'FamRadio',
                                disabled: this.isRelationType,
                                props: {
                                    type: 'radio',
                                    options: [
                                        {
                                            label: this.i18n.dynamicLoad,
                                            value: 'dynamicLoad'
                                        },
                                        {
                                            label: this.i18n.pageLoad,
                                            value: 'pageLoad'
                                        }
                                    ]
                                },
                                defaultValue: 'dynamicLoad',
                                col: 12
                            },
                            {
                                field: 'frozenColumns',
                                label: this.i18nMappingObj.freezeColCount,
                                component: 'slot',
                                props: {
                                    name: 'freeze'
                                },
                                defaultValue: '0',
                                col: 12
                            }
                        ]
                    }
                ];
                // 是否允许添加条件
                if (this.tableRow?.enabledFilter) {
                    // 在第三个字段后增加条件字段
                    layout.splice(1, 0, {
                        col: 24,
                        component: 'fam-classification-title',
                        label: this.i18nMappingObj['设置视图条件'],
                        props: {
                            unfold: true
                        },
                        children: [
                            {
                                field: 'conditions',
                                component: 'FamAdvancedGroup',
                                label: '',
                                validators: [],
                                props: {
                                    footerBtnShow: false,
                                    conditionColumnsList: this.conditionsColumnsList,
                                    fieldTypeList: this.fieldTypeList
                                },
                                col: 24
                            }
                        ]
                    });
                }
                return layout;
            },
            hiperLinkFormConfig() {
                return [
                    {
                        field: 'isHyperlink',
                        component: 'slot',
                        props: {
                            name: 'hyper-link-config'
                        },
                        label: this.i18n.fieldLink,
                        col: 24
                    },
                    {
                        field: 'hyperlinkUrl',
                        component: 'erd-input',
                        label: this.i18n.linkAddress,
                        hidden: !this.hiperLinkFormData.isHyperlink,
                        tooltip: this.hyperlinkUrlTooltip,
                        props: {
                            clearable: false,
                            maxlength: '1000',
                            placeholder: this.i18n['请输入'],
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 24
                    },

                    // 增加隐藏占位表单项, 避免高级表单只有一个表单项时 回车键刷新
                    {
                        field: 'inputOccupancy',
                        component: 'erd-input',
                        hidden: true
                    }
                ];
            },
            sortDescendRow() {
                return {
                    componentName: 'constant-select',
                    viewProperty: 'value',
                    valueProperty: 'name',
                    referenceList: this.sortDescendList
                };
            },
            commonOptions() {
                return [
                    {
                        value: true,
                        label: this.i18n.yes
                    },
                    {
                        value: false,
                        label: this.i18n.no
                    }
                ];
            },
            sortOptions() {
                return [
                    {
                        value: 'NONE_DEFAULT',
                        label: this.i18n.have
                    },
                    {
                        value: 'NONE',
                        label: this.i18n.none
                    }
                ];
            },
            filteredTableData() {
                return this.tableData.filter((item) => item.label.includes(this.rightSideSearchKey));
            },
            hyperlinkUrlTooltip() {
                const template = `
                    <div>
                        <div>${this.i18n.linkTipPart1}</div>
                        <div>${this.i18n.linkTipPart2}</div>
                        <div>${this.i18n.linkTipPart3}</div>
                        <div>${this.i18n.linkTipPart4}</div>
                        <div>${this.i18n.linkTipPart5}</div>
                        <div>${this.i18n.linkTipPart6}</div>
                        <div>${this.i18n.linkTipPart7}</div>
                    </div>
                `;
                return template;
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(oid) {
                    if (oid) {
                        this.fetchDetailByOid();
                    } else {
                        this.setDefaultFilterIds();
                    }
                }
            },
            row: {
                immediate: true,
                handler() {
                    // 如果是另存为，需要回显传入row数据
                    if (this.saveAs) {
                        this.fnSaveAsView();
                    }
                }
            },
            tableData: {
                deep: true,
                immediate: true,
                handler(value) {
                    this.form.showColumns = FamKit.deepClone(value);
                }
            }
        },
        created() {
            // this.tableKey = this.row?.tableKey || ''
            this.containerId = this.$store?.state?.app?.container?.oid;
            this.fnGetShareEnumList();
        },
        mounted() {
            // 如果不是编辑，直接展示表单，否则编辑情况下先等详情查询完再展示
            if (!this.editable) {
                this.showForm = true;
            }
            this.getTypesRow();
            setTimeout(() => {
                require(['erdc-idle', 'sortablejs'], function ({ registerIdleTask }, Sortable) {
                    registerIdleTask(() => {
                        this.sortableInit(Sortable);
                    });
                });
            }, 1000);
            // this.getSortDescendData();
        },
        beforeDestroy() {
            this.sortable && this.sortable.destroy();
        },
        methods: {
            openHyperLinkDialog(row) {
                const hyperlinkCols = this.tableData?.filter((item) => item.isHyperlink);
                if (!row.isHyperlink && hyperlinkCols?.length >= 3) {
                    this.$message.warning(this.i18nMappingObj.moreThan3Tip);
                    return;
                }
                this.currentFieldRow = row;
                this.hyperLinkDialog = true;
                this.hiperLinkFormData.isHyperlink = row.isHyperlink;
                this.hiperLinkFormData.hyperlinkUrl = row.hyperlinkUrl;
            },
            isMultiple(oper) {
                const otherSpecialOper = ['IN', 'NOT_IN'];
                return otherSpecialOper.includes(oper);
            },
            leftSearchKeyChange(value) {
                this.$refs.transfer.setSidesConfig('leftSide', 'searchKey', value);
            },
            rightSearchKeyChange(value) {
                this.$refs.transfer.setSidesConfig('rightSide', 'searchKey', value);
            },
            selectValueChange(value) {
                if (value === 'all' || !value) {
                    this.fnGetFieldList(this.typeOids);
                } else {
                    this.fnGetFieldList([value]);
                }
            },
            getTypesRow() {
                this.$famHttp({
                    url: '/fam/view/getViewTypes',
                    data: {
                        tableKey: this.tableKey, // 表格key
                        containerOid: this.containerId || ''
                    }
                }).then((resp) => {
                    this.rowConfigRows = resp?.data || [];
                });
            },
            // 另存为回显
            fnSaveAsView() {
                let newRow = $.extend(true, {}, this.row);
                this.fnHandlerViewFormData(newRow);
            },
            // 获取分享枚举数据
            fnGetShareEnumList() {
                const enumData = new FormData();
                enumData.append('realType', 'erd.cloud.core.principal.enums.TableViewPublishedEnum');
                // 获取枚举默认配置
                let config = this.fnComponentHandle('enum-select', true)?.componentConfigs || {};
                config['data'] = enumData;
                this.$famHttp(config).then((resp) => {
                    let resultData = resp?.data || [];
                    if (this.viewType === 'system') {
                        resultData = resultData.filter((item) => {
                            return item.value !== 'CONTEXT_PUBLISH';
                        });
                    }
                    if (resultData && resultData.length > 0) {
                        this.shareDefault = resultData[0].value; // 默认值
                    }
                    this.shareEnumList = resultData;
                });
            },
            // 获取条件列
            fnGetConditionsField(typeOids, cb) {
                if (typeOids && typeOids.length > 0) {
                    this.$famHttp({
                        url: `/fam/view/getSearchFields`,
                        method: 'post',
                        params: {
                            isAttrAddModelName: true,
                            tableKey: this.tableKey,
                            searchCondition: 'VIEWSEARCH'
                        },
                        data: typeOids
                    }).then((resp) => {
                        this.conditionsColumnsList = resp?.data || [];
                        cb && cb(this.conditionsColumnsList);
                    });
                } else {
                    this.conditionsColumnsList = [];
                }
            },
            // 获取字段数据
            fnGetFieldList(typeOids) {
                return new Promise((resolve) => {
                    if (typeOids && typeOids.length > 0) {
                        this.$famHttp({
                            url: `/fam/view/getFieldsByType?isAttrAddModelName=true&tableKey=${this.tableKey}`,
                            method: 'post',
                            data: typeOids
                        }).then((resp) => {
                            let res = resp?.data || [];
                            // 过滤关系属性
                            let fieldData = res.filter((item) => item.attributeCategory !== 'RELATION');
                            this.fieldList = fieldData.map((item, index) => {
                                item['sortOrder'] = index;
                                item['sortDescend'] = 'NONE';
                                item['isDisable'] = item.disabled ?? false;
                                item['width'] = item?.width || 100;
                                item['isHyperlink'] = false;
                                item['locked'] = Boolean(item.locked);
                                item['isShow'] = true;
                                item['toolTipsAble'] = false;
                                return item;
                            });
                            this.tableData = this.fieldList.filter((item) => item.baseField);
                            resolve(this.fieldList);
                        });
                    } else {
                        this.fieldList = [];
                        resolve(this.fieldList);
                    }
                });
            },
            // 校验空
            validate(conditions = [], isChildren = false) {
                let { fnOperatorHandle } = this;
                let result = true;
                let message = this.i18nMappingObj.tips_no_value;
                if (isChildren && _.isEmpty(conditions)) {
                    result = false;
                }
                for (let i = 0; i < conditions.length; i++) {
                    let item = conditions[i];
                    const itemValue = item?.value;
                    let isEmpty = _.isEmpty(itemValue);
                    if (typeof itemValue === 'number') {
                        isEmpty = itemValue === '';
                    }
                    if (typeof itemValue === 'boolean') {
                        isEmpty = false;
                    }
                    if (item.childrenList) {
                        let childResult = this.validate(item.childrenList, true);
                        result = childResult.result && result;
                        message = childResult.message;
                    } else if (
                        (isEmpty || !item.operator) &&
                        fnOperatorHandle({ operator: item.operator, value: '' })
                    ) {
                        result = false;
                    }
                    const conditionsValue = _.isArray(itemValue) ? itemValue.join(',') : itemValue;
                    const isOverLength = conditionsValue?.length > 500;
                    if (isOverLength) {
                        result = false;
                        message = this.i18nMappingObj.select_too_long;
                    }
                    if (!result) return { result, message };
                }

                return { result, message };
            },
            getFieldLabel(row, prop) {
                let label;
                if (prop === 'sortDescend') {
                    label = this.sortOptions.find((item) => item.value === row[prop])?.label;
                } else {
                    label = this.commonOptions.find((item) => item.value === row[prop])?.label;
                }
                return label || '';
            },
            onWidthBlur(row) {
                const regExp = /^([1-9]\d*|0)(\.\d{1,2})?$/;
                let width = row.width;
                if (!regExp.test(width)) {
                    width = '100';
                } else if (width <= 0 || width > 2000) {
                    width = '100';
                }
                this.$set(row, 'width', width);
            },
            fieldToogleLock(row) {
                for (let item of this.tableData) {
                    if (item.oid === row.oid) {
                        item.locked = !item.locked;
                        if (item.locked) {
                            item.isShow = true;
                        }
                        break;
                    }
                }
            },
            onDeleteAll() {
                this.tableData = [];
            },
            fieldRemove(row) {
                this.tableData = this.tableData.filter((item) => item.oid !== row.oid);
            },
            onHyperLinkSave() {
                this.tableData = this.tableData.map((item) => {
                    if (item.attrName === this.currentFieldRow.attrName) {
                        item.isHyperlink = this.hiperLinkFormData.isHyperlink;
                        item.hyperlinkUrl = this.hiperLinkFormData.hyperlinkUrl;
                    }
                    return item;
                });
                this.hyperLinkDialog = false;
            },
            submit() {
                let { getFormFields } = this;
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    const validate = this.validate(this.form.conditions);
                    if (!validate.result) {
                        reject();
                        return this.$message({
                            message: validate.message,
                            type: 'warning',
                            showClose: true
                        });
                    }
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 过滤只取当前表单显示的字段，特殊字段额外增加数组处理
                                const excludeAttrs = [''];
                                const includeAttrs = getFormFields(this.formLayout || []).filter(
                                    (item) => !excludeAttrs.includes(item)
                                );
                                let attrRawList = _.filter(dynamicForm.serialize(), (item) =>
                                    _.includes(includeAttrs, item.attrName)
                                );
                                // 处理请求参数
                                // 条件和类型
                                let relationList = [];
                                attrRawList.forEach((item) => {
                                    // 如果是国际化，需要解析里面的值放到value里面
                                    if (item.attrName.includes('I18nJson')) {
                                        item.value = item.value?.value;
                                    }
                                    // 条件
                                    if (item.attrName === 'conditions') {
                                        item.value && item.value.length > 0
                                            ? relationList.push(
                                                  ...item.value.map((item, index) => {
                                                      let dateSpecialOper = ['BETWEEN', 'NOT_BETWEEN']; // 日期特殊操作，区间

                                                      let getConditionParams = (data, order) => {
                                                          let temp = {
                                                              attrRawList: [
                                                                  {
                                                                      attrName: 'sortOrder',
                                                                      value: order
                                                                  },
                                                                  {
                                                                      attrName: 'logicalOperator',
                                                                      value: data.relation
                                                                  },
                                                                  {
                                                                      attrName: 'isCondition',
                                                                      value: data.type === 'group' ? 0 : 1
                                                                  }
                                                              ],
                                                              className: this.$store.getters.className('RuleCondition')
                                                          };

                                                          if (data.type === 'group' && data.childrenList) {
                                                              temp.associationField = 'parentRef';
                                                              temp.relationList = data.childrenList.map(
                                                                  (child, index) => {
                                                                      return getConditionParams(child, index);
                                                                  }
                                                              );
                                                          } else {
                                                              temp.attrRawList.push(
                                                                  ...[
                                                                      {
                                                                          attrName: 'attrName',
                                                                          value: data.attrName
                                                                      },
                                                                      {
                                                                          attrName: 'oper',
                                                                          value: data.operator
                                                                      }
                                                                  ]
                                                              );
                                                          }
                                                          // 如果是区间操作，则要赋值两个值
                                                          if (dateSpecialOper.includes(data.operator)) {
                                                              temp.attrRawList.push(
                                                                  ...[
                                                                      {
                                                                          attrName: 'value1',
                                                                          value: data.value[0]
                                                                      },
                                                                      {
                                                                          attrName: 'value2',
                                                                          value: data.value[1]
                                                                      }
                                                                  ]
                                                              );
                                                          } else {
                                                              let val = data.value;
                                                              if (
                                                                  FamKit.isSameComponentName(
                                                                      data.componentName,
                                                                      'FamOrganizationSelect'
                                                                  )
                                                              ) {
                                                                  val = _.isArray(data.value)
                                                                      ? data.value.map((item) => item.oid)
                                                                      : data.value;
                                                              }
                                                              // 特殊情况操作，是多选的，转成逗号隔开
                                                              if (this.isMultiple(data.operator)) {
                                                                  val =
                                                                      Object.prototype.toString.call(val) ===
                                                                      '[object Array]'
                                                                          ? (val || []).join(',')
                                                                          : val;
                                                              }
                                                              data.type !== 'group' &&
                                                                  !_.isUndefined(val) &&
                                                                  temp.attrRawList.push({
                                                                      attrName: 'value1',
                                                                      value: val
                                                                  });
                                                          }

                                                          return temp;
                                                      };

                                                      return getConditionParams(item, index);
                                                  })
                                              )
                                            : '';
                                    }
                                    // 类型

                                    if (item.attrName === 'showColumns') {
                                        let selectedColumnsList = item?.value || [];
                                        if (selectedColumnsList?.length) {
                                            relationList.push(
                                                ...selectedColumnsList.map((item, index) => {
                                                    let temp = {
                                                        attrRawList: [
                                                            {
                                                                attrName: 'attrName',
                                                                value: item.attrName
                                                            },
                                                            {
                                                                attrName: 'attrRef',
                                                                value: item.attrRef || item.oid
                                                            },
                                                            {
                                                                attrName: 'width',
                                                                value: item.width || 100
                                                            },
                                                            {
                                                                attrName: 'isHyperlink',
                                                                value: item.isHyperlink ?? false
                                                            },
                                                            {
                                                                attrName: 'hyperlinkUrl',
                                                                value: item.hyperlinkUrl ?? ''
                                                            },
                                                            {
                                                                attrName: 'sortOrder',
                                                                value: index + 1
                                                            },
                                                            {
                                                                attrName: 'sortDescend',
                                                                value: item.sortDescend || 'NONE'
                                                            },
                                                            {
                                                                attrName: 'toolTipsAble',
                                                                value: item.toolTipsAble ?? false
                                                            },
                                                            {
                                                                attrName: 'isShow',
                                                                value: item.isShow ?? false
                                                            },
                                                            {
                                                                attrName: 'locked',
                                                                value: item.locked ?? false
                                                            },
                                                            {
                                                                attrName: 'hidden',
                                                                value: false
                                                            }
                                                        ],
                                                        className: this.$store.getters.className('fieldDefinition')
                                                    };
                                                    return temp;
                                                })
                                            );
                                        }
                                    }
                                });
                                attrRawList = attrRawList.filter(
                                    (ite) => !['conditions', 'showColumns'].includes(ite.attrName)
                                ); // 过滤表单序列回来的条件和类型参数

                                let contextRef = this.$store?.state?.app?.container?.oid;

                                // 如果是否分析选择了"上下文分享" 且为空间页面的视图列表 则入参传空间对象oid
                                if (this.form.published === 'CONTEXT_PUBLISH' && this.$route.path?.includes('/space')) {
                                    contextRef = this.$store?.state?.space?.getters?.objectOid();
                                }
                                let additionalParams = [
                                    {
                                        attrName: 'tableDefRef', // 表格应用oid
                                        value: this.tableRow?.oid
                                    },
                                    {
                                        attrName: 'contextRef', // 添加上下文(容器id)
                                        value: contextRef
                                    },
                                    {
                                        attrName: 'enabled', // 是否启用
                                        value: this.editable ? this.form?.enabled || false : true
                                    },
                                    {
                                        attrName: 'isDefault', // 是否默认视图
                                        value: this.editable ? this.form?.isDefault || false : false
                                    }
                                ];
                                // 如果不是编辑，则判断当前视图类型是系统还是个人，编辑时候不再改变
                                if (!this.editable) {
                                    additionalParams.push({
                                        attrName: 'viewType', // 视图类型，true系统管理表格中创建，false是个人视图
                                        value: this.viewType == 'person' ? false : true
                                    });
                                }
                                // 额外参数添加
                                attrRawList.push(...additionalParams);
                                attrRawList.push({
                                    attrName: 'frozenType',
                                    value: this.form.frozenType
                                });
                                const filtersConfigRef = this.$refs.filtersConfig;
                                if (filtersConfigRef) {
                                    this.setLSViewConfig();
                                    const filtersParams = filtersConfigRef.getFiltersParams(this.editable);
                                    relationList = relationList.concat(filtersParams);
                                }
                                let className = this.$store.getters.className('tableView');
                                let params = {
                                    attrRawList,
                                    relationList,
                                    associationField: 'holderRef',
                                    className
                                };
                                // 更新
                                if (this.editable) {
                                    params.oid = this.oid;
                                }
                                this.saveFormData(params)
                                    .then((response) => {
                                        resolve(response);
                                    })
                                    .catch(reject);
                            } else {
                                reject(new Error(this.i18nMappingObj['请填入正确的信息']));
                            }
                        })
                        .catch(reject);
                });
            },
            setLSViewConfig() {
                // 如果基础筛选条件有增、删、改顺序 则清空缓存
                if (
                    JSON.stringify(this.selectedFilterIds) !==
                    JSON.stringify(this.selectedFiltersCopy.map((item) => item.attrName))
                ) {
                    this.$store.commit('PREFERENCE_CONFIG', {
                        config: {
                            configType: 'viewTableConfig',
                            viewOid: this.viewRef,
                            type: 'baseFilter',
                            _this: this
                        },
                        resource: []
                    });
                }
            },
            getFormFields(layoutData = []) {
                let result = [];
                layoutData.forEach((item) => {
                    if (item.children) {
                        result.push(...this.getFormFields(item.children));
                    } else {
                        result.push(item.field);
                    }
                });

                return result.flat();
            },
            saveFormData(payload) {
                return new Promise((resolve, reject) => {
                    if (this.editable) {
                        // 编辑
                        this.$famHttp({
                            url: '/fam/update',
                            data: payload,
                            method: 'post'
                        }).then((response) => {
                            const { success, message } = response;
                            if (success) {
                                this.$message.success(this.i18nMappingObj['updateSuccess']);
                                const colSetting = this.$store.getters.getPreferenceConfig({
                                    configType: 'viewTableConfig',
                                    viewOid: this.oid,
                                    type: 'colSetting'
                                });
                                const columns = this.$store.getters.getPreferenceConfig({
                                    configType: 'viewTableConfig',
                                    viewOid: this.oid,
                                    type: 'columns'
                                });
                                if (this.oid && this.isChanged) {
                                    colSetting &&
                                        this.$store.commit('PREFERENCE_CONFIG', {
                                            config: {
                                                configType: 'viewTableConfig',
                                                viewOid: this.oid,
                                                type: 'colSetting',
                                                _this: this
                                            },
                                            resource: {}
                                        });
                                    columns &&
                                        this.$store.commit('PREFERENCE_CONFIG', {
                                            config: {
                                                configType: 'viewTableConfig',
                                                viewOid: this.oid,
                                                type: 'columns',
                                                _this: this
                                            },
                                            resource: {}
                                        });
                                }
                                resolve(response);
                            } else {
                                reject(new Error(message));
                            }
                        });
                    } else {
                        // 新增
                        this.$famHttp({
                            url: '/fam/create',
                            data: payload,
                            method: 'post'
                        }).then((response) => {
                            const { success, message } = response;
                            if (success) {
                                this.$message.success(this.i18nMappingObj['createSuccess']);
                                resolve(response);
                            } else {
                                reject(new Error(message));
                            }
                        });
                    }
                });
            },
            async fnHandlerViewFormData(data = {}) {
                let typeNames = data['typeNames'] || [];
                this.typeOids = typeNames;
                this.selectValue = typeNames.length ? 'all' : '';
                const fieldList = await this.fnGetFieldList(typeNames); // 获取字段

                const _this = this;
                const setFormList = function (data = {}) {
                    return new Promise((resolve) => {
                        // 处理数据回显
                        Object.keys(data).forEach((key) => {
                            if (key && key.includes('I18nJson') && !_this.saveAs) {
                                // 回显处理
                                let newJI18nsonVal = {
                                    value: { ...data[key] }
                                };
                                data[key] = newJI18nsonVal;
                            }
                            // 字段列处理
                            if (key === 'fieldsDto') {
                                _this.tableData = data[key] || [];
                            }

                            // 筛选字段回显
                            if (key === 'baseFilterFieldDtos') {
                                _this.selectedFilterIds = data[key].map((item) => item.attrName);
                                _this.selectedFiltersCopy = data[key];
                            }
                            // 条件处理
                            if (key === 'conditionDtos') {
                                let valConditins = data[key] || [];
                                // 获取筛选条件
                                _this.fnGetConditionsField(typeNames, (respData) => {
                                    // 处理条件组回显
                                    let handleRenderData = (arr = []) => {
                                        let result = [];
                                        arr.forEach((item) => {
                                            let index = item.sortOrder;
                                            if (item.children) {
                                                let childrenList = handleRenderData(item.children);
                                                result[index] = {
                                                    ...item,
                                                    type: 'group',
                                                    relation: item.logicalOperator,
                                                    childrenList
                                                };
                                            } else {
                                                let value = ''; // 回显值
                                                const component = fieldList.find(
                                                    (ite) => ite.attrName === item.attrName
                                                );
                                                // 转JSON格式，保存时候就是传JSON字符串，保存什么，后端返回什么
                                                try {
                                                    value = item.value1 ? JSON.parse(item.value1) : '';
                                                } catch (e) {
                                                    value = item.value1 || '';
                                                }
                                                // 如果存在value2，则value1和value2合并成数组
                                                if (item.value2) {
                                                    // value = [val, item.value2];
                                                    value = [item.value1, item.value2];
                                                }
                                                if (
                                                    FamKit.isSameComponentName(
                                                        component.componentName,
                                                        'FamOrganizationSelect'
                                                    )
                                                ) {
                                                    value = item.orgList || [];
                                                }
                                                if (
                                                    FamKit.isSameComponentName(
                                                        component.componentName,
                                                        'CustomVirtualSelect'
                                                    ) &&
                                                    _this.isMultiple(item.oper)
                                                ) {
                                                    value = item.value1.split(',') || [];
                                                }
                                                // 操作选项补充
                                                let operationList =
                                                    item.operationList ||
                                                    (respData || []).find((ite) => ite.attrName === item.attrName)
                                                        ?.operationList;

                                                // 组件配置
                                                let componentJson = item.componentJson;
                                                try {
                                                    componentJson = JSON.parse(componentJson);
                                                } catch (e) {
                                                    componentJson = {};
                                                }

                                                result[index] = {
                                                    ...item,
                                                    field: item.attrName,
                                                    operator: item.oper || '',
                                                    operationList,
                                                    value,
                                                    relation: item.logicalOperator,
                                                    showComponent: _this.fnComponentHandle(item.componentName)
                                                        .showComponent,
                                                    dataKey:
                                                        fieldList.find((ite) => ite.attrName === item.attrName)
                                                            ?.dataKey || '',
                                                    props: {
                                                        ...componentJson?.props,
                                                        ...(item?.props || {}),
                                                        defaultValue: item?.userDtoList || {},
                                                        multiple: 'false'
                                                    },
                                                    dataType: 'string'
                                                };
                                            }
                                        });

                                        return result.filter((item) => item);
                                    };

                                    data['conditions'] = handleRenderData(valConditins);
                                    resolve(data);
                                });
                            }
                        });
                    });
                };
                const formList = await setFormList(data);
                this.form = { ...this.form, ...formList };
                this.showForm = true;
            },
            // 根据oid查询详情
            fetchDetailByOid() {
                this.$famHttp({
                    url: '/fam/view/getViewInfo',
                    data: {
                        viewOId: this.oid
                    },
                    method: 'get'
                }).then((resp) => {
                    let data = resp?.data || {};
                    this.fnHandlerViewFormData(data);
                });
            },
            setDefaultFilterIds() {
                this.selectedFilterIds = this.baseFilterFieldDtos.map((item) => item.attrName);
                this.selectedFiltersCopy = FamKit.deepClone(this.baseFilterFieldDtos);
            },
            fieldsCheck(val) {
                this.isChanged = true;
                this.tableData = val;
            },

            // 拖拽表格渲染行添加类名
            tableRowClassName: function ({ row }) {
                const ids = `js-drag-id-${row.id}`;
                return `js-drag-class ${ids}`;
            },

            // 注册表格拖拽功能
            sortableInit: function (Sortable) {
                this.$nextTick(() => {
                    // 表格添加拖拽
                    const $table = this.$refs['erdTable']?.$table;
                    const tbody = $($table?.$el).find('.vxe-table--render-wrapper .vxe-table--body tbody');
                    if (!tbody.length) return;
                    this.sortable = new Sortable.create(tbody[0], {
                        animation: 150,
                        draggable: '.js-drag-class',

                        // 监听拖动结束事件
                        onEnd: ({ item }) => {
                            const newTableData = utils.getTableDataByDrag({
                                $table,
                                childrenKey: 'children',
                                tableData: this.tableData,
                                item
                            });
                            this.tableData = [];
                            this.$nextTick(() => {
                                this.tableData = [...newTableData];
                            });
                        }
                    });
                });
            }
        }
    };
});
