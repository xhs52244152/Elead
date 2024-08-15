define(['text!' + ELMP.resource('erdc-type-components/PropertyMobileNode/index.html')], function (template) {
    return {
        template,
        props: {
            // 显示隐藏
            visible: Boolean,

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            dataList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            selectList: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/PropertyMobileNode/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    moveToClass: this.getI18nByKey('移动至分类'),
                    moveToOtherClass: this.getI18nByKey('移动到其他分类')
                },
                // targetVal: '',
                formData: {
                    targetVal: {}
                },
                loading: false
            };
        },
        watch: {
            dataList(n) {
                this.dataList = n;
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
                        field: 'targetVal',
                        component: 'erd-tree-select',
                        label: this.i18nMappingObj['moveToClass'],
                        // label: '移动至节点',
                        labelLangKey: 'moveToClass',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            nodeKey: 'oid',
                            data: this.dataList,
                            'default-expand-all': true,
                            filterable: true,
                            props: {
                                label: 'displayName',
                                children: 'children',
                                disabled: 'disabled'
                            }
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            onSubmit() {
                this.submit().then(() => {
                    // do nothing
                });
            },
            submit() {
                const _this = this;
                const { dynamicForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                const serializeData = dynamicForm.serialize();
                                let filterArr = this.selectList.map((item) => item.oid);
                                let oid = _this.formData.targetVal?.oid;

                                this.$famHttp({
                                    url: '/fam/type/attribute/moveGlobalAttribute?catalogOid=' + oid,
                                    data: filterArr,
                                    method: 'post'
                                })
                                    .then(() => {
                                        this.$message.success('移动成功');
                                        this.$emit('onsubmit', oid);
                                        this.formData.targetVal = null;
                                        _this.toggleShow();
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject(new Error('表单验证失败'));
                            }
                        })
                        .catch((error) => {
                            reject(error);
                            this.loading = false;
                        });
                });
            },
            toggleShow() {
                const visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            }
        }
    };
});
