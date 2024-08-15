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
        '创建': { CN: '创建', EN: 'Create' },
        '移动到': { CN: '移动到', EN: 'Move' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '删除': { CN: '删除', EN: 'Delete' },

        '描述': { CN: '描述', EN: 'Description' },
        '操作': { CN: '操作', EN: 'operation' },
        '显示名称': { CN: '显示名称', EN: 'Show name' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '数据类型': { CN: '数据类型', EN: 'Data Type' },
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '确定删除': { CN: '确定删除', EN: 'Confirm Delete' },
        '确定删除该数据': { CN: '确定删除该数据？', EN: 'Are you sure to delete this data?' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '请选择移动的节点': { CN: '请选择移动的节点！', EN: 'Please select a mobile node' },
        '删除成功': { CN: '删除成功', EN: 'Delete successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },
        '详情': { CN: '详情', EN: 'Detail' },
        '创建属性': { CN: '创建属性', EN: 'Create Attribute' },
        '编辑属性': { CN: '编辑属性', EN: 'Edit Attribute' },
        '查看属性': { CN: '查看属性', EN: 'View Attribute' },
        '属性列表': { CN: '属性列表', EN: 'Attribute list' },
    }

    return {
        i18n: languageObj
    }
})
