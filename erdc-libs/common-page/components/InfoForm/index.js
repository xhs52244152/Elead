define([
    'text!' + ELMP.resource('common-page/components/InfoForm/index.html'),
    ELMP.resource('erdc-app/api/common.js'),
    'dayjs',
    'EventBus',
    'underscore',
    'css!' + ELMP.resource('common-page/components/InfoForm/style.css')
], function (template, commonApi, dayjs, EventBus, _) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            className: {
                type: String,
                default: ''
            },
            classNameKey: {
                type: String,
                default: ''
            },
            formShowType: {
                type: String,
                default: 'create' // create, edit, detail
            },
            configName: String,
            routeQueryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            dialogFormInfo: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            from: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            oid: String,
            typeOid: String
        },
        components: {
            CommonPageTitle: FamKit.asyncComponent(ELMP.resource('common-page/components/DetailInfoTop/index.js')),
            BasicInfo: FamKit.asyncComponent(ELMP.resource('common-page/components/BasicInfo/index.js')),
            FamAdvancedForm: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamAdvancedForm/index.js`))
        },
        data() {
            return {
                formData: {},
                // 对象源数据
                objectSourceData: {},
                // 表单源数据
                sourceData: {},
                caption: '',
                extraParams: {},
                createdOid: '',
                formClassName: '',
                panelUnfold: true,
                activeName: 'detail',
                typeReference: '',
                iconStyle: {},
                vm: this,
                // 保存加载中
                confirmLoading: false,
                // 保存草稿加载中
                saveDraftLoading: false,
                typeReferenceInfo: {},
                famAdvancedFormLoad: false,
                widgetList: [],
                configParameter: {},
                componentCache: {}
            };
        },
        created() {
            // 初始化configParameter
            let { custom = {}, config = {} } = this.$store.state?.infoPage.commonPageConfig[this.className] || {};
            const customPageConfig = custom[this.configName];
            if (customPageConfig) {
                this.configParameter = _.isFunction(customPageConfig) ? customPageConfig() : customPageConfig;
            } else {
                _.isFunction(config) && (config = config() || {});
                this.configParameter = config?.[this.configName] || {};
            }
        },
        computed: {
            pageStyle() {
                const formHeight = 'calc(100% - var(--largeSpace) * 2)';
                return {
                    height: formHeight
                };
            },
            showDraftBtn() {
                return _.isFunction(this.configParameter?.showDraftBtn)
                    ? this.configParameter?.showDraftBtn()
                    : this.configParameter?.showDraftBtn || false;
            },
            showSpecialAttr() {
                return this.configParameter?.showSpecialAttr || false;
            },
            actionParams() {
                return this.configParameter?.actionParams;
            },
            menuStatus() {
                return this.routeQueryParams.menuStatus;
            },
            tabsData() {
                const defaultComponent = FamKit.asyncComponent(
                    ELMP.resource('common-page/components/DetailInfo/index.js')
                );
                const tabs = this?.configParameter?.tabs;
                let currentTabs = _.isFunction(tabs) ? tabs(this.sourceData) : FamKit.deepClone(tabs);
                currentTabs = currentTabs || [];
                if (currentTabs.length) {
                    currentTabs.forEach((item) => {
                        this.componentCache[item.activeName] = item;
                        if (item.activeName === 'detail') {
                            this.componentCache[item.activeName].component = defaultComponent;
                        }
                    });
                } else {
                    let defaultTab = {
                        name: '详细信息',
                        activeName: 'detail',
                        component: defaultComponent,
                        basicProps: {
                            isCommonPageSpace: this.isCommonPageSpace,

                            // 类型下拉框row配置
                            typeReferenceRow: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    data: {
                                        typeName: this.innerClassName,
                                        containerRef: this.containerRef || this.$store?.state?.app?.container?.oid || ''
                                    },
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid'
                                }
                            }
                        }
                    };
                    if (this.componentCache.detail) {
                        this.componentCache.detail.basicProps = defaultTab.basicProps;
                    } else {
                        this.componentCache.detail = defaultTab;
                    }
                }
                return Object.values(this.componentCache);
            },
            openType() {
                return this.routeQueryParams.openType || ''; // blank
            },
            queryLayoutParams() {
                let getLayoutName = this.configParameter?.layoutName;
                let layoutName = _.isFunction(getLayoutName) ? getLayoutName() : getLayoutName;
                return {
                    name: layoutName || this.openType,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: layoutName || this.openType || 'CREATE'
                        // },
                        {
                            attrName: 'typeReference',
                            value: this.innerTypeReference
                        }
                    ]
                };
            },
            // 布局类型 CREATE、UPDATE、DETAIL
            layoutType() {
                if (this.configParameter.layoutType) {
                    return this.configParameter.layoutType;
                } else {
                    let { formShowType } = this;
                    let defaultMap = {
                        create: 'CREATE',
                        edit: 'UPDATE',
                        detail: 'DETAIL'
                    };

                    return defaultMap[formShowType];
                }
            },
            slots() {
                return this.configParameter.slots || {};
            },
            hooks() {
                return this.configParameter.hooks || {};
            },
            props() {
                return this.configParameter.props || {};
            },
            buttonText() {
                return {
                    ...{
                        confirmButtonText: '保存',
                        draftButtonText: '保存草稿',
                        cancelButtonText: '关闭'
                    },
                    ...this.configParameter.buttonText
                };
            },
            containerOid() {
                return this.dialogFormInfo?.containerOid || this.routeQueryParams.containerOid || '';
            },
            editableAttrs() {
                return this.configParameter?.props?.formProps?.editableAttr || this.configParameter?.editableAttr || [];
            },
            containerRef() {
                return (
                    this.dialogFormInfo?.containerRef ||
                    this.routeQueryParams.containerRef ||
                    this.$store?.state?.app?.container?.oid ||
                    ''
                );
            },
            params() {
                return this.$route?.params || {};
            },
            commonPageTitleProps() {
                const commonPageTitleProps = this.configParameter?.props?.commonPageTitleProps || {};
                let props = _.isFunction(commonPageTitleProps)
                    ? commonPageTitleProps(this?.vm)
                    : commonPageTitleProps || {};
                let { title, icon, showBackButton, showSpecialAttr, detailClassNameKey, keyAttrs, actionParams } = this;
                return {
                    title,
                    icon,
                    showBackButton,
                    showSpecialAttr,
                    classNameKey: detailClassNameKey,
                    keyAttrs,
                    actionParams,
                    ...props
                };
            },
            titleAfterProps() {
                const titleAfterProps = this.configParameter?.props?.titleAfterProps || {};
                return _.isFunction(titleAfterProps) ? titleAfterProps(this?.vm) : titleAfterProps || {};
            },
            titleBeforeProps() {
                const titleBeforeProps = this.configParameter?.props?.titleBeforeProps || {};
                return _.isFunction(titleBeforeProps) ? titleBeforeProps(this?.vm) : titleBeforeProps || {};
            },
            customBtnProps() {
                const customBtnProps = this.configParameter?.props?.customBtnProps || {};
                return _.isFunction(customBtnProps) ? customBtnProps(this?.vm) : customBtnProps || {};
            },
            formBeforeProps() {
                const formBefore = this.configParameter?.props?.formBefore || {};
                return _.isFunction(formBefore) ? formBefore(this?.vm) : formBefore || {};
            },
            // 通用表单自定义传参
            formSlotsProps() {
                const formSlotsProps = this.configParameter?.props?.formSlotsProps;
                return _.isFunction(formSlotsProps) ? formSlotsProps(this?.vm) : formSlotsProps || {};
            },
            // 查看详情下拉按钮菜单接口参数key
            detailClassNameKey() {
                const actionKey = this?.configParameter?.actionKey;
                if (_.isFunction(actionKey)) {
                    return actionKey();
                } else {
                    return actionKey || `${this.classNameKey}_FORM_ACTION`;
                }
            },
            backModule() {
                let allVisitedRoutes = _.clone(this.$store.getters['route/visitedRoutes']);
                let backData = allVisitedRoutes.filter((item) => item.name === this.from?.name);
                if (backData.length) {
                    // 这里赋值参数是在返回后要判断跳到哪个tab页面做了处理,具体参考项目-计划-子任务创建
                    backData[0].query.activeName = this.$route?.query?.activeName || '';
                } else if (this.from?.name) {
                    backData.push(this.from);
                }
                return backData;
            },
            // 表单props对象
            formProps() {
                return _.isFunction(this.configParameter?.props?.formProps)
                    ? this.configParameter?.props?.formProps(this?.vm)
                    : this.configParameter?.props?.formProps || {};
            },
            // 判断是否显示保存草稿按钮
            isDraftStatus() {
                const data = this.sourceData?.['lifecycleStatus.status'];
                // 创建 或者 状态为草稿时
                return this.formShowType === 'create' || data?.value === 'DRAFT';
            },
            icon() {
                const icon = this?.configParameter?.icon;
                let value = null;
                if (_.isString(icon)) {
                    value = icon;
                } else if (_.isFunction(icon)) {
                    value = icon(this.formData);
                }
                return value;
            },
            title() {
                const title = this?.configParameter?.title;
                let value = null;
                if (_.isString(title)) {
                    value = title;
                } else if (_.isFunction(title)) {
                    value = title(this.formData, this.caption);
                } else {
                    value = this.getDefaultTitle();
                }
                return value;
            },
            // pdm 编辑页面没有tabs，标题需要有下边距
            isNotTabs() {
                return this?.configParameter?.isNotTabs || false;
            },
            modelMapper() {
                const modelMapper = this.configParameter?.modelMapper || {};
                return {
                    typeReference: (formData, { oid }) => {
                        return oid || '';
                    },
                    ...modelMapper
                };
            },
            showBasicInfo() {
                const hasTypeWidget = this.widgetList?.some((item) => {
                    return item.schema?.field === 'typeReference';
                });
                return !hasTypeWidget;
            },
            innerClassName() {
                return this.formClassName || this.formData?.typeName || '';
            },
            innerTypeReference() {
                return this.typeReference || this.sourceData?.typeReference?.oid || '';
            },
            showBackButton() {
                return this.configParameter?.showBackButton || false;
            },
            keyAttrs() {
                let newKeyAttrs = [];
                if (this.formShowType === 'detail') {
                    // 详情-表头属性
                    const keyAttrs = this?.configParameter?.keyAttrs;
                    if (_.isArray(keyAttrs)) {
                        newKeyAttrs = keyAttrs;
                    } else if (_.isFunction(keyAttrs)) {
                        newKeyAttrs = keyAttrs(this.formData);
                    }
                }
                return newKeyAttrs;
            },
            // 创建布局设置默认值处理
            canSetCreateFromData() {
                return this.widgetList?.length && this.formShowType === 'create';
            },
            isCommonPageSpace() {
                return this.$route.query.pageType;
            }
        },
        watch: {
            'routeQueryParams.activeName': {
                handler: function (nv) {
                    if (nv) {
                        this.$nextTick(() => {
                            this.activeName = nv;
                        });
                    }
                },
                immediate: true
            },
            tabsData: {
                handler: function (nv) {
                    if (nv?.length && !this.activeName) {
                        const [item] = nv || [];
                        this.activeName = item?.activeName || this.activeName;
                    }
                },
                immediate: true
            },
            canSetCreateFromData: {
                handler(val) {
                    if (val) {
                        // 抛出动态表单实例
                        if (_.isFunction(this.hooks.beforeEcho)) {
                            this.hooks.beforeEcho(this.$refs?.detail?.[0]?.$refs?.layoutForm);
                        }
                    }
                },
                immediate: true
            }
        },
        mounted() {
            // 创建表单时有时需要赋默认值，如所属项目
            // if (_.isFunction(this.hooks.beforeEcho) && this.formShowType === 'create') {
            //     let rawData = this.formData;
            //     this.hooks.beforeEcho({ rawData, next: this.setFormData });
            // }
        },
        methods: {
            // 路由强制刷新
            routeRefresh() {
                this.$emit('route-refresh');
            },
            // 强制组件刷新
            componentRefresh() {
                this.$emit('component-refresh');
            },
            // 根据不同类型进行渲染不同布局
            renderLayoutForm(val, id, appName, classifyCode) {
                this.typeReference = id;
                this.formClassName = val;
                this.typeReferenceInfo.appName = appName;
                this.typeReferenceInfo.rootType = classifyCode;

                if (!this.containerOid) {
                    // 切换项目类型清除数据
                    this.formData = {};
                }
            },
            setLayoutExtraParams(typeReference, classifyReference) {
                this.extraParams = {
                    attrRawList: [
                        {
                            attrName: 'typeReference',
                            value: typeReference
                        },
                        {
                            attrName: 'classifyReference',
                            value: classifyReference
                        }
                    ]
                };
                this.formData.typeReference = typeReference;
            },
            getWidgetList(widgetList = []) {
                this.widgetList = FamKit.deepClone(widgetList) || [];
            },
            // 设置布局表单回显数据（例如基本信息的一些动作可能会修改表单数据）
            setFormData(val) {
                this.formData = JSON.parse(JSON.stringify(val));
            },
            handleTabClick(val) {
                this.activeName = val.name;
                this.$router
                    .replace({
                        ...this.$route,
                        query: { ...this.$route?.query, activeName: val.name }
                    })
                    .then(() => {
                        // 刷新路由缓存
                        this.routeRefresh();
                    });
            },
            // 处理回显数据  n存在代表数据不需要单独处理
            handleRenderData(data, n) {
                if (n) {
                    this.formData = this.$refs?.detail?.[0].$refs.layoutForm?.initTransformData(data);
                    // this.formData = FamKit.deserializeAttr(data);
                } else {
                    this.formData = data;
                }

                // 表单插槽项数据回显处理
                // let formSlots = this.slots.formSlots;
                // if (formSlots) {
                //     Object.keys(formSlots).forEach((key) => {
                //         this.$set(this.formData, key, this.formData[key]);
                //     });
                // }

                // 将数据抛出
                this.$emit('getData', this.formData);

                // if (this.formShowType === 'detail') {
                //     // 详情-表头属性
                //     const keyAttrs = this?.configParameter?.keyAttrs;
                //     if (_.isArray(keyAttrs)) {
                //         this.keyAttrs = keyAttrs;
                //     } else if (_.isFunction(keyAttrs)) {
                //         this.keyAttrs = keyAttrs(this.formData);
                //     } else {
                //         this.keyAttrs = [];
                //     }
                // }

                // this.showBackButton = this.configParameter?.showBackButton || false;

                // // 获取(项目、产品)类型对应的className进行布局渲染
                // this.$refs.beforeForm[0]?.getType(this.formData.typeReference).then((res) => {
                //     this.formClassName = res;
                // });
                // 表单数据渲染后，获取到类型分类后，修改表单className，触发获取当前类型表单布局
                if (this.formData.typeName) {
                    this.formClassName = this.formData.typeName;
                }
            },
            getObjectAttrsByOid(val) {
                let { handleRenderData, params } = this;
                const { typeOid } = params;
                this.fetchProductByOid(val, typeOid).then((response) => {
                    const { data } = response;
                    const { rawData } = data;
                    this.objectSourceData = data || {};
                    this.caption = data?.caption || '';
                    // 源数据备份
                    try {
                        this.sourceData = JSON.parse(JSON.stringify(rawData || {}));
                    } catch (e) {
                        throw new Error();
                    }

                    this.$nextTick(() => {
                        // 处理数据回显, 如果数据需要处理的则去父组件外处理后在回调
                        if (_.isFunction(this.hooks.beforeEcho)) {
                            this.hooks.beforeEcho({ rawData, next: handleRenderData, data });
                        } else {
                            handleRenderData(rawData, 1);
                        }
                    });
                });
            },
            fetchProductByOid(oid, typeOid) {
                return commonApi.fetchObjectAttr(oid, { typeOid });
            },
            refresh(oid, callback) {
                if (oid === this.containerOid)
                    this.$refs?.detail?.[0].$refs.layoutForm.fetchFormDataByOid(oid, this.typeOid);
                else this.$emit('all-refresh', oid, callback);
            },
            // 获取attr接口数据
            getAttr(oid) {
                return new Promise((resolve) => {
                    this.fetchProductByOid(oid).then(({ data }) => {
                        resolve(data);
                    });
                });
            },
            // 基本信息数据(传入的组件)
            basicForm(check) {
                return new Promise((resolve, reject) => {
                    // 获取基本信息数据
                    const beforeForm = this.$refs?.detail?.[0].$refs.beforeForm;
                    // basicInfo不存在代表没有自定义组件
                    if (!beforeForm) return resolve([]);
                    beforeForm.submit(check).then((data) => {
                        if (data) {
                            resolve(data);
                        } else {
                            reject(false);
                        }
                    });
                });
            },
            // 对详情布局数据转换
            detailDataTransform(formData) {
                let attrRawList = formData.filter((item) => item.attrName !== 'context');
                attrRawList = formData.filter((item) => item.attrName !== 'lifecycleStatus.status');
                // 如果有传入的插槽，进行值合并
                // let formSlotData = {};
                // if (this.formSlotData && Object.keys(this.formSlotData).length) {
                //     for (x in this.formSlotData) {
                //         formSlotData.attrName = x;
                //         formSlotData.value = this.formSlotData[x];
                //     }
                //     attrRawList = attrRawList.concat(formSlotData);
                // }
                let obj = {
                    attrRawList,
                    className: this.className
                };
                // if为true代表是编辑
                if (this.containerOid || this.$route.query.pid) {
                    obj.oid = this.containerOid || this.$route.query.pid;
                }

                // 通用页面编辑需要添加 typeReference 和 containerRef
                if (this.typeReference) {
                    obj.typeReference = this.typeReference;
                }
                if (this.containerRef) {
                    obj.containerRef = this.containerRef;
                }

                return obj;
            },
            // 获取详情信息布局数据
            detailForm(check) {
                const layoutForm = this.$refs?.detail?.[0].$refs.layoutForm;
                // 插槽对应表单数据组装
                const pushSlotValue = (formData) => {
                    const keys = _.map(formData, 'attrName') || [];
                    this.slots?.formSlots &&
                        Object.keys(this.slots.formSlots).forEach((key) => {
                            if (!keys.includes(key)) {
                                formData.push({
                                    attrName: key,
                                    value: this.formData[key]
                                });
                            }
                        });
                };
                return new Promise((resolve, reject) => {
                    if (!check) {
                        if (layoutForm) {
                            let formData = layoutForm?.serializeEditableAttr();
                            pushSlotValue(formData);
                            let obj = this.detailDataTransform(formData);
                            resolve(obj);
                        } else {
                            resolve([]);
                        }
                    } else {
                        layoutForm.submit().then(({ valid }) => {
                            let formData = layoutForm?.serializeEditableAttr();
                            pushSlotValue(formData);

                            let obj = this.detailDataTransform(formData);
                            if (valid) {
                                resolve(obj);
                            } else {
                                reject(false);
                            }
                        });
                    }
                });
            },
            // 将基本信息和详情信息布局数据结合
            confirmSave(check) {
                const result = Promise.all([this.basicForm(check), this.detailForm(check)]);
                return new Promise((resolve, reject) => {
                    result
                        .then((res) => {
                            //res[0]基本信息数据 res[1]详情布局数据
                            // 处理方式： 将基本信息(res[0])数据合并到详情布局数据(res[1])的attrRawList
                            // res[1].attrRawList不存在代表详情布局没有渲染出来
                            let result = res[1];
                            if (res[0] && res[0].length) {
                                result.attrRawList = result.attrRawList.concat(res[0]);
                            }
                            resolve(result);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            onHandlerConfirm() {
                let { handlerCREATE, handlerUPDATE } = this,
                    loadingType = 'confirmLoading';
                const isSaveDraft = false;
                this.confirmSave(true).then((res) => {
                    if (this.hooks.beforeSubmit) {
                        if (this.formShowType === 'edit') {
                            this.hooks.beforeSubmit({
                                formData: res,
                                next() {
                                    handlerUPDATE(loadingType, isSaveDraft, ...arguments);
                                },
                                isSaveDraft: isSaveDraft,
                                sourceData: this.sourceData,
                                vm: this.vm
                            });
                        } else {
                            this.hooks.beforeSubmit({
                                formData: res,
                                next() {
                                    handlerCREATE(loadingType, ...arguments);
                                },
                                isSaveDraft: isSaveDraft,
                                sourceData: this.sourceData,
                                vm: this.vm
                            });
                        }
                    } else {
                        this.formShowType === 'edit'
                            ? handlerUPDATE(loadingType, isSaveDraft, res)
                            : handlerCREATE(loadingType, res);
                    }
                });
            },
            dateTransfer(time) {
                if (!time) {
                    return '';
                }
                let patern = 'YYYY-MM-DD';
                if (time.indexOf(' ') !== -1) {
                    patern = 'YYYY-MM-DD HH:mm:ss';
                }
                return dayjs(time).format(patern);
            },
            getSubmitParams() {
                let detailForm = this.$refs?.detail?.[0].$refs.layoutForm;
                const data = detailForm.serialize();
                let typeReference = '';
                const attrRawList = data
                    ? data.map((item) => {
                          // 特殊处理的组件和字段，后续需要补充更多组件的特殊处理
                          if (item.attrName.indexOf('I18nJson') !== -1) {
                              item.value = item.value?.value;
                          } else if (item.attrName === 'actualStart' || item.attrName === 'actualEnd') {
                              item.value = this.dateTransfer(item.value);
                          }
                          const typeReferenceValue =
                              typeof item.value === 'object' && item.value
                                  ? `OR:${item.value.key}:${item.value.id}`
                                  : item.value;
                          if (item.attrName === 'typeReference') {
                              typeReference = typeReferenceValue;
                              item.value = typeReferenceValue;
                          }
                          return item;
                      })
                    : [];
                const submitData = {
                    attrRawList: attrRawList,
                    className: this.className,
                    typeReference,
                    containerRef: this.containerRef
                };
                // 默认为create场景的参数，如果是update需要单独增加参数
                if (this.formShowType === 'edit') {
                    submitData.oid = this.containerOid;
                }
                return submitData;
            },
            // submitExtendParams 请求参数扩展
            handlerCREATE(loadingType, submitData, tip = '保存成功', submitExtendParams) {
                this[loadingType] = true;
                this.$famHttp({ url: '/fam/create', data: submitData, method: 'POST', ...submitExtendParams })
                    .then((resp) => {
                        if (this.openType === 'blank') {
                            this.successDialogVisiable = true;
                            this.createdOid = resp.data;
                        } else {
                            if (tip) {
                                this.$message({
                                    type: 'success',
                                    message: tip,
                                    showClose: true
                                });
                            }

                            if (this.hooks.afterSubmit) {
                                this.hooks.afterSubmit({
                                    responseData: resp.data,
                                    cancel: this.onHandlerCancel,
                                    vm: this.vm,
                                    isSaveDraft: submitData?.isDraft || false
                                });
                            } else {
                                if (this.isCommonPageSpace) {
                                    this.$router.push({
                                        path: `${this.$route.meta?.resourceKey}/list`,
                                        query: {
                                            className: this.className
                                        }
                                    });
                                } else {
                                    this.goBack();
                                }
                            }

                            this.$emit('handler-submit-success', resp.data);
                        }
                    })
                    .finally(() => {
                        this[loadingType] = false;
                    });
            },
            // submitExtendParams 请求参数扩展
            handlerUPDATE(loadingType, isSaveDraft, submitData, tip = '保存成功', submitExtendParams) {
                this[loadingType] = true;
                this.$famHttp({ url: '/fam/update', data: submitData, method: 'POST', ...submitExtendParams })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: tip,
                            showClose: true
                        });

                        if (this.hooks.afterSubmit) {
                            this.hooks.afterSubmit({
                                responseData: resp.data,
                                cancel: this.onHandlerCancel,
                                vm: this.vm,
                                isSaveDraft: isSaveDraft
                            });
                        } else {
                            this.goBack();
                        }

                        this.$emit('handler-submit-success');
                    })
                    .finally(() => {
                        this[loadingType] = false;
                    });
            },
            onHandlerCancel() {
                if (_.isFunction(this.hooks.beforeCancel)) {
                    this.hooks.beforeCancel({ formData: this.formData, goBack: this.goBack, vm: this.vm });
                } else {
                    if (this.isCommonPageSpace) {
                        this.$router.push({
                            path: `${this.$route.meta?.resourceKey}/list`,
                            query: {
                                className: this.className
                            }
                        });
                    } else {
                        this.goBack();
                    }
                }
            },
            goBack(callback) {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    let defaultRouter = `common-page/${this.className}/list`;
                    if (this.backModule.length) {
                        defaultRouter = this.backModule[0];
                    } else if (!visitedRoutes.length) {
                        defaultRouter = this.$store.state.route.resources?.href || '/';
                    }

                    if (_.isFunction(callback)) {
                        callback(defaultRouter);
                    } else {
                        this.$router.push(defaultRouter);
                    }
                });
            },
            handlerActionClickInTop(btnInfo = {}, rowData = {}) {
                const btnName = btnInfo.name;
                switch (btnName) {
                    case `${this.classNameKey}_CREATE`:
                        this.handlerClickUpdateBtn(rowData);
                        break;
                    case `${this.classNameKey}_DELETE`:
                        this.handlerClickDeleteBtn(rowData);
                        break;
                    default:
                        this.$emit('handler-title-top-btn', { btnInfo, rowData });
                        break;
                }
            },
            handlerClickUpdateBtn(rowData) {
                if (this.openType === 'blank') {
                    const queryParams = {
                        ...this.routeQueryParams,
                        formType: 'UPDATE',
                        containerOid: rowData.oid,
                        containerRef: rowData.containerRef
                    };
                    this.$router.push({
                        path: `/common-page/${this.className}/info`,
                        query: queryParams
                    });
                } else {
                    this.$emit('handler-click-form-edit-btn', rowData);
                }
            },
            handlerClickDeleteBtn() {
                // do nothing
            },
            /**
             *
             * @param {true|false} isNeedRefresh
             * 关闭弹窗是否需要刷新表格
             */
            // closeDialog(isNeedRefresh = true) {
            //     this.$emit('form-callback-close', isNeedRefresh);
            // },
            onHandlerSaveDraft() {
                let { handlerCREATE, handlerUPDATE } = this,
                    loadingType = 'saveDraftLoading';
                const isSaveDraft = true;
                this.confirmSave().then((res) => {
                    if (this.hooks.beforeSubmit) {
                        if (this.formShowType === 'edit') {
                            this.hooks.beforeSubmit({
                                formData: res,
                                next() {
                                    handlerUPDATE(loadingType, isSaveDraft, ...arguments);
                                },
                                isSaveDraft: isSaveDraft,
                                sourceData: this.sourceData,
                                vm: this.vm
                            });
                        } else {
                            this.hooks.beforeSubmit({
                                formData: res,
                                next() {
                                    handlerCREATE(loadingType, ...arguments);
                                },
                                isSaveDraft: isSaveDraft,
                                sourceData: this.sourceData,
                                vm: this.vm
                            });
                        }
                    } else {
                        res.isDraft = true;
                        this.formShowType === 'edit'
                            ? handlerUPDATE(loadingType, isSaveDraft, res)
                            : handlerCREATE(loadingType, res);
                    }
                });
            },
            onTitleBack() {
                if (_.isFunction(this.hooks?.goBack)) {
                    this.hooks.goBack({ formData: this.formData, goBack: this.goBack, vm: this.vm });
                } else {
                    this.goBack();
                }
            },
            getDefaultTitle() {
                switch (this.formShowType) {
                    case 'create':
                        return '创建';
                    case 'edit':
                        return '编辑';
                    case 'detail':
                        return '详情';
                }
            },
            handleFieldChange({ field }, value) {
                if (_.isFunction(this.hooks.onFieldChange)) {
                    this.formData = this.hooks.onFieldChange(
                        this.formData,
                        field,
                        value,
                        this.$refs?.detail?.[0].$refs.beforeForm
                    );
                }
            },
            handleFormDataLoaded(data) {
                data = FamKit.deepClone(data || {}) || {};
                this.$store.dispatch('commonPageStore/setBusinessObjectAction', data);
                this.objectSourceData = FamKit.deepClone(data || {}) || {};
                this.sourceData = FamKit.deepClone(data?.rawData || {}) || {};
                this.caption = data?.caption || '';
            }
        }
    };
});
