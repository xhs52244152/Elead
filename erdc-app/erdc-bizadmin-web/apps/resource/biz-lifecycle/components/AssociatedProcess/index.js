/*

 */
define([
    'text!' + ELMP.resource('biz-lifecycle/components/AssociatedProcess/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('biz-lifecycle/components/AssociatedProcess/style.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js')),
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            defaultProcessData: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-lifecycle/components/AssociatedProcess/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    processName: this.getI18nByKey('processName'),
                    processType: this.getI18nByKey('processType'),
                    selectProcess: this.getI18nByKey('selectProcess'),
                    pleaseEnter: this.getI18nByKey('pleaseEnter')
                },
                treeHeight: '100%',
                treeList: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                },
                searchVal: '',
                searchTableVal: '',

                tableHeight: document.documentElement.clientHeight - 311,
                tableRequestData: []
            };
        },
        watch: {
            searchVal(val) {
                this.$refs.tree.filter(val);
            },
            searchTableVal(val) {
                this.refreshData({
                    searchKey: val
                });
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            viewTableConfig() {
                return {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: 'bpm/search', // 表格数据接口
                        data: {
                            className: 'erd.cloud.bpm.process.entity.ProcessDef',
                            conditionDtoList: this.tableRequestData
                        }, // 路径参数
                        method: 'post', // 请求方法（默认get）
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    const { records } = resData?.data || {};
                                    resData.data.records = records.map((item) => {
                                        const obj = {};
                                        item.attrRawList.forEach((ite) => {
                                            obj[ite.attrName] = ite.value;

                                            // 如果是状态, 显示 名称
                                            if (ite.attrName === 'iterationInfo.state') {
                                                obj[ite.attrName] = ite.displayName;
                                            }
                                        });
                                        return {
                                            ...item,
                                            ...obj
                                        };
                                    });
                                } catch (error) {
                                    console.error(error);
                                }

                                const processTable = this.$refs.famAdvancedTable?.$refs?.erdTable?.$table;
                                if (processTable) {
                                    const checkRadioObj = resData.data.records.find(
                                        (item) => item.engineModelKey === this.defaultProcessData?.[0]?.engineModelKey
                                    );
                                    if (checkRadioObj) {
                                        processTable.setRadioRow(checkRadioObj);
                                    } else {
                                        processTable.clearRadioRow();
                                    }
                                }

                                return resData;
                            }
                        ]
                    },
                    tableRequestDataConfig: 'records', // 获取表格接口请求回来数据的字段名称
                    firstLoad: true,
                    isDeserialize: false, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: true,
                        fuzzySearch: {
                            show: true, // 是否显示普通模糊搜索，默认显示
                            placeholder: this.i18n.pleaseEnter, // 输入框提示文字，默认请输入
                            clearable: true,
                            width: '320',
                            isLocalSearch: false, // 使用前端搜索
                            searchCondition: ['name']
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
                    fieldLinkConfig: {
                        fieldLink: false,
                        // 是否添加列超链接
                        fieldLinkName: 'name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                        linkClick: (row) => {
                            // 超链接事件
                            this.onDetail(row);
                        }
                    },
                    addSeq: false,
                    addOperationCol: false,
                    addCheckbox: false,
                    columns: [
                        {
                            attrName: 'radio',
                            prop: 'radio',
                            type: 'radio',
                            minWidth: '40',
                            width: '40',
                            align: 'center'
                        },
                        {
                            attrName: 'seq',
                            label: ' ',
                            prop: 'seq',
                            type: 'seq',
                            minWidth: '48',
                            width: '48',
                            align: 'center'
                        },
                        {
                            attrName: 'name',
                            label: this.i18n.processName,
                            minWidth: '160'
                        },
                        {
                            attrName: 'iterationInfo.iterationId',
                            label: this.i18n.version,
                            minWidth: '160',
                            width: '160'
                        },
                        {
                            attrName: 'iterationInfo.state',
                            label: this.i18n.versionState,
                            minWidth: '160',
                            width: '160'
                        },
                        {
                            attrName: 'createTime',
                            label: this.i18n.createTime,
                            minWidth: '160',
                            width: '160'
                        }
                    ],
                    slotsField: [],
                    pagination: {
                        showPagination: true
                    }
                };
            }
        },
        mounted() {
            this.$nextTick(() => {
                if (this.$refs.AssociatedProcessHeader.clientHeight) {
                    this.treeHeight =
                        document.documentElement.clientHeight -
                        this.$refs.AssociatedProcessHeader.clientHeight -
                        202 +
                        'px';
                }
            });
            this.getTypeTree();
        },
        methods: {
            refreshData() {
                this.$refs.famAdvancedTable.fnRefreshTable();
            },
            getTypeTree() {
                this.$famHttp({
                    url: '/bpm/listAllTree',
                    appName: 'ALL',
                    params: {
                        className: 'erd.cloud.bpm.common.entity.ProcessCategory'
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.treeList = [
                        {
                            displayName: '全部',
                            oid: '-1',
                            childList: data
                        }
                    ];

                    this.treeList.forEach((item) => {
                        item.icon && (item.icon = ErdcKit.imgUrlCreator(item.icon));
                    });
                    this.$nextTick(() => {
                        this.$refs.tree?.setCurrentKey(this.treeList[0]?.oid || '');
                    });
                });
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            onSubmit() {
                const selectRow = this.$refs.famAdvancedTable.getTableInstance('vxeTable', 'instance').getRadioRecord();

                if (!_.isEmpty(selectRow)) {
                    this.$emit('onsubmit', selectRow);
                    this.toogleShow();
                } else {
                    this.$message({
                        type: 'warning',
                        message: '请选择流程',
                        showClose: true
                    });
                }
            },
            /**
             * 搜索过滤
             * @param {*} value
             * @param {*} data
             * @returns
             */
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            onCheck(data) {
                if (data.oid === '-1') {
                    this.tableRequestData = [
                        {
                            attrName: 'enableFlag',
                            oper: 'EQ',
                            value1: true
                        }
                    ];
                } else {
                    this.tableRequestData = [
                        {
                            attrName: 'categoryRef',
                            oper: 'EQ',
                            value1: data.oid
                        },
                        {
                            attrName: 'enableFlag',
                            oper: 'EQ',
                            value1: true
                        }
                    ];
                }
                this.refreshData();
            },
            clearFilter() {
                // do nothing.
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            }
        }
    };
});
