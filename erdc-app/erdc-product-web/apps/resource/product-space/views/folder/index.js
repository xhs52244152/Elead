define([
    'text!' + ELMP.resource('product-space/views/folder/index.html')
], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmProductStore');
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ProductFolder',
        template,
        components: {
            ContainerFolder: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/ContainerFolder/index.js'))
        },
        computed: {
            ...mapGetters(['getObjectMapping']),
            // 产品视图映射
            productMapping() {
                return this.getObjectMapping({ objectName: 'product' });
            },
            // 文件夹视图映射
            folderMapping() {
                return this.getObjectMapping({ objectName: 'folder' });
            },
            className() {
                return this.productMapping?.className || '';
            }
        },
        activated() {
            // 强制组件刷新
            this.$route?.params?.componentRefresh && this.componentRefresh();
        },
        methods: {
            // 强制组件刷新
            componentRefresh() {
                this.$refs?.ContainerFolderRef?.refreshTree({}, 'reloadTable', 'FolderListDetail');
            }
        }
    };
});
