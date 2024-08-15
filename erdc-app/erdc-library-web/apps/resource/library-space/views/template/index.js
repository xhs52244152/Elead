define([
    ELMP.resource('erdc-cbb-components/ContainerTemplate/index.js'),
    'erdc-kit',
    'erdcloud.store',
    '../../../../../actions.js'
], function (ContainerTemplate, ErdcKit, ErdcStore, actions) {
    const { createNamespacedHelpers } = require('vuex');
    const { mapGetters } = createNamespacedHelpers('pdmLibraryStore');

    // 模板编辑、删除事件注册
    ErdcStore.dispatch('registerActionMethods', actions);

    return {
        name: 'LibraryTemplate',
        mixins: [ContainerTemplate],
        computed: {
            ...mapGetters(['getObjectMapping']),
            // 资源库视图映射
            libraryMapping() {
                return this.getObjectMapping({ objectName: 'library' });
            },
            // 模板视图映射
            templateMapping() {
                return this.getObjectMapping({ objectName: 'template' });
            },
            // 资源库类名
            className() {
                return this.libraryMapping?.className || '';
            }
        },
        methods: {
            onDetail(row) {
                let appName = 'erdc-library-web';
                let targetPath = '/space/library-space/detail';
                let query = {
                    title: row['name'],
                    pid: row.oid,
                    isTemplate: true
                }
                // path组装query参数
                let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                window.open(url, appName);
            },
            getActionConfig(row) {
                return {
                    name: this.templateMapping?.actionTableName,
                    objectOid: row.oid,
                    className: this.className
                };
            }
        }
    };
});