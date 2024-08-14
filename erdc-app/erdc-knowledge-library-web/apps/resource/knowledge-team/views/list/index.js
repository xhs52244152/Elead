define(['erdcloud.kit', ELMP.resource('ppm-store/index.js')], function (ErdcKit, ppmStore) {
    return {
        template: `
            <Team
                style="padding: var(--largeSpace)"
                v-if="isReady"
                :show-create-role="showCreateRole"
                :product-oid="oid"
                :container-team-ref="containerTeamRef"
                :query-params="queryParams"
                :team-table-type="teamTableType"
                :show-participant-type="showParticipantType"
                :biz-oid="oid"
                :action-config="{name: 'KNOWLEDGE_TEAM_OP_MENU'}"
            ></Team>
        `,
        data() {
            return {
                teamTableType: 'project',
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                context: {},
                isReady: false
            };
        },
        created() {
            this.getContainerInfo(ppmStore.state.knowledgeInfo?.containerRef);
        },
        computed: {
            oid() {
                return ppmStore.state.knowledgeInfo?.oid;
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
