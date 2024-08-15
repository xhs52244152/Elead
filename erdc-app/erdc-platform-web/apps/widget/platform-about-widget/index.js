define([
    'text!' + ELMP.resource('platform-about-widget/template.html'),
    ELMP.resource('erdc-guideline/index.js'),
    ELMP.resource('erdc-guideline/help/useHelp.js'),
    'erdcloud.kit',
    'erdcloud.i18n',
    'css!' + ELMP.resource('platform-about-widget/index.css')
], function (template, ErdcHelp, { showHelp }) {
    const ErdcKit = require('erdcloud.kit');
    const ErdcI18n = require('erdcloud.i18n');

    const i18n = ErdcI18n.useI18n(ELMP.resource('platform-about-widget/locale'));

    return {
        setup() {
            const { ref, computed, nextTick } = require('vue');
            const aboutVisible = ref(false);
            let isHelpGuideShows = ref(false);
            const popover = ref(null);
            let help = null;
            const menuList = computed(() => [
                {
                    key: 'SYSTEM_INFOS',
                    title: i18n.value.aboutErdCloud,
                    hide: false,
                    click({ popover }) {
                        aboutVisible.value = true;
                        nextTick(() => {
                            popover.value.popperElm.className = 'el-popover el-popper p-0 about-popover';
                            popover.value.updatePopper();
                        });
                    }
                },
                {
                    key: 'DOCS_CENTER',
                    title: i18n.value.docsCenter,
                    hide: !window.ELCONF.docsCenter?.href,
                    click() {
                        window.open(window.ELCONF.docsCenter?.href, '_blank');
                    }
                },
                {
                    key: 'HELP_GUIDE',
                    title: i18n.value.helpGuide,
                    hide: !isHelpGuideShows.value,
                    click() {
                        if (help) {
                            showHelp(help);
                            nextTick(() => {
                                aboutVisible.value = false;
                            });
                        }
                    }
                }
            ]);

            const handleMenuClick = (menu) => {
                menu.click &&
                    menu.click({
                        menu,
                        popover
                    });
            };

            const handlePopoverShow = () => {
                popover.value.popperElm.className = 'el-popover el-popper p-0 help-popover';
                nextTick(() => {
                    ErdcHelp.useHelp()
                        .then((_help) => {
                            help = _help;
                            isHelpGuideShows.value = true;
                        })
                        .catch(() => {
                            isHelpGuideShows.value = false;
                        });
                });
            };
            const handlePopoverHide = () => {
                aboutVisible.value = false;
                nextTick(() => {
                    popover.value.popperElm.className = 'el-popover el-popper p-0 help-popover';
                });
            };

            return {
                aboutVisible,
                menuList,
                popover,
                handleMenuClick,
                handlePopoverShow,
                handlePopoverHide,
                i18n
            };
        },
        components: {
            ErdcAbout: ErdcKit.asyncComponent(ELMP.resource('platform-about-widget/components/ErdcAbout/index.js'))
        },
        template
    };
});
