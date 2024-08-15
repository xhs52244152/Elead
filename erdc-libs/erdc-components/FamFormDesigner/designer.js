define(['fam:kit', 'fam:store', 'underscore', 'dayjs'], function () {
    const _ = require('underscore');
    const store = require('fam:store');
    const FamKit = require('fam:kit');
    const dayjs = require('dayjs');
    const TreeUtil = FamKit.TreeUtil;

    const deepClone = (origin) => {
        return FamKit.deepClone(origin);
    };
    const generateId = function () {
        return (Math.random() * 100000 + Math.random() * 20000 + Math.random() * 5000).toString(36).replace('.', '');
    };
    const coverObject2List = (sourceObject, attrNameKey = 'attrName', valueKey = 'value') =>
        _.chain(sourceObject)
            .keys()
            .map((attrName) => {
                let value = sourceObject[attrName];

                if (typeof value === 'function') {
                    value = null;
                } else if (typeof value === 'object') {
                    // value = JSON.stringify(value);
                }

                return {
                    [attrNameKey]: attrName,
                    [valueKey]: value
                };
            })
            .value();

    return function createDesigner(vm) {
        const defaultFormConfig = {
            type: 'CREATE',
            name: null,
            nameI18nJson: null,
            createUser: store.state.app.user,
            createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            updateUser: null,
            listeners: {}
        };

        return {
            // 编辑页面根实例
            vm,
            // 当前部件列表
            widgetList: [],
            // 当前选中的部件
            selected: null,
            formConfig: {
                ...defaultFormConfig
            },

            copyNewFieldWidget(widget) {
                let newWidget = { ...widget };
                newWidget.schema = deepClone(widget.schema);
                newWidget.schema.props = newWidget.schema.props ? { ...newWidget.schema.props } : {};

                newWidget.id = generateId();

                if (!newWidget.nolabel) {
                    newWidget.schema.label = newWidget.name;
                    newWidget.schema.nameI18nJson = _.clone(newWidget.schema.nameI18nJson) || {
                        value: newWidget.schema.label
                    };
                } else {
                    newWidget.schema.label = null;
                }
                newWidget.schema.col = newWidget.schema.col || 24;
                // widget.options.name = widget.id
                // widget.options.label = widget.options.label || widget.type.toLowerCase();

                if (_.isFunction(newWidget.lifecycle?.clone)) {
                    newWidget.lifecycle.clone(newWidget, widget);
                }

                return newWidget;
            },
            removeWidget(parentWidget, index) {
                const widget = parentWidget.widgetList[index];
                parentWidget.widgetList.splice(index, 1);
                if (this.selected === widget) {
                    this.setSelected(parentWidget.widgetList[parentWidget.widgetList.length - 1]);
                }
            },
            setSelected(widget) {
                if (!widget) {
                    this.clearSelected();
                }

                this.selected = widget;
            },
            clearSelected() {
                this.selected = {
                    schema: {}
                };
            },
            serialize(formConfig) {
                let formInfo = formConfig || this.formConfig;
                let nameI18nJson = formInfo.nameI18nJson;
                if (nameI18nJson && _.isString(nameI18nJson)) {
                    try {
                        nameI18nJson = JSON.parse(nameI18nJson);
                    } catch (e) {
                        nameI18nJson = { value: nameI18nJson };
                    }
                }
                let layoutJson = formInfo.layoutJson || '{}';
                try {
                    layoutJson = JSON.parse(layoutJson);
                } catch (e) {
                    // do noting
                }
                layoutJson.listeners = formInfo.listeners || {};

                const layoutFormInfo = {
                    nameI18nJson,
                    name: formInfo.name,
                    type: formInfo.type,
                    layoutJson: JSON.stringify(layoutJson)
                };

                const flattenedWidgets = TreeUtil.flattenTree2Array(this.widgetList, {
                    childrenField: 'widgetList'
                });

                return Promise.resolve({
                    attrRawList: _.chain(coverObject2List(layoutFormInfo))
                        .filter((item) => {
                            return item.value !== null;
                        })
                        .value(),
                    widgetList: _.chain(flattenedWidgets).map(this.serializeWidget).compact().value()
                });
            },
            serializeWidget(widget) {
                if (widget.schema.label) {
                    widget.schema.label = widget.schema.label.trim();
                    let i18nMap = widget.schema.nameI18nJson || {};
                    Object.keys(i18nMap).forEach((key) => {
                        i18nMap[key] = i18nMap[key] && i18nMap[key].trim();
                    });
                }
                /**
                 * 富文本组件props需要重置
                 * */
                if (FamKit.isSameComponentName(widget.schema.component, 'ErdQuillEditor')) {
                    widget.schema.props = {
                        ...widget.schema.props,
                        component: 'FamQuillEditor',
                        options: {
                            modules: {
                                symbol: widget.schema.props?.options?.modules?.symbol
                            }
                        }
                    };
                }
                const widgetObject = {
                    attrRef: widget.attrRef || null,
                    componentRef: widget.componentRef || null,
                    attrName: widget.attrName || widget.schema.field || null,
                    flag: widget.flag || 'COMPONENT',
                    syncToChild: !!widget.syncToChild,
                    disabled: widget.schema.disabled ?? false,
                    readonly: widget.schema.readonly ?? false,
                    hidden: widget.schema.hidden ?? false,
                    componentJson: JSON.stringify({
                        id: widget.id,
                        key: widget.key,
                        defaultValue: widget.defaultValue || null,
                        columnNumber: widget.columnNumber || widget.schema.col || 12,
                        // disabled: widget.disabled || false,
                        // required: widget.required || false,
                        // hidden: widget.hidden || false,
                        schema: widget.schema || {},
                        parentWidget: widget.parentWidget
                    })
                };

                return {
                    attrRawList: _.chain(coverObject2List(widgetObject))
                        .filter((item) => {
                            return item.value !== null;
                        })
                        .value()
                };
            },
            setWidgetValue(key, value) {
                FamKit.setFieldValue(this.selected, key, value, this.vm, '.');
            },
            setSchemaValue(key, value) {
                FamKit.setFieldValue(this.selected.schema, key, value, this.vm, '.');
            },
            setFormConfig(key, value) {
                FamKit.setFieldValue(this.formConfig, key, value, this.vm, '.');
            },
            deserialize(layout) {
                if (!layout) {
                    this.formConfig = {
                        ...defaultFormConfig
                    };
                    this.widgetList = [];
                    return;
                }

                let layoutJson = layout.layoutJson || '{}';
                try {
                    layoutJson = JSON.parse(layoutJson);
                } catch (e) {
                    // do noting
                }

                this.formConfig = {
                    type: layout.type,
                    name: layout.name,
                    createUser: layout.createUser,
                    createTime: layout.createTime,
                    updateUser: layout.updateUser,
                    nameI18nJson: { value: layout.nameI18nJson },
                    layoutJson: layout.layoutJson,
                    listeners: layoutJson.listeners || {}
                };

                const widgetList = _.chain(layout.layoutAttrList)
                    .map((sketch) => {
                        let widget;
                        try {
                            widget = JSON.parse(sketch.componentJson);
                        } catch (e) {
                            // do noting
                        }

                        if (widget) {
                            widget.key = FamKit.pascalize(widget.key);
                            if (widget.schema) {
                                widget.schema.component &&
                                    (widget.schema.component = FamKit.pascalize(widget.schema.component));
                                widget.schema.hidden = sketch.hidden ?? widget.schema.hidden ?? false;
                                widget.schema.disabled = sketch.disabled ?? widget.schema.disabled ?? false;
                                widget.schema.readonly = sketch.readonly ?? widget.schema.readonly ?? false;
                            }
                            const widgetDescription = _.find(store.state.component.widgets, (w) =>
                                FamKit.isSameComponentName(w.key, widget.key)
                            );
                            return {
                                ...widgetDescription,
                                ...widget,
                                attrRef: sketch.attrRef,
                                attrName: sketch.attrName,
                                componentRef: sketch.componentRef,
                                flag: sketch.flag,
                                configurations: widgetDescription?.configurations
                            };
                        }

                        return null;
                    })
                    .value();
                this.widgetList = TreeUtil.buildTree(widgetList, {
                    parentField: 'parentWidget',
                    childrenField: 'widgetList'
                });
            },
            // 判断一个属性是否被使用
            isAttributeInUsed(attrName) {
                const isInUsed = (widgetList, attrName) => {
                    return _.some(
                        widgetList,
                        (widget) => widget.schema?.field === attrName || isInUsed(widget.widgetList, attrName)
                    );
                };
                return isInUsed(this.widgetList, attrName);
            }
        };
    };
});
