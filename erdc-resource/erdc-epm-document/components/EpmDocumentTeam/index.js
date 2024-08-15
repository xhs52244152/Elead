define([
    'text!' + ELMP.func('/erdc-epm-document/components/EpmDocumentTeam/index.html'),
    ELMP.func('/erdc-epm-document/config/viewConfig.js'),
    'css!' + ELMP.func('/erdc-epm-document/components/EpmDocumentTeam/index.css')
], function (template, viewConfig) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'EpmTeam',
        template,
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        props: {
            vm: Object
        },
        data() {
            return {
                teamTableType: 'epmDocument',
                showParticipantType: ['USER', 'GROUP', 'ROLE'],
                className: viewConfig.epmDocumentViewTableMap.className
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
            },
            bizOid() {
                return this.vm?.sourceData?.oid?.value;
            }
        }
    };
});
