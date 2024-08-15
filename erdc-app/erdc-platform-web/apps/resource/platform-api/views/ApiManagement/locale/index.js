define([], function () {
    const languageObj = {
        interface_data_overload: {
            CN: '数据量过多，存储失败，数据丢失',
            EN: 'Too much data, storage failure, data loss'
        },
        interface_del_overflow: {
            CN: '已超出最大删除上限（10）',
            EN: 'Maximum deletion limit(10) has been exceeded'
        },
        变更记录: {
            CN: '变更记录',
            EN: 'Change History'
        },
        调用方法: {
            CN: '调用方法',
            EN: 'Call Method'
        },
        详情: {
            CN: '详情',
            EN: 'Detail'
        },
        查看: {
            CN: '查看',
            EN: 'View'
        },
        变更内容: {
            CN: '变更内容',
            EN: 'Change Content'
        },
        属性: {
            CN: '属性',
            EN: 'Property'
        },
        内容: {
            CN: '内容',
            EN: 'Content'
        },
        应用: {
            CN: '应用',
            EN: 'App'
        },
        IP地址: {
            CN: 'IP地址',
            EN: 'IP Address'
        },
        操作时间: {
            CN: '操作时间',
            EN: 'Operate Time'
        },
        操作类型: {
            CN: '操作类型',
            EN: 'Operation Type'
        },
        API描述: {
            CN: 'API描述',
            EN: 'API Description'
        },
        未知数据: {
            CN: '未知数据',
            EN: 'Unknown Data'
        },
        API文档: {
            CN: 'API文档',
            EN: 'API Document'
        },
        接口描述: {
            CN: '接口描述',
            EN: 'Interface Description'
        },
        服务名: {
            CN: '服务名',
            EN: 'Service Name'
        },
        请输入服务名: {
            CN: '请输入服务名',
            EN: 'Please enter the serviceName'
        },
        接口功能: {
            CN: '接口功能',
            EN: 'API Operation'
        },
        别名: {
            CN: '别名',
            EN: 'alias'
        },
        版本: {
            CN: '版本',
            EN: 'version'
        },
        收集: {
            CN: '收集',
            EN: 'collect'
        },
        编码: {
            CN: '编码',
            EN: 'Code'
        },
        模块: {
            CN: '模块',
            EN: 'Tag'
        },
        请求方法: {
            CN: '请求方法',
            EN: 'Interface method'
        },
        地址: {
            CN: '地址',
            EN: 'Url'
        },
        interface_des_operation_module_code_url_tips: {
            CN: '请输入功能/模块/编码/地址',
            EN: 'Please enter operation / module / code / url'
        },
        功能编码: {
            CN: '功能编码',
            EN: 'Func Code'
        },
        功能名称: {
            CN: '功能名称',
            EN: 'Func Name'
        },
        菜单编码: {
            CN: '菜单编码',
            EN: 'Menu Code'
        },
        菜单名称: {
            CN: '菜单名称',
            EN: 'Menu Name'
        },
        功能描述: {
            CN: '功能描述',
            EN: 'Func Description'
        },
        上传成功: {
            CN: '上传成功',
            EN: 'Upload successfully'
        },
        interface_functional_upload_format_error: {
            CN: '上传文件的内容格式不正确',
            EN: 'The content format of the uploaded file is incorrect'
        },
        白名单: {
            CN: '白名单',
            EN: 'Whitelist'
        },
        请求方式: {
            CN: '请求方式',
            EN: 'Method Type'
        },
        请选择请求方式: {
            CN: '请选择请求方式',
            EN: 'Please select the request method'
        },
        请选择文件: {
            CN: '请选择文件',
            EN: 'Please select the file'
        },
        请求路径: {
            CN: '请求路径',
            EN: 'Request Path'
        },
        请输入接口正则: {
            CN: '请输入接口正则',
            EN: 'Please input the interface'
        },
        导出当前白名单: {
            CN: '导出当前白名单',
            EN: 'Export current whitelist'
        },
        导出所有白名单: {
            CN: '导出所有白名单',
            EN: 'Export all whitelist'
        },
        interface_whitelist_upload_content: {
            CN: '上传文件的内容格式不正确',
            EN: 'The content format of the uploaded file is incorrect'
        },
        导出PDF: {
            CN: '导出PDF',
            EN: 'Export PDF'
        },
        导出Word: {
            CN: '导出Word',
            EN: 'Export Word'
        },
        interface_whitelist_export_xml: {
            CN: '导出Excel XML',
            EN: 'Export Excel XML'
        },
        interface_whitelist_upload_filetype: {
            CN: '文件类型必须是.xlsx格式',
            EN: 'The file type must be in .xlsx format'
        },
        功能接口: {
            CN: '功能接口',
            EN: 'Functional'
        },
        黑名单: {
            CN: '黑名单',
            EN: 'Blacklist'
        },
        服务列表: {
            CN: '服务列表',
            EN: 'AppName List'
        },
        接口编码: {
            CN: '接口编码',
            EN: 'Api Code'
        },
        请输入服务别名: {
            CN: '请输入服务别名',
            EN: 'Please enter the appName'
        },
        请输入接口编码: {
            CN: '请输入接口编码',
            EN: 'Please enter interface code'
        },
        请输入描述: {
            CN: '请输入描述',
            EN: 'Please enter Description'
        },
        选择不能为空: {
            CN: '选择不能为空',
            EN: 'Selection cannot be empty'
        },
        接口地址: {
            CN: '接口地址',
            EN: 'Interface Url'
        },
        系统名称: {
            CN: '系统名称',
            EN: 'System Name'
        },
        选择: {
            CN: '选择',
            EN: 'Select'
        },
        仅支持单条数据操作: {
            CN: '仅支持单条数据操作',
            EN: 'Only support single data operation'
        },
        请输入接口功能: {
            CN: '请输入接口功能',
            EN: 'Please enter the interface function'
        },
        interface_blacklist_operation_url_code_tips: {
            CN: '请输入功能/地址/编码',
            EN: 'Please enter operation/address/url'
        },
        请选择接口: {
            CN: '请选择接口',
            EN: 'Please select interface'
        },
        接口文档: {
            CN: '接口文档',
            EN: 'Interface Documentation'
        },
        下载Markdown: {
            CN: '下载Markdown',
            EN: 'Download Markdown'
        },
        下载Word: {
            CN: '下载Word',
            EN: 'Download Word'
        },
        下载Json: {
            CN: '下载Json',
            EN: 'Download Json'
        },
        对比报告: {
            CN: '对比报告',
            EN: 'Compare Doc'
        },
        返回: {
            CN: '返回',
            EN: 'Back'
        },
        目录: {
            CN: '目录',
            EN: 'Content'
        },
        Rest接口: {
            CN: 'Rest接口',
            EN: 'Rest Interface'
        },
        Dubbo接口: {
            CN: 'Dubbo接口',
            EN: 'Dubbo Interface'
        },
        基线版本: {
            CN: '基线版本',
            EN: 'Base Version'
        },
        当前版本: {
            CN: '当前版本',
            EN: 'Current Version'
        },
        请选择版本: {
            CN: '请选择版本',
            EN: 'Please Select version'
        },
        请选择要对比的版本: {
            CN: '请选择要对比的版本',
            EN: 'Please Select Compare Version'
        },
        接口名: {
            CN: '接口名',
            EN: 'Interface Name'
        },
        模块名: {
            CN: '模块名',
            EN: 'Tag Name'
        },
        请选择不同的版本: {
            CN: '请选择不同的版本',
            EN: 'Please Select different version'
        },
        选择版本不能为空: {
            CN: '选择版本不能为空',
            EN: 'Select Version is not empty'
        },
        下载Html: {
            CN: '下载Html',
            EN: 'Download Html'
        },
        url: {
            CN: 'url',
            EN: 'Url'
        },
        描述: {
            CN: '描述',
            EN: 'Description'
        },
        请求参数: {
            CN: '请求参数',
            EN: 'Request Parameters'
        },
        响应参数: {
            CN: '响应参数',
            EN: 'Response Parameters'
        },
        参数名称: {
            CN: '参数名称',
            EN: 'Parameters Name'
        },
        参数说明: {
            CN: '参数说明',
            EN: 'Parameters illustrate'
        },
        参数类型: {
            CN: '参数类型',
            EN: 'Parameters Type'
        },
        数据类型: {
            CN: '数据类型',
            EN: 'Data Type'
        },
        方法: {
            CN: '方法',
            EN: 'Method'
        },
        新增接口: {
            CN: '新增接口',
            EN: 'New Interface'
        },
        删除接口: {
            CN: '删除接口',
            EN: 'Delete Interface'
        },
        变更接口: {
            CN: '变更接口',
            EN: 'Change Interface'
        },
        浏览器不支持: {
            CN: '浏览器不支持',
            EN: 'Browser does not support'
        },
        文件已存在: {
            CN: '文件已存在',
            EN: 'File already exists'
        },
        导入成功: {
            CN: '导入成功',
            EN: 'Import successful '
        },
        导入文件不能为空: {
            CN: '导入文件不能为空',
            EN: 'Import file cannot be empty'
        },
        请选择服务名: {
            CN: '请选择服务名',
            EN: 'Please select a service name'
        },
        请选择接口类型: {
            CN: '请选择接口类型',
            EN: 'Please select interface type'
        },
        请输入版本号: {
            CN: '请输入版本号',
            EN: 'Please enter version number'
        },
        上传文件不能为空: {
            CN: '上传文件不能为空',
            EN: 'Upload file cannot be empty'
        },
        接口类型: {
            CN: '接口类型',
            EN: 'Interface Type'
        },
        版本号: {
            CN: '版本号',
            EN: 'Version'
        },
        历史文件: {
            CN: '历史文件',
            EN: 'Historical Documents'
        },
        interface_doc_tips_upload_json: {
            CN: '请上传接口文档导出的json文件',
            EN: 'Please upload the json file exported by the interface documentation'
        },
        接口文件导入: {
            CN: '接口文件导入',
            EN: 'Interface file import'
        },
        interface_doc_tips_api_doc: {
            CN: '服务名/服务别名/描述',
            EN: 'Service Name/App Name/Description'
        },
        下载文件: {
            CN: '下载文件',
            EN: 'Download File'
        },
        是否必须: {
            CN: '是否必须',
            EN: 'Is it necessary'
        },
        接口类型不能为空: {
            CN: '接口类型不能为空',
            EN: 'Interface type cannot be empty'
        },
        版本号不能为空: {
            CN: '版本号不能为空',
            EN: 'Version cannot be empty'
        },
        服务列表不能为空: {
            CN: '服务列表不能为空',
            EN: 'Service name cannot be empty'
        },
        接口列表: {
            CN: '接口列表',
            EN: 'Interface List'
        },
        interface_doc_view_edit: {
            CN: '编辑 & 查看',
            EN: 'View & Edit'
        },
        请输入服务分组: {
            CN: '请输入服务分组',
            EN: 'Please Enter a service group'
        },
        服务别名: {
            CN: '服务别名',
            EN: 'appName'
        },
        服务分组: {
            CN: '服务分组',
            EN: 'Group Name'
        },
        暂不支持多数据操作: {
            CN: '暂不支持多数据操作',
            EN: 'Multi-data operations are not supported yet'
        },
        是否弃用: {
            CN: '是否弃用',
            EN: 'Is Discard'
        },
        服务所有者: {
            CN: '服务所有者',
            EN: 'Service Owner'
        },
        全类名: {
            CN: '全类名',
            EN: 'Full ClassName'
        },
        dubbo: {
            CN: 'Dubbo接口',
            EN: 'Dubbo API'
        },
        rest: {
            CN: 'Rest接口',
            EN: 'Rest API'
        },
        收集成功: {
            CN: '收集成功',
            EN: 'Collect Success'
        },
        请输入: {
            CN: '请输入',
            EN: 'Please enter'
        },
        创建: {
            CN: '创建',
            EN: 'Create'
        },
        选择文件: {
            CN: '选择文件',
            EN: 'Select File'
        },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
        systemImport: {
            CN: '系统正在导入，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelImport&refresh=true" target="erdc-portal-web">工作台-操作记录-我的导入页面</a>查看',
            EN: 'The system is importing, please go to the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelImport&refresh=true" target="erdc-portal-web">workbench - Operation record - My import</a> interface to check.'
        },
        jsonDesc: {
            CN: '只能上传json文件',
            EN: 'Only you can upload the zip files'
        }
    };
    return {
        i18n: languageObj
    };
});
