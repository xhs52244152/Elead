/**
 * 表单客制化配置混入逻辑
 * 1. 快速解析表单客制化配置
 * 2. 提供表单客制化配置的增删改
 */
define([], function() {
    return {
        props: {
            customizeConfiguration: {
                type: Object,
                default: () => {
                    return {
                        variables: [],
                        functions: []
                    };
                }
            },
            vm: {
                type: Object,
                default() {
                    return this.$parent;
                }
            }
        },
        provide() {
            return {
                getFunctions: () => this.functions,
                getVariables: () => this.variables
            };
        },
        data() {
            return {
                variables: {},
                functions: {}
            };
        },
        computed: {
            layoutJson() {
                return this.customizeConfiguration || {};
            }
        },
        watch: {
            layoutJson: {
                immediate: true,
                handler(layoutJson) {
                    this.functions = layoutJson.functions
                        ?.filter((item) => !item.disabled)
                        ?.reduce((result, item) => {
                            let functor;
                            try {
                                functor = new Function([
                                    'return function (useVariable, useMethod) {',
                                    `    ${item.content}`,
                                    '}'
                                ].join('\n'))()(this.useVariable, this.useMethod);
                                if (typeof functor === 'function') {
                                    functor = functor.bind(this.vm || this.$parent || this);
                                }
                            } catch  (error) {
                                console.error(error)
                            }

                            return {
                                ...result,
                                [item.name]: functor
                            };
                        }, {}) || {};
                }
            }
        },
        methods: {
            useVariable(variableName, defaultVariableValue) {
                const that = this;
                const variables = this.layoutJson.variables?.filter((item) => !item.disabled) || [];
                const variableDef = variables.find((item) => item.name === variableName);
                if (!variableDef) {
                    throw new Error(`访问了一个不存在的变量 ${variableName}`);
                }
                Object.defineProperty(this.variables, variableName, {
                    enumerable: true,
                    configurable: true,
                    get() {
                        let value = that.functions?.[variableDef.getter]?.call(that.vm || that.$parent || that);
                        if (value === undefined) {
                            value = defaultVariableValue;
                        }
                        return value;
                    },
                    set(value) {
                        that.functions?.[variableDef.setter]?.call(that.vm || that.$parent || that, value);
                    }
                });
                return [
                    this.variables[variableName],
                    (value) => {
                        this.variables[variableName] = value;
                    }
                ];
            },
            useMethod(methodName, ...args) {
                const that = this;
                return function(...args2) {
                    return that.functions?.[methodName]?.call(that.vm || that.$parent || that, ...args, ...args2);
                };
            }
        }
    };
});
