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
        '图标': { CN: '图标', EN: 'Icon' },
        '设置规则': { CN: '设置规则', EN: 'Set Rules' },
        '增加': { CN: '增加', EN: 'Add' },
        '保存': { CN: '保存', EN: 'Save' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '删除': { CN: '删除', EN: 'Remove' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '清空条件': { CN: '清空条件', EN: 'Clear Conditions' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '字段': { CN: '字段', EN: 'Field' },
        '表达式': { CN: '表达式', EN: 'Expression' },
        '数据值': { CN: '数据值', EN: 'Data Value' },
        '操作': { CN: '操作', EN: 'Operation' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '确定删除': { CN: '确定删除', EN: 'Confirm Removal' },
        '是否要删除当前行数据？': {
            CN: '是否要删除当前行数据？',
            EN: 'Do you want to delete the current row of data?'
        },
        '删除成功': { CN: '删除成功', EN: 'Remove Successfully' },
        '删除失败': { CN: '删除失败', EN: 'Remove failure' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '新增成功': { CN: '新增成功', EN: 'Add success' },
        '图标配置': { CN: '图标配置', EN: 'Icon Configuration' },
        '规则配置': { CN: '规则配置', EN: 'Rule Configuration' },
        '图标颜色': { CN: '图标颜色', EN: 'Icon Color' },
        '配置图标规则': { CN: '配置图标规则', EN: 'Configure icon rules' }
    };

    return {
        i18n: languageObj
    };
});
