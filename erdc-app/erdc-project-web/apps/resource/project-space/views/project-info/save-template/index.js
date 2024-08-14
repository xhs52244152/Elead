define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/save-template/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdc-kit',
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('project-space/views/project-info/save-template/style.css')
], function (ErdcKit, template, store, Utils, famUtils, commonHttp) {
    return {
        template,
        props: {
            // 是否为编辑
            isEdit: Boolean
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    close: this.getI18nByKey('close'),
                    success: this.getI18nByKey('success'),
                    doSome: this.getI18nByKey('doSome'),
                    saveTemplate: this.getI18nByKey('saveTemplate'),
                    baseInfo: this.getI18nByKey('baseInfo'),
                    projectTemplateName: this.getI18nByKey('projectTemplateName'),
                    projectTemplateNumber: this.getI18nByKey('projectTemplateNumber'),
                    projectType: this.getI18nByKey('projectType'),
                    projectModule: this.getI18nByKey('projectModule'),
                    enterName: this.getI18nByKey('enterName'),
                    selectproject: this.getI18nByKey('selectproject'),
                    selectModule: this.getI18nByKey('selectModule'),
                    backList: this.getI18nByKey('backList'),
                    lookDetail: this.getI18nByKey('lookDetail'),
                    continueCreating: this.getI18nByKey('continueCreating'),
                    tip: this.getI18nByKey('tip'),
                    hoursTip: this.getI18nByKey('hoursTip'),
                    plan: this.getI18nByKey('plan'),
                    team: this.getI18nByKey('team'),
                    document: this.getI18nByKey('document'),
                    delivery: this.getI18nByKey('delivery'),
                    durationTip: this.getI18nByKey('durationTip'),
                    saveTemplateSuccess: this.getI18nByKey('saveTemplateSuccess')
                },
                checkedModule: ['plan'],
                checkedModuleParams: [],
                editableAttr: ['identifierNo', 'templateInfo.templateReference'],
                panelUnfold: true,
                className: store.state.classNameMapping.project,
                visible: false,
                openType: 'UPDATE',
                formData: { identifierNo: '—' },
                projectId: '',
                id: null,
                detailFormData: {},
                fromRouteName: ''
            };
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        watch: {
            // 模块勾选联动：勾选交付物一定要勾选计划，反之不限制
            checkedModule(val, oldVal) {
                if (!val.includes('plan') && oldVal.includes('plan')) {
                    if (val.includes('delivery')) {
                        const deliveryIndex = val.findIndex((item) => item === 'delivery');
                        this.checkedModule.splice(deliveryIndex, 1);
                    }
                }
                if (val.includes('delivery')) {
                    if (!val.includes('plan')) {
                        this.checkedModule.push('plan');
                    }
                }
            }
        },
        computed: {
            moduleArr() {
                return [
                    {
                        label: this.i18nMappingObj.team,
                        value: 'team'
                    },
                    {
                        label: this.i18nMappingObj.plan,
                        value: 'plan'
                    },
                    {
                        label: this.i18nMappingObj.delivery,
                        value: 'delivery'
                    },
                    {
                        label: this.i18nMappingObj.document,
                        value: 'document'
                    }
                ];
            },
            formConfigs() {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.projectTemplateNumber,
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: false,
                        // 只读
                        readonly: true,
                        props: {},
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18nMappingObj.projectType,
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        readonly: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.selectproject,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                // viewProperty: 'name', // 显示的label的key
                                // valueProperty: 'value', // 显示value的key
                                // referenceList: [
                                //     {
                                //         name: '中',
                                //         value: '50'
                                //     }
                                // ]
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: 'erd.cloud.ppm.project.entity.Project',
                                        containerRef: 'OR:erd.cloud.foundation.core.container.entity.OrgContainer',
                                        subTypeEnum: 'LEAF_NODE',
                                        accessControl: false
                                    }
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.formData.typeReference = data.selected.value;
                            }
                        },
                        col: 12
                    },

                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.projectTemplateName,
                        labelLangKey: 'Project identifierNo',
                        disabled: false,
                        required: true,
                        validators: [],
                        readonly: false,
                        props: {
                            maxlength: 64,
                            clearable: false,
                            placeholder: this.i18nMappingObj.enterName
                        },
                        col: 24
                    }
                ];
            },
            formId() {
                return this.openType;
            },
            oid() {
                return this.$route.query.pid;
            },
            schemaMapper() {
                return {
                    // 模块插槽
                    copyRelationModule: function (schema) {
                        schema.hidden = false;
                    }
                };
            },
            modelMapper() {
                return {
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    'typeReference': (data) => {
                        return data['typeReference']?.oid || '';
                    }
                };
            }
        },
        created() {
            if (this.$route.query.pid) {
                const id = this.$route.query.pid;
                this.fetchGetFormData(id).then((data) => {
                    // 处理数据回显
                    this.handleRenderData(data);
                });
            }
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined
            next((vm) => {
                vm.fromRouteName = vm.fromRouteName || from.name;
            });
        },
        methods: {
            fieldChange({ field }, nVal) {
                let params = {
                    field,
                    oid: '',
                    formData: this.detailFormData,
                    nVal
                };
                params.changeFields = ['timeInfo.scheduledStartTime', 'timeInfo.scheduledEndTime', 'duration'];
                params.fieldMapping = {
                    scheduledStartTime: 'timeInfo.scheduledStartTime',
                    scheduledEndTime: 'timeInfo.scheduledEndTime',
                    duration: 'duration'
                };
                Utils.fieldsChange(params);
                return this.detailFormData;
            },
            queryLayoutParams() {
                return {
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: 'TEMPLATE_UPDATE'
                        // }
                    ],
                    name: 'TEMPLATE_UPDATE',
                    objectOid: this.$route.query.pid
                };
            },
            /**
             * 收集表单数据，用于外部调用
             */
            getFormData() {
                return {};
            },
            // 查询接口请求
            fetchGetFormData(oid) {
                return new Promise((resolve, reject) => {
                    let className = oid.split(':')[1];
                    this.$famHttp({
                        url: '/ppm/attr',
                        method: 'get',
                        className,
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
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            // 处理回显数据
            async handleRenderData(data) {
                this.formData = ErdcKit.deserializeAttr(data, {
                    valueMap: {
                        'lifecycleStatus.status': (e, data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (e, data) => {
                            return data['templateInfo.templateReference'].oid;
                        },
                        'typeReference': (e, data) => {
                            return data['typeReference']?.oid || '';
                        },
                        'productLineRef': (e, data) => {
                            return data['productLineRef']?.oid || '';
                        }
                        // 'projectManager': ({ users }) => {
                        //     return users;
                        // }
                    }
                });
                this.formData.identifierNo = await commonHttp.getCodeData('TemplateCode');
            },
            // 基本信息数据(传入的组件)
            basicForm() {
                return new Promise((resolve, reject) => {
                    // 获取基本信息数据
                    const { basicInfo } = this.$refs;
                    // basicInfo不存在代表没有自定义组件
                    if (!basicInfo) return reject([]);
                    let formData = basicInfo.serializeEditableAttr();
                    formData = formData.filter((item) => item.value !== '—');
                    basicInfo.submit().then(({ valid }) => {
                        if (valid) {
                            resolve(formData);
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
                    attrRawList
                };
                return obj;
            },
            // 详细信息(生成的布局)
            detailForm() {
                const { infoForm } = this.$refs;

                // 获取详细信息数据
                return new Promise((resolve, reject) => {
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
                });
            },
            confirmSave() {
                const result = Promise.all([this.basicForm(), this.detailForm()]);
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
            handleCheckedModule() {},

            // obj： 参数
            saveInfo(obj) {
                // 获取预估工时
                let predictDuration = obj.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                if (predictDuration && Utils.checkHours(predictDuration, this.i18nMappingObj.hoursTip)) return;
                // 获取工期
                let duration = obj.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                if (duration && Utils.checkHours(duration, this.i18nMappingObj.durationTip)) return;

                this.checkedModuleParams = [];
                let moduleObj = {
                    plan: ['erd.cloud.ppm.plan.entity.Task'],
                    team: ['erd.cloud.foundation.core.team.entity.ContainerTeam'],
                    budget: [],
                    document: ['erd.cloud.foundation.core.folder.entity.SubFolder'],
                    delivery: ['erd.cloud.ppm.common.entity.Delivery']
                };

                for (let i = 0; i < this.checkedModule.length; i++) {
                    let t = this.checkedModule[i];
                    this.checkedModuleParams.push(moduleObj[t]);
                }
                this.checkedModuleParams = this.checkedModuleParams.flat();
                let relationModule = {
                    attrName: 'copyRelationModule',
                    value: this.checkedModuleParams
                };
                obj.attrRawList.push(relationModule);
                obj.typeReference = store.state.projectInfo.typeReference;
                obj.className = store.state.classNameMapping.project;
                this.$loading();
                this.$famHttp({
                    url: `/ppm/templ/copy/${this.$route.query.pid}`,
                    data: obj,
                    method: 'post',
                    className: obj.className || store.state.classNameMapping.project
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.$loading().close();
                            this.$message({
                                message: this.i18nMappingObj.saveTemplateSuccess,
                                type: 'success',
                                showClose: true
                            });
                            this.$store.dispatch('route/delVisitedRoute', this.$route);
                            setTimeout(() => {
                                this.$router.push({
                                    path: '/project-list'
                                });

                                const appName = 'erdc-bizadmin-web';
                                const targetPath = '/biz-template/template/objectTemplate';
                                let query = {
                                    typeName: 'erd.cloud.ppm.project.entity.Project'
                                };
                                // path组装query参数
                                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                                window.open(url, appName);
                            }, 800);
                        }
                    })
                    .catch(() => {
                        this.$loading().close();
                    });
            },

            handleConfirm() {
                famUtils.debounceFn(() => {
                    let { saveInfo } = this;
                    this.confirmSave().then((res) => {
                        saveInfo(res);
                    });
                }, 500);
            },
            handleCancel() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    if (!visitedRoutes.length) {
                        this.$router.push(this.$store.state.route.resources[0].href);
                    } else {
                        this.$router.go(-1);
                    }
                });
            }
        }
    };
});
