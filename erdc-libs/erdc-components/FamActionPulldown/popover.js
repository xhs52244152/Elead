define(['css!' + ELMP.resource('erdc-components/FamActionPulldown/style.css')], function () {
    const FamKit = require('fam:kit');
    return {
        template: /*html*/ `
            <erd-popover
                ref="popover"
                :popper-class="popoverClass"
                :class="{'popover-disabled': disabledValidate(button.enabled, true, button)}"
                trigger="click"
                :placement="popoverPlacement"
                :width="150"
                :offset="4"
                :visible-arrow="false"
                :value="button.isPopoverShow"
                :disabled="disabledValidate(button.enabled, true, button)"
            >
                <span
                    class="text align-middle"
                    slot="reference"
                >
                    <i :class="button.icon"></i>
                    <span class="text_content truncate">
                        <span class="title_text">{{button[buttonProps.label]}}</span>
                    </span>
                    <i class="erd-iconfont erd-icon-arrow-right"></i>
                </span>
                <slot :name="button.name">
                    <button-list
                        :button-list="buttonList"
                        :button-props="buttonProps"
                        @click="onClick"
                        :extend-disabled-validate="extendDisabledValidate"
                        @popover="popover">
                    </button-list>
                </slot>
            </erd-popover>
        `,
        props: {
            button: {
                type: Object,
                default() {
                    return {};
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
            className: String,
            // 扩展是否禁用的自定义逻辑
            extendDisabledValidate: Function,
            popoverPlacement: {
                type: String,
                default: 'left-start'
            },
            buttonSlots: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        components: {
            buttonList: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/buttonList.js'))
        },
        data() {
            return {};
        },
        computed: {
            popoverClass() {
                return `${this.className || ''} fam_action_pulldown_popover`;
            },
            buttonList() {
                let buttonList = [];
                try {
                    buttonList = this.button[this.buttonProps.children].filter((item) => !item.hide)
                } catch (error) {
                    buttonList = []
                }
                return buttonList;
            }
        },
        methods: {
            onClick(value) {
                this.$emit('click', value);
            },
            popover() {
                this.$emit('popover');
            },
            transformBoolean(value, defaultValue) {
                const disabled = value ?? defaultValue;
                return disabled;
            },
            disabledValidate(value, defaultValue, item) {
                return this.extendDisabledValidate
                    ? this.extendDisabledValidate(item)
                    : !this.transformBoolean(value, defaultValue);
            }
        }
    };
});
