/*
组件使用则
 * components: {
*   CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/ppm_common_createform/index.js'))
* }

 <!-- 组件 -->
    <CommonForm
        @before-submit="beforeSubmit"
        :formSlotData="formData"
        :configParameter="configParameter"
    >
        <template v-slot:status="scope">
            <erd-input
                v-model="formData.status"
                autofocus
            />
        </template>
    </CommonForm>
参数说明：引入模块当组件则需要把一些初始值传入到子组件
    configParameter: {
        test: '插槽值',
        title: '创建项目',
        layoutName: 'testCreate',
        className: 'erd.cloud.ppm.project.entity.Project',
        basicComponentName: 'commonBaseInfo',
        basicComponentUrl: 'project-space/views/project-info/components/create_basic_info/index.js',
        createUrl: '/ppm/create',
        backName: 'projectList', // 路由返回名称
        saveDraft: true // 是否显示保存草稿按钮
    }

    formSlotData： 如果有插槽

* @events beforeSubmit 此方法代码在表单提交前 <如果需要数据转换> 后再次进行提交 val：表单所有值  n回调方法   不需要数据转换则不需要写此方法
    beforeSubmit(val, n) {
        // val.attrRawList[0].value = '重新赋值进去';
        n(val);
    },


*/

define([
    'erdcloud.kit',
    'text!' + ELMP.resource('ppm-component/ppm-components/CreateForm/index.html'),
    'erdc-kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/CreateForm/index.css')
], function (ErdcKit, template, famUtils, store) {
    return {
        template,
        props: {
            formSlotData: {
                type: Object,
                default: () => ({})
            },
            configParameter: {
                type: Object,
                default: () => ({})
            },
            // ref.serializeEditableAttr()这个方法获取表单数据时是不会吧属性为只读或者不可编辑或者隐藏的属性返回来，此时如果我们需要这些属性可以传进来即可。例: ['name','projectRef']
            editableAttr: {
                type: Array,
                default: () => []
            },
            schemaMapper: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                scopedSlots: {},
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/CreateForm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    saveDraft: this.getI18nByKey('saveDraft'),
                    close: this.getI18nByKey('close'),
                    createProject: this.getI18nByKey('createProject'),
                    createSuccess: this.getI18nByKey('createSuccess'),
                    doSome: this.getI18nByKey('doSome'),

                    backList: this.getI18nByKey('backList'),
                    setTeam: this.getI18nByKey('setTeam'),
                    createTask: this.getI18nByKey('createTask'),
                    tip: this.getI18nByKey('tip'),
                    draftCreateSuccess: this.getI18nByKey('draftCreateSuccess')
                },
                visible: false,
                className: ErdcKit.getParam('className'),
                oldClassName: ErdcKit.getParam('className'),
                openType: '',
                typeReference: '',
                formData: {},
                id: '', // 新增项目成功后返回的id
                oid: '', // 新增计划、需求等等成功后返回的id
                readonly: false,
                compConfig: {},
                isSaving: false
            };
        },
        created() {
            this.compConfig = this.configParameter;
            this.className = this.configParameter.className;
            this.oldClassName = this.configParameter.className;

            this.compConfig.showDetailForm = false;
            this.id = store.state.projectInfo.oid;
        },
        async mounted() {
            _.each(this.$scopedSlots, (slot, slotName) => {
                this.$set(this.scopedSlots, slotName, slot);
            });
        },
        computed: {
            // 当前基本信息组件名称
            currentComponent() {
                return this.compConfig?.basicComponent || '';
            },
            // 基本信息组件参数
            basicProps() {
                return this.compConfig?.basicProps || {};
            },
            formId() {
                return this.openType;
            },
            backModule() {
                let allVisitedRoutes = _.clone(this.$store.getters['route/visitedRoutes']);
                let backData = allVisitedRoutes.filter((item) => item.name === this.compConfig?.backName);
                if (backData.length) {
                    backData[0].params.activeName = this.$route?.params?.activeName || '';
                    // 存储当前列表计划集
                    this.$route?.params?.currentPlanSet
                        ? (backData[0].params.currentPlanSet = this.$route?.params?.currentPlanSet)
                        : '';
                }
                return backData;
            },
            queryLayoutParams() {
                return {
                    name: this.compConfig?.layoutName || this.openType,
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.configParameter?.layoutName || this.openType
                        // }
                    ]
                };
            }
        },
        methods: {
            fieldChange({ field, required }, oVal, nVal) {
                let _this = this;
                required && field === 'projectManager' && oVal && !nVal && (this.formData[field] = nVal);
                let obj = {
                    field,
                    oid: _this.oid || store.state?.projectInfo?.oid,
                    formData: _this.formData,
                    nVal
                };
                _this.$emit('fieldsChange', obj);
            },
            // 根据不同类型进行渲染不同布局
            handleProjectType(val, id) {
                // console.log(val, id);
                this.typeReference = id;
                this.className = val;
                this.openType = this.compConfig?.layoutName || 'CREATE';
                // 显示详情布局
                this.compConfig.showDetailForm = true;
                // 切换项目类型清除数据
                this.formData = {};
                this.getFormData();
            },
            /**
             * 收集表单数据，用于外部调用
             */
            getFormData() {
                let { handleRenderData } = this;
                if (this.$listeners['echo-data']) {
                    this.$emit('echo-data', this.formData, handleRenderData);
                }
            },
            handleRenderData(data) {
                this.formData = data;
            },
            // 接收基本信息传进来的详情布局数据进行填充
            getLayoutData(val) {
                this.formData = JSON.parse(JSON.stringify(val));
                if (this.oldClassName == 'erd.cloud.ppm.project.entity.Project') {
                    this.formData.projectManager = '';
                }
            },
            // check：false 存在代表保存草稿不需要表单校验
            confirmSave(check) {
                let that = this;
                const result = Promise.all([this.basicForm(check), this.detailForm(check)]);
                return new Promise((resolve, reject) => {
                    result
                        .then((res) => {
                            //res[0]基本信息数据 res[1]详情布局数据
                            // 处理方式： 将基本信息(res[0])数据合并到详情布局数据(res[1])的attrRawList
                            // res[1].attrRawList不存在代表详情布局没有渲染出来
                            let obj = {
                                attrRawList: [],
                                className: that.compConfig.className
                            };
                            let resoult = res[1].attrRawList ? res[1] : obj;

                            resoult.attrRawList = resoult.attrRawList.concat(res[0]);

                            resolve(resoult);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            // 基本信息数据(传入的组件)
            basicForm(check) {
                return new Promise((resolve, reject) => {
                    // 获取基本信息数据
                    const { basicInfo } = this.$refs;
                    // basicInfo不存在代表没有自定义组件
                    if (!basicInfo) return resolve([]);
                    basicInfo.submit(check).then((data) => {
                        if (data) {
                            resolve(data);
                        } else {
                            reject(false);
                        }
                    });
                });
            },
            // 详情布局数据
            detailDataTransform(formData) {
                // let formData = infoForm.serializeEditableAttr();
                // let formData = infoForm.serialize();

                let attrRawList = formData.filter((item) => item.attrName !== 'context');
                attrRawList = formData.filter((item) => item.attrName !== 'lifecycleStatus.status');
                // 如果有传入的插槽，进行值合并
                let formSlotData = {};
                if (this.formSlotData && Object.keys(this.formSlotData).length) {
                    for (let x in this.formSlotData) {
                        formSlotData.attrName = x;
                        formSlotData.value = this.formSlotData[x];
                    }
                    attrRawList = attrRawList.concat(formSlotData);
                }
                let obj = {
                    attrRawList,
                    className: this.oldClassName,
                    typeReference: this.typeReference
                };
                return obj;
            },
            // 详细信息(生成的布局)  check: 需要表单校验
            detailForm(check) {
                const { infoForm } = this.$refs;

                // 获取详细信息数据
                return new Promise((resolve, reject) => {
                    if (!check) {
                        if (infoForm) {
                            let formData = infoForm?.serializeEditableAttr();
                            let obj = this.detailDataTransform(formData);
                            resolve(obj);
                        } else {
                            resolve([]);
                        }
                    } else {
                        infoForm
                            .submit()
                            .then(({ valid }) => {
                                let formData = infoForm?.serializeEditableAttr();
                                let obj = this.detailDataTransform(formData);
                                if (valid) {
                                    resolve(obj);
                                } else {
                                    reject(false);
                                }
                            })
                            .catch(() => {});
                    }
                });
            },
            // isDraft: 保存草稿
            saveInfo(obj, isDraft, tip) {
                if (this.isSaving) return;

                this.isSaving = true;
                this.$famHttp({
                    url: this.compConfig?.createUrl,
                    data: obj,
                    method: 'post'
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.$message({
                                message: tip || '成功',
                                type: 'success',
                                showClose: true
                            });

                            if (
                                obj.className === store.state.classNameMapping.project &&
                                this.compConfig.layoutName === 'CREATE' &&
                                !isDraft
                            ) {
                                this.id = res.data;
                                this.visible = true;
                            } else {
                                this.oid = res.data;
                                let goBack = this.compConfig?.goBack;
                                if (goBack && typeof goBack === 'function') {
                                    this.$store.dispatch('route/delVisitedRoute', this.$route);
                                    this.compConfig?.goBack(res);
                                } else {
                                    this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                                        if (!visitedRoutes.length) {
                                            this.$router.push(this.$store.state.route.resources[0].href);
                                        } else {
                                            // this.$router.push(visitedRoutes[0]);
                                            if (this.backModule.length) {
                                                this.$router.push(this.backModule[0]);
                                            } else {
                                                this.$router.push(visitedRoutes[0]);
                                            }
                                            // this.$router.push({
                                            //     name: this.compConfig?.backName
                                            // });
                                        }
                                    });
                                }
                                // 保存成功后抛出方法进行页面跳转
                                this.$emit('after-submit', res);
                            }
                        }
                    })
                    .catch(() => {})
                    .finally(() => {
                        this.isSaving = false;
                    });
            },
            // 保存草稿
            saveDraft() {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.confirmSave(false).then((res) => {
                    if (this.$listeners['before-submit']) {
                        this.$emit('before-submit', res, saveInfo, 'draft');
                    } else {
                        res.isDraft = true;
                        saveInfo(res, 'draft');
                    }
                });
            },
            confirm() {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.confirmSave(true).then((res) => {
                    if (this.$listeners['before-submit']) {
                        this.$emit('before-submit', res, saveInfo);
                    } else {
                        saveInfo(res);
                    }
                });
            },
            cancel() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    if (!visitedRoutes.length) {
                        this.$router.push(this.$store.state.route.resources[0].href);
                    } else {
                        if (this.backModule.length) {
                            this.$router.push(this.backModule[0]);
                        } else {
                            if (this.compConfig?.cancel) {
                                this.$router.push({
                                    name: this.compConfig?.cancel
                                });
                            } else {
                                this.$router.go(-1);
                            }
                        }
                    }
                });
                // if (this.$listeners['after-submit']) {
                //     this.$emit('after-submit');
                // } else {
                //     this.$router.push({
                //         name: this.compConfig?.backName
                //     });
                // }
            },
            handleClick(val) {
                let routeMapping = {
                    back: () => {
                        this.$store.dispatch('route/delVisitedRoute', this.$route);
                        this.$router.push({
                            name: 'projectList'
                        });
                        this.visible = false;
                    },
                    setTeam: () => {
                        this.$store.dispatch('route/delVisitedRoute', this.$route);
                        store.dispatch('fetchProjectInfo', { id: this.id });
                        setTimeout(() => {
                            this.$router.push({
                                name: 'templateTeamManagement',
                                params: {
                                    pid: this.id,
                                    planOid: this.oid
                                }
                            });
                        }, 500);
                    },
                    createTask: () => {
                        this.$store.dispatch('route/delVisitedRoute', this.$route);
                        store.dispatch('fetchProjectInfo', { id: this.id });
                        setTimeout(() => {
                            this.$router.push({
                                name: 'planCreate',
                                params: {
                                    pid: this.id,
                                    where: 'create_project'
                                }
                            });
                        }, 500);

                        this.visible = false;
                    }
                };

                if (val === 'create') {
                    // 清空布局信息数据
                    this.formData = {};

                    // 清空基本信息数据
                    this.$refs.basicInfo?.emptyFormData();

                    this.compConfig.showDetailForm = false;
                } else {
                    routeMapping[val] && routeMapping[val]();
                }
            }
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        }
    };
});
