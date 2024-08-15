define([
    'text!' + ELMP.resource('erdc-components/FamParticipantSelect/components/SelectContainer/index.html'),
    ELMP.resource('erdc-components/FamParticipantSelect/componentConfig.js'),
    ELMP.resource('erdc-components/FamParticipantSelect/mixins/customRequest.js'),
    'css!' + ELMP.resource('erdc-components/FamParticipantSelect/components/SelectContainer/style.css')
], function (template, componentConfig, customRequest) {
    const FamKit = require('fam:kit');
    return {
        template,
        props: {
            value: {
                type: [String, Array, Object],
                default() {
                    return null;
                }
            },
            // 组件类型
            type: {
                type: String,
                default: ''
            },
            queryMode: {
                type: Array,
                default() {
                    return ['ORG', 'GROUP', 'USER', 'ROLE', 'RECENTUSE', 'COMMONUSE', 'FUZZYSEARCH'];
                }
            },
            defaultMode: {
                type: String,
                default: 'ROLE'
            },
            queryParams: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            appName: String,
            // 查询范围
            queryScope: {
                type: String,
                default: ''
            },
            className: String,
            selectData: {
                type: [Object, Array],
                default() {
                    return [];
                }
            },
            // 自定义配置当前组件
            customSchema: Function,
            moduleConfig: {
                type: Array,
                default() {
                    return null;
                }
            },
            defaultValue: [String, Object, Array],
            threeMemberEnv: Boolean,
            filterSecurityLabel: Boolean,
            securityLabel: String
        },
        mixins: [customRequest],
        components: {
            SimpleSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/components/SimpleSelect/index.js')
            ),
            ComplexSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/components/ComplexSelect/index.js')
            ),
            RecentUseSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/components/RecentUseSelect/index.js')
            ),
            CompleteSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/components/CompleteSelect/index.js')
            ),
            FuzzySearchSelect: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamParticipantSelect/components/FuzzySearchSelect/index.js')
            )
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-components/FamParticipantSelect/locale/index.js'),
                innerDefaultMode: '',
                initQueryModes: componentConfig.QUERYMODES,
                treeData: [],
                leftTreeSelectData: {}
            };
        },
        computed: {
            innerQueryModel() {
                let modes = this.initQueryModes
                    .map((schema) => this.createQueryMode(schema))
                    .filter((item) => {
                        return (
                            this.queryMode.includes(item.name) &&
                            item.type === this.type &&
                            (item?.queryScope ? item.queryScope === this.queryScope : true)
                        );
                    });
                return modes;
            },
            innerValue: {
                get() {
                    return this.value || undefined;
                },
                set(val) {
                    this.$emit('input', val);
                }
            },
            innerSelectData: {
                get() {
                    return this.selectData || [];
                },
                set(selectData) {
                    this.$emit('update:select-data', selectData);
                }
            },
            innerMode() {
                return this.innerQueryModel.find((model) => model.name === this.innerDefaultMode) || {};
            }
        },
        watch: {
            defaultMode: {
                immediate: true,
                handler(defaultMode) {
                    const innerQueryModelMap = this.innerQueryModel.map((item) => item.name);
                    this.innerDefaultMode = this.defaultMode;
                    if (!innerQueryModelMap.includes(this.defaultMode)) {
                        this.innerDefaultMode = innerQueryModelMap[0];
                    }
                    let firstMode = null;
                    for (let i = 0; i < this.initQueryModes.length; i++) {
                        const item = this.initQueryModes[i];
                        if (
                            item.name === defaultMode &&
                            item.type === this.type &&
                            (item?.queryScope ? item.queryScope === this.queryScope : true)
                        ) {
                            firstMode = this.initQueryModes.splice(i, 1);
                            break;
                        }
                    }
                    firstMode && this.initQueryModes.unshift(firstMode[0]);
                }
            }
        },
        methods: {
            // 选中的数据的整个信息
            onChange(values, data) {
                this.$emit('change', values, data);
            },
            getTreeData(treeData) {
                this.treeData = treeData;
            },
            // 左边树选中的树对象
            treeSelectData(row) {
                this.leftTreeSelectData = row;
            },
            handleTabComponentMounted() {
                this.$nextTick(() => {
                    const component = this.$refs[this.innerDefaultMode]?.[0] || this.$refs[this.innerDefaultMode];
                    if (typeof component?.focus === 'function') {
                        component.focus();
                    }
                });
            }
        }
    };
});
