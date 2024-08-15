define([], function () {
    const ErdcKit = require('erdcloud.kit'),
        _ = require('underscore');

    return {
        /*html*/
        template: `
            <div class="historical-edition-content">
                <fam-erd-table
                    border
                    :row-config="{isCurrent: true, isHover: true}"
                    :column-config="{resizable: true}"
                    align="left"
                    :data="tableData"
                    :column="column"
                    show-overflow
                    ref="erdTable"
                ></fam-erd-table>
            </div>
        `,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js'))
        },
        props: {
            // 编辑对象oid
            masterOId: {
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
                    '查询历史版本失败',
                    '接口名称',
                    '接口类型',
                    '接口地址',
                    '调用方式',
                    '接口参数',
                    '描述',
                    '版本',
                    '业务接口',
                    '处理接口',
                    '全部实例',
                    '全局一次',
                    '单一实例',
                    '同步',
                    '异步'
                ]),
                // 历史版本
                tableData: []
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
                        prop: 'name', // 列数据字段key
                        title: this.i18nMappingObj['接口名称'], // 列头部标题
                        minWidth: '160' // 列宽度
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
                        prop: 'rpcInterface',
                        title: this.i18nMappingObj['接口地址'], // 列头部标题
                        minWidth: '200' // 列宽度
                    },
                    {
                        prop: 'syncFlag',
                        title: this.i18nMappingObj['调用方式'], // 列头部标题
                        minWidth: '120', // 列宽度
                        props: {
                            formatter: ({ row, column, cellValue = row[column.field] }) => {
                                cellValue &&
                                    ({ label: cellValue } = _.find(this.syncFlagList, { value: cellValue }) || {});
                                return cellValue;
                            }
                        }
                    },
                    {
                        prop: 'params',
                        title: this.i18nMappingObj['接口参数'], // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'description',
                        title: this.i18nMappingObj['描述'], // 列头部标题
                        minWidth: '120' // 列宽度
                    },
                    {
                        prop: 'versionStr',
                        title: this.i18nMappingObj['版本'], // 列头部标题
                        minWidth: '120' // 列宽度
                    }
                ];
            }
        },
        watch: {
            masterOId: {
                handler: function (masterOId) {
                    masterOId && this.getHistoricalEdition({ masterOId });
                },
                immediate: true
            }
        },
        methods: {
            // 获取历史版本
            getHistoricalEdition(params) {
                this.$famHttp({
                    url: '/bpm/interface/getAllIteration',
                    method: 'GET',
                    params
                }).then((resp) => {
                    let { success, data = [] } = resp || {};
                    if (success) {
                        this.tableData = data;
                    }
                });
            },
            // 表单校验
            formVerification() {
                const { dynamicForm } = this.$refs,
                    { submit, serializeEditableAttr } = dynamicForm;
                return { submit, serializeEditableAttr };
            }
        }
    };
});
