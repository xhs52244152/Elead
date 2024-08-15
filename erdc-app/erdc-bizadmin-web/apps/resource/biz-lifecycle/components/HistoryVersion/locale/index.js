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
        '名称': { CN: '名称', EN: 'Name' },
        '编码': { CN: '编码', EN: 'Number' },
        '版本': { CN: '版本', EN: 'Version' },
        '是否启用': { CN: '是否启用', EN: 'Enable' },
        '是否启用路由': { CN: '是否启用路由', EN: 'Whether to enable the routing' },
        '上下文': { CN: '上下文', EN: 'Context' },
        'updateUser': { CN: '修改人', EN: 'Modifier' },
        'updateTime': { CN: '修改时间', EN: 'Edit Time' }
    }

    return {
        i18n: languageObj
    }
});
