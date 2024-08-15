define([
    'erdcloud.kit',
    ELMP.resource('platform-storage/api.js'),
    'text!' + ELMP.resource('platform-storage/components/CreateTimeTask/index.html'),
    'css!' + ELMP.resource('platform-storage/components/CreateTimeTask/index.css')
], function (erdcloudKit, api, template) {
    return {
        name: 'CreateTimingTask',
        template: template,
        components: {
            CronConfig: erdcloudKit.asyncComponent(ELMP.resource('platform-storage/components/CronConfig/index.js'))
        },
        props: {
            siteList: {
                type: Array,
                require: true
            },
            appList: {
                type: Array,
                require: true
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('platform-storage/locale/index.js'),
                i18nMappingObj: {
                    ...this.getI18nKeys([
                        'name',
                        'sourceSite',
                        'destSite',
                        'cronExpression',
                        'maximumDuration',
                        'failureNumber',
                        'description',
                        'app',
                        'confirm',
                        'cancel',
                        'pleaseEnter',
                        'createTaskSiteTip'
                    ]),
                    create: this.getI18nByKey('创建'),
                    edit: this.getI18nByKey('编辑'),
                    saveSuccess: this.getI18nByKey('保存成功')
                },

                visible: false,
                form: {
                    id: '',
                    jobName: '',
                    sourceSiteCode: '', // 源站点
                    destSiteCode: '', // 目标站点
                    timeExpression: '', // cron表达式
                    timeMinutes: 5, // 持续时间
                    // failureNumber: 5, // 最大失败次数
                    jobDescription: '', // 描述
                    appIds: []
                },

                configVisible: false
            };
        },
        computed: {
            // 是否是编辑状态
            isEdit() {
                return !!this.form.id;
            },
            title() {
                return this.isEdit ? this.i18nMappingObj.edit : this.i18nMappingObj.create;
            },
            formConfig() {
                const { i18nMappingObj, toLowerCase, isEdit } = this;

                const formConfig = [
                    {
                        field: 'jobName',
                        component: 'erd-input',
                        label: this.i18nMappingObj.name,
                        required: true,
                        props: {
                            clearable: true,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.name)}`
                        }
                    },
                    {
                        field: 'sourceSiteCode',
                        label: this.i18nMappingObj.sourceSite,
                        required: true,
                        slots: {
                            component: 'sourceSite'
                        }
                    },
                    {
                        field: 'destSiteCode',
                        label: this.i18nMappingObj.destSite,
                        required: true,
                        slots: {
                            component: 'destSite'
                        }
                    },
                    {
                        field: 'timeExpression',
                        component: 'FamDynamicFormSlot',
                        label: this.i18nMappingObj.cronExpression,
                        required: true,
                        readonly: false,
                        props: {
                            clearable: false,
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.cronExpression)}`
                        },
                        slots: {
                            component: 'cronExpression'
                        },
                        col: 24
                    },
                    {
                        field: 'timeMinutes',
                        component: 'erd-input-number',
                        label: this.i18nMappingObj.maximumDuration,
                        required: true,
                        props: {
                            controlsPosition: 'right',
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.maximumDuration)}`
                        }
                    },
                    // {
                    //     field: 'failureNumber',
                    //     component: 'erd-input-number',
                    //     label: this.i18nMappingObj.failureNumber,
                    //     required: true,
                    //     props: {
                    //         controlsPosition: 'right',
                    //         placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.failureNumber)}`
                    //     },
                    // },
                    {
                        field: 'jobDescription',
                        component: 'erd-input',
                        label: this.i18nMappingObj.description,
                        props: {
                            type: 'textarea',
                            placeholder: `${i18nMappingObj.pleaseEnter}${toLowerCase(i18nMappingObj.description)}`
                        }
                    },
                    {
                        field: 'appIds',
                        label: this.i18nMappingObj.app,
                        required: true,
                        slots: {
                            component: 'app'
                        },
                        col: 24
                    }
                ];
                return formConfig;
            }
        },
        methods: {
            show(data) {
                if (data) {
                    this.setFormData(data);
                }
                this.visible = true;
            },
            confirm() {
                const { form } = this;

                this.$refs.form.submit().then(({ valid }) => {
                    if (valid) {
                        if (form.destSiteCode === form.sourceSiteCode) {
                            // 源站点和目标站点不能相同
                            this.$message({
                                type: 'error',
                                message: this.i18nMappingObj.createTaskSiteTip,
                                showClose: true
                            });
                            return;
                        }
                        this.saveTimeTask();
                    }
                });
            },
            cancel() {
                this.visible = false;
            },
            toLowerCase(str) {
                return String.prototype.toLowerCase.call(str);
            },
            onClose() {
                this.$refs.form.$refs.form.resetFields();
                this.form = {
                    id: '',
                    jobName: '',
                    sourceSiteCode: '', // 源站点
                    destSiteCode: '', // 目标站点
                    timeExpression: '', // cron表达式
                    timeMinutes: 5, // 持续时间
                    // failureNumber: 5, // 最大失败次数
                    jobDescription: '', // 描述
                    appIds: []
                };
            },
            configSubmit(data) {
                this.form.timeExpression = data.trim();
            },
            configExpression() {
                this.configVisible = true;
            },
            setFormData(data) {
                const {
                    id,
                    jobName = '',
                    sourceSiteCode,
                    destSiteCode,
                    timeExpression,
                    timeMinutes,
                    jobDescription,
                    appIds = ''
                } = data;

                this.form.id = id;
                this.form.jobName = jobName;
                this.form.sourceSiteCode = sourceSiteCode;
                this.form.destSiteCode = destSiteCode;
                this.form.timeExpression = timeExpression;
                this.form.timeMinutes = timeMinutes;
                this.form.jobDescription = jobDescription;
                this.form.appIds = appIds.split(',');
            },
            saveTimeTask() {
                const data = Object.assign({}, this.form);
                data.appIds = data.appIds.join(',');

                api.timingTask
                    .saveTask(data)
                    .then((res) => {
                        if (res.success) {
                            this.$message({
                                message: this.i18nMappingObj.saveSuccess,
                                type: 'success',
                                showClose: true
                            });
                            this.saveSuccess();
                        }
                    })
                    .catch((err) => {
                        // this.$message({
                        //     message: err.data.message,
                        //     type: 'warning',
                        //     showClose: true
                        // });
                    });
            },
            saveSuccess() {
                this.visible = false;
                this.$emit('saved');
            }
        }
    };
});
