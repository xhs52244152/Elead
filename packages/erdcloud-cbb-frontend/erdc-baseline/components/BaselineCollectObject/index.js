define([
    'text!' + ELMP.func('erdc-baseline/components/SelectAssociationObject/index.html'),
    ELMP.func('erdc-baseline/const.js')
], function (template, CONST) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineSelectAssociationObject',
        template,
        components: {
            famAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                layoutClass: CONST.className
            };
        },
        computed: {
            viewTableConfig: function () {
                var self = this;
                return {
                    columns: [],
                    searchParamsKey: 'searchKey',
                    isDeserialize: true, // 是否反序列数据源
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        tableKey: 200,
                        nameI18nJson: 200,
                        operation: 250
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
                    firstLoad: true,
                    tableRequestConfig: {
                        url: '/fam/search',
                        params: {}, // 路径参数
                        data: {
                            appName: ['erdcloud'],
                            className: self.layoutClass,
                            conditionDtoList: [
                                {
                                    attrName: 'layoutType',
                                    oper: 'EQ',
                                    value1: 'GLOBAL'
                                }
                            ]
                        },
                        method: 'post',
                        isFormData: false
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: true,
                        valueKey: 'attrName',
                        mainBtn: {
                            label: self.i18n.create,
                            onclick() {
                                self.visible = true;
                                self.currentRow = {};
                                self.$refs.layoutForm && self.$refs.layoutForm.reInit();
                            }
                        }
                    },
                    addOperationCol: true,
                    addCheckbox: false,
                    addSeq: true,
                    slotsField: [
                        {
                            prop: 'operation',
                            type: 'default'
                        },
                        {
                            prop: 'appName',
                            type: 'default'
                        },
                        {
                            prop: 'state',
                            type: 'default'
                        },
                        {
                            prop: 'appName',
                            type: 'filter'
                        }
                    ],
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        method: 'POST',
                        data: {
                            className: self.layoutClass
                        }
                    },
                    pagination: {
                        showPagination: true, // 是否显示分页
                        pageSize: 20
                    },
                    advanceQuery: {
                        state: ''
                    }
                };
            }
        },
        methods: {
            cancel() {
                this.$emit('cancel');
                this.visible = false;
            },
            confirm() {
                this.$emit('done', this.rightTableData);
                this.visible = false;
            }
        }
    };
});
