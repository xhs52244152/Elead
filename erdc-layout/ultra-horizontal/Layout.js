/**
 * @component AppLayout
 * @description Ultra 布局
 */
define([
    'layout:ultra:component:util',
    'layout:ultra:component:AppMain',
    'css!/erdc-layout/ultra-horizontal/style/reset.css'
], function () {
    const util = require('layout:ultra:component:util');
    const AppMain = require('layout:ultra:component:AppMain');

    return {
        name: 'AppLayout',
        template: util.useTemplate('#fam-layout-ultra-Layout-tmpl'),
        components: {
            AppMain
        },
        data() {
            return {
                showAppMain: false,
                collapsed: false
            };
        },
        beforeMount() {
            this.loadCurrentTheme(() => {
                this.showAppMain = true;
            });
        },
        methods: {
            // 由于布局也可能使用了一些变量，主题需要覆盖这些变量，因此加载主题交由布局实现
            loadCurrentTheme(callback) {
                this.$store.dispatch('mfe/loadCurrentTheme').finally(() => {
                    callback();
                });
            }
        }
    };
});

/**
 * @module util
 * @description 通用工具
 */
define('layout:ultra:component:util', ['text!/erdc-layout/ultra-horizontal/template.html'], function (template) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(template, 'text/html');
    return {
        useTemplate(selector) {
            return doc.querySelector(selector)?.innerHTML;
        }
    };
});

/**
 * @component SideMenu
 * @description 一级菜单
 */
define('layout:ultra:component:SideMenu', ['layout:ultra:component:util'], function (util) {
    return {
        name: 'SideMenu',
        template: util.useTemplate('#fam-layout-ultra-SideMenu-tmpl'),
        props: {
            resources: Array
        },
        data() {
            return {
                currentActive: null
            };
        },
        computed: {
            menuTheme() {
                return {
                    textColor: getComputedStyle(document.documentElement).getPropertyValue('--colorTextNormal'),
                    activeTextColor: getComputedStyle(document.documentElement).getPropertyValue('--colorPrimary'),
                    backgroundColor: '#FFFFFF'
                };
            },
            route() {
                return this.$route;
            },
            rootRoute() {
                return this.$route.matched[1] || {};
            },
            rootResource() {
                return this.$store.state.route.resources;
            },
            logo() {
                return this.$store.state.common.layoutComponentRegistry.logo;
            },
            currentTenantCode() {
                return this.$store.state.app.site.tenantId;
            },
            currentTenant() {
                return this.tenantList.find((tenant) => tenant.identifierNo === this.currentTenantCode) || {};
            }
        },
        watch: {
            rootResource: {
                immediate: true,
                handler(rootResource) {
                    this.currentActive = rootResource.oid;
                }
            },
            '$store.state.route.customRootResource': {
                handler(customRootResource) {
                    if (customRootResource) {
                        this.currentActive = customRootResource.oid;
                    } else {
                        this.currentActive = this.rootResource.oid;
                    }
                }
            }
        },
        methods: {
            onRoute(oid) {
                const resource = this.resources.find((resource) => resource.oid === oid);
                const { identifierNo, href, target } = resource;
                const routes = this.$router.getRoutes();
                let route =
                    routes.find((route) => route.path === href) ||
                    routes.find((route) => route.meta.resourceCode === identifierNo) ||
                    routes.find((route) => route.name === identifierNo) ||
                    this.$router.matcher.match(href);
                if (target === 'link') {
                    if (/^(http|https|ftp)/.test(href)) {
                        window.open(href, '_blank');
                    } else {
                        const matchedRoute = this.$router.resolve(route);
                        window.open(matchedRoute.href, resource.identifierNo);
                    }
                } else {
                    this.$router.push(route);
                }

                this.currentActive = null;
                this.$nextTick(() => {
                    this.$refs.menu.$el.querySelectorAll('.el-menu-item.is-active').forEach(($item) => {
                        $item.classList.remove('is-active');
                    });
                    this.currentActive = this.rootResource.oid;
                    this.$forceUpdate();
                });
            }
        }
    };
});

/**
 * @component AppMain
 * @description 主内容区
 */
