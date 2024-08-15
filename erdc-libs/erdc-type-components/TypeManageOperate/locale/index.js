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
          '请输入': { CN: '请输入', EN: 'Place Enter' },
          '来源类': { CN: '来源类', EN: 'Source Class' },
          '类型': { CN: '类型', EN: 'Type' },
          '操作定义': { CN: '操作定义', EN: 'Operation Definition' },
          '所属权限': { CN: '所属权限', EN: 'Owning Authority' },
          '所属模块': { CN: '所属模块', EN: 'Modules' },
          '调用优先级' : {CN : '调用优先级' , EN : 'Call Priority'},
          '定义操作' : {CN : '定义操作' , EN : 'Define Operation'},
          '操作说明' : {CN : '操作说明' , EN : 'Instructions'},
          '定义类' : {CN : '定义类' , EN : 'Define Class'},
    }

    return {
        i18n : languageObj
    }
 })