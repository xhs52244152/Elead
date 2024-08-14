
PlusProject.TableMenu = PlusProject.ContextMenu.extend({


    constructor: function (project, options) {

        PlusProject.ContextMenu.call(this, project, options);

        //var menuItems = this.createMenuItems();
        //this.setItems(menuItems);

        this.goto = this.getByName("goto");
        this.zoomIn = this.getByName("zoomin");
        this.zoomOut = this.getByName("zoomout");
        this.upgrade = this.getByName("upgrade");
        this.downgrade = this.getByName("downgrade");
        this.add = this.getByName("add");
        this.edit = this.getByName("edit");
        this.remove = this.getByName("remove");

        this.taskTemplate = this.getByName("taskTemplate");
        this.assigmnet = this.getByName("assigmnet");


        if (!window.PlusProject && !PlusProject.CreateTaskTemplateWindow) {
            this.taskTemplate.hide();
        }

        this.goto.on("click", this.__OnGoto, this);
        this.zoomIn.on("click", this.__OnZoomIn, this);
        this.zoomOut.on("click", this.__OnZoomOut, this);
        this.upgrade.on("click", this.__OnUpgrade, this);
        this.downgrade.on("click", this.__OnDowngrade, this);
        this.add.on("click", this.__OnAdd, this);
        this.edit.on("click", this.__OnEdit, this);
        this.remove.on("click", this.__OnRemove, this);
    },

    createMenuItems: function () {
        var items = [
            { type: "menuitem", iconCls: "icon-goto", text: mini.Gantt.Goto_Text, name: "goto" },
            '-',
            { type: "menuitem", iconCls: "icon-upgrade", text: mini.Gantt.UpGrade_Text, name: "upgrade" },
            { type: "menuitem", iconCls: "icon-downgrade", text: mini.Gantt.DownGrade_Text, name: "downgrade" },
            '-',
            {
                type: "menuitem", iconCls: "icon-add", text: mini.Gantt.Add_Text, name: "add", _hideOnClick: true,
                //                items: [
                //                    { iconCls: 'icon-new', text: '空白任务', onclick: this.__OnAdd.bind(this) },
                //                //                    { iconCls: 'mini-gantt-icon-summary', text: '摘要任务', onclick: this.onAddSummary.bind(this) },
                //                //                    { iconCls: 'mini-gantt-icon-milestone', text: '里程碑', onclick: this.onAddMilestone.bind(this) },
                //                    {iconCls: 'icon-reload', text: '周期任务', onclick: this.onAddRecurring.bind(this) },
                //                //                    { iconCls: 'icon-edit', text: '打开任务模板' }
                //                ]
            },
            { type: "menuitem", iconCls: "icon-edit", text: mini.Gantt.Edit_Text, name: "edit" },
            { type: "menuitem", iconCls: "icon-remove", text: mini.Gantt.Remove_Text, name: "remove" },
            '-',
            {
                text: '任务模板', name: 'taskTemplate',
                items: [
                    { iconCls: 'icon-add', text: '插入任务模板', onclick: this.onInsertTemplate.bind(this) },
                    { iconCls: 'icon-addnew', text: '创建任务模板', onclick: this.onCreateTemplate.bind(this) },
                    //                    { iconCls: 'icon-edit', text: '打开任务模板' }
                ]
            },

            //            '-',            
            //            { iconCls: 'icon-find', text: '查找替换', onClick: this.onFindReplaceClick.bind(this) },          
            '-',
            { iconCls: 'icon-gantt-assign', text: '资源分配', name: 'assigmnet', onClick: this.onAssignClick.bind(this) },

            { visible: false, type: "menuitem", iconCls: "icon-zoomin", text: mini.Gantt.ZoomIn_Text, name: "zoomin" },
            { visible: false, type: "menuitem", iconCls: "icon-zoomout", text: mini.Gantt.ZoomOut_Text, name: "zoomout" },
        ];
        return items;
    },

    onAddSummary: function (e) {
    },

    onAddMilestone: function (e) {
    },

    onAddRecurring: function (e) {
        alert("周期任务");
    },

    onFindReplaceClick: function (e) {
        var win = new PlusProject.FindReplaceWindow({
            closeAction: 'destroy'
        });
        win.project = this.project;
        win.setData();
        win.show();
    },

    onAssignClick: function (e) {
        var win = ShowTaskWindow(this.project);
        win.setActiveTab('res');
    },
    __OnGoto: function (e) {
        var gantt = this.owner;
        var task = gantt.getSelected();
        if (task) {
            gantt.scrollIntoView(task);
        }
    },
    __OnZoomIn: function (e) {
        var gantt = this.owner;
        gantt.zoomIn();
    },
    __OnZoomOut: function (e) {
        var gantt = this.owner;
        gantt.zoomOut();
    },
    __OnUpgrade: function (e) {
        var gantt = this.owner;
        var tasks = gantt.getSelecteds();
        if (tasks.length > 0) {
            var project = gantt;

            var action = new PlusProject.UpgradeTaskAction(project, tasks);
            project.executeAction(action);

            //            if (project.undoManager) {
            //                var action = new PlusProject.UpgradeTaskAction(project, task);
            //                project.undoManager.execute(action);
            //            } else {
            //                project.upgradeTask(task);
            //            }
        }
    },
    __OnDowngrade: function (e) {
        var gantt = this.owner;
        var tasks = gantt.getSelecteds();
        if (tasks.length > 0) {
            //            gantt.downgradeTask(task);
            var project = gantt;

            var action = new PlusProject.DowngradeTaskAction(project, tasks);
            project.executeAction(action);

            //            if (project.undoManager) {
            //                var action = new PlusProject.DowngradeTaskAction(project, task);
            //                project.undoManager.execute(action);
            //            } else {
            //                project.downgradeTask(task);
            //            }
        }
    },
    __OnAdd: function (e) {
        var gantt = this.owner;
        var targetTask = gantt.getSelected();
        var task = gantt.newTask();

        //        task.Name = "ttt";
        //        task.Start = null;
        //        task.Finish = null;
        //task.Duration = 0;

        //加到选中任务之前
        //gantt.addTask(task, "before", targetTask);

        var action = 'before';

        var project = gantt;

        var action = new PlusProject.InsertTaskAction(project, task, action, targetTask);
        project.executeAction(action);

        //        if (project.undoManager) {
        //            var action = new PlusProject.InsertTaskAction(project, task, action, targetTask);
        //            project.undoManager.execute(action);
        //        } else {
        //            project.addTask(task, action, targetTask);
        //        }

        //加到子任务
        //gantt.addTask(task, "append", targetTask);

        this.hide();
    },
    __OnEdit: function (e) {
        var gantt = this.owner;
        var task = gantt.getSelected();
        if (task) {
            ShowTaskWindow(gantt);
        }
    },
    __OnRemove: function (e) {
        var gantt = this.owner;

        var tasks = gantt.getSelecteds();
        if (tasks.length > 0) {

            //gantt.removeTask(task);
            var project = gantt;

            var action = new PlusProject.RemoveTaskAction(project, tasks);
            project.executeAction(action);

            //            if (project.undoManager) {
            //                var action = new PlusProject.RemoveTaskAction(project, task);
            //                project.undoManager.execute(action);
            //            } else {
            //                if (confirm("确定删除任务 \"" + task.Name + "\" ？")) {
            //                    project.removeTask(task);
            //                }
            //            }
        } else {
            alert("请选择要删除的任务");
        }
    },

    getContextMenuTargetEl: function () {
        return this.project.tableView.getBodyEl();
    },

    onInsertTemplate: function (e) {
        var win = new PlusProject.TaskTemplateWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    onCreateTemplate: function (e) {
        var win = new PlusProject.CreateTaskTemplateWindow({
            project: this.project
        });
        win.setData();
        win.show();
    },

    beforeOpen: function (e) {
        var project = this.project;

        var action = project.store.isGrouped() ? "disable" : "enable";

        this.upgrade[action]();
        this.downgrade[action]();
        this.add[action]();
        this.taskTemplate[action]();

        var task = project.getSelected();
        var action = (task && project.store.isGroupItem(task)) ? "disable" : "enable";

        this.edit[action]();
        this.remove[action]();
        this.assigmnet[action]();

        if (task == project.store.root) e.cancel = true;
    }
});

var ProjectMenu = PlusProject.TableMenu.extend({
    
});














