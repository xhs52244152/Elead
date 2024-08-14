define([
    'text!' + ELMP.resource('ppm-component/ppm-components/PlanSetSelect/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/PlanSetSelect/style.css')
], function (template, ErdcKit, store) {
    return {
        props: {
            value: String,
            projectOid: String,
            itemLabel: String,
            selectOnly: Boolean,
            disabled: Boolean,
            showAllPlanSet: Boolean,
            placeholder: {
                type: String,
                default: '请选择'
            },
            callback: {
                type: Function,
                default: null
            },
            collectRefValue: String
        },
        template,
        components: {
            EditPlanSet: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/PlanSetSelect/components/EditPlanSet/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/PlanSetSelect/locale/index.js'),
                i18nMappingObj: {
                    masterPlan: this.getI18nByKey('masterPlan'),
                    editPlanSet: this.getI18nByKey('editPlanSet'),
                    allPlanSet: this.getI18nByKey('allPlanSet')
                },
                defaultProps: {
                    children: 'children',
                    label: 'name',
                    value: 'oid'
                },
                dataValue: ' ',
                originOptions: []
            };
        },
        computed: {
            projectClass() {
                return store.state.classNameMapping.project;
            },
            className() {
                return 'erd.cloud.ppm.plan.entity.TaskCollect';
            },
            options() {
                let { selectOnly, i18nMappingObj, originOptions, className, showAllPlanSet } = this;
                let options = [
                    {
                        name: i18nMappingObj.masterPlan,
                        oid: `OR:${className}:-1`
                    },
                    ...originOptions
                ];

                if (!selectOnly) {
                    options.push({
                        name: i18nMappingObj.editPlanSet,
                        type: 'link',
                        oid: 'handleEdit',
                        actionName: 'handleEdit',
                        disabled: true
                    });
                    options.unshift({
                        name: i18nMappingObj.allPlanSet,
                        oid: ' '
                    });
                }

                if (showAllPlanSet) {
                    options.unshift({
                        name: i18nMappingObj.allPlanSet,
                        oid: ' '
                    });
                }
                return options;
            }
        },
        watch: {
            dataValue: {
                handler(val) {
                    this.$emit('input', val);
                    if (_.isFunction(this.callback)) {
                        this.callback(val);
                    }
                }
            },
            value: {
                handler(val) {
                    this.dataValue = val || this.collectRefValue || '';
                },
                immediate: true
            }
        },
        created() {
            this.getPlanSetOptions();
        },
        methods: {
            refresh(projectOid) {
                this.getPlanSetOptions(projectOid);
            },
            getPlanSetOptions(projectOid) {
                let { getNode } = this;
                projectOid = projectOid || this.projectOid;
                if (!projectOid) return false;

                let projectDataArr = projectOid?.split(':');
                this.$famHttp({
                    url: '/ppm/plan/v1/taskCollect/tree',
                    className: this.projectClass,
                    data: {
                        projectId: projectDataArr?.[2] || ''
                    }
                }).then((resp) => {
                    this.originOptions = resp.data || [];

                    // 计算完毕后
                    this.$nextTick(() => {
                        let row = getNode(this.options, (node) => {
                            node.oid !== 'handleEdit' && (node.disabled = (node.children || []).length > 0);
                            return node.oid === this.dataValue;
                        });

                        if (!row) this.dataValue = ' ';
                    });
                });
            },
            getNode(data, handler) {
                let result = {};

                let treeHandle = (data) => {
                    data.forEach((item) => {
                        if (handler(item)) result = item;
                        if (item.children) treeHandle(item.children);
                    });
                };

                treeHandle(data);

                return result;
            },
            onNodeClick({ actionName }) {
                if (_.isFunction(this[actionName])) {
                    this[actionName]();
                }
            },
            // 打开编辑计划集弹窗
            handleEdit() {
                this.$refs.editPlanSet.open(this.projectOid);
            },
            getPlanSetData(oid) {
                if (oid) return this.getNode(this.options, (item) => item.oid === oid);

                return this.options.filter((item) => item.type !== 'link');
            }
        }
    };
});
