define([ELMP.resource('platform-mfe/views/layoutAndTheme/index.js')], function (LayoutAndTheme) {
    return {
        mixins: [LayoutAndTheme],
        data() {
            return {
                pageType: 'erdc-help'
            };
        },
        computed: {
            pageOption() {
                return [];
            }
        }
    };
});
