define([
    'text!' + ELMP.resource('erdc-type-components/DataTypeDetail/index.html'),
    'erdc-kit',
    'EventBus',
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-type-components/DataTypeDetail/style.css')
], function (template, utils, EventBus, fieldTypeMapping) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/DataTypeDetail/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    basicInformation: this.getI18nByKey('基本信息'),
                    associatedComponents: this.getI18nByKey('关联组件'),
                    add: this.getI18nByKey('增加'),
                    edit: this.getI18nByKey('编辑'),
                    remove: this.getI18nByKey('移除'),
                    save: this.getI18nByKey('保存'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    componentName: this.getI18nByKey('组件名称'),
                    showName: this.getI18nByKey('显示名称'),
                    name: this.getI18nByKey('名称'),
                    description: this.getI18nByKey('描述'),
                    isDefault: this.getI18nByKey('是否默认'),
                    operation: this.getI18nByKey('操作'),
                    internalName: this.getI18nByKey('内部名称'),
                    processClass: this.getI18nByKey('处理类'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    columnPrefixName: this.getI18nByKey('列前缀'),

                    confirmRemoveComponent: this.getI18nByKey('是否要删除该组件'),
                    confirmRemove: this.getI18nByKey('确认移除'),
                    removeSuccessfully: this.getI18nByKey('移除成功'),
                    removeFailure: this.getI18nByKey('移除失败'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    addSuccess: this.getI18nByKey('新增成功'),
                    addComponent: this.getI18nByKey('增加关联组件'),

                    stopSuccessful: this.getI18nByKey('停用成功'),
                    enableSuccessful: this.getI18nByKey('启用成功'),
                    stopFailure: this.getI18nByKey('停用失败'),
                    enableFailure: this.getI18nByKey('启用失败'),
                    whetherDisableComponent: this.getI18nByKey('是否停用该组件'),
                    whetherEnableComponent: this.getI18nByKey('是否启用该组件'),
                    disableComponents: this.getI18nByKey('停用组件'),
                    enableComponent: this.getI18nByKey('启用组件'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    WhetherDeleteConfirm: this.getI18nByKey('是否要删除该组件'),
                    deleteSuccessful: this.getI18nByKey('删除成功'),
                    deleteFailure: this.getI18nByKey('删除失败')
                },
                title: '标题',
                bascisUnfold: true,
                relationUnfold: true,
                formData: {
                    name: '',
                    nameI18nJson: {
                        attr: 'nameI18nJson',
                        attrName: '显示名称',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    handlerClassName: '',
                    columnPrefixName: ''
                },
                listData: [],
                customSelectRow: {
                    componentName: 'virtual-select',
                    requestConfig: {
                        url: '/fam/type/component/listData',
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    }
                },
                loading: false,
                selectOption: {
                    componentName: 'constant-select',
                    referenceList: [
                        {
                            name: '是',
                            value: true
                        },
                        {
                            name: '否',
                            value: false
                        }
                    ]
                },
                oid: '',
                addNewLine: false,
                innerVisible: false,
                showLabelKey: 'oid',
                allColumnsList: [],
                dataType: 'dataTypeDefinition',
                componentFormData: {
                    name: '',
                    nameI18nJson: {
                        attrName: 'nameI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    descriptionI18nJson: {
                        attrName: 'descriptionI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    enabled: false
                },
                row: {},
                NewEditComponentVisible: false,
                componentType: 'update',
                componentTitle: '编辑组件',
                maxHeight: 450,
                heightDiff: 290
            };
        },
        watch: {},
        computed: {
            data() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj?.['internalName'],
                        labelLangKey: 'internalName',
                        disabled: true,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: '请输入',
                            placeholderLangKey: '请输入'
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj?.['showName'],
                        labelLangKey: '显示名称',
                        disabled: true,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: '请输入',
                            placeholderLangKey: '请输入',
                            type: 'basics',
                            disabled: true
                        },
                        col: 12
                    },
                    {
                        field: 'handlerClassName',
                        component: 'erd-input',
                        label: this.i18nMappingObj?.['processClass'],
                        labelLangKey: 'processClass',
                        disabled: true,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: '请输入',
                            placeholderLangKey: '请输入'
                        },
                        col: 12
                    },
                    {
                        field: 'columnPrefixName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['columnPrefixName'],
                        labelLangKey: 'columnPrefixName',
                        disabled: true,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: '请输入',
                            placeholderLangKey: '请输入'
                        },
                        col: 12
                    }
                ];
            },
            columns: {
                get() {
                    return [
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: 48,
                            align: 'center' //多选框默认居中显示
                        },
                        {
                            prop: 'displayName',
                            title: this.i18nMappingObj?.['name']
                        },
                        {
                            prop: 'name',
                            title: this.i18nMappingObj?.['componentName'],
                            slots: {
                                default: 'typeLink'
                            }
                        },
                        {
                            prop: 'description',
                            title: this.i18nMappingObj?.['description']
                        },
                        {
                            width: '76px',
                            prop: 'isDefault',
                            title: this.i18nMappingObj?.['isDefault']
                        },
                        {
                            prop: 'oper',
                            title: this.i18nMappingObj?.['operation'],
                            width: 48,
                            sort: false,
                            fixed: 'right'
                        }
                    ];
                },
                set(val) {}
            },
            componentData() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        // label: this.i18nMappingObj['internalName'],
                        label: '内部名称',
                        labelLangKey: 'internalName',
                        hidden: false,
                        required: true,
                        readonly: this.typeComponent === 'create' ? false : true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: function (rule, value, callback) {
                                    if (value === '') {
                                        callback(new Error('请输入内部名称'));
                                    } else if (value.match(/[^a-zA-Z0-9_.\- ]/gi)) {
                                        callback(new Error('请输入大小写字母、"_"、."'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: '请输入',
                            placeholderLangKey: '请输入'
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        // label: this.i18nMappingObj['showName'],
                        label: '名称',
                        labelLangKey: 'showName',
                        required: true,
                        validators: [],
                        hidden: false,
                        readonly: this.typeComponent === 'check' ? true : false,
                        props: {
                            clearable: false,
                            placeholder: '请选择',
                            placeholderLangKey: '请选择',
                            type: 'basics',
                            i18nName: '名称',
                            required: true
                        },
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        // label: this.i18nMappingObj['description'],
                        label: '描述',
                        labelLangKey: 'description',
                        required: false,
                        validators: [],
                        hidden: false,
                        readonly: this.typeComponent === 'check' ? true : false,
                        props: {
                            clearable: true,
                            placeholder: '请选择',
                            placeholderLangKey: '请选择',
                            type: 'textarea',
                            i18nName: '描述'
                        },
                        col: 12
                    },
                    {
                        field: 'enabled',
                        component: 'erd-radio',
                        // label: this.i18nMappingObj['enable'],
                        label: '状态',
                        readonlyComponent: 'FamBooleanStaticText',
                        labelLangKey: 'enable',
                        readonly: true,
                        hidden: false,
                        class: 'fam-member-select',
                        props: {
                            clearable: false,
                            placeholder: '请选择',
                            placeholderLangKey: '请选择'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent',
                            readonly: 'radioComponentReadonly'
                        }
                    }
                ];
            }
        },
        created() {
            //获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
            this.maxHeight = document.documentElement.clientHeight - this.heightDiff;
        },
        mounted() {},
        methods: {
            // 设置表格列样式
            cellClassName({ row, column }) {
                if (column.property == 'isDefault') {
                    return 'cell-center';
                } else {
                    return '';
                }
            },
            // 获取基本信息
            fetchTypeDefById(data) {
                this.dataType = data.dataType || this.dataType;
                this.oid = data?.oid || '';
                this.title = data.displayName;

                if (this.dataType == 'dataTypeDefinition') {
                    this.getDetails();
                    this.getRelationData();
                } else {
                    this.getComponentDetails();
                }
            },
            // 获取关联列表
            getRelationData() {
                const data = {
                    oid: this.oid
                };
                this.$famHttp({
                    url: '/fam/type/datatype/findLinkedComponentList',
                    data: data,
                    method: 'get'
                }).then((resp) => {
                    this.listData = resp.data || [];
                    // 设置是否编辑状态
                    this.listData = this.listData.map((item) => {
                        this.$set(item, 'editFlag', 0);
                        this.$set(
                            item,
                            'isDefaultName',
                            item.isDefault ? this.i18nMappingObj?.['yes'] : this.i18nMappingObj?.['no']
                        );
                        this.$set(item, 'nameName', item.name);
                        return item;
                    });
                });
            },
            // 获取内部基本信息
            getDetails() {
                const data = {
                    oid: this.oid
                };
                this.$famHttp({
                    url: '/fam/type/datatype/getById',
                    data: data,
                    method: 'get'
                }).then((resp) => {
                    const basicData = resp?.data || {};
                    let attrMap = {};
                    _.each(_.keys(this.formData), (item) => {
                        if (['nameI18nJson'].includes(item)) {
                            attrMap[item] = {
                                attr: item,
                                value: basicData[item]
                            };
                        } else {
                            attrMap[item] = basicData[item];
                        }
                    });
                    this.formData = { ...this.formData, ...attrMap };
                    this.title = basicData.displayName;
                });
            },
            // 获取组件详情
            getComponentDetails() {
                const paramData = {
                    oid: this.oid
                };
                this.$famHttp({
                    url: '/fam/attr',
                    data: paramData,
                    method: 'get'
                }).then((resp) => {
                    let { rawData } = resp.data || {};
                    // const formDataAttr = _.keys(this.componentFormData)
                    // let componentFormData = {}
                    // _.each(formDataAttr, item => {
                    //     componentFormData[item] = rawData[item]
                    // })
                    // this.componentFormData = ErdcKit.deserializeAttr(componentFormData)

                    let row = {};
                    _.each(_.keys(rawData), (item) => {
                        row[item] = rawData[item];
                    });
                    this.row = ErdcKit.deserializeAttr(row);
                    this.componentFormData = ErdcKit.deserializeAttr(row);

                    this.title = rawData?.nameI18nJson?.displayName || '';
                });
            },
            onCommand() {
                // do nothing
            },
            checkDetail() {
                // do nothing
            },
            // onEdit(data) {
            //     let flag = false;
            //     this.listData.forEach((item) => {
            //         if (item.editFlag == 1) {
            //             flag = true;
            //         }
            //     });
            //     if (!flag) {
            //         const { $rowIndex, row, column } = data;
            //         this.listData[$rowIndex].editFlag = 1;
            //     }
            // },
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
                let flag = false;
                this.listData.forEach((item) => {
                    if (item.editFlag == 1) {
                        flag = true;
                    }
                });
                if (flag) {
                    return this.$message({
                        type: 'warning',
                        message: '存在正在编辑组件，请先完成编辑！',
                        showClose: true
                    });
                }
                this.$confirm(this.i18nMappingObj?.['confirmRemoveComponent'], this.i18nMappingObj?.['confirmRemove'], {
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

                if (!row.oid) {
                    this.$set(row, `validerror`, true);
                    return;
                }
                let url = '/fam/create';
                // 调用保存接口
                if (row.linkOid) {
                    url = '/fam/update';
                }

                const className =
                    row.linkOid?.split(':')[1] || 'erd.cloud.foundation.type.entity.DataTypeComponentLink';
                const newData = [
                    {
                        attrName: 'roleAObjectRef',
                        value: this.oid
                    },
                    {
                        attrName: 'roleBObjectRef',
                        value: row.oid
                    },
                    {
                        attrName: 'isDefault',
                        value: row.isDefault
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
            // onCancel(data) {
            //     const { $rowIndex, row, column } = data;
            //     this.listData[$rowIndex].editFlag = 0;
            //     if (this.addNewLine) {
            //         this.listData.splice(0, 1);
            //         this.addNewLine = false;
            //     }
            // },
            customCallback(value, data) {
                const { row, column } = data;

                const selectAttr = this.listData.map((item) => item.name);
                if (selectAttr.includes(value?.selected?.name)) {
                    this.$message({
                        type: 'error',
                        message: `${value.label}组件已关联，不能重复关联`
                    });
                    row.oid = '';
                    value = {};
                }

                row[column.property + 'Name'] = value.label;
                if (this.addNewLine && column.property == 'displayName') {
                    row.name = value?.selected?.name || '';
                    row.description = value?.label || '';
                }
                if (row.oid) {
                    this.$set(row, 'validerror', false);
                }
            },
            // 添加组件
            addComponent() {
                /* let flag = this.listData.some(item => +item.editFlag === 1);
                this.addNewLine = true;
                if (!flag) {
                    this.listData.unshift(
                        {
                            name: '',
                            innerName: '',
                            description: '',
                            isDefault: false,
                            defaultValueName: '是',
                            editFlag: 1
                        }
                    );
                } */

                this.innerVisible = true;
                this.$famHttp({
                    url: '/fam/type/component/listData',
                    method: 'GET'
                }).then((resp) => {
                    let { data } = resp || [];

                    // const defaultOid = this.listData.map(item=>{
                    //     if(item.isDefault) {
                    //        return item.oid
                    //     }
                    // }).fliter(item=>(item))[0]?.oid
                    const selectedComOids = this.listData.map((item) => item.oid);
                    data.forEach((item) => {
                        item.isDisable = false;
                        item.isSelected = false;
                        if (selectedComOids.includes(item.oid)) {
                            item.isDisable = true;
                            item.isSelected = true;
                        }
                    });
                    this.allColumnsList = data;
                });
            },
            changeRadio(data) {
                const { row } = data;
                this.$set(row, 'isDefault', false);
                // '是否将[${row.name}]设置成默认组件'
                this.$confirm(`是否把选中组件设置成默认组件`, '默认组件', {
                    confirmButtonText: this.i18nMappingObj?.['confirm'],
                    cancelButtonText: this.i18nMappingObj?.['cancel'],
                    type: 'warning'
                }).then(() => {
                    row.isDefault = true;
                    if (row.linkOid) {
                        this.onSave(data);
                    }
                });
            },
            saveSubmit() {
                const newData = this.$refs['column-select'].getSetResult().selectedColumns;
                const paramData = newData.map((item) => item.oid);
                this.loading = true;
                this.$famHttp({
                    url: '/fam/type/datatype/saveLinkedComponent' + `?dataTypeOid=${this.oid}`,
                    data: paramData,
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj?.['addSuccess']
                        });
                        this.innerVisible = false;
                        this.getRelationData();
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onCancel() {
                this.innerVisible = false;
            },
            // 停用启用
            onEnabled() {
                this.$confirm(
                    this.row.enabled
                        ? this.i18nMappingObj['whetherDisableComponent']
                        : this.i18nMappingObj['whetherEnableComponent'],
                    this.row.enabled
                        ? this.i18nMappingObj['disableComponents']
                        : this.i18nMappingObj['enableComponent'],
                    {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }
                ).then(() => {
                    const paramData = {
                        className: 'erd.cloud.foundation.layout.entity.Component',
                        oid: this.row.oid,
                        attrRawList: [
                            {
                                attrName: 'enabled',
                                value: !this.row.enabled
                            }
                        ]
                    };
                    this.$famHttp({
                        url: '/fam/update',
                        data: paramData,
                        method: 'post'
                    }).then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.row.enabled
                                ? this.i18nMappingObj['stopSuccessful']
                                : this.i18nMappingObj['enableSuccessful'],
                            showClose: true
                        });
                        this.getComponentDetails(resp.data);
                    });
                });
            },
            // 编辑组件
            onEdit() {
                this.NewEditComponentVisible = true;
            },
            // 删除组件
            onDeleteComponent() {
                const row = this.row;
                const param = {
                    oid: row.oid
                };
                this.$confirm(this.i18nMappingObj['WhetherDeleteConfirm'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: param,
                        method: 'delete'
                    }).then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteSuccessful'],
                            showClose: true
                        });
                        this.refreshList();
                    });
                });
            },
            // 刷新树列表
            refreshList(resp) {
                if (resp?.data) {
                    this.getComponentDetails(resp?.data || '');
                }
                this.$emit('refresh-tree', resp?.data || '', 'getTreeList');
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            NewEditComponent: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/NewEditComponent/index.js'))
        }
    };
});
