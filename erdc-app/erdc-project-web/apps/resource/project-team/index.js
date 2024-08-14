define([
    'text!' + ELMP.resource('project-team/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('project-team/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        data() {
            return {
                i18nPath: ELMP.resource('project-team/locale/index.js'),
                defultTabsData: [],
                teamTableType: 'project',
                activeName: '',
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                currentComponent: 'Team',
                actionConfig: {
                    name: 'ProjectTeam_TABLE_ACTION'
                },
                // 是否存在团队变更流程
                hasProcess: false,
                isReady: false
                // containerTeamRef:
                //     'OR:' +
                //     store.state.projectInfo.teamTemplateRef.key +
                //     ':' +
                //     store.state.projectInfo.teamTemplateRef.id
            };
        },
        created() {
            this.$nextTick(() => {
                this.getTeamList();
            });
            this.validate();
        },
        activated() {
            this.isReady = false;
            this.validate();
        },
        computed: {
            teamName() {
                return this.i18n.team;
            },
            tabsData() {
                this.activeName = this.teamName;
                return this.defultTabsData.length
                    ? this.defultTabsData
                    : [{ oid: 'team', currentComponent: 'Team', labelName: this.teamName }];
            },
            oid() {
                return this.$route.query.pid;
            },
            productLineRefOid() {
                return store.state.projectInfo.productLineRef;
            },
            showCreateRole() {
                return !store.state.projectInfo['templateInfo.tmplTemplated'];
            },
            queryParams() {
                return {
                    data: {
                        appName: this.$store?.state?.space?.context?.appName || '',
                        isGetVirtualRole: false
                    }
                };
            },
            containerTeamRef() {
                return this.$store.state.space?.context?.containerTeamRef || null;
            }
        },
        methods: {
            handleClick(tab) {
                this.activeName = tab.name;
            },
            getTeamList() {
                if (this.productLineRefOid) {
                    this.$famHttp({
                        url: '/cbb/productInfo/getPathTeamByOid',
                        className: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                        params: {
                            oid: this.productLineRefOid
                        },
                        method: 'get'
                    })
                        .then((res) => {
                            if (res?.data && res.data.length) {
                                let data = res.data;
                                let teamList = [];
                                data.forEach((item) => {
                                    teamList.push({
                                        currentComponent: 'HeavyTeam',
                                        labelName: item.displayName,
                                        oid: item.oid
                                    });
                                });
                                this.defultTabsData = [
                                    { oid: 'team', currentComponent: 'Team', labelName: this.teamName },
                                    ...teamList
                                ];
                            }
                            this.$nextTick(() => {
                                this.handleClick({ name: this.teamName });
                            });
                        })
                        .catch(() => {});
                }
            },
            // 校验是否有团队变更在途流程，如果存在就要把项目-团队下的操作按钮都屏蔽
            validate() {
                this.$famHttp({
                    url: 'ppm/process/validate',
                    method: 'POST',
                    params: {
                        projectOid: this.$route.query.pid,
                        changeContent: 'TEAM'
                    }
                }).then((res) => {
                    this.hasProcess = res.data;
                    this.actionConfig = this.hasProcess ? {} : { name: 'ProjectTeam_TABLE_ACTION' };
                    this.isReady = true;
                });
            },
            changeTableConfig(config) {
                // 如果存在就屏蔽操作列
                if (this.hasProcess) config.column = config.column.filter((item) => item.prop !== 'operation');
                return config;
            }
        },
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js')),
            HeavyTeam: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-heavy-team/components/RoleMembers/index.js'))
        }
    };
});
