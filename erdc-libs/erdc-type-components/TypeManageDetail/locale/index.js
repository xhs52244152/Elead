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
    const languageObj =  {
        '编辑类型': { CN: '编辑类型', EN: 'Edit Type' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '定义信息': { CN: '定义信息', EN: 'Definition Information' },
        '属性信息': { CN: '属性信息', EN: 'Attribute Information' },
        '操作': { CN: '操作', EN: 'Operate' },
        '布局': { CN: '布局', EN: 'Layout' },
        '属性组': { CN: '属性组', EN: 'Property Group' },
        '内部名称': { CN: '内部名称', EN: 'Internal Name' },
        '显示名称': { CN: '显示名称', EN: 'Show Name' },
        '图标': { CN: '图标', EN: 'Icon' },
        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '签名规则': { CN: '签名规则', EN: 'Signature Rule' },
    }

    return {
        i18n : languageObj
    }
 })
