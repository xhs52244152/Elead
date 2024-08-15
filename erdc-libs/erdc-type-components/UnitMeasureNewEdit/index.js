define([
    'text!' + ELMP.resource('erdc-type-components/UnitMeasureNewEdit/index.html'),
    'erdc-kit',
    'EventBus',
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'css!' + ELMP.resource('erdc-type-components/UnitMeasureNewEdit/style.css')
], function (template, utils, EventBus, fieldTypeMapping) {
    const ErdcKit = require('erdcloud.kit');

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
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/UnitMeasureNewEdit/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    basicInfor: this.getI18nByKey('基本信息'),
                    showUnits: this.getI18nByKey('显示单位'),
                    export: this.getI18nByKey('导出'),
                    default: this.getI18nByKey('默认值'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    enter: this.getI18nByKey('请输入'),

                    measuringSystem: this.getI18nByKey('测量系统'),
                    cover: this.getI18nByKey('覆盖'),
                    operation: this.getI18nByKey('操作'),
                    internalName: this.getI18nByKey('内部名称'),
                    measureName: this.getI18nByKey('测量名称'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    baseUnitSymbol: this.getI18nByKey('量纲符号'),
                    description: this.getI18nByKey('描述'),
                    updateSuccessful: this.getI18nByKey('更新成功'),
                    createSuccessful: this.getI18nByKey('新增成功'),
                    updateFailed: this.getI18nByKey('更新失败'),
                    createFailure: this.getI18nByKey('新增失败'),
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    save: this.getI18nByKey('保存'),
                    edit: this.getI18nByKey('编辑'),
                    pleaseEnterInternalName: this.getI18nByKey('请输入内部名称'),
                    internalNameError: this.getI18nByKey('内部名称格式错误'),
                    failedDetails: this.getI18nByKey('获取详情失败'),
                    pleaseFillDefaultValues: this.getI18nByKey('请先填写默认值'),
                    giveUpUnitEdit: this.getI18nByKey('是否放弃测量单位的编辑'),
                    giveUpUnitCreate: this.getI18nByKey('是否放弃测量单位的创建'),
                    baseUnitSymbolError: this.getI18nByKey('量纲符号错误提示')
                },
                treeHeight: '100%',
                basicUnfold: true,
                measureUnfold: true,
                formData: {
                    nameI18nJson: {
                        attrName: 'nameI18nJson'
                        // value: {
                        //     value: '',
                        //     zh_cn: '',
                        //     zh_tw: '',
                        //     en_us: '',
                        //     en_gb: ''
                        // }
                    },
                    descriptionI18nJson: {
                        attrName: 'descriptionI18nJson',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_us: '',
                            en_gb: ''
                        }
                    },
                    name: '',
                    baseUnitSymbol: ''
                },
                listDataForm: {
                    defaultUnit: '',
                    listData: []
                },
                defaultList: undefined,
                listDataFormRule: {
                    defaultUnit: [{ required: true, message: '', trigger: 'blur' }]
                },
                defaultUnitRow: {
                    componentName: 'virtual-select',
                    requestConfig: {
                        url: '/fam/type/component/listData',
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    }
                },
                coverUnitRow: {
                    componentName: 'virtual-select',
                    requestConfig: {
                        url: '/fam/type/component/listData',
                        viewProperty: 'displayName',
                        valueProperty: 'oid'
                    }
                },
                addNewLine: false,
                isChanged: false,
                disabled: false,
                loading: false
            };
        },
        watch: {
            'listDataForm.listData': {
                handler: function (n) {
                    if (n) {
                        if (this.defaultList === undefined) {
                            this.defaultList = n;
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
            columns() {
                return [
                    {
                        type: 'seq',
                        title: ' ',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'measureSys',
                        title: this.i18nMappingObj['measuringSystem']
                    },
                    {
                        prop: 'defaultUnit',
                        title: this.i18n.defaultUnit
                    },
                    {
                        prop: 'coverUnit',
                        title: this.i18nMappingObj['cover']
                    }
                    // {
                    //     prop: 'oper',
                    //     title: this.i18nMappingObj['operation']
                    // }
                ];
            },
            data() {
                const _this = this;
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        // label: '内部名称',
                        labelLangKey: 'internalName',
                        // disabled: this.oid ? true : false,
                        required: true,
                        readonly: !!this.oid,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '' || !value.trim()) {
                                        callback(new Error(this.i18nMappingObj['pleaseEnterInternalName']));
                                        // callback(new Error('请输入内部名称'))
                                    } else if (value.match(/[^\w.]/gi)) {
                                        callback(new Error(this.i18nMappingObj['internalNameError']));
                                        // callback(new Error('请输入大小写字母、数字 和 "_"、."'))
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            // placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholder: '请输入'
                            // placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['measureName'],
                        labelLangKey: 'measureName',
                        disabled: false,
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
                                                `${this.i18nMappingObj['pleaseEnter']} ${this.i18nMappingObj['measureName']}`
                                            )
                                        );
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            // placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                            i18nName: this.i18nMappingObj['measureName'],
                            required: true,
                            max: 100
                        },
                        col: 12
                    },
                    {
                        field: 'baseUnitSymbol',
                        component: 'erd-input',
                        label: this.i18n.unitSymbol,
                        required: true,
                        readonly: !!this.oid,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                            maxlength: 100
                        },
                        listeners: {
                            input(val) {
                                _this.getTranslate(val);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['description'],
                        labelLangKey: 'descriptionI18nJson',
                        disabled: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            // placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                            i18nName: this.i18nMappingObj['description'],
                            max: 300,
                            type: 'textarea'
                        },
                        col: 24
                    }
                ];
            },
            isEdit() {
                return !!this.oid;
            }
        },
        mounted() {
            this.getListData();
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            getListData() {
                if (!this.oid) {
                    this.$famHttp({
                        url: '/fam/type/component/enumDataList',
                        params: {
                            realType: 'erd.cloud.core.type.enums.MeasureUnitEnum'
                        },
                        method: 'POST'
                    }).then((resp) => {
                        const { data = [] } = resp;
                        data.forEach((item) => {
                            this.listDataForm.listData.push({
                                editFlag: 1,
                                measureSys: item.name,
                                defaultUnit: '',
                                coverUnit: ''
                            });
                        });
                    });
                    return;
                }
                this.disabled = true;
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'get',
                    data: {
                        oid: this.oid
                    }
                }).then((resp) => {
                    const { rawData } = resp.data || {};
                    const i18nAttr = ['nameI18nJson', 'descriptionI18nJson'];
                    const attrMap = {};
                    _.each(_.keys(this.formData), (item) => {
                        if (i18nAttr.includes(item)) {
                            attrMap[item] = {
                                attrName: item,
                                value: rawData[item]?.value || {}
                            };
                        } else {
                            attrMap[item] = rawData[item]?.value || '';
                        }
                    });
                    this.formData = attrMap;
                    this.listDataForm.listData = rawData?.measureSysDisplayUnit?.value || [];
                    _.each(this.listDataForm.listData, (item) => {
                        this.$set(item, 'editFlag', 1);
                        this.$set(item, 'defaultUnitName', item.defaultUnit);
                        this.$set(item, 'coverUnitName', item.coverUnit);
                    });
                });
            },
            // 确认
            saveSubmit() {
                let flag = false;
                this.listDataForm.listData.forEach((item) => {
                    if (!item.defaultUnit.trim()) {
                        flag = true;
                        this.$set(item, 'requiredError', true);
                    } else {
                        this.$set(item, 'requiredError', false);
                    }
                });
                if (!flag) {
                    this.submit();
                } else {
                    this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj['pleaseFillDefaultValues'],
                        showClose: true
                    });
                }
            },
            submit() {
                let url = '/fam/create';
                if (this.oid) {
                    url = '/fam/update';
                }
                const { dynamicForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                const serializeData = dynamicForm.serialize();
                                const attrMap = ['nameI18nJson', 'descriptionI18nJson'];
                                let attrRawList = [];
                                _.each(serializeData, (item) => {
                                    if (attrMap.includes(item.attrName)) {
                                        if (item.attrName === 'nameI18nJson') {
                                            utils.trimI18nJson(item.value?.value || {});
                                        }
                                        attrRawList.push(item.value);
                                    } else {
                                        if (item.attrName === 'name') {
                                            item.value = item.value.trim();
                                        }
                                        attrRawList.push(item);
                                    }
                                });
                                attrRawList.push({
                                    attrName: 'measureSysDisplayUnit',
                                    value: this.listDataForm.listData.map((item) => {
                                        return {
                                            measureSys: item.measureSys.trim() || '',
                                            defaultUnit: item.defaultUnit.trim() || '',
                                            coverUnit: item.coverUnit.trim() || ''
                                        };
                                    })
                                });
                                // attrRawList = _.filter(attrRawList, item=>(item.value))
                                const data = {
                                    attrRawList,
                                    className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure',
                                    oid: this.oid
                                };
                                this.$famHttp({
                                    url: url,
                                    method: 'post',
                                    data
                                })
                                    .then((resp) => {
                                        resolve(resp);
                                        this.$message({
                                            type: 'success',
                                            message: this.oid
                                                ? this.i18nMappingObj['updateSuccessful']
                                                : this.i18nMappingObj['createSuccessful'],
                                            showClose: true
                                        });
                                        this.toogleShow();
                                        this.$emit('onsubmit', { oid: resp.data });
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject();
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            // 取消
            onCancel() {
                this.toogleShow();
            },
            // 编辑
            onEdit(data) {
                const { row } = data;
                let flag = true;
                _.each(this.listDataForm.listData, (item) => {
                    if (item.editFlag) {
                        flag = false;
                    }
                });
                if (flag) {
                    this.$set(row, 'editFlag', 1);
                }
            },
            // 删除
            onDelete(data) {
                const { $rowIndex } = data;
                // 本地删除
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.listDataForm.listData = this.listDataForm.listData.filter(
                        (item, index) => index !== $rowIndex
                    );
                });
            },
            // 创建
            onCreate() {
                let flag = true;
                _.each(this.listDataForm.listData, (item) => {
                    if (item.editFlag) {
                        flag = false;
                    }
                });
                if (flag) {
                    this.addNewLine = true;
                    this.listDataForm.listData.unshift({
                        editFlag: 1,
                        measureSys: 'USCS',
                        defaultUnit: '',
                        coverUnit: ''
                    });
                }
            },
            // 保存
            onSave(data) {
                this.addNewLine = false;
                const { row } = data;
                if (row.defaultUnit) {
                    this.$set(row, 'editFlag', 0);
                    this.$set(row, 'requiredError', false);
                } else {
                    this.$set(row, 'requiredError', true);
                }
            },
            // 单个取消
            oncancel(data) {
                const { row } = data;
                if (this.addNewLine) {
                    this.addNewLine = false;
                    this.listDataForm.listData.shift();
                } else {
                    this.$set(row, 'editFlag', 0);
                }
            },
            customCallback(value, data) {
                const { row, column } = data;
                row[column.property + 'Name'] = value.label;
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            getTranslate: _.debounce(function (value) {
                this.$famHttp({
                    url: '/fam/units/translate',
                    method: 'GET',
                    params: {
                        combineUnitStr: value
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.listDataForm.listData.forEach((item) => {
                        this.$set(item, 'defaultUnit', data?.[item.measureSys] || '');
                    });
                });
            }, 300)
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        }
    };
});
