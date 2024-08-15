/**
 * # XX组件
 vue组件components引入
    # 组件声明
    components: {
            Dict: (apply)=> require([ELMP.resource('erdc-components/FamDict/index.js')],(module)=>apply(module.vmOptions))
        },
    # 页面调用
    <dict
    :visible.sync="visible" 
    ref="dict"
    @onsubmit="onSubmit"
    ></dict>
    # 获取组件实例
    this.$refs.dict
 * 
 * **/

define([
    'text!' + ELMP.resource('erdc-components/FamDict/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'erdc-kit',
    'fam:kit',
    'underscore',
    'css!' + ELMP.resource('erdc-components/FamDict/style.css')
], function (template, fieldTypeMapping) {
    const TreeUtil = require('fam:kit').TreeUtil;
    const FamKit = require('fam:kit');

    return {
        template: template,
        mixins: [fieldTypeMapping],
        components: {
            FamShowTooltip: FamKit.asyncComponent(ELMP.resource('erdc-components/FamShowTooltip/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            clearable: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            disabled: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            value: {
                type: [String, Object, Array],
                default: () => {
                    return null;
                }
            },
            itemName: {
                type: [Object, String],
                default: () => {
                    return '';
                }
            },
            nodeKey: {
                type: String,
                default: () => {
                    return 'value';
                }
            },
            dataType: {
                type: String,
                default: null
            },
            multiple: Boolean,
            readonly: Boolean,
            filterable: {
                type: Boolean,
                default: true
            },
            row: {
                type: Object,
                default() {
                    return {};
                }
            },
            popperClass: {
                type: String,
                default: null
            },
            formData: {
                type: Object,
                default() {
                    return {}
                }
            },
            path: {
                type: String,
                default: null
            }
        },
        data() {
            return {
                listTreeData: []
            };
        },
        computed: {
            dataKey() {
                return this.itemName || this.row?.dataKey || '';
            },
            isStringMode() {
                let isFlag;
                if (this.dataType) {
                    isFlag = this.dataType.toLowerCase() === 'string';
                } else {
                    isFlag =
                        typeof this.value === 'string' ||
                        (Array.isArray(this.value) && typeof this.value[0] === 'string');
                }
                return isFlag;
            },
            selectVal: {
                get() {
                    let value = null;
                    // 默认值为字符串时，转为对象，设置接收的nodeKey为key
                    if (this.isStringMode) {
                        const valueArr = Array.isArray(this.value) ? this.value : [this.value];
                        value = this.innerMultiple ? valueArr.map(this.getObject) : this.getObject(this.value);
                    } else {
                        value = this.value;
                    }
                    return value;
                },
                set(value) {
                    const valueArr = Array.isArray(value) ? value : [value];
                    if (this.isStringMode || valueArr.every((i) => typeof i === 'string')) {
                        const nodeValue = this.innerMultiple
                            ? value.map((node) => node[this.nodeKey])
                            : value?.[this.nodeKey] || '';
                        this.$emit('update:value', nodeValue);
                        this.$emit('input', nodeValue);
                        this.$emit('change', nodeValue);
                    } else {
                        this.$emit('update:value', value);
                        this.$emit('input', value);
                        this.$emit('change', value);
                    }
                }
            },
            staticText() {
                const currentValue = this.selectVal;
                if (this.innerMultiple) {
                    return currentValue.map((item) => item.displayName).join(',');
                }
                return this.selectVal?.displayName || this.value;
            },
            innerMultiple() {
                return this.multiple || ['IN', 'NOT_IN'].includes(this.row?.operator);
            }
        },
        watch: {
            dataKey: {
                immediate: true,
                handler(dataKey) {
                    if (dataKey) {
                        this.getDictList(dataKey);
                    } else {
                        this.listTreeData = [];
                    }
                }
            },
            isStringMode() {
                if (this.dataKey) {
                    this.getDictList(this.dataKey);
                }
            }
        },
        methods: {
            getDictList(dataKey) {
                // 默认获取启用的数据
                this.$famHttp({
                    url: '/fam/dictionary/tree/' + dataKey,
                    headers: {
                        'App-Name': 'ALL'
                    },
                    params: {
                        status: 1,
                        ...this.row.params
                    },
                    method: 'get'
                })
                    .then((resp) => {
                        this.listTreeData = resp?.data || [];
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            getObject(nodeValue) {
                return TreeUtil.getNode(this.listTreeData, {
                    target: (node) => {
                        return node[this.nodeKey] === nodeValue;
                    }
                });
            }
        }
    };
});
