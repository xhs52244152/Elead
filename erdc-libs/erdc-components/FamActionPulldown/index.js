define([
    'text!' + ELMP.resource('erdc-components/FamActionPulldown/index.html'),
    ELMP.resource('erdc-components/FamActionPulldown/popover.js'),
    'css!' + ELMP.resource('erdc-components/FamActionPulldown/style.css')
], function (template, popover) {
    const FamKit = require('fam:kit');
    return {
        template,
        props: {
            buttons: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            actionData: {
                type: Array | String | Object,
                default() {
                    return {};
                }
            },
            // 请求配置
            actionConfig: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            buttonProps: {
                type: Object,
                default: () => {
                    return {
                        label: 'displayName',
                        children: 'children'
                    };
                }
            },
            isOperation: {
                type: Boolean,
                default: true
            },
            /**
             * 提供外部单独使用 (isOperation = true) 时，能够自定义配置下拉按钮配置
             */
            defaultBtnConfig: {
                type: Object,
                default() {
                    return {
                        type: 'text',
                        fixed: true,
                        visible: false
                    };
                }
            },
            // 使用store是的传参, 默认传参示例 [vm, row]
            args: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 扩展禁用时提示语
            actionPulldownTip: {
                type: String,
                default: ''
            },
            // 扩展是否禁用的自定义逻辑
            extendDisabledValidate: Function,

            // 扩展是否隐藏的自定义逻辑
            extendHideValidate: Function,
            // 判断是否是actionButton里边使用
            isActionButton: Boolean,
            placement: String,
            popoverPlacement: String,
            // 手动设置下拉面板的自定义插槽
            buttonSlots: {
                type: Array,
                default() {
                    return [];
                }
            },
            skipValidator: [Boolean, Function]
        },
        components: {
            popover
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamActionPulldown/locale/index.js'),
                btnList: [],
                loading: false
            };
        },
        computed: {
            buttonList() {
                const result = this.isOperation ? this.btnList : this.buttons || [];

                return result.map((item) => {
                    const disabled = this.disabledValidate(item.enabled, true, item);
                    return {
                        ...item,
                        children:
                            item[this.buttonProps.children] &&
                            item[this.buttonProps.children].filter((item) => !item.hide),
                        disabled
                    };
                });
            },
            innerPlacement() {
                return (
                    this.placement ||
                    (this.queryParent(this, (vm) => vm?.$options?.name === 'FamAdvancedTable')
                        ? 'bottom-end'
                        : 'bottom')
                );
            },
            innerSkipValidator() {
                return this.skipValidator || this.actionConfig?.skipValidator;
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.init();
            });
        },
        methods: {
            queryParent(vm, condition) {
                return !vm || !condition(vm) ? vm : this.queryParent(vm.$parent, condition);
            },
            init() {
                if (this.isOperation) {
                    this.btnList = [
                        {
                            ...this.defaultBtnConfig,
                            [this.buttonProps.label]: this.defaultBtnConfig.label,
                            enabled: !this.defaultBtnConfig.disabled,
                            [this.buttonProps.children]: []
                        }
                    ];
                }
            },
            open(items) {
                const visible = !items.visible;
                if (items.disabled) {
                    return;
                }
                if (visible && this.isOperation) {
                    this.$refs.actionPulldown[0].hide();
                    this.loading = true;
                    this.$famHttp({
                        url: '/fam/menu/query',
                        method: 'POST',
                        data: {
                            ...(this.actionConfig || {}),
                            skipValidator: undefined
                        }
                    })
                        .then((resp) => {
                            const { data } = resp;
                            const { actionLinkDtos } = data || {};
                            const buttonGroup = FamKit.structActionButton(actionLinkDtos);
                            this.btnList[0][this.buttonProps.children] = buttonGroup.filter((item) => {
                                if (this.extendHideValidate) {
                                    item.hide = this.extendHideValidate(item, this.actionData);
                                }
                                return !item.hide;
                            });
                        })
                        .finally(() => {
                            this.$refs.actionPulldown[0].show();
                            this.loading = false;
                        });
                } else {
                    if (visible) {
                        this.$refs.actionPulldown[0].show();
                    } else {
                        this.$refs.actionPulldown[0].hide();
                    }
                }
            },
            visibleChange(visible, items) {
                this.$set(items, 'visible', visible);
                if (!visible) {
                    this.popoverCloseAll(this.buttonList);
                }
            },
            onClick(value, dataList, pulldowns) {
                if (!value[this.buttonProps.children] && !this.buttonSlots.includes(value.name)) {
                    this.$refs.actionPulldown[0].hide();
                    if (_.isEmpty(this.buttons)) {
                        if (!_.isFunction(this.$store.getters.getActionMethod(value.name))) {
                            this.$emit('click', value, this.actionData);
                        } else {
                            this.$store.getters.getActionMethod(value.name)(...this.args, value);
                        }
                        return;
                    }
                    this.$emit('pulldown-click', value, this.actionData, pulldowns);
                    return;
                }
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
            },
            popoverClick(value, pulldowns) {
                this.popoverCloseAll(this.buttonList);
                if (!this.isActionButton) {
                    if (!_.isFunction(this.$store.getters.getActionMethod(value.name))) {
                        this.$emit('click', value, this.actionData);
                    } else {
                        this.$store.getters.getActionMethod(value.name)(...this.args, value);
                    }
                }
                this.$emit('pulldown-click', value, this.actionData, pulldowns);
            },
            // 特殊处理防止dropdown收起来的事件
            onPopover() {
                this.$refs.actionPulldown[0].show();
            },
            transformBoolean(value, defaultValue) {
                return value ?? defaultValue;
            },
            disabledValidate(value, defaultValue, item) {
                return this.extendDisabledValidate
                    ? this.extendDisabledValidate(item)
                    : !this.transformBoolean(value, defaultValue);
            },
            popoverCloseAll(data) {
                data.forEach((item) => {
                    if (item[this.buttonProps.children]) {
                        this.popoverCloseAll(item[this.buttonProps.children]);
                    }
                    this.$set(item, 'isPopoverShow', false);
                });
            },
            //  自己计算 ellipsis
            handleMouseOver(el, dom, callback, index) {
                this.$nextTick(() => {
                    const $el = this.$refs?.['dropdown-popover-tooltip'][index]?.$el || null;
                    const parentElement = el.parentElement;
                    const parentWidth = parentElement.clientWidth - 24;
                    const newDom =
                        $el &&
                        $el.querySelector(
                            '.el-dropdown-menu__item>span>span.el-popover__reference-wrapper .title_text'
                        );
                    const containerWidth =
                        newDom?.clientWidth || newDom?.offsetWidth || dom.clientWidth || dom.offsetWidth;
                    const bool = parentWidth < containerWidth;
                    callback(bool);
                });
            }
        }
    };
});
