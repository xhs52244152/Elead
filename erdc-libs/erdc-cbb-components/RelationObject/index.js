define([
    'text!' + ELMP.resource('erdc-cbb-components/RelationObject/index.html'),
    'css!' + ELMP.resource('erdc-cbb-components/RelationObject/index.css')
], function (template) {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        components: {
            CommonTable: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/RelationObject/components/CommonTable/index.js')
            )
        },
        props: {
            tabs: {
                type: Array,
                default: function () {
                    return [];
                }
            },
            vm: Object
        },
        data() {
            return {
                activeName: ''
            };
        },
        watch: {
            'tabs.length': {
                handler(val) {
                    if (val > 0 && !this.activeName) {
                        const relationObjActive = this.$route.query?.relationObjActive;
                        if (relationObjActive) {
                            this.activeName = relationObjActive;
                        } else {
                            this.activeName = this.tabs[0].name;
                        }
                    }
                },
                immediate: true
            }
        },
        methods: {
            // 刷新当前tabs页签
            refreshCurrent() {
                this.$refs[this.activeName]?.[0]?.refresh();
            },
            // 刷新所有tabs页签
            refreshAll() {
                // 刷新各个tab页面的列表
                this.tabs.forEach((tab) => {
                    const name = tab?.component?.ref || tab?.name || '';
                    this.$refs[name]?.[0]?.refresh();
                });
            }
        }
    };
});
