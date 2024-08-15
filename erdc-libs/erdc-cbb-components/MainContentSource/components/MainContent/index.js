define([
    'text!' + ELMP.resource('erdc-cbb-components/MainContentSource/components/MainContent/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    // 检入状态
    const CHECKED_IN_TYPE = 'CHECKED_IN';

    return {
        name: 'MainContent',
        template,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
        },
        props: {
            // 类名
            className: {
                type: String,
                required: true
            },
            oid: String,
            // 新增附件url
            uploadAttachUrl: String,
            // 下载附件url
            downloadUrl: String,
            readonly: Boolean,
            outerFileList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            beforeRemove: Function,
            beforeUpload: Function,
            onSuccess: Function,
            vm: Object,
            isEpm: Boolean
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/MainContentSource/locale/index.js'),
                fileList: [],
                // 默认新增附件url
                defaultUploadAttachUrl: '/fam/content/file/upload',
                // 默认下载附件url
                defaultDownloadUrl: '/fam/content/file/download',
                // 预览oid
                previewOid: ''
            };
        },
        computed: {
            canGetAttachmentslist() {
                return this.oid && this.className && this.oid + this.className;
            },
            innerUploadAttachUrl() {
                return this.uploadAttachUrl || this.defaultUploadAttachUrl;
            },
            innerDownloadUrl() {
                return this.downloadUrl || this.defaultDownloadUrl;
            },
            onPreview() {
                const [form = {}] = this.fileList || [];
                return form?.source === 1 ? this.reviewUrl : this.downloadFile;
            }
        },
        watch: {
            canGetAttachmentslist: {
                handler: function (nv) {
                    if (nv) {
                        this.getFileData();
                    }
                },
                immediate: true
            },
            outerFileList: {
                handler: function (nv) {
                    this.fileList = ErdcKit.deepClone(nv) || [];
                },
                immediate: true
            },
            fileList: {
                immediate: true,
                handler(nv) {
                    this.$emit('file-update', nv);
                }
            }
        },
        mounted() {
            this.previewOid = this.oid || '';
        },
        methods: {
            // 附件修改之后的回调
            handleUpdate(updatedData) {
                const [row] = this.fileList || [];
                Object.assign(row || {}, {
                    id: updatedData.contentId
                });
            },
            // 预览关闭的回调
            previewClose() {
                if (this.oid !== this.previewOid) {
                    this.vm?.refresh(this.previewOid);
                }
            },
            // 编辑
            editAttach(row) {
                if (_.isEmpty(row)) {
                    if (!this.fileList?.length) {
                        return this.$message.warning(this.i18n?.['暂无文件']);
                    }
                    [row] = this.fileList || [];
                }
                this.$refs.mainFilePreview.isSupportedEdit(row.name).then(async (isSupported) => {
                    if (isSupported) {
                        this.previewOid = this.oid || '';
                        if (this.getObjectState() === CHECKED_IN_TYPE) {
                            const resp = await this.handleCheckout();
                            if (!resp?.success) {
                                return;
                            }
                            this.previewOid = resp?.data?.rawData?.oid?.value || this.previewOid || '';
                        }
                        this.$refs.mainFilePreview.edit({
                            fileName: row.name,
                            oid: this.previewOid,
                            contentId: row.id
                        });
                    } else {
                        this.$message.warning(this.i18n?.['暂不支持该操作']);
                    }
                });
            },
            // 预览
            previewAttach(row) {
                if (_.isEmpty(row)) {
                    if (!this.fileList?.length) {
                        return this.$message.warning(this.i18n?.['暂无文件']);
                    }
                    [row] = this.fileList || [];
                }
                this.$refs.mainFilePreview.isSupportedView(row.name).then((isSupported) => {
                    if (isSupported) {
                        this.$refs.mainFilePreview.preview({
                            fileName: row.name,
                            oid: this.previewOid,
                            contentId: row.id
                        });
                    } else {
                        this.$message.warning(this.i18n?.['暂不支持该操作']);
                    }
                });
            },
            switchToEdit($event, row) {
                if (_.isEmpty(row)) {
                    if (!this.fileList?.length) {
                        return this.$message.warning(this.i18n?.['暂无文件']);
                    }
                    [row] = this.fileList || [];
                }
                this.editAttach(row);
            },
            // 获取对象生命周期状态
            getObjectState() {
                const state = this.vm?.sourceData?.['iterationInfo.state'] || {};
                return state && state?.value;
            },
            // 检出
            handleCheckout() {
                return this.$famHttp('/fam/common/checkout', {
                    method: 'GET',
                    className: this.className,
                    params: {
                        oid: this.oid
                    }
                });
            },
            getFileData(objectOid, className) {
                this.$famHttp({
                    url: '/fam/content/attachment/list',
                    method: 'GET',
                    params: {
                        objectOid: objectOid || this.oid,
                        roleType: 'PRIMARY'
                    },
                    className: className || this.className
                }).then((res) => {
                    const {
                        success,
                        data: { attachmentDataVoList = [] }
                    } = res || {};
                    if (success && _.isArray(attachmentDataVoList) && attachmentDataVoList.length) {
                        this.fileList = _.map(attachmentDataVoList, (item) => {
                            return {
                                ...item,
                                fileName: item?.displayName || item?.name,
                                name: item?.displayName || item?.name,
                                fileSize: (item?.size && cbbUtils.formatSize(item?.size)) || item?.fileSize || ''
                            };
                        });
                    } else {
                        this.fileList = [];
                    }
                });
            },
            reviewUrl() {
                const [form = {}] = this.fileList || [];
                window.open(form?.urlLocation);
            },
            // 下载
            downloadFile(row) {
                if (this.isEpm)
                    ErdcKit.downFile({
                        url: this.innerDownloadUrl,
                        className: this.className,
                        method: 'GET',
                        data: {
                            id: row?.id || '',
                            name: row?.fileName || '',
                            className: this.className
                        }
                    });
                else ErdcKit.downloadFile(row.storeId || row.fileId, row.authorizeCode || row.authCode);
            }
            // 自定义上传(使用平台的上传接口,才可以做到大文件上传)
            // httpRequest(option) {
            //     let data = new FormData();
            //     data.append(option.filename, option.file, option.file.name);
            //     return this.$famHttp({
            //         url: this.innerUploadAttachUrl,
            //         method: 'post',
            //         data,
            //         headers: {
            //             'Content-Type': 'multipart/form-data'
            //         },
            //         className: this.className
            //     });
            // }
        }
    };
});
