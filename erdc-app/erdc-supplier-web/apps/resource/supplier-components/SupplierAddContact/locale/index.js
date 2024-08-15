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
        '姓名': { CN: '姓名', EN: 'Name' },
        '邮箱': { CN: '邮箱', EN: 'Mailbox' },
        '电话': { CN: '电话', EN: 'Telephone' },
        '部门': { CN: '部门', EN: 'Department' },
        '地址': { CN: '地址', EN: 'Address' },
        '组件提示': { CN: (o, t) => `请${(o === 'i' ? '输入' : '选择') + '' + t}`, EN: (o, t) => `Please ${(o === 'i' ? 'input' : 'select') + ' ' + t}` }
    }

    return {
        i18n: languageObj
    }
})