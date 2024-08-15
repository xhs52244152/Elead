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
        系统公告: { CN: '系统公告', EN: 'Notice' },
        操作: { CN: '操作', EN: 'Operation' },
        编辑: { CN: '编辑', EN: 'Edit' },
        移除: { CN: '移除', EN: 'remove' },
        删除: { CN: '删除', EN: 'Delete' },
        创建: { CN: '创建', EN: 'Create' },
        批量删除: { CN: '批量删除', EN: 'Batch Delete' },
        标题: { CN: '标题', EN: 'title' },
        创建人: { CN: '创建人', EN: 'creator' },
        创建时间: { CN: '创建时间', EN: 'create time' },
        状态: { CN: '状态', EN: 'status' },
        是否弹窗: { CN: '是否弹窗', EN: 'if popover' },
        是否消息通知: { CN: '是否消息通知', EN: 'if notice' },
        附件: { CN: '附件', EN: 'attachment' },
        内容: { CN: '内容', EN: 'content' },
        启用: { CN: '启用', EN: 'enable' },
        停用: { CN: '停用', EN: 'disable' },
        是: { CN: '是', EN: 'yes' },
        否: { CN: '否', EN: 'no' },
        公告对象: { CN: '公告对象', EN: 'notice object' },
        统一通知: { CN: '统一通知', EN: 'notify' },
        参与者类型: { CN: '参与者类型', EN: 'Participant Type' },
        参与者: { CN: '参与者', EN: 'Participant' },
        部门: { CN: '部门', EN: 'Department' },
        电话: { CN: '电话', EN: 'Telephone' },
        邮箱: { CN: '邮箱', EN: 'Email' },
        请先选择关联数据: { CN: '请先选择关联数据', EN: 'Please choose related data' },
        文件上传中: { CN: '文件上传中', EN: 'File is uploading' },
        编辑公告: { CN: '编辑公告', EN: 'Edit Notice' },
        创建公告: { CN: '创建公告', EN: 'Create Notice' },
        确定: { CN: '确定', EN: 'confirm' },
        取消: { CN: '取消', EN: 'cancel' },
        all: { CN: '所有人', EN: 'Owner' },
        part: { CN: '用户/组', EN: 'User/Group' },

        tips: { CN: '提示', EN: 'Tips' },
        确认删除: { CN: '确认删除？', EN: 'Confirm Delete?' },
        标记为已读: { CN: '标记为已读', EN: 'Mark as Read' },
        全部标记为已读: { CN: '全部标记为已读', EN: 'All marked as read' },
        请选择数据: { CN: '请选择数据', EN: 'Please select data' },

        确认标记为已读: { CN: '确认标记为已读', EN: 'Confirm mark as read' },
        readAllConfirm: { CN: '确认将所有公告标记为已读', EN: 'Confirm to mark all notices as read' },
        已更改所有公告为已读: { CN: '已更改所有公告为已读', EN: 'Changed all notices to read' },
        deleteTip: { CN: '是否删除所选择的公告?', EN: 'Whether to delete the selected notice?' },
        emptyConfrim: { CN: '您确认清空公告吗？', EN: 'Are you sure to clear the notice？' },
        已读: { CN: '已读', EN: 'readed' },
        未读: { CN: '未读', EN: 'unread' },

        ROLE: { CN: '角色', EN: 'Role' },
        USER: { CN: '人员', EN: 'User' },
        GROUP: { CN: '群组', EN: 'Group' },
        ORG: { CN: '部门', EN: 'Organization' },
        systemNotice: { CN: '系统公告', EN: 'System Notice' },
        noticeCount: { CN: '共{total}个公告', EN: 'all {total} notices' }
    };

    return {
        i18n: languageObj
    };
});
