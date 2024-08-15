define([
    'text!' + ELMP.resource('erdc-cbb-components/ImportAndExport/components/Import/index.html'),
    ELMP.resource('erdc-cbb-components/ImportAndExport/components/Notify/index.js')
], function (template, Notify) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'Import',
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            EmptyTemplate: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ImportAndExport/components/EmptyTemplate/index.js')
            )
        },
        props: {
            // 导入类型列表
            importTypeList: {
                type: Array,
                default() {
                    return [];
                }
            },
            containerRef: String,
            // 能否上传多个
            multiple: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ImportAndExport/locale/index.js'),
                loading: false,
                visible: false,
                formData: {}
            };
        },
        computed: {
            title() {
                return this.i18n?.[
                    _.isArray(this.importTypeList) && this.importTypeList.length > 1 ? '导入前提示1' : '导入前提示'
                ];
            },
            formConfigs() {
                return [
                    {
                        field: 'importType',
                        hidden: !(_.isArray(this.importTypeList) && this.importTypeList.length > 1),
                        label: this.i18n?.['导入类型'],
                        slots: {
                            component: 'importType'
                        },
                        col: 24
                    },
                    {
                        field: 'uploadFile',
                        label: this.i18n?.['上传文件'],
                        slots: {
                            component: 'uploadFile'
                        },
                        col: 12
                    },
                    {
                        field: 'emptyTemplate',
                        label: this.i18n?.['空模板下载'],
                        slots: {
                            component: 'emptyTemplate'
                        },
                        col: 12
                    }
                ];
            },
            // 当前选中
            importTypeInfo() {
                return _.find(this.importTypeList, { value: this.formData?.importType }) || {};
            },
            component() {
                const { business, value, label } = this.importTypeInfo || {};

                const template =
                    value === 'erd.cloud.pdm.part.entity.EtPartUsageLink' ? 'StructureTemplate' : 'EmptyTemplate';
                const url = `erdc-cbb-components/ImportAndExport/components/${template}/index.js`;

                return {
                    ref: 'templateRef',
                    is: ErdcKit.asyncComponent(ELMP.resource(url)),
                    props: {
                        containerRef: this.containerRef || '',
                        className: value || '',
                        displayName: `${label}空模板`,
                        // BOM 模板下载的编码className处理
                        numberClassName:
                            business?.export === 'BomViewExportTemp' ? 'erd.cloud.pdm.part.entity.EtPartBomView' : ''
                    }
                };
            }
        },
        watch: {
            'formData.importType': {
                deep: true,
                handler(value) {
                    // 判断是否自定义了模板
                    let importTypeInfo = _.find(this.importTypeList, { value }) || {};
                    if (_.isObject(importTypeInfo.templateData)) {
                        this.$set(this.formData, 'templateId', importTypeInfo.templateData.oid || '');
                    }
                }
            }
        },
        created() {
            // 默认选中导入类型
            if (_.isArray(this.importTypeList) && this.importTypeList.length) {
                const [importTypeInfo] = this.importTypeList;
                this.$set(this.formData, 'importType', importTypeInfo?.value);
            }
            this.getDefaultExportTemplate();
        },
        methods: {
            // 获取默认导出模板
            getDefaultExportTemplate() {
                this.$famHttp({
                    url: '/fam/export/template/listByBusinessName',
                    params: {
                        businessName: 'EmptyExportTemp',
                        addDefaultViewExport: false
                    }
                }).then((res) => {
                    const data = res?.data || [];
                    // 默认选中第一个类型
                    if (_.isArray(data) && data?.length) {
                        const [templateInfo] = data;
                        this.$set(this.formData, 'templateId', this.formData.templateId || templateInfo?.oid || '');
                    }
                });
            },
            // 点击空模板
            handlerEmptyTemplate() {
                // 导入类型下，一些空模板能自己配置，一些不需要配置弹窗
                const { business, value } = this.importTypeInfo || {};
                if (value && _.isObject(business) && business?.export) {
                    // 需要配置空模板
                    this.visible = true;
                } else if (_.isFunction(this.importTypeInfo.templateData)) {
                    this.importTypeInfo.templateData();
                } else {
                    // 不需要配置空模板，直接导出
                    this.$message.error('直接走导出逻辑，不需要弹窗');
                }
            },
            confirm() {
                const { getData, verify } = this.$refs?.templateRef || {};

                const valid = verify() || {};

                if (!valid.valid) {
                    return this.$message.error(valid?.message || '');
                }

                // 默认导出模板id
                if (_.isEmpty(this.formData?.templateId)) {
                    return this.$message.error(this.i18n?.['默认导出模板不能为空']);
                }

                if (_.isEmpty(this.formData?.importType)) {
                    return this.$message.error(this.i18n?.['请选择导入类型']);
                }

                const { business, value: className } = this.importTypeInfo || {};
                const businessName = _.isObject(business) ? business?.export : business || '';

                const data = getData() || {};

                data.templateId = this.formData?.templateId || '';
                data.businessName = businessName || '';
                data.className = className || '';

                this.loading = true;

                this.$famHttp({
                    url: '/fam/export',
                    className,
                    method: 'post',
                    data
                })
                    .then(() => {
                        this.visible = false;
                        Notify.onExportSuccess({
                            vm: this,
                            title: this.$t('导出成功', { name: this.i18n?.['空模板'] }),
                            goTo(vm, notify, defaultGoTo) {
                                vm.$emit('cancel');
                                defaultGoTo(vm, notify, { activeTabName: 'taskTabPanelExport' });
                            }
                        });
                    })
                    .catch(() => {
                        Notify.onExportError({
                            vm: this,
                            title: this.$t('导出失败', { name: this.i18n?.['空模板'] }),
                            goTo(vm, notify, defaultGoTo) {
                                vm.visible = false;
                                vm.$emit('cancel');
                                defaultGoTo(vm, notify, { activeTabName: 'taskTabPanelExport' });
                            }
                        });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 上传的文件，平台上传组件有bug，不能用v-model
            initUploadFile(scope, val) {
                const uploadFile = ErdcKit.deepClone(val) || [];
                this.$set(this.formData, scope.formConfig.field, uploadFile);
            },
            // 上传成功
            onSuccess() {
                this.$message.success(this.i18n?.['文件上传成功']);
            },
            // 获取数据
            getData() {
                const data = {};
                const fileId = this.formData?.uploadFile || [];
                data.fileId = _.map(fileId, (item) => item);
                data.importTypeInfo = ErdcKit.deepClone(this.importTypeInfo) || {};
                return ErdcKit.deepClone(data) || {};
            }
        }
    };
});
