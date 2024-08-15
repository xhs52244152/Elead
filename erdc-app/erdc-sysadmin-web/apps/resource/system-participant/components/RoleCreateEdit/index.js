define([
    'text!' + ELMP.resource('system-participant/components/RoleCreateEdit/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    ELMP.resource('system-participant/api.js'),
    'css!' + ELMP.resource('system-participant/components/RoleCreateEdit/style.css')
], function (template, fieldTypeMapping, api) {
    const famHttp = require('fam:http');
    const FamKit = require('fam:kit');

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
                    return '创建角色';
                }
            },

            // 表单数据
            roleData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // 类型：update：更新，check：查看，create：创建
            type: {
                type: String,
                default: () => {
                    return 'check';
                }
            }
        },
        data() {
            return {
                selectVal: 'zh-CN',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/components/RoleCreateEdit/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    Number: this.getI18nByKey('编码'),
                    sortOrder: this.getI18nByKey('排序'),
                    name: this.getI18nByKey('名称'),
                    description: this.getI18nByKey('描述'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseClick: this.getI18nByKey('请点击'),
                    edit: this.getI18nByKey('编辑'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    updateSuccessful: this.getI18nByKey('更新成功'),
                    createSuccessful: this.getI18nByKey('新增成功'),
                    updateFailed: this.getI18nByKey('更新失败'),
                    createFailure: this.getI18nByKey('新增失败'),
                    effective: this.getI18nByKey('有效'),
                    invalid: this.getI18nByKey('失效'),
                    editRole: this.getI18nByKey('编辑角色'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),
                    isEnable: this.getI18nByKey('是否启用'),
                    type: this.getI18nByKey('类型'),
                    describe: this.getI18nByKey('描述'),
                    notCreateRole: this.getI18nByKey('是否不创建角色'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    giveUpEdit: this.getI18nByKey('是否放弃编辑'),
                    pleaseEnterCode: this.getI18nByKey('请输入编码'),
                    pleaseEnterLetters: this.getI18nByKey('请输入大小写字母')
                },
                rules: {
                    identifierNo: [{ required: true, message: '请输入编码', trigger: 'blur' }],
                    nameI18nJson: [{ required: true, message: '请输入中文名称', trigger: 'blur' }]
                },
                internationalizationVisible: false,
                // 国际化窗口字段
                internationFormData: {
                    attr: ''
                },
                internationName: '',
                propertyValues: [],
                attrMap: {
                    nameI18nJson: '角色名称',
                    descriptionI18nJson: '描述'
                },
                formData: {
                    identifierNo: '',
                    sortOrder: '100',
                    status: true,
                    nameI18nJson: {
                        attrName: 'nameI18nJson',
                        value: {}
                    },
                    roleType: '',
                    descriptionI18nJson: {
                        attrName: 'descriptionI18nJson',
                        value: {}
                    }
                },
                // 初始数据
                basisData: {},
                operType: this.type,
                isChange: false,
                readonly: false,
                disabled: false,
                roleTitle: this.title || '',
                loading: false,
                roleMenu: []
            };
        },
        watch: {
            innerVisible: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.formData.roleType = !_.isEmpty(this.formData.roleType) || this.roleData.identifierNo;
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
                    // this.visible = val
                }
            },
            data() {
                this.readonly = this.operType === 'check';
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj['Number'],
                        // label: '编码',
                        labelLangKey: 'Number',
                        disabled: !!this.oid,
                        readonly: !!this.oid,
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        callback(new Error(this.i18nMappingObj['pleaseEnterCode']));
                                    } else if (value.match(/[^a-zA-Z_.\- ]/gi)) {
                                        callback(new Error(this.i18nMappingObj['pleaseEnterLetters']));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        // readonly: this.oid ? true : false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            maxlength: 64
                        },
                        col: 12
                    },
                    {
                        field: 'sortOrder',
                        component: 'erd-input-number',
                        label: this.i18nMappingObj['sortOrder'],
                        // label: '排序',
                        labelLangKey: 'sortOrder',
                        disabled: false,
                        required: false,
                        readonly: this.readonly,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            min: 0
                        },
                        col: 12
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['name'],
                        // label: '名称',
                        labelLangKey: 'internalName',
                        disabled: false,
                        required: true,
                        validators: [],
                        readonly: this.readonly,
                        props: {
                            clearable: false,
                            // placeholder: '请选择',
                            // placeholderLangKey: 'pleaseEnter',
                            i18nName: this.i18nMappingObj['name'],
                            required: true
                        },
                        col: 12
                    },
                    {
                        field: 'status',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['isEnable'],
                        // label: '是否启用',
                        labelLangKey: 'status',
                        disabled: false,
                        required: false,
                        hidden: false,
                        validators: [],
                        readonly: this.operType !== 'update',
                        props: {
                            clearable: false
                            // placeholder: '请选择',
                            // placeholderLangKey: 'pleaseEnter'
                        },
                        col: 12,
                        slots: {
                            component: 'radioComponent',
                            readonly: 'readonlyComponent'
                        }
                    },
                    {
                        field: 'roleType',
                        component: 'fam-dict',
                        label: this.i18nMappingObj['type'],
                        // label: '类型',
                        labelLangKey: 'status',
                        disabled: this.operType === 'update',
                        readonly: this.operType === 'update',
                        required: false,
                        hidden: false,
                        validators: [],
                        // readonly: true,
                        props: {
                            clearable: false,
                            // placeholder: '请选择',
                            // placeholderLangKey: 'pleaseEnter',
                            itemName: 'role_type',
                            nodeKey: 'identifierNo'
                        },
                        col: 12
                    },
                    // {
                    //     component: 'placeholder',
                    //     col: 12
                    // },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['describe'],
                        // label: '描述',
                        labelLangKey: 'internalName',
                        disabled: false,
                        required: false,
                        validators: [],
                        readonly: this.readonly,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            i18nName: this.i18nMappingObj['describe'],
                            type: 'textarea'
                        },
                        col: 24
                    }
                ];
            },
            editPerm() {
                return this.roleMenu.includes('ROLE_EDIT');
            }
        },
        async created() {
            this.roleMenu = await api.menuQuery('MENU_MODULE_ROLE_DETAIL');
        },
        mounted() {
            // 初始化加载语言
            this.selectVal = window.localStorage.getItem('lang_current');
            this.getRoleDetail();
        },
        methods: {
            getRoleDetail() {
                if (!this.oid) {
                    return;
                }
                this.disabled = true;
                const data = {
                    params: {
                        oid: this.oid
                    }
                };
                famHttp
                    .get('/fam/attr', data)
                    .then((resp) => {
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
                                attrMap[item] = rawData[item]?.value;
                                // 处理类型使用数据字典时回显值
                                // if (item == 'roleType') {
                                //     attrMap[item] = rawData[item] || {};
                                // }
                            }
                        });
                        this.formData = attrMap;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            saveSubmit() {
                this.submit().then(() => {
                    // do nothing.
                });
            },
            serialize() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid, error }) => {
                            if (valid) {
                                const serializeData = dynamicForm.serialize();
                                const attrMap = ['nameI18nJson', 'descriptionI18nJson'];
                                let attrRawList = _.map(serializeData, (item) => {
                                    if (attrMap.includes(item.attrName)) {
                                        return item.value;
                                    }
                                    return {
                                        ...item,
                                        value:
                                            item.attrName === 'roleType' && _.isObject(item.value)
                                                ? item.value.value
                                                : item.value
                                    };
                                });
                                attrRawList.push({
                                    attrName: 'appName',
                                    value: this.roleData?.appName || ''
                                });
                                resolve({
                                    attrRawList,
                                    className: 'erd.cloud.foundation.principal.entity.Role',
                                    isDraft: false,
                                    oid: this.oid
                                });
                            } else {
                                reject(error);
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                });
            },
            submit() {
                let url = '/fam/create';
                if (this.oid) {
                    url = '/fam/update';
                }
                this.loading = true;
                return new Promise((resolve, reject) => {
                    this.serialize()
                        .then((data) => {
                            return this.$famHttp({
                                url: url,
                                method: 'post',
                                data
                            });
                        })
                        .then((resp) => {
                            this.$message({
                                type: 'success',
                                message: this.oid
                                    ? this.i18nMappingObj['updateSuccessful']
                                    : this.i18nMappingObj['createSuccessful'],
                                showClose: true
                            });
                            this.toogleShow();
                            this.$emit('onsubmit', { oid: resp.data });
                            resolve(resp);
                        })
                        .catch((error) => {
                            reject(error);
                        })
                        .finally(() => {
                            this.loading = false;
                        });
                });
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            onCancle() {
                if (!this.oid) {
                    this.$confirm(this.i18nMappingObj['notCreateRole'], this.i18nMappingObj['confirmCancel'], {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    })
                        .then(() => {
                            this.toogleShow();
                        })
                        .catch(() => {
                            // do nothing
                        });
                } else {
                    this.toogleShow();
                }
            },
            inputActive(value) {
                this.formData.sortOrder = value.replace(/[^\d]/g, '');
            },
            // 编辑
            edit() {
                this.operType = 'update';
                this.roleTitle = this.i18nMappingObj['editRole'];
            },
            formChange(isChange) {
                if (isChange) {
                    this.disabled = false;
                }
                this.isChange = isChange;
            }
        },
        components: {
            Internationalization: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamInternationalization/index.js')
            )
        }
    };
});
