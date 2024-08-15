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
        '搜索关键字': { CN: '搜索关键字', EN: 'Search keyword' },
        '组件管理': { CN: '组件管理', EN: 'Component management' },
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '全量导入': { CN: '全量导入', EN: 'Complete Import' },
        '全量导出': { CN: '全量导出', EN: 'Complete Export' },
        '创建': { CN: '创建', EN: 'Create' },
        '提示': { CN: '提示', EN: 'Tips' },
        '全局属性': { CN: '全局属性', EN: 'Global Property' },
        '创建测量单位': { CN: '创建测量单位', EN: 'Create measurement Unit' },
        '全局属性分类': { CN: '全局属性分类', EN: 'Global property classification' },

        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '删除分类': { CN: '是否删除该分类？', EN: 'Whether to delete the classification?' },
        '有子分类不能删除': { CN: '该分类下有子分类，不能删除', EN: 'There are subcategories under this classification and cannot be deleted' },
        '删除成功': { CN: '删除成功', EN: 'Delete successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },

        'confirm': { CN: '确认', EN: 'Confirm' },
        'cancel': { CN: '取消', EN: 'Cancel' },
    }

    return {
        i18n: languageObj
    }
})
