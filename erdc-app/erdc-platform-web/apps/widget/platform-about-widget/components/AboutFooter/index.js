define([], function () {
    return {
        template: `
            <p class="text-center color-disabled mb-0">
              {{ copyRightText }}
            </p>
        `,
        components: {},
        data() {
            return {
                i18nPath: ELMP.resource('platform-about-widget/locale')
            };
        },
        computed: {
            orgName() {
                return '上海易立德信息技术股份有限公司';
            },
            copyRightText() {
                return (
                    this.$store?.state?.app?.copyRight ||
                    this.$t('aboutCopyRight', {
                        orgName: this.orgName
                    })
                );
            }
        }
    };
});
