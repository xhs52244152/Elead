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
        '全部': { CN: '全部', EN: 'All' },
        '模型属性': { CN: '模型属性', EN: 'Model Properties' },
        '标准属性': { CN: '标准属性', EN: 'Standard Properties' },
        '软属性': { CN: '软属性', EN: 'Soft Attribute' },
        '请输入': { CN: '请输入', EN: 'Place Enter' },
        '删除': { CN: '删除', EN: 'Delete' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '创建': { CN: '创建', EN: 'Create' },
        '详情': { CN: '详情', EN: 'Detail' },
        '创建属性组': { CN: '创建属性组', EN: 'Create Attribute Group' },
        '编辑属性组': { CN: '编辑属性组', EN: 'Edit Attribute Group' },
        '删除成功': { CN: '删除成功', EN: 'Deleted successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },
        '操作': { CN: '操作', EN: 'operation' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '名称': { CN: '名称', EN: 'Name' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '描述': { CN: '描述', EN: 'Description' },
        '所属类型': { CN: '所属类型', EN: 'Belong Type' },
        '属性分类': { CN: '属性分类', EN: 'Attribute Classification' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '删除属性组': { CN: '确认删除该属性组？', EN: 'Confirm The Deletion Of This Property Group?' },
        '拷贝到本类型': { CN: '拷贝到本类型', EN: 'Copy to this type' },
        '确认拷贝': { CN: '确认拷贝', EN: 'Confirm Copy' },
        '拷贝属性组': { CN: '确认拷贝该属性组？', EN: 'Confirm The Copy Of This Property Group?' },
        inheritAttrGroup: { CN: '继承属性组', EN: 'Inherit Attribute group' },
        customAttrGroup: { CN: '自定义属性组', EN: 'Custom Attribute group' }
    };

    return {
        i18n: languageObj
    };
});
