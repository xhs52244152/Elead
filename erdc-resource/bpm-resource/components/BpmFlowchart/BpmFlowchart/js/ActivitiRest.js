var ActivitiRest = {
    options: {},
    getProcessDefinitionByKey: function (processDefinitionKey, callback) {
        var url = Lang.sub(this.options.processDefinitionByKeyUrl, { processDefinitionKey: processDefinitionKey });

        $.ajax({
            url: url,
            dataType: 'jsonp',
            cache: false,
            async: true,
            headers: {
                'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
            },
            success: function (data, textStatus) {
                var processDefinitionDiagramLayout = data;
                var title = processDefinitionDiagramLayout.processDefinition.name;
                if (parent.layer) {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    //modify by liangtong at 2018-05-09 生产环境中文乱码问题
                    //parent.layer.title(title+"【流程图】", index) ; //再改变当前层的标题
                    parent.layer.title(title, index); //再改变当前层的标题
                    if (!processDefinitionDiagramLayout) {
                        return;
                    } else {
                        callback.apply({ processDefinitionDiagramLayout: processDefinitionDiagramLayout });
                    }
                } else {
                    callback.apply({ processDefinitionDiagramLayout: processDefinitionDiagramLayout });
                }
            }
        })
            .done(function (data, textStatus) {})
            .fail(function (jqXHR, textStatus, error) {});
    },

    getProcessDefinition: function (processDefinitionId, processInstanceId, callback) {
        var url = Lang.sub(this.options.processDefinitionUrl, {
            processDefinitionId: processDefinitionId,
            processInstanceId: processInstanceId
        });
        $.ajax({
            url: url,
            dataType: 'jsonp',
            cache: false,
            async: true,
            headers: {
                'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
            },
            success: function (data, textStatus) {
                var processDefinitionDiagramLayout = data;
                var title = processDefinitionDiagramLayout.processDefinition.name;
                if (parent.layer) {
                    var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                    //modify by liangtong at 2018-05-09 生产环境中文乱码问题
                    //parent.layer.title(title+"【流程图】", index) ; //再改变当前层的标题
                    parent.layer.title(title, index); //再改变当前层的标题
                    if (!processDefinitionDiagramLayout) {
                        return;
                    } else {
                        callback.apply({ processDefinitionDiagramLayout: processDefinitionDiagramLayout });
                    }
                } else {
                    callback.apply({ processDefinitionDiagramLayout: processDefinitionDiagramLayout });
                }
            }
        })
            .done(function (data, textStatus) {})
            .fail(function (jqXHR, textStatus, error) {});
    },

    getHighLights: function (processInstanceId, callback) {
        var url = Lang.sub(this.options.processInstanceHighLightsUrl, {
            processInstanceId: processInstanceId,
            processDefinitionId: window.processId
        });
        $.ajax({
            url: url,
            dataType: 'jsonp',
            cache: false,
            async: true,
            headers: {
                'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
            },
            success: function (data, textStatus) {
                window.completeData = data.flows; // 完成时保存数据

                var highLights = data;
                if (!highLights) {
                    return;
                } else {
                    callback.apply({ highLights: highLights });
                }
            }
        })
            .done(function (data, textStatus) {})
            .fail(function (jqXHR, textStatus, error) {});
    },

    getInterfaces: function (processDefinitionId, processInstanceId) {
        var url = Lang.sub(this.options.processInterfaces, {
            processDefinitionId: processDefinitionId,
            processInstanceId: processInstanceId
        });
        $.ajax({
            url: url,
            cache: false,
            async: true,
            headers: {
                'Tenant-Id': window.encodeURIComponent(JSON.parse(localStorage.getItem('tenantId')) || '')
            },
            success: function (data) {
                window.getInterfaces = data.res.data;
            }
        })
            .done(function (data, textStatus) {})
            .fail(function (jqXHR, textStatus, error) {});
    }
};
