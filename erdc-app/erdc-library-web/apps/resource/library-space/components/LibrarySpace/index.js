// 统一使用平台空间布局，该组件弃用
define([ELMP.resource('erdc-components/FamSpace/index.js')], function (FamSpace) {
    return {
        name: 'LibrarySpace',
        mixins: [FamSpace],
        data() {
            return {
                i18nPath: ELMP.resource('library-space/locale/index.js'),
                libraryTemplateSpaceResources: [
                    'library:detail',
                    'libraryBaseline',
                    'libraryPart',
                    'libraryDocument',
                    'library:folder',
                    'library:team',
                    'library:access'
                ]
            };
        },
        computed: {
            rootResource() {
                const libraryResources =
                    this.$store.state.route.resources?.find(
                        (resource) => resource.identifierNo === 'erdc-library-web'
                    ) || {};
                const bizResources =
                    this.$store.state.route.resources?.find(
                        (resource) => resource.identifierNo === 'erdc-bizadmin-web'
                    ) || {};
                const resources = libraryResources.children || [];
                const isTemplate = this.isTemplate;
                return {
                    ...libraryResources,
                    oid: isTemplate ? bizResources.oid : libraryResources.oid,
                    identifierNo: isTemplate ? 'projectTemplate' : libraryResources.identifierNo,
                    displayName: isTemplate ? this.i18n['业务管理-资源库模板'] : libraryResources.displayName,
                    nameI18nJson: isTemplate
                        ? { value: this.i18n['业务管理-资源库模板'] }
                        : libraryResources.nameI18nJson,
                    name: isTemplate ? this.i18n['业务管理-资源库模板'] : libraryResources.name,
                    children: isTemplate
                        ? resources.filter((resource) =>
                            this.libraryTemplateSpaceResources.includes(resource.identifierNo)
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
            this.viewAllText = this.i18n?.['查看全部资源库'] ?? this.viewAllText;
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
