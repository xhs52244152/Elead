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
        '创建类别': { CN: '创建类别', EN: 'Create Category' },
        '名称': { CN: '名称', EN: 'Name' },
        '复用日历': { CN: '复用日历', EN: 'Reuse Calendar' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '保存并配置': { CN: '保存并配置', EN: 'Save and Cancel' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '请输入': { CN: '请输入', EN: 'PleaseEnter' },
        '自定义': { CN: '自定义', EN: 'Custom' },
        '复用': { CN: '复用', EN: 'Reuse' },
        '创建成功': { CN: '创建成功', EN: 'Create Successfully' },
    }

    return {
        i18n: languageObj
    }
})
