/**
 * i18n国际化文件
 * **/
define(['erdcloud.i18n'], function (i18n) {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
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
        createProjectModule: {
            CN: '创建项目模板',
            EN: 'Create project module'
        },
        editProjectModule: {
            CN: '编辑项目模板',
            EN: 'Edit project module'
        },
        templateCreatedSuccessfully: {
            CN: '模板创建成功',
            EN: 'Template created successfully'
        },
        templateEditSuccessfully: {
            CN: '模板编辑成功',
            EN: 'Template edit successfully'
        },
        saveDraftAfterTip: {
            CN: '草稿保存成功',
            EN: 'Save draft success'
        },
        hoursTip: {
            CN: '工时只能是正数，且只能保留1位小数',
            EN: 'Work hours can only be positive and can only retain 1 decimal place'
        },
        durationTip: {
            CN: '工期只能是正数，且只能保留1位小数',
            EN: 'Duration can only be positive and can only retain 1 decimal place'
        }
    };

    return i18n.wrap({
        i18n: languageObj
    });
});