define('layout:ultra:component:AppMain', [
    'layout:ultra:component:util',
    'layout:ultra:component:AppHeader'
], function () {
    const util = require('layout:ultra:component:util');
    const AppHeader = require('layout:ultra:component:AppHeader');

    return {
        name: 'AppMain',
        template: util.useTemplate('#fam-layout-ultra-AppMain-tmpl'),
        components: {
            AppHeader
        },
        props: {
            collapsed: Boolean
        },
        data() {
            let primaryColor = '#567ffd';
            try {
                primaryColor = window.getComputedStyle(document.body).getPropertyValue('--primary-color');
            } catch (e) {
                // do noting
            }

            return {
                menuTheme: {
                    textColor: 'rgba(0, 0, 0, .65)',
                    activeTextColor: primaryColor
                },
                keepAliveKey: this._keepAliveKey()
            };
        },
        watch: {
            $route: function () {
                this.keepAliveKey = this._keepAliveKey();
            }
        },
        computed: {
            cachedViews() {
                return this.$store.state.route?.cachedViews || [];
            },
            headerHeight() {
                return window.getComputedStyle(document.body).getPropertyValue('--layoutHeaderHeight') || 40;
            }
        },
        methods: {
            _keepAliveKey() {
                if (_.isFunction(this.$route.matched[1]?.meta.keepAliveRouteKey)) {
                    return this.$route.matched[1]?.meta.keepAliveRouteKey(this.$route);
                } else if (this.$route.matched[1]) {
                    return this.$route.matched[1].path;
                }
            }
        }
    };
});

/**
 * @component AppHeader
 * @description 页头
 */
define('layout:ultra:component:AppHeader', [
    'fam:kit',
    'layout:ultra:component:util',
    'layout:ultra:component:HeaderView'
], function () {
    const FamKit = require('fam:kit');
    const util = require('layout:ultra:component:util');
    const HeaderView = require('layout:ultra:component:HeaderView');
    let initRightButtonsPaneNumber = 0;

    return {
        template: util.useTemplate('#fam-layout-ultra-AppHeader-tmpl'),
        components: {
            HeaderView,
            FamSwitchApp: FamKit.asyncComponent(ELMP.resource('erdc-components/FamSwitchApp/index.js'))
        },
        props: {
            collapsed: Boolean,
            height: [Number, String]
        },
        data() {
            return {
                headerViewWidth: 'auto',
                // 右侧按钮面板渲染完成
                initRightButtonsPane: false,
                // 左侧页签组件渲染完成
                initHeaderView: false
            };
        },
        computed: {
            layoutHeaderWidgets() {
                return this.$store.getters.headerWidgets.filter((item) => item.position === 'right') || [];
            },
            initCalcWidth() {
                return this.initRightButtonsPane && this.initHeaderView;
            },
            leftWidget() {
                return this.$store.getters.headerWidgets.filter((item) => item.position === 'left') || [];
            }
        },
        watch: {
            layoutHeaderWidgets: {
                handler: function () {
                    this.calcWidth();
                },
                immediate: true,
                deep: true
            },
            collapsed() {
                this.calcWidth();
            },
            initCalcWidth(n) {
                n && this.calcWidth();
            },
            $route() {
                this.$nextTick(() => {
                    this.calcWidth();
                });
            }
        },
        mounted() {
            this.calcWidth();
            window.parent.addEventListener('resize', this.onWindowResize);
            window.document.body.addEventListener('click', this.handleBodyClick);
        },
        beforeDestroy() {
            window.parent.removeEventListener('resize', this.onWindowResize);
            window.document.body.removeEventListener('click', this.handleBodyClick);
            initRightButtonsPaneNumber = 0;
        },
        methods: {
            headerViewMounted() {
                this.initHeaderView = true;
                this.$nextTick(() => {
                    this.calcWidth();
                });
            },
            rightButtonsPaneMounted() {
                initRightButtonsPaneNumber += 1;
                this.initRightButtonsPane = this.layoutHeaderWidgets.length === initRightButtonsPaneNumber;
            },
            onWindowResize: _.debounce(function () {
                this.calcWidth();
            }, 300),
            calcWidth() {
                this.headerViewWidth = this.$refs.headerView?.$el?.clientWidth;
            },
            handleBodyClick() {
                this.handleToggleCollapsed(false);
            },
            handleToggleCollapsed(collapsed) {
                window.$wujie?.bus?.$emit('toggle-app-nav', collapsed);
            },
            toggleCollapsed() {
                this.handleToggleCollapsed(!this.collapsed);
            },
            handleMouseHover(collapsed) {
                if (window.$wujie?.props?.appNav?.hover) {
                    this.handleToggleCollapsed(collapsed);
                }
            },
            handleMouseClick(collapsed) {
                if (!window.$wujie?.props?.appNav?.hover) {
                    this.handleToggleCollapsed(collapsed);
                }
            }
        }
    };
});

