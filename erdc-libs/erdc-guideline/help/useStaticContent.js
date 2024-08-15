define([], function () {
    /**
     * 默认帮助内容（html）
     * @param {string} entry - html 文件地址
     * @returns {import('vue').ComponentOptions}
     */
    return function (entry) {
        return {
            setup() {
                const { ref, onBeforeMount, watch } = require('vue');
                let content = ref();
                let html = ref('');

                onBeforeMount(() => {
                    require([`text!${entry}`], function (_html) {
                        html.value = _html;
                    });
                });

                watch(html, (value) => {
                    if (content.value) {
                        content.value.innerHTML = value;
                    }
                });

                return {
                    content
                };
            },
            template: `
                    <div ref="content"></div>
                `
        };
    };
});
