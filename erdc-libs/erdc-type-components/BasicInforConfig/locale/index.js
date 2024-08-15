/**
 * i18n国际化文件
 * **/
 define([], function () {
    /**
     * 国际化key建议统一用中文作为key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/ 
    
    // 配置国际化key-value
    const languageObj =  {
        '基本信息': { CN: '基本信息', EN: 'Basic information' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '名称': { CN: '名称', EN: 'Show Name' },
        '请选择': { CN: '请选择', EN: 'Please select' },
        '数据类型': { CN: '数据类型', EN: 'Data type' },
        '属性类型': { CN: '属性类型', EN: 'Real type' },
        '组件类型': { CN: '组件类型', EN: 'Component type' },
        // '属性所属对象': { CN: '属性所属对象', EN: 'Object properties belong to' },
        '所属类': { CN: '所属类', EN: 'Belongs to the class' },
        '所属类输入框提示': { CN: '可输入关键字进行搜索或编辑', EN: 'You can enter keywords to search or edit' },
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
        '确认取消': { CN: '确认取消', EN: 'Confirm Cancel' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '是否放弃保存': { CN: '是否放弃保存', EN: 'Whether to give up keep' },
        '新增成功': { CN: '新增成功', EN: 'Create successfully' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '新增失败': { CN: '新增失败', EN: 'Create failure' },
        '更新失败': { CN: '更新失败', EN: 'Update failure' },
        '值选项': { CN: '值选项', EN: 'Data key' },

        '请输入所属类': { CN: '请输入所属类', EN: 'Please enter the class to which it belongs' },
        '输入最大值不能小于最小值': { CN: '输入最大值不能小于最小值', EN: 'Maximum input can not be less than the minimum value' },
        '输入最小值不能大于最大值': { CN: '输入最小值不能大于最大值', EN: 'The minimum value is not greater than the maximum' },
        '请输入排序': { CN: '请输入排序', EN: 'Please enter the order' },
        '请输入数字': { CN: '请输入数字', EN: 'Please enter the Numbers' },
        '请输入不小于100的正整数': { CN: '请输入不小于100的正整数', EN: 'Please enter a positive integer is not less than 100' },
        '私有模型提示': { CN: '明确该特征属性应用业务对象，即指定唯一的业务模型的模型定义或属性定义中出现该特征属性', EN: 'Clarify the application of this feature attribute to the business object, that is, specify that the feature attribute appears in the model definition or attribute definition of a unique business model' },
        '所属类提示': { CN: '明确该特征属性应用的元模型类型，即指定某个类型（模型、属性）模型定义信息中出现该特征', EN: 'Clarify the meta model type to which the feature attribute is applied, that is, specify a type (model, attribute) where the feature appears in the model definition information' },
        '请输入内部名称': { CN: '请输入内部名称', EN: 'Please enter the internal name' },
        '内部名称格式错误': { CN: '内部名称格式错误：请输入大小写字母、"_"、"."', EN: 'The internal name format error: please enter the lowercase letters, "_" and "."' }, 
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
    }

    return {
        i18n : languageObj
    }
 })
