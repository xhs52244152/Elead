define([], function () {
    return {
        template: `
            <div class="flex flex-column ptlr-normal bg-white flex-1">
              <iframe ref="iframe" :src="src" class="border-none" width="100%" height="100%"></iframe>
            </div>
        `,
        data() {
            return {
                src: '/erdc-thirdparty/platform/druid/index.html',
                show: false
            };
        },
        computed: {
            erdcDruidConfig() {
                return {
                    accessToken: this.$store.state.app.accessToken,
                    defaultModuleName: this.$store.getters.routePrefix('/fam/erd')
                };
            }
        },
        mounted() {
            window.__erdcDruidConfig__ = this.erdcDruidConfig;
        },
        beforeDestroy() {
            delete window.__erdcDruidConfig__;
        }
    };
});
