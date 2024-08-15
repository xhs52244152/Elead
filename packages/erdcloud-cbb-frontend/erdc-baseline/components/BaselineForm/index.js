define([
    'text!' + ELMP.func('erdc-baseline/components/BaselineForm/index.html'),
    ELMP.func('erdc-baseline/const.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, CONST, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');

    return {
        name: 'BaselineForm',
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            FamCodeGenerator: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamCodeGenerator/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            UploadFileList: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js')),
            LifecycleStep: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/components/LifecycleStep/index.js'))
        },
        template,
        props: {
            pid: String,
            oid: String,
            viewType: {
                type: String,
                default: 'create'
            },
            readonly: {
                type: Boolean,
                default: false
            },
            getFormConfigs: Function,
            // 是否要请求文件夹接口
            isRequestFolderData: {
                type: Boolean,
                default: true
            },
            // 是否要请求上下文详情接口
            isRequestContextData: {
                type: Boolean,
                default: true
            },
            layoutName: String,
            isBaselineMerge: {
                type: Boolean,
                default: false
            },
            // 自定义上下文选项
            containerList: {
                type: Array,
                default: () => {
                    return ErdcStore.getters['cbbStore/getContainerList'] || [];
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                panelUnfold: true,
                formData: {},
                accessType: [],
                folderTree: [],
                contextOptions: [],
                contextInfo: {},
                baselineClassName: CONST.className
            };
        },
        created() {
            var self = this;
            // 查询上下文下拉框
            this.getContexts();
            // 没有oid则为创建
            if (!this.oid) {
                // 有上下文说明是从空间下进入， 就查询上下文详情,
                if (this.pid) {
                    this.getProductDetail().then(() => {
                        self.$set(self.formData, 'containerRef', self.contextInfo.containerRef);
                        this.getFolderTree(self.formData.containerRef).then(() => {
                            if (self.folderTree && self.folderTree.length > 0) {
                                self.$set(self.formData, 'folderRef', self.folderTree[0]);
                            }
                        });
                        this.getAccessType(self.formData.containerRef).then(() => {
                            if (self.accessType && self.accessType.length) {
                                self.$set(self.formData, 'typeReference', self.accessType[0].value);
                            }
                        });
                    });
                }
            } else {
                if (this.pid) {
                    this.getProductDetail();
                }
            }
        },

        computed: {
            isCheckout: function () {
                return this.formData?.iterationInfoState === 'WORKING';
            },
            isCreate: function () {
                return !this.oid;
            },
            typeClassName: function () {
                if (this.formData.typeReference) {
                    let typeName = this.readonly ? this.formData.typeReference.oid : this.formData.typeReference;
                    let type = this.accessType.find((i) => i.value === typeName);
                    return type ? type.typeName : '';
                } else {
                    return CONST.className;
                }
            },
            // typeReferenceName: function() {
            //     if(this.formData.typeReference) {
            //         let type = this.accessType.find(i => i.value === this.formData.typeReference);
            //         if(type) {
            //             return type.label;
            //         }
            //     }
            //     if(this.accessType && this.accessType.length) {
            //         return this.accessType[0].label;
            //     }
            //     return ''
            // },
            isFromPortal: function () {
                return !this.pid;
            },
            formConfigs: function () {
                const { i18n } = this;
                let config = [
                    {
                        field: 'containerRef',
                        label: i18n.context,
                        required: !this.oid ? true : false, //只读非必填
                        col: 12,
                        slots: {
                            component: 'context-slot',
                            readonly: 'context-slot'
                        }
                    },
                    {
                        field: 'typeReference',
                        label: i18n.type,
                        required: !this.oid ? true : false, //只读非必填
                        col: 12,
                        slots: {
                            component: 'type-slot',
                            readonly: 'type-slot'
                        }
                    },
                    {
                        field: 'folderRef',
                        label: i18n.folder,
                        col: 12,
                        slots: {
                            component: 'folder-slot',
                            readonly: 'folder-slot'
                        }
                    },
                    {
                        field: 'identifierNo',
                        component: 'fam-code-generator',
                        label: i18n.code,
                        col: 12,
                        slots: {
                            component: 'code-slot',
                            readonly: 'code-slot'
                        }
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: i18n.name,
                        col: 12,
                        required: true
                    }
                ];
                if (this.readonly) {
                    config = config.concat([
                        {
                            field: 'lifecycleStatus.status',
                            component: 'erd-input',
                            label: i18n.lifecycleStatus,
                            readonly: true,
                            col: 12,
                            slots: {
                                readonly: 'lifecycleStatusStatus-slot'
                            }
                        },
                        {
                            field: 'version',
                            component: 'erd-input',
                            label: i18n.version,
                            readonly: true,
                            col: 12
                        },
                        {
                            field: 'persistableRef',
                            component: 'erd-input',
                            label: i18n.persistableRef,
                            readonly: true,
                            col: 12
                        }
                    ]);
                }
                if (_.isFunction(this.getFormConfigs)) config = this.getFormConfigs(config, this.viewType);
                return config;
            },
            modelMapper() {
                var self = this;
                return {
                    // 'organizationRef': (data, { oid, displayName }) => {
                    //     if (self.readonly) {
                    //         return displayName;
                    //     }
                    //     return {
                    //         oid,
                    //         name: displayName
                    //     };
                    // },
                    'securityLabel': (rawData, { value }) => {
                        if (self.readonly) {
                            return value;
                        }
                        return value;
                    },
                    'typeReference': (rawData, fieldData) => {
                        if (self.readonly) {
                            return fieldData;
                        }
                        return fieldData.oid;
                    },
                    'typeReferenceOrigin': (rawData, fieldData) => {
                        return fieldData;
                    },
                    'containerRef': (rawData, fieldData) => {
                        if (self.readonly) {
                            return fieldData;
                        }
                        return fieldData.oid;
                    },
                    'containerRefOrigin': (rawData, fieldData) => {
                        return fieldData;
                    },
                    'folderRef': (rawData, fieldData) => {
                        if (self.readonly) {
                            return fieldData;
                        }
                        return fieldData.value;
                    },
                    'folderRefOrigin': (rawData, fieldData) => {
                        return fieldData;
                    },
                    // 'createBy': (rawData, fieldData) => {
                    //     if (self.readonly) {
                    //         return fieldData.users;
                    //     }
                    //     return fieldData.oid;
                    // },
                    // 'updateBy': (rawData, fieldData) => {
                    //     if (self.readonly) {
                    //         return fieldData.users;
                    //     }
                    //     return fieldData.oid;
                    // },
                    // 'ownedByRef': (rawData, fieldData) => {
                    //     if (self.readonly) {
                    //         return fieldData.users;
                    //     }
                    //     return fieldData.oid;
                    // },
                    'lifecycleStatus.lifecycleTemplateRef': (rawData, fieldData) => {
                        return fieldData.displayName;
                    },
                    'lifecycleStatus.status': (rawData, fieldData) => {
                        return fieldData.value;
                    },
                    'lifecycleStatusOrigin': (rawData, fiedlData) => {
                        return fiedlData;
                    },
                    'iterationInfo.state': (rawData, fieldData) => {
                        if (self.readonly) {
                            return fieldData.displayName;
                        }
                        return fieldData.value;
                    },
                    'persistableRef': (rawData, fieldData) => {
                        if (self.readonly) {
                            return fieldData.displayName;
                        }
                        return fieldData.value;
                    },
                    'teamRef': (rawData, fieldData) => {
                        return fieldData.oid;
                    },
                    'lock.locker': (rawData, fieldData) => {
                        return fieldData;
                    }
                };
            }
        },
        watch: {
            formData: function (val) {
                var self = this;
                if (val && val.oid) {
                    // 不是只读就是编辑状态
                    if (!this.readonly) {
                        // 没有上下文,说明是从portal进去的,就查询上下文下拉框
                        this.getContexts().then(() => {
                            self.getFolderTree(val.containerRef).then(() => {
                                if (self.folderTree && self.folderTree.length > 0) {
                                    self.$set(self.formData, 'folderRef', self.folderTree[0]);
                                }
                            });
                            self.getAccessType(val.containerRef).then(() => {
                                if (self.accessType && self.accessType.length) {
                                    self.$set(self.formData, 'typeReference', self.accessType[0].value);
                                }
                            });
                        });
                    }
                }
                this.$emit('change', val);
            }
        },
        mounted() {},
        methods: {
            handleDataBeforeMapper(data) {
                // 将可能会被重新映射的值进行留存
                data.rawData.iterationInfoState = data.rawData['iterationInfo.state'];
                data.rawData.containerRefOrigin = data.rawData.containerRef;
                data.rawData.typeReferenceOrigin = data.rawData.typeReference;
                data.rawData.folderRefOrigin = data.rawData.folderRef;
                data.rawData.lifecycleStatusOrigin = data.rawData['lifecycleStatus.status'];
            },
            enterContextSpace(data, type) {
                cbbUtils.handleGoToSpace(data, type);
            },
            submit(isSaveAsDraft) {
                var self = this;
                return Promise.all([
                    this.$refs.form.submit(),
                    this.$refs.layoutForm.submit(),
                    this.$refs.attachment.submit(isSaveAsDraft)
                ]).then((results) => {
                    results[2].valid = results[2].status;
                    for (let i of results) {
                        if (!i.valid) {
                            return Promise.resolve({
                                validate: false
                            });
                        }
                    }
                    let baseForm = self.$refs.form.serializeEditableAttr();
                    let advanceForm = self.$refs.layoutForm.serializeEditableAttr();
                    let attrRawList = baseForm.concat(advanceForm);
                    let folder = results[0].data.folderRef;
                    attrRawList = attrRawList.filter((i) => i.attrName !== 'folderRef');
                    attrRawList.forEach((i) => {
                        if (i.attrName === 'organizationRef') {
                            if (_.isArray(i.value)) {
                                i.value = i.value[0].oid;
                            } else if (_.isObject(i.value)) {
                                i.value = i.value.oid;
                            }
                        }
                    });
                    let data = {};
                    data.className = CONST.className;
                    data.attrRawList = attrRawList;
                    data.contentSet = results[2].data;
                    data.folderRef = folder?.oid;
                    return {
                        validate: true,
                        data: data
                    };
                });
            },
            handleContextChange() {
                this.getFolderTree(this.formData.containerRef).then(() => {
                    if (this.folderTree && this.folderTree.length > 0) {
                        this.$set(this.formData, 'folderRef', this.folderTree[0]);
                    }
                });
                this.getAccessType(this.formData.containerRef).then(() => {
                    if (this.accessType && this.accessType.length) {
                        this.$set(this.formData, 'typeReference', this.accessType[0].value);
                    }
                });
            },
            getAccessType(containerRef) {
                if (!containerRef) return Promise.resolve();
                return this.$famHttp({
                    url: '/fam/type/typeDefinition/findAccessTypes',
                    method: 'get',
                    params: {
                        typeName: this.baselineClassName,
                        containerRef: containerRef
                    }
                }).then((resp) => {
                    if (resp.success) {
                        let accessType = resp.data || [];
                        this.accessType = accessType.map((i) => {
                            return {
                                typeName: i.typeName,
                                label: i.displayName,
                                value: i.typeOid
                            };
                        });
                    }
                });
            },
            getFolderTree(containerRef) {
                if (!this.isRequestFolderData) return Promise.resolve();
                return this.$famHttp({
                    url: '/fam/listAllTree',
                    method: 'get',
                    params: {
                        className: 'erd.cloud.foundation.core.folder.entity.SubFolder',
                        containerRef: containerRef
                    }
                }).then((resp) => {
                    this.folderTree = resp.data || [];
                });
            },
            getContexts() {
                if (!this.isRequestContextData) return Promise.resolve();

                if (this.containerList.length > 0) {
                    this.contextOptions = this.containerList.map((i) => {
                        return {
                            label: i.displayName,
                            value: i.containerRef
                        };
                    });
                    return Promise.resolve(this.contextOptions);
                }
                return this.$famHttp({
                    url: 'fam/container/list',
                    params: {
                        className: 'erd.cloud.pdm.core.container.entity.PdmProduct'
                    }
                }).then((resp) => {
                    if (resp.success) {
                        let data = resp.data || [];
                        this.contextOptions = data.map((i) => {
                            return {
                                label: i.displayName,
                                value: i.containerRef
                            };
                        });
                    }
                });
            },
            getBaselineDetail() {
                if (this.oid) {
                    let className = this.oid?.split(':')?.[1];
                    return this.$famHttp({
                        url: 'baseline/attr',
                        className,
                        params: {
                            oid: this.oid
                        }
                    }).then((resp) => {
                        return resp.data.rawData;
                    });
                }
            },
            getProductDetail() {
                if (!this.isRequestContextData) return Promise.resolve();
                if (this.pid) {
                    return this.$famHttp({
                        url: '/fam/getByOid',
                        method: 'get',
                        params: {
                            oid: this.pid,
                            className: this.pid.split(':')[1]
                        }
                    })
                        .then((resp) => {
                            if (resp.success) {
                                this.contextInfo = resp.data || {};
                                return this.contextInfo;
                            }
                            return Promise.reject(resp.message);
                        })
                        .catch((message) => this.$message.error(message));
                } else {
                    return Promise.reject();
                }
            },
            queryLayoutParams() {
                let name = this.layoutName || this.viewType;
                return {
                    name
                    // attrRawList: [
                    //     {
                    //         attrName: 'layoutSelector',
                    //         value: name
                    //     }
                    // ]
                };
            }
        }
    };
});
