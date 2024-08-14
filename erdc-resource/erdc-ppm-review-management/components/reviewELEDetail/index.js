define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/reviewELEDetail/index.html'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/reviewELEDetail/index.css')
], function (ErdcKit, template) {
    const subReviewComponent = {
        template,
        props: {
            formInfo: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                className: '',
                typeData: [],
                areaData: []
            };
        },
        components: {
            // 基础表格
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        created() {},
        mounted() {
            this.$nextTick(() => {
                this.getStatisticsReview();
            });
        },
        methods: {
            getStatisticsReview() {
                const self = this;
                const params = {
                    reviewObjectOid: self.formInfo,
                    statisticsDimensions: ['category', 'area']
                };
                this.$famHttp({
                    url: '/ppm/review/statisticsReviewElement',
                    method: 'post',
                    className: this.className || 'erd.cloud.ppm.project.entity.Project',
                    data: params
                }).then((res) => {
                    let result = res.data || [];
                    if (result.length) {
                        result.forEach((item) => {
                            if (item.dimensionAttrName === 'category') {
                                this.typeData = item.statisticsQuotas;
                            } else if (item.dimensionAttrName === 'area') {
                                this.areaData = item.statisticsQuotas;
                            }
                        });
                    }
                });
            }
        }
    };
    return subReviewComponent;
});
