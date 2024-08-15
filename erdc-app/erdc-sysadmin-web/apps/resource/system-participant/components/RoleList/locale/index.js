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
        '编码': { CN: '编码', EN: 'Number' },
        '角色名称': { CN: '角色名称', EN: 'Role Name' },
        '角色类型': { CN: '角色类型', EN: 'Role Type' },
        '排序': { CN: '排序', EN: 'Sort order' },
        '是否启用': { CN: '是否启用', EN: 'Whether to enable' },
        '描述': { CN: '描述', EN: 'Describe' },
        '操作': { CN: '操作', EN: 'Operation' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '删除': { CN: '删除', EN: 'Delete' },
        '确定': { CN: '确 定', EN: 'Confirm' },
        '取消': { CN: '取 消', EN: 'Cancel' },
        '确认删除': { CN: '确认删除', EN: 'Confirm delete' },
        '确定删除角色': { CN: '确定删除角色', EN: 'Confirm delete role' },

        '查询失败': { CN: '查询失败', EN: 'The query fails' },
        '查看角色': { CN: '查看角色', EN: 'Character' },
        '创建角色': { CN: '创建角色', EN: 'Create role' },
        '编辑角色': { CN: '编辑角色', EN: 'Edit role' },
        '删除成功': { CN: '删除成功', EN: 'Delete successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },
        '创建': { CN: '创建', EN: 'Create' },
        'delTips': { CN: '仅禁用状态可以删除', EN: 'Only the disabled state can be deleted' },

    }

    return {
        i18n: languageObj
    }
})
