define([
    'text!' + ELMP.resource('system-queue/components/QueueForm/index.html'),
    'css!' + ELMP.resource('system-queue/components/QueueForm/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

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

            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },

            // 表单数据
            queueData: {
                type: Object,
                default: () => {
                    return {};
                }
            },

            // jobId
            jobId: {
                type: [String, Object, Number],
                default: () => {
                    return '';
                }
            },

            // 类型 create update copy
            type: {
                type: String,
                default: () => {
                    return 'create';
                }
            }
        },
        components: {
            CronConfig: ErdcKit.asyncComponent(ELMP.resource('system-queue/components/CronConfig/index.js'))
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-queue/components/QueueForm/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    timingInformation: this.getI18nByKey('定时信息'),
                    pleaseEnter: this.getI18nByKey('请输入'),
                    performConfig: this.getI18nByKey('执行配置'),
                    largestTask: this.getI18nByKey('最大任务数'),
                    singleConcurrency: this.getI18nByKey('单机线程并发度'),
                    runTimeLimit: this.getI18nByKey('运行时间限制（毫秒）'),
                    instanceRetryCount: this.getI18nByKey('I重试次数'),
                    taskRetryCount: this.getI18nByKey('T重试次数'),
                    minimumCPU: this.getI18nByKey('最低CPU核心数'),
                    minMemory: this.getI18nByKey('最低内存'),
                    minDiskSpace: this.getI18nByKey('最低磁盘空间'),
                    performMachineAddress: this.getI18nByKey('执行机器地址'),
                    performMachineAddressTip: this.getI18nByKey('执行机器地址提示'),
                    maxMachineNumber: this.getI18nByKey('最大执行机器数量'),

                    nameTask: this.getI18nByKey('队列名称'),
                    taskDescription: this.getI18nByKey('队列描述'),
                    taskParameters: this.getI18nByKey('队列参数'),
                    runtimeConfig: this.getI18nByKey('运行时配置'),
                    retryConfig: this.getI18nByKey('重试配置'),
                    mechanicalConfig: this.getI18nByKey('机械配置'),
                    clusterConfig: this.getI18nByKey('集群配置'),
                    queueTaskNumber: this.getI18nByKey('队列任务保留天数'),
                    failedDetails: this.getI18nByKey('获取详情失败'),
                    createSuccess: this.getI18nByKey('创建成功'),
                    updateSuccess: this.getI18nByKey('更新成功'),
                    copySuccess: this.getI18nByKey('复制成功'),
                    createFailure: this.getI18nByKey('创建失败'),
                    updateFailed: this.getI18nByKey('更新失败'),
                    copyFailure: this.getI18nByKey('复制失败')
                },
                formData: {
                    timeExpressionType: 'CRON',
                    executeType: 'STANDALONE',
                    maxInstanceNum: 0,
                    concurrency: 0,
                    instanceTimeLimit: 0,
                    instanceRetryNum: 0,
                    taskRetryNum: 0,
                    minCpuCores: 0,
                    minMemorySpace: 0,
                    minDiskSpace: 0,
                    maxWorkerCount: 0,
                    instanceRetentionDays: 0
                },
                configVisible: false,
                loading: false,
                btnLoading: false
            };
        },
        computed: {
            timeRow() {
                let enumData = new FormData();
                enumData.append('realType', 'erd.cloud.sdk.job.enums.TimeExpressionType');
                let row = {
                    componentName: 'custom-virtual-enum-select',
                    requestConfig: {
                        data: enumData
                    }
                };
                return row;
            },
            executeRow() {
                let enumData = new FormData();
                enumData.append('realType', 'erd.cloud.sdk.job.enums.ExecuteType');
                let row = {
                    componentName: 'custom-virtual-enum-select',
                    requestConfig: {
                        data: enumData
                    }
                };
                return row;
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
            data() {
                return [
                    {
                        field: 'jobName',
                        component: 'erd-input',
                        label: this.i18nMappingObj['nameTask'],
                        // label: '任务名称',
                        labelLangKey: 'nameTask',
                        disabled: false,
                        required: true,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 24
                    },
                    {
                        field: 'jobDescription',
                        component: 'erd-input',
                        label: this.i18nMappingObj['taskDescription'],
                        // label: '任务描述',
                        labelLangKey: 'taskDescription',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter',
                            type: 'textarea'
                        },
                        col: 24
                    },
                    {
                        field: 'jobParams',
                        component: 'erd-input',
                        label: this.i18nMappingObj['taskParameters'],
                        // label: '任务参数',
                        labelLangKey: 'taskParameters',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        col: 24
                    },
                    {
                        field: 'timeInformation',
                        component: 'FamDynamicFormSlot',
                        label: this.i18nMappingObj['timingInformation'],
                        // label: '定时信息',
                        labelLangKey: 'timingInformation',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [
                            {
                                trigger: ['blur'],
                                validator: (rule, value, callback) => {
                                    if (
                                        !['API', 'WORKFLOW'].includes(this.formData.timeExpressionType) &&
                                        !this.formData.timeExpression
                                    ) {
                                        // callback(new Error('请选择定时类型'))
                                        callback(new Error('请填写表达式'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            label: 'timeLabel',
                            component: 'timeComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'configure',
                        component: 'erd-input',
                        label: this.i18nMappingObj['performConfig'],
                        // label: '执行配置',
                        labelLangKey: 'performConfig',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (!this.formData.executeType) {
                                        // callback(new Error('请选择执行类型'))
                                        callback();
                                    } else if (!this.formData.processorInfo) {
                                        callback(new Error('请填写处理器类'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            label: 'configureLabel',
                            component: 'configureComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'runtimeConfig',
                        component: 'erd-input',
                        label: this.i18nMappingObj['runtimeConfig'],
                        // label: '运行时配置',
                        labelLangKey: 'runtimeConfig',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            component: 'runtimeComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'retryConfig',
                        component: 'erd-input',
                        label: this.i18nMappingObj['retryConfig'],
                        // label: '重试配置',
                        labelLangKey: 'retryConfig',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            component: 'retryComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'layuot',
                        component: 'erd-input',
                        label: this.i18nMappingObj['mechanicalConfig'],
                        // label: '机械配置',
                        labelLangKey: 'mechanicalConfig',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            component: 'layuotComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'cluster',
                        component: 'erd-input',
                        label: this.i18nMappingObj['clusterConfig'],
                        // label: '集群配置',
                        labelLangKey: 'clusterConfig',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        slots: {
                            component: 'clusterComponent'
                        },
                        col: 24
                    },
                    {
                        field: 'instanceRetentionDays',
                        component: 'erd-input',
                        label: this.i18nMappingObj['queueTaskNumber'],
                        // label: '任务任务保留天数',
                        labelLangKey: 'queueTaskNumber',
                        disabled: false,
                        required: false,
                        readonly: false,
                        validators: [],
                        props: {
                            clearable: false,
                            placeholder: this.i18nMappingObj['pleaseEnter'],
                            // placeholder: '请输入',
                            placeholderLangKey: 'pleaseEnter'
                        },
                        limits: /[^0-9]/gi,
                        col: 24
                    }
                ];
            },
            serverName() {
                // return this.queueData?.number || '';
                const number = this.queueData?.identifierNo || this.queueData?.number || '';
                const serverName = this.queueData.oid === '-1' ? 'plat' : number;
                return serverName;
            }
        },
        mounted() {
            this.getFormData();
        },
        methods: {
            getFormData() {
                if (!this.jobId) {
                    return;
                }
                this.loading = true;
                this.$famHttp({
                    url: '/fam/job/fetchJob' + `?jobId=${this.jobId}`,
                    method: 'GET'
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.formData = data;
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            onSubmit() {
                this.submit();
            },
            submit() {
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm.submit().then(({ valid }) => {
                        if (valid) {
                            const serializeData = dynamicForm.serialize();

                            let data = {};
                            serializeData.forEach((item) => {
                                data[item.attrName] = item.value;
                            });

                            data.serverName = this.serverName;

                            if (this.type === 'copy') {
                                delete data.id;
                            }
                            this.btnLoading = true;
                            this.$famHttp({
                                url: '/fam/job/saveJob',
                                data,
                                method: 'POST'
                            })
                                .then((resp) => {
                                    const messageMap = {
                                        create: this.i18nMappingObj['createSuccess'],
                                        update: this.i18nMappingObj['updateSuccess'],
                                        copy: this.i18nMappingObj['copySuccess']
                                    };
                                    this.$message({
                                        type: 'success',
                                        message: messageMap[this.type],
                                        showClose: true
                                    });
                                    this.$emit('onsubmit', resp);
                                    this.toogleShow();
                                })
                                .finally(() => {
                                    this.btnLoading = false;
                                });
                        } else {
                            reject(new Error('请填入正确的配置信息'));
                        }
                    });
                });
            },
            onCancle() {
                this.toogleShow();
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },
            formChange() {},
            onInput(data, field) {
                this.formData[field] = data.replace(/[^\d]/g, '');
            },
            configExpression(scope) {
                this.configVisible = true;
            },
            configSubmit(data) {
                this.$set(this.formData, 'timeExpression', data.trim());
            }
        }
    };
});
