/**
 * @module FamDynamicForm
 * @description 动态表单组件
 * @author 邱展悦
 * @example 参考fam_demo/dynamic-form/index.html
 */

/**
 * @typedef {Object} FormConfigItem
 * @description data参数的每一项配置
 * @property {string} field - 表单字段名
 * @property {string} component - 字段编辑时渲染的组件
 * @property {string} readonlyComponent - 字段只读模式时的组件
 * @property {Object: { readonly: string, component: string, label: string, tooltip: string }} slots - 自定义渲染时slot的映射关系
 * @property {string} label - 字段Label
 * @property { value: object } nameI18nJson - 国际化配置
 * @property {boolean} disabled - 是否禁止输入
 * @property {boolean} readonly - 是否只读模式
 * @property {string} tooltip - 帮助语
 * @property {boolean} required - 是否必填
 * @property {Array<Object>} validators - 自定义校验规则，参考https://github.com/yiminghe/async-validator
 * @property {boolean} hidden - 是否隐藏
 * @property {(value) => string | RegExp | string} limits - 输入限制,输入框保留function返回结果或者replace之后的结果
 * @property {string} class - 自定义class
 * @property {Object} props - 回传给component的额外参数
 * @property {Object} listeners - 自定义监听component的事件
 * @property {any} defaultValue - 默认值
 * @property {number} col - 宽度
 */

/**
 * @typedef DynamicFormProps
 * @property {Object} form - 表单数据，支持.sync修饰符
 * @property {Array<FormConfigItem>} data - 表单配置
 * @property {'right'|'left'|'top'} [labelPosition='right'] - 表单Label位置
 * @property {string} labelWidth - 自定义的label宽度
 * @property {'large'|'medium'|'small'|'mini'} [size='medium'] - 表单组件大小
 * @property {Object} validators - 参考ElementForm validators
 * @property {boolean} readonly - 是否只读模式
 * @property {boolean} hideErrorMessage - 是否隐藏错误信息
 * @property {boolean} validateOnRuleChange - 是否在校验规则改变后立即触发一次验证
 * @property {Array} editableAttr - 需要序列化返回的字段（data中传的非 readonly 或 disabled 数据可以不传）
 * @property {String} oid - 获取表单数据的oid
 */

/**
 * @component FamDynamicForm
 * @description FAM动态表单
 *
 * @props {DynamicFormProps} - 表单参数
 *
 * @method submit: (callback?: (form: Object) => void) => Promise<form: Object> - 校验&获取数据
 * @method validate: (valid: boolean) => Promise<valid: boolean> - 校验全表单
 * @method validateField: (props: array | string, callback?: (valid: boolean, errorMessage?: string) => void) => Promise<valid: boolean> - 校验部分字段
 * @method serialize: (payload: object, attrName: string) => Array<{ [attrName]: string, value: any }> - 组装表单数据为后端要的格式
 * @method serializeEditableAttr: (payload: object, attrName: string) => Array<{ [attrName]: string, value: any }> - 默认根据传入的data数据中非readonly或非disabled的属性组装表单数据为后端要的格式，可以根据 editableAttr 传入特殊需要返回的属性数据
 *
 * @events TODO
 *
 */

