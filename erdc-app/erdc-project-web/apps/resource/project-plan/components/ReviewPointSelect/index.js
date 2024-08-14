define([], function () {
    return {
        props: {
            value: String,
            reviewPointRefValue: String,
            callback: {
                type: Function,
                default: null
            },
            disabled: {
                type: Boolean,
                default: false
            },
            showLabel: {
                type: Boolean,
                default: false
            },
            readonly: {
                type: Boolean,
                default: false
            }
        },
        template: `
            <erd-tree-select
                style="width: 100%"
                :props="treeProps"
                v-model="dataValue"
                node-key="oid"
                :data="options"
            >
            </erd-tree-select>
        `,
        components: {},
        data() {
            return {
                dataValue: '',
                options: [],
                treeProps: {
                    children: 'childList',
                    label: 'displayName'
                }
            };
        },
        watch: {
            dataValue: {
                handler(val) {
                    let oid = _.isObject(val) ? val.oid : val;
                    this.$emit('input', oid);
                    if (_.isFunction(this.callback)) {
                        this.callback(oid);
                    }
                }
            },
            value: {
                handler(val) {
                    this.dataValue = val ?? this.reviewPointRefValue;
                },
                immediate: true
            },
            reviewCategory: {
                handler(val, oldV) {
                    const value = typeof val === 'string' ? val : val ? 'OR:' + val.key + ':' + val.id : '';
                    const oldValue = typeof oldV === 'string' ? oldV : oldV ? 'OR:' + oldV.key + ':' + oldV.id : '';
                    // oldValue 没有值 或者 value 等于oldValue时不需要重置评审点
                    const resetValue = !oldValue || value === oldValue;
                    if (value) {
                        this.getReviewPointOptions(value, resetValue);
                    }
                },
                immediate: true
            }
        },
        computed: {
            reviewCategory() {
                return this.$attrs.formData?.reviewCategoryRef;
            }
        },
        created() {},
        methods: {
            // 根据评审类型获取评审点
            getReviewPointOptions(reviewCategory, resetValue) {
                this.$famHttp({
                    url: '/element/reviewCategory/listTreeByOid',
                    method: 'GET',
                    className: 'erd.cloud.cbb.review.entity.ReviewCategory',
                    params: {
                        oid: reviewCategory
                    }
                }).then((res) => {
                    this.options = res.data || [];
                    if (!resetValue || !this.value) {
                        this.dataValue = this.options[0] ? this.options[0].oid : '';
                    }
                });
            }
        }
    };
});
