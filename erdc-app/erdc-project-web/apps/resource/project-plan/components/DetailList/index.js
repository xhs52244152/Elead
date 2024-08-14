define([
    'vue',
    'erdcloud.kit',
    'EventBus',
    ELMP.resource('ppm-store/index.js'),
    'text!' + ELMP.resource('project-plan/components/DetailList/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.resource('project-plan/components/DetailList/style.css'),
    'underscore'
], function (Vue, ErdcKit, EventBus, store, template, utils) {
    const _ = require('underscore');
    return {
        template,
        // inject: ['obj'],
        props: {
            poid: String,
            isDetail: Boolean,
            isTemplate: Boolean,
            fromRouteName: String
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-plan/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    updateSuccess: this.getI18nByKey('updateSuccess'),
                    pleaseEnterKeyword: this.getI18nByKey('pleaseEnterKeyword'),
                    actualWorkingHours: this.getI18nByKey('actualWorkingHours'),
                    estimatedWorkingHours: this.getI18nByKey('estimatedWorkingHours'),
                    duration: this.getI18nByKey('duration'),
                    finishingRate: this.getI18nByKey('finishingRate'),
                    positiveNumberCheckTips: this.getI18nByKey('positiveNumberCheckTips'),
                    selectResourceRole: this.getI18nByKey('selectResourceRole'),
                    finishingRateCheckTips: this.getI18nByKey('finishingRateCheckTips'),
                    planEditSuccess: this.getI18nByKey('planEditSuccess')
                },
                // 所属应用
                appValue: '',
                appList: [],
                rawDataVo: {},
                // 所属类型
                typeList: [],
                formData: {},
                formId: '',
                readonly: false,
                hiddenField: {},
                formInfo: {},
                oid: this.poid,
                resAssignments: '',
                parentTask: '',
                parentTaskOptions: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'childList',
                    value: 'oid'
                },
                linkOid: '',
                collectId: '',
                initCount: 0
            };
        },
        computed: {
            projectOid() {
                return this.$route.query.pid;
            },
            configParameter() {
                return {
                    title: '',
                    className: 'erd.cloud.ppm.plan.entity.Task',
                    layoutName: this.layoutName,
                    showDetailForm: true, // 是否隐藏详细信息表单(此处考虑联动情况,即基本信息和详细信息不存在联动问题)
                    basicComponentName: 'commonBaseTaskInfo', // 基础组件名称
                    basicComponent: ErdcKit.asyncComponent(
                        ELMP.resource('project-task/components/EditBasicInfo/index.js')
                    ),
                    basicComponentUrl: 'project-task/components/EditBasicInfo/index.js', // 基础组件地址
                    updateUrl: '/ppm/update',
                    backName: this.fromRouteName, // 路由返回名称
                    lookDetailName: 'planDetail',
                    getDetailUrl: '/ppm/attr', // 获取表单详情接口
                    saveDraft: false, // 是否显示保存草稿按钮
                    formHeight: 'calc(100vh - 190px)'
                };
            },
            backName() {
                const backNames = {
                    taskEdit: 'projectTaskList',
                    planEdit: 'planList'
                };
                return backNames[this.$route.name];
            },
            layoutName() {
                return store.state.projectInfo['templateInfo.tmplTemplated'] && this.$route.query.pid
                    ? 'TEMPLATE_UPDATE'
                    : 'UPDATE';
            },
            queryLayoutParams() {
                // 区分模板还是计划
                return {
                    name: store.state.projectInfo['templateInfo.tmplTemplated'] ? 'TEMPLATE_DETAIL' : 'DETAIL',
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: store.state.projectInfo['templateInfo.tmplTemplated'] ? 'TEMPLATE_DETAIL' : 'DETAIL'
                        // }
                    ]
                };
            },
            schemaMapper() {
                let roleCode = this.resAssignments;
                let containerOid = `OR:${store.state.projectInfo.containerRef.key}:${store.state.projectInfo.containerRef.id}`;
                let _this = this;
                _this.initCount++;
                return {
                    responsiblePerson(schema) {
                        schema.props.searchScop = 'container';
                        schema.props.params = {
                            containerOid,
                            roleCode
                        };

                        // 首次不需要清空
                        if (_this.initCount > 2) _this.$refs.editForm.formData.responsiblePerson = '';

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
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js')),
            CommonEditForm: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/EditForm/index.js')),
            ProjectAssignmentsSelect: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/ProjectAssignmentsSelect/index.js')
            )
        },
        beforeRouteEnter(to, from, next) {
            // 这里还无法访问到组件实例，this === undefined

            next((vm) => {
                vm.fromRouteName = vm.fromRouteName || from.name;
                vm.configParameter.backName = vm.fromRouteName;
            });
        },
        created() {
            if (this.isDetail) {
                this.getFormInfo();
            }
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
            getFormInfo() {
                if (!this.oid) return;
                let className = this.oid.split(':')?.[1];
                this.$famHttp({
                    method: 'GET',
                    url: '/ppm/attr',
                    className,
                    params: {
                        oid: this.oid
                    }
                }).then((res) => {
                    this.formInfo = res?.data?.rawData || {};
                    this.handleRenderData(this.formInfo);
                });
            },
            handleRenderData(data) {
                this.formData = ErdcKit.deserializeAttr(data, {
                    valueMap: {
                        'projectRef': () => {
                            return store.state.projectInfo.name;
                        },
                        'typeReference': (e, data) => {
                            return data['typeReference']?.displayName || '';
                        },
                        'lifecycleStatus.status': (e, data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'responsiblePerson': ({ users }) => {
                            return users;
                        },
                        'participant': ({ value }) => {
                            return value;
                        },
                        'parentTask': (e) => {
                            return e.displayName;
                        },
                        'resAssignments': (e) => {
                            return e.displayName;
                        },
                        'collectRef': (e) => {
                            return e.displayName;
                        },
                        'parentRef': (e) => {
                            return e.displayName;
                        }
                    }
                });
                this.formData['lifecycleStatus.value'] = data['lifecycleStatus.status'].value;
                this.$emit('ready', this.formData);
            },
            handleClick(val) {
                this.componentId = val;
            },
            // 回显数据处理
            echoData(val = {}, callback) {
                let data = ErdcKit.deserializeAttr(val, {
                    valueMap: {
                        'typeReference': (e, data) => {
                            return data['typeReference']?.oid || '';
                        },
                        'responsiblePerson': ({ users }) => {
                            return users;
                        },
                        'templateInfo.tmplTemplated': (e, data) => {
                            return data['templateInfo.tmplTemplated']?.value || '';
                        },
                        'projectRef': (e, data) => {
                            return data['projectRef']?.displayName || '';
                        },
                        'lifecycleStatus.status': (e, data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'participant': ({ value }) => {
                            return value;
                        },
                        'parentTask': (e) => {
                            return e.displayName;
                        },
                        'resAssignments': (e) => {
                            return e.displayName;
                        }
                    }
                });

                this.resAssignments = val.resAssignments?.value;
                this.collectId = val.collectRef?.oid;
                // 父任务初始回显数据处理
                if (val.parentTask) {
                    this.parentTask = val.parentTask.oid;
                    this.parentTaskOptions = [
                        {
                            displayName: val.parentTask.displayName,
                            oid: val.parentTask.oid
                        }
                    ];
                }

                // 初始linkOid缓存
                this.linkOid = val.linkOid?.value || '';

                callback(data);
            },
            afterSubmit() {
                // this.$store.dispatch('route/delVisitedRoute', this.$route);
                // this.$router.push({
                //     name: this.backName,
                //     params: {
                //         pid: this.projectOid,
                //         planOid: this.oid
                //     },
                //     query: {
                //         planTitle: this.$route.query?.planTitle || ''
                //     }
                // });
            },
            beforeSubmit(data, next, draft) {
                let verificationKeys = [
                    { key: 'planInfo.actualDuration', name: this.i18nMappingObj.actualWorkingHours },
                    { key: 'planInfo.workload', name: this.i18nMappingObj.estimatedWorkingHours },
                    { key: 'planInfo.duration', name: this.i18nMappingObj.duration },
                    { key: 'planInfo.completionRate', name: this.i18nMappingObj.finishingRate }
                ];
                let verificationName = this.verificationData(verificationKeys, data, draft);
                if (verificationName) {
                    return this.$message({
                        type: 'info',
                        message: verificationName + this.i18nMappingObj.positiveNumberCheckTips
                    });
                }

                if (_.isEmpty(this.resAssignments)) {
                    return this.$message.info(this.i18nMappingObj.selectResourceRole);
                }

                let completionRate = ErdcKit.deserializeAttr(data?.attrRawList);
                if (
                    completionRate['planInfo.completionRate'] &&
                    Number(completionRate['planInfo.completionRate']) > 100
                ) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj.finishingRateCheckTips
                    });
                }
                data?.attrRawList.some((el) => {
                    if (el.attrName === 'projectRef') {
                        el.value = store.state.projectInfo.oid;
                    }
                });

                // 资源角色
                data.attrRawList = data.attrRawList.filter((item) => {
                    return item.attrName !== 'resAssignments';
                });
                data.attrRawList.push({
                    attrName: 'resAssignments',
                    value: this.resAssignments
                });

                // 父任务参数处理
                if (this.parentTask) {
                    data.relationList = data.relationList || [];
                    data.relationList.push({
                        action: 'UPDATE',
                        appName: '',
                        associationField: '',
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef',
                                category: 'HARD',
                                value: this.parentTask // 父任务Oid
                            }
                        ],
                        className: 'erd.cloud.ppm.plan.entity.TaskLink',
                        oid: this.linkOid // 原本LinkOid
                    });
                    data.associationField = 'roleAObjectRef';
                    data.attrRawList.push({
                        attrName: 'parentRef',
                        value: this.parentTask
                    });
                }

                // 保存草稿
                if (draft) data.isDraft = true;

                next(data, draft, this.i18nMappingObj.planEditSuccess);
            },
            verificationData(verificationKeys, data, draft) {
                let verificationName;
                let reg = /^\d+(\.\d)?$/;
                for (let res of verificationKeys) {
                    let key = res.key;
                    let value = data.attrRawList.find((item) => item.attrName === key)?.value || '';
                    if (!reg.test(value) && value && !draft) {
                        verificationName = res.name;
                        break;
                    }
                }
                return verificationName;
            },
            onAssignmentsChange(val) {
                let formData = this.$refs.editForm.formData;

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
