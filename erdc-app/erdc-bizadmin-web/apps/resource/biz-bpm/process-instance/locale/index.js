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
        changeHandler: { CN: '更改处理人', EN: 'Change handler' },
        suspend: { CN: '暂停', EN: 'Suspend' },
        flowDiagram: { CN: '流程图解', EN: 'Flow diagram' },
        pleaseEnterCodeName: { CN: '请输入流程编码、流程名称', EN: 'Please enter the process code and process name' },
        processPauseSuccess: { CN: '流程暂停成功', EN: 'Process pause succeeded' },
        processPauseFail: { CN: '流程暂停失败', EN: 'Process pause failed' },
        processActivationSuccess: { CN: '流程激活成功', EN: 'Process activation succeeded' },
        processActivationFail: { CN: '流程激活失败', EN: 'Process activation failed' },
        viewTask: { CN: '查看任务', EN: 'View task' },
        terminationSuccess: { CN: '终止成功', EN: 'Termination successfully' },
        processType: { CN: '流程类型', EN: 'Process type' },
        searchKeyword: { CN: '搜索关键字', EN: 'Search keyword' },
        handlerNotInvalid: { CN: '处理人配置不合法', EN: 'The handler configuration is invalid' },
        changeHandlerSuccess: { CN: '更改处理人成功', EN: 'The change handler succeeded' }
    }

    return {
        i18n: languageObj
    }
})
