// icon 图标展示
define([], function () {
    const template = `
        <div>
            <template v-if="Array.isArray(icon)">
                <i v-for="(item,index) in icon" class="iconClassStyle" :class="item">
                    <erd-icon v-if="clear" icon="clear" @click.native="removeIcon(index)"></erd-icon>  
                </i>
            </template>
            <span v-else-if="readonly && !icon">--</span>
            <i v-else :class="[{'iconClassStyle': icon}, icon, { 'defaultIconClassStyle': defaultIconClassStyle }]">
                <i class="erd-iconfont erd-icon-error" v-if="isClearable" @click="emptyIcon"></i>  
            </i>
        </div>
    `;
    return {
        template,
        props: {
            iconClass: {
                type: [String, Array],
                default() {
                    return '';
                }
            },
            clear: {
                type: Boolean,
                default: false
            },
            readonly: Boolean
        },
        data() {
            return {};
        },
        computed: {
            icon: {
                get() {
                    return this.iconClass;
                },
                set(val) {
                    this.$emit('update:iconClass', val);
                }
            },
            defaultIconClassStyle() {
                return !this.icon;
            },
            isClearable() {
                const iconClass = this.iconClass?.split(' ')?.filter((item) => item && item !== 'erd-iconfont');
                return this.clear && iconClass.length > 0;
            }
        },
        mounted() {},
        methods: {
            removeIcon(idx) {
                this.icon.splice(idx, 1);
            },
            emptyIcon() {
                this.icon = '';
            }
        }
    };
});
