define([
    'text!' + ELMP.resource('project-change-manage/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-change-manage/style.css')
], function (template, ErdcKit) {
    return {
        template,
        data() {
            return {
                isSaving: false,
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nPath: ELMP.resource('project-change-manage/locale/index.js'),
                selectVal: {
                    enableChange: {
                        type: 'enableChange',
                        value: {
                            projectStatus: ['RUN'],
                            projectTaskStatus: ['PENDING_EXECUTE'],
                            projectTaskLevel: [1, 2],
                            calculateStatus: ['PENDING_EXECUTE']
                        }
                    }
                },
                projectState: [],
                taskState: [],
                taskLevel: [
                    {
                        value: 1,
                        label: 1
                    },
                    {
                        value: 2,
                        label: 2
                    },
                    {
                        value: 3,
                        label: 3
                    },
                    {
                        value: 4,
                        label: 4
                    },
                    {
                        value: 5,
                        label: 5
                    },
                    {
                        value: 6,
                        label: 6
                    }
                ],
                selectType: ['enableChange'],
                backData: {} // 接口返回是数据存下来，保存时会用到里边的部分数据
            };
        },
        created() {
            this.getData();
            this.getState();
        },
        computed: {
            oid() {
                return this.$route.query.pid;
            },
            configs() {
                let { i18n } = this;
                return [
                    {
                        name: i18n.changeManagement,
                        filed: 'enableChange',
                        data: {
                            projectStatus: ['RUN'],
                            projectTaskStatus: ['PENDING_EXECUTE'],
                            projectTaskLevel: [1, 2],
                            calculateStatus: ['PENDING_EXECUTE']
                        }
                    }
                ];
            }
        },
        methods: {
            confirm() {
                this.isSaving = true;
                let params = {
                    name: this.backData?.name || '',
                    description: this.i18n.projectSettings,
                    configType: this.backData?.configType || 'Change_Management',
                    configContent: [],
                    contextReference: this.oid,
                    oid: this.backData?.oid || ''
                };
                let configContent = [];
                this.configs.forEach((item) => {
                    configContent.push(this.selectVal[item.filed]);
                });

                params.configContent = JSON.stringify(configContent);
                this.$famHttp({
                    url: '/ppm/communal/saveProjectSettings',
                    data: params,
                    className: this.projectClassName,
                    method: 'post'
                })
                    .then(() => {
                        this.getData();
                        this.$message({
                            type: 'success',
                            message: this.i18n.success
                        });
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    })
                    .finally(() => {
                        this.isSaving = false;
                    });
            },
            getData() {
                this.backData = {};
                this.$famHttp({
                    url: '/ppm/communal/getProjectSettings',
                    params: {
                        projectOid: this.oid,
                        configType: 'Change_Management'
                    },
                    className: this.projectClassName,
                    method: 'get'
                })
                    .then((res) => {
                        this.backData = res?.data || {};
                        let resoult = res.data?.configContent || '[]'; // 后端返回就是字符串，前端需要转一下，后端说他们转比较麻烦
                        JSON.parse(resoult).forEach((item) => {
                            this.selectVal[item.type].value = item.value;
                        });
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
            },
            // 获取项目状态、任务状态数据
            getState() {
                this.$famHttp({
                    url: '/fam/listByKey?_t=1709548614929&className=erd.cloud.foundation.lifecycle.entity.LifecycleState&showAll=false&targetClass=erd.cloud.ppm.project.entity.Project&isGetDraft=false',
                    className: 'fam',
                    method: 'get'
                })
                    .then((res) => {
                        this.projectState = res.data;
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
                this.$famHttp({
                    url: '/fam/listByKey?_t=1709548614929&className=erd.cloud.foundation.lifecycle.entity.LifecycleState&showAll=false&targetClass=erd.cloud.ppm.plan.entity.Task&isGetDraft=false',
                    className: 'fam',
                    method: 'get'
                })
                    .then((res) => {
                        this.taskState = res.data;
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
            }
        }
    };
});
