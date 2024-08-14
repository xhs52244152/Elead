define([
    'text!' + ELMP.resource('project-dashboard/components/DashboardConfig/index.html'),
    'erdcloud.kit',
    'vue-grid-layout',
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template, ErdcKit, VueGridLayout) {
    return {
        template,
        props: {
            showDataTime: {
                type: Boolean,
                default: false
            },
            isEditMode: {
                type: Boolean,
                default: false
            },
            titleName: {
                type: String,
                default: ''
            },
            layout: {
                type: Array,
                default: () => {
                    return [{ x: 0, y: 0, w: 24, h: 11, i: 0 }];
                }
            }
        },
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js')
            };
        },
        created() {},
        mounted() {},
        computed: {
            oid() {
                return this.$route.query.pid;
            }
        },
        components: {
            GridLayout: VueGridLayout.GridLayout,
            GridItem: VueGridLayout.GridItem,
            DashboardTitle: ErdcKit.asyncComponent(
                ELMP.resource('project-dashboard/components/DashboardTitle/index.js')
            )
        },
        methods: {
            changeData(val) {
                this.$emit('changeData', val);
            }
        }
    };
});
