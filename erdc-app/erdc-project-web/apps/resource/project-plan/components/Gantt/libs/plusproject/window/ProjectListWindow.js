
PlusProject.ProjectListWindow = PlusProject.Window.extend({
    props: {
        title: '项目列表',
        width: 580,
        height: 'auto',
        highlight: false
    },
    footer: '<div style="display:flex;">'
            + '<mini-button ref="del" @click="onDelProjectClick" style="margin-right:10px;">删除项目</mini-button>'
            + '<mini-button ref="saveTemplate" @click="onSaveTemplateClick" >另存为项目模板</mini-button>'
            + '<div style="flex:1"></div>'
            + '<mini-button ref="ok" @click="onOkClick" style="margin-right:10px;">打开项目</mini-button> <mini-button ref="cancel" @click="onCancelClick" width="60">取消</mini-button>'
        + '</div>',
    content: '<mini-datagrid ref="grid" width="100%" height="220" showPager="false" @rowdblclick="onItemDblclick"'
        + '>'
            + '<columns>'
                + '<column type="comboboxcolumn" field="status" header="项目状态" width="60">'
                    + '<editor>'
                        + '<mini-combobox config="{data: PlusProject.ProjectStatus}"></mini-combobox>'
                    + '</editor>'
                + '</column>'
                + '<column field="name" header="项目名称" width="200"></column>'
                + '<column field="startdate" header="开始日期" width="80" dateFormat="yyyy-MM-dd"></column>'
                + '<column field="finishdate" header="完成日期" width="80" dateFormat="yyyy-MM-dd"></column>'
                + '<column field="lastupdatedate" header="最后保存日期" width="120" dateFormat="yyyy-MM-dd HH:mm:ss"></column>'
            + '</columns>'
        + '</mini-datagrid>',

    setData: function () {
        var me = this;
        me.mask("项目列表加载中...");
        PlusProject.api.listProject(function (success, result) {
            if (success) {
                me.refs.grid.setData(result.data);
            }
            me.unmask();
        });
    },

    refresh: function () {

    },

    onItemDblclick: function (e) {
        this.onOkClick();
    },

    onOkClick: function (event) {
        var project = this.project;

        var fields = this.getData();

        //        alert(JSON.stringify(fields));

        //        return;   

        var item = this.refs.grid.getSelected();

        //        if (project.isDataChanged()) {
        //            alert("当前项目已修改，请先保存当前项目。");
        //            return;
        //        }

        if (!item) {
            alert("请先选择一个要打开的项目");
            return;
        }

        var me = this;

        function fn() {
            PlusProject.api.loadProject(item.id, project, function (success) {
                me.close('ok');
            });
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

    onDelProjectClick: function () {
        var me = this;
        var item = this.refs.grid.getSelected();

        if (!item) {
            alert("请先选择一个要删除的项目");
            return;
        }

        if (confirm("确定要删除项目“" + item.name + "”？\n注意：本操作无法恢复。")) {
            PlusProject.api.deleteProject(item.id, function (success) {
                if (success) {
                    me.refs.grid.removeRow(item);
                    //                    alert("项目删除成功");
                }
            });
        }
    },

    onSaveTemplateClick: function (e) {
        var project = this.project;
        var me = this;
        var item = this.refs.grid.getSelected();

        if (!item) {
            alert("请先选择一个项目");
            return;
        }

        PlusProject.api.loadProject(item.id, null, function (success, result) {
            if (success) {
                var data = result.data;

                var name = data.Name + ' - ' + mini.formatDate(new Date(), 'yyyy-MM-dd');

                var template = {
                    name: name,
                    type: 1,                //1 项目, 2任务
                    data: data
                }

                PlusProject.api.saveTemplate(template, function (success) {
                    if (success) {
                        alert("项目模板 “" + name + "” 创建成功");
                    }
                });
            }
        });



    }

});
