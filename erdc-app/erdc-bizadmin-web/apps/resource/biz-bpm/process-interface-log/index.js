define([
    'text!' + ELMP.resource('biz-bpm/process-interface-log/template.html'),
    'css!' + ELMP.resource('biz-bpm/process-interface-log/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'processInterfaceLog',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            LogForm: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/process-interface-log/components/LogForm/index.js')),
            RecordForm: ErdcKit.asyncComponent(
                ELMP.resource('biz-bpm/process-interface-log/components/RecordForm/index.js')
            ),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '确定',
                    '取消',
                    '编辑',
                    '更多',
                    '查看记录',
                    '重试',
                    '流程实例详情',
                    '接口调用成功',
                    '接口调用失败',
                    '获取历史记录失败',
                    '请输入流程名称',
                    '调用日志'
                ]),
                // 日志详情
                logForm: {
                    title: '',
                    oid: '',
                    interfaceRef: '',
                    readonly: false,
                    visible: false
                },
                // 历史记录
                recordForm: {
                    list: [],
                    title: '',
                    readonly: true,
                    visible: false
                },
                defaultParams: {
                    conditionDtoList: [
                        {
                            attrName: 'parentRef',
                            oper: 'EQ',
                            value1: `OR:${this.$store.getters.className('callLog')}:-1`
                        }
                    ]
                },
                // 加载中
                loading: false
            };
        },
        computed: {
            // 视图表格配置
            viewTableConfig() {
                return {
                    tableKey: 'InterfaceInvokLogViewTable0', // UserViewTable productViewTable
                    viewTableTitle: this.i18nMappingObj['调用日志'],
                    saveAs: false, // 是否显示另存为
                    tableConfig: this.tableConfig
                };
            },
            // 高级表格配置
            tableConfig() {
                return {
                    tableRequestConfig: {
                        defaultParams: this.defaultParams
                    },
                    toolbarConfig: {
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: true
                        }
                    },
                    fieldLinkConfig: {
                        linkClick: (row) => {
                            let { oid = '' } = row;
                            this.logForm.oid = oid;
                            let { oid: interfaceRef } =
                                _.find(row.attrRawList || [], {
                                    attrName: `${this.$store.getters.className('callLog')}#interfaceRef`
                                }) || {};
                            this.logForm.interfaceRef = interfaceRef;
                            this.logForm.readonly = true;
                            this.popover({
                                field: 'logForm',
                                title: this.i18nMappingObj['流程实例详情'],
                                visible: true
                            });
                        }
                    },
                };
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
            onCommand(type, data) {
                const eventClick = {
                    // 查看历史记录
                    BPM_INTERFACE_INVOKE_LOG_VIEWING_HISTORY: this.getHistoryList,
                    // 重试
                    BPM_INTERFACE_INVOKE_LOG_RETRY: this.interfaceRetry
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            },
            // 获取功能按钮配置参数
            getActionConfig(row) {
                return {
                    name: 'BPM_INTERFACE_INVOKE_LOG_MORE',
                    objectOid: row.oid,
                    className: this.$store.getters.className('callLog')
                };
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 刷新视图表格
            refreshTable() {
                let { refreshTable } = this.$refs['famViewTable'] || {};
                _.isFunction(refreshTable) && refreshTable();
            },
            // 获取历史记录
            getHistoryList(row) {
                let value1 = row.id || '';
                this.$famHttp({
                    url: '/bpm/search',
                    method: 'POST',
                    data: {
                        className: this.$store.getters.className('callLog'),
                        conditionDtoList: [
                            {
                                attrName: 'parentRef',
                                oper: 'EQ',
                                value1
                            }
                        ]
                    }
                }).then((resp) => {
                    let { success, data = {} } = resp || {};
                    if (success) {
                        let { records = [] } = data;
                        records = _.map(records, (item) => this.initRawData(item.attrRawList));
                        this.recordForm.list = records;
                        this.popover({ field: 'recordForm', title: this.i18nMappingObj['查看记录'], visible: true });
                    }
                });
            },
            // 组装数据
            initRawData(attrRawList = []) {
                let obj = {};
                _.each(attrRawList, (item) => {
                    obj[item.attrName] = item?.displayName || item?.oid || '';
                });
                return { ...obj, attrRawList };
            },
            // 接口重试
            interfaceRetry(row) {
                if (this.loading) {
                    return;
                }
                let id = row.id || '';
                let params = row[`erd.cloud.bpm.log.entity.InterfaceInvokLog#params`] || {};
                let data = { id, params };
                this.interfaceRetryApi(data)
                    .then((resp) => {
                        let { success } = resp || {};
                        if (success) {
                            this.refreshTable();
                            return this.$message.success(this.i18nMappingObj['接口调用成功']);
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            // 接口重试接口
            interfaceRetryApi(data) {
                this.loading = true;
                return this.$famHttp({
                    url: '/bpm/interfaceinvoklog/retry',
                    method: 'POST',
                    data
                });
            }
        }
    };
});
