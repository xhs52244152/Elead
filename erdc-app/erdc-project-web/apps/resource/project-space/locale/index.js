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
        projectStatusTitle: {
            CN: '设置项目状态',
            EN: 'Set Project Status'
        },
        confirm: {
            CN: '确定',
            EN: 'confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        performOperation: {
            CN: '是否执行此操作?',
            EN: 'Do you want to perform this operation?'
        },
        tip: {
            CN: '提示',
            EN: 'tip'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        permanentlyDeleted: {
            CN: '此操作将永久删除, 是否继续?',
            EN: 'This operation will be permanently deleted. Do you want to continue?'
        },
        notGroup: {
            CN: '不分组',
            EN: 'no grouping'
        },
        group: {
            CN: '分组',
            EN: 'grouping'
        },
        operationSuccess:{
            CN:'操作成功',
            EN:'operation success'
        }
    };

    return { i18n: languageObj };
});
