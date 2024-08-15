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
        返回: {
            CN: '返回',
            EN: 'Back'
        },
        创建: {
            CN: '创建',
            EN: 'Create'
        },
        修改: {
            CN: '修改',
            EN: 'Modify the'
        },
        查看: {
            CN: '查看',
            EN: 'To view'
        },
        保存: {
            CN: '保存',
            EN: 'Save'
        },
        重置: {
            CN: '重置',
            EN: 'Reset'
        },
        团队成员: {
            CN: '团队成员',
            EN: 'Team Members'
        },
        团队成员提示: {
            CN: '请拖动属性到相应的泳道中',
            EN: 'Drag the property to the appropriate lane'
        },
        搜索属性: {
            CN: '搜索属性',
            EN: 'Search for attributes'
        },
        读写: {
            CN: '读写',
            EN: 'Read and write'
        },
        表格读写: {
            CN: '读/写',
            EN: 'Read/write'
        },
        只读: {
            CN: '只读',
            EN: 'Read-only'
        },
        隐藏: {
            CN: '隐藏',
            EN: 'Hidden'
        },
        添加角色: {
            CN: '添加角色',
            EN: 'Adding a Role'
        },
        角色: {
            CN: '角色',
            EN: 'Role'
        },
        请选择角色: {
            CN: '请选择角色',
            EN: 'Please select a role'
        },
        确认删除: {
            CN: '确认删除',
            EN: 'Confirm deletion'
        },
        删除标题: {
            CN: '您确认删除该角色吗？',
            EN: 'Are you sure to delete this role?'
        },
        删除提示: {
            CN: '删除该角色，将同时删除所有方式',
            EN: 'If you delete this role, all modes are deleted'
        },
        确定: {
            CN: '确定',
            EN: 'Ok'
        },
        取消: {
            CN: '取消',
            EN: 'Cancel'
        },
        删除成功: {
            CN: '删除角色成功！',
            EN: 'The role is deleted successfully!'
        },
        删除失败: {
            CN: '删除角色失败！',
            EN: 'Failed to Delete a Role!'
        },
        权限: {
            CN: '权限',
            EN: 'Permissions'
        },
        保存成功: {
            CN: '保存成功！',
            EN: 'Saved successfully!'
        },
        保存失败: {
            CN: '保存失败！',
            EN: 'Saved failed!'
        },
        查询失败: {
            CN: '查询失败！',
            EN: 'Query failure!'
        },
        属性权限配置: {
            CN: '属性权限配置',
            EN: 'Attribute Permission Configuration'
        },
        属性: {
            CN: '属性',
            EN: 'Attribute'
        },
        增加角色: {
            CN: '增加角色',
            EN: 'Add a character'
        },
        增加群组: {
            CN: '增加群组',
            EN: 'Adding a User Group'
        },
        群组: {
            CN: '群组',
            EN: 'User Group'
        },
        请输入关键字: {
            CN: '请输入关键字',
            EN: 'Please Enter'
        },
        确认取消: {
            CN: '确认取消',
            EN: 'Confirm cancellation'
        },
        提示: {
            CN: '提示',
            EN: 'Tips'
        },
        尚未保存: {
            CN: '检测到未保存的内容，是否在离开页面前保存修改？',
            EN: 'Detected unsaved content. Do you want to save the changes before leaving the page?'
        }
    };

    return { i18n: languageObj };
});
