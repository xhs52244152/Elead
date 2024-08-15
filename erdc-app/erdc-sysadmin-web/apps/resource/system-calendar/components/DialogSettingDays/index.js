/*
设置工作日/节假日弹窗
DialogSettingDays: FamKit.asyncComponent(ELMP.resource('system-calendar/components/DialogSettingDays/index.js')),

<setting-days
        v-if="dialogDayVisible"
        :visible.sync="dialogDayVisible"
        @onsubmit="onSubmit"
    ></setting-days>
*/
define(['text!' + ELMP.resource('system-calendar/components/DialogSettingDays/template.html'), 'dayjs'], function (template, dayjs) {
    const FamKit = require('fam:kit');
    const holidayTypeReference = 'OR:erd.cloud.foundation.type.entity.TypeDefinition:1663848283380506626';

    return {
        template,
        components: {
            FamDictItemSelect: FamKit.asyncComponent(ELMP.resource('erdc-components/FamDictItemSelect/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            oid: {
                type: String,
                default: ''
            },
            type: {
                type: String,
                default: 'create'
            },
            dateConfig: {
                type: Object,
                default: null
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-calendar/components/DialogSettingDays/locale/index.js'),
                i18nMappingObj: {
                    type: this.getI18nByKey('类型'),
                    name: this.getI18nByKey('名称'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    weekday: this.getI18nByKey('工作日'),
                    holiday: this.getI18nByKey('节假日'),
                    startTime: this.getI18nByKey('开始时间'),
                    endTime: this.getI18nByKey('结束时间'),
                    success: this.getI18nByKey('操作成功')
                },
                readonly: false,
                loading: false,
                disabled: false,
                typeList: [],
                formData: {
                    calendarId: '', // 日历id
                    name: {}, // 节假日名称
                    year: null, // 年份
                    dayType: '', // 节假日类型（1.工作日，0：为节假日）
                    startTime: '', // 开始时间
                    finishTime: '' // 结束时间
                }
            };
        },
        watch: {
            dateConfig: {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.formData.name = nv?.name || {};
                        this.formData.dayType = nv?.dayType || '';
                        this.formData.startTime = nv?.startTime || '';
                        this.formData.finishTime = nv?.finishTime || '';
                    }
                }
            }
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
            formConfig() {
                const formConfig = [
                    {
                        field: 'name',
                        component: 'FamI18nbasics', // FamI18nbasics
                        label: this.i18nMappingObj.name,
                        labelLangKey: this.i18nMappingObj.name,
                        required: this.readonly ? false : true,
                        readonly: this.readonly || false,
                        props: {
                            clearable: true,
                            placeholder: this.i18nMappingObj.pleaseEnter,
                            max: 100
                        },
                        col: 24
                    },
                    {
                        field: 'dayType',
                        component: 'custom-select',
                        label: this.i18nMappingObj.type,
                        required: this.readonly ? false : true,
                        disabled: false,
                        readonly: this.readonly || false,
                        props: {
                            clearable: true,
                            row: {
                                componentName: 'constant-select', // 固定
                                viewProperty: 'displayName', // 显示的label的key
                                valueProperty: 'value', // 显示value的key
                                referenceList: this.typeList
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'startTime',
                        component: 'ErdDatePicker',
                        label: this.i18nMappingObj.startTime,
                        labelLangKey: 'internalName',
                        required: true,
                        readonly: this.readonly,
                        props: {
                            type: 'date',
                            valueFormat: 'yyyy-MM-dd',
                            pickerOptions: this.pickerOptionsEnd,
                            clearable: false,
                            placeholder: this.i18nMappingObj.startTime,
                            placeholderLangKey: this.i18nMappingObj.pleaseEnter,
                            i18nName: this.i18nMappingObj.startTime
                        },
                        col: 12
                    },
                    {
                        field: 'finishTime',
                        component: 'ErdDatePicker',
                        label: this.i18nMappingObj.endTime,
                        labelLangKey: 'internalName',
                        required: true,
                        readonly: this.readonly,
                        props: {
                            type: 'date',
                            valueFormat: 'yyyy-MM-dd',
                            pickerOptions: this.pickerOptionsStart,
                            clearable: false,
                            placeholder: this.i18nMappingObj.endTime,
                            placeholderLangKey: this.i18nMappingObj.pleaseEnter,
                            i18nName: this.i18nMappingObj.endTime
                        },
                        col: 12
                    }
                ];
                return formConfig;
            },
            pickerOptionsStart() {
                return {
                    disabledDate: (time) => {
                        let endDateVal = this.formData.startTime;
                        // 可以选择同一天
                        if (endDateVal) {
                            return time.getTime() < new Date(endDateVal).getTime() - 24 * 60 * 60 * 1000;
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
        mounted() {
            this.typeList = [
                {
                    displayName: this.i18nMappingObj['holiday'],
                    value: '0'
                },
                {
                    displayName: this.i18nMappingObj['weekday'],
                    value: '1'
                }
            ];
        },
        methods: {
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange(changed) {
                this.disabled = !changed;
                this.isChanged = changed;
            },
            submitEditForm() {
                let result = this.$refs.dynamicForm.formData;
                result.calendarId = this.oid?.split(':')[2];
                result.year = Number(dayjs(result.finishTime).format('YYYY'));
                
                const { dynamicForm } = this.$refs;
                this.loading = true;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                let url = this.type === 'create' ? '/fam/create' : '/fam/update';
                                let attrRawList = dynamicForm.serialize();
                                let className = this.$store.getters.className('calendarHoliday');

                                let obj = {
                                    attrRawList,
                                    className,
                                    typeReference: holidayTypeReference,
                                    oid: this.type === 'update' ? this?.dateConfig?.oid : undefined
                                };
                                

                                this.$famHttp({
                                    url,
                                    data: obj,
                                    method: 'post'
                                })
                                    .then((res) => {
                                        this.$message({
                                            message: this.i18nMappingObj['success'],
                                            type: 'success',
                                            showClose: true
                                        });
                                        
                                        this.toggleShow();
                                        this.$emit('updatelist');
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
            // 保存并设置
            onSave() {},
            // 取消
            onCancel() {
                this.toggleShow();
            }
        }
    };
});
