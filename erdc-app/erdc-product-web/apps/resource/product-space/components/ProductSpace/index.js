// 统一使用平台空间布局，该组件弃用
define([ELMP.resource('erdc-components/FamSpace/index.js')], function (FamSpace) {
    return {
        name: 'ProductSpace',
        mixins: [FamSpace],
        data() {
            return {
                i18nPath: ELMP.resource('product-space/locale/index.js'),
                productTemplateSpaceResources: [
                    'pdm:product:detail',
                    'pdm:product:baseline',
                    'ProductPart',
                    'ProductDocument',
                    'pdm:product:folder',
                    'pdm:product:team',
                    'pdm:product:access'
                ]
            };
        },
        computed: {
            rootResource() {
                const productResources =
                    this.$store.state.route.resources?.find(
                        (resource) => resource.identifierNo === 'erdc-product-web'
                    ) || {};
                const bizResources =
                    this.$store.state.route.resources?.find(
                        (resource) => resource.identifierNo === 'erdc-bizadmin-web'
                    ) || {};
                const resources = productResources.children || [];
                const isTemplate = this.isTemplate;
                return {
                    ...productResources,
                    oid: isTemplate ? bizResources.oid : productResources.oid,
                    identifierNo: isTemplate ? 'productTemplate' : productResources.identifierNo,
                    displayName: isTemplate ? this.i18n['业务管理-产品库模板'] : productResources.displayName,
                    nameI18nJson: isTemplate
                        ? { value: this.i18n['业务管理-产品库模板'] }
                        : productResources.nameI18nJson,
                    name: isTemplate ? this.i18n['业务管理-产品库模板'] : productResources.name,
                    children: isTemplate
                        ? resources.filter((resource) =>
                            this.productTemplateSpaceResources.includes(resource.identifierNo)
                        )
                        : resources
                };
            },
            isTemplate() {
                return !!this.objectInfo?.['templateInfo.tmplTemplated'];
            },
            readonly() {
                return this.isTemplate;
            }
        },
        watch: {
            isTemplate() {
                this.$store.commit('route/SET_CUSTOM_ROOT_RESOURCE', this.rootResource);
            }
        },
        updated() {
            this.viewAllText = this.i18n?.['查看全部产品库'] ?? this.viewAllText;
        },
        beforeRouteLeave(to, from, next) {
            this.$store.commit('route/SET_CUSTOM_ROOT_RESOURCE', null);
            next();
        },
        // eslint-disable-next-line no-unused-vars
        beforeDestroy(to, from, next) {
            this.$store.commit('route/SET_CUSTOM_ROOT_RESOURCE', null);
        }
    };
});
