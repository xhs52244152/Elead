define([
    'text!' + ELMP.resource('ppm-component/ppm-components/DocumentDialog/index.html'),
    'erdc-kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/DocumentDialog/index.css')
], function (template, famUtils, store, actionsUtils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            Attach: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/Attach/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js'))
        },
        props: {
            visible: Boolean,
            containerRef: {
                type: String,
                default: ''
            },
            openType: {
                type: String,
                default: 'create'
            },
            columns: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            className: {
                type: String,
                default: ''
            },
            oid: {
                type: String,
                default: ''
            },
            formatAttachDataFun: Function(),
            defaultFolder: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            beforeCancel: Function,
            // 详情页面是否显示编辑按钮
            showEditBtn: {
                type: Boolean,
                default: true
            },
            // 大文件上传后的返回数据需要进行格式转换
            needContentId: {
                type: Boolean,
                default: true
            },
            // 附件的行操作按钮
            operationConfigName: {
                type: String,
                default: 'REVIEW_ATTACH_PER_FULL_OP_MENU'
            },
            actionUploadUrl: {
                type: String,
                default: '/document/content/file/upload'
            },
            limit: {
                type: Number,
                default: 1
            }
        },
        computed: {
            documentClassName() {
                return store.state.classNameMapping.document;
            },
            showDialog: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            formConfig() {
                let { isDetail } = this;
                let colLength = isDetail ? 12 : 24;
                let formConfig = [
                    {
                        field: 'fileName', // 名称
                        required: true,
                        label: this.i18nMappingObj.name,
                        component: 'erd-input',
                        props: {
                            maxlength: 64
                        },
                        readonly: isDetail,
                        col: colLength
                    },
                    {
                        field: 'typeReference',
                        component: 'custom-select',
                        label: this.i18nMappingObj.typeReference, // 类型
                        labelLangKey: 'component',
                        disabled: this.docType !== 'create',
                        required: true,
                        validators: [],
                        props: {
                            placeholder: this.i18nMappingObj.pleaseSelect,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/typeDefinition/findAccessTypes',
                                    viewProperty: 'displayName',
                                    valueProperty: 'typeOid',
                                    params: {
                                        typeName: this.documentClassName,
                                        containerRef: this.containerRef,
                                        accessControl: false
                                    },
                                    transformResponse: [
                                        (data) => {
                                            let result = JSON.parse(data).data?.[0] || {};
                                            this.$set(this.form, 'typeReference', result.typeOid);
                                            this.$set(this.form, 'typeOptions', JSON.parse(data).data);
                                            return JSON.parse(data);
                                        }
                                    ]
                                }
                            }
                        },
                        readonly: isDetail,
                        col: colLength
                    },
                    {
                        field: 'securityLabel',
                        component: 'custom-select',
                        label: this.i18nMappingObj.classification, // 密级
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        props: {
                            placeholder: this.i18nMappingObj.pleaseSelect,
                            placeholderLangKey: 'pleaseSelect',
                            row: {
                                componentName: 'virtual-select',
                                clearNoData: true,
                                requestConfig: {
                                    url: '/fam/type/component/enumDataList',
                                    viewProperty: 'value',
                                    valueProperty: 'name',
                                    data: {
                                        realType: 'erd.cloud.core.enums.SecurityLabel'
                                    },
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    },
                                    method: 'POST',
                                    transformResponse: [
                                        (data) => {
                                            let result = JSON.parse(data).data?.[0] || {};
                                            this.$set(this.form, 'securityLabel', result.name);
                                            this.$set(this.form, 'securityOptions', JSON.parse(data).data);
                                            return JSON.parse(data);
                                        }
                                    ]
                                }
                            }
                        },
                        readonly: isDetail,
                        col: colLength
                    },
                    {
                        field: 'securityDate',
                        component: 'erd-date-picker',
                        label: this.i18nMappingObj.securityDate, // 密级日期
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        validators: [],
                        readonly: isDetail,
                        col: colLength
                    },
                    {
                        field: 'folderRef',
                        component: 'custom-select',
                        label: this.i18nMappingObj.folder, // 文件夹
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        hidden: !this.containerRef,
                        validators: [],
                        slots: {
                            component: 'selectFolder'
                        },
                        col: colLength
                    },
                    {
                        field: 'description',
                        component: 'erd-input',
                        label: this.i18nMappingObj.description, // 描述
                        required: false,
                        disabled: false,
                        hidden: false,
                        validators: [],
                        props: {
                            'clearable': false,
                            'type': 'textarea',
                            'maxlength': 300,
                            'show-word-limit': true
                        },
                        readonly: isDetail,
                        col: 24
                    },
                    {
                        field: 'fileId',
                        component: '',
                        label: this.i18nMappingObj.mainContent, // 主内容
                        labelLangKey: '',
                        disabled: false,
                        hidden: false,
                        required: true,
                        slots: {
                            component: 'uploadComponent'
                        },
                        col: 24
                    }
                ];
                if (isDetail) {
                    let identifierNoConfig = {
                        field: 'identifierNo',
                        label: this.i18nMappingObj.code,
                        readonly: true,
                        component: 'erd-input',
                        col: 12
                    };
                    let detailConfig = [
                        {
                            field: 'createBy',
                            label: this.i18nMappingObj.createBy,
                            readonly: true,
                            component: 'erd-input',
                            col: 12
                        },
                        {
                            field: 'createTime',
                            label: this.i18nMappingObj.createTime,
                            readonly: true,
                            component: 'erd-input',
                            col: 12
                        },
                        {
                            field: 'updateBy',
                            label: this.i18nMappingObj.updateBy,
                            readonly: true,
                            component: 'erd-input',
                            col: 12
                        },
                        {
                            field: 'updateTime',
                            label: this.i18nMappingObj.updateTime,
                            readonly: true,
                            component: 'erd-input',
                            col: 12
                        }
                    ];
                    formConfig.splice(0, 0, identifierNoConfig);
                    formConfig.splice(formConfig.length - 3, 0, ...detailConfig);
                }
                return formConfig;
            },
            title() {
                const titleMap = {
                    create: this.i18nMappingObj.createDoc,
                    edit: this.i18nMappingObj.editDoc,
                    detail: this.i18nMappingObj.detailDoc
                };
                return titleMap[this.docType];
            },
            tabs() {
                return [
                    {
                        activeName: 'Attach',
                        label: this.i18nMappingObj.attachment
                    }
                ];
            },
            attachColumns() {
                return this.columns.length
                    ? this.columns
                    : [
                          {
                              type: 'seq',
                              title: ' ',
                              minWidth: '48',
                              width: '48'
                          },
                          {
                              prop: 'checkbox',
                              title: '',
                              minWidth: '50',
                              width: '50',
                              type: 'checkbox'
                          },
                          {
                              prop: 'fileName',
                              title: this.i18nMappingObj.name
                          },
                          {
                              prop: 'updateBy',
                              title: this.i18nMappingObj.updateBy
                          },
                          {
                              prop: 'updateTime',
                              title: this.i18nMappingObj.updateTime
                          },
                          {
                              prop: 'operation', // 操作
                              title: this.i18nMappingObj.operation,
                              width: '60',
                              fixed: 'right'
                          }
                      ];
            },
            isDetail() {
                return this.docType === 'detail';
            }
        },
        watch: {
            'form.Attach': {
                handler(val) {
                    if (val) this.setTableHeight(val);
                },
                immediate: true
            },
            'docType': {
                handler(val) {
                    this.editBtnDisabled = true;
                    switch (val) {
                        case 'edit':
                            this.checkout();
                            break;
                        case 'detail':
                            this.getDoInfo();
                            break;
                        default:
                            this.editBtnDisabled = false;
                    }
                },
                immediate: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/DocumentDialog/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    clickUpload: this.getI18nByKey('clickUpload'),
                    createDoc: this.getI18nByKey('createDoc'),
                    detailDoc: this.getI18nByKey('detailDoc'),
                    editDoc: this.getI18nByKey('editDoc'),
                    edit: this.getI18nByKey('edit'),
                    code: this.getI18nByKey('code'),
                    name: this.getI18nByKey('name'),
                    typeReference: this.getI18nByKey('typeReference'),
                    classification: this.getI18nByKey('classification'),
                    createBy: this.getI18nByKey('createBy'),
                    createTime: this.getI18nByKey('createTime'),
                    updateBy: this.getI18nByKey('updateBy'),
                    updateTime: this.getI18nByKey('updateTime'),
                    description: this.getI18nByKey('description'),
                    folder: this.getI18nByKey('folder'),
                    attachment: this.getI18nByKey('attachment'),
                    operation: this.getI18nByKey('operation'),
                    uploadSuccessful: this.getI18nByKey('uploadSuccessful'),
                    pleaseSelect: this.getI18nByKey('pleaseSelect'),
                    noDataTips: this.getI18nByKey('noDataTips'),
                    mainContent: this.getI18nByKey('mainContent'),
                    securityDate: this.getI18nByKey('securityDate'),
                    delete: this.getI18nByKey('delete'),
                    basicInfo: this.getI18nByKey('basicInfo')
                },
                form: {},
                folderOptions: [],
                fileList: [],
                folderProps: {
                    children: 'childList',
                    label: 'displayName'
                },
                activeName: 'Attach',
                extendsProps: {
                    'max-line': 5
                },
                tableHeight: 'height: 120px;',
                docType: 'create',
                editBtnDisabled: true,
                isLoading: false,
                panelUnfold: true,
                currentFolder: {},
                vm: null
            };
        },
        mounted() {
            this.vm = this;
            this.docType = this.openType;
            this.getFolderOptions();
        },
        methods: {
            actionClick({ name }) {
                const eventClick = {
                    KNOWLEDGE_DOCUMENT_DETAIL_UPDATE: this.update
                };
                eventClick[name] && eventClick[name]();
            },
            getActionConfig() {
                return {
                    name: 'KNOWLEDGE_DOCUMENT_DETAIL_OPERATE_MENU',
                    objectOid: this.form.oid,
                    className: this.documentClassName
                };
            },
            onSuccess(response, file) {
                if (this.openType === 'create') this.$set(this.form, 'fileName', file.name);
                this.$set(this.form, 'fileId', response.contentId || '');
            },
            onPreview(e) {
                famUtils.downloadFile(e.response.data, e.response.authorizeCode);
            },
            attachDataFunc(e) {
                if (_.isFunction(this.formatAttachDataFun)) return this.formatAttachDataFun(e);
                else {
                    const dayjs = require('dayjs');
                    let updateTime = dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
                    return {
                        fileName: e.name,
                        updateTime,
                        uid: e.uid,
                        uploadState: 'loading',
                        updateBy: this.$store.state?.app?.user?.displayName || ''
                    };
                }
            },
            // 处理附件所需数据
            afterRequest({ data, callback }) {
                if (this.$listeners['after-request']) {
                    this.$emit('after-request', { data, callback });
                } else {
                    // 过滤主文件
                    let result = data
                        .filter((item) => item.role !== 'PRIMARY')
                        .map((item) => {
                            return {
                                fileName: item.displayName,
                                updateTime: item.updateTime,
                                id: item.id,
                                storeId: item.storeId,
                                authCode: item.authorizeCode,
                                uploadState: 'finish',
                                updateBy: item?.updateUser?.displayName || ''
                            };
                        });
                    this.fileList = data
                        .filter((item) => item.role === 'PRIMARY')
                        .map((item) => {
                            return {
                                name: item.displayName,
                                id: item.id,
                                authCode: item.authorizeCode,
                                storeId: item.storeId
                            };
                        });
                    if (this.fileList.length) {
                        this.$set(this.form, 'fileId', this.fileList[0].id);
                    }
                    callback(result);
                }
            },
            // 获取文档数据
            getDoInfo() {
                this.$famHttp({
                    url: '/document/attr',
                    method: 'GET',
                    appName: 'PPM',
                    className: this.documentClassName,
                    data: {
                        oid: this.oid
                    }
                })
                    .then((res) => {
                        this.formatData(res?.data?.rawData || {});
                    })
                    .finally(() => {
                        this.editBtnDisabled = false;
                    });
            },
            formatData(rawData) {
                let originalForm = ErdcKit.deepClone(this.form);
                this.currentFolder = rawData.folderRef;
                this.form = ErdcKit.deserializeAttr(rawData, {
                    valueMap: {
                        securityLabel: (e) => {
                            return this.isDetail ? e.displayName : e.value;
                        },
                        typeReference: (e) => {
                            return this.isDetail ? e.displayName : e.oid;
                        },
                        updateBy: ({ displayName }) => {
                            return displayName;
                        },
                        createBy: ({ displayName }) => {
                            return displayName;
                        }
                    }
                });
                this.$set(this.form, 'fileName', this.form.name);
                this.form = { ...originalForm, ...this.form };
                let folderData = ErdcKit.deepClone(this.folderOptions);
                // 将树结构转换成平铺
                for (let i = 0; i < folderData.length; i++) {
                    if (folderData[i].childList) folderData = [...folderData, ...folderData[i].childList];
                }
                this.form.folderRef = folderData.find((item) => item.oid === rawData?.folderRef?.value);
                this.form.oid = rawData.oid?.value;
            },
            confirm() {
                this.$refs.docDynamicForm
                    .submit()
                    .then(({ valid }) => {
                        if (valid) {
                            if (this.$refs.Attach) {
                                this.form.Attach = this.$refs.Attach?.[0]?.tableData || [];
                            }
                            const dayjs = require('dayjs');
                            this.form.securityDate = dayjs(this.form.securityDate).format('YYYY-MM-DD HH:mm:ss');
                            this.$emit('before-submit', this);
                        }
                    })
                    .catch(() => {});
            },
            // 获取文件夹数据
            getFolderOptions() {
                if (!this.containerRef) return;
                this.$famHttp({
                    url: '/fam/listAllTree',
                    method: 'GET',
                    data: {
                        className: 'erd.cloud.foundation.core.folder.entity.SubFolder',
                        containerRef: this.containerRef
                    }
                }).then((res) => {
                    if (this.docType === 'create') {
                        let result = JSON.stringify(this.defaultFolder) === '{}' ? res.data[0] : this.defaultFolder;
                        this.$set(this.form, 'folderRef', result);
                    }
                    this.folderOptions = res.data;
                });
            },
            // 移除主文件
            removeFile() {
                if (this.openType === 'create') this.$set(this.form, 'fileName', '');
                this.form.fileId = '';
            },
            // 上传主文件
            // onChange(e) {
            // this.fileList = [e];
            // this.uploadFile(e).then((res) => {
            //     this.$message({
            //         type: 'info',
            //         message: this.i18nMappingObj.uploadSuccessful
            //     });
            //     this.$set(this.form, 'fileName', e.name);
            //     this.$set(this.form, 'fileId', res.data);
            // });
            // },
            // uploadFile(e) {
            //     let formData = new FormData();
            //     formData.append('file', e.raw);
            //     return this.$famHttp({
            //         method: 'POST',
            //         url: 'document/content/file/upload',
            //         headers: {
            //             'Content-Type': 'application/x-www-form-urlencoded'
            //         },
            //         data: formData
            //     });
            // },
            // 点击上传附件
            uploadAttachClick() {
                this.$refs?.Attach?.[0]?.uploadClick();
            },
            setTableHeight(val) {
                let len = val.length > this.extendsProps['max-line'] ? this.extendsProps['max-line'] : val.length;
                this.tableHeight = `height:${(len ? (len + 1) * 36 : 72) + 48}px;`;
            },
            update() {
                this.getFolderOptions();
                this.docType = 'edit';
            },
            batchDelete() {
                this.$refs?.Attach?.[0]?.batchDelete();
            },
            // 检出
            checkout() {
                this.$famHttp({
                    url: '/document/common/checkout',
                    method: 'GET',
                    className: this.className,
                    params: {
                        oid: this.oid
                    }
                })
                    .then((res) => {
                        this.formatData(res?.data?.rawData || {});
                    })
                    .finally(() => {
                        this.editBtnDisabled = false;
                    });
            },
            cancel() {
                let { beforeCancel } = this;
                const next = () => {
                    if (_.isFunction(beforeCancel)) beforeCancel();
                    this.showDialog = false;
                };
                this.$emit('cancel', next);
                if (!this.$listeners['cancel']) next();
            },
            previewFile(row) {
                actionsUtils.renderFilePreview(row);
            }
        }
    };
});
