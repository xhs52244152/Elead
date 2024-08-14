var ProgressLine = function (gantt, options) {
    this.gantt = gantt;
    this.project = gantt;
    $.extend(this, options);
    this.init();
}
ProgressLine.prototype = {
    visible: true,
    mode: 1,            //1, 2 两种进度线模式
    color: 'red',

    getProjectDate: function () {
    },

    getTaskDate: function (task) {
    },

    isShowProcessLine: function (task) {
        return true;
    },

    init: function () {
        var me = this,
            gantt = me.gantt,
            ganttView = gantt.ganttView;

        ganttView.on("refresh", function (e) {
            if (!me.visible) return;
            var mode = me.mode;
            var color = me.color;

            var view = ganttView.getViewRange();
            var gridlines = $(ganttView.el).find(".mini-ganttview-gridlines");
            var linklines = $(ganttView.el).find(".mini-ganttview-linklines");
            var bars = $(ganttView.el).find(".mini-ganttview-bars");

            //1)
            var projectDate = me.getProjectDate();

            if (mode == 2) {
                if (projectDate && view.startDate < projectDate && projectDate < view.endDate) {

                    var jq = $('<div style="z-index:1000;position:absolute;left:200px;top:0px;width:1px;height:0px;border-right:solid 1px ' + color + ';"></div>').appendTo(gridlines);
                    jq.height(view.height);                    

                    var left = gantt.getXByDate(projectDate);
                    jq.css("left", left + "px");

                    var jq = $('<div style="z-index:2100;position:absolute;left:210px;top:0px;font-size:10px;line-height:16px;padding:2px;background:white;border:solid 1px ' + color + ';">'+mini.formatDate(projectDate,'yyyy-MM-dd')+'</div>')
                        .appendTo(bars);
                    jq.css("left", (left + 4) + "px");
                }
            }

            //2)
            var tasks = gantt.tasks.getVisibleRows();
            for (var i = view.startRow, l = view.endRow; i < l; i++) {
                var task = tasks[i];

                var date = me.getTaskDate(task);

                var isShow = me.isShowProcessLine(task);

                if (date && isShow) {
                    var jq = $('<div class="progressline-point"></div>').appendTo(bars);

                    var top = gantt.getYByRow(i);
                    jq.css("top", top + "px");

                    var left = gantt.getXByDate(date);
                    jq.css("left", left + "px");
                }
            }

            //3)
            var suppertSVG = !!document.createElementNS;
            var ns = "http:\/\/www.w3.org/2000/svg";
            var svg = document.createElementNS(ns, 'svg');
            svg.style.cssText = 'position:absolute;left:0;top:0;width:' + view.width + 'px;height:' + view.height + 'px;z-index:2000;pointer-events: none;';
            bars.append(svg);

            function drawLine(x1, y1, x2, y2) {
                var line = document.createElementNS(ns, 'line');
                svg.appendChild(line);
                line.setAttribute("stroke", color);
                line.setAttribute("stroke-width", 0.5);

                line.setAttribute("x1", x1);
                line.setAttribute("y1", y1);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", y2);
            }

            if (suppertSVG) {

                if (mode == 2) {
                    var left = gantt.getXByDate(projectDate);
                    var tasks = gantt.tasks.getVisibleRows();


                    for (var i = view.startRow, l = view.endRow; i < l; i++) {
                        var task = tasks[i];
                        var date = me.getTaskDate(task);

                        var isShow = me.isShowProcessLine(task);

                        if (date) {

                            var top = gantt.getYByRow(i),
                            height = gantt.getRowHeight(i);

                            var x1 = gantt.getXByDate(date),
                            y1 = top + height / 2,
                            x2 = left,
                            y2 = top;

                            if (isShow) {
                                drawLine(x1, y1, x2, y2);
                            }

                            y2 = top + height;
                            if (isShow) {
                                drawLine(x1, y1, x2, y2);
                            }
                        }
                    }
                } else {

                    var oldX, oldY;
                    var tasks = gantt.tasks.getVisibleRows();

                    for (var i = view.startRow, l = view.endRow; i < l; i++) {
                        var task = tasks[i];
                        var date = me.getTaskDate(task);
                        if (date) {

                            var top = gantt.getYByRow(i),
                                height = gantt.getRowHeight(i);

                            var x = gantt.getXByDate(date),
                                y = top + height / 2;

                            if (oldX != null) {
                                drawLine(oldX, oldY, x, y);
                            }

                            oldX = x;
                            oldY = y;

                        }
                    }

                }
            }




        });

    },

    setVisible: function (value) {
        this.visible = value;
        this.gantt.refresh();
    },

    setMode: function (value) {
        this.mode = parseInt(value);
        this.gantt.refresh();
    }

}
