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
        'flowChart': { CN: '流程图', EN: 'Flow chart' },
        'flowDiagram': { CN: '流程图解', EN: 'Flow diagram' },
        'all': { CN: '全部', EN: 'All' },
        'running': { CN: '运行中', EN: 'Running' },
        'pending': { CN: '挂起', EN: 'Pending' },
        'finish': { CN: '结束', EN: 'finish' },
        'exceptional': { CN: '异常', EN: 'Exceptional' },
        'urging': { CN: '催办', EN: 'Urging' },
        'termination': { CN: '终止', EN: 'termination' },
        'export': { CN: '导出', EN: 'Export' },
        'selectPersonnel': { CN: '选择人员', EN: 'Select personnel' },
        'Notification': { CN: '通知方式', EN: 'Notification method' },
        'message': { CN: '站内信', EN: 'Station Messages' },
        'mail': { CN: '邮件', EN: 'Mail' },
        'content': { CN: '内容', EN: 'Content' },
        'enter': { CN: '请输入', EN: 'Enter' },
        'confirm': { CN: '确定', EN: 'Confirm' },
        'cancel': { CN: '取消', EN: 'Cancel' },
        'notes': { CN: '备注', EN: 'Notes' },
        'enterRequired': { CN: '请输入必填项', EN: 'Please enter a required field' },
        'urgedSuccessfully': { CN: '催办成功', EN: 'Urged successfully' },
        'terminatedSuccessfully': { CN: '终止成功', EN: 'Urged successfully' },
        '查看任务': { CN: '查看任务', EN: 'View task' },
        '催办失败': { CN: '催办失败', EN: 'Call failure' },
        '催办成功': { CN: '催办成功', EN: 'Prompt success' },
        '终止成功': { CN: '终止成功', EN: 'Successful termination' },
        '终止失败': { CN: '终止失败', EN: 'Termination failure' },
        '请输入流程编码，流程名称': { CN: '请输入流程编码，流程名称', EN: 'Please enter process code, process name' }
    };

    return {
        i18n: languageObj
    };
});
