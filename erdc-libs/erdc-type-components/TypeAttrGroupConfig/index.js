/*
    类型基本信息配置
    先引用 kit组件
    TypeAttrGroupConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/TypeAttrGroupConfig/index.js')), // 编辑子类型

    <type-attr-config
    v-if="dialogVisible"
    :visible.sync="dialogVisible"
    :title="title"
    :oid="typeOid"
    :openType="openType"
    @onsubmit="onSubmit"></type-attr-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/TypeAttrGroupConfig/template.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'sortablejs',
    'underscore'
], function (template, fieldTypeMapping, utils, Sortable) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    const store = require('fam:store');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // openType
            openType: {
                type: String,
                default: () => {
                    return '';
                }
            },
            rowData: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeAttrGroupConfig/locale/index.js'),
                i18nMappingObj: {
                    moreActions: this.getI18nByKey('更多操作'),
                    export: this.getI18nByKey('导出数据'),

                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    edit: this.getI18nByKey('编辑'),
                    add: this.getI18nByKey('增加'),
                    delete: this.getI18nByKey('删除'),
                    remove: this.getI18nByKey('移除'),
                    save: this.getI18nByKey('保存'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),

                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    description: this.getI18nByKey('描述'),

                    type: this.getI18nByKey('类型'),
                    internalName: this.getI18nByKey('内部名称'),
                    showName: this.getI18nByKey('显示名称'),
                    typeEnum: this.getI18nByKey('所属类型'),
                    typeCategory: this.getI18nByKey('类型分类'),
                    operation: this.getI18nByKey('操作'),

                    confirmRemove: this.getI18nByKey('确认移除'),
                    removeSuccessfully: this.getI18nByKey('移除成功'),
                    removeFailure: this.getI18nByKey('移除失败'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    addSuccess: this.getI18nByKey('新增成功'),
                    discardGroupCreate: this.getI18nByKey('是否放弃属性组的创建？'),
                    discardGroupEdit: this.getI18nByKey('是否放弃属性组的编辑？'),
                    discardCreate: this.getI18nByKey('放弃创建'),
                    discardEdit: this.getI18nByKey('放弃编辑')
                },
                currentOid: '', // 当前属性组oid
                constraintOid: '',
                typeOid: null,
                className: null,
                formData: {
                    attrName: '', // 内部名称
                    displayName: {
                        // 显示名称
                        attr: 'nameI18nJson',
                        attrName: 'nameI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    description: {
                        // 描述
                        attr: 'nameI18nJson',
                        attrName: 'descriptionI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    }
                },
                TypeData: {},
                unfold: true,
                showInfo: true,
                categoryData: '',
                dynamicFormConfig: [], // 动态组件配置
                dynamicFormData: [], // 动态表单数据
                attrKey: [],
                categoryOptions: [], // 获取属性分类
                useField: [], // 可用数据表字段
                listData: [], // 表格展示数据
                attrList: [], // 属性数据
                enumDataList: [], // 枚举数据
                attrData: [], // 已选属性列表
                addNewLine: false,
                disabled: false,
                defaultList: undefined,
                isChanged: false,
                showLabelKey: 'oid',
                attrTitle: '新增属性',
                attrVisible: false,
                formLoading: false,
                attrFormLoading: false
            };
        },
        watch: {
            formData: {
                handler(newV) {
                    if (newV) {
                        if (this.defaultList == undefined) {
                            this.defaultList = newV;
                            this._unwatchDefaultList = this.$watch('defaultList', {
                                deep: true,
                                handler: function () {
                                    this.isChanged = true;
                                    this.disabled = false;
                                }
                            });
                        }
                    }
                },
                deep: true
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            // 创建属性表单
            formConfig() {
                return [
                    {
                        field: 'attrName',
                        component: 'custom-select',
                        label: this.i18nMappingObj['internalName'],
                        labelLangKey: 'component',
                        disabled: this.openType !== 'create',
                        readonly: this.openType !== 'create',
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseSelect,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/dictionary/tree/AttrGroupName?status=1',
                                    viewProperty: 'displayName',
                                    valueProperty: 'identifierNo',
                                    params: {}
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'displayName',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['showName'],
                        labelLangKey: 'showName',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    const currentLang = this.$store.state.i18n?.lang || 'zh_cn';
                                    if (
                                        !value ||
                                        _.isEmpty(value) ||
                                        _.isEmpty(value.value) ||
                                        (_.isEmpty(value.value.value?.trim()) &&
                                            _.isEmpty(value.value[currentLang]?.trim()))
                                    ) {
                                        callback(
                                            new Error(
                                                `${this.i18nMappingObj['pleaseEnter']} ${this.i18nMappingObj['showName']}`
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
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            type: 'basics',
                            i18nName: this.i18nMappingObj['showName']
                        },
                        col: 12
                    },
                    {
                        field: 'description',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['description'],
                        labelLangKey: 'description',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            type: 'textarea',
                            i18nName: this.i18nMappingObj['description']
                        },
                        col: 24
                    }
                ];
            },
            columns: {
                get() {
                    return [
                        {
                            prop: 'attrDisplayName',
                            title: this.i18nMappingObj?.['showName']
                        },
                        {
                            prop: 'attrName',
                            title: this.i18nMappingObj?.['internalName'],
                            slots: {
                                default: 'typeLink'
                            }
                        },
                        {
                            prop: 'typeDisplayName',
                            title: this.i18nMappingObj?.['typeEnum']
                        },
                        {
                            prop: 'attrCategory',
                            title: this.i18nMappingObj?.['typeCategory']
                        },
                        {
                            prop: 'oper',
                            title: this.i18nMappingObj?.['operation'],
                            width: 165,
                            sort: false,
                            fixed: 'right'
                        }
                    ];
                },
                set(val) {}
            },

            row() {
                return {
                    componentName: 'virtual-select',
                    clearNoData: true,
                    requestConfig: {
                        url: '/fam/type/attribute/listTypeAttributeDtoByTypeDefinitionIds',
                        viewProperty: 'displayName',
                        valueProperty: 'oid',
                        data: { typeDefinitionId: this.oid }
                    }
                };
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            BaseInfo: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/baseInfo/index.js'))
        },
        mounted() {
            this.init();

            // 获取table表格ref 初次获取需加延迟
            setTimeout(() => {
                const $table = this.$refs['erdTableAttr']?.$table;

                $table?.updateData();
                // 表格注册拖拽
                this.sortableInit();
            }, 350);
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            // 拖拽表格渲染行添加类名
            tableRowClassName: function ({ row, rowIndex }) {
                const ids = `js-drag-id-${row.id}`;

                return `js-drag-class ${ids}`;
            },
            // 注册表格拖拽功能
            sortableInit: function () {
                this.$nextTick(() => {
                    // 表格添加拖拽
                    const $table = this.$refs['erdTableAttr']?.$table;
                    const tbody = $($table?.$el).find('.vxe-table--render-wrapper .vxe-table--body tbody');
                    if (!tbody.length) return;
                    new Sortable.create(tbody[0], {
                        animation: 150,
                        draggable: '.js-drag-class', // 定义可拖拽类
                        filter: '.filter-drag', // 定义不可拖拽的过滤的类名 针对树父级 [与disabled-drag区别是在可拖拽元素里面定义且不带样式]
                        onEnd: ({ item }) => {
                            // 监听拖动结束事件
                            // 拖拽后的表格数据
                            const tableTreeData = utils.getTableDataByDrag({
                                $table, // 表格vue实例对象
                                childrenKey: 'children',
                                tableData: this.listData, // 表格数据
                                item // 当前拖拽el
                            });

                            // 重新赋值表格数据
                            this.listData = [...tableTreeData];

                            // TODO -- 保存后台或者其他操作

                            let linkOidList = [];
                            _.each(this.listData, (item) => {
                                linkOidList.push(item.linkOid);
                            });
                            this.$famHttp({
                                url: '/fam/type/group/memberSort',
                                data: linkOidList,
                                method: 'post'
                            }).then((resp) => {
                                this.$message({
                                    type: 'success',
                                    message: '排序成功',
                                    showClose: true
                                });
                            });
                        }
                    });
                });
            },
            // 设置树形父级不可拖拽类名
            setFilterClass: function () {
                this.$nextTick(() => {
                    const $table = this.$refs['erdTableAttr']?.$table;
                    const tbody = $($table?.$el).find('.vxe-table--render-wrapper .vxe-table--body tbody');
                    if (!tbody.length) return;
                    const treeBtn = tbody.find('.vxe-tree--btn-wrapper');
                    if (!treeBtn.length) return;
                    tbody.find('tr').each(function () {
                        let isThreeParent = $(this).find('td:eq(0) .vxe-tree--btn-wrapper').length;
                        if (isThreeParent) {
                            $(this).addClass('filter-drag');
                        }
                    });
                });
            },
            async init() {
                this.getTypeDefById();
                await this.getListAttr();
                this.attrKey = Object.keys(this.formData);
                const data = new FormData();
                data.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                this.categoryData = data;
                // this.getDetails()
                if (this.openType === 'detail') this.getRelationData();
            },
            getTypeDefById() {
                this.disabled = true;
                if (this.openType == 'edit' || this.openType == 'detail') {
                    let { oid, typeDisplayName } = this.rowData;
                    this.currentOid = oid;
                    this.$famHttp({
                        url: '/fam/attr',
                        data: {
                            oid
                        },
                        post: 'get'
                    }).then((resp) => {
                        let { name, nameI18nJson, descriptionI18nJson } = resp.data.rawData;
                        // 内部名称
                        this.formData['attrName'] = name.value;
                        // 显示名称
                        this.formData['displayName'] = {
                            attr: 'nameI18nJson',
                            attrName: nameI18nJson.attrName,
                            value: nameI18nJson.value || {}
                        };
                        // 描述
                        this.formData['description'] = {
                            attr: 'nameI18nJson',
                            attrName: descriptionI18nJson.attrName,
                            value: descriptionI18nJson.value || {}
                        };
                    });
                } else {
                    // do noting
                }
            },
            getListAttr() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/type/attribute/listTypeAttributeDtoByTypeDefinitionIds',
                        data: { typeDefinitionId: this.oid },
                        method: 'get'
                    }).then((resp) => {
                        this.attrList = resp.data;
                        resolve(true);
                    });
                });
            },
            // 获取关联列表
            getRelationData() {
                const data = {
                    groupOid: this.currentOid
                };
                this.$famHttp({
                    url: '/fam/type/group/memberAttrList',
                    data: data,
                    method: 'get'
                }).then((resp) => {
                    let dataValue = new FormData();
                    dataValue.append('realType', 'erd.cloud.core.enums.AttributeCategory');
                    this.$famHttp({
                        url: '/fam/type/component/enumDataList',
                        data: dataValue,
                        method: 'post',
                        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' }
                    }).then((res) => {
                        this.enumDataList = res.data;
                        _.each(resp.data, (item1) => {
                            _.each(res.data, (item2) => {
                                if (item1.attrCategory == item2.name) {
                                    item1['categoryName'] = item2.value;
                                }
                            });
                        });
                        this.listData = resp.data || [];

                        let attrList = [];
                        _.each(this.listData, (item) => {
                            _.each(this.attrList, (item1) => {
                                if (item1.oid == item.attrOid) {
                                    attrList.push(item1);
                                }
                            });
                        });

                        // 已选中字段
                        let selectedData = this.listData.map((item) => item.attrOid);
                        _.each(this.attrList, (item) => {
                            item.isDisable = false;
                            item.isSelected = false;
                            if (selectedData.includes(item.oid)) {
                                item.isSelected = true;
                            }
                        });

                        this.attrData = attrList;
                        // this.attrData = attrList.map(item => {

                        //     return Object.assign(item, {
                        //         visible: true
                        //     })
                        // })

                        // 设置是否编辑状态
                        this.listData = this.listData.map((item) => {
                            this.$set(item, 'editFlag', 0);
                            this.$set(
                                item,
                                'isDefaultName',
                                item.isDefault ? this.i18nMappingObj?.['yes'] : this.i18nMappingObj?.['no']
                            );
                            this.$set(item, 'oid', '');
                            this.$set(item, 'nameName', item.name);
                            return item;
                        });
                    });
                });
            },
            // 获取内部基本信息
            getDetails() {
                const data = {
                    oid: this.currentOid
                };
                this.$famHttp({
                    url: '/fam/type/datatype/getById',
                    data: data,
                    method: 'get'
                }).then((resp) => {
                    const basicData = resp?.data || {};
                    let attrMap = {};
                    _.each(_.keys(this.formData), (item) => {
                        attrMap[item] = basicData[item];
                    });
                    this.formData = { ...this.formData, ...attrMap };
                });
            },
            onEdit(data) {
                let flag = false;
                this.listData.forEach((item) => {
                    if (item.editFlag == 1) {
                        flag = true;
                    }
                });
                if (!flag) {
                    const { $rowIndex, row, column } = data;
                    this.listData[$rowIndex].editFlag = 1;
                }
            },
            // 更改数据结构
            changeData(data) {
                return Object.keys(data).map((key) => {
                    return {
                        attrName: key,
                        value: data[key]
                    };
                });
            },
            // 删除
            onDelete(data) {
                const { row } = data;
                this.$confirm(this.i18nMappingObj?.['confirmRemove'], this.i18nMappingObj?.['confirmRemove'], {
                    confirmButtonText: this.i18nMappingObj?.['confirm'],
                    cancelButtonText: this.i18nMappingObj?.['cancel'],
                    type: 'warning'
                }).then(() => {
                    const param = {
                        oid: row.linkOid
                    };
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            message: this.i18nMappingObj?.['removeSuccessfully'],
                            type: 'success',
                            showClose: true
                        });
                        this.getRelationData();
                    });
                });
            },
            // 保存
            onSave(data) {
                const { $rowIndex, row, column } = data;
                let url = '/fam/create';
                // 调用保存接口
                if (row.linkOid) {
                    url = '/fam/update';
                }

                const className = row.linkOid?.split(':')[1] || 'erd.cloud.foundation.type.entity.TypeGroupMember';
                const newData = [
                    {
                        attrName: 'roleAObjectRef',
                        value: this.currentOid
                    },
                    {
                        attrName: 'roleBObjectRef',
                        value: row.attrOid
                    },
                    {
                        attrName: 'sortOrder',
                        value: row.sortOrder
                    }
                ];
                let paramData = {
                    className: className,
                    oid: row.linkOid || '',
                    attrRawList: newData
                };
                if (!row.linkOid) {
                    delete paramData.oid;
                }
                this.$famHttp({
                    url: url,
                    data: paramData,
                    method: 'post'
                }).then((resp) => {
                    this.$message({
                        message: row.linkOid
                            ? this.i18nMappingObj?.['updateSuccessfully']
                            : this.i18nMappingObj?.['addSuccess'],
                        type: 'success',
                        showClose: true
                    });
                    this.listData[$rowIndex].editFlag = 0;
                    this.addNewLine = false;
                    this.getRelationData();
                });
            },
            // 取消
            onCancel(data) {
                const { $rowIndex, row, column } = data;
                this.listData[$rowIndex].editFlag = 0;
                if (this.addNewLine) {
                    this.listData.splice(this.listData.length - 1, 1);
                    this.addNewLine = false;
                }
            },
            customCallback(value, data) {
                const { row, column } = data;

                const selectAttr = this.listData.map((item) => item.attrDisplayName);
                if (selectAttr.includes(value?.selected?.displayName)) {
                    this.$message({
                        type: 'error',
                        message: `${value.label}组件已关联，不能重复关联`
                    });
                    row.oid = '';
                    value = {};
                }

                let attrCategory = value?.selected?.attrCategory || '';
                let categoryName;
                _.each(this.enumDataList, (item) => {
                    if (attrCategory == item.name) {
                        categoryName = item.value;
                    }
                });

                row[column.property + 'Name'] = value.label;
                if (this.addNewLine && column.property === 'attrDisplayName') {
                    row.attrOid = value?.value;
                    row.attrName = value?.selected?.attrName || '';
                    row.typeDisplayName = value?.selected?.typeDisplayName || '';
                    row.attrCategory = value?.selected?.attrCategory || '';
                    row.categoryName = categoryName || '';
                    row.description = value?.label || '';
                    row.sortOrder = this.listData.length;
                } else {
                    row.attrOid = value?.value;
                    row.attrName = value?.selected?.attrName || '';
                    row.typeDisplayName = value?.selected?.typeDisplayName || '';
                    row.attrCategory = value?.selected?.attrCategory || '';
                    row.categoryName = categoryName || '';
                }
            },
            // 添加组件
            addAttr() {
                this.attrVisible = true;
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 取消表单提交
            onCancelForm() {
                this.toggleShow();
            },
            // 表单提交
            submitForm() {
                let result = this.$refs.editForm.formData;
                let {
                    attrName,
                    typeReference,
                    type,
                    attrCategory,
                    dataTypeRef,
                    maxLength,
                    maxValue,
                    minValue,
                    isReadonly,
                    isHidden,
                    isRequired,
                    dataKey,
                    componentRef
                } = result;
                let url = '';
                let obj = {};
                let className = store.getters.className('TypeGroupDefinition'); // 创建属性组
                const { editForm } = this.$refs;
                this.formLoading = true;
                return new Promise((resolve, reject) => {
                    editForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                utils.trimI18nJson(this.formData['displayName'].value);
                                if (this.openType == 'edit') {
                                    url = '/fam/update';

                                    let attrRawList = [
                                        {
                                            attrName: 'name',
                                            value: this.formData['attrName']
                                        },
                                        {
                                            attrName: 'groupCategory',
                                            value: 'LIST'
                                        },
                                        {
                                            attrName: 'nameI18nJson',
                                            value: this.formData['displayName'].value
                                        },
                                        {
                                            attrName: 'descriptionI18nJson',
                                            value: this.formData['description'].value
                                        },
                                        {
                                            attrName: 'holderRef',
                                            value: this.oid
                                        }
                                    ];
                                    // 类型编辑
                                    obj = {
                                        oid: this.rowData.oid,
                                        className,
                                        attrRawList
                                    };
                                } else {
                                    let attrRawList = [
                                        {
                                            attrName: 'holderRef',
                                            value: this.oid
                                        },
                                        {
                                            attrName: 'contextRef',
                                            value: this.oid
                                        },
                                        {
                                            attrName: 'name',
                                            value: this.formData['attrName']
                                        },
                                        {
                                            attrName: 'groupCategory',
                                            value: 'LIST'
                                        },
                                        {
                                            attrName: 'nameI18nJson',
                                            value: this.formData['displayName'].value
                                        },
                                        {
                                            attrName: 'descriptionI18nJson',
                                            value: this.formData['description'].value
                                        }
                                    ];
                                    // 类型编辑
                                    obj = {
                                        className,
                                        attrRawList
                                    };

                                    url = '/fam/create';
                                }
                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        resolve(res);
                                        if (res.code === '200') {
                                            this.innerVisible = false;
                                            this.$message({
                                                message: this.openType == 'edit' ? '更新成功' : '创建成功',
                                                type: 'success',
                                                showClose: true
                                            });
                                            this.$emit('onsubmit');
                                        }
                                    })
                                    .finally(() => {
                                        this.formLoading = false;
                                    });
                            } else {
                                this.formLoading = false;
                                reject;
                            }
                        })
                        .catch(() => {
                            this.formLoading = false;
                        });
                });
            },
            // 提交属性列表
            submitAttrForm() {
                // let selectedAttrs = this.$refs['selected-type-attr'].getSelectedData();
                // let selectedAttrs = this.$refs['column-select'].getSetResult().selectedColumns
                let selectedAttrs = this.$refs['column-select'].getSetResult()?.selectedColumns || [];

                let attrList = [];
                _.each(selectedAttrs, (item) => {
                    attrList.push(item.oid);
                });
                this.attrFormLoading = true;
                this.$famHttp({
                    url: '/fam/type/group/saveGroupMemberList',
                    params: {
                        groupOid: this.rowData.oid
                    },
                    data: attrList,
                    method: 'post'
                })
                    .then(() => {
                        this.attrVisible = false;
                        this.getRelationData();
                    })
                    .finally(() => {
                        this.attrFormLoading = false;
                    });
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            }
        }
    };
});
