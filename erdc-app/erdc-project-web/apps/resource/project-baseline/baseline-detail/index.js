define([], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        name: 'projectBaselineDetail',
        template: `
            <baseline-detail
                ref="projectBaselineDetail"
                :is-request-folder-data="false"
                :is-request-context-data="false"
                :get-form-configs="getFormConfigs"
                :get-tabs="getTabs"
                class="project-baseline-detail"
                style="margin: 0 !important;"
                :after-delete="afterDelete"
                :before-echo="beforeEcho"
                operation-btn-key="PPM_BASELINE_LIST_OPERATE_MENU"
                layout-name="PPM_DETAIL"
            ></baseline-detail>
        `,
        components: {
            BaselineDetail: ErdcKit.asyncComponent(ELMP.func('erdc-baseline/views/detail/index.js'))
        },
        data() {
            return {
                formData: {}
            };
        },
        methods: {
            beforeEcho(data) {
                const dayjs = require('dayjs');
                if (data.securityDate) data.securityDate = dayjs(data.securityDate).format('YYYY-MM-DD');
                return data;
            },
            getFormConfigs(config) {
                let requireKeys = ['identifierNo', 'name', 'lifecycleStatus.status', 'version'];
                return config.filter((item) => requireKeys.includes(item.field));
            },
            getTabs(tabs) {
                let requireKeys = ['detail', 'relationObj', 'history'];
                let result = tabs.filter((item) => requireKeys.includes(item.key));
                result.forEach((item) => {
                    if (item.key === 'relationObj') {
                        item.componentName = ErdcKit.asyncComponent(
                            ELMP.resource('project-baseline/components/ProjectRelationObject/index.js')
                        );
                        item.props.formData = this.formData || {};
                    }
                    if (item.key === 'detail') {
                        item.eventMethods['hook:mounted'] = this.afterRenderLayout;
                    }
                    if (item.key === 'history') {
                        item.componentName = ErdcKit.asyncComponent(
                            ELMP.resource('project-baseline/components/BaselineHistoryRecord/index.js')
                        );
                    }
                });
                return result;
            },
            afterRenderLayout() {
                this.$nextTick(() => {
                    setTimeout(() => {
                        this.formData = this.$refs?.projectBaselineDetail?.$refs?.baselineForm[0]?.formData || '';
                    }, 1000);
                });
            },
            afterDelete() {
                this.$router.push({
                    path: 'baseline/list',
                    query: {
                        pid: this.$route.query.pid
                    }
                });
            }
        }
    };
});
