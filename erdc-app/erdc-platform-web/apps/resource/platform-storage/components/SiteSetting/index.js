define([
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/components/SiteSetting/index.html'),
    ELMP.resource('platform-storage/components/SiteList/index.js')
], function (api, template, SiteList) {
    return {
        template: template,
        components: {
            SiteList: SiteList
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    curSite: this.getI18nByKey('curSite'),
                    mainSite: this.getI18nByKey('mainSite')
                },

                curSite: {} // 当前关联的站点
            };
        },
        computed: {
            user() {
                return this.$store.state.app.user;
            },
            siteTip() {
                return this.curSite.name
                    ? `${this.i18nMappingObj.curSite}: ${this.curSite.name}`
                    : this.i18nMappingObj.mainSite;
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
                    this.curSite = res.data || {};
                    this.$store.dispatch('erdcloudDoc/setUserSite', this.curSite);
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
