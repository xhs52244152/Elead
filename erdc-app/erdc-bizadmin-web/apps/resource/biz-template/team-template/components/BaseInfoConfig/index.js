/*
    类型基本信息配置
    先引用 kit组件
    BaseInfoConfig: FamKit.asyncComponent(ELMP.resource('biz-template/team-template/components/BaseInfoConfig/index.js')), // 类型基本信息配置


    <base-info-config>
    </base-info-config>

    返回参数

 */
define([
    'text!' + ELMP.resource('biz-template/team-template/components/BaseInfoConfig/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-template/team-template/components/BaseInfoConfig/style.css')
], function (template, utils) {
    return {
        template,
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

            // 类型
            type: {
                type: String,
                default: () => {
                    return 'create';
                }
            },
            // oid
            oid: {
                type: String,
                default: () => {
                    return '';
                }
            },
            appName: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-template/team-template/components/BaseInfoConfig/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    placeEnter: this.getI18nByKey('请输入'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    name: this.getI18nByKey('名称'),
                    code: this.getI18nByKey('编码'),
                    tip: this.getI18nByKey('提示'),
                    description: this.getI18nByKey('描述'),
                    updateSuccessfully: this.getI18nByKey('更新成功'),
                    createSuccessfully: this.getI18nByKey('新增成功'),
                    updateFailure: this.getI18nByKey('更新失败'),
                    createFailure: this.getI18nByKey('新增失败'),
                    confirmCancel: this.getI18nByKey('确定取消'),
                    giveUpCreate: this.getI18nByKey('是否放弃创建'),
                    giveUpEdit: this.getI18nByKey('是否放弃编辑')
                },
                disabled: false,
                searchVal: '',
                formData: {
                    nameI18nJson: {
                        attr: 'nameI18nJson',
                        attrName: '名称',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    },
                    identifierNo: '',
                    descriptionI18nJson: {
                        attr: 'nameI18nJson',
                        attrName: '说明',
                        value: {
                            value: '',
                            zh_cn: '',
                            zh_tw: '',
                            en_gb: '',
                            en_us: ''
                        }
                    }
                },
                loading: false
            };
        },
        watch: {},
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
            formConfig() {
                return [
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['name'],
                        labelLangKey: 'name',
                        disabled: false,
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['placeEnter'],
                            placeholderLangKey: 'placeEnter'
                        },
                        col: 24
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj['code'],
                        labelLangKey: 'code',
                        disabled: true,
                        required: false,
                        readonly: true,
                        validators: [],
                        hidden: this.type == 'create' ? true : false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj['placeEnter'],
                            placeholderLangKey: 'placeEnter'
                        },
                        col: 24
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['description'],
                        labelLangKey: 'description',
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['placeEnter'],
                            placeholderLangKey: 'placeEnter',
                            type: 'textarea',
                            required: true,
                            i18nName: this.i18nMappingObj['description']
                        },
                        col: 24
                    }
                ];
            }
        },
        mounted() {
            if (this.oid) {
                this.getData();
            }
        },
        methods: {
            /**
             * 获取详情
             * @returns
             */
            getData() {
                let url = '/fam/team/selectById' + '?teamOid=' + this.oid;

                this.$famHttp({
                    url,
                    method: 'get'
                })
                    .then((resp) => {
                        let { data } = resp;
                        this.formData = data;
                        this.formData['nameI18nJson'] = {
                            attr: 'nameI18nJson',
                            attrName: '名称',
                            value: data.nameI18nJson
                        };
                        this.formData['descriptionI18nJson'] = {
                            attr: 'nameI18nJson',
                            attrName: '说明',
                            value: data.descriptionI18nJson
                        };
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            // 取消
            onCancel() {
                this.toggleShow();
                return;
                // if (this.isChanged) {
                //     let giveUpKeep =
                //         this.type == 'create' ? this.i18nMappingObj['giveUpCreate'] : this.i18nMappingObj['giveUpEdit'];
                //     this.$confirm(giveUpKeep, this.i18nMappingObj['tip'], {
                //         confirmButtonText: this.i18nMappingObj['confirm'],
                //         cancelButtonText: this.i18nMappingObj['cancel'],
                //         type: 'warning'
                //     }).then(() => {
                //         this.toggleShow();
                //     });
                // } else {
                //     this.toggleShow();
                // }
            },
            saveSubmit() {
                return this.submit();
            },
            // 提交
            submit(isDraft = false) {
                let url = '/fam/team/template/create';
                if (this.oid) {
                    url = '/fam/team/template/update';
                }
                const { dynamicForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                utils.trimI18nJson(this.formData['nameI18nJson'].value);
                                let data = {
                                    nameI18nJson: this.formData['nameI18nJson'].value,
                                    descriptionI18nJson: this.formData['descriptionI18nJson'].value,
                                    enabled: true,
                                    oid: this.type === 'edit' ? this.formData['oid'] : undefined,
                                    teamRoleLinkDtos: [],
                                    appName: this.type === 'create' ? this.appName : this.formData.appName
                                };

                                this.$famHttp({
                                    url,
                                    data,
                                    method: this.type === 'create' ? 'post' : 'put'
                                })
                                    .then((resp) => {
                                        resolve(resp);
                                        this.$message({
                                            message: this.oid
                                                ? this.i18nMappingObj['updateSuccessfully']
                                                : this.i18nMappingObj['createSuccessfully'],
                                            type: 'success',
                                            showClose: true
                                        });
                                        if (this.oid) {
                                            this.$emit('onsubmit', resp.data);
                                        } else {
                                            this.$emit('onsubmit');
                                        }
                                        this.toggleShow();
                                        // this.$emit('onsubmit', resp.data)
                                    })
                                    .catch((error) => {
                                        reject(error);
                                        // this.$message({
                                        //     type: 'error',
                                        //     message: error?.data?.message || (this.oid ? this.i18nMappingObj['updateFailure'] : this.i18nMappingObj['createFailure'])
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
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            }
        }
    };
});
