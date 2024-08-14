/* 标准方法：加载、保存、调试项目，弹出任务面板、日历面板。
-----------------------------------------------------------------------------*/

var ServicesPath = bootPATH + "plusproject/webapi/";    //Ajax交互路径（根据实际项目部署路径，需要修改）

var LoadProjectUrl = ServicesPath + 'load.aspx';
var SaveProjectUrl = ServicesPath + 'save.aspx';


mini.__getTemplate = function (url) {
    var template = '';
    $.ajax({
        url: url,
        type: 'get',
        async: false,
        success: function (data) {
            template = data;
        }
    });
    return template;
}


function doSetProjectData(project, dataProject) {
    if (project.showProjectTask) {

        var root = { Name: dataProject.Name, isProject: true };
        root.children = dataProject.Tasks;

        dataProject.Tasks = [root];

        project.loadData(dataProject);

        //如果是将项目作为顶级父任务，则需要处理下数据联动

        project.orderProject();

    } else {
        
        project.loadData(dataProject);
    }
}
function doGetProjectData(project) {
    var dataProject = project.getData();
    dataProject.RemovedTasks = project.getRemovedTasks();
    
    if (project.showProjectTask) {

        var Tasks = dataProject.Tasks;

        var root = Tasks[0];
        if (root && root.isProject) {       //如果第一条任务是项目任务，则克隆一个新项目数据

            dataProject.Tasks = [];
            var clone = mini.clone(dataProject);
            dataProject.Tasks = Tasks;      //还原原始数据

            dataProject = clone;            
            dataProject.Tasks = root.children;
        }
    }

    return dataProject;
}

//加载项目
function LoadProject(params, project, callback) {
    if (typeof params != "object") params = { projectuid: params };

    project.loading();
    $.ajax({
        url: LoadProjectUrl,
        data: params,
        cache: false,
        success: function (text) {
            var dataProject = mini.decode(text);

            doSetProjectData(project, dataProject);

            project.orderProject();

            //加载时自动排程，如果有变动，需要提示
            //            if (project.isChanged()) {
            //                alert("项目数据加载时自动调整");
            //            }

            //
            if (callback) callback(project);
            project.unmask();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);
            project.unmask();
        }
    });
}

//保存项目
function SaveProject(project, callback, params) {

    project.mask("数据保存中，请稍后...");
    
    var dataProject = doGetProjectData(project);


    var json = mini.encode(dataProject);

    if (!params) params = {};
    params.project = json;

    $.ajax({
        url: SaveProjectUrl,
        type: "post",
        data: params,
        success: function (text) {
            alert("保存成功,项目UID：" + text);
            project.acceptChanges();
            if (callback) callback(project);
            project.unmask();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("保存失败, 错误码：" + textStatus);
            project.unmask();
        }
    });
}

//调试项目
function TrackProject(project) {
    var dataProject = project.getData();
    var json = mini.encode(dataProject);

    try {
        var blob = new Blob([json]);
        //    eleLink.href = URL.createObjectURL(blob);

        var a = document.createElement('a')
        a.download = '项目文件.txt';
        a.href = URL.createObjectURL(blob)
        a.dispatchEvent(new MouseEvent('click'))
    } catch (ex) {
        var win = window.open('', "_blank");
        win.document.write(json);
    }

    //document.write(json);
    //把生成的项目JSON数据发送给技术支持人员，方便技术人员进行调试定位项目问题
}

function LoadJSONProject(url, project, callback) {
    project.loading();
    $.ajax({
        url: url,
        cache: false,
        success: function (text) {
            var dataProject = mini.decode(text);

            doSetProjectData(project, dataProject);

            if (callback) callback(project);
            project.unmask();

        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);
            project.unmask();
        }
    });
}

//任务面板
function ShowTaskWindow(project, tabName) {
    
    var task = project.getSelected();
    if (task) {

        var taskWindow = new PlusProject.TaskWindow({
            closeAction: "destroy",
            title: '编辑任务'
        });       
        
        taskWindow.project = project;
        taskWindow.setData(task);
        taskWindow.show();

        if (tabName) {
            taskWindow.activeTab(tabName);
        }
        return taskWindow;
    } else {
        alert("请先选择任务");
    }
}

//日历面板
function ShowCalendarWindow(project) {
    var win = new PlusProject.CalendarWindow({
        closeAction: 'destroy',
        project: project
    });
    win.setData();
    win.show();
}

//资源面板
function ShowResourcesWindow(project) {
    var win = new PlusProject.ResourcesWindow({
        closeAction: 'destroy',
        project: project
    });
    win.setData();
    win.show();
}

