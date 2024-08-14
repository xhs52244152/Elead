define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'EventBus',
    'text!' + ELMP.resource('project-plan/create-plan/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('project-plan/create-plan/index.css')
], function (ErdcKit, store, EventBus, template, utils, commonHttp) {
    return {
        template,
        data() {
            return {
                formData: {},
                editableAttr: ['projectRef', 'responsiblePerson'],
                fromRouteName: '',
                resAssignments: '',
                parentTask: '',
                parentTaskOptions: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'pleaseEnterKeyword',
                    'createPlan',
                    'createTask',
                    'durationCheckTips',
                    'selectResourceRole',
                    'planCreationSuccess'
                ])
            };
        },
        components: {
            CreateForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/CreateForm/index.js')),
            ProjectAssignmentsSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ProjectAssignmentsSelect/index.js')
            )
        },
        computed: {
            configParameter() {
                return {
                    title: this.createTitle,
                    className: store.state.classNameMapping.task,
                    layoutName: this.layoutName,
                    showDetailForm: false, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
                    basicComponentName: 'commonBaseTaskInfo', // 基础组件名称
                    basicComponent: ErdcKit.asyncComponent(
                        ELMP.resource('project-task/components/CreateBasicInfo/index.js')
                    ),
                    basicComponentUrl: 'project-task/components/CreateBasicInfo/index.js', // 基础组件地址
                    createUrl: '/ppm/create', // 创建接口
                    backName: '', // 路由返回名称
                    goBack: '',
                    cancel: '',
                    lookDetailName: 'planDetail', // 创建成功后查看详情路由的名称
                    contineCreateName: 'planCreate', // 创建成功后继续创建当前路由名称
                    saveDraft:
                        this.$route.params.hideDraftBtn || store.state.projectInfo['templateInfo.tmplTemplated']
                            ? false
                            : true, // 是否显示保存草稿按钮
                    formHeight: 'calc(100vh - 114px)'
                };
            },
            createTitle() {
                return this.$route.query?.createPlanTitle || this.i18nMappingObj.createTask;
            },
            layoutName() {
                // 区分模板还是计划
                return store.state.projectInfo['templateInfo.tmplTemplated'] ? 'TEMPLATE_CREATE' : 'CREATE';
            },
            isTemplate() {
                return store.state.projectInfo['templateInfo.tmplTemplated'] && this.projectOid;
            },
            projectOid() {
                return this.$route.query.pid;
            },
            backName() {
                return this.routeParams?.backName || 'planList';
            },
            routeParams() {
                return this.$route?.params || {};
            },
            collectId() {
                return this.$route.query.collectId;
            },
            schemaMapper() {
                let roleCode = this.resAssignments;
                let containerOid = `OR:${store.state.projectInfo.containerRef.key}:${store.state.projectInfo.containerRef.id}`;
                return {
                    responsiblePerson(schema) {
                        schema.props.searchScop = 'container';
                        schema.props.params = {
                            containerOid,
                            roleCode
                        };

                        return schema;
                    },
                    resAssignments(schema) {
                        // 设置初始值，否则无法监听
                        schema.defaultValue = '';
                    },
                    participant(schema) {
                        schema.props.params = {
                            containerOid
                        };

                        return schema;
                    }
                };
            }
        },
        created() {
            if (this.routeParams?.planOid) {
                this.initParentTask();
            }
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined
            next((vm) => {
                vm.fromRouteName = vm.fromRouteName || from.name;
                // 判断是从项目创建成功后跳转到创建计划
                if (vm.$route.params.where === 'create_project') {
                    vm.configParameter.goBack = function () {
                        vm.$router.push({
                            path: '/space/project-plan/list',
                            query: {
                                pid: vm.projectOid
                            }
                        });
                    };
                }

                vm.configParameter.cancel = 'projectList';
                vm.configParameter.backName = vm.fromRouteName;
            });
        },
        methods: {
            fieldsChange(params) {
                params.changeFields = ['timeInfo.scheduledStartTime', 'timeInfo.scheduledEndTime', 'planInfo.duration'];
                params.fieldMapping = {
                    scheduledStartTime: 'timeInfo.scheduledStartTime',
                    scheduledEndTime: 'timeInfo.scheduledEndTime',
                    duration: 'planInfo.duration'
                };
                utils.fieldsChange(params);
            },
            beforeSubmit(data, next, draft) {
                let duration = data.attrRawList.find((item) => item.attrName === 'planInfo.duration')?.value || '';
                if (!/^\d+(\.\d)?$/.test(duration) && duration) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.durationCheckTips
                    });
                }

                if (_.isEmpty(this.resAssignments)) {
                    return this.$message.info(this.i18nMappingObj.selectResourceRole);
                }

                let obj = {};
                data?.attrRawList.some((el) => {
                    if (el.attrName == 'projectRef') {
                        el.value = this.projectOid;
                    }
                });
                data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                let relationList = [
                    {
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef',
                                value: this.parentTask ? this.parentTask : this.projectOid
                            }
                        ],
                        className: 'erd.cloud.ppm.plan.entity.TaskLink'
                    }
                ];
                // 保存
                data.attrRawList.push({
                    attrName: 'containerRef',
                    value:
                        'OR:' + store.state.projectInfo.containerRef.key + ':' + store.state.projectInfo.containerRef.id
                });

                // 资源角色
                data.attrRawList.push({
                    attrName: 'resAssignments',
                    value: this.resAssignments
                });

                // 计划集参数
                this.collectId &&
                    data.attrRawList.push({
                        attrName: 'collectRef',
                        value: this.collectId
                    });

                if (this.isTemplate) {
                    data.attrRawList.push({
                        attrName: 'templateInfo.tmplTemplated',
                        value: true
                    });
                }
                obj = {
                    attrRawList: data.attrRawList,
                    relationList: relationList,
                    associationField: 'roleBObjectRef',
                    className: data.className,
                    typeReference: data.typeReference,
                    containerRef:
                        'OR:' + store.state.projectInfo.containerRef.key + ':' + store.state.projectInfo.containerRef.id
                };

                console.log('%c [  ]-106', 'font-size:13px; background:pink; color:#bf2c9f;', obj);
                if (draft) obj.isDraft = true;
                next(obj, draft, this.i18nMappingObj.planCreationSuccess);
            },
            afterSubmit() {
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
                // this.$router.push({
                //     name: this.backName,
                //     params: {
                //         pid: this.projectOid,
                //         planOid: this.routeParams?.planOid,
                //         activeName: this.routeParams?.activeName || ''
                //     },
                //     query: {
                //         planTitle: this.$route.query?.planTitle || ''
                //     }
                // });
            },
            // 回显数据处理
            echoData(val, cb) {
                val.projectRef = store.state.projectInfo.name;
                cb(val);
            },
            onAssignmentsChange(val) {
                let formData = this.$refs.createForm.formData;

                formData.resAssignments = val;
                if (!val) {
                    formData.responsiblePerson = '';
                    return;
                }
                // 设置默认责任人
                const contianerRef = store.state.projectInfo.containerRef;
                const containerOid = `OR:${contianerRef.key}:${contianerRef.id}`;
                this.$famHttp({
                    url: '/fam/team/getUsersByContainer',
                    cache: false,
                    async: false,
                    data: {
                        containerOid,
                        roleCode: val
                    }
                }).then((resp) => {
                    let users = resp.data || [];
                    // 就取第一个人
                    formData.responsiblePerson = users.length > 0 ? [users[0]] : '';
                });
            },
            initParentTask() {
                this.parentTask = this.routeParams.planOid;
                // 根据父任务oid查询其显示名
                commonHttp
                    .commonAttr({
                        data: {
                            oid: this.parentTask
                        }
                    })
                    .then((resp = {}) => {
                        this.parentTaskOptions = [
                            {
                                oid: this.routeParams.planOid,
                                displayName: resp.data?.caption?.split(' - ')?.[1]
                            }
                        ];
                    });
            },
            // 父任务搜索
            searchTaskMethod(keyword) {
                let { projectOid, collectId } = this;
                this.$famHttp({
                    url: '/ppm/listByKey',
                    method: 'GET',
                    data: {
                        className: store.state.classNameMapping.task,
                        keyword,
                        tmplTemplated: false,
                        taskId: '',
                        projectId: projectOid,
                        selectType: 'optionalParent',
                        collectId
                    }
                }).then((resp) => {
                    this.parentTaskOptions = resp?.data || [];
                });
            }
        }
    };
});
