define(['text!' + ELMP.resource('biz-bpm/process-interface/components/AssociatedProcessDef/index.html')], function (
    template
) {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');

    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            BpmFlowchart: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js'))
        },
        props: {
            // 编辑对象oid
            masterOId: {
                type: String,
                default: ''
            },
            // 接口类型
            interfaceType: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-bpm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    '组件提示',
                    '接口分类',
                    '接口名称',
                    '接口类型',
                    '接口地址',
                    '分组',
                    '方法',
                    '请求方法',
                    'Doubbo版本',
                    '消息发送方式',
                    '调用方式',
                    '失败重试',
                    '重试间隔',
                    '接口参数',
                    '描述',
                    '业务接口',
                    '处理接口',
                    '用户',
                    '角色',
                    '生命周期',
                    '全部实例',
                    '全局一次',
                    '单一实例',
                    '同步',
                    '异步',
                    '失败重试格式不正确',
                    '重试间隔格式不正确',
                    '请输入正确的json数据',
                    '流程模板名称',
                    '流程节点名称',
                    '流程模板版本',
                    '操作',
                    '获取关联的流程定义失败',
                    '流程图',
                    '流程图解'
                ]),
                tableData: [],
                bpmFlowchart: {
                    title: '',
                    visible: false,
                    processDefinitionId: '',
                    processInstanceId: ''
                }
            };
        },
        computed: {
            // 接口分类列表
            interfaceClassList() {
                return [
                    {
                        label: this.i18nMappingObj['业务接口'],
                        value: 'BUSINESS'
                    },
                    {
                        label: this.i18nMappingObj['处理接口'],
                        value: 'HANDLE_INTERFACE'
                    }
                ];
            },
            // 消息发送方式列表
            msgSendTypeList() {
                return [
                    { label: this.i18nMappingObj['全部实例'], value: 'EVERY_ONE' },
                    { label: this.i18nMappingObj['全局一次'], value: 'GLOBAL_ONCE' },
                    { label: this.i18nMappingObj['单一实例'], value: 'SERVICE_ONCE' }
                ];
            },
            // 请求方法列表
            requestMethodList() {
                return [
                    { label: 'GET', value: 'GET' },
                    { label: 'POST', value: 'POST' },
                    { label: 'PUT', value: 'PUT' },
                    { label: 'DELETE', value: 'DELETE' }
                ];
            },
            // 调用方式列表
            syncFlagList() {
                return [
                    { label: this.i18nMappingObj['同步'], value: 'SYN' },
                    { label: this.i18nMappingObj['异步'], value: 'ASYNC' }
                ];
            },
            // 接口类型列表
            interfaceTypeList() {
                return [
                    { label: 'DUBBO', value: 'DUBBO' },
                    { label: 'REST', value: 'REST' },
                    { label: 'MQ', value: 'MQ' }
                ];
            },
            // 列
            column() {
                return [
                    {
                        prop: 'processDefDtoName', // 列数据字段key
                        title: this.i18nMappingObj['流程模板名称'], // 列头部标题
                        minWidth: '160' // 列宽度
                    },
                    {
                        prop: 'stateDisplayName',
                        title: this.i18n.versionStatus, // 版本状态
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'processDefDtoVersionStr',
                        title: this.i18nMappingObj['流程模板版本'], // 列头部标题
                        minWidth: '100' // 列宽度
                    },
                    {
                        prop: 'nodeName',
                        title: this.i18nMappingObj['流程节点名称'], // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'interfaceType',
                        title: this.i18nMappingObj['接口类型'], // 列头部标题
                        minWidth: '120', // 列宽度
                        props: {
                            formatter: ({ row, column, cellValue = row[column.field] }) => {
                                cellValue &&
                                    ({ label: cellValue } = _.find(this.interfaceTypeList, { value: cellValue }) || {});
                                return cellValue;
                            }
                        }
                    },
                    {
                        prop: 'operation',
                        title: this.i18nMappingObj['操作'], // 列头部标题
                        minWidth: '120' // 列宽度
                    }
                ];
            }
        },
        watch: {
            masterOId: {
                handler: function (masterOId) {
                    masterOId && this.getAssociatedProcessDef({ masterOId });
                },
                immediate: true
            }
        },
        methods: {
            // 获取关联的流程定义详情
            getAssociatedProcessDef({ masterOId }) {
                this.$famHttp({
                    url: `/bpm/processEvent/list/${masterOId}`,
                    method: 'GET'
                }).then((resp) => {
                    let { success, data = [] } = resp || {};
                    if (success) {
                        this.tableData = _.map(data, (item) => {
                            if (!_.isEmpty(item.processDefDto)) {
                                item = {
                                    ...item,
                                    processDefDtoName: item.processDefDto.name,
                                    processDefDtoVersionStr: item.processDefDto.versionStr,
                                    stateDisplayName: item.processDefDto.stateDisplayName
                                };
                            }
                            if (!_.isEmpty(item.processNodeDefDto)) {
                                item = { ...item, processNodeDefDtoName: item.processNodeDefDto.name };
                            }
                            return { ...item, interfaceType: this.interfaceType };
                        });
                    }
                });
            },
            // 查看流程图
            viewFlowChart(row) {
                let { processDefDtoName = this.i18nMappingObj['流程图解'] } = row || {};
                this.bpmFlowchart.processDefinitionId = row.processDefDto.engineModelId || '';
                this.popover({ field: 'bpmFlowchart', title: processDefDtoName, visible: true });
            },
            // 打开弹窗
            popover({ field, visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            // 表单校验
            formVerification(callback) {
                const { dynamicForm } = this.$refs,
                    { submit, serializeEditableAttr } = dynamicForm;
                return { submit, serializeEditableAttr };
            }
        }
    };
});
