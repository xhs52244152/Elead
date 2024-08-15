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
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },

        '内部名称': { CN: '内部名称', EN: 'Internal Name' },
        '显示名称': { CN: '显示名称', EN: 'Display Name' },
        '图标': { CN: '图标', EN: 'Icon' },
        '选择图标': { CN: '选择图标', EN: 'Select Icon' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '创建成功': { CN: '创建成功', EN: 'Create successfully' },
        // 内部名称报错信息
        '请填写内部名称': { CN: '请填写内部名称', EN: 'Please fill in the internal name' },
        '内部名称格式错误：如果有“.”，请将其放到中间': { CN: '内部名称格式错误：如果有“.”，请将其放到中间', EN: 'Internal name format error: if there is ".", please put it in the middle' },
        '内部名称格式错误：请输入字母、数字或“.”': { CN: '内部名称格式错误：请输入字母、数字或“.”', EN: 'Internal name format error: Please enter letters, numbers or "."' },
        '是否放弃子类型的创建？': { CN: '是否放弃子类型的创建？', EN: 'Discard creation of subtype?' },
        '是否放弃当前类型的编辑？': { CN: '是否放弃当前类型的编辑？', EN: 'Discard editing of the current type?' },
        '是否放弃服务的编辑': { CN: '是否放弃服务的编辑', EN: 'Whether to discard the editing of the service' },
        '放弃创建': { CN: '放弃创建', EN: 'Discard Creation' },
        '放弃编辑': { CN: '放弃编辑', EN: 'Discard Editor' },
        // 校验报错
        '请输入数字': { CN: '请输入数字', EN: 'please enter a number' },
        '请输入不小于0的正整数': { CN: '请输入不小于0的正整数', EN: 'Please enter a positive integer not less than 0' },
        '最小值不能大于最大值': { CN: '最小值不能大于最大值', EN: 'The minimum value cannot be greater than the maximum value' },
        '最大值不能小于最小值': { CN: '最大值不能小于最小值', EN: 'The minimum value cannot be greater than the maximum value' },
        'tableName': { CN: '表名', EN: 'Table Name' },
        'tableNameError': { CN: '表名格式错误：请输入大小写字母、"_"', EN: 'Name of the table format error: please enter the lowercase letters, "_"' },
        'tableNameTips': { CN: '该类型的实例数据量大，需要建分表，请填写表名', EN: 'The instance data of this type is large, and a score table needs to be created. Fill in the table name.' },

    }

    return {
        i18n: languageObj
    }
})
