define([
    'text!' + ELMP.resource('erdc-lightweight/components/TaskDetails/index.html'),
    ELMP.resource('erdc-lightweight/components/mixins.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js')
], function (template, mixins, cbbUtils) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'LightweightTaskDetails',
        template,
        mixins: [mixins],
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
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
                    base: true,
                    logs: true
                },
                // 任务详情
                taskDetails: {},
                // 加载中
                loading: false
            };
        },
        computed: {
            // 任务日志表格数据
            tableData() {
                return this.formatJsonData(JSON.parse(this.taskDetails?.logDetail || '{}'));
            },
            // 能否下载到本地
            canDownload() {
                return _.isArray(this.tableData) && this.tableData.length;
            },
            formConfigs() {
                return [
                    {
                        field: 'identifierNo',
                        component: 'erd-input',
                        label: this.i18n?.['任务编号'],
                        col: 12
                    },
                    {
                        field: 'workerIdentifier',
                        component: 'erd-input',
                        label: this.i18n?.['Worker机'],
                        col: 12
                    },
                    {
                        field: 'docNumber',
                        component: 'erd-input',
                        label: this.i18n?.['图文档编号'],
                        slots: {
                            readonly: 'doc-details',
                            component: 'doc-details'
                        },
                        col: 12
                    },
                    {
                        field: 'startTime',
                        component: 'erd-input',
                        label: this.i18n?.['开始时间'],
                        col: 12
                    },
                    {
                        field: 'docName',
                        component: 'erd-input',
                        label: this.i18n?.['图文档名称'],
                        slots: {
                            readonly: 'doc-details',
                            component: 'doc-details'
                        },
                        col: 12
                    },
                    {
                        field: 'commitTime',
                        component: 'erd-input',
                        label: this.i18n?.['任务结束'],
                        col: 12
                    },
                    {
                        field: 'version',
                        component: 'erd-input',
                        label: this.i18n?.['图文档版本'],
                        col: 12
                    },
                    {
                        field: 'statusName',
                        component: 'erd-input',
                        label: this.i18n?.['任务状态'],
                        col: 12
                    },
                    {
                        field: 'containerName',
                        component: 'erd-input',
                        label: this.i18n?.['图文档上下文'],
                        col: 12
                    },
                    {
                        field: 'promoterName',
                        component: 'erd-input',
                        label: this.i18n?.['任务提交者'],
                        col: 12
                    }
                ];
            }
        },
        created() {
            this.getTaskByOid();
        },
        methods: {
            // 查看图文档详情
            viewEpmDetails({ row }) {
                cbbUtils.goToDetail.call(this, { oid: row?.docOid });
            },
            // 下载到本地
            downLogs() {
                const data = {
                    taskOid: this.oid
                }
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/getLogByTaskOid',
                    method: 'get',
                    data,
                    className: this.className
                }).then((resp) => {
                    // 尝试删除request.js设置的data默认值
                    if (resp["data"] && _.isEmpty(resp["data"])) {
                        delete resp.data;
                    }
                    // 从响应头里获取文件名信息
                    var filenameData = resp.headers?.['content-disposition'];
                    // 只返回JSON文件给用户
                    var filename = filenameData.split(";").slice(-1)[0].split("=").slice(-1)[0].split(".").slice(-1)[0] + '.JSON';
                    // 尝试解析成字符串写入
                    var insert = _.isObject(resp) ? JSON.stringify(resp) : resp;
                    this.funDownload(insert, filename);
                }).catch((resp) => {
                    // 尝试删除request.js设置的data默认值
                    if (resp["data"] && _.isEmpty(resp["data"])) {
                        delete resp.data;
                    }
                    // 从响应头里获取文件名信息
                    var filenameData = resp.headers?.['content-disposition'];
                    // 只返回JSON文件给用户
                    var filename = filenameData.split(";").slice(-1)[0].split("=").slice(-1)[0].split(".").slice(-1)[0] + '.JSON';
                    // 尝试解析成字符串写入
                    var insert = _.isObject(resp) ? JSON.stringify(resp) : resp;
                    this.funDownload(insert, filename);
                });
            },
            // 自定义下载方法
            funDownload(content, filename) {
                var eleLink = document.createElement('a');
                eleLink.download = filename;
                eleLink.style.display = 'none';
                // 字符内容转变成blob地址
                var blob = new Blob([content]);
                eleLink.href = URL.createObjectURL(blob);
                // 触发点击
                document.body.appendChild(eleLink);
                eleLink.click();
                // 然后移除
                document.body.removeChild(eleLink);
            },
            // 通过oid获取任务详情
            getTaskByOid() {
                const data = {
                    taskOid: this.oid
                }
                this.loading = true;
                this.$famHttp({
                    url: '/viewer/derivedImageTask/task/getTaskByOid',
                    method: 'get',
                    data,
                    className: this.className
                }).then((resp) => {
                    const taskDetails = resp?.res?.data || {};
                    this.taskDetails = taskDetails;
                }).finally(() => {
                    this.loading = false;
                });
            },
            // 刷新任务详情
            refreshTaskInfo() {
                this.getTaskByOid();
            }
        }
    };
});
