define(['text!' + ELMP.resource('biz-bpm/portal-draft/index.html')], (template) => {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'processDraft',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-draft/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '请输入流程编码，流程名称',
                    '请先选择数据',
                    '确认删除',
                    '确认',
                    '取消',
                    '删除成功'
                ])
            };
        },
        computed: {
            viewTableConfig() {
                return {
                    tableKey: 'PboViewTable', // UserViewTable productViewTable
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            tableConfig() {
                return {
                    headerRequestConfig: {},
                    tableRequestConfig: {
                        data: {
                            conditionDtoList: [
                                {
                                    attrName: `${this.$store.getters.className('pbo')}#pboStatus`,
                                    oper: 'EQ',
                                    value1: 'DRAFT'
                                },
                                {
                                    attrName: 'createBy',
                                    oper: 'EQ',
                                    value1: this.$store.state.app.user.id
                                }
                            ]
                        }
                    },
                    toolbarConfig: {
                        // 工具栏
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        },
                        isEmpty: false,
                        // secondaryBtn: [{
                        //     plain: true,
                        //     label: '删除',
                        //     onclick: (data) => {
                        //         this.deleteProxy(data);
                        //     }
                        // }],
                        actionConfig: {
                            name: 'BPM_MY_DRAFT_DELETE',
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: `${this.$store.getters.className('pbo')}`
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
                        linkClick: (row) => {
                            this.onDetail(row);
                        }
                    },
                    pagination: {
                        indexKey: 'pageIndex', // 参数pageIndex key (默认pageIndex)
                        sizeKey: 'pageSize' // 参数pageSize key (默认pageSize)
                    },
                    slotsField: [
                        {
                            prop: 'icon',
                            type: 'default'
                        }
                    ]
                };
            }
        },
        watch: {
            '$route.query.isRefresh': {
                handler: function (n) {
                    n && this.refreshTable();
                },
                immediate: true
            }
        },
        methods: {
            // 表格空数据赋值为'--'
            handlerData(tableData, callback) {
                tableData = _.map(tableData, (item) => ErdcKit.deepClone(item)) || [];
                _.each(tableData, (item) => {
                    _.each(item, (value, key) => {
                        typeof value !== 'object' && (value === '' || value === undefined) && (item[key] = '--');
                    });
                });
                callback(tableData);
            },
            // 功能按钮点击事件
            actionClick(type, row) {
                const eventClick = {
                    // 删除
                    BPM_PBO_DELETE: this.deleteProxy
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            },
            deleteProxy() {
                const selectData = this.$refs?.famViewTable?.getTableInstance('advancedTable', 'selection');
                const oidList = selectData.map((item) => item.oid);
                if (_.isEmpty(oidList)) {
                    return this.$message({
                        type: 'warning',
                        message: this.i18nMappingObj['请先选择数据'],
                        showClose: true
                    });
                }
                this.$confirm(this.i18nMappingObj['确认删除'], this.i18nMappingObj['确认删除'], {
                    confirmButtonText: this.i18nMappingObj['确认'],
                    cancelButtonText: this.i18nMappingObj['取消'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/bpm/deleteByIds',
                        params: {},
                        data: {
                            category: 'DELETE',
                            className: `${this.$store.getters.className('pbo')}`,
                            oidList
                        },
                        method: 'DELETE'
                    }).then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['删除成功'],
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            onDetail(row) {
                let { oid: processDefRef } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('pbo')}#processDefRef` }) ||
                    {};
                let pboOid = row.oid || '';
                let { displayName: title } =
                    _.find(row.attrRawList, { attrName: `${this.$store.getters.className('pbo')}#pboName` }) || {};
                return this.$router.push({
                    path: `/container/bpm-resource/workflowDraft/${pboOid}`,
                    query: {
                        category: this.categoryRef,
                        title,
                        processDefRef
                    }
                });
            }
        }
    };
});
