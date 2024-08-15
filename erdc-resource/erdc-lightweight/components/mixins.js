define([], function () {
    const _ = require('underscore');

    return {
        methods: {
            // 判断字符串是否JSON数据
            isJSON: function (str) {
                if (typeof str !== 'string') {
                    return false
                }
                try {
                    JSON.parse(str);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            // 格式化任务日志数据
            formatJsonData(obj) {
                // 遍历每一项数据，是json格式则收集，否则传入空对象
                let arr = _.values(obj);
                return _.chain(arr).map(item => {
                    return this.isJSON(item) ?
                        JSON.parse(item) :
                        _.isObject(item)
                            ? item
                            : {}
                }).filter(item => !_.isEmpty(item)).value();
            }
        }
    };
});
