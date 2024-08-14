define([
    'text!' + ELMP.resource('project-plan/components/AddFrontBackTask/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js')
], function (template, ErdcKit, store, commonHttp) {
    return {
        props: {
            taskOid: String,
            state: {
                type: String,
                default: 'add' // add, edit
            }
        },
        template,
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            ObjectSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/ProjectSelect/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'), // 确定
                    continueAdd: this.getI18nByKey('continueAdd'), // 继续增加
                    cancel: this.getI18nByKey('cancel'), // 取消
                    selectPlanset: this.getI18nByKey('selectPlanset'), // 请选择计划集
                    addPreTask: this.getI18nByKey('addPreTask'), // 增加前置任务
                    editPreTask: this.getI18nByKey('editPreTask'), // 编辑前置任务
                    planset: this.getI18nByKey('planset'), // 计划集
                    taskName: this.getI18nByKey('taskName'), // 编辑前置任务
                    selectTaskTips: this.getI18nByKey('selectTaskTips'), // 请选择任务
                    type: this.getI18nByKey('type'), // 类型
                    delayTime: this.getI18nByKey('delayTime'), // 延隔时间
                    addSuccess: this.getI18nByKey('addSuccess') // 添加成功
                },
                visible: false,
                formData: {
                    projectOid: this.$route.query.pid || '',
                    collectId: '',
                    taskOids: [],
                    type: '',
                    delay: 0
                },
                formKey: Date.now()
            };
        },
        computed: {
            title() {
                let { i18nMappingObj } = this;
                return this.state === 'add' ? i18nMappingObj.addPreTask : i18nMappingObj.editPreTask;
            },
            projectInfo() {
                return store.state.projectInfo;
            },
            taskLink() {
                return store.state.classNameMapping.taskLink;
            },
            taskClassName() {
                return store.state.classNameMapping.task;
            },
            taskRequestData() {
                return {
                    taskId: this.taskOid,
                    projectId: this.formData.projectOid,
                    selectType: 'optionalPredecessor',
                    className: 'erd.cloud.ppm.plan.entity.Task',
                    collectId: this.formData.collectId
                };
            },
            formConfig() {
                let { i18nMappingObj } = this;
                const formConfig = [
                    // {
                    //     field: 'projectOid',
                    //     component: 'ErdInput',
                    //     label: '项目名称',
                    //     required: true,
                    //     col: 24,
                    //     slots: {
                    //         component: 'projectSelect'
                    //     }
                    // },
                    {
                        field: 'collectId',
                        component: 'ErdInput',
                        label: i18nMappingObj.planset,
                        required: true,
                        col: 24,
                        slots: {
                            component: 'planSetSelect'
                        }
                    },
                    {
                        field: 'taskOids',
                        component: 'ErdInput',
                        label: i18nMappingObj.taskName,
                        required: true,
                        col: 24,
                        slots: {
                            component: 'taskSelect'
                        },
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator(rule, value, callback) {
                                    if (value.length < 1) {
                                        callback(new Error(i18nMappingObj.selectTaskTips));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ]
                    },
                    {
                        field: 'type',
                        component: 'FamDict',
                        label: i18nMappingObj.type,
                        required: true,
                        col: 24,
                        props: {
                            itemName: 'PredecessorType'
                        }
                    },
                    {
                        field: 'delay',
                        component: 'ErdInputNumber',
                        label: i18nMappingObj.delayTime,
                        required: true,
                        col: 24,
                        props: {},
                        validators: []
                    }
                ];
                return formConfig;
            }
        },
        watch: {
            'formData.collectId': {
                handler() {
                    this.formData.taskOids = [];
                    this.$refs.taskSelect.options = [];
                }
            }
        },
        methods: {
            open() {
                this.resetForm();
                this.visible = true;
            },
            close() {
                this.visible = false;
                // 通过渲染表单，清除校验信息
                this.formKey = Date.now();
            },
            onClosed() {
                // 关闭弹窗后，重置表单，避免表单信息不为空的干扰
                this.resetForm();
            },
            resetForm() {
                // this.formData.projectOid = '';
                this.formData.collectId = '';
                this.formData.taskOids = [];
                this.formData.type = 'FS';
                this.formData.delay = 0;
                this.formKey = Date.now();
            },
            onProjectChange() {
                this.formData.taskOids = [];
            },
            formatData(data = []) {
                data.forEach((row) => {
                    (row.attrRawList || []).forEach((item) => {
                        row[item.attrName] = row[item.attrName] || item.displayName;
                    });

                    if (row.childrenList) this.formatData(row.childrenList);
                });
            },
            beforeTaskSearch({ next }) {
                let { i18nMappingObj } = this;
                if (_.isEmpty(this.formData.collectId)) return this.$message.info(i18nMappingObj.selectPlanset);
                else next();
            },
            onConfirm(isContinue) {
                let { projectInfo: targetProjectInfo, taskOid: targetTaskOid, close, i18nMappingObj } = this;
                let { taskOids, delay, type } = this.formData;
                this.$refs.form.submit(({ valid }) => {
                    if (!valid) {
                        return;
                    } else {
                        let rawDataVoList = [];
                        let className = 'erd.cloud.ppm.plan.entity.PredecessorLink';
                        let containerRef = `OR:${targetProjectInfo.containerRef.key}:${targetProjectInfo.containerRef.id}`;
                        taskOids.forEach((taskOid) => {
                            let attrMap = {
                                roleAObjectRef: targetTaskOid,
                                roleBObjectRef: taskOid,
                                projectRef: targetProjectInfo.oid,
                                type,
                                delay,
                                containerRef
                            };

                            let attrRawList = Object.keys(attrMap).map((key) => {
                                return {
                                    attrName: key,
                                    value: attrMap[key]
                                };
                            });

                            rawDataVoList.push({
                                className,
                                attrRawList
                            });
                        });

                        let params = {
                            rawDataVoList,
                            className,
                            containerRef
                        };

                        // 调接口
                        commonHttp
                            .saveOrUpdate({
                                data: params
                            })
                            .then(() => {
                                this.$message.success(i18nMappingObj.addSuccess);
                                if (isContinue) {
                                    // 如果是继续增加，则重置表单数据，并且不关闭弹窗
                                    this.resetForm();
                                    this.$emit('updated');
                                } else {
                                    // 关闭，刷新
                                    close();
                                    this.$emit('updated');
                                }
                            });
                    }
                });
            }
        }
    };
});
