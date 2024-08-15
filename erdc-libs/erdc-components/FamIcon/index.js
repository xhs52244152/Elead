define(['text!' + ELMP.resource('erdc-components/FamIcon/index.html')], function (template) {
    return {
        template,
        props: {
            // 支持传入: 字符串, 序列化对象, 数组, 对象
            value: {
                type: [String, Array, Object],
                default: ''
            },

            // 悬浮提示文案
            tooltipContent: {
                type: String,
                default: ''
            },
            custom: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                customStyle: null
            };
        },
        computed: {
            iconInfo() {
                const val = this.value;
                const type = this.getType(val);
                this.customStyle = null;
                let result;
                switch (type) {
                    case 'String':
                        try {
                            const parseVal = JSON.parse(val);
                            if (Array.isArray(parseVal)) {
                                result = parseVal.join(' ');
                            }
                            result = this.isObject(parseVal) ? parseVal : val;
                        } catch (e) {
                            result = val;
                        }
                        break;
                    case 'Array':
                        result = val.join(' ');
                        break;
                    case 'Object':
                        result = val;
                        break;
                    default:
                        result = {};
                        break;
                }
                return result;
            },
            iconClass() {
                if (this.isObject(this.iconInfo)) {
                    return this.iconInfo.iconClass || '';
                }
                return this.iconInfo;
            },
            iconStyle() {
                // 存在行内样式时合并
                if (this.customStyle) {
                    return this.customStyle;
                }
                if (this.isObject(this.iconInfo)) {
                    return this.iconInfo.iconStyle || {};
                }
                return {};
            }
        },
        mounted() {
            this.setStyle();
        },
        methods: {
            getType(val) {
                return Object.prototype.toString.call(val).slice(8, -1);
            },
            isObject(val) {
                return this.getType(val) === 'Object';
            },
            setStyle() {
                const cssText = this.$el?.style?.cssText;
                if (cssText) {
                    this.customStyle = { ...this.iconStyle, ...this.getStyles(cssText) };
                }
            },
            getStyles(cssText) {
                let output = {};
                let camelize = (str) => {
                    return str.replace(/(?:^|[-])(\w)/g, (a, c) => {
                        c = a.substr(0, 1) === '-' ? c.toUpperCase() : c;
                        return c ? c : '';
                    });
                };
                let style = cssText.split(';');
                for (let i = 0; i < style.length; ++i) {
                    let rule = style[i].trim();

                    if (rule) {
                        let ruleParts = rule.split(':');
                        let key = camelize(ruleParts[0].trim());
                        output[key] = ruleParts[1].trim();
                    }
                }
                return output;
            }
        }
    };
});
