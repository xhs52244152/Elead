/*
组件使用则
 * components: {
*   CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/ppm_common_createform/index.js'))
* }

 <!-- 组件 -->
    <CommonForm
        @before-submit="beforeSubmit"
        :formSlotData="formData"
        :oid="oid"
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
        showDetailForm: false, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
        basicComponentName: 'commonBaseInfo',
        basicComponentUrl: 'project-space/views/project-info/components/create_basic_info/index.js',
        createUrl: '/ppm/create',
        backName: 'projectList', // 路由返回名称
        saveDraft: true // 是否显示保存草稿按钮
    }
    oid: 当前项目、计划、需求的id
    formSlotData： 如果有插槽

* @events beforeSubmit 此方法代码在表单提交前 <如果需要数据转换> 后再次进行提交 val：表单所有值  n回调方法   不需要数据转换则不需要写此方法
    beforeSubmit(val, n) {
        // val.attrRawList[0].value = '重新赋值进去';
        n(val);
    },


*/
define([
    'erdcloud.kit',
    'text!' + ELMP.resource('ppm-component/ppm-components/EditForm/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'erdc-kit',
    'css!' + ELMP.resource('ppm-component/ppm-components/EditForm/index.css')
], function (ErdcKit, template, store, famUtils) {
    return {
        template,
        props: {
            // 对象oid
            oid: String,
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
            },
            modelMapper: {
                type: Object,
                default() {
                    return {
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        }
                    };
                }
            },
            queryLayoutParams: {
                type: Object,
                default() {
                    return {
                        name: this.openType,
                        objectOid: this.$route.query.pid,
                        attrRawList: [
                            // {
                            //     attrName: 'layoutSelector',
                            //     value: this.openType
                            // }
                        ]
                    };
                }
            }
        },
        data() {
            return {
                scopedSlots: {},
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/EditForm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    saveDraft: this.getI18nByKey('saveDraft'),
                    close: this.getI18nByKey('close'),
                    createProject: this.getI18nByKey('createProject'),
                    updateSuccess: this.getI18nByKey('updateSuccess'),

                    backList: this.getI18nByKey('backList'),
                    lookDetail: this.getI18nByKey('lookDetail'),
                    continueCreating: this.getI18nByKey('continueCreating'),
                    tip: this.getI18nByKey('tip')
                },
                visible: false,
                className: this.$route.params.className,
                oldClassName: '',
                openType: '', // 布局名称
                formData: {
                    'lifecycleStatus.status': true
                },
                formDefaultData: {}
            };
        },
        created() {
            // this.compConfig = this.configParameter;
            this.className = this.configParameter.className;
            this.oldClassName = this.configParameter.className;
            // this.openType = this.compConfig?.layoutName || 'UPDATE';
        },
        async mounted() {
            _.each(this.$scopedSlots, (slot, slotName) => {
                this.$set(this.scopedSlots, slotName, slot);
            });
        },
        watch: {
            oid: {
                handler(val) {
                    // 查询表单信息
                    if (val) {
                        setTimeout(() => {
                            this.getFormData(val);
                        }, 1000);
                        this.openType = this.compConfig?.layoutName || 'UPDATE';
                    }
                },
                immediate: true
            }
        },
        computed: {
            // 基本信息组件参数
            basicProps() {
                return this.compConfig?.basicProps || {};
            },
            compConfig() {
                return this.configParameter;
            },
            // 当前基本信息组件名称
            currentComponent() {
                return this.configParameter?.basicComponent || '';
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
            }
        },
        methods: {
            fieldChange({ field, required }, oVal, nVal) {
                let _this = this;
                required && field === 'projectManager' && oVal && !nVal && (this.formData[field] = nVal);
                let data = {
                    field,
                    oid: _this.oid || store.state?.projectInfo?.oid,
                    formData: _this.formDefaultData,
                    nVal
                };
                _this.$emit('fieldsChange', data);
            },
            // 根据不同类型进行渲染不同布局
            handleProjectType(val) {
                this.openType = this.compConfig?.layoutName || 'UPDATE';
                this.className = val;
                // 显示详情布局
                this.showDetailForm = true;
                // 切换类型清除数据
                // let currentLifecycleStatus = JSON.parse(JSON.stringify(this.formData))['lifecycleStatus.status'];
                this.formData = {};
            },
            getFormData(val) {
                let { handleRenderData } = this;
                // 查询表单信息
                if (val) {
                    this.openType = this.configParameter?.layoutName;
                    this.fetchGetFormData(val).then((data) => {
                        // 处理数据回显, 如果数据需要处理的则去父组件外处理后在回调
                        if (this.$listeners['echo-data']) {
                            this.$emit('echo-data', data, handleRenderData);
                        } else {
                            this.handleRenderData(data, 1);
                        }
                    });
                }
            },
            // 接收基本信息传进来的详情布局数据进行填充
            getLayoutData(val) {
                this.formData = JSON.parse(JSON.stringify(val));
                if (this.oldClassName == 'erd.cloud.ppm.project.entity.Project') {
                    this.formData.projectManager = '';
                }
            },
            // 查询接口请求
            fetchGetFormData(oid) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: this.configParameter?.getDetailUrl,
                        method: 'get',
                        className: store.state.classNameMapping.project,
                        data: {
                            oid: oid
                        }
                    })
                        .then((resp) => {
                            if (resp.code === '200') {
                                resolve(resp.data?.rawData || {});
                            } else {
                                reject();
                            }
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            // 处理回显数据  n存在代表数据不需要单独处理
            handleRenderData(data, n) {
                if (n) {
                    this.formData = ErdcKit.deserializeAttr(data);
                } else {
                    this.formData = data;
                }

                if (this.className == 'erd.cloud.ppm.project.entity.Project') {
                    store.commit('setProjectInfo', this.formData);
                }

                this.$emit('ready', { ...data });
                // 将回显的部分数据传给基本信息

                this.$refs.basicInfo.formData = this.formData;
                if (this.className == 'erd.cloud.ppm.project.entity.Project') {
                    this.$refs.basicInfo?.projectModule(this.formData.typeReference);
                    this.$refs.basicInfo?.getType(this.formData.typeReference).then((res) => {
                        this.className = res;
                    });
                }
            },
            // check： 存在代表保存草稿需要表单校验
            confirmSave(check) {
                const result = Promise.all([this.basicForm(check), this.detailForm(check)]);
                return new Promise((resolve, reject) => {
                    result
                        .then((res) => {
                            let resoult = res[1];
                            if (res[0] && res[0].length) {
                                resoult.attrRawList = resoult.attrRawList.concat(res[0]);
                            }
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
                    if (!basicInfo) return reject([]);
                    basicInfo.submit(check).then((data) => {
                        if (data) {
                            resolve(data);
                        } else {
                            reject([]);
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
                    className: this.compConfig.className,
                    oid: this.oid || this.$route.query.pid
                };
                return obj;
            },
            // 详细信息(生成的布局)  check:false 不需要表单校验
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
            saveInfo(obj, tip) {
                this.$famHttp({
                    url: this.configParameter?.updateUrl,
                    data: obj,
                    className: store.state.classNameMapping.project,
                    method: 'post'
                }).then((res) => {
                    if (res.code === '200') {
                        // this.visible = true;
                        this.$message({
                            message: tip || '成功',
                            type: 'success',
                            showClose: true
                        });
                        // 编辑成功后抛出方法进行页面跳转
                        let goBack = this.compConfig?.goBack;
                        if (goBack && typeof goBack === 'function') {
                            this.compConfig?.goBack();
                        } else {
                            this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                                if (!visitedRoutes.length) {
                                    this.$router.push(this.$store.state.route.resources[0].href);
                                } else {
                                    if (this.backModule.length) {
                                        this.$router.push(this.backModule[0]);
                                    } else {
                                        this.$router.push(visitedRoutes[0]);
                                    }
                                }
                            });
                        }
                        this.$emit('after-submit', res);
                    }
                });
            },
            // 保存草稿
            saveDraft() {
                famUtils.debounceFn(() => {
                    let { saveInfo } = this;
                    this.confirmSave(false).then((res) => {
                        if (this.$listeners['before-submit']) {
                            this.$emit('before-submit', res, saveInfo, 'draft');
                        } else {
                            res.isDraft = true;
                            saveInfo(res, 'draft');
                        }
                    });
                }, 500);
            },
            confirm() {
                famUtils.debounceFn(() => {
                    let check = true;
                    // 如果状态是草稿则不需要进行表单校验(这里暂时草稿是不返回值的，因为后端那边还没配草稿这个生命周期，所以前端暂时判断为空就是草稿)
                    // if (!this.formData.lifecycleStatus.status) {
                    //     check = true; // 不校验表单
                    // }
                    let { saveInfo } = this;
                    this.confirmSave(check).then((res) => {
                        if (this.$listeners['before-submit']) {
                            this.$emit('before-submit', res, saveInfo);
                        } else {
                            saveInfo(res);
                        }
                    });
                }, 500);
            },
            cancel() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    // if (!visitedRoutes.length) {
                    //     this.$router.push(this.$store.state.route.resources[0].href);
                    // } else {
                    //     if (this.backModule.length) {
                    //         this.$router.push(this.backModule[0]);
                    //     } else {
                    //         this.$router.push(visitedRoutes[0]);
                    //     }
                    // }
                    if (this.$listeners['cancel']) {
                        this.$emit('cancel');
                    } else {
                        this.$router.push({
                            path: 'biz-template/template/objectTemplate',
                            query: {
                                typeName: 'erd.cloud.ppm.project.entity.Project'
                            }
                        });
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
                        this.$router.back();
                    },
                    look: () => {
                        this.$store.dispatch('route/delVisitedRoute', this.$route);
                        this.$router.push({
                            name: this.compConfig.lookDetailName,
                            params: {
                                pid: this.oid
                            }
                        });
                    },
                    edit: () => {}
                };
                routeMapping[val] && routeMapping[val]();
                this.visible = false;
            }
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        }
    };
});
