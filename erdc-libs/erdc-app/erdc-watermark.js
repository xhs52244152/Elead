define(['@erdcloud/erdcloud-ui', 'erdc-kit'], function (ErdcloudUI, ErdcKit) {
    let options;
    if (_.isFunction(window.ELCONF.watermark.option)) {
        options = window.ELCONF.watermark.option();
    } else {
        options = window.ELCONF.watermark.option || {};
    }
    options = ErdcKit.deepClone(options);
    if (_.isEmpty(options.content) && _.isEmpty(options.image) && _.isFunction(ELCONF.watermark.content)) {
        ELCONF.watermark.content(options);
    }
    ErdcloudUI.Watermark.render(
        Object.assign({}, options, {
            $container: document.body
        })
    );
});
