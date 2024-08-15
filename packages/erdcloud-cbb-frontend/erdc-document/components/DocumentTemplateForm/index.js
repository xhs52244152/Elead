define([
    'text!' + ELMP.func('erdc-document/components/DocumentTemplateForm/index.html'),
    ELMP.func('/erdc-document/config/viewConfig.js'),
    ELMP.func('erdc-document/api.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, viewConfig, Api, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    // const SubFolder = 'erd.cloud.foundation.core.folder.entity.SubFolder';
    const OrgContainer = 'erd.cloud.foundation.core.container.entity.OrgContainer';

    return {
        name: 'DocumentTemplateForm',
        template,
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            MainSource: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/MainContentSource/index.js')),
            AttachFiles: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/UploadFileList/index.js'))
        },
        store: ErdcStore,
        props: {
            oid: String,
            dialogTitle: {
                type: String,
                default: ''
            },
            // 表单数据
            bindCommonForm: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                loading: false,
                formData: {
                    docType: '',
                    typeReference: ''
                },
                visible: true,
                currentContainerInfoList: [],
                applicationList: [],
                categoryList: [],
                typeList: [],
                extList: [], // 模板文件格式白名单
                formId: 'CREATE',
                typeName: ''
            };
        },
        computed: {
            innerFormData: {
                get() {
                    return this.formData;
                },
                set(val) {
                    this.$emit('update:formData', val);
                }
            },
            queryLayoutParams() {
                return {
                    name: 'TEMPLATE_CREATE',
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: 'TEMPLATE_CREATE'
                        // },
                        {
                            attrName: 'typeReference',
                            value: this.formData.typeReference
                        }
                    ]
                };
            },
            // 当前空间的上下文
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            className() {
                return this.typeName || viewConfig.docViewTableMap.className;
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || OrgContainer;
            },
            schemaMapper() {
                let { oid } = this;
                return {
                    typeReference(schema) {
                        // 修改schema，设置个ref
                        schema.ref = 'type-reference';
                        schema.readonly = !!oid;
                    }
                };
            }
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        setTimeout(() => {
                            this.getDetail(this.oid);
                        }, 100);
                    }
                }
            }
        },
        mounted() {
            if (!this.oid) {
                this.getCurrentContainerInfo();
            }
        },
        methods: {
            handleFieldChange({ field }, value) {
                if (field === 'typeReference') {
                    let typeComp = this.$refs.commonFormRef.useComponent('type-reference');
                    let options = typeComp?.options || [];
                    this.typeName = options.find((item) => item.typeOid === value)?.typeName;
                }
            },
            // 编辑场景进入表单查询数据详情回写
            getDetail(oid) {
                this.$famHttp({
                    url: '/common/attr',
                    params: {
                        oid,
                        className: this.className
                    }
                }).then((resp) => {
                    const { data } = resp;

                    this.formData = ErdcKit.deserializeAttr(data.rawData, {
                        valueMap: {
                            typeLinkRef({ oid }) {
                                return oid;
                            },
                            organizationRef: ({ value, displayName }) => {
                                return {
                                    oid: value,
                                    name: displayName
                                };
                            }
                        }
                    });
                    this.formData.containerRef =
                        'OR:' + this.formData.containerRef.key + ':' + this.formData.containerRef.id;
                    this.formData.typeReference =
                        'OR:' + this.formData.typeReference.key + ':' + this.formData.typeReference.id;
                    this.getCurrentContainerInfo();
                });
            },
            getCurrentContainerInfo() {
                this.$famHttp({
                    url: Api.getCurrentContainerInfo
                }).then((res) => {
                    this.$set(this.formData, 'containerRef', res.data?.oid);
                    this.currentContainerInfoList = [res.data];
                });
            },
            onSuccess(file, fileObj) {
                if (!file.success) return;

                let date = new Date();
                const data = {
                    actionFlag: 1,
                    id: file.data,
                    isDownlad: true,
                    description: '',
                    displayName: fileObj.name,
                    fileSize: cbbUtils.formatSize(fileObj.size),
                    createTime: ErdcKit.formatDateTime(date, 'ymdhms'),
                    role: 'PRIMARY',
                    source: 0,
                    location: 'REMOTE'
                };
                this.formData.fileData = data;
                this.$set(this.formData, 'name', fileObj.name);
                this.$set(this.formData, 'cadName', fileObj.name);
            },
            async handleCreate() {
                // 校验表单
                const { commonFormRef } = this.$refs;
                let temp = {};
                const attrRawList = commonFormRef.serializeEditableAttr().filter((item) => {
                    if (
                        item.attrName === 'containerRef' ||
                        item.attrName === 'typeReference' ||
                        item.attrName === 'name' ||
                        item.attrName === 'securityLabel' ||
                        item.attrName === 'securityDate'
                    ) {
                        temp[item.attrName] = item.value;
                    }
                    return !_.isUndefined(item.value) && !_.isNull(item.value) && item.attrName !== 'containerRef';
                });

                // 创建不要typeReference，编辑要带上
                // if (!this.oid) {
                attrRawList.splice(_.findIndex(attrRawList, { attrName: 'typeReference' }), 1);
                // }

                temp.typeReference = temp.typeReference || this.formData.typeReference;
                if (!temp['typeReference']) {
                    this.$message.warning(this.i18n.typeReferenceNotEmpty);
                    return false;
                }

                if (!temp['name']) {
                    this.$message.warning(this.i18n.nameNotEmpty);
                    return false;
                }

                if (!temp['securityLabel']) {
                    this.$message.warning(this.i18n.securityLabelNotEmpty);
                    return false;
                }

                // BA说，密级期限不是必填的，所以要去掉该校验
                // if (!temp['securityDate']) {
                //     this.$message.warning(this.i18n.securityDateNotEmpty);
                //     return false;
                // }

                attrRawList.push(
                    ...[
                        // 上下文为站点
                        {
                            attrName: 'containerRef',
                            value: 'OR:erd.cloud.foundation.core.container.entity.SiteContainer:99210668586041741'
                        },
                        {
                            attrName: 'templateInfo.tmplTemplated',
                            value: true
                        }
                    ]
                );
                let contentSet = [];

                let main = await this?.$refs?.['main-source']?.submit(true);
                if (!main.valid) return;
                // 主要内容源
                let mainSourceData = main?.data || {};
                if (mainSourceData && Object.keys(mainSourceData).length) contentSet.unshift(mainSourceData);

                // 附件
                let attachmentList = await this?.$refs?.['files']?.submit();
                if (!attachmentList.status) return;
                _.each(attachmentList.data, (item) => {
                    if (item.role !== 'PRIMARY') contentSet.push(item);
                });

                if (attrRawList.length) {
                    this.loading = true;
                    const params = {
                        attrRawList,
                        className: this.className,
                        contentSet,
                        folderRef: this.currentContainerInfoList?.[0]?.defaultCabinetRef,
                        ...temp
                    };
                    if (this.oid) {
                        params['oid'] = this.oid;

                        this.$famHttp({ url: '/fam/update', data: params, method: 'POST' })
                            .then(() => {
                                this.$emit('success', this, this.oid);
                                this.handleClose();
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    } else {
                        this.$famHttp({ url: '/fam/create', data: params, method: 'POST' })
                            .then(() => {
                                this.$emit('success');
                                this.handleClose();
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                }

                // 拿到所有数据，转换文件数据 调用接口创建模板
            },
            handleClose() {
                this.visible = false;
                this.$emit('close');
            }
        }
    };
});
