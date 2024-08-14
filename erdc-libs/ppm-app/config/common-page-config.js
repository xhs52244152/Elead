define([
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/utils.js'),
    ELMP.resource('ppm-store/index.js'),
    'erdcloud.router',
    ELMP.resource('ppm-https/common-http.js'),
    'fam:kit',
    'erdcloud.i18n',
    'erdcloud.store',
    ELMP.resource('project-plan/locale/index.js'),
    ELMP.resource('project-space/views/project-info/locale/index.js'),
    ELMP.resource('knowledge-library-list/locale/index.js')
], function (
    projectUtils,
    actionsUtils,
    store,
    router,
    commonHttp,
    FamKit,
    ErdcI18n,
    ErdcStore,
    planI18n,
    infoI18n,
    FolderI18n
) {
    const i18nMappingObjPlan = projectUtils.languageTransfer(planI18n.i18n);
    const i18nMappingObjInfo = projectUtils.languageTransfer(infoI18n.i18n);
    const i18nMappingObjFolder = projectUtils.languageTransfer(FolderI18n.i18n);
    const i18nData = Object.assign(i18nMappingObjPlan, i18nMappingObjInfo, i18nMappingObjFolder);
    const getI18n = (val) => {
        return i18nData[val] || '';
    };
    const curUtils = {
        // 资源角色值的变化事件
        onAssignmentsChange: (val, formData, vm) => {
            formData.resAssignments = val;
            if (!val) {
                // 清空责任人值
                curUtils.setResponsiblePerson({}, formData, vm);
                return;
            }
            // 设置默认责任人
            const contianerRef = store.state.projectInfo.containerRef;
            const containerOid = `OR:${contianerRef.key}:${contianerRef.id}`;
            vm.$famHttp({
                url: '/fam/team/getUsersByContainer',
                cache: false,
                async: false,
                data: {
                    containerOid,
                    roleCode: val
                }
            }).then((resp) => {
                let users = resp.data || [];
                let primaryUser;
                // 问题单编码：ISSUE2024053127640，BA已确认：有一个人时自动同步，多个人时同步主责任人，多个人且无责任人时不同步
                if (users.length === 1) {
                    primaryUser = users[0];
                } else if (users.length > 1) {
                    primaryUser = users.find((item) => item.primarily);
                }
                // 设置责任人值
                curUtils.setResponsiblePerson(primaryUser, formData, vm);
            });
        },
        // 设置责任人值
        setResponsiblePerson: (user, formData, vm) => {
            vm.$set(formData, 'responsiblePerson', user || {});
            vm.$set(formData, 'responsible-person', user?.oid || '');
            formData.responsiblePerson_defaultValue = user || {};
        }
    };
    return new Promise((resolve) => {
        // let planI18n = ErdcI18n.registerI18n({
        //     i18nLocalePath: ELMP.resource('project-plan/locale/index.js')
        // });
        // let projectI18n = ErdcI18n.registerI18n({
        //     i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js')
        // });
        // const i18nArr = [planI18n, projectI18n];
        // Promise.all(i18nArr).then(() => {
        const ErdcKit = require('erdcloud.kit');
        let baselineProjectOid;
        let config = {
            'erd.cloud.ppm.project.entity.Project': {
                create: {
                    title: getI18n('createProject'),
                    slots: {
                        formBefore: ErdcKit.asyncComponent(
                            ELMP.resource('project-space/views/project-info/components/CreateBasicInfo/index.js')
                        )
                    },
                    layoutName: 'CREATE',
                    layoutType: 'CREATE',
                    showDraftBtn: true,
                    formHeight: 'calc(100% - 12px)',
                    hooks: {
                        onFieldChange: function (formData, field, nVal) {
                            let params = {
                                field,
                                oid: '',
                                formData: formData,
                                nVal
                            };
                            params.changeFields = [
                                'timeInfo.scheduledStartTime',
                                'timeInfo.scheduledEndTime',
                                'duration'
                            ];
                            params.fieldMapping = {
                                scheduledStartTime: 'timeInfo.scheduledStartTime',
                                scheduledEndTime: 'timeInfo.scheduledEndTime',
                                duration: 'duration'
                            };
                            projectUtils.fieldsChange(params);
                            return formData;
                        },
                        beforeEcho: function (vm) {
                            vm.form = {};
                        },
                        beforeSubmit: function ({ formData, next, isSaveDraft }) {
                            // 获取预估工时
                            let predictDuration =
                                formData.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                            if (predictDuration && projectUtils.checkHours(predictDuration, getI18n('hoursTip')))
                                return;
                            // 获取工期
                            let duration =
                                formData.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                            if (duration && projectUtils.checkHours(duration, getI18n('durationTip'))) return;

                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'projectManager' && Array.isArray(el.value)) {
                                    el.value = el.value[0].oid;
                                }
                            });

                            // formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? getI18n('draftCreateSuccess') : '';
                            next(formData, tip);
                        },
                        afterSubmit: async function ({ responseData, isSaveDraft, cancel, vm, formData }) {
                            const { $router, $route } = router.app;
                            let visible = true;

                            if (!isSaveDraft) {
                                // 如果是工作台-我的项目-创建后直接跳转到上一页
                                if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                                    cancel();
                                    return;
                                }
                                let { destroy } = actionsUtils.useFreeComponent({
                                    template: `<erd-ex-dialog
                                        :visible.sync="visible"
                                        :title="i18nMappingObj.tip"
                                        size="mini"
                                        :show-close="false"
                                        custom-class="success-create-project"
                                        >
                                        <div class="tip" style="display: flex;">
                                            <i style="margin-right: 4px;font-size: 24px;" class="el-notification__icon el-icon-success"></i>
                                            <div class="tip-right" >
                                                <p style=" font-weight: 700;font-size: 16px;margin-bottom: 8px;">{{i18nMappingObj.createSuccess}}</p>
                                                <span style="font-size: 12px">{{i18nMappingObj.doSome}}</span>
                                            </div>
                                        </div>
                                        <div class="btn-list" style="text-align: center;margin-top: 20px;">
                                            <erd-button style="margin-left: 2px;" @click="handleClick('setTeam')">{{i18nMappingObj.setTeam}}</erd-button>
                                            <erd-button style="margin-left: 2px;" @click="handleClick('createTask')">{{i18nMappingObj.createTask}}</erd-button>
                                            <erd-button style="margin-left: 2px;" @click="handleClick('back')">{{i18nMappingObj.backList}}</erd-button>
                                        </div>
                                    </erd-ex-dialog>`,
                                    components: {
                                        SetState: ErdcKit.asyncComponent(
                                            ELMP.resource('ppm-component/ppm-components/SetState/index.js')
                                        )
                                    },
                                    data() {
                                        return {
                                            visible: false,
                                            // 国际化locale文件地址
                                            i18nLocalePath: ELMP.resource(
                                                'ppm-component/ppm-components/CreateForm/locale/index.js'
                                            ),
                                            // 国际化页面引用对象
                                            i18nMappingObj: {
                                                createSuccess: this.getI18nByKey('createSuccess'),
                                                doSome: this.getI18nByKey('doSome'),
                                                backList: this.getI18nByKey('backList'),
                                                setTeam: this.getI18nByKey('setTeam'),
                                                createTask: this.getI18nByKey('createTask'),
                                                tip: this.getI18nByKey('tip')
                                            }
                                        };
                                    },
                                    created() {
                                        this.visible = visible;
                                    },
                                    methods: {
                                        handleClick(val) {
                                            let routeMapping = {
                                                back: () => {
                                                    this.$store.dispatch('route/delVisitedRoute', this.$route);
                                                    $router.push({
                                                        path: '/project-list'
                                                    });
                                                    this.visible = false;
                                                },
                                                setTeam: () => {
                                                    this.$store.dispatch('route/delVisitedRoute', this.$route);
                                                    store.dispatch('fetchProjectInfo', { id: responseData });
                                                    setTimeout(() => {
                                                        $router.push({
                                                            path: '/space/project-team/team',
                                                            query: {
                                                                pid: responseData
                                                            }
                                                        });
                                                    }, 500);
                                                    this.visible = false;
                                                },
                                                createTask: () => {
                                                    this.$store.dispatch('route/delVisitedRoute', this.$route);
                                                    store.dispatch('fetchProjectInfo', { id: responseData });
                                                    setTimeout(() => {
                                                        $router.push({
                                                            path: '/space/project-plan/planCreate',
                                                            params: {
                                                                where: 'create_project'
                                                            },
                                                            query: {
                                                                pid: responseData,
                                                                where: 'create_project',
                                                                collectId:
                                                                    'OR:erd.cloud.ppm.plan.entity.TaskCollect:-1',
                                                                backName: 'planList'
                                                            }
                                                        });
                                                    }, 500);
                                                    this.visible = false;
                                                }
                                            };
                                            routeMapping[val] && routeMapping[val]() && destroy();
                                        }
                                    }
                                });
                            } else {
                                cancel();
                            }
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                },
                edit: {
                    title: getI18n('editProject'),
                    slots: {
                        formBefore: ErdcKit.asyncComponent(
                            ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.js')
                        )
                    },
                    layoutName: () => {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated'] ? 'TEMPLATE_UPDATE' : 'UPDATE';
                    },
                    layoutType: 'UPDATE',
                    showDraftBtn: true,
                    formHeight: 'calc(100% - 12px)',
                    tabs: () => {
                        let projectInfo = store.state.projectInfo;
                        let tabs = [
                            {
                                name: getI18n('detailedInfo'),
                                activeName: 'detail'
                            },
                            {
                                name: getI18n('relatedProject'),
                                activeName: 'relatedObjects',
                                basicProps: {
                                    oid: projectInfo?.oid
                                },
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-space/views/project-info/components/RelatedObjects/index.js')
                                )
                            }
                        ];
                        return tabs;
                    },
                    modelMapper: {
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (data) => {
                            return data['templateInfo.templateReference']?.oid || '';
                        },
                        'typeReference': (data) => {
                            return data['typeReference']?.oid || '';
                        },
                        'projectRef': (e) => {
                            return e.displayName;
                        }
                    },
                    hooks: {
                        onFieldChange: function (formData, field, nVal) {
                            let params = {
                                field,
                                oid: formData?.oid,
                                formData: formData,
                                nVal
                            };
                            params.changeFields = [
                                'timeInfo.scheduledStartTime',
                                'timeInfo.scheduledEndTime',
                                'duration'
                            ];
                            params.fieldMapping = {
                                scheduledStartTime: 'timeInfo.scheduledStartTime',
                                scheduledEndTime: 'timeInfo.scheduledEndTime',
                                duration: 'duration'
                            };
                            projectUtils.fieldsChange(params);
                            return formData;
                        },
                        beforeSubmit: function ({ formData, next, isSaveDraft }) {
                            // 获取预估工时
                            let predictDuration =
                                formData.attrRawList.find((item) => item.attrName === 'predictDuration')?.value || '';
                            if (predictDuration && projectUtils.checkHours(predictDuration, getI18n('hoursTip')))
                                return;
                            // 获取工期
                            let duration =
                                formData.attrRawList.find((item) => item.attrName === 'duration')?.value || '';
                            if (duration && projectUtils.checkHours(duration, getI18n('durationTip'))) return;

                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'projectManager' && Array.isArray(el.value)) {
                                    el.value = el.value[0].oid;
                                }
                            });

                            // formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value);
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;
                            let tip = isSaveDraft ? getI18n('draftEditSuccess') : getI18n('projectEditSuccess');
                            next(formData, tip);
                        },
                        afterSubmit: function ({ responseData, isSaveDraft, cancel, vm }) {
                            const router = require('erdcloud.router');

                            // 更新平台的store
                            vm.$store.dispatch('space/switchContextByObject', {
                                objectOid: store.state?.projectInfo?.oid,
                                force: true
                            });
                            // 修改项目后需要更新存在store的项目信息,等待平台更新后ppm在更新
                            setTimeout(() => {
                                store.dispatch('fetchProjectInfo', { id: responseData });
                            }, 1000);
                            const { $router } = router.app;
                            // 如果是编辑草稿，然后再次保存草稿则返回列表
                            if (!isSaveDraft) {
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    $router.push({
                                        path: '/space/project-space/projectInfo',
                                        query: {
                                            pid: responseData,
                                            title: '查看项目',
                                            componentRefresh: true
                                        }
                                    });
                                });
                            } else {
                                cancel();
                            }
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                },
                detail: {
                    title: function (formData, caption) {
                        return caption;
                    },
                    slots: {
                        customBtn: {
                            template: `
                                <baseline-select
                                    class="mr-8 custom-slot-select"
                                    @change="changeBaseline"
                                    @mounted:change="(data) => changeBaseline(data, true)"
                                ></baseline-select>
                            `,
                            components: {
                                BaselineSelect: ErdcKit.asyncComponent(
                                    ELMP.resource('ppm-component/ppm-components/BaselineSelect/index.js')
                                )
                            },
                            data() {
                                return {
                                    latestOid: ''
                                };
                            },
                            computed: {
                                // 动态表单实例
                                layoutForm() {
                                    return this.$parent?.$parent?.$refs?.detail?.[0]?.$refs?.layoutForm;
                                }
                            },
                            watch: {
                                '$route.query.activeName': {
                                    handler() {
                                        // 因为无法在tabs里获取到通用表单实例，所以在这里做监听。当activeName是工时记录时，切换成基线数据要把工时记录tab页隐藏，所以要跳转到详情去
                                        if (baselineProjectOid && this.$route?.query?.pid !== baselineProjectOid) {
                                            this.infoFormRef.activeName = 'detail';
                                        }
                                    }
                                }
                            },
                            methods: {
                                changeBaseline(currentBaselineData, isMountedChange) {
                                    let { value, pid, latestOid } = currentBaselineData || {};
                                    this.latestOid = latestOid || '';
                                    if (!value) {
                                        baselineProjectOid = pid;
                                        return this.$parent?.$parent.refresh(pid);
                                    }
                                    this.$famHttp({
                                        url: '/baseline/getMemberByMaster',
                                        method: 'GET',
                                        className: store.state.classNameMapping.baseline,
                                        params: {
                                            type: this.$route.meta?.className || '',
                                            masterOid: value
                                        }
                                    }).then((res) => {
                                        let [baselineData] = res.data || [{}];
                                        let { roleBObjectRef } = baselineData;
                                        baselineProjectOid = roleBObjectRef;
                                        this.layoutForm?.fetchFormDataByOid(roleBObjectRef);
                                        if (isMountedChange) {
                                            let timer = setTimeout(() => {
                                                clearTimeout(timer);
                                                // 使用动态表单实例的获取表单信息接口刷新表单数据
                                                this.layoutForm?.fetchFormDataByOid(roleBObjectRef);
                                            }, 1000);
                                        } else {
                                            // 使用动态表单实例的获取表单信息接口刷新表单数据
                                            this.layoutForm?.fetchFormDataByOid(roleBObjectRef);
                                        }
                                    });
                                }
                            }
                        }
                        // formBefore: ErdcKit.asyncComponent(ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.js'))
                    },
                    layoutName: () => {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated'] ? 'TEMPLATE_DETAIL' : 'DETAIL';
                    },
                    layoutType: 'DETAIL',
                    formHeight: 'calc(100% - 12px)',
                    actionKey: () => {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated']
                            ? 'PPM_PROJECT_TEMPLATE_OPERATE_MENU'
                            : 'PPM_OPERATE_MENU';
                    },
                    showSpecialAttr: true,
                    keyAttrs: function (formData) {
                        const infoListData = [
                            {
                                name: formData.projectManager_defaultValue?.[0]?.displayName || '',
                                label: getI18n('responsiblePeople'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['lifecycleStatus.status'],
                                label: getI18n('status'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['timeInfo.scheduledStartTime']?.split(' ')[0] || '',
                                label: getI18n('scheduledStartTime'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['timeInfo.scheduledEndTime']?.split(' ')[0] || '',
                                label: getI18n('scheduledEndTime'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            }
                        ];
                        return infoListData;
                    },
                    tabs: (data) => {
                        let tabs = [];
                        let projectInfo = store.state.projectInfo;
                        if (data?.['lifecycleStatus.status']?.value === 'DRAFT') {
                            tabs = [
                                {
                                    name: getI18n('detailedInfo'),
                                    activeName: 'detail'
                                },
                                {
                                    name: getI18n('relatedProject'),
                                    activeName: 'relatedObjects',
                                    basicProps: {
                                        oid: projectInfo?.oid
                                    },
                                    component: ErdcKit.asyncComponent(
                                        ELMP.resource(
                                            'project-space/views/project-info/components/RelatedObjects/index.js'
                                        )
                                    )
                                }
                            ];
                        } else {
                            tabs = [
                                {
                                    name: getI18n('detailedInfo'),
                                    activeName: 'detail'
                                },
                                {
                                    name: getI18n('relatedProject'),
                                    activeName: 'relatedObjects',
                                    basicProps: {
                                        oid: baselineProjectOid || projectInfo?.oid
                                    },
                                    component: ErdcKit.asyncComponent(
                                        ELMP.resource(
                                            'project-space/views/project-info/components/RelatedObjects/index.js'
                                        )
                                    ),
                                    isHide: projectInfo?.['templateInfo.tmplTemplated']
                                },
                                {
                                    activeName: 'workHourRecord',
                                    name: getI18n('workHourRecord'),
                                    basicProps: {
                                        oid: baselineProjectOid || projectInfo?.oid,
                                        className: store.state.classNameMapping.project,
                                        workHourClassName: store.state.classNameMapping.projectTime,
                                        topMenuActionName: 'PPM_PROJECT_TIMESHEET_LIST_MENU',
                                        optMenuActionName: 'PPM_PROJECT_TIMESHEET_OPERATE_MENU',
                                        tableKey: 'ProjTimesheetView'
                                    },
                                    isHide: projectInfo?.['templateInfo.tmplTemplated'],
                                    component: ErdcKit.asyncComponent(
                                        ELMP.resource('ppm-component/ppm-components/WorkHourRecord/index.js')
                                    )
                                },
                                {
                                    activeName: 'ProcessRecords',
                                    name: getI18n('processRecord'),
                                    basicProps: {
                                        businessOid: baselineProjectOid || projectInfo?.oid
                                    },
                                    isHide: projectInfo?.['templateInfo.tmplTemplated'],
                                    component: ErdcKit.asyncComponent(
                                        ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                                    )
                                }
                            ];
                            const { $route, $router } = router.app;
                            // 如果是基线就过滤工时记录
                            if ($route.query.pid !== baselineProjectOid && baselineProjectOid) {
                                tabs = tabs.filter((item) => item.activeName !== 'workHourRecord');
                                $route.query.activeName === 'workHourRecord' &&
                                    $router.replace({
                                        ...$route,
                                        query: { ...$route?.query, activeName: 'detail' }
                                    });
                            }
                        }
                        return tabs;
                    },
                    modelMapper: {
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'templateInfo.templateReference': (data) => {
                            return data['templateInfo.templateReference']?.displayName || '';
                        },
                        'typeReference': (data) => {
                            return data['typeReference']?.displayName || '';
                        },
                        'productLineRef': (data) => {
                            return data['productLineRef']?.displayName || '';
                        },
                        'projectRef': (data) => {
                            return data['projectRef']?.displayName || '';
                        }
                    },
                    hooks: {
                        beforeSubmit: function ({ next }) {
                            next();
                        },
                        afterSubmit: function ({ cancel }) {
                            cancel();
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                }
            },
            'erd.cloud.ppm.plan.entity.Task': {
                create: {
                    title: function () {
                        const router = require('erdcloud.router');
                        const { $router } = router.app;
                        return $router?.currentRoute?.query?.createPlanTitle || getI18n('createTask');
                    },
                    slots: {
                        formBefore: ErdcKit.asyncComponent(
                            ELMP.resource('project-task/components/CreateBasicInfo/index.js')
                        ),
                        formSlots: {
                            'res-assignments': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/ProjectAssignmentsSelect/index.js')
                            ),
                            'collect-ref': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/PlanSetSelect/index.js')
                            ),
                            'parent-ref': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ParentTask/index.js')
                            ),
                            'responsible-person': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/ResponsiblePerson/index.js')
                            ),
                            'review-point-ref': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ReviewPointSelect/index.js')
                            ),
                            'review-category-ref': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ReviewCategoryRef/index.js')
                            )
                        }
                    },
                    editableAttr: ['projectRef', 'responsiblePerson', 'lifecycleStatus.status', 'stageFlag'],
                    layoutName: () => {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated'] ? 'TEMPLATE_CREATE' : 'CREATE';
                    },
                    layoutType: 'CREATE',
                    showDraftBtn: () => {
                        const router = require('erdcloud.router');
                        const { $route } = router.app;
                        return $route?.query?.sceneName === 'change' ? false : true;
                    },
                    formHeight: 'calc(100% - 12px)',
                    props: {
                        formSlotsProps({ formData }) {
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            return {
                                'res-assignments': {
                                    onAssignmentsChange(val) {
                                        // 资源角色值的变化事件
                                        curUtils.onAssignmentsChange(val, formData, this);
                                    }
                                },
                                'collect-ref': {
                                    projectOid: $route.query.pid,
                                    disabled: !!$route.query.collectId?.trim(),
                                    selectOnly: true,
                                    class: 'w_100p',
                                    callback: (val) => {
                                        if (val?.trim()) {
                                            formData.collectRef = val;
                                            commonHttp
                                                .commonAttr({
                                                    data: {
                                                        oid: val
                                                    }
                                                })
                                                .then((resp = {}) => {
                                                    formData.area = resp.data?.rawData?.area?.value || '-1';
                                                });
                                        } else {
                                            formData.area = '-1';
                                        }
                                    }
                                },
                                'parent-ref': {
                                    currentObjectOid: $route.query.planOid,
                                    currentObjectName: $route.query.planName,
                                    params: {
                                        className: store.state.classNameMapping.task,
                                        projectId: $route.query.pid,
                                        collectId: formData.collectRef,
                                        selectType: 'optionalParent',
                                        taskId: ''
                                    },
                                    type: 'parentTask'
                                },
                                'review-point-ref': {
                                    callback: function (val) {
                                        if (val?.trim()) {
                                            this.$set(formData, 'reviewPointRef', val);
                                        } else {
                                            this.$set(formData, 'reviewPointRef', '');
                                        }
                                    }
                                },
                                'review-category-ref': {
                                    productOid: store.state.projectInfo?.productLineRef,
                                    callback: function (val) {
                                        if (val?.trim()) {
                                            this.$set(formData, 'reviewCategoryRef', val);
                                        }
                                    }
                                }
                            };
                        },
                        formProps(vm) {
                            return {
                                schemaMapper: {
                                    resAssignments(schema) {
                                        // 设置初始值，否则无法监听
                                        schema.defaultValue = '';
                                    },
                                    stageFlag(schema) {
                                        const beforeForm = vm.$refs?.detail?.[0]?.$refs?.beforeForm;
                                        // 子任务创建  是否阶段字段只读
                                        if (vm?.formData['parent-ref']) {
                                            schema.readonly = true;
                                        }
                                        // 里程碑任务隐藏是否阶段
                                        if (
                                            beforeForm?.typeReferenceOpts.find(
                                                (item) => item.typeOid == beforeForm?.formData?.typeReference
                                            )?.typeName == 'erd.cloud.ppm.plan.entity.milestone'
                                        ) {
                                            schema.hidden = true;
                                        } else {
                                            schema.hidden = false;
                                        }
                                        // 如果是创建阶段任务就设置成只读状态
                                        schema.readonly = vm.$route.query.stageFlag === 'true';
                                    },
                                    collectRef(schema) {
                                        if (!vm.formData['collect-ref']?.trim()) {
                                            schema.defaultValue = '';
                                            schema.required = true;
                                        }
                                    },
                                    parentRef(schema) {
                                        if (vm?.$route?.query?.typeName === 'milestone') {
                                            schema.disabled = false;
                                        }
                                    },
                                    // 评审类型
                                    reviewCategoryRef(schema) {
                                        if (_.has(vm.formData, 'isReviewRequired')) {
                                            schema.hidden = !vm.formData['isReviewRequired'];
                                        }
                                    },
                                    // 评审点
                                    reviewPointRef(schema) {
                                        if (_.has(vm.formData, 'isReviewRequired')) {
                                            schema.hidden = !vm.formData['isReviewRequired'];
                                        }
                                    }
                                }
                            };
                        }
                    },
                    hooks: {
                        onFieldChange: function (formData, field, nVal, basicForm) {
                            // basicForm: 基本信息实例
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            let params = {
                                field,
                                oid: $route.query.pid,
                                formData: formData,
                                nVal
                            };
                            params.changeFields = [
                                'timeInfo.scheduledStartTime',
                                'timeInfo.scheduledEndTime',
                                'planInfo.duration'
                            ];
                            params.fieldMapping = {
                                scheduledStartTime: 'timeInfo.scheduledStartTime',
                                scheduledEndTime: 'timeInfo.scheduledEndTime',
                                duration: 'planInfo.duration',
                                typeOId: basicForm?.formData?.typeReference || '' // 如果类型是里程碑则不去计算工期
                            };
                            projectUtils.fieldsChange(params);
                            return formData;
                        },
                        beforeEcho: async function (vm) {
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            let data = {};
                            data.projectRef = store.state.projectInfo.identifierNo + ',' + store.state.projectInfo.name;
                            data['collect-ref'] = $route.query.currentPlanSet || $route.query.collectId;
                            $route?.query?.stageFlag ? (data.stageFlag = true) : '';
                            vm.form = data;
                        },
                        beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            const { beforeForm, 'collect-ref': collectRef } = vm?.$refs.detail[0]?.$refs || {};
                            let projectOid = $route.query.pid;
                            let collectId = formData.attrRawList.find((item) => item.attrName == 'collect-ref')?.value;
                            let collectInfo = collectRef[0]?.getPlanSetData(collectId);
                            let parentRef = formData.attrRawList.find((item) => item.attrName == 'parent-ref')?.value;
                            let duration =
                                formData.attrRawList.find((item) => item.attrName === 'planInfo.duration')?.value || '';
                            if (!/^\d+(\.\d)?$/.test(duration) && duration) {
                                return vm.$message({
                                    type: 'info',
                                    message: getI18n('durationCheckTips')
                                });
                            }
                            let obj = {};

                            formData?.attrRawList.forEach((el) => {
                                if (el.attrName == 'projectRef') {
                                    el.value = projectOid;
                                }
                                if (el.attrName == 'participant') {
                                    el.value = el.value = el.value ? el.value?.split(',') : [];
                                }
                                if (el.attrName == 'responsiblePerson' && typeof el.value !== 'string') {
                                    el.value = el.value?.oid;
                                }
                            });

                            // 由于表单不能使用驼峰形式插槽，导致有重复数据，所以先过滤驼峰形式数据，再转换数据
                            formData.attrRawList = formData?.attrRawList.filter((item) => {
                                const attrNames = [
                                    'resAssignments',
                                    'collectRef',
                                    'responsiblePerson',
                                    'reviewPointRef'
                                ];
                                return !attrNames.includes(item.attrName);
                            });
                            formData?.attrRawList.forEach((element) => {
                                const attrNames = [
                                    'res-assignments',
                                    'collect-ref',
                                    'responsible-person',
                                    'review-point-ref'
                                ];
                                if (attrNames.includes(element.attrName)) {
                                    element.attrName = ErdcKit.camelize(element.attrName);
                                }
                            });
                            formData.attrRawList = _.filter(formData.attrRawList, (item) => item.value != null);
                            let relationList = [
                                {
                                    action: 'CREATE',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            value: parentRef ? parentRef : projectOid
                                        }
                                    ],
                                    className: 'erd.cloud.ppm.plan.entity.TaskLink'
                                }
                            ];
                            // 保存
                            formData.attrRawList.push({
                                attrName: 'containerRef',
                                value:
                                    'OR:' +
                                    store.state.projectInfo.containerRef.key +
                                    ':' +
                                    store.state.projectInfo.containerRef.id
                            });
                            formData.attrRawList.push({
                                attrName: 'area',
                                value: collectInfo?.area || '-1'
                            });
                            // 里程碑任务默认是否阶段否
                            if (
                                beforeForm?.typeReferenceOpts.find(
                                    (item) => item.typeOid == beforeForm?.formData?.typeReference
                                )?.typeName == 'erd.cloud.ppm.plan.entity.milestone'
                            ) {
                                formData.attrRawList.push({
                                    attrName: 'stageFlag',
                                    value: false
                                });
                            }
                            if (store.state.projectInfo['templateInfo.tmplTemplated'] && projectOid) {
                                formData.attrRawList.push({
                                    attrName: 'templateInfo.tmplTemplated',
                                    value: true
                                });
                            }
                            let typeReference = formData.attrRawList.find(
                                (item) => item.attrName === 'typeReference'
                            ).value;
                            obj = {
                                attrRawList: formData.attrRawList,
                                relationList: relationList,
                                associationField: 'roleBObjectRef',
                                className: formData.className,
                                typeReference,
                                containerRef:
                                    'OR:' +
                                    store.state.projectInfo.containerRef.key +
                                    ':' +
                                    store.state.projectInfo.containerRef.id
                            };
                            if (isSaveDraft) obj.isDraft = true;
                            if ($route.query.sceneName === 'change') {
                                obj.action = 'CREATE';
                                obj.oid = '';
                                obj.parentCode = parentRef || '';
                                obj.attrRawList.find((item) => item.attrName === 'collectRef').displayName =
                                    collectInfo.name;
                                obj.attrRawList.push({
                                    attrName: 'lifecycleStatus.status',
                                    value: 'PLAN',
                                    displayName: '规划'
                                });
                                vm.$store.dispatch('route/delVisitedRoute', vm.$route).then((visitedRoutes) => {
                                    localStorage.setItem('changeCreatePlan', JSON.stringify(obj));
                                    // let visitedRoute = visitedRoutes.filter(
                                    //     (item) => item.name === 'workflowLauncher' || item.name === 'workflowActivator'
                                    // );
                                    visitedRoutes.length && vm.$router.push(visitedRoutes[0]);
                                });
                            } else {
                                next(obj, ErdcI18n.PlanCreationSuccess);
                            }
                        },
                        afterSubmit: function ({ responseData, vm, isSaveDraft }) {
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                vm.basicForm(false).then((basicForm) => {
                                    let basicFormObj = FamKit.deserializeAttr(basicForm);
                                    if (isSaveDraft) {
                                        vm.$router.push({
                                            path: '/space/project-plan/planEdit',
                                            query: {
                                                pid: vm.$route.query.pid,
                                                planOid: responseData,
                                                planTitle:
                                                    vm.$route.query.activeNames == 'SubTask'
                                                        ? vm.$route.query.planTitle
                                                        : basicFormObj?.name || getI18n('createTask'),
                                                collectId: vm.$route.query?.collectId || ''
                                            }
                                        });
                                    } else {
                                        vm.$router.push({
                                            path: '/space/project-plan/planDetail',
                                            params: {
                                                // 修改计划时  增加计划集参数
                                                currentPlanSet: vm.$route.query?.collectId || ''
                                            },
                                            query: {
                                                pid: vm.$route.query.pid,
                                                planOid: responseData,
                                                planTitle:
                                                    vm.$route.query.activeNames == 'SubTask'
                                                        ? vm.$route.query.planTitle
                                                        : basicFormObj?.name || getI18n('createTask'),
                                                collectId: vm.$route.query?.collectId || ''
                                            }
                                        });
                                    }
                                });
                            });
                        },
                        beforeCancel({ goBack }) {
                            const router = require('erdcloud.router');
                            const { $route, $router } = router.app;
                            function routerCallkback(fromRouter) {
                                $router.push(fromRouter);
                                // 有时候fromRouter.name返回是"xxx_xxx"这样的格式
                                if (fromRouter.name) {
                                    let defaultRouterClone = {
                                        params: fromRouter?.params,
                                        query: fromRouter?.query,
                                        path: fromRouter.path
                                    };

                                    let defaultRouter = JSON.parse(JSON.stringify(defaultRouterClone));
                                    // 变更不需要加这些参数
                                    if ($route.query.sceneName !== 'change') {
                                        defaultRouter.query.collectId = $route.query?.collectId;
                                        defaultRouter.query.currentPlanSet = $route.query?.collectId;
                                        delete defaultRouter.query.sceneName;
                                    }
                                    if ($route.query.backName) {
                                        defaultRouter.params.planOid = $route.query.planOid;
                                        // defaultRouter.path = `/space/project-plan/${routeNames[$route.query.backName]}`;
                                        // 从里程碑创建跳转过来
                                        if ($route.query.backName === 'projectMilestone') {
                                            defaultRouter.path = `/space/project-milestone/milestone`;
                                        }
                                        defaultRouter.query.planTitle = $route.query.planTitle || getI18n('createTask');
                                    }
                                    // 如果是项目模板跳转进来的
                                    if (store?.state?.projectInfo?.['templateInfo.tmplTemplated']) {
                                        defaultRouter.query.template = true; // 项目下拉变成只读
                                    }
                                    if (fromRouter.name == 'projectCreate') {
                                        defaultRouter.path = `/space/project-task/task/list`;
                                        defaultRouter.query.pid = $route.query.pid;
                                    }
                                    $router.push(defaultRouter);
                                } else {
                                    $router.push(fromRouter);
                                }
                            }
                            goBack(routerCallkback);
                        }
                    }
                },
                edit: {
                    title: getI18n('editTask'),
                    slots: {
                        formBefore: ErdcKit.asyncComponent(
                            ELMP.resource('project-task/components/EditBasicInfo/index.js')
                        ),
                        formSlots: {
                            'res-assignments': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/ProjectAssignmentsSelect/index.js')
                            ),
                            'collect-ref': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/PlanSetSelect/index.js')
                            ),
                            'parent-ref': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ParentTask/index.js')
                            ),
                            'responsible-person': ErdcKit.asyncComponent(
                                ELMP.resource('ppm-component/ppm-components/ResponsiblePerson/index.js')
                            ),
                            'review-point-ref': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ReviewPointSelect/index.js')
                            ),
                            'review-category-ref': ErdcKit.asyncComponent(
                                ELMP.resource('project-plan/components/ReviewCategoryRef/index.js')
                            )
                        }
                    },
                    layoutName: () => {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated'] ? 'TEMPLATE_UPDATE' : 'UPDATE';
                    },
                    layoutType: 'UPDATE',
                    showDraftBtn: true,
                    formHeight: 'calc(100% - 148px)',
                    props: {
                        formSlotsProps({ formData }) {
                            const router = require('erdcloud.router');
                            const { $route } = router.app;
                            formData['res-assignments'] = formData['res-assignments'] || formData['resAssignments'];
                            return {
                                'res-assignments': {
                                    resAssignmentsValue: formData['resAssignments'],
                                    onAssignmentsChange(val) {
                                        // 资源角色值的变化事件
                                        curUtils.onAssignmentsChange(val, formData, this);
                                    }
                                },
                                'collect-ref': {
                                    projectOid: $route.query.pid,
                                    disabled: true,
                                    selectOnly: true,
                                    class: 'w_100p',
                                    collectRefValue: formData['collectRef']
                                },
                                'parent-ref': {
                                    currentObjectOid: formData?.parentTask
                                        ? 'OR:' + formData?.parentTask?.key + ':' + formData?.parentTask?.id
                                        : '',
                                    params: {
                                        className: store.state.classNameMapping.task,
                                        projectId: $route.query.pid,
                                        collectId: $route.query.currentPlanSet || $route.query.collectId,
                                        selectType: 'optionalParent',
                                        taskId: $route.query.planOid || $route.query.planOid
                                    }
                                },
                                'review-point-ref': {
                                    reviewPointRefValue:
                                        typeof formData?.reviewPointRef === 'string'
                                            ? formData?.reviewPointRef
                                            : formData?.reviewPointRef
                                              ? 'OR:' +
                                                formData?.reviewPointRef?.key +
                                                ':' +
                                                formData?.reviewPointRef?.id
                                              : '',
                                    callback: function (val) {
                                        if (val?.trim()) {
                                            this.$set(formData, 'reviewPointRef', val);
                                        } else {
                                            this.$set(formData, 'reviewPointRef', '');
                                        }
                                    }
                                },
                                'review-category-ref': {
                                    productOid: store.state.projectInfo?.productLineRef,
                                    reviewCategoryRefValue:
                                        typeof formData?.reviewCategoryRef === 'string'
                                            ? formData?.reviewCategoryRef
                                            : formData?.reviewCategoryRef
                                              ? 'OR:' +
                                                formData?.reviewCategoryRef?.key +
                                                ':' +
                                                formData?.reviewCategoryRef?.id
                                              : '',
                                    callback: function (val) {
                                        if (val?.trim()) {
                                            this.$set(formData, 'reviewCategoryRef', val);
                                        }
                                    }
                                }
                            };
                        },
                        formProps(vm) {
                            return {
                                schemaMapper: {
                                    resAssignments(schema) {
                                        // 设置初始值，否则无法监听
                                        schema.defaultValue = '';
                                    },
                                    stageFlag(schema) {
                                        const { beforeForm } = vm.$refs?.detail?.[0]?.$refs || {};
                                        // 子任务创建  是否阶段字段只读
                                        if (vm?.formData['parent-ref']) {
                                            schema.readonly = true;
                                        }
                                        // 里程碑任务隐藏是否阶段
                                        if (
                                            beforeForm?.typeReferenceOpts.find(
                                                (item) => item.typeOid == beforeForm?.formData?.typeReference
                                            )?.typeName == 'erd.cloud.ppm.plan.entity.milestone'
                                        ) {
                                            schema.hidden = true;
                                        } else {
                                            schema.hidden = false;
                                        }
                                    },
                                    reviewCategoryRef(schema) {
                                        if (_.has(vm.formData, 'isReviewRequired')) {
                                            schema.hidden = !vm.formData['isReviewRequired'];
                                        }
                                    },
                                    // 评审点
                                    reviewPointRef(schema) {
                                        if (_.has(vm.formData, 'isReviewRequired')) {
                                            schema.hidden = !vm.formData['isReviewRequired'];
                                        }
                                    }
                                }
                            };
                        }
                    },
                    modelMapper: {
                        'projectRef': (data) => {
                            return data['projectRef'].displayName;
                        },
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'typeReference': (data) => {
                            return data['typeReference'].oid;
                        },
                        'responsiblePerson': (data) => {
                            return data['responsiblePerson'].users;
                        },
                        'collectRef': (data) => {
                            return data['collectRef'].oid;
                        }
                    },
                    tabs: (data) => {
                        const router = require('erdcloud.router');
                        const { $route } = router.app;
                        let projectInfo = store.state.projectInfo;
                        let isTemplate = !!(projectInfo['templateInfo.tmplTemplated'] && $route.query.pid);
                        let tabs = [
                            {
                                name: getI18n('detailedInfo'),
                                activeName: 'detail'
                            },
                            {
                                name: getI18n('deliverable'),
                                activeName: 'DeliveryDetail',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-plan/components/DeliveryDetails/index.js')
                                ),
                                basicProps: {
                                    poid: data?.oid?.value,
                                    isAddContainerRef: true
                                }
                            },
                            {
                                name: getI18n('subTask'),
                                activeName: 'SubTask',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-plan/components/SubTask/index.js')
                                ),
                                basicProps: {
                                    poid: data?.oid?.value,
                                    isTemplate
                                }
                            },
                            {
                                name: getI18n('frontToBackTask'),
                                activeName: 'FrontBackTask',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-plan/components/FrontBackTask/index.js')
                                ),
                                basicProps: {
                                    poid: data?.oid?.value,
                                    isTemplate
                                }
                            }
                        ];

                        if (!isTemplate) {
                            tabs.push(
                                ...[
                                    {
                                        name: getI18n('relevancy'),
                                        activeName: 'RelevanceList',
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('project-plan/components/RelevanceList/index.js')
                                        ),
                                        basicProps: {
                                            poid: data?.oid?.value
                                        }
                                    },
                                    {
                                        name: getI18n('associated'),
                                        activeName: 'passiveLinkRelated',
                                        basicProps: {
                                            relatedData: [
                                                {
                                                    routerName: 'taskDetail',
                                                    businessKey: 'passiveLinkTask'
                                                },
                                                {
                                                    routerName: 'issueDetail',
                                                    businessKey: 'passiveLinkIssue'
                                                },
                                                {
                                                    routerName: 'riskDetail',
                                                    businessKey: 'passiveLinkRisk'
                                                },
                                                {
                                                    businessKey: 'passiveLinkRequire'
                                                }
                                            ],
                                            idKey: 'planOid'
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('ppm-component/ppm-components/Related/index.js')
                                        )
                                    }
                                ]
                            );
                        }
                        // 如果是里程碑就去掉子任务tab页
                        if (data?.typeName?.value === 'erd.cloud.ppm.plan.entity.milestone') {
                            return tabs.filter((item) => item.activeName !== 'SubTask');
                        }
                        return tabs;
                    },
                    hooks: {
                        onFieldChange: function (formData, field, nVal, basicForm) {
                            let params = {
                                field,
                                oid: formData?.oid,
                                formData: formData,
                                nVal
                            };
                            params.changeFields = [
                                'timeInfo.scheduledStartTime',
                                'timeInfo.scheduledEndTime',
                                'planInfo.duration'
                            ];
                            params.fieldMapping = {
                                scheduledStartTime: 'timeInfo.scheduledStartTime',
                                scheduledEndTime: 'timeInfo.scheduledEndTime',
                                duration: 'planInfo.duration',
                                typeOId: basicForm?.formData?.typeReference || '' // 如果类型是里程碑则不去计算工期
                            };
                            projectUtils.fieldsChange(params);
                            return formData;
                        },
                        beforeSubmit: function ({ formData, next, isSaveDraft, vm }) {
                            function verificationData(verificationKeys, data, draft) {
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
                            }
                            let verificationKeys = [
                                { key: 'planInfo.actualDuration', name: getI18n('actualWorkingHours') },
                                { key: 'planInfo.workload', name: getI18n('estimatedWorkingHours') },
                                { key: 'planInfo.duration', name: getI18n('duration') },
                                { key: 'planInfo.completionRate', name: getI18n('finishingRate') }
                            ];
                            let parentTask = formData.attrRawList.find((item) => item.attrName == 'parent-ref')?.value;
                            let verificationName = verificationData(verificationKeys, formData, isSaveDraft);
                            if (verificationName) {
                                return vm.$message({
                                    type: 'info',
                                    message: verificationName + getI18n('positiveNumberCheckTips')
                                });
                            }

                            let completionRate = ErdcKit.deserializeAttr(formData?.attrRawList);
                            if (
                                completionRate['planInfo.completionRate'] &&
                                Number(completionRate['planInfo.completionRate']) > 100
                            ) {
                                return vm.$message({
                                    type: 'info',
                                    message: getI18n('finishingRateCheckTips')
                                });
                            }
                            formData?.attrRawList.some((el) => {
                                if (el.attrName === 'projectRef') {
                                    el.value = store.state.projectInfo.oid;
                                }
                                if (el.attrName == 'participant') {
                                    el.value = el.value ? el.value?.split(',') : [];
                                }
                                // 平台选人组件一会返回数组一会返回对象
                                if (el.attrName == 'responsiblePerson' && typeof el.value !== 'string') {
                                    el.value = el.value[0]?.oid || el.value?.oid || '';
                                }
                            });

                            // 父任务参数处理
                            if (parentTask) {
                                formData.relationList = formData.relationList || [];
                                formData.relationList.push({
                                    action: 'UPDATE',
                                    appName: '',
                                    associationField: '',
                                    attrRawList: [
                                        {
                                            attrName: 'roleAObjectRef',
                                            category: 'HARD',
                                            value: parentTask // 父任务Oid
                                        }
                                    ],
                                    className: 'erd.cloud.ppm.plan.entity.TaskLink',
                                    oid: vm?.sourceData?.linkOid?.value // 原本LinkOid
                                });
                                formData.associationField = 'roleAObjectRef';
                                formData.attrRawList.push({
                                    attrName: 'parentRef',
                                    value: parentTask
                                });
                            }
                            // 由于表单不能使用驼峰形式插槽，导致有重复数据，所以先过滤驼峰形式数据，再转换数据
                            formData.attrRawList = formData?.attrRawList.filter((item) => {
                                const attrNames = ['resAssignments', 'collectRef', 'responsiblePerson'];
                                return !attrNames.includes(item.attrName);
                            });

                            formData?.attrRawList.forEach((element) => {
                                const attrNames = ['res-assignments', 'collect-ref', 'responsible-person'];
                                if (attrNames.includes(element.attrName)) {
                                    element.attrName = ErdcKit.camelize(element.attrName);
                                    element.value = element?.value || '';
                                }
                            });
                            // 保存草稿
                            if (isSaveDraft) formData.isDraft = true;

                            next(formData, getI18n('planEditSuccess'));
                        },
                        afterSubmit: function ({ responseData, vm }) {
                            vm.$store.dispatch('route/delVisitedRoute', vm.$route).then(() => {
                                vm.$router.push({
                                    path: `/space/project-${vm.$route.meta.sceneName}/${vm.$route.meta.sceneName}Detail`,
                                    params: {
                                        activeName: vm.$route.query.activeNames
                                    },
                                    query: {
                                        pid: vm.$route.query.pid,
                                        planOid: responseData,
                                        planTitle: vm.formData.name,
                                        componentRefresh: true,
                                        activeName: vm.$route.query.activeNames || '',
                                        collectId: vm.$route.query.collectId || ''
                                    }
                                });
                            });
                        },
                        beforeCancel({ goBack, vm }) {
                            const router = require('erdcloud.router');
                            const { $route, $router } = router.app;
                            function routerCallkback(fromRouter) {
                                // 有时候fromRouter.name返回是"xxx_xxx"这样的格式
                                if (fromRouter.name) {
                                    const routeNames = {
                                        planEdit: 'planCreate',
                                        planDetail: 'planDetail',
                                        taskEdit: 'taskCreate',
                                        taskDetail: 'taskDetail'
                                    };
                                    const path = routeNames[fromRouter.name] || 'list';
                                    let defaultRouterClone = {
                                        // name: fromRouter?.name,
                                        path: `/space/project-plan/${path}`,
                                        params: fromRouter?.params,
                                        query: fromRouter?.query
                                    };

                                    let defaultRouter = JSON.parse(JSON.stringify(defaultRouterClone));
                                    defaultRouter.query.collectId = $route.query.collectId;
                                    defaultRouter.query.currentPlanSet = $route.query.collectId;
                                    defaultRouter.path = fromRouter.path;
                                    if ($route.query.backName) {
                                        defaultRouter.query.planOid = $route.query.planOid;
                                        // defaultRouter.name = $route.query.backName;
                                        // defaultRouter.path = `/space/project-plan/${routeNames[$route.query.backName]}`;
                                    }
                                    // 如果是项目模板跳转进来的
                                    if (store?.state?.projectInfo?.['templateInfo.tmplTemplated']) {
                                        defaultRouter.query.template = true; // 项目下拉变成只读
                                    }
                                    if (vm.sourceData['lifecycleStatus.status'].value === 'DRAFT') {
                                        defaultRouter.path = `/space/project-plan/list`;
                                    }
                                    $router.push(defaultRouter);
                                } else {
                                    $router.push(fromRouter);
                                }
                            }
                            goBack(routerCallkback);
                        }
                    }
                },
                detail: {
                    title: function (formData) {
                        return formData.name + '; ' + formData.identifierNo;
                    },
                    slots: {
                        // formBefore: ErdcKit.asyncComponent(ELMP.resource('project-space/views/project-info/components/EditBasicInfo/index.js'))
                    },
                    modelMapper: {
                        'lifecycleStatus.status': (data) => {
                            return data['lifecycleStatus.status']?.displayName;
                        },
                        'typeReference': (data) => {
                            return data['typeReference'].displayName;
                        },
                        'projectRef': (data) => {
                            return data['projectRef'].displayName;
                        },
                        'parentTask': (data) => {
                            return data['parentTask'].displayName;
                        },
                        'collectRef': (data) => {
                            return data['collectRef'].displayName;
                        },
                        'resAssignments': (data) => {
                            return data['resAssignments'].displayName;
                        },
                        'reviewPointRef': (data) => {
                            return data['reviewPointRef'].displayName;
                        }
                    },
                    layoutName: () => {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated'] ? 'TEMPLATE_DETAIL' : 'DETAIL';
                    },
                    layoutType: 'DETAIL',
                    formHeight: 'calc(100% - 12px)',
                    props: {
                        formProps(vm) {
                            return {
                                schemaMapper: {
                                    // 评审类型
                                    reviewCategoryRef(schema) {
                                        if (_.has(vm.formData, 'isReviewRequired')) {
                                            schema.hidden = !vm.formData['isReviewRequired'];
                                        }
                                    },
                                    // 评审点
                                    reviewPointRef(schema) {
                                        if (_.has(vm.formData, 'isReviewRequired')) {
                                            schema.hidden = !vm.formData['isReviewRequired'];
                                        }
                                    }
                                }
                            };
                        }
                    },
                    actionKey: function () {
                        return store?.state?.projectInfo?.['templateInfo.tmplTemplated']
                            ? 'PPM_TEMPLATE_TASK_DETAIL_OP_MENU'
                            : 'PPM_TASK_DETAIL_OP_MENU';
                    },
                    showSpecialAttr: true,
                    keyAttrs: function (formData) {
                        const infoListData = [
                            {
                                name: formData.responsiblePerson_defaultValue?.[0]?.displayName || '',
                                label: getI18n('responsiblePeople'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_f.png')
                            },
                            {
                                name: formData['lifecycleStatus.status'],
                                label: getI18n('status'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_o.png')
                            },
                            {
                                name: formData['timeInfo.scheduledStartTime']?.split(' ')[0],
                                label: getI18n('scheduledStartTime'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_s.png')
                            },
                            {
                                name: formData['timeInfo.scheduledEndTime']?.split(' ')[0],
                                label: getI18n('scheduledEndTime'),
                                img: ELMP.resource('ppm-component/ppm-components/InfoList/images/info_t.png')
                            }
                        ];
                        return infoListData;
                    },
                    tabs: (data) => {
                        const router = require('erdcloud.router');
                        const { $route } = router.app;
                        let projectInfo = store.state.projectInfo;
                        let isTemplate = !!(projectInfo['templateInfo.tmplTemplated'] && $route.query.pid);
                        let poid = data?.oid?.value || $route?.query?.planOid;
                        let tabs = [
                            {
                                name: getI18n('detailedInfo'),
                                activeName: 'detail'
                            },
                            {
                                name: getI18n('deliverable'),
                                activeName: 'DeliveryDetail',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-plan/components/DeliveryDetails/index.js')
                                ),
                                basicProps: {
                                    poid: poid,
                                    isAddContainerRef: true
                                }
                            },
                            {
                                name: getI18n('subTask'),
                                activeName: 'SubTask',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-plan/components/SubTask/index.js')
                                ),
                                basicProps: {
                                    poid: poid,
                                    isTemplate
                                }
                            },
                            {
                                name: getI18n('frontToBackTask'),
                                activeName: 'FrontBackTask',
                                component: ErdcKit.asyncComponent(
                                    ELMP.resource('project-plan/components/FrontBackTask/index.js')
                                ),
                                basicProps: {
                                    poid: poid,
                                    isTemplate
                                }
                            }
                        ];

                        if (!isTemplate) {
                            tabs.push(
                                ...[
                                    {
                                        name: getI18n('relevancy'),
                                        activeName: 'RelevanceList',
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('project-plan/components/RelevanceList/index.js')
                                        ),
                                        basicProps: {
                                            poid: poid
                                        }
                                    },
                                    {
                                        name: getI18n('associated'),
                                        activeName: 'passiveLinkRelated',
                                        basicProps: {
                                            relatedData: [
                                                {
                                                    routerName: 'taskDetail',
                                                    businessKey: 'passiveLinkTask'
                                                },
                                                {
                                                    routerName: 'issueDetail',
                                                    businessKey: 'passiveLinkIssue'
                                                },
                                                {
                                                    routerName: 'riskDetail',
                                                    businessKey: 'passiveLinkRisk'
                                                },
                                                {
                                                    businessKey: 'passiveLinkRequire'
                                                }
                                            ],
                                            idKey: 'planOid'
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('ppm-component/ppm-components/Related/index.js')
                                        )
                                    },
                                    {
                                        name: getI18n('workHourRecord'),
                                        activeName: 'workHourRecord',
                                        basicProps: {
                                            oid: poid,
                                            className: store.state.classNameMapping.task,
                                            workHourClassName: store.state.classNameMapping.taskTime,
                                            topMenuActionName: 'PPM_TASK_TIMESHEET_LIST_MENU',
                                            optMenuActionName: 'PPM_TASK_TIMESHEET_OPERATE_MENU',
                                            tableKey: 'TaskTimesheetView'
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('ppm-component/ppm-components/WorkHourRecord/index.js')
                                        )
                                    },
                                    {
                                        name: getI18n('processRecord'),
                                        activeName: 'ProcessRecords',
                                        basicProps: {
                                            businessOid: poid
                                        },
                                        component: ErdcKit.asyncComponent(
                                            ELMP.resource('ppm-component/ppm-components/ProcessRecords/index.js')
                                        )
                                    }
                                ]
                            );
                        }
                        // 如果是里程碑就去掉子任务tab页
                        if (data?.typeName?.value === 'erd.cloud.ppm.plan.entity.milestone') {
                            return tabs.filter((item) => item.activeName !== 'SubTask');
                        }
                        return tabs;
                    },
                    hooks: {
                        beforeSubmit: function ({ next }) {
                            next();
                        },
                        afterSubmit: function ({ cancel }) {
                            cancel();
                        },
                        beforeCancel({ goBack }) {
                            goBack();
                        }
                    }
                }
            }
        };
        resolve(config);
        // });
    });
});
