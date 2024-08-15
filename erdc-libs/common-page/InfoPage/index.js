define([ELMP.resource('common-page/mixins/common.js')], function (common) {
    const FamKit = require('fam:kit');

    return {
        mixins: [common],
        /*html*/
        template: `
            <div id="fam_common_page_info" class="common_page-m h-100p">
                <CommonPageInfo 
                    v-if="isReady"
                    :className="className" 
                    :routeQueryParams="routeQueryParams" 
                    :classNameKey="classNameKey"
                    :formShowType="formShowType"
                    :configName="configName"
                    :typeOid="typeOid"
                    :from="from"
                    :key="componentKey"
                    @component-refresh="componentRefresh"
                    @route-refresh="routeRefresh"
                    @all-refresh="refreshAll"
                    @handler-title-top-btn="handlerTitleTopBtn"
                ></CommonPageInfo>
                <erd-ex-dialog
                    :title="i18n.saveAsTemplateConfig"
                    :visible.sync="saveAsDialogVisible"
                >
                    <div class="bg-normal text-sm p-16 mb-16">{{i18n.saveAsTips}}</div>
                    <FamDynamicForm
                        v-if="saveAsDialogVisible"
                        ref="saveAsTemplFormRef"
                        :form="saveAsTemplateForm"
                        :data="saveAsTemplateFormConfigs"
                    >
                    </FamDynamicForm>
                    <span
                        slot="footer"
                        class="dialog-footer"
                    >
                        <erd-button
                            type="primary"
                            :loading="saveAsLoading"
                            @click="submitSaveAsTemplate"
                        >
                            {{i18n.confirm}}
                        </erd-button>
                        <erd-button @click="closeSaveAsDialog">{{i18n.cancel}}</erd-button>
                    </span>
                </erd-ex-dialog>
            </div>
        `,
        components: {
            CommonPageInfo: FamKit.asyncComponent(ELMP.resource('common-page/components/InfoForm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                i18nMappingObj: {
                    attributes: this.getI18nByKey('属性'),
                    team: this.getI18nByKey('团队'),
                    associatedUser: this.getI18nByKey('关联用户'),
                    edit: this.getI18nByKey('编辑'),
                    editTitle: this.getI18nByKey('编辑产品'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    saveSuccess: this.getI18nByKey('保存模板成功'),
                    saveError: this.getI18nByKey('保存模板失败'),
                    saveAsTemplate: this.getI18nByKey('另存为模板'),
                    saveAsTemplateConfig: this.getI18nByKey('另存为模板配置'),
                    folder: this.getI18nByKey('文件夹'),
                    authority: this.getI18nByKey('权限'),
                    collect: this.getI18nByKey('收藏'),
                    cancelCollect: this.getI18nByKey('取消收藏'),
                    operationSuccess: this.getI18nByKey('操作成功')
                },
                from: {},
                route: {},
                // 组件级别刷新
                componentKey: new Date().getTime().toString(),
                isReady: false
            };
        },
        watch: {
            // 适配通用空间pageType切换
            $route(val, oval) {
                if (val.query.pageType !== oval.query.pageType) {
                    this.routeRefresh();
                }
            }
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined
            next((vm) => {
                let cacheFrom = {};
                // 尝试从缓存取
                try {
                    cacheFrom = JSON.parse(sessionStorage.getItem('commonPageBackCache') || '{}');
                } catch (e) {
                    cacheFrom = {};
                }

                if (_.isEmpty(from) || from?.path === '/' || !from?.matched?.length) {
                    const keys = _.keys(cacheFrom);

                    const toPath = to.path + initSearchParams(to.query);

                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i]?.split('_')?.reverse()?.[0] === toPath) {
                            const { route } = vm.$router.resolve(cacheFrom[keys[i]]);
                            vm.from = route || from;
                            break;
                        }
                    }
                } else if (_.isEmpty(vm.from)) {
                    vm.from = from;

                    const fromPath = from.path + initSearchParams(from.query);
                    const toPath = to.path + initSearchParams(to.query);

                    const keys = _.keys(cacheFrom);
                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i]?.split('_')?.reverse()?.[0] === toPath) {
                            delete cacheFrom[keys[i]];
                            break;
                        }
                    }

                    const path = fromPath + '_' + toPath;
                    initRouterCache(path);
                }

                function initSearchParams(query) {
                    const searchParams = new URLSearchParams('');
                    const sourceQuery = _.pick(query, 'pid', 'typeOid', 'oid');
                    _.each(sourceQuery, (value, key) => {
                        value && key && searchParams.set(key, value);
                    });
                    return searchParams?.toString() ? '?' + searchParams?.toString() : '';
                }

                function initRouterCache(cacheKey) {
                    cacheFrom[cacheKey] = JSON.parse(
                        JSON.stringify(from, (key, value) => {
                            switch (key) {
                                case 'matched':
                                    return undefined;
                                default:
                                    return value;
                            }
                        })
                    );

                    sessionStorage.setItem('commonPageBackCache', JSON.stringify(cacheFrom));
                }
            });
        },
        computed: {
            className() {
                const classShortName =
                    this.route.query?.className || this.route.params.className || this.route.meta.className || '';
                let className = '';
                if (classShortName) {
                    className = this.$store.getters.className(classShortName);
                }
                return className;
            },
            classNameKey() {
                if (!this.className) return;
                const classNameAttr = this.className.split('.');
                return classNameAttr[classNameAttr.length - 1];
            },
            routeQueryParams() {
                const queryParams = FamKit.deepClone(this.route?.query) || {};
                const idKey = this.route?.meta?.currentRouterIdKey;
                queryParams.containerOid = idKey
                    ? this.route.query[idKey] || this.route?.params[idKey]
                    : this.route.query.oid || this.route.query.pid || this.route?.query.containerOid;
                return queryParams;
            },
            formShowType() {
                return this.route?.meta?.openType || this.route?.query?.pageType || 'create';
            },
            configName() {
                return this.route.meta.configName || this.formShowType;
            },
            typeOid() {
                // return this.route.query.typeOid || this.route.params.typeOid;
                return '';
            }
        },
        created() {
            // 初始化通用页面路由
            this.routeRefresh();
            this.initCommonPageStore();
        },
        mounted() {
            let { className } = this;
            // 尝试加载路径配置
            let pathConfig = this.$store.state?.infoPage.pagePathConfig[className];
            if (!pathConfig) {
                this.isReady = true;
            } else {
                // 根据路径加载注册配置
                require([pathConfig.configPath], (module) => {
                    let callback = (config) => {
                        this.$store
                            .dispatch('infoPage/addClassNameConfig', {
                                className,
                                config: config
                            })
                            .then(() => {
                                this.isReady = true;
                            });
                    };

                    if (pathConfig.handleModule) {
                        pathConfig.handleModule(module, callback);
                    } else {
                        callback(module[className]);
                    }
                });
            }
        },
        activated() {
            // 强制路由刷新
            this.$route?.query?.routeRefresh && this.routeRefresh();
            // 强制组件刷新
            this.$route?.query?.componentRefresh && this.componentRefresh();
            // 初始化通用页面store
            this.$nextTick(() => {
                this.initCommonPageStore();
            });
        },
        beforeDestroy() {
            // 初始化通用页面store
            if (!this.$store.hasModule('commonPageStore')) {
                return;
            }
            let commonPageObject = this?.$store?.getters?.['commonPageStore/getCommonPageObject'] || {};
            if (
                !_.isEmpty(commonPageObject) &&
                commonPageObject?.[`${this.routeQueryParams.containerOid}_${this.formShowType}`]
            ) {
                commonPageObject[`${this.routeQueryParams.containerOid}_${this.formShowType}`] = undefined;
                this.$store.dispatch('commonPageStore/setCommonPageObjectAction', commonPageObject);
            }
        },
        methods: {
            // 强制组件刷新
            componentRefresh() {
                this.componentKey = new Date().getTime().toString();
            },
            // 强制路由刷新
            routeRefresh() {
                this.route = FamKit.deepClone(_.omit(this.$route, 'matched'));
            },
            // 初始化通用页面store
            initCommonPageStore() {
                this.$store.dispatch('commonPageStore/setCommonPageObjectAction', {
                    [`${this.routeQueryParams.containerOid}_${this.formShowType}`]: (callback) =>
                        _.isFunction(callback) && callback(this)
                });
            },
            // 根据oid刷新通用页面
            refreshAll(oid, callback) {
                const idKey = this.route?.meta?.currentRouterIdKey || 'oid';

                let params = FamKit.deepClone(this.route.params || {}) || {};
                let query = FamKit.deepClone(this.route.query || {}) || {};

                // 替换params、query中的关键属性参数
                if (Object.prototype.hasOwnProperty.call(params, idKey)) params[idKey] = oid;
                else if (Object.prototype.hasOwnProperty.call(query, idKey)) query[idKey] = oid;
                else if (Object.prototype.hasOwnProperty.call(params, 'pid')) params['pid'] = oid;
                else query['containerOid'] = oid;

                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                    this.$router.replace({
                        ...this.$route,
                        params: _.extend(params, {
                            routeRefresh: false,
                            componentRefresh: false
                        }),
                        query
                    });
                    _.isFunction(callback) && callback();
                });
            }
        }
    };
});
