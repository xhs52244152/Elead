define([
    'text!' + ELMP.resource('erdc-cbb-components/ContainerTemplate/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        name: 'ContainerTemplate',
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nPath: ELMP.resource('erdc-cbb-components/ContainerTemplate/locale/index.js'),
                // 实例
                vm: this,
                tableKey: ''
            };
        },
        computed: {
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default', // 显示字段内容插槽
                        notSplice: true
                    }
                ];
            },
            scopeSlots() {
                return _.reduce(
                    this.slotsField,
                    (pre, next) => {
                        let number = next.prop.indexOf('.'),
                            key = '';
                        if (number >= 0) {
                            let [one, two] = next.prop.split('.');
                            key = one + two.charAt(0).toUpperCase() + two.slice(1);
                        } else {
                            key = next.prop;
                        }
                        return {
                            ...pre,
                            [key]: `column:${next.type}:${next.notSplice ? '' : this.viewTableMapping?.className + '#'
                                }${next.prop}:content`
                        };
                    },
                    {}
                );
            },
            tableConfig() {
                let { className, onDetail, slotsField } = this;
                const tableConfig = {
                    tableKey: this.tableKey,
                    vm: this.vm,
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addOperationCol: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/search', // 表格数据接口
                        params: {}, // 路径参数
                        data: {
                            orderBy: 'updateTime',
                            tmplTemplated: true,
                            className,
                            sortBy: 'ASC'
                        }, // body参数
                        method: 'post' // 请求方法（默认get）
                    },
                    fieldLinkConfig: {
                        fieldLink: true,
                        // 是否添加列超链接
                        fieldLinkName: 'name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            onDetail(row);
                        }
                    },
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        url: '/fam/table/head',
                        method: 'POST',
                        data: {
                            className
                        }
                    },
                    firstLoad: true,
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            clearable: true,
                            width: '280',
                            placeholder: '请输入编码或名称',
                            isLocalSearch: false, // 使用前端搜索
                            searchCondition: ['name', 'number']
                        },
                        // 基础筛选
                        basicFilter: {
                            show: true
                        },
                        actionConfig: this.actionConfig
                    },
                    addSeq: true,
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
                    columnWidths: {
                        // 设置列宽，配置>接口返回>默认
                        operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                    },
                    slotsField
                };
                return tableConfig;
            }
        },
        activated() {
            this.$refs.famAdvancedTable.initTable();
        },
        deactivated() {
            const allTooltips = document.querySelectorAll('.vxe-table--tooltip-wrapper');
            if (allTooltips.length) {
                Array.from(allTooltips).map((node) => document.body.removeChild(node));
            }
        }
    };
});
