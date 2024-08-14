define([
    'text!' + ELMP.resource('project-plan/components/Gantt/components/ProjectTemplateImport/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('project-plan/components/Gantt/components/ProjectTemplateImport/style.css')
], function (template, ErdcKit, store) {
    var vm = {
        props: {
            projectTemplateImportShow: {
                type: Boolean,
                default: false
            },
            currentPlanSet: {
                type: String,
                default: ''
            }
        },
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'projectTemplateImport',
                    'baseInfo',
                    'selectImportTask',
                    'pleaseEnterSearch',
                    'projectTemplate',
                    'planset',
                    'parentTask',
                    'confirm',
                    'cancel',
                    'pleaseSelectProjectTemplate',
                    'selectPlanset',
                    'pleaseSelectParentTask'
                ]),
                baseUnfold: true,
                chooselUnfold: true,
                treeProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'isLeaf'
                },
                // 所属父任务树形数据转换
                parentTaskTreeProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'isLeaf',
                    value: 'id'
                },
                // 查询字段
                taskName: '',
                // 项目模板可选项
                projectTemplateOpts: [],
                form: {
                    // 当前选中项目模板
                    projectOid: null,
                    // 当前选中计划集
                    planSet: null,
                    // 当前选中所属父任务
                    parentId: null
                }
            };
        },
        watch: {
            'form.planSet'(val) {
                if (val) {
                    this.node.childNodes = [];
                    this.loadTaskNode(this.node, this.resolve);
                }
            }
        },
        computed: {
            className() {
                return 'erd.cloud.ppm.plan.entity.TaskCollect';
            },
            formConfig() {
                return [
                    {
                        field: 'projectOid',
                        component: '',
                        label: this.i18nMappingObj.projectTemplate, // 项目模板
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        slots: {
                            component: 'projectTemplate'
                        },
                        col: 24
                    },
                    {
                        field: 'planSet',
                        component: '',
                        label: this.i18nMappingObj.planset, // 计划集
                        labelLangKey: 'component',
                        disabled: false,
                        required: true,
                        validators: [],
                        slots: {
                            component: 'planSet'
                        },
                        col: 24
                    },
                    {
                        field: 'parentId',
                        component: 'custom-select',
                        label: this.i18nMappingObj.parentTask, // 所属父任务
                        labelLangKey: 'component',
                        disabled: false,
                        required: false,
                        validators: [],
                        slots: {
                            component: 'parentTask'
                        },
                        col: 24
                    }
                ];
            }
        },
        created() {
            this.getProjectTemplateOpts();
        },
        methods: {
            // 提交保存
            submit() {
                let _this = this;
                _this.$refs.baseInfoForm.validate((valid) => {
                    if (valid) {
                        let checkedTreeTask = _this.$refs.tree.getCheckedNodes();
                        let checkChildrenList = [];
                        checkedTreeTask.forEach((item) => {
                            if (!item.isLeaf) {
                                checkChildrenList.push(...item.childList);
                            }
                        });
                        checkedTreeTask = checkedTreeTask.filter((item) => {
                            return !checkChildrenList.find((child) => child.id === item.id);
                        });
                        if (checkedTreeTask && checkedTreeTask.length) {
                            _this.form.taskIds = checkedTreeTask.map((item) => item.id);
                            _this.$emit('projectTemplateImportConfirm', _this.form);
                        } else {
                            _this.$message('未选中任务节点');
                        }
                    }
                });
            },
            //
            cancel() {
                this.$emit('projectTemplateImportCancel');
            },
            // 任务筛选
            onKeywordChange() {
                this.node.childNodes = [];
                this.loadTaskNode(this.node, this.resolve);
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.name.toLowerCase().indexOf(value.toLowerCase()) !== -1;
            },
            // 获取项目模板可选项数据
            getProjectTemplateOpts() {
                this.$famHttp({
                    url: '/ppm/listByKey',
                    method: 'get',
                    params: {
                        'tmplTemplated': true,
                        'templateInfo.tmplEnabled': true,
                        'className': 'erd.cloud.ppm.project.entity.Project'
                    }
                }).then((res) => {
                    if (res.code === '200') {
                        this.projectTemplateOpts = res.data;
                    }
                });
            },
            // 项目模板选中
            projectTemplateChange(val) {
                if (val) {
                    this.$refs.planSet.getPlanSetOptions(val);
                    this.form.planSet = null;
                    this.form.parentId = null;
                }
                this.node.childNodes = [];
                this.loadTaskNode(this.node, this.resolve);
            },
            // 所属父任务选中
            parentTaskChange() {},
            // 懒加载所属父任务下拉
            loadParentTask(node, resolve) {
                let parentId = node?.data?.oid || store.state.projectInfo?.oid;
                let params = {
                    tableKey: 'TaskGanttView', // 所属视图名称
                    projectOid: store.state.projectInfo?.oid, //当前项目oid
                    collectOid: this.currentPlanSet, // 当前计划集oid
                    parentOid: parentId // 父类任务oid
                };
                this.fetchTreeLevel(params, '/ppm/plan/v1/tasks/selectTaskListByParentId').then((data) => {
                    let parentTaskOpts = data?.data || [];
                    parentTaskOpts.forEach((node) => {
                        node?.childList && node?.childList?.length > 0 ? (node.isLeaf = false) : (node.isLeaf = true);
                    });
                    resolve(parentTaskOpts);
                });
            },
            // 懒加载任务树数据
            loadTaskNode(node, resolve) {
                if (!this.form.projectOid) {
                    this.node = node;
                    this.resolve = resolve;
                    return;
                }
                let parentId = node?.data?.oid || this.form.projectOid;
                let params = {
                    projectOid: this.form.projectOid, //所选项目模板oid
                    collectOid: this.form.planSet || '', // 当前计划集oid
                    parentOid: parentId, // 父类任务oid
                    taskName: this.taskName //
                };
                this.fetchTreeLevel(params, '/ppm/plan/v1/tasks/selectTemplateTaskList').then((data) => {
                    let treeTaskOpts = data?.data || [];
                    treeTaskOpts.forEach((node) => {
                        node?.childList && node?.childList?.length >= 0 ? (node.isLeaf = false) : (node.isLeaf = true);
                    });
                    resolve(treeTaskOpts);
                });
            },
            // 通过接口按层获取所属任务数据
            fetchTreeLevel(params, url) {
                return this.$famHttp({
                    url: url,
                    method: 'get',
                    params
                });
            }
        }
    };
    return vm;
});
