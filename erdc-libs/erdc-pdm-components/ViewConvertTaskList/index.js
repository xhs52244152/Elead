define(['text!' + ELMP.resource('erdc-pdm-components/ViewConvertTaskList/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ViewConvertTaskList',
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-pdm-components/ViewConvertTaskList/locale/index.js'),
                dialogVisible: false,
                isTextErrorMsgType: true,
                errorMsg4Text: '',
                errorMsg4Table: []
            };
        },
        computed: {
            viewTableConfig() {
                const tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addSeq: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/export/myList', // 表格数据接口
                        data: {
                            appName: '',
                            jobNames: ['CreateViewJob']
                        }, // body参数
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (data) => {
                                // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                // 对接收的 data 进行任意转换处理
                                let resData = data;
                                try {
                                    const parseData = data && JSON.parse(data);
                                    const records = parseData?.data?.data || [];
                                    parseData.data.records = records;
                                    resData = parseData;
                                } catch (error) {
                                    console.error(error);
                                }
                                return resData;
                            }
                        ]
                    },
                    fieldLinkConfig: {
                        fieldLink: false,
                        // 是否添加列超链接
                        fieldLinkName: 'displayName', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        // linkClick: (row) => {
                        //     // 超链接事件
                        // }
                    },
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18n.pleaseEnterName, // 输入框提示文字，默认请输入
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
                        indexKey: 'index', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    columns: [
                        {
                            attrName: 'displayName', // 属性名
                            label: this.i18n.name, // 名称
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 250,
                            fixed: 'left'
                        },
                        {
                            attrName: 'statusName', // 属性名
                            label: this.i18n.status, // 状态
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'infoMsg', // 属性名
                            label: this.i18n.businessInfo, // 业务信息
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'errorMessage', // 属性名
                            label: this.i18n.abnormalInfo, // 异常信息
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'createTime', // 属性名
                            label: this.i18n.createTime, // 创建时间
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 150
                        },
                        {
                            attrName: 'createByName', // 属性名
                            label: this.i18n.createBy, // 创建人
                            description: '', // 描述
                            sortAble: false, // 是否支持排序
                            minWidth: 100
                        }
                    ],
                    slotsField: [
                        {
                            prop: 'errorMessage',
                            type: 'default'
                        }
                    ]
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
                        title: this.i18n.position, // 位置
                        minWidth: 120
                    },
                    {
                        prop: 'message',
                        title: this.i18n.errorInfo, // 错误信息
                        minWidth: 120
                    }
                ];
            }
        },
        methods: {
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
                        const rowText = item.row ? '第' + item.row + '行' : '';
                        const columnText = item.column ? '第' + item.column + '列' : '';
                        return {
                            id: index,
                            location: `${item.sheetName ? item.sheetName : ''}${rowText && columnText && item.sheetName ? '：' : ''
                                }${rowText}${rowText && columnText ? '、' : ''}${columnText}`,
                            message: item.message
                        };
                    });
                }
                this.dialogVisible = true;
            }
        }
    };
});
