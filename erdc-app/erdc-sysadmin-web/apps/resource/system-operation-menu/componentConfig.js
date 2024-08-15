define([], function () {
    /**
     * 目前只能用此种方式引入组件
     */
    return {
        EtAttachmentDataFilter: (apply) =>
            require([ELMP.resource('system-operation-menu/components/CodeFilterConfig/index.js')], (module) => {
                module('', (options) => apply(options));
            })
    };
});
