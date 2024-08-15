define([
    'text!' + ELMP.resource('erdc-process-components/BpmHandlerDialog/index.html'),
    'erdcloud.kit',
    'underscore'
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        template: template,
        components: {
            BpmDelegate: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmDelegateForm/index.js')),
            BpmUrge: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-my-create/components/BpmUrge/index.js')),
            BpmTerminate: ErdcKit.asyncComponent(ELMP.resource('bpm-resource/components/BpmTerminateForm/index.js')),
            BpmWithdraw: ErdcKit.asyncComponent(ELMP.resource('biz-bpm/portal-done/components/WithdrawForm/index.js'))
        },
        props: {
            handlerData: {
                type: Object,
                default() {
                    return {};
                }
            },
            // 是否密级
            isSecret: {
                type: Boolean,
                default: false
            },
            securityLabel: {
                type: String,
                default: undefined
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-process-components/BpmHandlerDialog/locale/index.js'),
                dialogVisible: false,
                loading: false,
                submitFunc: {
                    urging: this.submitUrging,
                    delegate: this.submitDelegate,
                    suspend: this.submitSuspend,
                    cancelSuspend: this.submitCancelSuspend,
                    terminate: this.submitTerminate,
                    withdraw: this.submitWithdraw
                }
            };
        },
        computed: {
            handlerType() {
                return this.handlerData.handlerType;
            },
            dialogConfig() {
                return {
                    width: '800px',
                    showFullscreen: false,
                    ...this.handlerData.dialogConfig
                };
            },
            dialogTitle() {
                const title = {
                    urging: this.i18n.urging, // 催办
                    delegate: this.i18n.delegate, // 委派
                    suspend: this.i18n.suspend, // 暂停
                    cancelSuspend: this.i18n.cancelSuspend, // 取消暂停
                    terminate: this.i18n.terminate // 终止
                };

                return title[this.handlerType] || this.i18n.processFlow; // 处理流程
            },
            dialogComponent() {
                const component = {
                    suspend: this.i18n.sureToSuspend,
                    cancelSuspend: this.i18n.sureToActivate
                };

                return component[this.handlerType];
            },
            handlerComponent() {
                const component = {
                    urging: 'BpmUrge',
                    delegate: 'BpmDelegate',
                    terminate: 'BpmTerminate',
                    withdraw: 'BpmWithdraw'
                };

                return component[this.handlerType];
            }
        },
        watch: {
            'handlerData.visible': {
                handler(val) {
                    this.dialogVisible = val;
                }
            }
        },
        methods: {
            submit() {
                this.submitFunc[this.handlerType] && this.submitFunc[this.handlerType]();
            },
            submitUrging() {
                const ref = this.$refs[this.handlerComponent];
                const { submit, submitApi } = ref;
                submit().then((resp) => {
                    let { valid, data = {} } = resp;
                    if (!valid) {
                        return;
                    }
                    this.loading = true;
                    submitApi({
                        ...data,
                        processInstanceOid: this.handlerData.processInstanceOid,
                        userOids: data.userOids.join(','),
                        notifyWay: data.notifyWay.length === 2 ? '3' : data.notifyWay.join(',')
                    })
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success({
                                    message: this.i18n.urgeSuccess, // 任务催办成功
                                    onClose: () => {
                                        this.dialogVisible = false;
                                        this.loading = false;
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            submitDelegate() {
                const ref = this.$refs[this.handlerComponent];
                const { submit, submitApi } = ref;
                submit().then((resp) => {
                    let { valid, data = {} } = resp;
                    if (!valid) {
                        return;
                    }
                    this.loading = true;
                    submitApi({
                        ...data,
                        taskOId: this.handlerData.taskOId
                    })
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success({
                                    message: this.i18n.delegateSuccess, // 任务委派成功
                                    onClose: () => {
                                        this.dialogVisible = false;
                                        this.loading = false;
                                        this.$emit('success-callback');
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            submitSuspend() {
                const { processInstanceOid, taskId } = this.handlerData;
                this.loading = true;
                this.$famHttp({
                    url: `/bpm/procinst/${processInstanceOid}/suspend`,
                    method: 'GET',
                    params: {
                        taskId
                    }
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return this.$message.error(this.i18n.suspendFail);
                        }
                        this.$message.success({
                            message: this.i18n.suspendSuccess,
                            onClose: () => {
                                this.dialogVisible = false;
                                this.loading = false;
                                this.$emit('success-callback');
                            }
                        });
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            submitCancelSuspend() {
                const { processInstanceOid, taskId } = this.handlerData;
                this.loading = true;
                this.$famHttp({
                    url: `/bpm/procinst/${processInstanceOid}/activate`,
                    method: 'GET',
                    params: {
                        taskId
                    }
                })
                    .then((resp) => {
                        if (!resp.success) {
                            return this.$message.error(this.i18n.cancelSuspendFail);
                        }
                        this.$message.success({
                            message: this.i18n.cancelSuspendSuccess,
                            onClose: () => {
                                this.dialogVisible = false;
                                this.loading = false;
                                this.$emit('success-callback');
                            }
                        });
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            submitTerminate() {
                const ref = this.$refs[this.handlerComponent];
                const { submit, submitApi } = ref;
                submit()
                    .then((resp) => {
                        let { valid, data = {} } = resp;
                        if (!valid) {
                            return;
                        }
                        let formData = new FormData();
                        _.each(
                            {
                                ...data,
                                processInstanceOid: this.handlerData.processInstanceOid
                            },
                            (value, key) => {
                                formData.append(key, value);
                            }
                        );
                        this.loading = true;
                        submitApi(formData).then((resp) => {
                            if (resp.success) {
                                this.$message.success({
                                    message: this.i18n.terminateSuccess, // 任务终止成功
                                    onClose: () => {
                                        this.dialogVisible = false;
                                        this.loading = false;
                                        this.$emit('success-callback');
                                    }
                                });
                            }
                        });
                    })
                    .catch(() => {
                        this.loading = false;
                    });
            },
            submitWithdraw() {
                const ref = this.$refs[this.handlerComponent];
                const { submit, submitApi } = ref;
                submit().then((resp) => {
                    let { valid, data = {} } = resp;
                    if (!valid) {
                        return;
                    }
                    let formData = new FormData();
                    _.each(
                        {
                            ...data,
                            taskOId: this.handlerData.taskOId
                        },
                        (value, key) => {
                            formData.append(key, value);
                        }
                    );
                    this.loading = true;
                    submitApi(formData)
                        .then((resp) => {
                            if (resp.success) {
                                this.$message.success({
                                    message: this.i18n.withdrawSuccess, // 任务撤回成功
                                    onClose: () => {
                                        this.dialogVisible = false;
                                        this.loading = false;
                                        this.$emit('success-callback');
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                });
            },
            cancel() {
                this.dialogVisible = false;
                this.$emit('cancel', false);
            }
        }
    };
});
