var TaskWindowTemplate = mini.__getTemplate(bootPATH + "plusproject/window/TaskWindow.html");

PlusProject.TaskWindow = PlusProject.Window.extend({
    props: {
        width: 600,
        height: 350,
        showFooter: true,
        showModal: true,
        content: TaskWindowTemplate
    },

    setData: function (task) {
        this.task = task;

        //        var tab = this.refs.tabs.getTab("adv");
        //        tabs.updateTab(tab, { visible: false });  //可根据用户权限和操作场景，动态显示和隐藏tab
        //        
        //        this.callback = callback;

        //        this.project = project;
        var project = this.project;
        this.dataProject = project.getData();

        var dateFormat = project.enableHalfDay ? project.dateFormatHalfDay : project.dateFormat;
        this.refs.start.format = dateFormat;
        this.refs.finish.format = dateFormat;
        this.refs.constraintDate.format = dateFormat;

        this.refs.hideBar.setValue(task.HideBar);
        this.refs.rollup.setValue(task.Rollup);

        //部门、负责人
        this.refs.department.setData(this.getDepartments());
        this.refs.department.setValue(task.Department);
        this.refs.principal.setData(this.getPrincipalsByDepartment(this.refs.department.getValue()));
        this.refs.principal.setValue(task.Principal);

        //常规
        this.refs.name.setValue(task.Name);
        this.refs.percentComplete.setValue(task.PercentComplete);
        this.refs.work.setValue(task.Work);

        //日期
        //        this.dateChangedAction = "no";
        this.refs.duration.setValue(task.Duration);
        this.refs.duration.setDecimalPlaces(project.enableHalfDay ? 1 : 0);
        this.refs.start.setValue(task.Start);
        this.refs.finish.setValue(task.Finish);
        this.refs.actualStart.setValue(task.ActualStart);
        this.refs.actualFinish.setValue(task.ActualFinish);
        //        this.dateChangedAction = null;

        //高级
        var ctypes = mini.Gantt.ConstraintType.clone();
        if (task.Summary) {
            for (var i = ctypes.length - 1; i >= 0; i--) {
                var ct = ctypes[i];
                if (ct.ID != 0 && ct.ID != 4 && ct.ID != 7) {
                    ctypes.removeAt(i);
                }
            }
        }
        this.refs.constraintType.setData(ctypes);
        this.refs.constraintType.setValue(task.ConstraintType);
        this.refs.constraintDate.setValue(task.ConstraintDate);
        this.refs.fixedDate.setChecked(task.FixedDate == 1);
        this.refs.milestone.setChecked(task.Milestone == 1);
        this.refs.wbs.setValue(task.WBS);

        //前置任务、资源分配
        this.refs.predecessorLink.setData(mini.clone(task.PredecessorLink) || []);

        var me = this;
        var ass = mini.clone(task.Assignments) || [];
        //        $.each(ass, function (index, o) {
        //            var re = me.getResourceByUID(o.ResourceUID);
        //            if(re && re.) o.Cost = re.
        //        });
        this.refs.assignments.setData(ass);

        this.refs.notes.setValue(task.Notes);

        //保存初始化的任务开始日期(点击"确定", 判断此值是否变化, 如果变化, 且没有设置任务限制, 则自动设置任务限制)
        this.__TaskStart = task.Start ? new Date(task.Start.getTime()) : null;
        this.__TaskSummary = task.Summary == 1;

        //设置日期选择框的显示日期为项目开始日期，方便操作
        var startDate = this.dataProject.StartDate;
        this.refs.start.setViewDate(startDate);
        this.refs.finish.setViewDate(startDate);
        this.refs.constraintDate.setViewDate(startDate);
        this.refs.actualStart.setViewDate(startDate);
        this.refs.actualFinish.setViewDate(startDate);

        //

        this.refs.deadline.setValue(task.Deadline);
        this.refs.deadline.setViewDate(startDate);
        this.refs.taskType.setData(PlusProject.TaskType);
        this.refs.taskType.setValue(task.Type);
        this.refs.effortDriven.setValue(task.EffortDriven);
        this.refs.ignoreResourceCalendar.setValue(task.IgnoreResourceCalendar);
        this.refs.earnedValueMethod.setValue(task.EarnedValueMethod);

        var calendars = mini.clone(project.data.Calendars);
        calendars.unshift({ UID: -1, Name: "无" });
        this.refs.calendar.setData(calendars);
        this.refs.calendar.setValue(task.CalendarUID);

        this.refs.fs_actualdate[0].style.display = project.enableActualState ? 'none' : ''

        //控件可操作性处理  
        this.editEnabled();
    },

    getAssignments: function () {
        var Assignments = mini.clone(this.refs.assignments.getData());

        //清理重复分配
        var assHash = {};
        for (var i = Assignments.length - 1; i >= 0; i--) {
            var item = Assignments[i];
            if (!item.ResourceUID || assHash[item.ResourceUID]) {
                Assignments.removeAt(i);
                continue;
            }
            assHash[item.ResourceUID] = item;
        }
        return Assignments;
    },
    getData: function () {

        var task = {

            Deadline: this.refs.deadline.getValue(),
            Type: this.refs.taskType.getValue(),
            EffortDriven: this.refs.effortDriven.getValue(),
            IgnoreResourceCalendar: this.refs.ignoreResourceCalendar.getChecked() ? 1 : 0,
            CalendarUID: this.refs.calendar.getValue(),

            Name: this.refs.name.getValue(),
            Department: this.refs.department.getValue(),
            Principal: this.refs.principal.getValue(),

            PercentComplete: this.refs.percentComplete.getValue(),
            Duration: this.refs.duration.getValue(),
            Work: this.refs.work.getValue(),

            Start: this.refs.start.getValue(),
            Finish: this.refs.finish.getValue(),

            ActualStart: this.refs.actualStart.getValue(),
            ActualFinish: this.refs.actualFinish.getValue(),

            HideBar: this.refs.hideBar.getValue(),
            Rollup: this.refs.rollup.getValue(),

            ConstraintType: this.refs.constraintType.getValue(),
            ConstraintDate: this.refs.constraintDate.getValue(),
            Notes: this.refs.notes.getValue(),
            WBS: this.refs.wbs.getValue(),

            FixedDate: this.refs.fixedDate.getChecked() ? 1 : 0,
            Milestone: this.refs.milestone.getChecked() ? 1 : 0
        };

        //资源分配
        task.Assignments = this.getAssignments();

        //task.Assignments = mini.clone(this.refs.assignments.getData());

        ////清理重复分配
        //var assHash = {};
        //for (var i = task.Assignments.length - 1; i >= 0; i--) {
        //    var item = task.Assignments[i];
        //    if (!item.ResourceUID || assHash[item.ResourceUID]) {
        //        task.Assignments.removeAt(i);
        //        continue;
        //    }
        //    assHash[item.ResourceUID] = item;
        //}




        //前置任务
        task.PredecessorLink = mini.clone(this.refs.predecessorLink.getData());

        //日期范围
        //        if (task.Start) { //开始日期是:   00:00:00
        //            var d = task.Start;
        //            task.Start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        //        }
        //        if (task.Finish) {//完成日期是:   23:23:59
        //            var d = task.Finish;
        //            task.Finish = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);
        //        }


        //任务限制
        if (task.ConstraintType == 0 || task.ConstraintType == 1) {
            task.ConstraintDate = null;

            if ((!this.__TaskStart && task.Start) || (this.__TaskStart && task.Start && this.__TaskStart.getTime() != task.Start.getTime())) {
                task.ConstraintType = 4;    //不得早于...开始
                task.ConstraintDate = new Date(task.Start.getTime());
            }
        }
        else if (!task.ConstraintDate) {
            if (task.ConstraintType == 2 || task.ConstraintType == 4 || task.ConstraintType == 5) task.ConstraintDate = new Date(task.Start.getTime());
            if (task.ConstraintType == 3 || task.ConstraintType == 6 || task.ConstraintType == 7) task.ConstraintDate = new Date(task.Finish.getTime());
        }

        if (this.task.Manual) {      //如果是手动任务，则不存在限制类型
            task.ConstraintDate = null;
            task.ConstraintType = 0;
        }

        ///////////////////////////////////////////////////////////////////
        this.project.changeTaskForWindow(task, this.task);

        return task;
    },

    /////////////////////////////////////////    
    onTaskCalendarChange: function (e) {
        this.editEnabled();
    },

    onTaskTypeChange: function (e) {
        if (this.refs.taskType.getValue() == 2) {
            this.refs.effortDriven.setChecked(true);
        }
        this.editEnabled();
    },

    onDepartmentChange: function () {
        this.refs.principal.setData(this.getPrincipalsByDepartment(this.refs.department.getValue()));
        this.refs.principal.setValue('');
    },

    onWorkChange: function (e) {

    },

    onDurationChange: function (e) {
        var start = this.refs.start.getValue();
        var duration = this.refs.duration.getValue();
        duration = this.project.parseDuration(duration, this.task);
        this.refs.duration.setValue(duration);
        if (start) {
            var date = this.project.getFinishByCalendar(start, duration, this.task);
            this.refs.finish.setValue(date);
        }
    },

    onStartChange: function (e) {
        var start = this.refs.start.getValue();

        start = this.project.parseStartDate(start, this.task);
        this.refs.start.setValue(start);

        var duration = this.refs.duration.getValue();
        if (start) {
            var date = this.project.getFinishByCalendar(start, duration, this.task);
            this.refs.finish.setValue(date);
        }
    },

    onFinishChange: function (e) {
        var finish = this.refs.finish.getValue();

        finish = this.project.parseFinishDate(finish, this.task);
        this.refs.finish.setValue(finish);

        var start = this.refs.start.getValue();
        if (finish && start) {
            if (start > finish) {
                start = finish;
                this.refs.start.setValue(start);
            }
            var duration = this.project.getDurationByCalendar(start, finish, this.task);
            this.refs.duration.setValue(duration);
        }
    },

    onFixedDateChange: function (e) {
        this.editEnabled();
    },

    ///////////////////////////////////////////////////////
    onAddLink: function (e) {
        var link = {
            Type: 1,
            LinkLag: 0
        };
        this.refs.predecessorLink.addRow(link);
    },

    onRemoveLink: function (e) {
        this.refs.predecessorLink.removeSelected();
    },

    onPredecessorLinkDrawCell: function (e) {
        var link = e.record, field = e.field;
        var preTask = this.getTaskByUID(link.PredecessorUID) || {};
        if (field == "PredecessorID") {
            e.cellHtml = preTask.ID;
        }
        if (field == "PredecessorName") {
            e.cellHtml = preTask.Name;
        }
        if (field == "Type") {
            var linkType = mini.Gantt.PredecessorLinkType[e.value];
            e.cellHtml = linkType.Name;
        }
        if (field == "LinkLag") {
            e.cellHtml = e.value + "天";
        }
    },

    onPredecessorLinkCellBeginEdit: function (e) {
        var link = e.record, field = e.field;
        var preTask = this.getTaskByUID(link.PredecessorUID) || {};
        if (e.field == "PredecessorID") {
            e.value = preTask.ID || "";
        }
        if (e.field == "Type") {
            e.editor.setData(mini.Gantt.PredecessorLinkType);
        }
    },

    onPredecessorLinkCellCommitEdit: function (e) {
        if (e.field == "LinkLag") {
            e.sender.updateRow(e.record, "LinkLag", this.project.parseDuration(e.value));
            e.cancel = true;
        }
        if (e.field == "PredecessorID") {
            //e.editor.setData(mini.Gantt.PredecessorLinkType);
            e.cancel = true;

            var task = this.getTaskByID(e.value);
            if (task) {
                e.sender.updateRow(e.record, "PredecessorUID", task.UID);
            } else {
                e.sender.updateRow(e.record, "PredecessorUID", "");
            }
        }
    },
    ////////////////////////////////////////////////////////////////
    onAddRes: function (e) {
        var align = {
            Units: 1,
            Work: 0,
            Cost: 0
        };
        this.refs.assignments.addRow(align);
    },

    onRemoveRes: function (e) {
        this.refs.assignments.removeSelected();
    },

    onAssignmentsDrawCell: function (e) {
        var ass = e.record, field = e.field;
        var re = this.getResourceByUID(ass.ResourceUID);
        if (!re) {
            if (field == "Units") {
                e.cellHtml = '';
            }
            return;
        }

        if (field == "ResourceUID") {
            e.cellHtml = re.Name;
        }
        if (field == "Units") {

            if (re.Type == 1) {
                e.cellHtml = parseInt(e.value * 100) + "%";
            } else {
                if (re.Type == 2) {
                    e.cellHtml = "";
                } else {
                    e.cellHtml = e.value;
                }
            }
        }

        if (field == "Cost") {
            var value = e.value || 0;
            e.cellHtml = '￥' + mini._toFixed(value, 2);

        }

        if (field == "Work") {
            if (re.Type == 1) {
                e.cellHtml = mini._toFixed(e.value, 2) + "工时";
            } else if (re.Type == 0) {
                e.cellHtml = mini._toFixed(e.value, 2);
            } else {
                e.cellHtml = '';
            }
        }

        if (field == "Config") {
            //e.cellHtml = JSON.stringify(e.record);
            e.cellHtml = mini.encode(e.record);
        }
    },

    onAssignmentsCellBeginEdit: function (e) {
        var record = e.record,
            resource = this.getResourceByUID(record.ResourceUID);

        var project = this.project;

        
        if (e.field == "Work" && project.enableTaskWorkWithDuration) { //如果是工期工时联动，则不能编辑“工时”单元格
            e.cancel = true;
        }
        

        if (e.field == "ResourceUID") {
            e.editor.setData(this.getResources());
        } else {
            if (!resource) {
                e.cancel = true;
                return;
            }
        }

        if (e.field == 'Units') {
            if (resource.Type == 2) {
                e.cancel = true;
            }
            if (resource.Type == 1) {
                e.value = e.value * 100;
            }
        }

        if (e.field == 'Cost') {
            if (resource.Type != 2) {
                e.cancel = true;
            }
        }
    },

    onAssignmentsCellCommitEdit: function (e) {
        var record = e.record,
            resource = this.getResourceByUID(record.ResourceUID);
        
        if (resource) {
            if (e.field == "Units") {
                if (resource.Type == 1) {           //工时
                    //e.value = NumberUtil.toFixed(parseFloat(e.value / 100), 2);
                    var num = parseFloat(e.value / 100);

                    if (num < 0.1) num = 0.1;   //单位不能小于10%；

                    e.value = num;
                }
            }
        } else {
            //如果是工期与工时不联动，则马上计算出分配工时。否则，分配工时是由引擎自动计算的，不需要设置            
            resource = this.getResourceByUID(e.value);
            if (resource.Type == 1 && e.field == "ResourceUID") {       //工时                
                if (!this.project.enableTaskWorkWithDuration) {
                    this.refs.assignments.updateRow(record, { Work: this.refs.duration.getValue() * 8 });
                }                
            }
        }


    },

    onAssignmentsCellEndEdit: function (e) {
        var record = e.record,
            resource = this.getResourceByUID(record.ResourceUID);
     
        if (!resource) return;

        if (resource.Type == 1) {       //工时

            //更准确：应该是该资源给指定任务分配的所有工时，作为成本计算基础，而不是工期。
            //            var work = this.getAssignmentWork(record);

            var Cost = parseFloat(resource.StandardRate * record.Work);
            this.refs.assignments.updateRow(record, { Cost: Cost });

            //成本 = 工时 * 费率          Units影响工时，工时可以单独设置

        } else if (resource.Type == 0) {  //材料

            //            if (e.field == 'Units') {
            record.Work = record.Units;
            //            }

            var Cost = parseFloat(resource.StandardRate * record.Work);
            this.refs.assignments.updateRow(record, { Cost: Cost });
        }

        if (e.field == "Work" && !this.project.enableTaskWorkWithDuration) { 
            //如果工期与工时不联动，任务工时=资源分配工时之和
            var taskWork = 0;
            var list = this.getAssignments();
            for (var i = 0, l = list.length; i < l; i++) {
                var item = list[i];
                var resource = this.getResourceByUID(item.ResourceUID);
                if (resource.Type == 1) {
                    taskWork += item.Work;
                }
            }
            
            this.refs.work.setValue(taskWork);
        }

    },

    ///////////////////////////////////////////////////////
    //固定工期、手动的摘要任务，是可以编辑工期、开始、完成的
    editEnabled: function () {
        //this.refs.fixedDate.hide();

        this.refs.duration.enable();
        this.refs.start.enable();
        this.refs.finish.enable();
        this.refs.constraintType.enable();
        this.refs.constraintDate.enable();
        this.refs.fixedDate.disable();

        if (this.task.Summary) {
            this.refs.fixedDate.enable();

            //固定工期、手动的摘要任务，可以编辑“工期、开始、完成”
            if (this.refs.fixedDate.getChecked() || this.task.Manual) {
                this.refs.constraintType.disable();
                this.refs.constraintDate.disable();
            } else {
                this.refs.duration.disable();
                this.refs.start.disable();
                this.refs.finish.disable();
            }
        }

        var type = this.refs.taskType.getValue();
        //this.refs.effortDriven.setEnabled(type != 2);

        if (this.task.Manual) {
            this.refs.constraintType.disable();
            this.refs.constraintDate.disable();
            this.refs.taskType.disable();
            this.refs.effortDriven.disable();
        }

        if (this.refs.calendar.getValue() == -1) {
            this.refs.ignoreResourceCalendar.setChecked(false);
        }

        this.refs.ignoreResourceCalendar.setEnabled(this.refs.calendar.getValue() != -1);

        var isSummay = !!this.task.Summary;
        this.refs.taskType.setEnabled(!isSummay);
        this.refs.effortDriven.setEnabled(!isSummay && type != 2);
    },

    setActiveTab: function (tabName) {
        this.activeTab(tabName);
    },

    activeTab: function (tabName) {
        var tabs = this.refs.tabs;
        var tab = tabs.getTab(tabName);
        if (tab) {
            tabs.activeTab(tab);
        }
    },

    getHoursPerDay: function () {
        return this.project.getHoursPerDay();
    },

    getResources: function () {
        var data = this.dataProject.Resources || []
        return data;
    },

    getDepartments: function () {
        var data = this.dataProject.Departments || []
        return data;
    },

    getPrincipals: function () {
        var data = this.dataProject.Principals || []
        return data;
    },

    getPrincipalsByDepartment: function (dept) {
        var psAll = this.getPrincipals();
        var ps = [];
        for (var i = 0, l = psAll.length; i < l; i++) {
            var p = psAll[i];
            if (p.Department == dept) {
                ps.push(p);
            }
        }
        return ps;
    },

    getTaskByID: function (taskID) {
        return this.project.getTaskByID(taskID);
    },

    getTaskByUID: function (taskUID) {
        return this.project.getTask(taskUID);
    },

    getResourceByUID: function (reUID) {
        return this.project.getResource(reUID);
    },

    ////////////////////////////////////////////////////////////////
    onTabChanged: function (e) {
        this.project.taskWindowLastTab = e.index;
        //alert(e.index);
    },

    onOkClick: function (event) {
        var project = this.project;

        try {
            var data = this.getData();
            
            var action = new PlusProject.UpdateTaskAction(project, this.task, data);
            project.executeAction(action);

            this.close('ok');

        } catch (ex) {
            alert("error:" + ex.message);
        }
    }
});

