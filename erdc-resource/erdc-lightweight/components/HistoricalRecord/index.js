define([
    'text!' + ELMP.resource('erdc-lightweight/components/HistoricalRecord/index.html'),
    ELMP.resource('erdc-lightweight/components/mixins.js')
], function (template, mixins) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'LightweightHistoricalRecord',
        template,
        mixins: [mixins],
        components: {
            Logs: ErdcKit.asyncComponent(ELMP.resource('erdc-lightweight/components/Logs/index.js'))
        },
        props: {
            // 任务oid
            oid: String,
            // 对象类名
            className: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-lightweight/locale/index.js'),
                unfold: {
                    record: true,
                    logs: true
                },
                // 历史记录表格
                recordTableData: [],
                // 当前查看记录
                currentRow: {}
            };
        },
        computed: {
            // 历史记录列头
            recordColumn() {
                return [
                    {
                        type: 'seq',
                        align: 'center',
                        fixed: 'left',
                        width: 48
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n?.['任务编号']
                    },
                    {
                        prop: 'statusName',
                        title: this.i18n?.['任务状态']
                    },
                    {
                        prop: 'docNumber',
                        title: this.i18n?.['图文档编号']
                    },
                    {
                        prop: 'docName',
                        title: this.i18n?.['图文档名称']
                    },
                    {
                        prop: 'version',
                        title: this.i18n?.['版本']
                    },
                    {
                        prop: 'operator',
                        title: this.i18n?.['操作']
                    },
                ]
            },
            tableData() {
                return this.formatJsonData(JSON.parse(this.currentRow?.logDetail || '{}'));
            }
        },
        created() {
            this.getHistoryTaskByDocOid();
        },
        methods: {
            // 获取指定图文档的历史记录
            getHistoryTaskByDocOid() {
                const data = {
                    docOid: this.oid
                }
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/getHistoryTaskByDocOid',
                    method: 'get',
                    data,
                    className: this.className
                }).then((resp) => {
                    const recordTableData = resp?.res?.data || [];
                    this.recordTableData = recordTableData;
                    if (this.recordTableData?.length) {
                        [this.currentRow] = this.recordTableData;
                    }
                });
            },
            // 查看指定项的操作日志
            toViewLog({ row }) {
                this.currentRow = row;
            }
        }
    };
});
