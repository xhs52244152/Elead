define([
    'text!' + ELMP.func('erdc-epm-document/components/EpmDocumentTemplateForm/index.html'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.func('erdc-epm-document/api.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.resource('erdc-cbb-components/Mixins/upload.js')
], function (template, viewConfig, Api, cbbUtils, uploadMixin) {
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    const SubFolder = 'erd.cloud.foundation.core.folder.entity.SubFolder';
    const OrgContainer = 'erd.cloud.foundation.core.container.entity.OrgContainer';

    return {
        name: 'EpmTemplateForm',
        template,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js'))
        },
        mixins: [uploadMixin],
        props: {
            visible: Boolean,
            // 是否只读
            readonly: Boolean,
            // 对象oid
            oid: String,
            // 弹窗标题
            title: String
        },
        store: ErdcStore,
        data() {
            return {
                i18nPath: ELMP.func('erdc-epm-document/locale/index.js'),
                loading: false,
                formData: {
                    docType: '',
                    typeReference: ''
                },
                currentContainerInfoList: [],
                applicationList: [],
                categoryList: [],
                typeList: [],
                extList: [] // 模板文件格式白名单
            };
        },
        watch: {
            'oid': {
                handler(nv) {
                    if (nv) {
                        this.getDetail(this.oid);
                    }
                },
                immediate: true
            },
            'formData.containerRef': {
                handler(newVal, oldVal) {
                    if (newVal && !oldVal) {
                        this.getTypeList();
                        this.getFolder();
                    }
                },
                immediate: true
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    if (!val) this.$emit('close');
                }
            },
            // 当前空间的上下文
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            containerKey() {
                return this.containerRef?.split(':')?.[1] || OrgContainer;
            },
            formConfigs() {
                return [
                    {
                        field: 'containerRef',
                        component: 'custom-select',
                        label: this.i18n.context,
                        readonly: true,
                        props: {
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'name', // 显示的label的key（如果里面也配置，取里面的）
                                valueProperty: 'oid', // 显示value的key（如果里面也配置，取里面的）
                                referenceList: this.currentContainerInfoList,
                                clearNoData: true
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18n.identifierNo,
                        readonly: true,
                        defaultValue: '自动生成',
                        col: 12
                    },
                    {
                        field: 'authoringApplication',
                        component: 'custom-select',
                        label: this.i18n.authoringApplication,
                        required: !this.oid,
                        readonly: !!this.oid,
                        class: 'h-100p',
                        props: {
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'value', // 显示的label的key
                                valueProperty: 'name', // 显示value的key
                                referenceList: this.applicationList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: () => {
                                this.formData.docType = '';
                                this.formData.typeReference = '';
                                this.getCategory();
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'docType',
                        component: 'custom-select',
                        label: this.i18n.docType,
                        required: true,
                        props: {
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'value', // 显示的label的key
                                valueProperty: 'name', // 显示value的key
                                referenceList: this.categoryList,
                                clearNoData: true // value未匹配到option中数据时，清除数据项
                            }
                        },
                        listeners: {
                            change: () => {
                                if (!this.oid) {
                                    this.formData.typeReference = '';
                                }
                            }
                        },
                        col: 12
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18n.type,
                        required: true,
                        props: {
                            clearable: false,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'typeOid',
                                clearNoData: true,
                                referenceList: this.typeList
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
                        label: this.i18n.templateName,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: this.i18n.pleaseEnterContent
                        },
                        col: 12
                    },
                    {
                        field: 'cadName',
                        component: 'erd-input',
                        label: this.i18n.template,
                        required: true,
                        slots: {
                            component: 'uploadComponent'
                        },
                        col: 12
                    }
                ];
            }
        },
        mounted() {
            if (!this.oid) {
                this.getCurrentContainerInfo();
            }
            this.getApplicationList();
        },
        methods: {
            // 编辑场景进入表单查询数据详情回写
            getDetail(oid) {
                this.$famHttp({
                    url: Api.getDetail,
                    params: {
                        oid,
                        className: viewConfig.epmDocumentViewTableMap.className
                    }
                }).then((resp) => {
                    const { data } = resp;

                    this.formData = ErdcKit.deserializeAttr(data.rawData, {
                        valueMap: {
                            typeLinkRef({ oid }) {
                                return oid;
                            }
                        }
                    });
                    this.formData.containerRef =
                        'OR:' + this.formData.containerRef.key + ':' + this.formData.containerRef.id;
                    this.formData.typeReference =
                        'OR:' + this.formData.typeReference.key + ':' + this.formData.typeReference.id;
                    this.getCurrentContainerInfo();
                    this.getFileData(oid);
                    this.getCategory();
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
            // 获取应用程序列表
            getApplicationList() {
                this.$famHttp({
                    url: Api.searchSupportType,
                    params: {
                        className: viewConfig.epmDocumentViewTableMap.className
                    }
                }).then((res) => {
                    this.applicationList = res.data;
                });
            },

            // 获取类别
            getCategory() {
                this.applicationList.forEach((item) => {
                    if (item.name === this.formData.authoringApplication) {
                        this.categoryList = item.categoryList;
                        if (!_.isEmpty(item.supportedFormat)) {
                            this.extList = item.supportedFormat.split(',');
                        } else {
                            this.extList = [];
                        }
                    }
                });
            },

            // 获取类型列表
            getTypeList() {
                const { containerRef, typeReference } = this.formData ?? {};

                if (!containerRef) return;

                this.$famHttp({
                    url: Api.findAccessTypes,
                    appName: 'PDM',
                    params: {
                        typeName: viewConfig.epmDocumentViewTableMap.className,
                        subTypeEnum: 'ALL',
                        containerRef
                    }
                }).then((res) => {
                    this.typeList = res?.data || [];

                    if (typeReference) {
                        const findType = this.typeList.find((item) => item.typeOid === typeReference);
                        if (findType) this.setTypeValue(findType);
                    }
                });
            },
            setTypeValue(data) {
                this.$set(this.formData, 'typeReference', data.typeOid);
            },
            getFolder() {
                const { containerRef } = this.formData ?? {};

                this.$famHttp({
                    url: '/fam/listAllTree',
                    params: {
                        className: SubFolder,
                        containerRef
                    }
                }).then((res) => {
                    let folderList = res?.data || [];
                    this.formData.folderRef = folderList.length ? folderList[0]?.oid || '' : ''; // 文件夹
                });
            },
            getFileData(oid) {
                this.$famHttp({
                    url: 'epm/content/attachment/list',
                    method: 'GET',
                    params: {
                        objectOid: oid,
                        roleType: 'PRIMARY',
                        className: viewConfig.epmDocumentViewTableMap.className
                    }
                }).then((res) => {
                    this.$set(this.formData, 'cadName', res.data?.attachmentDataVoList?.[0]?.displayName || '');
                    this.formData.fileData = res.data?.attachmentDataVoList?.[0] || '';
                    this.formData.fileData.actionFlag = 0;
                });
            },
            checkFileExt: function () {
                let ext = this.formData.cadName.split('.').slice(-1)[0];
                // 统一小写
                ext = ext.toLocaleLowerCase();
                // 扩展名白名单列表不为空时，需要校验文件格式
                if (this.extList.length) {
                    return this.extList.includes(ext);
                } else {
                    // 白名单长度为空，说明不做限制
                    return true;
                }
            },
            onSuccess(file, fileObj) {
                if (!file.success) return;

                let date = new Date();
                const data = {
                    actionFlag: this.oid ? 4 : 1,
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
            handleCreate() {
                // 校验表单
                const { templateForm } = this.$refs;

                let temp = {};
                const attrRawList = templateForm.serializeEditableAttr().filter((item) => {
                    if (item.attrName === 'containerRef' || item.attrName === 'typeReference') {
                        temp[item.attrName] = item.value;
                    }
                    return !_.isUndefined(item.value) && !_.isNull(item.value) && item.attrName !== 'containerRef';
                });

                // 创建不要typeReference，编辑要带上
                if (!this.oid) {
                    attrRawList.splice(_.findIndex(attrRawList, { attrName: 'typeReference' }), 1);
                }

                attrRawList.push(
                    ...[
                        {
                            attrName: 'templateInfo.tmplEnabled',
                            value: true
                        },
                        {
                            attrName: 'templateInfo.tmplTemplated',
                            value: true
                        }
                    ]
                );

                templateForm.validate((valid) => {
                    if (valid) {
                        if (!this.checkFileExt()) {
                            return this.$message.warning(this.i18n.formatError);
                        }

                        const url = this.oid ? '/fam/update' : '/fam/create';
                        const params = {
                            attrRawList,
                            className: viewConfig.epmDocumentViewTableMap.className,
                            typeReference: temp.typeReference,
                            containerRef: this.formData.containerRef,
                            contentSet: [this.formData.fileData]
                        };

                        if (this.oid) {
                            params.oid = this.oid;
                        } else {
                            params.folderRef = this.formData.folderRef || '';
                        }

                        this.loading = true;
                        this.$famHttp({ url, data: params, method: 'POST' })
                            .then(() => {
                                this.$emit('success', this);
                            })
                            .finally(() => {
                                this.loading = false;
                            });
                    }
                });
            }
        }
    };
});
