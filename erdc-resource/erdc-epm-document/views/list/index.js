define([
    'text!' + ELMP.func('erdc-epm-document/views/list/index.html'),
    ELMP.func('erdc-epm-document/api.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js')
], function (template, Api, epmDocumentCfg) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'EpmDocumentList',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            BatchSetValue: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/BatchSetValue/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('/erdc-epm-document/locale/index.js'),
                tableHeight: document.body.clientHeight - 296,
                setValue: {
                    visible: false,
                    tableData: []
                },
                vm: null
            };
        },
        computed: {
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            epmDocumentViewTableMap() {
                return epmDocumentCfg.epmDocumentViewTableMap;
            },
            viewTableConfig() {
                const _this = this;
                return {
                    // 视图表格定义的内部名称
                    tableKey: 'epmDocumentView',
                    tableConfig: {
                        vm: _this,
                        actionCustomParams: {
                            inTable: true,
                            isBatch: true
                        },
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            data: {
                                containerRef: this.$route.query.pid ? this.containerRef : ''
                            },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = JSON.parse(data);

                                    // let result = resData.data.records;
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true, // 是否显示配置列，默认显示
                            showMoreSearch: true, // 是否显示高级搜索，默认显示
                            showRefresh: true,
                            fuzzySearch: {
                                placeholder: '请输入关键词搜索',
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: this.epmDocumentViewTableMap.toolBarActionName, //操作按钮的内部名称
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                className: this.epmDocumentViewTableMap.className,
                                skipValidator: true
                            }
                        },
                        tableBaseConfig: {
                            'checkbox-config': {
                                checkMethod({ row }) {
                                    return row.accessToView;
                                }
                            }
                        },
                        addSeq: true,
                        addIcon: true,
                        addOperationCol: true, // 是否显示操作列
                        slotsField: this.slotsField
                    }
                };
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
                    },
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: `${this.epmDocumentViewTableMap.className}#mainContent`,
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: `${this.epmDocumentViewTableMap.className}#identifierNo`,
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            slotName() {
                return {
                    mainContent: `column:default:${this.epmDocumentViewTableMap.className}#mainContent:content`,
                    identifierNo: `column:default:${this.epmDocumentViewTableMap.className}#identifierNo:content`
                };
            }
        },
        mounted() {
            this.vm = this;
        },
        activated() {
            this.refresh();
        },
        methods: {
            setValueSuccess() {
                this.setValue.tableData = [];
                this.setValue.visible = false;
                this.refresh();
            },
            getIcon(row) {
                return row[`${this.epmDocumentViewTableMap.className}#icon`];
            },
            getIdentifierNo(row) {
                return row[`${this.epmDocumentViewTableMap.className}#identifierNo`];
            },
            // 获取选中数据
            getSelectedData() {
                let { fnGetCurrentSelection } = this.$refs['famViewTable'] || {};
                return fnGetCurrentSelection();
            },
            getActionConfig(row) {
                return {
                    name: this.epmDocumentViewTableMap.rowActionName,
                    objectOid: row.oid,
                    className: this.epmDocumentViewTableMap.className
                };
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                const eventClick = {
                    // "PDM_EPM_DOCUMENT_COMPARE_INFO": this.handleInfoCompare,//信息比较功能先注释
                };

                eventClick?.[type.name] && eventClick?.[type.name](data);
                return;
            },
            // eslint-disable-next-line no-unused-vars
            onCommand(type = {}, data = {}) {
                return;
            },
            handleNoClick(row) {
                if (!row.oid) return;

                const attrName = 'erd.cloud.pdm.epm.entity.EpmDocument#lifecycleStatus.status';
                let lifecycleStatus = row.attrRawList.find((item) => item.attrName === attrName);
                /**
                 * 如果是草稿就跳转到编辑页面
                 */
                if (lifecycleStatus && lifecycleStatus.value === 'DRAFT') {
                    this.$router.push({
                        path: `${this.$route?.meta?.prefixRoute}/epmDocument/edit`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid,
                            origin: 'list'
                        }
                    });
                } else {
                    this.$router.push({
                        path: `${this.$route?.meta?.prefixRoute}/epmDocument/detail`,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row.oid
                        }
                    });
                }
            },
            handleBatchDelete(selectedData) {
                const { i18n } = this;
                if (!selectedData || !selectedData.length) {
                    this.$message({
                        type: 'warning',
                        message: i18n.selectTip
                    });
                    return;
                }
                const deleteIds = selectedData.map((item) => item.oid);

                this.$confirm(i18n.deleteBatchTip, i18n.deleteTip, {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/deleteByIds',
                        method: 'delete',
                        params: {},
                        data: {
                            oidList: deleteIds,
                            className: this.epmDocumentViewTableMap.className
                        }
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: i18n.deleteSuccess,
                            showClose: true
                        });
                        this.refresh();
                    });
                });
            },
            handleActionSubmit() {
                this.refresh();
            },
            /**
             * 刷新Api，暴露给公共的操作行为调用。
             */
            refresh() {
                this.$refs.famViewTable?.getTableInstance('advancedTable', 'refreshTable')('default');
            },
            //比较相关信息
            handleInfoCompare(data) {
                if (data.length < 2) {
                    this.$message.warning(this.i18n.checkTwoPieces);
                    return;
                }
                if (data.length > 10) {
                    this.$message.warning(this.i18n.upToTen);
                    return;
                }

                this.$store.commit('epmDocument/compareData', { oids: data.map((item) => item.oid) });
                this.$router.push({
                    path: `${this.$route?.meta?.prefixRoute}/epmDocument/infoCompare`,
                    query: {
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        }),
                        title: this.i18n.infoCompareTitle
                    }
                });
            },
            // 列表点击主内容源图标下载
            download(row) {
                const id = row.attrRawList?.find(
                    (item) => item.attrName === `${this.epmDocumentViewTableMap.className}#mainContent`
                )?.value;
                ErdcKit.downFile({
                    url: Api.download,
                    className: this.epmDocumentViewTableMap.className,
                    method: 'GET',
                    data: {
                        id
                    }
                });
            }
        }
    };
});
