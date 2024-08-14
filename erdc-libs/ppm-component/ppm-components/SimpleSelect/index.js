define(['css!' + ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.css')], function () {
    return {
        props: {
            value: String,
            label: {
                type: String,
                default: '分组'
            },
            options: {
                type: Array,
                default() {
                    return [];
                }
            },
            icon: {
                type: String,
                default: 'erd-iconfont erd-icon-grouping'
            },
            defaultProps: {
                type: Object,
                default() {
                    return {};
                }
            },
            height: {
                type: Number,
                default: 300
            }
        },
        template: `
            <erd-dropdown trigger="click" class="dropdown-list" placement="bottom-start" @command="handleCommand">
                <div>
                    <i :class="['ppm-simple-select-icon', icon]"></i>
                    <span class="current-name">{{ displayName }}</span>
                    <i class="el-icon-arrow-down el-icon--right"></i>
                </div>
                <erd-dropdown-menu class="list-content" slot="dropdown">
                    <el-scrollbar
                        :style="heightStyle"
                        wrap-style="height: calc(100% + 0px);"
                    >
                        <erd-dropdown-item
                            v-for="(item, index) in dataOptions"
                            :key="index"
                            :command="item[dataProps.value]"
                            :disabled="item.disabled">
                            {{ item[dataProps.label] }}
                        </erd-dropdown-item>
                    </el-scrollbar>
                </erd-dropdown-menu>
            </erd-dropdown>
        `,
        components: {},
        data() {
            return {
                displayName: '',
                currentValue: ''
            };
        },
        computed: {
            dataOptions() {
                let { label, options } = this;
                return [
                    {
                        label: label,
                        value: label,
                        disabled: true
                    },
                    ...(options || [])
                ];
            },
            dataProps() {
                return {
                    label: 'label',
                    value: 'value',
                    ...this.defaultProps
                };
            },
            heightStyle() {
                let { height } = this;
                let len = this.dataOptions.length;
                return len * 30 > height - 30 ? `height: ${height}px` : '';
            }
        },
        watch: {
            options: {
                immediate: true,
                handler(val) {
                    const { dataProps } = this;
                    this.displayName = val.find((item) => item[dataProps.value] === this.value)?.[dataProps.label];
                }
            },
            value: {
                immediate: true,
                handler(nVal) {
                    if (nVal !== this.currentValue) this.handleCommand(nVal);
                }
            }
        },
        methods: {
            handleCommand(value) {
                const { dataProps } = this;
                if (value) {
                    this.displayName = this.dataOptions.find((item) => item[dataProps.value] === value)?.[
                        dataProps.label
                    ];
                    this.$emit('input', value);
                    this.$emit('change', value);
                    this.currentValue = value;
                } else {
                    this.displayName = '';
                }
            }
        }
    };
});
