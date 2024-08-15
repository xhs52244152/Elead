define(['erdc-kit'], function (ErdcKit) {
    const mfeHelper = require('mfeHelper');
    return [
        {
            path: '/',
            name: 'plat',
            component: ErdcKit.asyncComponent('/erdc-layout/ultra/Layout.js'),
            meta: {
                showRouteTitle: true
            },
            children: [
                {
                    path: '',
                    name: 'root',
                    meta: {
                        keepAlive: true
                    },
                    component: ErdcKit.asyncComponent('/erdc-layout/ultra/RootLayout.js')
                },
                {
                    path: '/space',
                    name: 'space',
                    component: ErdcKit.asyncComponent('/erdc-layout/ultra/SpaceLayout/index.js'),
                    meta: {
                        keepAlive: true,
                        isSameRoute: function (source, target) {
                            return (
                                source.path === target.path &&
                                _.isEqual(source.query, target.query) &&
                                _.isEqual(source.params, target.params)
                            );
                        },
                        keepAliveRouteKey: function (to) {
                            return to.query.pid;
                        }
                    }
                },
                {
                    path: '/container',
                    name: 'container',
                    component: {
                        name: 'Container',
                        template:
                            '<keep-alive :include="cachedViews"><router-view  :key="routerViewKey"></router-view></keep-alive>',
                        data() {
                            return {
                                routerViewKey: this._routerViewKey()
                            };
                        },
                        computed: {
                            cachedViews() {
                                return this.$store.state.route?.cachedViews || [];
                            }
                        },
                        watch: {
                            $route: function () {
                                if (this.$route.matched[1] && this.$route.matched[1].name === 'container') {
                                    this.routerViewKey = this._routerViewKey();
                                }
                            }
                        },
                        methods: {
                            _routerViewKey() {
                                if (_.isFunction(this.$route.matched[2]?.meta.keepAliveRouteKey)) {
                                    return this.$route.matched[2]?.meta.keepAliveRouteKey(this.$route);
                                } else if (this.$route.matched[2]) {
                                    let filler = mfeHelper.stringToRegexpCompile(this.$route.matched[2].path);
                                    return filler(this.$route.params, { pretty: true });
                                } else {
                                    return this.routerViewKey;
                                }
                            }
                        }
                    },
                    meta: {
                        keepAlive: true,
                        keepAliveRouteKey: function (to) {
                            return to.path;
                        }
                    }
                }
            ]
        }
    ];
});
