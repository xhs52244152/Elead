define([
    ELMP.resource('platform-site-setting/api.js'),
    'text!' + ELMP.resource('platform-site-setting/index.html'),
    ELMP.resource('platform-site-setting/siteList/index.js')
], function (api, template, SiteList) {
    return {
        template: template,
        components: {
            SiteList: SiteList
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'platform-site-setting'),
                i18nMappingObj: {
                    curSite: this.getI18nByKey('curSite'),
                    mainSite: this.getI18nByKey('mainSite')
                }
            };
        },
        computed: {
            curSite() {
                return this.$store.state.app.fileSite || {};
            },
            user() {
                return this.$store.state.app.user;
            },
            siteTip() {
                return this.curSite.name
                    ? `${this.i18nMappingObj.curSite}: ${this.curSite.name}`
                    : this.i18nMappingObj.mainSite;
            },
            isShowSite() {
                return this.curSite && this.curSite.name;
            }
        },
        created() {
            this.getUserDefaultSite();
        },
        methods: {
            /**
             * 获取用户默认站点
             */
            getUserDefaultSite() {
                api.site.getDefaultSite().then((res) => {
                    this.$store.commit('app/PUSH_FILE_SITE', res.data);
                });
            },
            handleToggleSite() {
                this.$refs.siteRef.show();
            },
            handleSiteConfirm(selectedSite) {
                const { user } = this;
                if (!user.id || !selectedSite) return;
                const params = {
                    linkObjs: [user.id],
                    linkType: 'USER',
                    siteCode: selectedSite.code
                };

                api.site
                    .batchLinkSite(params)
                    .then(() => {
                        this.getUserDefaultSite();
                        this.$message({
                            showClose: true,
                            message: '站点切换成功',
                            type: 'success'
                        });
                    })
                    .catch(() => {
                        // this.$message({
                        //     showClose: true,
                        //     message: '站点切换失败',
                        //     type: 'warning',
                        // });
                    });
            }
        }
    };
});
