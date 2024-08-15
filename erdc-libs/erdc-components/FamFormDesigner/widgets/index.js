define([
    ELMP.resource('erdc-components/FamFormDesigner/widgets/configuration.js'),
    ELMP.resource('erdc-components/FamFormDesigner/widgets/basic.js'),
    ELMP.resource('erdc-components/FamFormDesigner/widgets/high-order.js')
], function (
    Configuration,
    getBasicWidgets,
    getHighOrderWidgets
) {
    return {
        basicWidgets: getBasicWidgets(Configuration),
        highOrderWidgets: getHighOrderWidgets(Configuration)
    };
});
