define(['text!' + ELMP.func('erdc-document/components/DocumentTeam/index.html')], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'DocumentTeam',
        template,
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        },
        props: {
            vm: Object,
            className: {
                type: String,
                default: 'erd.cloud.cbb.doc.entity.EtDocument'
            }
        },
        data() {
            return {
                teamTableType: 'document',
                showParticipantType: ['USER', 'GROUP', 'ROLE']
            };
        },
        computed: {
            teamOid() {
                return this.vm?.sourceData?.teamRef?.oid ?? '';
            },
            teamTemplateOid() {
                return this.vm?.sourceData?.teamTemplateRef?.oid ?? '';
            },
            oid() {
                return this.$route?.query?.pid || this.$route?.query?.oid || '';
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
