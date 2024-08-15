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
        'signOut': { CN: '退出登录', EN: 'Sign Out'},
        'pleaseEnterPassword': { CN: '请输入登录密码以解锁屏幕', EN: 'Please enter the login password to unlock the screen'},
        'passwordError': { CN: '密码不正确，请再试一次', EN: 'The password is incorrect. Please try again'},
        'confirm': { CN: '确定', EN: 'confirm'}
    }

    return {
        i18n: languageObj
    }
})