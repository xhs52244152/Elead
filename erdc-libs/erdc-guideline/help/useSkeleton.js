define([], function () {
    /**
     * 获得一个简单骨架屏组件
     * @param { number } [rows=5] - 骨架屏行数
     * @returns {import('vue').ComponentOptions}
     */
    return function ({ rows = 5 } = {}) {
        return {
            setup() {
                return {
                    rows
                };
            },
            template: `
                    <erd-skeleton :rows="rows" animated></erd-skeleton>
                `
        };
    };
});
