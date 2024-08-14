define(['text!' + ELMP.resource('project-budget/components/TdInputNumber/index.html')], function (template) {
    return {
        template,
        model: {
            //需要定义哪一个props可以用v-model绑定属性
            prop: 'dataValue',
            //声明一个事件，调用之后，就会改变父级容器的值
            event: 'valueChange'
        },
        props: {
            dataValue: String | Array,
            // 单位
            unitLabel: String,
            // 精度
            precision: {
                type: Number,
                default: 2
            },
            // 清空时，是否默认为0
            clearZero: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                value: undefined
            };
        },
        watch: {
            dataValue: {
                handler(val) {
                    this.value = val; // 内部值
                },
                immediate: true
            }
        },
        methods: {
            change(newValue) {
                this.clearZero && (newValue = newValue || 0);
                // 是否设置了精确度
                if (typeof this.precision === 'number' && this.precision > 0 && newValue && newValue !== 0) {
                    // 截取小数点后this.precision位
                    newValue = Math.floor(newValue * Math.pow(10, this.precision)) / Math.pow(10, this.precision);
                }
                this.$emit('change', newValue);
                this.updateValue(newValue);
            },
            // 修改值（不涉及向外部组件提供change事件）
            updateValue(value) {
                this.$emit('valueChange', value);
            }
        }
    };
});
