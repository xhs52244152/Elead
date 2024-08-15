define(['erdc-kit'], function (FamUtils) {
    const INHERIT_FEATURES_ENUM = {
        folder: 'erd.cloud.foundation.core.folder.entity.SubFolder',
        team: 'erd.cloud.foundation.core.team.entity.ContainerTeam',
        authority: 'erd.cloud.foundation.core.access.entity.AclPolicyRule'
    };
    return {
        data() {
            return {
                saveAsDialogVisible: false,
                saveAsTemplateForm: {
                    name: '',
                    description: '',
                    inheritFeatures: Object.values(INHERIT_FEATURES_ENUM)
                },
                inheritFeaturesCopy: Object.values(INHERIT_FEATURES_ENUM),
                saveAsLoading: false,
                currentObject: {}
            };
        },

        computed: {
            saveAsTemplateFormConfigs() {
                const formConfigs = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18n['name'],
                        labelLangKey: 'name',
                        required: true,
                        clearable: true,
                        props: {
                            placeholderLangKey: this.i18n['enterTemplateNameTip']
                        },
                        validators: [
                            {
                                required: true,
                                validator: (rule, value, callback) => {
                                    if (!value.trim()) {
                                        callback(this.i18n['enterTemplateNameTip']);
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: 'blur'
                            }
                        ],
                        col: 24
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: this.i18n['descriptionI18nJson'],
                        labelLangKey: 'descriptionI18nJson',
                        validators: [],
                        clearable: true,
                        props: {
                            type: 'textarea',
                            maxlength: '300',
                            'show-word-limit': true
                        },
                        col: 24
                    },
                    {
                        field: 'inheritFeatures',
                        component: 'fam-checkbox',
                        label: this.i18n['inheritFeatures'],
                        labelLangKey: 'inheritFeatures',
                        props: {
                            options: this.saveAsTemplateOptions
                        },
                        listeners: {
                            input: (val) => {
                                let newVal = val;

                                // 获取勾选的复选框的值
                                const addedVal = val.find((item) => !this.inheritFeaturesCopy.includes(item));

                                // 获取取消勾选的复选框的值
                                const removedVal = this.inheritFeaturesCopy.find((item) => !val.includes(item));
                                const { team, authority } = INHERIT_FEATURES_ENUM;
                                if (addedVal === team) {
                                    newVal = [...new Set([...val, authority])];
                                }
                                if (removedVal === team) {
                                    newVal = val.filter((item) => item !== authority);
                                }
                                this.saveAsTemplateForm.inheritFeatures = newVal;
                                this.inheritFeaturesCopy = newVal;
                            }
                        },
                        col: 24
                    }
                ];
                return formConfigs;
            },
            saveAsTemplateOptions() {
                let optionsList = [];
                Object.entries(INHERIT_FEATURES_ENUM).forEach((item) => {
                    const [label, value] = item;
                    optionsList.push({ label: this.i18nMappingObj[label], value });
                });
                const { team, authority } = INHERIT_FEATURES_ENUM;
                const hasCheckTeam = this.saveAsTemplateForm.inheritFeatures.includes(team);
                if (hasCheckTeam) {
                    return optionsList;
                } else {
                    return optionsList.filter((item) => item.value !== authority);
                }
            }
        },
        methods: {
            // 基本信息数据(传入的组件)
            basicForm(check) {
                return new Promise((resolve, reject) => {
                    // 获取基本信息数据
                    const { basicInfo } = this.$refs;
                    // basicInfo不存在代表没有自定义组件
                    if (!basicInfo) return resolve([]);
                    basicInfo.submit(check).then((data) => {
                        if (data) {
                            resolve(data);
                        } else {
                            reject(false);
                        }
                    });
                });
            },

            // 保存
            confirm() {
                FamUtils.debounceFn(() => {
                    let { saveInfo } = this;
                    this.confirmSave(true).then((res) => {
                        if (this.$listeners['before-submit']) {
                            this.$emit('before-submit', res, saveInfo);
                        } else {
                            saveInfo(res);
                        }
                    });
                }, 500);
            },

            // 对详情布局数据转换
            detailDataTransform(formData) {
                let attrRawList = formData.filter(
                    (item) => !['context', 'lifecycleStatus.status'].includes(item.attrName)
                );
                // 如果有传入的插槽，进行值合并

                let formSlotData = {};
                if (this.formSlotData && Object.keys(this.formSlotData).length) {
                    for (let x in this.formSlotData) {
                        formSlotData.attrName = x;
                        formSlotData.value = this.formSlotData[x];
                    }
                    attrRawList = attrRawList.concat(formSlotData);
                }
                let obj = {
                    attrRawList,
                    className: this.className
                };
                // if为true代表是编辑
                if (this.oid || this.$route.query.pid) {
                    obj.oid = this.oid || this.$route.query.pid;
                } else {
                    obj.typeReference = this.typeReference;
                }
                return obj;
            },

            // 获取详情信息布局数据
            detailForm(check) {
                const { infoForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    if (!check) {
                        if (infoForm) {
                            let formData = infoForm?.serializeEditableAttr();
                            let obj = this.detailDataTransform(formData);
                            resolve(obj);
                        } else {
                            resolve([]);
                        }
                    } else {
                        infoForm.submit().then(({ valid }) => {
                            let formData = infoForm?.serializeEditableAttr();

                            let obj = this.detailDataTransform(formData);
                            if (valid) {
                                resolve(obj);
                            } else {
                                reject(false);
                            }
                        });
                    }
                });
            },
            saveInfo(obj, isDraft, tip) {
                this.$famHttp({
                    url: this.compConfig?.submitUrl,
                    data: obj,
                    method: 'post'
                }).then((res) => {
                    const oid = res.data;
                    if (res.code === '200') {
                        this.$message({
                            message: tip || '成功',
                            type: 'success',
                            showClose: true
                        });
                        this.$router.push({
                            path: oid
                                ? `/common-page/${this.className}/info/${oid}`
                                : `/common-page/${this.className}/list`
                        });
                        // 保存成功后抛出方法进行页面跳转
                        this.$emit('after-submit', res);
                    }
                });
            },

            // 保存草稿
            saveDraft() {
                FamUtils.debounceFn(() => {
                    let { saveInfo } = this;
                    this.confirmSave(false).then((res) => {
                        if (this.$listeners['before-submit']) {
                            this.$emit('before-submit', res, saveInfo, 'draft');
                        } else {
                            res.isDraft = true;
                            saveInfo(res, 'draft');
                        }
                    });
                }, 500);
            },

            // 将基本信息和详情信息布局数据结合
            confirmSave(check) {
                const result = Promise.all([this.basicForm(check), this.detailForm(check)]);
                return new Promise((resolve, reject) => {
                    result
                        .then((res) => {
                            //res[0]基本信息数据 res[1]详情布局数据
                            // 处理方式： 将基本信息(res[0])数据合并到详情布局数据(res[1])的attrRawList
                            // res[1].attrRawList不存在代表详情布局没有渲染出来
                            let resoult = res[1];
                            if (res[0] && res[0].length) {
                                resoult.attrRawList = resoult.attrRawList.concat(res[0]);
                            }
                            resolve(resoult);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },

            // 取消
            cancel() {
                this.$router.push({
                    path: `/common-page/${this.className}/list`
                });
            },

            // 点击其他操作按钮
            handlerTitleTopBtn({ btnInfo, rowData }) {
                const btnName = btnInfo?.name.split('_')[1];
                this.currentObject = rowData;
                switch (btnName) {
                    case 'UPDATE':
                        this.handlerUpdate();
                        break;
                    case 'FAVORITE':
                        this.onCollect();
                        break;
                    case 'CANCEL':
                        this.onCancelCollect();
                        break;
                    case 'SAVE': // 另存为
                        this.saveAsDialogVisible = true;
                        break;
                    default:
                        break;
                }
            },

            // 更新
            handlerUpdate() {
                this.$router.replace({
                    ...this.$route,
                    query: {
                        ...this.$route.query,
                        pageType: 'edit'
                    }
                });
            },

            // 收藏
            onCollect() {
                this.onToggleCollect('/common/create');
            },

            // 取消收藏
            onCancelCollect() {
                this.onToggleCollect('/common/update');
            },
            onToggleCollect(url) {
                const data = {
                    attrRawList: [
                        {
                            attrName: 'roleBObjectRef',
                            value: this.currentObject.oid
                        },
                        {
                            attrName: 'type',
                            value: 'FAVORITE'
                        },
                        {
                            attrName: 'tmplTemplated',
                            value: this.$route.query.isTemplate === 'true'
                        }
                    ],
                    className: 'erd.cloud.favorites.entity.FavoritesLink'
                };
                return this.$famHttp({
                    url,
                    data,
                    method: 'post'
                }).then((res) => {
                    if (res.success) {
                        this.$message.success(this.i18n['保存成功']);
                    }
                });
            },
            submitSaveAsTemplate() {
                this.$refs.saveAsTemplFormRef.validate((valid) => {
                    if (valid) {
                        const typeReferenceOid = this.currentObject.typeReference;
                        const className = this.currentObject.typeName;
                        let params = {
                            attrRawList: [
                                {
                                    attrName: 'templateInfo',
                                    value: {
                                        tmplTemplated: true
                                    }
                                },
                                {
                                    attrName: 'templateInfo.TmplEnabled',
                                    value: true
                                },
                                {
                                    attrName: 'templateInfo.tmplTemplated',
                                    value: true
                                },
                                {
                                    attrName: 'typeReference',
                                    value: typeReferenceOid
                                },
                                {
                                    attrName: 'name',
                                    value: this.saveAsTemplateForm.name
                                },
                                {
                                    attrName: 'description',
                                    value: this.saveAsTemplateForm.description
                                },
                                {
                                    attrName: 'copyDependentCharacteristics',
                                    value: this.saveAsTemplateForm.inheritFeatures.join()
                                }
                            ],
                            className,
                            typeReference: typeReferenceOid
                        };
                        this.saveAsLoading = true;
                        return this.$famHttp({
                            url: `example/templ/copy/${this.currentObject.oid}`,
                            method: 'POST',
                            data: params
                        })
                            .then((res) => {
                                if (res.success) {
                                    this.$message.success(this.i18nMappingObj.operationSuccess);
                                    this.closeSaveAsDialog();
                                }
                            })
                            .finally(() => {
                                this.saveAsLoading = false;
                            });
                    }
                });
            },
            closeSaveAsDialog() {
                this.saveAsDialogVisible = false;
                this.saveAsTemplateForm = {
                    name: '',
                    description: '',
                    inheritFeatures: Object.values(INHERIT_FEATURES_ENUM)
                };
            }
        }
    };
});
