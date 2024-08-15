define([
    'text!' + ELMP.resource('erdc-components/FamPageTitle/template.html'),
    'css!' + ELMP.resource('erdc-components/FamPageTitle/style.css')
], function (template) {
    return {
        template,
        props: {
            /**
             * @description 页面标题
             */
            title: {
                type: String,
                default: '--'
            },
            /**
             * @description 页面图标
             */
            icon: String,
            iconStyle: Object,
            /**
             * @description 是否显示返回按钮
             */
            showBackButton: Boolean,
            staticTitle: Boolean,
            titleClass: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamPageTitle/locale/index.js'),
                i18nMappingObj: {
                    back: this.getI18nByKey('back')
                },
                isTextOverflow: false
            };
        },
        computed: {
            resourceTitle() {
                return this.$store.getters['route/matchResource'](this.$route)?.displayName;
            },
            innerTitle() {
                return this.staticTitle ? this.title : this.resourceTitle || this.title;
            }
        },
        mounted() {
            this.$nextTick(() => {
                const container = this.$el.querySelector('.fam-page-title__title-text');
                this.isTextOverflow = container?.scrollWidth > container?.clientWidth;
            });
        },
        methods: {
            handleBack() {
                this.$emit('back');
            }
        }
    };
});
