define([
    'text!' + ELMP.resource('system-dashboard/views/DashboardView/index.html'),
    'erdcloud.kit',
    '/erdc-thirdparty/platform/screenfull/dist/screenfull.js',
    'css!' + ELMP.resource('system-dashboard/views/DashboardView/index.css')
], function (tmpl, erdcloudKit) {
    const screenfull = window.screenfull;

    return {
        template: tmpl,
        props: {
            menuId: String
        },
        components: {
            LayoutConfigComponent: erdcloudKit.asyncComponent(
                ELMP.resource('system-dashboard/components/LayoutConfigComponent/index.js')
            ),
            MyLayout: erdcloudKit.asyncComponent(ELMP.resource('system-dashboard/components/MyLayout/index.js')),
            ShareLayout: erdcloudKit.asyncComponent(ELMP.resource('system-dashboard/components/SharedLayout/index.js')),
            LayoutForm: erdcloudKit.asyncComponent(ELMP.resource('system-dashboard/components/LayoutForm/index.js'))
        },
        computed: {
            layoutId: function () {
                return this.$route.params.id;
            },
            isEditMode: function () {
                return this.mode === 'edit';
            },
            menuInfo: function () {
                return this.$store.getters['route/matchResource'](this.$route);
            },
            validators: function () {
                return {
                    nameI18nJson: [
                        {
                            trigger: ['input', 'blur'],
                            validator(rule, value, callback) {
                                const temp = value.value.value;
                                if (temp === '') {
                                    callback(new Error('请输入名称'));
                                } else {
                                    if (!/\S/.test(temp)) {
                                        callback(new Error(rule.message));
                                    } else if (temp.length > 61) {
                                        callback(new Error('长度不能超过60个字符'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        }
                    ]
                };
            },
            dateTime() {
                return new Date().getTime();
            }
        },
        data() {
            let appName = this.$route.query.appName || '';
            if (!appName) {
                const resourcePath = this.$store.getters['route/matchResourcePath'](
                    this.$route,
                    this.$store.state.route.resources
                );
                if (resourcePath && resourcePath.length > 0) {
                    appName = [...resourcePath].reverse().reduce((prev, resource) => {
                        return prev ? prev : this.$store.getters.appNameByResourceKey(resource.identifierNo);
                    }, '');
                    if (typeof appName === 'string') {
                        appName = window.encodeURIComponent(appName);
                    }
                }
            }
            let tenantId = '';
            try {
                tenantId = JSON.parse(localStorage.getItem('tenantId'));
            } catch (e) {
                console.error(e);
            }
            return {
                i18nLocalePath: ELMP.resource('system-dashboard/locale/index.js'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    close: this.getI18nByKey('关闭'),
                    success: this.getI18nByKey('成功'),
                    nameI18nJson_tips: this.getI18nByKey('名称不能为全空格')
                },
                layoutClass: 'erd.cloud.dashboard.entity.DashboardLayout',
                title: '',
                mode: 'read',
                resourceId: '',
                contentHeight: $(window).height() - 54,
                visible: false,
                visibleForCreateLayout: false,
                usefulLayout: [],
                myLayoutActiveTab: 'my',
                switchLayoutVisible: false,
                switchLayoutLoading: false,
                needCalcPosition: false,
                appName: appName,
                tenantId: tenantId,
                fullState: false,
                currentUseLayout: {},
                operateVisible: false
            };
        },
        created() {
            screenfull.on('change', this.screenFullChange);
        },
        mounted() {
            this.loadLayoutByMenu();
        },
        destroyed() {
            screenfull.off('change', this.screenFullChange);
        },
        methods: {
            screenFullChange() {
                if (!screenfull.isFullscreen) {
                    this.fullState = false;
                }
            },
            showMyLayouts: function () {
                this.visible = true;
                this.operateVisible = false;
                this.myLayoutActiveTab = 'my';
            },
            setFull() {
                if (screenfull.isEnabled && !screenfull.isFullscreen) {
                    this.fullState = true;
                    screenfull.request(this.$refs.workSpace);
                } else {
                    this.fullState = false;
                    screenfull.exit();
                }
            },

            handleClick: function () {
                this.$refs[this.myLayoutActiveTab] && this.$refs[this.myLayoutActiveTab].reload();
            },
            openLayout() {
                this.visibleForCreateLayout = true;
                this.operateVisible = false;
                this.$refs.layoutForm && this.$refs.layoutForm.reInit();
            },
            /**
             * 从分享给我的布局里面设置默认布局的话，需要及时重置位置并渲染一下，因为可能卡片的权限存在不同
             */
            calcPositionInTime() {
                this.needCalcPosition = true;
                this.loadLayoutByMenu();
            },
            getLayoutList() {
                return this.$famHttp({
                    url: '/common/dashboard/layout/owner/list',
                    method: 'get',
                    data: {
                        className: this.layoutClass,
                        pageIndex: 1,
                        pageSize: 9999,
                        onlyPinned: true
                    }
                });
            },
            getFirstLayout() {
                return this.$famHttp({
                    url: '/common/dashboard/layout/first/layout',
                    method: 'get',
                    data: {
                        className: this.layoutClass
                    }
                });
            },
            loadLayoutByMenu: function () {
                const self = this;
                Promise.all([self.getLayoutList(), self.getFirstLayout()]).then(function ([resp1, resp2]) {
                    self.needCalcPosition = true;
                    const firstLayout = resp2?.data ?? null;
                    const records = resp1?.data?.records || [];
                    if (records.length > 0) {
                        if (firstLayout !== null) {
                            const firstObjIndex = records.findIndex((obj) => obj.id === firstLayout.id);
                            if (firstObjIndex !== -1) {
                                const firstObj = records.splice(firstObjIndex, 1)[0];
                                records.unshift(firstObj);
                            }
                        }
                        self.usefulLayout = records;
                        const id = self.$route.query?.id || '';
                        if (id !== '') {
                            const temp = self.usefulLayout.find((item) => item.id === id);
                            self.currentUseLayout = temp ?? records[0];
                        } else {
                            const isExist = self.usefulLayout.filter((item) => item.id === self.currentUseLayout.id);
                            if (Object.keys(self.currentUseLayout).length === 0 || isExist.length <= 0) {
                                self.currentUseLayout = records[0];
                            }
                        }
                    }
                });
            },
            submitCreateLayout: function () {
                var self = this;
                this.$refs.layoutForm
                    .submit()
                    .then((resp) => {
                        if (resp.success) {
                            self.$message.success({
                                message: self.i18nMappingObj.createSuccess,
                                duration: 2000
                            });
                            self.visibleForCreateLayout = false;
                        } else {
                            self.$message.error(resp.message);
                        }
                        return resp.data;
                    })
                    .then((oid) => {})
                    .then(function () {
                        self.loadLayoutByMenu();
                    });
            },
            changeLayout: function (layout) {
                this.$router.push({
                    path: 'dashboard',
                    query: {
                        id: layout.id
                    }
                });
                this.currentUseLayout = layout;
                this.switchLayoutVisible = false;
            }
        }
    };
});
