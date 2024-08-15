define([
    'text!' + ELMP.resource('library-space/views/folder/index.html')
], function (template) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmLibraryStore');
    const ErdcKit = require('erdc-kit');

    return {
        name: 'LibraryFolder',
        template,
        components: {
            ContainerFolder: ErdcKit.asyncComponent(ELMP.resource('erdc-pdm-components/ContainerFolder/index.js'))
        },
        computed: {
            ...mapGetters(['getObjectMapping']),
            // 资源库视图映射
            libraryMapping() {
                return this.getObjectMapping({ objectName: 'library' });
            },
            // 文件夹视图映射
            folderMapping() {
                return this.getObjectMapping({ objectName: 'folder' });
            },
            className() {
                return this.libraryMapping?.className || '';
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
