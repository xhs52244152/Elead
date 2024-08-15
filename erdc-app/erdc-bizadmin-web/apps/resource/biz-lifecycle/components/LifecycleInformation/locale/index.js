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
        '请选择': { CN: '请选择', EN: 'Please selet' },
        '类型': { CN: '类型', EN: 'Type' },
        '基础': { CN: '基础', EN: 'Basis type' },
        '高级': { CN: '高级', EN: 'Senior type' },
        '类型提示': { CN: '基本：只保留状态信息。高级：除了状态，还支持权限控制、工作流设置', EN: 'Basic: only keep state information. Advanced: in addition to the state, but also support access control, workflow Settings' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        '状态': { CN: '状态', EN: 'State' },
        '启用': { CN: '启用', EN: 'Enable' },
        '停用': { CN: '停用', EN: 'Disable' },
        '名称': { CN: '名称', EN: 'Name' },
        '编码': { CN: '编码', EN: 'Number' },
        '应用': { CN: '应用', EN: 'Application' },
        '对象类型': { CN: '对象类型', EN: 'Object type' },
        '对象类型提示': { CN: '定义哪种类型的生命周期', EN: 'Define what kind of life cycle' },
        '是否被引用': { CN: '是否被引用', EN: 'Whether the referenced' },
        '上下文': { CN: '上下文', EN: 'Context' },
        '描述': { CN: '描述', EN: 'Description' },
    }

    return {
        i18n: languageObj
    }
})
