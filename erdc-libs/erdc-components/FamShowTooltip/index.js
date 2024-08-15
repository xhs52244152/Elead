/**
 * @component FamShowTooltip
 * @description 显示tooltip
 */
define([
    'text!' + ELMP.resource('erdc-components/FamShowTooltip/index.html'),
    'css!' + ELMP.resource('erdc-components/FamShowTooltip/style.css'),
    'underscore'
], function (template) {
    const _ = require('underscore');

    return {
        name: 'FamShowTooltip',
        template,
        props: {
            // 显示的文字内容
            content: String,
            tabindex: Number,
            // 默认提供的主题 dark/light
            effect: {
                type: String,
                default: () => {
                    return 'dark';
                }
            },
            // Tooltip 的出现位置top/top-start/top-end/bottom/bottom-start/bottom-end/left/left-start/left-end/right/right-start/right-end
            placement: {
                type: String,
                default: () => {
                    return 'bottom';
                }
            }
        },
        data() {
            return {
                // 不显示tooltip
                isDisabledTooltip: true
            };
        },
        watch: {
            content: {
                immediate: true,
                handler() {
                    this.resetTooltipStatus();
                }
            }
        },
        methods: {
            // 移入事件: 判断内容的宽度contentWidth是否大于父级的宽度
            onMouseOver() {
                this.resetTooltipStatus();
            },
            resetTooltipStatus() {
                // 根据内容是否溢出，判断是否需要显示tooltip
                this.$nextTick(() => {
                    const parentElement = this.$el.parentElement;
                    const contentWidth = parentElement.clientWidth;
                    const container = this.$el.querySelector('#showTooltip .title_text');
                    this.isDisabledTooltip = contentWidth > container?.clientWidth;
                });
            }
        }
    };
});
