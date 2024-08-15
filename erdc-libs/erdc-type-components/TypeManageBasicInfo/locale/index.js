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
    const languageObj =  {
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '编辑服务': { CN: '编辑服务', EN: 'Edit Services' },
        '编辑类型': { CN: '编辑类型', EN: 'Edit Type' },
        '基本信息': { CN: '基本信息', EN: 'Basic information' },
        '设置规则': { CN: '设置规则', EN: 'Set Rules' },
        '设置图标': { CN: '设置图标', EN: 'Set Icons' },
        '常数规则': { CN: '常数规则', EN: 'Constant Rules' },
        '图标': { CN: '图标', EN: 'Icons' },
        '增加': { CN: '增加', EN: 'Add' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '删除': { CN: '删除', EN: 'Remove' },
        '保存': { CN: '保存', EN: 'Save' },
        '确定': { CN: '确定', EN: 'confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '操作': { CN: '操作', EN: 'operation' },
        '更多': { CN: '更多', EN: 'More' },
        '上移': { CN: '上移', EN: 'Move up' },
        '下移': { CN: '下移', EN: 'Move down' },
        
        '内部名称': { CN: '内部名称', EN: 'Internal Name' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '删除成功': { CN: '删除成功', EN: 'Remove Successfully' },
        '删除失败': { CN: '删除失败', EN: 'Remove Failure' },
        '是否要删除当前数据': { CN: '是否要删除当前数据', EN: 'Do you want to delete the current data' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Deletion' },
        '序号': { CN: '序号', EN: 'Order' },
        '图标规则': { CN: '图标规则', EN: 'Icon Rules' },
    }

    return {
        i18n : languageObj
    }
 })