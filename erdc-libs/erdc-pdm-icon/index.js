(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        factory();
    }
})(this, function () {
    if (typeof define === 'function' && define.amd) {
        // require(['erdcloud.store'], function (store) {
        //     store.dispatch('registerIconResources', [
        //         {
        //             key: 'erdc-pdm-icon',
        //             displayName: 'PDM 图标',
        //             styleHref: ELMP.resource('erdc-pdm-icon/lib/erd-iconfont.css'),
        //             definitionUrl: ELMP.resource('erdc-pdm-icon/lib/erd-iconfont.json')
        //         }
        //     ]);
        // });
    } else {
        var $link = document.createElement('link');
        $link.rel = 'stylesheet';
        $link.type = 'text/css';
        $link.href = 'lib/erd-iconfont.css';
        document.getElementsByTagName('head')[0].appendChild($link);
    }
});
