define([
    'erdcloud.kit',
    'text!' + ELMP.resource('knowledge-library-list/components/FolderDialog/index.html')
], function (ErdcKit, template) {
    return {
        template,
        components: {
            BasicInfo: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/BasicInfo/index.js')),
            CommonForm: ErdcKit.asyncComponent(ELMP.resource('ppm-workflow-resource/components/CommonForm/index.js'))
        },
        props: {
            visible: Boolean,
            containerRef: String,
            typeName: String,
            currentType: {
                type: String,
                default: 'create'
            },
            rowData: {
                type: Object,
                default: () => {}
            },
            className: String,
            currentTreeNode: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            isMove: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('knowledge-library-list/locale/index.js'),
                formData: {},
                treeData: [],
                businessProjectOid: '',
                typeOid: '',
                refreshKey: '',
                currentFolder: {},
                folderProps: {
                    children: 'childList',
                    label: 'displayName'
                }
            };
        },
        watch: {
            'currentTreeNode': {
                immediate: true,
                handler(val) {
                    if (this.currentType === 'create') {
                        let oid = val?.oid || '';
                        this.formData.folderRef = oid;
                        setTimeout(() => {
                            this.basicFormRef.formData.folderRef = oid;
                        }, 1000);
                    }
                }
            },
            'formData.moveToFolder'(val) {
                this.$set(this.basicFormRef.formData, 'moveToFolder', val);
            }
        },
        computed: {
            dialogTitle() {
                let currentType = this.isMove ? 'move' : this.currentType;
                const titleMap = {
                    edit: this.i18n.updateFolder,
                    create: this.i18n.createFolder,
                    move: this.i18n.moveFolder
                };
                return titleMap[currentType];
            },
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            basicFormRef() {
                return this.$refs.basicForm;
            },
            detailFormRef() {
                return this.$refs.detailForm.$refs.initForm;
            },
            formId() {
                return this.currentType === 'edit' ? 'UPDATE' : 'CREATE';
            },
            layoutName() {
                return this.currentType === 'edit' ? 'PPM_UPDATE' : 'PPM_CREATE';
            },
            formSlots() {
                return {
                    folderRef: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                    ),
                    moveToFolder: ErdcKit.asyncComponent(
                        ELMP.resource('ppm-component/ppm-components/FolderComponents/index.js')
                    )
                };
            },
            formSlotsProps() {
                console.log(this.currentTreeNode);
                return {
                    folderRef: {
                        getContainerRef: () => {
                            return Promise.resolve(this.containerRef);
                        },
                        readonly: true,
                        currentFolderOid: this.currentTreeNode.oid
                    },
                    moveToFolder: {
                        getContainerRef: () => {
                            return Promise.resolve(this.containerRef);
                        },
                        isDisabled: true,
                        disabledFolderOid: this.rowData.oid,
                        folderChange: (vm, oid) => {
                            vm.formData.moveToFolder = oid;
                        }
                    }
                };
            }
        },
        mounted() {
            this.rowData.oid && this.getByOid(this.rowData.oid);
        },
        methods: {
            getContainerRef() {
                return Promise.resolve(this.containerRef);
            },
            customFormConfig(vm, config) {
                let typeReference = config.find((item) => item.field === 'typeReference');
                let formConfig = [
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: this.i18n.name,
                        disabled: false,
                        required: true,
                        validators: [],
                        // 只读
                        readonly: false,
                        props: {
                            maxlength: 64
                        },
                        col: 12
                    },
                    {
                        field: 'folderRef',
                        component: 'custom-select',
                        label: this.i18n.parentFolder,
                        disabled: false,
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {},
                        col: 12,
                        slots: {
                            component: 'folderRef'
                        }
                    }
                ];
                formConfig.splice(1, 0, typeReference);
                if (this.isMove) {
                    formConfig.push({
                        field: 'moveToFolder',
                        component: 'custom-select',
                        label: this.i18n.moveTo,
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        slots: {
                            component: 'moveToFolder'
                        },
                        col: 12
                    });
                }
                return formConfig;
            },
            customRenderLayoutForm(data) {
                this.typeOid && (this.refreshKey = new Date().getTime());
                this.typeOid = data.typeOid;
            },
            customQueryParams(params) {
                params.attrRawList.push({
                    attrName: 'typeReference',
                    value: this.typeOid
                });
                return params;
            },
            confirm() {
                let { validate, serializeEditableAttr } = this.basicFormRef.$refs.form || {};
                let arr = [validate(), this.detailFormRef.$refs.dynamicForm.validate()];
                Promise.all(arr).then(() => {
                    let detailFormData = this.detailFormRef.serializeEditableAttr();
                    let basicFormData = serializeEditableAttr();
                    let folderList = {
                        attrName: 'folderRef',
                        value: this.formData.folderRef
                    };
                    if (this.isMove) {
                        folderList.value = basicFormData.find((item) => item.attrName === 'moveToFolder')?.value;
                        basicFormData = basicFormData.filter(
                            (item) => !['moveToFolder', 'folderRef'].includes(item.attrName)
                        );
                    }
                    let result = [...basicFormData, ...detailFormData, folderList];
                    this.$emit('confirm', result);
                });
            },
            cancel() {
                this.dialogVisible = false;
            },
            getByOid(oid) {
                if (this.currentType === 'edit')
                    this.$famHttp({
                        url: '/plat-system/getByOid',
                        method: 'GET',
                        params: {
                            className: this.typeName,
                            oid
                        }
                    }).then((res) => {
                        let result = res.data;
                        setTimeout(() => {
                            this.basicFormRef.formData = ErdcKit.deepClone(result);
                            this.formData.folderRef = result.folderRef;
                            this.typeOid = result.typeReference;
                        }, 300);
                    });
            }
        }
    };
});
