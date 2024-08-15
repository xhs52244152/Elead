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
        '请选择': { CN: '请选择', EN: 'Please select' },
        '所属应用': { CN: '所属应用', EN: 'Application of affiliation' },
        '编码': { CN: '编码', EN: 'Code' },
        '名称': { CN: '名称', EN: 'Name' },
        '状态': { CN: '状态', EN: 'State' },
        '描述': { CN: '描述', EN: 'Describe' },
        '获取详情失败': { CN: '获取详情失败', EN: 'Failed to get the details' },
        '是否放弃已编辑': { CN: '是否放弃已编辑', EN: 'Whether to give up edited' },
        '取消编辑': { CN: '取消编辑', EN: 'Cancel edit' },
        '更新成功': { CN: '更新成功', EN: 'Update successful' },
        '新增成功': { CN: '新增成功', EN: 'Create successful' },
        '更新失败': { CN: '更新失败', EN: 'Update failed' },
        '新增失败': { CN: '新增失败', EN: 'Create failure' },
        '草稿': { CN: '草稿', EN: 'Draft' },
        '启用': { CN: '启用', EN: 'Enable' },
        '停用': { CN: '停用', EN: 'Disable' },

    }

    return {
        i18n: languageObj
    }
})