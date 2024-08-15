define([
    'text!' + ELMP.resource('system-operation-menu/views/ActionList/index.html'),
    'css!' + ELMP.resource('system-operation-menu/views/ActionList/style.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ActionListTable: ErdcKit.asyncComponent(
                ELMP.resource('system-operation-menu/components/ActionListTable/index.js')
            )
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    application: this.getI18nByKey('application'),
                    actionSearchPlaceholder: this.getI18nByKey('actionSearchPlaceholder'),
                    edit: this.getI18nByKey('edit'),
                    ok: this.getI18nByKey('ok'),
                    cancel: this.getI18nByKey('cancel'),
                    create: this.getI18nByKey('create'),
                    cButton: this.getI18nByKey('cButton'),
                    vButton: this.getI18nByKey('vButton'),
                    eButton: this.getI18nByKey('eButton'),
                    actionList: this.getI18nByKey('actionList')
                },
                // 所属应用
                appValue: '',
                appList: [],
                // 所属类型
                typeList: [],
                functionButton: {
                    timeStamp: new Date().getTime(),
                    visible: false,
                    loading: false,
                    singleButton: '',
                    type: ''
                },
                tableHeight: 450, // 表格高度
                defaultTableHeight: 450,
                heightDiff: 236,
                tableBodyData: {
                    className: this.$store.getters.className('actionList')
                }
            };
        },
        computed: {
            // 处理表格右上角显示的按钮
            rightBtnList() {
                let rightOperBtnAllList = [
                    {
                        type: 'primary',
                        label: this.i18nMappingObj.create,
                        class: '',
                        icon: 'el-icon-plus',
                        disabledBySelect: false, // 根据表格选中数据来校验是否启用按钮
                        onclick: () => {
                            this.operatingPopover({ visible: true, type: 'create' });
                        }
                    }
                ];
                // 组装按钮
                let mainBtn = '';
                rightOperBtnAllList.forEach((item, index) => {
                    if (index === 0) mainBtn = { ...item };
                });
                return {
                    mainBtn
                };
            },
            viewTableConfig() {
                let tableConfig = {
                    viewOid: '', // 视图id
                    searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        data: this.tableBodyData, // body参数
                        method: 'post' // 请求方法（默认get）
                    },
                    headerRequestConfig: {
                        // 表格列头查询配置(默认url: '/fam/table/head')
                        method: 'POST',
                        data: { className: this.$store.getters.className('actionList') }
                    },
                    firstLoad: true,
                    isDeserialize: true, // 是否反序列数据源（部分视图返回的是对象属性需要处理，不处理的设置false）
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        // 基础筛选
                        basicFilter: {
                            show: true // 是否显示基础筛选，默认不显示
                        }
                    },
                    columnWidths: {
                        multiple: 80,
                        businessName: 180,
                        descriptionI18nJson: 180,
                        typeName: 180,
                        updateTime: 160,
                        updateBy: 100,
                        createTime: 160,
                        nameI18nJson: 180,
                        name: 180,
                        operation: this.language ? 48 : 42
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
                    slotsField: [
                        {
                            prop: 'typeName',
                            type: 'default'
                        }, // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                        {
                            prop: 'operation',
                            type: 'default' // 显示字段内容插槽
                        }
                    ],
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            // 超链接事件
                            this.operatingPopover({ visible: true, singleButton: row, type: 'view' });
                        }
                    },
                    pagination: {
                        // 分页
                        pageSize: 20,
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    }
                };
                // tableConfig.toolbarConfig = _.extend(tableConfig.toolbarConfig, this.rightBtnList)
                return {
                    tableKey: 'BaseMenuAction',
                    viewTableTitle: this.i18nMappingObj['actionList'],
                    saveAs: false, // 是否显示另存为
                    tableConfig
                };
            },
            tenantId() {
                let tenantId = '';
                try {
                    tenantId = JSON.parse(localStorage.getItem('tenantId'));
                } catch {
                    tenantId = '';
                }
                return tenantId;
            }
        },
        created() {
            this.getAppList();
            this.fnGetTypes();
        },
        methods: {
            getAppList() {
                this.$famHttp({
                    url: '/fam/user/getCurrentTenantApplicationList',
                    method: 'get'
                })
                    .then((rep) => {
                        let appList = rep?.data || [];
                        this.appList = _.map(appList, (item) => {
                            return { label: item.displayName, value: item.identifierNo };
                        });
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // })
                    });
            },
            // 获取所属类型
            getOwningType({ typeName = '' }) {
                let list = _.filter(this.typeList, (item) => item.value === typeName);
                list.length && (typeName = list[0]?.label || '');
                return typeName;
            },
            // 查询所属类型
            fnGetTypes() {
                this.$famHttp({
                    url: '/fam/view/getTypeListByContainerRef',
                    method: 'get',
                    headers: {
                        'App-Name': 'ALL'
                    },
                    params: {
                        containerRef: this.$store?.state?.app?.container?.oid,
                        typeName: ''
                    }
                })
                    .then((rep) => {
                        let res = rep?.data || {};
                        let data = res?.childTypeDefList || [];
                        this.typeList = _.map(data, (item) => {
                            return { label: item.displayName, value: item.typeName };
                        });
                    })
                    .catch((err) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: err?.data?.message || err?.data || err
                        // })
                    });
            },
            // 点击确定
            fnOnSubmit() {
                this.functionButton.loading = true;
                this.$refs?.actionListTable?.submit((res) => {
                    if (res.valid) {
                        this.operatingPopover({ callbck: this.reloadMemberTable({}) });
                    }
                    this.functionButton.loading = false;
                });
            },
            // 打开关闭弹窗
            operatingPopover({ visible = false, singleButton = {}, type = '', callbck = null }) {
                this.functionButton.timeStamp = new Date().getTime();
                this.functionButton.singleButton = singleButton;
                this.functionButton.type = type;
                this.functionButton.visible = visible;
                if (!visible) {
                    let { actionListTable } = this.$refs || {};
                    let b = (item) => {
                        _.isFunction(item.blur) && item.blur();
                        _.each(item.$children, (item) => {
                            b(item);
                        });
                    };
                    b(actionListTable);
                }
                _.isFunction(callbck) && callbck();
            },
            // 应用值选择变化
            appValueChange(val) {
                this.reloadMemberTable({ appNames: val });
            },
            // 刷新表格
            reloadMemberTable({ appNames = '' }) {
                if (appNames) {
                    this.$set(this.tableBodyData, 'appNames', [appNames]);
                } else {
                    this.$delete(this.tableBodyData, 'appNames');
                }
                // 避免首次进入加载过快还未渲染完成导致报错
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.$refs['famViewTable'].getTableInstance('advancedTable', 'refreshTable')();
                    }, 200);
                });
            }
        }
    };
});
