/**
 * 日期组件
 * componentName
 * custom-date-time 日期，格式yyyy-MM-dd
 * custom-date-range 区间日期框，格式yyyy-MM-dd
 * **/
define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/CustomDateTime/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/CustomDateTime/style.css')
], function (template, utils) {
    const SPECIFICTYPE = 'createTime';

    return {
        template: template,
        props: {
            value: {
                type: String | Array
            },
            // 当前数据行
            row: {
                type: Object,
                default() {
                    return null;
                }
            },
            // 范围分隔符
            rangeSeparator: String,
            // 条件操作
            oper: {
                type: String,
                default: ''
            },
            timeLimitType: {
                type: String,
                default: ''
            },
            // 对应限制时间
            timeLimit: {
                type: String,
                default: ''
            },
            clearable: {
                type: Boolean,
                default: true
            },
            disabled: Boolean
        },
        data() {
            return {
                showDateTimePicker: true
            };
        },
        computed: {
            dateValue: {
                get() {
                    return this.value;
                },
                set(vals) {
                    this.$emit('input', vals);
                    if (vals) {
                        let dateType =
                            this.row?.componentName?.includes('date-range') || this.oper?.includes('BETWEEN')
                                ? 'daterange'
                                : 'date';
                        if (dateType === 'daterange') {
                            this.$emit('callback', {
                                value: vals,
                                label: vals.join(','),
                                field: this.row?.field
                            });
                        }
                    }
                }
            },
            placeholder() {
                return this.row?.placeholder || utils.setTextBySysLanguage({ CN: '选择日期', EN: 'Select Date' });
            },
            dateFormat() {
                let dateFormat = this.row?.dateFormat || 'yyyy-MM-dd';
                // 临时处理方案，后续讨论方案修改
                if (this.row?.attrName?.includes(SPECIFICTYPE)) {
                    dateFormat = 'yyyy-MM-dd';
                }
                return dateFormat;
            },
            separator() {
                return (
                    this.rangeSeparator ||
                    this.row?.separator ||
                    utils.setTextBySysLanguage({
                        CN: '至',
                        EN: 'To'
                    })
                );
            },
            startPlaceholder() {
                return this.row?.startPlaceholder || utils.setTextBySysLanguage({ CN: '开始日期', EN: 'Start Date' });
            },
            endPlaceholder() {
                return this.row?.endPlaceholder || utils.setTextBySysLanguage({ CN: '结束日期', EN: 'End Date' });
            },
            type() {
                if (this.row?.type) {
                    return this.row?.type;
                }
                let dateType =
                    this.row?.componentName?.includes('date-range') || this.oper?.includes('BETWEEN')
                        ? 'daterange'
                        : 'date';
                // 1、值为数组，类型为date，则清空
                // 2、值不是数组，类型为daterange，则清空
                if (_.isArray(this.value)) {
                    if (dateType === 'date') {
                        this.dateValue = null;
                    }
                } else if (dateType === 'daterange') {
                    this.dateValue = null;
                }
                return dateType;
            },
            pickerOptions() {
                return {
                    disabledDate: (time) => {
                        if (!this.timeLimit || !this.timeLimitType) {
                            return false;
                        }
                        if (this.timeLimitType === 'timeUpperLimit') {
                            return time.getTime() > new Date(this.timeLimit + ' 00:00:00').getTime();
                        } else {
                            return time.getTime() < new Date(this.timeLimit + ' 00:00:00').getTime();
                        }
                    }
                };
            }
        },
        watch: {
            type() {
                this.showDateTimePicker = false;
                this.dateValue = null;
                this.$nextTick(() => {
                    this.showDateTimePicker = true;
                });
            },
            dateFormat() {
                this.showDateTimePicker = false;
                this.dateValue = null;
                this.$nextTick(() => {
                    this.showDateTimePicker = true;
                });
            }
        },
        methods: {
            focus() {
                let datePicker = this.$refs?.datePicker;
                setTimeout(() => {
                    datePicker && datePicker.focus && datePicker.focus();
                }, 100);
            }
        }
    };
});
