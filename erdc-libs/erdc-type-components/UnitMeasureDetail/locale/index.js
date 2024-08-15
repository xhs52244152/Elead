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
        '编辑': { CN: '编辑', EN: 'Edit' },
        '删除': { CN: '删除', EN: 'Delete' },
        '基本信息': { CN: '基本信息', EN: 'Basic information' },
        '测量单位': { CN: '测量单位', EN: 'Unit measure' },
        '编辑测量单位': { CN: '编辑测量单位', EN: 'Editing unit of measure' },

        '测量系统': { CN: '测量系统', EN: 'Measuring system' },
        '测量名称': { CN: '测量名称', EN: 'Measure name' },
        '描述': { CN: '描述', EN: 'Description' },
        '默认值': { CN: '默认值', EN: 'Default' },
        '覆盖': { CN: '覆盖', EN: 'Cover' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '量纲符号': { CN: '量纲符号', EN: 'Dimensional symbols' },
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '确定删除': { CN: '确定删除', EN: 'Confirm Delete' },
        '确定删除该数据': { CN: '确定删除该数据？', EN: 'Are you sure to delete this data?' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '删除成功': { CN: '删除成功', EN: 'Delete successfully' },
        '删除失败': { CN: '删除失败', EN: 'Delete failed' },
        'unitSymbol': { CN: '单位符号', EN: 'Unit symbol' },
    }

    return {
        i18n: languageObj
    }
})
