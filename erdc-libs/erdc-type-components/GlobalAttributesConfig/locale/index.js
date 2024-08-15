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
        '编辑基本信息配置': { CN: '编辑基本信息配置', EN: 'Edit basic information configuration' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        
        '软属性': { CN: '软属性', EN: 'Soft Attribute' },
        '标准属性': { CN: '标准属性', EN: 'Standard Properties' },

        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '类型': { CN: '类型', EN: 'Type' },
        
        '内部名称': { CN: '内部名称', EN: 'Internal Name' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '所属类型': { CN: '所属类型', EN: 'Affiliation Type' },
        '数据类型': { CN: '数据类型', EN: 'Data Type' },
        '组件类型': { CN: '组件类型', EN: 'Component Type' },
        '数据表字段': { CN: '数据表字段', EN: 'Data Table Fields' },
        '组件': { CN: '组件', EN: 'Component' },
        '属性分类': { CN: '属性分类', EN: 'Attribute Classification' },
        '引用数据源': { CN: '引用数据源', EN: 'Reference data source' },
        '引用数据源提示': { CN: '当前属性的下拉值引用的数据源，根据不同的组件该数据源填写方式与要求不同：1、接口下拉框组件，填写引用类的内部名称，则默认调用该引用类的listbyKey获取数据做为当前属性的下拉值,如此默认值不能满足可选择通过下方的组件配置配置接口请求方法 2、数据字典组件，自动获取数据字典所配置的数据项，选择的数据项则为当前属性的下拉值。3、枚举下拉框组件，即可填写枚举类的内部名称，自动获取该枚举类的值做为当前属性的下拉值', EN: 'The data source referenced by the drop-down value of the current attribute is filled in different ways according to different components: 1. If you fill in the internal name of the reference class in the interface drop-down box component, the listbyKey of the reference class is called by default to obtain the data as the drop-down value of the current attribute. This default value does not satisfy the optional configuration interface request method 2 and data dictionary component through the component configuration below. Automatically gets the data item configured by the data dictionary, and the selected data item is the drop-down value of the current property. 3. Enumerate the drop-down box components, you can fill in the internal name of the enumeration class, and automatically obtain the value of the enumeration class as the drop-down value of the current property.' },
        '属性所属对象': { CN: '属性所属对象', EN: 'Object properties Belong To' },
        '所属业务对象': { CN: '所属业务对象', EN: 'Belongs To The Business Object' },
        '是否可继承': { CN: '是否可继承', EN: 'Whether Can Be Inherited' },
        '属性值长度': { CN: '属性值长度', EN: 'Length Of The Attribute Value' },
        '是否只读': { CN: '是否只读', EN: 'ReadOnly' },
        '是否隐藏': { CN: '是否隐藏', EN: 'Hidden' },
        '是否必填': { CN: '是否必填', EN: 'Require' },
        '继承过能否修改': { CN: '继承过能否修改', EN: 'Can It Be Modified' },
        '排序': { CN: '排序', EN: 'Sort' },
        '最大值': { CN: '最大值', EN: 'Max' },
        '最小值': { CN: '最小值', EN: 'Min' },
        '最大长度': { CN: '最大长度', EN: 'Max Length' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '确认': { CN: '确认', EN: 'Confirm' },
        '删除成功': { CN: '删除成功', EN: 'Successfully Delete' },
        '删除失败': { CN: '删除失败', EN: 'Delete Failed' },
        '确认移除': { CN: '确认移除', EN: 'Confirm remove' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '创建成功': { CN: '创建成功', EN: 'Create successfully' },
        '是否放弃属性的创建？': { CN: '是否放弃属性的创建？', EN: 'Discard creation of attribute?' },
        '是否放弃属性的编辑？': { CN: '是否放弃属性的编辑？', EN: 'Discard editing of attribute?' },
        '放弃创建': { CN: '放弃创建', EN: 'Discard Creation' },
        '放弃编辑': { CN: '放弃编辑', EN: 'Discard Editor' },
        
        // 内部名称报错信息
        '请填写内部名称': { CN: '请填写内部名称', EN: 'Please fill in the internal name' },
        '内部名称格式错误：如果有“.”，请将其放到中间': { CN: '内部名称格式错误：如果有“.”，请将其放到中间', EN: 'Internal name format error: if there is ".", please put it in the middle' },
        '内部名称格式错误：请输入字母、数字或“.”': { CN: '内部名称格式错误：请输入字母、数字或“.”', EN: 'Internal name format error: Please enter letters, numbers or "."' },
        
        // 校验报错
        '请输入数字': { CN: '请输入数字', EN: 'please enter a number' },
        '请输入不小于0的正整数': { CN: '请输入不小于0的正整数', EN: 'Please enter a positive integer not less than 0' },
        '最小值不能大于最大值': { CN: '最小值不能大于最大值', EN: 'The minimum value cannot be greater than the maximum value' },
        '最大值不能小于最小值': { CN: '最大值不能小于最小值', EN: 'The minimum value cannot be greater than the maximum value' },
        '输入值不能大于10000': { CN: '输入值不能大于10000', EN: 'The input value is not greater than 10000' },


    }

    return {
        i18n: languageObj
    }
})
