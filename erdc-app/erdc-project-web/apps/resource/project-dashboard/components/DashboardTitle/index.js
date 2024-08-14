define([
    'text!' + ELMP.resource('project-dashboard/components/DashboardTitle/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('project-dashboard/style.css')
], function (template) {
    return {
        template,
        props: {
            titleName: {
                type: String,
                default: ''
            },
            showDataTime: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                projectClassName: 'erd.cloud.ppm.project.entity.Project',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-dashboard/locale/index.js'),
                value2: ''
            };
        },
        created() {},
        mounted() {},
        computed: {},
        methods: {
            handleChange(val) {
                this.$emit('changeData', val);
            }
        }
    };
});
