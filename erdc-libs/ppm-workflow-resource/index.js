/**
 * methods
 * @param {Function} openDetail 跳转详情
 * @param {Function} getData 获取表格数据
 * @param {Function} goBack 流程返回自定义方法
 * @param {Function} successCallback 流程发起成功后自定义返回方法
 *
 * props
 * @param {Boolean} showTable 是否显示表格
 * @param {String} title 标题
 * @param {String} actionName 发起流程要传的actionName
 * @param {Boolean} isGoBackPreviousPage 发起流程之后是否要跳转到上一页
 *
 * slots
 * @param beforeTable 表格之前的插槽
 * @param afterTable 表格之后的插槽
 * @param defaultContent 自定义内容插槽
 *
 * slotsProps
 * @param beforeTable 表格之前插槽传值
 * @param beforeTable 表格之后插槽传值
 * @param defaultContent 自定义插槽传值
 *
 * hooks
 * @param {Function} beforeSubmit 在提交流程或者保存草稿时触发的方法（如果仅仅使用表格，推荐使用这个）
 * @param {Function} assemblyInfo 在提交流程或者保存草稿时触发的方法（如果使用了插槽，推荐使用这个）
 * @param {Function} beforeSubmitFinalData 提交完流程或者保存完草稿之后触发的方法
 * @param {Function} beforeDestroy 流程页面销毁之前触发的方法
 * @param {Function} beforeSubmitValidate 提交流程是否要校验通过
 *
 * */

