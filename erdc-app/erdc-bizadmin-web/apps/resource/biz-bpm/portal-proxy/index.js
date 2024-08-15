define(['text!' + ELMP.resource('biz-bpm/portal-proxy/index.html')], (template) => {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'processProxy',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            AgentProcessForm: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/portal-proxy/components/AgentProcessForm/index.js')
            ),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            RelationProcess: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/portal-proxy/components/RelationProcess/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-proxy/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '请输入代理名称',
                    '创建代理',
                    '编辑代理',
                    '查看代理',
                    '关联流程',
                    '请选择至少一个要代理的流程',
                    '更新成功',
                    '更新失败',
                    '新增成功',
                    '新增失败',
                    '确认删除',
                    '删除成功',
                    '确认',
                    '取消',
                    '确认取消',
                    '取消成功'
                ]),
                dialogTitle: this.i18nMappingObj?.['创建代理'] || '',
                dialogVisible: false,
                formData: {},
                oid: '',
                type: '',
                defaultMasters: [],
                defaultSelect: [],
                defaultUserValue: [],
                proxyTypeSlotName: 'column:default:erd.cloud.bpm.proxy.entity.WorkProxy#proxyType:content',
                statusSlotName: 'column:default:erd.cloud.bpm.proxy.entity.WorkProxy#status:content',
                relationProcessVisible: false,
                defaultParams: {
                    conditionDtoList: [
                        {
                            attrName: 'createBy',
                            oper: 'EQ',
                            value1: this.$store.state.app.user.id
                        }
                    ]
                }
            };
        },
        watch: {
            type(nv) {
                if (nv === 'create') {
                    this.dialogTitle = this.i18nMappingObj['创建代理'];
                } else if (nv === 'update') {
                    this.dialogTitle = this.i18nMappingObj['编辑代理'];
                } else {
                    this.dialogTitle = this.i18nMappingObj['查看代理'];
                }
            }
        },
        computed: {
            relationProcessTitle() {
                return this.i18nMappingObj?.['关联流程'] || '';
            },
            viewTableConfig() {
                return {
                    tableKey: 'WorkProxyViewTable', // UserViewTable productViewTable
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            tableConfig() {
                let tableConfig = {
                    tableRequestConfig: {
                        defaultParams: this.defaultParams
                    },
                    columnWidths: {
                        operation: window.LS.get('lang_current') === 'en_us' ? 180 : 80
                    },
                    headerRequestConfig: {},
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
                        // mainBtn: {
                        //     type: 'primary',
                        //     label: '创建',
                        //     onclick: () => {
                        //         this.createProxy();
                        //     }
                        // },
                        actionConfig: {
                            name: 'BPM_WORK_PROXY_CREATE',
                            containerOid: this.$store.state.space?.context?.oid || '',
                            className: 'erd.cloud.bpm.common.entity.ProcessCategory'
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
                            // 超链接事件
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
                        },
                        {
                            // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                            prop: 'operation', // 当前字段使用插槽
                            type: 'default'
                        }
                        // {
                        //     prop: 'erd.cloud.bpm.proxy.entity.WorkProxy#proxyType',
                        //     type: 'default'
                        // },
                        // {
                        //     prop: 'erd.cloud.bpm.proxy.entity.WorkProxy#status',
                        //     type: 'default'
                        // }
                    ],
                    tableBaseEvent: {
                        scroll: _.throttle(() => {
                            let arr =
                                _.chain(this.$refs)
                                    .pick((value, key) => key.indexOf('FamActionPulldown') > -1)
                                    .values()
                                    .value() || [];
                            this.$nextTick(() => {
                                _.each(arr, (item) => {
                                    let [sitem = {}] = item?.$refs?.actionPulldowm || [];
                                    sitem.hide && sitem.hide();
                                });
                            });
                        }, 100)
                    }
                };

                return tableConfig;
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
            slotName(slotName) {
                return `column:default:${slotName}:content`;
            },
            // 刷新表格方法
            refreshTable() {
                this.$refs?.famViewTable?.getTableInstance('advancedTable', 'refreshTable')();
            },
            createProxy() {
                this.oid = '';
                this.type = 'create';
                this.dialogVisible = true;
                this.defaultSelect = [];
            },
            submit() {
                this.$refs?.agentProcessForm
                    ?.submit()
                    .then(({ attrRawList, relationList }) => {
                        const data = {
                            associationField: 'roleAObjectRef',
                            className: this.$store.getters.className('workProxy'),
                            oid: this.oid,
                            attrRawList,
                            relationList
                        };
                        let {
                            value: { value }
                        } = _.find(attrRawList, { attrName: 'proxyType' }) || { value: {} };
                        if (value === 'PARTIAL_AGENT' && !relationList.length) {
                            return this.$message.error('请选择至少一个要代理的流程');
                        }
                        const url = !this.oid ? '/bpm/create' : '/bpm/update';
                        this.saveData({ url, data }).then(() => {
                            this.closeDialog();
                            this.$message({
                                type: 'success',
                                message: this.oid ? this.i18nMappingObj['更新成功'] : this.i18nMappingObj['新增成功'],
                                showClose: true
                            });
                            this.refreshTable();
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            saveData({ url, data }) {
                return this.$famHttp({
                    url,
                    data,
                    method: 'POST'
                });
            },
            closeDialog() {
                this.dialogVisible = false;
                this.formData = {};
                this.defaultMasters = [];
                this.defaultSelect = [];
                this.defaultUserValue = [];
            },
            actionConfig(data) {
                return {
                    name: 'BPM_WORK_PROXY_MORE',
                    objectOid: data?.oid || '',
                    className: this.$store.getters.className('processCategory')
                };
            },
            actionClick(command, data) {
                const eventClick = {
                    BPM_WORKPROXY_EDIT: this.edit,
                    BPM_WORKPROXY_CANCEL: this.cancel,
                    BPM_WORKPROXY_DELETE: this.delete,
                    BPM_WORKPROXY_RELATE_PROCESS: this.relateProcess,
                    BPM_WORKPROXY_CREATE: this.createProxy
                };
                eventClick[command.name] && eventClick[command.name](data);
            },
            edit(data) {
                this.oid = data.oid || '';
                this.type = 'update';
                this.getDetailData(this.oid);
            },
            cancel(data) {
                this.$confirm(this.i18nMappingObj['确认取消'], this.i18nMappingObj['确认取消'], {
                    confirmButtonText: this.i18nMappingObj['确认'],
                    cancelButtonText: this.i18nMappingObj['取消'],
                    type: 'warning'
                }).then(() => {
                    this.saveData({
                        url: '/bpm/update',
                        data: {
                            className: this.$store.getters.className('workProxy'),
                            oid: data.oid,
                            attrRawList: [
                                {
                                    attrName: 'available',
                                    value: 'NO_EFFECTIVE'
                                }
                            ]
                        }
                    }).then(() => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['取消成功'],
                            showClose: true
                        });
                        this.refreshTable();
                    });
                });
            },
            delete(data) {
                this.$confirm(this.i18nMappingObj['确认删除'], this.i18nMappingObj['确认删除'], {
                    confirmButtonText: this.i18nMappingObj['确认'],
                    cancelButtonText: this.i18nMappingObj['取消'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/bpm/delete?oid=' + data.oid,
                        method: 'DELETE'
                    }).then((resp) => {
                        this.refreshTable();
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['删除成功'],
                            showClose: true
                        });
                    });
                });
            },
            onDetail(data) {
                this.type = 'detail';
                this.oid = data.oid || '';
                this.getDetailData(this.oid);
            },
            relateProcess(data) {
                this.oid = data.oid;
                this.relationProcessVisible = true;
            },
            getDetailData(oid) {
                if (!oid) {
                    return;
                }
                // 获取表单详情
                this.$famHttp({
                    url: '/bpm/attr?oid=' + oid
                }).then((resp) => {
                    const { data } = resp;
                    this.dialogVisible = true;
                    this.formData = ErdcKit.deserializeAttr(data.rawData, {
                        valueMap: {
                            proxyUserRef({ users }) {
                                return users;
                            },
                            createBy({ users }) {
                                return users;
                            },
                            updateBy({ users }) {
                                return users;
                            }
                        },
                        valueKey: 'value'
                    });
                    if (this.type !== 'detail') {
                        this.defaultUserValue = this.formData.proxyUserRef || [];
                        this.defaultUserValue.length &&
                            (this.formData.proxyUserRef = this.defaultUserValue[0]?.oid || '');
                    }
                    // 获取关联流程详情
                    this.getRelationProcess(oid.split(':')[2]);
                });
            },
            getRelationProcess(id) {
                this.$famHttp({
                    url: '/bpm/workproxy/link/page',
                    data: {
                        id
                    },
                    method: 'POST'
                }).then((resp) => {
                    this.defaultSelect = resp.data.map((item) => {
                        return {
                            ...item,
                            masterRef: item.processDefMasterRef,
                            name: item.processDefName
                        };
                    });
                });
            }
        }
    };
});
