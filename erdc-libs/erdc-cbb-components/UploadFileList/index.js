define([
    'text!' + ELMP.resource('erdc-cbb-components/UploadFileList/index.html'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.resource('erdc-cbb-components/UploadFileList/index.css')
], function (template, cbbUtils) {
    const ErdcKit = require('erdc-kit');
    const FileType = '0',
        URLType = '1';
    const actionFlagMap = {
        NoOperate: 0,
        add: 1,
        edit: 2,
        delete: 3
    };

    // 检入状态
    const CHECKED_IN_TYPE = 'CHECKED_IN';

    return {
        name: 'UploadFileList',
        template,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
        },
        props: {
            // 类名
            className: {
                type: String,
                required: true
            },
            // 能否上传多个
            multiple: Boolean,
            // 是否检出
            isCheckout: Boolean,
            // 只读模式
            readonly: Boolean,
            // 是否显示上传附件按钮
            isAttachmentBtn: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            // 是否显示上传URL按钮
            isUrlBtn: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            // 附件回显oid
            oid: String,
            // 双向绑定value
            value: [String, Array],
            // 新增附件url
            uploadAttachUrl: String,
            // 删除附件url
            deleteAttachUrl: String,
            // 获取附件列表url
            attachListUrl: String,
            // 下载附件url
            downloadUrl: String,
            // 自定义列头
            columns: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 自定义附件数据
            tableData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            // 下载附件列表类型，主要内容源和次要内容源
            roleType: {
                type: String,
                default: ''
            },
            /**
             * 分块上传的配置，包括分块上传接口、文件预上传接口、分块文件上传完成接口
             * @type { uploadChunkUrl: string, preUploadFileUrl: string, finishFileUrl: string }
             */
            multipartUploadActions: {
                type: Object,
                default() {
                    return {
                        uploadChunkUrl: '/file/file/site/storage/v1/trans/upload',
                        preUploadFileUrl: '/file/file/site/storage/v1/trans/validate',
                        finishFileUrl: '/file/file/site/storage/v1/trans/{id}/finish'
                    };
                }
            },
            /**
             * 是否分片上传，默认否
             */
            chunkUpload: {
                type: [String, Boolean],
                default: false
            },
            vm: Object
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/UploadFileList/locale/index.js'),
                fileType: FileType,
                urlType: URLType,
                // 附件数据
                innerTableData: [],
                // 当前编辑数据
                currentRow: {},
                // 默认展开
                panelUnfold: true,
                // 编辑附件ids
                editFileIds: [],
                // 默认新增附件url
                defaultUploadAttachUrl: '/fam/content/file/upload',
                // 默认删除附件url
                defaultDeleteAttachUrl: '/fam/content/attachment/delete',
                // 默认获取附件列表url
                defaultAttachListUrl: '/fam/content/attachment/list',
                // 默认下载附件url
                defaultDownloadUrl: '/fam/content/file/download',
                // 预览oid
                previewOid: ''
            };
        },
        computed: {
            defaultColumns() {
                return [
                    {
                        prop: 'seq', // 列数据字段key
                        type: 'seq', // 特定类型
                        title: ' ',
                        width: 48,
                        align: 'center' //多选框默认居中显示
                    },
                    {
                        prop: 'icon', // 属性名
                        title: this.i18n['图标'], // 字段名
                        width: 60
                    },
                    {
                        prop: 'name',
                        title: this.i18n['名称'],
                        editRender: this.readonly ? null : { autofocus: 'input.el-input__inner' }
                    },
                    {
                        prop: 'type',
                        title: this.i18n['文件类型'],
                        width: 120
                    },
                    {
                        prop: 'urlLocation',
                        title: this.i18n['URL'],
                        editRender: this.readonly ? null : { autofocus: 'input.el-input__inner' }
                    },
                    {
                        prop: 'size',
                        title: this.i18n['文件大小'],
                        width: 100
                    },
                    {
                        prop: 'createTime',
                        title: this.i18n['创建时间'],
                        width: 140
                    },
                    {
                        prop: 'updateTime',
                        title: this.i18n['更新时间'],
                        width: 140
                    },
                    {
                        prop: 'description',
                        title: this.i18n['详细描述'],
                        width: 120,
                        editRender: this.readonly ? null : { autofocus: 'input.el-input__inner' }
                    },
                    {
                        prop: 'operation',
                        title: this.i18n['操作'],
                        width: 60
                    }
                ];
            },
            innerColumns() {
                return _.isArray(this.columns) && this.columns?.length ? this.columns : this.defaultColumns;
            },
            innerUploadAttachUrl() {
                return this.uploadAttachUrl || this.defaultUploadAttachUrl;
            },
            innerDeleteAttachUrl() {
                return this.deleteAttachUrl || this.defaultDeleteAttachUrl;
            },
            innerAttachListUrl() {
                return this.attachListUrl || this.defaultAttachListUrl;
            },
            innerDownloadUrl() {
                return this.downloadUrl || this.defaultDownloadUrl;
            },
            canGetAttachmentslist() {
                return this.oid && this.className && this.oid + this.className;
            },
            innerRoleType() {
                return this.roleType || undefined;
            },
            showData() {
                return this.innerTableData.filter((item) => item.actionFlag != actionFlagMap.delete);
            }
        },
        mounted() {
            this.previewOid = this.oid || '';
        },
        watch: {
            canGetAttachmentslist: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.getFileData({});
                    }
                }
            },
            tableData: {
                handler: function (nv) {
                    this.innerTableData = ErdcKit.deepClone(nv) || [];
                },
                immediate: true
            }
        },
        methods: {
            // 自定义上传
            // httpRequest(option) {
            //     const {
            //         file: { size }
            //     } = option;

            //     const famUpload = this.$refs.myUpload;
            //     let { chunkUpload, bigFileSize, uploadBigFile } = famUpload;

            //     if (chunkUpload === true || (chunkUpload === 'auto' && size >= bigFileSize)) {
            //         // 分块上传
            //         // 如果用默认的uploadChunkUrl，则不用转换前缀
            //         if (this.multipartUploadActions.uploadChunkUrl !== '/file/file/site/storage/v1/trans/upload') {
            //             option.data.className = this.className;
            //         }
            //         return uploadBigFile(option);
            //     } else {
            //         // 普通上传
            //         let data = new FormData();
            //         data.append(option.filename, option.file, option.file.name);
            //         return this.$famHttp({
            //             url: this.innerUploadAttachUrl,
            //             method: 'post',
            //             data,
            //             headers: {
            //                 'Content-Type': 'multipart/form-data'
            //             },
            //             className: this.className
            //         });
            //     }
            // },
            extendDisabledValidate(row) {
                return (action) => {
                    if (action.name === 'FILE_DELETE') {
                        // 参考2.x 详情状态且文件上传过的可删除
                        return this.readonly && !(row.isDownlad || row.isModifyContent);
                    } else if (['FILE_PREVIEW', 'FILE_DOWNLOAD'].indexOf(action.name) > -1) {
                        return !row.isDownlad;
                    } else if (action.name === 'FILE_EDIT') {
                        // 编辑只有在是已检出状态,并且是已经上传过的才能编辑
                        return !(row.isDownlad && this.oid);
                    }
                    return false;
                };
            },
            handleEditUrlFile(row) {
                if (this.oid && this.editFileIds.indexOf(row.id) === -1) {
                    this.editFileIds.push(row.id);
                }
            },
            onSuccess(response, file) {
                this.$message.success(this.i18n?.['附件上传成功']);
                this.innerTableData.push({
                    name: file.name,
                    size: cbbUtils.formatSize(file.size),
                    sizeNumber: file.size,
                    source: FileType,
                    description: '',
                    // 平台规定需要传contentId,而不是id
                    id: response.contentId,
                    actionFlag: actionFlagMap.add,
                    // 现在刚上传的文件也可以下载和预览了
                    isDownlad: true,
                    storeId: response.data,
                    authCode: response.authorizeCode
                });
            },
            uploadUrl() {
                this.innerTableData.push({
                    name: '',
                    source: URLType,
                    description: '',
                    actionFlag: actionFlagMap.add
                });
            },
            // 表格操作按钮
            getActionConfig() {
                return {
                    name: 'FILE_LIST_PER_OP_MENU',
                    objectOid: this.oid,
                    className: this.className
                };
            },
            onCommand(data, row) {
                const eventClick = {
                    FILE_EDIT: this.editAttach,
                    FILE_PREVIEW: this.previewAttach,
                    FILE_DELETE: this.deleteAttach,
                    FILE_DOWNLOAD: this.download
                };
                eventClick[data.name](row);
            },
            // 附件修改之后的回调
            handleUpdate(updatedData) {
                Object.assign(this.currentRow, {
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
                this.currentRow = row;
                this.$refs.filePreview.isSupportedEdit(row.name).then(async (isSupported) => {
                    if (isSupported) {
                        this.previewOid = this.oid || '';
                        if (this.getObjectState() === CHECKED_IN_TYPE) {
                            const resp = await this.handleCheckout();
                            if (!resp?.success) {
                                return;
                            }
                            this.previewOid = resp?.data?.rawData?.oid?.value || this.previewOid || '';
                        }
                        this.$refs.filePreview.edit({
                            fileName: row.name,
                            oid: this.previewOid,
                            contentId: row.id
                        });
                    } else {
                        this.$message.warning(this.i18n.noSupported);
                    }
                });
            },
            // 预览
            previewAttach(row) {
                this.currentRow = row;
                this.$refs.filePreview.isSupportedView(row.name).then((isSupported) => {
                    if (isSupported) {
                        ErdcKit.previewFile({
                            fileName: row.name,
                            oid: this.previewOid,
                            fileId: row.fileId || row.storeId,
                            contentId: row.id,
                            authCode: row.authCode || row.authorizeCode
                        })
                    } else {
                        this.$message.warning(this.i18n.noSupported);
                    }
                });
            },
            switchToEdit() {
                this.editAttach(this.currentRow);
            },
            // 删除
            deleteAttach(row) {
                let { getFileData, i18n } = this;
                this.$confirm(this.i18n['是否删除附件'], this.i18n['确认删除'], {
                    distinguishCancelAndClose: true,
                    customClass: 'cancelDelete',
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                }).then(async () => {
                    // 详情页删除需要调用接口刷新对象数据
                    if (this.readonly) {
                        let oid = this.oid;
                        if (this.getObjectState() === CHECKED_IN_TYPE) {
                            const resp = await this.handleCheckout();
                            if (!resp?.success) {
                                return;
                            }
                            oid = resp?.data?.rawData?.oid?.value;
                        }
                        const resp = await this.deleteAttachmentApi({ data: [row.id], objectOid: oid });
                        if (resp?.success) {
                            this.$message.success(i18n['删除成功']);
                            if (this.oid !== oid) {
                                this.vm?.refresh(oid);
                                // this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                                //     const { route } = this.$router.resolve({
                                //         name: this.$route?.name,
                                //         params: {
                                //             ...this.$route?.params,
                                //             oid
                                //         },
                                //         query: this.$route?.query
                                //     })
                                //     // 路由替换
                                //     this.$router.replace(route);
                                //     // 路由强制刷新
                                //     this.vm.$emit('route-refresh');
                                // });
                            } else {
                                // 只用刷新附件列表
                                getFileData({});
                            }
                            // 组件强制刷新
                            // this.vm.$emit('component-refresh');
                        }
                    } else {
                        this.removeFile(row);
                    }
                });
            },
            // 附件删除接口
            deleteAttachmentApi({ data, objectOid }) {
                return this.$famHttp({
                    method: 'DELETE',
                    url: this.innerDeleteAttachUrl,
                    headers: {
                        'Content-type': 'application/json'
                    },
                    data,
                    params: {
                        objectOid, //要删除检出对象的oid
                        className: this.className
                    }
                });
            },
            removeFile(row) {
                if (row.actionFlag == 0) {
                    row.actionFlag = actionFlagMap.delete;
                    // 修复编辑状态下删除url后 保存页面 附件没有id参数的问题
                    if (this.oid && this.editFileIds.indexOf(row.id) === -1) {
                        this.editFileIds.push(row.id);
                    }
                } else {
                    this.innerTableData = _.filter(this.innerTableData, (item) => item !== row);
                }
            },
            // 下载
            download(row) {
                if (row.source !== FileType) {
                    return this.$message.warning(this.i18n['URL不支持下载']);
                }
                ErdcKit.downloadFile(row.storeId || row.fileId, row.authorizeCode || row.authCode)
            },
            // 获取文件列表
            getFileData({ objectOid, roleType, className, actionFlag }) {
                this.$famHttp({
                    url: this.innerAttachListUrl,
                    method: 'GET',
                    params: {
                        objectOid: objectOid || this.oid,
                        roleType: roleType || this.innerRoleType
                    },
                    className: className || this.className
                }).then((res) => {
                    let result = res.data.attachmentDataVoList.map((item) => {
                        let source = item.source + '';
                        return Object.assign(
                            {
                                ...item,
                                actionFlag: actionFlag || actionFlagMap.NoOperate,
                                name: item.displayName,
                                createTime: item.createTime,
                                updateTime: item.updateTime,
                                id: item.id,
                                source: source,
                                role: item.role,
                                description: item.description,
                                standardIconStr: item.standardIconStr,
                                isDownlad: res.data.isDownlad,
                                isModifyContent: res.data.isModifyContent,
                                isRead: res.data.isRead
                            },
                            source === FileType
                                ? {
                                      size: cbbUtils.formatSize(item.size),
                                      sizeNumber: item.size
                                  }
                                : {
                                      urlLocation: item.urlLocation
                                  }
                        );
                    });
                    this.innerTableData = result;
                });
            },
            submit(isSaveDraft) {
                return new Promise((resolve) => {
                    let data = this.innerTableData.map((i) => {
                        let actionFlag = i.actionFlag;
                        if (!actionFlag) {
                            if (this.editFileIds.indexOf(i.id) > -1) {
                                actionFlag = 2;
                            } else {
                                actionFlag = 0;
                            }
                        }
                        let result = {
                            source: i.source,
                            role: i.role || 'SECONDARY',
                            actionFlag: actionFlag,
                            description: i.description,
                            location: 'REMOTE'
                        };
                        if (i.source === FileType) {
                            result.id = i.id;
                            result.name = i.name;
                            result.fileSize = i.sizeNumber || i.size;
                        }
                        if (i.source === URLType) {
                            if (this.editFileIds.indexOf(i.id) > -1) {
                                result.id = i.id;
                            }
                            result.displayName = i.name;
                            result.urlLocation = i.urlLocation;
                        }
                        return result;
                    });

                    // 保持为草稿直接抛出数据，否则就要校验url的必填
                    if (isSaveDraft) {
                        // 过滤掉附件中名称和地址都为空的URL数据
                        data = data.filter(
                            (item) =>
                                !(item.source === URLType && _.isEmpty(item.displayName) && _.isEmpty(item.urlLocation))
                        );
                        resolve({ data, status: true });
                    } else {
                        // 校验文件中的url是否填写了名称和url地址
                        const status = !data.some((file) => {
                            if (file.source === URLType) {
                                return _.isEmpty(file.displayName) || _.isEmpty(file.urlLocation);
                            }
                        });
                        if (!status) this.$message.warning(this.i18n['请填写附件url或标签名']);
                        resolve({ data, status });
                    }
                });
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
            // 控制行编辑
            beforeEditMethod({ row }) {
                return !this.readonly && row.source === this.urlType;
            }
        }
    };
});
