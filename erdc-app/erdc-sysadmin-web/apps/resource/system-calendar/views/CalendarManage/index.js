define([
    'text!' + ELMP.resource('system-calendar/views/CalendarManage/index.html'),
    'css!' + ELMP.resource('system-calendar/views/CalendarManage/style.css'),
    'dayjs'
], function (template) {
    const dayjs = require('dayjs');
    const FamKit = require('fam:kit');

    const colorStack = {
        节假日: '#F5BB00',
        工作日: '#1abc9c'
    };
    const holiday = '0';
    const formatType = 'YYYY-MM-DD';

    return {
        name: 'calendar',
        template,
        props: {
            calendarTitle: String,
            // 自定义获取日历数据
            customInitData: Function,
            // 不能修改日历提示
            cannotDeleteTips: {
                type: String,
                default: ''
            },
            // 不能修改日历提示
            cannotUpdateTips: {
                type: String,
                default: ''
            },
            // 不能创建日历提示
            cannotCreateTips: {
                type: String,
                default: ''
            },
            // 禁用创建日历按钮
            isDisabledCreateBtn: {
                type: Boolean,
                default: false
            },
            // 是否可以设置节假日
            isCanSetData: {
                type: Boolean,
                default: true
            }
        },
        components: {
            FamCalendar: FamKit.asyncComponent(ELMP.resource('erdc-components/FamCalendar/index.js')),
            calendarOperation: FamKit.asyncComponent(
                ELMP.resource('system-calendar/components/calendarOperation/index.js')
            ),
            DialogCreateCalendar: FamKit.asyncComponent(
                ELMP.resource('system-calendar/components/DialogCreateCalendar/index.js')
            ),
            DialogSystemCalendarConfig: FamKit.asyncComponent(
                ELMP.resource('system-calendar/components/DialogSystemCalendarConfig/index.js')
            ),
            DialogSettingDays: FamKit.asyncComponent(
                ELMP.resource('system-calendar/components/DialogSettingDays/index.js')
            ),
            ShowDayList: FamKit.asyncComponent(ELMP.resource('system-calendar/components/ShowDayList/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-calendar/locale/index.js'),
                i18nMappingObj: {
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    confirmDeleteTips: this.getI18nByKey('confirmDeleteTips'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    successfullyDelete: this.getI18nByKey('successfullyDelete'),
                    cannotModified: this.getI18nByKey('cannotModified')
                },
                calendarHeight: null,
                currentCalendarOid: '',
                calendarId: '',
                newOid: '',
                dialogCreateVisible: false,
                dialogConfigVisible: false,
                dialogDayVisible: false,
                title: '',
                setDayTitle: '',
                setDayType: 'create',
                openType: 'create',
                dateConfig: null,
                holidayList: [], // 节假日列表
                eventData: [],
                cldList: [], // 日历列表
                defaultProps: {
                    label: 'displayName',
                    value: 'oid',
                    key: 'oid'
                },
                currentData: {},
                testData: {
                    children: 'children',
                    disabled: 'disabled',
                    label: 'displayName',
                    value: 'oid'
                },
                isContextCalendar: false
            };
        },
        mounted() {
            this.initData();
            this.calendarHeight = document.getElementsByClassName('fam-main__right')[0].clientHeight - 178;
        },
        computed: {
            legends() {
                return [
                    {
                        name: this.i18n.working,
                        color: '#666',
                        bgColor: '#fff'
                    },
                    {
                        name: this.i18n.holiday,
                        color: '#fff',
                        bgColor: '#F5BB00'
                    },
                    {
                        name: this.i18n.weekday,
                        color: '#fff',
                        bgColor: '#1abc9c'
                    }
                ];
            },
            disabledTips() {
                return this.cannotDeleteTips || this.i18nMappingObj.cannotModified;
            },
            innerCalendarTitle() {
                return this.calendarTitle || this.i18n.systemCalendar;
            },
            showTitle() {
                return this.$route.matched.some((route) => route.meta.showRouteTitle);
            }
        },
        watch: {
            currentCalendarOid: {
                handler() {
                    this.initData('updateRules');
                }
            }
        },
        methods: {
            // 修改日历配置
            handleOptions(data) {
                // data.titleFormat = function () {
                //     let title = '123';
                //     return title;
                // };
                return data;
            },
            initData(type = null) {
                return new Promise((resolve, reject) => {
                    if (_.isFunction(this.customInitData)) {
                        this.customInitData(type, resolve);
                    } else {
                        this.$famHttp({
                            url: '/fam/calendar/all',
                            method: 'get'
                        })
                            .then((res) => {
                                let result = res.data;
                                let currentData;
                                // 将日历一级节点禁用，默认节点添加默认字段
                                result.forEach((item) => {
                                    item.disabled = true;
                                    item.children?.forEach((ite) => {
                                        if (ite.isDefault === '1') {
                                            ite.displayName += `（${this.i18n.default}）`;
                                        }
                                    });
                                });
                                this.cldList = result;
                                // this.currentCalendarOid = result?.[0]?.oid;
                                // this.calendarId = result?.[0]?.id;
                                if (!type) {
                                    // flatten将多层数组转换为一层数组
                                    currentData = _.flatten(
                                        result?.map((item) => {
                                            let arr = [];
                                            item.children?.forEach((ite) => {
                                                arr.push({
                                                    ...ite,
                                                    stDate: dayjs(ite?.startTime).$d || '',
                                                    fsDate: dayjs(ite?.finishTime).$d || ''
                                                });
                                            });
                                            return arr;
                                        })
                                    )?.find((item) => {
                                        this.currentCalendarOid = item.oid;
                                        this.calendarId = item.id;
                                        return item.isDefault === '1';
                                    });
                                } else if (type == 'updateRules') {
                                    currentData = _.flatten(
                                        result?.map((item) => {
                                            let arr = [];
                                            item.children?.forEach((ite) => {
                                                arr.push({
                                                    ...ite,
                                                    startTime: dayjs(ite.startTime).format(formatType),
                                                    finishTime: dayjs(ite.finishTime).format(formatType),
                                                    fewWeeks: ite?.fewWeeks || -1,
                                                    repeatCycle: ite?.lastMonth || 1
                                                });
                                            });
                                            return arr;
                                        })
                                    )?.find((item) => {
                                        this.calendarId = item.id;
                                        return item.oid == this.currentCalendarOid;
                                    });
                                }
                                this.isContextCalendar = currentData?.calendarType === '1';
                                if (this?.calendarId) {
                                    this.getIncludeException(this?.calendarId).then((res) => {
                                        this.currentData = { ...currentData, repetitionsCount: res.data };
                                    });
                                }
                                resolve(result);
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    }
                });
            },
            // 获取周期时间内重复次数
            getIncludeException(calendarId) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/calendar/getIncludeException',
                        params: {
                            calendarId
                        },
                        method: 'GET'
                    })
                        .then((res) => {
                            resolve(res);
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            },
            setDayList(val) {
                this.eventData = val;
            },
            // 新建日历
            DialogCreateCalendar() {
                this.title = this.i18n.newCalendar;
                this.dialogCreateVisible = true;
                this.openType = 'create';
            },
            updateCldList(data) {
                this.initData('update').then(() => {
                    if (this.$listeners['after-update']) {
                        this.$emit('after-update', data);
                    } else {
                        this.isContextCalendar = data?.calendarType === '1';
                        this.currentCalendarOid = data.oid;
                        this.calendarId = data.id;
                        this.currentData = data;
                    }
                });
            },
            // 打开系统日历配置
            openCalendarConfig(val) {
                this.configTitle = this.i18n.calendarConfig;
                this.dialogConfigVisible = true;
                if (typeof val == 'string') this.newOid = val;
                // this.openType = 'create';
            },
            // 删除日历
            deleteCalendar() {
                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDeleteTips'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                }).then(() => {
                    this.$famHttp({
                        url: '/fam/delete',
                        params: {
                            oid: this.currentCalendarOid
                        },
                        method: 'delete'
                    }).then(() => {
                        this.$message({
                            message: this.i18nMappingObj['successfullyDelete'],
                            type: 'success',
                            showClose: true
                        });
                        this.initData();
                    });
                });
            },
            // 设置节假日
            setHoliday(type, val) {
                this.dialogDayVisible = true;
                if (type === 'update') {
                    this.setDayTitle = this.i18n.edit;
                    this.setDayType = 'update';
                    this.dateConfig = val;
                } else {
                    this.setDayTitle = this.i18n.create;
                    this.setDayType = 'create';
                    this.dateConfig = null;
                }
            },
            // 日历中选择日历时快捷设置工作日
            selectDate(arg) {
                if (!this.isCanSetData) {
                    return this.$message({
                        type: 'warning',
                        message: this.cannotUpdateTips
                    });
                }
                let calendarId = this.calendarId;
                let date = arg.startTime;
                this.$famHttp({
                    url: `/fam/holiday/${calendarId}/${date}`,
                    async: false,
                    method: 'get'
                }).then((res) => {
                    let result = res.data;
                    if (result?.name) {
                        this.setDayTitle = this.i18n.edit;
                        this.setDayType = 'update';
                        arg.name = result?.name;
                        arg.dayType = result?.dayType;
                        arg.startTime = result?.startTime;
                        arg.finishTime = result?.finishTime;
                        arg.oid = result?.oid;
                    } else {
                        this.setDayTitle = this.i18n.create;
                        this.setDayType = 'create';
                    }
                    this.dialogDayVisible = true;
                    this.dateConfig = arg;
                });
            },
            // 更新节假日列表
            updateDayList() {
                this.$refs.DayListRef.getHoliday(this.currentCalendarOid);
            },
            // 切换年份
            changeYear(year) {
                this.$famHttp({
                    url: `/fam/calendar/${this.calendarId}`,
                    params: {
                        year
                    },
                    method: 'get'
                }).then((res) => {
                    this.currentData = {
                        ...res.data,
                        // startTime: dayjs(res.data.startTime).format(formatType),
                        // finishTime: dayjs(res.data.finishTime).format(formatType),
                        year
                    };
                    this.holidayList = res.data?.systemCalendarHolidayList?.map((item) => {
                        return {
                            ...item,
                            finishTime: dayjs(item.finishTime).format(formatType),
                            startTime: dayjs(item.startTime).format(formatType),
                            backgroundColor: item?.dayType === holiday ? colorStack['节假日'] : colorStack['工作日'],
                            allDay: true
                        };
                    });
                });
            },
            // 更新例外工作时间
            updateRules() {
                this.initData('updateRules');
            }
        }
    };
});
