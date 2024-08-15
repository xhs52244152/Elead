define(['erdcloud.store', 'vue', 'erdcloud.i18n', 'erdc-kit'], function (store, Vue, ErdcloudI18n, ErdcKit) {
    const FamKit = require('erdc-kit');
    const vm = new Vue({
        template: `<div>
            <ChangePassword
                ref="passwordForm"
                type="userInfo"
            ></ChangePassword>
            <erd-ex-dialog
                :showFullscreen="false"
                :showClose="false"
                :visible.sync="tipsVisible"
                :close-on-press-escape="false"
                width="400px"
                >
                <template #title>
                    <div class="flex justify-between">
                        <div class="font-bold">{{ title }}</div>
                        <div class="cursor-pointer" @click="logOut"><i class="erd-iconfont erd-icon-logout"></i></div>
                    </div>
                </template>
                <div class="flex align-items-center">
                    <div class="text-2xl color-warning mr-8"><i class="erd-iconfont erd-icon-warning-solid"></i></div>
                    <div v-html="desc"></div>
                </div>
            </erd-ex-dialog>
        </div>`,
        store: store,
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-app/layout/LayoutAvatar/locale.js'),
                tipsVisible: false,
                title: ErdcloudI18n.translate('firstLoginTitle'),
                desc: ErdcloudI18n.translate('firstLoginDesc')
            };
        },
        mounted() {
            window.updatePass = this.updatePass;
            this.initMessage();
        },
        beforeDestroy() {
            window.updatePass = null;
        },
        computed: {
            updatePwd() {
                return store.state.app?.updatePwd || 0;
            }
        },
        components: {
            ChangePassword: FamKit.asyncComponent(ELMP.resource('erdc-app/layout/LayoutAvatar/ChangePassword/index.js'))
        },
        methods: {
            initMessage() {
                if (this.updatePwd === 1) {
                    this.title = ErdcloudI18n.translate('firstLoginTitle');
                    this.desc = ErdcloudI18n.translate('firstLoginDesc');
                } else if (this.updatePwd === 2) {
                    this.title = ErdcloudI18n.translate('forcedLoginTitle');
                    this.desc = ErdcloudI18n.translate('forcedLoginDesc');
                }
                if (this.updatePwd !== 0) {
                    this.tipsVisible = true;
                }
            },
            updatePass() {
                this.$refs.passwordForm.show();
            },
            logOut() {
                this.$confirm(ErdcloudI18n.translate('sureConfirm'), ErdcloudI18n.translate('signOut'), {
                    confirmButtonText: ErdcloudI18n.translate('confirm'),
                    cancelButtonText: ErdcloudI18n.translate('cancel'),
                    type: 'warning'
                }).then(() => {
                    ErdcKit.toLogin();
                });
            }
        }
    });
    vm.$mount();
    document.body.append(vm.$el);
});
