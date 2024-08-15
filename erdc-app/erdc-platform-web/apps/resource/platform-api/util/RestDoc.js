define([
    ELMP.resource('platform-api/util/index.js'),
    ELMP.resource('platform-api/util/swagger.js'),
    ELMP.resource('platform-api/util/ApiDoc.js')
], function (util, Swagger, ApiDoc) {
    class RestDoc extends ApiDoc {
        setDefinitionOtherType(swud, value) {
            swud.description = value.description;
            swud.type = value.type;
            swud.title = value.title;
        }

        setPropertyOtherType(spropObj, propobj) {
            spropObj.type = propobj.type ?? 'string';
            spropObj.description = propobj.description;
        }

        parseApiTags(menu) {
            const tags = menu.tags.map((tag) => {
                return new Swagger.SwaggerBootstrapUiTag(tag.name, tag.description);
            });

            return tags;
        }

        parseApiPaths(menu, currentInstance) {
            const _supportMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'TRACE', 'HEAD', 'CONNECT'];

            let paths = [];
            const pathsDictionary = {};
            Object.keys(menu.paths).forEach((key) => {
                const path = menu.paths[key];

                _supportMethods.forEach((method) => {
                    const apiInfo = path[method];
                    if (apiInfo) {
                        const ins = this.createApiInfoInstance(currentInstance, key, method, apiInfo);
                        paths.push(ins);
                        ins.hashCollections.forEach((hashurl) => {
                            pathsDictionary[hashurl] = ins;
                        });
                        this.methodCountAndDown(currentInstance, method.toUpperCase());
                    }
                });
            });

            // 根据请求的url和method去重
            paths = _.uniq(paths, (item) => `${item.url}-${item.methodType}`);
            return paths;
        }

        /***
         * 创建对象实例,返回SwaggerBootstrapUiApiInfo实例
         */
        createApiInfoInstance(currentInstance, path, mtype, apiInfo) {
            var swpinfo = new Swagger.SwaggerBootstrapUiApiInfo();

            //添加basePath
            let newfullPath = currentInstance.host || '';
            let basePathFlag = false;
            newfullPath += path;

            //截取字符串
            let newurl = newfullPath.substring(newfullPath.indexOf('/'));
            newurl = newurl.replace('//', '/');
            //判断应用实例的baseurl
            if (currentInstance.baseUrl !== '' && currentInstance.baseUrl !== '/') {
                const baseUrl = currentInstance.baseUrl ?? '';
                newurl = baseUrl + newurl;
            }

            swpinfo.showUrl = newurl;
            swpinfo.url = newurl;
            swpinfo.originalUrl = newurl;
            swpinfo.basePathFlag = basePathFlag;
            swpinfo.methodType = mtype.toUpperCase();
            //接口id使用MD5策略,缓存整个调试参数到localStorage对象中,供二次调用
            swpinfo.id = newurl + mtype.toUpperCase();
            if (apiInfo != null) {
                if (apiInfo.hasOwnProperty('deprecated')) {
                    swpinfo.deprecated = apiInfo['deprecated'];
                }
                if (!apiInfo.tags) {
                    apiInfo.tags = ['default'];
                }
                swpinfo.consumes = apiInfo.consumes;
                swpinfo.description = apiInfo.description || '';
                swpinfo.operationId = apiInfo.operationId;
                swpinfo.summary = apiInfo.summary;
                swpinfo.tags = apiInfo.tags;
                //operationId
                swpinfo.operationId = apiInfo.operationId || '';
                const _groupName = currentInstance.name;
                //设置hashurl
                swpinfo.tags.forEach((tag) => {
                    const _hashUrl = '#/' + _groupName + '/' + tag + '/' + swpinfo.operationId;
                    swpinfo.hashCollections.push(_hashUrl);
                });
                swpinfo.produces = apiInfo.produces;
                if (apiInfo.hasOwnProperty('parameters')) {
                    var pameters = apiInfo['parameters'];

                    pameters.forEach((m) => {
                        var minfo = new Swagger.SwaggerBootstrapUiParameter();
                        minfo.name = m.name ?? '';
                        minfo.type = m.type ?? '';
                        minfo.in = m.in ?? '';
                        minfo.require = m.required ?? '';
                        minfo.description = util.replaceMultipLineStr(m.description ?? '');
                        if (m.hasOwnProperty('schema')) {
                            //存在schema属性,请求对象是实体类
                            minfo.schema = true;
                            var schemaObject = m['schema'];
                            var schemaType = schemaObject['type'],
                                ref,
                                className,
                                def;
                            if (schemaType === 'array') {
                                minfo.type = schemaType;
                                var schItem = schemaObject['items'];
                                ref = schItem['$ref'];
                                className = util.getClassName(ref);
                                minfo.schemaValue = className;
                                def = util.getDefinitionByName(currentInstance, className);
                                if (def != null) {
                                    minfo.def = def;
                                    minfo.value = def.value;
                                    if (
                                        def.description !== undefined &&
                                        def.description !== null &&
                                        def.description !== ''
                                    ) {
                                        minfo.description = util.replaceMultipLineStr(def.description);
                                    }
                                } else {
                                    var sty = schItem['type'];
                                    minfo.schemaValue = schItem['type'];
                                    //此处判断Array的类型,如果
                                    if (sty === 'string') {
                                        minfo.value = 'exmpale Value';
                                    }
                                    if (sty === 'integer') {
                                        //判断format
                                        if (
                                            schItem['format'] !== undefined &&
                                            schItem['format'] != null &&
                                            schItem['format'] === 'int32'
                                        ) {
                                            minfo.value = 0;
                                        } else {
                                            // eslint-disable-next-line no-loss-of-precision
                                            minfo.value = 1054661322597744642;
                                        }
                                    }
                                    if (sty === 'number') {
                                        if (
                                            schItem['format'] !== undefined &&
                                            schItem['format'] != null &&
                                            schItem['format'] === 'double'
                                        ) {
                                            minfo.value = 0.5;
                                        } else {
                                            minfo.value = 0;
                                        }
                                    }
                                }
                            } else {
                                if (schemaObject.hasOwnProperty('$ref')) {
                                    ref = m['schema']['$ref'];
                                    className = util.getClassName(ref);
                                    if (minfo.type !== 'array') {
                                        minfo.type = className;
                                    }
                                    minfo.schemaValue = className;
                                    def = util.getDefinitionByName(currentInstance, className);
                                    if (def != null) {
                                        minfo.def = def;
                                        minfo.value = def.value;
                                        if (
                                            def.description !== undefined &&
                                            def.description !== null &&
                                            def.description !== ''
                                        ) {
                                            minfo.description = util.replaceMultipLineStr(def.description);
                                        }
                                    }
                                } else {
                                    //判断是否包含addtionalProperties属性
                                    if (schemaObject.hasOwnProperty('additionalProperties')) {
                                        //判断是否是数组
                                        var addProp = schemaObject['additionalProperties'];
                                        if (addProp.hasOwnProperty('$ref')) {
                                            //object
                                            className = util.getClassName(addProp['$ref']);
                                            if (className != null) {
                                                def = util.getDefinitionByName(currentInstance, className);
                                                if (def != null) {
                                                    minfo.def = def;
                                                    minfo.value = { additionalProperties1: def.value };
                                                    if (
                                                        def.description !== undefined &&
                                                        def.description != null &&
                                                        def.description !== ''
                                                    ) {
                                                        minfo.description = util.replaceMultipLineStr(def.description);
                                                    }
                                                }
                                            }
                                        } else if (addProp.hasOwnProperty('items')) {
                                            //数组
                                            var addItems = addProp['items'];
                                            className = util.getClassName(addItems['$ref']);
                                            if (className != null) {
                                                def = util.getDefinitionByName(currentInstance, className);
                                                if (def != null) {
                                                    var addArrValue = [];
                                                    addArrValue.push(def.value);
                                                    minfo.def = def;
                                                    minfo.value = { additionalProperties1: addArrValue };
                                                    if (
                                                        def.description !== undefined &&
                                                        def.description != null &&
                                                        def.description !== ''
                                                    ) {
                                                        minfo.description = util.replaceMultipLineStr(def.description);
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (schemaObject.hasOwnProperty('type')) {
                                            minfo.type = schemaObject['type'];
                                        }
                                        minfo.value = '';
                                    }
                                }
                            }
                        }
                        if (m.hasOwnProperty('items')) {
                            var items = m['items'];
                            if (items.hasOwnProperty('$ref')) {
                                var refs = items['$ref'];
                                var classNames = util.getClassName(refs);
                                //minfo.type=className;
                                minfo.schemaValue = classNames;
                                var defs = util.getDefinitionByName(currentInstance, classNames);
                                if (defs != null) {
                                    minfo.def = defs;
                                    minfo.value = defs.value;
                                    if (
                                        defs.description !== undefined &&
                                        defs.description != null &&
                                        defs.description !== ''
                                    ) {
                                        minfo.description = util.replaceMultipLineStr(defs.description);
                                    }
                                }
                            } else {
                                if (items.hasOwnProperty('type')) {
                                    //minfo.type=items["type"];
                                    minfo.schemaValue = items['type'];
                                }
                                minfo.value = '';
                            }
                        }
                        if (minfo.in === 'body') {
                            //判断属性是否是array
                            if (minfo.type === 'array') {
                                var txtArr = [];
                                txtArr.push(minfo.value);
                                //JSON显示
                                minfo.txtValue = JSON.stringify(txtArr, null, '\t');
                            } else {
                                //引用类型
                                if (!util.isBasicType(minfo.type)) {
                                    minfo.txtValue = JSON.stringify(minfo.value, null, '\t');
                                }
                            }
                        }
                        if (!util.checkParamArrsExists(swpinfo.parameters, minfo)) {
                            swpinfo.parameters.push(minfo);
                            //判断当前属性是否是schema
                            if (minfo.schema) {
                                this.deepRefParameter(currentInstance, minfo, minfo.def, swpinfo);
                                minfo.parentTypes.push(minfo.schemaValue);
                            }
                        }
                    });
                }
                var definitionType = null;
                var arr = false;
                //解析responsecode
                if (typeof apiInfo.responses != 'undefined' && apiInfo.responses != null) {
                    var resp = apiInfo.responses;
                    var rpcount = 0;
                    for (var status in resp) {
                        var swaggerResp = new Swagger.SwaggerBootstrapUiResponseCode();
                        var rescrobj = resp[status];
                        swaggerResp.code = status;
                        swaggerResp.description = rescrobj['description'];
                        var rptype = null;
                        if (rescrobj.hasOwnProperty('schema')) {
                            var schema = rescrobj['schema'];
                            //单引用类型
                            //判断是否是数组类型
                            var regex = new RegExp('#/definitions/(.*)$', 'ig'),
                                ptype;
                            if (schema.hasOwnProperty('$ref')) {
                                if (regex.test(schema['$ref'])) {
                                    ptype = RegExp.$1;
                                    swpinfo.responseParameterRefName = ptype;
                                    swaggerResp.responseParameterRefName = ptype;
                                    definitionType = ptype;
                                    rptype = ptype;
                                    swaggerResp.schema = ptype;
                                }
                            } else if (schema.hasOwnProperty('type')) {
                                var t = schema['type'];
                                if (t === 'array') {
                                    arr = true;
                                    if (schema.hasOwnProperty('items')) {
                                        var items = schema['items'];
                                        var itref = items['$ref'];
                                        //此处需判断items是否数组
                                        if (items.hasOwnProperty('type')) {
                                            if (items['type'] === 'array') {
                                                itref = items['items']['$ref'];
                                            }
                                        }
                                        if (regex.test(itref)) {
                                            ptype = RegExp.$1;
                                            swpinfo.responseParameterRefName = ptype;
                                            swaggerResp.responseParameterRefName = ptype;
                                            definitionType = ptype;
                                            rptype = ptype;
                                            swaggerResp.schema = ptype;
                                        }
                                    }
                                } else {
                                    //判断是否存在properties属性
                                    if (schema.hasOwnProperty('properties')) {
                                        swaggerResp.schema = t;
                                        //自定义类型、放入difarrs对象中
                                        var swud = new Swagger.SwaggerBootstrapUiDefinition();
                                        swud.name = swpinfo.id;
                                        swud.description = '自定义Schema';
                                        definitionType = swud.name;
                                        rptype = swud.name;
                                        swaggerResp.responseParameterRefName = swud.name;

                                        var properties = schema['properties'];
                                        var defiTypeValue = {};
                                        for (var property in properties) {
                                            var spropObj = new Swagger.SwaggerBootstrapUiProperty();
                                            spropObj.name = property;
                                            var propobj = properties[property];
                                            spropObj.originProperty = propobj;
                                            spropObj.type = propobj.type ?? 'string';
                                            spropObj.description = propobj.description ?? '';
                                            spropObj.example = propobj.example ?? '';
                                            spropObj.format = propobj.format ?? '';
                                            spropObj.required = propobj.required ?? false;
                                            if (swud.required.includes(spropObj.name)) {
                                                //有required属性,需要再判断一次
                                                spropObj.required = true;
                                            }
                                            //默认string类型
                                            var propValue = '';
                                            //判断是否有类型
                                            if (propobj.hasOwnProperty('type')) {
                                                var type = propobj['type'];
                                                //判断是否有example
                                                if (propobj.hasOwnProperty('example')) {
                                                    if (type === 'string') {
                                                        propValue = String(propobj.example ?? '');
                                                    } else {
                                                        propValue = propobj['example'];
                                                    }
                                                } else if (util.isBasicType(type)) {
                                                    propValue = util.getBasicTypeValue(type);
                                                }
                                            }
                                            spropObj.value = propValue;
                                            //判断是否有format,如果是integer,判断是64位还是32位
                                            if (
                                                spropObj.format !== null &&
                                                spropObj.format !== undefined &&
                                                spropObj.format !== ''
                                            ) {
                                                //spropObj.type=spropObj.format;
                                                spropObj.type += '(' + spropObj.format + ')';
                                            }
                                            swud.properties.push(spropObj);
                                            defiTypeValue[property] = propValue;
                                        }
                                        swud.value = defiTypeValue;
                                        currentInstance.difArrs.push(swud);
                                    } else {
                                        //判断是否是基础类型
                                        if (util.isBasicType(t)) {
                                            //基础类型
                                            swpinfo.responseText = t;
                                            swpinfo.responseBasicType = true;

                                            //响应状态码的响应内容
                                            swaggerResp.responseText = t;
                                            swaggerResp.responseBasicType = true;
                                        }
                                    }
                                }
                            }
                        }
                        if (rptype != null) {
                            //查询
                            for (var diff = 0; diff < currentInstance.difArrs.length; diff++) {
                                var difRef = currentInstance.difArrs[diff];
                                if (difRef.name === rptype) {
                                    if (arr) {
                                        var nas = [];
                                        nas.push(difRef.value);
                                        swaggerResp.responseValue = JSON.stringify(nas, null, '\t');
                                        swaggerResp.responseJson = nas;
                                    } else {
                                        swaggerResp.responseValue = JSON.stringify(difRef.value, null, '\t');
                                        swaggerResp.responseJson = difRef.value;
                                    }
                                }
                            }
                            //响应参数
                            var def = util.getDefinitionByName(currentInstance, rptype);
                            if (def != null) {
                                if (def.hasOwnProperty('properties')) {
                                    var props = def['properties'];
                                    $.each(props, (i, p) => {
                                        var resParam = new Swagger.SwaggerBootstrapUiParameter(),
                                            deepDef;
                                        resParam.name = p.name;
                                        if (!util.checkParamArrsExists(swaggerResp.responseParameters, resParam)) {
                                            swaggerResp.responseParameters.push(resParam);
                                            resParam.description = util.replaceMultipLineStr(p.description);
                                            if (p.type == null || p.type === '') {
                                                if (p.refType != null) {
                                                    if (!util.isBasicType(p.refType)) {
                                                        resParam.schemaValue = p.refType;
                                                        //存在引用类型,修改默认type
                                                        resParam.type = p.refType;
                                                        deepDef = util.getDefinitionByName(currentInstance, p.refType);
                                                        this.deepResponseRefParameter(swaggerResp, deepDef, resParam);
                                                        resParam.parentTypes.push(p.refType);
                                                    }
                                                }
                                            } else {
                                                resParam.type = p.type;
                                                if (!util.isBasicType(p.type)) {
                                                    if (p.refType != null) {
                                                        if (!util.isBasicType(p.refType)) {
                                                            resParam.schemaValue = p.refType;
                                                            //存在引用类型,修改默认type
                                                            if (p.type !== 'array') {
                                                                resParam.type = p.refType;
                                                            }
                                                            deepDef = util.getDefinitionByName(
                                                                currentInstance,
                                                                p.refType
                                                            );
                                                            this.deepResponseRefParameter(
                                                                swaggerResp,
                                                                deepDef,
                                                                resParam
                                                            );
                                                            resParam.parentTypes.push(p.refType);
                                                        }
                                                    } else {
                                                        resParam.schemaValue = p.type;
                                                        //存在引用类型,修改默认type
                                                        resParam.type = p.type;
                                                        deepDef = util.getDefinitionByName(currentInstance, p.type);
                                                        this.deepResponseRefParameter(swaggerResp, deepDef, resParam);
                                                        resParam.parentTypes.push(p.type);
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }

                        if (swaggerResp.schema !== null && swaggerResp.schema !== undefined) {
                            rpcount = rpcount + 1;
                        }
                        swpinfo.responseCodes.push(swaggerResp);
                    }
                    swpinfo.multipartResponseSchemaCount = rpcount;
                    if (rpcount > 1) {
                        swpinfo.multipartResponseSchema = true;
                    }
                }

                if (definitionType != null && !swpinfo.multipartResponseSchema) {
                    //查询
                    for (var difArr = 0; difArr < currentInstance.difArrs.length; difArr++) {
                        var ref = currentInstance.difArrs[difArr];
                        if (ref.name === definitionType) {
                            if (arr) {
                                var na = [];
                                na.push(ref.value);
                                swpinfo.responseValue = JSON.stringify(na, null, '\t');
                                swpinfo.responseJson = na;
                            } else {
                                swpinfo.responseValue = JSON.stringify(ref.value, null, '\t');
                                swpinfo.responseJson = ref.value;
                            }
                        }
                    }
                    //响应参数
                    var defName = util.getDefinitionByName(currentInstance, definitionType);
                    if (defName != null) {
                        if (defName.hasOwnProperty('properties')) {
                            var propName = defName['properties'];
                            $.each(propName, (i, p) => {
                                var resParam = new Swagger.SwaggerBootstrapUiParameter(),
                                    deepDefs;
                                resParam.name = p.name;
                                if (!util.checkParamArrsExists(swpinfo.responseParameters, resParam)) {
                                    swpinfo.responseParameters.push(resParam);
                                    resParam.description = util.replaceMultipLineStr(p.description);
                                    if (p.type == null || p.type === '') {
                                        if (p.refType != null) {
                                            if (!util.isBasicType(p.refType)) {
                                                resParam.schemaValue = p.refType;
                                                //存在引用类型,修改默认type
                                                resParam.type = p.refType;
                                                deepDefs = util.getDefinitionByName(currentInstance, p.refType);
                                                this.deepResponseRefParameter(swpinfo, deepDefs, resParam);
                                                resParam.parentTypes.push(p.refType);
                                            }
                                        }
                                    } else {
                                        resParam.type = p.type;
                                        if (!util.isBasicType(p.type)) {
                                            if (p.refType != null) {
                                                if (!util.isBasicType(p.refType)) {
                                                    resParam.schemaValue = p.refType;
                                                    //存在引用类型,修改默认type
                                                    if (p.type !== 'array') {
                                                        resParam.type = p.refType;
                                                    }
                                                    deepDefs = util.getDefinitionByName(currentInstance, p.refType);
                                                    this.deepResponseRefParameter(swpinfo, deepDefs, resParam);
                                                    resParam.parentTypes.push(p.refType);
                                                }
                                            } else {
                                                resParam.schemaValue = p.type;
                                                //存在引用类型,修改默认type
                                                resParam.type = p.type;
                                                deepDefs = util.getDefinitionByName(currentInstance, p.type);
                                                this.deepResponseRefParameter(swpinfo, deepDefs, resParam);
                                                resParam.parentTypes.push(p.type);
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
                // currentInstance.paths.push(swpinfo);
                for (var tag = 0; tag < apiInfo.tags.length; tag++) {
                    var tagName = apiInfo.tags[tag];
                    this.mergeApiInfoSelfTags(currentInstance, tagName);
                }
            }
            //获取请求json
            //统计body次数
            if (swpinfo.parameters != null) {
                var count = 0;
                var tmpJsonValue = null;
                $.each(swpinfo.parameters, function (i, p) {
                    if (p.in === 'body') {
                        count = count + 1;
                        if (p.txtValue != null && p.txtValue !== '') {
                            tmpJsonValue = p.txtValue;
                        }
                    }
                });
                if (count === 1) {
                    swpinfo.requestValue = tmpJsonValue;
                }
                //此处判断接口的请求参数类型
                //判断consumes请求类型
                var defaultType, defaultValue, pt;
                if (
                    apiInfo &&
                    apiInfo.consumes !== undefined &&
                    apiInfo.consumes !== null &&
                    apiInfo.consumes.length > 0
                ) {
                    var ctp = apiInfo.consumes[0];
                    if (ctp === 'multipart/form-data') {
                        swpinfo.contentType = ctp;
                        swpinfo.contentValue = 'form-data';
                    } else if (ctp === 'text/plain') {
                        swpinfo.contentType = ctp;
                        swpinfo.contentValue = 'raw';
                        swpinfo.contentShowValue = 'Text(text/plain)';
                    } else {
                        //根据参数遍历,否则默认是表单x-www-form-urlencoded类型
                        defaultType = 'application/x-www-form-urlencoded;charset=UTF-8';
                        defaultValue = 'x-www-form-urlencoded';
                        for (var parameter = 0; parameter < swpinfo.parameters.length; parameter++) {
                            pt = swpinfo.parameters[parameter];
                            if (pt.in === 'body') {
                                if (pt.schemaValue === 'MultipartFile') {
                                    defaultType = 'multipart/form-data';
                                    defaultValue = 'form-data';
                                    break;
                                } else {
                                    defaultValue = 'raw';
                                    defaultType = 'application/json';
                                    break;
                                }
                            } else {
                                if (pt.schemaValue === 'MultipartFile') {
                                    defaultType = 'multipart/form-data';
                                    defaultValue = 'form-data';
                                    break;
                                }
                            }
                        }
                        swpinfo.contentType = defaultType;
                        swpinfo.contentValue = defaultValue;
                    }
                } else {
                    //根据参数遍历,否则默认是表单x-www-form-urlencoded类型
                    defaultType = 'application/x-www-form-urlencoded;charset=UTF-8';
                    defaultValue = 'x-www-form-urlencoded';
                    for (var i = 0; i < swpinfo.parameters.length; i++) {
                        pt = swpinfo.parameters[i];
                        if (pt.in === 'body') {
                            if (pt.schemaValue === 'MultipartFile') {
                                defaultType = 'multipart/form-data';
                                defaultValue = 'form-data';
                                break;
                            } else {
                                defaultValue = 'raw';
                                defaultType = 'application/json';
                                break;
                            }
                        } else {
                            if (pt.schemaValue === 'MultipartFile') {
                                defaultType = 'multipart/form-data';
                                defaultValue = 'form-data';
                                break;
                            }
                        }
                    }
                    swpinfo.contentType = defaultType;
                    swpinfo.contentValue = defaultValue;
                }
            }
            return swpinfo;
        }

        /***
         * 计数
         * @param method
         */
        methodCountAndDown(currentInstance, method) {
            const find = currentInstance.pathArrs.find((a) => a.method === method);

            if (find) {
                //计数加1
                find.count += 1;
            } else {
                const me = new Swagger.SwaggerBootstrapUiPathCountDownLatch();
                me.method = method;
                me.count = 1;
                currentInstance.pathArrs.push(me);
            }
        }

        /***
         * 递归查询
         * @param minfo
         * @param def
         * @param apiInfo
         */
        deepRefParameter(currentInstance, minfo, def, apiInfo) {
            if (!def) return;
            var refParam = new Swagger.SwaggerBootstrapUiRefParameter();
            refParam.name = def.name;
            if (!util.checkParamArrsExists(apiInfo.refparameters, refParam)) {
                apiInfo.refparameters.push(refParam);
                if (def.hasOwnProperty('properties')) {
                    var props = def['properties'];
                    $.each(props, (i, p) => {
                        //如果当前属性为readOnly，则不加入
                        if (!p.readOnly) {
                            var refp = new Swagger.SwaggerBootstrapUiParameter();
                            refp.pid = minfo.id;
                            refp.name = p.name;
                            refp.type = p.type;
                            //判断非array
                            if (p.type !== 'array') {
                                if (p.refType !== null && p.refType !== undefined && p.refType !== '') {
                                    //修复针对schema类型的参数,显示类型为schema类型
                                    refp.type = p.refType;
                                }
                            }
                            refp.in = minfo.in;
                            refp.require = p.required;
                            refp.description = util.replaceMultipLineStr(p.description);
                            refParam.params.push(refp);
                            //判断类型是否基础类型
                            if (!util.isBasicType(p.refType)) {
                                refp.schemaValue = p.refType;
                                refp.schema = true;
                                //属性名称不同,或者ref类型不同
                                if (minfo.name !== refp.name || minfo.schemaValue !== p.refType) {
                                    var deepDef = util.getDefinitionByName(currentInstance, p.refType);
                                    this.deepRefParameter(currentInstance, refp, deepDef, apiInfo);
                                }
                            }
                        }
                    });
                }
            }
        }
    }

    return RestDoc;
});