define([
    'text!' + ELMP.resource('ppm-workflow-resource/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    'EventBus'
], function (template, utils, EventBus) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        provide() {
            return {
                draftInfos: this.draftInfos,
                processInfos: () => this.processInfos,
                taskInfos: () => this.taskInfos
            };
        },
        props: {
            // 发起完流程之后会把传过去的数据存放到当前对象里
            customFormData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 当前流程节点信息
            processInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 保存草稿数据
            draftInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 区分是发起流程节点还是其他节点
            processStep: String,
            taskInfos: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                panelUnfold: true,
                i18nLocalePath: ELMP.resource('ppm-workflow-resource/locale/index.js'),
                i18nMappingObj: {
                    code: this.getI18nByKey('code'),
                    name: this.getI18nByKey('name'),
                    state: this.getI18nByKey('state'),
                    businessObject: this.getI18nByKey('businessObject'),
                    conclution: this.getI18nByKey('conclution')
                },
                isActivatedChange: false,
                componentKey: new Date().getTime().toString(),
                processKey: '',
                businessData: [],
                backRouteKey: ''
            };
        },
        watch: {
            oid: {
                handler(val) {
                    if (val) {
                        this.isActivatedChange = true;
                    }
                },
                immediate: true
            }
        },
        computed: {
            // 用于区分流程的审批对象是否改变，如果改变就要重新加载页面
            oid() {
                return (
                    this.businessData
                        .map((item) => {
                            return item[this.businessKey] || '';
                        })
                        .join(',') || ''
                );
            },
            businessKey() {
                return this.businessConfigProps.businessKey || 'oid';
            },
            businessConfig() {
                return this.$store.getters.getBusinessConfig(this.processKey);
            },
            isActivatedReloadData() {
                return this.businessConfigProps.isActivatedReloadData ?? true;
            },
            businessConfigMethods() {
                return this.businessConfig?.methods || {};
            },
            businessConfigProps() {
                return this.businessConfig?.props || {};
            },
            hooks() {
                return this.businessConfig?.hooks || {};
            },
            title() {
                return this.businessConfigProps?.title || this.i18nMappingObj.businessObject;
            },
            isGoBackPreviousPage() {
                return this.businessConfigProps.isGoBackPreviousPage ?? true;
            },
            actionName() {
                return this.businessConfigProps?.actionName || 'PPM_Process_Initiation_Verification';
            },
            tableColumns() {
                return (
                    this.businessConfigProps?.tableColumns || [
                        {
                            prop: 'identifierNo',
                            title: this.i18nMappingObj.code
                        },
                        {
                            prop: 'name',
                            title: this.i18nMappingObj.name
                        },
                        {
                            prop: 'lifecycleStatus.status',
                            title: this.i18nMappingObj.state
                        }
                    ]
                );
            },
            showTable() {
                return this.businessConfigProps.showTable ?? true;
            },
            slotsProps() {
                let { slotsProps } = this.businessConfigProps || {};
                _.keys(slotsProps).forEach((key) => {
                    _.isFunction(slotsProps[key]) && this.$set(slotsProps, key, slotsProps[key](this));
                });
                return slotsProps || {};
            },
            slots() {
                return this.businessConfigProps?.slots || {};
            }
        },
        created() {
            let processDefinitionKey = this.processInfos['processDefinitionKey'] || this.processInfos['key'];
            this.processKey = this.$route.params.engineModelKey || processDefinitionKey;
            this.init(true);
            this.setBeforeSubmit();
        },
        activated() {
            if (this.isActivatedChange) {
                this.clearProcessBasicInfo();
                this.isActivatedChange = false;
                // 只有oid改变才重新加载流程数据
                this.init(this.isActivatedReloadData);
            }
            this.setBeforeSubmit();
        },
        methods: {
            init(isActivatedReloadData) {
                // 发起流程页面同个流程只能打开一个流程页面，同个流程审批有多个，所以用taskOId去做区分
                this.backRouteKey = `${this.processKey}:${this.processStep === 'activator' ? this.$route.query.taskOId : this.processStep}:backRoute`;
                const { getData } = this.businessConfigMethods;
                // 是否在activated里重新获取businessData
                if (isActivatedReloadData) this.businessData = _.isFunction(getData) ? getData(this) : [];
                this.registerWorkflowStoreConfig();
            },
            registerWorkflowStoreConfig() {
                const { goBack, successCallback } = this.businessConfigMethods;
                let backRoute = localStorage.getItem(this.backRouteKey) || '{}';
                backRoute = JSON.parse(backRoute);
                const visitedRoutes = this.$store.getters['route/visitedRoutes'];
                const hasBackRoute = visitedRoutes.find((item) => {
                    let query = {};
                    let backRouteQuery = backRoute?.query || {};
                    Object.keys(backRouteQuery).forEach((key) => {
                        query[key] = item.query[key] || '';
                    });
                    return JSON.stringify(query) === JSON.stringify(backRouteQuery) && item.path === backRoute.path;
                });
                // 有backRoute就是从PPM页面跳转过来的，要使用自定以跳转。如果不存在就是从工作流跳转到流程页面，使用工作流跳转
                if (Object.keys(backRoute).length && hasBackRoute) {
                    // 自定义返回逻辑
                    this.$store.dispatch('bpmProcessPanel/setCallback', {
                        type: 'goBack',
                        key: this.processStep,
                        func: _.isFunction(goBack)
                            ? goBack
                            : () => {
                                  this.$router.push(backRoute);
                              }
                    });
                    if (this.isGoBackPreviousPage) {
                        const func = () => {
                            this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                this.$router.push(backRoute);
                                EventBus.emit('PPMProcessSuccessCallback');
                            });
                        };
                        // 自定义提交完流程跳转逻辑
                        this.$store.dispatch('bpmProcessPanel/setCallback', {
                            type: 'successCallback',
                            key: this.processStep,
                            func: _.isFunction(successCallback) ? successCallback : func
                        });
                    }
                }
            },
            clearProcessBasicInfo() {
                let { processStep } = this;
                let eventObject = this?.$store?.getters?.['bpmProcessPanel/getEventObject'] || {};
                let callback = eventObject[this.processKey + '_' + processStep];
                _.isFunction(callback) && callback(clearProcessInfo);
                function clearProcessInfo(vm) {
                    if (processStep === 'launcher')
                        // 重置基本信息数据
                        vm.obtainProcessDetails();
                }
            },
            openDetail({ row }) {
                let openDetail = this.businessConfigMethods.openDetail;
                _.isFunction(openDetail) ? openDetail(row) : utils.openDetail(row);
            },
            // 启动流程时触发的方法
            validate() {
                const { beforeSubmitValidate } = this.hooks;
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async (resolve) => {
                    let result = await this.getData('submit');
                    let obj = {
                        data: result,
                        valid: true
                    };
                    if (_.isFunction(beforeSubmitValidate)) obj = beforeSubmitValidate(this, result);
                    resolve(obj);
                });
            },
            // 保存草稿时触发的方法
            async getData(type = 'draft') {
                const { beforeSubmit } = this.hooks;
                const { businessData } = this;
                let data = businessData;
                if (_.isFunction(beforeSubmit)) data = await beforeSubmit(this, type);
                return Promise.resolve(JSON.stringify({ formJson: data }));
            },
            setBeforeSubmit() {
                this.$store.dispatch('bpmProcessPanel/setBeforeSubmit', {
                    key: this.processStep,
                    func: this.assembleBaseFormData
                });
                const { setBeforeCreate } = this.hooks;
                if (_.isFunction(setBeforeCreate)) {
                    setBeforeCreate(this, this.businessData);
                }
            },
            assembleBaseFormData({ data }) {
                const { beforeSubmitFinalData } = this.hooks;
                return new Promise((resolve) => {
                    let originData = ErdcKit.deepClone(data);
                    // 只有启动流程要传actionName
                    if (this.processStep === 'launcher') {
                        data.baseForm.actionName = this.actionName;
                    }
                    let businessData = JSON.parse(JSON.stringify(this.businessData));
                    data.baseForm.businessForm.reviewItemList = businessData
                        // 过滤掉不存在业务对象oid的数据
                        .filter((item) => item.oid)
                        .map((item) => {
                            return { oid: item.oid };
                        });
                    data.baseForm.businessFormJsonStr = JSON.stringify(data?.baseForm?.businessForm || {});
                    if (_.isFunction(beforeSubmitFinalData)) {
                        beforeSubmitFinalData({ data, vm: this, resolve, originData });
                    } else {
                        resolve(data);
                    }
                });
            }
        },
        beforeDestroy() {
            // 清空缓存
            const { beforeDestroy } = this.hooks;
            if (_.isFunction(beforeDestroy)) {
                beforeDestroy();
            } else {
                localStorage.setItem(this.processKey + ':businessData', []);
                localStorage.setItem(this.backRouteKey, '{}');
                localStorage.setItem('reviewConfig', '{}');
                localStorage.setItem(this.processKey + ':setReviewInfo', '{}');
            }
        }
    };
});
