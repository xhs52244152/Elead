define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js')
], function (PropertiesPanelMixin) {
    return {
        name: 'ServiceTask',
        template: '<div></div>',
        mixins: [PropertiesPanelMixin],
        mounted() {
            this.modeling.updateProperties(this.activeElement, {
                delegateExpression: "${etServiceTaskListener}",
            });
        }
    };
})
