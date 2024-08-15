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
        创建: { CN: '创建', EN: 'Create' },
        创建文件夹: { CN: '创建文件夹', EN: 'Create Folder' },
        编辑文件夹: { CN: '编辑文件夹', EN: 'Edit Folder' },
        更多操作: { CN: '更多操作', EN: 'More Actions' },
        编辑: { CN: '编辑', EN: 'Edit' },
        删除: { CN: '删除', EN: 'Delete' },
        提示: { CN: '提示', EN: 'Tips' },

        描述: { CN: '描述', EN: 'Description' },
        操作: { CN: '操作', EN: 'operation' },
        显示名称: { CN: '显示名称', EN: 'Show name' },
        内部名称: { CN: '内部名称', EN: 'Internal name' },
        数据类型: { CN: '数据类型', EN: 'Data Type' },
        请输入: { CN: '请输入', EN: 'Please enter' },
        确认删除: { CN: '确认删除', EN: 'Confirm Delete' },
        确认: { CN: '确认', EN: 'Confirm' },
        取消: { CN: '取消', EN: 'Cancel' },
        请选择移动的节点: { CN: '请选择移动的节点！', EN: 'Please select a mobile node' },
        删除成功: { CN: '删除成功', EN: 'Delete successfully' },
        删除失败: { CN: '删除失败', EN: 'Delete failed' },
        详情: { CN: '详情', EN: 'Detail' },
        创建属性: { CN: '创建属性', EN: 'Create Attribute' },
        编辑属性: { CN: '编辑属性', EN: 'Edit Attribute' },
        查看属性: { CN: '查看属性', EN: 'View Attribute' },
        创建版本对象: { CN: '创建版本对象', EN: 'Create Item Version' },
        创建普通对象: { CN: '创建普通对象', EN: 'Create Item' },
        移动到: { CN: '移动到', EN: 'MOVE TO' },
        请选择移动的对象文件: { CN: '请选择移动的对象文件', EN: 'Please select the object file to move' },
        检出成功: { CN: '检出成功', EN: 'Checkout successfully' },
        检入成功: { CN: '检入成功', EN: 'Checkin successfully' },
        修订成功: { CN: '修订成功', EN: 'Revise successfully' },
        删除最大版本成功: { CN: '删除最大版本成功', EN: 'Delete Branch Version successfully' },
        删除对象成功: { CN: '删除对象成功', EN: 'Delete Object Version successfully' },
        删除最新版本成功: { CN: '删除最新版本成功', EN: 'Delete Last Version successfully' },
        moveFailed: {
            CN: '文件夹不支持批量移动，请选择对象文件',
            EN: 'The folder does not support batch movement. Please select an object file'
        }
    };

    return {
        i18n: languageObj
    };
});