/**
 * @component HeaderView
 * @description 标签视图
 */
define('layout:ultra:component:HeaderView', [
    'layout:ultra:component:util',
    'underscore',
    'sortablejs',
    'erdcloud.kit'
], function (util) {
    const Sortable = require('sortablejs').default || require('sortablejs');
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');
    const { TreeUtil } = ErdcKit;

    return {
        template: util.useTemplate('#fam-layout-ultra-HeaderView-tmpl'),
        props: {
            collapsed: Boolean,
            width: [Number, String]
        },
        data() {
            return {
                visibleRoutes: [],
                invisibleRoutes: [],
                isDropdownVisible: false
            };
        },
        computed: {
            isSameRoute() {
                let allFun = [
                    function defaultJudge(source, target) {
                        return source.path === target.path;
                    }
                ].concat(
                    (_.isArray(this.route.matched) ? this.route.matched : [])
                        .filter((i) => i?.meta?.isSameRoute)
                        .map((i) => i.meta.isSameRoute)
                );
                return allFun[allFun.length - 1];
            },
            route() {
                return this.$route;
            },
            visitedRoutes() {
                return this.$store.getters['route/visitedRoutes'];
            },
            scrollbarHeight() {
                const number = 10;
                if (this.invisibleRoutes.length <= number) {
                    return 'auto';
                }
                // const itemHeight = document.querySelector('.el-dropdown-menu__item').clientHeight;
                // const dividedHeight = document.querySelector('.el-dropdown-menu__item--divided').clientHeight;
                const itemHeight = 32;
                const dividedHeight = 8;
                return itemHeight * (number + 3) + dividedHeight + 'px';
            },
            dropdownList() {
                return [
                    {
                        key: 'CLOSE_CURRENT',
                        name: '关闭当前页签',
                        command: () => {
                            this.delVisitedRoute(this.$route);
                        }
                    },
                    {
                        key: 'CLOSE_ALL',
                        name: '关闭全部页签',
                        command: () => {
                            this.delAllVisitedRoutes();
                        }
                    },
                    {
                        key: 'CLOSE_OTHERS',
                        name: '关闭其他页签',
                        command: () => {
                            this.delOthersVisitedRoute(this.$route);
                        }
                    }
                ];
            }
        },
        watch: {
            $route: {
                immediate: true,
                handler(route) {
                    this.addVisitedRoute(route);
                }
            },
            visitedRoutes: {
                immediate: true,
                handler() {
                    this.calcRouteSplits();
                }
            },
            width: {
                immediate: true,
                handler() {
                    this.calcRouteSplits();
                }
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.initSortable();
                this.calcRouteSplits();
            });
        },
        beforeDestroy() {
            this.sortable && this.sortable.destroy();
        },
        methods: {
            isActiveRoute(route) {
                return this.isSameRoute(this.$route, route);
            },
            routeTo(route) {
                let newRoute = Object.assign({}, route);
                delete newRoute.matched;
                this.$router.push(newRoute);
            },
            getRouteTitle(route) {
                if (route.meta.titleI18nJson) {
                    return ErdcKit.translateI18n(route.meta.titleI18nJson);
                }
                if (route.meta.title) {
                    return typeof route.meta.title === 'function' ? route.meta.title(route) : route.meta.title;
                }
                const resource = this.$store.getters['route/matchResource'](route);
                if (resource) {
                    return resource.name;
                }
                return route.name || route.path;
            },
            delVisitedRoute(route) {
                // 获取删除项的index
                let delItemIndex = -1;
                this.visitedRoutes.forEach((item, index) => {
                    if (this.isSameRoute(item, route)) {
                        delItemIndex = index;
                    }
                });
                this.$store.dispatch('route/delVisitedRoute', route).then((visitedRoutes) => {
                    if (!visitedRoutes.length) {
                        let menus = [this.$store.state.route.resources];
                        let tempMenu = TreeUtil.getNode(menus, {
                            target(item) {
                                return item.href;
                            }
                        });
                        if (tempMenu?.href === this.$route.fullPath) {
                            this.addVisitedRoute(this.$route);
                        } else {
                            this.$router.push(tempMenu?.href || '/');
                        }
                    } else if (route.path === this.$route.path) {
                        // 删除后，高亮其右1页签，若右侧无页签，则高亮其左1页签
                        let preRoute = visitedRoutes.at(delItemIndex) || visitedRoutes.at(delItemIndex - 1);
                        this.$router.push(preRoute);
                    }
                });
            },
            addVisitedRoute(route) {
                if (!route.meta.hidden) {
                    return this.$store.dispatch('route/addVisitedRoute', route);
                }
            },
            delAllVisitedRoutes(route) {
                this.$store.dispatch('route/delAllVisitedRoutes', route).then((visitedRoutes) => {
                    if (!visitedRoutes.length) {
                        this.$router.push('/');
                    }
                });
            },
            delOthersVisitedRoute(route) {
                this.$store.dispatch('route/delOthersVisitedRoute', route);
            },
            initSortable() {
                const _this = this;
                this.sortable = new Sortable(this.$refs.view, {
                    draggable: '.left-tag',
                    ghostClass: 'ultra-tags-view__left-tag-ghost',
                    onEnd: function ({ item, newIndex }) {
                        // 更新数据顺序
                        _this.$store.commit('route/setVisitedRouteSort', {
                            fullPath: item.getAttribute('data-path'),
                            newIndex
                        });
                        _this.$nextTick(() => {
                            _this.initSortable();
                        });
                    }
                });
            },
            calcRouteSplits() {
                this.visibleRoutes = _.clone(this.visitedRoutes);
                // 容错宽度
                const TOLERANCE_WIDTH = 30;
                this.$nextTick(() => {
                    const $tags = this.$refs.view.querySelectorAll('.left-tag');
                    const $first = $tags[0];
                    let totalMarginRight = $first
                        ? ($tags.length - 1) * window.getComputedStyle($first, null).getPropertyValue('margin-left') || 0
                        : 0;
                    let currentWidth = 120;
                    let splitIndex = this.visitedRoutes.length;
                    let dropDownWidth = 0;
                    if (this.$refs.dropdown) {
                        dropDownWidth = this.$refs.dropdown.$el.clientWidth;
                    }
                    for (let i = 0; i < $tags.length; i++) {
                        const $tag = $tags[i];
                        currentWidth += $tag.clientWidth;
                        if (currentWidth >= this.width - totalMarginRight - dropDownWidth - TOLERANCE_WIDTH) {
                            splitIndex = i;
                            break;
                        }
                    }

                    this.visibleRoutes = this.visitedRoutes.slice(0, splitIndex).map((item) => {
                        item.isInvisible = false;
                        return item;
                    });
                    this.invisibleRoutes = this.visitedRoutes.slice(splitIndex).map((item) => {
                        item.isInvisible = true;
                        return item;
                    });
                });
            },
            setVisibleStatus(val) {
                this.isDropdownVisible = val;
            },
            handleCommand(command) {
                if (command.path) {
                    this.$router.push(command);
                } else if (typeof command.command === 'function') {
                    command.command();
                }
            },
            handleMouseOver(el, dom, callback) {
                const parentElement = el.parentElement;
                const parentWidth = parentElement.clientWidth - 42; // 减去左侧内边距12px
                const containerWidth = dom.clientWidth || dom.offsetWidth;
                const bool = parentWidth < containerWidth;
                callback(bool);
            }
        }
    };
});
