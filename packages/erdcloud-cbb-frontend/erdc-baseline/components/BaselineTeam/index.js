define([
    'text!' + ELMP.func('erdc-baseline/components/BaselineTeam/index.html'),
    ELMP.func('erdc-baseline/const.js')
], function (template, CONST) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'BaselineTeam',
        template,
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        props: {
            teamRef: String,
            oid: String,
            pid: String
        },

        data() {
            return {
                teamTableType: 'product',
                showParticipantType: ['USER', 'GROUP', 'ROLE']
            };
        },
        computed: {
            className() {
                return CONST.className;
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
                return this.teamRef;
            },
            bizOid() {
                return this.oid;
            }
        }
    };
});
