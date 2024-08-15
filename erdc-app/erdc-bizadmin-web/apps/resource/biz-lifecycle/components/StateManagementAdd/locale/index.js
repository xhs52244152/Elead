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
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '添加状态': { CN: '添加状态', EN: 'Add state' },
        internalName: { CN: '内部名称', EN: 'Internal name' },
        name: { CN: '名称', EN: 'Name' },
        '请输入编码': { CN: '请输入编码', EN: 'Please enter the code' },
        '请输入大小写字母': { CN: '请输入大小写字母、"_"、"."', EN: 'Please enter the letters, "_", "."' },
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '应用': { CN: '应用', EN: 'Application' },
        '状态': { CN: '状态', EN: 'State' },
        '启用': { CN: '启用', EN: 'Enable' },
        '停用': { CN: '停用', EN: 'Stop' },
        '描述': { CN: '描述', EN: 'Describe' },
        '获取详情失败': { CN: '获取详情失败', EN: 'Failed to get the details' },
        '创建成功': { CN: '创建成功', EN: 'Creating a successful' },
        '创建失败': { CN: '创建失败', EN: 'Create a failure' },
    }

    return {
        i18n: languageObj
    }
})
