define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-task/components/CreateBasicInfo/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js')
], function (ErdcKit, template, store, commonHttp) {
    let commonBaseInfo = {
        name: 'common_base_info',
        template: template,
        props: {
            // 渲染布局表单方法
            renderLayoutForm: Function,
            setFormData: Function
        },
        data() {
            return {
                panelUnfold: true,
                formData: {},
                readonly: false,
                i18nLocalePath: ELMP.resource('project-task/locale/index.js'),
                i18nMappingObj: {
                    basicInfo: this.getI18nByKey('basicInfo'),
                    code: this.getI18nByKey('code'),
                    type: this.getI18nByKey('type'),
                    pleaseSelectType: this.getI18nByKey('pleaseSelectType'),
                    name: this.getI18nByKey('name'),
                    pleaseEnterPlanName: this.getI18nByKey('pleaseEnterPlanName')
                },
                editableAttr: ['identifierNo', 'typeReference'],
                typeReferenceOpts: []
            };
        },
        computed: {
            className() {
                return store.state.classNameMapping.task;
            },
            containerRef() {
                return `OR:${store.state.projectInfo.containerRef.key}:${store.state.projectInfo.containerRef.id}`;
            },
            formConfigs() {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18nMappingObj.code,
                        disabled: false,
                        required: false,
                        validators: [],
                        // 只读
                        readonly: true,
                        props: {},
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18nMappingObj.type,
                        labelLangKey: 'component',
                        disabled: this.$route.query?.typeName === 'milestone' ? true : false, // typeName === 'milestone'代表是从里程碑模块跳转过来
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj.pleaseSelectType,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: this.className,
                                        containerRef: this.containerRef,
                                        subTypeEnum: 'LEAF_NODE',
                                        accessControl: false
                                    },
                                    transformResponse: [
                                        (data) => {
                                            const res = JSON.parse(data).data || [];
                                            this.typeReferenceOpts = res;
                                            let result = res?.[0] || {};
                                            // typeName === 'milestone' 代表是从里程碑模块跳转过来进行创建里程碑
                                            if (this.$route.query?.typeName === 'milestone') {
                                                result =
                                                    res.filter(
                                                        (item) =>
                                                            item.typeName === 'erd.cloud.ppm.plan.entity.milestone'
                                                    )[0] || {};
                                            }
                                            this.setTypeValue(result);
                                            return JSON.parse(data);
                                        }
                                    ]
                                }
                            }
                        },
                        // 数据变化时触发回调
                        listeners: {
                            callback: (data) => {
                                this.setTypeValue(data.selected);
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18nMappingObj.name,
                        disabled: false,
                        required: true,
                        validators: [],
                        // 只读
                        readonly: false,
                        props: {
                            maxlength: 64
                        },
                        col: 24
                    }
                ];
            }
        },
        created() { },
        methods: {
            submit(check) {
                const { form } = this.$refs;
                return new Promise((resolve, reject) => {
                    let formData = form.serializeEditableAttr();
                    formData = formData.filter((item) => item.value !== '—');

                    if (!check) {
                        if (!this.formData.name) {
                            this.$message({
                                message: this.i18nMappingObj.pleaseEnterPlanName,
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

                let identifierNo = store.state.projectInfo['templateInfo.tmplTemplated']
                    ? await commonHttp.getCodeData('TemplateCode')
                    : await commonHttp.getCode(data.typeOid);
                this.$set(this.formData, 'identifierNo', identifierNo);
                let projectRef = identifierNo + ',' + store.state.projectInfo.name;
                this.$set(this.formData, 'projectRef', projectRef);
                this.$emit('projectType', data?.typeName || '', data.typeOid);
                let collectRef = this.$route.query.currentPlanSet || this.$route.query.collectId;
                this.formData['collect-ref'] = collectRef;
                this.$set(this.formData, 'collectRef', collectRef);
                let parentRef = this.$route.query.planOid;
                this.formData['parent-ref'] = parentRef;
                let stageFlag = this.$route.query.stageFlag;
                this.formData['stageFlag'] = stageFlag ? true : false;

                await this.renderLayoutForm(data?.typeName, data.typeOid);
                await this.setFormData(this.formData);
            }
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        }
    };
    return commonBaseInfo;
});
