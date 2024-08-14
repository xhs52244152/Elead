(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else {
        factory();
    }
})(this, function () {
    var $link = document.createElement('link');
    $link.rel = 'stylesheet';
    $link.type = 'text/css';
    $link.href = 'lib/erd-iconfont.css';
    document.getElementsByTagName('head')[0].appendChild($link);
});
