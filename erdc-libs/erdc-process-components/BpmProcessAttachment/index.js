define([
    'text!' + ELMP.resource('erdc-process-components/BpmProcessAttachment/index.html'),
    'css!' + ELMP.resource('erdc-process-components/BpmProcessAttachment/style.css'),
    'vue',
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template,
        components: {
            FamUploadFileList: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUploadFileList/index.js')),
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            BpmAvatar: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmAvatar/index.js'))
        },
        props: {
            action: {
                type: String,
                default: '/bpm/procinst/attachment/upload'
            },
            headers: {
                type: Object,
                default() {
                    return {
                        Authorization: localStorage.getItem('accessToken')
                    };
                }
            },
            originalAttachments: {
                type: Array,
                default() {
                    return [];
                }
            },
            readonly: Boolean,
            showUpload: {
                type: Boolean,
                default: true
            },
            oid: {
                type: String,
                default: ''
            },
            isSecret: Boolean,
            securityLabel: String,
            reference: [Object, String]
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-process-components/BpmProcessAttachment/locale/index.js'),
                attachments: [],
                currentIndex: ''
            };
        },
        computed: {
            className() {
                return this.$store.getters.className('processInstance');
            },
            column() {
                return [
                    {
                        prop: 'fileName',
                        width: 'fit',
                        title: this.i18n.attachmentName // 附件名称
                    },
                    {
                        prop: 'extension',
                        width: 100,
                        title: this.i18n.type // 类型
                    },
                    {
                        prop: 'fileSize',
                        width: 100,
                        title: this.i18n.size // 大小
                    },
                    {
                        prop: 'uploadBy',
                        width: 160,
                        type: 'user',
                        title: this.i18n.uploader // 上传人
                    },
                    {
                        prop: 'uploadTime',
                        width: 160,
                        type: 'date',
                        title: this.i18n.uploadTime // 上传时间
                    },
                    {
                        prop: 'operation',
                        width: 220,
                        fixed: 'right',
                        title: this.i18n.operation // 操作
                    }
                ];
            },
            operationButtons() {
                return [
                    {
                        type: 'text',
                        enabled: true,
                        children: [
                            {
                                name: 'delete',
                                displayName: this.i18n.delete,
                                enabled: !this.readonly
                            },
                            {
                                name: 'preview',
                                displayName: this.i18n.preview,
                                enabled: !this.readonly
                            },
                            {
                                name: 'download',
                                displayName: this.i18n.download,
                                enabled: !this.readonly
                            }
                        ]
                    }
                ];
            }
        },
        watch: {
            originalAttachments: {
                immediate: true,
                handler(value) {
                    const data = ErdcKit.deepClone(value);
                    _.each(data, (item) => {
                        const { createBy, createUser, updateBy, updateUser, id } = item;
                        if (createBy) {
                            item.createBy = [createUser];
                        }
                        if (updateBy) {
                            item.updateBy = [updateUser];
                        }
                        item.contentId = id;
                        item.fileId = item.storeId;
                        item.oid = this.oid;
                        delete item.id;
                    });
                    this.attachments = data;
                }
            }
        },
        methods: {
            /**
             * 字节大小单位转换
             * @param bytes 字节
             * @returns {string}
             */
            fileSizeFormat(bytes) {
                if (+bytes === 0) {
                    return '0 B';
                }
                let k = 1024,
                    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                    i = ~~(Math.log(bytes) / Math.log(k));
                return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
            },
            onClick() {
                this.$refs.uploadTable.clickUpload();
            },
            onSuccess(resp) {
                if (_.isNumber(this.currentIndex)) {
                    this.attachments.splice(this.currentIndex, 1);
                    this.currentIndex = '';
                }
                if (resp.success && resp.data?.length) {
                    this.attachments = _.union(this.attachments, resp.data);
                    this.$message.success(resp.message);
                } else {
                    this.$message.error(resp.message);
                }
            },
            onError() {
                // do nothing
            },
            onRemove() {
                // do nothing
            },
            beforeUpload(file) {
                const maxSize = 50 * 1024 * 1024; // 50MB
                if (file.size > maxSize) {
                    this.$message.warning(`${this.i18n.cannotExceed} ${maxSize / 1024 / 1024}MB`); // 文件大小不能超过
                    return false;
                }
                return true;
            },
            downloadAttachment(index) {
                const attachments = this.attachments[index];
                const id = attachments?.url;
                this.$famHttp({
                    url: `/bpm/procinst/attachment/download/${id}`,
                    method: 'GET',
                    responseType: 'blob'
                }).then((resp) => {
                    const url = window.URL.createObjectURL(resp.data);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = attachments?.name;
                    link.click();
                });
            },
            replaceAttachment(index) {
                this.currentIndex = index;
                $('.bpm-process-attachment').find('.upload-btn').click();
            },
            deleteAttachment(index) {
                this.$confirm(
                    this.i18n.confirmDelete, // 确认删除?
                    this.i18n.info // 提示
                ).then(() => {
                    this.attachments.splice(index, 1);
                    this.$message.success(this.i18n.deleteSuccess); // 删除成功
                });
            },
            async getData() {
                const result = await this.$refs.uploadTable.submit();
                return {
                    uploadFileIds: _.chain(result.files)
                        .filter((a) => !_.some(this.attachments, { contentId: a.contentId }))
                        .map((i) => i.contentId)
                        .value(),
                    deleteFileIds: _.chain(this.attachments)
                        .filter((a) => !_.some(result.files, { contentId: a.contentId }))
                        .map((i) => i.contentId)
                        .value()
                };
            }
        }
    };
});
