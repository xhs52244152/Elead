define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/copy-info/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('project-space/views/project-info/copy-info/style.css')
], function (ErdcKit, template, store, Utils, commonHttp) {
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
                    copySuccess: this.getI18nByKey('copySuccess'),
                    doSome: this.getI18nByKey('doSome'),
                    saveDraft: this.getI18nByKey('saveDraft'),
                    copyProject: this.getI18nByKey('copyProject'),
                    baseInfo: this.getI18nByKey('baseInfo'),
                    projectName: this.getI18nByKey('projectName'),
                    projectNumber: this.getI18nByKey('projectNumber'),
                    projectType: this.getI18nByKey('projectType'),
                    projectModule: this.getI18nByKey('projectModule'),
                    enterName: this.getI18nByKey('enterName'),
                    selectproject: this.getI18nByKey('selectproject'),
                    selectModule: this.getI18nByKey('selectModule'),
                    copy: this.getI18nByKey('copy'),
                    backList: this.getI18nByKey('backList'),
                    lookDetail: this.getI18nByKey('lookDetail'),
                    continueCreating: this.getI18nByKey('continueCreating'),
                    tip: this.getI18nByKey('tip'),
                    hoursTip: this.getI18nByKey('hoursTip'),
                    durationTip: this.getI18nByKey('durationTip'),
                    projectCopySuccess: this.getI18nByKey('projectCopySuccess'),
                    draft: this.getI18nByKey('draft'),
                    edit: this.getI18nByKey('edit'),
                    project: this.getI18nByKey('project')
                },
                moduleArr: ['计划', '团队', '文件夹'],
                checkedModule: ['计划', '团队', '文件夹'],
                checkedModuleParams: [],
                editableAttr: ['identifierNo', 'templateInfo.templateReference'],
                panelUnfold: true,
                className: store.state.classNameMapping.project,
                visible: false,
                openType: 'UPDATE',
                formData: { identifierNo: '—' },
                projectId: '',
                templateArr: [],
                detailFormData: {},
                id: null,
                fromRouteName: '',
                isSaving: false
            };
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        watch: {},
        computed: {
            formConfigs() {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.projectNumber,
                        labelLangKey: 'Project identifierNo',
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
                        labelLangKey: 'Project Type',
                        disabled: false,
                        required: false,
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
                        label: this.i18nMappingObj.projectName,
                        labelLangKey: 'Project Name',
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
                    },
                    {
                        field: 'templateInfo.templateReference',
                        component: 'custom-select',
                        label: this.i18nMappingObj.projectModule,
                        labelLangKey: 'Project Module',
                        disabled: true,
                        required: false,
                        validators: [],
                        readonly: true,
                        hidden: false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.selectModule,
                            placeholderLangKey: 'please select project module',
                            row: {
                                componentName: 'constant-select',
                                clearNoData: true,
                                viewProperty: 'displayName',
                                valueProperty: 'oid',
                                referenceList: this.templateArr
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: () => {
                                // 点击项目模板请求布局填充到详情信息里边
                            }
                        },
                        col: 12
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
                    'name': (data) => {
                        return data['name']?.displayName + this.i18nMappingObj.copy;
                    },
                    'identifierNo': async (data) => {
                        return await commonHttp.getCode(data['typeReference'].oid);
                    },
                    'lifecycleStatus.status': (data) => {
                        return data['lifecycleStatus.status']?.displayName;
                    },
                    // 'templateInfo.templateReference': (data) => {
                    //     return data['templateInfo.templateReference'].oid;
                    // },
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
            queryLayoutParams() {
                return {
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: this.openType
                        // }
                    ],
                    name: this.openType,
                    objectOid: this.$route.query.pid
                };
            },
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
                        // 'projectManager': ({ users }) => {
                        //     return users;
                        // },
                        // 'organizationRef': ({ users }) => {
                        //     return users;
                        // },
                        'productLineRef': (e, data) => {
                            return data['productLineRef']?.oid || '';
                        }
                    }
                });
                this.formData.identifierNo = await commonHttp.getCode(this.formData.typeReference);
                this.formData.name = this.formData.name + this.i18nMappingObj.copy;
                // this.formData['templateInfo.templateReference'] =
                //     'OR:erd.cloud.ppm.project.entity.Project:1780132033790963714';
                console.log(this.formData);
                // 获取模板
                this.projectModule(this.formData.typeReference);
            },
            // 基本信息数据(传入的组件)
            basicForm(noCheck) {
                return new Promise((resolve, reject) => {
                    // 获取基本信息数据
                    const { basicInfo } = this.$refs;
                    // basicInfo不存在代表没有自定义组件
                    if (!basicInfo) return reject([]);
                    let formData = basicInfo.serializeEditableAttr();
                    formData = formData.filter((item) => item.value !== '—');
                    // debugger;
                    if (noCheck) {
                        if (!this.formData.typeReference) {
                            this.$message({
                                message: '请选择项目类型',
                                type: 'info',
                                showClose: true
                            });
                            return;
                        } else {
                            resolve(formData);
                        }
                    } else {
                        basicInfo.submit().then(({ valid }) => {
                            if (valid) {
                                resolve(formData);
                            } else {
                                reject([]);
                            }
                        });
                    }
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
                attrRawList.some((el) => {
                    if (el.attrName === 'projectManager' && Array.isArray(el.value)) {
                        el.value = el.value[0].oid;
                    }
                    // if (el.attrName === 'organizationRef') {
                    //     el.value =
                    //         typeof this.formData.organizationRef !== 'string'
                    //             ? this.formData.organizationRef.oid
                    //             : this.formData.organizationRef;
                    // }
                });

                let obj = {
                    attrRawList,
                    className: this.className,
                    typeReference: this.formData.typeReference
                };
                return obj;
            },
            // 详细信息(生成的布局)
            detailForm(noCheck) {
                const { infoForm } = this.$refs;

                // 获取详细信息数据
                return new Promise((resolve, reject) => {
                    if (noCheck) {
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
            // noCheck： 存在代表保存草稿不需要表单校验(只对类型做校验，因为不同类型渲染不同布局)
            confirmSave(noCheck) {
                const result = Promise.all([this.basicForm(noCheck), this.detailForm(noCheck)]);
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
            handleCheckedModule(val, isSelect) {
                const arr = ['计划'];
                if (arr.includes(val) && isSelect) {
                    this.checkedModule.push('团队');
                }
            },
            // 项目模板接口
            projectModule(val) {
                this.$famHttp({
                    url: '/ppm/listByKey',
                    params: {
                        typeReference: val,
                        tmplTemplated: true,
                        className: 'erd.cloud.ppm.project.entity.Project'
                    }
                }).then((res) => {
                    if (res.code === '200') {
                        this.templateArr = res.data;
                    }
                });
            },
            saveDraft() {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.confirmSave('noCheck').then((res) => {
                    res.isDraft = true;
                    saveInfo(res, 'draft');
                });
            },
            // obj： 参数
            saveInfo(obj, draft) {
                if (this.isSaving) return;
                this.checkedModuleParams = [];
                let moduleObj = {
                    计划: ['erd.cloud.ppm.plan.entity.Task'],
                    团队: ['erd.cloud.foundation.core.team.entity.ContainerTeam'],
                    预算: [],
                    文件夹: ['erd.cloud.foundation.core.folder.entity.SubFolder']
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
                let objData = {};
                if (obj.length) {
                    obj[0].attrRawList.push(relationModule);
                    objData = obj[0];
                } else {
                    obj.attrRawList.push(relationModule);
                    objData = obj;
                }
                // 获取预估工时
                let predictDuration =
                    objData.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                if (predictDuration && Utils.checkHours(predictDuration, this.i18nMappingObj.hoursTip)) return;
                // 获取工期
                let duration = objData.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                if (duration && Utils.checkHours(duration, this.i18nMappingObj.durationTip)) return;
                this.isSaving = true;
                console.log(obj);
                this.$famHttp({
                    url: obj.isDraft ? '/ppm/create' : '/ppm/saveAs',
                    data: obj,
                    className: this.className,
                    method: 'post'
                })
                    .then((res) => {
                        if (res.code === '200') {
                            // this.visible = true;
                            this.$message({
                                message: this.i18nMappingObj.projectCopySuccess,
                                type: 'success',
                                showClose: true
                            });
                            this.id = res.data[0];
                            if (draft) {
                                this.$store.dispatch('route/delVisitedRoute', this.$route);
                                this.$router.push({
                                    path: '/container/project-space/edit',
                                    query: {
                                        pid: res.data,
                                        status: this.i18nMappingObj.draft,
                                        title: `${this.i18nMappingObj.edit} ${this.formData.name} ${this.i18nMappingObj.project}`
                                    }
                                });
                            } else {
                                this.handleCancel();
                            }
                        }
                    })
                    .catch(() => {})
                    .finally(() => {
                        this.isSaving = false;
                    });
            },
            handleConfirm() {
                if (this.isSaving) return;
                let { saveInfo } = this;
                this.confirmSave().then((res) => {
                    res.name = this.formData.name;
                    res.oid = this.$route.query.pid;

                    saveInfo([res]);
                });
            },
            handleCancel() {
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
                // this.$router.push({
                //     name: 'projectList'
                // });
                this.$store.dispatch('route/delVisitedRoute', this.$route).then((visitedRoutes) => {
                    if (visitedRoutes.length) {
                        // this.$router.push(this.$store.state.route.resources[0].href);
                        this.$router.push({
                            path: '/space/project-space/projectInfo',
                            query: {
                                pid: this.id || this.$route.query.pid,
                                title: `${this.i18nMappingObj.edit} ${this.formData.name} ${this.i18nMappingObj.project}`
                            }
                        });
                    } else {
                        // this.$router.push(visitedRoutes[0]);
                        this.$router.push({
                            path: '/project-list'
                        });
                    }
                });
            },
            handleClick(val) {
                let routeMapping = {
                    back: () => {
                        this.$router.push({
                            name: 'projectList'
                        });
                    },
                    look: () => {
                        this.$router.push({
                            name: 'projectInfo',
                            params: {
                                pid: this.id
                            }
                        });
                    }
                    // create: () => {
                    //     this.$router.push({
                    //         name: this.compConfig.contineCreateName
                    //     });
                    // }
                };

                routeMapping[val] && routeMapping[val]();

                this.visible = false;
            }
        }
    };
});
