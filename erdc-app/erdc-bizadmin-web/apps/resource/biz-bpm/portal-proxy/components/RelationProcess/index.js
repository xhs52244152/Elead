define(['text!' + ELMP.resource('biz-bpm/portal-proxy/components/RelationProcess/index.html')], (template) => {
    const ErdcKit = require('erdcloud.kit');

    return {
        name: 'RelationProcess',
        template,
        props: {
            oid: {
                type: String,
                default: ''
            }
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-proxy/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['流程类型', '流程名称']),
                tableData: []
            };
        },
        computed: {
            columns() {
                return [
                    {
                        title: '流程类型',
                        prop: 'processCategoryName',
                        minWidth: '220'
                    },
                    {
                        title: '流程名称',
                        prop: 'processDefName',
                        minWidth: '220'
                    }
                ];
            }
        },
        mounted() {
            if (this.oid) {
                this.getTableData();
            }
        },
        methods: {
            getTableData() {
                this.$famHttp({
                    url: '/bpm/workproxy/link/page',
                    data: {
                        id: this.oid.split(':')[2]
                    },
                    method: 'POST'
                }).then((resp) => {
                    this.tableData = resp?.data || [];
                });
            }
        }
    };
});
