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
          'placeholder_1' : {CN : '姓名/工号/邮箱/登录账号' , EN : 'Name/No/Email/Login account'},
          'placeholder_2' : {CN : '姓名/工号/邮箱/登录账号，支持批量输入/粘贴，用";"隔开' , EN : 'Name/No/Email/Login account,Support batch input / paste, use ";" separate'},
          '姓名' : {CN : '姓名' , EN : 'Name'},
          '工号' : {CN : '工号' , EN : 'No'},
          '部门' : {CN : '部门' , EN : 'Department'},
          'copyMsg' : {CN : '“ctrl+c”复制或”ctrl+V”粘贴',EN:'"Ctrl + C" copy or "Ctrl + V" paste'},
          'errorMsg' : {CN:'请输入有效格式，如：“李小明；7634；zhangshan@XXX.cn”',EN:'Error format, such as: "Li Xiaoming; 7634; XX@XXX.cn ”'},
          'notFind' : {CN:'未找到以下用户：',EN:'The following users were not found:'},
          '展示已经勾选的数据' : {CN:'展示已经勾选的数据',EN:'Display the checked data'},
          '复制内容成功' : {CN:'复制内容成功',EN:'Content copied successfully'},
          '复制内容失败' : {CN:'复制内容失败',EN:'Content copied failure'},
          '未找到用户': {CN:'未找到用户',EN:'User not found'},
          loginAccount: {CN:'登录账号',EN:'Login account'},

          
    }

    return {
        i18n : languageObj
    }
 })
