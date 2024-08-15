define([
    'text!' + ELMP.resource('erdc-components/FamMenu/FamSideMenu/template.html'),
    'fam:kit',
    'underscore',
    'css!' + ELMP.resource('erdc-components/FamMenu/FamSideMenu/style.css')
], function (template) {
    const FamKit = require('fam:kit');
    return {
        template,
        components: {
            FamSecondaryMenu: FamKit.asyncComponent(ELMP.resource('erdc-components/FamMenu/FamSecondaryMenu/index.js'))
        },
        props: {
            currentRoot: {
                type: Object,
                default() {
                    return {};
                }
            },
            resources: {
                type: Array,
                default() {
                    return [];
                }
            },
            collapsed: Boolean,
            defaultActive: String,
            isShowSearch: {
                type: Boolean,
                default: true
            },
            showChildren: {
                type: Boolean,
                default: true
            },
            maxHeight: [String, Number],
            config: {
                type: Object,
                default: () => {
                    return {
                        key: 'href',
                        label: 'name'
                    };
                }
            },
            hideResourceChildren: {
                type: Array,
                default() {
                    return [];
                }
            },
            isTemplate: [Boolean, String]
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamMenu/FamSideMenu/locale/index.js'),
                keyword: null
            };
        },
        computed: {
            filteredResources() {
                let resources = this.resources;
                if (this.keyword) {
                    resources = FamKit.TreeUtil.filterTreeTable(FamKit.deepClone(this.resources), this.keyword, {
                        children: 'children',
                        attrs: ['name']
                    });
                }
                return resources;
            }
        },
        methods: {
            titleName(targetMenu) {
                let nameI18nJson = targetMenu?.nameI18nJson;
                const displayName = nameI18nJson ? FamKit.translateI18n(nameI18nJson) : targetMenu?.displayName;
                let isTemplate = false;
                try {
                    isTemplate = JSON.parse(this.isTemplate)
                } catch (e) {
                    // do nothing
                }
                if (isTemplate) {
                    return displayName + this.i18n.template;
                }
                return displayName;
            },
            onSelect(resource) {
                this.$emit('routeTo', resource.href, resource);
            },
            toggleCollapsed() {
                this.$emit('update:collapsed', !this.collapsed);
                this.$emit('toggle-collapsed', !this.collapsed);
            }
        }
    };
});
