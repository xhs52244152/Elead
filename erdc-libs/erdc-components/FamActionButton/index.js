define([
    'text!' + ELMP.resource('erdc-components/FamActionButton/index.html'),
    'css!' + ELMP.resource('erdc-components/FamActionButton/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            actionConfig: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            isDefaultBtnType: {
                type: Boolean,
                default: false
            },
            actionData: {
                type: [Array, Object],
                default: () => {
                    return [];
                }
            },
            args: {
                type: Array,
                default() {
                    return [];
                }
            },
            // 扩展是否禁用的自定义逻辑
            extendDisabledValidate: Function,
            beforeValidatorQuery: {
                type: Object,
                default() {
                    return {};
                }
            },
            popoverPlacement: String,
            skipValidator: [Boolean, Function]
        },
        components: {
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                buttonGroup: [],
                buttonProps: {
                    children: 'children',
                    label: 'displayName'
                },
                actionConfigDefalut: {},
                moduleName: null,
                actionDataDtos: {},
                isAfterValidator: false
            };
        },
        watch: {
            actionConfig: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (_.keys(nv).some((key) => nv[key] !== this.actionConfigDefalut[key])) {
                        this.actionConfigDefalut = nv;
                        this.getActionButtons();
                    }
                }
            }
        },
        computed: {
            innerSkipValidator() {
                return this.skipValidator || this.actionConfig?.skipValidator;
            },
            buttonConfig() {
                return this.buttonGroup
                    .filter((item) => !item.hide)
                    .map((item) => {
                        if (!item[this.buttonProp.children] || !item[this.buttonProp.children].length) {
                            return item;
                        }
                        return null;
                    })
                    .filter((item) => item);
            },
            pulldownConfig() {
                return this.buttonGroup
                    .filter((item) => !item.hide)
                    .map((item, index) => {
                        if (item[this.buttonProp.children] && item[this.buttonProp.children].length) {
                            let obj = item;
                            if (index === 0 && !this.isDefaultBtnType && !this.buttonConfig.length) {
                                obj.type = 'primary';
                            }
                            return obj;
                        }
                        return null;
                    })
                    .filter((item) => item);
            },
            buttonProp() {
                return {
                    label: 'label',
                    children: 'children',
                    ...this.buttonProps
                };
            },
            innerButtonGroup() {
                return this.buttonGroup.filter((item) => !item.hide);
            }
        },
        methods: {
            getModuleName(name, actionDataDtos) {
                let moduleName = '';
                for (let i = 0; i < actionDataDtos?.actionLinkDtos.length; i++) {
                    const item = actionDataDtos?.actionLinkDtos[i];
                    if (item?.actionDto?.name === name) {
                        moduleName = actionDataDtos.name;
                        break;
                    } else if (item?.moduleDto) {
                        if (moduleName) break;
                        moduleName = this.getModuleName(name, item.moduleDto);
                    }
                }
                return moduleName;
            },
            /**
             * 点击按钮事件
             * @param {*} value 按钮的详情
             * @param {*} data 下拉选项点击时传入的数据
             */
            onClick(value, actionData, pulldownConfig) {
                const moduleName = this.getModuleName(value?.name, this.actionDataDtos) || this.moduleName || '';
                if (
                    (pulldownConfig === undefined && !this.isAfterValidator) ||
                    !pulldownConfig?.isAfterValidator ||
                    (typeof this.innerSkipValidator === 'function'
                        ? this.innerSkipValidator(value, actionData, pulldownConfig)
                        : !!this.innerSkipValidator)
                ) {
                    if (!_.isFunction(this.$store.getters.getActionMethod(value.name))) {
                        this.$emit('click', value, this.actionData, moduleName);
                    } else {
                        this.$store.getters.getActionMethod(value.name)(...this.args, value, moduleName);
                    }
                    return;
                }

                this.$famHttp({
                    url: '/fam/menu/before/validator',
                    method: 'POST',
                    ...this.beforeValidatorQuery,
                    data: {
                        actionName: value.name,
                        extractParamMap: {},
                        moduleName,
                        multiSelect: this.actionData.map((item) => item.oid).filter(Boolean),
                        ...this.beforeValidatorQuery?.data
                    }
                }).then((resp) => {
                    const { data } = resp;
                    if (data?.passed) {
                        if (!_.isFunction(this.$store.getters.getActionMethod(value.name))) {
                            this.$emit('click', value, this.actionData, moduleName);
                        } else {
                            this.$store.getters.getActionMethod(value.name)(...this.args, value, moduleName);
                        }
                    } else {
                        const message = data?.messageDtoList
                            .map((item) => {
                                return `<span>${item.name} ${item.msg}</br></span>`;
                            })
                            .join('');

                        this.$message({
                            type: 'error',
                            message,
                            showClose: true,
                            dangerouslyUseHTMLString: true
                        });
                    }
                });
            },
            // 调用接口，获取按钮信息
            getActionButtons() {
                this.$famHttp({
                    url: '/fam/menu/query',
                    method: 'POST',
                    data: {
                        ...(this.actionConfig || {}),
                        skipValidator: undefined
                    }
                }).then((resp) => {
                    const { data } = resp;
                    const { actionLinkDtos, name, isAfterValidator } = data || {};
                    this.actionDataDtos = data;
                    this.moduleName = name;
                    this.isAfterValidator = isAfterValidator;
                    const buttonGroup = FamKit.structActionButton(actionLinkDtos);
                    this.$emit('loaded', buttonGroup);
                    this.setButtonGroup(buttonGroup);
                });
            },
            type(type, index) {
                if (type) {
                    return type;
                }
                if (index === 0 && !this.isDefaultBtnType) {
                    return 'primary';
                }
                return null;
            },
            transformBoolean(value, defaultValue) {
                return value ?? defaultValue;
            },
            handleMouseOver(el, dom, callback, i) {
                const $button = this.$refs.button[i]?.$el;
                if ($button) {
                    const $text = $button.querySelector('.title_text');
                    callback($text?.offsetWidth > $button.offsetWidth - 24);
                }
            },
            setButtonGroup(buttonGroup) {
                this.buttonGroup = buttonGroup;
            },
            pulldownGroup(buttonGroup, index) {
                if (index === 0 && !this.isDefaultBtnType) {
                    buttonGroup.type = 'primary';
                }
                return [buttonGroup];
            }
        }
    };
});
