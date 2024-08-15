define([
    ELMP.resource('erdc-cbb-components/ContainerTemplate/index.js'),
    ELMP.func('erdc-epm-document/config/viewConfig.js'),
    ELMP.func('erdc-epm-document/config/operateAction.js'),
    '../../actions.js'
], function (ContainerTemplate, viewConfig, operateAction, actions) {
    const ErdcStore = require('erdcloud.store');
    // 模板编辑、删除事件注册
    ErdcStore.dispatch('registerActionMethods', actions);

    return {
        name: 'EpmDocumentTemplate',
        mixins: [ContainerTemplate],
        computed: {
            // 资源库类名
            className() {
                return viewConfig?.epmDocumentViewTableMap?.className || '';
            },
            actionConfig() {
                return {
                    name: 'PDM_EPM_DOCUMENT_TEMPLATE_CREATE', //操作按钮的内部名称
                    containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                    className: this.className //维护到store里
                };
            }
        },
        data() {
            return {
                tableKey: 'DocumentTemplateView',
                isTemplate: true
            };
        },
        methods: {
            onDetail(row) {
                operateAction.viewEpmDocumentTemplate.call(this, row);
            },
            getActionConfig(row) {
                return {
                    name: 'PDM_EPM_DOCUMENT_TEMPLATE_OPERATE',
                    objectOid: row.oid,
                    className: this.className
                };
            }
        }
    };
});
