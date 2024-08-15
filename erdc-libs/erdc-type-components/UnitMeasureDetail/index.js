define([
    'text!' + ELMP.resource('erdc-type-components/UnitMeasureDetail/index.html'),
    'erdc-kit',
    'EventBus',
    'css!' + ELMP.resource('erdc-type-components/UnitMeasureDetail/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/UnitMeasureDetail/locale/index.js'),
                i18nMappingObj: {
                    edit: this.getI18nByKey('编辑'),
                    delete: this.getI18nByKey('删除'),
                    basicInfor: this.getI18nByKey('基本信息'),
                    unitMeasure: this.getI18nByKey('测量单位'),
                    editingMeasure: this.getI18nByKey('编辑测量单位'),

                    measureSystem: this.getI18nByKey('测量系统'),
                    measureName: this.getI18nByKey('测量名称'),
                    baseUnitSymbol: this.getI18nByKey('量纲符号'),
                    description: this.getI18nByKey('描述'),
                    default: this.getI18nByKey('默认值'),
                    cover: this.getI18nByKey('覆盖'),
                    internalName: this.getI18nByKey('内部名称'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    confirmDelete: this.getI18nByKey('确定删除'),
                    confirmDeleteTips: this.getI18nByKey('确定删除该数据'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    deleteSuccessfully: this.getI18nByKey('删除成功'),
                    deleteFailed: this.getI18nByKey('删除失败')
                },
                treeHeight: '100%',
                title: '测量单位',
                bascisUnfold: true,
                measureUnfold: true,
                measureVisible: false,
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
                listData: [
                    // {
                    //     measureSys: '测量系统',
                    //     defaultUnit: '默认值',
                    //     coverUnit: '覆盖'
                    // }
                ],
                oid: '',
                maxHeight: 450,
                heightDiff: 326
            };
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
            lan() {
                return this.$store.state.i18n?.lang || 'zh_cn';
            },
            data() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        // label: '内部名称',
                        labelLangKey: 'name',
                        disabled: false,
                        required: false,
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
                            // placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['measureName'],
                        labelLangKey: 'internalName',
                        disabled: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                            i18nName: this.i18nMappingObj['measureName']
                        },
                        col: 12
                    },
                    {
                        field: 'baseUnitSymbol',
                        component: 'erd-input',
                        label: this.i18n.unitSymbol,
                        labelLangKey: 'baseUnitSymbol',
                        disabled: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                            maxlength: 100
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
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: this.i18nMappingObj['pleaseEnter'],
                            i18nName: this.i18nMappingObj['description']
                        },
                        col: 24
                    }
                ];
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
                        title: this.i18nMappingObj['measureSystem']
                    },
                    {
                        prop: 'defaultUnit',
                        title: this.i18nMappingObj['default']
                    },
                    {
                        prop: 'coverUnit',
                        title: this.i18nMappingObj['cover']
                    }
                ];
            }
        },
        created() {
            //获取浏览器高度并计算得到表格所用高度。 减去表格外的高度
            this.maxHeight = document.documentElement.clientHeight - this.heightDiff;
        },
        methods: {
            fetchTypeDefById(data) {
                this.oid = data.oid || '';
                this.getDetail();
            },
            getDetail() {
                const data = {
                    oid: this.oid
                };
                this.$famHttp({
                    url: '/fam/attr',
                    data
                })
                    .then((resp) => {
                        const { rawData } = resp.data || [];
                        this.title =
                            rawData.nameI18nJson?.value?.[this.lan] || rawData.nameI18nJson?.value?.value || '';
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
                        this.formData = { ...this.formData, ...attrMap };
                        this.listData = rawData?.measureSysDisplayUnit?.value || [];
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            onEdit() {
                this.measureVisible = true;
            },
            onDelete() {
                const data = {
                    oid: this.oid
                };
                this.$confirm(this.i18nMappingObj['confirmDeleteTips'], this.i18nMappingObj['confirmDelete'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: data,
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['deleteSuccessfully'],
                            showClose: true
                        });
                        this.$emit('onsubmit', this.i18nMappingObj['deleteFailed']);
                    });
                });
            },
            refresh(data) {
                this.fetchTypeDefById(data);
                this.$emit('refresh-tree', data);
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            UnitMeasureNewEdit: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/UnitMeasureNewEdit/index.js')
            )
        }
    };
});
