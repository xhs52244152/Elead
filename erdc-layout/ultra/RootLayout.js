define(['/erdc-layout/ultra/components/VerticalMain/index.js'], function (VerticalMain) {
    return {
        name: 'VerticalLayout',
        template: `<VerticalMain  secondaryMenuType="vertical" :showSecondaryMenu="showSecondaryMenu"></VerticalMain>`,
        components: {
            VerticalMain
        },
        data() {
            return {};
        },
        computed: {
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
