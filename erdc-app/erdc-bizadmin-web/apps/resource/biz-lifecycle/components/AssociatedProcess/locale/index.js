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
        pleaseEnter: { CN: '请输入', EN: 'Please enter' },
        processName: { CN: '流程名称', EN: 'Process name' },
        processType: { CN: '流程类型', EN: 'Process type' },
        selectProcess: { CN: '选择流程', EN: 'Select a process' },
        version: { CN: '版本', EN: 'Version' },
        versionStatus: { CN: '版本状态', EN: 'Version status' },
        createTime: { CN: '创建时间', EN: 'create time' },
    }

    return {
        i18n: languageObj
    }
})
