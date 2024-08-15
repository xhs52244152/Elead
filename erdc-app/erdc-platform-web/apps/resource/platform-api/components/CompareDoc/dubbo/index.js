define([
    'text!' + ELMP.resource('platform-api/components/CompareDoc/dubbo/index.html'),
    ELMP.resource('platform-api/util/swagger.js'),
    '/erdc-thirdparty/platform/jquery-plugins/htmldiff.js',
    'css!' + ELMP.resource('platform-api/components/CompareDoc/index.css')
], function (template, Swagger) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
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
                        prop: 'url', // 属性名
                        title: '方法', // 字段名
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
                    title: 'Dubbo 接口' + this.$route.query.serviceName
                };
                this.$router.push({
                    path: 'dubboDoc',
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
                        old = Object.keys(menu?.add)?.[0];
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
                        for (const key in pathList) {
                            let obj = {};
                            if (Object.prototype.hasOwnProperty.call(pathList, key)) {
                                const item = pathList[key];
                                if (typeof item === 'object') {
                                    obj.tags = item.className;
                                    obj.url = item.name;
                                }
                            }
                            table.push(obj);
                        }
                        return table;
                    }
                } else {
                    return table;
                }
            },
            dealChangeData(data, oldVersion) {
                let changePaths = [];
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
                    } else {
                        changePaths.push(data[version].paths);
                    }
                }
                const baseVersionPaths = this.getPaths(changePaths[1]);
                const newVersionPaths = this.getPaths(changePaths[0]);
                for (const changeIndex in baseVersionPaths) {
                    // 放入请求参数和响应参数
                    changeArr.info.push(newVersionPaths[changeIndex]);
                    changeArr.detail.push([
                        {
                            old: baseVersionPaths[changeIndex].description,
                            new: newVersionPaths[changeIndex].description
                        },
                        {
                            old: baseVersionPaths[changeIndex].methodName,
                            new: newVersionPaths[changeIndex].methodName
                        },
                        {
                            old: baseVersionPaths[changeIndex].className,
                            new: newVersionPaths[changeIndex].className
                        },
                        {
                            old: baseVersionPaths[changeIndex].parameters,
                            new: newVersionPaths[changeIndex].parameters
                        },
                        {
                            old: baseVersionPaths[changeIndex].deprecated ? '是' : '否',
                            new: newVersionPaths[changeIndex].deprecated ? '是' : '否'
                        },
                        {
                            old: baseVersionPaths[changeIndex].name,
                            new: newVersionPaths[changeIndex].name
                        }
                    ]);
                }
                return changeArr;
            },
            getPaths(data) {
                const _this = this;
                for (const key in data) {
                    if (Object.prototype.hasOwnProperty.call(data, key)) {
                        const apiInfo = data[key];
                        if (apiInfo != null) {
                            const ins = _this.createApiInfoInstance(key, apiInfo);
                            _this.currentInstance.paths.push(ins);
                        }
                    }
                }
                //paths属性去重
                const arr = _this.currentInstance.paths;
                let array = [];
                let newArr = [];
                for (let i = 0; i < arr.length; i++) {
                    if (!array.includes(arr[i].moduleName)) {
                        newArr.push(arr[i]);
                        array.push(arr[i].moduleName);
                    }
                }
                this.currentInstance.paths = [];
                return newArr;
            },
            createApiInfoInstance: function (path, apiInfo) {
                const swpinfo = new Swagger.SwaggerBootstrapUiApiInfo();
                let def = null;
                const that = this;
                if (apiInfo != null) {
                    if (Object.prototype.hasOwnProperty.call(apiInfo, 'deprecated')) {
                        swpinfo.deprecated = apiInfo.deprecated;
                    }
                    if (!apiInfo.className) {
                        apiInfo.className = ['default'];
                    }
                    swpinfo.description = that.getValue(apiInfo, 'desc', '', true);
                    swpinfo.className = that.getValue(apiInfo, 'className', '', true);
                    swpinfo.resultDesc = that.getValue(apiInfo, 'resultDesc', '', true);
                    swpinfo.methodName = that.getValue(apiInfo, 'methodName', '', true);
                    swpinfo.moduleName = path;
                    swpinfo.response = that.getValue(apiInfo, 'response', '', true);
                    swpinfo.resOriginalRef = that.getValue(apiInfo, 'resOriginalRef', '', true);
                    swpinfo.name = that.getValue(apiInfo, 'name', '', true);
                    swpinfo.tags = [apiInfo.moduleName];
                    const _groupName = that.currentInstance.name;
                    //设置hashurl
                    swpinfo.tags.forEach((tag) => {
                        const _hashUrl = `#/${_groupName}/${tag}`;
                        swpinfo.hashCollections.push(_hashUrl);
                    });
                    let minfo = new Swagger.SwaggerBootstrapUiParameter();
                    if (Object.prototype.hasOwnProperty.call(apiInfo, 'params')) {
                        let pameters = [];
                        if (apiInfo['params'].length === 0) {
                            swpinfo.parameters = null;
                            that.currentInstance.paths.push(swpinfo);
                        } else {
                            pameters = apiInfo['params'];
                            $.each(pameters, function (i, m) {
                                minfo = new Swagger.SwaggerBootstrapUiParameter();
                                minfo.name = that.propValue('name', m, '');
                                minfo.type = that.propValue('javaType', m, '');
                                minfo.description = that.propValue('displayName', m, '');
                                minfo.schemaValue = that.propValue('originalRef', m, '');
                                swpinfo.parameters.push(minfo);
                            });
                            //解析responsecode
                            that.currentInstance.paths.push(swpinfo);
                        }
                    }
                    for (let tag = 0; tag < swpinfo.tags.length; tag++) {
                        const tagName = swpinfo.tags[tag];
                        that.mergeApiInfoSelfTags(tagName);
                    }
                    swpinfo.responseParameters = apiInfo.response;
                    if (swpinfo.resOriginalRef && swpinfo.resOriginalRef !== '') {
                        const original = swpinfo.resOriginalRef.match('\\\\<([^}]*)\\\\>');
                        let resOriginalRef;
                        if (original) {
                            resOriginalRef = original[1];
                        } else {
                            resOriginalRef = swpinfo.resOriginalRef;
                        }
                        for (let difArr = 0; difArr < that.currentInstance.difArrs.length; difArr++) {
                            const ref = that.currentInstance.difArrs[difArr];
                            if (ref.name === resOriginalRef) {
                                if (original) {
                                    const na = [];
                                    na.push(ref.value);
                                    swpinfo.responseValue = JSON.stringify(na, null, '\t');
                                    swpinfo.responseJson = na;
                                } else {
                                    swpinfo.responseValue = JSON.stringify(ref.value, null, '\t');
                                    swpinfo.responseJson = ref.value;
                                }
                            }
                        }
                    }
                    $.each(apiInfo.params, function (item, param) {
                        if (param.originalRef) {
                            def = that.getDefinitionByName(param.originalRef);
                        }
                    });
                    if (def != null) {
                        minfo.def = def;
                        minfo.value = def.value;
                        const txtArr = [];
                        if (swpinfo.response && swpinfo.response !== '') {
                            if (swpinfo.response.startsWith('List')) {
                                txtArr.push(minfo.value);
                                minfo.txtValue = JSON.stringify(txtArr, null, '\t');
                            } else {
                                minfo.txtValue = JSON.stringify(minfo.value, null, '\t');
                            }
                        } else {
                            minfo.txtValue = JSON.stringify(minfo.value, null, '\t');
                        }
                        //JSON显示
                    }
                }
                //获取请求json
                //统计body次数
                if (swpinfo.parameters != null) {
                    let count = 0;
                    let tmpJsonValue = null;
                    $.each(swpinfo.parameters, function (i, p) {
                        if (p.in) {
                            count = count + 1;
                            if (p.txtValue !== null && p.txtValue !== '') {
                                tmpJsonValue = p.txtValue;
                            }
                        }
                    });
                    if (count === 1) {
                        swpinfo.requestValue = tmpJsonValue;
                    }
                    //此处判断接口的请求参数类型
                    //判断consumes请求类型
                    if (
                        apiInfo &&
                        apiInfo.consumes !== undefined &&
                        apiInfo.consumes !== null &&
                        apiInfo.consumes.length > 0
                    ) {
                        const ctp = apiInfo.consumes[0];
                        if (ctp === 'multipart/form-data') {
                            swpinfo.contentType = ctp;
                            swpinfo.contentValue = 'form-data';
                        } else if (ctp === 'text/plain') {
                            swpinfo.contentType = ctp;
                            swpinfo.contentValue = 'raw';
                            swpinfo.contentShowValue = 'Text(text/plain)';
                        } else {
                            //根据参数遍历,否则默认是表单x-www-form-urlencoded类型
                            let defaultType = 'application/x-www-form-urlencoded;charset=UTF-8';
                            let defaultValue = 'x-www-form-urlencoded';
                            for (let i = 0; i < swpinfo.parameters.length; i++) {
                                const pt = swpinfo.parameters[i];
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
                        let defaultType = 'application/x-www-form-urlencoded;charset=UTF-8';
                        let defaultValue = 'x-www-form-urlencoded';
                        for (let parameter = 0; parameter < swpinfo.parameters.length; parameter++) {
                            const pts = swpinfo.parameters[parameter];
                            if (pts.in === 'body') {
                                if (pts.schemaValue === 'MultipartFile') {
                                    defaultType = 'multipart/form-data';
                                    defaultValue = 'form-data';
                                    break;
                                } else {
                                    defaultValue = 'raw';
                                    defaultType = 'application/json';
                                    break;
                                }
                            } else {
                                if (pts.schemaValue === 'MultipartFile') {
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
            },
            getValue: function (obj, key, defaultValue, checkEmpty) {
                let val = defaultValue;
                if (obj !== null && obj !== undefined) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        val = obj[key];
                        if (checkEmpty) {
                            if (val == null || val === '') {
                                val = defaultValue;
                            }
                        }
                    }
                }
                return val;
            },
            propValue: function (key, obj, defaultValue) {
                let t = defaultValue;
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    t = obj[key];
                }
                return t;
            },
            mergeApiInfoSelfTags: function (name) {
                let flag = false;
                const tags = this.currentInstance.tags;
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i].name === name) {
                        flag = true;
                    }
                }
                if (!flag) {
                    const ntag = new Swagger.SwaggerBootstrapUiTag(name, name);
                    this.currentInstance.tags.push(ntag);
                }
            }
        }
    };
});
