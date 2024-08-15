/**
 * i18n国际化文件
 * **/
 define([], function () {
    /**
     * 国际化key建议统一用中文作为key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/ 
    
    // 配置国际化key-value
    const languageObj =  {
        '请输入' : {CN : '请输入' , EN : 'Please enter'},
        '清除当前列筛选' : {CN : '清除当前列筛选' , EN : 'Clear all column filters'},
        '清除所有列筛选' : {CN : '清除所有列筛选' , EN : 'Clear current column filter'},
        '筛选条件不能为空' : {CN : '筛选条件不能为空' , EN : 'Filter criteria cannot be empty'},
          
    }

    return {
        i18n : languageObj
    }
 })