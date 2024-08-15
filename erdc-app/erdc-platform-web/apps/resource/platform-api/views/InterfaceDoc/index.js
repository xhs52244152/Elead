define([
    'text!' + ELMP.resource('platform-api/views/InterfaceDoc/index.html'),
    ELMP.resource('platform-api/mixins/doc.js'),
    ELMP.resource('platform-api/util/swagger.js'),
    ELMP.resource('platform-api/util/index.js'),
    'css!' + ELMP.resource('platform-api/views/InterfaceDoc/index.css'),
    'css!' + ELMP.resource('platform-api/styles/docCommon.css')
], function (template, docMixin, Swagger, util) {
    return {
        mixins: [docMixin],
        template: template
    };
});
