define([], function () {
    'use strict';

    const SwaggerBootstrapUiDefinition = function () {
        this.name = '';
        this.schemaValue = null;
        this.id = 'definition' + Math.round(Math.random() * 1000000);
        this.pid = '-1';
        this.level = 1;
        this.childrenTypes = [];
        this.parentTypes = [];
        //介绍
        this.description = '';
        //类型
        this.type = '';
        //属性 --SwaggerBootstrapUiProperty 集合
        this.properties = [];
        this.value = null;
        //add by xiaoymin 2018-8-1 13:35:32
        this.required = [];
        this.title = '';
    };

    /***
     * definition对象属性
     * @constructor
     */
    const SwaggerBootstrapUiProperty = function () {
        //默认基本类型,非引用
        this.basic = true;
        this.name = '';
        this.type = '';
        this.refType = null;
        this.description = '';
        this.example = '';
        this.format = '';
        //是否必须
        this.required = false;
        //默认值
        this.value = null;
        //引用类
        this.property = null;
        //原始参数
        this.originProperty = null;
        //是否枚举
        this.enum = null;
        //是否readOnly
        this.readOnly = false;
    };

    /***
     * swagger的tag标签
     * @param name
     * @param description
     * @constructor
     */
    const SwaggerBootstrapUiTag = function (name, description, className, deprecated) {
        this.name = name;
        this.description = description;
        this.className = className;
        this.deprecated = deprecated;
        this.children = [];
    };

    /***
     * Swagger接口基础信息
     * @constructor
     */
    const SwaggerBootstrapUiApiInfo = function () {
        /* dubbo接口的参数 */
        this.response = null;
        this.resOriginalRef = null;
        this.methodName = null;
 
        this.resultDesc = null;
        this.className = null;
        this.moduleName = null;
        this.name = null;
        this.refTreetableparameters = [];
        this.refTreetableModelsparameters = [];

        /* rest接口有的参数 */
        this.originalUrl = null;
        this.showUrl = '';
        this.methodType = null;
        this.summary = null;
        this.consumes = null;
        this.operationId = null;
        this.produces = null;
        this.tags = null;


        this.url = null;
        this.deprecated = false;
        this.author = null;  //接口作者
        this.description = null;
        this.summary = null;
        this.consumes = null;
        this.operationId = null;
        this.produces = null;
        this.tags = null;



        //默认请求contentType
        this.contentType = 'application/json';
        this.contentShowValue = 'JSON(application/json)';
        //显示参数
        //存储请求类型，form|row|urlencode
        this.contentValue = 'raw';
        this.parameters = [];
        //参数数量
        this.parameterSize = 0;
        //请求json示例
        this.requestValue = null;
        //针对parameter属性有引用类型的参数,继续以table 的形式展现
        //存放SwaggerBootstrapUiRefParameter 集合
        this.refparameters = [];
        this.responseCodes = [];
        this.responseHttpObject = null;
        /***
         * 返回状态码为200的
         */
        this.getHttpSuccessCodeObject = function () {
            if (this.responseHttpObject == null) {
                if (this.responseCodes != null && this.responseCodes.length > 0) {
                    var _tmp = null;
                    for (var i = 0; i < this.responseCodes.length; i++) {
                        if (this.responseCodes[i].code === '200') {
                            _tmp = this.responseCodes[i];
                            break;
                        }
                    }
                    this.responseHttpObject = _tmp;
                }
            }
            return this.responseHttpObject;
        };
        this.responseValue = null;
        this.responseJson = null;
        this.responseText = null;
        this.responseBasicType = false;
        //响应字段说明
        this.responseParameters = [];
        this.responseParameterRefName = '';
        this.responseRefParameters = [];
        //treetable组件使用对象
        this.responseTreetableRefParameters = [];
        //新增菜单id
        this.id = '';
        //版本id
        this.versionId = '';
        //排序
        this.order = 2147483647;
        //add by xiaoymin 2018-12-14 17:04:42
        //是否新接口
        this.hasNew = false;
        //是否有接口变更
        this.hasChanged = false;
        //是否过时
        this.deprecated = false;
        //是否存在响应状态码中  存在多个schema的情况
        this.multipartResponseSchema = false;
        this.multipartResponseSchemaCount = 0;
        //hashUrl
        this.hashCollections = [];
    };

    /***
     * Swagger请求参数
     * @constructor
     */
    const SwaggerBootstrapUiParameter = function () {
        this.name = null;
        this.require = null;
        this.type = null;
        this.in = null;
        this.schema = false;
        this.schemaValue = null;
        this.value = null;
        //JSR-303 annotations supports since 1.8.7
        //默认状态为false
        this.validateStatus = false;
        this.validateInstance = null;
        //引用类
        this.def = null;
        //des
        this.description = null;
        //文本框值
        this.txtValue = null;
        //枚举类型
        this.enum = null;

        this.id = 'param' + Math.round(Math.random() * 1000000);
        this.pid = '-1';

        this.level = 1;
        //参数是否显示在debug中
        this.show = true;
        //是否readOnly
        this.readOnly = false;
        this.example = null;

        this.childrenTypes = [];
        this.parentTypes = [];
    };

    /***
     * 响应码
     * @constructor
     */
    const SwaggerBootstrapUiResponseCode = function () {
        this.code = null;
        this.description = null;
        this.schema = null;
        this.responseCodes = [];
        this.responseValue = null;
        this.responseJson = null;
        this.responseText = null;
        this.responseBasicType = false;
        //响应字段说明
        this.responseParameters = [];
        this.responseParameterRefName = '';
        this.responseRefParameters = [];
        //treetable组件使用对象
        this.responseTreetableRefParameters = [];
    };

    const SwaggerBootstrapUiRefParameter = function () {
        this.name = null;
        this.params = [];
    };

    /***
     /***
     * 计数器
     * @constructor
     */
    const SwaggerBootstrapUiPathCountDownLatch = function () {
        this.method = '';
        this.count = 0;
    };

    return {
        SwaggerBootstrapUiDefinition,
        SwaggerBootstrapUiProperty,
        SwaggerBootstrapUiTag,
        SwaggerBootstrapUiApiInfo,
        SwaggerBootstrapUiParameter,
        SwaggerBootstrapUiResponseCode,
        SwaggerBootstrapUiRefParameter,
        SwaggerBootstrapUiPathCountDownLatch
    };
});
