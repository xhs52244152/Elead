define([], function () {
    return {
        render (h) {
            return h('div', {
                domProps: {
                    innerHTML: '&nbsp;'
                }
            }, []);
        }
    }
});
