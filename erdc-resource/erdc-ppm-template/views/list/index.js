define([
    'text!' + ELMP.resource('erdc-ppm-template/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.kit'
], function (template, ppmStore, ErdcKit) {
    return {
        template,
        name: 'ppmTemplate',
        data() {
            return {
                typename: ppmStore.state.classNameMapping.project,
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-ppm-template/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    performOperation: this.getI18nByKey('performOperation'),
                    tip: this.getI18nByKey('tip'),
                    success: this.getI18nByKey('success'),
                    permanentlyDeleted: this.getI18nByKey('permanentlyDeleted')
                }
            };
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        activated() {
            this.$refs.famAdvancedTable?.initTable();
        },
        deactivated() {
            const allTooltips = document.querySelectorAll('.vxe-table--tooltip-wrapper');
            if (allTooltips.length) {
                Array.from(allTooltips).map((node) => document.body.removeChild(node));
            }
        },
        created() {
            this.vm = this;
        },
        computed: {
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'templateInfo.tmplEnabled',
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            tableConfig() {
                let { typename, onDetail, slotsField } = this;
                const tableConfig = {
                    vm: this,
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    addOperationCol: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: '/fam/search', // 表格数据接口
                        params: {}, // 路径参数
                        data: {
                            orderBy: 'identifierNo',
                            tmplTemplated: true,
                            className: typename
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
                            className: typename
                        }
                    },
                    firstLoad: true,
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showRefresh: true,
                        showConfigCol: true, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        fuzzySearch: {
                            show: false, // 是否显示普通模糊搜索，默认显示
                            clearable: true,
                            width: '280'
                        },
                        // 基础筛选
                        basicFilter: {
                            show: true
                        },
                        actionConfig: {
                            name: 'PPM_PROJECT_TEMPLATE_LIST_MENU',
                            containerOid: '',
                            className: ppmStore.state.classNameMapping.project
                        }
                    },
                    addSeq: true,
                    addIcon: true,
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
                        // operation: '70px'
                    },
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    columns: [],
                    slotsField
                };
                return tableConfig;
            }
        },
        methods: {
            onDetail(row) {
                const appName = 'erdc-project-web';
                const targetPath = '/space/project-space/projectInfo';
                let query = {
                    pid: row.oid,
                    template: true,
                    isTemplate: true
                };
                // path组装query参数
                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                window.open(url, appName);
            },
            // handleEdit(row) {
            //     this.$router.push({
            //         name: 'templateEdit',
            //         params: {
            //             pid: row.oid
            //         },
            //         query: {
            //             templateTitle: `编辑 ${row['name']} 模板`
            //         }
            //     });
            // },
            getState(row) {
                let { value: state } =
                    row?.attrRawList?.find((item) => item.attrName === 'templateInfo.tmplEnabled') || {};
                return state;
            },

            getActionConfig(row) {
                return {
                    name: 'PPM_PROJECT_TEMPLATE_OPERATE_MENU',
                    objectOid: row.oid,
                    className: ppmStore.state.classNameMapping.project
                };
            },

            onCommand() {},
            // 功能按钮点击事件
            actionClick(type, row) {},
            refreshTable() {
                this.$refs['famAdvancedTable'].fnRefreshTable('default');
            }
        }
    };
});
