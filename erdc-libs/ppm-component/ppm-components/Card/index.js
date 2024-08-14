define([
    'text!' + ELMP.resource('ppm-component/ppm-components/Card/index.html'),
    ELMP.resource('ppm-utils/fullscreen.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/Card/index.css')
], function (template, Fullscreen) {
    return {
        template,
        components: {},
        props: {
            title: String,
            // 是否显示 分割线 图标
            showDivider: Boolean,
            // 是否显示 最大化 图标
            showFullscreen: Boolean,
            // 是否显示 更多 图标
            showMore: Boolean,
            // 自定义class，注：所有对卡片自定义的样式必须使用该class来处理，因为卡片最大化后原有的dom上下文会改变
            customClass: String,
            // 是否隐藏卡片边框、表头等信息
            isHideCardBorder: Boolean,
            // 卡片数据
            card: {
                type: Object,
                default() {
                    return {};
                }
            },
            // “more”功能的弹框组件erd-popover的配置
            morePopover: {
                type: Object,
                default() {
                    return {
                        'placement': 'bottom',
                        'trigger': 'click',
                        'visible-arrow': false
                    };
                }
            }
        },
        data() {
            return {
                showZoomIn: true, // 显示最大化 or 最小化
                fullscreenVm: null // 最大化、最小化对象的示例
            };
        },
        computed: {
            dynamicClass() {
                return (this.customClass || '') + (this.isHideCardBorder ? ' hide-card-border' : '');
            }
        },
        mounted() {
            this.$emit('mounted'); // 防止父组件的mounted比子组件的mounted先执行而导致的问题（不知为何父组件mounted先执行）
        },
        methods: {
            // 操作最大化 or 最小化，isFull=true最大化
            handleFullscreen(isFull) {
                // 最大化
                if (isFull) {
                    // 初始化对象
                    this.fullscreenVm = new Fullscreen(this.$el);
                    // 最大化
                    this.fullscreenVm.setFullscreen(() => {
                        this.showZoomIn = false;
                        this.$emit('fullscreenAfter', true); // 最大化/最小化之后的事件
                    });
                }
                // 最小化
                else {
                    // 判断是否为最大化
                    if (!this.fullscreenVm) {
                        return;
                    }
                    this.fullscreenVm.exitFullscreen(() => {
                        this.showZoomIn = true;
                        this.fullscreenVm = null;
                        this.$emit('fullscreenAfter', false); // 最大化/最小化之后的事件
                    });
                }
            }
        }
    };
});
