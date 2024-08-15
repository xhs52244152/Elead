define([
    'text!' + ELMP.resource('platform-api/components/CompareDoc/rest/index.html'),
    ELMP.resource('platform-api/util/swagger.js'),
    ELMP.resource('platform-api/util/index.js'),
    '/erdc-thirdparty/platform/jquery-plugins/htmldiff.js',
    'css!' + ELMP.resource('platform-api/components/CompareDoc/index.css')
], function (template, Swagger, util) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        data() {
            return {
                addTableData: [],
                delTableData: [],
                changeArr: {},
                currentInstance: {
                    pathArrs: [],
                    paths: [],
                    difArrs: [],
                    tags: [],
                    baseUrl: '',
                    securityArrs: [],
                    pathsDictionary: {}
                },
                requestTableData: [],
                responseTableData: [],
                diffHtml: '',
                compareTable: true
            };
        },
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        mounted() {
            this.initTableData();
        },
        computed: {
            addColumn() {
                return [
                    {
                        prop: 'tags', // 属性名
                        title: '模块', // 字段名
                        minWidth: 250
                    },
                    {
                        prop: 'methodType', // 属性名
                        title: '请求方式', // 字段名
                        minWidth: 250
                    },
                    {
                        prop: 'url', // 属性名
                        title: 'url', // 字段名
                        minWidth: 250
                    },
                    {
                        prop: 'description', // 属性名
                        title: '描述', // 字段名
                        minWidth: 250
                    }
                ];
            },
            isShowChange() {
                return this.changeArr.detail?.length > 0 && this.changeArr.info?.length > 0;
            },
            nameList() {
                const list = this.$route.params.list;
                const baseId = this.$route.params.baseId;
                const newId = this.$route.params.newId;
                return {
                    baseName: list?.find((item) => item.value === baseId)?.label,
                    newName: list?.find((item) => item.value === newId)?.label
                };
            }
        },
        beforeRouteEnter(to, from, next) {
            if (from.path === '/') {
                next((vm) => {
                    vm.goBack();
                });
            } else {
                next();
            }
        },
        methods: {
            goBack() {
                const query = {
                    serviceName: this.$route.query.serviceName,
                    appName: this.$route.query.appName,
                    docType: this.$route.query.docType,
                    title: 'Rest 接口' + this.$route.query.serviceName
                };
                this.$router.push({
                    name: 'interfaceDoc',
                    query
                });
            },
            initTableData() {
                this.$famHttp('/common/apiauth/v1/doc/change/report', {
                    method: 'GET',
                    params: {
                        docType: this.$route.query.docType,
                        baseId: this.$route.params.baseId,
                        newId: this.$route.params.newId
                    }
                }).then((res) => {
                    let menu = null;
                    if (typeof res.data == 'string') {
                        menu = JSON.parse(res.data);
                    } else {
                        menu = res.data;
                    }
                    let old = '';
                    if (menu !== null && Object.keys(menu).length) {
                        old = Object.keys(menu.add)?.[0];
                        this.addTableData = this.dealTableData(menu.add);
                        this.delTableData = this.dealTableData(menu.del);
                        this.changeArr = this.dealChangeData(menu.change, old);
                        this.$nextTick(() => {
                            const changeTableOldList = Array.from(document.querySelectorAll('.change-table-old'));
                            const changeTableNewList = Array.from(document.querySelectorAll('.change-table-new'));
                            changeTableOldList.forEach((element, index) => {
                                const htmlDiffItem = window.getHTMLDiff(
                                    element.innerHTML,
                                    changeTableNewList[index].innerHTML
                                );
                                this.diffHtml += htmlDiffItem;
                            });
                            this.compareTable = false;
                        });
                    }
                });
            },
            downHtml() {
                const _this = this;
                const eleTitle = document.querySelector('.compare-doc-title');
                const eleTextarea = document.querySelector('.compare-doc-body');
                const htmlList = eleTitle.innerHTML + eleTextarea.innerHTML;
                require([
                    'text!' + ELMP.resource('platform-api/components/CompareDoc/index.css'),
                    'text!' + '/erdc-thirdparty/platform/@erdcloud/erdcloud-ui/lib/erdcloud-ui.theme.css'
                ], function (cssStr, erdcloudCss) {
                    const html =
                        '<meta charset="UTF-8">' +
                        '<style>' +
                        erdcloudCss +
                        '</style>' +
                        '<style>' +
                        cssStr +
                        '</style>' +
                        htmlList;
                    _this.funDownload(html, 'compare-doc.html');
                });
            },
            funDownload: function (content, filename) {
                let eleLink = document.createElement('a');
                eleLink.download = filename;
                eleLink.style.display = 'none';
                // 字符内容转变成blob地址
                const blob = new Blob([content]);
                eleLink.href = URL.createObjectURL(blob);
                // 触发点击
                document.body.appendChild(eleLink);
                eleLink.click();
                // 然后移除
                document.body.removeChild(eleLink);
            },
            dealTableData(data) {
                let table = [];
                let pathList = [];
                const version = Object.keys(data)?.[0];
                if (version) {
                    if (_.isEmpty(data[version])) {
                        return table;
                    } else {
                        pathList = data[version].paths;
                    }
                    for (const key in pathList) {
                        let obj = {};
                        if (pathList.hasOwnProperty(key)) {
                            obj.url = key;
                            const item = pathList[key];
                            if (typeof item === 'object') {
                                for (const temp in item) {
                                    obj.methodType = temp;
                                    const value = item[temp];
                                    obj.description = value.summary;
                                    obj.tags = value.tags[0];
                                }
                            }
                        }
                        table.push(obj);
                    }
                    return table;
                } else {
                    return table;
                }
            },
            dealChangeData(data, oldVersion) {
                let changePaths = [];
                let changeDefinitions = [];
                let changeArr = {
                    info: [],
                    detail: []
                };
                for (const version in data) {
                    if (_.isEmpty(data[version])) {
                        return changeArr;
                    }
                    if (version === oldVersion) {
                        changePaths.unshift(data[version].paths);
                        changeDefinitions.unshift(data[version].definitions);
                    } else {
                        changePaths.push(data[version].paths);
                        changeDefinitions.push(data[version].definitions);
                    }
                }
                const oldDefinitions = this.getDefinitions(changeDefinitions[1]);
                const newDefinitions = this.getDefinitions(changeDefinitions[0]);
                const baseVersionPaths = this.getPaths(changePaths[1], oldDefinitions);
                const newVersionPaths = this.getPaths(changePaths[0], newDefinitions);
                for (const changeIndex in baseVersionPaths) {
                    // 放入请求参数和响应参数
                    changeArr.info.push(newVersionPaths[changeIndex]);
                    changeArr.detail.push([
                        {
                            old: baseVersionPaths[changeIndex].summary,
                            new: newVersionPaths[changeIndex].summary
                        },
                        {
                            old: baseVersionPaths[changeIndex].parameters,
                            new: newVersionPaths[changeIndex].parameters
                        },
                        {
                            old: baseVersionPaths[changeIndex].responseParameters,
                            new: newVersionPaths[changeIndex].responseParameters
                        },
                        {
                            old: baseVersionPaths[changeIndex].description,
                            new: newVersionPaths[changeIndex].description
                        },
                        {
                            old: baseVersionPaths[changeIndex].deprecated ? '是' : '否',
                            new: newVersionPaths[changeIndex].deprecated ? '是' : '否'
                        }
                    ]);
                }
                return changeArr;
            },
            getPaths(data, resParams) {
                const _this = this;
                const _supportMethods = [
                    'GET',
                    'POST',
                    'PUT',
                    'DELETE',
                    'PATCH',
                    'OPTIONS',
                    'TRACE',
                    'HEAD',
                    'CONNECT'
                ];
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const path = data[key];
                        let apiInfo = null;
                        _supportMethods.forEach((method, index) => {
                            if (path.hasOwnProperty(method)) {
                                apiInfo = path[method];
                                if (apiInfo != null) {
                                    const ins = _this.createApiInfoInstance(key, method, apiInfo, resParams);
                                    this.currentInstance.paths.push(ins);
                                    _this.methodCountAndDown(method.toUpperCase());
                                }
                            }
                        });
                    }
                }
                //paths属性去重
                const arr = this.currentInstance.paths;
                let array = [];
                let newArr = [];
                for (let i = 0; i < arr.length; i++) {
                    if (!array.includes(arr[i].url + arr[i].methodType)) {
                        newArr.push(arr[i]);
                        array.push(arr[i].url + arr[i].methodType);
                    }
                }
                this.currentInstance.paths = [];
                return newArr;
            },
            getDefinitions(data) {
                this.currentInstance.difArrs = [];
                const _this = this;
                const definitions = data;
                //改用async的for循环
                for (const name in definitions) {
                    let swud = new Swagger.SwaggerBootstrapUiDefinition();
                    swud.name = name;
                    //获取value
                    const value = definitions[name];
                    if (_this.checkUndefined(value)) {
                        swud.description = _this.propValue('description', value, '');
                        swud.type = _this.propValue('type', value, '');
                        swud.title = _this.propValue('title', value, '');
                        //判断是否有required属性
                        if (value.hasOwnProperty('required')) {
                            swud.required = value['required'];
                        }
                        //是否有properties
                        if (value.hasOwnProperty('properties')) {
                            const properties = value['properties'];
                            const defiTypeValue = {};
                            for (const property in properties) {
                                const propobj = properties[property];
                                //判断是否包含readOnly属性
                                if (!propobj.hasOwnProperty('readOnly') || !propobj['readOnly']) {
                                }
                                let spropObj = new Swagger.SwaggerBootstrapUiProperty();
                                //赋值readOnly属性
                                if (propobj.hasOwnProperty('readOnly')) {
                                    spropObj.readOnly = propobj['readOnly'];
                                }
                                spropObj.name = property;
                                spropObj.originProperty = propobj;
                                spropObj.type = _this.propValue('type', propobj, 'string');
                                spropObj.description = _this.propValue('description', propobj, '');
                                //判断是否包含枚举
                                if (propobj.hasOwnProperty('enum')) {
                                    spropObj.enum = propobj['enum'];
                                    if (spropObj.description != '') {
                                        spropObj.description += ',';
                                    }
                                    spropObj.description = spropObj.description + '可用值:' + spropObj.enum.join(',');
                                }
                                if (spropObj.type == 'string') {
                                    spropObj.example = String(_this.propValue('example', propobj, ''));
                                } else {
                                    spropObj.example = _this.propValue('example', propobj, '');
                                }

                                spropObj.format = _this.propValue('format', propobj, '');
                                spropObj.required = _this.propValue('required', propobj, false);
                                if (swud.required.length > 0) {
                                    //有required属性,需要再判断一次
                                    if ($.inArray(spropObj.name, swud.required) > -1) {
                                        //存在
                                        spropObj.required = true;
                                    }
                                }
                                //默认string类型
                                let propValue = '';
                                //判断是否有类型
                                if (propobj.hasOwnProperty('type')) {
                                    const type = propobj['type'];
                                    //判断是否有example
                                    if (propobj.hasOwnProperty('example')) {
                                        if (type == 'string') {
                                            propValue = String(_this.propValue('example', propobj, ''));
                                        } else {
                                            propValue = propobj['example'];
                                        }
                                    } else if (_this.checkIsBasicType(type)) {
                                        propValue = util.getBasicTypeValue(type);
                                        //此处如果是object情况,需要判断additionalProperties属性的情况
                                        if (type == 'object') {
                                            if (propobj.hasOwnProperty('additionalProperties')) {
                                                const addpties = propobj['additionalProperties'];
                                                //判断是否有ref属性,如果有,存在引用类,否则默认是{}object的情况
                                                if (addpties.hasOwnProperty('$ref')) {
                                                    const adref = addpties['$ref'];
                                                    const regex = new RegExp('#/definitions/(.*)$', 'ig');
                                                    if (regex.test(adref)) {
                                                        const addrefType = RegExp.$1;
                                                        let addTempValue = null;
                                                        //这里需要递归判断是否是本身,如果是,则退出递归查找
                                                        const globalArr = [];
                                                        //添加类本身
                                                        globalArr.push(name);

                                                        if (addrefType != name) {
                                                            addTempValue = _this.findRefDefinition(
                                                                addrefType,
                                                                definitions,
                                                                false,
                                                                globalArr
                                                            );
                                                        } else {
                                                            addTempValue = _this.findRefDefinition(
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
                                                    const addPropItems = addpties['items'];

                                                    const adref = addPropItems['$ref'];
                                                    const regex = new RegExp('#/definitions/(.*)$', 'ig');
                                                    if (regex.test(adref)) {
                                                        const addrefType = RegExp.$1;
                                                        let addTempValue = null;
                                                        //这里需要递归判断是否是本身,如果是,则退出递归查找
                                                        const globalArr = [];
                                                        //添加类本身
                                                        globalArr.push(name);

                                                        if (addrefType != name) {
                                                            addTempValue = _this.findRefDefinition(
                                                                addrefType,
                                                                definitions,
                                                                false,
                                                                globalArr
                                                            );
                                                        } else {
                                                            addTempValue = _this.findRefDefinition(
                                                                addrefType,
                                                                definitions,
                                                                true,
                                                                name,
                                                                globalArr
                                                            );
                                                        }
                                                        const tempAddValue = [];
                                                        tempAddValue.push(addTempValue);
                                                        propValue = { additionalProperties1: tempAddValue };
                                                        spropObj.type = 'array';
                                                        spropObj.refType = addrefType;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (type == 'array') {
                                            propValue = [];
                                            const items = propobj['items'];
                                            let ref = items['$ref'];
                                            //此处有可能items是array
                                            if (items.hasOwnProperty('type')) {
                                                if (items['type'] == 'array') {
                                                    ref = items['items']['$ref'];
                                                }
                                            }
                                            //判断是否存在枚举
                                            if (items.hasOwnProperty('enum')) {
                                                if (spropObj.description != '') {
                                                    spropObj.description += ',';
                                                }
                                                spropObj.description =
                                                    spropObj.description + '可用值:' + items['enum'].join(',');
                                            }
                                            const regex = new RegExp('#/definitions/(.*)$', 'ig');
                                            if (regex.test(ref)) {
                                                const refType = RegExp.$1;
                                                spropObj.refType = refType;
                                                //这里需要递归判断是否是本身,如果是,则退出递归查找
                                                const globalArr = [];
                                                //添加类本身
                                                globalArr.push(name);
                                                if (refType != name) {
                                                    propValue.push(
                                                        _this.findRefDefinition(refType, definitions, false, globalArr)
                                                    );
                                                } else {
                                                    propValue.push(
                                                        _this.findRefDefinition(
                                                            refType,
                                                            definitions,
                                                            true,
                                                            name,
                                                            globalArr
                                                        )
                                                    );
                                                }
                                            } else {
                                                //schema基础类型显示
                                                spropObj.refType = items['type'];
                                            }
                                        }
                                    }
                                } else {
                                    if (propobj.hasOwnProperty('$ref')) {
                                        const ref = propobj['$ref'];
                                        const regex = new RegExp('#/definitions/(.*)$', 'ig');
                                        if (regex.test(ref)) {
                                            const refType = RegExp.$1;
                                            spropObj.refType = refType;
                                            //这里需要递归判断是否是本身,如果是,则退出递归查找
                                            const globalArr = [];
                                            //添加类本身
                                            globalArr.push(name);
                                            if (refType != name) {
                                                propValue = _this.findRefDefinition(
                                                    refType,
                                                    definitions,
                                                    false,
                                                    globalArr
                                                );
                                            } else {
                                                propValue = _this.findRefDefinition(
                                                    refType,
                                                    definitions,
                                                    true,
                                                    globalArr
                                                );
                                            }
                                        }
                                    } else {
                                        propValue = {};
                                    }
                                }
                                spropObj.value = propValue;
                                //判断是否有format,如果是integer,判断是64位还是32位
                                if (spropObj.format != null && spropObj.format != undefined && spropObj.format != '') {
                                    //spropObj.type=spropObj.format;
                                    spropObj.type += '(' + spropObj.format + ')';
                                }
                                //判断最终类型
                                if (spropObj.refType != null && spropObj.refType != '') {
                                    //判断基础类型,非数字类型
                                    if (spropObj.type == 'string') {
                                        spropObj.type = spropObj.refType;
                                    }
                                }
                                //addprop
                                //这里判断去重
                                if (!util.checkPropertiesExists(swud.properties, spropObj)) {
                                    swud.properties.push(spropObj);
                                    //如果当前属性readOnly=true，则实体类value排除此属性的值
                                    if (!spropObj.readOnly) {
                                        defiTypeValue[property] = propValue;
                                    }
                                }
                            }
                            swud.value = defiTypeValue;
                        }
                    }
                    this.currentInstance.difArrs.push(swud);
                }
                return this.currentInstance.difArrs;
            },
            getValue: function (obj, key, defaultValue, checkEmpty) {
                let val = defaultValue;
                if (obj != null && obj != undefined) {
                    if (obj.hasOwnProperty(key)) {
                        val = obj[key];
                        if (checkEmpty) {
                            if (val == null || val == '') {
                                val = defaultValue;
                            }
                        }
                    }
                }
                return val;
            },
            checkUndefined: function (obj) {
                let flag = false;
                if (obj != null && typeof obj != 'undefined') {
                    flag = true;
                }
                return flag;
            },
            propValue: function (key, obj, defaultValue) {
                let t = defaultValue;
                if (obj.hasOwnProperty(key)) {
                    t = obj[key];
                }
                return t;
            },
            checkIsBasicType: function (type) {
                const basicTypes = [
                    'string',
                    'integer',
                    'number',
                    'object',
                    'boolean',
                    'int32',
                    'int64',
                    'float',
                    'double'
                ];
                let flag = false;
                if (type != null) {
                    if ($.inArray(type, basicTypes) > -1) {
                        flag = true;
                    }
                }
                return flag;
            },
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
                                            propValue.push(
                                                this.findRefDefinition(refType, definitions, flag, globalArr)
                                            );
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
            },
            createApiInfoInstance: function (path, mtype, apiInfo, resParams) {
                const that = this;
                const { currentInstance } = that;
                const swpinfo = new Swagger.SwaggerBootstrapUiApiInfo();
                //添加basePath
                const basePath = '/';
                let newfullPath = '';
                let basePathFlag = false;
                //basePath="/addd/";
                if (basePath != '' && basePath != '/') {
                    newfullPath += basePath;
                    //如果非空,非根目录
                    basePathFlag = true;
                }
                newfullPath += path;
                //截取字符串
                let newurl = newfullPath.substring(newfullPath.indexOf('/'));
                newurl = newurl.replace('//', '/');
                //判断应用实例的baseurl
                if (currentInstance.baseUrl != '' && currentInstance.baseUrl != '/') {
                    newurl = currentInstance.baseUrl + newurl;
                }
                swpinfo.showUrl = newurl;
                swpinfo.url = newurl;
                swpinfo.originalUrl = newurl;
                swpinfo.basePathFlag = basePathFlag;
                swpinfo.methodType = mtype.toUpperCase();
                //接口id使用MD5策略,缓存整个调试参数到localStorage对象中,供二次调用
                const md5Str = newurl + mtype.toUpperCase();
                if (apiInfo != null) {
                    if (apiInfo.hasOwnProperty('deprecated')) {
                        swpinfo.deprecated = apiInfo['deprecated'];
                    }
                    if (!apiInfo.tags) {
                        apiInfo.tags = ['default'];
                    }
                    swpinfo.description = that.getValue(apiInfo, 'description', '', true);
                    swpinfo.operationId = apiInfo.operationId;
                    swpinfo.summary = apiInfo.summary;
                    swpinfo.tags = apiInfo.tags;
                    //operationId
                    swpinfo.operationId = that.getValue(apiInfo, 'operationId', '', true);
                    const _groupName = currentInstance.name;
                    //设置hashurl
                    swpinfo.produces = apiInfo.produces;
                    if (apiInfo.hasOwnProperty('parameters')) {
                        const pameters = apiInfo['parameters'];
                        $.each(pameters, function (i, m) {
                            const minfo = new Swagger.SwaggerBootstrapUiParameter();
                            minfo.name = that.propValue('name', m, '');
                            minfo.type = that.propValue('type', m, '');
                            minfo.in = that.propValue('in', m, '');
                            minfo.require = that.propValue('required', m, false);
                            minfo.description = that.replaceMultipLineStr(that.propValue('description', m, ''));
                            //判断是否有枚举类型
                            if (m.hasOwnProperty('enum')) {
                                minfo.enum = m.enum;
                                //枚举类型,描述显示可用值
                                const avaiableArrStr = m.enum.join(',');
                                if (m.description != null && m.description != undefined && m.description != '') {
                                    minfo.description = m.description + ',可用值:' + avaiableArrStr;
                                } else {
                                    minfo.description = '枚举类型,可用值:' + avaiableArrStr;
                                }
                            }
                            swpinfo.parameters.push(minfo);
                        });
                    }
                    apiInfo.resOriginalRef = '';
                    if (apiInfo.responses['200'].hasOwnProperty('schema')) {
                        const schema = apiInfo.responses['200'].schema;
                        if (schema.originalRef) {
                            apiInfo.resOriginalRef = schema.originalRef;
                        } else if (schema.items && schema.items.originalRef) {
                            apiInfo.resOriginalRef = schema.items.originalRef;
                        }
                    }
                    if (apiInfo.hasOwnProperty('resOriginalRef')) {
                        $.each(resParams, function (item, dif) {
                            if (dif.name === apiInfo.resOriginalRef) {
                                swpinfo.responseParameters = dif.properties;
                            }
                        });
                    }
                    //解析responsecode
                    for (let i = 0; i < apiInfo.tags.length; i++) {
                        const tagName = apiInfo.tags[i];
                        that.mergeApiInfoSelfTags(tagName);
                    }
                }
                return swpinfo;
            },
            replaceMultipLineStr: function (str) {
                if (str != null && str != undefined && str != '') {
                    const newLinePattern = /(\r\n|\n\r|\r|\n)/g;
                    if (newLinePattern.test(str)) {
                        const newDes = str.replace(newLinePattern, '\\n');
                        return newDes;
                    }
                    return str;
                }
                return '';
            },
            mergeApiInfoSelfTags: function (name) {
                let flag = false;
                this.currentInstance.tags.forEach((item) => {
                    if (item.name == name) {
                        flag = true;
                    }
                });
                if (!flag) {
                    const ntag = new Swagger.SwaggerBootstrapUiTag(name, name);
                    this.currentInstance.tags.push(ntag);
                }
            },
            methodCountAndDown: function (method) {
                let flag = false;
                this.currentInstance.pathArrs.forEach((item) => {
                    if (item.method == method) {
                        flag = true;
                        //计数加1
                        item.count = item.count + 1;
                    }
                });
                if (!flag) {
                    const me = new Swagger.SwaggerBootstrapUiPathCountDownLatch();
                    me.method = method;
                    me.count = 1;
                    this.currentInstance.pathArrs.push(me);
                }
            }
        }
    };
});
