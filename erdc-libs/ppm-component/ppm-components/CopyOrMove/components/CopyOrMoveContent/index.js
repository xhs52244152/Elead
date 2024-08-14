define([
    'text!' + ELMP.resource('ppm-component/ppm-components/CopyOrMove/components/CopyOrMoveContent/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/CopyOrMove/components/CopyOrMoveContent/index.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    const famStore = require('fam:store');

    return {
        template,
        props: {
            // copy or move
            type: String,
            // 调用当前组件的业务对象 任务:plan
            ObjectType: String,
            // 调用当前组件的业务对象详细信息
            ObjectInfo: Object,
            // plan || require || issue || risk
            parentConfig: {
                type: Object,
                default() {
                    return {
                        show: false,
                        label: '',
                        isList: false,
                        urlConfig: {}
                    };
                }
            },
            handleParmas: Function,
            // 当前编辑数据的oid
            currentOid: {
                type: String,
                default: ''
            },
            className: String,
            viewRef: String,
            projectSearchKey: {
                type: String,
                default: ''
            },
            projectDisabled: {
                type: Boolean,
                default: false
            },
            //是否是需求移动
            isRequireMove: {
                type: Boolean,
                default: false
            },
            //是否是问题移动
            isIssue: {
                type: Boolean,
                default: false
            },
            //是否是风险移动
            isRisk: {
                type: Boolean,
                default: false
            },
            bindProjectData: {
                type: Array,
                default: () => []
            },
            isTemplate: {
                type: Boolean,
                default: false
            },
            // 是否使用计划集
            usePlanSet: Boolean,
            // 是否允许查询没有权限的项目
            deleteNoPermissionData: {
                type: Boolean,
                default: true
            },
            // 是否使用交付物【需求】模块不需要展示
            isDemand: {
                type: Boolean,
                default: false
            },
            // 所属项目是否必填
            isProjectRequire: {
                type: Boolean,
                default: true
            }
        },
        components: {
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            )
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/CopyOrMove/locale/index.js'),
                i18nMappingObj: {
                    project: this.getI18nByKey('project'),
                    parentTask: this.getI18nByKey('parentTask'),
                    parentNode: this.getI18nByKey('parentNode'),
                    state: this.getI18nByKey('state'),
                    keepOriginalState: this.getI18nByKey('keepOriginalState'),
                    reselectStatus: this.getI18nByKey('reselectStatus'),
                    defaultPlanningStatus: this.getI18nByKey('defaultPlanningStatus'),
                    defaultPendingSubmittStatus: this.getI18nByKey('defaultPendingSubmittStatus'),
                    creater: this.getI18nByKey('creater'),
                    retainOriginalCreator: this.getI18nByKey('retainOriginalCreator'),
                    admin: this.getI18nByKey('admin'),
                    require: this.getI18nByKey('require'),
                    relationObject: this.getI18nByKey('relationObject')
                },
                loading: false,
                form: {
                    fromProjOid: [], // 需求移动用到
                    fromProjOptions: [
                        {
                            value: 1,
                            label: '项目1'
                        },
                        {
                            value: 2,
                            label: '项目2'
                        }
                    ], // 需求绑定的项目数据
                    projectOid: '',
                    projOptions: [],
                    parentInfo: '',
                    treeData: [],
                    stateValue: 1,
                    createValue: 1,
                    stateData: [],
                    newState: '',
                    currentPlanSet: '',
                    // 复制默认为否 移动默认为是
                    relation: this.type == 'copy' ? false : true,
                    delivery: this.type == 'copy' ? false : true
                },
                listConfig: {
                    loading: false,
                    options: [],
                    defaultProps: {
                        label: 'displayName',
                        children: 'childList',
                        value: 'oid'
                    }
                },
                // 所属父任务树形数据转换
                parentTaskTreeProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'isLeaf'
                },
                creatorOid: '',
                requirementDisabled: false // 是否只读
            };
        },
        created() {
            // this.$route.query.pid存在代表在项目空间
            this.form.fromProjOid = this.$route.query.pid ? [this.$route.query.pid] : [];
            this.requirementDisabled = this.$route.query.pid ? true : false;
        },
        computed: {
            projectOid() {
                return this.$route.query.pid;
            },
            userInfo() {
                return famStore.state.app.user || {};
            },
            formConfig() {
                return [
                    {
                        field: 'fromProjOid',
                        component: '',
                        label: this.i18n.project, // 移动项目
                        labelLangKey: 'component',
                        required: true,
                        hidden: !this.bindProjectData.length,
                        validators: [],
                        slots: {
                            component: 'moveProject'
                        },
                        col: 24
                    },
                    {
                        field: 'projectOid',
                        component: '',
                        label: !this.isRequireMove ? this.i18n.project : this.i18n.moveProject, // 所属项目
                        labelLangKey: 'component',
                        required: this.isProjectRequire,
                        validators: [],
                        slots: {
                            component: 'belongProject'
                        },
                        col: 24
                    },
                    {
                        field: 'currentPlanSet',
                        component: '',
                        label: this.i18n.planSet, // 计划集
                        labelLangKey: 'component',
                        required: true,
                        hidden: !this.usePlanSet,
                        validators: [],
                        slots: {
                            component: 'planSet'
                        },
                        col: 24
                    },
                    {
                        field: 'parentInfo',
                        component: '',
                        label: this.parentConfig.label || this.i18n.parentTask, // 所属父任务/父需求
                        labelLangKey: 'component',
                        required: false,
                        hidden: !this.parentConfig.show,
                        validators: [],
                        slots: {
                            component: 'parentTask'
                        },
                        col: 24
                    },
                    {
                        field: 'stateValue',
                        component: '',
                        label: this.i18n.state, // 状态
                        labelLangKey: 'component',
                        required: false,
                        hidden: this.type === 'copy',
                        validators: [],
                        slots: {
                            component: 'state'
                        },
                        col: 24
                    },
                    {
                        field: 'newState',
                        component: '',
                        label: '', // 设置新状态
                        labelLangKey: 'component',
                        hidden: this.form.stateValue !== 2,
                        required: false,
                        validators: [],
                        slots: {
                            component: 'newState'
                        },
                        col: 24
                    },
                    {
                        field: 'relation',
                        component: '',
                        label: this.i18nMappingObj.relationObject, // 关联对象
                        labelLangKey: 'component',
                        required: false,
                        hidden: this.type == 'copy',
                        validators: [],
                        slots: {
                            component: 'relation'
                        },
                        col: 24
                    },
                    {
                        field: 'delivery',
                        component: '',
                        label: this.i18n.deliverable, // 交付物
                        labelLangKey: 'component',
                        required: false,
                        hidden: this.isDemand || this.type === 'copy',
                        validators: [],
                        slots: {
                            component: 'deliverable'
                        },
                        col: 24
                    },
                    {
                        field: 'createValue',
                        component: '',
                        label: this.i18n.creater, // 创建人
                        labelLangKey: 'component',
                        required: false,
                        hidden: true,
                        validators: [],
                        slots: {
                            component: 'creater'
                        },
                        col: 24
                    }
                ];
            }
        },
        watch: {
            'projectSearchKey': {
                handler(val) {
                    this.remoteMethod(val);
                },
                immediate: true
            },
            // 计划集切换
            'form.currentPlanSet'() {
                if (this.usePlanSet && this.form.currentPlanSet.trim()) {
                    // this.getChildrenTree();
                    let { show = false, isList = false } = this.parentConfig;
                    if (!show || isList) return;
                    this.form.parentInfo = '';
                    this.parentNode.childNodes = [];
                    this.loadParentTask(this.parentNode, this.parentResolve);
                }
            }
        },
        methods: {
            remoteMethod(keyword) {
                if (keyword) {
                    let data = {
                        tmplTemplated: this.isTemplate,
                        className: 'erd.cloud.ppm.project.entity.Project',
                        deleteNoPermissionData: this.deleteNoPermissionData,
                        orderBy: 'identifierNo',
                        pageIndex: 1,
                        pageSize: 10000,
                        conditionDtoList: [
                            {
                                attrName: 'name',
                                oper: 'LIKE',
                                value1: keyword,
                                logicalOperator: 'AND',
                                isCondition: true
                            },
                            {
                                attrName: 'erd.cloud.ppm.project.entity.Project#lifecycleStatus.status',
                                isCondition: true,
                                logicalOperator: 'AND',
                                oper: 'NE',
                                sortOrder: 0,
                                value1: 'DRAFT'
                            }
                        ],
                        viewRef: 'OR:erd.cloud.foundation.core.tableview.entity.TableView:1636292104269365250',
                        tableKey: 'projectView'
                    };
                    if (this.ObjectType == 'plan') {
                        let { creatorOid, userInfo } = this;
                        creatorOid = userInfo.oid;
                        data.conditionDtoList.push({
                            attrName: 'erd.cloud.ppm.project.entity.Project#member',
                            isCondition: true,
                            logicalOperator: 'AND',
                            oper: 'MEMBER_IN',
                            sortOrder: 0,
                            value1: creatorOid
                        });
                    }
                    this.$famHttp({
                        method: 'POST',
                        url: '/ppm/view/table/page',
                        data
                    })
                        .then((resp) => {
                            this.form.projOptions = resp.data.records.map((item) => {
                                return {
                                    label: item.displayName,
                                    value: item.oid
                                };
                            });
                            if (this.projectSearchKey) {
                                this.form.projectOid = _.find(this.form.projOptions, {
                                    value: this.projectOid
                                })?.value;
                                this.onProjectChange();
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    this.form.projOptions = [];
                }
            },
            onProjectChange() {
                // 刷新计划集选项
                this.form.currentPlanSet = '';
                this.form.parentInfo = '';
                if (this.usePlanSet) {
                    this.$refs.planSet.refresh(this.form.projectOid);
                    this.parentNode.childNodes = [];
                } else {
                    // this.getChildrenTree();
                    let { show = false, isList = false } = this.parentConfig;
                    if (!show || isList) {
                        this.listConfig.options = [];
                    } else {
                        this.parentNode.childNodes = [];
                    }
                }
            },
            handleProjectChange() {
                console.log(this.form.fromProjOid);
            },
            // 懒加载任务树数据
            loadParentTask(node, resolve) {
                if (!this.form.projectOid) {
                    this.parentNode = node;
                    this.parentResolve = resolve;
                    return;
                }
                let parentId = node?.data?.oid || this.form.projectOid;
                let params = {
                    tableKey: 'TaskGanttView', // 所属视图名称
                    projectOid: this.form.projectOid, //所选项目oid
                    collectOid: this.form.currentPlanSet, // 当前计划集oid
                    parentOid: parentId // 父类任务oid
                };
                this.$famHttp({
                    url: 'ppm/plan/v1/tasks/selectTaskListByParentId',
                    method: 'get',
                    className: this.className || 'erd.cloud.ppm.project.entity.Project',
                    params
                }).then((data) => {
                    let treeTaskOpts = data?.data || [];
                    treeTaskOpts.forEach((node) => {
                        node?.childList && node?.childList?.length >= 0 ? (node.isLeaf = false) : (node.isLeaf = true);
                    });
                    resolve(treeTaskOpts);
                });
            },
            getChildrenTree() {
                let { show = false, requestData = {}, isList = false } = this.parentConfig;
                if (!show || isList) return;
                this.form.parentInfo = '';
                this.$famHttp({
                    method: 'POST',
                    url: '/ppm/linkTree/childrenTree',
                    className: 'erd.cloud.ppm.plan.entity.TaskLink',
                    data: {
                        level: -1,
                        parentRef: this.form.projectOid,
                        collectRef: this.usePlanSet ? this.form.currentPlanSet : void 0,
                        typeName: 'erd.cloud.ppm.plan.entity.TaskLink',
                        pageIndex: 1,
                        pageSize: 10000,
                        // 后端说写死
                        viewRef: this.viewRef,
                        ...requestData
                    }
                })
                    .then((res) => {
                        this.form.treeData = this.flatToTree(res.data?.childrenList || []);
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            searchProjMethod(keyword) {
                let { className, handleParmas } = this;
                let data = {
                    className,
                    keyword,
                    projectId: this.form.projectOid,
                    tmplTemplated: false
                };
                if (handleParmas && _.isFunction(handleParmas)) {
                    data = handleParmas(data, this);
                }
                this.listConfig.loading = true;
                this.$famHttp({
                    url: '/ppm/listByKey',
                    method: 'GET',
                    data
                }).then((resp) => {
                    this.listConfig.options = (resp?.data || []).map((item) => {
                        // item.displayName = item.displayName.split(',')?.[1];
                        return item;
                    });

                    this.listConfig.loading = false;
                });
            },
            flatToTree(flatData) {
                const { className } = this;
                const hash = {};
                const tree = [];
                for (let i = 0; i < flatData.length; i++) {
                    const item = flatData[i];
                    const oid = item.oid;
                    if (!hash[oid]) {
                        hash[oid] = { children: [] };
                    }
                }
                for (let i = 0; i < flatData.length; i++) {
                    const item = flatData[i];
                    const oid = item.oid;
                    const parentRef = item.parentRef.indexOf('Project') !== -1 ? '' : item.parentRef;

                    let label =
                        item.attrRawList.find((item) => item.attrName === `${className}#name`).displayName || '';
                    let obj = {
                        id: item.oid,
                        oid,
                        parentRef,
                        label
                    };
                    hash[oid] = { ...obj, children: hash[oid].children };
                    const parent = hash[parentRef];
                    if (!parent) {
                        tree.push(hash[oid]);
                    } else {
                        if (!parent.children) {
                            parent.children = [];
                        }
                        parent.children.push(hash[oid]);
                    }
                }
                return tree;
            },
            getLifeStateData() {
                if (!this.currentOid) return;
                this.$famHttp({
                    method: 'POST',
                    url: '/ppm/common/template/states',
                    data: {
                        successionType: 'SET_STATE',
                        branchIdList: [this.currentOid],
                        className: this.className
                    }
                })
                    .then((res) => {
                        this.form.stateData = res.data[this.currentOid]
                            .filter((item) => item.name !== 'CROPPED')
                            .map((item) => {
                                return {
                                    label: item.displayName,
                                    value: item.name
                                };
                            });
                        this.form.newState = this.form.stateData[0].value;
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            stateChange(data) {
                if (+data === 2 && !this.form.stateData.length) {
                    this.getLifeStateData();
                }
            },
            creatorChange(val) {
                let { ObjectInfo, form, userInfo } = this;
                switch (val) {
                    case 1:
                        this.creatorOid = ObjectInfo?.CreateBy?.value;
                        break;
                    case 2:
                        this.creatorOid = userInfo.oid;
                        break;
                    default:
                        break;
                }
                _.extend(form, {
                    projectOid: '',
                    projOptions: [],
                    currentPlanSet: '',
                    parentInfo: ''
                });
                this.$refs.planSet.originOptions = [];
                this.parentNode.childNodes = [];
            }
        }
    };
});
