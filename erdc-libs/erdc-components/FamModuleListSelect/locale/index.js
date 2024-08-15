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
          '最近打开项目' : {CN : '最近打开项目' , EN : 'Recently opened project'},
          '收藏项目' : {CN : '收藏项目' , EN : 'Collect project'},
          
    }

    return {
        i18n : languageObj
    }
 })