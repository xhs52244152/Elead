define(['fam:http'], function () {
    const axios = require('fam:http');
    const TreeUtil = require('fam:kit').TreeUtil;
    const _ = require('underscore');

    return {
        /*html*/
        template: `
            <div ref="famDictItemSelect">
                <erd-tree-select
                    v-if="!readonly"
                    v-model="innerValue"
                    :data="data"
                    :node-key="nodeKey"
                    :multiple="multiple"
                    :props="props"
                >
                <template #prefix="scoped">
                    <slot
                        name="prefix"
                        v-bind="scoped"
                    ></slot>
                </template>
                </erd-tree-select>
                <span v-if="readonly">
                    {{ translated }}
                </span>
            </div>
        `,
        props: {
            value: [Object, String, Array],
            readonly: Boolean,
            multiple: Boolean,
            nodeKey: {
                type: String,
                default: 'identifierNo'
            }
        },
        data() {
            return {
                data: [],
                props: { label: 'displayName', children: 'childList' }
            };
        },
        computed: {
            innerValue: {
                get() {
                    const selectedArray = this.selectedArray;
                    return (this.multiple ? selectedArray : selectedArray[0]) || null;
                },
                set(selected) {
                    const valueObj = selected || {};
                    const value = valueObj[this.nodeKey] || null;

                    this.$emit('input', value);
                    this.$emit('update:value', value);
                }
            },
            selectedArray() {
                const valueArray = _.isArray(this.value) ? this.value : _.compact([this.value]);
                return _.reduce(
                    valueArray,
                    (prev, value) => {
                        const target = TreeUtil.getNode(this.data, {
                            target: { [this.nodeKey]: value },
                            childrenField: this.props.children
                        });
                        if (target) {
                            prev.push(target);
                        }
                        return prev;
                    },
                    []
                );
            },
            translated() {
                const selectedArray = _.isArray(this.selectedArray) ? this.selectedArray : _.compact([this.value]);
                if (selectedArray) {
                    return _.map(selectedArray, this.props.label).join(' / ');
                }
                return '';
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.fetchDictItem().then(({ data }) => {
                    this.data = data;
                });
            },
            fetchDictItem() {
                return axios({
                    // url: 'fam/listAllTree',
                    url: '/fam/dictionary/item/treeList',
                    method: 'get',
                    data: {}
                });
            }
        }
    };
});
