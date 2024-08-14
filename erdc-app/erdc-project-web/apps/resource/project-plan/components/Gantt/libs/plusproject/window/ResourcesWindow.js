PlusProject.ResourcesWindow = mini.Window.extend({

    props: {
        title: "项目资源",
        width: 650,
        height: 380,
        bodyStyle: "padding:0;",
        allowResize: true,
        showModal: true,
        showToolbar: true,
        showFooter: true
    },

    constructor: function (config) {
        mini.Window.call(this, config);
        this.initControls();
        this.initEvents();
    },

    initControls: function () {
        var toolbarEl = this.getToolbarEl();
        var footerEl = this.getFooterEl();
        var bodyEl = this.getBodyEl();

        //toolbar
        var labelId = this.id + "$label";
        var topHtml =
            '<div style="padding:5px;">'
                + '<a name="add" class="mini-button">增加</a> '
                + '<a name="remove" class="mini-button">删除</a> '
            + '</div>';
        jQuery(toolbarEl).append(topHtml);

        //footer
        var footerHtml =
            '<div style="padding:8px;text-align:center;">'
                + '<a name="okBtn" class="mini-button" style="width:60px;">确定</a>       '
                + '<span style="display:inline-block;width:25px;"></span>'
                + '<a name="cancelBtn" class="mini-button" style="width:60px;">取消</a>       '
            + '</div>';
        jQuery(footerEl).append(footerHtml);

        /////////////////////////////////////////////////////
        //body        


        this.grid = new mini.DataGrid();
        //this.grid = new mini.SuperGrid();
        this.grid.set({
            multiSelect: true,
            style: "width: 100%;height: 100%;",
            borderStyle: "border:0",
            allowCellSelect: true,
            allowCellEdit: true,
            showPager: false,
            columns: [
                { type: "checkcolumn" },
                { header: "资源名称", field: "Name", width: 150,
                    editor: { type: "textbox" }

                },
                { header: "资源类型", field: "Type", type: "comboboxcolumn", width: 80,
                    editor: {
                        type: "combobox",
                        valueField: "value", textField: "text",
                        data: [{ value: 0, text: "材料" }, { value: 1, text: "工时" }, { value: 2, text: "成本"}]
                    }
                },
                { header: "标准费率", field: "StandardRate", width: 80,
                    editor: { type: "spinner", minValue: 0, maxValue: 999999999 }
                },
            //                { header: "加班费率", field: "StandardRate",
            //                    editor: { type: "spinner", minValue: 0, maxValue: 999999999 }
            //                },
                {header: "资源成本", field: "Cost", width: 60,
                renderer: function (e) {
                    return '￥' + mini._toFixed(e.value, 2);
                }
            },
                { header: '资源工时', field: 'Work', width: 60,
                    renderer: function (e) {
                        var value = mini._toFixed(e.value, 2);
                        if (e.record.Type == 1) {
                            value += '工时';
                        } else if (e.record.Type == 2) {
                            value = '';
                        }

                        return value;
                    }
                }
            ]
        });

        this.grid.render(bodyEl);

        var grid = this.grid;

        grid.on("drawcell", function (e) {
            if (e.field == "StandardRate") {
                if (e.record.Type == 2) {
                    e.cellHtml = "";
                } else if (e.record.Type == 0) {
                    e.cellHtml = '￥' + mini._toFixed(e.value, 2);
                } else if (e.record.Type == 1) {
                    e.cellHtml = '￥' + mini._toFixed(e.value, 2) + "/小时";
                }
            }
        });
        grid.on("cellbeginedit", function (e) {
            if (e.record.Type == 2 && e.field == "StandardRate") {
                e.cancel = true;
            }
        });

        grid.on("cellendedit", function (e) {
            var item = e.record;
            if (e.field == "StandardRate") {
                var Cost = e.value * item.Work;
                grid.updateRow(item, { Cost: Cost });
            }
        });

        /////////////////////////////////////////////////////

        //组件对象
        mini.parse(this.el);
        this._okBtn = mini.getbyName("okBtn", this);
        this._cancelBtn = mini.getbyName("cancelBtn", this);
        this._addBtn = mini.getbyName("add", this);
        this._removeBtn = mini.getbyName("remove", this);
    },
    initEvents: function () {
        this._addBtn.on("click", function (e) {
            var o = { UID: UUID(), Type: 1, Cost: 0, Name: "", StandardRate: 0, Work:0 };
            this.grid.addRow(o);
        }, this);
        this._removeBtn.on("click", function (e) {

            var records = this.grid.getSelecteds();

            if (confirm("确定删除选中的资源吗？")) {
                this.grid.removeRows(records);
            }

        }, this);

        /////////////////////////////////////
        this._okBtn.on("click", this.onOkClick, this);
        this._cancelBtn.on("click", this.onCancelClick, this);
    },

    setData: function () {
        var project = this.project;
        var data = project.data.Resources;
        data = mini.clone(data);

        $.each(data, function (i, o) {
            if (o.Type == null) o.Type = 1;
            if (o.Cost == null) o.Cost = 0;
        });

        this.grid.setData(data);
    },

    getData: function () {
        var data = this.grid.getData();

        var list = [];
        jQuery.each(data, function (i, o) {
            if (o.Name) {
                list.add(o);
            }
            if (!o.UID) o.UID = UUID();
        });

        //alert(mini.encode(list));

        return list;
    },
    onOkClick: function (event) {
        var project = this.project;

        var data = this.getData();

        //        project.setResources(data);

        var action = new PlusProject.ChangeResourcesAction(project, data);
        project.executeAction(action);

        this.close('ok');
    },
    onCancelClick: function (event) {
        var project = this.project;

        this.close('cancel');
    }
});
