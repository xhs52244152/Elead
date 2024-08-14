define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-plan/components/Gantt/components/FrontTaskDialog/index.html'),
    ELMP.resource('ppm-utils/index.js')
], function (ErdcKit, template, utils) {
    return {
        props: {
            visible: Boolean,
            taskOid: String,
            unSavedTasks: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                i18nMappingObj: {
                    viewFrontAndBackTask: this.getI18nByKey('viewFrontAndBackTask'), // 查看前后置任务
                    predecessors: this.getI18nByKey('predecessors'), // 前置任务
                    postTask: this.getI18nByKey('postTask'), // 后置任务
                    pleaseEnterName: this.getI18nByKey('pleaseEnterName'), // 请输入名称
                    taskNotSaved: this.getI18nByKey('taskNotSaved')
                },
                preUnfold: true,
                postUnfold: true
            };
        },
        computed: {
            dataVisible: {
                set(val) {
                    this.$emit('update:visible', val);
                },
                get() {
                    return this.visible;
                }
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            commonTableConfig() {
                let { taskOid, i18nMappingObj } = this;
                return {
                    tableKey: '',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        pagination: {
                            // 隐藏分页
                            showPagination: false
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            // 更多配置参考axios官网
                            data: { relationshipRef: taskOid },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {}
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true, // 是否显示配置列，默认显示
                            showMoreSearch: false, // 是否显示高级搜索，默认显示
                            showRefresh: true,
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                placeholder: i18nMappingObj.pleaseEnterName
                            }
                        },
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        addSeq: true,
                        addCheckbox: false,
                        addOperationCol: false,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                if (row.isNew) return this.$message.info(i18nMappingObj.taskNotSaved);
                                utils.openDetail(row);
                            }
                        },
                        slotsField: this.slotsField
                    }
                };
            },
            preTaskTableConfig() {
                const _this = this;
                let { taskOid } = this;
                return {
                    ...this.commonTableConfig,
                    tableKey: 'PreTaskView',
                    tableConfig: {
                        ...this.commonTableConfig.tableConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            // 更多配置参考axios官网
                            data: { relationshipRef: taskOid },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {}

                                    const typeMap = {
                                        0: 'FF',
                                        1: 'FS',
                                        2: 'SF',
                                        3: 'SS'
                                    };
                                    // 临时数据组装
                                    resData.data.records.push(
                                        ..._this.unSavedTasks.map((item) => {
                                            let attrs = {
                                                'erd.cloud.ppm.plan.entity.PredecessorLink#delay': item.delay,
                                                'erd.cloud.ppm.plan.entity.Task#name': item.taskName,
                                                'erd.cloud.ppm.plan.entity.Task#collectRef': item.collectName,
                                                'erd.cloud.ppm.plan.entity.PredecessorLink#type': typeMap[item.type],
                                                'erd.cloud.ppm.plan.entity.Task#oid': item.oid,
                                                'erd.cloud.ppm.plan.entity.Task#typeName':
                                                    'erd.cloud.ppm.plan.entity.Task'
                                            };
                                            let attrRawList = Object.keys(attrs).map((key) => {
                                                return {
                                                    attrName: key,
                                                    value: attrs[key],
                                                    displayName: attrs[key]
                                                };
                                            });
                                            return {
                                                ...item,
                                                attrRawList: [
                                                    ...attrRawList,
                                                    {
                                                        attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                                        oid: item.projectOid,
                                                        displayName: item.projectName
                                                    }
                                                ]
                                            };
                                        })
                                    );
                                    return resData;
                                }
                            ]
                        }
                    }
                };
            },
            postTaskTableConfig() {
                return {
                    ...this.commonTableConfig,
                    tableKey: 'PostTaskView'
                };
            }
        },
        methods: {}
    };
});
