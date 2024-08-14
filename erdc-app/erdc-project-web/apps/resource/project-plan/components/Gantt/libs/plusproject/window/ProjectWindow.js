var ProjectWindowTemplate = mini.__getTemplate(bootPATH + "plusproject/window/ProjectWindow.html");

PlusProject.ProjectWindow = PlusProject.Window.extend({
    props: {
        title: '项目信息',
        width: 480,
        height: 250,
        mode: 'edit'            //new, edit
    },
    
    footer: `
        <div style="display:flex;">
            <mini-checkbox ref="showProjectSummary" v-model:checked="data.showProjectSummary" config="{text: PlusGantt.ShowProjectSummaryText}"></mini-checkbox>
            <div style="flex:1"></div>
            <mini-button ref="ok" @click="onOkClick" style="margin-right:10px;" width="60">确定</mini-button> <mini-button ref="cancel" @click="onCancelClick" width="60">取消</mini-button>
        </div>`,
    
    content: ProjectWindowTemplate,

//    render: function(){
//        var project = this.project;
//        var data = this.data || {};
//        
//        this.updateProps({
//            startDate: { value: data.StartDate },
//            finishDate: { value: data.FinishDate, enabled: this.mode == 'new' },
//            statusDate: { value: data.StatusDate },
//            currentDate: { value: data.CurrentDate },
//            name: { value: data.Name },
//            calendar: { value: data.CalendarUID, data: project.data.Calendars },
//            showProjectSummary: { value: project.showProjectSummary },            
//            status: { value: data.Status },
//            schedule: { value: "start" }
//        });

//        //this.updateProps("calendar", { value: data.CalendarUID, data: project.data.Calendars });

//    },
    
//    onStatusChange: function(e){
//        this.data.Status = this.refs.status.getValue();
//    },
    
    setData: function(){
        var project = this.project;
                
        var data = mini.getMapData(project.data, ["Name", "StartDate", "FinishDate", "Status", "StatusDate", "CurrentDate", "CalendarUID", "CriticalSlackLimit", "MultipleCriticalPaths"]);
        
        this.data = mini.apply({
            Status: 2,
            CurrentDate: new Date(),
            showProjectSummary: project.showProjectSummary,           
        }, data);
        
        //this.refs.statusDate.setViewDate(data.StartDate);
                
        this.requestUpdate();
        
//        var form = this.getForm();            //name => value
//        form.setValues(project.data);
        
//        this.refs.calendar.setData(project.data.Calendars);
//        this.refs.schedule.setValue("start");
//        this.refs.showProjectSummary.setValue(project.showProjectSummary);

//        form.on("change", function(e){
//            
//        });

//        this.refs.startDate.setValue(project.data.StartDate);
//        //var finishDate = project.data.LastTaskFinishDate ||  project.data.FinishDate;
//        var finishDate = project.data.FinishDate;
//        if(this.mode == 'new') {
//            finishDate = project.data.FinishDate;
//            this.refs.finishDate.enable();
//        }
//        this.refs.finishDate.setValue(finishDate);
//        this.refs.currentDate.setValue(project.data.CurrentDate || new Date());
//        this.refs.statusDate.setValue(project.data.StatusDate);
//        this.refs.schedule.setValue("start");
//        this.refs.calendar.setData(project.data.Calendars);
//        this.refs.calendar.setValue(project.data.CalendarUID);
//        this.refs.name.setValue(project.data.Name);
//        this.refs.status.setValue(project.data.Status || 2);        
//        this.refs.showProjectSummary.setValue(project.showProjectSummary);
    },

    getData: function () {
        
//        var form = this.getForm();
//        var data = form.getValues();
//        data.showProjectSummary = this.refs.showProjectSummary.getChecked()


        var data = this.data;

        return data;
        //return this.data;

//        var data = {
//            StartDate: this.refs.startDate.getValue(),
//            CurrentDate: this.refs.currentDate.getValue(),
//            StatusDate: this.refs.statusDate.getValue(),
//            CalendarUID: this.refs.calendar.getValue(),
//            Name: this.refs.name.getValue(),
//            Status: this.refs.status.getValue(),
//            showProjectSummary: this.refs.showProjectSummary.getChecked()
//        };
////        if(this.mode == 'new'){
//            data.FinishDate = this.refs.finishDate.getValue()
////        }
//        return data;
    },

    onOkClick: function (event) {
        
        var project = this.project;
        
        var data = this.getData();

//        this.refs.name.setValue(Date.now());

////        alert(JSON.stringify(data));
//        return;

        if(!data.Name){
            alert("项目名称不能为空");
            return;                
        }
        if(!data.StartDate){
            alert("项目开始日期不能为空");
            return;                
        }
        if(!data.FinishDate){
            alert("项目完成日期不能为空");
            return;
        }

        if(this.mode == 'new'){
//            alert("nnew");
            
        } else {
            //alert(JSON.stringify(data, null));
            var action = new PlusProject.ProjectInfoAction(project, data);
            project.executeAction(action);
        }
                
        this.close('ok');
    }

});


PlusProject.ScheduleType = [
    {id:'start', text: '项目开始日期'},
    {id:'finish', text: '项目完成日期'}
]

