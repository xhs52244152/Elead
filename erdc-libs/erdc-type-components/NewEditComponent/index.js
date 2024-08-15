/*
    类型基本信息配置
    先引用 kit组件
    BasicInforConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')), // 类型基本信息配置


    <basic-infor-config
    :visible.sync="basicInforConfigVisible"
    :title="'添加基本信息配置'">
    </basic-infor-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('erdc-type-components/NewEditComponent/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-type-components/NewEditComponent/style.css')
], function (template, fieldTypeMapping, utils) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        // mixins: [fieldTypeMapping],
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

            type: {
                type: String,
                default: () => {
                    return 'create';
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/NewEditComponent/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    basicInformation: this.getI18nByKey('基本信息'),
                    internalName: this.getI18nByKey('内部名称'),
                    name: this.getI18nByKey('名称'),
                    description: this.getI18nByKey('描述'),
                    enable: this.getI18nByKey('是否启用'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    edit: this.getI18nByKey('编辑'),

                    failedDetails: this.getI18nByKey('获取表单详情失败'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    createSuccessfully: this.getI18nByKey('新增成功'),
                    updateFailed: this.getI18nByKey('更新失败'),
                    createFailed: this.getI18nByKey('新增失败'),
                    whetherKeep: this.getI18nByKey('是否放弃保存'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    editComponent: this.getI18nByKey('编辑组件'),
                    pleaseEnterInternalName: this.getI18nByKey('请输入内部名称'),
                    internalNameError: this.getI18nByKey('内部名称格式错误')
                },
                formData: {
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
                    enabled: true
                },
                isChanged: false,
                unfold: true,
                showInfor: true,
                disabled: false,
                readonly: false,
                typeComponent: '',
                validateOnRuleChange: false,
                loading: false
            };
        },
        watch: {
            typeComponent: function (n, o) {
                this.readonly = this.typeComponent == 'check' ? true : false;
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
            data() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj['internalName'],
                        // label: '内部名称',
                        labelLangKey: 'internalName',
                        hidden: false,
                        required: true,
                        readonly: this.typeComponent === 'create' ? false : true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        // callback(new Error('请输入内部名称'))
                                        callback(new Error(this.i18nMappingObj['pleaseEnterInternalName']));
                                    } else if (value.match(/[^a-zA-Z0-9_.\- ]/gi)) {
                                        // callback(new Error('请输入大小写字母、"_"、."'))
                                        callback(new Error(this.i18nMappingObj['internalNameError']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false
                            // placeholder: '请输入',
                            // placeholderLangKey: '请输入'
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['name'],
                        // label: '名称',
                        labelLangKey: 'name',
                        required: true,
                        validators: [],
                        hidden: false,
                        readonly: this.typeComponent === 'check' ? true : false,
                        props: {
                            clearable: false,
                            // placeholder: '请选择',
                            // placeholderLangKey: '请选择',
                            type: 'basics',
                            i18nName: this.i18nMappingObj['name'],
                            required: false,
                            trimValidator: true,
                            max: 100
                        },
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['description'],
                        // label: '描述',
                        labelLangKey: 'description',
                        required: false,
                        validators: [],
                        hidden: false,
                        readonly: this.typeComponent === 'check' ? true : false,
                        props: {
                            clearable: true,
                            // placeholder: '请选择',
                            // placeholderLangKey: '请选择',
                            type: 'textarea',
                            i18nName: this.i18nMappingObj['description']
                        },
                        col: 12
                    },
                    {
                        field: 'enabled',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['enable'],
                        // label: '是否启用',
                        readonlyComponent: 'FamBooleanStaticText',
                        labelLangKey: 'enable',
                        readonly: true,
                        hidden: false,
                        class: 'fam-member-select',
                        props: {
                            clearable: false
                            // placeholder: '请选择',
                            // placeholderLangKey: '请选择'
                        },
                        col: 12,
                        slots: {
                            component: 'isDataTypeRef'
                        }
                    }
                ];
            }
        },
        mounted() {
            this.typeComponent = this.type || '';
            this.getDetail();
        },
        methods: {
            // 查看表单是否有过编辑
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            // 获取回显数据
            getDetail() {
                if (!this.oid) {
                    return;
                }
                this.disabled = true;
                const paramData = {
                    oid: this.oid
                };
                this.$famHttp({
                    url: '/fam/attr',
                    data: paramData,
                    method: 'get'
                }).then((resp) => {
                    let { rawData } = resp.data || {};
                    const formDataAttr = _.keys(this.formData);
                    let formData = {};
                    _.each(formDataAttr, (item) => {
                        formData[item] = rawData[item];
                    });
                    this.formData = ErdcKit.deserializeAttr(formData);
                });
            },
            saveSubmit() {
                this.submit();
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
                        .then(({ valid, message }) => {
                            if (valid) {
                                const formDataAttr = _.keys(this.formData);
                                const i18nArr = ['descriptionI18nJson', 'nameI18nJson'];
                                let attrRawList = _.filter(
                                    dynamicForm.serialize(),
                                    (item) =>
                                        _.includes(formDataAttr, item.attrName) && !_.includes(i18nArr, item.attrName)
                                );
                                let i18nAttr = _.filter(dynamicForm.serialize(), (item) =>
                                    _.includes(i18nArr, item.attrName)
                                ).map((item) => {
                                    if (item.attrName === 'nameI18nJson') {
                                        utils.trimI18nJson(item.value.value);
                                    }
                                    return item.value;
                                });
                                attrRawList = [...attrRawList, ...i18nAttr];
                                let paramData = {
                                    className: 'erd.cloud.foundation.layout.entity.Component',
                                    oid: this.oid,
                                    attrRawList
                                };
                                if (!this.oid) {
                                    delete paramData.oid;
                                }
                                this.$famHttp({
                                    url,
                                    data: paramData,
                                    method: 'post'
                                })
                                    .then((resp) => {
                                        this.$message({
                                            type: 'success',
                                            message: this.oid
                                                ? this.i18nMappingObj['updateSuccessfully']
                                                : this.i18nMappingObj['createSuccessfully'],
                                            showClose: true
                                        });
                                        this.$emit('onsubmit', resp);
                                        this.toogleShow();
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject(new Error(message));
                            }
                        })
                        .catch((error) => {
                            this.loading = false;
                            reject(error);
                        });
                });
            },
            onCancel() {
                this.toogleShow();
                return;
                // if (this.isChanged) {
                //     this.$confirm(this.i18nMappingObj['whetherKeep'], this.i18nMappingObj['confirmCancel'], {
                //         confirmButtonText: this.i18nMappingObj['confirm'],
                //         cancelButtonText: this.i18nMappingObj['cancel'],
                //         type: 'warning'
                //     }).then(() => {
                //         this.toogleShow();
                //     });
                // } else {
                //     this.toogleShow();
                // }
            },
            showInforFn(value) {
                this.showInfor = value;
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 编辑
            onEdit() {
                this.typeComponent = 'update';
                this.title = this.i18nMappingObj['editComponent'];
            }
        },
        components: {}
    };
});
