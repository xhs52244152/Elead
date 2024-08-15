define([], function() {
    const languageObj = {
        node: { CN: '节点', EN: 'node' },
        nodeName: { CN: '节点名称', EN: 'Node name' },
        processingNodeName: { CN: '处理节点名称', EN: 'Processing node name' },
        processInitiator: { CN: '流程启动者', EN: 'Process initiator' },
        participant: { CN: '参与者', EN: 'Participant' },
        pleaseSelectParticipant: { CN: '请选择参与者', EN: 'Please select participants' },
        participantType: { CN: '参与者类型', EN: 'Participant type' },
        pleaseSelectParticipantType: { CN: '请选择参与者类型', EN: 'Please select a participant type' },
        handler: { CN: '处理人', EN: 'Handler' },
        pleaseSelectHandler: { CN: '请选择处理人', EN: 'Please select a handler' },
        isRequired: { CN: '是否必须', EN: 'Whether the required' },
        handlerConfigInvalid: { CN: '处理人配置不合法', EN: 'The handler configuration is invalid' },
        notObtainContextInfo: { CN: '未获取到上下文信息', EN: 'Context information not obtained' },
        notObtainRolePersonnel: { CN: '的角色无法获取人员', EN: '‘s role cannot obtain personnel' },
        notObtainApprovePersonnel: { CN: '未获取审批人员，若页面不能配置，请联系管理员获取权限。', EN: 'have not obtained the approval personnel. If the page cannot be configured, please contact the administrator to obtain permissions' },
        isRequiredParticipant: { CN: '是必须参与者，处理人不能为空', EN: ' is a required participant. The handler cannot be empty' },
        remark: { CN: '原因说明', EN: 'Cause statement' },
        pleaseEnterSignRemark: { CN: '请输入加签或减签原因', EN: 'Please enter the reason for signing or cancelling' },
    };

    return {
        i18n: languageObj
    };
});
