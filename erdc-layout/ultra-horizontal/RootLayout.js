define([
    '/erdc-layout/ultra-horizontal/components/VerticalMain/index.js',
    ELMP.resource('erdc-components/FamSecondaryMenu/index.js'),
    ELMP.resource('erdc-components/FamThirdMenu/index.js')
], function (VerticalMain, FamSecondaryMenu, FamThirdMenu) {
    return {
        name: 'RootLayout',
        template: `
        <div class="flex flex-column" :style="{height: bodyHeight}">
            <FamSecondaryMenu v-if="showSecondaryMenu"></FamSecondaryMenu>
            <VerticalMain secondaryMenuType="horizontal" :showSecondaryMenu="showSecondaryMenu">
                <template #third-menu>
                    <FamThirdMenu
                        v-if="showThirdMenu"
                        :resources="thirdResources"
                    ></FamThirdMenu>
                </template>
            </VerticalMain>
        </div>`,
        components: {
            VerticalMain,
            FamSecondaryMenu,
            FamThirdMenu
        },
        data() {
            let bodyHeight =
                $(window).height() -
                parseInt(window.getComputedStyle(document.body).getPropertyValue('--layoutHeaderHeight') || 40);
            return {
                bodyHeight: bodyHeight + 'px'
            };
        },
        computed: {
            currentResourcePath() {
                return this.$store.getters['route/matchResourcePath'](this.$route);
            },
            secondaryResource() {
                return this.currentResourcePath[1] || {};
            },
            thirdResources() {
                return this.secondaryResource?.children || [];
            },
            showThirdMenu() {
                return this.thirdResources.length;
            },
            rootResource() {
                return this.$store.state.route.resources;
            },
            secondaryResources() {
                return this.rootResource?.children || [];
            },
            showSecondaryMenu() {
                return this.secondaryResources.length > 0;
            }
        }
    };
});
