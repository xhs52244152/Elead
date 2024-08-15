/*
展示节假日列表
ShowDayList: FamKit.asyncComponent(ELMP.resource('system-calendar/components/ShowDayList/index.js')),

<setting-days
        v-if="dialogDayVisible"
        :visible.sync="dialogDayVisible"
        @onsubmit="onSubmit"
    ></setting-days>
*/
define([
    'text!' + ELMP.resource('system-calendar/components/ShowDayList/template.html'),
    'dayjs',
    'css!' + ELMP.resource('system-calendar/components/ShowDayList/index.css')
], function (template, dayjs) {
    const FamKit = require('fam:kit');
    const colorStack = {
        节假日: '#F5BB00',
        工作日: '#1abc9c'
    };
    const holiday = '0';

    return {
        template,
        components: {
            FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            // 显示隐藏
            visibleBtn: {
                type: Boolean,
                default: false
            },
            oid: {
                type: String,
                default: ''
            },
            tableHeight: {
                type: String,
                default: '280'
            },
            holidayList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            isContextCalendar: {
                type: Boolean,
                default: false
            },
            cannotUpdateTips: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-calendar/components/ShowDayList/locale/index.js'),
                i18nMappingObj: {
                    name: this.getI18nByKey('name'),
                    add: this.getI18nByKey('add'),
                    delete: this.getI18nByKey('delete'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    confirmDeleteTips: this.getI18nByKey('confirmDeleteTips'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    emptyTip: this.getI18nByKey('该年度还没有设置节假日'),
                    successfullyDelete: this.getI18nByKey('successfullyDelete'),
                    cannotModified: this.getI18nByKey('cannotModified')
                },
                tableData: [],
                checkList: []
            };
        },
        watch: {
            oid: {
                immediate: true,
                handler(nv) {
                    if (nv) this.getHoliday(nv);
                }
            },
            tableData: {
                immediate: true,
                handler(nv) {
                    if (nv) this.$emit('setDay', nv);
                }
            },
            holidayList: {
                immediate: true,
                handler(nv) {
                    if (nv) this.tableData = nv;
                }
            }
        },
        computed: {
            title() {
                return this.i18n.yearSettings;
            },
            tableConfig() {
                return {
                    border: true,
                    height: this.tableMaxHeight,
                    rowConfig: {
                        isCurrent: true,
                        isHover: true
                    },
                    columnConfig: {
                        resizable: true
                    },
                    align: 'left',
                    showOverflow: 'ellipsis', // 不显示溢出部分文字
                    // 列
                    column: [
                        {
                            prop: 'checkbox',
                            title: '',
                            minWidth: '50',
                            width: '50',
                            type: 'checkbox',
                            align: 'center'
                        },
                        {
                            prop: 'name', // 参与者
                            sort: false,
                            className: 'editIcon',
                            title: this.i18nMappingObj?.['name']
                        }
                    ]
                };
            },
            disabledTips() {
                return this.cannotUpdateTips || this.i18nMappingObj.cannotModified;
            }
        },
        mounted() {},
        methods: {
            // 获取节假日列表
            getHoliday(oid) {
                this.$famHttp({
                    url: '/fam/getByOid',
                    params: {
                        oid
                    },
                    method: 'get'
                }).then((res) => {
                    this.tableData = res.data?.systemCalendarHolidayList?.map((item) => {
                        return {
                            ...item,
                            finishTime: dayjs(item.finishTime).format('YYYY-MM-DD'),
                            startTime: dayjs(item.startTime).format('YYYY-MM-DD'),
                            backgroundColor: item?.dayType === holiday ? colorStack['节假日'] : colorStack['工作日'],
                            allDay: true
                        };
                    });
                    this.$emit('change-holiday', this.tableData);
                });
            },
            // 新增节假日
            setHoliday() {
                this.$emit('created', 'create');
            },
            // 编辑节假日
            editHoliday(row) {
                if(this.isContextCalendar) {
                    return this.$message({
                        showClose: true,
                        message: this.disabledTips,
                        type: 'warning'
                    });
                }
                this.$emit('created', 'update', row);
            },
            // 删除节假日
            delHoliday() {
                if (this.checkList.length) {
                    this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['confirmDeleteTips'], {
                        confirmButtonText: this.i18nMappingObj['confirm'],
                        cancelButtonText: this.i18nMappingObj['cancel'],
                        type: 'warning'
                    }).then(() => {
                        let data = {
                            oidList: this.checkList,
                            className: 'erd.cloud.foundation.calendar.entity.SystemCalendarHoliday'
                        };
                        this.$famHttp({
                            url: '/fam/deleteByIds',
                            data,
                            method: 'delete'
                        })
                            .then((resp) => {
                                this.$message({
                                    message: this.i18nMappingObj['successfullyDelete'],
                                    type: 'success',
                                    showClose: true
                                });
                                this.checkList = [];
                                this.getHoliday(this.oid);
                            })
                            .catch((error) => {});
                    });
                }
            },
            // 选中节假日
            changeCheck(data) {
                this.checkList = data.records.map((item) => item.oid);
            },
            // 类型
            filterDay(val) {
                let displayLabel = val;
                switch (val) {
                    case '0':
                        displayLabel = this.i18n.holiday;
                        break;
                    case '1':
                        displayLabel = this.i18n.weekday;
                        break;
                    default:
                        break;
                }
                return displayLabel;
            }
        }
    };
});
