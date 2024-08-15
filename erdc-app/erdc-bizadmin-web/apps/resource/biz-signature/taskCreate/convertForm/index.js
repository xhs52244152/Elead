define([
    'text!' + ELMP.resource('biz-signature/taskCreate/convertForm/index.html'),
    ELMP.resource('biz-signature/CONST.js'),
    'css!' + ELMP.resource('biz-signature/index.css')
], function (tmpl, CONST) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template: tmpl,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamUpload: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamUpload/index.js')),
            FormatParams: ErdcKit.asyncComponent(ELMP.resource('biz-signature/taskCreate/formatParams/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'biz-signature'),
                i18nMappingObj: this.getI18nKeys([
                    'convertList',
                    'startConvert',
                    'clickUpload',
                    'sourceFile',
                    'sourFileType',
                    'goalFileType',
                    'fileExist',
                    'convertFileTip',
                    'sourceTypeTip',
                    'destTypeTips',
                    'fileSubmitTips',
                    'beConverted',
                    'taskDetail',
                    'convertFileList',
                    'convertFileType',
                    'taskName'
                ]),
                formData: {
                    pdfFile: null,
                    name: '',
                    docSrcType: '',
                    docDestType: ''
                },
                convertOptions: [],
                fileFormData: {
                    fileType: ''
                },
                convertTable: [],
                labelWidth: '120px',
                taskInfoUnfold: true,
                fileInfoUnfold: true,
                tableMaxHeight: 250,
                CONST: CONST,
                sourceFileName: '',
                destOptions: [],
                convertParamDto: null
            };
        },
        computed: {
            formConfigs() {
                const { i18nMappingObj, formData } = this;
                const config = [
                    {
                        field: 'pdfFile',
                        label: i18nMappingObj.sourceFile,
                        required: true,
                        slots: {
                            component: 'pdfFile'
                        },
                        col: 24
                    },
                    {
                        field: 'name',
                        component: 'erd-input',
                        label: i18nMappingObj.taskName,
                        required: true,
                        props: {},
                        col: 24
                    },
                    {
                        field: 'docSrcType',
                        component: 'erd-input',
                        label: i18nMappingObj.sourFileType,
                        required: true,
                        readonly: true,
                        props: {},
                        col: 12
                    },
                    {
                        field: 'docDestType',
                        component: 'erd-input',
                        label: i18nMappingObj.goalFileType,
                        required: true,
                        slots: {
                            component: 'docDestType'
                        },
                        col: 12
                    }
                ];
                return config;
            },
            fileFormConfigs() {
                const { i18nMappingObj } = this;
                const config = [
                    {
                        field: 'fileType',
                        col: 12,
                        label: i18nMappingObj.beConverted,
                        required: false,
                        slots: {
                            component: 'fileType'
                        }
                    },
                    {
                        field: 'fileTable',
                        col: 24,
                        label: '',
                        required: false,
                        slots: {
                            component: 'fileTable'
                        }
                    }
                ];
                return config;
            },
            viewTableConfig() {
                const { i18nMappingObj } = this;
                const self = this;
                const tableConfig = {
                    viewOid: '', // 视图id
                    addSeq: true,
                    addOperationCol: false,
                    tableData: self.convertTable,
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
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
                        showPagination: false
                    },
                    columns: [
                        {
                            attrName: 'name', // 属性名
                            label: i18nMappingObj.convertFileType, // 字段名
                            sortAble: false, // 是否支持排序
                            minWidth: 250
                        }
                    ]
                };
                return tableConfig;
            }
        },
        mounted() {
            this.initConvertSelect();
        },
        methods: {
            handleRemovePdf(file, fileList) {
                this.formData.pdfFile = null;
                this.sourceFileName = '';
                this.formData.docSrcType = '';
                this.formData.name = '';
                this.destOptions = [];
            },
            handleExceed(files, fileList) {
                this.$message({
                    message: this.i18nMappingObj.fileExist,
                    type: 'warning'
                });
            },
            onFileUploadSuccess(response, file) {
                this.formData.pdfFile = response.data;
                this.sourceFileName = file.name;
                this.formData.name = file.name;
                this.formData.docSrcType = file.name.substring(file.name.lastIndexOf('.') + 1);
                this.destOptions = CONST.convertFileList.find((item) => item.id === this.formData.docSrcType)?.list;
            },
            submit() {
                if (!this.formData.pdfFile) {
                    return this.$message({
                        message: this.i18nMappingObj.convertFileTip,
                        type: 'error'
                    });
                } else {
                    return this.$refs.taskDetailForm.submit().then((result) => {
                        if (result.valid) {
                            this.$famHttp({
                                url: '/doc/convert/console/v1/sync/task',
                                method: 'POST',
                                data: {
                                    sourceFileId: this.formData.pdfFile,
                                    name: this.formData.name,
                                    srcType: this.formData.docSrcType,
                                    destType: this.formData.docDestType,
                                    sourceFileName: this.sourceFileName,
                                    className: 'erd.cloud.signature.entity.SignatureTmpl'
                                }
                            }).then((res) => {
                                if (res?.success) {
                                    this.$message({
                                        message: this.i18nMappingObj.fileSubmitTips,
                                        type: 'success'
                                    });
                                }
                                this.formData.name = '';
                                this.formData.pdfFile = null;
                                this.formData.docSrcType = '';
                                this.formData.docDestType = '';
                            });
                        } else {
                            return Promise.reject();
                        }
                    });
                }
            },
            initConvertSelect() {
                this.convertOptions = CONST.convertFileList;
                this.fileFormData.fileType = this.convertOptions[0].id;
                this.convertTable = this.convertOptions[0].list;
            },
            changeFile(value) {
                this.fileFormData.fileType = value;
                const temp = this.convertOptions.find((item) => item.id === value);
                this.convertTable = temp.list;
                this.$refs.convertTable?.fnRefreshTable();
            },
            openConfig() {
                this.$refs.paramsDiolog.show();
            },
            saveParams(params) {
                this.convertParamDto = params;
            }
        }
    };
});
