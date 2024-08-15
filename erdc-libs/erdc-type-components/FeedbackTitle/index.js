define([
    'text!' + ELMP.resource('erdc-type-components/FeedbackTitle/index.html'),
    'css!' + ELMP.resource('erdc-type-components/FeedbackTitle/style.css')
], function (template) {
    return {
        template,
        props: {
            typeName: {
                type: String,
                defualt: ''
            },
            showReturnBack: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/AttrPermissionSetting/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    returnback: this.getI18nByKey('返回'),
                    attrPermissionSetting: this.getI18nByKey('属性权限配置')
                }
            };
        },
        mounted() {},
        methods: {
            cancelReadPermission() {
                this.$emit('returnBack');
            }
        }
    };
});
