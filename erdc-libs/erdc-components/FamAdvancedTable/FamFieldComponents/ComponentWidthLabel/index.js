define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.html'),
    'erdcloud.kit',
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/style.css')
], function (template, ErdcKit) {
    return {
        props: {
            label: String,
            value: [String, Array, Boolean, Object],
            isRender: String,
            options: Array,
            placeholder: String,
            disabled: Boolean,
            removeable: {
                type: Boolean,
                default: true
            },
            clearable: {
                type: Boolean,
                default: false
            },
            row: Object
        },
        template,
        data() {
            return {
                dataValue: '',
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource(
                    'erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/locale/index.js'
                ),
                // // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys([
                    'remove_condition',
                    'clear_value',
                    'tips_enter',
                    'tips_enter_name',
                    'tips_select',
                    'yes',
                    'no'
                ]),
                // 是否为隐藏label状态
                isHideLabel: false,
                styleVar: '',
                hideFormLabel: false,
                width: null
            };
        },
        watch: {
            dataValue: {
                handler(val) {
                    this.$emit('input', val);
                }
            },
            value: {
                handler(val) {
                    this.dataValue = val;
                },
                immediate: true
            },
            dataPlaceholder: {
                handler(val) {
                    // input宽度由placeholder文字自适应，确保完全显示出placeholder文字
                    this.styleVar = {
                        '--placeholderContentWidth': val ? val.length * 16 + 'px' : '80px'
                    };
                },
                immediate: true
            },
            showComponent: {
                deep: true,
                immediate: true,
                handler(component) {
                    if (ErdcKit.isSameComponentName(component, 'FamParticipantSelect')) {
                        this.width = '180px';
                    }
                }
            }
        },
        computed: {
            showComponent() {
                let { isRender, getShowComponentConfig } = this;
                return getShowComponentConfig(isRender).componentName;
            },
            dataOptions() {
                let { isRender, getShowComponentConfig, options } = this;
                return Array.isArray(options) && options.length > 0
                    ? options
                    : getShowComponentConfig(isRender).options;
            },
            componentProps() {
                let props = this.getShowComponentConfig(this.isRender).props;
                if (props?.row?.requestConfig?.url?.includes('classify/tree')) {
                    // 去除parentId 避免树组件渲染失败
                    props.row.requestConfig.transformResponse = [
                        (data) => {
                            let jsonData = JSON.parse(data);
                            if (jsonData?.data?.length === 1 && jsonData.data[0].parentId) {
                                delete jsonData.data[0].parentId;
                            }
                            return jsonData;
                        }
                    ];
                }
                return props;
            },
            dataPlaceholder() {
                let { i18nMappingObj, placeholder, showComponent } = this;
                if (placeholder) return placeholder;
                else
                    return showComponent === 'erd-input'
                        ? _.isFunction(i18nMappingObj['tips_enter_name'])
                            ? i18nMappingObj['tips_enter_name'](this.label ?? '')
                            : i18nMappingObj['tips_enter']
                        : undefined;
            },
            rangeSeparator() {
                return '~';
            },
            event() {
                let {
                    widthoutBlurEvent,
                    showComponent,
                    hasPopper,
                    updatePopperStyle,
                    updateInputStyle,
                    onChange,
                    onBlur
                } = this;
                let event = {};
                // 不是通过失去焦点事件触发更新的，走change事件,否则走blur事件
                if (widthoutBlurEvent(showComponent)) {
                    event.change = onChange;
                } else {
                    event.blur = onBlur;
                }

                // 有popper弹窗的控件（日期、人员等），需要做弹窗位置处理
                if (hasPopper(showComponent)) {
                    event.focus = updatePopperStyle;
                }

                if (['erd-cascader'].includes(showComponent)) {
                    event['change-visible'] = (visible) => {
                        if (visible) {
                            // 计算label与input的宽度
                            updateInputStyle();
                            this.isHideLabel = true;
                        } else {
                            if (!widthoutBlurEvent(showComponent)) {
                                onBlur(...arguments);
                            }
                            this.isHideLabel = false;
                        }
                    };
                }
                // 输入框需要在获取焦点时，隐藏label
                if (['erd-input'].includes(showComponent)) {
                    event.focus = () => {
                        // 计算label与input的宽度
                        updateInputStyle();
                        this.isHideLabel = true;
                    };
                    event.blur = () => {
                        if (!widthoutBlurEvent(showComponent)) {
                            onBlur(...arguments);
                        }
                        this.isHideLabel = false;
                    };

                    // 输入框支持回车搜索
                    event['keyup.enter.native'] = () => {
                        _.isFunction(this.$refs?.component?.blur) && this.$refs?.component?.blur();
                        event.blur(...arguments);
                    };
                }
                return event;
            },
            popperClass() {
                let { hasPopper, showComponent } = this;
                if (hasPopper(showComponent)) return 'fam-form-item-width-label__popper';
                else return 'fam-component-width-label__popper';
            },
            cancelStatus() {
                return (this.dataValue ?? '') === '' || JSON.stringify(this.dataValue) === '[]' ? 'remove' : 'clear';
            },
            cancelTitle() {
                let { cancelStatus, i18nMappingObj } = this;
                let i18nMap = {
                    remove: i18nMappingObj['remove_condition'],
                    clear: i18nMappingObj['clear_value']
                };

                return i18nMap[cancelStatus];
            },
            componentType() {
                let type = ['erd-input-number'].includes(this.isRender) ? 'number' : null;
                type = ['erd-date-picker'].includes(this.isRender) ? this.getComponentProps()?.type : type;
                return type;
            },
            hideLabel() {
                return ['erdc-input'].some((componentName) =>
                    ErdcKit.isSameComponentName(componentName, this.showComponent)
                );
            }
        },
        methods: {
            onCancel() {
                let { cancelStatus } = this;
                let eventMap = {
                    remove: this.onRemove,
                    clear: this.onClear
                };

                return eventMap[cancelStatus] && eventMap[cancelStatus]();
            },
            onRemove() {
                this.$emit('remove');
            },
            onClear(emitEvent = true) {
                let { showComponent } = this;
                // 清空值
                this.dataValue = '';
                // 特殊控件清空处理
                let specialHandler = {
                    'fam-participant-select': () => {
                        this.$refs?.component?.clearInput && this.$refs?.component?.clearInput();
                        this.dataValue = '';
                    }
                };

                if (specialHandler[showComponent]) specialHandler[showComponent]();

                emitEvent &&
                    setTimeout(() => {
                        this.$emit('after-change');
                    });
            },
            onChange(val) {
                let { showComponent } = this;
                // 特殊控件值切换处理
                let specialHandler = {
                    'fam-participant-select': () => {
                        this.dataValue = val?.oid || '';
                    }
                };

                if (specialHandler[showComponent]) specialHandler[showComponent]();

                // 某些控件需要在值改变后触发失去焦点事件
                setTimeout(() => {
                    this.$emit('after-change');
                });
            },
            onBlur() {
                setTimeout(() => {
                    this.$emit('after-change');
                });
            },
            // 没有失去焦点事件
            widthoutBlurEvent(componentName) {
                return [
                    'erd-ex-select',
                    'custom-date-picker',
                    'custom-date-time',
                    'erd-date-picker',
                    'fam-member-select',
                    'custom-select',
                    'fam-organization-select',
                    'fam-dict',
                    'fam-participant-select'
                ].includes(componentName);
            },
            onLabelClick() {
                this.focus();
            },
            focus() {
                let { showComponent } = this;
                // 不同控件的获取焦点方法不同
                let component = this.$refs?.component;
                let focusEventMap = {
                    'erd-input': () => {
                        if (typeof component?.focus === 'function') {
                            component.focus();
                        }
                    },
                    'erd-ex-select': () => {
                        let select = component?.$refs?.['erd-select'];
                        if (select) {
                            select.focus();
                            select.toggleMenu();
                        }
                    },
                    'fam-member-select': () => {
                        component?.focusInput && component?.focusInput();
                    }
                };

                if (focusEventMap[showComponent]) focusEventMap[showComponent]();
                else focusEventMap['erd-input']();
            },
            getShowComponentConfig(componentName) {
                let options = [];
                let { i18nMappingObj } = this;
                let selectConfig = {
                    name: 'erd-ex-select',
                    options: [
                        {
                            label: i18nMappingObj['yes'],
                            value: true
                        },
                        {
                            label: i18nMappingObj['no'],
                            value: false
                        }
                    ]
                };
                // 布尔、开关等需要以下拉框展示（UCD）
                let transMap = {
                    'fam-radio': selectConfig,
                    'fam-boolean': selectConfig,
                    'erd-switch': selectConfig
                };
                // 富文本、计数器, 国际化 编码生成器需要以输入框展示（UCD）
                let transInputComps = ['erd-quill-editor', 'erd-input-number', 'fam-i18nbasics', 'fam-code-generator'];
                let componentJson = this.row?.componentJson;
                try {
                    componentJson = JSON.parse(componentJson);
                } catch (e) {
                    componentJson = {};
                }
                const props = componentJson?.props || {};
                if (transMap[componentName]) {
                    options = transMap[componentName].options || {};
                    if (componentName === 'fam-radio' && props.options?.length) {
                        options = props.options;
                    }
                    componentName = transMap[componentName].name;
                }

                if (transInputComps.includes(componentName)) {
                    componentName = 'erd-input';
                }

                if (['erd-quill-editor'].includes(componentName)) {
                    options = null;
                }

                if (transMap[componentName]) {
                    options = transMap[componentName].props || {};
                    componentName = transMap[componentName].name;
                }

                if (
                    ErdcKit.isSameComponentName(
                        this.fnComponentHandle(this.row?.componentName).showComponent,
                        'custom-select'
                    )
                ) {
                    props.row = props.row || {};
                    props.row.componentName = props.row.componentName || this.row?.componentName || componentName;
                }
                if (ErdcKit.isSameComponentName(this.row?.componentName, 'CustomVirtualEnumSelect')) {
                    props.row.requestConfig = {
                        params: {
                            realType: this.row?.dataKey || ''
                        }
                    };
                }
                if (['fam-member-select'].includes(componentName)) {
                    props['isgetdisable'] = false;
                    props['tableWidth'] = 260;
                }
                if (['fam-participant-select'].includes(componentName)) {
                    props['isFetchValue'] = true;
                    props['threeMemberEnv'] = props['threeMemberEnv'] ?? false;
                }
                if (['custom-select'].includes(componentName)) {
                    props['filterable'] = true;
                }

                if (
                    ErdcKit.isSameComponentName(
                        this.fnComponentHandle(this.row?.componentName).showComponent,
                        'erd-date-picker'
                    )
                ) {
                    props.format = this.row?.formatPattern || 'yyyy-MM-dd';
                    props.valueFormat = this.row?.formatPattern || 'yyyy-MM-dd';
                }

                if (
                    ErdcKit.isSameComponentName(
                        this.fnComponentHandle(this.row?.componentName).showComponent,
                        'fam-dict'
                    )
                ) {
                    props.itemName = this.row?.dataKey || '';
                }
                return {
                    componentName,
                    options,
                    props
                };
            },
            hasPopper(componentName) {
                return ['custom-date-picker', 'custom-date-time', 'fam-member-select'].includes(componentName);
            },
            // 设置日期、人员等弹窗偏移量
            updatePopperStyle() {
                this.$emit('focus');
                let labelWidth = this.$refs['formItem'].$el.querySelector('.el-form-item__label').offsetWidth;
                document.documentElement.style.setProperty('--fam-filter-dynamic-margin-left', `-${labelWidth}px`);
            },
            // 输入框获取焦点时的宽度计算
            updateInputStyle() {
                let $formItem = this.$refs['formItem'].$el;
                let labelWidth = $formItem.querySelector('.el-form-item__label')?.offsetWidth;
                let prefixLabelWidth = $formItem.querySelector('.el-input__prefix')?.offsetWidth;
                let inputWidth = $formItem.querySelector('.el-input>.el-input__inner')?.offsetWidth;

                document.documentElement.style.setProperty(
                    '--fam-filter-dynamic-label-width',
                    `${labelWidth || prefixLabelWidth}px`
                );
                document.documentElement.style.setProperty('--fam-filter-dynamic-input-width', `${inputWidth}px`);
            },
            getComponentProps() {
                return Object.assign({}, this.$attrs, this.componentProps);
            },
            handleComponentMounted() {
                const $el = this.$refs['component'].$el;
                if ($el) {
                    if (
                        ['el-input', 'el-select'].some(
                            (item) => $el.querySelector(`.${item}`) || $el.classList.contains(item)
                        )
                    ) {
                        this.hideFormLabel = true;
                    }
                }
            }
        }
    };
});
