define(['text!' + ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.html')], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            BpmProcessStatus: ErdcKit.asyncComponent(ELMP.resource('erdc-process-components/BpmProcessStatus/index.js'))
        },
        props: {
            columns: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            businessOid: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                emptyImgSrc: ELMP.resource('erdc-app/images/empty.svg'),
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/ProcessRecords/locale/index.js'),
                i18nMappingObj: {
                    processName: this.getI18nByKey('processName'),
                    processTemplate: this.getI18nByKey('processTemplate'),
                    currentNode: this.getI18nByKey('currentNode'),
                    currentProcessor: this.getI18nByKey('currentProcessor'),
                    startTime: this.getI18nByKey('startTime'),
                    processStatus: this.getI18nByKey('processStatus'),
                    promoter: this.getI18nByKey('promoter'),
                    nodata: this.getI18nByKey('nodata'),
                    finish: this.getI18nByKey('finish')
                },
                tableData: []
            };
        },
        watch: {
            'oid': {
                handler() {
                    this.getProcessData();
                },
                immediate: true
            },
            '$route.query.activeName': {
                handler(value) {
                    if (value === 'processRecords') this.getProcessData();
                }
            }
        },
        computed: {
            oid() {
                return this.businessOid || this.$route.query.oid;
            },
            tableColumns() {
                let columns = [
                    {
                        prop: 'seq',
                        type: 'seq',
                        title: ' ',
                        width: 48,
                        align: 'center'
                    },
                    {
                        prop: 'name',
                        title: this.i18nMappingObj.processName
                    },
                    {
                        prop: 'processDefinitionName',
                        title: this.i18nMappingObj.processTemplate
                    },
                    {
                        prop: 'activityNameList',
                        title: this.i18nMappingObj.currentNode
                    },
                    {
                        prop: 'activityAssigneeList',
                        title: this.i18nMappingObj.currentProcessor
                    },
                    {
                        prop: 'startTime',
                        title: this.i18nMappingObj.startTime
                    },
                    {
                        prop: 'startUserId',
                        title: this.i18nMappingObj.promoter
                    },
                    {
                        prop: 'state',
                        title: this.i18nMappingObj.processStatus
                    }
                ];
                return this.columns.length ? this.columns : columns;
            }
        },
        methods: {
            getProcessData() {
                if (this.oid) {
                    this.$famHttp({
                        url: '/bpm/process/history/' + this.oid,
                        method: 'GET'
                    }).then((res) => {
                        let users = res.data.users;
                        this.tableData = res.data.processInstances.map((item) => {
                            if (item?.activityNameList?.length)
                                item.activityNameList = item?.activityNameList?.join(',');
                            else item.activityNameList = this.i18nMappingObj.finish;
                            if (item.activityAssigneeList)
                                item.activityAssigneeList = item.activityAssigneeList
                                    .map((userId) => {
                                        return users.find((user) => user.id === userId)?.displayName || '';
                                    })
                                    .join(',');
                            item.startUserId = users.find((user) => user.id === item.startUserId)?.displayName || '';
                            return item;
                        });
                    });
                }
            },
            openDetail({ row }) {
                let { query, path } = this.$route;
                const route = {
                    path,
                    query
                };
                // 注：需要兼容流程终止后的跳转，没有processInfoTasks属性
                let taskOId = row?.processInfoTasks?.find((item) => item.taskKey === row.activityId)?.oid;
                taskOId && localStorage.setItem(`${row.processDefinitionKey}:${taskOId}:backRoute`, JSON.stringify(route));
                this.$router.push({
                    path: `/container/bpm-resource/workflowActivator/${row['oid']}`,
                    query: {
                        taskDefKey: row['activityId'],
                        taskOId,
                        readonly: 'false',
                        processInstanceOId: row['oid'],
                        containerRef: this.oid
                    }
                });
            },
            getStateData(state) {
                const statusMap = {
                    running: 'LIFECYCLE_RUNNING',
                    completed: 'LIFECYCLE_COMPLETED',
                    suspended: 'LIFECYCLE_SUSPENDED',
                    exception: 'LIFECYCLE_EXCEPTION'
                };
                return statusMap[state];
            }
        }
    };
});
