define([
    'text!' + ELMP.func('erdc-ppm-work-hour/views/my-work-hour/index.html'),
    ELMP.func('erdc-ppm-work-hour/app/store/index.js'),
    'EventBus',
    'dayjs',
    'css!' + ELMP.func('erdc-ppm-work-hour/views/style.css')
], function (template, store, EventBus, dayjs) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-work-hour/locale/index.js'),
                i18nMappingObj: {
                    weekReportTitle: this.getI18nByKey('weekReportTitle'), // 周报标题
                    cycle: this.getI18nByKey('cycle'), // 周期
                    submitter: this.getI18nByKey('submitter'), // 提交人
                    status: this.getI18nByKey('status') // 状态
                },
                checkData: []
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        computed: {
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.timesheet.entity.TimesheetGroup#name',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.timesheet.entity.TimesheetGroup#several',
                        type: 'default'
                    },
                    {
                        prop: 'submitter',
                        type: 'default'
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.workHour;
            },
            sceneName() {
                return this.$route.meta.sceneName || '';
            },
            routeName() {
                return this.$route.name || '';
            },
            viewTableConfig() {
                const _this = this;
                return {
                    tableKey: 'TimesheetReportView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        addOperationCol: false,
                        tableBaseConfig: {
                            showOverflow: true
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {},
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: false
                            },
                            actionConfig: {
                                name: 'PPM_MY_TIMESHEET_LIST_MENU',
                                className: _this.className
                            }
                        },

                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent, // 复选框全选
                            'checkbox-change': _this.selectChangeEvent // 复选框勾选事件
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField,
                        columns: _this.columns
                    }
                };
            },
            columns() {
                let { i18nMappingObj } = this;
                return [
                    {
                        label: i18nMappingObj.weekReportTitle,
                        attrName: 'erd.cloud.ppm.timesheet.entity.TimesheetGroup#name'
                    },
                    {
                        label: i18nMappingObj.cycle,
                        attrName: 'erd.cloud.ppm.timesheet.entity.TimesheetGroup#several'
                    },
                    {
                        label: i18nMappingObj.submitter,
                        attrName: 'submitter',
                        width: 100
                    },
                    {
                        label: i18nMappingObj.status,
                        attrName: 'erd.cloud.ppm.timesheet.entity.TimesheetGroup#lifecycleStatus.status',
                        width: 100
                    }
                ];
            },
            enableScrollLoad() {
                return true;
            }
        },
        mounted() {
            EventBus.off('PPMProcessSuccessCallback');
            EventBus.once('PPMProcessSuccessCallback', () => {
                this.refresh();
            });
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'PPM_REQUIRE_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            refresh() {
                this.$refs.table.refreshTable('default');
            },
            selectAllEvent(data) {
                this.checkData = data;
            },
            selectChangeEvent(data) {
                this.checkData = data;
            },
            openDetail(row) {
                let { displayName: state, value: stateValue } =
                    row.attrRawList.find(
                        (item) =>
                            item.attrName === 'erd.cloud.ppm.timesheet.entity.TimesheetGroup#lifecycleStatus.status'
                    ) || {};
                this.$router.push({
                    path: '/my-work-hour/edit',
                    query: {
                        oid: row.oid,
                        state,
                        start: row['erd.cloud.ppm.timesheet.entity.TimesheetGroup#startTime'],
                        stateValue
                    }
                });
            },
            getWeekDisplayName(row) {
                let date = dayjs(row['erd.cloud.ppm.timesheet.entity.TimesheetGroup#startTime']);

                let week = this.getWeek(date.toDate()),
                    year = this.getYear(week, date),
                    start = date.format('MM-DD'),
                    end = date.add(6, 'day').format('MM-DD');

                return `${year}年 第 ${week} 周（${start} 至 ${end}）`;
            },
            getWeek(src) {
                const date = new Date(src.getTime());
                date.setHours(0, 0, 0, 0);
                // 本周在哪一年占的天数更多，就算哪一年，这里就看星期四是哪一年的
                date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
                // 1月4号一定是在第一周
                const week1 = new Date(date.getFullYear(), 0, 4);
                // 拿第1周中的星期四做对比，并计算从日期到第1周的周数
                // 对于夏令时，舍入应该是可以的。其变动不得超过12小时
                return (
                    1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7)
                );
            },
            getYear(week, dateObject) {
                let date = dateObject.toDate();
                let month = date.getMonth();

                let trueDate = new Date(date);
                if (week === 1 && month === 11) {
                    trueDate.setHours(0, 0, 0, 0);
                    // 取该周周四
                    trueDate.setDate(trueDate.getDate() + 3 - ((trueDate.getDay() + 6) % 7));
                }
                return dayjs(trueDate).format('YYYY');
            },
            getUserDisplayName() {
                return this.$store.state?.app?.user.displayName;
            }
        }
    };
});
