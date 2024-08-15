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
        '确认删除': { CN: '确认删除', EN: 'Confirm delete' },
        '确认取消': { CN: '确认取消', EN: 'Confirm cancel' },
        '确定': { CN: '确 定', EN: 'Confirm' },
        '取消': { CN: '取 消', EN: 'Cancel' },
        '移动至分类': { CN: '移动至分类', EN: 'Move to the node' },
        '移动到其他分类': { CN: '移动到其他分类', EN: 'To move to other classification' },

    }

    return {
        i18n: languageObj
    }
})