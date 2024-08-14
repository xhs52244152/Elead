function init() {
    require(['vue', 'fam:kit', 'dayjs', 'fam:store', ELMP.resource('ppm-store/index.js')], function (
        Vue,
        FamKit,
        dayjs,
        famStore,
        store
    ) {
        window.PlusProject = null;
        window.ProgressLine = null;
        window.mini = null;
        window.ganttVue = new Vue({
            data() {
                return {
                    i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                    i18nMappingObj: {
                        actualEndTips: this.getI18nByKey('actualEndTips'), // 实际结束日必须大于实际开始日
                        actualStartTips: this.getI18nByKey('actualStartTips'), // 实际开始日必须小于实际结束日
                        nameMaxTips: this.getI18nByKey('nameMaxTips'), // 任务名称不能超过64个字符
                        manual: this.getI18nByKey('manual'), // 手动
                        auto: this.getI18nByKey('auto'), // 自动
                        enable: this.getI18nByKey('enable'), // 是
                        disable: this.getI18nByKey('disable'), // 否
                        controls: this.getI18nByKey('controls'), // 操作
                        lifeCycleState: this.getI18nByKey('lifeCycleState'),
                        participant: this.getI18nByKey('participant'),
                        responsiblePerson: this.getI18nByKey('responsiblePerson'),
                        resourceRole: this.getI18nByKey('resourceRole'),
                        reviewType: this.getI18nByKey('reviewType'),
                        reviewPoints: this.getI18nByKey('reviewPoints')
                    },
                    allSelectedState: '',
                    selectedMap: {},
                    // 当计划集oid
                    currentPlanSet: 'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                    // 当前层级
                    currentLevel: '1',
                    // 当前搜索条件信息
                    TableSearchDto: {
                        sortBy: 'asc',
                        orderBy: 'erd.cloud.ppm.plan.entity.Task#identifierNo',
                        className: store.state.classNameMapping.task,
                        conditionDtoList: [],
                        tableKey: 'TaskGanttView'
                    },
                    // 随机颜色缓存
                    colorCache: {},
                    businessScene: '',
                    reviewCategoryList: [], // 评审类型
                    reviewPointOptions: [] // 根据评审类型获取评审点
                };
            },
            computed: {
                readOnly() {
                    return this.businessScene === 'changeSelectList';
                }
            },
            watch: {
                selectedMap: {
                    handler(val) {
                        let selectedLen = Object.keys(val)?.filter((uid) => {
                            return val[uid];
                        })?.length;

                        if (selectedLen === 0) {
                            this.allSelectedState = '';
                        } else if (selectedLen < this.project.getTaskList().length) {
                            this.allSelectedState = 'isIndeterminate';
                        } else {
                            this.allSelectedState = 'isChecked';
                        }

                        // 更新表头复选框状态
                        let $headerCheckbox = $('.mini-supergrid-headercell-inner .el-checkbox');
                        let isIndeterminate = this.allSelectedState === 'isIndeterminate';
                        let isChecked = this.allSelectedState === 'isChecked';
                        this.setCheck($headerCheckbox, isChecked, isIndeterminate);

                        // 触发勾选切换事件
                        this.$nextTick(() => {
                            this.postMessage({
                                name: 'onSelectChange',
                                data: this.getSelected()
                            });
                        });
                    },
                    deep: true
                }
            },
            created() {
                let { projectOid, collectId, businessScene, currentLevel, conditionDtoList } = window.getParentParams();
                this.currentLevel = currentLevel;
                this.projectOid = projectOid;
                this.businessScene = businessScene;
                this.conditionDtoList = conditionDtoList;
                this.currentPlanSet = collectId || this.currentPlanSet;
                this.dateFields = [
                    'Start',
                    'Finish',
                    'StartDate',
                    'FinishDate',
                    'LastTaskFinishDate',
                    'CurrentDate',
                    'LateStart',
                    'EarlyFinish',
                    'EarlyStart',
                    'LateFinish',
                    'ActualStart',
                    'ActualFinish'
                ];
                this.getReviewCategoryList();
                window.currentLang = famStore?.getters?.['i18n/getData']?.lan;
                // 引入普加甘特图插件资源boot.js
                this.loadScript([
                    ELMP.resource('project-plan/components/Gantt/libs/boot.js') + '?ver=__VERSION__'
                ]).then(() => {
                    // 普加甘特图实例化、初始配置项设置
                    this.initProject();

                    // 客制化列渲染处理、自定义列
                    this.customColumns();

                    // 查询列配置数据（是否可编辑、默认值），然后整合缓存列信息，最后setColumns
                    this.fetchHeaders().then((resp) => {
                        this.headeAndLayout = resp.data || [];
                        this.allColumns = this.headeAndLayout.filter((item) => item.viewHead);
                        this.initColumns = this.allColumns.filter(
                            (item) => item.baseField || item.locked || item.extraCol
                        );
                        this.postMessage({
                            name: 'setColumnsConfig',
                            data: {
                                headeAndLayout: this.headeAndLayout,
                                allColumns: this.allColumns,
                                initColumns: this.initColumns
                            }
                        });
                    });

                    // 事件监听（编码点击、展开子节点、打开行操作菜单、行保存取消等）
                    this.initEvent();
                    let conditionDtoList = [];
                    if (this.readOnly && this.conditionDtoList?.length) {
                        conditionDtoList = this.conditionDtoList;
                    }
                    // 查询甘特图回显数据（任务、日历）
                    this.refreshTable(
                        {
                            collectId: this.currentPlanSet,
                            level: this.currentLevel
                        },
                        {
                            conditionDtoList
                        }
                    );
                });
            },
            methods: {
                // 获取评审类型
                getReviewCategoryList() {
                    this.$famHttp({
                        url: '/element/reviewCategory/getByProductOid',
                        method: 'GET',
                        className: 'erd.cloud.cbb.review.entity.ReviewCategory',
                        params: {
                            productOid: store.state.projectInfo?.productLineRef
                        }
                    }).then((res) => {
                        this.reviewCategoryList = res.data.map((item) => {
                            return {
                                value: item.oid,
                                label: item.displayName
                            };
                        });
                    });
                },
                refreshTable(extendParams = {}, TableSearchDto = {}) {
                    let { collapseTask } = this;

                    // 缓存当前计划集和层级以及项目oid
                    let paramsMap = {
                        projectOid: 'projectId',
                        currentPlanSet: 'collectId',
                        currentLevel: 'level'
                    };
                    Object.keys(paramsMap).forEach((key) => {
                        let field = paramsMap[key];
                        Object.prototype.hasOwnProperty.call(extendParams, field) && (this[key] = extendParams[field]);
                    });

                    // 缓存当前高级筛选信息
                    Object.assign(this.TableSearchDto, TableSearchDto);

                    // 清空勾选数据
                    this.allSelectedState = '';
                    this.selectedMap = {};

                    Promise.all([this.loadData(extendParams), this.loadCalendarData()]).then((data) => {
                        let ganttListData = data[0];
                        // 项目日历数据
                        let calendarData = data[1];
                        // 设置甘特图日历
                        ganttListData.Calendars = [calendarData];

                        this.render(ganttListData);

                        this.$nextTick(() => {
                            collapseTask(ganttListData.Tasks);
                        });
                    });
                },
                loadData(extendParams = {}, searchDto = {}) {
                    const _this = this;
                    let { projectOid, dateFields, TableSearchDto } = this;
                    return new Promise((resolve) => {
                        this.$famHttp({
                            url: '/ppm/plan/v1/gantt/tasks/tree',
                            method: 'POST',
                            className: store.state.classNameMapping.project,
                            params: {
                                projectId: projectOid,
                                ...extendParams
                            },
                            data: Object.assign({}, TableSearchDto, searchDto)
                        }).then((resp) => {
                            if (resp.code === '200') {
                                let data = JSON.parse(JSON.stringify(resp.data));
                                // 针对资源角色有父子层级的数据处理
                                data.Resources = _this.deepFormatResources(data.Resources);
                                // 项目模板缺少开始或结束时间时自动补足，以免甘特图报错
                                if (!data?.StartDate) {
                                    const currentDate = new Date();
                                    currentDate.setHours(0);
                                    currentDate.setMinutes(0);
                                    currentDate.setSeconds(0);
                                    currentDate.setMilliseconds(0);
                                    data.StartDate = currentDate;
                                }
                                if (!data?.FinishDate) {
                                    const currentDate = new Date();
                                    currentDate.setFullYear(currentDate.getFullYear() + 1);
                                    currentDate.setHours(23);
                                    currentDate.setMinutes(59);
                                    currentDate.setSeconds(59);
                                    currentDate.setMilliseconds(999);
                                    data.FinishDate = currentDate;
                                }
                                let dataFormat = function (tasks = [], isTask = false) {
                                    tasks.forEach((task) => {
                                        Object.keys(task).forEach((key) => {
                                            // 日期字符串转为时间格式
                                            if (dateFields.includes(key)) {
                                                if (key === 'Finish' && task[key]) {
                                                    // 结束时间需要设置为23:59:59
                                                    task[key] = task[key].split(' ')[0] + ' 23:59:59';
                                                }
                                                task[key] && (task[key] = dayjs(task[key]).toDate());
                                            }
                                        });

                                        // selectedMap 初始值处理
                                        if (
                                            isTask &&
                                            !Object.prototype.hasOwnProperty.call(_this.selectedMap, task.UID)
                                        ) {
                                            _this.$set(_this.selectedMap, task.UID, false);
                                        }

                                        // 参与人格式
                                        // task.Participant = task.Participant?.value || task.Participant;
                                        // 1=手动模式，0=自动模式。有子任务时改成自动模式（为了限制父任务不能编辑时间、工时等字段）
                                        task.Manual = task.isLeaf === false ? 0 : 1;
                                        if (task.isLeaf === false) {
                                            task.Summary = 1; // 主要控制未加载子任务时，父任务不能编辑时间、工时等字段
                                        }

                                        if (task.children) {
                                            task.hasLoadChild = true;
                                            dataFormat(task.children, isTask);
                                        }
                                    });
                                };

                                // 数据兼容处理
                                dataFormat([data]);
                                dataFormat(data.Tasks, true);

                                resolve(Object.keys(data)?.length > 0 ? data : null);
                            }
                        });
                    });
                },
                // 格式化资源角色的数据：tree转table
                deepFormatResources(dataArr, level = 0) {
                    if (!dataArr?.length) {
                        return dataArr;
                    }
                    let newDataArr = [];
                    dataArr?.map((r) => {
                        let children = r['Children'];
                        delete r['Children'];
                        newDataArr.push({
                            level,
                            ...r
                        });
                        // 有子节点
                        if (children?.length) {
                            newDataArr = newDataArr.concat(this.deepFormatResources(children, level + 1));
                        }
                    });
                    return newDataArr;
                },
                // 获取项目日历
                loadCalendarData() {
                    // 容器Id
                    let containerId = store.state?.projectInfo?.containerRef?.id;
                    return new Promise((resolve) => {
                        this.$famHttp({
                            url: '/fam/calendar/getSystemCalendarByContainer',
                            method: 'GET',
                            data: {
                                containerId: containerId
                            }
                        }).then((resp) => {
                            if (resp.code === '200') {
                                let data = JSON.parse(JSON.stringify(resp?.data || {}));
                                resolve(data);
                            }
                        });
                    });
                },
                loadScript(scripts) {
                    return new Promise(function (resolve) {
                        let runScript = function (script, callback) {
                            if (script) {
                                let $script = document.createElement('script');
                                $script.setAttribute('type', 'text/javascript');
                                $script.setAttribute('src', script);
                                if ($script.readyState) {
                                    if ($script.readyState === 'complete' || $script.readyState === 'loaded') {
                                        callback && callback();
                                    }
                                } else {
                                    $script.onload = function () {
                                        callback && callback();
                                    };
                                }
                                document.body.appendChild($script);
                            } else {
                                FamKit.deferredUntilTrue(() => {
                                    return PlusProject && ProgressLine;
                                }, resolve);
                            }
                        };

                        let runner = _.reduceRight(
                            scripts,
                            function (prev, current) {
                                return function () {
                                    runScript(current, prev);
                                };
                            },
                            runScript
                        );
                        runner();
                    });
                },
                initEvent() {
                    const _this = this;
                    const {
                        project,
                        $message,
                        loadData,
                        i18nMappingObj,
                        collapseTask,
                        postMessage,
                        setCheck,
                        checkedParent,
                        timeComputed,
                        preTaskComputed,
                        singleSave,
                        computedByRemote
                    } = this;

                    $('body')
                        .off('click', '#ppm-gantt-content')
                        .on('click', '#ppm-gantt-content', function () {
                            let target = window.parent.document.body;
                            // 如果存在行操作菜单，则把其隐藏
                            if (
                                $(target).find('.ppm-gantt-menu-container').length > 0 &&
                                $(target).find('.ppm-gantt-menu-container').is(':visible')
                            ) {
                                $(target).trigger('click');
                            }
                            postMessage({
                                name: 'ganttClick'
                            });
                        })
                        // 单元格复选框点击时
                        .off('click', '.mini-supergrid-cell-inner .el-checkbox')
                        .on('click', '.mini-supergrid-cell-inner .el-checkbox', function () {
                            let $this = $(this);

                            let isChecked = $this.hasClass('is-checked');
                            setCheck($this, !isChecked);
                            // 联动子集
                            checkedParent($this.attr('uid'));

                            return false;
                        })
                        // 列头复选框点击时
                        .off('click', '.mini-supergrid-headercell-inner .el-checkbox')
                        .on('click', '.mini-supergrid-headercell-inner .el-checkbox', function () {
                            let $this = $(this);
                            let $cellCheckBox = $('.mini-supergrid-cell-inner .el-checkbox');

                            let isChecked = $this.hasClass('is-checked');
                            if (isChecked) {
                                setCheck($cellCheckBox, false);
                            } else {
                                setCheck($cellCheckBox, true);
                            }

                            // 更新记录数据
                            Object.keys(_this.selectedMap).forEach((uid) => {
                                _this.selectedMap[uid] = !isChecked;
                            });

                            return false;
                        })
                        // 编码点击
                        .off('click', '.ppm-gantt-code-cell')
                        .on('click', '.ppm-gantt-code-cell', function () {
                            if (_this.businessScene) return;
                            let $this = $(this);
                            let UID = $this.attr('uid');
                            postMessage({
                                name: 'openDetail',
                                data: UID
                            });
                        })
                        // 行操作展开 ppm-gantt-preTask-cell
                        .off('click', '.ppm-gantt-opt-cell>.erd-iconfont')
                        .on('click', '.ppm-gantt-opt-cell>.erd-iconfont', function () {
                            let $this = $(this);
                            let UID = $this.attr('uid');
                            postMessage({
                                name: 'renderDropdownMenu',
                                data: {
                                    UID,
                                    ...$this.offset()
                                }
                            });
                        })
                        // 行内 上传交付物
                        .off('click', '.upload-deliverable-btn')
                        .on('click', '.upload-deliverable-btn', function () {
                            let $this = $(this);
                            let UID = $this.attr('uid');
                            postMessage({
                                name: 'uploadDeliverable',
                                data: {
                                    UID
                                }
                            });
                        })
                        // .off('click', '.ppm-gantt-preTask-cell')
                        // .on('click', '.ppm-gantt-preTask-cell', function () {
                        //     let $this = $(this);
                        //     let UID = $this.attr('uid');
                        //     // let task = project.getTask(UID);
                        //     let unSavedTasks = [];
                        //     // 前置任务实时保存，未保存数据相关逻辑注释掉
                        //     // let preTaskIds = (task.preTask || []).map((item) => item.id);

                        //     // task.PredecessorLink.forEach((item) => {
                        //     //     if (!preTaskIds.includes(item.PredecessorUID)) {
                        //     //         let data = project.getTask(item.PredecessorUID);
                        //     //         unSavedTasks.push({
                        //     //             projectName: '',
                        //     //             collectName: '',
                        //     //             oid: item.PredecessorUID,
                        //     //             taskName: data.Name,
                        //     //             type: item.Type,
                        //     //             delay: item.LinkLag,
                        //     //             isNew: data.isNew
                        //     //         });
                        //     //     }
                        //     // });

                        //     postMessage({
                        //         name: 'viewPreTask',
                        //         data: {
                        //             UID,
                        //             unSavedTasks
                        //         }
                        //     });
                        // })
                        // 行保存、取消
                        .off('click', '.mini-supergrid-rowbtns>span')
                        .on('click', '.mini-supergrid-rowbtns>span', function () {
                            let $this = $(this),
                                action = $this.data('name'),
                                uid = $this.attr('uid'),
                                task = project.getTask(uid);
                            if (action === 'cancel') {
                                // 操作回退
                                // let oldValues = JSON.parse(JSON.stringify(project.store.getOldValue(task)));
                                // project.updateTask(task, oldValues);
                                project.undo(uid);
                                project.store.acceptRecord(task);
                            } else {
                                // 修改保存
                                let changes = project.getChangedTasks('modified', true);
                                let currentChange = changes.find((item) => item.UID === task.UID);
                                if (!task.Name)
                                    return $message({
                                        type: 'info',
                                        message: _this.i18n.pleaseEnterName
                                    });
                                singleSave(currentChange).then(() => {
                                    project.store.acceptRecord(task);
                                });
                            }
                        });

                    // js控制锁定列的hover效果
                    const getRowInLocked = function ($row) {
                        let index = $row.index();
                        let isLockedRow = $row.parent().hasClass('mini-supergrid-lockedcells');
                        let targetRowClass = isLockedRow ? '.mini-supergrid-cells' : '.mini-supergrid-lockedcells';
                        let targetRow = $(`${targetRowClass}>.mini-supergrid-row:nth-child(${index + 1})`);

                        return targetRow;
                    };

                    // 同步甘特图hover样式
                    const ganttHoverAction = function ($row, action) {
                        const identifierNo = $row.data('identifier-no');
                        $(`.mini-ganttview-bars [data-identifier-no='${identifierNo}']`)[action]('hover');
                        $(`.mini-ganttview-gridlines .mini-gantt-row[data-identifier-no='${identifierNo}']`)[action](
                            'hover'
                        );
                    };
                    $('#ppm-gantt-content')
                        .off('mouseenter', 'div>.mini-supergrid-row')
                        .on('mouseenter', 'div>.mini-supergrid-row', function () {
                            const $this = $(this);
                            let targetRow = getRowInLocked($this);
                            targetRow.addClass('mini-supergrid-row-hover');

                            ganttHoverAction($this, 'addClass');
                        })
                        .off('mouseleave', 'div>.mini-supergrid-row')
                        .on('mouseleave', 'div>.mini-supergrid-row', function () {
                            const $this = $(this);
                            let targetRow = getRowInLocked($this);
                            targetRow.removeClass('mini-supergrid-row-hover');

                            ganttHoverAction($this, 'removeClass');
                        });
                    var resizeSelector =
                        '.mini-gantt-item,.mini-gantt-resize-percentcomplete,.mini-gantt-resize-finish';
                    // 条形图的hover样式
                    $('#ppm-gantt-content')
                        .off('mouseenter', resizeSelector)
                        .on('mouseenter', resizeSelector, function () {
                            const $this = $(this);
                            $('#ppm-gantt-content')
                                .find(resizeSelector)
                                .filter(`[id="${$this.attr('id')}"]`)
                                .addClass('mini-gantt-visible'); // 显示
                            $('#ppm-gantt-content')
                                .find(`.mini-gantt-resize-finish`)
                                .filter(`[id="${$this.attr('id')}"]`)
                                .html('<div class="mini-gantt-drag-rein-icon"></div>');
                        })
                        .off('mouseleave', resizeSelector)
                        .on('mouseleave', resizeSelector, function () {
                            $('#ppm-gantt-content').find(resizeSelector).removeClass('mini-gantt-visible'); // 隐藏
                            $('#ppm-gantt-content').find(`.mini-gantt-resize-finish`).html(''); // 删除子元素
                        });
                    // 点击展开加载子节点
                    project.on('expandtask', function (e) {
                        let task = e.task;
                        if (task.isLeaf) return;
                        if (task.hasLoadChild) return;
                        // 查询子节点
                        loadData(
                            {
                                parentId: task.UID,
                                collectId: _this.currentPlanSet
                            },
                            {
                                conditionDtoList: []
                            }
                        ).then((data) => {
                            data.Tasks.forEach((item) => {
                                item.copyPredecessorLink = item.PredecessorLink
                                    ? JSON.parse(JSON.stringify(item.PredecessorLink))
                                    : [];
                                item.expanded = false;
                            });

                            project.removeTasks(project.getChildTasks(task));
                            project.addTasks(data.Tasks, 'add', task);

                            // 重置初始状态
                            data.Tasks.forEach((item) => {
                                let task = project.getTask(item.UID);
                                project.store.acceptRecord(task);
                            });

                            task.hasLoadChild = true;

                            _this.$nextTick(() => {
                                // 勾选子集
                                checkedParent(task?.UID);
                                collapseTask(data.Tasks);
                            });
                        });
                    });

                    //控制单元格是否可编辑
                    project.on('cellbeginedit', function (e) {
                        if (e.field === 'Start' || e.field === 'Finish') {
                            e.editor.setMaxDate(e.source?.data?.FinishDate);
                            e.editor.setMinDate(e.source?.data?.StartDate);
                        }

                        let task = e.record;
                        let column = e.column;
                        // 自动模式 && 有子任务 && 编辑的字段为完成率 不允许编辑（开始时间、结束时间、工期甘特图已通过Manual=0自动模式自带的禁止编辑）
                        if (task.Manual === 0 && task.isLeaf === false && column.field === 'PercentComplete') {
                            e.cancel = true;
                            return;
                        }
                        if ($(event && event.target).hasClass('ppm-gantt-preTask-cell')) {
                            e.cancel = true;
                            let unSavedTasks = [];
                            postMessage({
                                name: 'viewPreTask',
                                data: {
                                    UID: task.UID,
                                    unSavedTasks
                                }
                            });
                            return;
                        }
                        if (task.UpdateAcl === 0) {
                            e.cancel = true;
                            return;
                        }
                    });

                    //单元格提交编辑值时发生
                    project.on('cellcommitEdit', function (e) {
                        let task = e.record, // object, 任务对象
                            column = e.column, // object, 列对象
                            value = e.value; // object, 单元格值
                        if (column.field === 'ActualFinish' && !!task.ActualStart) {
                            if (new Date(task.ActualStart).getTime() > new Date(value).getTime()) {
                                e.cancel = true;
                                return $message({
                                    type: 'warning',
                                    message: i18nMappingObj.actualEndTips
                                });
                            }
                        }

                        if (column.field === 'ActualStart' && !!task.ActualFinish) {
                            if (new Date(value).getTime() > new Date(task.ActualFinish).getTime()) {
                                e.cancel = true;

                                return $message({
                                    type: 'warning',
                                    message: i18nMappingObj.actualStartTips
                                });
                            }
                        }

                        if (column.field === 'Name' && value.length > 64) {
                            e.cancel = true;

                            return $message({
                                type: 'warning',
                                message: i18nMappingObj.nameMaxTips
                            });
                        }

                        // 调接口计算（计划开始时间、计划结束时间、前置任务）
                        let field = column.field;
                        if (['Start', 'Finish'].includes(field)) {
                            timeComputed(task, { newValue: value, field });
                        } else if (['PredecessorLink'].includes(field)) {
                            let oldValue = task[field];
                            project.allowOrderProject = true;
                            setTimeout(() => {
                                preTaskComputed(task, { oldValue }, value);
                                project.allowOrderProject = false;
                            });
                        } else if (['Duration'].includes(field)) {
                            let oldValue = task[field];
                            setTimeout(() => {
                                timeComputed(task, { newValue: value, oldValue, field });
                            });
                        } else if (['PercentComplete'].includes(field)) {
                            let params = {
                                action: 'COMPLETIONRATE',
                                id: task.UID, //操作的任务OID
                                targetCompletionRate: value
                            };
                            computedByRemote(params);
                        } else if (['Assignments'].includes(field)) {
                            setTimeout(function () {
                                let currentChange = {
                                    UID: task.UID, //操作的任务OID
                                    Assignments: value,
                                    Principal: task.Principal,
                                    _state: 'modified'
                                };
                                if (field === 'Name' && !value) {
                                    e.cancel = true; // 取消操作，会还原数据
                                    return $message({
                                        type: 'info',
                                        message: _this.i18n.pleaseEnterName
                                    });
                                }
                                singleSave(currentChange).then(() => {
                                    project.store.acceptRecord(task);
                                });
                            }, 100);
                        } else if (['reviewCategoryRef'].includes(field)) {
                            setTimeout(function () {
                                let currentChange = {
                                    UID: task.UID, //操作的任务OID
                                    reviewCategoryRef: value,
                                    reviewPointRef: task.reviewPointRef,
                                    _state: 'modified'
                                };
                                if (field === 'Name' && !value)
                                    return $message({
                                        type: 'info',
                                        message: _this.i18n.pleaseEnterName
                                    });
                                singleSave(currentChange).then(() => {
                                    project.store.acceptRecord(task);
                                });
                            }, 100);
                        } else if (['Principal'].includes(field)) {
                            let data = e.editor.data || [];
                            if (data.length) {
                                let newValue = value.trim();
                                const val = data.find((item) => item.UID === newValue)?.UID || '';
                                setTimeout(function () {
                                    let currentChange = {
                                        UID: task.UID, //操作的任务OID
                                        Principal: val,
                                        _state: 'modified'
                                    };

                                    singleSave(currentChange).then(() => {
                                        project.store.acceptRecord(task);
                                    });
                                }, 100);
                            } else {
                                value = '';
                            }
                        } else {
                            let currentChange = {
                                UID: task.UID, //操作的任务OID
                                [field]: value,
                                _state: 'modified'
                            };
                            if (field === 'Name' && !value) {
                                e.cancel = true; // 取消操作，会还原数据
                                return $message({
                                    type: 'info',
                                    message: _this.i18n.pleaseEnterName
                                });
                            }
                            singleSave(currentChange).then(() => {
                                project.store.acceptRecord(task);
                            });
                        }
                        // if (
                        //     column.field === 'Finish' &&
                        //     value &&
                        //     value?.getTime() > e.source?.data?.FinishDate?.getTime()
                        // ) {
                        //     e.cancel = true;
                        //     return $message({
                        //         type: 'warning',
                        //         message: `结束时间不能晚于项目结束时间（${dayjs(e.source?.data?.FinishDate).format(
                        //             'YYYY-MM-DD'
                        //         )}）`
                        //     });
                        // }

                        // if (
                        //     column.field === 'Start' &&
                        //     value &&
                        //     value?.getTime() < e.source?.data?.StartDate?.getTime()
                        // ) {
                        //     e.cancel = true;
                        //     return $message({
                        //         type: 'warning',
                        //         message: `开始时间不能早于项目开始时间（${dayjs(e.source?.data?.StartDate).format(
                        //             'YYYY-MM-DD'
                        //         )}）`
                        //     });
                        // }
                    });

                    // 绘制单元格处理
                    project.on('drawcell', function (e) {
                        if (e.record.isCutted == 1) {
                            e.rowCls = 'red-line';
                        }

                        if (e.field === 'Manual') {
                            let text = e.record.Manual === 1 ? i18nMappingObj.manual : i18nMappingObj.auto;
                            e.cellHtml = `<span>${text}</span>`;
                        }
                    });

                    // 控制条形图是否可拖拽
                    project.on('itemdragstart', function (e) {
                        // 拖拽事件
                        if (e.item.UpdateAcl === 0) {
                            e.cancel = true;
                            return;
                        }
                    });

                    // 左侧表格行选中/反选事件
                    project.on('SelectionChanged', function (e) {
                        let action = e.select ? 'addClass' : 'removeClass';
                        e.records?.forEach((row) => {
                            $(`.mini-ganttview-gridlines .mini-gantt-row[data-identifier-no='${row?.identifierNo}']`)[
                                action
                            ]('mini-gantt-rowselected');
                        });
                    });

                    // 条形图拖拽完成时发生
                    project.on('itemdragcomplete', function (e) {
                        let task = e.item;
                        // let data = e.source.data;
                        // let Duration = task.Duration;
                        switch (e.action) {
                            case 'move':
                                timeComputed(task, { newValue: task.Start, field: 'Start', doCompare: false });
                                // if (task.Start.getTime() < data.StartDate.getTime()) {
                                //     task.Start = data.StartDate;
                                //     task.Finish = dayjs(task.Start).add(Duration, 'day').toDate();
                                //     $message({
                                //         type: 'warning',
                                //         message: `开始时间不能早于项目开始时间（${dayjs(data?.StartDate).format(
                                //             'YYYY-MM-DD'
                                //         )}）`
                                //     });
                                // } else if (task.Finish.getTime() > data.FinishDate.getTime()) {
                                //     task.Finish = data.FinishDate;
                                //     task.Start = dayjs(task.Finish).subtract(Duration, 'day').toDate();
                                //     $message({
                                //         type: 'warning',
                                //         message: `结束时间不能晚于项目结束时间（${dayjs(data?.FinishDate).format(
                                //             'YYYY-MM-DD'
                                //         )}）`
                                //     });
                                // }
                                break;
                            case 'finish':
                                timeComputed(task, { newValue: task.Finish, field: 'Finish', doCompare: false });
                                // if (task.Finish.getTime() > data.FinishDate.getTime()) {
                                //     task.Finish = data.FinishDate;
                                //     $message({
                                //         type: 'warning',
                                //         message: `结束时间不能晚于项目结束时间（${dayjs(data?.FinishDate).format(
                                //             'YYYY-MM-DD'
                                //         )}）`
                                //     });
                                // }
                                break;
                            // 拖拽百分比
                            case 'percentcomplete':
                                computedByRemote(
                                    {
                                        action: 'COMPLETIONRATE',
                                        id: task.UID, //操作的任务OID
                                        targetCompletionRate: task.PercentComplete
                                    },
                                    task.UID
                                );
                                break;
                            default:
                        }
                    });

                    // 链接在图表区鼠标拖拽创建前引发
                    project.on('beforelinkcreate', function (e) {
                        e.cancel = true;
                        let predecessorTask = project.getTask(e.link.PredecessorUID);
                        let task = project.getTask(e.link.TaskUID);
                        let prevLink = project.getPredecessorLink(task, predecessorTask);
                        if (!prevLink) {
                            let links = (task.PredecessorLink || []).clone();
                            let oldValue = links.clone();
                            links.push(e.link);
                            let action = new PlusProject.UpdateTaskAction(project, task, 'PredecessorLink', links);
                            project.executeAction(action);
                            // 调接口计算
                            preTaskComputed(task, { oldValue });
                        }
                    });

                    // 链接在图表区域通过鼠标双击删除时引发
                    project.on('linkremove', function (e) {
                        // 调接口计算
                        let task = project.getTask(e.link.TaskUID);
                        preTaskComputed(task, { doCompare: false });
                    });

                    // 拖拽行释放时发生
                    project.on('taskdragdrop', function (e) {
                        e.cancel = true;
                        let task = e.tasks[0];
                        let parentTaskUID = e.targetTask?.ParentTaskUID;
                        let parentTask = (parentTaskUID && project.getTask(parentTaskUID)) || {
                            UID: _this.projectOid,
                            StageFlag: 0,
                            Milestone: 0
                        };
                        let sortId = '';
                        switch (e.action) {
                            case 'add':
                                parentTask.UID = e.targetTask?.UID;
                                break;
                            case 'before':
                                parentTask?.children?.length
                                    ? parentTask?.children?.find((item, index) => {
                                        if (item.UID == e.targetTask?.UID) {
                                            if (index == 0) {
                                                sortId = '-1';
                                                return true;
                                            } else {
                                                sortId = parentTask?.children[index - 1]?.UID;
                                                return true;
                                            }
                                        }
                                    })
                                    : (sortId = project.getPrevTask(e.targetTask)?.UID || '-1');
                                break;
                            case 'after':
                                sortId = e.targetTask?.UID;
                                break;
                            default:
                                break;
                        }
                        let params = {
                            action: 'DRAG',
                            id: task.UID, //操作的任务OID
                            targetId: parentTask.UID, //目标Id 升级降级后 父节点OID (任务OID或者项目OID)
                            targetStageFlag: !!parentTask.StageFlag, //目标任务的是否阶段
                            targetMilestoneFlag: !!parentTask.Milestone, //目标任务是否里程碑
                            stageFlag: !!task.StageFlag, //当前任务是否阶段
                            miletoneFlag: !!task.Milestone, //当前任务是否里程碑
                            sortId //拖拽之后行排序
                        };
                        let action = new PlusProject.MoveTaskAction(project, e.tasks, e.targetTask, e.action);
                        project.executeAction(action);
                        computedByRemote(params);
                    });
                },
                customColumns() {
                    const _this = this;
                    let { getCheckBoxHtml, getComponentEditor, i18nMappingObj, project } = this;

                    let IDColumn = PlusProject.IDColumn;
                    PlusProject.IDColumn = function (options) {
                        const idColumn = new IDColumn();
                        return mini.copyTo(
                            idColumn,
                            {
                                header: '',
                                width: 48
                            },
                            options
                        );
                    };

                    let NameColumn = PlusProject.NameColumn;
                    PlusProject.NameColumn = function (options) {
                        const nameColumn = new NameColumn();
                        return mini.copyTo(
                            nameColumn,
                            {
                                renderer(e) {
                                    let name = mini.htmlEncode(e.value);
                                    if (e.record.Summary) {
                                        return `<b title="${name}">${name}</b>`;
                                    }
                                    return `<span title="${name}">${name}</span>`;
                                }
                            },
                            options
                        );
                    };

                    // WBS
                    const OutlineNumberColumn = PlusProject.OutlineNumberColumn;
                    PlusProject.OutlineNumberColumn = function () {
                        const outlineNumberColumn = new OutlineNumberColumn();
                        return mini.copyTo(outlineNumberColumn, {
                            header() {
                                return `<span style="text-align:center;">WBS</span>`;
                            },
                            width: 48,
                            labelAlign: 'center',
                            cellStyle: 'cursor:move;',
                            name: 'outlineNumber',
                            allowDrag: true,
                            renderer(e) {
                                // WBS编码取前端自动生成的outlineNumber
                                return e.value;
                            }
                        });
                    };

                    // 图标列
                    PlusProject.IconColumn = function (options) {
                        return mini.copyTo(
                            {
                                name: 'icon',
                                field: 'icon',
                                header: '',
                                width: 60,
                                renderer(e) {
                                    return `<span class="ppm-gantt-icon-cell"><i class="${e.value}"></i></span>`;
                                }
                            },
                            options
                        );
                    };

                    // 多选列
                    PlusProject.CheckColumn = function (options) {
                        return mini.copyTo(
                            {
                                header: function () {
                                    return getCheckBoxHtml(_this.allSelectedState);
                                },
                                name: 'Test',
                                width: 40,
                                renderer: function (e) {
                                    let task = e.record;
                                    let UID = task.UID;
                                    if (_this.allSelectedState === 'isChecked') {
                                        task.isChecked = true;
                                        _this.selectedMap[UID] = task.isChecked;
                                    } else if (_this.allSelectedState === '') {
                                        task.isChecked = false;
                                        _this.selectedMap[UID] = task.isChecked;
                                    } else {
                                        task.isChecked = _this.selectedMap[UID];
                                    }

                                    return getCheckBoxHtml(task.isChecked ? 'isChecked' : '', UID);
                                }
                            },
                            options
                        );
                    };

                    // 编码
                    PlusProject.identifierNoColumn = function (options) {
                        return mini.copyTo(
                            {
                                name: 'identifierNo',
                                renderer(e) {
                                    if (!e.record.identifierNo) {
                                        return '';
                                    } else if (_this.businessScene) {
                                        return `<span title="${e.record.identifierNo}">${e.record.identifierNo}</span>`;
                                    } else {
                                        return `<span title="${e.record.identifierNo}" class="ppm-gantt-link-cell ppm-gantt-code-cell" uid="${e.record.UID}">${e.record.identifierNo}</span>`;
                                    }
                                }
                            },
                            options
                        );
                    };

                    // 操作
                    PlusProject.OperateColumn = function () {
                        return mini.copyTo({
                            name: 'operate',
                            width: 36,
                            header: i18nMappingObj.controls,
                            editor: null,
                            cellCls: 'ppm-gantt-opt',
                            renderer(e) {
                                let html = `<span class="ppm-gantt-opt-cell">`;
                                if (!e.record.isNew) {
                                    html += `<i uid="${e.record.UID}" class="erd-iconfont erd-icon-more-vertical"></i>`;
                                }
                                return html + '</span>';
                            }
                        });
                    };

                    // 阶段
                    PlusProject.StageFlagColumn = function (options) {
                        return mini.copyTo(
                            {
                                name: 'StageFlag',
                                field: 'StageFlag',
                                editor: {
                                    type: 'combobox',
                                    valueField: 'value', //  选项值字段
                                    displayField: 'displayName', // 选项显示名字段
                                    multiSelect: false,
                                    showCheckIcon: true
                                },
                                renderer(e) {
                                    let displayNameMap = {
                                        1: i18nMappingObj.enable,
                                        0: i18nMappingObj.disable
                                    };

                                    return displayNameMap?.[e.record?.StageFlag] || displayNameMap[0];
                                },
                                oncellbeginedit: function (e) {
                                    // 设置选项
                                    let options = [
                                        {
                                            value: 1,
                                            displayName: _this.i18nMappingObj.enable
                                        },
                                        {
                                            value: 0,
                                            displayName: _this.i18nMappingObj.disable
                                        }
                                    ];
                                    e.editor['load'](options);
                                }
                            },
                            options
                        );
                    };

                    // 里程碑
                    PlusProject.MilestoneColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'Milestone',
                                renderer(e) {
                                    let displayNameMap = {
                                        1: i18nMappingObj.enable,
                                        0: i18nMappingObj.disable
                                    };

                                    return displayNameMap?.[e.record?.Milestone] || displayNameMap[0];
                                }
                            },
                            $
                        );
                    };

                    // 生命周期状态
                    PlusProject.stateColumn = function (options) {
                        return mini.copyTo(
                            {
                                name: 'state',
                                header: i18nMappingObj.lifeCycleState,
                                field: 'state',
                                width: 100,
                                ...getComponentEditor(
                                    { componentName: 'ErdExSelect' },
                                    { valueField: 'name', displayField: 'displayName' }
                                )
                            },
                            options
                        );
                    };

                    // 参与人
                    PlusProject.ParticipantColumn = function (options) {
                        return mini.copyTo(
                            {
                                name: 'Participant',
                                header: i18nMappingObj.participant,
                                field: 'Participant',
                                ...getComponentEditor(
                                    { componentName: 'AllMemberSelect', multiSelect: true },
                                    {
                                        config: {
                                            handleRenderer(text) {
                                                return `<span class="ppm-gantt-ellipsis-span" title="${text}">${text}</span>`;
                                            }
                                        }
                                    }
                                )
                            },
                            options
                        );
                    };

                    // 责任人
                    PlusProject.PrincipalColumn = function (options) {
                        return mini.copyTo(
                            {
                                name: 'Principal',
                                header: i18nMappingObj.responsiblePerson, //责任人
                                field: 'Principal',
                                ...getComponentEditor(
                                    { componentName: 'FamMemberSelect', multiSelect: false },
                                    { filterByRole: true }
                                )
                            },
                            options
                        );
                    };

                    // 资源角色
                    PlusProject.AssignmentsColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'Assignments',
                                header: i18nMappingObj.resourceRole, //资源角色
                                field: 'Assignments',
                                ...getComponentEditor({ componentName: 'ProjectAssignmentsSelect' })
                            },
                            $
                        );
                    };
                    // 评审类型
                    PlusProject.reviewCategoryRefColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'reviewCategoryRef',
                                header: i18nMappingObj.reviewType, //
                                field: 'reviewCategoryRef',
                                ...getComponentEditor({ componentName: 'ProjectReviewCategoryRefSelect' })
                            },
                            $
                        );
                    };
                    // 评审点 reviewPointRef
                    PlusProject.reviewPointRefColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'reviewPointRef',
                                header: i18nMappingObj.reviewPoints, // 评审点
                                field: 'reviewPointRef',
                                ...getComponentEditor({ componentName: 'ProjectReviewPointRefSelect' })
                            },
                            $
                        );
                    };

                    // 计划集
                    PlusProject.collectRefColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'collectRef',
                                renderer: function (e) {
                                    let task = e.record || {};
                                    let { displayName, value } = task.collectRef || {};

                                    if (!displayName || !value) return '';
                                    let color = _this.getRandomColor(value.id);
                                    return `
                                        <span class="ppm-gantt-planSet-cell">
                                            <span style="background: ${color};"></span>
                                            ${displayName}
                                        </span>`;
                                }
                            },
                            $
                        );
                    };

                    // 是否可裁剪 scalable
                    PlusProject.scalableColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'scalable',
                                renderer: function (e) {
                                    let task = e.record || {};
                                    let booleanMap = {
                                        0: i18nMappingObj.disable,
                                        1: i18nMappingObj.enable
                                    };
                                    let scalable = task.scalable;
                                    return booleanMap[scalable] || '';
                                }
                            },
                            $
                        );
                    };

                    // 前置任务
                    const PredecessorLinkColumn = PlusProject.PredecessorLinkColumn;
                    PlusProject.PredecessorLinkColumn = function () {
                        const predecessorLinkColumn = new PredecessorLinkColumn();
                        return mini.copyTo(predecessorLinkColumn, {
                            placeholder:
                                '请按“编码类型+间隔天数”的形式设定前后置任务，存在多个任务时用英文“，”分隔。例：TASK-202312160011FS+1。',
                            renderer(e) {
                                // 实时编辑的
                                let value = JSON.parse(JSON.stringify(e.record.PredecessorLink));
                                // 非本计划集的
                                let notSelfTasks = (e.record.preTask || []).filter(
                                    (item) => !item.nowProjectFlag || !item.nowCollectFlag
                                );
                                // 属于本计划集，但还未加载出来的
                                let notLoadedTasks = (e.record.preTask || []).filter((item) => {
                                    if (item.nowCollectFlag) {
                                        if (!project.getTask(item.id)) {
                                            return true;
                                        } else {
                                            value = e.record.PredecessorLink.length
                                                ? e.record.PredecessorLink
                                                : e.record.copyPredecessorLink || [];
                                            e.record.PredecessorLink = e.record.PredecessorLink.length
                                                ? e.record.PredecessorLink
                                                : e.record.copyPredecessorLink || [];
                                            return false;
                                        }
                                    }
                                    // return item.nowCollectFlag && !project.getTask(item.id);
                                });
                                let names = [...value, ...notSelfTasks, ...notLoadedTasks]?.map((item) => {
                                    if (item.displayName) return item.displayName;
                                    let preTask = project.getTask(item.PredecessorUID);
                                    return preTask?.Name || '';
                                });
                                if (names.length < 1) return '';
                                else {
                                    if (_this.readOnly) {
                                        return `<span class="" title="${names.join(',')}">${names.join(',')}</span>`;
                                    } else {
                                        let extText = names.length > 1 ? `（+${names.length - 1}条）` : '';
                                        return `<span class="ppm-gantt-link-cell ppm-gantt-preTask-cell ppm-gantt-prevent" uid="${e.record.UID}">${names[0]}${extText}</span>`;
                                    }
                                }
                            }
                        });
                    };

                    // 进展（亮灯颜色） taskColor
                    PlusProject.taskColorColumn = function ($) {
                        return mini.copyTo(
                            {
                                name: 'taskColor',
                                field: 'taskColor',
                                renderer: _this.progressRenderer
                            },
                            $
                        );
                    };
                },
                // 进展（亮灯颜色）渲染
                progressRenderer(e) {
                    let record = e.record; // 行数据
                    // 亮灯颜色
                    let html = `<i class="mr-3 light" style="backGround-color:${record?.taskColor?.displayName || ''};" title="${record.Name}"></i>`;
                    // 任务临延期情况
                    html += record.taskColor?.value
                        ? `<span class="task-warning-label" style="color:${record?.taskColor?.displayName || ''};" >${record.taskColor?.value}</span>`
                        : '';
                    // 交付物情况
                    //过滤掉已删除的检查项
                    // record.checkLists = _.filter(record.checkLists, function(item){
                    //     return item.delFlag === '0';
                    // });
                    // var checkLists = record.taskCheckLists || record.checkLists || [];
                    // if (checkLists.length > 0) {
                    //     /*检查项总数以及检查项已完成数*/
                    //     var done = 0;
                    //     _.each(checkLists, function (d) {
                    //         if (d.state == '1') {
                    //             done += 1;
                    //         }
                    //     });
                    //     html += '<span title="交付物" ><i class="icon-list"></i>' + done + '/' + checkLists.length + '</span>';
                    // }
                    // erd-iconfont erd-icon-ppm-caijian
                    // html += '<span title="交付物" ><i class="erd-iconfont erd-icon-deliverable-file" style="margin-right: 0px;"></i>' + 2 + '/' + 4 + '</span>';
                    html +=
                        '<span class="mr-3" title="交付物" ><i class="erd-iconfont erd-icon-batching" style="margin-right: 0px;"></i>' +
                        record.taskColor?.label +
                        '</span>';
                    // 是否显示上传交付物
                    if (true && !this.readOnly) {
                        html += `<div class="${record.HasChangeTask ? 'events-none' : ''} mr-3 upload-deliverable-btn" title="上传交付物" uid="${e.record.UID}"><i class="erd-iconfont erd-icon-upload"></i></div>`;
                    }

                    return `<div class="progress">${html || ''}</div>`;
                },
                getCheckBoxHtml(state, taskUid = '') {
                    let checkedClass =
                        state === 'isChecked' ? 'is-checked' : state === 'isIndeterminate' ? 'is-indeterminate' : '';
                    return `
                        <div class="ppm-gantt-center-input">
                            <label class="el-checkbox ${checkedClass}" uid="${taskUid}">
                                <span class="el-checkbox__input ${checkedClass}">
                                    <span class="el-checkbox__inner"></span>
                                </span>
                            </label>
                        </div>
                    `;
                },
                setCheck($target, setChecked, setIndeterminate) {
                    if (setIndeterminate) {
                        $target.attr('class', 'el-checkbox is-indeterminate');
                        $target.find('.el-checkbox__input').attr('class', 'el-checkbox__input is-indeterminate');
                    } else if (setChecked) {
                        $target.attr('class', 'el-checkbox is-checked');
                        $target.find('.el-checkbox__input').attr('class', 'el-checkbox__input is-checked');
                    } else {
                        $target.attr('class', 'el-checkbox');
                        $target.find('.el-checkbox__input').attr('class', 'el-checkbox__input');
                    }

                    for (let i = 0; i < $target.length; i++) {
                        let $item = $($target[i]);
                        let uid = $item.attr('uid');
                        let task = uid && this.project.getTask(uid);
                        if (task) {
                            task.isChecked = setChecked;
                            this.selectedMap[task.UID] = task.isChecked;
                            this.selectedMap = JSON.parse(JSON.stringify(this.selectedMap));
                        }
                    }
                },
                // 勾选父级 同步勾选子集
                checkedParent: function (uid) {
                    const task = this.project.getTask(uid);
                    const isChecked = task?.isChecked || false;
                    const getAllData = (taskArr, arr = []) => {
                        taskArr.forEach((item) => {
                            arr.push(item);
                            if (item.children) {
                                getAllData(item.children, arr);
                            }
                        });
                        return arr;
                    };
                    const allData = getAllData([task]);
                    const subData = allData.filter((item) => item.UID != uid);
                    // 勾选子集
                    subData.forEach((item) => {
                        let $this = $(`.el-checkbox[uid="${item.UID}"]`);
                        this.setCheck($this, isChecked);
                        item.isChecked = isChecked;
                        this.selectedMap[item.UID] = isChecked;
                    });
                },
                // 升级计算
                upgradeCompute(tasks) {
                    let { project, projectOid } = this;
                    let action = new PlusProject.UpgradeTaskAction(project, tasks);
                    project.executeAction(action);
                    let params = {
                        action: 'UPGRADEBATCH',
                        taskLinkList: tasks.map((task) => {
                            let parentTask = (task.ParentTaskUID && project.getTask(task.ParentTaskUID)) || {
                                UID: projectOid,
                                StageFlag: 0,
                                Milestone: 0
                            };
                            return {
                                id: task.UID, //操作的任务OID
                                targetId: parentTask.UID, //目标Id 升级降级后 父节点OID (任务OID或者项目OID)
                                targetStageFlag: !!parentTask.StageFlag, //目标任务的是否阶段
                                targetMilestoneFlag: !!parentTask.Milestone, //目标任务是否里程碑
                                stageFlag: !!task.StageFlag, //当前任务是否阶段
                                miletoneFlag: !!task.Milestone //当前任务是否里程碑
                            };
                        })
                    };
                    this.computedByRemote(
                        params,
                        tasks.map((item) => item.UID)
                    );
                },
                // 降级计算
                degradeCompute(tasks) {
                    let { project } = this;
                    let action = new PlusProject.DowngradeTaskAction(project, tasks);
                    project.executeAction(action);
                    let params = {
                        action: 'DEGRADEBATCH',
                        taskLinkList: tasks.map((task) => {
                            let parentTask = project.getTask(task.ParentTaskUID);
                            return {
                                id: task.UID, //操作的任务OID
                                targetId: parentTask.UID, //目标Id 升级降级后 父节点OID (任务OID或者项目OID)
                                targetStageFlag: !!parentTask.StageFlag, //目标任务的是否阶段
                                targetMilestoneFlag: !!parentTask.Milestone, //目标任务是否里程碑
                                stageFlag: !!task.StageFlag, //当前任务是否阶段
                                miletoneFlag: !!task.Milestone //当前任务是否里程碑
                            };
                        })
                    };
                    this.computedByRemote(
                        params,
                        tasks.map((item) => item.UID)
                    );
                },
                // 时间计算
                timeComputed(task, { newValue, oldValue, field, doCompare = true }) {
                    let data = JSON.parse(JSON.stringify(task));
                    oldValue = oldValue === void 0 ? task[field] : oldValue;
                    data[field] = newValue;

                    let oldData = _.isDate(oldValue) ? dayjs(oldValue).format('YYYY-MM-DD') : oldValue;
                    let newData = _.isDate(newValue) ? dayjs(newValue).format('YYYY-MM-DD') : newValue;
                    if (doCompare && oldData === newData) return;
                    let params = {
                        action: 'TIME',
                        id: data.UID,
                        targetStartTime: (data.Start && dayjs(data.Start).format('YYYY-MM-DD')) || null,
                        targetEndTime: (data.Finish && dayjs(data.Finish).format('YYYY-MM-DD')) || null
                    };
                    // 修改的字段为'工期'时增加'targetDuration'参数
                    if (field == 'Duration') {
                        params.targetDuration = newValue;
                    }
                    this.computedByRemote(params, task.UID);
                },
                // 前置任务计算
                preTaskComputed(task, { oldValue, doCompare = true }, value) {
                    if (value === '') task.PredecessorLink.length = 0;
                    if (doCompare && JSON.stringify(oldValue) === JSON.stringify(task.PredecessorLink)) return;
                    let params = {
                        action: 'PREDECESSOR',
                        id: task.UID,
                        targetPreLink: task.PredecessorLink.map((item) => {
                            return {
                                taskId: task.UID, // 当前任务OID 无则不传
                                predecessorId: item.PredecessorUID, // 前置任务OID
                                type: ['FF', 'FS', 'SF', 'SS'][item.Type], // FF||FS||SF||SS 前置任务类型
                                delay: item.LinkLag // 延后时长
                            };
                        })
                    };

                    this.computedByRemote(params, task.UID);
                },
                // 调接口计算并更新
                computedByRemote(params, taskUids = '') {
                    let { project, postMessage } = this;

                    let ids = _.isArray(taskUids) ? taskUids : [taskUids || params.id];

                    postMessage({ name: 'setAttr', data: { attrName: 'loading', value: true } });

                    let resetTaskStatus = function (task) {
                        // 重置任务的指定字段修改状态
                        project.store.acceptRecordFields(task, [
                            'Start',
                            'Finish',
                            'PercentComplete',
                            'Duration',
                            'PredecessorLink'
                        ]);
                    };

                    this.$famHttp({
                        url: 'ppm/plan/v1/gantt/check',
                        method: 'POST',
                        errorMessage: false,
                        className: store.state.classNameMapping.project,
                        data: params
                    })
                        .then((resp) => {
                            // 更新数据
                            resp.data.forEach((item) => {
                                if (!item.flag) return;
                                // 更新任务
                                let task = project.getTask(item.id);
                                if (!task) return;
                                // 区分更新完成率与更新时间之后的操作
                                if (params.action == 'COMPLETIONRATE') {
                                    project.updateTask(task, {
                                        PercentComplete: item.completionRate || null
                                    });
                                } else {
                                    project.updateTask(task, {
                                        Start: item.startTime ? dayjs(item.startTime).toDate() : null,
                                        Finish: item.endTime
                                            ? dayjs(item.endTime.split(' ')[0] + ' 23:59:59').toDate()
                                            : null,
                                        PercentComplete: item.completionRate || task.PercentComplete,
                                        Duration: item?.duration?.toString() ? item.duration : task.Duration,
                                        taskColor: {
                                            displayName: item.color || task.displayName,
                                            value: item.colorRuleDays || task.value,
                                            label: task.taskColor.label
                                        }
                                    });
                                }

                                // 重置指定字段的修改状态
                                resetTaskStatus(task);
                            });

                            // 若接口没有返回更新数据，则更新当前任务状态
                            if (_.isEmpty(resp.data)) {
                                ids.forEach((id) => {
                                    let task = project.getTask(id);
                                    resetTaskStatus(task);
                                });
                            }
                        })
                        .catch((err) => {
                            // 校验不通过要重置数据，回退操作
                            project.undo();
                            project.allowOrderProject = false;

                            ids.forEach((id) => {
                                let task = project.getTask(id);
                                resetTaskStatus(task);
                            });
                            this.$message({
                                type: 'error',
                                message: err?.message,
                                duration: 14000
                            });
                        })
                        .finally(() => {
                            project.allowOrderProject = false;
                            postMessage({ name: 'setAttr', data: { attrName: 'loading', value: false } });
                        });
                },
                // 获取随机颜色
                getRandomColor(collectId) {
                    let { colorCache } = this;
                    if (colorCache[collectId]) return colorCache[collectId];
                    const colors = [
                        '#CF1322',
                        '#D4380D',
                        '#D46B08',
                        '#D48806',
                        '#D4B106',
                        '#7CB305',
                        '#2DA65C',
                        '#08979C',
                        '#096DD9',
                        '#1D39C4',
                        '#5524BF',
                        '#A63283'
                    ];

                    // 优先取未使用过的颜色
                    let usedColors = Object.values(colorCache);
                    let randomColors = colors.filter((item) => {
                        return usedColors.indexOf(item) < 0;
                    });
                    if (randomColors.length === 0) randomColors = colors;

                    let randomIndex = parseInt(Math.random() * randomColors.length);
                    colorCache[collectId] = randomColors[randomIndex];
                    return colorCache[collectId];
                },
                // 收起任务
                collapseTask(Tasks) {
                    let { collapseTask, project } = this;
                    Tasks.forEach((task) => {
                        if (task.isLeaf) return;
                        if (task.children && task.children.length > 0) {
                            collapseTask(task.children);
                        } else {
                            project.collapse(task);
                        }
                    });
                },
                singleSave(task) {
                    const { dateFields } = this;
                    let { keyAttrMap, containerOid } = window.getParentParams();
                    let attrRawList = [];

                    Object.keys(task).forEach((key) => {
                        let attrName = keyAttrMap[key],
                            value = task[key];

                        if (!attrName) return;
                        if (['UID', '_state'].includes(key)) return;
                        if (dateFields.includes(key)) value = value ? dayjs(value).format('YYYY-MM-DD') : value;
                        if (attrName === 'participant') {
                            attrRawList.push({
                                attrName,
                                value: value?.value?.split(',') || []
                            });
                        } else if (attrName === 'resAssignments') {
                            let valueStr = value
                                .map((val) => {
                                    return this.project.data.Resources.filter((item) => item.UID == val.ResourceUID)[0]
                                        ?.RoleCode;
                                })
                                .join(',');
                            attrRawList.push({
                                attrName,
                                value: valueStr
                            });
                        } else if (attrName === 'stageFlag') {
                            attrRawList.push({
                                attrName,
                                value: value ? true : false
                            });
                        } else if (attrName === 'reviewPointRef') {
                            attrRawList.push({
                                attrName,
                                value: value ? 'OR:' + value.value?.key + ':' + value.value?.id : ''
                            });
                        } else if (attrName === 'reviewCategoryRef') {
                            attrRawList.push({
                                attrName,
                                value: value ? 'OR:' + value.value?.key + ':' + value.value?.id : ''
                            });
                        } else {
                            attrRawList.push({
                                attrName,
                                value
                            });
                        }
                    });
                    let params = {
                        attrRawList,
                        className: store.state.classNameMapping.task,
                        containerRef: containerOid,
                        oid: task.UID,
                        customParam: 'singleEdit'
                    };

                    // 更新任务接口
                    return this.$famHttp({
                        url: '/ppm/update',
                        method: 'POST',
                        data: params
                    });
                },
                render(data) {
                    const { project, postMessage, readOnly } = this;
                    project.setStyle('width:100%;height:100%');
                    project.render(document.getElementById('ppm-gantt-content'));
                    project.loadData(data);
                    // this.project.allowOrderProject = true;
                    // this.project.orderProject();
                    // 禁用数据处理
                    // let task = project.getTask('OR:erd.cloud.ppm.plan.entity.Task:1676158583066124290')

                    // setTimeout(() => {
                    //     this.project.allowOrderProject = true;
                    //     this.project.orderProject();
                    // });
                    // 初始重置修改、编辑、新增状态
                    project.acceptChanges();
                    // 变更选择项目列表-只读
                    project.readOnly = readOnly;
                    postMessage({
                        name: 'afterRender'
                    });
                },
                postMessage(config = {}) {
                    window.parentPostMessage(config);
                },
                initProject() {
                    mini.parse();
                    this.project = new PlusProject();
                    this.mini = mini;
                    const { project } = this;
                    const _this = this;
                    project.select();
                    // project.setAllowUnselect(true);
                    project.allowOrderProject = false; //禁止任务排程算法
                    project.enableManualSchedule = true; //启用手动模式
                    project.allowSyncComplete = false; //禁用完成率自动计算
                    // project.enableActualState = true; //MSProject的实际状态处理逻辑
                    // project.enableHalfDay = true; //启用半天工期模式

                    // 客制化配置
                    project.customConfig = project.customConfig || {};
                    project.customConfig.setParentOnRestore = false; // 回退操作，不做父节点默认属性的回退处理
                    project.customConfig.allowCritical = true; // 开启关键路径计算
                    project.customError = function (err) {
                        _this.$message({
                            type: 'info',
                            message: err
                        });
                    };
                    project.setAllowUndo(true); //设置“撤销恢复”功能
                    project.setShowCriticalPath(false); //设置显示关键路径
                    project.setAllowResize(false); //关闭窗口缩放
                    project.setMultiSelect(false); //设置多选
                    project.setAllowDragDrop(true); //允许条形图拖拽
                    project.setShowGridLines(true); //设置条形图背景表格线
                    // 变更选择项目列表隐藏甘特图条形图
                    if (this.businessScene === 'changeSelectList') {
                        project.setShowGanttView(false);
                    }
                    // 为了适配自定义的多选列，需要客制化以下三个方法
                    // 1、客制化获取选择数据方法
                    this.project.getSelected = this.getSelected;

                    // 2、客制化删除任务方法
                    let removeTasks = this.project.removeTasks;
                    this.project.removeTasks = function () {
                        arguments[0] = JSON.parse(JSON.stringify(arguments[0]));
                        removeTasks.call(this, ...arguments);

                        // 维护selectedMap
                        Object.keys(_this.selectedMap).forEach((key) => {
                            if (!project.getTask(key)) delete _this.selectedMap[key];
                        });

                        _this.selectedMap = { ..._this.selectedMap };
                    };

                    // 3、客制化增加任务方法
                    let addTask = this.project.addTask;
                    this.project.addTask = function () {
                        addTask.call(this, ...arguments);

                        // 维护selectedMap
                        let taskUid = arguments[0]?.UID;
                        taskUid && (_this.selectedMap[taskUid] = false);
                    };
                },
                getSelected() {
                    let { allSelectedState, selectedMap, project } = this;
                    let result = [];
                    // 全选
                    if (allSelectedState === 'isChecked') {
                        result = project.getTaskList();
                    }
                    // 全不选
                    else if (!allSelectedState) {
                        result = [];
                    }
                    // 部分勾选
                    else {
                        Object.keys(selectedMap).forEach((key) => {
                            let taskData = project.getTask(key);
                            if (selectedMap[key] && taskData) {
                                result.push(taskData);
                            }
                        });
                    }

                    return result;
                },
                bindReviewPoint(type, e = {}) {
                    let review = ''
                    if (type == 'category') {
                        review = 'OR:erd.cloud.cbb.review.entity.ReviewCategory:' + e.value?.value?.id
                    } else {
                        review = 'OR:erd.cloud.cbb.review.entity.ReviewCategory:' + e.record?.reviewCategoryRef?.value?.id

                    }
                    let _this = this
                    // 评审类型与评审点联动
                    let project = this.project;
                    this.$famHttp({
                        url: '/element/reviewCategory/listTreeByOid',
                        method: 'GET',
                        className: 'erd.cloud.cbb.review.entity.ReviewCategory',
                        params: {
                            oid: review // 技术评审 OR:erd.cloud.cbb.review.entity.ReviewCategory:1729061908868800514
                        }
                    }).then((res) => {
                        this.reviewPointOptions = res.data.map((item) => ({
                            label: item.displayName,
                            value: item.oid
                        }));
                        // 设置选项
                        e.editor['load'](this.reviewPointOptions);
                        // 判断是编辑 评审类型 评审点
                        if (e.field == 'reviewCategoryRef') {
                            // 设置评审点默认值
                            let setDefaultReviewPointOptions = {};
                            if (this.reviewPointOptions.length) {
                                setDefaultReviewPointOptions = {
                                    value: {
                                        key: _this.reviewPointOptions[0].value.split(':')[1],
                                        id: _this.reviewPointOptions[0].value.split(':')[2]
                                    },
                                    displayName: this.reviewPointOptions[0].label,
                                    label: 'reviewPointRef'
                                };
                            } else {
                                setDefaultReviewPointOptions = '';
                            }
                            project.updateTask(e.task, { reviewPointRef: setDefaultReviewPointOptions });
                        }
                    });
                },
                bindRokey: function (initUsers = [], e = {}, roleCode) {
                    // 资源角色与责任人联动
                    let project = this.project;
                    this.$famHttp({
                        url: '/fam/team/getUsersByContainer',
                        cache: false,
                        async: false,
                        // className: store.state.classNameMapping.project,
                        data: {
                            containerOid: window.getParentParams().containerOid,
                            roleCode
                        }
                    }).then((resp) => {
                        let remoteUsers = resp.data || [];
                        // 更新甘特图基本人员信息
                        let Principals = e.source?.data?.Principals || [];
                        let PrincipalOids = Principals.map((item) => item.oid);
                        remoteUsers.forEach((item) => {
                            if (!PrincipalOids.includes(item.oid)) {
                                Principals.push({
                                    Department: '',
                                    Name: item.displayName,
                                    UID: item.oid
                                });
                            }
                        });
                        // 更新甘特图基本人员信息
                        if (e.source?.data?.Principals) {
                            e.source.data.Principals = Principals;
                        }

                        // 点击资源角色后根据资源角色和责任人联动
                        if (e.field === 'Assignments') {
                            // 获取当前责任人列的责任人
                            let currentUsers = e.task.Principal;
                            currentUsers =
                                typeof currentUsers == 'string' && currentUsers
                                    ? currentUsers.split(',')
                                    : currentUsers || [];

                            // 责任人列的责任人在所选的资源角色内
                            let remoteUserOids = remoteUsers.map((item) => item.oid);
                            let newUsers = [];
                            if (_.isObject(currentUsers)) {
                                currentUsers = [currentUsers];
                            }
                            currentUsers.forEach((item) => {
                                if (remoteUserOids.includes(item)) newUsers.push(item);
                            });
                            if (remoteUsers.length) {
                                let primarily = remoteUsers.find((item) => item.primarily);
                                let defUser = primarily?.oid || remoteUsers[0].oid;
                                project.updateTask(e.task, {
                                    Principal: newUsers.length > 0 ? newUsers.join(',') : defUser,
                                    Assignments: e.task.Assignments
                                });
                            } else {
                                project.updateTask(e.task, { Principal: '', Assignments: e.task.Assignments });
                            }
                        } else {
                            let PrincipalData = initUsers;
                            if (remoteUsers) {
                                PrincipalData = remoteUsers.map((item) => ({
                                    Department: '',
                                    Name: item.displayName,
                                    UID: item.oid
                                }));
                            }
                            // 设置选项
                            e.editor['load'](PrincipalData);
                        }
                    });
                },
                fetchHeaders() {
                    return this.$famHttp({
                        url: '/ppm/plan/v1/gantt/tasks/head',
                        className: store.state.classNameMapping.project,
                        data: {
                            TableKey: 'TaskGanttView'
                        }
                    });
                },
                setColumns(headers = []) {
                    let { getComponentEditor } = this;
                    let _this = this;
                    let columns = [
                        new PlusProject.CheckColumn(),
                        // new PlusProject.IDColumn(),
                        new PlusProject.OutlineNumberColumn(),
                        new PlusProject.IconColumn(),
                        new PlusProject.OperateColumn()
                    ];
                    headers.forEach((item) => {
                        let attrName = item.attrName;
                        let columnName = `${attrName}Column`;
                        if (!PlusProject[columnName]) {
                            // 自定义列
                            PlusProject[columnName] = function (options) {
                                return mini.copyTo(
                                    {
                                        name: attrName,
                                        header: item?.label,
                                        field: attrName,
                                        width: item.width,
                                        ...getComponentEditor(item),
                                        renderer(e) {
                                            const numberMap = {
                                                1: _this.i18nMappingObj.enable,
                                                0: _this.i18nMappingObj.disable
                                            };
                                            const booleanMap = {
                                                true: _this.i18nMappingObj.enable,
                                                false: _this.i18nMappingObj.disable
                                            };
                                            let value = e.value || e.record[item.attrName];
                                            // 类型值转换
                                            switch (typeof e.value) {
                                                case 'object':
                                                    if (e.value instanceof Date && !isNaN(e.value)) {
                                                        value = dayjs(value).format('YYYY-MM-DD HH:mm:ss');
                                                    }
                                                    break;
                                                case 'boolean':
                                                    value = booleanMap[value];
                                                    break;
                                                default:
                                                    break;
                                            }
                                            switch (item.componentName) {
                                                case 'FamBoolean':
                                                    value = numberMap[value];
                                                    break;
                                                default:
                                                    break;
                                            }
                                            // 特定字段值转换
                                            // switch (item.attrName) {
                                            //     case 'tmplTemplated':
                                            //         value = numberMap[value];
                                            //         break;
                                            //     default:
                                            //         break;
                                            // }
                                            return value?.displayName || value;
                                        }
                                    },
                                    options
                                );
                            };
                        } else {
                            // 已存在的标准列，调整label等属性
                            let defaultColumn = new PlusProject[columnName]();
                            PlusProject[columnName] = function () {
                                return mini.copyTo(defaultColumn, {
                                    header: item?.label,
                                    width: item.width,
                                    ...(item.isReadOnly
                                        ? {
                                            editor: {},
                                            oncellbeginedit: null,
                                            oncellcommitedit: null
                                        }
                                        : {})
                                });
                            };
                        }
                        columns.push(new PlusProject[columnName]());
                    });
                    if (_this.readOnly) {
                        columns = columns.filter((item) => item?.name !== 'operate');
                    }
                    this.project.setColumns(columns);
                },
                getComponentEditor(column, params = {}) {
                    if (column.isReadOnly) return {};
                    let _this = this;
                    let { bindRokey, $famHttp, bindReviewPoint } = this;
                    let componentName = column.componentName;
                    let nameMap = {
                        // 输入框
                        ErdInput: {
                            editor: {
                                type: 'textbox'
                            }
                        },
                        // 责任人组件
                        FamMemberSelect: {
                            editor: {
                                type: 'combobox',
                                valueField: 'UID', //  选项值字段
                                displayField: 'Name', // 选项显示名字段
                                multiSelect: column.multiSelect,
                                showCheckIcon: true,
                                allowInput: true
                            },
                            renderer: function (e) {
                                // 甘特图回显人员信息集合
                                let Principals = e?.source?.owner?.data?.Principals || [];
                                let PrincipalsMap = {};
                                Principals.forEach((item) => {
                                    PrincipalsMap[item.UID] = item;
                                });
                                let value = String(e.value?.value || e.value).split(',');
                                let result = [];
                                value.forEach((item) => {
                                    if (PrincipalsMap[item]) {
                                        result.push(PrincipalsMap[item].Name);
                                    }
                                });

                                let text = result.join(',');

                                if (params.config?.handleRenderer) {
                                    return params.config.handleRenderer(text, e);
                                } else {
                                    return text;
                                }
                            },
                            oncellbeginedit: function (e) {
                                let source = e.source,
                                    owner = source.owner,
                                    _ = owner.data.Principals || [];
                                let roleCode = '';

                                // 如果需要根据角色过滤人员选项，则先找到角色code
                                if (params?.filterByRole && e.record?.Assignments) {
                                    let Resources = e?.source?.owner?.data?.Resources || [];
                                    let Assignments = e.record?.Assignments;

                                    roleCode = Assignments?.map((item) => {
                                        let role = Resources.find((data) => data.UID === item.ResourceUID);
                                        return role.RoleCode;
                                    }).join(',');
                                } else if (!params.filterByRole) {
                                    roleCode = void 0;
                                }
                                setTimeout(() => {
                                    e.editor.setValue(typeof e.value === 'object' ? e.value.value : e.value);
                                    $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                }, 100);
                                // 调用人员查询接口并配置选项
                                bindRokey(_, e, roleCode);
                            },
                            ...(params.config || {})
                        },
                        // 下拉选择框
                        ErdExSelect: {
                            editor: {
                                type: 'combobox',
                                valueField: params.valueField || 'UID', //  选项值字段
                                displayField: params.displayField || 'Name', // 选项显示名字段
                                multiSelect: column.multiSelect,
                                showCheckIcon: true
                                // allowInput: true
                            },
                            renderer(e) {
                                return e.value?.displayName || e.value;
                            },
                            oncellbeginedit: function (e) {
                                // 设置选项
                                let options = e?.value?.values || e?.editor?.data || [];
                                e.editor['load'](options);
                            },
                            oncellcommitedit(e) {
                                // 数据格式处理
                                e.text &&
                                    (e.value = {
                                        displayName: e.text,
                                        value: e.value,
                                        values: e.editor?.data
                                    });
                            }
                        },
                        // 参与人组件
                        AllMemberSelect: {
                            editor: {
                                type: 'combobox',
                                valueField: 'UID', //  选项值字段
                                displayField: 'Name', // 选项显示名字段
                                showCheckIcon: true,
                                allowInput: true,
                                multiSelect: true
                            },
                            renderer(e) {
                                return e.value?.displayName || e.value;
                            },
                            oncellbeginedit(e) {
                                // 设置初始输入框内容，选项
                                let $input = $(e.editor['_textEl']);
                                let initName = e.value?.displayName || e.value;
                                let initOptions = [
                                    {
                                        UID: e.value?.value || e.value,
                                        Name: initName
                                    }
                                ];
                                initName && e.editor['load'](e.value.values || initOptions);

                                // 展开下拉
                                setTimeout(() => {
                                    $input.val(initName);
                                    $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                }, 100);

                                // 搜索处理
                                let handleSearch = _.debounce(function () {
                                    let keywords = $(this).val();
                                    $famHttp({
                                        url: 'fam/team/getUsersByContainer',
                                        cache: false,
                                        async: false,
                                        data: {
                                            containerOid: window.getParentParams().containerOid,
                                            roleCode: '',
                                            getAllUser: true
                                        }
                                    }).then((resp) => {
                                        if (resp?.code === '200') {
                                            let userOptions = (resp?.data || []).map((item) => {
                                                return {
                                                    UID: item.oid,
                                                    Name: item.displayName
                                                };
                                            });

                                            e.editor['load'](userOptions);

                                            // 重新展开下拉，避免下拉渲染高度问题
                                            $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                            $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                        }
                                    });
                                }, 300);

                                // 输入监听
                                $input.off().on({
                                    input(e) {
                                        if (e.target.needPrevent) return;
                                        handleSearch.call(this);
                                    },
                                    compositionstart(e) {
                                        e.target.needPrevent = true;
                                    },
                                    focus(e) {
                                        e.target.needPrevent = true;
                                        handleSearch.call(this);
                                    },
                                    compositionend(e) {
                                        e.target.needPrevent = false;
                                        handleSearch.call(this);
                                    }
                                });
                            },
                            oncellcommitedit(e) {
                                // 数据格式处理
                                e.text &&
                                    (e.value = {
                                        displayName: e.text,
                                        value: e.value?.value || e.value,
                                        values: e.editor?.data
                                    });
                            }
                        },
                        // 评审类型
                        ProjectReviewCategoryRefSelect: {
                            editor: {
                                type: 'combobox',
                                // valueField: params.valueField || 'value', //  选项值字段
                                // displayField: params.displayField || 'displayName', // 选项显示名字段
                                // valueField: 'UID', //  选项值字段
                                // displayField: 'Name', // 选项显示名字段
                                valueField: 'value', //  选项值字段
                                displayField: 'label', // 选项显示名字段
                                multiSelect: false,
                                showCheckIcon: true,
                                allowInput: true
                            },
                            renderer: function (e) {
                                return e.value.displayName;
                            },
                            oncellbeginedit: function (e) {
                                let $input = $(e.editor['_textEl']);
                                let initName = _this.reviewCategoryList.find((resource) => {
                                    return resource.value.split(':')[2] == e.value?.value.id;
                                });
                                initName = initName.label;
                                e.editor['load'](_this.reviewCategoryList);
                                // 展开下拉
                                setTimeout(() => {
                                    $input.val(initName);
                                    $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                }, 100);
                            },
                            oncellcommitedit(e) {
                                let id = typeof e.value == 'object' ? e.value?.value.id : e.value.split(':')[2];
                                let key = typeof e.value == 'object' ? e.value?.value.key : e.value.split(':')[1];
                                // 数据格式处理
                                e.text &&
                                    (e.value = {
                                        displayName: e.text,
                                        label: e.field,
                                        value: {
                                            id,
                                            key
                                        }
                                    });
                                bindReviewPoint('category', e)
                            }
                        },
                        // 评审点
                        ProjectReviewPointRefSelect: {
                            editor: {
                                type: 'combobox',
                                valueField: 'value',
                                displayField: 'label',
                                multiSelect: false,
                                showCheckIcon: true,
                                allowInput: true
                            },
                            renderer: function (e) {
                                return e.value.displayName;
                            },
                            oncellbeginedit: function (e) {
                                // 当前的评审类型
                                e.text &&
                                    (e.value = {
                                        displayName: e.text,
                                        label: e.field,
                                        value: {
                                            id,
                                            key
                                        }
                                    });
                                bindReviewPoint('point', e)
                            },
                            oncellcommitedit(e) {
                                // 数据格式处理
                                e.text &&
                                    (e.value = {
                                        displayName: e.text,
                                        label: e.field,
                                        value: {
                                            id: e.value?.split(':')[2],
                                            key: e.value?.split(':')[1]
                                        }
                                    });
                            }
                        },
                        // 资源角色
                        ProjectAssignmentsSelect: {
                            editor: {
                                type: 'combobox',
                                valueField: 'UID',
                                displayField: 'Name',
                                multiSelect: false,
                                showCheckIcon: true,
                                allowInput: true
                            },
                            renderer: function (e) {
                                let Resources = e.source.owner.data.Resources || [];
                                let ResourcesMap = {};
                                Resources.forEach((item) => {
                                    ResourcesMap[item.UID] = item;
                                });

                                let result = [];
                                let Assignments = mini.isArray(e.value)
                                    ? e.value
                                    : (e.value && e.value?.split(',')) || [];

                                Assignments.forEach((item) => {
                                    let ResourceUID = item.ResourceUID;
                                    if (ResourcesMap[ResourceUID]) {
                                        result.push(ResourcesMap[ResourceUID].Name);
                                    } else {
                                        result.push(ResourceUID);
                                    }
                                });
                                return result.join(',');
                            },
                            oncellbeginedit: function (e) {
                                let Resources = e?.source?.owner?.data?.Resources || [];
                                e.editor['load'](Resources);
                                // 展开下拉
                                setTimeout(() => {
                                    e.editor.setValue(e.value[0]?.ResourceUID);
                                    $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                }, 100);
                            },
                            oncellcommitedit(e) {
                                // 数据格式处理
                                let task = e.record;
                                let value = mini.isArray(e.value) ? e.value : (e.value && e.value.split(',')) || [];
                                e.value = value.map((item) => ({
                                    TaskUID: task.UID,
                                    ResourceUID: _.isObject(item) ? item?.ResourceUID : item
                                }));
                                let roleCode = e.value.map((item) => {
                                    let role = e.editor.data.find((data) => data.UID === item.ResourceUID);
                                    return role?.RoleCode;
                                });
                                bindRokey(null, e, roleCode.join(','));
                            }
                        },
                        // 布尔组件
                        FamBoolean: {
                            editor: {
                                type: 'combobox',
                                valueField: params.valueField || 'value', //  选项值字段
                                displayField: params.displayField || 'displayName', // 选项显示名字段
                                multiSelect: false,
                                showCheckIcon: true
                            },
                            renderer(e) {
                                return e.value?.displayName || e.value;
                            },
                            oncellbeginedit: function (e) {
                                // 设置选项
                                let options = [
                                    {
                                        value: 1,
                                        displayName: _this.i18nMappingObj.enable
                                    },
                                    {
                                        value: 0,
                                        displayName: _this.i18nMappingObj.disable
                                    }
                                ];
                                e.editor['load'](options);
                            },
                            oncellcommitedit() {
                                // 数据格式处理
                                // e.record[e.field] = e.value;
                                // e.text &&
                                //     (e.value = {
                                //         displayName: e.text,
                                //         value: e.value,
                                //         values: e.editor?.data
                                //     });
                            }
                        },
                        // 计数器
                        ErdInputNumber: {
                            editor: {
                                type: 'spinner',
                                minValue: 0,
                                maxValue: 1000,
                                decimalPlaces: 1
                            }
                        },
                        // 数据字典
                        FamDict: {
                            editor: {
                                type: 'combobox',
                                valueField: params.valueField || 'value', //  选项值字段
                                displayField: params.displayField || 'displayName', // 选项显示名字段
                                multiSelect: column.multiSelect,
                                showCheckIcon: true
                                // allowInput: true
                            },
                            renderer(e) {
                                return e.value?.displayName || e.value;
                            },
                            oncellbeginedit: function (e) {
                                // 设置选项
                                let $input = $(e.editor['_textEl']);
                                let options = column?.values || [];
                                let initName = options.find((option) => {
                                    return option.value == e.value;
                                })?.displayName;
                                e.editor['load'](options);
                                // 展开下拉
                                setTimeout(() => {
                                    $input.val(initName);
                                    $(e.editor.el).find('.mini-buttonedit-button').trigger('click');
                                }, 100);
                            },
                            oncellcommitedit(e) {
                                // 数据格式处理
                                e.text &&
                                    (e.value = {
                                        displayName: e.text,
                                        value: e.value,
                                        values: e.editor?.data
                                    });
                            }
                        }
                    };

                    if (column.values && !nameMap[componentName]) {
                        componentName = 'ErdExSelect';
                    }
                    return nameMap[componentName] || nameMap['ErdInput'];
                },
                setBlur() {
                    $('#ppm-gantt-set-blur').trigger('mousedown');
                    this.project.deselectAll();
                }
            }
        }).$mount(document.getElementById('ppm-gantt-content'));

        window.$message = window.ganttVue.$message;
    });
}

init();
