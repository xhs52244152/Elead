/*

 */
define([
    'text!' + ELMP.resource('biz-template/team-template/components/ProductOverview/index.html'),
    'css!' + ELMP.resource('biz-template/team-template/components/ProductOverview/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {
            // 表单数据
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            appName: String
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-template/team-template/components/ProductOverview/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消')
                }
            };
        },
        watch: {},
        computed: {
            productOid() {
                return this.formData.oid;
            }
        },
        mounted() {
            this.getFormData();
        },
        methods: {
            formChange() {},
            getFormData() {},
            onSubmit() {
                this.submit();
            },
            submit() {},
            toggleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            }
        },
        components: {
            Team: ErdcKit.asyncComponent(ELMP.resource('erdc-product-components/Team/index.js'))
        }
    };
});
