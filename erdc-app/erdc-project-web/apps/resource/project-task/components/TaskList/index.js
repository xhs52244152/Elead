define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-task/components/TaskList/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    'css!' + ELMP.resource('project-task/components/TaskList/index.css'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (ErdcKit, template, store, ppmUtils, ErdcStore) {
    return {
        name: 'plan_list_component',
        template: template,
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-task/locale/index.js'),
                i18nMappingObj: {
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    deleteTipsInfo: this.getI18nByKey('deleteTipsInfo'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    notGroup: this.getI18nByKey('notGroup'),
                    group: this.getI18nByKey('group'),
                    kanban: this.getI18nByKey('kanban'),
                    list: this.getI18nByKey('list'),
                    layout: this.getI18nByKey('layout'),
                    loadMore: this.getI18nByKey('loadMore'),
                    dataLoading: this.getI18nByKey('dataLoading'),
                    plan: this.getI18nByKey('plan'),
                    mainPlan: this.getI18nByKey('mainPlan'),
                    noAuthCheck: this.getI18nByKey('noAuthCheck')
                },
                readonly: false,
                formInfo: {
                    state: '', // 表单状态
                    planOid: ''
                },
                selectList: [],
                groupAttrName: 'notGroup',
                layoutOptionsValue: 'list',
                groupOptions: [],
                isReady: false,
                currentPlanSet: ' ',
                // 可选计划集数据
                planSetOptions: {
                    // defaultCollectId: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1'
                },
                // 缓存的表格查询条件信息
                requestDataCache: {},
                baselineOid: '',
                latestOid: '',
                // 上传交付物 弹窗
                uploadDeliverableVisible: false,
                // 当前行
                currentTask: { UID: '' }
            };
        },
        computed: {
            layoutOptions() {
                return [
                    {
                        label: this.i18nMappingObj.list,
                        value: 'list'
                    },
                    {
                        label: this.i18nMappingObj.kanban,
                        value: 'kanban'
                    }
                ];
            },
            showPlanSet() {
                return !!this.projectOid;
            },
            projectOid() {
                return this.$route.query.pid;
            },
            isDashboard() {
                return this.taskTableConfigKey === 'projectDashboard';
            },
            className() {
                return store.state.classNameMapping.task;
            },
            planSetClass() {
                return 'erd.cloud.ppm.plan.entity.TaskCollect';
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#taskColor',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#name',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.plan.entity.Task#planInfo.completionRate',
                        type: 'default'
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            tableBaseConfig() {
                let { showPlanSet, groupAttrName } = this;
                let useGroup = groupAttrName !== 'notGroup';
                return {
                    'treeNode': showPlanSet || useGroup ? 'erd.cloud.ppm.plan.entity.Task#name' : '',
                    'treeConfig': {
                        rowField: 'oid',
                        parentField: 'parentRef',
                        lazy: true,
                        loadMethod: this.loadChildrenMethod,
                        hasChildField: 'hasChild',
                        transform: showPlanSet,
                        toggleMethod: this.toggleTreeExpand
                    },
                    'row-id': 'oid',
                    'showOverflow': true,
                    // 'span-method': this.spanMethod,
                    'scroll-y': { enabled: showPlanSet, gt: 20 }
                };
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: _this.tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: this.isDashboard
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: _this.tableBaseConfig,
                        beforeRequest: function (config) {
                            if (!_this.currentPlanSet.trim() && _this.showPlanSet) {
                                return _this.getPlanSetOptions(config);
                            } else {
                                return new Promise((resolve) => {
                                    resolve(config);
                                });
                            }
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: _this.requestConfig,
                            // 更多配置参考axios官网
                            transformRequest: [
                                function (data, headers) {
                                    // 记录查询条件信息
                                    _this.requestDataCache = data;
                                    headers['Content-Type'] = 'application/json';
                                    return JSON.stringify(data);
                                }
                            ],
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);

                                    if (!_this.showPlanSet) {
                                        let useGroup = _this.groupAttrName !== 'notGroup';
                                        // 数据分组处理
                                        if (useGroup) {
                                            let result = resData.data.records;
                                            _.each(result, (item) => {
                                                _.each(item.attrRawList, (attr) => {
                                                    item[attr.attrName] = attr.displayName || '';
                                                });
                                            });
                                            let resp = [];
                                            _.each(_.groupBy(result, _this.groupAttrName), (childs, key) => {
                                                resp.push({
                                                    'erd.cloud.ppm.plan.entity.Task#name':
                                                        (key ? key : '--') + `(${childs.length})`,
                                                    //  用来判断是否是分组行
                                                    'isGroupRow': true,
                                                    'children': childs,
                                                    'hasChild': false
                                                });
                                            });
                                            resData.data.records = resp;
                                        }
                                        return resData;
                                    }
                                    // 组装计划集数据行
                                    let records = _this.planSetOptions?.collects
                                        ?.filter((item) => {
                                            return (
                                                _this.currentPlanSet.trim() === '' || item.oid === _this.currentPlanSet
                                            );
                                        })
                                        .map((item) => {
                                            let isCurrent = _this.collectRef === item.oid;
                                            let planSetRow = {
                                                'erd.cloud.ppm.plan.entity.Task#name': item.name,
                                                'oid': item.oid,
                                                'children': [],
                                                'hasChild': !isCurrent,
                                                'isPlanSet': true
                                            };
                                            if (isCurrent) {
                                                // 将数据挂载到相应计划集下
                                                _this.appendDataToPlanset(resData.data, planSetRow);
                                            }
                                            return planSetRow;
                                        })
                                        .filter((item) => {
                                            return (
                                                // 过滤掉没有子任务的主计划集
                                                item.oid !== 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1' ||
                                                item.children.length > 0
                                            );
                                        });
                                    resData.data.records = ppmUtils.getTreeArr(records);
                                    // 默认展开
                                    setTimeout(() => {
                                        // 切换视图时，如果上一个视图存在不是第一个计划集并且是展开状态，就会有折叠框没有收起问题。要手动收起
                                        _.each(records, (record) => {
                                            let row = _this.$table.getRowById(record.oid);
                                            if (record.oid !== _this.collectRef) {
                                                _this.$table.clearTreeExpandLoaded(row);
                                            } else {
                                                // 要展开第一个计划集数据
                                                _this.$table.setTreeExpand(row, true);
                                            }
                                        });
                                    }, 200);
                                    return resData;
                                }
                            ]
                        },
                        headerRequestConfig: {
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }

                                    // 编码、名称设置为固定列，解决出现固定列时，计划集展开按钮不更新的问题
                                    // resData?.data?.headers?.forEach((item) => {
                                    //     if (
                                    //         [
                                    //             'erd.cloud.ppm.plan.entity.Task#name',
                                    //             'erd.cloud.ppm.plan.entity.Task#identifierNo'
                                    //         ].includes(item.attrName)
                                    //     ) {
                                    //         item.fixed = 'left';
                                    //     }
                                    // });
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            showMoreSearch: this.taskTableConfigKey !== 'projectDashboard', // 是否显示高级搜索，默认显示

                            fuzzySearch: {
                                show: this.isDashboard // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: this.taskTableConfigKey !== 'projectDashboard'
                            },
                            actionConfig: this.isDashboard
                                ? {}
                                : {
                                      name: 'PPM_TASK_LIST_MENU',
                                      containerOid: this.projectOid,
                                      className: _this.className
                                  }
                        },
                        isFilterAble: this.taskTableConfigKey !== 'projectDashboard',
                        addSeq: !this.showPlanSet,

                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        },
                        pagination: {
                            showPagination: !_this.showPlanSet
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            // vxe-table
            $table() {
                return this.$refs.taskList.getTableInstance('vxeTable', 'instance');
            },
            // 整合了默认计划集的当前计划集oid，通常和currentPlanSet相同
            collectRef() {
                let collectRef = this.currentPlanSet.trim();
                if (!collectRef) collectRef = this.planSetOptions.defaultCollectId;
                return collectRef;
            },
            // 我的任务和任务列表的配置信息
            taskTableConfig() {
                let { collectRef } = this;
                let commonConditions = [
                    {
                        attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                        oper: 'EQ',
                        value1: collectRef
                    },
                    {
                        attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                        oper: 'EQ',
                        value1: this.projectOid
                    }
                    // {
                    //     attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                    //     oper: 'NE',
                    //     value1: 'DRAFT'
                    // },
                    // {
                    //     attrName: 'erd.cloud.ppm.plan.entity.Task#cutted',
                    //     oper: 'EQ',
                    //     value1: 'false'
                    // }
                ];
                if (this.baselineOid && this.taskTableConfigKey === 'projectTaskList') {
                    commonConditions.push({
                        attrName: 'erd.cloud.ppm.plan.entity.Task#baselineMasterRef',
                        oper: 'EQ',
                        value1: this.baselineOid
                    });
                }
                return {
                    // 视图表格的入参
                    requestConfig: {
                        projectTaskList: {
                            conditionDtoList: commonConditions,
                            baselined: !!this.baselineOid
                        },
                        myTaskList: {},
                        projectDashboard: {
                            conditionDtoList: commonConditions,
                            baselined: !!this.baselineOid
                        },
                        template: {
                            conditionDtoList: commonConditions,
                            tmplTemplated: !!(
                                store.state.projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid
                            )
                        }
                    },
                    // 按钮配置
                    btnConfig: {
                        projectTaskList: '',
                        myTaskList: '',
                        projectDashboard: '',
                        template: ''
                    },
                    // 视图key
                    tableKey: {
                        projectTaskList: 'taskView',
                        myTaskList: 'WorkbenchTaskView',
                        projectDashboard: 'overDueTaskView',
                        template: 'TaskTemplateView'
                    }
                };
            },
            requestConfig() {
                let obj = {
                    sortBy: 'asc',
                    orderBy: 'erd.cloud.ppm.plan.entity.Task#identifierNo'
                };
                return { ...obj, ...this.taskTableConfig.requestConfig[this.taskTableConfigKey] };
            },
            tableKey() {
                return this.taskTableConfig.tableKey[this.taskTableConfigKey];
            },
            taskTableConfigKey() {
                // 如果路径包含space代表是项目空间
                const currentModule = this.$route.path.includes('space')
                    ? // 项目空间中区分是否为仪表盘任务
                      this.$route.path.includes('project-dashboard')
                        ? 'projectDashboard'
                        : 'projectTaskList'
                    : 'myTaskList';
                // 区分是工作台的我的任务还是项目里的任务列表或者项目模板里的任务列表
                return store.state.projectInfo['templateInfo.tmplTemplated'] && this.projectOid
                    ? 'template'
                    : currentModule;
            },
            mainPlan() {
                return this.i18nMappingObj.mainPlan;
            },
            enableScrollLoad() {
                return !this.showPlanSet;
            }
        },
        watch: {
            currentPlanSet(value) {
                // TODO 根据计划集查询表格数据
                // 如果是所有计划集，则更新可选计划集数据
                if (!this.showPlanSet) return;
                this.refreshTable();
                // if (value.trim() === '') {
                // let tableInstance = this.$refs?.taskList?.getTableInstance('advancedTable') || {};
                // let conditionDtoList = tableInstance?.requestConfig?.data?.conditionDtoList || {};
                // let requestData = {
                //     conditionDtoList
                // };
                // this.getPlanSetOptions(requestData).then(() => {
                // this.refreshTable();
                // });
                // } else {
                //     this.refreshTable();
                // }
            }
        },
        created() {
            if (this.showPlanSet) {
                this.isReady = true;
            } else {
                this.isReady = true;
            }
        },
        methods: {
            /**
             * 手动设置计划集展开收缩的图标
             * @param obj
             * @returns {boolean}
             */
            toggleTreeExpand(obj) {
                let $trBtn = $(`tr[rowid='${encodeURIComponent(obj.row.oid)}']`).find('i.vxe-tree--node-btn');
                $trBtn.addClass('erd-iconfont');
                if (obj.expanded) {
                    $trBtn.addClass('erd-icon-arrow-down').removeClass('erd-icon-arrow-right');
                } else {
                    $trBtn.addClass('erd-icon-arrow-right').removeClass('erd-icon-arrow-down');
                }
                return true;
            },
            // 视图切换
            beforeLoadHead(data, callBack) {
                if (!this.showPlanSet) {
                    callBack();
                    return;
                }
                let requestData = {
                    conditionDtoList: [
                        ...data.conditionDtos,
                        ...(this.taskTableConfig.requestConfig[this.taskTableConfigKey].conditionDtoList || [])
                    ]
                };
                this.getPlanSetOptions(requestData).then(() => {
                    callBack();
                });
            },
            changeBaseline({ value, latestOid }) {
                this.baselineOid = value;
                this.latestOid = latestOid || ''; //操作选择基线对比时用到
                this.refreshTable();
            },
            /**
             * 获取任务taskColor字段，格式与计划中一样
             * @param {object} val
             */
            getTaskColor(val) {
                return val?.find((item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#taskColor');
            },
            getPlanSetOptions(config) {
                const { planSetClass } = this;
                let configRes = JSON.parse(JSON.stringify(config));
                configRes.data.conditionDtoList = configRes.data.conditionDtoList.filter(
                    (item) => item.attrName !== 'erd.cloud.ppm.plan.entity.Task#collectRef'
                );
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/ppm/plan/v1/view/collect/list',
                        data: configRes.data,
                        className: this.className,
                        method: 'post'
                    }).then((resp) => {
                        let { defaultCollectId, collects } = resp?.data || {};
                        this.planSetOptions = {
                            defaultCollectId,
                            collects: defaultCollectId
                                ? [
                                      {
                                          name: this.mainPlan,
                                          oid: `OR:${planSetClass}:-1`
                                      }
                                  ].concat(collects || [])
                                : []
                        };
                        config.data.conditionDtoList.filter(
                            (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#collectRef'
                        )[0].value1 = defaultCollectId;
                        resolve(config);
                    });
                });
            },
            getCompletionRate(row, percentSign = '') {
                if (row['erd.cloud.ppm.plan.entity.Task#completionRate'] === '（安全信息）') {
                    return '——';
                }
                let percentKey = 'erd.cloud.ppm.plan.entity.Task#planInfo.completionRate';
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            },
            actionClick() {
                // const eventClick = {
                //     TASK_EXCEL_EXPORT: () => {
                //         return console.log('excel导出');
                //     }
                // };
            },
            renderTableCallback() {
                let result = [];
                if (this.$refs.taskList) {
                    let tableInstance = this.$refs.taskList.getTableInstance('advancedTable');
                    let columns = tableInstance.instance.columns.filter(
                        (item) => item.attrName && item.attrName !== 'operation'
                    );
                    result = columns.map((item) => {
                        return { label: item.label, attrName: item.attrName };
                    });
                    result.unshift({
                        label: this.i18nMappingObj.notGroup,
                        attrName: 'notGroup'
                    });
                    let advancedTable = this.$refs.taskList.getTableInstance('advancedTable', 'instance');
                    let planSets = advancedTable.tableData.filter((item) => item.parentRef === '-1');
                    setTimeout(() => {
                        // 因为vxe表格懒加载和合并单元格一起用会导致折叠图标出不来，所以通过样式去合并计划集行
                        _.each(planSets, (item) => {
                            let $tr = $('.vxe-table--main-wrapper').find(`[rowid="${encodeURIComponent(item.oid)}"]`);
                            let $treeNode = $tr.find('.col--tree-node').attr('colspan', advancedTable.columns.length);
                            $tr.find('td').remove();
                            $tr.append($treeNode).css({
                                'position': 'relative',
                                'z-index': 60
                            });
                        });
                    }, 100);
                }
                this.groupOptions = result;
            },
            openDetail(row) {
                if (row.isGroupRow) return;
                if (row.isMore) return this.loadMore(row);
                if (row['erd.cloud.ppm.plan.entity.Task#name'] === '（安全信息）') {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.noAuthCheck
                    });
                }
                let { oid } = row.attrRawList.find(
                    (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#projectRef'
                );

                let collectId = row.attrRawList.find(
                    (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#collectRef'
                );

                let query = {
                    pid: this.projectOid || oid,
                    planOid: row.oid,
                    planTitle: row['erd.cloud.ppm.plan.entity.Task#name'],
                    collectId: collectId?.oid || '',
                    baselined: !!this.baselineOid
                };
                if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                    const appName = 'erdc-project-web';
                    const targetPath = '/space/project-task/taskDetail';
                    // path组装query参数
                    let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                    window.open(url, appName);
                } else {
                    this.$router.push({
                        path: '/space/project-task/taskDetail',
                        query: {
                            pid: this.projectOid || oid,
                            planOid: row.oid,
                            planTitle: row['erd.cloud.ppm.plan.entity.Task#name'],
                            collectId: collectId?.oid || '',
                            baselined: !!this.baselineOid
                        }
                    });
                }
            },
            // 复选框全选
            selectAllEvent(data) {
                this.groupAttrName === 'notGroup'
                    ? (this.selectList = data.records)
                    : (this.selectList = data.records.filter((item) => !item.isGroupRow));
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.groupAttrName === 'notGroup'
                    ? (this.selectList = data.records)
                    : (this.selectList = data.records.filter((item) => !item.isGroupRow));
            },
            // 改变分组时间
            changeGroupData() {
                this.refreshTable();
            },
            // 刷新表格
            refreshTable() {
                this.$refs.taskList?.refreshTable('all');
            },
            // 处理数据格式
            formatData(data) {
                let result =
                    data?.map((item) => {
                        let attrData = {};
                        item.attrRawList.forEach((item) => {
                            attrData[item.attrName] = item.displayName;
                        });
                        return Object.assign(attrData, item);
                    }) || [];
                return result;
            },
            // 单元格合并处理
            spanMethod({ row, column, $table }) {
                if (!row.isPlanSet && !row.isMore) {
                    return { rowspan: 1, colspan: 1 };
                } else if (column.property === 'erd.cloud.ppm.plan.entity.Task#name') {
                    let columnLen = $table.getColumns().length;
                    return { rowspan: 1, colspan: columnLen };
                } else {
                    return { rowspan: 0, colspan: 0 };
                }
            },
            // 加载子节点
            loadChildrenMethod({ row }) {
                let { appendDataToPlanset, requestDataCache } = this;

                let requestData = JSON.parse(JSON.stringify(requestDataCache));
                let collectRef = requestData.conditionDtoList.filter((item) => {
                    return item.attrName === 'erd.cloud.ppm.plan.entity.Task#collectRef';
                })[0];
                if (collectRef) {
                    collectRef.value1 = row.oid;
                } else {
                    requestData.conditionDtoList.push({
                        attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                        oper: 'EQ',
                        value1: row.oid
                    });
                }
                requestData = {
                    ...requestData,
                    pageIndex: 1,
                    pageSize: 20
                };
                return new Promise((resolve) => {
                    this.$famHttp({
                        url: '/ppm/view/table/page',
                        method: 'POST',
                        className: this.className,
                        data: requestData
                    }).then((resp) => {
                        let data = appendDataToPlanset(resp.data, row.oid, true);
                        row.hasChild = false;
                        resolve(data);
                    });
                });
            },
            // 加载更多
            loadMore(row) {
                if (row.isLoading) return;
                row.isLoading = true;
                row['erd.cloud.ppm.plan.entity.Task#name'] = this.i18nMappingObj.dataLoading;

                let { appendDataToPlanset } = this;
                let requestData = JSON.parse(JSON.stringify(this.requestDataCache));
                let planSetOid = row.oid.split('#')[0];

                let collectRef = requestData.conditionDtoList.filter((item) => {
                    return item.attrName === 'erd.cloud.ppm.plan.entity.Task#collectRef';
                })[0];
                if (collectRef) {
                    collectRef.value1 = planSetOid;
                } else {
                    requestData.conditionDtoList.push({
                        attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                        oper: 'EQ',
                        value1: planSetOid
                    });
                }
                requestData = {
                    ...requestData,
                    pageIndex: row.pageIndex + 1,
                    pageSize: row.pageSize
                };
                // 加载数据并追加到计划集上
                this.$famHttp({
                    url: '/ppm/view/table/page',
                    method: 'POST',
                    className: this.className,
                    data: requestData
                }).then((resp) => {
                    appendDataToPlanset(resp.data, planSetOid, false, true);
                    row.isLoading = false;
                });
            },
            /**
             * 将数据追加至指定计划集下
             * @param {*} data 接口返回数据 resp.data
             * @param {*} planSet 计划集数据，传计划集oid，或计划集行数据。若计划集为表格已有数据，建议传oid，便于取到正确的数据
             * @param {*} isLoadChild 是否为加载子节点
             * @returns 返回计算后的远程数据
             */
            appendDataToPlanset(data, planSet, isLoadChild = false, islaodMore = false) {
                let { formatData, $table, groupAttrName, i18nMappingObj } = this;
                let planSetRow = planSet;
                let useGroup = groupAttrName !== 'notGroup';
                let isTableData = _.isString(planSet);
                let advancedTable = this.$refs.taskList.getTableInstance('advancedTable', 'instance');
                if (isTableData) {
                    planSetRow = $table.getRowById(planSet);
                }
                planSetRow.hasChild = false;

                // 数据格式处理
                let remoteData = data.records || [];
                let newGroupData = [];
                remoteData = formatData(data.records || []).map((item) => {
                    item.collectChangeTask = item?.attrRawList?.find(
                        (row) => row.attrName === 'erd.cloud.ppm.plan.entity.Task#collectChangeTask'
                    )?.value;
                    item.status =
                        item?.attrRawList?.find(
                            (row) => row.attrName === 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status'
                        )?.value || '';
                    if (!useGroup) {
                        item.parentRef = planSetRow.oid;
                        return item;
                    }

                    // 分组处理
                    let groupOid = `${planSetRow.oid}#${item[groupAttrName]}#group`;
                    let group = islaodMore
                        ? $table.getRowById(groupOid)
                        : newGroupData.find((ite) => ite.oid === groupOid);
                    let currentGroupName = item[groupAttrName] ? item[groupAttrName] : '--';
                    if (groupAttrName === 'erd.cloud.ppm.plan.entity.Task#taskColor') {
                        currentGroupName = '';
                    }
                    if (group) {
                        group.children.push(item);
                        group['erd.cloud.ppm.plan.entity.Task#name'] = currentGroupName + `(${group.children.length})`;
                    } else {
                        newGroupData.push({
                            'erd.cloud.ppm.plan.entity.Task#name': currentGroupName + `(1)`,
                            //  用来判断是否是分组行
                            'isGroupRow': true,
                            'children': [item],
                            'hasChild': false,
                            'oid': groupOid,
                            'parentRef': planSetRow.oid
                        });
                    }

                    item.parentRef = groupOid;
                    return item;
                });

                remoteData.push(...newGroupData);

                // "加载更多"行
                let moreRow = [
                    {
                        'erd.cloud.ppm.plan.entity.Task#name': i18nMappingObj.loadMore,
                        'oid': `${planSetRow.oid}#more`,
                        'isMore': true,
                        'pageSize': data.pageSize,
                        'pageIndex': data.pageIndex,
                        'total': +data.total,
                        'parentRef': planSetRow.oid
                    }
                ];
                if (data.pageSize * data.pageIndex < +data.total) {
                    remoteData.push(...moreRow);
                } else {
                    moreRow = [];
                }

                planSetRow.children =
                    planSetRow.children.filter((item) => item.oid && item['erd.cloud.ppm.plan.entity.Task#name']) || [];

                // 删掉旧的“加载更多”行
                let lastRow = planSetRow.children.slice(-1)[0] || {};
                if (lastRow.isMore) {
                    planSetRow.children.splice(planSetRow.children.length - 1, 1);
                    let index = advancedTable.tableData.findIndex((item) => item.oid === lastRow.oid);
                    if (index > -1) advancedTable.tableData.splice(index, 1);
                }

                let resultChildren = useGroup ? [...newGroupData, ...moreRow] : remoteData;
                planSetRow.children.push(...resultChildren);
                if (isTableData || isLoadChild) {
                    this.$nextTick(() => {
                        advancedTable.tableData.push(...remoteData);
                    });
                }
                return resultChildren;
            },
            // 上传交付物
            uploadDeliverable({ UID }) {
                this.currentTask = { UID };
                this.uploadDeliverableVisible = true;
            },
            onDeliveryFullscreen() {
                // 页面大小变化后，重新调整表格宽度自适应
                this.$refs?.['deliveryDetailRef'].resizeTableColumns();
            },
            onDeliverableClosed() {
                this.currentTask = { UID: '' };
                this.refreshTable();
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            BaselineSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/BaselineSelect/index.js')
            ),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js')),
            DeliveryDetail: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/DeliveryDetails/index.js'))
        }
    };
});
