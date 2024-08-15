define([
    'text!' + ELMP.resource('system-dashboard/views/LayoutConfig/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('system-dashboard/views/LayoutConfig/index.css')
], function (template, erdcloudKit) {
    return {
        template,
        components: {
            LayoutConfigComponent: erdcloudKit.asyncComponent(
                ELMP.resource('system-dashboard/components/LayoutConfigComponent/index.js')
            )
        },
        computed: {
            layoutId: function () {
                return this.$route.params.id;
            },
            isEditMode: function () {
                return this.mode === 'edit';
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('locale/index.js', 'system-dashboard'),
                i18nMappingObj: {
                    create: this.getI18nByKey('创建')
                },
                layoutClass: 'erd.cloud.dashboard.entity.DashboardLayout',
                title: '',
                mode: 'edit',
                resourceId: '',
                containerHeight: document.body.clientHeight - 40 - 24
            };
        },
        created() {
            this.loadLayout();
        },
        methods: {
            goBack: function () {
                this.$router.go(-1);
            },
            loadLayout: function () {
                const self = this;
                this.$famHttp({
                    url: '/fam/attr',
                    params: {
                        className: this.layoutClass,
                        oid: this.$route.params.id
                    }
                }).then(function (resp) {
                    if (resp.success) {
                        self.title = resp.data.rawData.nameI18nJson.value.value;
                        self.resourceId =
                            'OR:erd.cloud.core.menu.entity.Resource:' + resp.data.rawData.resourceId.value;
                    }
                });
            }
        },
        mounted() {
            this.$nextTick(() => {
                let self = this;
                setTimeout(() => {
                    if (self.$el.getBoundingClientRect) {
                        self.containerHeight = document.body.clientHeight - self.$el.getBoundingClientRect().top - 8;
                    }
                }, 100);
            });
        }
    };
});
