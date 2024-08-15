define([
    'text!' + ELMP.resource('system-queue/components/CronConfig/index.html'),
    'css!' + ELMP.resource('system-queue/components/CronConfig/style.css')
], function (template) {
    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 任务队列
            instanceId: {
                type: String,
                default: () => {
                    return '';
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-queue/components/CronConfig/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    expressionField: this.getI18nByKey('表达式字段'),
                    second: this.getI18nByKey('秒'),
                    minute: this.getI18nByKey('分钟'),
                    hour: this.getI18nByKey('小时'),
                    day: this.getI18nByKey('日'),
                    month: this.getI18nByKey('月'),
                    week: this.getI18nByKey('星期'),
                    year: this.getI18nByKey('年'),
                    allowWildcard: this.getI18nByKey('允许的通配符'),
                    cycleFrom: this.getI18nByKey('周期从'),
                    from: this.getI18nByKey('从'),
                    start: this.getI18nByKey('开始'),
                    every: this.getI18nByKey('每'),
                    once: this.getI18nByKey('执行一次'),
                    specify: this.getI18nByKey('指定'),
                    unspecify: this.getI18nByKey('不指定'),
                    expression: this.getI18nByKey('CRON表达式')
                },
                // 表单项
                formDataBasic: {
                    second: '*',
                    minute: '*',
                    hour: '*',
                    day: '*',
                    month: '*',
                    week: '*',
                    year: ''
                },
                triangularLeft: '164px',
                focusItem: 'second',
                configData: {
                    second: {
                        radio: 'wildcard',
                        cycleMin: 1,
                        cycleMax: 2,
                        startTime: 1,
                        timeCount: 1,
                        checkbox: []
                    },
                    minute: {
                        radio: 'wildcard',
                        cycleMin: 1,
                        cycleMax: 2,
                        startTime: 1,
                        timeCount: 1,
                        checkbox: []
                    },
                    hour: {
                        radio: 'wildcard',
                        cycleMin: 1,
                        cycleMax: 2,
                        startTime: 1,
                        timeCount: 1,
                        checkbox: []
                    },
                    day: {
                        radio: 'wildcard',
                        cycleMin: 1,
                        cycleMax: 2,
                        startTime: 1,
                        timeCount: 1,
                        checkbox: [],
                        recentDay: 1
                    },
                    month: {
                        radio: 'wildcard',
                        cycleMin: 1,
                        cycleMax: 2,
                        startTime: 1,
                        timeCount: 1,
                        checkbox: [],
                        recentDay: 1
                    },
                    week: {
                        radio: 'wildcard',
                        cycleMin: 1,
                        cycleMax: 2,
                        startTime: 1,
                        timeCount: 1,
                        checkbox: [],
                        lastWeek: 1
                    },
                    year: {
                        radio: 'unSpecify',
                        cycleMin: 2013,
                        cycleMax: 2014
                    }
                }
            };
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            CRON() {
                let CRON = `${this.formData.second} ${this.formData.minute} ${this.formData.hour} ${this.formData.day} ${this.formData.month} ${this.formData.week} ${this.formData.year} `;
                return CRON;
            },
            formData() {
                let formData = this.formDataBasic;

                if (this.configData[this.focusItem].radio == 'wildcard') {
                    formData[this.focusItem] = '*';
                } else if (this.configData[this.focusItem].radio == 'cycle') {
                    formData[this.focusItem] =
                        this.configData[this.focusItem].cycleMin + '-' + this.configData[this.focusItem].cycleMax;
                } else if (this.configData[this.focusItem].radio == 'execution') {
                    formData[this.focusItem] =
                        this.configData[this.focusItem].startTime + '/' + this.configData[this.focusItem].timeCount;
                } else if (this.configData[this.focusItem].radio == 'specify') {
                    formData[this.focusItem] = this.configData[this.focusItem].checkbox.join(',') || '?';
                } else if (this.configData[this.focusItem].radio == 'unSpecify') {
                    formData[this.focusItem] = this.focusItem == 'year' ? '' : '?';
                } else if (this.configData[this.focusItem].radio == 'recentDay') {
                    formData[this.focusItem] = this.configData[this.focusItem].recentDay + 'W';
                } else if (this.configData[this.focusItem].radio == 'lastDay') {
                    formData[this.focusItem] = 'L';
                } else if (this.configData[this.focusItem].radio == 'lastWeek') {
                    formData[this.focusItem] = this.configData[this.focusItem].lastWeek + 'L';
                } else if (this.configData[this.focusItem].radio == 'everyYear') {
                    formData[this.focusItem] = '*';
                }

                this.formDataBasic = formData;
                return formData;
            }
        },
        mounted() {},
        methods: {
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            onSubmit() {
                this.$emit('onsubmit', this.CRON);
                this.toogleShow();
            },
            onCancle() {
                this.toogleShow();
            },
            onFocus(data) {
                this.focusItem = data;
            },
            onBlur(data) {},
            radioChange(value) {
                if (value === 'specify') {
                    if (!this.configData[this.focusItem].checkbox?.length) {
                        this.configData[this.focusItem].checkbox = [0];
                    }
                }
            },
            checkboxChange(value) {
                // if (this.configData[this.focusItem].radio == 'specify') {
                //     this.formData[this.focusItem] = this.configData[this.focusItem].checkbox.join(',')
                // }
            },
            // 数字补零
            replenish(value) {
                if (value < 10) {
                    value = '0' + value;
                }
                return value;
            }
        }
    };
});
