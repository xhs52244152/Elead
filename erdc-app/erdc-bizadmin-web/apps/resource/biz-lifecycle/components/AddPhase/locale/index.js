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
        '添加状态': { CN: '添加状态', EN: 'Add Status' },
        '没有你想要的': { CN: '没有你想要的？', EN: 'No you want?' },
        '状态': { CN: '状态', EN: 'state' },
        addStatusTip: { CN: '注：选择状态的顺序将作为生命周期状态图默认顺序，添加之后可以拖拉状态调整顺序', EN: 'Note: The order in which states are selected will be the default order for the lifecycle state diagram. After adding them, the order can be adjusted by dragging and dropping the states' },
    }

    return {
        i18n: languageObj
    }
})
