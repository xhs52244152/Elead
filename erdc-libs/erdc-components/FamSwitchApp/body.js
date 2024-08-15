define([
    'text!' + ELMP.resource('erdc-components/FamSwitchApp/body.html'),
    'vuedraggable',
    'erdcloud.store',
    'erdcloud.kit'
], function (tmpl, VueDraggable) {
    // let store = require('erdcloud.store');
    // const ErdcloudMfe = require('erdcloud.mfe');
    const ErdcloudKit = require('erdcloud.kit');

    return {
        name: 'FamSwitchAppBody',
        template: tmpl,
        components: {
            FamEmpty: ErdcloudKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js')),
            draggable: VueDraggable
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamSwitchApp/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['appCenter', 'recentTitle', 'bodyTitle', 'searchTips']),
                apps: [],
                // 已经收藏的应用的nameCode列表
                collectedAppNames: [],
                searchKey: '',
                maxHeight: $(document).height() - 90 - 40 - 20 + 'px',
                isDragging: false,

                // 已经收藏的应用的对象列表
                collectedApps: [],
                filterGroupApps: [],
                appGroups: [],
                emptySvg: ELMP.resource('erdc-assets/images/empty.svg'),
                defaultIcon: ELMP.resource('erdc-assets/images/default.ico'),
                inited: false
            };
        },
        computed: {
            collectedAppsMap: function () {
                let map = {};
                this.collectedApps.forEach((i) => {
                    map[i.code] = true;
                });
                return map;
            },
            isEmpty: function () {
                return this.filterGroupApps.length < 1;
            },
            myAppList() {
                return this.filterGroupApps.find((item) => item.key === this.i18n.myApp);
            }
        },
        watch: {
            searchKey: function () {
                this.filterApp();
            }
        },
        methods: {
            initData: function () {
                if (this.inited) {
                    return;
                }
                this.loadAllApp().then(this.loadCollectedApps).then(this.loadAppGroups).then(this.filterApp);
            },
            onImgLoadError: function (item) {
                item.icon = ELMP.resource('erdc-assets/images/default.ico');
            },
            filterApp: _.debounce(function () {
                // 根据searchKey过滤应用组
                let groupData = [];
                let myApps = this.collectedAppNames
                    .map((i) => {
                        let target = this.apps.find((ii) => ii.code === i.configValue);
                        return target
                            ? Object.assign({}, target, {
                                  sort: i.sort,
                                  oid: i.oid
                              })
                            : null;
                    })
                    .filter(Boolean);
                if (this.searchKey) {
                    myApps = myApps.filter((i) => {
                        return i.name.indexOf(this.searchKey) > -1 || i.code.indexOf(this.searchKey) > -1;
                    });
                }
                this.collectedApps = myApps;
                if (myApps && myApps.length > 0) {
                    groupData.push({
                        key: this.i18n.myApp,
                        value: myApps
                    });
                }
                let apps = this.apps.filter((i) => {
                    return i.name.indexOf(this.searchKey) > -1;
                });
                let groupDataAll = _.groupBy(apps, 'tag');
                this.appGroups.forEach((i) => {
                    if (groupDataAll[i.id] && groupDataAll[i.id].length > 0) {
                        const value = groupDataAll[i.id].sort((a, b) => {
                            return a.sort - b.sort;
                        });
                        groupData.push({
                            key: i.name,
                            value: value
                        });
                    }
                });
                this.filterGroupApps = groupData;
            }, 300),
            /**
             * 取消收藏： 直接点击分组下面已经收藏的APP的五角星
             */
            cancelCollectApp: function (appCode) {
                let removedApp = this.collectedAppNames.find((i) => i.configValue === appCode);
                return removedApp ? this.removeCollectApp(removedApp.oid) : Promise.resolve();
            },
            /**
             * 删除收藏的APP：在我的微应用下面直接删掉对应的APP
             * @param oid
             */
            removeCollectApp: function (oid) {
                return this.$famHttp({
                    url: '/fam/delete',
                    method: 'delete',
                    params: {
                        oid: oid
                    }
                }).then((resp) => {
                    if (resp.success) {
                        let deleteIndex = this.collectedAppNames.findIndex((i) => i.oid === oid);
                        this.collectedAppNames.splice(deleteIndex, 1);
                        return this.batchSaveCollectAppSort().then(() => {
                            this.filterApp();
                        });
                    }
                });
            },
            reSetCollectedSort: function () {
                let sortAppCodeMap = {};
                this.myAppList.value.forEach((i, index) => {
                    sortAppCodeMap[i.code] = index;
                });
                this.collectedAppNames.forEach((i) => {
                    i.sort = sortAppCodeMap[i.configValue];
                });
            },
            batchSaveCollectAppSort: function () {
                this.isDragging = false;
                if (_.isEmpty(this.collectedAppNames)) {
                    return Promise.resolve();
                }
                this.reSetCollectedSort();
                return this.$famHttp({
                    url: '/fam/saveOrUpdate',
                    method: 'post',
                    data: {
                        action: 'UPDATE',
                        className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                        rawDataVoList: this.collectedAppNames.map((i) => {
                            return {
                                action: 'UPDATE',
                                className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                                attrRawList: [
                                    {
                                        attrName: 'sort',
                                        value: i.sort
                                    }
                                ],
                                oid: i.oid
                            };
                        })
                    }
                });
            },
            addCollectApp: function (appCode) {
                return this.$famHttp({
                    url: `/fam/create`,
                    method: 'post',
                    data: {
                        className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                        attrRawList: [
                            {
                                attrName: 'configType',
                                value: 'USER_PREFERENCE'
                            },
                            {
                                attrName: 'configModule',
                                // value: 'APP_FAVORITE'
                                value: 'SOURCE_CONFIG'
                            },
                            {
                                attrName: 'configValue',
                                value: appCode
                            },
                            {
                                attrName: 'tenantId',
                                value: this.$store.state.app.tenantId
                            }
                        ]
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.collectedAppNames.push({
                            oid: resp.data,
                            configValue: appCode,
                            sort: this.collectedAppNames.length
                        });
                    }
                    this.filterApp();
                });
            },
            loadCollectedApps: function () {
                return this.$famHttp({
                    method: 'post',
                    url: `/fam/search`,
                    data: {
                        className: 'erd.cloud.foundation.principal.entity.SystemSetting',
                        orderBy: 'sort',
                        sortBy: 'ASC',
                        conditionDtoList: [
                            {
                                oper: 'EQ',
                                attrName: 'configType',
                                value1: 'USER_PREFERENCE'
                            },
                            {
                                oper: 'EQ',
                                attrName: 'configModule',
                                // value1: 'APP_FAVORITE'
                                value1: 'SOURCE_CONFIG'
                            },
                            {
                                oper: 'EQ',
                                attrName: 'userRef',
                                value1: this.$store.state.app.user.oid
                            },
                            {
                                oper: 'EQ',
                                attrName: 'tenantId',
                                value1: this.$store.state.app.tenantId
                            }
                        ]
                    }
                })
                    .then((resp) => {
                        if (resp.success) {
                            let data = resp.data?.records || [];
                            this.collectedAppNames = data
                                .map((i, index) => {
                                    let rowData = ErdcloudKit.deserializeArray(i.attrRawList || []);
                                    return {
                                        oid: rowData.oid,
                                        configValue: rowData.configValue,
                                        sort: index
                                    };
                                })
                                .sort((a, b) => {
                                    return window.parseInt(b.sort) - window.parseInt(a.sort);
                                });
                        }
                    })
                    .catch(() => {
                        this.collectedAppNames = [];
                    });
            },
            loadAllApp: function () {
                return this.$famHttp.get('/platform/mfe/apps/info').then((resp) => {
                    let apps = resp.data.apps || [];
                    let haveAuthApps = this.$store.state.route.allResourceTree.map((i) => i.identifierNo);
                    apps = apps.filter((i) => haveAuthApps.indexOf(i.code) > -1 || !i.innerApp);
                    this.apps = apps.map((i) => {
                        return {
                            code: i.code,
                            tag: i.appId || i.groupId || 'other',
                            icon: i.iconFileId
                                ? `/file/file/site/storage/v1/img/${i.iconFileId}/download`
                                : '/erdc-app/' + i.code + '/favicon.ico',
                            name: ErdcloudKit.translateI18n(i.nameI18nJson) || i.name,
                            url: i.url,
                            sort: i.sortNum || 99999
                        };
                    });
                });
            },
            switchApp: function (app) {
                if (!this.isDragging) {
                    window.open(app?.url || `/erdc-app/${app.code}/index.html`, app.code);
                    this.$emit('switch');
                }
            },
            loadAppGroups() {
                const self = this;
                this.$famHttp
                    .get(`/platform/mfe/group/list`)
                    .then((resp) => {
                        if (resp.success) {
                            let appGroups = resp.data;
                            appGroups = appGroups.map((i) => {
                                return {
                                    id: i.id,
                                    name: ErdcloudKit.translateI18n(i.nameI18nJson)
                                };
                            });
                            const appList = self.$store.state.app.appNames.sort((a, b) => a.sortOrder - b.sortOrder);
                            let appServiceGroup = appList.map((i) => {
                                return {
                                    id: i.identifierNo,
                                    name: ErdcloudKit.translateI18n(i.nameI18nJson)
                                };
                            });
                            self.appGroups = appServiceGroup.concat(appGroups).concat({
                                id: 'other',
                                name: this.i18n.other
                            });
                        }
                    })
                    .catch(() => {
                        self.appGroups = [];
                    });
            }
        }
    };
});