define([
    'text!' + ELMP.resource('erdc-components/FamDynamicForm/template.html'),
    ELMP.resource('erdc-components/FamDynamicForm/FormWidget.js'),
    ELMP.resource('erdc-components/FamDynamicForm/DeepFieldVisitorMixin.js'),
    ELMP.resource('erdc-components/FamDynamicForm/locale/index.js'),
    'fam:store',
    'css!' + ELMP.resource('erdc-components/FamDynamicForm/style.css'),
    'underscore',
    'fam:kit'
], function (template, FormWidget, DeepFieldVisitorMixin) {
    const _ = require('underscore');
    const store = require('fam:store');
    const FamKit = require('fam:kit');
    const TreeUtil = FamKit.TreeUtil;

    // 允许滚动条位置跳转
    let canScrollIntoView = true;

    const getValidator = (_rule, field, formConfig, vm) => {
        let validator = null;

        let rule = FamKit.deepClone(_rule);
        // 避免回环引用导致Vue报错
        rule._formConfig = _.extend({}, formConfig, { validators: [] });
        rule._utils = {
            translateFormLabel: vm.translateFormLabel
        };

        let getRegValidator = (regExp) => (rule, value, callback) => {
            if (regExp.test(value)) {
                callback();
            } else {
                callback(new Error(rule.message || `${field}字段校验不通过`));
            }
        };

        let getFunctionValidator = (functor) => (rule, value, callback) => {
            const promise = functor(rule, value, callback);
            if (promise instanceof Promise) {
                promise
                    .then(() => {
                        callback();
                    })
                    .catch(callback);
            }
        };

        if (rule.validator) {
            let regExp = null;
            if (_.isString(rule.validator)) {
                regExp = new RegExp(rule.validator);
            } else if (rule.validator && rule.validator instanceof RegExp) {
                regExp = rule.validator;
            }
            if (regExp) {
                validator = getRegValidator(regExp);
            } else if (_.isFunction(rule.validator)) {
                validator = getFunctionValidator(rule.validator);
            }
        }

        if (rule.type && store.state.component && store.state.component.validators[rule.type]) {
            validator = (_rule, ...args) => {
                return store.state.component.validators[rule.type].validator(rule, ...args);
            };
        }

        return validator;
    };

    return {
        name: 'FamDynamicForm',
        template,
        mixins: [DeepFieldVisitorMixin],
        components: {
            DynamicFormPlaceholder: FamKit.asyncComponent(
                ELMP.resource('erdc-components/FamDynamicForm/accessory/FamDynamicFormPlaceholder/index.js')
            ),
            FormWidget
        },
        props: {
            data: Array,
            form: {
                type: Object,
                default() {
                    return {};
                }
            },
            formDisabled: {
                type: Boolean,
                default: false
            },
            labelWidth: String,
            labelPosition: {
                type: String,
                validator(val) {
                    return _.includes(['right', 'left', 'top'], val);
                },
                default: 'right'
            },
            size: {
                type: String,
                validator(val) {
                    return _.includes(['large', 'medium', 'small', 'mini'], val);
                },
                default: 'medium'
            },
            validators: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean,
            hideErrorMessage: Boolean,
            validateOnRuleChange: Boolean,
            editableAttr: Array,
            designer: Object,
            formReadonly: Boolean,
            disableValidate: Boolean,
            widgetList: Array,
            schemaMapper: {
                type: Object,
                default() {
                    return {};
                }
            },
            eachSchema: Function,
            scopedSlots: Object,
            vm: {
                type: Object,
                default() {
                    return null;
                }
            },
            oid: String,
            appName: String
        },
        provide() {
            return {
                scopedSlots: this.selfScopedSlots
            };
        },
        data() {
            return {
                validateMsg: {},
                validateFields: {},
                originData: undefined,
                changed: false,
                currentInvalidField: null,
                focusingField: null,
                validateData: {},
                hasEdit: false,
                // 当前错误提示元素
                currentTarget: null,
                currentTargetCache: {},
                currentTargetErrorMassage: true
            };
        },
        computed: {
            formData: {
                get() {
                    return this.form;
                },
                set(value) {
                    Object.keys(value).forEach((key) => {
                        this.setFieldValue(value, key, value[key]);
                    });
                    this.$emit('update:form', value);
                }
            },
            rules() {
                const that = this;
                const fieldValidators = _.reduce(
                    this.flattenWidgetList.map((widget) => widget.schema),
                    (prev, item) => {
                        if (!item.hidden && (item.required || (item.validators && item.validators.length))) {
                            item.validators = item.validators || [];
                            // 重新定制必填校验
                            const requiredValidatorMapping = store.state.component.requiredValidatorMapping;
                            if (
                                item.required &&
                                !_.some(item.validators, (i) => {
                                    return i.required /*&& i._formConfig?.field === item.field*/;
                                })
                            ) {
                                const componentName = FamKit.pascalize(item.component);
                                if (requiredValidatorMapping[componentName]) {
                                    item.validators = [
                                        ...item.validators,
                                        store.state.component.validators[requiredValidatorMapping[componentName]]
                                    ];
                                } else if (
                                    !that.validators[item.field] ||
                                    _.every(that.validators[item.field], (v) => {
                                        return !v.required;
                                    })
                                ) {
                                    const inputComponents = [
                                        'ErdInput',
                                        'FamI18nbasics',
                                        'ErdQuillEditor',
                                        'FamQuillEditor',
                                        'ErdInputNumber',
                                        'FamUnitNumber',
                                        'FamLink'
                                    ];
                                    const trigger = inputComponents.find((component) =>
                                        FamKit.isSameComponentName(component, componentName)
                                    )
                                        ? ['blur', 'input']
                                        : ['input', 'change'];
                                    item.validators.push({
                                        required: true,
                                        message: `${that.i18n.pleaseEnterTips}${item.label}`,
                                        trigger: trigger,
                                        validator(rule, value, callback) {
                                            if (!item.required) {
                                                return callback();
                                            }
                                            if (_.includes([null, undefined], value)) {
                                                callback(new Error(rule.message));
                                            } else if (_.isString(value) && !value.trim()) {
                                                callback(new Error(rule.message));
                                            } else if (Array.isArray(value) && value.length === 0) {
                                                callback(new Error(rule.message));
                                            } else {
                                                callback();
                                            }
                                        }
                                    });
                                }
                            }
                            prev[item.field] = _.map(item.validators, (validator) => ({
                                ...validator,
                                trigger: validator.trigger,
                                message: validator.message,
                                validator: getValidator(validator, item.field, item, that) || undefined
                            }));
                        }
                        return prev;
                    },
                    {}
                );
                const outerValidators = _.clone(this.validators);
                // 合并validators
                _.each(outerValidators, (validators, field) => {
                    if (!fieldValidators[field]) {
                        fieldValidators[field] = validators;
                        delete outerValidators[field];
                    }
                });
                const validators = _.reduce(
                    fieldValidators,
                    (prev, validators, field) => {
                        let _validators = validators;
                        if (outerValidators && outerValidators[field]) {
                            _validators = _.compact([...validators, ...outerValidators[field]]);
                        }
                        prev[field] = _validators;
                        return prev;
                    },
                    {}
                );
                if (this.readonly) {
                    return {};
                }
                return _.reduce(
                    validators,
                    (prev, validator, field) => {
                        const widget = _.find(this.flattenWidgetList, (widget) => widget.schema?.field === field);
                        const readonly = widget?.readonly;
                        if (!readonly) {
                            prev[field] = validator;
                        }
                        return prev;
                    },
                    {}
                );
            },
            erdInputWidget() {
                return store.getters['component/getWidgetByKey']('erd-input');
            },
            innerWidgetList() {
                // 优先使用外部传入的 WidgetList，否则按照 data 配置项自行生成
                const widgetList = this.widgetList || this.wrapSchema(this.data) || [];
                return widgetList.map((widget) => this.mapWidget(widget));
            },
            flattenWidgetList() {
                return TreeUtil.flattenTree2Array(this.innerWidgetList, { childrenField: 'widgetList' });
            },
            selfScopedSlots() {
                return _.isEmpty(this.scopedSlots) ? this.$scopedSlots : this.scopedSlots;
            },
            innerHideErrorMessage: {
                get() {
                    return this.hideErrorMessage;
                },
                set(value) {
                    this.$emit('update:hideErrorMessage', value);
                }
            },
            hasError() {
                return !!this.currentInvalidField;
            },
            autoFocusField() {
                return this.flattenWidgetList?.find((widget) => widget?.schema?.props?.autofocus)?.schema?.field;
            }
        },
        watch: {
            form(form = {}) {
                this.formData = form;
            },
            formData: {
                deep: true,
                immediate: true,
                handler(formData) {
                    if (this.originData === undefined) {
                        this.originData = formData;
                        this.unwatchOriginData = this.$watch('originData', {
                            deep: true,
                            handler: function () {
                                this.changed = true;
                            }
                        });
                    } else {
                        this.$emit('form-change', true);
                        this.unwatchOriginData && this.unwatchOriginData();
                    }
                }
            },
            changed(changed) {
                this.$emit('form-change', changed);
            },
            focusingField() {
                this.$nextTick(() => {
                    this.currentInvalidField = this.getCurrentInvalidField();
                    this.$forceUpdate();
                });
            },
            innerWidgetList(val) {
                if (val?.length) {
                    this.$nextTick(() => {
                        this.setPanelPadding();
                    });
                }
            }
        },
        mounted() {
            const _this = this;
            this.hasEditFn = function () {
                _this.hasEdit = true;
                _this.$el.removeEventListener('mousedown', this.hasEditFn);
                _this.$el.removeEventListener('keydown', this.hasEditFn);
            };
            this.$el.addEventListener('mousedown', this.hasEditFn);
            this.$el.addEventListener('keydown', this.hasEditFn);
            window.addEventListener('scroll', this.showErrorMessage, true);
        },
        beforeDestroy() {
            this.$el.removeEventListener('mousedown', this.hasEditFn);
            this.$el.removeEventListener('keydown', this.hasEditFn);
            window.removeEventListener('scroll', this.showErrorMessage, true);
            this.unwatchOriginData && this.unwatchOriginData();
            this.unwatchOriginData = null;
            this.observer && this.observer.disconnect();
            this.observer = null;
        },
        methods: {
            setPanelPadding() {
                const contractionPanels = document.querySelectorAll('.ContractionPanel');
                contractionPanels.forEach((item) => {
                    const closestParent = item.closest('.classification-content');
                    if (closestParent) {
                        const closestParentPanel = closestParent.previousElementSibling;
                        if (closestParentPanel) {
                            item.style.paddingLeft = parseInt(closestParentPanel.style.paddingLeft || 0) + 16 + 'px';
                        }
                    }
                });
            },
            lastLineChildClass(innerWidgetList = []) {
                let className = '';
                const formConfig = innerWidgetList.map((widget) => widget.schema) || [];
                const lastChild = formConfig.findLast((item) => !item.hidden);
                /**
                 * 如果最后一个元素是24， 独占一行就最后一个元素不要margin-bottom
                 * 如果不是就逐个循环遍历，如果下一行是24， 和为0，如果最后一个不为24，col相加，判断>=24, 就减去24，
                 * 最终判断sum的值，如果是0， 那就是最后一行两个元素，如果不为0 ，就最后一行一个元素
                 */
                // 如果不是
                if (lastChild) {
                    if (lastChild.col === 24) {
                        className = 'last-line-no-bottom';
                    } else {
                        let sum = 0;
                        for (let i = 0; i < formConfig.length; i++) {
                            const item = formConfig[i];
                            const nextItem = formConfig[i + 1];
                            if (nextItem && nextItem.col === 24) {
                                sum = 0;
                            } else {
                                sum += item.col;
                                if (sum >= 24) {
                                    sum -= 24;
                                }
                            }
                        }
                        if (sum === 0) {
                            className = 'last-line-two-col-no-bottom';
                        } else {
                            className = 'last-line-no-bottom';
                        }
                    }
                }
                return className;
            },
            clearValidate() {
                this.validateMsg = {};
                this.$refs.form.clearValidate();
            },
            wrapSchema(data) {
                return data.map((schema) => {
                    const component = schema.component || 'erd-input';
                    const widget = _.clone(store.getters['component/getWidgetByKey'](component)) || {
                        schema: schema
                    };
                    widget.schema = schema;
                    widget.readonly = widget.schema.readonly || this.readonly;
                    widget.hidden = widget.schema.hidden;

                    if (schema.children) {
                        widget.container = true;
                        widget.widgetList = this.wrapSchema(schema.children);
                    }

                    return widget;
                });
            },
            translateFormLabel(item) {
                return FamKit.translateI18n(item.nameI18nJson) || item.label;
            },
            getSlot(item, slotName) {
                const slots = item.slots || {};
                return slots[slotName] || slotName;
            },
            onValidate(field, valid, message) {
                const that = this;
                that.$set(that.validateFields, field, valid);
                that.$set(that.validateMsg, field, message || '');
                setTimeout(() => {
                    that.currentInvalidField = that.getCurrentInvalidField();
                    that.$forceUpdate();
                }, 0);
                that.validateData = {
                    field: field,
                    valid: valid,
                    message: message || ''
                };
                if (!this.hasEdit) {
                    this.innerHideErrorMessage = true;
                    this.$refs.form.clearValidate();
                }
                this.$emit('validate', field, valid, message);
            },
            validate(callback) {
                this.currentTargetErrorMassage = true;
                return new Promise((resolve, reject) => {
                    this.$refs.form.validate(function (valid, validatorData) {
                        if (valid) {
                            resolve(valid);
                        } else {
                            reject(validatorData);
                        }
                        callback && callback(valid, validatorData);
                    });
                });
            },
            validateField(props, callback) {
                return new Promise((resolve, reject) => {
                    this.$refs.form.validateField(props, function (valid, validatorData) {
                        if (valid) {
                            resolve(valid);
                        } else {
                            reject(valid, validatorData);
                        }
                        callback && callback(valid);
                    });
                });
            },
            submit(callback) {
                return new Promise((resolve, reject) => {
                    this.validate()
                        .then((valid) => {
                            const data = {
                                valid,
                                data: this.formData
                            };
                            if (valid) {
                                resolve(data);
                            } else {
                                reject(data);
                            }
                            callback && callback(data);
                        })
                        .catch((e) => {
                            if (canScrollIntoView) {
                                canScrollIntoView = false;
                                this.$nextTick(() => {
                                    if (this.currentTarget) {
                                        this.currentTarget.scrollIntoView({ behavior: 'smooth' });
                                    } else {
                                        this.$el.scrollIntoView({ behavior: 'smooth' });
                                    }
                                    setTimeout(() => {
                                        canScrollIntoView = true;
                                    }, 500);
                                });
                            }

                            const data = {
                                valid: false,
                                data: this.formData,
                                message: e.message
                            };
                            reject(data);
                            callback && callback(data);
                        });
                });
            },
            serializeEditableAttr(payload, attrName = 'attrName', isTransI18n = false) {
                let changeAttr = this.flattenWidgetList
                    .map((widget) => {
                        if (widget.schema.readonly || widget.schema.disabled) {
                            return '';
                        } else {
                            return widget.schema.field;
                        }
                    })
                    .filter((item) => item);
                changeAttr = _.union(changeAttr, this.editableAttr);

                const i18nAttr = this.flattenWidgetList
                    .filter((widget) => {
                        return widget.schema.component === 'FamI18nbasics';
                    })
                    .map((widget) => {
                        return widget.schema.field;
                    });

                const memberAttr = this.flattenWidgetList
                    .filter((widget) => {
                        return widget.schema.component === 'FamParticipantSelect';
                    })
                    .map((widget) => {
                        return widget.schema.field;
                    });
                const arrayTransStringAttr = this.flattenWidgetList
                    .filter((widget) => {
                        return FamKit.isSameComponentName(widget.schema.component, 'CustomSelect');
                    })
                    .map((widget) => {
                        return widget.schema.field;
                    });
                const serializeAttr = _.keys(_.extend(this.formData, payload)).filter((item) =>
                    changeAttr.includes(item)
                );
                let serializeObj = {};
                serializeAttr.forEach((item) => {
                    serializeObj[item] = _.extend(this.formData, payload)[item];
                    if (_.isUndefined(serializeObj[item])) {
                        serializeObj[item] = '';
                    }
                });
                return _.chain(serializeObj)
                    .map((value, key) => {
                        if (isTransI18n && i18nAttr.includes(key)) {
                            return {
                                [attrName]: key,
                                value: value?.value
                            };
                        }
                        if (memberAttr.includes(key)) {
                            return {
                                [attrName]: key,
                                value: Array.isArray(value?.value)
                                    ? value?.value?.join(',')
                                    : Object.prototype.toString.call(value) === '[object Object]'
                                      ? value?.value || ''
                                      : Array.isArray(value)
                                        ? value?.join(',')
                                        : value || ''
                            };
                        }
                        if (arrayTransStringAttr.includes(key)) {
                            return {
                                [attrName]: key,
                                value: Array.isArray(value) ? value?.join(',') : value
                            }
                        }
                        return {
                            [attrName]: key,
                            value
                        };
                    })
                    .filter((item) => {
                        return !_.some(
                            this.flattenWidgetList,
                            (widget) => widget.schema?.props?.echoField === item[attrName]
                        );
                    })
                    .compact()
                    .value();
            },
            serialize(payload, attrName = 'attrName') {
                const serializeObj = _.extend(this.formData, payload);
                const memberAttr = this.flattenWidgetList
                    .filter((widget) => {
                        return widget.schema.component === 'FamParticipantSelect';
                    })
                    .map((widget) => {
                        return widget.schema.field;
                    });
                return _.chain(serializeObj)
                    .map((value, key) => {
                        if (memberAttr.includes(key)) {
                            return {
                                [attrName]: key,
                                value: Array.isArray(value?.value) ? value?.value?.join(',') : value?.value || ''
                            };
                        }
                        return {
                            [attrName]: key,
                            value
                        };
                    })
                    .filter((item) => {
                        return !_.some(
                            this.flattenWidgetList,
                            (widget) => widget.schema?.props?.echoField === item[attrName]
                        );
                    })
                    .compact()
                    .value();
            },
            emitFieldEvent(eventName, field, $event) {
                if (eventName === 'input') {
                    this.onFieldInput(field, $event);
                }
                if (field.listeners && typeof field.listeners[field.field] === 'function') {
                    field.listeners[field.field]($event);
                }
                if (eventName === 'focus') {
                    this.focusingField = field.field;
                    this.currentTargetCache[field.field] = $event?.currentTarget || null;
                    this.currentTarget = this.currentTargetCache[this.currentInvalidField];
                }
                if (eventName === 'blur') {
                    this.currentTarget = this.currentTargetCache[this.currentInvalidField];
                }
                this.$emit(`field:${eventName}`, field, this.getFieldValue(field.field), $event);
                this.currentTargetErrorMassage = true;
            },
            getCurrentInvalidField() {
                const keys = this.getCurrentInvalidFields();
                if (keys.length) {
                    if (
                        keys.includes(this.focusingField) &&
                        this.flattenWidgetList.some((widget) => widget.schema.field === this.focusingField)
                    ) {
                        return this.focusingField;
                    }
                    return _.find(this.flattenWidgetList, (widget) => _.includes(keys, widget.schema.field))?.schema
                        ?.field;
                }
                return null;
            },
            getCurrentInvalidFields() {
                return _.chain(this.validateFields)
                    .reduce((prev, valid, field) => {
                        valid === false && prev.push(field);
                        return prev;
                    }, [])
                    .value();
            },
            onFieldInput(fieldConfig, value) {
                const limits = fieldConfig.limits;
                let fieldValue = value;

                if (fieldValue !== undefined && limits) {
                    if (typeof limits === 'function') {
                        fieldValue = limits(fieldValue, fieldConfig, this.formData);
                    } else if (_.isRegExp(limits)) {
                        fieldValue = fieldValue.replace(limits, '') || '';
                    }
                }

                this.setFieldValue(fieldConfig.field, fieldValue);
            },
            readonlyComponent(componentName) {
                if (typeof componentName === 'string') {
                    return this.$store.getters['component/readonlyComponent'](componentName);
                }
                return componentName;
            },
            mapWidget(widget) {
                this.validateMsg[widget.schema.field] = '';
                this.currentInvalidField = null;
                this.validateFields[widget.schema.field] = true;

                if (/\./g.test(widget.schema.field)) {
                    this.setFieldValue(widget.schema.field, this.getFieldValue(widget.schema.field));
                }
                /**
                 * this.setFieldValue(widget.schema.field, undefined); 这行代码将 aaa.bbb属性已经赋值为undefined，且对象aaa的bbb属性也为undefined
                 * 下面if判断的时候，用defaultValue（来源于接口返回的配置默认值）判断，因为已经设置为undefined ，所以 getFieldValue 返回的值为undefined
                 * 如果defaultValue没有设置默认值， 就不会进行赋值操作
                 */
                // 如果默认值不等于空并且model值为空，则赋默认值
                if (widget.schema.defaultValue !== undefined && this.getFieldValue(widget.schema.field) === undefined) {
                    this.setFieldValue(widget.schema.field, widget.schema.defaultValue);
                }

                if (widget.widgetList?.length) {
                    widget.widgetList = widget.widgetList.map((widget) => this.mapWidget(widget));
                }

                _.forEach(widget.mappers, (mapFunc) => {
                    if (typeof mapFunc === 'function') {
                        return (
                            mapFunc({
                                widget,
                                formData: this.formData,
                                oid: this.oid,
                                vm: this.vm
                            }) || widget
                        );
                    }
                });
                return widget;
            },
            useComponent(ref) {
                if (!ref) {
                    return this;
                }

                const $formWidget = TreeUtil.getNode(this.$children, {
                    childrenField: '$children',
                    target(vm) {
                        return (
                            vm.$options &&
                            FamKit.isSameComponentName(vm.$options._componentTag, 'FormWidget') &&
                            vm.schema &&
                            vm.widget &&
                            !vm.widget.container &&
                            vm.schema.ref === ref
                        );
                    }
                });

                if ($formWidget) {
                    return $formWidget.useComponent();
                } else {
                    return this;
                }
            },
            showErrorMessage() {
                const _this = this;
                const options = {
                    root: null, // 使用视窗作为根元素
                    threshold: 1.0 // 完全进入视窗时触发回调
                };

                this.observer && this.observer.disconnect();

                this.observer = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        _this.currentTargetErrorMassage = entry.isIntersecting;
                    });
                }, options);

                if (this.currentTarget) {
                    this.observer.observe(this.currentTarget);
                } else {
                    this.currentTargetErrorMassage = false;
                }
            },
            handleComponentMounted(field, component) {
                if (field === this.autoFocusField && typeof component?.focus === 'function') {
                    component.focus();
                }
            }
        }
    };
});
