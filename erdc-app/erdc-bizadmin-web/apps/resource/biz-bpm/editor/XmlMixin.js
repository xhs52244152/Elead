define([], function () {
    function toUpperCamel(str = '') {
        return str.substr(0, 1).toUpperCase() + str.substr(1);
    }

    const waitUntil = (condition) => {
        if (condition()) {
            return {
                then(callback) {
                    callback();
                },
                catch() {
                    // to nothing
                },
                finally() {
                    // to nothing
                }
            };
        }

        return new Promise((resolve) => {
            if (condition()) {
                resolve();
            } else {
                // 避免占用渲染线程
                window.requestIdleCallback(() => {
                    resolve(waitUntil(condition));
                });
            }
        });
    };

    return {
        computed: {
            modeler() {
                return this.bpmnModeler;
            },
            modeling() {
                const modeling = this.bpmnModeler?.get('modeling');
                if (!modeling._updateProperties) {
                    modeling._updateProperties = modeling.updateProperties;
                    const that = this;
                    modeling.updateProperties = function (element, attrObj, ...args) {
                        waitUntil(() => that.elementRegistry._elements?.[element.id]).then(() => {
                            that.modeling._updateProperties(element, attrObj, ...args);
                        });
                    };
                }
                return modeling;
            },
            moddle() {
                return this.bpmnModeler?.get('moddle');
            },
            bpmnFactory() {
                return this.bpmnModeler?.get('bpmnFactory');
            },
            elementRegistry() {
                return this.bpmnModeler?.get('elementRegistry');
            },
            selection() {
                return this.bpmnModeler?.get('selection');
            },
            replace() {
                return this.bpmnModeler?.get('replace');
            }
        },
        methods: {
            getExtensions(element) {
                return element?.businessObject?.extensionElements?.values || [];
            },
            getExtensionValue(element, property, expectArray) {
                const extensions = this.getExtensions(element) || [];
                let el = extensions?.find((el) => el.$type.split(':')[1] === toUpperCamel(property)) || {};
                if (expectArray) {
                    return extensions
                        .filter((el) => el.$type.split(':')[1] === toUpperCamel(property))
                        .map((el) => {
                            const tmpl = Object.assign({}, el, el.$attrs);
                            delete tmpl.$type;
                            return tmpl;
                        })
                        .filter((el) => !!el);
                }
                return el[property];
            },
            saveExtensionValues(element, property, value, extensions) {
                extensions =
                    extensions ||
                    this.getExtensions(element).filter((el) => el.$type.split(':')[1] !== toUpperCamel(property));
                if (Array.isArray(value) && value.length) {
                    return value.forEach((value) => {
                        this.saveExtensionValues(element, property, value, extensions);
                    });
                } else if (Array.isArray(value) && !value.length) {
                    this.saveExtensionValues(element, property, null, extensions);
                    return;
                }
                const obj = this.moddle.create(
                    `activiti:${toUpperCamel(property)}`,
                    value && typeof value === 'object'
                        ? value
                        : {
                              [property]: value
                          }
                );
                if (Array.isArray(value) && value.length === 0) {
                    extensions = extensions.filter((item) => item.$type !== `activiti:${toUpperCamel(property)}`);
                } else if (value !== null && typeof value === 'object' && Object.keys(value).length === 0) {
                    extensions = extensions.filter((item) => item.$type !== `activiti:${toUpperCamel(property)}`);
                } else if (value) {
                    extensions.push(obj);
                } else {
                    extensions = extensions.filter((item) => item.$type !== `activiti:${toUpperCamel(property)}`);
                }
                this.updateElementExtensions(
                    element,
                    extensions.filter((e) => !!e)
                );
            },
            updateElementExtensions(element, extensionList) {
                const extensions = this.moddle.create('bpmn:ExtensionElements', {
                    values: extensionList
                });
                this.modeling.updateProperties(element, {
                    extensionElements: extensions
                });
            },
            getExtensionRouteValue(element) {
                const extensions = this.getExtensions(element) || [];
                const isYouNeedType = (el) => new RegExp('formProperty', 'i').test(el.$type.split(':')[1]);
                const formPropertyValues = extensions.filter(isYouNeedType);
                const values = formPropertyValues
                    .reduce((prev, el) => {
                        return [
                            ...prev,
                            ...(el.values || []).map((item) => {
                                const obj = Object.assign({}, item);
                                delete obj.$type;
                                return obj;
                            })
                        ];
                    }, [])
                    .filter((route) => !!route);

                const routeSort = values.filter((route) => /_sort$/.test(route.id));
                const routes = values.filter((route) => !/_sort$/.test(route.id));

                return routes.map((route) => {
                    return {
                        ...route,
                        sort: routeSort.find((item) => item.id === route.id + '_sort')?.name
                    };
                });
            }
        }
    };
});
