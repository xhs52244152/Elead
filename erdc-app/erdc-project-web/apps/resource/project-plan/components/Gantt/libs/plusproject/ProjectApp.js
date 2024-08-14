var ToolbarTemplate = mini.__getTemplate(bootPATH + "plusproject/Toolbar.html");

var ProjectApp = mini.Panel.extend({

    props: {
        allowUndo: true,
        showHeader: false,
        showToolbar: true,
        borderStyle: 'border:0',
        bodyStyle: "padding:0px",
        toolbarStyle: "border-bottom:0",
        width: "auto",
        height: "100%",
        toolbar: ToolbarTemplate
    },

    constructor: function (config) {
        ProjectApp.base.call(this, config);

        this.initProject();
        this.initColumns();
        this.initMenu();
    },

    initProject: function () {
        this.project = new PlusProject();
        this.project.setStyle("width:100%;height:100%;");
        $(this.bodyEl).append(this.project.el);        

        var project = this.project;

        //project.allowOrderProject = false;        //禁止任务排程算法
        project.enableManualSchedule = true;        //启用手动模式
        project.enableActualState = true;           //MSProject的实际状态处理逻辑
        project.enableHalfDay = true;               //启用半天工期模式

        //project.undoMaxLength = 50;
        project.setAllowUndo(this.allowUndo);       //设置“撤销恢复”功能
        project.setShowCriticalPath(true);          //设置显示关键路径
        project.setAllowResize(false);
        project.setMultiSelect(true);               //设置多选

        //project.enableTaskWorkWithDuration = false; //禁止任务的工时与工期联动

        this.refreshButtons();
        project.on('undochange', this.refreshButtons, this);

        project.on('beforelinkcreate', function (e) {
            e.cancel = true;
            var predecessorTask = project.getTask(e.link.PredecessorUID);
            var task = project.getTask(e.link.TaskUID);
            var prevLink = project.getPredecessorLink(task, predecessorTask);
            if (!prevLink) {
                var links = (task.PredecessorLink || []).clone();
                links.push(e.link);
                var action = new PlusProject.UpdateTaskAction(project, task, 'PredecessorLink', links);
                project.executeAction(action);
            }
        });

        project.on('beforelinkremove', function (e) {
            e.cancel = true;
            var win = new PlusProject.PredecessorLinkWindow({
                closeAction: 'destroy'
            });
            win.project = project;
            win.setData(e.link);
            win.show();
        });

        project.tableView.on("refresh", this.refreshButtons, this);
    },

    initColumns: function () {
        var project = this.project;

        var columns = [
            new PlusProject.IDColumn(),
            new PlusProject.StatusColumn(),
            new PlusProject.ManualColumn(),
            new PlusProject.NameColumn(),
            new PlusProject.PredecessorLinkColumn(),
            new PlusProject.WorkColumn(),
            new PlusProject.DurationColumn(),
            new PlusProject.StartColumn(),
            new PlusProject.FinishColumn(),
            new PlusProject.PercentCompleteColumn(),
            new PlusProject.ActualStartColumn(),
            new PlusProject.ActualFinishColumn(),
            new PlusProject.EarlyStartColumn(),
            new PlusProject.EarlyFinishColumn(),
            new PlusProject.LateStartColumn(),
            new PlusProject.LateFinishColumn(),
            new PlusProject.TotalSlackColumn(),
            new PlusProject.CriticalColumn(),            
            new PlusProject.DepartmentColumn(),
            new PlusProject.PrincipalColumn(),
            new PlusProject.AssignmentsColumn()
        ];

        project.setColumns(columns);
    },

    initTimeScales: function () {
        this.project.setTopTimeScale('week');
        this.project.setBottomTimeScale('day');
    },

    initMenu: function () {
        var project = this.project;
        this.tableMenu = new PlusProject.TableMenu(project);
        this.tableHeaderMenu = new PlusProject.TableHeaderMenu(project);
        this.ganttMenu = new PlusProject.GanttMenu(project);
        this.ganttHeaderMenu = new PlusProject.GanttHeaderMenu(project);
        this.ganttBarMenu = new PlusProject.GanttBarMenu(project);
    },

    //////////////////////////////////////////////////////////////
    refreshButtons: function () {
        var project = this.project;
        this.refs.undo.setEnabled(project.canUndo());
        this.refs.redo.setEnabled(project.canRedo());

        var saveButton = this.refs.save;
        saveButton.refs.button.setEnabled(project.isDataChanged());

        var saveItem = saveButton.refs.arrow.menu.items[0];
        saveItem.setEnabled(project.isDataChanged());
    },

    execUndo: function () {
        this.project.undo();
    },

    execRedo: function () {
        this.project.redo();
    },

    onAddTask: function () {
        var project = this.project;
        var targetTask = project.getSelected();

        var newTask = project.newTask();
        newTask.Name = '';

        var action = new PlusProject.InsertTaskAction(project, newTask, 'before', targetTask);
        project.executeAction(action);
    },

    onEditTask: function () {
        var project = this.project;
        var item = project.getSelected();
        if (item == project.tasks.root) return
        ShowTaskWindow(project);
    },

    onRemoveTask: function () {
        var project = this.project;
        var items = project.getSelecteds();
        if (items.length == 0) return;

        var action = new PlusProject.RemoveTaskAction(project, items);
        project.executeAction(action);
    },

    onUpgradeTask: function () {
        var project = this.project;
        var tasks = project.getSelecteds();
        if (tasks.length > 0) {
            var action = new PlusProject.UpgradeTaskAction(project, tasks);
            project.executeAction(action);
        }
    },

    onDowngradeTask: function () {
        var project = this.project;
        var tasks = project.getSelecteds();
        if (tasks.length > 0) {
            var action = new PlusProject.DowngradeTaskAction(project, tasks);
            project.executeAction(action);
        }
    },

    saveProject: function () {
        PlusProject.api.saveProject(this.project);
    },

    saveAsTemplate: function () {
        var project = this.project;
        var data = project.data;

        var name = data.Name + ' - ' + mini.formatDate(new Date(), 'yyyy-MM-dd');

        var template = {
            name: name,
            type: 1,                //1 项目模板, 2任务模板
            data: data
        }

        project.mask('另存为项目模板');

        PlusProject.api.saveTemplate(template, function (success) {
            if (success) {
                alert("项目模板 “" + name + "” 创建成功");
            }
            project.unmask();
        });
    },

    trackProject: function () {
        TrackProject(this.project);
    },

    showProjectListWindow: function () {
        var win = new PlusProject.ProjectListWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showProjectTemplateWindow: function () {
        var win = new PlusProject.ProjectTemplateWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showTaskTemplateWindow: function () {
        var win = new PlusProject.TaskTemplateWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showNewProjectWindow: function () {
        var project = this.project;

        function fn() {
            var newProject = new PlusProject();

            var win = new PlusProject.ProjectWindow({
                title: '新建项目',
                mode: 'new',
                project: newProject,
                closeHandler: function (action) {
                    if (action == 'ok') {
                        var data = this.getData();
                        var dataProject = mini.clone(newProject.data);
                        $.extend(dataProject, data);
                        project.loadData(dataProject);
                        project.lastScheduleDate = new Date(new Date().getTime() + 1);
                    }
                }
            });
            win.setData();
            win.show();
        }

        if (project.isDataChanged()) {
            if (confirm("是否保存当前项目？")) {
                PlusProject.api.saveProject(project, fn);
            } else {
                fn();
            }
        } else {
            fn();
        }
    },

    showNewFromTemplateWindow: function () {
        var project = this.project;

        function fn() {
            var win = new PlusProject.ProjectTemplateWindow({
                project: project
            });
            win.setData();
            win.show();
        }

        if (project.isDataChanged()) {
            if (confirm("是否保存当前项目？")) {
                PlusProject.api.saveProject(project, fn);
            } else {
                fn();
            }
        } else {
            fn();
        }
    },

    showProjectWindow: function () {
        var win = new PlusProject.ProjectWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showCalendarWindow: function () {
        ShowCalendarWindow(this.project);
    },

    showResourcesWindow: function () {
        ShowResourcesWindow(this.project);
    },

    showMoveProjectWindow: function () {
        var win = new PlusProject.MoveProjectWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showImportProjectWindow: function () {
        var win = new PlusProject.ImportProjectWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showExportProjectWindow: function () {
        var win = new PlusProject.ExportProjectWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    showPrintProjectWindow: function () {
        var win = new PlusProject.PrintProjectWindow({
            project: this.project
        });
        win.setData();
        win.show();
    }

});


