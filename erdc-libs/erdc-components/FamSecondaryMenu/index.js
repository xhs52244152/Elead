/**
 * @component FamSecondaryMenu
 * @description 标准二级菜单
 */
define([
    'text!' + ELMP.resource('erdc-components/FamSecondaryMenu/template.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamSecondaryMenu/style.css'),
    'underscore',
    'erdcloud.kit'
], function (template) {
    const _ = require('underscore');

    return {
        name: 'FamSecondaryMenu',
        template,
        props: {
            outerResources: Array,
            outerRootResource: Object,
            handleRoute: Function,
            isTemplate: [Boolean, String]
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamSecondaryMenu/locale/index.js'),
                viewResources: [],
                collapsedResources: [],
                currentRightMenu: null,
                currentActive: null,
                logoUrl: '',
                collapsedResourcesShows: true
            };
        },
        computed: {
            menuTheme() {
                return {
                    textColor: 'rgba(255, 255, 255, .85)',
                    activeTextColor: '#FFFFFF',
                    backgroundColor: '#353552'
                };
            },
            currentResourcePath() {
                return this.$store.getters['route/matchResourcePath'](this.$route, this.rootResource);
            },
            rootResource() {
                return this.outerRootResource || this.$store.state.route.resources;
            },
            resources() {
                return this.outerResources || this.rootResource?.children;
            },
            secondaryResource() {
                return this.currentResourcePath[1] || {};
            },
            collapsedMenuTitle() {
                const currentRightMenu = this.currentRightMenu;
                if (!currentRightMenu) {
                    return this.i18n.more;
                }
                return currentRightMenu.meta.title;
            },
            collapsedMenuIcon() {
                return this.currentRightMenu?.icon;
            },
            rootResourceTitle() {
                return JSON.parse(this.isTemplate)
                    ? this.rootResource?.displayName + this.i18n.template
                    : this.rootResource?.displayName;
            }
        },
        watch: {
            collapsedMenuTitle() {
                const currentRightMenu = this.currentRightMenu;
                if (!currentRightMenu) {
                    return this.i18n.more;
                }
                return currentRightMenu.name;
            },
            resources() {
                this.calcSplits();
            },
            secondaryResource: {
                immediate: true,
                handler(secondaryResource) {
                    this.currentActive = secondaryResource?.identifierNo;
                    // this.calcSplits();
                }
            },
            currentActive(currentActive) {
                this.$refs.menu.activeIndex = currentActive;
            }
        },
        mounted() {
            this.calcSplits();
            window.addEventListener('resize', this.onWindowResize, false);
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.onWindowResize, false);
        },
        methods: {
            onWindowResize: _.debounce(function () {
                this.calcSplits();
            }),
            calcSplits() {
                if (!_.isEmpty(this.resources)) {
                    this.viewResources = _.map(this.resources, _.clone);
                }
                this.collapsedResources = [];
                this.collapsedResourcesShows = true;
                // TODO 按照真实情况计算
                const PADDING_WIDTH = 16; //两边一人8
                const TOLERANCE = 2;
                setTimeout(() => {
                    if (!this.$refs.menu) {
                        return;
                    }
                    const $menus = this.$refs.menu.$el.querySelectorAll('.fam-secondary-menu-item');
                    let currentWidth = 0;
                    let splitIndex = $menus.length;
                    let rootWidth = this.$el.clientWidth || this.$refs?.menu?.$el?.clientWidth;
                    let titleWidth = this.$el.querySelector('.fam-secondary-title').clientWidth;
                    let subTitleWidth = this.$el.querySelector('.fam-secondary-sub-title').clientWidth;
                    let containerWidth = rootWidth - titleWidth - subTitleWidth - PADDING_WIDTH - TOLERANCE;
                    let moreItemWidth = this.$refs.submenu?.$el?.clientWidth ?? 0;
                    for (let i = 0; i < $menus.length; i++) {
                        const $menu = $menus[i];
                        currentWidth += $menu.clientWidth + 16;
                        if (currentWidth >= containerWidth) {
                            // 不包含当前菜单，剩余的空间能装下，那么就把当前菜单以及当前菜单后面的放到更多里面，否则就往前挪一位
                            if (containerWidth - currentWidth + ($menu.clientWidth + 16) > moreItemWidth + 16) {
                                splitIndex = i;
                            } else {
                                splitIndex = i - 1;
                            }
                            break;
                        }
                    }
                    this.viewResources = this.resources?.slice(0, splitIndex);
                    this.collapsedResources = this.resources?.slice(splitIndex);
                    this.collapsedResourcesShows = this.collapsedResources?.some((resource) => resource.isShow);
                    this.resetRightMenu();
                    // this.$forceUpdate();
                }, 500);
                // this.$nextTick(() => {
                //
                // });
            },
            resetRightMenu() {
                if (this.currentResource) {
                    const isRightMenu = _.some(this.collapsedResources, { oid: this.currentResource.oid });
                    this.currentRightMenu = isRightMenu ? _.clone(this.currentResource) : this.currentRightMenu || null;
                } else {
                    this.currentRightMenu = null;
                }
            },
            handleSelect(key, keyPath) {
                const resource = this.resources?.find((resource) => resource.identifierNo === key);
                if (typeof this.handleRoute === 'function') {
                    this.handleRoute(key, keyPath);
                    return;
                }
                this.currentActive = null;

                let input = document.createElement('input');
                document.body.appendChild(input);
                input.focus();
                input.remove();
                input = null;

                this.$nextTick(() => {
                    this.$refs.menu.$el.querySelectorAll('.fam-secondary-menu-item.is-active').forEach(($item) => {
                        $item.classList.remove('is-active');
                    });
                    this.currentActive = this.secondaryResource?.identifierNo;
                    if (resource.target === 'link') {
                        if (/^(http|https|ftp)/.test(resource.href)) {
                            window.open(resource.href, '_blank');
                        } else {
                            const matchedRoute = this.$router.resolve(resource.href);
                            window.open(matchedRoute.href, resource.identifierNo);
                        }
                    } else {
                        let tempResource = resource;
                        while (
                            tempResource &&
                            tempResource.children &&
                            tempResource.children.length > 0 &&
                            !tempResource.href
                        ) {
                            tempResource = tempResource.children[0];
                        }
                        this.$router.push(tempResource.href);
                    }
                });
            }
        }
    };
});
