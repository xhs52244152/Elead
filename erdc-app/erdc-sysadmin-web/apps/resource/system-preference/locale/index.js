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
        'confirm': { CN: '确定', EN: 'Confirm' },
        'cancel': { CN: '取消', EN: 'Cancel' },
        'confirmDelete': { CN: '确认删除', EN: 'Confirm delete' },
        'confirmDeleteData': { CN: '确定删除该数据？', EN: 'Confirm delete data?' },
        'editSuccess': { CN: '编辑成功', EN: 'Edit Success' },
        'createSuccess': { CN: '创建成功', EN: 'Create Success' },
        'editFailure': { CN: '编辑失败', EN: 'Edit Failure' },
        'createFailure': { CN: '创建失败', EN: 'Create Failure' },
        'deleteSuccess': { CN: '删除成功', EN: 'Delete Success' },
        'giveUpEdit': { CN: '是否放弃编辑', EN: 'Whether to give up the editor' },
        'confirmCancel': { CN: '确认取消', EN: 'Confirm Cancel' },
        'draft': { CN: '草稿', EN: 'Draft' },
        'enable': { CN: '启用', EN: 'Enable' },
        'disable': { CN: '禁用', EN: 'Disable' },
        'edit': { CN: '编辑', EN: 'Edit' },
        'delete': { CN: '删除', EN: 'Delete' },
        'more': { CN: '更多', EN: 'More' },

        'pleaseEnter': { CN: '请输入', EN: 'Please enter' },
        'pleaseEnterNumber': { CN: '请输入编码', EN: 'Please enter Number' },
        'pleaseEnterNumberValidator': { CN: '请输入大小写字母、数字、"_"、"."、"-"', EN: 'Please input lowercase letters, Numbers, "_", ". ", "-"' },
        'pleaseEnterDescription': { CN: '请输入描述', EN: 'Please enter Description' },

        'pleaseSelect': { CN: '请选择', EN: 'Please select' },
        'pleaseSelectAppName': { CN: '请选择所属应用', EN: 'Please select appName' },
        'pleaseSelectStatus': { CN: 'AppName', EN: 'Please select Status' },

        'dataKey': { CN: '值选项', EN: 'dataKey' },
        'componentType': { CN: '组件类型', EN: 'Component type' },
        'fileAttachmentControl': { CN: '附件控件', EN: 'File attachment control' },
        'description': { CN: '描述', EN: 'Description' },
        'locked': { CN: '是否锁定', EN: 'Locked' },
        'realType': { CN: '数据类型', EN: 'Real Type' },
        'name': { CN: '名称', EN: 'Name' },
        'number': { CN: '编码', EN: 'Number' },
        'appName': { CN: '所属应用', EN: 'appName' },
        'status': { CN: '状态', EN: 'Status' },
        'configValue': { CN: '值', EN: 'configValue' },
        'configurationValue': { CN: '配置值', EN: 'Configuration value' },
        'configurationItem': { CN: '配置项', EN: 'Configuration item' },
        'createConfigurationGroup': { CN: '创建配置组', EN: 'Create configuration group' },
        'editConfigurationGroup': { CN: '编辑配置组', EN: 'Edit configuration group' },
        'configType': { CN: '类型', EN: 'ConfigType' },
        'operation': { CN: '操作', EN: 'Operation' },
        'createLevelConfigurationGroup': { CN: '创建一级配置组', EN: 'Create level configuration group' },
        'createConfigurationSet': { CN: '创建子配置组', EN: 'Create a configuration set' },
        'createConfigurationItem': { CN: '创建配置项', EN: 'Create a configuration item' },
        'editConfigurationItem': { CN: '编辑配置项', EN: 'Edit a configuration item' },
        'pleaseUploadAttachments': { CN: '请上传附件', EN: 'Please upload attachments.' },
        yes: { CN: '是', EN: 'Yes' },
        no: { CN: '否', EN: 'No' },
        preference: { CN: '首选项', EN: 'Preference' },
    };

    return {
        i18n: languageObj
    };
});
