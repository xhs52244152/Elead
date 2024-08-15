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
        标题: { CN: '标题', EN: 'Title' },
        状态: { CN: '状态', EN: 'State' },
        清空: { CN: '清空', EN: 'Empty' },
        删除: { CN: '删除', EN: 'Delete' },
        消息清空成功: { CN: '消息清空成功', EN: 'Message cleared successfully' },
        emptyConfirm: { CN: '您确认清空公告吗？', EN: 'Are you sure to clear the notice？' },
        readAllConfirm: { CN: '确认将所有公告标记为已读吗', EN: 'Confirm to mark all notices as read' },
        暂无消息可以操作: { CN: '暂无消息可以操作', EN: 'There is no message to operation' },
        接收时间: { CN: '接收时间', EN: 'Receiving Time' },
        最后修改人: { CN: '最后修改人', EN: 'Final Modifier' },
        模板管理: { CN: '模板管理', EN: 'Template Management' },
        关联需求模板: { CN: '关联需求模板', EN: 'Associated requirement template' },
        标题为必填: { CN: '标题为必填', EN: 'Title is required' },
        rollbackConfrim: {
            CN: '确认取消并回滚至上一次的配置吗',
            EN: 'Are you sure to cancel and roll back to the previous configuration'
        },
        关联模板: { CN: '关联模板', EN: 'Associated with template' },
        weeklyTaskCountRemind: {
            CN: '每周任务统计提醒邮件(每周任务完成统计情况于次周周一清晨自动推送至邮箱)',
            EN: 'Weekly task count reminder email(The weekly task completion statistics will be automatically pushed to the mailbox on Monday morning of the next week)'
        },
        请关联模板后再操作: {
            CN: '请关联模板后再操作',
            EN: 'Please associate the template before operating'
        },
        取消关联成功: { CN: '取消关联成功', EN: 'Successfully canceling the association' },
        weeklyRptUpdateRemind: {
            CN: '每周周报更新提醒邮件(周报更新后收到消息通知)',
            EN: 'Weekly weekly report update reminder email(The weekly report is updated and notified)'
        },
        消息体为必填: { CN: '消息体为必填', EN: 'The body of the message is required' },
        只能选中一条模板: { CN: '只能选中一条模板', EN: 'Only one template can be selected' },
        关注人: { CN: '关注人', EN: 'Concerned person' },
        标题最多50个字符: { CN: '标题最多50个字符', EN: 'Title has a maximum of 50 characters' },
        管理模板: { CN: '管理模板', EN: 'Manage template' },
        设置提醒内容: { CN: '设置提醒内容', EN: 'Set contents of reminders' },
        weeklyRptNotice: {
            CN: '周报提醒通知(周报提交后收到消息通知)',
            EN: 'Weekly report notice(The weekly report is submitted and notified)'
        },
        emailNotice: {
            CN: '邮件提醒通知(定期收到的邮件消息通知)',
            EN: 'Email notice(Regular notification of mail messages received)'
        },
        每日工作提醒: { CN: '每日工作提醒', EN: 'Daily work reminders' },
        选择抄送人: { CN: '选择抄送人', EN: 'Please select the person to be copied in' },
        需要收到消息: { CN: '需要收到消息', EN: 'Need to receive message' },
        设置每日工作提醒: { CN: '设置每日工作提醒', EN: 'Set daily work reminders' },
        是否有效: { CN: '是否有效', EN: 'The validity of' },
        设置显示字段: { CN: '设置显示字段', EN: 'Set Display Field' },
        标记为已读: { CN: '标记为已读', EN: 'Mark as Read' },
        已读: { CN: '已读', EN: 'Read' },
        未读: { CN: '未读', EN: 'unread' },
        发信人: { CN: '发信人', EN: 'Sender' },
        确认标记为已读: { CN: '确认标记为已读', EN: 'Confirm mark as read' },
        消息已全部标记为已读: { CN: '消息已全部标记为已读', EN: 'Messages have all been marked as read' },
        全部标记为已读: { CN: '全部标记为已读', EN: 'All marked as read' },
        readConfirm: {
            CN: '您确认将全部消息标记为已读吗',
            EN: 'Are you sure to mark all messages as read'
        },
        已更所选消息为已读: { CN: '已更所选消息为已读', EN: 'The selected message has been read' },
        消息体: { CN: '消息体', EN: 'Message Body' },
        消息类型: { CN: '消息类型', EN: 'Message Type' },
        消息提醒: { CN: '消息提醒', EN: 'message Notification' },
        操作: { CN: '操作', EN: 'Operate' },
        确认删除: { CN: '确认删除？', EN: 'Confirm Delete?' },
        请选择数据: { CN: '请选择数据', EN: 'Please select data' },
        messageTitle: { CN: '消息详情', EN: 'Message details' }
    };

    return {
        i18n: languageObj
    };
});
