define([ELMP.resource('erdc-pdm-components/ContainerTemplate/index.js'), 'vuex'], function (ContainerTemplate) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmSupplierStore');

    return {
        name: 'SupplierTemplate',
        mixins: [ContainerTemplate],
        computed: {
            ...mapGetters(['getViewTableMapping']),
            // 供应商视图映射
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'supplier' });
            },
            // 供应商类名
            className() {
                return this.viewTableMapping?.className || '';
            }
        },
        methods: {
            onDetail(row) {
                this.$router.push({
                    name: 'supplierSpace',
                    params: {
                        pid: row.oid
                    },
                    query: {
                        title: row['name']
                    }
                });
            },
            getActionConfig(row) {
                return {
                    name: this.viewTableMapping?.templateInfo?.actionTableName,
                    objectOid: row.oid,
                    className: this.className
                };
            }
        }
    };
});
