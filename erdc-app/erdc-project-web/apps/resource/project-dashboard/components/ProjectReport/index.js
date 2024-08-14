define([
    'text!' + ELMP.resource('project-dashboard/components/ProjectReport/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                projectArr: []
            };
        },
        created() {
            this.getData();
        },
        mounted() {},
        computed: {
            oid() {
                return this.$route.query.pid;
            }
        },
        methods: {
            getProjectStates(projectCurrentStatus) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        method: 'POST',
                        url: '/ppm/common/template/states',
                        data: {
                            branchIdList: [this.oid],
                            successionType: "SET_STATE",
                            className: this.projectClassName
                        }
                    })
                        .then((res) => {
                            const stateOptions = res.data[this.oid];
                            let currentState =
                                stateOptions.filter((item) => item.name === projectCurrentStatus)[0]?.displayName || '';
                            resolve(currentState);
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                });
            },
            getData() {
                this.$famHttp({
                    url: '/ppm/communal/getEchartsOption',
                    data: {
                        primaryObjectOid: this.oid,
                        typeName: store.state.classNameMapping.project
                    },
                    className: this.projectClassName,
                    method: 'post'
                })
                    .then(async (res) => {
                        let resoult = res.data?.projectData || {};
                        this.projectArr = [
                            {
                                name: this.i18n.requiremendRate,
                                val: resoult.requirementCompletionRate
                            },
                            {
                                name: this.i18n.TaskRate,
                                val: resoult.taskCompletionRate
                            },
                            {
                                name: this.i18n.issueRate,
                                val: resoult.issueCompletionRate
                            },
                            {
                                name: this.i18n.riskRate,
                                val: resoult.riskCompletionRate
                            },
                            {
                                name: this.i18n.projectRate,
                                val: resoult.projectCompletionRate
                            },
                            {
                                type: 'state',
                                name: this.i18n.projectState,
                                val: resoult.projectCurrentStatus
                            }
                        ];
                    })
                    .catch((err) => {
                        this.$message({
                            type: 'error',
                            message: err?.data?.message || err?.data || err
                        });
                    });
            }
        },
        components: {
            DashboardConfig: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/DashboardConfig/index.js')
            )
        }
    };
});
