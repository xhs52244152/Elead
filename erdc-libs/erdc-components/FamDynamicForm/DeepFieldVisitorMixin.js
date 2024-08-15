define(['vue'], function (Vue) {
    return {
        methods: {
            setFieldValue(sourceObject, field, value) {
                let formData = arguments.length === 2 ? this.formData : sourceObject;
                let fieldStr = arguments.length === 2 ? sourceObject : field;
                let targetValue = arguments.length === 2 ? field : value;
                if (/\./g.test(fieldStr)) {
                    const fieldArray = fieldStr.split('.');
                    _.reduce(
                        fieldArray,
                        (prev, key, index) => {
                            if (typeof prev === 'object' && prev) {
                                if (index === fieldArray.length - 1) {
                                    Vue.set(prev, key, targetValue);
                                } else if (!Object.keys(prev).includes(key)) {
                                    Vue.set(prev, key, {});
                                }
                                return prev[key];
                            } else {
                                return prev;
                            }
                        },
                        formData
                    );
                    // 暂时保留非嵌套层级的值，避免相应匹配代码失效
                    Vue.set(formData, fieldStr, targetValue);
                } else {
                    Vue.set(formData, fieldStr, targetValue);
                }
            },
            getFieldValue(sourceObject, field) {
                let formData = arguments.length === 1 ? this.formData : sourceObject;
                let fieldStr = arguments.length === 1 ? sourceObject : field;
                if (/\./g.test(fieldStr)) {
                    const fieldArray = fieldStr.split('.');
                    const value = _.reduce(
                        fieldArray,
                        (prev, key, index) => {
                            if (index === fieldArray.length - 1) {
                                // do nothing
                            } else if (!Object.keys(prev).includes(key)) {
                                Vue.set(prev, key, {});
                            }
                            return prev[key];
                        },
                        formData
                    );
                    // 暂时保留非嵌套层级的值，避免相应匹配代码失效
                    return value === undefined ? formData[field] : value;
                } else {
                    return formData[fieldStr];
                }
            }
        }
    };
});
