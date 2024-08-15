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
        '关联组件': { CN: '关联组件', EN: 'Associated components' },
        '增加': { CN: '增加', EN: 'Add' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '移除': { CN: '移除', EN: 'Remove' },
        '保存': { CN: '保存', EN: 'Save' },
        '确定': { CN: '确定', EN: 'confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '组件名称': { CN: '组件名称', EN: 'Component name' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '名称': { CN: '名称', EN: 'Name' },
        '描述': { CN: '描述', EN: 'description' },
        '是否默认': { CN: '是否默认', EN: 'IsDefault' },
        '操作': { CN: '操作', EN: 'operation' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '处理类': { CN: '处理类', EN: 'Processing class' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        '列前缀': { CN: '列前缀', EN: 'Column prefix' },

        '确认移除': { CN: '确认移除', EN: 'Confirm remove' },
        '是否要删除该组件': { CN: '是否要删除该组件？', EN: 'Whether you want to delete this component?' },
        '移除成功': { CN: '移除成功', EN: 'Remove Successfully' },
        '移除失败': { CN: '移除失败', EN: 'Remove failure' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '新增成功': { CN: '新增成功', EN: 'Add success' },
        '增加关联组件': { CN: '增加关联组件', EN: 'Adding associated components' },

        '停用成功' : {CN : '停用成功' , EN : 'Stop successful'},
        '启用成功' : {CN : '启用成功' , EN : 'Enable successful'},
        '停用失败' : {CN : '停用失败' , EN : 'Stop failure'},
        '启用失败' : {CN : '启用失败' , EN : 'Enable failure'},
        '是否停用该组件' : {CN : '是否停用该组件' , EN : 'Whether to disable the component'},
        '是否启用该组件' : {CN : '是否启用该组件' , EN : 'Whether to enable the component'},
        '停用组件' : {CN : '停用组件' , EN : 'Disable components'},
        '启用组件' : {CN : '启用组件' , EN : 'Enable the component'},
        '确认删除' : {CN : '确认删除' , EN : 'Confirm delete'},
        '删除成功' : {CN : '删除成功' , EN : 'Delete successful'},
        '删除失败' : {CN : '删除失败' , EN : 'Delete failure'},
    }

    return {
        i18n: languageObj
    }
})
