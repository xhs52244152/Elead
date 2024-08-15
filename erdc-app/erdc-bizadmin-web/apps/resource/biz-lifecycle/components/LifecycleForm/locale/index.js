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
        '确认删除': { CN: '确认删除', EN: 'Confirm delete' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '更多操作': { CN: '更多操作', EN: 'More operations' },
        '启用': { CN: '启用', EN: 'Enable' },
        '停用': { CN: '停用', EN: 'Disable' },
        '删除': { CN: '删除', EN: 'Delete' },
        '删除最新小版本': { CN: '删除最新小版本', EN: 'Delete the minimum version' },
        '添加阶段': { CN: '添加阶段', EN: 'Add a phase' },
        '添加状态': { CN: '添加状态', EN: 'Add a status' },
        '保存': { CN: '保存', EN: 'Save' },
        '返回': { CN: '返回', EN: 'Return' },
        '生命周期信息': { CN: '生命周期信息', EN: 'The life cycle of information' },
        '阶段信息': { CN: '阶段信息', EN: 'Phase information' },
        '历史版本': { CN: '历史版本', EN: 'Version history' },
        '获取权限列表表头失败': { CN: '获取权限列表表头失败', EN: 'Failed to get permissions list header' },
        '创建生命周期': { CN: '创建生命周期', EN: 'Create a life cycle' },
        '获取生命周期详情失败': { CN: '获取生命周期详情失败', EN: 'Failed to get life cycle for details' },
        '获取历史版本失败': { CN: '获取历史版本失败', EN: 'Failed to get version history' },
        '检入失败': { CN: '检入失败', EN: 'Check in the failure' },
        '启用模板成功': { CN: '启用模板成功', EN: 'Enable the template success' },
        '启用模板失败': { CN: '启用模板失败', EN: 'Enable the template failed' },
        '停用模板成功': { CN: '停用模板成功', EN: 'Stop using the template success' },
        '停用模板失败': { CN: '停用模板失败', EN: 'Stop using the template failed' },
        '删除成功': { CN: '删除成功', EN: 'Delete success' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },
        '当前模板只有一个版本，删除将会删除整个模板。确定删除吗': { CN: '当前模板只有一个版本，删除将会删除整个模板。确定删除吗？', EN: 'The current template is only one version, delete the template will be deleted. Sure to delete?' },
        '删除最新小版本成功': { CN: '删除最新小版本成功', EN: 'Minimum version was removed successfully' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '创建成功': { CN: '创建成功', EN: 'Create successfully' },
        '更新失败': { CN: '更新失败', EN: 'Update failed' },
        '创建失败': { CN: '创建失败', EN: 'Create failed' },
        '检出失败': { CN: '检出失败', EN: 'Check out failed' },
        '暂无生命周期模板': { CN: '暂无模板，请先移步到左侧列表应用上方点击创建图标创建', EN: 'No template, please walk to the above list on the left side of the application, click on the create icon to create' },

    }

    return {
        i18n: languageObj
    }
})
