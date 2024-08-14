/*
组件使用

平台已经封装了上传组件，直接使用平台的上传组件，当前组件Attach后期不会维护
    上传组件： FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
    上传组件带表格： FamUploadFileList: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUploadFileList/index.js')),

*/

define([
    'erdc-kit',
    'text!' + ELMP.resource('ppm-component/ppm-components/Attach/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/Attach/index.css')
], function (famUtils, template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            oid: String,
            type: String,
            className: String,
            showTableBtn: {
                type: Boolean,
                default: true
            },
            showSearchInput: {
                type: Boolean,
                default: true
            },
            value: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            extendsProps: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            columns: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            isProcess: {
                type: Boolean,
                default: false
            },
            showCustomFooterSlot: {
                type: Boolean,
                default: false
            },
            attachType: {
                type: String,
                default: ''
            },
            uploadUrl: {
                type: String,
                default: '/ppm/content/file/upload'
            },
            tableListUrl: {
                type: String,
                default: '/ppm/content/attachment/list'
            },
            deleteUrl: {
                type: String,
                default: '/ppm/content/attachment/delete'
            },
            downloadUrl: {
                type: String,
                default: '/ppm/content/file/download'
            },
            addLinkUrl: {
                type: String,
                default: 'ppm/content/attachment/add'
            },
            // 上传文件时，表格需要的数据格式
            customDataFun: Function,
            // 获取列表数据，额外的传参
            extendParams: {
                default: () => {
                    return {};
                }
            },
            // 快速绑定附件(即上传后立即绑定到对象是，而不是通过保存按钮和其他参数保存)
            quickBinding: {
                type: Boolean,
                default: true
            },
            // 实时删除(即删除不通过保存按钮进行保存)
            realTimeDelete: {
                type: Boolean,
                default: true
            },
            // 操作下拉接口参数PPM_ATTACH_DETAIL_OP_MENU(一般用于查看，无删除按钮)、PPM_ATTACH_PER_OP_MENU(一般用于创建、编辑)
            operationConfigName: {
                type: String,
                default: 'PPM_ATTACH_PER_OP_MENU'
            }
        },
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-handle-task/locale/index.js'),
                i18nMappingObj: {
                    fileName: this.getI18nByKey('fileName'),
                    uplaodTime: this.getI18nByKey('uplaodTime'),
                    fileSize: this.getI18nByKey('fileSize'),
                    uploadState: this.getI18nByKey('uploadState'),
                    operation: this.getI18nByKey('operation'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter'),
                    clickUpload: this.getI18nByKey('clickUpload'),
                    download: this.getI18nByKey('download'),
                    delete: this.getI18nByKey('delete'),
                    cancel: this.getI18nByKey('cancel'),
                    confirm: this.getI18nByKey('confirm'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    deleteAttachTipsInfo: this.getI18nByKey('deleteAttachTipsInfo'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    uploadLimt20: this.getI18nByKey('uploadLimt20'),
                    uploadFail: this.getI18nByKey('uploadFail'),
                    uploading: this.getI18nByKey('uploading'),
                    finish: this.getI18nByKey('finish'),
                    notSupportPreview: this.getI18nByKey('notSupportPreview'),
                    downloadTips: this.getI18nByKey('downloadTips')
                },
                fileList: [],
                tableData: [],
                searchKey: '',
                selectData: [],
                previousData: [],
                tableBtn: [],
                originTableData: [] // 此数据会包含已经删除的数据,方便在提交表单是给后端传已经删除的数据(目前在配置管理-评审配置-交付件清单页签的创建和编辑用到)
            };
        },
        computed: {
            fileIds: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            tableColumns() {
                return this.columns.length
                    ? this.columns
                    : [
                          {
                              prop: 'seq', // 列数据字段key
                              type: 'seq', // 特定类型
                              title: ' ',
                              width: 48,
                              align: 'center' //多选框默认居中显示
                          },
                          {
                              minWidth: '40',
                              width: '40',
                              type: 'checkbox',
                              align: 'center'
                          },
                          {
                              prop: 'fileName',
                              title: this.i18nMappingObj['fileName'],
                              minWidth: '200'
                          },
                          {
                              prop: 'uplaodTime',
                              title: this.i18nMappingObj['uplaodTime'],
                              minWidth: '200'
                          },
                          {
                              prop: 'fileSize',
                              title: this.i18nMappingObj['fileSize'],
                              minWidth: '200'
                          },
                          {
                              prop: 'uploadState',
                              title: this.i18nMappingObj['uploadState'],
                              minWidth: '200'
                          },
                          {
                              prop: 'operation',
                              title: this.i18nMappingObj['operation'],
                              minWidth: '200',
                              width: '60'
                          }
                      ];
            }
        },
        watch: {
            oid: {
                handler(val) {
                    if (val) {
                        this.getTableData();
                    }
                },
                immediate: true
            },
            showTableBtn: {
                handler(val) {
                    if (val) {
                        if (val) this.getTableBtn();
                    }
                },
                immediate: true
            },
            previousData: {
                handler(val) {
                    if (val)
                        this.fileIds = this.tableData
                            .filter((item) => item.uploadState !== 'fail')
                            .map((item) => {
                                return item.id;
                            });
                },
                deep: true,
                immediate: true
            }
        },
        methods: {
            actionClick(data) {
                const eventClick = {
                    PPM_ATTACH_DELETE: this.batchDelete,
                    PPM_ATTACH_UPLOAD: this.uploadClick
                };
                eventClick[data.name]();
            },
            uploadClick() {
                this.$refs.myUpload.$refs['upload'].$refs['upload-inner'].handleClick();
            },
            onCommand(data, row) {
                const eventClick = {
                    PPM_DISCRETE_TASK_ATTACH_PREVIEW: this.previewAttach,
                    DOC_ATTACH_PREVIEW: this.previewAttach,
                    REVIEW_ATTACH_PREVIEW: this.previewAttach,
                    PPM_ATTACH_PREVIEW: this.previewAttach,
                    PPM_ATTACH_DELETE: this.deleteAttach,
                    REVIEW_ATTACH_DELETE: this.deleteAttach,
                    DOC_ATTACH_DELETE: this.deleteAttach,
                    REVIEW_ATTACH_DOWNLOAD: this.download,
                    PPM_APPROVAL_DOCUMENT_ATTACH_DOWNLOAD: this.download,
                    DOC_ATTACH_DOWNLOAD: this.download,
                    PPM_ATTACH_DOWNLOAD: this.download,
                    PPM_APPROVAL_DOCUMENT_ATTACH_PREVIEW: this.previewAttach,
                    PPM_ATTACH_DETAIL_PREVIEW: this.previewAttach
                };
                eventClick[data.name](row);
            },
            getActionConfig(row) {
                let oid = row?.oid || this.oid || '';

                if (oid.indexOf(this.className) < 0) {
                    oid = null;
                }
                let name = oid ? this.operationConfigName : 'PPM_ATTACH_PER_OP_MENU';

                if (window.location.href.includes('bpm-resource')) {
                    name = 'PPM_ATTACH_PER_FULL_OP_MENU';
                }
                return {
                    // FIXME: 待平台支持无oid预览时，下行应为：name: this.operationConfigName,
                    name,
                    objectOid: oid,
                    className: this.className
                };
            },
            onChange(e) {
                this.uploadFile(e);
            },
            handleExceed() {
                this.$message({
                    type: 'info',
                    message: this.i18nMappingObj.uploadLimt20
                });
            },
            changeSelect(data) {
                this.selectData = data.records;
            },
            selectAllEvent(data) {
                this.selectData = data.records;
            },
            // 预览文件
            previewAttach(row) {
                famUtils.previewFile({
                    fileName: row.fileName || row.displayName,
                    fileId: row.storeId,
                    authCode: row.authCode
                });
            },
            deleteAttach(row) {
                let failFileIds = [];
                let fileIds = [];
                if (row.uploadState !== 'finish') {
                    failFileIds = [row.uid];
                } else {
                    fileIds = [row.id];
                }
                this.delete(fileIds, failFileIds);
            },
            batchDelete() {
                if (!this.selectData.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.pleaseSelectData
                    });
                }
                let fileIds = this.selectData
                    .filter((item) => {
                        return item.uploadState === 'finish';
                    })
                    .map((item) => {
                        return item.id;
                    });
                let failFileIds = this.selectData
                    .filter((item) => {
                        return item.uploadState !== 'finish';
                    })
                    .map((item) => {
                        return item.uid;
                    });
                this.delete(fileIds, failFileIds);
            },
            delete(fileIds, failFileIds) {
                this.$confirm(this.i18nMappingObj.deleteAttachTipsInfo, this.i18nMappingObj.deleteConfirm, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    // 移除上传失败的附件
                    this.removeData(failFileIds, 'uid');
                    if (!fileIds.length) {
                        return this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.deleteSuccess
                        });
                    }
                    // 没有oid，代表是在创建页面上传附件
                    if (!this.oid || this.attachType === 'create') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.deleteSuccess
                        });
                        this.removeData(fileIds);
                        return;
                    }
                    if (this.realTimeDelete) {
                        this.$famHttp({
                            method: 'DELETE',
                            url: this.deleteUrl,
                            data: fileIds,
                            className: this.className,
                            headers: {
                                'Content-type': 'application/json'
                            },
                            params: {
                                objectOid: this.oid
                            }
                        }).then(() => {
                            this.removeData(fileIds);
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess
                            });
                            this.selectData = [];
                        });
                    } else {
                        this.removeData(fileIds);
                    }
                });
            },
            removeData(fileIds, key = 'id') {
                this.tableData = this.tableData.filter((item) => {
                    return !fileIds.includes(item[key]);
                });
                this.previousData = this.previousData.filter((item) => {
                    return !fileIds.includes(item[key]);
                });
                // actionFlag: 操作标识（0不操作，1添加，2编辑，3删除, 4主内容替换）
                // 循环遍历数据对数据进行表示判断 item.actionFlag = 1代表新上传的数据还没绑定到对象上然后又删除  item.actionFlag = 3 代表将之前绑定是数据删掉
                this.originTableData.forEach((item) => {
                    if (fileIds.includes(item[key])) {
                        item.actionFlag = item.actionFlag === 1 ? -1 : 3;
                    }
                });
                // 过滤掉item.actionFlag = -1的数据，即上传附件后又删掉(还没真正绑定到对象上)
                this.originTableData = this.originTableData.filter((item) => item.actionFlag !== -1);
                // 过滤勾选数据中已删除数据
                this.selectData = this.selectData.filter((item) => {
                    return !fileIds.includes(item[key]);
                });
            },
            download(row) {
                if (row.uploadState !== 'finish') {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.downloadTips
                    });
                }
                famUtils.downloadFile(row.storeId || row.fileId, row.authCode);
            },
            searchData() {
                if (!this.searchKey) {
                    return (this.tableData = JSON.parse(JSON.stringify(this.previousData)));
                }
                this.tableData = this.previousData.filter(
                    (item) => item.fileName.toLowerCase().indexOf(this.searchKey.toLowerCase()) !== -1
                );
                this.selectData = [];
            },
            getState(state) {
                const stateObj = {
                    loading: this.i18nMappingObj.uploading,
                    finish: this.i18nMappingObj.finish,
                    fail: this.i18nMappingObj.uploadFail
                };
                return stateObj[state];
            },
            uploadFile(e) {
                let obj = {
                    fileName: e.name,
                    uplaodTime: this.formatTime(),
                    uid: e.uid,
                    actionFlag: 1,
                    fileSize: this.formatSize(e.size),
                    uploadState: 'loading',
                    createBy: this.$store.state?.app?.user?.displayName || ''
                };
                if (_.isFunction(this.customDataFun)) obj = this.customDataFun(e);
                this.tableData.push(obj);
                this.previousData.push(obj);

                this.originTableData.push(obj);

                let formData = new FormData();
                formData.append('file', e.raw);
                this.$famHttp({
                    method: 'POST',
                    url: this.uploadUrl,
                    className: this.className,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: formData
                })
                    .then((res) => {
                        if (this.oid && this.attachType !== 'create') {
                            if (this.quickBinding) this.bindingHandleTask(res.data);
                        }
                        this.tableData.forEach((item) => {
                            if (item.uid === e.uid) {
                                item.uploadState = 'finish';
                                item.id = res.data;
                            }
                        });
                        this.previousData.forEach((item) => {
                            if (item.uid === e.uid) {
                                item.uploadState = 'finish';
                                item.id = res.data;
                            }
                        });
                    })
                    .catch(() => {
                        this.tableData.forEach((item) => {
                            if (item.uid === e.uid) {
                                item.uploadState = 'fail';
                                item.id = new Date();
                            }
                        });
                        this.previousData.forEach((item) => {
                            if (item.uid === e.uid) {
                                item.uploadState = 'fail';
                                item.id = new Date();
                            }
                        });
                    });
            },
            bindingHandleTask(id) {
                this.$famHttp({
                    url: this.addLinkUrl,
                    method: 'POST',
                    className: this.className,
                    data: {
                        attachmentDataAddInfoList: [
                            {
                                actionFlag: 1,
                                id: id,
                                role: 'SECONDARY',
                                source: 0
                            }
                        ],
                        objectReference: this.oid
                    }
                });
            },
            getTableData() {
                let params = {
                    ...{ objectOid: this.oid, roleType: 'SECONDARY' },
                    ...this.extendParams
                };

                let className = this.oid.split(':')?.[1];
                this.$famHttp({
                    url: this.tableListUrl,
                    method: 'GET',
                    className: params.className || className || this.className,
                    params
                }).then((res) => {
                    let attachmentDataVoList = res.data.attachmentDataVoList;
                    const callback = (result) => {
                        this.tableData = result;
                        this.previousData = ErdcKit.deepClone(result);

                        this.originTableData = ErdcKit.deepClone(result);
                    };
                    if (this.$listeners['after-request']) {
                        this.$emit('after-request', { data: attachmentDataVoList, callback });
                    } else {
                        let result = attachmentDataVoList.map((item) => {
                            return {
                                fileName: item.displayName,
                                uplaodTime: item.updateTime,
                                fileSize: this.formatSize(item.size),
                                id: item.id,
                                storeId: item.storeId,
                                actionFlag: 0,
                                uploadState: 'finish',
                                createBy: item?.createUser?.displayName || '',
                                authCode: item.authorizeCode,
                                fileId: item.storeId
                            };
                        });
                        callback(result);
                    }
                });
            },
            formatSize(size) {
                let result = size / 1024;
                return result >= 1024 ? (result / 1024).toFixed(2) + 'MB' : result.toFixed(2) + 'KB';
            },
            formatTime() {
                const dayjs = require('dayjs');
                return dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss');
            },
            getTableBtn() {
                this.$famHttp({
                    url: '/ppm/menu/query',
                    method: 'POST',
                    data: {
                        className: this.className,
                        objectOid: this.oid,
                        name: 'PPM_ATTACH_LIST_OP_MENU'
                    }
                })
                    .then((resp) => {
                        this.tableBtn = resp.data?.actionLinkDtos || [];
                    })
                    .catch(() => {});
            }
        }
    };
});
