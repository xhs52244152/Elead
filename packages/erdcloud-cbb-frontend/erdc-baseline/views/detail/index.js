define([
    'text!' + ELMP.func('erdc-baseline/views/detail/index.html'),
    ELMP.func('erdc-baseline/mixins.js'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.func('erdc-baseline/operateAction.js'),
    ELMP.resource('erdc-pdm-common-actions/index.js'),
    'css!' + ELMP.func('erdc-baseline/views/detail/style.css')
], function (template, mixin, CONST, operateAction, commonActions) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('CbbBaseline');

    return {
        name: 'BaselineDetail',
        template,
        components: {
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            BaselineForm: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/BaselineForm/index.js')),
            BaseRelationObject: ErdcKit.asyncComponent(
                ELMP.func('erdc-baseline/components/BaselineRelationObject/index.js')
            ),
            BaselineTeam: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/BaselineTeam/index.js')),
            HistoryRecord: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/HistoryRecord/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BaselineDelete: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/DeleteOperate/index.js')),
            BaselineRename: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/RenameOperate/index.js')),
            ReviseOperate: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/ReviseOperate/index.js')),
            ChangeOwner: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/ChangeOwnerOperate/index.js')),
            ChangeLifecycle: ErdcKit.asyncComponent(
                ELMP.func('erdc-baseline/components/ChangeLifecycleOperate/index.js')
            ),
            BaselineMove: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/MoveOperate/index.js')),
            SaveAs: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/SaveAsOperate/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        mixins: [mixin],
        props: {
            operationBtnKey: {
                type: String,
                default: 'BASELINE_OPERATE'
            },
            getTabs: Function,
            customCancel: Function,
            beforeEcho: Function
        },
        data: function () {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                activeName: 'detail',
                title: '基线详情',
                formData: null,
                baselineClassName: CONST.className,
                isLatest: false,
                tabsRefresh: {
                    detail: new Date().getTime().toString(),
                    relationObj: new Date().getTime().toString(),
                    team: new Date().getTime().toString(),
                    history: new Date().getTime().toString()
                },
                // 当前路由
                route: {},
                // 是否强制更新组件
                componentKey: new Date().getTime().toString()
            };
        },
        watch: {
            oid: {
                handler(val) {
                    if (!val) return;
                    this.getCurrentVersionStatus(val);
                },
                immediate: true
            },
            route: {
                handler(nv) {
                    if (nv) {
                        this.activeName = nv?.query?.activeName || this.activeName;
                    }
                },
                immediate: true,
                deep: true
            }
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'baseline' });
            },
            isDraftEdit() {
                const data = this.formData || {};
                return data['lifecycleStatus.status'] === 'DRAFT';
            },
            defaultBtnConfig() {
                if (this.oid) {
                    let lang = localStorage.getItem('lang_current') || 'zh_cn';
                    return {
                        label: lang === 'zh_cn' ? '操作' : 'operate',
                        type: 'primary'
                    };
                }
            },
            iconValue() {
                return this.formData?.['icon'];
            },
            editStatus() {
                const userInfo = this.$store?.state?.user || {};
                const lockerObj = this.formData?.['lock.locker'];
                const bool = userInfo && userInfo.id === lockerObj?.value?.id;
                const value = bool ? this.i18n.you : lockerObj?.displayName;
                return value;
            },
            // 表单头组件配置
            formPageAttr() {
                return {
                    isShowPulldown: true,
                    tagName: this.formData ? this.formData.lifecycleStatusOrigin.displayName : '',
                    isShowTag: true,
                    title: this.title,
                    staticTitle: true,
                    showBackButton: false
                };
            },
            vm() {
                return this;
            },
            oid() {
                return this.route?.query?.oid;
            },
            pid() {
                return this.route?.query?.pid;
            },
            teamRef() {
                return this.formData ? this.formData.teamRef : '';
            },
            tabs() {
                let { i18n, oid, pid, tabsRefresh, getTabs } = this;
                let tabs = [
                    {
                        key: 'detail',
                        label: i18n.attribute,
                        clazz: 'detail-panel',
                        showScrollbar: true,
                        componentName: 'BaselineForm',
                        ref: 'baselineForm',
                        props: {
                            'key': tabsRefresh['detail'] || new Date().getTime().toString(),
                            oid,
                            pid,
                            'view-type': 'DETAIL',
                            'readonly': true,
                            ...this.$attrs
                        },
                        eventMethods: {
                            'change': this.handleFormChange,
                            'route-refresh': this.routeRefresh
                        }
                    },
                    {
                        key: 'relationObj',
                        label: i18n.relationObj,
                        clazz: 'relationObj-baseLine',
                        showScrollbar: true,
                        ref: 'relationObj',
                        componentName: 'BaseRelationObject',
                        props: {
                            key: tabsRefresh['relationObj'] || new Date().getTime().toString(),
                            oid,
                            pid,
                            formData: this.formData
                        },
                        eventMethods: {
                            'refresh': () => {
                                this.$set(this.tabsRefresh, 'relationObj', new Date().getTime().toString());
                            },
                            'route-refresh': this.routeRefresh
                        }
                    },
                    {
                        key: 'team',
                        label: i18n.team,
                        showScrollbar: false,
                        ref: 'team',
                        componentName: 'BaselineTeam',
                        props: {
                            'key': tabsRefresh['team'] || new Date().getTime().toString(),
                            oid,
                            pid,
                            'team-ref': this.teamRef
                        }
                    },
                    {
                        key: 'history',
                        label: i18n.historyRecords,
                        clazz: 'history-record',
                        showScrollbar: true,
                        ref: 'historyRecords',
                        componentName: 'HistoryRecord',
                        props: {
                            className: CONST.className,
                            toolActionConfig: {
                                className: CONST.className,
                                tableKey: 'PartReferenceLinksView',
                                actionName: 'BASELINE_HISTORY_OPERATE'
                            },
                            viewTableConfig: (config) => {
                                config.columns.splice(4, 1);
                                return {
                                    ...config
                                };
                            },
                            vm: this,
                            key: tabsRefresh['history'] || new Date().getTime().toString(),
                            oid,
                            pid
                        }
                    }
                ];
                if (_.isFunction(getTabs)) tabs = getTabs(tabs);
                return tabs;
            }
        },
        created() {
            this.routeRefresh();
        },
        activated() {
            // 路由强制刷新
            this.$route?.query?.routeRefresh && this.routeRefresh();
            // 组件强制刷新
            this.$route?.query?.componentRefresh && this.componentRefresh();
        },
        methods: {
            // 供外部调用
            refresh(toLatest) {
                if (toLatest) this.switchToLatest();
                else this.componentRefresh();
            },
            // 组件强制刷新
            componentRefresh() {
                this.componentKey = new Date().getTime().toString();
            },
            // 路由强制刷新
            routeRefresh() {
                this.route = ErdcKit.deepClone(_.omit(this.$route, 'matched'));
            },
            handleEdit(row) {
                var self = this;
                this.checkout(row).then((resp) => {
                    if (resp.success) {
                        this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                            self.$router.replace({
                                // path: self.cbbRoute('baselineUpdate', {
                                //     oid: resp.data.rawData.oid.value
                                // }),
                                path: `${self.$route.meta.prefixRoute}/baseline/edit`,
                                query: Object.assign(this.$route.query || {}, { oid: resp.data.rawData.oid.value })
                            });
                        });
                    }
                });
            },
            // 编辑时调用检出接口
            checkout(row) {
                if (row.iterationInfoState === 'CHECKED_IN' || row['iterationInfo.state'] === 'CHECKED_IN') {
                    let className = row.oid?.split(':')?.[1];
                    return this.$famHttp({
                        url: '/baseline/common/checkout',
                        className,
                        params: {
                            oid: row.oid
                        }
                    });
                } else {
                    return Promise.resolve({ success: true, data: { rawData: { oid: { value: row.oid } } } });
                }
            },
            openDeleteDialog(row) {
                this.$refs.deleteDialog.open([row], true);
            },
            openRenameDialog(row) {
                this.$refs.renameDialog.open(row, true);
            },
            openReviseDialog(row) {
                this.$refs.reviseDialog.open(row, true);
            },
            openChangeOwnerDialog(row) {
                this.$refs.changeOwnerDialog.open(row, true);
            },
            openChangeLifecycleDialog(row) {
                this.$refs.changeLifecycleDialog.open(row, true);
            },
            openMoveDialog(row) {
                this.$refs.moveDialog.open(row, true);
            },
            openSaveAsDialog(row) {
                this.$refs.saveAsDialog.open([row], true);
            },
            handleCheckIn(row) {
                var self = this;
                const props = {
                    visible: true,
                    type: 'save',
                    className: CONST.className,
                    disabled: true,
                    title: self.i18n.save,
                    rowList: Array.isArray(row) ? row : [row],
                    urlConfig: {
                        save: '/baseline/common/checkin',
                        source: '/baseline/content/attachment/replace'
                    }
                };
                operateAction.mountDialogSave(props, (data) => {
                    if (self.$route?.query?.oid === data) {
                        self.onRefreshPage();
                        // 刷新历史记录
                        self.$refs?.historyRecords?.refresh();
                        return;
                    }
                    const { route } = self.$router.resolve({
                        path: self.$route.path,
                        query: {
                            ...self.$route.query,
                            routeKey: self.$route.path,
                            oid: data,
                            routeRefresh: true
                        }
                    });
                    self.$store.dispatch('route/delVisitedRoute', self.$route).then(() => {
                        return self.$router.replace(route);
                    });
                });
            },
            handleUnCheckOut(row) {
                var self = this;
                let className = row.oid?.split(':')?.[1];
                this.$famHttp({
                    url: '/baseline/common/undo/checkout',
                    method: 'get',
                    className,
                    params: {
                        oid: row.oid
                    }
                }).then((resp) => {
                    if (resp.success) {
                        self.$message.success(self.i18n.operationSuccess);
                        const { route } = this.$router.resolve({
                            path: this.$route.path,
                            query: {
                                ...this.$route.query,
                                routeKey: this.$route.path,
                                oid: resp?.data,
                                routeRefresh: true
                            }
                        });
                        self.$store.dispatch('route/delVisitedRoute', self.$route).then(() => {
                            self.$router.replace(route).then(() => {
                                self.routeRefresh();
                                self.onRefreshPage();
                            });
                        });
                    }
                });
            },
            handleFormChange(formData) {
                if (formData && formData.name) {
                    this.formData = formData;
                    if (_.isFunction(this.beforeEcho)) this.formData = this.beforeEcho(formData);
                    return (this.title = formData.name + ',' + formData.identifierNo + ',' + formData.version);
                }
            },
            switchHistoryVersion(oid) {
                if (oid !== this.oid) {
                    this.$router.replace({
                        // path: this.cbbRoute('baselineDetail', {
                        //     oid: oid
                        // }),
                        path: `${this.$route.meta.prefixRoute}/baseline/detail`,
                        query: Object.assign(this.$route.query || {}, { oid })
                    });
                }
            },
            switchToLatest() {
                let className = this.oid?.split(':')?.[1];
                return this.$famHttp({
                    url: '/baseline/common/to/latest',
                    className,
                    params: {
                        oid: this.oid
                    }
                }).then((resp) => {
                    this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                        this.$router.replace({
                            path: `${this.$route.meta.prefixRoute}/baseline/detail`,
                            query: {
                                ..._.pick(this.$route.query, (value, key) => {
                                    return ['pid', 'typeOid'].includes(key) && value;
                                }),
                                oid: resp.data.rawData.oid.value
                            }
                        });
                    });
                });
            },
            onRefreshPage() {
                _.each(this.tabsRefresh, (value, key) => {
                    this.$set(this.tabsRefresh, key, new Date().getTime().toString());
                });
            },
            onGoList() {
                this.$store.dispatch('route/delVisitedRoute', this.$route);
                this.$router.replace({
                    // path: this.cbbRoute('baselineList'),
                    path: `${this.$route.meta.prefixRoute}/baseline/list`,
                    query: this.$route.query || {}
                });
            },
            getCurrentVersionStatus(oid) {
                let className = oid?.split(':')?.[1];
                return this.$famHttp({
                    url: '/baseline/common/is/latest/version',
                    className,
                    params: {
                        oid
                    },
                    method: 'get'
                }).then((resp) => {
                    if (resp.success) {
                        this.isLatest = resp.data;
                    }
                });
            },
            saveDraft() {
                this.save(true);
            },
            save(isDraft) {
                var self = this;
                this.$refs.baselineForm.submit().then((result) => {
                    if (result.validate) {
                        if (self.$route.query.oid && self.isDraftEdit) {
                            // 草稿状态保存时不传编码
                            result.data.attrRawList = result.data.attrRawList.filter(
                                (item) => item.attrName != 'identifierNo'
                            );
                        }
                        let className = self.oid?.split(':')?.[1];
                        this.$famHttp({
                            url: self.oid ? '/baseline/update' : '/baseline/create',
                            className,
                            data: {
                                isDraft: isDraft,
                                oid: self.oid,
                                ...result.data
                            },
                            method: 'post'
                        })
                            .then((res) => {
                                if (res.code === '200') {
                                    if (self.oid) {
                                        self.$famHttp({
                                            url: '/baseline/common/checkin',
                                            method: 'put',
                                            className,
                                            params: {
                                                note: '更新检入',
                                                oid: self.oid
                                            }
                                        }).then(() => {
                                            self.$message({
                                                message: self.i18n.updateSuccess,
                                                type: 'success',
                                                showClose: true
                                            });
                                            self.cancel();
                                        });
                                    } else {
                                        self.$message({
                                            message: self.i18n.createSuccess,
                                            type: 'success',
                                            showClose: true
                                        });
                                        self.cancel();
                                    }
                                }
                            })
                            .catch(() => {});
                    }
                });
            },
            cancel() {
                var self = this;
                this.$router.replace(
                    {
                        // path: self.cbbRoute('baselineList'),
                        path: `${self.$route.meta.prefixRoute}/baseline/list`,
                        query: this.$route.query || {}
                    },
                    () => {
                        self.$store.dispatch('route/delVisitedRoute', this.$route);
                    }
                );
            },
            //比较相关信息
            handleInfoCompare(row) {
                const data = {
                    props: ErdcKit.deepClone(this.viewTableMapping) || {},
                    routePath: `${this.$route?.meta?.prefixRoute}/baseline/infoCompare`
                };
                commonActions.handleInfoCompare(this, row, data);
            }
        }
    };
});
