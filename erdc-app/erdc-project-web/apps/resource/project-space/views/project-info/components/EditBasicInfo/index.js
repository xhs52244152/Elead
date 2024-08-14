define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('project-space/views/project-info/util/index.js')
], function (ErdcKit, template, store, util) {
    let commonBaseInfo = {
        name: 'common_base_info',
        template: template,
        props: {
            // 是否需要展示模板
            showTemplate: {
                type: Boolean,
                default: true
            },
            //  是否可编辑类型
            isEditProjectType: {
                type: Boolean,
                default: false
            },
            currentData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 渲染布局表单方法
            renderLayoutForm: Function,
            setFormData: Function,
            changeFormConfigs: Function
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    baseInfo: this.getI18nByKey('baseInfo'),
                    projectName: this.getI18nByKey('projectName'),
                    projectNumber: this.getI18nByKey('projectNumber'),
                    projectTemplateName: this.getI18nByKey('projectTemplateName'),
                    projectTemplateNumber: this.getI18nByKey('projectTemplateNumber'),
                    projectType: this.getI18nByKey('projectType'),
                    projectModule: this.getI18nByKey('projectModule'),
                    enterName: this.getI18nByKey('enterName'),
                    selectproject: this.getI18nByKey('selectproject'),
                    selectModule: this.getI18nByKey('selectModule')
                },
                panelUnfold: true,
                formData: { name: '' },
                readonly: false,
                templateArr: [],
                editableAttr: ['identifierNo']
            };
        },
        computed: {
            formConfigs() {
                let { showTemplate } = this;
                let formConfigs = [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.showTemplate
                            ? this.i18nMappingObj.projectNumber
                            : this.i18nMappingObj.projectTemplateNumber,
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
                        required: false,
                        readonly: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
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
                                    },
                                    appName: 'PPM'
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.formData.typeReference = data.selected.typeOid;
                                this.$emit('projectType', data.selected.typeName, data.selected.typeOid);
                                this.formData.templateInfo['templateReference'] = '';

                                this.templateArr = [];
                                this.projectModule(data.selected.typeOid);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: showTemplate ? this.i18nMappingObj.projectName : this.i18nMappingObj.projectTemplateName,
                        disabled: false,
                        required: true,
                        hidden: false,
                        props: {
                            maxlength: 64,
                            clearable: false,
                            placeholder: this.i18nMappingObj.enterName
                        },
                        col: 12
                    },
                    {
                        field: 'templateInfo.templateReference',
                        component: 'custom-select',
                        label: this.i18nMappingObj.projectModule,
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: !showTemplate,

                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.selectModule,
                            placeholderLangKey: 'pleaseSelect',
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
                            callback: (data) => {
                                // 点击项目模板请求布局填充到详情信息里边
                                if (data.value) {
                                    this.getModuleFormData(data.value);
                                } else {
                                    this.formData['templateInfo.templateReference'] = '';
                                    this.$emit('getLayoutData', {});
                                }
                            }
                        },
                        col: 12
                    }
                ];
                return _.isFunction(this.changeFormConfigs) ? this.changeFormConfigs(formConfigs) : formConfigs;
            }
        },
        watch: {
            currentData: {
                handler(newVal, oladVal) {
                    this.formData = newVal;
                    if (this.formData?.typeReference && this.formData?.typeReference != oladVal?.typeReference) {
                        this.projectModule(this.formData?.typeReference);
                    }
                },
                immediate: true
            }
        },
        created() {},
        methods: {
            // 获取项目模板对应的信息
            getModuleFormData(oid) {
                let className = oid.split(':')[1];
                this.$famHttp({
                    url: '/ppm/attr',
                    method: 'get',
                    className,
                    data: {
                        oid: oid
                    }
                }).then((resp) => {
                    if (resp.code === '200') {
                        let data = resp.data?.rawData || {};
                        let resoultData = ErdcKit.deserializeAttr(data, {
                            valueMap: {
                                'lifecycleStatus.status': (e, data) => {
                                    return data['lifecycleStatus.status']?.displayName || '草稿';
                                },
                                'templateInfo.templateReference': () => {
                                    return oid || '';
                                },
                                'projectManager': ({ users }) => {
                                    return users;
                                },
                                'typeReference': (e, data) => {
                                    return data['typeReference']?.oid || '';
                                },
                                'organizationRef': (e, data) => {
                                    return data['organizationRef']?.oid || '';
                                },
                                'productLineRef': (e, data) => {
                                    return data['productLineRef']?.oid || '';
                                },
                                'projectRef': (e) => {
                                    return e.displayName;
                                }
                            }
                        });

                        this.$emit('getLayoutData', resoultData);
                        if (!_.isEmpty(this.formData['name'])) {
                            resoultData.name = this.formData['name'];
                        }
                        _.isFunction(this.setFormData) && this.setFormData(resoultData);
                    }
                });
            },
            // 项目模板接口
            projectModule(val) {
                this.$famHttp({
                    url: '/ppm/listByKey',
                    params: {
                        typeReference: val,
                        tmplTemplated: true,
                        className: store.state.classNameMapping.project
                    }
                })
                    .then((res) => {
                        if (res.code === '200') {
                            this.templateArr = res.data;
                        }
                    })
                    .catch((err) => {
                        this.$message({
                            message: err?.data?.message,
                            type: 'error',
                            showClose: true
                        });
                    });
            },
            // 项目类型接口  val: 类型的id
            getType(val) {
                return new Promise((resolve) => {
                    util.getType(val).then((res) => {
                        resolve(res);
                    });
                });
            },
            submit(check) {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    if (!check) {
                        let formData = form.serializeEditableAttr();

                        if (!this.formData.typeReference || !this.formData.name) {
                            this.$message({
                                message: '请输入项目名称',
                                type: 'info',
                                showClose: true
                            });
                            return;
                        } else {
                            resolve(formData);
                        }
                    } else {
                        form.submit().then((valid) => {
                            if (valid) {
                                let formData = form.serializeEditableAttr();
                                resolve(formData);
                            } else {
                                reject(false);
                            }
                        });
                    }
                });
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
    return commonBaseInfo;
});
