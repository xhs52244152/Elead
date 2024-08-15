define(['text!' + ELMP.resource('erdc-cbb-components/ProcessInfo/index.html')], function (template) {
    const FamKit = require('erdc-kit');

    return {
        name: 'ProcessInfo',
        template,
        components: {
            FamAdvancedTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            BpmFlowchart: FamKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmFlowchart/index.js'))
        },
        props: {
            oid: String,
            className: String,
            vm: Object
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ProcessInfo/locale/index.js'),
                tableData: [],
                // 流程图对象
                bpmFlowchart: {
                    visible: false,
                    title: '',
                    processDefinitionId: '',
                    processInstanceId: ''
                }
            };
        },
        watch: {
            innerOid: {
                handler: function (nv) {
                    if (nv) {
                        this.$refs.processInfoTable.fnRefreshTable();
                    }
                }
            }
        },
        computed: {
            innerOid() {
                return this.oid || this.vm?.containerOid || '';
            },
            viewTableConfig() {
                return {
                    vm: this,
                    columns: [
                        {
                            attrName: 'title',
                            label: this.i18n['流程名称'],
                            treeNode: true,
                            fixed: 'left',
                            minWidth: 200
                        },
                        {
                            attrName: 'processDefinitionName',
                            label: this.i18n['流程模板'],
                            minWidth: 200
                        },
                        {
                            attrName: 'taskName',
                            label: this.i18n['当前节点'],
                            treeNode: true
                        },
                        {
                            attrName: 'assignee',
                            label: this.i18n['当前处理人']
                        },
                        {
                            attrName: 'taskStartTime',
                            label: this.i18n['发起时间']
                        },
                        {
                            attrName: 'taskEndTime',
                            label: this.i18n['结束时间']
                        },
                        {
                            attrName: 'startUserID',
                            label: this.i18n['发起人']
                        },
                        {
                            attrName: 'stateDisplayName',
                            label: this.i18n['流程状态']
                        },
                        {
                            attrName: 'operation',
                            label: this.i18n['操作'],
                            width: 120
                        }
                    ],
                    firstLoad: true,
                    tableRequestConfig: {
                        // 更多配置参考axios官网
                        url: `/change/process/byObjOid/${this.innerOid}`, // 表格数据接口
                        method: 'GET', // 请求方法（默认get）
                        className: this.className,
                        transformResponse: [
                            (respData) => {
                                let resData = respData;
                                try {
                                    resData = respData && JSON.parse(respData);
                                    let data = FamKit.deepClone(resData.data.records);
                                    resData.data.records = this.handleSort(data);
                                    resData.data.records &&
                                        resData.data.records.forEach((item) => {
                                            if (Object.prototype.hasOwnProperty.call(item, 'processTaskInfoDtos')) {
                                                item.processTaskInfoDtos.forEach((childItem) => {
                                                    childItem.parentInfo = {
                                                        processInstanceOid: item.processInstanceOid,
                                                        processDefinitionName: item.processDefinitionName
                                                    };
                                                });
                                            }
                                            item.taskId = Date.now() + parseInt(Math.random() * 1000 + 1000) + '';
                                        });
                                    this.tableData = resData.data.records;
                                } catch (err) {}
                                return resData;
                            }
                        ]
                    },
                    toolbarConfig: {
                        showMoreSearch: false,
                        showConfigCol: false,
                        showRefresh: false,
                        valueKey: 'attrName',
                        fuzzySearch: {
                            show: false
                        }
                    },
                    addSeq: true, //添加序号
                    tableBaseConfig: {
                        // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                        rowConfig: {
                            isCurrent: true,
                            isHover: true
                        },
                        columnConfig: {
                            resizable: true // 是否允许调整列宽
                        },
                        showOverflow: true, // 溢出隐藏显示省略号
                        treeNode: 'title', //必须设置树节点显示的位置
                        treeConfig: {
                            reserve: true,
                            expandAll: true,
                            children: 'processTaskInfoDtos',
                            iconOpen: 'erd-iconfont erd-icon-triangle-down',
                            iconClose: 'erd-iconfont erd-icon-triangle-right'
                        }
                    },
                    pagination: {
                        showPagination: false
                    }
                };
            },
            init() {
                return this.innerOid && this.className;
            }
        },
        methods: {
            dealProcess: function (row, isParentNode) {
                let processInstanceOId = row?.processInstanceOid || row?.parentInfo?.processInstanceOid; //流程实例id
                let taskDefKey = ''; //流程节点key
                let taskOId = ''; //流程节点oid
                //如果是父节点跳转至流程，取父节点的流程信息，反之取子节点的数据
                if (isParentNode) {
                    taskDefKey = row.processDefinitionKey;
                    taskOId = row.processTaskInfoDtos[0]?.oid || ''; //取第一个节点的taskId
                } else {
                    taskDefKey = row.taskKey;
                    taskOId = row.oid;
                }

                // 需要跳到工作台
                let appName = 'erdc-portal-web';
                let targetPath = `/container/bpm-resource/workflowActivator/${processInstanceOId}`;
                let query = {
                    taskDefKey,
                    taskOId,
                    readonly: 'false'
                };

                if (window.__currentAppName__ === appName) {
                    return this.$router.push({
                        path: targetPath,
                        query
                    });
                } else {
                    let windowPath = `/erdc-app/${appName}/index.html#${FamKit.joinUrl(targetPath, query)}`;
                    window.open(windowPath, 'erdc-portal-web');
                }
            },
            // 查看流程图
            viewFlowChart(row) {
                let { displayName = this.i18n['流程图解'] } =
                    row?.processDefinitionName || row?.parentInfo?.processDefinitionName || '';
                this.bpmFlowchart.processDefinitionId = row?.processInstanceOid || row?.parentInfo?.processInstanceOid;
                this.bpmFlowchart.processInstanceId = this.bpmFlowchart.processDefinitionId;
                this.popover({ field: 'bpmFlowchart', title: displayName, visible: true });
            },
            // 打开关闭弹窗
            popover({ field = '', visible = false, title = '' }) {
                this[field].title = title;
                this[field].visible = visible;
            },
            //按时间排序
            handleSort(data) {
                let sortData = data.map((item) => {
                    return {
                        ...item,
                        processTaskInfoDtos: item.processTaskInfoDtos.sort(function (a, b) {
                            return Date.parse(a.taskStartTime) - Date.parse(b.taskStartTime);
                        })
                    };
                });
                return sortData;
            }
        }
    };
});
