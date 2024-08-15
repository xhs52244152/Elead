define(['css!' + ELMP.resource('erdc-components/FamActionPulldown/style.css')], function () {
    const FamKit = require('fam:kit');
    return {
        template: /*html*/ `
            <ul>
                <erd-show-tooltip
                    v-for="(item, i) in buttonList"
                    :ref="'popover-' + item.name"
                    :key="item.key || i"
                    placement="top"
                    :content="item[buttonProps.label]"
                    :enterable="false"
                    :flex="false"
                    padding-width="32"
                    :custom-mouse-over="(el, dom, callback) => handleMouseOver(el, dom, callback, item)" 
                >
                    <template v-slot:show-tooltip-title>
                        <li
                            type="text"
                            :class="{
                                'popover-active': !!item.isPopoverShow,
                                'popover-right': item[buttonProps.children],
                                ['show-tooltip-' + item.name]: true,
                                'popover-disabled': disabledValidate(item.enabled, true, item)
                            }"
                            @click.stop="onClick(item, buttonList)"
                        >
                            <popover
                                ref="popover"
                                v-if="item[buttonProps.children]"
                                :button="item"
                                :button-props="buttonProps"
                                @click="onPopoverClick"
                                :extend-disabled-validate="extendDisabledValidate"
                                @popover="onPopover">
                            </popover>
                            <span
                                v-else 
                                class="text flex align-items-center">
                                    <i class="mr-4" :class="item.icon"></i>
                                    <span class="text_content truncate">
                                        <span class="title_text">{{item[buttonProps.label]}}</span>
                                    </span>
                            </span>
                        </li>
                    </template>
                </erd-show-tooltip>
            </ul>
        `,
        props: {
            buttonList: {
                type: Array,
                default() {
                    return [];
                }
            },
            buttonProps: {
                type: Object,
                default() {
                    return {
                        label: 'displayName',
                        children: 'children'
                    };
                }
            },
            // 扩展是否禁用的自定义逻辑
            extendDisabledValidate: Function
        },
        components: {
            popover: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/popover.js'))
        },
        data() {
            return {};
        },
        methods: {
            onClick(value, dataList) {
                if (value[this.buttonProps.children]) {
                    // 特殊处理防止dropdown收起来的事件
                    this.$emit('popover');
                    dataList.forEach((item) => {
                        if (item.name === value.name) {
                            this.$set(item, 'isPopoverShow', !item.isPopoverShow);
                        } else {
                            this.$set(item, 'isPopoverShow', false);
                        }
                        if (item[this.buttonProps.children]) {
                            this.popoverCloseAll(item[this.buttonProps.children]);
                        }
                    });
                } else {
                    if (this.disabledValidate(value.enabled, true, value)) {
                        this.$emit('popover');
                        return;
                    }
                    this.$emit('click', value);
                }
            },
            onPopover() {
                this.$emit('popover');
            },
            onPopoverClick(value) {
                this.$set(value, 'isPopoverShow', false);
                this.$emit('click', value);
            },
            popoverCloseAll(data) {
                data.forEach((item) => {
                    if (item[this.buttonProps.children]) {
                        this.popoverCloseAll(item[this.buttonProps.children]);
                    }
                    this.$set(item, 'isPopoverShow', false);
                });
            },
            transformBoolean(value, defaultValue) {
                const disabled = value ?? defaultValue;
                return disabled;
            },
            disabledValidate(value, defaultValue, item) {
                return this.extendDisabledValidate
                    ? this.extendDisabledValidate(item)
                    : !this.transformBoolean(value, defaultValue);
            },
            //  自己计算 ellipsis
            handleMouseOver(el, dom, callback, item) {
                this.$nextTick(() => {
                    const $el = this.$refs?.['popover-' + item.name][0]?.$el || null;
                    const parentElement = el.parentElement;
                    const parentWidth = item[this.buttonProps.children]
                        ? parentElement.clientWidth - 38
                        : parentElement.clientWidth - 24;
                    const className = `.show-tooltip-${item.name}>span>span.el-popover__reference-wrapper .title_text`;
                    const newDom = $el && $el.querySelector(className);
                    const containerWidth =
                        newDom?.clientWidth || newDom?.offsetWidth || dom.clientWidth || dom.offsetWidth;
                    const bool = parentWidth <= containerWidth;
                    callback(bool);
                });
            }
        }
    };
});
