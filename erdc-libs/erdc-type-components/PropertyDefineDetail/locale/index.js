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
        '编辑': { CN: '编辑', EN: 'Edit' },
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '删除': { CN: '删除', EN: 'Delete' },
        '导出数据': { CN: '导出数据', EN: 'Export' },
        '基本信息': { CN: '基本信息', EN: 'Basic information' },
        'editFeatureAttr': { CN: '编辑特性属性', EN: 'Edit Feature Attributes' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },

        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '请选择': { CN: '请选择', EN: 'Please select' },
        '数据类型': { CN: '数据类型', EN: 'Data type' },
        '属性类型': { CN: '属性类型', EN: 'Real type' },
        '组件类型': { CN: '组件类型', EN: 'Component type' },
        '属性所属对象': { CN: '属性所属对象', EN: 'Object properties belong to' },
        '所属类': { CN: '所属类', EN: 'Belongs to the class' },
        '所属业务对象': { CN: '所属业务对象', EN: 'Belongs to the business object' },
        '私有模型': { CN: '私有模型', EN: 'Private model' },
        '是否可继承': { CN: '是否可继承', EN: 'Whether can be inherited' },
        '值长度': { CN: '值长度', EN: 'Value is the length of the' },
        '是否只读': { CN: '是否只读', EN: 'ReadOnly' },
        '是否隐藏': { CN: '是否隐藏', EN: 'Hidden' },
        '是否必填': { CN: '是否必填', EN: 'Required' },
        '是否覆盖': { CN: '是否覆盖', EN: 'Can you cover' },
        '排序': { CN: '排序', EN: 'Sort' },
        '最大值': { CN: '最大值', EN: 'Max' },
        '最小值': { CN: '最小值', EN: 'Min' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '是否要删除该特性属性': { CN: '是否要删除该特性属性?', EN: 'Do you want to delete the feature attributes?' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'cancel' },
        '删除成功': { CN: '删除成功', EN: 'Successfully delete' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },
        '值选项': { CN: '值选项', EN: 'Data key' },
    }

    return {
        i18n: languageObj
    }
})
