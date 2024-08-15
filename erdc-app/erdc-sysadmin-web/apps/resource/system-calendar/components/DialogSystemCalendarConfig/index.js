/*
系统日历配置
DialogSystemCalendarConfig: FamKit.asyncComponent(ELMP.resource('system-calendar/components/DialogSystemCalendarConfig/index.js')),

<system-calendar-config
    v-if="dialogConfigVisible"
    :visible.sync="dialogConfigVisible"
    :title="configTitle"
    @onsubmit="onSubmit"
></system-calendar-config>
*/
define([
    ELMP.resource('erdc-app/components/properties/ComponentPropertyExtends.js'),
    'text!' + ELMP.resource('system-calendar/components/DialogSystemCalendarConfig/template.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'dayjs'
], function (ComponentPropertyExtends, template, fieldTypeMapping, utils, dayjs) {
    const FamKit = require('fam:kit');
    const cldTypeReference = 'OR:erd.cloud.foundation.type.entity.TypeDefinition:1663848337839349761';
    const formatType = 'YYYY-MM-DD';

    return {
        template,
        components: {
            FamDictItemSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDictItemSelect/index.js'))
        },
        extends: ComponentPropertyExtends,
        mixins: [fieldTypeMapping],
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: false
            },
            // 标题
            title: {
                type: String,
                default: ''
            },
            // oid
            oid: {
                type: String,
                default: ''
            },
            // 新增日历选择保存并配置
            newOid: {
                type: String,
                default: ''
            },
            isContextCalendar: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-calendar/components/DialogSystemCalendarConfig/locale/index.js'),
                i18nMappingObj: {
                    basicInformation: this.getI18nByKey('日历基本信息'),
                    workSetting: this.getI18nByKey('工作周期设置'),
                    generalWork: this.getI18nByKey('常规工作周期设置'),
                    exceptional: this.getI18nByKey('例外工作时间'),
                    calendarType: this.getI18nByKey('日历类型'),
                    name: this.getI18nByKey('名称'),
                    default: this.getI18nByKey('是否默认'),
                    status: this.getI18nByKey('状态'),
                    regularWork: this.getI18nByKey('常规工作周'),
                    exceptionalPeriod: this.getI18nByKey('例外周期'),
                    frequency: this.getI18nByKey('重复频率'),
                    repetition: this.getI18nByKey('重复次数'),
                    enable: this.getI18nByKey('启用'),
                    disable: this.getI18nByKey('禁用'),
                    yes: this.getI18nByKey('是'),
                    no: this.getI18nByKey('否'),

                    help: this.getI18nByKey('帮助'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    pleaseSelect: this.getI18nByKey('请选择'),
                    cannotModified: this.getI18nByKey('上下文日历不能修改')
                },
                primaryOid: '',
                constraintOid: '',
                typeOid: null,
                className: null,
                formData: {
                    calendarType: '', // 日历类别
                    isStandard: '', // 添加属性时的类型
                    name: {}, // 日历名
                    isIncludeException: 1, // 是否包含例外（0：否；1：是）
                    isDefault: 1, // 是否默认0：否；1：是）
                    status: 1, // 状态
                    regularWorkWeekList: ['1', '2', '3', '4'], // 常规工作日
                    repeatMode: null, // 重复方式（0:每周；1：每月）
                    repeatCycle: null, // 重复周期
                    exceptionalPeriod: [], // 例外周期
                    lastMonth: null, // 每几个月
                    fewWeeks: null, // 第几个
                    week: null, // 周几
                    isRepetition: '',
                    repetitions: null, // 重复次数
                    count: null, // 次数
                    startTime: null,
                    finishTime: null
                },
                dialogVisible: false,
                typeLevel: false,
                TypeData: {},
                unfold: true,
                componentConfigUnfold: true,
                showInfo: true,
                disabled: false,
                defaultList: undefined,
                isChanged: false,
                loading: false
            };
        },
        computed: {
            recurrenceList() {
                return [
                    {
                        label: this.i18n.week,
                        value: '0'
                    },
                    {
                        label: this.i18n.month,
                        value: '1'
                    }
                ];
            },
            whichNumberList() {
                return [
                    {
                        label: this.i18n.first,
                        value: '1'
                    },
                    {
                        label: this.i18n.second,
                        value: '2'
                    },
                    {
                        label: this.i18n.third,
                        value: '3'
                    },
                    {
                        label: this.i18n.fourth,
                        value: '4'
                    },
                    {
                        label: this.i18n.fifth,
                        value: '5'
                    },
                    {
                        label: this.i18n.lastOne,
                        value: '-1'
                    }
                ];
            },
            weekDays() {
                return [
                    {
                        label: this.i18n.sunday,
                        value: '7'
                    },
                    {
                        label: this.i18n.monday,
                        value: '1'
                        // checked: true
                    },
                    {
                        label: this.i18n.tuesday,
                        value: '2'
                        // checked: true
                    },
                    {
                        label: this.i18n.wednesday,
                        value: '3'
                        // checked: true
                    },
                    {
                        label: this.i18n.thursday,
                        value: '4'
                        // checked: true
                    },
                    {
                        label: this.i18n.friday,
                        value: '5'
                        // checked: true
                    },
                    {
                        label: this.i18n.saturday,
                        value: '6'
                    }
                ];
            },
            repetitionList() {
                return [
                    {
                        label: this.i18n.repeat,
                        value: '1'
                    },
                    {
                        label: this.i18n.noLimit,
                        value: '0'
                    }
                ];
            },
            typeList() {
                return [
                    {
                        label: this.i18n.contextCalendar,
                        value: '1'
                    },
                    {
                        label: this.i18n.systemCalendar,
                        value: '0'
                    }
                ];
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            // 日历基本信息
            baseFormConfig() {
                let defaultFormConfig = [
                    {
                        field: 'calendarType',
                        component: 'ErdExSelect',
                        label: this.i18nMappingObj['calendarType'],
                        labelLangKey: 'type',
                        disabled: true,
                        required: true,
                        validators: [],
                        hidden: false,
                        props: {
                            clearable: true,
                            options: this.typeList,
                            placeholder: this.i18nMappingObj['pleaseSelect'],
                            placeholderLangKey: 'pleaseSelect'
                        },
                        col: 24
                    },
                    {
                        field: 'name',
                        component: 'FamI18nbasics',
                        label: this.i18nMappingObj['name'],
                        labelLangKey: 'name',
                        disabled: this.isContextCalendar || this.formData.isStandard === '1',
                        hidden: false,
                        required: true,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            placeholderLangKey: 'pleaseEnter',
                            max: 100
                        },
                        col: 24
                    },
                    {
                        field: 'isDefault',
                        component: 'erd-radio',
                        label: this.i18nMappingObj['default'],
                        labelLangKey: 'default',
                        disabled: false,
                        hidden: false,
                        col: 24,
                        slots: {
                            component: 'radioComponent'
                        }
                    }
                ];
                return defaultFormConfig;
            },
            pickerOptionsStart() {
                return {
                    disabledDate: (time) => {
                        let endDateVal = this.formData.startTime;
                        // 可以选择同一天
                        if (endDateVal) {
                            return time.getTime() < new Date(endDateVal).getTime();
                        }
                    }
                };
            },
            pickerOptionsEnd() {
                return {
                    disabledDate: (time) => {
                        let beginDateVal = this.formData.finishTime;
                        if (beginDateVal) {
                            return time.getTime() > new Date(beginDateVal).getTime();
                        }
                    }
                };
            }
        },
        watch: {},
        mounted() {
            this.init();
        },
        methods: {
            init() {
                let oid = this.newOid ? this.newOid : this.oid;
                this.$famHttp({
                    url: '/fam/getByOid',
                    params: {
                        oid
                    },
                    method: 'get'
                })
                    .then((res) => {
                        let result = res.data;
                        let obj = {
                            name: {
                                value: result?.name
                            },
                            calendarType: result.calendarType,
                            isStandard: result.isStandard,
                            isDefault: result.isDefault,
                            regularWorkWeekList: result?.cycle ? result?.cycle?.split(',') : ['1', '2', '3', '4', '5'],
                            cycle: '',
                            fewWeeks: result?.fewWeeks ? String(result?.fewWeeks) : null,
                            isIncludeException: result?.isIncludeException || '0',
                            lastMonth: result?.lastMonth ? String(result?.lastMonth) : null,
                            repeatMode: result?.repeatMode ? String(result?.repeatMode) : null,
                            isRepetition: result?.isRepetition,
                            repetitions: result?.repetitions ? String(result?.repetitions) : null,
                            // exceptionalPeriod: [result?.startTime, result?.finishTime],
                            startTime: result?.startTime ? dayjs(result?.startTime).format(formatType) : null,
                            finishTime: result?.finishTime ? dayjs(result?.finishTime).format(formatType) : null,
                            weeks: result?.weeks ? String(result?.weeks) : null
                        };
                        this.formData = obj;
                    })
                    .catch((err) => {});
            },
            onCancel() {
                this.toggleShow();
            },
            toggleShow() {
                const visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            showInfoFn(flag) {
                this.showInfo = flag;
            },
            saveSubmit() {
                this.submit();
            },
            // 使用日期选择器时处理时间
            onSelectTime(value) {
                utils.debounceFn(() => {
                    if (value == null) {
                        this.formData.exceptionalPeriod = [];
                    }
                    this.formData.exceptionalPeriod = this.formData.exceptionalPeriod.map((item) => {
                        // return utils.formatDateTime(item, 'ymdhms');
                        return dayjs(item).format(formatType);
                    });
                }, 300);
            },
            processData() {
                let result = this.$refs.baseInfo.formData;
                result.cycle = result?.regularWorkWeekList?.join() || '';
                result.startTime = result?.startTime ? dayjs(result?.startTime).format(formatType) : null;
                result.finishTime = result?.finishTime ? dayjs(result?.finishTime).format(formatType) : null;
                // result.startTime = result.exceptionalPeriod?.[0] || '';
                // result.finishTime = result.exceptionalPeriod?.[1] || '';
                // delete result.regularWorkWeekList;
                // 里面的字段有一个是有值时，代表当前的例外时间
                let filterEmptyArr = [
                    'startTime',
                    'finishTime',
                    'lastMonth',
                    'repeatMode',
                    'fewWeeks',
                    'weeks',
                    'repetitions'
                ];

                result.isIncludeException = filterEmptyArr.some((item) => {
                    return result[item];
                })
                    ? '1'
                    : '0';
            },
            submitEditForm() {
                this.processData();
                const { baseInfo } = this.$refs;
                // this.loading = true;
                return new Promise((resolve, reject) => {
                    baseInfo
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let attrRawList = baseInfo.serialize();
                                let className = this.$store.getters.className('calendar');

                                let obj = {
                                    attrRawList,
                                    oid: this.oid,
                                    className,
                                    typeReference: cldTypeReference
                                };

                                // return;
                                this.$famHttp({
                                    url: '/fam/update',
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        this.$emit('updaterule');
                                        this.toggleShow();
                                        resolve(res);
                                    })
                                    .catch((err) => {
                                        reject(err);
                                    })
                                    .finally(() => {
                                        this.loading = false;
                                    });
                            } else {
                                this.loading = false;
                                reject();
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            handlerepeatModeChange() {
                this.formData.fewWeeks = null;
            },
            handleRepetitionChange() {
                this.formData.repetitions = null;
            }
        }
    };
});
