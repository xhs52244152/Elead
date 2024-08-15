define([
    ELMP.resource('erdc-cbb-components/ContainerTemplate/index.js'),
    ELMP.func('erdc-document/config/viewConfig.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    '../../actions.js'
], function (ContainerTemplate, viewConfig, cbbUtils, actions) {
    const ErdcStore = require('erdcloud.store');
    // 模板编辑、删除事件注册
    ErdcStore.dispatch('registerActionMethods', actions);

    return {
        name: 'DocumentTemplate',
        mixins: [ContainerTemplate],
        computed: {
            // 资源库类名
            className() {
                return viewConfig?.docViewTableMap?.className || '';
            }
        },
        data() {
            return {
                actionConfig: {
                    name: 'DOC_TEMPLATE_LIST_OPERATE', //操作按钮的内部名称
                    containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                    className: this.className //维护到store里
                },
                tableKey: 'DocumentTemplateView'
            };
        },
        methods: {
            onDetail(row) {
                cbbUtils.goToDetail(row, {
                    query: {
                        isTemplate: true,
                        className: this.className,
                        title: '查看文档',
                        ..._.pick(this.$route.query, (value, key) => {
                            return ['pid', 'typeOid'].includes(key) && value;
                        })
                    }
                });
            },
            getActionConfig(row) {
                return {
                    name: 'DOC_TEMPLATE_LIST_PER_OPERATE',
                    objectOid: row.oid,
                    className: this.className
                };
            }
        }
    };
});
