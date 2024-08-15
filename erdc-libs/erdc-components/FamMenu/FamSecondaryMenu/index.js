define(['css!' + ELMP.resource('erdc-components/FamMenu/FamSecondaryMenu/style.css'), 'fam:kit'], function () {
    const FamKit = require('fam:kit');
    const MenuItem = {
        /*html*/
        template: `
            <erd-menu-item
                ref="menuItem"
                style="padding: 8px 16px;"
                :index="resource[config.key]"
                :class="{ 'is-active': isActive }"
            >
                <template v-if="!showOverflow"><erd-icon v-if="resource.icon" :icon="resource.icon"></erd-icon>{{titleName}}</template>
                <erd-tooltip
                    v-else
                    :content="titleName"
                    class="ellipsis"
                    placement="top"
                >
                    <div class="ellipsis"><erd-icon v-if="resource.icon" :icon="resource.icon"></erd-icon>{{titleName}}</div>
                </erd-tooltip>
            </erd-menu-item>
        `,
        props: {
            resource: Object,
            config: {
                type: Object,
                default() {
                    return {
                        key: 'href',
                        label: 'name'
                    };
                }
            },
            active: String
        },
        data() {
            return {
                showOverflow: false,
                isActive: false
            };
        },
        computed: {
            titleName: function () {
                let nameI18nJson = this.resource?.nameI18nJson;
                return nameI18nJson ? FamKit.translateI18n(nameI18nJson) : this.resource[this.config.label];
            },
            currentResource() {
                return this.$store.getters['route/matchResource'](this.$route) || {};
            }
        },
        watch: {
            $route() {
                this.setActive();
            },
            resource() {
                this.setActive();
            },
            active() {
                this.setActive();
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.setActive();
                this.showOverflow = this.$refs.menuItem.$el.offsetWidth < this.$refs.menuItem.$el.scrollWidth;
            });
        },
        methods: {
            setActive() {
                this.isActive =
                    this.active === this.resource[this.config.key] || this.resource.oid === this.currentResource.oid;
                this.$nextTick(() => {
                    if (this.isActive && this.$refs.menuItem?.$el) {
                        this.$refs.menuItem.$el.classList.add('is-active');
                    }
                });
            }
        }
    };

    return {
        /*html*/
        template: `
            <erd-menu
                :mode="$attrs.mode"
                :collapse="$attrs.collapse"
                :default-active="defaultActive"
                :default-openeds="defaultActivePath"
            >
                <template v-for="resource in resources">
                    <erd-submenu
                        :ref="resource.identifierNo"
                        v-if="showChildren && resource.children && resource.children.length && !isHiddenChildren(resource)" 
                        :index="resource[config.key] || resource.identifierNo" 
                        :key="resource[config.key] || resource.identifierNo"
                        class="fam-secondary-menu_-submenu"
                    >
                        <template v-slot:title v-if="!showOverflow[resource.identifierNo]"><erd-icon v-if="resource.icon" :icon="resource.icon"></erd-icon>{{titleName(resource)}}</template>
                        <template v-slot:title v-else>
                            <erd-tooltip
                                :content="titleName(resource)"
                                class="ellipsis"
                                placement="top"
                            >
                                <div><erd-icon v-if="resource.icon" :icon="resource.icon"></erd-icon>{{titleName(resource)}}</div>
                            </erd-tooltip>
                        </template>
                        
                        <menu-item
                            v-for="resource in resource.children"
                            :key="resource[config.key]"
                            class="el-submenu-children"
                            :resource="resource"
                            :config="config"
                            :active="defaultActive"
                            @click.native="$listeners.select(resource)"
                        ></menu-item>
                    </erd-submenu>
                    <menu-item
                        v-else
                        :key="resource[config.key]"
                        class="el-submenu__title"
                        :resource="resource"
                        :index="resource[config.key] || resource.identifierNo"
                        :config="config"
                        :active="defaultActive"
                        @click.native="$listeners.select(resource)"
                    ></menu-item>
                </template>
            </erd-menu>
        `,
        components: {
            MenuItem
        },
        props: {
            resources: {
                type: Array,
                default() {
                    return [];
                }
            },
            defaultActive: String,
            showChildren: {
                type: Boolean,
                default: true
            },
            config: {
                type: Object,
                default() {
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
            }
        },
        data() {
            return {
                showOverflow: {}
            };
        },
        computed: {
            defaultActivePath() {
                return this.resources.map((item) => item[this.config.key] || item.identifierNo);
            }
        },
        watch: {
            resources() {
                this.$nextTick(() => {
                    this.setOverflowShows();
                });
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.setOverflowShows();
            });
        },
        methods: {
            titleName(targetMenu) {
                let nameI18nJson = targetMenu?.nameI18nJson;
                return nameI18nJson ? FamKit.translateI18n(nameI18nJson) : targetMenu[this.config.label];
            },
            setOverflowShows() {
                this.resources.forEach((resource) => {
                    if (resource.children?.length) {
                        this.$nextTick(() => {
                            const overflow =
                                this.$refs[resource.identifierNo]?.$el?.offsetWidth <
                                this.$refs[resource.identifierNo]?.$el?.scrollWidth;
                            this.$set(this.showOverflow, resource.identifierNo, overflow);
                        });
                    }
                });
            },
            isHiddenChildren(resource) {
                return [resource[this.config.key] || resource.identifierNo || resource.href].some((i) =>
                    this.hideResourceChildren?.includes(i)
                );
            }
        }
    };
});
