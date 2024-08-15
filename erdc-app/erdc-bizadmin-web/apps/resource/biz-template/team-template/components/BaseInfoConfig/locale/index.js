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
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '更新成功': { CN: '更新成功', EN: 'Update successful' },
        '新增成功': { CN: '新增成功', EN: 'Create successful' },
        '更新失败': { CN: '更新失败', EN: 'Update failed' },
        '新增失败': { CN: '新增失败', EN: 'Create failure' },
        '确定取消': { CN: '确定取消', EN: 'Confirm cancel' },
        '提示': { CN: '提示', EN: 'Confirm cancel' },
        '是否放弃创建': { CN: '是否放弃创建？', EN: 'Whether to give up to create?' },
        '是否放弃编辑': { CN: '是否放弃编辑？', EN: 'Whether to give up to edit?' },
        '团队模板管理': { CN: '团队模板管理', EN: 'Lifecycle' },
        '名称': { CN: '名称', EN: 'Name' },
        '编码': { CN: '编码', EN: 'Code' },
        '描述': { CN: '描述', EN: 'Description' },
        

    }

    return {
        i18n: languageObj
    }
})