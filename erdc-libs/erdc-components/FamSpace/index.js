/**
 * @description 对象空间布局
 */
define([
    'text!' + ELMP.resource('erdc-components/FamSpace/index.html'),
    'fam:store',
    'fam:kit',
    'css!' + ELMP.resource('erdc-components/FamSpace/style.css')
], function (template, store) {
    const FamKit = require('fam:kit');
    const Vue = require('vue');
    async function updateSpaceData(objectOid, typeOid) {
        let objectInfo = {};
        if (objectOid && typeOid) {
            const { data } = await store.dispatch('space/fetchObjectByOid', { objectOid, typeOid });
            objectInfo = FamKit.deserializeAttr(data?.rawData, {
                valueMap: { containerRef: (val) => val.oid }
            });
        }
        await store.dispatch('space/switchContext', objectInfo.containerRef);
        return objectInfo;
    }
    return {
        name: 'ObjectSpace',
        template,
        components: {
            FamSecondaryMenu: FamKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js')),
            FamThirdMenu: FamKit.asyncComponent(ELMP.resource('erdc-components/FamThirdMenu/index.js')),
            SpaceSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamSpaceSelect/index.js'))
        },
        data() {
            return {
                // 当前对象信息
                objectInfo: null,
                // 当前对象typeReference
                typeOid: this.$route.query.typeOid,
                viewAllText: '查看全部',
                isSpaceLoading: false,
                extendParams: {},
                contextOid: this.$store.state.space?.context?.oid
            };
        },
        computed: {
            objectOid() {
                return this.$store.getters['space/objectOid'];
            },
            // 是否只读,只读时，不可切换对象和跳转
            readonly() {
                if (typeof this.rootRoute.meta.readonly === 'function') {
                    return this.rootRoute.meta.readonly(this.objectInfo);
                }

                return !!this.rootRoute.meta.readonly;
            },
            objectName() {
                return this.rootRoute.meta.objectName;
            },
            typeName() {
                return this.rootRoute.meta.typeName || this.rootRoute.meta.className;
            },
            rootRoute() {
                return this.$route.matched[1];
            },
            secondaryRoute() {
                return this.$route.matched[2];
            },
            rootResource() {
                return this.$store.getters['route/matchResource'](this.rootRoute);
            },
            secondaryResource() {
                return this.$store.getters['route/matchResourcePath'](
                    this.secondaryRoute,
                    this.rootResource?.children
                ).at(-1);
            },
            currentResource() {
                return this.$store.getters['route/matchResourcePath'](this.$route, this.rootResource.children).at(-1);
            },
            secondaryResources() {
                return this.rootResource?.children || [];
            },
            thirdResources() {
                return this.secondaryResource?.children || [];
            },
            showSecondaryMenu() {
                return !this.hideSubMenus;
            },
            showThirdMenu() {
                return this.thirdResources.length > 0 && !this.hideSubMenus;
            },
            hideSubMenus() {
                return this.$route.meta.hideSubMenus;
            },
            contentHeight() {
                let heightDiff = 40;
                heightDiff += this.showSecondaryMenu ? 40 : 0;
                heightDiff += this.showThirdMenu ? 40 : 0;
                return `calc(100vh - ${heightDiff}px)`;
            },
            routeName() {
                let routeIndex = this.$route.matched.findIndex(
                    (route) => route.components.default?.name === this.$options.name
                );
                routeIndex = routeIndex === -1 ? this.$route.matched.length - 2 : routeIndex;
                routeIndex = routeIndex >= this.$route.matched.length ? this.$route.matched.length - 1 : routeIndex;
                return this.$route.matched[routeIndex + 1]?.name;
            }
        },
        /***
         * 场景分析：
         * 1. 第一次进入
         * 是否存在合法pid 可能为空，可能为 ${pid}
         * 2. 空间内切换路由 此时路由path为${pid}或者pid相同
         * 3. 不同空间切换 目标路由跟现在store中objectOid不同
         * */
        // 第一次进入
        async beforeRouteEnter(to, from, next) {
            try {
                const objectInfo = await updateSpaceData(to.params.pid, to.query.typeOid);
                next((vm) => {
                    vm.updateSpaceDataOver(objectInfo);
                    vm.setTargetRouteTitle(to);
                });
            } catch (e) {
                next((vm) => {
                    Vue.prototype
                        .$alert(`不能访问此${vm.objectName}空间，请联系管理员处理`, {
                            title: '提示'
                        })
                        .then(() => {
                            vm.gotoObjectList(true);
                        });
                });
            }
        },
        // 切换场景下进入
        async beforeRouteUpdate(to, from, next) {
            if (this.isSameSpaceSwitchRoute(to)) {
                next({
                    ...to,
                    params: {
                        ...to.params,
                        pid: this.objectOid,
                        containerRef: this.contextOid
                    },

                    replace: true
                });
            } else if (this.objectOid === to.params.pid && this.$route.matched.at(-1)?.path === to.path) {
                next(false);
            } else {
                if (this.objectOid !== to.params.pid) {
                    this.beforeEnterSpace();
                    const objectInfo = await updateSpaceData(to.params.pid, to.query.typeOid);
                    this.updateSpaceDataOver(objectInfo);
                }
                this.setTargetRouteTitle(to);
                next();
            }
        },
        async beforeRouteLeave(to, from, next) {
            await updateSpaceData(null);
            next();
        },
        async activated() {
            await updateSpaceData(this.objectOid, this.typeOid);
        },
        async deactivated() {
            await updateSpaceData(null);
        },
        methods: {
            isSameSpaceSwitchRoute(targetRoute) {
                return this.objectOid && /\${(\S+)}/.test(decodeURIComponent(targetRoute.path));
            },
            beforeEnterSpace() {
                this.isSpaceLoading = true;
            },
            updateSpaceDataOver(objectInfo) {
                this.objectInfo = objectInfo;
                this.onSpaceObjectChanged(objectInfo);
                this.isSpaceLoading = false;
            },
            setTargetRouteTitle(targetRoute) {
                const { route } = this.$router.resolve(targetRoute);
                const targetRouteConfig = this.$store.getters['route/matchResourcePath'](
                    route,
                    this.rootResource.children
                ).at(-1);

                const titleArray = [this.rootResource.displayName];
                const name = this.$store.state.space?.object.rawData?.name?.value;
                name && titleArray.push(name);
                if (targetRouteConfig && targetRouteConfig.displayName) {
                    titleArray.push(targetRouteConfig.displayName);
                }
                targetRoute.params.title = titleArray.join('-');
                return targetRoute.params.title;
            },
            handleRoute(key) {
                const resource = this.secondaryResources?.find((item) => item.identifierNo === key);
                if (resource?.target === 'link') {
                    window.open(resource.href, resource.identifierNo);
                } else {
                    this.$router.push({
                        path: resource.href,
                        params: {
                            ...this.$route.params
                        },
                        query: {
                            ...this.$route.query
                        }
                    });
                }
            },
            /**
             * 跳入对象列表
             * @param {boolean} replace - 是否替换记录
             */
            gotoObjectList(replace) {
                // todo 后续改为跳转至通用列表
                this.$router.push({
                    name: this.rootRoute.meta.listRouteName || 'commonList',
                    replace,
                    params: {
                        className: store.getters.className(this.typeName)
                    }
                });
            },
            async onObjectChange(objectOid, spaceObject) {
                if (objectOid && objectOid !== this.objectOid) {
                    this.beforeEnterSpace();
                    await updateSpaceData(objectOid, spaceObject.typeOid);
                    this.updateSpaceDataOver();
                    const route = {
                        path: this.$store.getters['route/matchResource'](this.$route)?.href || '/'
                    };
                    this.$router.push({
                        ...route,
                        params: {
                            ...this.$route.params,
                            pid: this.$store.getters['space/objectOid'],
                            containerRef: this.contextOid
                        },
                        query: {
                            typeOid: spaceObject.typeOid
                        }
                    });
                }
            },
            onSpaceObjectChanged(object) {
                this.$emit('spaceObjectChange', object);
            }
        }
    };
});
