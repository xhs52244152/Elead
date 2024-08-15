define([
    'text!' + ELMP.resource('system-queue/components/InstanceList/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-queue/components/InstanceList/style.css')
], function (template, utils) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 列表数据
            data: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-queue/components/InstanceList/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    triggeringTime: this.getI18nByKey('触发时间'),
                    startDate: this.getI18nByKey('开始日期'),
                    endDate: this.getI18nByKey('结束日期'),
                    details: this.getI18nByKey('详情'),
                    LOG: this.getI18nByKey('日志'),
                    more: this.getI18nByKey('更多'),
                    retry: this.getI18nByKey('重试'),
                    stop: this.getI18nByKey('停止'),

                    taskList: this.getI18nByKey('任务列表'),
                    taskID: this.getI18nByKey('队列ID'),
                    questName: this.getI18nByKey('队列名称'),
                    queueTaskID: this.getI18nByKey('队列任务ID'),
                    status: this.getI18nByKey('状态'),
                    endTime: this.getI18nByKey('结束时间'),
                    nodeInformation: this.getI18nByKey('节点信息'),
                    retrySuccess: this.getI18nByKey('重试成功'),
                    stopSuccess: this.getI18nByKey('停止成功'),
                    pauseLose: this.getI18nByKey('停止失败'),
                    operation: this.getI18nByKey('操作')
                },
                listData: [
                    {
                        id: '11',
                        jobName: '123',
                        jobID: 'jobID',
                        state: 'state',
                        startTime: 'startTime',
                        endTime: 'endTime',
                        instanceCount: 'instanceCount'
                    }
                ],
                total: 0,
                pageSize: 20,
                currentPage: 1,
                visibleDropdown: false,
                tableHeight: $(window).height() - 300,
                searchTime: [],
                instanceDetailVisible: false,
                instanceLogVisible: false,
                instanceId: '',
                loading: false,
                status: '',
                options: [],
                defaultProps: {
                    label: 'statusDes',
                    value: 'statusValue',
                    key: 'statusValue'
                }
            };
        },
        watch: {
            oid: function (n, o) {
                if (n) {
                    this.refresh();
                }
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            columns() {
                return [
                    {
                        title: ' ',
                        prop: 'seq',
                        type: 'seq',
                        align: 'center',
                        width: '48'
                    },
                    {
                        prop: 'jobId',
                        title: this.i18nMappingObj['taskID'],
                        minWidth: '72',
                        width: '72'
                    },
                    {
                        prop: 'jobName',
                        title: this.i18nMappingObj['questName'],
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'instanceId',
                        title: this.i18nMappingObj['queueTaskID'],
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'statusName',
                        title: this.i18nMappingObj['status'],
                        minWidth: '90',
                        width: '90'
                    },
                    {
                        prop: 'actualTriggerDateTime', // 转时间类型
                        title: this.i18nMappingObj['triggeringTime'],
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'finishedDateTime',
                        title: this.i18nMappingObj['endTime'],
                        minWidth: '160',
                        width: '160'
                    },
                    {
                        prop: 'taskTrackerAddress',
                        title: this.i18nMappingObj['nodeInformation'],
                        minWidth: '160'
                    },
                    {
                        prop: 'oper',
                        title: this.i18nMappingObj['operation'],
                        fixed: 'right',
                        minWidth: this.language === 'zh_cn' ? '142' : '160',
                        width: this.language === 'zh_cn' ? '142' : '160'
                    }
                ];
            },
            pulldownList() {
                return [
                    {
                        label: this.i18nMappingObj['retry'],
                        actionName: 'retry',
                        disabled: false,
                        hide: false
                    },
                    {
                        label: this.i18nMappingObj['stop'],
                        actionName: 'stop',
                        disabled: false,
                        hide: false
                    }
                ];
            },
            listTitle() {
                return this.i18nMappingObj['taskList'];
            }
        },
        mounted() {
            this.refresh();
            this.getOptions();
        },
        methods: {
            // 刷新列表
            refresh() {
                this.getDataList();
            },
            getDataList() {
                this.loading = true;
                this.$famHttp({
                    url: '/fam/job/listInstance',
                    data: {
                        jobId: this.data.id || '',
                        index: this.currentPage,
                        pageSize: this.pageSize,
                        triggerTimeStart: this.searchTime[0],
                        triggerTimeEnd: this.searchTime[1],
                        status: this.status
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        let { data } = resp;
                        // const timeTransform = ['actualTriggerTime', 'finishedTime'];
                        // timeTransform.forEach((value) => {
                        //     data.data.forEach((item) => {
                        //         item[`${value}Name`] = utils.formatDateTime(
                        //             new Date(Number(item.finishedTime)),
                        //             'yyyy-mm-dd'
                        //         );
                        //     });
                        // });

                        this.listData = data.data;

                        this.currentPage = data.index;
                        this.pageSize = data.pageSize;
                        this.total = Number(data.totalItems);
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            getOptions() {
                this.$famHttp({
                    url: '/fam/job/instanceStatus'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.options = data;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            onSubmit() {},
            sizeChange(val) {
                this.pageSize = val;
                this.currentPage = 1;
                this.refresh();
            },
            currentChange(val) {
                this.currentPage = val;
                this.refresh();
            },
            onCancle() {
                this.toogleShow();
            },
            onSelectTime(value) {
                utils.debounceFn(() => {
                    if (value == null) {
                        this.searchTime = [];
                    }
                    this.searchTime = this.searchTime.map((item) => {
                        return utils.formatDateTime(item, 'ymdhms');
                    });
                    // this.refresh();
                }, 300);
            },
            /**
             * 详情
             */
            onCheck(data) {
                const { row } = data;
                this.instanceId = row.instanceId || '';
                this.instanceDetailVisible = true;
            },
            /**
             * 查看日志
             * @param {*} data
             */
            onCheckLog(data) {
                const { row } = data;
                this.instanceLogVisible = true;
                this.instanceId = row.instanceId || '';
            },
            /**
             * 重试
             * @param {*} data
             */
            onRetry(data) {
                const { row } = data;
                this.$famHttp({
                    url: '/fam/job/retryInstance',
                    params: {
                        instanceId: row.instanceId
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['retrySuccess'],
                            showClose: true
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            /**
             * 停止
             * @param {*} data
             */
            onStop(data) {
                const { row } = data;
                this.$famHttp({
                    url: '/fam/job/stopInstance',
                    params: {
                        instanceId: row.instanceId
                    },
                    method: 'POST'
                })
                    .then((resp) => {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['stopSuccess'],
                            showClose: true
                        });
                        this.refresh();
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            }
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            InstanceDetail: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/InstanceDetail/index.js')),
            InstanceLog: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/InstanceLog/index.js'))
        }
    };
});
