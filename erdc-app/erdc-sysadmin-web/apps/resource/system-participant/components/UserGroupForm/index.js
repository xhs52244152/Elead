define([
    'text!' + ELMP.resource('system-participant/components/UserGroupForm/template.html'),
    'erdcloud.kit',
    'fam:store',
    'underscore',
    ELMP.resource('erdc-app/api/common.js')
], function (template, ErdcKit) {
    const store = require('fam:store');
    const _ = require('underscore');
    const commonApi = require(ELMP.resource('erdc-app/api/common.js'));
    return {
        template,
        props: {
            oid: String,
            appName: {
                type: String,
                required: true,
                default() {
                    return '';
                }
            },
            defaultValue: {
                type: Object,
                default() {
                    return {};
                }
            },
            editable: {
                type: Boolean,
                default: false
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            }
        },
        data() {
            return {
                form: this.defaultValue,
                leaders: [],
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-participant/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'createSuccess',
                    'editorSuccess',
                    'deleteSuccess',
                    '请输入',
                    'number',
                    'name',
                    '请输入名称',
                    'description'
                ])
            };
        },
        computed: {
            formConfig() {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.identifierNo,
                        validators: [
                            { required: true, message: this.i18n.pleaseFillInIdentifierNo },
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (value === '') {
                                        callback(new Error(this.pleaseFillInIdentifierNo));
                                    } else if (/[^a-zA-Z0-9_.]/gi.test(value)) {
                                        callback(new Error(this.i18n.identifierNoRule));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        required: true,
                        disabled: !!this.editable,
                        readonly: !!this.editable,
                        props: {
                            clearable: true,
                            placeholder: this.i18n.identifierNoRule
                        },
                        col: 12,
                        slots: {}
                    },
                    {
                        field: 'nameI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.name,
                        required: !this.readonly,
                        validators: [
                            {
                                trigger: 'blur',
                                message: this.i18nMappingObj['请输入名称'],
                                validator: (rule, value, callback) => {
                                    if (
                                        !value ||
                                        !value.value ||
                                        (value.value.value === '' &&
                                            value.value.en_us === '' &&
                                            value.value.zh_cn === '')
                                    ) {
                                        callback(new Error(rule.message));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            i18nName: this.i18nMappingObj.name
                        },
                        col: 12,
                        slots: {}
                    },
                    {
                        field: 'descriptionI18nJson',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj.description,
                        validators: [],
                        props: {
                            type: 'textarea',
                            row: 3,
                            clearable: true,
                            i18nName: this.i18nMappingObj.description
                        },
                        col: 24,
                        slots: {}
                    }
                ];
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(oid) {
                    if (oid) {
                        this.fetchUserGroup();
                    }
                }
            }
        },
        methods: {
            submit(isDraft = false) {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 过滤只取当前表单显示的字段，特殊字段额外增加数组处理
                                const includeAttrs = (this.formConfig || []).map((item) => item.field); // .filter(item=> !excluedAttrs.includes(item));
                                const filter = (item) => _.includes(includeAttrs, item.attrName);
                                let attrRawList = _.filter(dynamicForm.serialize(), filter);
                                const className = store.getters.className('Group');
                                // 处理请求参数
                                attrRawList.forEach((item) => {
                                    if (item.attrName.includes('I18nJson')) {
                                        item.value = item.value?.value;
                                    }
                                });
                                let params = {
                                    attrRawList,
                                    className,
                                    isDraft,
                                    appName: this.appName || ''
                                };
                                // 更新
                                if (this.editable) {
                                    params.action = 'UPDATE';
                                    params.oid = this.oid;
                                }
                                this.saveForm(params)
                                    .then((response) => {
                                        resolve(response);
                                    })
                                    .catch((err) => {
                                        reject(err);
                                        // this.$message({
                                        //     message: err?.data?.message || err?.data || err,
                                        //     type: "error",
                                        //     showClose: true
                                        // });
                                    });
                            } else {
                                reject(new Error('请填入正确的部门信息'));
                            }
                        })
                        .catch(reject);
                });
            },
            // 保存表单数据，这里的接口是公共的
            saveForm(payload) {
                return new Promise((resolve, reject) => {
                    if (this.editable) {
                        // 编辑
                        commonApi
                            .updateObject(payload)
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success(this.i18nMappingObj.editorSuccess);
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch(reject);
                    } else {
                        // 新增
                        commonApi
                            .createObject(payload)
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success(this.i18nMappingObj.createSuccess);
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch(reject);
                    }
                });
            },
            // 根据oid查询部门详情
            fetchUserGroup() {
                // const loading = this.$loading({
                //     target: 'body',
                //     body: true,
                //     fullscreen: true,
                //     lock: true,
                //     background: 'rgba(255, 255, 255, 0.6)',
                //     customClass: '',
                // });
                commonApi.fetchObjectAttr(this.oid).then(({ data }) => {
                    const { rawData } = data;
                    this.extractOrganizationAttr(rawData);
                    // loading.close()
                });
            },
            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                this.form = ErdcKit.deserializeAttr(rawData, {
                    valueMap: {
                        parentRef({ displayName = null, oid }) {
                            return {
                                name: displayName,
                                oid
                                // id: value?.id
                            };
                        },
                        leaderIds(e, { leaders = {} }) {
                            return leaders.value || [];
                        }
                    }
                });
                this.leaders = (this.form['leaders'] || []).map((item) => item);
            }
        }
    };
});
