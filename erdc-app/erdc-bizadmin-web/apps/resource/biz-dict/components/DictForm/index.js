/*

 */
define([
    'text!' + ELMP.resource('biz-dict/components/DictForm/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'fam:http',
    'css!' + ELMP.resource('biz-dict/components/DictForm/style.css')
], function (template, fieldTypeMapping, utils) {
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

            // 表单数据
            dictData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            // 表单数据
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-dict/components/DictForm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    appName: this.getI18nByKey('所属应用'),
                    number: this.getI18nByKey('编码'),
                    name: this.getI18nByKey('名称'),
                    state: this.getI18nByKey('状态'),
                    describe: this.getI18nByKey('描述'),
                    getDetailsFailed: this.getI18nByKey('获取详情失败'),
                    giveUpEdited: this.getI18nByKey('是否放弃已编辑'),
                    cancelDdit: this.getI18nByKey('取消编辑'),
                    updateSuccessful: this.getI18nByKey('更新成功'),
                    createSuccessful: this.getI18nByKey('新增成功'),
                    updateFailed: this.getI18nByKey('更新失败'),
                    createFailure: this.getI18nByKey('新增失败'),
                    draft: this.getI18nByKey('草稿'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('停用')
                },
                formData: {
                    appName: this.dictData?.identifierNo || '',
                    name: '',
                    nameI18nJson: {
                        attrName: 'nameI18nJson',
                        value: {}
                    },
                    descriptionI18nJson: {
                        attrName: 'descriptionI18nJson',
                        value: {}
                    },
                    identifierNo: '',
                    status: '0'
                },
                disabled: false,
                isChange: false,
                defaultList: undefined,
                statusOptions: [],
                loading: false
            };
        },
        watch: {
            formData: {
                deep: true,
                handler(newV) {
                    if (newV) {
                        if (this.defaultList === undefined) {
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
            appList: function () {
                return store.state.app.appNames || [];
            },
            // statusOptions() {
            //     if (this.formData.status != '0') {
            //         return [{
            //             name: this.i18nMappingObj['enable'],
            //             value: '1'
            //         }, {
            //             name: this.i18nMappingObj['disable'],
            //             value: '2'
            //         }]
            //     } else {
            //         return [{
            //             name: this.i18nMappingObj['draft'],
            //             value: '0'
            //         }, {
            //             name: this.i18nMappingObj['enable'],
            //             value: '1'
            //         }, {
            //             name: this.i18nMappingObj['disable'],
            //             value: '2'
            //         }]
            //     }
            // },
            data() {
                return [
                    {
                        field: 'appName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['appName'],
                        // label: '所属应用',
                        labelLangKey: 'internalName',
                        disabled: true,
                        hidden: false,
                        required: false,
                        readonly: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            component: 'appNameComponent'
                        },
                        col: 12
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj['number'],
                        // label: '编码',
                        labelLangKey: 'internalName',
                        disabled: !!this.oid,
                        hidden: false,
                        required: true,
                        readonly: !!this.oid,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: function (rule, value, callback) {
                                    if (value === '') {
                                        callback(new Error('请输入编码'));
                                    } else if (value.match(/[^a-zA-Z0-9_.]/gi)) {
                                        callback(new Error('请输入大小写字母数字、"_"、"."'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
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
                                                `${this.i18nMappingObj['pleaseEnter']} ${this.i18nMappingObj['name']}`
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
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            // i18nName: '名称',
                            required: true
                        },
                        col: 12
                    },
                    {
                        field: 'status',
                        component: 'custom-select',
                        label: this.i18nMappingObj['state'],
                        // label: '状态',
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            // placeholder: '请选择',
                            placeholderLangKey: 'pleaseEnter',
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.statusOptions
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['describe'],
                        // label: '描述',
                        labelLangKey: 'internalName',
                        disabled: false,
                        hidden: false,
                        required: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            type: 'textarea',
                            i18nName: '描述'
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            this._unwatchDefaultList && this._unwatchDefaultList();
        },
        methods: {
            init() {
                this.getDictDetail();
            },
            getDictDetail() {
                if (!this.oid) {
                    this.statusOptions = [
                        {
                            name: this.i18nMappingObj['draft'],
                            value: '0'
                        },
                        {
                            name: this.i18nMappingObj['enable'],
                            value: '1'
                        },
                        {
                            name: this.i18nMappingObj['disable'],
                            value: '2'
                        }
                    ];
                    return;
                }
                this.disabled = true;
                this.$famHttp({
                    url: '/fam/attr',
                    method: 'GET',
                    data: {
                        oid: this.oid
                    }
                }).then((resp) => {
                    const { rawData } = resp.data || {};
                    const i18nAttr = ['nameI18nJson', 'descriptionI18nJson'];
                    _.each(_.keys(this.formData), (item) => {
                        if (i18nAttr.includes(item)) {
                            this.$set(this.formData, item, {
                                attrName: item,
                                value: rawData[item]?.value || {}
                            });
                        } else {
                            if (item === 'status') {
                                rawData[item].value = rawData[item]?.value + '';
                            }
                            this.$set(this.formData, item, rawData[item]?.value || '');
                        }
                    });
                    if (this.formData.status != '0') {
                        this.statusOptions = [
                            {
                                name: this.i18nMappingObj['enable'],
                                value: '1'
                            },
                            {
                                name: this.i18nMappingObj['disable'],
                                value: '2'
                            }
                        ];
                    } else {
                        this.statusOptions = [
                            {
                                name: this.i18nMappingObj['draft'],
                                value: '0'
                            },
                            {
                                name: this.i18nMappingObj['enable'],
                                value: '1'
                            },
                            {
                                name: this.i18nMappingObj['disable'],
                                value: '2'
                            }
                        ];
                    }
                });
            },
            formChange(isChange) {
                this.disabled = !isChange;
                this.isChanged = isChange;
            },
            onCancel() {
                if (this.isChange) {
                    this.$confirm(this.i18nMappingObj['giveUpEdited'], this.i18nMappingObj['cancelDdit'], {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }).then(() => {
                        this.toogleShow();
                    });
                } else {
                    this.toogleShow();
                }
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
                        .then(({ valid }) => {
                            if (valid) {
                                const serializeData = dynamicForm.serialize();
                                const attrMap = ['nameI18nJson', 'descriptionI18nJson'];
                                let attrRawList = [];
                                let appName = '';
                                _.each(serializeData, (item) => {
                                    if (attrMap.includes(item.attrName)) {
                                        // 保存时去除前后空格
                                        utils.trimI18nJson(item.value.value);
                                        attrRawList.push(item.value);
                                    } else {
                                        attrRawList.push(item);
                                    }
                                    if (item.attrName === 'appName') {
                                        appName = item.value;
                                    }
                                });
                                // attrRawList = _.filter(attrRawList, item=>(item.value))
                                let data = {
                                    attrRawList,
                                    className: 'erd.cloud.foundation.core.dictionary.entity.DictionaryItem',
                                    isDraft: false,
                                    oid: this.oid,
                                    appName
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
                                        // this.$message({
                                        //     type: 'error',
                                        //     message:
                                        //         error?.data?.message ||
                                        //         (this.oid
                                        //             ? this.i18nMappingObj['updateFailed']
                                        //             : this.i18nMappingObj['createFailure']),
                                        //     showClose: true
                                        // });
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
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            }
        },
        components: {}
    };
});
