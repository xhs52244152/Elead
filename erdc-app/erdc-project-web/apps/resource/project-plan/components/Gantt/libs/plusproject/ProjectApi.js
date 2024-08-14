var ProjectApiUrl = bootPATH + 'plusproject/webapi/projectapi.aspx';

PlusProject.api = {};

//PlusProject.api.checkProjectSaved = function (project, callback) {
//    if (project.isDataChanged()) {
//        alert("当前项目已修改，请先保存");
//        return;
//    }
//    callback();
//};

PlusProject.api.lazyLoadProject = function (id, project, callback) {
    callback = callback || mini.emptyFn;

    if (project) project.mask("项目加载中，请稍后...");

    $.ajax({
        url: ProjectApiUrl,
        type: 'post',
        data: { type: 'lazyLoadProject', id: id },
        cache: false,
        success: function (text) {            
            var result = mini.decode(text);
            if (result.success) {
                if (project) {
                    project.loadData(result.data);                    
                    project.orderProject();
                    project.firstScheduleDate = project.lastScheduleDate;
                    project.unmask();
                }
                callback(true, result);
            } else {
                alert("加载项目失败\n" + result.message + "\n" + result.stackTrace);
                if (project) project.unmask();
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);
            project.unmask();
            if (project) callback(false);
        }
    });
}
PlusProject.api.loadNodes = function (projectId, parentTask, project, callback) {
    callback = callback || mini.emptyFn;

    //if (project) project.mask("项目加载中，请稍后...");
    
    $.ajax({
        url: ProjectApiUrl,
        type: 'post',
        data: { type: 'loadNodes', projectId: projectId, parentId: parentTask.UID },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                if (project) {
                    //alert("子节点加载成功");
                    //alert(text);
                    var nodes = result.data;
                    project.store.addNodes(nodes, parentTask);
                    project.orderProject();
                    //project.unmask();
                }
                callback(true, result);
            } else {
                alert("加载子节点失败\n" + result.message + "\n" + result.stackTrace);
                //if (project) project.unmask();
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载子节点失败, 错误码：" + textStatus);
            //project.unmask();
            if (project) callback(false);
        }
    });
}
////////////////////////////////////////////////////////////////////////////
PlusProject.api.loadProject = function (id, project, callback) {
    callback = callback || mini.emptyFn;

    if(project) project.mask("项目加载中，请稍后...");

    $.ajax({
        url: ProjectApiUrl,
        type: 'post',
        data: { type: 'loadProject', id: id },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                if (project) {
                    project.loadData(result.data);
                    project.orderProject();
                    project.firstScheduleDate = project.lastScheduleDate;
                    project.unmask();
                }
                callback(true, result);
            } else {
                alert("加载项目失败\n" + result.message + "\n" + result.stackTrace);
                if(project) project.unmask();
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);
            project.unmask();
            if(project) callback(false);
        }
    });
}

PlusProject.api.saveProject = function (project, callback) {
    callback = callback || mini.emptyFn;

    project.mask("项目保存中，请稍后...");

    var time = new Date();

    var data = mini.encode(project.data);
    $.ajax({
        url: ProjectApiUrl,
        type: 'post',
        data: { type: 'saveProject', data: data },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                var id = result.data;
                //alert("项目保存成功");
//                project.mask("项目保存成功");

                //                mini.showMessageBox({
                //                    //showModal: false,
                //                    width: 250,
                //                    title: "提示",
                //                    iconCls: "mini-messagebox-warning",
                //                    message: "项目保存成功",
                //                    timeout: 1000,
                //                    x: 'center',
                //                    y: 'center'
                //                });

                project.data.UID = id;                
                project.acceptChanges();
                setTimeout(function () {
                    project.unmask();
                    callback(true, result);
                }, 600 - (new Date() - time));
            } else {
                alert("保存项目失败\n" + result.message + "\n" + result.stackTrace);
                project.unmask();
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("操作失败, 错误码：" + textStatus);
            project.unmask();
            callback(false);
        }
    });
}

PlusProject.api.deleteProject = function (id, callback) {
    callback = callback || mini.emptyFn;

    $.ajax({
        url: ProjectApiUrl,
        data: { type: 'deleteProject', id: id },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                callback(true, result);
            } else {
                alert("删除项目操作错误\n" + result.message + "\n" + result.stackTrace);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("操作失败, 错误码：" + textStatus);
        }
    });
}

PlusProject.api.listProject = function (callback) {
    callback = callback || mini.emptyFn;

    $.ajax({
        url: ProjectApiUrl,
        data: { type: 'listProject' },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                callback(true, result);
            } else {
                alert("项目列表加载错误\n" + result.message + "\n" + result.stackTrace);
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);
            callback(false);
        }
    });
}

////////////////////////////////////////////////////
PlusProject.api.loadTemplate = function (id, callback) {
    callback = callback || mini.emptyFn;

    $.ajax({
        url: ProjectApiUrl,
        type: 'post',
        data: { type: 'loadTemplate', id: id },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                callback(true, result);
            } else {
                alert("加载模板失败\n" + result.message + "\n" + result.stackTrace);                
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);            
            callback(false);
        }
    });
}

PlusProject.api.saveTemplate = function (template, callback) {
    callback = callback || mini.emptyFn;

    var data = mini.encode(template);
    $.ajax({
        url: ProjectApiUrl,
        type: 'post',
        data: { type: 'saveTemplate', data: data },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                var id = result.data;
//                alert("模板保存成功");
                template.id = id;                
                callback(true, result);
            } else {
                alert("保存模板失败\n" + result.message + "\n" + result.stackTrace);              
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("操作失败, 错误码：" + textStatus);            
            callback(false);
        }
    });
}

PlusProject.api.deleteTemplate = function (id, callback) {
    callback = callback || mini.emptyFn;

    $.ajax({
        url: ProjectApiUrl,
        data: { type: 'deleteTemplate', id: id },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                callback(true, result);
            } else {
                alert("删除模板失败\n" + result.message + "\n" + result.stackTrace);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("操作失败, 错误码：" + textStatus);
        }
    });
}

PlusProject.api.changeTemplateName = function (id, name, callback) {
    callback = callback || mini.emptyFn;

    $.ajax({
        url: ProjectApiUrl,
        data: { type: 'changeTemplateName', id: id, name: name },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                callback(true, result);
            } else {
                alert("修改模板名称失败\n" + result.message + "\n" + result.stackTrace);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("操作失败, 错误码：" + textStatus);
        }
    });
}

PlusProject.api.listTemplate = function (templateType, callback) {      //type: 1项目模板, 2任务模板
    callback = callback || mini.emptyFn;

    $.ajax({
        url: ProjectApiUrl,
        data: { type: 'listTemplate', templateType: templateType },
        cache: false,
        success: function (text) {
            var result = mini.decode(text);
            if (result.success) {
                callback(true, result);
            } else {
                alert("模板列表加载错误\n" + result.message + "\n" + result.stackTrace);
                callback(false, result);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            alert("加载失败, 错误码：" + textStatus);
            callback(false);
        }
    });
}









