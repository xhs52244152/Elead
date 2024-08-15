define([
    'text!' + ELMP.resource('erdc-pdm-components/ContainerTeam/index.html')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ContainerTeam',
        template,
        components: {
            SpaceTeam: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        data() {
            return {
                teamTableType: '',
                showParticipantType: ['USER', 'GROUP', 'ROLE']
            };
        },
        computed: {
            oid() {
                return this.$route.query.pid;
            },
            showCreateRole() {
                const objectInfo = this.$store.state?.space?.object || {};
                const showCreateRole = objectInfo?.rawData?.['templateInfo.tmplTemplated']?.value;
                return !showCreateRole;
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
            },
            bizOid() {
                return this.$route.query.oid;
            }
        }
    };
});
