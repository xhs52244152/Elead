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
        '处理节点名称': { CN: '处理节点名称', EN: 'Processing node name' },
        '批量配置处理人': { CN: '批量配置处理人', EN: 'Configure processors in batches' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '暂无数据': { CN: '暂无数据', EN: 'No data yet' },
        '参与者类型': { CN: '参与者类型', EN: 'Participant type' },
        '请选择参与者类型': { CN: '请选择参与者类型', EN: 'Please select a participant type' },
        '参与者': { CN: '参与者', EN: 'participant' },
        '请选择参与者': { CN: '请选择参与者', EN: 'Please select participants' },
        '处理人': { CN: '处理人', EN: 'handler' },
        '请选择处理人': { CN: '请选择处理人', EN: 'Please select a handler' },
        '处理人配置不合法': { CN: '处理人配置不合法', EN: 'The handler configuration is invalid' },
        '用户': { CN: '用户', EN: 'user' },
        '组织': { CN: '组织', EN: 'organization' },
        '角色': { CN: '角色', EN: 'role' },
        '群组': { CN: '群组', EN: 'group' },
        '操作者': { CN: '操作者', EN: 'operator' },
        '节点': { CN: '节点', EN: 'node' },
        '流程启动者': { CN: '流程启动者', EN: 'process initiator' },
        '未获取到上下文信息': { CN: '未获取到上下文信息', EN: 'Context information not obtained' },
        '角色无法获取人员': { CN: '的角色无法获取人员', EN: '‘s role cannot obtain personnel' },
        '未获取审批人员': { CN: '未获取审批人员，若页面不能配置，请联系管理员获取权限。', EN: 'have not obtained the approval personnel. If the page cannot be configured, please contact the administrator to obtain permissions' },
    }

    return {
        i18n: languageObj
    }
})
