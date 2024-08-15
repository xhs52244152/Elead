define([ELMP.resource('erdc-guideline/help/useDrawerComponent.js')], function (useDrawerComponent) {
    const Vue = require('vue');

    return function ({
        title = '',
        content,
        size = '380px',
        withHeader = false,
        overflowVisible = true,
        help = {}
    } = {}) {
        const $el = document.createElement('div');
        $el.setAttribute('data-help-code', help?.code);
        const existEl = help?.code ? document.querySelector(`[data-help-code="${help?.code}"]`) : null;
        if (existEl && existEl.drawer) {
            existEl.drawer.hide();
        }
        const drawer = new Vue(useDrawerComponent({ title, content, size, withHeader, overflowVisible, help }));
        document.body.appendChild($el);
        drawer.$mount($el);
        drawer.$once('closed', () => {
            drawer.$destroy();
            $el.remove();
        });
        $el.drawer = drawer;
        return drawer;
    };
});
