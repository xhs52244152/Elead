define([
    'text!' + ELMP.resource('project-plan/components/RelevanceList/AddTaskRelateDialog/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js')
], function (template, ErdcKit, commonHttp) {
    return {
        props: {
            visible: Boolean,
            taskOid: String,
            linkOid: String,
            linkProjectName: String,
            // 是否是督办
            isHandleTask: Boolean
        },
        template,
        components: {
            ObjectSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/ProjectSelect/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                formData: {
                    project: '',
                    task: '',
                    type: '',
                    constraintField: '',
                    duration: ''
                },
                typeOptions: [],
                fieldOptions: []
            };
        },
        computed: {
            isEdit() {
                return !_.isEmpty(this.linkOid);
            },
            title() {
                let { isEdit, i18n } = this;
                return isEdit ? i18n.editAssociatePlan : i18n.addAssociatePlan;
            },
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            formConfig() {
                let { i18n, isEdit, typeOptions, fieldOptions } = this;
                let formConfig = [
                    {
                        field: 'project',
                        label: i18n.projName,
                        required: true,
                        readonly: isEdit,
                        component: 'ErdInput',
                        col: 24,
                        slots: {
                            component: 'projectSelect'
                        }
                    },
                    {
                        field: 'task',
                        label: i18n.taskName,
                        required: true,
                        readonly: isEdit,
                        component: 'ErdInput',
                        col: 24,
                        slots: {
                            component: 'taskSelect'
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator(rule, value, callback) {
                                    if (value.length < 1) {
                                        callback(new Error(i18n.selectTaskTips));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ]
                    },
                    {
                        field: 'type',
                        label: i18n.constraintType,
                        required: true,
                        component: 'ErdExSelect',
                        col: 24,
                        props: {
                            options: typeOptions,
                            defaultProps: {
                                label: 'displayName',
                                value: 'value'
                            }
                        }
                    },
                    {
                        field: 'constraintField',
                        label: i18n.constraintField,
                        required: true,
                        component: 'ErdExSelect',
                        col: 24,
                        props: {
                            options: fieldOptions,
                            defaultProps: {
                                label: 'displayName',
                                value: 'value'
                            }
                        }
                    },
                    {
                        field: 'duration',
                        label: i18n.intervalDay,
                        component: 'ErdInputNumber',
                        col: 24,
                        slots: {
                            component: 'durationInput'
                        },
                        props: {},
                        validators: [
                            {
                                trigger: ['blur'],
                                validator(rule, value, callback) {
                                    let reg = /^(-)?\d+(\.\d)?$/g;

                                    let valStr = value?.toString();
                                    if (valStr.length === 0 && valStr !== '0')
                                        callback(new Error(i18n.inputDurationTips));
                                    else if (!reg.test(valStr)) callback(new Error(i18n.decimalTips));
                                    else callback();
                                }
                            }
                        ]
                    }
                ];
                return this.isHandleTask ? formConfig.splice(0, 2) : formConfig;
            },
            taskRequestData() {
                return {
                    taskId: this.taskOid,
                    projectId: this.formData.project,
                    selectType: '',
                    className: 'erd.cloud.ppm.plan.entity.Task'
                };
            }
        },
        created() {
            if (this.isEdit) {
                // 根据linkOid查询回显
                this.renderData(this.linkOid);
            }
            // 获取约束类型选项
            this.getTypeOptions();
            // 获取约束条件字段选项
            this.getFieldOptions();
        },
        methods: {
            onConfirm() {
                if (this.isEdit) return this.handleEdit();
                else return this.handleCreate();
            },
            // 监听项目变化
            projectChange() {
                // 清除select组件的计划数据
                this.$refs.taskSelect.options = [];
                this.$refs.taskSelect.dataValue = '';
            },
            handleCreate() {
                this.getFormData().then((formData) => {
                    let { taskOid } = this;
                    let params = {
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef',
                                value: taskOid
                            },
                            {
                                attrName: 'roleBObjectRef',
                                value: formData.task
                            },
                            {
                                attrName: 'constraintType',
                                value: formData.type
                            },
                            {
                                attrName: 'constraintCondition',
                                value: formData.constraintField
                            },
                            {
                                attrName: 'intervalDays',
                                value: formData.duration
                            }
                        ],
                        className: 'erd.cloud.ppm.common.entity.BusinessLink'
                    };

                    commonHttp
                        .commonCreate({
                            data: params
                        })
                        .then((resp) => {
                            this.onCancel();
                            this.$emit('after-submit', false, resp.data);
                        });
                });
            },
            handleEdit() {
                let { linkOid } = this;
                this.getFormData().then((formData) => {
                    let className = linkOid.split(':')[1];
                    let params = {
                        rawDataVoList: [
                            {
                                action: 'UPDATE',
                                attrRawList: [
                                    {
                                        attrName: 'constraintType',
                                        value: formData.type
                                    },
                                    {
                                        attrName: 'constraintCondition',
                                        value: formData.constraintField
                                    },
                                    {
                                        attrName: 'intervalDays',
                                        value: formData.duration
                                    }
                                ],
                                className,
                                oid: linkOid
                            }
                        ],
                        action: 'UPDATE',
                        className
                    };
                    commonHttp
                        .saveOrUpdate({
                            data: params
                        })
                        .then((resp) => {
                            this.onCancel();
                            this.$emit('after-submit', true, resp.data);
                        });
                });
            },
            onCancel() {
                this.dialogVisible = false;
            },
            getFormData() {
                let form = this.$refs.form;
                return new Promise((resolve, reject) => {
                    form.submit().then(({ valid, data }) => {
                        if (valid) {
                            resolve(data);
                        } else {
                            reject(false);
                        }
                    });
                });
            },
            beforeTaskSearch({ next }) {
                if (_.isEmpty(this.formData.project)) return this.$message.info(this.i18n.pleaseSelectProject);
                else next();
            },
            // 回显处理
            renderData(oid) {
                let { linkProjectName } = this;
                commonHttp
                    .commonAttr({
                        data: {
                            oid
                        }
                    })
                    .then(({ data }) => {
                        Object.assign(this.formData, {
                            project: linkProjectName,
                            task: ErdcKit.getObjectValue(data?.rawData, 'roleBObjectRef')?.displayName?.split(',')?.[1],
                            type: ErdcKit.getObjectValue(data?.rawData, 'constraintType')?.value,
                            constraintField: ErdcKit.getObjectValue(data?.rawData, 'constraintCondition')?.value,
                            duration: ErdcKit.getObjectValue(data?.rawData, 'intervalDays')?.value
                        });
                    });
            },
            getTypeOptions() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/TaskBusinessLinkConstraintType',
                    params: {
                        status: 1
                    }
                }).then((resp) => {
                    this.typeOptions = resp.data;
                });
            },
            getFieldOptions() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/TaskBusinessLinkConstraintCondition',
                    params: {
                        status: 1
                    }
                }).then((resp) => {
                    this.fieldOptions = resp.data;
                });
            }
        }
    };
});
