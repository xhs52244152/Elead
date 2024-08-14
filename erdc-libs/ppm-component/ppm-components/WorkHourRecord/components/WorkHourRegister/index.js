define([
    'text!' + ELMP.resource('ppm-component/ppm-components/WorkHourRecord/components/WorkHourRegister/index.html'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.func('erdc-ppm-work-hour/app/store/index.js'),
    'erdcloud.kit',
    'dayjs',
    'css!' + ELMP.resource('ppm-component/ppm-components/WorkHourRecord/style.css')
], function (template, commonHttp, store, ErdcKit, dayjs) {
    return {
        template,
        props: {
            visible: Boolean,
            initData: {
                type: Object,
                default() {
                    return {};
                }
            },
            oid: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/WorkHourRecord/locale/index.js'),
                i18nMappingObj: {
                    estimatedHour: this.getI18nByKey('estimatedHour'), // 预计工时
                    remainingWork: this.getI18nByKey('remainingWork'), // 剩余工时
                    registerHour: this.getI18nByKey('registerHour'), // 登记工时
                    hour: this.getI18nByKey('hour'), // 小时
                    confirm: this.getI18nByKey('confirm'), // 确定
                    cancel: this.getI18nByKey('cancel'), // 取消
                    registerNext: this.getI18nByKey('registerNext'), // 继续登记下一个
                    workHourDate: this.getI18nByKey('workHourDate'), // 工时日期
                    registerDuration: this.getI18nByKey('registerDuration'), // 登记时长
                    durationTips: this.getI18nByKey('durationTips'), // 请填写登记时长
                    dataSizeTips: this.getI18nByKey('dataSizeTips'), // 数据不能小于等于0
                    decimalTips: this.getI18nByKey('decimalTips'), // 小数点后最多一位
                    desc: this.getI18nByKey('desc'), // 描述
                    savedSuccess: this.getI18nByKey('savedSuccess') // 保存成功
                },
                contextRef: '',
                caption: '',
                formData: {
                    workload: '',
                    remainWork: '',
                    startTime: '',
                    workHour: 0,
                    description: ''
                },
                addNext: false,
                formKey: Date.now(),
                typeOid: '',
                hasSaved: false
            };
        },
        computed: {
            className() {
                return store.state.classNameMapping.workHour;
            },
            formConfig() {
                let { i18nMappingObj } = this;
                const formConfig = [
                    {
                        field: 'workload',
                        component: 'ErdInput',
                        label: `${i18nMappingObj.estimatedHour}`,
                        readonly: true,
                        col: 24
                    },
                    {
                        field: 'remainWork',
                        component: 'ErdInput',
                        label: `${i18nMappingObj.remainingWork}`,
                        readonly: true,
                        col: 24
                    },
                    {
                        field: 'startTime',
                        component: 'ErdDatePicker',
                        label: i18nMappingObj.workHourDate,
                        required: true,
                        readonly: this.isUpdate,
                        col: 24,
                        props: {
                            type: 'date',
                            valueFormat: 'yyyy-MM-dd',
                            clearable: false
                        }
                    },
                    {
                        field: 'workHour',
                        component: 'ErdInput',
                        label: i18nMappingObj.registerDuration,
                        required: true,
                        col: 24,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    if (_.isString(value) && !value.trim()) {
                                        callback(new Error(i18nMappingObj.durationTips));
                                    } else if (value <= 0) {
                                        callback(new Error(i18nMappingObj.dataSizeTips));
                                    } else if (
                                        value?.toString().indexOf('.') > -1 &&
                                        Number(value).toFixed(1) !== value?.toString()
                                    ) {
                                        callback(new Error(i18nMappingObj.decimalTips));
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: ['blur', 'change']
                            }
                        ],
                        slots: {
                            component: 'workHourAppend'
                        }
                    },
                    {
                        field: 'description',
                        component: 'ErdInput',
                        label: i18nMappingObj.desc,
                        required: true,
                        col: 24,
                        props: {
                            type: 'textarea',
                            showWordLimit: true,
                            maxlength: 500,
                            autosize: { minRows: 3, maxRows: 5 }
                        }
                    }
                ];
                return formConfig;
            },
            isUpdate() {
                return !!this.oid;
            }
        },
        watch: {
            initData: {
                immediate: true,
                handler(val) {
                    Object.keys(this.formData).forEach((key) => {
                        this.formData[key] = val[key];
                    });
                    this.caption = val.caption;
                    this.contextRef = val.contextRef;
                    this.typeOid = val.typeOid;
                    // 设置默认工时日期
                    this.formData.startTime = dayjs().format('YYYY-MM-DD');
                }
            },
            oid: {
                immediate: true,
                handler(val) {
                    val &&
                        commonHttp
                            .commonAttr({
                                data: {
                                    oid: val
                                }
                            })
                            .then((resp) => {
                                let data = ErdcKit.deserializeAttr(resp?.data?.rawData || [], {
                                    valueMap: {
                                        startTime: (e, data) => {
                                            return data['startTime']?.displayName;
                                        }
                                    }
                                });

                                Object.keys(this.formData).forEach((key) => {
                                    !['workload', 'remainWork'].includes(key) && (this.formData[key] = data[key]);
                                });

                                this.formData.sortOrder = data.sortOrder;
                            });
                }
            }
        },
        methods: {
            onClosed() {
                this.$emit('closed', this.hasSaved);
            },
            onConfirm() {
                let { i18nMappingObj } = this;
                // 表单校验
                this.$refs.form.submit(({ valid }) => {
                    if (!valid) {
                        return;
                    } else {
                        let formData = this.$refs.form.serializeEditableAttr();
                        this.fetchSaveForm(formData).then((resp) => {
                            if (!resp.success) return false;
                            this.$message.success(i18nMappingObj.savedSuccess);
                            this.hasSaved = true;
                            if (this.addNext) {
                                this.$nextTick(() => {
                                    this.formData = {
                                        workload: this.initData.workload,
                                        remainWork: this.initData.remainWork,
                                        startTime: dayjs().format('YYYY-MM-DD'),
                                        workHour: 0,
                                        description: ''
                                    };
                                    this.formKey = Date.now();
                                });

                                // 更新预估工时、剩余工时数据
                                this.$emit('no-close-saved');
                            } else {
                                this.visible = false;
                            }
                        });
                    }
                });
            },
            onCancel() {
                this.visible = false;
            },
            fetchSaveForm(formData) {
                const { contextRef, isUpdate, typeOid, className } = this;

                let data = {
                    contextRef,
                    typeReference: typeOid
                    // sort_order: isUpdate ? this.formData.sortOrder : void 0
                };

                let attrRawList = [
                    ...formData,
                    ...Object.keys(data).map((key) => {
                        return {
                            attrName: key,
                            value: data[key]
                        };
                    })
                ];

                let requestData = {
                    appName: '',
                    associationField: '',
                    attrRawList,
                    className,
                    typeReference: typeOid,
                    oid: isUpdate ? this.oid : void 0
                };

                if (isUpdate) {
                    return commonHttp.commonUpdate({
                        data: requestData
                    });
                } else {
                    return commonHttp.commonCreate({
                        data: requestData
                    });
                }
            },
            onBlur() {
                let val = this.formData.workHour;
                if (val > 24) this.formData.workHour = 24;
                else if (val <= 0) this.formData.workHour = 0.1;
            },
            refreshTimeData({ workload = 0, remainWork = 0 }) {
                this.formData.workload = workload;
                this.formData.remainWork = remainWork;
            }
        }
    };
});
