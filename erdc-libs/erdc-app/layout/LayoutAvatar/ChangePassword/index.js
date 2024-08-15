define(['text!' + ELMP.resource('erdc-app/layout/LayoutAvatar/ChangePassword/index.html')], function (template) {
    const FamKit = require('erdc-kit');
    const passwordDefault = {
        oldPassword: '',
        newPassword1: '',
        newPassword2: ''
    };
    return {
        template,
        props: {
            type: {
                type: String,
                default: 'user'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-app/layout/LayoutAvatar/locale.js'),
                changePassworkVisible: false,
                passwordForm: Object.assign({}, passwordDefault),
                passwordRules: []
            };
        },
        components: {
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`))
        },
        computed: {
            passwordValidators() {
                return _.map(this.passwordRules, (passwordRule) => ({
                    trigger: ['input', 'blur'],
                    message: passwordRule.err,
                    validator: (rule, value, callback) => {
                        const regExp = new RegExp(passwordRule.RegEx);
                        if (!regExp.test(value)) {
                            callback(new Error(rule.message));
                        } else {
                            callback();
                        }
                    }
                }));
            },
            passwordConfig() {
                const _this = this;
                return [
                    {
                        field: 'oldPassword',
                        component: 'erd-input',
                        label: this.i18nMappingObj.oldPassword,
                        required: true,
                        props: {
                            type: 'password',
                            showPassword: true,
                            autocomplete: 'new-password'
                        },
                        validators: [
                            {
                                trigger: ['input', 'blur'],
                                validator: (rule, value, callback) => {
                                    if (this.passwordForm.newPassword1 && this.passwordForm.newPassword1 === value) {
                                        callback(new Error(this.i18nMappingObj.passwordSame));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        listeners: {
                            input(data) {
                                _this.$set(_this.passwordForm, 'oldPassword', data.replace(/ /gi, ''));
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'newPassword1',
                        component: 'erd-input',
                        label: this.i18nMappingObj.newPassword,
                        required: true,
                        validators: [
                            ...FamKit.deepClone(this.passwordValidators),
                            {
                                trigger: ['input', 'blur'],
                                validator: (rule, value, callback) => {
                                    if (this.passwordForm.oldPassword || this.passwordForm.oldPassword === value) {
                                        this.$refs.changePassword.validateField('oldPassword');
                                    }
                                    if (this.passwordForm.newPassword2 || this.passwordForm.newPassword2 !== value) {
                                        this.$refs.changePassword.validateField('newPassword2');
                                    }
                                    callback();
                                }
                            }
                        ],
                        props: {
                            type: 'password',
                            showPassword: true,
                            autocomplete: 'new-password'
                        },
                        listeners: {
                            input(data) {
                                _this.$set(_this.passwordForm, 'newPassword1', data.replace(/ /gi, ''));
                            }
                        },

                        col: 24
                    },
                    {
                        field: 'newPassword2',
                        component: 'erd-input',
                        label: this.i18nMappingObj.confirmPassword,
                        required: true,
                        validators: [
                            ...FamKit.deepClone(this.passwordValidators),
                            {
                                message: this.i18nMappingObj.passwordDifferent,
                                trigger: ['input', 'blur'],
                                validator: (rule, value, callback) => {
                                    if (this.passwordForm.newPassword1 && this.passwordForm.newPassword1 !== value) {
                                        callback(new Error(this.i18nMappingObj.passwordDifferent));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            type: 'password',
                            showPassword: true,
                            autocomplete: 'new-password'
                        },
                        listeners: {
                            input(data) {
                                _this.$set(_this.passwordForm, 'newPassword2', data.replace(/ /gi, ''));
                            }
                        },
                        col: 24
                    }
                ];
            }
        },
        created() {
            if (this.type === 'userInfo') {
                this.fetchPasswordRule().then((rules) => {
                    this.passwordRules = _.map(rules, (rule) => {
                        return {
                            RegEx: rule.RegEx,
                            desc: rule.desc,
                            err: rule.err
                        };
                    });
                });
            }
        },
        methods: {
            show() {
                this.passwordForm = Object.assign({}, passwordDefault);
                this.changePassworkVisible = true;
            },
            fetchPasswordRule() {
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/fam/public/pwd/check/config'
                    }).then(({ data }) => {
                        const rules = data || [];
                        resolve(_.compact(rules.filter(rule => rule.del_flag === '1')));
                    });
                });
            },
            passwordSubmit() {
                const { changePassword } = this.$refs;
                changePassword.submit().then(({ valid }) => {
                    const data = {
                        newPassword: this.passwordForm.newPassword1,
                        oldPassword: this.passwordForm.oldPassword
                    };
                    if (valid) {
                        this.$famHttp({
                            url: '/fam/user/password/me',
                            method: 'put',
                            params: data
                        }).then((resp) => {
                            if (resp?.success) {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj.changedPasswordSuccessfully,
                                    showClose: true,
                                    onClose: () => {
                                        FamKit.toLogin();
                                    }
                                });
                                this.changePassworkVisible = false;
                            }
                        });
                    }
                });
            }
        }
    };
});
