define([
    'text!' + ELMP.func('erdc-baseline/views/merge/index.html'),
    ELMP.func('erdc-baseline/mixins.js'),
    ELMP.func('erdc-baseline/const.js')
], function (template, mixin, CONST) {
    const ErdcKit = require('erdc-kit');
    const Vuex = require('vuex');
    const { mapGetters } = Vuex.createNamespacedHelpers('CbbBaseline');

    return {
        name: 'BaselineMerge',
        template,
        components: {
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            Previous: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/merge/components/previous/index.js')),
            Next: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/merge/components/next/index.js'))
        },
        mixins: [mixin],
        data() {
            return {
                i18nPath: ELMP.func('erdc-baseline/locale/index.js'),
                activeStep: 0,
                // previous 页面已有数据
                previousData: {}
            };
        },
        computed: {
            ...mapGetters(['getMergeInfo']),
            // 表单头组件配置
            formPageAttr() {
                return {
                    title: this.i18n.mergeBaseline,
                    showBackButton: false,
                    staticTitle: true,
                    style: {
                        height: '28px'
                    }
                };
            }
        },
        methods: {
            previous() {
                this.activeStep = 0;
            },
            next() {
                this.$refs.previousComp.submit().then((result) => {
                    if (result.validate) {
                        this.activeStep = 1;
                    }
                });
            },
            async saveMerge() {
                const baselineData = await this.$refs.nextComp.submit();
                if (baselineData) {
                    const formData = {
                        ...baselineData,
                        masterBaselineOid: this.getMergeInfo.masterBaselineOid,
                        deleteBaseline: this.getMergeInfo.deleteBaseline,
                        baselineMergeList: this.getMergeInfo.baselineMergeList,
                        memberList: this.getMergeInfo.mergedList.map((item) => ({
                            objectRef: item.masterRef.value,
                            memberOid: item.oid.value,
                            version: item.version.value,
                            name: item.name.value,
                            number: item.identifierNo.value
                        }))
                    };
                    this.$famHttp({
                        url: '/baseline/baselineMergeSave',
                        className: CONST.className,
                        data: formData,
                        method: 'POST'
                    }).then((resp) => {
                        if (resp.success) {
                            this.$message.success(this.i18n.mergeSuccess);
                            this.cancel();
                        } else {
                            this.$message.error(resp.message);
                        }
                    });
                }
            },
            cancel() {
                this.$store.dispatch('route/delVisitedRoute', this.$route).then(() => {
                    this.$router.replace({
                        // path: this.cbbRoute('baselineList'),
                        path: `${this.$route.meta.prefixRoute}/baseline/list`,
                        query: this.$route.query || {}
                    });
                });
            }
        }
    };
});
