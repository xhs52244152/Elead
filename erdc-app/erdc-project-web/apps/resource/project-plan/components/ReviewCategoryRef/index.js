define([], function () {
    return {
        props: {
            value: String,
            productOid: String,
            reviewCategoryRefValue: String,
            callback: {
                type: Function,
                default: null
            }
        },
        template: `
            <erd-ex-select
                class="w-100p"
                v-model="value" 
                :options="options"
            >
            </erd-ex-select>
        `,
        components: {},
        data() {
            return {
                dataValue: '',
                options: []
            };
        },
        watch: {
            dataValue: {
                handler(val) {
                    this.$emit('input', val);
                    if (_.isFunction(this.callback)) {
                        this.callback(val);
                    }
                }
            },
            value: {
                handler(val) {
                    this.dataValue = val || this.reviewCategoryRefValue || '';
                },
                immediate: true
            }
        },
        created() {
            this.getReviewCategoryOption();
        },
        methods: {
            // 获取评审类型
            getReviewCategoryOption() {
                this.$famHttp({
                    url: '/element/reviewCategory/getByProductOid',
                    method: 'GET',
                    className: 'erd.cloud.cbb.review.entity.ReviewCategory',
                    params: {
                        productOid: this.productOid
                    }
                }).then((res) => {
                    this.options = res.data.map((item) => {
                        return {
                            value: item.oid,
                            label: item.displayName
                        };
                    });
                });
            }
        }
    };
});
