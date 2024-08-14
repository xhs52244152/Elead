define([
    'text!' + ELMP.resource('project-budget/components/ChooseTask/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js')
], function (template, ErdcKit, ppmStore) {
    return {
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            title: String,
            visible: {
                type: Boolean,
                default: false
            },
            tableKey: {
                type: String,
                default: 'BudgetAmountTaskSelectView'
            }
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('project-budget/locale/index.js'),
                isLoading: false,
                selectList: [],
                tableHeight: '330px'
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            dialogTitle() {
                return this.title || this.i18n['chooseTaskTips']; // 选择任务
            },
            // 任务
            className() {
                return ppmStore?.state?.classNameMapping?.task;
            },
            // 项目oid
            projectOid() {
                return ppmStore.state?.projectInfo?.oid;
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: this.tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: {
                            showOverflow: true // 溢出隐藏显示省略号
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                        oper: 'EQ',
                                        value1: this.projectOid
                                    }
                                ],
                                tableKey: this.tableKey,
                                orderBy: 'identifierNo',
                                sortBy: 'asc',
                                className: this.className
                            },
                            // 更多配置参考axios官网
                            transformRequest: [
                                function (data, headers) {
                                    // _this.selectList = []; // 清空已选择的数据
                                    headers['Content-Type'] = 'application/json';
                                    return JSON.stringify(data);
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                width: '200px'
                            },
                            basicFilter: {
                                show: false
                            }
                        },
                        tableBaseEvent: {
                            'checkbox-all': this.selectChangeEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        },
                        pagination: {
                            showPagination: false
                        },
                        slotsField: []
                    }
                };
                return config;
            }
        },
        methods: {
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
            },
            onFullscreen(isFull) {
                if (!isFull) {
                    this.tableHeight = '330px';
                } else {
                    this.$nextTick(() => {
                        let height = $('.choose-task-dialog-box .el-dialog__body').height() || 330;
                        this.tableHeight = height + 'px';
                    });
                }
                // 页面大小变化后，重新调整表格宽度自适应
                this.$nextTick(() => {
                    this.$refs?.['taskList']?.getTableInstance('baseTable')?.instance?.setVxeColumn();
                });
            },
            handleConfirm() {
                if (!this.selectList?.length) {
                    return this.$message.info(this.i18n['pleaseSelectData']); // 请选择数据
                }
                this.isLoading = true;
                this.$emit('confirm', this.selectList, (isClose) => {
                    this.isLoading = false;
                    isClose && this.handleCancel();
                });
            },
            handleCancel() {
                this.dialogVisible = false;
            }
        }
    };
});
