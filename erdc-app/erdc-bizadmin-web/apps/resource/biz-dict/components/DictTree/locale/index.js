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
        '数据项': { CN: '数据项', EN: 'Data Item' },
        '请输入关键字': { CN: '请输入关键字', EN: 'Please enter the keywords' },
        '创建项': { CN: '创建项', EN: 'Created item' },
        '编辑项': { CN: '编辑项', EN: 'Edit item' },
        '是否删除数据项': { CN: '是否删除数据项', EN: 'Whether to delete data items' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '删除成功': { CN: '删除成功', EN: 'Deleted successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },

    }

    return {
        i18n: languageObj
    }
})