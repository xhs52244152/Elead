define([
    'text!' + ELMP.resource('biz-signature/taskCenter/index.html'),
    ELMP.resource('platform-storage/api.js'),
    ELMP.resource('biz-signature/CONST.js'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-signature/index.css')
], function (tmpl, api, CONST, FamUtils) {
    const FamKit = require('fam:kit');
    return {
        template: tmpl,
        props: {
            showPageTitle: {
                type: Boolean,
                default: true
            }
        },
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js')),
            TaskCreate: FamKit.asyncComponent(ELMP.resource('biz-signature/taskCreate/index.js')),
            TaskFrom: FamKit.asyncComponent(ELMP.resource('biz-signature/taskCenter/taskForm/index.js')),
            FamFilePreview: FamKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'biz-signature'),
                i18nMappingObj: this.getI18nKeys([
                    'convert',
                    'deleteSuccess',
                    'deleteConfirm',
                    'deleteBtn',
                    'taskReset',
                    'download',
                    'delete',
                    'confirm',
                    'cancel',
                    'retry',
                    'view',
                    'taskCenter',
                    'create',
                    'more',
                    'watermarkTask',
                    'signatureSign',
                    'deleteConfirm',
                    'preview',
                    'errorLog',
                    'viewLog',
                    'close',
                    'operate'
                ]),
                dialogVisiable: false,
                //userSite: null,
                rowList: null
            };
        },
        computed: {
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            },
            userId() {
                return this.$store.state.app.user?.id || '';
            },
            viewTableConfig() {
                const self = this;
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addSeq: true,
                    addOperationCol: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/file/task/center/v1/list', // 表格数据接口
                        method: 'POST', // 请求方法（默认get）
                        data: {
                            className: 'erd.cloud.signature.entity.SignatureTmpl',
                            createBy: self.showPageTitle ? '' : self.userId
                        },
                        transformResponse: [
                            (data) => {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    const records = parseData?.data?.data || [];
                                    records.forEach((item) => {
                                        if (item?.result) {
                                            const result = JSON.parse(item?.result);
                                            this.$refs.filePreview?.isSupportedView(result.fileName).then((res) => {
                                                this.$set(item, 'isSupport', res);
                                            });
                                        } else {
                                            this.$set(item, 'isSupport', false);
                                        }
                                    });
                                    parseData.data.records = records;
                                    resData = parseData;
                                } catch (error) {
                                    resData = data && JSON.parse(data);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: '请输入', // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
                        },
                        mainBtn: {
                            label: self.i18nMappingObj.create,
                            onclick() {
                                self.$refs.taskCreateModal.show();
                            }
                        }
                    },
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        align: 'left', // 全局文本对齐方式
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true // 溢出隐藏显示省略号
                    },
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'index', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: '名称', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 250,
                            fixed: 'left'
                        },
                        {
                            attrName: 'name', // 属性名
                            label: '类型', // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'statusName', // 属性名
                            label: '状态', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        },
                        {
                            attrName: 'errorMessage', // 属性名
                            label: '异常信息', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 70
                        },
                        {
                            attrName: 'startTime', // 属性名
                            label: '开始时间', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'finishTime', // 属性名
                            label: '结束时间', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'createByName', // 属性名
                            label: '创建人', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'createTime', // 属性名
                            label: '创建时间', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'operation', // 属性名
                            label: '操作', // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 85
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'name', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: 'errorMessage',
                            type: 'default'
                        }
                    ],
                    fieldLinkConfig: {
                        fieldLink: true,
                        fieldLinkName: 'displayName',
                        linkClick: (row) => {
                            this.getMore(row);
                        }
                    }
                };
                return tableConfig;
            },
            errorTableColumns() {
                return [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'location',
                        title: '位置',
                        minWidth: 120
                    },
                    {
                        prop: 'message',
                        title: '错误信息',
                        minWidth: 120
                    }
                ];
            },
            taskTypeList() {
                return CONST.taskTypeList;
            }
        },
        methods: {
            handlerDownloadTaskFile(row) {
                if (row.result) {
                    let result = JSON.parse(row.result);
                    if (result && result.fileId) {
                        FamUtils.downloadFile({
                            fileId: result.fileId,
                            authCode: row.authorizeCode,
                            fileName: result.fileName
                        });
                    } else {
                        this.$message.warning('该任务没有fileId');
                    }
                } else {
                    this.$message.warning('该任务没有fileId');
                }
            },
            handlerDeleteTask(row) {
                this.$confirm(`${this.i18nMappingObj.deleteConfirm}?`, this.i18nMappingObj.deleteBtn, {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                })
                    .then(() => {
                        this.$famHttp('/fam/export/delete', {
                            method: 'DELETE',
                            params: {
                                id: row.id
                            }
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess,
                                showClose: true
                            });
                            this.$refs.importAndExportTaskTable?.fnRefreshTable();
                        });
                    })
                    .catch(() => {});
            },
            handlerReviewError(row) {
                const errorMsg = row.errorMsg || '';
                let formatErrorMsg = '';
                try {
                    formatErrorMsg = JSON.parse(errorMsg);
                } catch (error) {
                    formatErrorMsg = errorMsg;
                }
                this.isTextErrorMsgType = typeof formatErrorMsg === 'string' || typeof formatErrorMsg === 'number';
                if (this.isTextErrorMsgType) {
                    this.errorMsg4Text = formatErrorMsg;
                } else {
                    this.errorMsg4Table = formatErrorMsg.map((item, index) => {
                        return {
                            id: index,
                            location: `${item.sheetName ? item.sheetName + '：' : ''}第${item.row}行、第${
                                item.column
                            }列`,
                            message: item.message
                        };
                    });
                }
                this.dialogVisiable = true;
            },
            handlerRetryTask(row) {
                this.$famHttp('/fam/job/retryInstance', {
                    method: 'POST',
                    params: {
                        instanceId: row.jobInstanceId
                    }
                }).then((resp) => {
                    if (resp.success) {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj.taskReset
                        });
                    }
                    this.$refs.importAndExportTaskTable?.fnRefreshTable();
                });
            },
            submitTask() {
                this.$refs.importAndExportTaskTable?.fnRefreshTable();
            },
            getMore(row) {
                this.rowList = row;
                this.$refs.taskFormDrawer?.show();
            },
            viewTask(row) {
                const result = JSON.parse(row.result);
                this.$refs.filePreview.preview({
                    fileName: result.fileName,
                    fileId: result.fileId,
                    authCode: row?.authorizeCode
                });
            },
            handleCommand(command, row) {
                switch (command) {
                    case 'preview':
                        this.viewTask(row);
                        break;
                    case 'retry':
                        this.handlerRetryTask(row);
                        break;
                    case 'download':
                        this.handlerDownloadTaskFile(row);
                        break;
                    case 'delete':
                        this.handlerDeleteTask(row);
                        break;
                }
            },
            downloadLog() {
                const textContent = document.querySelector('.error-dialog-main-content').textContent;
                var blob = new Blob([textContent], { type: 'text/plain' });
                var a = document.createElement('a');
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = `${this.i18nMappingObj.errorLog}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }
        }
    };
});
