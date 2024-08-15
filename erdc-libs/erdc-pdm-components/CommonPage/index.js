define(['text!' + ELMP.resource('erdc-pdm-components/CommonPage/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');
    const _ = require('underscore');

    return {
        name: 'CommonPage',
        template,
        components: {
            CommonForm: ErdcKit.asyncComponent(
                ELMP.resource('erdc-pdm-components/CommonPage/components/CommonForm/index.js')
            ),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined
            next((vm) => {
                vm.lastRoute = !_.isEmpty(vm.lastRoute) ? vm.lastRoute : from;
            });
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/CommonPage/locale/index.js'),
                // 表单对象
                commonForm: {
                    formId: 'CREATE',
                    className: '',
                    oid: ''
                },
                // 页头对象
                pageTitle: {
                    title: '',
                    staticTitle: true
                },
                // 加载中
                loading: {
                    save: false,
                    close: false
                },
                // 表单数据
                formData: {},
                // 保存来的路由名称，关闭要跳转
                lastRoute: {},
                // 类型 复制，另存为，模板编辑，模板详情
                type: '',
                // 当前路由对象
                route: {},
                // 组件key
                componentKey: new Date().getTime().toString()
            };
        },
        computed: {
            // 页面高度
            height() {
                const height = document.documentElement.clientHeight - 64;
                return this.route?.query?.pid ? height - 48 : height;
            },
            // 页头对象
            bindPageTitle() {
                return {
                    ...this.pageTitle
                };
            },
            // 高级表单对象
            bindCommonForm() {
                return {
                    ...this.commonForm,
                    queryLayoutParams: {
                        name: this.type
                        // attrRawList: [
                        //     {
                        //         attrName: 'layoutSelector',
                        //         value: this.type
                        //     }
                        // ]
                    },
                    modelMapper: {
                        'name': (rawData, { value }) => {
                            // 备份下原始数据
                            this.copyRawData = JSON.parse(JSON.stringify(rawData));

                            return this.type === 'COPY' && _.isFunction(this.i18n?.['副本'])
                                ? this.i18n['副本'](value)
                                : value;
                        },
                        'typeReference': (rawData, { oid }) => {
                            return oid;
                        },
                        'templateInfo.templateReference': (rawData, { displayName }) => {
                            return displayName;
                        },
                        'lifecycleStatus.lifecycleTemplateRef': (rawData, { oid }) => {
                            return oid;
                        }
                        // 'ownedByRef': (rawData, { users }) => {
                        //     return users;
                        // },
                        // 'createBy': (rawData, { users }) => {
                        //     return users;
                        // },
                        // 'updateBy': (rawData, { users }) => {
                        //     return users;
                        // }
                    }
                };
            },
            // 类型下拉框row配置
            typeReferenceRow() {
                return {
                    componentName: 'virtual-select',
                    clearNoData: true,
                    requestConfig: {
                        url: '/fam/type/typeDefinition/findAccessTypes',
                        data: {
                            typeName: this.commonForm?.className || '',
                            containerRef: this.$store.state.space?.context?.oid || ''
                        },
                        viewProperty: 'displayName',
                        valueProperty: 'typeOid'
                    }
                };
            },
            // 请求参数
            reqParams() {
                let url = '',
                    method = 'post',
                    options = {},
                    extraParams = {},
                    successTip = '';
                if (this.type === 'COPY') {
                    url = '/fam/saveAs';
                    successTip = this.i18n?.['复制成功'];
                }
                if (this.type === 'SAVEAS') {
                    url = `/fam/templ/copy/${this.commonForm?.oid}`;
                    successTip = this.i18n?.['另存为模板成功'];
                }
                extraParams.oid = this.commonForm?.oid;
                options.className = this.commonForm?.className || '';
                return {
                    url,
                    method,
                    // axios配置
                    options,
                    // data配置
                    extraParams,
                    // 成功提示
                    successTip
                };
            },
            // 按钮
            buttonList() {
                return [
                    {
                        name: this.i18n?.['保存'],
                        type: 'primary',
                        loading: this.loading?.save,
                        onclick: () => {
                            !this.loading?.close && !this.loading?.save && this.submitCheck();
                        }
                    },
                    {
                        name: this.i18n?.['关闭'],
                        loading: this.loading?.close,
                        onclick: () => {
                            !this.loading?.save && !this.loading?.close && this.closePage();
                        }
                    }
                ];
            }
        },
        watch: {
            'route': {
                handler: function (n) {
                    if (!_.isEmpty(n?.query)) {
                        ({ pid: this.commonForm.oid } = n.query);
                        ({ title: this.pageTitle.title } = n.query);
                    }
                    if (!_.isEmpty(n?.meta)) {
                        this.commonForm.className = n?.query?.className || n?.meta?.className || '';
                        this.type = (n.meta?.openType ?? '')?.toUpperCase();
                    }
                },
                deep: true,
                immediate: true
            },
            // 选中类型去查询生命周期模板回显
            'formData.typeReference'(oid) {
                oid && this.getLifecycleTemplate({ oid });
            }
        },
        created() {
            // 初始化通用页面路由
            this.routeRefresh();
        },
        activated() {
            // 强制路由刷新
            this.$route?.query?.routeRefresh && this.routeRefresh();
            // 强制组件刷新
            this.$route?.query?.componentRefresh && this.componentRefresh();
        },
        methods: {
            // 强制组件刷新
            componentRefresh() {
                this.componentKey = new Date().getTime().toString();
            },
            // 强制路由刷新
            routeRefresh() {
                this.route = ErdcKit.deepClone(_.omit(this.$route, 'matched'));
            },
            // 获取当前选中资源库的生命周期模板
            getLifecycleTemplate(data) {
                this.$famHttp({
                    url: '/fam/type/typeDefinition/getTypeDefById',
                    data,
                    method: 'get'
                }).then((res) => {
                    let { success, data } = res || {};
                    if (success) {
                        let { propertyMap = {} } = data || {};
                        _.each(propertyMap, (value) => {
                            if (value.name === 'lifecycleTemplateName') {
                                let { propertyValue = {} } = value || {};
                                try {
                                    propertyValue &&
                                        propertyValue?.value &&
                                        (this.formData['lifecycleStatus.lifecycleTemplateRef'] = propertyValue.value);
                                    propertyValue &&
                                        propertyValue?.value &&
                                        (this.formData.lifecycleStatus.lifecycleTemplateRef = propertyValue.value);
                                } catch {
                                    /* empty */
                                }
                            }
                        });
                    }
                });
            },
            // 高级表单属性值改变触发
            fieldChange({ field, required }, oVal, nVal) {
                // 手动清空选人组件的值
                required && field === 'ownedByRef' && oVal && !nVal && (this.formData[field] = nVal);
            },
            // 关闭页面
            closePage() {
                this.loading.close = true;
                this.$store
                    .dispatch('route/delVisitedRoute', this.$route)
                    .then((visitedRoutes) => {
                        if (!visitedRoutes.length) {
                            this.$router.push(this.$store.state.route.resources.children[0].href);
                        } else {
                            this.$router.push(this.lastRoute);
                        }
                    })
                    .finally(() => {
                        this.loading.close = false;
                    });
            },
            // 提交前校验
            submitCheck() {
                const { copyRawData } = this;
                const { submit, serializeEditableAttr } = this.$refs.commonFormRef;
                submit().then((resp) => {
                    if (resp.valid) {
                        const attrRawList = serializeEditableAttr() || {};

                        // 后端调整了，现在要手动组装模板数据
                        if (
                            !attrRawList.map((item) => item.attrName).includes('templateInfo.templateReference') &&
                            copyRawData['templateInfo.templateReference']?.oid
                        ) {
                            attrRawList.push({
                                attrName: 'templateInfo.templateReference',
                                value: copyRawData['templateInfo.templateReference'].oid
                            });
                        }

                        this.assemblyData({ attrRawList }, (data) => {
                            this.submit(data)
                                .then((resp) => {
                                    if (resp.success) {
                                        this.$message.success(this.reqParams?.successTip);
                                        this.closePage();
                                    }
                                })
                                .finally(() => {
                                    this.loading.save = false;
                                });
                        });
                    }
                });
            },
            // 组装数据
            assemblyData({ attrRawList }, callback) {
                let customParams = {};
                let copyRelationModule = _.find(attrRawList, { attrName: 'copyRelationModule' });
                if (_.isArray(copyRelationModule?.value)) {
                    copyRelationModule.value = copyRelationModule?.value.filter((item) => item)?.join();
                }
                customParams.oid = this.reqParams?.extraParams?.oid || '';
                customParams.name = _.find(attrRawList, { attrName: 'name' })?.value || '';
                customParams.typeReference = this.formData?.typeReference || '';
                customParams.className = this.commonForm?.className || '';
                customParams.attrRawList = attrRawList;
                if (this.type === 'COPY') {
                    customParams = [customParams];
                }
                _.isFunction(callback) && callback({ customParams });
            },
            // 创建，更新资源库
            submit({ customParams }) {
                this.loading.save = true;
                return this.$famHttp({
                    url: this.reqParams?.url,
                    data: customParams,
                    method: this.reqParams?.method,
                    ...this.reqParams?.options
                });
            }
        }
    };
});
