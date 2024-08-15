/**
 * i18n国际化文件
 * **/
define([], function () {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        pleaseEnter: { CN: '请输入', EN: 'Please enter' },
        create: { CN: '创建', EN: 'Create' },
        save: { CN: '保存', EN: 'Save' },
        cancel: { CN: '取消', EN: 'Cancel' },
        edit: { CN: '编辑', EN: 'Edit' },
        delete: { CN: '删除', EN: 'Delete' },
        application: { CN: '所属应用', EN: 'Application' },
        needVerifyObject: { CN: '需校验密级对象', EN: 'Need to verify the encryption object' },
        operation: { CN: '操作', EN: 'Operation' },
        successfullyDeleted: { CN: '删除成功', EN: 'Successfully deleted' },
        successfullyEdit: { CN: '编辑成功', EN: 'Successfully edit' },
        successfullyCreated: { CN: '创建成功', EN: 'Successfully created' },
        appAlreadyExists: {
            CN: '应用已存，请编辑已有的应用行',
            EN: 'The application already exists, please edit the existing application line'
        },
        securityLevel: { CN: '用户涉密等级', EN: 'User confidentiality level' },
        linkedSecurityLevel: { CN: '可查看涉密对象等级', EN: 'You can view the level of classified objects' },
        levelConfiguration: { CN: '密级项配置', EN: 'Password level configuration' },
        configureEncryption: { CN: '密级对象配置', EN: 'Configure the encryption object' },
        selectDataFirst: { CN: '请先选择数据', EN: 'Please select data first' },
        enableSuccess: { CN: '启用成功', EN: 'Enable successful' },
        enableFail: { CN: '启用失败', EN: 'Enable failure' },
        stopSuccess: { CN: '停用成功', EN: 'Stop successful' },
        stopFail: { CN: '停用失败', EN: 'Stop failure' },
        createConfigItem: { CN: '创建配置项', EN: 'Create a configuration item' },
        updateConfigItem: { CN: '编辑配置项', EN: 'Update a configuration item' },
        associateCustom: { CN: '关联自定义接口', EN: 'Associate Custom Interfac' },
        associateBasic: { CN: '关联基础行为接口', EN: 'Associate basic behavior interface' },
        microService: { CN: '应用微服务', EN: 'Application micro-service' },
        APIName: { CN: 'API名称', EN: 'API name' },
        APIFnName: { CN: 'API函数名称', EN: 'API Function name' },
        remarks: { CN: '备注', EN: 'Remarks' },
        businessObjectCode: { CN: '业务对象编码', EN: 'Business object coding' },
        operationDetail: { CN: '操作详情', EN: 'Operation detail' },
        packagePath: { CN: '包路径', EN: 'packagePath' },
        methodParams: { CN: '方法入参', EN: 'Method input parameter' },
        functionName: { CN: '函数名', EN: 'Function name' },
        associationStatus: { CN: '关联状态', EN: 'Association statu' },
        associated: { CN: '已关联', EN: 'Associated' },
        notAssociated: { CN: '未关联', EN: 'Not associated' },
        keyword: { CN: '关键词', EN: 'keyword' },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport&refresh=true" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },

        operAccount: { CN: '操作账号', EN: 'Operation account' },
        operName: { CN: '操作用户名', EN: 'Operator name' },
        secretLevel: { CN: '用户密级', EN: 'Secret level' },
        operAddress: { CN: '操作地址（IP）', EN: 'Operating address (IP)' },
        operandType: { CN: '操作对象类型', EN: 'Operand type' },
        operCoding: { CN: '操作对象编码', EN: 'Operand coding' },
        operItemName: { CN: '操作项名称', EN: 'Operation item name' },
        operType: { CN: '操作类型', EN: 'Type of operation' },
        operDetails: { CN: '操作详情', EN: 'Operation details' },
        operResult: { CN: '操作结果', EN: 'Operation result' },
        operTime: { CN: '操作时间', EN: 'Operating time' },
        operTenant: { CN: '操作租户', EN: 'Operating tenant' },
        export: { CN: '导出', EN: 'Export' },
        leastOneTip: { CN: '请至少选择一条数据操作', EN: 'Please select at least one data operation' },
        deleteTip: { CN: '删除后无法恢复，是否继续', EN: 'Cannot recover after deletion. Do you want to continue?' },
        modelInputTip: { CN: '请先选择应用后选择', EN: 'Please select the application first and then select' },
        businessObjectCodeTip: {
            CN: '业务对象编码通过表达式获取接口信息，可参考SpEL表达格式配置：#（表达式）',
            EN: 'Business object coding: business object coding obtains interface information through expressions. For more information, please see SpEL expression format configuration: # (expression)'
        },
        detailI18nJsonTip: {
            CN: '操作描述通过表达式获取接口信息，可参考SpEL表达式格式配置：#（表达式）',
            EN: 'Operation description obtains interface information through expressions. Please refer to SpEL expression format configuration: # (expression)'
        },
        emptyApiTip: { CN: '关联接口不能为空', EN: 'Associated interface cannot be empty' },
        typeDefinitionDtoTips: {
            CN: '设置为"需要校验密级对象"后：<br>1.当前用户仅可创建、编辑、查看该业务对象实例时,会过滤不匹配密级要求的实例数据;<br>2.在设置该业务对象实例的相关人员(如任务责任人，流程审批人等)时,会过滤不匹配密级要求的用户',
            EN: 'Set to "Need to verify password level object" :<br>1. If the current user can only create, edit, and view the service object instance, the system filters out the instance data that does not match the requirement of the security level. <br>2. When you set the personnel (such as task owner and process approver) of the service object instance, the system filters out users that do not match the password level requirements'
        },
        applicationMessage: { CN: '请选择所属应用', EN: 'Please select your application' },
        typeDefinitionDtoMessage: {
            CN: '请选择需校验密级对象',
            EN: 'Select the object whose encryption level you want to verify'
        },
        logType: { CN: '日志类型', EN: 'Log type' },
        haveBeenFiled: { CN: '已归档', EN: 'Have been filed' },
        notFiled: { CN: '未归档', EN: 'Not filed' },
        success: { CN: '成功', EN: 'Success' },
        lose: { CN: '失败', EN: 'Lose' },
        linkedSecurityLevelTips: {
            CN: '用户密级匹配规则：用户可创建查看的业务数据的密级数值<=该用户密级等级数值',
            EN: 'User password level matching rule: The password level value of the service data that the user can create and view <= The password level value of the user'
        }
    };

    return {
        i18n: languageObj
    };
});
