define([
    'text!' + ELMP.resource('project-milestone/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('project-milestone/style.css')
], function (template, ErdcKit, store, actions, utils, commonHttp) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-milestone/locale/index.js'),
                stageList: [],
                panelUnfold: [true],
                defaultCollectId: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                currentPlanSet: ' ',
                collectOid: '',
                baselineOid: '',
                latestOid: '',
                // 上传交付物 弹窗
                uploadDeliverableVisible: false,
                // 当前行
                currentTask: { UID: '' },
                currentName: ''
            };
        },
        created() {
            this.getData();
        },
        activated() {
            this.refresh();
        },
        components: {
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            FamEmpty: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamEmpty/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            BaselineSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/BaselineSelect/index.js')
            ),
            DeliveryDetail: ErdcKit.asyncComponent(ELMP.resource('project-plan/components/DeliveryDetails/index.js'))
        },
        computed: {
            oid() {
                return this.$route.query.pid;
            },
            vm() {
                return this;
            },
            lightArr() {
                return [
                    { name: this.i18n.Completed, color: '#000' },
                    { name: this.i18n.orangeLight, color: '#ffa500' },
                    { name: this.i18n.redLight, color: 'red' },
                    { name: this.i18n.greenLight, color: 'green' },
                    { name: this.i18n.greyLight, color: '#c9c9c9' }
                ];
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default'
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
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            milestoneClassName() {
                return store.state.classNameMapping.milestone;
            },
            className() {
                return store.state.classNameMapping.task;
            },
            viewTableConfig() {
                let _this = this;
                let requestData = {
                    deleteNoPermissionData: true,
                    conditionDtoList: [
                        {
                            attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                            oper: 'EQ',
                            value1: _this.$route.query.pid
                        }
                    ]
                };
                if (this.baselineOid) {
                    requestData.baselined = true;
                    requestData.conditionDtoList.push({
                        attrName: 'erd.cloud.ppm.plan.entity.Task#baselineMasterRef',
                        oper: 'EQ',
                        value1: this.baselineOid
                    });
                }
                if (_this.collectOid && _this.collectOid !== ' ') {
                    requestData.conditionDtoList.push({
                        attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                        oper: 'EQ',
                        value1: _this.collectOid
                    });
                }
                let config = {
                    tableKey: 'milestoneView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: { showOverflow: true },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: requestData,
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    resData.data.records.forEach((item) => {
                                        item.collectChangeTask = item?.attrRawList?.find(
                                            (row) => row.attrName === 'erd.cloud.ppm.plan.entity.Task#collectChangeTask'
                                        )?.value;
                                    });
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: 'PPM_MILESTONE_LIST_MENU',
                                containerOid: _this.oid,
                                className: _this.projectClassName
                            }
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.Task#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.lookDetail(row);
                            }
                        },

                        slotsField: _this.slotsField
                    }
                };
                return config;
            }
        },
        watch: {
            oid(val) {
                this.currentPlanSet = this.defaultCollectId;
                this.$refs.milestoneSetSelect.$refs.component.refresh(val);
            }
        },
        methods: {
            changeBaseline({ value, latestOid }) {
                this.baselineOid = value;
                this.latestOid = latestOid || ''; //操作基线对比用到
                this.refresh();
            },
            stageWidth(stageList, index) {
                let width = (100 / stageList.length).toFixed(1);
                if (index != undefined) {
                    width = index * (100 / stageList.length).toFixed(1);
                }
                return width + '%';
            },
            stageLeft(idx, index, name) {
                const obj = {
                    name: '0',
                    circle: '7px',
                    line: '10px',
                    block: '6px'
                };
                return idx === 0 && index === 0 ? obj[name] : '';
            },
            // 设置里程碑---线的边框
            stageBorder(val) {
                if (!val.possessionStage) {
                    let color = val.color || '#C9CED5';
                    return `1px dashed ${color}`;
                }
                return '';
            },

            // 如果没有阶段背景就是虚线框
            borderColor(val) {
                if (val) {
                    return '';
                }
                return '1px dashed #C9CED5';
            },
            lookDetail(row) {
                this.$router.push({
                    path: '/space/project-plan/planDetail',
                    params: {
                        planOid: row['erd.cloud.ppm.plan.entity.Task#oid']
                    },
                    query: {
                        planTitle: row['erd.cloud.ppm.plan.entity.Task#name'],
                        planOid: row['erd.cloud.ppm.plan.entity.Task#oid'],
                        pid: this.oid
                    }
                });
            },
            actionClick(v) {
                console.log(v);
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_MILESTONE_MENU',
                    objectOid: row.oid,
                    className: this.projectClassName
                };
            },
            refresh() {
                this.$refs.milestoneList?.refreshTable('default');
                this.getData();
            },
            /**
             * 获取任务taskColor字段，格式与计划中一样
             * @param {object} val
             */
            getTaskColor(val) {
                return val.find((item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#taskColor');
            },
            handleSelect(v) {
                this.collectOid = v;
                this.getData();
                this.$refs.milestoneList?.refreshTable();
            },
            // 裁剪（批量）
            taskSetCrop(data = [], isMultiple) {
                let ids = [];
                if (isMultiple) {
                    if (!data.length) {
                        return this.$message({
                            type: 'info',
                            message: this.i18n.checkData
                        });
                    }
                    ids = data.map((item) => {
                        return item.id;
                    });
                } else {
                    ids = [data[0].id];
                }
                this.$confirm(this.i18n.confirmCutting, this.i18n.taskTailoring, {
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/ppm/plan/v1/tasks/cut',
                        method: 'POST',
                        className: this.projectClassName,
                        data: ids
                    })
                        .then(() => {
                            this.$message.success(this.i18n.cutSuccess);
                            this.refresh();
                        })
                        .catch((err) => {});
                });
            },
            // 设置状态（批量）
            taskSetStatus(data = [], isMultiple) {
                let _this = this;
                const { className } = this;
                // 数据格式处理
                let dataResult = data.map((item) => {
                    const { displayName } =
                        item.attrRawList.find(
                            (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status'
                        ) || {};

                    return {
                        ...item,
                        'oid': item.oid,
                        'lifecycleStatus.status': displayName || '',
                        [`${className}#lifecycleStatus.status`]: displayName || ''
                    };
                });

                async function setStateFunc(value) {
                    let checkData = {
                        taskOidList: data.map((item) => {
                            return item.oid;
                        }),
                        sign: value
                    };
                    let requestMethod;
                    await utils.commonCheckPreTaskTime(_this, checkData).then(() => {
                        if (isMultiple) {
                            let rawDataVoList = data.map((item) => {
                                return {
                                    action: 'UPDATE',
                                    attrRawList: [
                                        {
                                            attrName: 'lifecycleStatus.status',
                                            value
                                        }
                                    ],
                                    className: _this.className,
                                    oid: item.oid
                                };
                            });
                            requestMethod = commonHttp.saveOrUpdate({
                                data: {
                                    action: 'UPDATE',
                                    className: _this.className,
                                    rawDataVoList
                                }
                            });
                        } else {
                            requestMethod = commonHttp.commonUpdate({
                                data: {
                                    attrRawList: [
                                        {
                                            attrName: 'lifecycleStatus.status',
                                            value
                                        }
                                    ],
                                    oid: data[0].oid,
                                    className: _this.className
                                }
                            });
                        }
                    });
                    return requestMethod;
                }
                if (isMultiple) {
                    actions.batchSetStatus(this, dataResult, { setStateFunc });
                } else {
                    actions.setStatus(this, dataResult[0], { setStateFunc });
                }
            },
            getData() {
                if (!this.oid) return;
                this.$famHttp({
                    url: '/ppm/plan/v1/tasks/milestoneView',
                    params: {
                        projectOid: this.oid,
                        collectOid: this.collectOid,
                        baselineOid: this.baselineOid
                    },
                    className: this.projectClassName,
                    method: 'get'
                })
                    .then((res) => {
                        this.stageList = res.data || [];
                        this.panelUnfold = this.stageList.map(() => {
                            return true;
                        });
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
            },
            // 上传交付物
            uploadDeliverable({ UID, row }) {
                this.currentTask = { UID };
                this.currentName = row.displayName;
                this.uploadDeliverableVisible = true;
            },
            onDeliveryFullscreen() {
                // 页面大小变化后，重新调整表格宽度自适应
                this.$refs?.['deliveryDetailRef'].resizeTableColumns();
            },
            onDeliverableClosed() {
                this.currentTask = { UID: '' };
                this.currentName = '';
                this.refresh();
            }
        }
    };
});
