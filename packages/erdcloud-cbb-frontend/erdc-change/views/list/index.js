define([
    'text!' + ELMP.func('erdc-change/views/list/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    'css!' + ELMP.func('erdc-change/views/list/index.css')
], function (template, utils, cbbUtils, viewCfg) {
    const ErdcKit = require('erdc-kit');
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('Change');
    const updateMap = viewCfg.updateMap;

    return {
        name: 'ChangeList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                handlerDialogVisible: false,
                confirmDialogVisible: false,
                saveDialogVisible: false,
                contentDialogVisible: false,
                dialogName: '',
                tableColumns: [],
                operationType: '',
                note: '',
                radio: '3',
                rowOid: '',
                // dialog-confirm组件
                confirmDefaultTitle: '',
                confirmTitle: '',
                confirmTips: '',
                reversionData: [],
                // 操作时的列表
                tableData: [],
                selectChangeArr: [], // 勾选的数据
                vm: null,
                typeName: '',
                className: '',
                tableKey: '',
                actionConfig: {}
            };
        },
        computed: {
            applyFilter() {
                return {
                    showComponent: 'erd-ex-select',
                    value: this.typeName,
                    label: this.i18n.changeCategory
                };
            },
            typeNameList() {
                const data = [
                    {
                        value: 'PR',
                        displayName: '问题报告'
                    },
                    {
                        value: 'ECR',
                        displayName: '变更请求'
                    },
                    {
                        value: 'ECN',
                        displayName: '变更通告'
                    },
                    {
                        value: 'ECA',
                        displayName: '变更任务'
                    }
                ];
                return data;
            },
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            ...mapGetters(['getViewTableMapping', 'getOperateMapping']),
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: this.typeName });
            },
            viewTableConfig() {
                const _this = this;
                let config = {
                    // 视图表格定义的内部名称
                    tableKey: this.tableKey,
                    tableBaseEvent: {
                        // 'checkbox-all': _this.selectAllEvent, // 复选框全选
                        // 'checkbox-change': _this.selectChangeEvent, // 复选框勾选事件
                        // 'radio-change': this.radioChangeEvent // 单选按钮改变事件
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        actionCustomParams: {
                            inTable: true,
                            isBatch: true
                        },
                        // 表格数据请求
                        tableRequestConfig: {
                            url: '/fam/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: {
                                containerRef: this.$route.query.pid ? this.containerRef : ''
                            },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = JSON.parse(data);
                                    let result = resData.data.records;
                                    resData.data.records = result.map((item) => {
                                        item.attrRawList.forEach((v) => {
                                            v.attrName = v.attrName?.split('#')?.[1] || v.attrName;
                                        });

                                        item.rowKey = item.oid;
                                        return item;
                                    });
                                    return resData;
                                }
                            ]
                        },
                        // 头部请求
                        headerRequestConfig: {
                            // url: '/fam/table/head',
                            // 表格列头查询配置(默认url: '/base/table/head')，如果没配置接口请求，则需要配置columns
                            // method: 'POST',
                            // data: {
                            //     // 参数（不是固定，按自己需求来）
                            //     className: this.className,
                            //     tableKey: this.viewTableMapping.tableKey
                            // },
                            transformResponse: [
                                (respData) => {
                                    _this.slotList = [];
                                    let resData = JSON.parse(respData);
                                    resData.data.headers.forEach((v) => {
                                        v.attrName = v.attrName?.split('#')?.[1];
                                    });
                                    return resData;
                                }
                            ]
                        },
                        tableBaseConfig: {
                            // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                            'rowConfig': {
                                keyField: 'rowKey',
                                isCurrent: true,
                                isHover: true
                            },
                            'columnConfig': {
                                resizable: true // 是否允许调整列宽
                            },
                            'showOverflow': true, // 溢出隐藏显示省略号
                            'treeNode': 'identifierNo',
                            'treeConfig': {
                                lazy: true,
                                hasChild: 'child',
                                rowField: 'rowKey',
                                parentField: 'parentRef',
                                loadMethod: ({ row }) => {
                                    return this.getLinkObject(row);
                                }
                            },
                            'checkbox-config': {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                },
                                // 是否允许勾选的方法
                                visibleMethod({ row }) {
                                    return !row.isChild;
                                }
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            fuzzySearch: {
                                placeholder: '请输入关键词搜索',
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                // 使用基础筛选配置，推荐使用基础筛选，而不使用普通搜索
                                show: true, // 是否使用基础筛选
                                maxNumber: 3 // 默认显示的基础筛选个数，默认为4个
                            },
                            actionConfig: this.actionConfig
                        },
                        fieldLinkConfig: {
                            linkClick: (row) => {
                                row?.accessToView && this.handleDetail(row);
                            }
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            slotsField() {
                return [
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    }
                ];
            }
        },
        watch: {
            // 切换变更分类刷新视图表格
            typeName: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.className = this.viewTableMapping.className;
                        this.tableKey = this.viewTableMapping.tableKey;
                        this.actionConfig = {
                            name: this.viewTableMapping.operateName, //操作按钮的内部名称
                            containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                            className: this.className, //维护到store里
                            skipValidator: true
                        };
                        this.reloadTable();
                    }
                }
            }
        },
        activated() {
            this.refresh();
        },
        mounted() {
            this.vm = this;
            this.$nextTick(() => {
                // 取缓存中的值，否则默认为PR
                this.typeName = JSON.parse(localStorage.getItem('typeName')) || 'PR';
            });
        },
        methods: {
            typeNameChange(val) {
                // 缓存变更分类
                localStorage.setItem('typeName', JSON.stringify(val));
                this.typeName = val;
            },
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return row.attrRawList?.find((item) => item.attrName.includes('icon'))?.value || row.icon;
                // return row[`${this.viewTableMapping.className}#icon`];
            },
            // 获取选中数据
            getSelectedData() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {};
                return fnGetCurrentSelection();
            },
            // 详情
            handleDetail(row) {
                if (!row.oid) return;
                //变更请求模块存储当前数据的containerRef
                if (this.typeName == 'ECR') {
                    let containerOptions = row?.attrRawList.find((item) => item.attrName == 'containerRef');
                    let containerRef = containerOptions
                        ? `${containerOptions.value.key}:${containerOptions.value.id}`
                        : row.containerRef || '';
                    this.$store.commit('Change/containerRef', containerRef);
                }
                // const attrName = `${row.idKey}#lifecycleStatus.status`;
                const attrName = 'lifecycleStatus.status';
                let lifecycleStatus = row.attrRawList.find((item) => item.attrName === attrName);
                /**
                 * 如果是草稿就跳转到编辑页面
                 */
                if (lifecycleStatus && lifecycleStatus.value === 'DRAFT') {
                    this.$router.push({
                        path: `${this.$route?.meta?.prefixRoute}/${updateMap[row.idKey]}`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid,
                            // 跳转的详情页面应该与被点击数据的类型有关 ， 而不是当前变更类型 , 数据的树结构展开下会有其他类型的子数据
                            className:
                                utils.getProp(
                                    utils.getAttrFromAttrRowList(row.attrRawList || [], 'typeName'),
                                    'value',
                                    '',
                                    true
                                ) || this.className
                        }
                    });
                } else {
                    cbbUtils.goToDetail(row, {
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            componentRefresh: true, //之前打开过页面，再次打开时不会更新，需更新组件
                            title: '查看详情'
                        }
                    });
                }
            },
            getIdentifierNo(row) {
                return row[`${this.className}#identifierNo`];
            },
            getLinkObject(row) {
                return new Promise((resolve) => {
                    let oid = row.oid;
                    this.$famHttp({
                        url: `/change/getChildList/${oid}`,
                        className: this.className,
                        params: {
                            oid
                        },
                        method: 'GET'
                    }).then((res) => {
                        let resData = ErdcKit.deepClone(res.data) || [];
                        let result = resData.map((item) => {
                            item.attrRawList.forEach((attr) => {
                                item[attr.attrName] = attr.displayName;
                            });
                            item['isChild'] = true;
                            item.rowKey = `${item.oid}-${Date.now()}`;
                            return item;
                        });
                        resolve(result);
                    });
                });
            },
            fnCallback() {},
            // 功能按钮点击事件
            // eslint-disable-next-line no-unused-vars
            actionClick(type, row) {
                return;
            },
            getActionConfig(row) {
                const operateName = this.getOperateMapping({ tableName: row.idKey });
                return {
                    name: operateName,
                    objectOid: row.oid,
                    className: row.idKey
                };
            },
            // eslint-disable-next-line no-unused-vars
            onCommand(type, row) {
                return;
            },
            // 刷新表格
            reloadTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')('default');
            },
            /**
             * 刷新Api，暴露给公共的操作行为调用。
             */
            refresh() {
                this.reloadTable();
            }
        }
    };
});
