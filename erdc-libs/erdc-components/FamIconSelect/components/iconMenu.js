// icon 清单
define([
    'text!@erdcloud/erdcloud-icon/lib/erd-iconfont.json',
    'css!' + ELMP.resource('erdc-components/FamIconSelect/style.css')
], function (icon) {
    const template = `
        <div class="flex flex-column h-100p">
            <div class="search mb-8">
                <erd-input v-model="keyword" clearable placeholder="请输入关键字搜索图标" suffix-icon="erd-iconfont erd-icon-search"></erd-input>
            </div>
            <erd-scrollbar class="grow-1">
                <erd-contraction-panel 
                    v-for="(icond, index) in iconDefinitions" 
                    :unfold.sync="unfold[icond.key]"
                    :key="icond.key"
                    :title="icond.displayName + (icond.glyphs ? ('(' + icond.glyphs.length + ')') : '')"
                >
                    <ul class="iconLists mb-normal">
                        <li v-for="(icon, index) in icond.glyphs" :key="icon.icon_id + index" v-if="isVisible(icon, icond)">
                            <span style="cursor: pointer;" @click="selectIcon(icon, icond)">
                                <i :class="getIconClass(icon, icond)"></i>
                                <span class="icon-name">
                                    {{ icon.font_class }}
                                </span>
                            </span>
                        </li>
                    </ul>
                </erd-contraction-panel>
            </erd-scrollbar>
        </div>
    `;

    const defaultIconfont = JSON.parse(icon);

    return {
        template,
        data() {
            return {
                iconClass: 'erd-iconfont erd-icon-triangle-left',
                keyword: null,
                unfold: {}
            };
        },
        computed: {
            iconResources() {
                return (
                    this.$store.state.mfe.iconResources?.filter((iconResource) => !!iconResource.definitionUrl) || []
                );
            },
            iconDefinitions() {
                return [
                    {
                        displayName: this.i18n.defaultIcon,
                        key: 'erdcloud-ui',
                        ...defaultIconfont
                    },
                    ...this.iconResources.map((item) => ({
                        ...item.iconfont,
                        ...item
                    }))
                ];
            }
        },
        watch: {
            iconDefinitions(iconDefinitions) {
                this.$nextTick(() => {
                    this.unfold =
                        Object.keys(this.unfold).length === 0
                            ? iconDefinitions.reduce((acc, icon) => {
                                  acc[icon.key] = true;
                                  return acc;
                              }, {})
                            : this.unfold;
                });
            }
        },
        methods: {
            isVisible(icon, { css_prefix_text, font_family }) {
                const keyword = this.keyword?.toUpperCase() || '';
                return (
                    !keyword ||
                    [
                        icon.font_class,
                        icon.name,
                        css_prefix_text + icon.font_class,
                        font_family + ' ' + css_prefix_text + icon.font_class
                    ].some((item) => item.toUpperCase().includes(keyword))
                );
            },
            selectIcon(icon, icond) {
                this.iconClass = this.getIconClass(icon, icond);
                this.$emit('icon-change', this.iconClass);
            },
            getIconClass(icon, iconDefinition) {
                return [iconDefinition.font_family, iconDefinition.css_prefix_text + icon.font_class].join(' ');
            }
        }
    };
});
