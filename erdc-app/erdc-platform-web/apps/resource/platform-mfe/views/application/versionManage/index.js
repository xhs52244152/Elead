define([
    'text!' + ELMP.resource('platform-mfe/views/application/versionManage/index.html'),
    ELMP.resource('platform-mfe/CONST.js'),
    ELMP.resource('platform-mfe/api.js'),
    'erdc-kit'
], function (tmpl, CONST, api, FamUtils) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: tmpl,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamEmpty: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js'))
        },
        props: {
            id: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: '版本管理'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-mfe/locale'),
                visible: false,
                sourceVisible: false,
                fileList: [],
                versionVisible: false,
                formData: {
                    desc: ''
                },
                isEdit: false,
                CONST: CONST,
                viewTableHeight: 300,
                rowId: '',
                fileId: ''
            };
        },
        computed: {
            viewTableConfig() {
                const self = this;
                const { i18nMappingObj } = this;
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addSeq: true,
                    addOperationCol: false,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/platform/mfe/apps/version/page', // 表格数据接口
                        method: 'GET', // 请求方法（默认get）
                        data: {
                            id: self.id
                        },
                        transformResponse: [
                            (data) => {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    const records = parseData?.data?.records || [];
                                    parseData.data.records = records;
                                    resData = parseData;
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: i18nMappingObj.versionPlac, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '280'
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
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    columns: [
                        {
                            attrName: 'pkgVersion', // 属性名
                            label: i18nMappingObj.version, // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'createTime', // 属性名
                            label: i18nMappingObj.publishTime, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'hasSource', // 属性名
                            label: i18nMappingObj.sourceCode, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            width: 50
                        },
                        {
                            attrName: 'versionDesc', // 属性名
                            label: i18nMappingObj.versionDesc, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        },
                        {
                            attrName: 'operation', // 属性名
                            label: i18nMappingObj.operation, // 字段名
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 200
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'pkgVersion', // 当前字段使用插槽
                            type: 'default'
                        },
                        {
                            prop: 'hasSource',
                            type: 'default'
                        },
                        {
                            prop: 'versionDesc',
                            type: 'default'
                        },
                        {
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                    ]
                };
                return tableConfig;
            },
            formConfigs() {
                const { isEdit } = this;
                const config = [
                    {
                        field: 'desc',
                        label: '',
                        required: false,
                        col: 24,
                        component: 'erd-input',
                        props: {
                            type: 'textarea',
                            rows: 10,
                            maxlength: 1000
                        },
                        readonly: !isEdit
                    }
                ];
                return config;
            },
            noData() {
                return this.i18nMappingObj.noData;
            }
        },
        methods: {
            show() {
                this.visible = true;
                this.refreshTable();
            },
            submit() {
                this.$refs.addForm.submit().then(() => {
                    this.visible = false;
                });
            },
            cancel() {
                this.visible = false;
            },
            handleMoreAction(command, row) {
                switch (command) {
                    case 'uploadSource':
                        this.openSource(row);
                        break;
                    case 'downSource':
                        this.downSource(row);
                        break;
                    case 'deleteSource':
                        this.deleteSource(row);
                        break;
                }
            },
            openSource(row) {
                this.rowId = row.id;
                this.sourceVisible = true;
            },
            submitSource() {
                api.updateVersionInfo(this.rowId, { sourceCodeFileId: this.fileId }).then((res) => {
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '保存成功',
                            showClose: true
                        });
                        this.refreshTable();
                        this.handleRemove();
                        this.sourceVisible = false;
                    }
                });
            },
            cancelSource() {
                this.sourceVisible = false;
            },
            handleSuccess(file, response, fileList) {
                if (file.success) {
                    this.fileList = fileList;
                    this.fileId = file.data;
                } else {
                    this.$message({
                        message: file.message,
                        type: 'error'
                    });
                    this.handleRemove();
                }
            },
            handleRemove() {
                this.fileList = [];
                this.fileId = '';
            },
            onBeforeUpload(file) {
                const type = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
                if (['.zip', '.tgz'].indexOf(type) === -1) {
                    this.$message({
                        message: this.i18nMappingObj.zipTips,
                        type: 'warning'
                    });
                    return false;
                }
            },
            openVersion(row) {
                this.rowId = row.id;
                this.formData.desc = row.versionDesc || '';
                this.isEdit = false;
                this.versionVisible = true;
            },
            downSource(row) {
                FamUtils.downloadFile(row.sourceCodeFileId, row.sourceCodeFileAuthorizeCode);
            },
            deleteSource(row) {
                this.$confirm(`确认要删除${row.pkgVersion}版本源码包？`, '删除确认', {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    api.updateVersionInfo(row.id, { sourceCodeFileId: '' }).then((res) => {
                        if (res.success) {
                            this.$message({
                                type: 'success',
                                message: '保存成功',
                                showClose: true
                            });
                            this.refreshTable();
                        }
                    });
                });
            },
            updateVersion(row) {
                this.$confirm(`确认要使用${row.pkgVersion}版本？`, '使用确认', {
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    const loading = this.$loading({
                        body: true,
                        fullscreen: true,
                        lock: true,
                        background: 'transparent'
                    });
                    const srcId = this.$refs.versionManageTable?.tableData.find((item) => item.isCurrent)?.id;
                    let params = {
                        srcId,
                        targetId: row.id
                    };
                    api.changeVersion(params).then((res) => {
                        if (res.success) {
                            this.$message({
                                type: 'success',
                                message: '更新成功',
                                showClose: true
                            });
                            this.$emit('done', row.id);
                            this.refreshTable();
                        }
                        loading.close();
                    });
                });
            },
            cancelVesion() {
                this.versionVisible = false;
            },
            editDesc() {
                this.isEdit = true;
            },
            saveDesc() {
                api.updateVersionInfo(this.rowId, { versionDesc: this.formData.desc }).then((res) => {
                    if (res.success) {
                        this.$message({
                            type: 'success',
                            message: '保存成功',
                            showClose: true
                        });
                        this.refreshTable();
                        this.$emit('done');
                        this.versionVisible = false;
                        this.isEdit = false;
                    }
                });
            },
            refreshTable() {
                this.$refs.versionManageTable?.fnRefreshTable();
            },
            getSource(row) {
                const { i18nMappingObj } = this;
                return row.sourceCodeFileId ? i18nMappingObj.have : i18nMappingObj.none;
            }
        }
    };
});
