define([
    'text!' + ELMP.func('erdc-part/components/PartTeam/index.html'),
    ELMP.func('erdc-part/config/viewConfig.js'),
    'css!' + ELMP.func('erdc-part/components/PartTeam/index.css')
], function (template, viewConfig) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'PartTeam',
        template,
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        props: {
            vm: Object
        },
        data() {
            return {
                teamTableType: 'part',
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                className: viewConfig.partViewTableMap.className
            };
        },
        computed: {
            teamOid() {
                return this.vm?.sourceData?.teamRef?.oid ?? '';
            },
            teamTeamplateOid() {
                return this.vm?.sourceData?.teamTemplateRef?.oid ?? '';
            },
            oid() {
                return this.$route.query.pid;
            },
            bizOid() {
                return this.vm?.sourceData?.oid?.value;
            },
            containerRef() {
                return this.$store.state.space?.context?.oid;
            },
            queryParams() {
                return {
                    data: {
                        appName: this.$store?.state?.space?.context?.appName || '',
                        isGetVirtualRole: false
                    }
                };
            }
        }
    };
});
