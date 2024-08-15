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
        '基本信息': { CN: '基本信息', EN: 'Basic information' },
        '显示单位': { CN: '显示单位', EN: 'Show Units' },
        '导出': { CN: '导出', EN: 'Export' },
        '默认值': { CN: '默认值', EN: 'Default' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },

        '测量系统': { CN: '测量系统', EN: 'Measuring system' },
        '覆盖': { CN: '覆盖', EN: 'Cover' },
        '操作': { CN: '操作', EN: 'Operation' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '测量名称': { CN: '测量名称', EN: 'Measure name' },
        '量纲符号': { CN: '量纲符号', EN: 'Dimensional symbols' },
        '描述': { CN: '描述', EN: 'Description' },
        '更新成功': { CN: '更新成功', EN: 'Update successful' },
        '新增成功': { CN: '新增成功', EN: 'Create successful' },
        '更新失败': { CN: '更新失败', EN: 'Update failed' },
        '新增失败': { CN: '新增失败', EN: 'Create failure' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '确认取消': { CN: '确认取消', EN: 'Confirm cancel' },
        '保存': { CN: '保存', EN: 'Save' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '请输入内部名称': { CN: '请输入内部名称', EN: 'Please enter the internal name' },
        '内部名称格式错误': { CN: '内部名称格式错误：请输入大小写字母、数字、"_"、"."', EN: 'The internal name format error: please enter the lowercase letters, number, "_" and "."' },
        '获取详情失败': { CN: '获取详情失败', EN: 'Failed to get the details' },
        '请先填写默认值': { CN: '请先填写默认值', EN: 'Please fill in the default values' },
        '是否放弃测量单位的编辑': { CN: '是否放弃测量单位的编辑', EN: 'Whether to give up measuring unit editor' },
        '是否放弃测量单位的创建': { CN: '是否放弃测量单位的创建', EN: 'Whether to give up measuring unit created' },
        '量纲符号错误提示': { CN: '大小写字母、数字、"%"、"/"、"*"', EN: 'Lowercase letters, Numbers, "%", "/", "*"' },
        'unitSymbol': { CN: '单位符号', EN: 'Unit symbol' },
        'defaultUnit': { CN: '默认单位', EN: 'Default unit' },
    }

    return {
        i18n: languageObj
    }
})
