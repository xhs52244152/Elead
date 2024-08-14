define([
    'text!' + ELMP.resource('requirement-list/components/RequirementTeam/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('requirement-list/components/RequirementTeam/style.css')
], function (template, ErdcKit, commonHttp) {
    return {
        template,
        data() {
            return {
                teamTableType: 'project',
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                context: {},
                isReady: false
            };
        },
        created() {
            commonHttp
                .commonAttr({
                    data: {
                        oid: this.oid
                    }
                })
                .then((resp) => {
                    let containerOid = resp.data.rawData.containerRef.oid;
                    this.getContainerInfo(containerOid);
                });
        },
        computed: {
            oid() {
                return 'OR:erd.cloud.ppm.require.entity.RequirementPool:1698587354582720513';
            },
            showCreateRole() {
                return true;
            },
            queryParams() {
                return {
                    data: {
                        appName: this.context?.appName || '',
                        isGetVirtualRole: false
                    }
                };
            },
            containerTeamRef() {
                return this.context?.containerTeamRef || null;
            }
        },
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        methods: {
            getContainerInfo(containerOid) {
                this.$famHttp({
                    url: '/fam/container/getCurrentContainerInfo',
                    data: {
                        oid: containerOid
                    }
                }).then(({ data }) => {
                    this.context = data;
                    this.$nextTick(() => {
                        this.isReady = true;
                    });
                });
            }
        }
    };
});
