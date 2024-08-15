/**
 * 表单布局渲染器
 */
define([
    'vue',
    'fam:kit',
    'fam:http',
    'fam:store',
    'underscore',
    ELMP.resource('erdc-components/FamFormDesigner/containers/index.js'),
    ELMP.resource('erdc-app/api/common.js'),
    ELMP.resource('erdc-components/FamFormDesigner/CustomizeConfigurationMixin.js'),
    'css!' + ELMP.resource('erdc-components/FamAdvancedForm/style.css')
], function (Vue, FamKit, axios, store, _, DynamicFormContainer, commonApi, CustomizeConfigurationMixin) {
    const TreeUtil = FamKit.TreeUtil;

    const cachedFormData = {};

    const util = {
        fetchLayoutByType({ layoutType, className, containerRef, objectOid, attrRawList, typeReference, name }) {
            let params = {
                layoutType,
                className
            };

            // 模板管理需加传 name属性
            if (name) {
                params.name = name;
            }

            if (layoutType === 'CREATE') {
                // 获取新增布局时，容器oid必传，否则后台自动取组织容器oid
                if (containerRef) {
                    params.containerRef = containerRef;
                }

                // 创建产品时需要传
                if (className.includes('example.entity.Product')) {
                    if (typeReference) {
                        params.typeReference = typeReference;
                    }
                }
            } else {
                if (objectOid) {
                    params.oid = objectOid;
                }
            }
            if (attrRawList) {
                params.attrRawList = attrRawList;
            }

            return axios.post('/fam/type/layout/getLayoutByType', params);
        },
        deserializeWidgetList(layout, every = (a) => a) {
            const widgets = store.state.component.widgets;
            const layoutAttrList = layout.layoutAttrList || [];
            const widgetList = _.chain(layoutAttrList)
                .map((attr) => {
                    let componentJson = {};
                    try {
                        if (typeof attr.componentJson === 'object') {
                            componentJson = FamKit.deepClone(attr.componentJson);
                        }
                        componentJson = JSON.parse(attr.componentJson);
                        // 采用前端代码指定的校验
                        delete componentJson.schema.validators;
                    } catch (e) {
                        // do nothing
                    }
                    let tempAttr = _.extend({}, attr, {
                        componentJson
                    });

                    tempAttr.componentJson.schema = _.extend({}, tempAttr.componentJson.schema, {
                        disabled: attr.disabled ?? tempAttr.componentJson.disabled ?? false,
                        hidden: attr.hidden ?? tempAttr.componentJson.hidden ?? false,
                        readonly: attr.readonly ?? tempAttr.componentJson.readonly ?? false
                    });

                    const widgetDescription = _.find(widgets, { key: tempAttr.componentJson.key }) || {};
                    const aliasWidget =
                        _.find(
                            widgets,
                            (widget) =>
                                widget.schema?.alias &&
                                FamKit.isSameComponentName(widget.schema.alias, tempAttr.componentJson.key)
                        );

                    return _.extend({}, widgetDescription, tempAttr.componentJson, {
                        schema: {
                            ...widgetDescription.schema,
                            ...(aliasWidget?.schema || {}),
                            ...tempAttr.componentJson.schema,
                            component:
                                aliasWidget?.schema?.component ||
                                tempAttr.componentJson?.schema?.component ||
                                widgetDescription.schema?.component
                        }
                    });
                })
                .map((widget) => {
                    return every(widget);
                })
                .compact()
                .value();
            return TreeUtil.buildTree(widgetList, {
                parentField: 'parentWidget',
                childrenField: 'widgetList'
            });
        }
    };

    DynamicFormContainer.init();

    return {
        name: 'FamAdvancedForm',
        componentName: 'FamAdvancedForm',
        mixins: [CustomizeConfigurationMixin],
        template: `
            <div id="fam-advanced-form" class="fam-advanced-form">
                <FamDynamicForm
                    ref="dynamicForm"
                    v-loading="loading"
                    :form.sync="form"
                    :widget-list="trueWidgetList"
                    :validators="validators"
                    :editable-attr="editableAttr"
                    :readonly="readonly"
                    :scoped-slots="scopedSlots"
                    :schema-mapper="schemaMapper"
                    :eachSchema="eachSchema"
                    :label-width="labelWidth"
                    :hideErrorMessage="hideErrorMessage"
                    :vm="vm"
                    :variables="variables"
                    :oid="oid"
                    :appName="innerAppName"
                    @form-change="onFormChange"
                    @field:change="onFieldChange"
                    @field:focus="onFieldFocus"
                    @field:input="onFieldInput"
                    @validate="onValidate"
                    v-on="$listeners"
                >
                    <template
                        v-for="(slot, slotName) in $scopedSlots"
                        v-slot:[slotName]="slotProps"
                    >
                        <slot :name="slotName" v-bind="slotProps"></slot>
                    </template>
                </FamDynamicForm>
            </div>
        `,
        props: {
            /**
             * 所属业务对象，可以是长名也可以是短名
             */
            className: {
                type: String,
                required: true
            },
            /**
             * 外界使用 serializeEditableAttr 获取表单数据时, 传入的额外获取字段
             */
            editableAttr: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            /**
             * 布局类型
             */
            formType: {
                type: String
            },
            widgetList: {
                type: Array,
                default() {
                    return null;
                }
            },
            /**
             * 表单值，支持sync修饰符
             */
            model: {
                type: Object,
                default() {
                    return {};
                }
            },
            /**
             * 遍历处理每一个widget
             */
            resolveWidget: Function,
            schemaMapper: {
                type: Object,
                default() {
                    return {};
                }
            },
            /**
             * 外部校验规则
             */
            validators: {
                type: Object,
                default() {
                    return {};
                }
            },
            queryLayoutParams: {
                type: Object,
                default() {
                    return {};
                }
            },
            typeReferenceInfo: {
                type: Object,
                default() {
                    return {};
                }
            },
            /**
             * 自定义label宽度
             */
            labelWidth: String,
            /**
             * 是否不展示错误信息
             */
            hideErrorMessage: Boolean,
            /**
             * 是否使用布局获取数据，详情数据oid
             */
            oid: {
                type: String,
                default: ''
            },
            objectOid: {
                type: String,
                default: ''
            },
            typeOid: {
                type: String,
                default: ''
            },
            containerRef: {
                type: String,
                default: ''
            },
            modelMapper: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            vm: {
                type: Object,
                default() {
                    return null;
                }
            },
            /**
             * 是否使用分类标题，如果使用，必须要将分类属性传进来，否则无法使用
             */
            customField: {
                type: Object,
                default() {
                    return {};
                }
            },
            appName: String,
            // 自定义组装formData
            customAssemblyData: Function,
            beforeEcho: Function
        },
        data() {
            return {
                loading: false,
                layout: {},
                scopedSlots: {},
                innerWidgetList: [],
                classifyLayout: [],
                layoutWidgetList: null,
                firstEnter: true,
                sourceData: {}
            };
        },
        computed: {
            readonly() {
                return this.layout.type === 'DETAIL' || this.$attrs.readonly;
            },
            slotName() {
                return this.readonly ? 'readonly' : 'component';
            },
            form: {
                get() {
                    return this.model;
                },
                set(value) {
                    this.$emit('update:model', value);
                }
            },
            trueWidgetList: {
                get() {
                    return this.widgetList || this.innerWidgetList;
                },
                set(widgetList) {
                    this.innerWidgetList = widgetList;
                    this.$emit('update:widgetList', widgetList);
                }
            },
            layoutJson() {
                let layoutJson = this.layout.layoutJson || '{}';
                let layout = {};
                try {
                    layout = JSON.parse(layoutJson);
                } catch (error) {
                    throw new Error(error);
                }
                return layout;
            },
            listeners() {
                const functions = this.functions || {};
                return _.mapObject(this.layoutJson.listeners, (listener) => {
                    if (typeof listener === 'function') {
                        return listener;
                    }
                    return functions[listener];
                });
            },
            canLoadLayout() {
                return this.className && this.layoutType && this.className + this.layoutType + this.objectOid;
            },
            contextRef() {
                return this.form[this.customField?.field] || this.form['classifyReference'];
            },
            classifyField() {
                return this.customField?.field || 'classifyReference';
            },
            layoutName() {
                return this.customField?.layoutName || 'classifyLayoutDefinitionDto';
            },
            rawDataName() {
                return this.customField?.rawDataName || 'classifyRawData';
            },
            layoutType() {
                return this.formType || this.$attrs.formId || this.$attrs['form-id'];
            },
            typeReferenceObj() {
                return this.typeReferenceInfo;
            },
            innerAppName() {
                return this.appName || this.$store.getters.appNameByClassName(this.className);
            },
            canLoadAttrs() {
                return !_.isEmpty(this.sourceData) && _.isArray(this.trueWidgetList) && this.trueWidgetList.length;
            }
        },
        watch: {
            oid: {
                handler: function (oid) {
                    if (oid) {
                        this.fetchFormDataByOid(oid, this.typeOid);
                    }
                },
                immediate: true
            },
            canLoadAttrs: {
                handler: function (canLoadAttrs) {
                    if (canLoadAttrs) {
                        this.resolveResponseData({ data: this.sourceData });
                    }
                },
                immediate: true
            },
            canLoadLayout: {
                handler: function (canLoadLayout) {
                    if (canLoadLayout) {
                        this.loadLayoutByType(this.layoutType, this.className).then(() => {
                            this.handleFieldChange({ field: this.classifyField, isRequest: false });
                        });
                    }
                },
                immediate: true
            },
            contextRef() {
                this.handleFieldChange({ field: this.classifyField, isRequest: !this.firstEnter });
                this.firstEnter = false;
            }
        },
        mounted() {
            _.each(this.$scopedSlots, (slot, slotName) => {
                this.$set(this.scopedSlots, slotName, slot);
            });
        },
        beforeDestroy() {
            if (this.cachedFormDataTimer) {
                window.clearTimeout(this.cachedFormDataTimer);
                this.cachedFormDataTimer = null;
            }
        },
        methods: {
            /**
             * 根据表单布局内部名获取并显示表单布局
             * @param {string} layoutType
             * @param {string} className
             */
            loadLayoutByType(layoutType, className) {
                return new Promise((resolve, reject) => {
                    if (layoutType && className) {
                        const params = {
                            layoutType: layoutType,
                            className: store.getters.className(className),
                            containerRef: this.containerRef,
                            objectOid: this.objectOid,
                            ...this.queryLayoutParams
                        };
                        util.fetchLayoutByType(params)
                            .then((res) => {
                                if (res?.data?.layoutAttrList?.length) {
                                    this.$emit('layout-attribute', _.map(res.data.layoutAttrList, 'attrName'));
                                    res.data = this.setFieldSchema(res.data);
                                    this.renderLayout(res.data);
                                    resolve({
                                        layout: this.innerWidgetList,
                                        widgets: this.innerWidgetList
                                    });
                                } else {
                                    this.$message.error('无可用的布局，请确认已配置的布局规则是否满足');
                                }
                            })
                            .catch(reject);
                    } else {
                        reject(new Error('未指定 formType 与 className'));
                    }
                });
            },
            setFieldSchema(resData) {
                // 如果是分类属性, 增加禁用状态, 类型选择后增加接口联动
                for (let item of resData.layoutAttrList) {
                    if (['typeReference', 'classifyReference'].includes(item.attrName)) {
                        try {
                            let componentParseJson = JSON.parse(item.componentJson);
                            if (componentParseJson.schema?.props) {
                                if (item.attrName === 'typeReference') {
                                    componentParseJson.schema.listeners = {
                                        change: (val, selected) => {
                                            this.typeReferenceObj.appName = selected.appName;
                                            this.typeReferenceObj.rootType = selected.classifyCode;
                                        }
                                    };
                                }
                                if (componentParseJson.schema.props.row?.requestConfig) {
                                    if (item.attrName === 'classifyReference') {
                                        Object.assign(componentParseJson.schema.props.row.requestConfig.data, {
                                            appName: this.typeReferenceObj.appName,
                                            rootType:
                                                componentParseJson.schema.props.row.requestConfig.data?.rootType ||
                                                this.typeReferenceObj.rootType
                                        });
                                        componentParseJson.schema.props.row.requestConfig.transformResponse = [
                                            (data) => {
                                                const jsonData = JSON.parse(data);
                                                const recursiveFn = (data = []) => {
                                                    let level = 1;
                                                    data.forEach((item) => {
                                                        const isApplication =
                                                            item.idKey ===
                                                            'erd.cloud.foundation.tenant.entity.Application';
                                                        item.disabled = isApplication || !item.instantiable;
                                                        if (level === 1) {
                                                            delete item.parentId;
                                                        }
                                                        if (item.children?.length) {
                                                            level += 1;
                                                            recursiveFn(item.children);
                                                        }
                                                    });
                                                };
                                                recursiveFn(jsonData.data);
                                                return jsonData;
                                            }
                                        ];
                                    }
                                }
                                item.componentJson = componentParseJson;
                            }
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
                return resData;
            },
            /**
             * 根据表单布局详情显示表单布局
             * @param {Object} layout
             */
            renderLayout(layout = this.layout) {
                if (layout) {
                    this.layout = layout;
                    this.renderWidgetList(util.deserializeWidgetList(this.layout, this.resolveWidget));
                }
            },
            renderWidgetList(widgetList) {
                this.trueWidgetList = widgetList;
                this.$emit('widget-list-updated', this.trueWidgetList);
                this.$emit('field:getWidgetList', this.trueWidgetList);
            },
            /**
             * 校验&获取数据
             * (callback?: (form: Object) => void) => Promise<form: Object>
             */
            submit(...args) {
                const $form = this.$refs.dynamicForm;
                return $form.submit(...args);
            },
            /**
             * 组装表单数据为后端要的格式
             * (payload: object, attrName: string) => Array<{ [attrName]: string, value: any }>
             */
            serialize(...args) {
                const $form = this.$refs.dynamicForm;
                let serialize = $form.serialize(...args);
                if (this.classifyField && this.layoutWidgetList) {
                    const classifyAttrs = TreeUtil.flattenTree2Array(this.layoutWidgetList, {
                        childrenField: 'widgetList'
                    }).map((item) => item.schema?.field);
                    serialize = serialize.map((item) => {
                        let attr = item;
                        if (classifyAttrs.includes(item.attrName)) {
                            attr.category = 'CLASSIFY';
                        }
                        return attr;
                    });
                }
                return serialize;
            },
            serializeEditableAttr(...args) {
                const $form = this.$refs.dynamicForm;
                let serialize = $form.serializeEditableAttr(...args);
                if (this.classifyField && this.layoutWidgetList) {
                    const classifyAttrs = TreeUtil.flattenTree2Array(this.layoutWidgetList, {
                        childrenField: 'widgetList'
                    }).map((item) => item.schema?.field);
                    serialize = serialize.map((item) => {
                        let attr = item;
                        if (classifyAttrs.includes(item.attrName)) {
                            attr.category = 'CLASSIFY';
                        }
                        return attr;
                    });
                }
                return serialize;
            },
            onFieldFocus(field, value, $event) {
                this.handleCustomEvent('fieldFocus', field, value, $event);
                this.$emit('field:focus', field, value, $event);
                this.$emit('fieldFocus', field, value, $event);
            },
            onFieldChange(field, value, $event) {
                this.handleCustomEvent('fieldChange', field, value, $event);
                this.$emit('field:change', field, value, $event);
                this.$emit('fieldChange', field, value, $event);
                this.classifyField && this.handleFieldChange(field, value, $event);
            },
            onFieldInput(field, value, $event) {
                this.handleCustomEvent('fieldInput', field, value, $event);
                this.$emit('field:input', field, value, $event);
                this.$emit('fieldInput', field, value, $event);
            },
            onFormChange(field, value, $event) {
                this.handleCustomEvent('formChange', field, value, $event);
                this.$emit('form:change', field, value, $event);
                this.$emit('formChange', field, value, $event);
            },
            onValidate(field, valid, message) {
                this.handleCustomEvent('validate', field, valid, message);
                this.$emit('validate', field, valid, message);
            },
            handleCustomEvent(eventName, ...args) {
                if (this.listeners[eventName]) {
                    this.listeners[eventName].call(this.vm || this.$parent, ...args);
                }
            },
            fetchFormDataByOid(oid, typeOid) {
                if (!oid) {
                    return Promise.resolve();
                }

                return Promise.resolve(cachedFormData[oid] ? cachedFormData[oid] : this.fetchFormByOid(oid, typeOid))
                    .then((res) => {
                        this.cachedFormDataTimer = setTimeout(() => {
                            delete cachedFormData[oid];
                        }, 100);
                        cachedFormData[oid] = FamKit.deepClone(res);
                        return res;
                    })
                    .then((res) => {
                        this.sourceData = res?.data || {};
                        return this.resolveResponseData(res);
                    });
            },
            async resolveResponseData({ data = {} }) {
                this.$emit('base-form-data', data);

                const { rawData } = data || {};
                const customRawData = data?.[this.rawDataName];
                let formData = rawData;
                if (customRawData) {
                    formData = { ...rawData, ...customRawData };
                }
                if (_.isFunction(this.customAssemblyData)) {
                    const customData = await this.customAssemblyData(FamKit.deepClone(data));
                    if (customData) {
                        formData = { ...formData, ...customData };
                    }
                }
                const trueWidgetList = FamKit.TreeUtil.flattenTree2Array(this.trueWidgetList, {
                    childrenField: 'widgetList'
                });
                const schemaArr = trueWidgetList.map((widget) => {
                    return widget.schema;
                });
                let schemaKeyMap = {};
                let transitionComponentValue = [];
                let defaultValueMap = {};
                const stringTransArrayComponents = ['CustomSelect'];
                let stringTransArrayAttr = [];

                const defaultFieldMap = {
                    USER: 'users',
                    ROLE: 'roles',
                    GROUP: 'groups',
                    ORG: 'organizations'
                };
                schemaArr.forEach((schema) => {
                    schemaKeyMap[schema.field] = this.componentKey(schema);
                    if (this.componentDefaultKey(schema)) {
                        schemaKeyMap[this.componentDefaultKey(schema).key] = this.componentDefaultKey(schema).value;
                    }

                    if (FamKit.isSameComponentName(schema?.component, 'FamParticipantSelect')) {
                        transitionComponentValue.push(schema.field);
                        defaultValueMap[schema.field] = defaultFieldMap[schema?.props?.type];
                    }
                    if (
                        stringTransArrayComponents.find((component) =>
                            FamKit.isSameComponentName(schema?.component, component)
                        )
                    ) {
                        if (schema?.props?.multiple) {
                            stringTransArrayAttr.push(schema.field);
                        }
                    }
                    if (FamKit.isSameComponentName(schema?.component, 'FamUpload')) {
                        let authCodeArr = formData[schema?.field]?.fileInfoList || [];
                        let authCode = {};
                        authCodeArr.forEach((i) => {
                            authCode[i.fileId] = i.authCode;
                        });
                        schema.props = Object.assign(
                            {
                                authCode: authCode
                            },
                            schema.props
                        );
                    }
                });

                if (typeof this.beforeEcho === 'function') {
                    console.warn('[deprecated] 请使用内置的数据转换逻辑，而不是适用外部代码控制');
                    this.beforeEcho({
                        rawData,
                        next: (form) => {
                            this.form = form;
                        }
                    });
                    return;
                }
                this.form = _.reduce(
                    _.keys(formData),
                    (prev, field) => {
                        const prevField =
                            (this.modelMapper?.[field] && this.modelMapper?.[field](formData, formData[field])) ||
                            formData[field].value?.[schemaKeyMap?.[field]] ||
                            formData[field]?.[schemaKeyMap?.[field]] ||
                            formData[field].value;
                        prev[field] = prevField;
                        if (transitionComponentValue.includes(field)) {
                            prev[field] = {};
                            prev[field].value = prevField?.split(',');
                            prev[field + '_defaultValue'] = formData[field]?.[defaultValueMap[field]];
                        }
                        if (stringTransArrayAttr.includes(field)) {
                            prev[field] = prevField?.split(',');
                        }
                        const defaultValue = field + 'DefaultValue';
                        if (schemaKeyMap?.[defaultValue]) {
                            prev[defaultValue] =
                                formData[field].value?.[schemaKeyMap?.[defaultValue]] ||
                                formData[field]?.[schemaKeyMap?.[defaultValue]] ||
                                null;
                        }
                        if (schemaKeyMap?.[defaultValue] === 'user') {
                            prev[defaultValue] = _.isArray(prev[defaultValue])
                                ? prev[defaultValue]
                                : [prev[defaultValue]];
                        }
                        return prev;
                    },
                    {}
                );
            },
            fetchFormByOid(oid, typeOid) {
                return commonApi.fetchObjectAttr(oid, { typeOid });
            },
            componentKey(schema) {
                const componentMap = {
                    'custom-select':
                        schema.props?.row?.requestConfig?.valueProperty || schema.props?.row?.valueProperty || '',
                    'fam-member-select': 'oid',
                    'fam-organization-select': 'oid',
                    'fam-participant-select': 'oid'
                };
                return componentMap?.[this.fnGetShowComponent(schema.component)] || 'value';
            },
            // 特殊处理的属性
            componentDefaultKey(schema) {
                const defaultKeyMap = {
                    'fam-member-select': {
                        key: schema.field + 'DefaultValue',
                        value: 'user'
                    },
                    'fam-organization-select': {
                        key: schema.field + 'DefaultValue',
                        value: 'orgs'
                    }
                };
                return defaultKeyMap?.[this.fnGetShowComponent(schema.component)] || null;
            },
            eachSchema(schema) {
                // 遍历schema对象，对任何字符串类型的字段，将${variable}替换为实际值
                const variables = this.variables || {};
                const replaceVariable = (obj = []) => {
                    _.each(obj, (value, key) => {
                        if (typeof value === 'string' && obj && typeof obj === 'object') {
                            const originValue = obj['_origin_' + key] === undefined ? value : obj['_origin_' + key];
                            if (!/\$\{(\w+)}/g.test(originValue) || /^_origin_/.test(key)) {
                                return;
                            }
                            if (!Object.hasOwn(obj, '_origin_' + key)) {
                                Object.defineProperty(obj, '_origin_' + key, {
                                    enumerable: false,
                                    writable: true
                                });
                                obj['_origin_' + key] = value;
                            }
                            obj[key] = originValue.replace(/\$\{(\w+)}/g, (match, variable) => {
                                return Object.hasOwn(variables, variable) ? variables[variable] : match;
                            });
                        } else if (Array.isArray(value)) {
                            value = value.map((item) => replaceVariable(item));
                        } else if (value && typeof value === 'object' && !(value instanceof Vue)) {
                            obj[key] = replaceVariable(value);
                        }
                    });
                    return obj;
                };
                replaceVariable(schema);

                if (
                    FamKit.isSameComponentName(schema.component, 'slot') &&
                    typeof schema.props.slotComponent === 'string'
                ) {
                    const componentLoader = this.functions[schema.props.slotComponent];
                    if (componentLoader) {
                        schema.component = componentLoader();
                    }
                }

                return schema;
            },
            initTransformData(rawData) {
                const trueWidgetList = FamKit.TreeUtil.flattenTree2Array(this.trueWidgetList, {
                    childrenField: 'widgetList'
                });
                const schemaArr = trueWidgetList.map((widget) => {
                    return widget.schema;
                });
                let schemaKeyMap = {};
                schemaArr.forEach((schema) => {
                    schemaKeyMap[schema.field] = this.componentKey(schema);
                });
                return _.reduce(
                    _.keys(rawData),
                    (prev, field) => {
                        prev[field] =
                            (this.modelMapper?.[field] && this.modelMapper?.[field](rawData, rawData[field])) ||
                            rawData[field].value?.[schemaKeyMap?.[field]] ||
                            rawData[field]?.[schemaKeyMap?.[field]] ||
                            rawData[field].value;
                        if (schemaKeyMap?.[field] === 'user') {
                            prev[field] = _.isArray(prev[field]) ? prev[field] : [prev[field]];
                        }
                        return prev;
                    },
                    {}
                );
            },
            getLayoutWidgetList(contextRef, layoutType) {
                return new Promise((resolve, reject) => {
                    this.$famHttp({
                        url: '/fam/type/layout/classify/get',
                        method: 'get',
                        params: {
                            contextRef,
                            layoutType
                        }
                    })
                        .then((resp) => {
                            const widgetList = util.deserializeWidgetList(resp.data || {}, this.resolveWidget);

                            resolve(widgetList);
                        })
                        .catch(reject);
                });
            },
            handleFieldChange: _.debounce(async function ({ field, isRequest = true }) {
                let layoutWidgetList = null;
                if (field === this.classifyField) {
                    if (this.contextRef && this.layoutType === 'CREATE') {
                        layoutWidgetList = await this.getLayoutWidgetList(this.contextRef, this.layoutType);
                    } else if (
                        this.layoutType &&
                        this.contextRef &&
                        !_.isObject(this.contextRef) &&
                        isRequest &&
                        /^OR:/.test(this.contextRef)
                    ) {
                        layoutWidgetList = await this.getLayoutWidgetList(this.contextRef, this.layoutType);
                    } else {
                        layoutWidgetList = util.deserializeWidgetList(
                            this.layout?.[this.layoutName] || {},
                            this.resolveWidget
                        );
                    }
                }

                if (layoutWidgetList) {
                    const widgetList = layoutWidgetList.map((item) => ({
                        ...item,
                        _classifyField: this.classifyField
                    }));
                    this.layoutWidgetList = widgetList;
                    const innerWidgetList = this.innerWidgetList.filter(
                        (item) => item._classifyField !== this.classifyField
                    );
                    this.innerWidgetList = [...innerWidgetList, ...widgetList];
                }
            }, 500),
            /**
             * 根据 schema.ref 访问组件
             * @param {string} ref
             */
            useComponent(ref) {
                if (!ref) {
                    throw new Error('No ref specified.');
                }
                return this.$refs.dynamicForm.useComponent(ref);
            },
            deserializeWidgetList: util.deserializeWidgetList
        }
    };
});
