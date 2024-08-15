define([
    'text!' + ELMP.func('erdc-workspace/components/WorkspaceForm/index.html'),
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.func('erdc-workspace/api.js')
], function (template, viewConfig, Api) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'WorkspaceForm',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            containerOid: String,
            dialogTitle: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-workspace/locale/index.js'),
                loading: false,
                formData: {
                    name: '',
                    containerRef: '',
                    description: ''
                },
                visible: true,
                containerRefList: []
            };
        },
        computed: {
            formConfigs() {
                return [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18n.name,
                        disabled: false,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: this.i18n.pleaseEnterContent
                        },
                        col: 24
                    },
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: this.i18n.context,
                        labelLangKey: 'component',
                        disabled: false,
                        required: !this.containerOid,
                        validators: [],
                        hidden: false,
                        readonly: !!this.containerOid,
                        props: {
                            clearable: false,
                            filterable: true,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'oid',
                                clearNoData: true,
                                referenceList: this.containerRefList
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: this.i18n.description,
                        disabled: false,
                        required: false,
                        hidden: false,
                        props: {
                            type: 'textarea',
                            maxlength: 100,
                            showWordLimit: true,
                            clearable: true,
                            placeholder: this.i18n.pleaseEnterContent
                        },
                        col: 24
                    }
                ];
            }
        },
        created() {
            this.getOption();
        },
        methods: {
            getOption() {
                this.$famHttp({
                    url: Api.containerList,
                    params: {
                        className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
                    },
                    method: 'GET'
                }).then((resp) => {
                    this.containerRefList = resp.data;
                    // 非首页-产品数据 进入工作区
                    if (this.containerOid) {
                        let optionData =
                            this.containerRefList.find((item) => item.containerRef === this.containerOid) || {};
                        this.$set(this.formData, 'containerRef', optionData.oid || '');
                    }
                });
            },
            handleCreate() {
                this.loading = true;
                // 校验表单
                const { templateForm } = this.$refs;
                let formDataArr = templateForm.serializeEditableAttr();
                templateForm.validate((valid) => {
                    if (valid) {
                        let temp = {};
                        let pOid = '';
                        if (this.containerOid) {
                            formDataArr.push({
                                attrName: 'containerRef',
                                value: templateForm?.formData?.containerRef
                            });
                        }
                        let attrRawList = formDataArr.filter((item) => {
                            if (item.attrName === 'containerRef') {
                                let option = this.containerRefList.find((element) => element.oid === item.value);
                                // temp['typeReference'] = item.value.oid;
                                temp['containerRef'] = option.containerRef || '';
                                pOid = option.oid;
                            }
                            return (
                                !_.isUndefined(item.value) && !_.isNull(item.value) && item.attrName !== 'containerRef'
                            );
                        });
                        attrRawList.push({ attrName: 'productOid', value: pOid });
                        let params = {
                            attrRawList,
                            containerRef: temp.containerRef,
                            // typeReference:'',
                            className: viewConfig.workspaceViewTableMap.className,
                            appName: 'PDM' // 应后端要求，创建对象增加appName参数
                        };
                        this.$famHttp({ url: Api.createWorkspace, data: params, method: 'POST' })
                            .then((resp) => {
                                this.$emit('success', resp.data);
                                this.handleClose();
                            })
                            .finally(() => {
                                this.$nextTick(() => {
                                    this.loading = false;
                                });
                            });
                    } else {
                        this.$nextTick(() => {
                            this.loading = false;
                        });
                    }
                });
            },
            handleClose() {
                this.visible = false;
                this.$emit('close');
            }
        }
    };
});
