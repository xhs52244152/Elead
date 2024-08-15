define([
    'text!' + ELMP.resource('erdc-app/layout/LayoutAvatar/MemberForm/template.html'),
    ELMP.resource('erdc-app/layout/LayoutAvatar/MemberForm/api.js'),
    'underscore',
    'css!' + ELMP.resource('erdc-app/layout/LayoutAvatar/MemberForm/style.css')
], function (template, api) {
    const FamKit = require('erdc-kit');
    const store = require('fam:store');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`)),
            FamOrganizationSelect: FamKit.asyncComponent(
                ELMP.resource(`erdc-components/FamOrganizationSelect/index.js`)
            ),
            FamAutographUpload: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAutographUpload/index.js`)),
            ChangeSignature: FamKit.asyncComponent(
                ELMP.resource('erdc-app/layout/LayoutAvatar/ChangeSignature/index.js')
            ),
            ChangePassword: FamKit.asyncComponent(ELMP.resource('erdc-app/layout/LayoutAvatar/ChangePassword/index.js'))
        },
        props: {
            oid: String,
            defaultValue: {
                type: Object,
                default() {
                    return {};
                }
            },
            editable: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            readonly: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            type: {
                type: String,
                default: 'user'
            },
            queryLayoutParams: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-app/layout/LayoutAvatar/locale.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'code',
                    'loginAccount',
                    'mobile',
                    'orgName',
                    '请选择',
                    '请输入',
                    'chineseName',
                    'englishName',
                    'password',
                    'emailAddress',
                    'confidentiality',
                    'autograph',
                    '请输入邮箱地址',
                    '请输入正确的邮箱地址',
                    '请输入11位正确的手机号',
                    '请输入工号',
                    '请输入正确的工号',
                    '请输入账号',
                    '请输入正确的账号',
                    '请输入用户中文名',
                    '请输入正确的用户中文名',
                    '请输入用户英文名',
                    '请输入正确的用户英文名',
                    'changedPasswordSuccessfully',
                    'newPassword',
                    'oldPassword',
                    'confirmPassword',
                    'passwordDifferent',
                    'changePassword',
                    'ok',
                    'cancel',
                    'replaceSignature'
                ]),
                form: {
                    avatarList: [],
                    avatar: ELMP.resource('avatars/lib/avatar.png')
                },
                editableAttr: ['name', 'signature'],
                imageUrl: '',
                acceptList: '.jpg,.jpeg,.bmp,.png',
                limitSize: 10,
                signature: '',
                widgetList: [],
                accountRules: []
            };
        },
        computed: {
            threeMemberEnv() {
                return this.$store?.state?.app?.threeMemberEnv;
            },
            formId() {
                return this.readonly ? 'DETAIL' : this.editable ? 'UPDATE' : 'CREATE';
            },
            innerQueryLayoutParams() {
                return {
                    objectOid: this.oid,
                    ...this.queryLayoutParams
                };
            },
            validators() {
                const vm = this;
                return {
                    code: [
                        { required: true, message: this.i18nMappingObj['请输入工号'], trigger: 'blur' },
                        {
                            trigger: ['blur', 'change'],
                            ...this.accountValidators
                            // validator(rule, value, callback) {
                            //     var reg = /^[A-Za-z0-9]+$/;
                            //     if (value) {
                            //         if (!reg.test(value)) {
                            //             callback(new Error(`${vm.i18nMappingObj['请输入正确的工号']}`));
                            //         } else {
                            //             callback();
                            //         }
                            //     } else {
                            //         callback();
                            //     }
                            // }
                        }
                    ],
                    name: [
                        { required: true, message: this.i18nMappingObj['请输入账号'], trigger: 'blur' },
                        {
                            trigger: ['blur', 'change'],
                            ...this.accountValidators
                            // validator(rule, value, callback) {
                            //     var reg = /^(?!^\d+$)[\u4e00-\u9fa5a-zA-Z0-9_]+$/;
                            //     if (value) {
                            //         if (!reg.test(value)) {
                            //             callback(new Error(`${vm.i18nMappingObj['请输入正确的账号']}`));
                            //         } else {
                            //             callback();
                            //         }
                            //     } else {
                            //         callback();
                            //     }
                            // }
                        }
                    ],

                    displayNameCn: [
                        { required: true, message: this.i18nMappingObj['请输入用户中文名'], trigger: 'blur' }
                    ],
                    displayNameEn: [
                        ...(this.threeMemberEnv
                            ? [
                                  {
                                      required: false,
                                      message: this.i18nMappingObj['请输入用户英文名'],
                                      trigger: 'blur'
                                  }
                              ]
                            : []),
                        {
                            trigger: ['blur', 'change'],
                            validator(rule, value, callback) {
                                var reg = /^[a-zA-Z0-9]+([\s_]*[a-zA-Z0-9])*([\s_]+[a-zA-Z0-9]+)*[\s_]*$/;
                                if (value) {
                                    if (!reg.test(value)) {
                                        callback(new Error(`${vm.i18nMappingObj['请输入正确的用户英文名']}`));
                                    } else {
                                        callback();
                                    }
                                } else {
                                    callback();
                                }
                            }
                        }
                    ],
                    email: [
                        ...(this.threeMemberEnv
                            ? [
                                  {
                                      required: false,
                                      message: this.i18nMappingObj['请输入邮箱地址'],
                                      trigger: 'blur'
                                  }
                              ]
                            : []),
                        {
                            trigger: ['blur', 'change'],
                            validator(rule, value, callback) {
                                // var reg = /^([A-Za-z0-9_.-]{2,})+@([A-Za-z0-9-]{2,})+.[A-Za-z]{2,}$/;
                                var reg = /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/;
                                if (value) {
                                    if (!reg.test(value)) {
                                        callback(new Error(`${vm.i18nMappingObj['请输入正确的邮箱地址']}`));
                                    } else {
                                        callback();
                                    }
                                } else {
                                    callback();
                                }
                            }
                        }
                    ],
                    mobile: [
                        {
                            trigger: ['blur', 'change'],
                            validator(rule, value, callback) {
                                if (value) {
                                    if (!/^1[3456789]\d{9}$/.test(value)) {
                                        callback(new Error(`${vm.i18nMappingObj['请输入11位正确的手机号']}`));
                                    } else {
                                        callback();
                                    }
                                } else {
                                    callback();
                                }
                            }
                        }
                    ]
                };
            },
            accountValidators() {
                return _.map(this.accountRules, (accountRule) => ({
                    trigger: ['input', 'blur'],
                    message: accountRule.err,
                    validator: (rule, value, callback) => {
                        const regExp = new RegExp(accountRule.RegEx);
                        if (!regExp.test(value)) {
                            callback(new Error(rule.message));
                        } else {
                            callback();
                        }
                    }
                }));
            }
        },
        watch: {
            widgetList: function (widgetList) {
                if (!this.$store.state.app.threeMemberOtherConfig?.updatePwd?.enable) {
                    widgetList.forEach((i) => {
                        if (i.schema.props.name === 'password') {
                            i.schema.hidden = true;
                        }
                    });
                }
            },
            oid: {
                immediate: true,
                handler(oid) {
                    if (oid) {
                        this.fetchMemberDetail();
                    }
                }
            },
            defaultValue: {
                immediate: true,
                handler(defaultValue) {
                    this.form = _.extend({}, this.form, defaultValue);
                }
            },
            'form.avatar': {
                deep: true,
                handler(avatar) {
                    if (!avatar.match(/\//gi)) {
                        this.fnGetFileById(avatar);
                    }
                }
            }
        },
        mounted() {
            this.loadSignature();
            this.fetchAccountRule().then((rules) => {
                this.accountRules = _.map(rules, (rule) => {
                    return {
                        RegEx: rule.RegEx,
                        desc: rule.desc,
                        err: rule.err
                    };
                });
            });
        },
        methods: {
            submit(isDraft = false) {
                const form = this.$refs.form;
                return new Promise((resolve, reject) => {
                    form.submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 过滤只取当前表单显示的字段，特殊字段额外增加数组处理
                                // const excludedAttrs = ['orgOid'];
                                // const includeAttrs = (this.data || [])
                                //     .map((item) => item.field)
                                //     .filter((item) => !excludedAttrs.includes(item));
                                // const filter = (item) => _.includes(includeAttrs, item.attrName);
                                // let attrRawList = _.filter(form.serialize(), filter);
                                let attrRawList = _.filter(form.serializeEditableAttr(), (item) => {
                                    return !_.includes(['orgIds'], item.attrName) && typeof item.value !== 'undefined';
                                });

                                // 新增、编辑用户固定参数
                                attrRawList.push(
                                    {
                                        attrName: 'userType',
                                        value: 'SYSTEM'
                                    },
                                    {
                                        attrName: 'status',
                                        value: 'ACTIVE'
                                    }
                                );
                                const className = store.getters.className('user');
                                // 关联项（所属部门）
                                let relationList = _.map(this.form.orgIds, (org) => ({
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: org.oid
                                        },
                                        {
                                            attrName: 'deptUserType',
                                            value: 'DEPT_USER'
                                        },
                                        {
                                            attrName: 'status',
                                            value: '1'
                                        }
                                    ],
                                    className: store.getters.className('organizationLink')
                                }));
                                let params = {
                                    attrRawList,
                                    className,
                                    isDraft,
                                    typeReference:
                                        'OR:erd.cloud.foundation.type.entity.TypeDefinition:1547167325874143234',
                                    associationField: 'roleBObjectRef',
                                    relationList: relationList
                                };
                                // 更新
                                if (this.editable) {
                                    params.action = 'UPDATE';
                                    params.oid = this.oid;
                                    delete params.relationList; // 编辑不需要传relationList，不能更改部门
                                }
                                this.saveMember(params).then((response) => {
                                    resolve(response);
                                });
                            } else {
                                reject(new Error('请填入正确的成员信息'));
                            }
                        })
                        .catch(reject);
                });
            },
            // 创建、编辑用户，调用接口是公用接口，跟部门的一样
            saveMember(payload) {
                return new Promise((resolve, reject) => {
                    if (this.editable) {
                        // 编辑
                        api.updateOrganization(payload)
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success('用户信息修改成功');
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch(reject);
                    } else {
                        // 新增
                        api.createOrganization(payload)
                            .then((response) => {
                                const { success, message } = response;
                                if (success) {
                                    this.$message.success('创建成功');
                                    resolve(response);
                                } else {
                                    reject(new Error(message));
                                }
                            })
                            .catch(reject);
                    }
                });
            },
            // 根据oid查询详情
            fetchMemberDetail() {
                this.fetchMemberByOId(this.oid).then(({ data }) => {
                    const { rawData } = data;
                    this.extractOrganizationAttr(rawData);
                });
            },
            fetchMemberByOId(oid) {
                return api.fetchOrganizationByOId(oid);
            },
            // 反序列字段key值
            extractOrganizationAttr(rawData) {
                let extractData = FamKit.deserializeAttr(rawData, {
                    valueMap: {
                        department({ displayName }) {
                            return displayName;
                        }
                    }
                });
                let orgObj = { orgIds: this.defaultValue?.orgIds, orgName: this.defaultValue?.orgName };
                this.form = { ...orgObj, ...extractData };
                this.$emit('callback', this.form);
            },
            translateOrgName(scope) {
                if (scope.data.orgName) {
                    return scope.data.orgName;
                }
                const orgList = _.isArray(scope.data.orgIds) ? scope.data.orgIds : _.compact([scope.data.orgIds]);
                return _.chain(orgList).map('name').compact().value().join(',');
            },
            handleAvatarSuccess(res, file) {
                this.imageUrl = file.url || '';
                this.$set(this.form, 'avatar', res.data);
            },
            changePassword() {
                this.$refs.passwordForm.show();
            },
            // 查询文件回显
            fnGetFileById(item) {
                this.imageUrl = FamKit.imgUrlCreator(item, {
                    size: 'S'
                });
            },
            loadSignature() {
                const self = this;
                this.$famHttp({
                    url: '/file/signature/v1/picture/me',
                    params: {
                        className: 'erd.cloud.signature.entity.SignatureTmpl'
                    },
                    method: 'get',
                    responseType: 'blob'
                }).then((res) => {
                    if (res) {
                        const reader = new FileReader();
                        if (res.data.size > 0) {
                            reader.readAsDataURL(res.data);
                            reader.onload = function (e) {
                                self.signature = e.target.result;
                            };
                        }
                    }
                });
            },
            previewImg(url) {
                FamKit.previewImg(url);
            },
            changeSignature() {
                this.$refs.signatureForm.show();
            },
            fetchAccountRule() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/peferences/accountConfig'
                    }).then(({ data }) => {
                        let rules;
                        try {
                            rules = JSON.parse(data);
                        } catch {
                            rules = data;
                        }
                        resolve(_.compact(rules.filter((rule) => rule.del_flag === '1')));
                    });
                });
            }
        }
    };
});
