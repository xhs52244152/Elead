/*
    FamCalendar: FamKit.asyncComponent(ELMP.resource(`erdc-components/FamCalendar/index.js`)),

    <fam-calendar
        :height="calendarHeight"
        :key="eventData.length"
        :data="eventData"
        :current-data="currentData"
        @dateclick="selectDate"
        @eventclick="eventClick"
        @onmouseenter="onMouseEnter"
        @onmouseleave="onMouseLeave"
    ></fam-calendar>

    Props

    height          日历高度            Number      '500'
    data            events事件数据源    Array       []
    currentData     当前日历显示规则    Object      null
    multiMonthMaxColumns    日历每行显示个数    Number      4
    isEditable      是否可以进行（拖动、缩放）修改  Boolean  true
    isSelectable    是否可以选中日历格  Boolean   true
    options         全部配置项          Function
    formatTime      日期格式            String   'YYYY-MM-DD'

    Events

    dateclick       选中日期触发
    eventclick      点击日历事件
    onmouseenter    鼠标划过
    onmouseleave    鼠标离开

    具体详情参考https://fullcalendar.io/docs#toc

*/
define([
    'text!' + ELMP.resource('erdc-components/FamCalendar/index.html'),
    '/erdc-thirdparty/platform/fullcalendar/index.global.min.js',
    'css!' + ELMP.resource('erdc-components/FamCalendar/index.css'),
    'dayjs'
], function (template) {
    const dayjs = require('dayjs');
    return {
        name: 'FamCalendar',
        template,
        components: {},
        data() {
            return {
                FamCalendar: null,
                newDate: dayjs().format('YYYY'),
                lan: this.$store.state.i18n?.lang || 'zh_cn',
                locale: {
                    CN: 'zh-cn',
                    EN: 'en'
                }
            };
        },
        props: {
            height: {
                type: Number,
                default: 500
            },
            // events事件数据源
            data: {
                type: Array,
                default: () => []
            },
            // 当前日历显示规则
            currentData: {
                type: Object,
                default: null
            },
            // 日历每行显示个数
            multiMonthMaxColumns: {
                type: Number,
                default: 4
            },
            // 是否可以拖动
            isEditable: {
                type: Boolean,
                default: true
            },
            // 是否可以选中日历格
            isSelectable: {
                type: Boolean,
                default: true
            },
            // 日历的配置项
            options: {
                type: Function,
                default() {
                    return () => {};
                }
            },
            // 日期格式
            formatTime: {
                type: String,
                default: 'YYYY-MM-DD'
            }
        },
        computed: {
            eventData() {
                if (this.data.length) {
                    this.data.map((item) => {
                        item.start = dayjs(item.startTime).format(this.formatTime);
                        // 结束日期 到了页面渲染的时候只能显示到结束日期的前一天。看官网应该是最后一天不计。解决方法是在 取最后一天的天数 + 1
                        item.end = dayjs(dayjs(item.finishTime).add(1, 'day').toString()).format(this.formatTime);
                        return item;
                    });
                    return this.data;
                }
            },
            innerOptions() {
                let _this = this;
                let defaultOptions = {
                    height: this.height + 'px', // auto
                    visibleRange: { start: '2000-01-01', end: '2100-12-31' }, // 可视化区间，必须设置，否则查询列表不会显示事件
                    initialView: 'multiMonthYear', // 类型
                    locale: _this.locale[_this.lan] || 'zh-cn',
                    timeZone: 'UTC',
                    initialDate: _this.newDate,
                    // firstDay: 1, //设置左侧第一天 0是周日，1代表周一
                    aspectRatio: 0.9, // 设置日历单元格宽度与高度的比例   纵横比需注意！！！
                    dayMaxEventRows: 3, // 日历显示事件最大条数
                    multiMonthMaxColumns: this.multiMonthMaxColumns, // 每行显示个数
                    multiMonthMinWidth: 100, // 每个日历宽度
                    // dayHeaders: false,
                    allDaySlot: true, // 不显示all-day
                    handleWindowResize: true, //是否随浏览器窗口大小变化而自动变化
                    slotEventOverlap: true, // 相同时间段的多个日程视觉上是否允许重叠，默认true允许
                    editable: this.isEditable, //是否可以进行（拖动、缩放）修改
                    droppable: true,
                    selectable: this.isSelectable, // 是否可以选中日历格
                    selectMinDistance: 0, // 选中日历格的最小距离
                    eventStartEditable: false, //Event日程开始时间可以改变，默认true，如果是false其实就是指日程块不能随意拖动，只能上下拉伸改变他的endTime
                    eventDurationEditable: false, // Event日程的开始结束时间距离是否可以改变，默认true，如果是false则表示开始结束时间范围不能拉伸，只能拖拽
                    // 顶部按钮
                    headerToolbar: {
                        start: 'prev',
                        center: 'title',
                        end: 'next'
                    },
                    // 按钮显示名称
                    buttonText: {
                        today: '今天'
                    },
                    // 自定义按钮
                    customButtons: {
                        prev: {
                            click: function () {
                                _this.prevYearCustomClick();
                            }
                        },
                        next: {
                            click: function () {
                                _this.nextYearCustomClick();
                            }
                        }
                    },
                    weekends: true, //是否显示周末，设为false则不显示周六和周日
                    weekNumbers: false, //是否在日历中显示周次(一年中的第几周)，如果设置为true，则会在月视图的左侧、周视图和日视图的左上角显示周数。
                    weekText: '周',
                    displayEventEnd: true, // 显示事件结束
                    displayEventTime: true,
                    // weekNumbers: true,
                    // eventLimit: true, //数据条数太多时，限制各自里显示的数据条数（多余的以“+2more”格式显示），默认false不限制,支持输入数字设定固定的显示条数
                    // eventMaxStack: 2,
                    moreLinkContent: '+更多', //当一块区域内容太多以"+2 more"格式显示时，这个more的名称自定义
                    contentHeight: 100,
                    nowIndicator: true, //周/日视图中显示今天当前时间点（以红线标记），默认false不显示
                    //自定义视图
                    views: {
                        multiMonthYear: {
                            dayHeaderContent(item) {
                                const weekText = item.text.includes('周') ? item.text.split('周')[1] : item.text;
                                return {
                                    html: `<span style="padding-left: 4px;color:#333;font-size:14px;"><label style="font-weight: 700;">${weekText}</label></span>`
                                };
                            },
                            dayCellContent(item) {
                                const dayNumberText = item.dayNumberText.includes('日')
                                    ? item.dayNumberText.split('日')[0]
                                    : item.dayNumberText;
                                return {
                                    html: `<span style="padding-left: 4px;color:#666;"><label>${dayNumberText}</label></span>`
                                };
                            }
                        }
                    },
                    // 自定义顶部标题显示
                    titleFormat: function (value) {
                        return _this.$t('holidaySetting', { year: value.date.year });
                    },
                    // 将外部数据源转换成FullCalendar可以处理的数据
                    eventDataTransform: function (arg) {},
                    eventTimeFormat: {
                        // 在每个事件上显示的时间的格式
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: false
                    },
                    // 当浏览器窗口变化时触发
                    windowResize: function (view) {},
                    // 事件
                    events: this.eventData, // 获取数据源
                    eventDidMount: this.eventDidMount,
                    // 获取每一天的数据，特殊处理显示工作日/节假日
                    dayCellDidMount: (info) => {
                        if (this.isWorkDay(info.date)) {
                            info.el?.classList?.add('workday');
                        }
                    },
                    moreLinkDidMount: function (info) {},
                    moreLinkWillUnmount: function (info) {},
                    dateClick: this.handleDateClick, // 点击日期
                    // loading: this.loadingEvent, // 视图数据加载中、加载完成触发（用于配合显示/隐藏加载指示器。）
                    // selectAllow: this.selectAllow, //编程控制用户可以选择的地方，返回true则表示可选择，false表示不可选择
                    select: this.selectDate, // 选中日历格事件
                    eventMouseEnter: this.eventMouseEnter, // 鼠标悬浮事件 / 鼠标滑过
                    eventMouseLeave: this.eventMouseLeave, // 鼠标移出事件发生的事件
                    eventClick: this.eventClick, // 选中备忘录事件
                    eventResize: this.onEventResize, // 事件时间区间调整
                    eventDrop: this.onEventResize, // 事件Drag-Drop事件
                    unselect(event) {},
                    // 当前视图的日期信息
                    datesSet(arg) {
                        _this.newDate = dayjs(arg.start).format('YYYY');
                    },
                    eventChange(event) {},
                    eventDragStart: function (info) {}
                };
                if (typeof this.options === 'function') {
                    return this.options(defaultOptions);
                } else {
                    return defaultOptions;
                }
            }
        },
        mounted() {
            this.init('first');
        },
        watch: {
            // 例外工作时间配置
            currentData: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (nv) {
                        // 切换年份时需要把年份传过来，不然会重载回到默认年份
                        if (nv?.year) this.newDate = nv.year;
                        // 防止修改源数据导致重复触发
                        this.currentDataClone = JSON.parse(JSON.stringify(nv));
                        this.reload();
                    }
                }
            },
            // 数据源发生变化时
            eventData: {
                deep: true,
                handler(nv) {
                    if (nv) this.reload();
                }
            }
        },
        methods: {
            init(type = null) {
                if (type) this.currentDataClone = JSON.parse(JSON.stringify(this?.currentData));

                let calendarEl = document.getElementById('calendarEl');
                if (calendarEl) {
                    let FamCalendar = new window.FullCalendar.Calendar(calendarEl, this.innerOptions);
                    this.FamCalendar = FamCalendar;
                    FamCalendar.render();
                    this.scrollToCalendar();
                }
            },
            // 重载日历组件
            reload() {
                if (this.FamCalendar) {
                    this.FamCalendar.destroy();
                    this.init();
                }
            },
            // 处理打开日历时，滚动条在中间位置
            scrollToCalendar() {
                let cldScroll = document.getElementsByClassName('fc-multiMonthYear-view')?.[0];
                if (cldScroll) cldScroll.scrollTop = 0;
            },
            //点击事件
            eventClick: function (info) {
                this.$emit('eventclick', info);
            },
            eventDidMount(dateClickInfo) {
                const eventId = dateClickInfo.event.id;
                let dom = dateClickInfo.el?.parentElement?.parentElement?.parentElement;

                // 添加右键事件
                dom.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
            },
            // 单击选中日期
            handleDateClick(dateClickInfo) {
                dateClickInfo.startTime = dateClickInfo.dateStr;
                dateClickInfo.finishTime = dateClickInfo.dateStr;
                this.$emit('dateclick', dateClickInfo);
            },
            // 拖拉选择日期，填写事件
            selectDate(arg) {
                arg.name = {};
                let day = dayjs(arg.endStr).diff(arg.startStr, 'day');
                let endDate = dayjs(arg?.endStr).subtract(1, 'day').toString();
                arg.startTime = arg.startStr;
                arg.finishTime = dayjs(endDate).format(this.formatTime);
                // 拖拽选中
                if (day > 1) this.$emit('dateclick', arg);
                let calendarApi = arg.view.calendar;
                // 清除当前日期选择
                calendarApi.unselect();
            },
            // 鼠标划过，使用tippy插件显示tooltip
            eventMouseEnter(info) {
                this.$emit('onmouseenter', info);
            },
            // 鼠标离开
            eventMouseLeave(arg) {
                this.$emit('onmouseleave', arg);
            },
            // 事项调整时间区间事件
            onEventResize(arg) {
                // 必须加这句，不然切换视图会有显示事件数目的bug
                let calendarApi = arg.view.calendar;
                calendarApi.today();
            },

            // 上一年点击
            prevYearCustomClick(arg) {
                this.FamCalendar.prevYear();
                this.$emit('changeyear', this.newDate);
            },
            // 下一年点击
            nextYearCustomClick() {
                this.FamCalendar.nextYear();
                this.$emit('changeyear', this.newDate);
            },
            /*
                处理例外工作时间
            */
            // 计算日期方式
            isWorkDay(date) {
                //工作日
                date = typeof date === 'object' ? date : new Date(this.format(null, date));
                let rst = false;
                if (this.isCycleWorkDay(date)) {
                    rst = true;
                } else if (this.currentDataClone && '' + this.currentDataClone.isIncludeException === '1') {
                    rst = this.isExceptionWorkDay(date);
                }
                return rst;
            },
            //例外工作日
            isExceptionWorkDay(date) {
                let rst = false;
                if (this.isRepeatRange(date)) {
                    rst = this.isExceptionWorkDate(date);
                }
                return rst;
            },
            // 例外工作日期
            isExceptionWorkDate(date) {
                date = typeof date === 'object' ? date : new Date(this.format(null, date));
                let rst = false;
                let repeatMode = this.currentDataClone.repeatMode;
                let monthChecked = false;
                let weekNumChecked = false;
                let weekChecked = false;
                let weekDay = date.getDay();
                let month = date.getMonth() + 1;
                let years = date.getFullYear();
                let firstWeekDay = new Date(`${years}-${month}-01`).getDay();
                // firstWeekDay = firstWeekDay === 0 ? 7 : firstWeekDay;
                weekDay = weekDay === 0 ? 7 : weekDay;
                if ('' + repeatMode === '1') {
                    //每月
                    let monthsCalc = this.calc({
                        date1: this.currentDataClone.stDate,
                        date2: date,
                        type: 'months'
                    });
                    if (this.currentDataClone.lastMonth !== 0) {
                        monthChecked = (monthsCalc + 1) % this.currentDataClone.lastMonth === 0;
                    }
                    if (this.currentDataClone?.fewWeeks !== -1) {
                        const week = +this.currentDataClone.weeks === 7 ? 0 : this.currentDataClone.weeks;
                        weekNumChecked =
                            firstWeekDay > week
                                ? +this.currentWeeks(date) - 1 === +this.currentDataClone?.fewWeeks
                                : +this.currentWeeks(date) === +this.currentDataClone?.fewWeeks;
                    } else {
                        let last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                        let lastDay = last.getDay();
                        let curDay = date.getDay();
                        let curWeeks = this.currentWeeks(date);
                        if (lastDay >= curDay) {
                            weekNumChecked = '' + curWeeks === '' + this.countWeeks(date);
                        } else {
                            weekNumChecked = '' + curWeeks === '' + (this.countWeeks(date) - 1);
                        }
                    }
                    weekChecked = '' + weekDay === '' + this.currentDataClone.weeks;
                    rst = monthChecked && weekNumChecked && weekChecked;
                } else {
                    //每周
                    let daysCalc = this.calc({
                        date1: this.currentDataClone.stDate,
                        date2: date,
                        type: 'days'
                    });
                    weekNumChecked = false;
                    weekDay = date.getDay();
                    weekDay = weekDay === 0 ? 7 : weekDay;
                    weekChecked = '' + weekDay === '' + this.currentDataClone.weeks;
                    if (this.currentDataClone?.repeatCycle !== 0) {
                        weekNumChecked = Math.ceil(daysCalc / 7) % this.currentDataClone?.repeatCycle === 0;
                    }
                    rst = weekNumChecked && weekChecked;
                }
                return rst;
            },
            isRepeatRange(date) {
                //日期是否在重复范围内
                if (!this.currentDataClone.fsDate || this.currentDataClone.stDate) {
                    this.calcRepeatRange(date);
                }
                let start = this.format(null, this.currentDataClone.stDate);
                let end = this.format(null, this.currentDataClone.fsDate);
                let nowDate = this.format(null, date);
                return nowDate >= start && nowDate <= end;
            },
            calcRepeatRange(date) {
                // 计算重复范围
                let repeatMode = this.currentDataClone.repeatMode; // 0 周   1 月
                let startTime =
                    this.currentDataClone.startTime || this.format(null, new Date(date.getFullYear() + '-01-01'));
                let finishTime =
                    this.currentDataClone.finishTime || this.format(null, new Date(date.getFullYear() + '-12-31'));
                let stDate = new Date(this.format(null, startTime));
                let fsDate =
                    new Date(this.format(null, finishTime)) || window.dayjs(new Date(this.format(null, finishTime)));
                // 重复次数中选择重复且有次数时
                if (this?.currentDataClone?.isRepetition === '1' && this?.currentDataClone?.repetitions) {
                    let repetitions = this?.currentDataClone?.repetitions;
                    if (this.currentDataClone?.repetitionsCount) {
                        let { repetitionsCount } = this.currentDataClone; // 周期内重复次数
                        // 周期内的次数 A 与 设置的重复次数 B 作比较 如果A >= B 时 取 B 反之取 A
                        repetitions = repetitionsCount >= repetitions ? repetitions : repetitionsCount;
                    }
                    if ('' + repeatMode === '1') {
                        let lastMonth = this?.currentDataClone?.lastMonth;
                        fsDate = new Date(this.format(null, startTime));
                        fsDate = dayjs(fsDate);
                        fsDate = fsDate.endOf('month');
                        fsDate = fsDate.add(repetitions * lastMonth - 1 > 11 ? 11 : repetitions * lastMonth, 'month');
                        fsDate = fsDate.subtract(1, 'month');
                    } else {
                        // 每周
                        let repeatCycle = this.currentDataClone?.repeatCycle;
                        fsDate = new Date(this.format(null, startTime));
                        fsDate = window.dayjs(fsDate);
                        fsDate = fsDate.endOf('week');
                        fsDate = fsDate.add(repetitions * repeatCycle - 1, 'week');
                    }
                }
                this.currentDataClone.stDate = stDate;
                this.currentDataClone.fsDate = fsDate;
                this.currentDataClone.startTime = this.format(null, stDate);
                this.currentDataClone.finishTime = this.format(null, fsDate);
            },
            isCycleWorkDay(date) {
                //正常工作日
                let day = date.getDay();
                day = day === 0 ? 7 : day;
                let rst = false;
                if (this.currentDataClone && this.currentDataClone.cycle) {
                    rst = ('' + this.currentDataClone.cycle).indexOf(day) !== -1;
                }
                return rst;
            },
            currentWeeks(date) {
                date = typeof date === 'object' ? date : new Date(this.format(null, date));
                let w = date.getDay();
                let d = date.getDate();
                return Math.ceil((d + 6 - w) / 7);
            },
            countWeeks(date) {
                date = typeof date === 'object' ? date : new Date(this.format(null, date));
                date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                return this.currentWeeks(date);
            },
            calc(opt) {
                let dftOpt = {
                    date1: new Date(),
                    date2: new Date(),
                    type: 'days'
                };
                opt = _.defaults(opt, dftOpt);
                let date1 = typeof opt.date1 === 'object' ? opt.date1 : new Date(dayjs(opt.date1).format());
                let date2 = typeof opt.date2 === 'object' ? opt.date2 : new Date(dayjs(opt.date2).format());
                let rst = 0;
                let time1 = date1.getTime();
                let time2 = date2.getTime();
                switch (opt.type) {
                    case 'days':
                        {
                            rst = (time2 - time1) / 1000 / 60 / 60 / 24;
                        }
                        break;
                    case 'months':
                        {
                            let years = date2.getFullYear() - date1.getFullYear();
                            let months = date2.getMonth() - date1.getMonth();
                            rst = years * 12 + months;
                        }
                        break;
                    case 'years':
                        {
                            rst = date2.getFullYear() - date1.getFullYear();
                        }
                        break;
                    default: {
                        rst = (time2 - time1) / 1000 / 60 / 60 / 24;
                    }
                }
                return rst;
            },
            format(fmt, date) {
                fmt = fmt ? fmt : 'YYYY-MM-DD';
                date = date ? date : new Date();
                date = typeof date === 'object' ? date : new Date(date.substr(0, 10));
                return dayjs(date).format(fmt || 'YYYY-MM-DD HH:mm:ss');
            }
        }
    };
});
