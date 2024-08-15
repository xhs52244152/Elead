define([
    'underscore',
    ELMP.resource('platform-api/util/index.js'),
    ELMP.resource('platform-api/util/swagger.js')
], function (_, util, Swagger) {
    'use strict';

    class ApiDoc {
        constructor(currentInstance) {
            this.currentInstance = currentInstance;
        }

        /**
         * 解析Api文档
         * @param {*} menu
         */
        parseApiDoc(menu) {
            if (!menu) return;

            const { currentInstance } = this;

            if (menu.hasOwnProperty('definitions')) {
                currentInstance.difArrs = this.parseDefinitions(menu);
            }

            if (menu.hasOwnProperty('tags')) {
                currentInstance.tags = this.parseApiTags(menu);
            }

            if (menu.hasOwnProperty('paths')) {
                const paths = this.parseApiPaths(menu, currentInstance);
                currentInstance.paths = paths;
            }

            //  根据tag名称，对path进行分组，并将path存放到对应的tag对象中 。
            currentInstance.tags.forEach((tag) => {
                currentInstance.paths.forEach((path) => {
                    if (path.tags.includes(tag.name)) {
                        tag.children.push(path);
                    }
                });
            });
        }

        parseDefinitions(menu) {
            const definitions = menu.definitions;
            const difArrs = [];

            for (let prop in definitions) {
                const value = definitions[prop];
                if (_.isNull(value) || _.isUndefined(value)) {
                    break;
                }

                const swud = new Swagger.SwaggerBootstrapUiDefinition();
                swud.name = prop;
                swud.required = value.required ?? [];
                this.setDefinitionOtherType(swud, value);

                const properties = value.properties ?? {};
                const defiTypeValue = {};
                for (let property in properties) {
                    const propobj = properties[property];

                    const spropObj = new Swagger.SwaggerBootstrapUiProperty();
                    spropObj.name = property;
                    spropObj.readOnly = propobj.readOnly;
                    spropObj.originProperty = propobj;
                    spropObj.format = propobj.format;
                    spropObj.required = propobj.required ?? false;
                    this.setPropertyOtherType(spropObj, propobj);

                    if (spropObj.type === 'string') {
                        spropObj.example = String(propobj.example);
                    } else {
                        spropObj.example = propobj.example;
                    }

                    if (Array.isArray(swud.required) && swud.required.includes(spropObj.name)) {
                        spropObj.required = true;
                    }

                    spropObj.value = this.parseProperty(propobj, spropObj, definitions);

                    //判断是否有format,如果是integer,判断是64位还是32位
                    if (spropObj.format !== null && spropObj.format !== undefined && spropObj.format !== '') {
                        //spropObj.type=spropObj.format;
                        spropObj.type += '(' + spropObj.format + ')';
                    }
                    //判断最终类型
                    if (spropObj.refType != null && spropObj.refType !== '') {
                        //判断基础类型,非数字类型
                        if (spropObj.type === 'string') {
                            spropObj.type = spropObj.refType;
                        }
                    }
                    //addprop
                    //这里判断去重
                    if (!util.checkPropertiesExists(swud.properties, spropObj)) {
                        swud.properties.push(spropObj);
                        //如果当前属性readOnly=true，则实体类value排除此属性的值
                        if (!spropObj.readOnly) {
                            defiTypeValue[property] = spropObj.value;
                        }
                    }
                }
                swud.value = defiTypeValue;

                difArrs.push(swud);
            }

            return difArrs;
        }

        parseApiTags(menu) {}

        parseProperty(propobj, spropObj, definitions) {
            const regex = new RegExp('#/definitions/(.*)$', 'ig');

            //默认string类型
            let propValue = '',
                globalArr,
                ref,
                refType;
            //判断是否有类型
            if (propobj.hasOwnProperty('type')) {
                const type = propobj.type;
                //判断是否有example
                if (propobj.hasOwnProperty('example')) {
                    propValue = type === 'string' ? String(propobj.example) : propobj.example;
                } else if (util.isBasicType(type)) {
                    propValue = util.getBasicTypeValue(type);
                    //此处如果是object情况,需要判断additionalProperties属性的情况
                    if (type === 'object' && propobj.hasOwnProperty('additionalProperties')) {
                        let addpties = propobj['additionalProperties'],
                            adref,
                            addrefType,
                            addTempValue;
                        //判断是否有ref属性,如果有,存在引用类,否则默认是{}object的情况
                        if (addpties.hasOwnProperty('$ref')) {
                            adref = addpties['$ref'];

                            if (regex.test(adref)) {
                                addrefType = RegExp.$1;
                                addTempValue = null;
                                //这里需要递归判断是否是本身,如果是,则退出递归查找
                                globalArr = [];
                                //添加类本身
                                globalArr.push(name);

                                if (addrefType !== name) {
                                    addTempValue = this.findRefDefinition(addrefType, definitions, false, globalArr);
                                } else {
                                    addTempValue = this.findRefDefinition(
                                        addrefType,
                                        definitions,
                                        true,
                                        name,
                                        globalArr
                                    );
                                }
                                propValue = { additionalProperties1: addTempValue };
                                spropObj.type = addrefType;
                                spropObj.refType = addrefType;
                            }
                        } else if (addpties.hasOwnProperty('items')) {
                            //数组
                            var addPropItems = addpties['items'];
                            adref = addPropItems['$ref'];

                            if (regex.test(adref)) {
                                addrefType = RegExp.$1;
                                addTempValue = null;
                                //这里需要递归判断是否是本身,如果是,则退出递归查找
                                globalArr = [];
                                //添加类本身
                                globalArr.push(name);

                                if (addrefType !== name) {
                                    addTempValue = this.findRefDefinition(addrefType, definitions, false, globalArr);
                                } else {
                                    addTempValue = this.findRefDefinition(
                                        addrefType,
                                        definitions,
                                        true,
                                        name,
                                        globalArr
                                    );
                                }
                                var tempAddValue = [];
                                tempAddValue.push(addTempValue);
                                propValue = { additionalProperties1: tempAddValue };
                                spropObj.type = 'array';
                                spropObj.refType = addrefType;
                            }
                        }
                    }
                } else if (type === 'array') {
                    propValue = [];
                    var items = propobj['items'];
                    ref = items['$ref'];
                    //此处有可能items是array
                    if (items.hasOwnProperty('type')) {
                        if (items['type'] === 'array') {
                            ref = items['items']['$ref'];
                        }
                    }
                    //判断是否存在枚举
                    if (items.hasOwnProperty('enum')) {
                        if (spropObj.description !== '') {
                            spropObj.description += ',';
                        }
                        spropObj.description = spropObj.description + '可用值:' + items['enum'].join(',');
                    }

                    if (regex.test(ref)) {
                        refType = RegExp.$1;
                        spropObj.refType = refType;
                        //这里需要递归判断是否是本身,如果是,则退出递归查找
                        globalArr = [];
                        //添加类本身
                        globalArr.push(name);
                        if (refType !== name) {
                            propValue.push(this.findRefDefinition(refType, definitions, false, globalArr));
                        } else {
                            propValue.push(this.findRefDefinition(refType, definitions, true, name, globalArr));
                        }
                    } else {
                        //schema基础类型显示
                        spropObj.refType = items['type'];
                    }
                }
            } else {
                if (propobj.hasOwnProperty('$ref')) {
                    ref = propobj['$ref'];
                    if (regex.test(ref)) {
                        refType = RegExp.$1;
                        spropObj.refType = refType;
                        //这里需要递归判断是否是本身,如果是,则退出递归查找
                        globalArr = [];
                        //添加类本身
                        globalArr.push(name);
                        if (refType !== name) {
                            propValue = this.findRefDefinition(refType, definitions, false, globalArr);
                        } else {
                            propValue = this.findRefDefinition(refType, definitions, true, globalArr);
                        }
                    }
                } else {
                    propValue = {};
                }
            }

            return propValue;
        }

        /***
         * 递归查询definition
         * @param definitionName
         * @param definitions
         * @param flag
         * @param globalArr
         */
        findRefDefinition(definitionName, definitions, flag, globalArr) {
            let defaultValue = {};

            const definition = definitions[definitionName];
            if (!definition) {
                return defaultValue;
            }

            const defiTypeValue = {};
            const properties = definition.properties || {};

            const regex = new RegExp('#/definitions/(.*)$', 'ig');
            for (const property in properties) {
                const propobj = properties[property];
                if (!Object.hasOwnProperty(propobj, 'readOnly') || !propobj.readOnly) {
                    let propValue = '';
                    let ref, refType;

                    if (propobj.type) {
                        const type = propobj.type;
                        const example = propobj.example;

                        if (example !== undefined) {
                            propValue = example;
                        } else if (util.isBasicType(type)) {
                            propValue = util.getBasicTypeValue(type);
                            if (type === 'object' && propobj.additionalProperties) {
                                const addpties = propobj.additionalProperties;
                                if (addpties.$ref) {
                                    ref = addpties.$ref;
                                    if (regex.test(ref)) {
                                        let addTempValue = null;
                                        refType = RegExp.$1;
                                        if (!flag && !globalArr.includes(refType)) {
                                            globalArr.push(definitionName);
                                            addTempValue = this.findRefDefinition(
                                                refType,
                                                definitions,
                                                flag,
                                                globalArr
                                            );
                                        }
                                        propValue = { additionalProperties1: addTempValue };
                                    }
                                }
                            }
                        } else if (type === 'array') {
                            propValue = [];
                            const items = propobj.items;
                            ref = items.$ref || '';
                            if (items.type === 'array') {
                                ref = items.items.$ref;
                            }
                            if (regex.test(ref)) {
                                refType = RegExp.$1;
                                if (!flag) {
                                    if (globalArr.includes(refType)) {
                                        propValue.push({});
                                    } else {
                                        globalArr.push(definitionName);
                                        propValue.push(this.findRefDefinition(refType, definitions, flag, globalArr));
                                    }
                                }
                            }
                        }
                    } else if (propobj.$ref) {
                        ref = propobj.$ref;
                        const regex = new RegExp('#/definitions/(.*)$', 'ig');
                        if (regex.test(ref)) {
                            refType = RegExp.$1;
                            if (!flag && !globalArr.includes(refType)) {
                                globalArr.push(definitionName);
                                propValue = this.findRefDefinition(refType, definitions, flag, globalArr);
                            }
                        }
                    } else {
                        propValue = {};
                    }
                    defiTypeValue[property] = propValue;
                }
            }
            defaultValue = defiTypeValue;

            return defaultValue;
        }

        setDefinitionOtherType(swud, value) {}

        setPropertyOtherType(spropObj, propobj) {}

        parseApiPaths() {}

        createApiInfoInstance(currentInstance, path, mtype, apiInfo) {}

        deepResponseRefParameter(swpinfo, def, resParam) {
            if (!def || !def.hasOwnProperty('properties')) return;

            var refParam = new Swagger.SwaggerBootstrapUiRefParameter();
            refParam.name = def.name;

            if (util.checkParamArrsExists(swpinfo.responseRefParameters, refParam.name)) {
                swpinfo.responseRefParameters.push(refParam);
                if (Array.isArray(def.properties)) {
                    def.properties.forEach((item) => {
                        const refp = new Swagger.SwaggerBootstrapUiParameter();
                        refp.pid = resParam.id;
                        refp.name = p.name;
                        refp.type = p.type;
                        refp.description = replaceMultipLineStr(p.description);
                        //add之前需要判断是否已添加,递归情况有可能重复
                        refParam.params.push(refp);

                        //判断类型是否基础类型
                        if (!isBasicType(p.refType)) {
                            refp.schemaValue = p.refType;
                            refp.schema = true;
                            if (resParam.name !== refp.name || resParam.schemaValue !== p.refType) {
                                const deepDef = util.getDefinitionByName(currentInstance, p.refType);
                                this.deepResponseRefParameter(swpinfo, deepDef, refp);
                            }
                        }
                    });
                }
            }
        }

        /***
         * 根据api接口自定义tags添加
         * @param currentInstance
         * @param name
         */
        mergeApiInfoSelfTags(currentInstance, name) {
            const findTag = currentInstance.tags.find((tag) => tag.name === name);
            if (!findTag) {
                const ntag = new Swagger.SwaggerBootstrapUiTag(name, name);
                currentInstance.tags.push(ntag);
            }
        }
    }

    return ApiDoc;
});
