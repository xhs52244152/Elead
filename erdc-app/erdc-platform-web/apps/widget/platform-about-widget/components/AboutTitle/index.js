define(['erdcloud.kit'], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: `
            <div class="flex align-items-center justify-between" style="height: 40px;border-bottom: 1px solid var(--colorSplit);">         
                <div><FamPageTitle :title="i18n.aboutErdCloud" static-title title-class="font-black mb-0"/></div>
                <div @click="copySystem">
                    <erd-tooltip :content="i18n.imageIcon" placement="top">
                        <erd-button type="icon" icon="erd-iconfont erd-icon-export"></erd-button>
                    </erd-tooltip>
                </div>
            </div>
        `,
        components: {
            FamPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('platform-about-widget/locale')
            };
        },
        methods: {
            copySystem() {
                this.$emit('downloadSystem');
            }
        }
    };
});
