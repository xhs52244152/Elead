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
          '新增' : {CN : '新增' , EN : 'Add'},
          '测试' : {CN : '测试' , EN : 'test'},
          '测试2' : {CN : '测试2' , EN : 'test2'},
          '转至最新' : {CN : '转至最新' , EN : 'Turn to the latest'},
          '更多操作' : {CN : '更多操作', EN : 'More actions'},
          '编辑' : {CN : '编辑' , EN : 'Edit'},
          '增加' : {CN : '增加' , EN : 'Add'},
          '保存' : {CN : '保存' , EN : 'Save'},
          '确定': { CN: '确 定', EN: 'Confirm' },
          '取消': { CN: '取 消', EN: 'Cancel' },
          '属性' : {CN : '属性' , EN : 'Attribute'},
          '相关对象' : {CN : '相关对象' , EN : 'Related objects'},
          '团队' : {CN : '团队' , EN : 'Team'},
          '模块' : {CN : 'TAB模块' , EN : 'TAB module'},
          '增加TAB模块' : {CN : '增加TAB模块' , EN : 'To increase the TAB module'},
          
          
    }

    return {
        i18n : languageObj
    }
 })