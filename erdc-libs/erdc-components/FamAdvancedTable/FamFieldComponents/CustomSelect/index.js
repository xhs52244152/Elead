/**
 * 下拉单选组件
 *  virtual-select 通过接口查询数据源的下拉框
    constant-select 固定数据源下拉框
    <custom-select v-model="value" :row="row" @callback="callback"></custom-select>
 * **/
/** 
* @module 字段映射公共组件
* @component CustomSelect
* @props { customSelectProps } - props参数引用
* @description 下拉框组件
* @author Mr.JinFeng
* @example 详细的使用方式demo，移步查看README.md文件
* 组件声明：已经在全局注册，无需再单独引入
* 
* @typedef {Object} customSelectProps
* @property {String | Object | Boolean | Array} value -- 值
* @property { Object } row -- 配置数据
* @property { String } oper -- 条件操作表达式
* @property { Array } disabledArray -- 禁用不可选项（value值集合）
* @property { Boolean } collapseTags -- 是否显示tags，多选才有效
* @property { Boolean } multiple -- 是否多选


* @events TODO
*/
define([
    'text!' + ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/CustomSelect/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/selectOptionsHandle.js'),
    'erdc-kit',
    ELMP.resource('erdc-components/EmitterMixin.js'),
    'css!' + ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/CustomSelect/style.css')
], function (template, selectOptionsHandle, utils, EmitterMixin) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template: template,
        mixins: [selectOptionsHandle, EmitterMixin],
        props: {
            value: [String, Object, Boolean, Array, Number],
            // 当前数据行
            row: {
                type: Object,
                default() {
                    return null;
                }
            },
            // 条件操作
            oper: {
                type: String,
                default() {
                    return '';
                }
            },
            // 不可点击的数oid
            disabledArray: {
                type: Array,
                default() {
                    return [];
                }
            },
            collapseTags: {
                type: Boolean,
                default() {
                    return true;
                }
            },
            multiple: {
                type: Boolean,
                default() {
                    return false;
                }
            },
            showCheckAll: {
                type: Boolean,
                default: true
            },
            tooltip: {
                type: Boolean,
                default: true
            },
            popperClass: String,
            placeholder: String,
            // 当前有options、且值为undefined和空字符串时生效
            defaultSelectFirst: Boolean,
            // 是否使用树组件
            treeSelect: Boolean,
            treeProps: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            nodeKey: {
                type: String,
                default: () => {
                    return null;
                }
            },
            appName: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource(
                    'erdc-components/FamAdvancedTable/FamFieldComponents/CustomSelect/locale/index.js'
                ),
                i18nMappingObj: this.getI18nKeys(['checkAll']),
                defaultValue: this.value || '',
                isSelected: false,
                disabledTooltip: {},
                selectOptionWidth: null,
                optionWidth: 'auto',
                checkAll: false,
                isIndeterminate: false,
                hideTreeSelect: false,
                innerValue: this.value
            };
        },
        computed: {
            listeners() {
                return {
                    ...this.$listeners,
                    input: $.noop,
                    change: $.noop
                };
            },
            nodeKeys() {
                return this.nodeKey || this.treeProp.value || 'oid';
            },
            selected() {
                return ![null, undefined].includes(this.innerValue) ? this.innerValue : '';
            },
            placeholderText() {
                return this.placeholder || utils.setTextBySysLanguage({ CN: '请选择', EN: 'Please select' });
            },
            // 下拉框显示值（根据下拉框类型来，有些是接口，有些是固定，有些是字典定义规则即可）
            options: {
                get() {
                    return this.optionList;
                },
                set(vals) {
                    this.optionList = vals;
                }
            },
            isMultiple() {
                return this.multiple || this.oper?.includes('IN') || false;
            },
            isCollapseTags() {
                return this.collapseTags;
            },
            selectedUsers: function () {
                const selectUserArr =
                    this.sourceOptions &&
                    this.sourceOptions?.filter((item) => this.selected?.includes(item[this.valueKey]));
                return selectUserArr || [];
            },
            myPopperClass() {
                return (
                    this.popperClass ||
                    (this.tooltip
                        ? 'fam-max-width-100 vxe-table--ignore-clear fam-custom-select-popper'
                        : ' fam-custom-select-popper')
                );
            },
            treeProp() {
                return {
                    ...this.treeProps,
                    label: this.treeProps?.label || this.row?.value?.viewProperty || this.viewProperty || 'displayName',
                    value: this.treeProps?.value || this.row?.value?.valueProperty || this.valueProperty || 'oid'
                };
            },
            valueProperty() {
                return this.row?.valueProperty;
            },
            viewProperty() {
                return this.row?.viewProperty;
            }
        },
        watch: {
            innerValue: function (vals) {
                let selected = [];
                let joinLabel = '';
                this.isSelected = true;
                if (![null, undefined].includes(vals)) {
                    let tempVals = this.isMultiple ? vals : [vals];
                    let sourceOptions = ErdcKit.deepClone(this.sourceOptions) || [];

                    // 属性下拉 平铺成list 获取当前选中对象
                    if (this.treeSelect) {
                        const treeTransList = (tree, key) => {
                            return tree
                                .reduce(function fn(prev, item) {
                                    prev.push(item);
                                    if (item[key]?.length) {
                                        item[key].reduce(fn, prev);
                                    }
                                    return prev;
                                }, [])
                                .map(function (item) {
                                    if (!item.value) {
                                        item.value = item.oid;
                                    }
                                    delete item[key];
                                    return item;
                                });
                        };
                        sourceOptions = treeTransList(sourceOptions, 'children');
                    }
                    selected = sourceOptions.filter((ite) => tempVals.includes(ite[this.valueKey]));
                    joinLabel = selected.map((item) => item[this.labelKey]).join(',');
                }
                selected = this.isMultiple ? selected : selected?.[0] || null;
                joinLabel = this.isMultiple ? joinLabel : selected?.[this.labelKey] || null;

                // 设置全选按钮状态
                if (this.isMultiple) {
                    if (selected.length === this.sourceOptions.length) {
                        this.isIndeterminate = false;
                        this.checkAll = true;
                    } else {
                        this.isIndeterminate = selected.length > 0;
                        this.checkAll = false;
                    }
                }
                if (!_.isEqual(vals, this.value)) {
                    this.$emit('input', vals, selected);
                    this.$emit('change', vals, selected);
                    this.$emit('callback', {
                        value: vals,
                        label: joinLabel,
                        selected,
                        field: this.row?.field
                    });
                }
            },
            value: {
                immediate: true,
                handler(value) {
                    if (!_.isEqual(value, this.innerValue)) {
                        this.innerValue = ErdcKit.deepClone(value);
                    }
                    if (this.isMultiple) this.setCheckAllStatus(value, this.options);
                }
            },
            options: {
                deep: true,
                immediate: true,
                handler(options, oldOptions) {
                    if (this.defaultSelectFirst && [undefined, ''].includes(this.innerValue) && options.length) {
                        this.innerValue = this.multiple ? [options[0][this.valueKey]] : options[0][this.valueKey];
                    }
                    // 单选时，如果有禁用项时的对应选项增加disabled
                    if (this.disabledArray.length && !this.isMultiple) {
                        options.forEach((item) => {
                            if (this.disabledArray.includes(item.oid)) {
                                item.disabled = true;
                            }
                        });
                    }
                    if (this.isMultiple) {
                        this.setCheckAllStatus(this.innerValue, options);
                    }
                    this.setOptionTooltip();

                    this.$emit('options-change', options, oldOptions);
                }
            },
            isMultiple(isMultiple) {
                this.innerValue = isMultiple ? [] : null;
                if (this.treeSelect) {
                    this.hideTreeSelect = true;
                    this.$nextTick(() => {
                        this.hideTreeSelect = false;
                    });
                }
            }
        },
        methods: {
            // 下拉框弹出时，设置弹框的宽度
            setOptionWidth($select) {
                this.selectOptionWidth = $select.offsetWidth + 'px';
                this.$nextTick(() => {
                    this.$refs?.['custom-select']?.updatePopper();
                });
            },
            handleMouseOver($el, dom, callback, event) {
                const $target = event.currentTarget.querySelector('.fam-custom-select-option span');
                if ($target) {
                    const width = $target.clientWidth || $target.offsetWidth;
                    callback(width >= $el.clientWidth - 24);
                } else {
                    callback(false);
                }
            },
            setCheckAllStatus(selected, options) {
                if (Array.isArray(selected)) {
                    if (selected.length === options.length && options.length) {
                        this.isIndeterminate = false;
                        this.checkAll = true;
                    } else {
                        this.isIndeterminate = selected.length > 0;
                        this.checkAll = false;
                    }
                } else {
                    this.isIndeterminate = false;
                    this.checkAll = false;
                }
            },
            setOptionTooltip() {
                if (!this.tooltip) {
                    return;
                }
                if (this.$refs.options && this.$refs.tooltip) {
                    this.$nextTick(() => {
                        _.each(this.options, (item) => {
                            const idx = _.findIndex(
                                this.$refs.options,
                                ($item) => $item[this.valueKey] === item[this.valueKey]
                            );
                            const $ref = this.$refs.options[idx];
                            if ($ref) {
                                let showTooltip = $ref.$el.scrollWidth <= $ref.$el.parentElement.scrollWidth;
                                this.$set(this.disabledTooltip, idx, showTooltip);
                            }
                        });
                    });
                }
            },
            onVisibleChange(visible) {
                if (visible) {
                    this.setOptionTooltip(this.options);
                    this.$nextTick(() => {
                        this.setOptionWidth(this.$el.querySelector('.el-select'));
                    });
                } else {
                    const defaultOption = this.sourceOptions;
                    this.options = defaultOption;
                }
                this.$emit('visible-change', visible);
            },
            searchDone(value) {
                utils.debounceFn(() => {
                    const defaultOption = this.sourceOptions;
                    this.options = defaultOption.filter((item) => {
                        if (
                            (item[this.labelKey] && item[this.labelKey].includes(value)) ||
                            (item.appName && item.appName === value)
                        ) {
                            return item;
                        }
                    });
                    if (!value) {
                        this.options = defaultOption;
                    }
                    // this.getRoleData(value)
                }, 300);
            },
            focus() {
                this.$refs['custom-select']?.focus();
            },
            handelCheckAll(val) {
                if (val) {
                    this.innerValue = this.options.map((item) => item[this.valueKey]);
                } else {
                    this.innerValue = [];
                }
            },
            handleRemoveTag(removeRowOid) {
                const selected = this.options.map((item) => item[this.valueKey]);
                this.$emit('remove-tag', removeRowOid, selected);
            },
            handleBlur(...args) {
                this.dispatch('el-form-item', 'el.form.blur', this.innerValue);
                this.$emit('blur', ...args);
            }
        }
    };
});
