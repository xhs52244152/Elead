define([], function () {
    const languageObj = {
        processPoint: { CN: '流程指引', EN: 'Process Point' },
        basicInfo: { CN: '基本信息', EN: 'Basic Infos' },
        globalVariable: { CN: '流程属性', EN: 'Global Properties' },
        localVariable: { CN: '节点属性', EN: 'Local Properties' },
        businessObject: { CN: '业务对象', EN: 'Business Object' },
        attachment: { CN: '附件', EN: 'Attachment' },
        uploadAttachment: { CN: '上传附件', EN: 'Upload Attachment(s)' },
        processing: { CN: '流程处理', EN: 'Processing' },
        handlerConfiguration: { CN: '处理人配置', EN: 'Handler Configuration' },
        history: { CN: '处理历史记录', EN: 'History' },
        goBack: { CN: '返回', EN: 'Go back' },
        flowChart: { CN: '流程图', EN: 'Flow chart' },
        flowDiagram: { CN: '流程图解', EN: 'Flow diagram' },
        urging: { CN: '催办', EN: 'Urging' },
        delegate: { CN: '委派', EN: 'Delegate' },
        inquiry: { CN: '询问', EN: 'Inquiry' },
        suspend: { CN: '暂停', EN: 'Suspend' },
        terminate: { CN: '终止', EN: 'Terminate' },
        withdraw: { CN: '撤回', EN: 'Withdraw' },
        currentProcessor: { CN: '当前处理人', EN: 'Current Processor' },
        processStatus: { CN: '流程状态', EN: 'Process Status' },
        processCode: { CN: '流程编码', EN: 'Process Code' },
        processNode: { CN: '当前节点', EN: 'Process Node' },
        dueDate: { CN: '到期日期', EN: 'Due Date' },
        nodeVariableFailed: { CN: '节点变量校验未通过', EN: 'Node variable verification failed' },
        changeHandler: { CN: '加减签', EN: 'Change handler' },
        hasSecurityLabelTips: {
            CN: '您的密级低于流程密级，流程无法查看，请联系管理员配置权限',
            EN: 'Your password level is lower than the flow password level, and the flow cannot be viewed. Contact the administrator to configure the rights'
        }
    };

    return {
        i18n: languageObj
    }
})
