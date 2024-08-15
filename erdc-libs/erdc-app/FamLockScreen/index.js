define([
    'text!' + ELMP.resource('erdc-app/FamLockScreen/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-app/screen-lock.js'),
    'css!' + ELMP.resource('erdc-app/FamLockScreen/style.css')
], function (template, ErdcKit, screenLock) {
    return {
        template,
        components: {},
        props: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-app/FamLockScreen/locale/index.js'),
                i18nMappingObj: {
                    signOut: this.getI18nByKey('signOut'),
                    pleaseEnterPassword: this.getI18nByKey('pleaseEnterPassword'),
                    passwordError: this.getI18nByKey('passwordError'),
                    confirm: this.getI18nByKey('confirm')
                },
                form: {
                    password: ''
                },
                passwordError: false,
                errorMsg: '',
                imageUrl: ELMP.resource('erdc-app/FamLockScreen/images/lockScreen.png')
            };
        },
        computed: {
            user() {
                return this.$store.state.app.user;
            },
            defaultAvatar() {
                return ELMP.resource('avatars/lib/avatar.png');
            },
            userAvatar() {
                return this.user.avatar && !this.user.avatar.match(/\//gi)
                    ? ErdcKit.imgUrlCreator(this.user.avatar, {
                          size: 'S'
                      })
                    : this.defaultAvatar;
            }
        },
        methods: {
            login() {
                if (this.form.password.length === 0) {
                    this.passwordError = true;
                    this.$nextTick(() => {
                        this.$refs.confirmFocus?.focus();
                    });
                    return;
                }
                const loading = this.$loading({
                    text: '登录中',
                    target: '.fam-login-container',
                    lock: true,
                    background: 'rgba(255, 255, 255, 0.6)'
                });
                loading.$el.style.display = 'block';
                loading.$el.style['z-index'] = '10010';
                ErdcKit.login({
                    username: this.user.name,
                    password: this.form.password
                })
                    .then((token) => {
                        localStorage.setItem('__erdcLogin__', token);
                        window.LS.set('accessToken', token);
                        this.$nextTick(() => {
                            screenLock.unlockScreen();
                        });
                    })
                    .catch((data) => {
                        this.passwordError = true;
                        this.errorMsg = data.message;
                    })
                    .finally(() => {
                        loading.close();
                    });
            },
            currentError() {
                this.form.password = '';
                this.passwordError = !this.passwordError;
            },
            // 退出登录
            onLogout() {
                ErdcKit.toLogin();
            }
        }
    };
});
