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
        edit: {
            CN: '编辑',
            EN: 'edit'
        },
        confirm: {
            CN: '确定',
            EN: 'confirm'
        },
        draft: {
            CN: '保存草稿',
            EN: 'draft'
        },
        save: {
            CN: '保存',
            EN: 'save'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        tip: {
            CN: '提示',
            EN: 'tip'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        selectRole: {
            CN: '请选择责任角色',
            EN: 'Please select a responsible role'
        },
        selectReviewRole: {
            CN: '请选择评审角色',
            EN: 'Please select the review role'
        }
    };

    return { i18n: languageObj };
});
