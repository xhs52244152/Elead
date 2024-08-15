define([
    'text!' + ELMP.resource('erdc-cbb-components/LifecyleStep/index.html'),
    'css!' + ELMP.resource('erdc-cbb-components/LifecyleStep/index.css')
], function (template) {

    return {
        name: 'LifecyleStep',
        template,
        props: {
            vm: Object,
            data: Object
        },
        data() {
            return {
                statusList: [],
                visible: false
            };
        },
        computed: {
            lifecyleStatus() {
                return this.vm?.sourceData?.['lifecycleStatus.status'] ||
                    this.data?.['lifecycleStatus.status'] ||
                    {};
            },
            lifecycleTemplate() {
                return this.vm?.sourceData?.['lifecycleStatus.lifecycleTemplateRef'] ||
                    this.data?.['lifecycleStatus.lifecycleTemplateRef'] ||
                    {};
            },
            active() {
                if (this.statusList.length && this.lifecyleStatus?.value) {
                    return this.statusList.findIndex((item) => this.lifecyleStatus?.value === item?.name);
                }
                return 0;
            }
        },
        watch: {
            lifecycleTemplate: {
                immediate: true,
                deep: true,
                handler(newVal) {
                    if ((newVal && newVal.oid)) {
                        this.getLifecyleEnum(newVal.oid);
                    }
                }
            }
        },
        methods: {
            getLifecyleEnum(templateOId) {
                this.$famHttp({
                    url: '/fam/lifecycle/iteration',
                    method: 'GET',
                    params: {
                        templateOId
                    }
                }).then((res) => {
                    this.statusList = res.data?.lifecycleStates;
                });
            },
            show() {
                this.visible = true;
            },
            hide() {
                this.visible = false;
            }
        }
    };
});
