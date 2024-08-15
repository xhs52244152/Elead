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
        '文件夹': { CN: '文件夹', EN: 'Folder' },
        '创建文件夹': { CN: '创建文件夹', EN: 'Create Folder' },
        '编辑文件夹': { CN: '编辑文件夹', EN: 'Edit Folder' },

        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '有子分类不能删除': { CN: '该分类下有子分类，不能删除', EN: 'There are subcategories under this classification and cannot be deleted' },
        '删除成功': { CN: '删除成功', EN: 'Delete successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },

        '名称不能为空且不能含有空格': { CN: '名称不能为空且不能含有空格', EN: 'The name cannot be empty and cannot contain Spaces' },
        moveFolder: {
            CN: '移动文件夹',
            EN: 'Move folder'
        },
        moveFolderHaveDomainTips: {
            CN: '目标父文件夹有访问控制，当前文件夹移动后是否需要保持访问控制能力？',
            EN: 'The target parent folder has access control. Do I need to maintain access control after the current folder is moved?'
        },
        moveFolderNoDomainTips: {
            CN: '目标父文件夹无访问控制能力，当前文件夹移动后将无法进行访问控制，是否继续？',
            EN: 'The target parent folder does not have access control. After the current folder is moved, access control cannot be performed. Do you want to continue?'
        },
        need: {
            CN: '需要',
            EN: 'Need'
        },
        noNeed : {
            CN: '不需要',
            EN: 'No need'
        },
        continue: {
            CN: '继续',
            EN: 'Continue'
        },
    }

    return {
        i18n: languageObj
    }
})
