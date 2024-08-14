define([
    'fam:kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    'text!' + ELMP.resource('project-plan/components/Gantt/index.html'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    'dayjs',
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('project-plan/components/Gantt/style.css')
], function (FamKit, store, actions, template, utils, dayjs, commonHttp) {
    return {
        template,
        props: {
            width: {
                type: String,
                default: '100%'
            },
            height: {
                type: String,
                default: ''
            },
            // 项目oid
            projectId: {
                type: String,
                default: ''
            },
            // 调用甘特图组件业务场景
            businessScene: {
                type: String,
                default: ''
            },
            // 当前选中计划集
            businessCurrentPlanSet: {
                type: String,
                default: ''
            },
            // 当前层级
            currentLevel: {
                type: String,
                default: '1'
            },
            conditionDtoList: Array
        },
        components: {
            FamTableColSet: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamTableColSet/index.js')
            ),
            ComponentWidthLabel: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamActionButton: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            DropdownMenu: FamKit.asyncComponent(
                ELMP.resource('project-plan/components/Gantt/components/DropdownMenu/index.js')
            ),
            ProjectTemplateImport: FamKit.asyncComponent(
                ELMP.resource('project-plan/components/Gantt/components/ProjectTemplateImport/index.js')
            ),
            FrontTaskDialog: FamKit.asyncComponent(
                ELMP.resource('project-plan/components/Gantt/components/FrontTaskDialog/index.js')
            ),
            DeliveryDetail: FamKit.asyncComponent(ELMP.resource('project-plan/components/DeliveryDetails/index.js'))
        },
        data() {
            return {
                loading: true,
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                i18nMappingObj: {
                    save: this.getI18nByKey('save'), // 保存
                    add: this.getI18nByKey('add'), // 增加
                    create: this.getI18nByKey('create'), // 创建
                    modify: this.getI18nByKey('modify'), // 修改
                    cut: this.getI18nByKey('cut'), // 裁剪
                    delete: this.getI18nByKey('delete'), // 删除
                    upgradation: this.getI18nByKey('upgradation'), // 升级
                    downgrading: this.getI18nByKey('downgrading'), // 降级
                    moveUp: this.getI18nByKey('moveUp'), // 上移
                    moveDown: this.getI18nByKey('moveDown'), // 下移
                    frozenColumn: this.getI18nByKey('frozenColumn'), // 锁定列
                    critical: this.getI18nByKey('critical'), // 关键路径
                    zoomIn: this.getI18nByKey('zoomIn'), // 放大
                    zoomOut: this.getI18nByKey('zoomOut'), // 缩小
                    UnSelectTips: this.getI18nByKey('UnSelectTips'), // 请选择数据
                    level: this.getI18nByKey('level'), // 层级
                    ExpandOne: this.getI18nByKey('ExpandOne'), // 展开一级
                    ExpandTwo: this.getI18nByKey('ExpandTwo'), // 展开二级
                    ExpandThree: this.getI18nByKey('ExpandThree'), // 展开三级
                    ExpandAll: this.getI18nByKey('ExpandAll'), // 展开全部
                    checkMaxOne: this.getI18nByKey('checkMaxOne'), // 最多勾选一个
                    notSavedToEdit: this.getI18nByKey('notSavedToEdit'), // 该任务未保存，不可编辑
                    nameEmptyTips: this.getI18nByKey('nameEmptyTips'), // 名称不能为空
                    assignmentsEmptyTips: this.getI18nByKey('assignmentsEmptyTips'), // 资源角色不能为空
                    plansetTips: this.getI18nByKey('plansetTips'), // 当前模式下不可编辑，请切换至对应计划集
                    notSavedToAssignVal: this.getI18nByKey('notSavedToAssignVal'), // 未保存，无法批量赋值
                    notSavedToSetStatus: this.getI18nByKey('notSavedToSetStatus'), // 未保存，无法设置状态
                    createSubTask: this.getI18nByKey('createSubTask'), // 创建子任务
                    parentTask: this.getI18nByKey('parentTask'), // 所属父任务
                    plan: this.getI18nByKey('plan'), // 计划
                    columnConf: this.getI18nByKey('columnConf'), // 列配置
                    saveSuccessful: this.getI18nByKey('saveSuccessful'), // 保存成功
                    nonTailoring: this.getI18nByKey('nonTailoring'),
                    confirmCutting: this.getI18nByKey('confirmCutting'),
                    taskTailoring: this.getI18nByKey('taskTailoring'),
                    cutSuccess: this.getI18nByKey('cutSuccess'),
                    deleteOrNot: this.getI18nByKey('deleteOrNot'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    upgradTips: this.getI18nByKey('upgradTips'),
                    phaseTaskCheckTips: this.getI18nByKey('phaseTaskCheckTips'),
                    movedCheckTips: this.getI18nByKey('movedCheckTips'),
                    downCheckTips: this.getI18nByKey('downCheckTips'),
                    newTask: this.getI18nByKey('newTask'),
                    edit: this.getI18nByKey('edit'),
                    downgradTips: this.getI18nByKey('downgradTips'),
                    refresh: this.getI18nByKey('refresh'),
                    fieldSet: this.getI18nByKey('fieldSet')
                },
                isFrozen: false,
                colSettingVisible: false,
                columnSetList: [],
                defaultColumns: [],
                defaultCollectId: this.businessCurrentPlanSet || 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                // 当前计划集
                currentPlanSet:
                    this.businessCurrentPlanSet ||
                    this.$route?.params?.currentPlanSet ||
                    'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                // 当前层级
                // currentLevel: '1',
                tableSelectData: [],
                // 前后置任务查看
                frontTaskVisible: false,
                // 上传交付物 弹窗
                uploadDeliverableVisible: false,
                // 当前行
                currentTask: { UID: '' },
                // 未保存数据
                unSavedTasks: [],
                // 默认资源角色
                defAssignment: '',
                // 默认责任人
                defPrincipal: '',
                // 表头键值与实际属性名映射关系
                keyAttrMap: {},
                showAdvancedFilter: false,
                advancedHeight: 0,
                conditions: [],
                searchStr: '',
                disabled: true
            };
        },
        computed: {
            projectOid() {
                return this.$route.query.pid || this.projectId;
            },
            className() {
                return store.state.classNameMapping.task;
            },
            containerRef() {
                return this.$store.state?.space?.object?.containerRef;
            },
            isTemplate() {
                return !!(store.state.projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid);
            },
            iframeSrc() {
                return `${ELMP.resource('project-plan/components/Gantt/iframe.html')}?ver=__VERSION__`;
            },
            ganttHeight() {
                let { advancedHeight } = this;
                let diffHeight = `${236 + advancedHeight}px`;
                let defaultHeight = `calc(100vh - ${diffHeight})`;
                if (this.businessScene === 'changeSelectList') {
                    return `calc(100vh - 280px)`;
                } else {
                    return this.height ? `calc(${this.height} - ${diffHeight})` : defaultHeight;
                }
            },
            readOnly() {
                return this.currentPlanSet.trim() === '';
            },
            levelOptions() {
                return [
                    {
                        value: '1',
                        label: this.i18nMappingObj.ExpandOne
                    },
                    {
                        label: this.i18nMappingObj.ExpandTwo,
                        value: '2'
                    },
                    {
                        label: this.i18nMappingObj.ExpandThree,
                        value: '3'
                    },
                    {
                        label: this.i18nMappingObj.ExpandAll,
                        value: '-1'
                    }
                ];
            },
            // 操作按钮固定参数
            args() {
                const args = [this, this.tableSelectData, '', 'Gantt'];
                return args;
            },
            // 场景标识，区分模板等
            sceneKey() {
                return this.isTemplate ? 'template' : 'planList';
            },
            // 操作配置
            actionConfig() {
                let { sceneKey, projectOid, className } = this;
                const topMenuKey = {
                    template: 'PPM_PLAN_TEMPLATE_LIST_MENU',
                    planList: 'PPM_PLAN_LIST_MENU'
                };

                return {
                    name: topMenuKey[sceneKey],
                    containerOid: projectOid,
                    className
                };
            },
            // 操作配置
            basicActionConfig() {
                let { projectOid, className } = this;
                return {
                    name: 'PPM_PROJECT_TASK_TOP_OP_MENU',
                    containerOid: projectOid,
                    className
                };
            },
            //
            beforeValidatorQuery() {
                let { projectOid, currentPlanSet } = this;
                return {
                    data: {
                        extractParamMap: {
                            projectOid,
                            collectOid: currentPlanSet
                        }
                    }
                };
            },
            extendDisabledValidate() {
                return (action) => {
                    // 选择所有计划的按钮禁用
                    if (
                        this.readOnly &&
                        [
                            'PROJECT_TEMPLATE_INPORT',
                            'PPM_TASK_TEMPLATE_EXCEL_IMPORT',
                            'TASK_GT_EXCEL_EXPORT',
                            'TASK_EXCEL_IMPORT',
                            'TASK_PROJECT_EXPORT',
                            'TASK_PROJECT_IMPORT'
                        ].includes(action.name)
                    ) {
                        return true;
                    }
                    // 发起变更，从项目模板导入,Excel导入,Project导入 由接口决定是否禁用,优先级低于所有计划
                    if (
                        [
                            'TASK_START_CHANGE',
                            'PROJECT_TEMPLATE_INPORT',
                            'TASK_EXCEL_IMPORT',
                            'TASK_PROJECT_IMPORT'
                        ].includes(action.name)
                    ) {
                        return this.disabled;
                    }

                    return action.hide;
                };
            },
            moreBtnKey() {
                let moreBtnKey = {
                    template: 'PPM_PLAN_TEMPLATE_OP_MENU',
                    planList: 'PPM_PLAN_PER_OP_MENU'
                };
                return moreBtnKey[this.sceneKey];
            },
            eventsMap() {
                return {
                    TASK_UPDATE: this.taskUpdate,
                    TASK_DELETE: this.taskDelete,
                    PROJECT_TEMPLATE_INPORT: this.projectTemplateImport,
                    TASK_BATCH_UPDATE: this.taskBatchUpdate,
                    TASK_SET_STATUS: this.taskSetStatus,
                    TASK_MOVE_UP: this.moveUpTask,
                    TASK_MOVE_DOWN: this.moveDownTask,
                    TASK_UPGRADE: this.upgradeTask,
                    TASK_DEMOTION: this.downgradeTask,
                    TASK_SAVE_AS: this.copyTask,
                    TASK_MOVE: this.moveTask,
                    TASK_START_PROCESS: this.taskStartProcess,
                    PPM_TASK_BATCH_START_PROCESS: this.taskStartProcess,
                    TASK_CREATE_SUB: this.createSubTask,
                    TASK_GT_EXCEL_EXPORT: this.excelExport,
                    TASK_EXCEL_IMPORT: this.excelImport,
                    TASK_PROJECT_EXPORT: this.projectExport,
                    TASK_PROJECT_IMPORT: this.projectImport,
                    PPM_PROJECT_TASK_UPDATE: this.modifyTask,
                    PPM_PROJECT_TASK_CREATE: this.createTask,
                    PPM_PROJECT_TASK_CREATE_STAGE_TASK: this.createPhaseTask,
                    PPM_PROJECT_TASK_ADD: this.addTask,
                    PPM_PROJECT_TASK_CUT: this.cutTask,
                    PPM_PROJECT_TASK_LOCK_COLUMN: this.frozenColumn,
                    PPM_PROJECT_TASK_CRITICAL_PATH: this.setShowCritical,
                    PPM_PROJECT_TASK_ENLARGE: this.zoomIn,
                    PPM_PROJECT_TASK_NARROW: this.zoomOut,
                    PPM_PROJECT_TASK_UPGRADATION: this.upgradeTask,
                    PPM_PROJECT_TASK_DOWN_GRADATION: this.downgradeTask,
                    PPM_PROJECT_TASK_MOVE_UP: this.moveUpTask,
                    PPM_PROJECT_TASK_MOVE_DOWN: this.moveDownTask,
                    // 模板相关
                    TASK_TEMPLATE_UPDATE: this.taskUpdate,
                    TASK_TEMPLATE_DELETE: this.taskDelete,
                    TASK_TEMPLATE_MOVE_UP: this.moveUpTask,
                    TASK_TEMPLATE_MOVE_DOWN: this.moveDownTask,
                    TASK_TEMPLATE_UPGRADE: this.upgradeTask,
                    TASK_TEMPLATE_DEMOTION: this.downgradeTask,
                    TASK_TEMPLATE_CREATE_SUB: this.createSubTask,
                    PPM_TASK_TEMPLATE_DELETE: this.taskDelete,
                    PPM_TASK_TEMPLATE_EXCEL_EXPORT: this.excelExport,
                    PPM_TASK_TEMPLATE_EXCEL_IMPORT: this.excelImport
                };
            },
            // 当前项目、计划集、层级，任一变化，都需要刷新gantetu
            refreshKey() {
                let { projectOid, currentPlanSet, currentLevel } = this;
                return `${projectOid}_${currentPlanSet}_${currentLevel}`;
            }
        },
        watch: {
            projectOid(val) {
                this.currentLevel = '1';
                this.currentPlanSet = this.defaultCollectId;
                this.$refs.planSetSelect.$refs.component.refresh(val);
            },
            refreshKey() {
                this.refresh();
            },
            showAdvancedFilter(val) {
                if (!val) this.onAdvancedHeightChange(-48);
            }
        },
        created() {
            window.addEventListener('message', this.handleMessage);
        },
        mounted() {
            this.validate();
            this.initData();
        },
        activated() {
            // 回到当前页面需要重新给iframe赋值
            this.initData();
            this.validate();
        },
        beforeDestroy() {
            document.body.removeEventListener('click', this.setGanttBlur);
            window.removeEventListener('message', this.handleMessage);
        },
        methods: {
            validate() {
                let { projectOid, currentPlanSet } = this;
                this.$famHttp({
                    url: 'ppm/process/validate',
                    method: 'POST',
                    params: {
                        projectOid,
                        changeContent: 'TASK',
                        collectOid: currentPlanSet
                    }
                })
                    .then((res) => {
                        this.disabled = res.data;
                    })
                    .catch(() => {});
            },
            initData() {
                const ErdcKit = require('erdcloud.kit');
                if (!this.$refs.iframe) return;
                this.$refs.iframe.contentWindow.ELMP = ErdcKit.deepClone(window.ELMP);
                this.$refs.iframe.contentWindow.require = window.require;
                this.$refs.iframe.contentWindow.define = window.define;
                this.$refs.iframe.contentWindow._ = window._;
                this.$refs.iframe.contentWindow.parentPostMessage = window.postMessage.bind(window);
                if (this.businessScene) {
                    this.currentPlanSet = this.defaultCollectId;
                }
                // 注册一个方便iframe获取参数的方法
                this.$refs.iframe.contentWindow.getParentParams = () => {
                    return {
                        containerOid: this.containerRef,
                        keyAttrMap: this.keyAttrMap,
                        projectOid: this.projectOid,
                        collectId: this.$route?.params?.currentPlanSet || this.defaultCollectId,
                        businessScene: this.businessScene,
                        currentLevel: this.currentLevel,
                        conditionDtoList: this.conditionDtoList
                    };
                };
            },
            handleMessage({ data, source }) {
                if (source !== this.$refs.iframe.contentWindow || !data) return;
                // 尝试匹配对应处理方法
                let { name, data: params } = data;
                if (name && _.isFunction(this[name])) this[name](params);
            },
            afterRender() {
                // 第一次渲染完，设置监听
                if (!this.project) {
                    document.body.addEventListener('click', this.setGanttBlur);
                }

                // 更新各个变量
                this.ganttVue = this.$refs?.iframe?.contentWindow?.ganttVue;
                this.project = this.ganttVue?.project;
                this.mini = this.ganttVue?.mini;

                // 等待列信息，再取消loading
                FamKit.deferredUntilTrue(
                    () => this.columnSetList.length > 0,
                    () => (this.loading = false)
                );
            },
            // 勾选切换时，更新勾选数据，用于右上操作校验
            onSelectChange(data = []) {
                this.tableSelectData = data.map((item) => {
                    item.oid = item.UID;
                    return item;
                });
            },
            // 表格数据刷新
            refresh() {
                if (!this.projectOid) return;
                this.loading = true;
                let { ganttVue, currentPlanSet, currentLevel, projectOid, className, conditions } = this;
                let collectId = currentPlanSet.trim();

                let conditionDtoList = [...conditions];
                if (conditions.length > 0) {
                    conditionDtoList.unshift({
                        attrName: `${className}#projectRef`,
                        oper: 'EQ',
                        value1: projectOid
                    });
                    if (!_.isEmpty(collectId)) {
                        conditionDtoList.unshift({
                            attrName: `${className}#collectRef`,
                            oper: 'EQ',
                            value1: collectId
                        });
                    }
                }
                if (this.businessScene) {
                    conditionDtoList = this.conditionDtoList;
                    let collectRef = conditionDtoList.find(
                        (item) => item.attrName === 'erd.cloud.ppm.plan.entity.Task#collectRef'
                    );
                    collectRef && (collectRef.value1 = collectId);
                }
                ganttVue?.refreshTable(
                    {
                        collectId,
                        level: currentLevel,
                        projectId: projectOid
                    },
                    {
                        conditionDtoList
                    }
                );
            },
            // 表格输入框搜索
            fnSearch() {
                this.loading = true;
                let { ganttVue, currentPlanSet, currentLevel, projectOid, className } = this;
                let collectId = currentPlanSet.trim();
                this.conditionDtoList = this.conditionDtoList.filter((item) => !item?.children?.length);
                this.searchStr.trim() &&
                    this.conditionDtoList.unshift({
                        logicalOperator: 'AND',
                        sortOrder: 0,
                        isCondition: false,
                        children: [
                            {
                                logicalOperator: 'AND',
                                sortOrder: 0,
                                isCondition: true,
                                attrName: `${className}#identifierNo`,
                                oper: 'LIKE',
                                value1: this.searchStr
                            },
                            {
                                logicalOperator: 'OR',
                                sortOrder: 1,
                                isCondition: true,
                                attrName: `${className}#name`,
                                oper: 'LIKE',
                                value1: this.searchStr
                            }
                        ],
                        value1: ''
                    });
                ganttVue?.refreshTable(
                    {
                        collectId,
                        level: currentLevel,
                        projectId: projectOid
                    },
                    {
                        conditionDtoList: this.conditionDtoList
                    }
                );
            },
            setAttr({ attrName, value }) {
                if (Object.prototype.hasOwnProperty.call(this, attrName)) {
                    this[attrName] = value;
                }
            },
            // 裁剪
            cutTask() {
                let { getMessage } = this;
                let tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(this.i18nMappingObj.UnSelectTips);

                // 判断能否被裁剪
                let message = getMessage(
                    tasks,
                    (item) => item.isNew || item.scalable === 0,
                    this.i18nMappingObj.nonTailoring
                );

                if (message) return this.$message.info(message);

                this.$confirm(this.i18nMappingObj.confirmCutting, this.i18nMappingObj.taskTailoring, {
                    type: 'warning'
                }).then(() => {
                    // 调裁剪接口
                    this.$famHttp({
                        url: '/ppm/plan/v1/tasks/cut',
                        method: 'POST',
                        errorMessage: false,
                        className: store.state.classNameMapping.project,
                        data: tasks.map((item) => item.UID.split(':')[2])
                    })
                        .then(() => {
                            this.$message.success(this.i18nMappingObj.cutSuccess);
                            this.refresh();
                        })
                        .catch((err) => {});
                });
            },
            // 删除
            taskDelete(tasks = []) {
                let { project, fetchRemoveTasks } = this;
                if (!tasks) tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(this.i18nMappingObj.UnSelectTips);
                this.$confirm(this.i18nMappingObj.deleteOrNot, this.i18nMappingObj.deleteConfirm, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: this.i18nMappingObj.confirm,
                    cancelButtonText: this.i18nMappingObj.cancel,
                    type: 'warning'
                })
                    .then(() => {
                        // 新增未保存的直接删除，否则调接口删除
                        let removeOids = [];
                        tasks.forEach((item) => {
                            !item.isNew && delete item?.children && removeOids.push(item.UID);
                        });

                        if (removeOids.length > 0) {
                            fetchRemoveTasks(removeOids).then((resp) => {
                                if (resp.code === '200') {
                                    // 然后前端删除
                                    project.removeTasks(tasks);
                                    this.refresh();
                                    this.$message({
                                        type: 'success',
                                        message: this.i18nMappingObj.deleteSuccess
                                    });
                                }
                            });
                        } else {
                            project.removeTasks(tasks);
                            this.refresh();
                            this.$message({
                                type: 'success',
                                message: this.i18nMappingObj.deleteSuccess
                            });
                        }
                    })
                    .catch(() => {});
            },
            getMessage(tasks, validate, tips) {
                let results = [];
                tasks.forEach((item) => {
                    if (validate(item)) results.push(`【${item.Name}】`);
                });

                if (results.length > 0) {
                    return `${results.join(',')}${tips}`;
                } else {
                    return false;
                }
            },
            checkSamePlanMsg(node, adjacentNode) {
                var parentNode = this.project?.store?.getParentNode(node);
                if (!parentNode) return false;
                let childNodes = this.project?.store?.getChildNodes(parentNode);
                let index = childNodes.findIndex((item) => item == node);
                if (index < 0) return false;
                return node.collectRef?.value?.id != childNodes[index + adjacentNode].collectRef?.value?.id;
            },
            // 升级
            upgradeTask(tasks = []) {
                let { getMessage, ganttVue } = this;
                if (!tasks) tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(this.i18nMappingObj.UnSelectTips);

                let message = getMessage(
                    tasks,
                    (item) => this.project?.store?.getParentNode(item) === this.project?.store?.root,
                    this.i18nMappingObj.upgradTips
                );
                if (message) return this.$message.info(message);

                ganttVue.upgradeCompute(tasks);
            },
            // 降级
            downgradeTask(tasks = []) {
                let { getMessage, ganttVue } = this;
                if (!tasks) tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(this.i18nMappingObj.UnSelectTips);

                let isStageMsg = getMessage(
                    tasks,
                    (item) => item.StageFlag === 1,
                    this.i18nMappingObj.phaseTaskCheckTips
                );
                if (isStageMsg) return this.$message.info(isStageMsg);

                let firstNodeMsg = getMessage(
                    tasks,
                    (item) => this.project?.store?.isFirstNode(item),
                    this.i18nMappingObj.downgradTips
                );
                if (firstNodeMsg) return this.$message.info(firstNodeMsg);

                // 如果是所有计划场景，需要判断降级节点与上一节点是否同计划集
                if (this.readOnly) {
                    let isSamePlanMsg = getMessage(
                        tasks,
                        (item) => this.checkSamePlanMsg(item, -1),
                        this.i18n.downgradSamePlanTips
                    );
                    if (isSamePlanMsg) return this.$message.info(isSamePlanMsg);
                }

                ganttVue.degradeCompute(tasks);
            },
            // 上移
            moveUpTask(tasks = []) {
                let { getMessage, ganttVue } = this;
                if (!tasks) tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(this.i18nMappingObj.UnSelectTips);

                let message = getMessage(
                    tasks,
                    (item) => !this.project?.getPrevTask(item),
                    this.i18nMappingObj.movedCheckTips
                );

                if (message) return this.$message.info(message);

                // 如果是所有计划场景，需要判断上移节点与上一节点是否同计划集
                if (this.readOnly) {
                    let isSamePlanMsg = getMessage(
                        tasks,
                        (item) => this.checkSamePlanMsg(item, -1),
                        this.i18n.movedCheckSamePlanTips
                    );
                    if (isSamePlanMsg) return this.$message.info(isSamePlanMsg);
                }

                let params = {
                    action: 'MOVEBATCH',
                    taskSortList: []
                };
                tasks.forEach((item) => {
                    let parentTask = this.project.getPrevTask(item);
                    this.project.moveUpTask(item);
                    params.taskSortList.push({
                        id: item.UID,
                        targetId: parentTask?.UID
                    });
                });
                ganttVue.computedByRemote(
                    params,
                    tasks.map((item) => item.UID)
                );
            },
            // 下移
            moveDownTask(tasks = []) {
                let { getMessage, ganttVue } = this;
                if (!tasks) tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(this.i18nMappingObj.UnSelectTips);

                let message = getMessage(
                    tasks,
                    (item) => !this.project?.getNextTask(item),
                    this.i18nMappingObj.downCheckTips
                );
                if (message) return this.$message.info(message);

                // 如果是所有计划场景，需要判断下移节点与下一节点是否同计划集
                if (this.readOnly) {
                    let isSamePlanMsg = getMessage(
                        tasks,
                        (item) => this.checkSamePlanMsg(item, 1),
                        this.i18n.downCheckSamePlanTips
                    );
                    if (isSamePlanMsg) return this.$message.info(isSamePlanMsg);
                }

                let params = {
                    action: 'MOVEBATCH',
                    taskSortList: []
                };
                tasks.reverse().forEach((item) => {
                    let nextTask = this.project.getNextTask(item);
                    this.project.moveDownTask(item);
                    params.taskSortList.push({
                        id: item.UID,
                        targetId: nextTask?.UID
                    });
                });
                ganttVue.computedByRemote(
                    params,
                    tasks.map((item) => item.UID)
                );
            },
            // 锁定列
            frozenColumn() {
                if (this.isFrozen) {
                    this.project.unfrozenColumn();
                    this.isFrozen = false;
                } else {
                    this.project.frozenColumn(0, 5);
                    this.isFrozen = true;
                }
            },
            // 关键路径
            setShowCritical() {
                let showCriticalPath = this.project.showCriticalPath;
                this.project.setShowCriticalPath(!showCriticalPath);
            },
            zoomIn() {
                this.project.zoomIn();
            },
            zoomOut() {
                this.project.zoomOut();
            },
            addTask() {
                if (this.loading) return;
                this.loading = true;

                // let parentTask = this.project.getSelected();
                // if (parentTask.length > 1) {
                //     this.loading = false;
                //     return this.$message.info(this.i18nMappingObj.checkMaxOne);
                // }
                let newTask = this.project.newTask();
                newTask.Name = this.i18nMappingObj.newTask;
                newTask.isNew = true;
                newTask.UID = Date.now() + String(parseInt(Math.random() * 899999) + 100000);
                newTask.Start = null;
                newTask.Finish = null;
                newTask.Duration = 0;
                newTask.Manual = 1;
                // 默认值设置
                this.setDefaultValue(newTask);
                // 计划集
                let collectInfo = this.$refs.planSetSelect.$refs.component.getPlanSetData(this.currentPlanSet);
                let oidArr = collectInfo.oid.split(':');
                newTask.collectRef = {
                    displayName: collectInfo.name,
                    value: {
                        id: oidArr[2],
                        key: oidArr[1]
                    }
                };
                // 领域
                newTask.area.displayName = !collectInfo.area || collectInfo.area === '-1' ? '默认' : collectInfo.name;
                newTask.area.value = !collectInfo.area || collectInfo.area === '-1' ? '-1' : collectInfo.area;
                // 图标
                newTask.icon = newTask?.typeReference?.values.find(
                    (item) => item?.value === newTask?.typeReference?.value
                )?.icon;
                // 获取默认责任人，一般为项目经理下的主责任人
                // 根据编码规则查询编码
                Promise.all([this.getDefPrincipal(), this.getCodeByRule()]).then(
                    (resp) => {
                        // 责任人
                        this.defPrincipal = resp[0];
                        newTask.Principal = this.defPrincipal;

                        // 编码
                        let identifierNo = resp[1].data;
                        newTask.identifierNo = identifierNo || '';

                        // 新增任务需要调接口保存
                        this.saveNewRow(newTask).then(
                            (task) => {
                                this.project.addTask(this.mini.decode(task));
                                task.isNew = false;
                                // if (parentTask.length === 1) {
                                //     this.project.addTask(task, 'add', parentTask[0]);
                                // } else {
                                //     this.project.addTask(task);
                                // }

                                this.project.acceptChanges();
                                this.loading = false;
                            },
                            () => {
                                this.loading = false;
                            }
                        );
                    },
                    () => {
                        this.loading = false;
                    }
                );
            },
            setDefaultValue(task) {
                let { project } = this;
                let ganttData = project.getData();

                // 获取默认资源角色，一般为项目经理
                if (!this.defAssignment) {
                    let pmUID = (ganttData.Resources.find((item) => item.RoleCode === 'PM') || {}).UID;
                    if (!pmUID && ganttData.Resources.length > 0) pmUID = ganttData.Resources[0].UID;
                    this.defAssignment = pmUID;
                }
                let defAssignment = this.defAssignment;
                (this.ganttVue.headeAndLayout || []).forEach((column) => {
                    let key = column.attrName;
                    let value = column.defaultValue;

                    // 如果既有value又有displayName，则转成对象形式
                    if (column.defaultValue && (column.defaultDisplayValue || column.values)) {
                        value = {
                            displayName: column.defaultDisplayValue,
                            value: column.defaultValue,
                            values: (column.values || []).map((item) => ({
                                ...item,
                                UID: item.value,
                                Name: item.displayName
                            }))
                        };
                    }

                    // 特殊值处理
                    let specialMap = {
                        // 资源角色
                        Assignments: () => [
                            {
                                ResourceUID: defAssignment,
                                TaskUID: task.UID
                            }
                        ]
                    };

                    if (specialMap[key]) {
                        value = specialMap[key](column);
                    }

                    value && (task[key] = value);
                });
            },
            async getCodeByRule() {
                let { className } = this;
                let columns = this.ganttVue.allColumns;
                let ruleCode = columns.find((item) => item.attrName === 'identifierNo')?.ruleCode;
                if (store.state.projectInfo['templateInfo.tmplTemplated']) {
                    ruleCode = 'TemplateCode';
                }
                return this.$famHttp({
                    url: '/fam/code/getCode',
                    className,
                    method: 'POST',
                    data: {
                        ruleCode: ruleCode
                    }
                });
            },
            getDefPrincipal() {
                let containerTeamRef = this.$store.state.space?.context?.containerTeamRef;
                const { defAssignment } = this;
                return new Promise((resolve, reject) => {
                    if (this.defPrincipal) return resolve(this.defPrincipal);
                    this.$famHttp({
                        url: `/fam/team/selectById`,
                        params: {
                            teamOid: containerTeamRef
                        },
                        method: 'get'
                    })
                        .then((resp) => {
                            let role =
                                (resp.data?.teamRoleLinkDtos || []).find((item) => {
                                    return item.roleBObjectRef === defAssignment;
                                }) || {};

                            let primarily = (role.rolePrincipalLinks || []).find((item) => item.primarily);
                            resolve(primarily?.roleBObjectRef || role.rolePrincipalLinks?.[0]?.roleBObjectRef || '');
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            saveNewRow(newTask) {
                let { className, projectOid, containerRef, project, keyAttrMap } = this;
                let ganttData = project.getData();
                let defRoleCode = (ganttData.Resources.find((item) => item.UID === this.defAssignment) || {}).RoleCode;
                let defCollect = this.currentPlanSet.trim() || this.defaultCollectId;

                return new Promise((resolve, reject) => {
                    let attrRawList = [
                        {
                            attrName: 'projectRef',
                            value: projectOid
                        },
                        {
                            attrName: 'scalable',
                            value: true
                        }
                    ];

                    Object.keys(newTask).forEach((key) => {
                        let attrName = keyAttrMap[key];
                        let value = newTask[key];
                        // 特殊值处理
                        if (_.isDate(value)) value = dayjs(value).format('YYYY-MM-DD');
                        else if (attrName === 'resAssignments') value = defRoleCode;
                        else if (attrName === 'collectRef') value = defCollect;
                        else if (attrName === 'lifecycleStatus.status') value = void 0;
                        else if (value && Object.prototype.hasOwnProperty.call(value, 'value')) {
                            value = value.value;
                        }

                        if (attrName && value !== void 0) {
                            attrRawList.push({
                                attrName,
                                value
                            });
                        }
                    });
                    let params = {
                        associationField: 'roleBObjectRef',
                        className,
                        typeReference: newTask.typeReference.value,
                        containerRef,
                        relationList: [
                            {
                                action: 'CREATE',
                                attrRawList: [
                                    {
                                        attrName: 'roleAObjectRef',
                                        value: projectOid
                                    }
                                ],
                                className: store.state.classNameMapping.taskLink
                            }
                        ],
                        attrRawList
                    };

                    commonHttp
                        .commonCreate({
                            data: params
                        })
                        .then((resp) => {
                            newTask.UID = resp.data || '';
                            newTask.isNew = false;
                            // 创建时间
                            newTask.CreateTime = dayjs(new Date()).format('YYYY-MM-DD HH-mm-ss');
                            // 创建者
                            newTask.CreateBy = {
                                displayName: this.$store.state.user.displayName,
                                value: this.$store.state.user.oid
                            };
                            // 添加进展相关字段以正常显示
                            newTask.taskColor = {
                                value: '',
                                displayName: '#c9c9c9',
                                label: '0/0'
                            };
                            resolve(newTask);
                        })
                        .catch(() => {
                            reject();
                        });
                });
            },
            createTask() {
                // store.commit('setPlanSetInfo', {
                //     oid: this.currentPlanSet
                // });

                this.$router.push({
                    path: '/space/project-plan/planCreate',
                    query: {
                        collectId: this.currentPlanSet,
                        currentPlanSet: this.currentPlanSet,
                        backName: 'planList',
                        pid: this.projectOid
                    }
                });
            },
            modifyTask() {
                let { i18nMappingObj } = this;
                let tasks = this.project.getSelected();
                if (tasks.length < 1) return this.$message.info(i18nMappingObj.UnSelectTips);
                if (tasks.length > 1) return this.$message.info(i18nMappingObj.checkMaxOne);
                if (tasks[0].isNew) return this.$message.info(i18nMappingObj.notSavedToEdit);
                let taskOid = tasks[0].UID;
                this.$router.push({
                    path: '/space/project-plan/planEdit',
                    params: {
                        // 修改计划时  增加计划集参数
                        currentPlanSet: this.currentPlanSet
                    },
                    query: {
                        pid: this.projectOid,
                        planOid: taskOid,
                        planTitle: this.i18nMappingObj.edit + `${tasks[0]?.Name}`,
                        backName: 'planList',
                        collectId: this.currentPlanSet,
                        currentPlanSet: this.currentPlanSet
                    }
                });
            },
            openDetail(UID) {
                let row = this.project.getTask(UID);
                if (row.isNew) return;
                // 当前点击计划的所属计划集
                let collectId = row?.collectRef?.value
                    ? _.isObject(row?.collectRef?.value)
                        ? 'OR:' + row?.collectRef?.value?.key + ':' + row?.collectRef?.value?.id
                        : row?.collectRef?.value || ''
                    : '';
                this.$router.push({
                    path: '/space/project-plan/planDetail',
                    query: {
                        pid: this.projectOid,
                        planOid: UID,
                        planTitle: row.Name,
                        collectId: collectId
                    }
                });
            },
            // 甘特图点击抛出事件
            ganttClick() {
                // 隐藏操作下拉展示
                this.$refs.actionOptionBtn?.$children[0]?.$refs?.actionPulldown[0]?.hide();
                // 隐藏甘特图上方中有下拉按钮展开后需要隐藏 例: 点击创建展开下拉后再点击甘特图dom需要把下拉收起 ISSUE2024052227057
                let arr =
                    this.$refs.actionBtn?.$children.filter((item) => item.$el?._prevClass === 'action-pulldown') || [];
                arr.forEach((item) => item.$refs?.actionPulldown[0].hide());
            },
            // 查看前后置任务
            viewPreTask({ UID, unSavedTasks }) {
                this.currentTask = { UID };
                this.frontTaskVisible = true;
                // 计划集
                let collectInfo = this.$refs.planSetSelect.$refs.component.getPlanSetData(this.currentPlanSet);
                this.unSavedTasks = (unSavedTasks || []).map((item) => {
                    return {
                        ...item,
                        projectName: store.state.projectInfo.name,
                        collectName: collectInfo.name,
                        projectOid: store.state.projectInfo.oid
                    };
                });
            },
            renderDropdownMenu({ UID, left, top }) {
                let iframe = this.$refs.iframe;
                left = left + iframe.offsetLeft;
                top = top + iframe.offsetTop + 15;
                this.$refs.dropdownMenu.open(UID, { left, top });
            },
            // 上传交付物
            uploadDeliverable({ UID }) {
                this.currentTask = { UID };
                this.uploadDeliverableVisible = true;
            },
            // 延迟执行保存，确保甘特图失去焦点，退出了编辑状态
            delaySave() {
                setTimeout(this.saveAll.bind(this, ...arguments));
            },
            saveAll() {
                let { project, dataFormat, $message, getColumnByName, i18nMappingObj } = this;
                // 获取当前数据
                let data = project.getData();
                data.RemovedTasks = project.getRemovedTasks();

                // 校验名称和资源角色，不能为空
                let tasks = project.getTaskList();

                let hasNameColumn = getColumnByName('Name');
                let hasArgumentsColumn = getColumnByName('Assignments');
                // let hasPrincipalColumn = getColumnByName('Principal');
                for (let i = 0; i < tasks.length; i++) {
                    let task = tasks[i];
                    if (hasNameColumn && !task.Name) return $message.warning(i18nMappingObj.nameEmptyTips);
                    if (hasArgumentsColumn && (!task.Assignments || task.Assignments.length < 1))
                        return $message.warning(i18nMappingObj.assignmentsEmptyTips);
                    // if (hasPrincipalColumn && !task.Principal) return $message.warning('责任人不能为空');
                }

                data = JSON.parse(JSON.stringify(data));
                // 日期数据处理
                dataFormat([data]);
                dataFormat(data.Tasks);
                dataFormat(data.RemovedTasks);

                data.collectRef = this.currentPlanSet.trim();

                this.loading = true;
                this.$famHttp({
                    url: '/ppm/plan/v1/gantt/tasks',
                    method: 'POST',
                    className: store.state.classNameMapping.project,
                    data: data
                }).then((resp) => {
                    if (resp.code === '200') {
                        // 刷新表格数据
                        this.refresh();
                        this.$message.success(i18nMappingObj.saveSuccessful);
                    }
                });
            },
            dataFormat(tasks = []) {
                let { isExtendField } = this;
                let dateFields = this.ganttVue.dateFields || [];
                tasks.forEach((task) => {
                    let attrList = [];
                    Object.keys(task).forEach((key) => {
                        // map格式数据处理
                        if (task[key] && task[key].value) {
                            task[key] = task[key].value;
                        }

                        // 日期字符串转为时间格式
                        if (dateFields.includes(key)) {
                            task[key] && (task[key] = dayjs(task[key]).format('YYYY-MM-DD'));
                        }

                        // 扩展属性集合
                        if (isExtendField(key)) {
                            attrList.push({
                                attrName: key,
                                value: task[key]
                            });
                            task[key] = undefined;
                        }
                    });
                    task.attrList = attrList;

                    if (task.children) {
                        this.dataFormat(task.children);
                    }
                });
            },
            fetchRemoveTasks(taskOids = []) {
                return this.$famHttp({
                    url: '/ppm/deleteByIds',
                    method: 'DELETE',
                    data: {
                        catagory: 'DELETE',
                        className: store.state.classNameMapping.task,
                        oidList: taskOids
                    }
                });
            },
            // 列配置提交回调函数
            fnColSettingSubmit(resp) {
                let { selectedColumns, allColumns } = resp;
                this.defaultColumns = selectedColumns;
                // this.columnSetList = allColumns.map((item) => {
                //     item.locked = !!selectedColumns.find((sel) => sel.attrName === item.attrName);
                //     return item;
                // });
                this.ganttVue.setColumns(selectedColumns);

                // 缓存列配置信息
                this.$store.commit('PREFERENCE_CONFIG', {
                    config: {
                        configType: 'ganttConfig',
                        type: 'colSetting',
                        _this: this
                    },
                    resource: resp
                });
            },
            // 设置列配置信息
            setColumnsConfig({ headeAndLayout, allColumns, initColumns }) {
                // 尝试根据缓存获取列配置
                let LSColumnHeader = this.$store.getters.getPreferenceConfig({
                    configType: 'ganttConfig',
                    type: 'colSetting'
                });

                let allAttrsMap = {};
                allColumns.forEach((item) => {
                    allAttrsMap[item.attrName] = item;
                });
                if (!_.isEmpty(LSColumnHeader?.selectedColumns)) {
                    let { selectedColumns } = LSColumnHeader;
                    this.defaultColumns = selectedColumns.filter((item) => {
                        item.locked = !!selectedColumns.find((sel) => sel.attrName === item.attrName);
                        Object.assign(item, allAttrsMap[item.attrName] || {});
                        return Object.prototype.hasOwnProperty.call(allAttrsMap, item.attrName);
                    });
                    this.columnSetList = allColumns;
                } else {
                    this.columnSetList = allColumns;
                    this.defaultColumns = initColumns;
                }

                this.columnSetList = allColumns;
                this.$refs?.iframe?.contentWindow?.ganttVue.setColumns(this.defaultColumns);

                // 获取表头键值与实际属性名映射关系
                this.keyAttrMap = {};
                headeAndLayout.forEach((col) => {
                    this.keyAttrMap[col.attrName] = col.originalName.split('#')[1];
                });
            },
            // 是否为扩展字段
            isExtendField(attrName) {
                let categoryMap = this.categoryMap;
                if (!categoryMap) {
                    categoryMap = {};
                    this.columnSetList.forEach((item) => {
                        categoryMap[item.attrName] = item.attributeCategory;
                    });
                    this.categoryMap = categoryMap;
                }

                return categoryMap[attrName] && categoryMap[attrName] !== 'HARD';
            },
            // 触发甘特图失去焦点
            setGanttBlur() {
                this.ganttVue.setBlur();
            },
            // 根据字段名获取对应列信息
            getColumnByName(name) {
                return this.columnSetList.find((item) => item.attrName === name);
            },
            // 上方远程按钮点击事件
            onTopMenuClick({ name }) {
                let { eventsMap } = this;
                eventsMap[name] && eventsMap[name](this.tableSelectData, true);
            },
            // 列表上方基础按钮点击事件
            onTopMenuBasicClick({ name }) {
                let { eventsMap } = this;
                eventsMap[name] && eventsMap[name](false);
            },
            // 列表按钮点击事件
            onListMenuClick({ menu, UID }) {
                // 所有计划 不可编辑
                // let { i18nMappingObj, readOnly } = this;
                // if (readOnly) {
                //     return this.$message.info(i18nMappingObj.plansetTips);
                // }

                let { eventsMap } = this;
                let row = this.project.getTask(UID);
                let name = menu.name;

                eventsMap[name] && eventsMap[name]([row], false);
            },
            onDeliverableClosed() {
                this.refresh();
            },
            // 从项目模板导入
            projectTemplateImport() {
                let _this = this;
                let { refresh, currentPlanSet, projectOid } = this;
                let props = {
                    projectTemplateImportShow: true,
                    currentPlanSet
                };
                let { destroy } = utils.useFreeComponent({
                    template: `
                            <project-template-import
                                v-bind="params"
                                @projectTemplateImportCancel="projectTemplateImportCancel"
                                @projectTemplateImportConfirm="projectTemplateImportConfirm">
                            </project-template-import>
                            `,
                    components: {
                        ProjectTemplateImport: FamKit.asyncComponent(
                            ELMP.resource('project-plan/components/Gantt/components/ProjectTemplateImport/index.js')
                        )
                    },
                    data() {
                        return {
                            params: {}
                        };
                    },
                    created() {
                        this.params = props;
                    },
                    methods: {
                        projectTemplateImportCancel() {
                            destroy();
                        },
                        projectTemplateImportConfirm(form) {
                            // 当前计划集
                            let params = {
                                collectOid: currentPlanSet,
                                projectOid,
                                parentId: form.parentId || ''
                            };
                            let data = form.taskIds;
                            const loading = this.$loading({
                                body: true,
                                fullscreen: true,
                                lock: true
                            });
                            this.$famHttp({
                                url: '/ppm/plan/v1/import/tasksBySaveAs',
                                method: 'POST',
                                className: store.state.classNameMapping.project,
                                params,
                                data
                            })
                                .then(() => {
                                    loading.close();
                                    this.$message.success(_this.i18n.importSuccess);
                                    destroy();
                                    refresh();
                                })
                                .catch(() => {
                                    loading.close();
                                });
                        }
                    }
                });
            },
            // 批量赋值
            taskBatchUpdate(data) {
                const { getMessage, containerRef, i18nMappingObj } = this;
                let message = getMessage(data, (item) => item.isNew, i18nMappingObj.notSavedToAssignVal);
                if (message) return this.$message.info(message);
                let dataResult = data.map((item) => {
                    return {
                        ...item,
                        oid: item.UID
                    };
                });
                actions.batchEdit(this, dataResult, {
                    rowKey: 'oid',
                    containerRef,
                    props: {
                        stateField: 'lifecycleStatus.status',
                        title: this.i18n.batchEdit
                    }
                    // roleList: await getRoleList(),
                    // beforeSubmit
                });
            },
            // 设置状态
            taskSetStatus(data = [], isMultiple) {
                let _this = this;
                const { getMessage, className, i18nMappingObj } = this;
                let message = getMessage(data, (item) => item.isNew, i18nMappingObj.notSavedToSetStatus);
                if (message) return this.$message.info(message);
                // 数据格式处理
                let dataResult = data.map((item) => {
                    return {
                        ...item,
                        'oid': item.UID,
                        'lifecycleStatus.status': item.state.displayName,
                        [`${className}#lifecycleStatus.status`]: item.state.displayName
                    };
                });
                async function setStateFunc(value) {
                    let checkData = {
                        taskOidList: data.map((item) => {
                            return item.UID;
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
                                    oid: item.UID
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
                                    oid: data[0].UID,
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
            // 编辑
            taskUpdate(data = []) {
                let [row] = data;
                this.$router.push({
                    path: `/space/project-plan/planEdit`,
                    params: {
                        // 修改计划时  增加计划集参数
                        currentPlanSet: this.currentPlanSet
                    },
                    query: {
                        status: row.state.value || '',
                        pid: this.projectOid,
                        planOid: row.UID,
                        planTitle: this.i18nMappingObj.edit + `${row.Name}`,
                        collectId: this.currentPlanSet
                    }
                });
            },
            // 发起流程
            taskStartProcess(data = [], isMultiple) {
                let draftOid;
                const { projectOid, className } = this;
                const keys = ['TechnicalReview', 'DcpReview'];
                let { key, id } = store.state.projectInfo?.containerRef || {};
                let containerRef = `OR:${key}:${id}`;
                // 组装数据
                let businessData = data.map((item) => {
                    let attrs = {
                        'identifierNo': item.identifierNo,
                        'name': item.Name,
                        'oid': item.UID,
                        'projectRef': projectOid,
                        'lifecycleStatus.status': item.state.displayName,
                        'typeName': className
                    };
                    return {
                        ...item,
                        oid: item.UID,
                        attrRawList: Object.keys(attrs).map((key) => {
                            return {
                                attrName: `${className}#${key}`,
                                value: attrs[key],
                                displayName: attrs[key],
                                oid: attrs[key]
                            };
                        })
                    };
                });
                let type = isMultiple ? 'batch' : 'single';
                const beforeOpenProcess = async ({ processInfos, next, businessData }) => {
                    const ErdcKit = require('erdcloud.kit');
                    let { engineModelKey } = processInfos || {};
                    if (keys.includes(engineModelKey)) {
                        let className = store.state.classNameMapping.reviewManagement;
                        let { reviewCategoryRef, reviewPointRef } = data[0] || {};
                        let reviewPointOid = `OR:${reviewPointRef?.value?.key}:${reviewPointRef?.value?.id}`;
                        let reviewCategoryOid = `OR:${reviewCategoryRef?.value?.key}:${reviewCategoryRef?.value?.id}`;
                        let params = {
                            reviewPointOid,
                            projectOid: this.projectOid,
                            taskOidList: data.map((item) => {
                                return item.UID;
                            })
                        };
                        let reviewData = await commonHttp.getByProductOid();
                        commonHttp.findReviewData(params, className).then((resp) => {
                            let businessData = resp;
                            businessData.urlConfig = {
                                className: this.className,
                                data: params
                            };
                            businessData.types = 'milestone';
                            businessData.milestoneTableData = data.map((item) => {
                                let obj = {};
                                _.keys(item).forEach((key) => {
                                    let originalName = this.ganttVue.headeAndLayout.find(
                                        (item) => item.attrName === key
                                    )?.originalName;
                                    const displayNameKeys = [
                                        'Principal',
                                        'reviewCategoryRef',
                                        'reviewPointRef',
                                        'typeReference'
                                    ];
                                    obj[originalName || key] = displayNameKeys.includes(key)
                                        ? item[key]?.displayName
                                        : item[key];
                                });
                                obj.idKey = this.className;
                                obj.projectRef = this.projectOid;
                                obj.name = obj[this.className + '#name'];
                                obj.originalData = ErdcKit.deepClone(item);
                                return obj;
                            });
                            localStorage.setItem(
                                engineModelKey + ':setReviewInfo',
                                JSON.stringify({
                                    type: reviewData.filter((item) => item.oid === reviewCategoryOid) || [],
                                    point: [
                                        { oid: reviewPointOid, name: reviewPointRef.displayName, ...reviewPointRef }
                                    ]
                                })
                            );
                            next([businessData]);
                        });
                    } else next(businessData);
                };

                actions.startProcess(this, {
                    containerRef,
                    businessData,
                    type,
                    beforeOpenProcess,
                    isCheckDraft: async ({ engineModelKey }) => {
                        if (keys.includes(engineModelKey)) {
                            draftOid = await commonHttp.getReviewDraft(data);
                            return !!draftOid;
                        }
                        return true;
                    },
                    beforeDraft: (params, { engineModelKey }) => {
                        // 只有技术评审流程和决策评审流程才会修改获取草稿数据入参
                        keys.includes(engineModelKey) && params.set('reviewItemId', [draftOid]);
                    }
                });
            },
            // 创建子任务
            createSubTask(data = []) {
                let { i18nMappingObj, currentPlanSet, projectOid } = this;
                let [row] = data;
                this.$router.push({
                    path: '/space/project-plan/planCreate',
                    params: {
                        backName: 'planList',
                        hideDraftBtn: !row.isTemplate,
                        currentPlanSet: currentPlanSet
                    },
                    query: {
                        pid: projectOid,
                        hideDraftBtn: !row.isTemplate,
                        planOid: row.UID,
                        createPlanTitle: i18nMappingObj.createSubTask,
                        backName: 'planList',
                        collectId: currentPlanSet
                    }
                });
            },
            // 复制
            copyTask(data = []) {
                let { i18nMappingObj } = this;
                let [row] = data;
                actions.copyItem(this, row, {
                    rowKey: 'UID',
                    nameKey: 'Name',
                    creatorId: (row.CreateBy.value || '').split(':')[2],
                    props: {
                        isTemplate: this.isTemplate,
                        usePlanSet: true,
                        ObjectType: 'plan',
                        parentConfig: {
                            show: true,
                            isList: false,
                            label: i18nMappingObj.parentTask
                        }
                    }
                });
            },
            // 移动
            moveTask(data = []) {
                let { i18nMappingObj } = this;
                let [row] = data;
                function handleParams(params, row) {
                    // 处理关联任务字段
                    params.relationList[0].className = row?.TaskLink?.idKey;
                    params.relationList[0].oid = row?.TaskLink?.oid;
                    return params;
                }
                actions.moveItem(this, row, {
                    rowKey: 'UID',
                    nameKey: 'Name',
                    props: {
                        isTemplate: this.isTemplate,
                        usePlanSet: true,
                        ObjectType: 'plan',
                        parentConfig: {
                            show: true,
                            isList: false,
                            label: i18nMappingObj.parentTask
                        }
                    },
                    handleParams
                });
            },
            // excel导出
            excelExport() {
                let { className } = this;
                const getExportRequestData = (data) => {
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    let isTemplate = !!(store.state.projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid);
                    let params = {
                        businessName: 'TaskExport',
                        templateId: 'OR:erd.cloud.foundation.export.entity.ExportTemplate:1714907513407754241', // 后端说写死，已经搞了初始化脚本
                        useDefaultExport: false,
                        exportFields,
                        customParams: {
                            useDefaultTemplate: true,
                            exportType: 'excel',
                            isTemplate
                        },
                        tableSearchDto: {
                            className,
                            getAllFields: true,
                            sortBy: 'asc',
                            // orderBy: 'erd.cloud.ppm.plan.entity.Task#identifierNo',
                            orderBy: 'sortOrder',
                            conditionDtoList: [
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                    oper: 'EQ',
                                    value1: this.projectOid
                                },
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                                    oper: 'NOT_IN',
                                    logicalOperator: 'AND',
                                    sortOrder: 0,
                                    isCondition: true,
                                    value1: 'CROPPED,DRAFT'
                                }
                            ],
                            tableKey: 'TaskGanttView'
                        }
                    };
                    // 有计划集才传
                    if (this.currentPlanSet)
                        params.tableSearchDto.conditionDtoList.push({
                            attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                            oper: 'EQ',
                            value1: this.currentPlanSet
                        });
                    return params;
                };
                const fieldParams = {
                    data: this.defaultColumns.map((item) => {
                        return `${className}#${item.attrName}`;
                    }),
                    params: {
                        className,
                        isGanTT: true
                    }
                };
                let params = {
                    className: className,
                    fieldParams,
                    getExportRequestData
                };
                actions.export(this, params);
            },
            // excel导入
            excelImport() {
                let _this = this;
                function handleImportParams(params) {
                    let isTemplate = !!(
                        store.state.projectInfo['templateInfo.tmplTemplated'] && _this.$route.query.pid
                    );
                    params.customParams = _.extend({}, params.customParams, {
                        className: _this.className,
                        isTemplate,
                        projectId: _this.projectOid,
                        collectId: _this.currentPlanSet
                    });
                    return params;
                }
                let params = {
                    businessName: 'TaskImport',
                    importType: 'excel',
                    className: _this.className,
                    handleParams: handleImportParams
                };
                actions.import(this, params);
            },
            // project导出
            projectExport() {
                let { className } = this;
                const getExportRequestData = (data) => {
                    let exportFields = data.selectedColumns.map((item) => {
                        return item.attrName;
                    });
                    let isTemplate = !!(store.state.projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid);
                    let params = {
                        businessName: 'TaskExport',
                        useDefaultExport: false,
                        exportFields,
                        customParams: {
                            useDefaultTemplate: true,
                            exportType: 'mpp',
                            isTemplate
                        },
                        tableSearchDto: {
                            className,
                            getAllFields: true,
                            sortBy: 'asc',
                            // orderBy: 'erd.cloud.ppm.plan.entity.Task#identifierNo',
                            orderBy: 'sortOrder',
                            conditionDtoList: [
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                    oper: 'EQ',
                                    value1: this.projectOid
                                },
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                                    oper: 'NOT_IN',
                                    logicalOperator: 'AND',
                                    sortOrder: 0,
                                    isCondition: true,
                                    value1: 'DRAFT,CROPPED'
                                }
                                // {
                                //     attrName: 'erd.cloud.ppm.plan.entity.Task#cutted',
                                //     oper: 'EQ',
                                //     logicalOperator: 'AND',
                                //     sortOrder: 1,
                                //     isCondition: true,
                                //     value1: 'false'
                                // }
                            ],
                            tableKey: 'TaskGanttView'
                        }
                    };
                    // 有计划集才传
                    if (this.currentPlanSet)
                        params.tableSearchDto.conditionDtoList.push({
                            attrName: 'erd.cloud.ppm.plan.entity.Task#collectRef',
                            oper: 'EQ',
                            value1: this.currentPlanSet
                        });
                    return params;
                };
                const fieldParams = {
                    data: this.defaultColumns.map((item) => {
                        return `${className}#${item.attrName}`;
                    }),
                    params: {
                        className,
                        isGanTT: true,
                        hasPreTask: true
                    }
                };
                let params = {
                    className: className,
                    fieldParams,
                    getExportRequestData
                };
                actions.export(this, params);
            },
            // project导入
            projectImport() {
                let _this = this;
                function handleImportParams(params) {
                    let isTemplate = !!(
                        store.state.projectInfo['templateInfo.tmplTemplated'] && _this.$route.query.pid
                    );
                    params.customParams = _.extend({}, params.customParams, {
                        className: _this.className,
                        isTemplate,
                        projectId: _this.projectOid,
                        collectId: _this.currentPlanSet
                    });
                    return params;
                }
                let params = {
                    businessName: 'TaskImport',
                    importType: 'mpp',
                    className: _this.className,
                    handleParams: handleImportParams
                };
                actions.import(this, params);
            },
            onAdvancedHeightChange(val) {
                this.advancedHeight = val + 48 || 0;

                this.$nextTick(() => {
                    this.project.doLayout();
                });
            },
            onAdvancedFilterSubmit(conditions) {
                this.conditions = conditions;
                this.refresh();
            },
            handleCommand(val) {
                val && this[val]();
            },
            onDeliveryFullscreen() {
                // 页面大小变化后，重新调整表格宽度自适应
                this.$refs?.['deliveryDetailRef'].resizeTableColumns();
            },
            createPhaseTask() {
                this.$router.push({
                    path: '/space/project-plan/phasePlanCreate',
                    params: {
                        currentPlanSet: this.currentPlanSet
                    },
                    query: {
                        collectId: this.currentPlanSet,
                        backName: 'planList',
                        stageFlag: true,
                        createPlanTitle: this.i18n.createPhase,
                        pid: this.projectOid
                    }
                });
            }
        }
    };
});
