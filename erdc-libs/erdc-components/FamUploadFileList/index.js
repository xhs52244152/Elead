define([
    'text!' + ELMP.resource('erdc-components/FamUploadFileList/index.html'),
    'css!' + ELMP.resource('erdc-components/FamUploadFileList/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    /**
     * 文件大小显示计算
     * @param {Number|String} size 文件大小
     * @param {String} unit 初始数据单位，默认为字节，可选值参考units
     * @returns 返回文件大小显示值 xxx MB
     */
    function formatSize(size, unit) {
        let units = ['B', 'KB', 'MB', 'GB', 'T'];

        let handler = (size, level) => {
            if (size > 1024) return handler(size / 1024, level + 1);
            else return `${size.toFixed(2)} ${units[level]}`;
        };

        let sizeNumber = Number(size);
        let startIndex = unit ? units.indexOf(unit.toUpperCase()) || 0 : 0;

        return handler(sizeNumber, startIndex);
    }

    return {
        name: 'FamUploadFileList',
        template,
        components: {
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js')),
            FamUser: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUser/index.js'))
        },
        props: {
            // 能否上传多个
            multiple: Boolean,
            // 只读模式
            readonly: Boolean,
            // 是否显示上传按钮
            showUpload: {
                type: Boolean,
                default: true
            },
            // 自定义列头
            columns: Array,
            // 自定义附件数据
            tableData: Array,
            //是否需要操作列
            addOperation: {
                type: Boolean,
                default: true
            },
            addSeq: {
                type: Boolean,
                default: true
            },
            // 操作按钮本身
            operationButtons: Array,
            // 操作按钮对应的处理方法
            operateHandler: Object,
            operateDisabledValidate: Function,
            className: String,
            securityLabel: String,
            isNeedSecurity: Boolean,
            reference: [Object, String],
            mapColumns: {
                type: Function,
                default: (columns) => columns
            },
            tableProps: {
                type: Object,
                default: () => ({})
            }
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamUploadFileList/locale/index.js'),
                // 附件数据
                innerTableData: [],
                loading: false
            };
        },
        computed: {
            isNeedEdit: function () {
                let btns = this.innerOperationButtons.children || [];
                return !!btns.find((i) => i.name === 'edit');
            },
            innerIsNeedSecurity: function () {
                if (this.isNeedSecurity) {
                    return true;
                }
                if (this.securityLabel) {
                    return !!this.securityLabel;
                }
                return false;
            },
            // 附件密级是否允许编辑，开启则可以编辑，可以不完全跟随主对象的密级
            contentSecurityEdit: function () {
                return this.innerIsNeedSecurity && this.$store.state.app.threeMemberOtherConfig?.contentSecurityEdit;
            },
            securityLabels: function () {
                let result = [];
                if (!this.innerIsNeedSecurity) {
                    return result;
                }
                let currentSecurityLabel = this.securityLabel
                    ? this.$store.state.common.securityLabels.find((i) => i.name === this.securityLabel)
                    : this.$store.state.common.securityLabels[0];
                currentSecurityLabel = currentSecurityLabel || this.$store.state.common.securityLabels[0];
                let userSecurity = this.$store.state.app.user.securityLabel;
                let userSecurityLabel = userSecurity
                    ? this.$store.state.common.securityLabels.find((i) => i.name === userSecurity)
                    : this.$store.state.common.securityLabels[0];
                userSecurityLabel = userSecurityLabel || this.$store.state.common.securityLabels[0];
                if (currentSecurityLabel && userSecurityLabel) {
                    let minSecurity =
                        currentSecurityLabel.order * 1 < userSecurityLabel.order * 1
                            ? currentSecurityLabel
                            : userSecurityLabel;
                    this.$store.state.common.securityLabels.forEach((i) => {
                        if (i.order <= minSecurity.order) {
                            result.push({
                                label: i.value,
                                value: i.name
                            });
                        }
                    });
                }
                return result;
            },
            securityLabelsMap: function () {
                let map = {};
                this.securityLabels.forEach((i) => {
                    map[i.value] = i;
                });
                return map;
            },
            innerOperateHandler: function () {
                return Object.assign(
                    {
                        preview: this.previewAttach,
                        edit: this.editAttach,
                        delete: this.deleteAttach,
                        download: this.download
                    },
                    this.operateHandler || {}
                );
            },
            innerOperationButtons: function () {
                return (rowData) => {
                    let operationButtons;
                    let self = this;
                    if (this.operationButtons && this.operationButtons.length) {
                        operationButtons = ErdcKit.deepClone(this.operationButtons);
                        operationButtons.forEach((i) => {
                            if (i.children && i.children.length) {
                                i.children.forEach((ii) => (ii.enabled = !self.readonly));
                            }
                        });
                    } else {
                        operationButtons = [
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
                                        name: 'edit',
                                        displayName: this.i18n['编辑'],
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
                    operationButtons[0].children = operationButtons[0].children.filter((action) => {
                        if (action.name === 'download') {
                            return !self.readonly && rowData.authorizeCode;
                        } else if (action.name === 'edit') {
                            return !self.readonly && !rowData.oid && !rowData.contentId;
                        } else if (action.name === 'preview') {
                            return (
                                !self.readonly &&
                                ((rowData.authorizeCode && rowData.contentId) || (rowData.oid && rowData.fileId))
                            );
                        }
                        return action.enabled;
                    });
                    return operationButtons;
                };
            },
            innerColumnsDefault: function () {
                let self = this;
                if (this.columns && this.columns.length) {
                    return this.columns;
                } else {
                    return [
                        {
                            prop: 'name',
                            link: true,
                            title: this.i18n['名称'],
                            disabled: function (row) {
                                return this.readonly || !row.oid || !row.contentId;
                            }
                        },
                        this.securityLabel
                            ? {
                                  prop: 'securityLabel',
                                  title: this.i18n['密级'],
                                  editRender: {
                                      name: 'select',
                                      enabled: !this.readonly && this.contentSecurityEdit,
                                      options: this.securityLabels,
                                      events: {
                                          change: function (data) {
                                              self.batchUpdateContentFile([
                                                  {
                                                      contentId: data.row.contentId,
                                                      securityLabel: data.row.securityLabel
                                                  }
                                              ]);
                                          }
                                      }
                                  },
                                  customRender: function (row) {
                                      return row.securityLabel && self.securityLabelsMap[row.securityLabel]
                                          ? self.securityLabelsMap[row.securityLabel].label
                                          : '';
                                  },
                                  className: 'editIcon'
                              }
                            : null,
                        {
                            prop: 'size',
                            title: this.i18n['文件大小'],
                            width: 100
                        },
                        {
                            prop: 'createBy',
                            title: this.i18n['创建者'],
                            user: true,
                            width: 150
                        },
                        {
                            prop: 'createTime',
                            title: this.i18n['创建时间'],
                            width: 170
                        },
                        {
                            prop: 'updateBy',
                            user: true,
                            title: this.i18n['更新者'],
                            width: 150
                        },
                        {
                            prop: 'updateTime',
                            title: this.i18n['更新时间'],
                            width: 170
                        }
                    ].filter(Boolean);
                }
            },
            innerColumns: function () {
                let columns = this.innerColumnsDefault;
                if (this.addSeq) {
                    columns = [
                        {
                            prop: 'seq', // 列数据字段key
                            type: 'seq', // 特定类型
                            title: ' ',
                            width: 48,
                            align: 'center' //多选框默认居中显示
                        }
                    ].concat(columns);
                }
                if (this.addOperation && !this.readonly) {
                    columns = [].concat(columns, [
                        {
                            prop: 'operation',
                            title: this.i18n['操作'],
                            width: this.$store.state.i18n.lang === 'zh_cn' ? 60 : 92
                        }
                    ]);
                }
                return this.mapColumns(columns);
            }
        },
        watch: {
            securityLabel: function () {
                if (this.innerTableData && this.innerTableData.length && this.className) {
                    let updateFiles = [];
                    this.innerTableData.forEach((i) => {
                        let target = this.securityLabels.find(
                            (ii) => ii.value === (i.response?.securityLabel || i.securityLabel)
                        );
                        if (!target) {
                            updateFiles.push({
                                contentId: i.contentId,
                                securityLabel: this.securityLabels[this.securityLabels.length - 1].value
                            });
                        }
                    });
                    this.batchUpdateContentFile(updateFiles);
                }
            },
            tableData: {
                handler: function (nv) {
                    let data = ErdcKit.deepClone(nv) || [];
                    data.forEach((i) => {
                        i.size = formatSize(i.size);
                        let createBy = Array.isArray(i.createBy) ? i.createBy : [i.createBy];
                        let updateBy = Array.isArray(i.updateBy) ? i.updateBy : [i.updateBy];
                        i.createBy = _.pluck(createBy, 'oid');
                        i.updateBy = _.pluck(updateBy, 'oid');
                    });
                    this.innerTableData = data;
                },
                immediate: true
            }
        },
        methods: {
            editFileSecurityLabel(contentId, securityLabel) {
                this.batchUpdateContentFile([
                    {
                        fileId: contentId,
                        securityLabel: securityLabel
                    }
                ]);
            },
            // 批量更新附件信息
            batchUpdateContentFile(files) {
                if (files && files.length) {
                    let data = [];
                    files.forEach((i) => {
                        data.push({
                            id: i.contentId,
                            fileId: i.contentId,
                            securityLabel: i.securityLabel
                        });
                    });
                    return this.$famHttp({
                        url: '/common/content/file/update/batch',
                        method: 'POST',
                        params: {
                            className: this.className
                        },
                        data: data
                    }).then((res) => {
                        if (res.success) {
                            let updateFilesMap = {};
                            files.forEach((i) => {
                                updateFilesMap[i.contentId] = i.securityLabel;
                            });
                            this.innerTableData.forEach((i) => {
                                if (updateFilesMap[i.contentId]) {
                                    i.securityLabel = updateFilesMap[i.contentId];
                                }
                            });
                        }
                    });
                }
            },
            clickHandler(row, col) {
                if (col.prop === 'name') {
                    if (row.oid && row.contentId) {
                        this.previewAttach(row);
                    }
                }
                if (col.link) {
                    this.$emit('cell-click', row, col);
                }
            },
            extendDisabledValidate(row) {
                let self = this;
                if (_.isFunction(this.operateDisabledValidate)) {
                    return this.operateDisabledValidate;
                } else {
                    // 如果要禁用它，就返回true
                    return (action) => {
                        if (action.name === 'download') {
                            return self.readonly || !row.authorizeCode;
                        } else if (action.name === 'edit' || action.name === 'preview') {
                            return self.readonly || !row.oid || !row.contentId;
                        }
                        return !action.enabled;
                    };
                }
            },
            beforeUpload() {
                this.loading = true;
            },
            handleUpdate(data) {
                this.currentRow.fileId = data.newFileId;
                this.currentRow.createTime = data.createTime;
                this.currentRow.updateTime = data.updateTime;
                this.$emit('updateSuccess', this.currentRow, data);
            },
            previewClose() {
                this.$emit('dialogClose', this.currentRow);
            },
            onUploadSuccess(response, file) {
                this.$message.success(this.i18n?.['附件上传成功']);
                this.loading = false;
                let currentTime = window.dayjs().format('YYYY-MM-DD HH:mm:ss');
                let currentUser = this.$store.state.app.user;
                const row = {
                    name: file.name,
                    size: formatSize(file.size),
                    sizeNumber: file.size,
                    fileId: response.data,
                    contentId: this.className ? response.contentId : '',
                    securityLabel: response.securityLabel,
                    createBy: [currentUser],
                    createTime: currentTime,
                    updateBy: [currentUser],
                    updateTime: currentTime,
                    authorizeCode: response.authorizeCode
                };
                if (this.$listeners.uploadSuccess) {
                    this.$listeners.uploadSuccess(row, response, file);
                } else {
                    this.innerTableData.push(row);
                }
            },
            onUploadError(error) {
                this.loading = false;
                this.$message.error(this.i18n['上传失败']);
                this.$emit('uploadError', error);
            },
            onCommand(data, row) {
                this.innerOperateHandler[data.name](row);
            },
            // 编辑
            editAttach(row) {
                this.currentRow = row;
                this.$refs.filePreview.isSupportedEdit(row.name).then(async (isSupported) => {
                    if (!isSupported) {
                        this.$message.warning(this.i18n.noSupported);
                        return;
                    }
                    this.$refs.filePreview.edit({
                        fileName: row.name,
                        fileId: row.fileId,
                        oid: row.oid,
                        contentId: row.contentId,
                        authCode: row.authorizeCode
                    });
                });
            },
            // 预览
            previewAttach(row) {
                this.currentRow = row;
                this.$refs.filePreview.isSupportedView(row.name).then((isSupported) => {
                    if (!isSupported) {
                        this.$message.warning(this.i18n.noSupported);
                        return;
                    }
                    this.$refs.filePreview.preview({
                        fileName: row.name,
                        fileId: row.fileId,
                        oid: row.oid,
                        contentId: row.contentId,
                        authCode: row.authorizeCode
                    });
                });
            },
            switchToEdit() {
                this.editAttach(this.currentRow);
            },
            // 删除
            deleteAttach(row) {
                this.$confirm(this.i18n['是否删除附件'], this.i18n['确认删除'], {
                    distinguishCancelAndClose: true,
                    customClass: 'cancelDelete',
                    confirmButtonText: this.i18n['确定'],
                    cancelButtonText: this.i18n['取消'],
                    type: 'warning'
                }).then(async () => {
                    if (this.$listeners.deleteFiles) {
                        this.$listeners.deleteFiles(row, this.innerTableData);
                    } else {
                        this.innerTableData = _.filter(this.innerTableData, (item) => item !== row);
                    }
                });
            },
            // 下载
            download(row) {
                ErdcKit.downloadFile(row.fileId, row.authorizeCode);
            },
            // 获取文件列表
            submit() {
                return new Promise((resolve) => {
                    let ids = _.pluck(this.innerTableData, 'fileId');
                    let contentIds = _.pluck(this.innerTableData, 'contentId');
                    resolve({ ids: ids, contentIds: contentIds, files: this.innerTableData });
                });
            },
            clickUpload() {
                this.$refs.myUpload.triggerUploadClick();
            },
            getTableData() {
                return this.innerTableData;
            },
            setTableData(data) {
                this.innerTableData = data;
            }
        }
    };
});
