define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-space/views/project-info/components/CreateBasicInfo/index.html'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.store'
], function (ErdcKit, template, commonHttp, store, ErdcStore) {
    let commonBaseInfo = {
        name: 'common_base_info',
        template: template,
        props: {
            // 是否需要展示编码
            showNumber: {
                type: Boolean,
                default: true
            },
            // 是否需要展示分类
            showClassify: {
                type: Boolean,
                default: false
            },
            // 是否需要展示模板
            showTemplate: {
                type: Boolean,
                default: true
            },
            // 渲染布局表单方法
            renderLayoutForm: Function,
            setFormData: Function
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
                formData: { name: '', identifierNo: '—' },
                readonly: false,
                templateArr: [],
                editableAttr: ['identifierNo']
            };
        },
        computed: {
            formConfigs() {
                let { showNumber, showClassify, showTemplate } = this;
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.showTemplate
                            ? this.i18nMappingObj.projectNumber
                            : this.i18nMappingObj.projectTemplateNumber,
                        disabled: false,
                        required: false,
                        validators: [],
                        hidden: !showNumber,
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
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.selectproject,
                            placeholderLangKey: 'pleaseSelect',
                            defaultSelectFirst: true,
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
                                this.formData.typeReference = data.selected.typeOid;
                                this.$emit('projectType', data.selected.typeName, data.selected.typeOid);
                                this.formData.templateInfo['templateReference'] = '';
                                this.templateArr = [];
                                this.setTypeValue(data.selected);
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
                        field: 'classify',
                        component: 'custom-select',
                        label: this.i18nMappingObj.projectType,
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: !showClassify,
                        props: {
                            clearable: true,
                            placeholder: '请选择项目分类',
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                clearNoData: true,
                                viewProperty: 'name', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: [
                                    {
                                        name: '瀑布型',
                                        value: '1'
                                    },
                                    {
                                        name: '敏捷型',
                                        value: '2'
                                    }
                                ]
                                // requestConfig: {
                                //     url: '/fam/dictionary/tree/projectType',
                                //     viewProperty: 'displayName',
                                //     valueProperty: 'value'
                                // }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: () => {
                                // this.formData.projectType = data.selected.value;
                            }
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
                                    this.formData = {};
                                    this.formData.name = '';
                                    this.formData['templateInfo.templateReference'] = '';
                                    this.$emit('getLayoutData', {});
                                    _.isFunction(this.setFormData) && this.setFormData(this.formData);
                                }
                            }
                        },
                        col: 12
                    }
                ];
            }
        },
        created() {},
        methods: {
            // 项目模板接口
            projectModule(val) {
                this.$famHttp({
                    url: '/ppm/listByKey',
                    params: {
                        'typeReference': val,
                        'tmplTemplated': true,
                        'templateInfo.tmplEnabled': true,
                        'className': 'erd.cloud.ppm.project.entity.Project'
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
            // 获取项目模板对应的信息
            getModuleFormData(oid) {
                this.$famHttp({
                    url: '/ppm/attr',
                    method: 'get',
                    className: store.state.classNameMapping.project,
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
                                // 'projectManager': ({ users }) => {
                                //     return users;
                                // },
                                'productLineRef': (e, data) => {
                                    return data['productLineRef']?.oid || '';
                                },
                                'organizationRef': (e, data) => {
                                    return data['organizationRef']?.oid || '';
                                }
                            }
                        });

                        this.$emit('getLayoutData', resoultData);
                        if (!_.isEmpty(this.formData['name'])) {
                            resoultData.name = this.formData['name'];
                        }
                        // 模板创建时部门不是必填，所以这里创建项目使用模板赋值时要做下判断
                        // 参与者组件需要传入数据进去匹配才是显示对应值(只在创建布局才需要这么做)
                        if (data['organizationRef']?.oid) {
                            resoultData.organizationRef_defaultValue = {
                                oid: data['organizationRef'].oid,
                                displayName: data['organizationRef']?.displayName.split('/').pop() || '' // 截取展示最后一级部门，不需全部展示
                            };
                            resoultData.organizationRef = data['organizationRef'].oid;
                        } else {
                            resoultData.organizationRef = '';
                        }

                        // 模板创建时项目经理不是必填，所以这里创建项目使用模板赋值时要做下判断
                        if (data['projectManager']?.oid) {
                            resoultData.projectManager_defaultValue = {
                                oid: data['projectManager'].oid,
                                displayName: data['projectManager']?.displayName
                            };
                            resoultData.projectManager = data['projectManager'].oid;
                        } else {
                            resoultData.projectManager = '';
                        }

                        _.isFunction(this.setFormData) && this.setFormData(resoultData);
                    }
                });
            },
            submit(check) {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    let formData = form.serializeEditableAttr();
                    formData = formData.filter((item) => item.value !== '—');

                    if (!check) {
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
                                resolve(formData);
                            } else {
                                reject(false);
                            }
                        });
                    }
                });
            },
            // 清空表单数据
            emptyFormData() {
                this.formData = {};
            },
            async setTypeValue(data) {
                this.$set(this.formData, 'typeReference', data.typeOid);
                this.formData.identifierNo =
                    ErdcStore.state.route.resources.identifierNo === 'erdc-bizadmin-web'
                        ? await commonHttp.getCodeData('TemplateCode')
                        : await commonHttp.getCode(data.typeOid);
                if (data.typeOid) {
                    this.renderLayoutForm &&
                        _.isFunction(this.renderLayoutForm) &&
                        this.renderLayoutForm(data.typeName, data.typeOid);
                }
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
    return commonBaseInfo;
});
