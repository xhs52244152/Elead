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
        确定: { CN: '确定', EN: 'Confirm' },
        取消: { CN: '取消', EN: 'Cancel' },
        请输入: { CN: '请输入', EN: 'Please enter' },
        更新成功: { CN: '更新成功', EN: 'Update successful' },
        更新失败: { CN: '更新失败', EN: 'Update failed' },
        新增成功: { CN: '新增成功', EN: 'Create successful' },
        新增失败: { CN: '新增失败', EN: 'Create failure' },
        团队模板管理: { CN: '团队模板管理', EN: 'Lifecycle' },
        更多操作: { CN: '更多操作', EN: 'More actions' },
        导入: { CN: '导入', EN: 'Import' },
        导出: { CN: '导出', EN: 'Export' },
        创建团队模板: { CN: '创建团队模板', EN: 'Create team template' },
        编辑团队模板: { CN: '编辑团队模板', EN: 'Create team template' },
        名称: { CN: '名称', EN: 'Name' },
        编码: { CN: '编码', EN: 'Code' },
        描述: { CN: '描述', EN: 'Description' },
        启用成功: { CN: '启用成功', EN: 'Enable successful' },
        停用成功: { CN: '停用成功', EN: 'Disabled successful' },
        启用失败: { CN: '启用失败', EN: 'Enable failure' },
        确认删除: { CN: '确认删除', EN: 'Enable failure' },
        删除成功: { CN: '删除成功', EN: 'Enable failure' },
        删除失败: { CN: '删除失败', EN: 'Enable failure' },
        删除提示: { CN: '确认删除该团队模板吗？', EN: 'Are you sure to delete the team template?' },
        basicInfo: { CN: '基本信息', EN: 'Basic Infos' },
        teamMembers: { CN: '团队成员', EN: 'Team members' },
    };

    return {
        i18n: languageObj
    };
});
