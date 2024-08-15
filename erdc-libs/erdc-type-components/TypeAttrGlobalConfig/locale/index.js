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
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '操作': { CN: '操作', EN: 'Operation' },
        '增加': { CN: '增加', EN: 'Add' },
        '删除': { CN: '删除', EN: 'Delete' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '移除': { CN: '移除', EN: 'Remove' },
        '保存': { CN: '保存', EN: 'Save' },
        '确定': { CN: '确定', EN: 'confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        

        '类型': { CN: '类型', EN: 'Type' },
        '描述': { CN: '描述', EN: 'Description' },
        '内部名称': { CN: '内部名称', EN: 'Internal Name' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '所属类型': { CN: '所属类型', EN: 'Affiliation Type' },
        '数据类型': { CN: '数据类型', EN: 'Data Type' },
        '组件类型': { CN: '组件类型', EN: 'Component Type' },
        '类型分类': { CN: '类型分类', EN: 'Type Classification' },

        '确认移除': { CN: '确认移除', EN: 'Confirm remove' },
        '移除成功': { CN: '移除成功', EN: 'Remove Successfully' },
        '移除失败': { CN: '移除失败', EN: 'Remove failure' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '新增成功': { CN: '新增成功', EN: 'Add success' },
        '是否放弃属性组的创建？': { CN: '是否放弃属性组的创建？', EN: 'Discard creation of attribute group?' },
        '是否放弃属性组的编辑？': { CN: '是否放弃属性组的编辑？', EN: 'Discard editing of attribute group?' },
        '放弃创建': { CN: '放弃创建', EN: 'Discard Creation' },
        '放弃编辑': { CN: '放弃编辑', EN: 'Discard Editor' },
        // 内部名称报错信息
        '请填写内部名称': { CN: '请填写内部名称', EN: 'Please fill in the internal name' },
        '内部名称格式错误：如果有“.”，请将其放到中间': { CN: '内部名称格式错误：如果有“.”，请将其放到中间', EN: 'Internal name format error: if there is ".", please put it in the middle' },
        '内部名称格式错误：请输入字母、数字或“.”': { CN: '内部名称格式错误：请输入字母、数字或“.”', EN: 'Internal name format error: Please enter letters, numbers or "."' },
    }

    return {
        i18n: languageObj
    }
})