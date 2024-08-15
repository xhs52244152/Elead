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
        确定: { CN: '确定', EN: 'Confirm' },
        取消: { CN: '取消', EN: 'Cancel' },
        确认删除: { CN: '确认删除', EN: 'Confirm Delete ' },
        删除成功: { CN: '删除成功', EN: 'Deleted successfully' },
        删除失败: { CN: '删除失败', EN: 'Delete failed' },
        保存成功: { CN: '保存成功', EN: 'Save successfully' },
        保存失败: { CN: '保存失败', EN: 'Save failed' },
        项名称: { CN: '项名称', EN: 'Item name' },
        创建一级: { CN: '创建一级', EN: 'Create first level' },
        移动至其他节点: { CN: '移动至其他节点', EN: 'Move to the other nodes' },
        名称: { CN: '名称', EN: 'name' },
        请输入名称: { CN: '请输入名称', EN: 'Please enter name' },
        请输入: { CN: '请输入', EN: 'Please enter' },
        请输入数据值: { CN: '请输入数据值', EN: 'Please enter number' },
        描述: { CN: '描述', EN: 'Describe' },
        请输入描述: { CN: '请输入描述', EN: 'Please enter describe' },
        请选择: { CN: '请选择', EN: 'Please select' },
        请选择状态: { CN: '请选择状态', EN: 'Please select status' },
        创建同级: { CN: '创建同级', EN: 'Created at the same level' },
        创建子级: { CN: '创建子级', EN: 'Created child level' },
        删除: { CN: '删除', EN: 'Delete' },
        更多: { CN: '更多', EN: 'More' },
        上移: { CN: '上移', EN: 'Move up' },
        下移: { CN: '下移', EN: 'Move down' },
        保存: { CN: '保存', EN: 'Save' },
        重置: { CN: '重置', EN: 'Reset' },
        数据值: { CN: '数据值', EN: 'Number' },
        状态: { CN: '状态', EN: 'Status' },
        操作: { CN: '操作', EN: 'Operation' },
        获取页面详情失败: { CN: '获取页面详情失败', EN: 'Failed to get the page for details' },
        是否重置: { CN: '是否重置', EN: 'Whether to reset the' },
        请选择移动的节点: { CN: '请选择移动的节点！', EN: 'Please select a mobile node' },
        草稿: { CN: '草稿', EN: 'Draft' },
        启用: { CN: '启用', EN: 'Enable' },
        停用: { CN: '停用', EN: 'Disable' },
        numberCode: { CN: '编码Code', EN: 'Number code' },
        codeTips: {
            CN: '编码规则定义的变量的变量值',
            EN: 'The variable value of the variable defined by the encoding rule'
        },
        valueRepeat: { CN: '数据值重复', EN: 'Value Repeat' }
    };

    return {
        i18n: languageObj
    };
});
