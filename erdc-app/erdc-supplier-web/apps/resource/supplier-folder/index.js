define(['text!' + ELMP.resource('supplier-folder/index.html'), 'vuex', 'erdc-kit'], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmSupplierStore');
    const ErdcKit = require('erdc-kit');

    return {
        name: 'SupplierFolder',
        template,
        components: {
            ContainerFolder: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/ContainerFolder/index.js'))
        },
        data() {
            return {};
        },
        computed: {
            ...mapGetters(['getViewTableMapping']),
            // 供应商视图映射
            viewTableMapping() {
                return this.getViewTableMapping({ tableName: 'supplier' });
            },
            // 文件夹按钮对象
            folderInfoMapping() {
                return this.viewTableMapping?.folderInfo || {};
            },
            className() {
                return this.viewTableMapping?.className || '';
            }
        }
    };
});
