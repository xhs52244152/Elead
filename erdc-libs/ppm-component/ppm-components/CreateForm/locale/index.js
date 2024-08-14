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
        createProject: {
            CN: '创建项目',
            EN: 'createProject'
        },
        createSuccess: {
            CN: '创建成功',
            EN: 'createSuccess'
        },
        updateSuccess: {
            CN: '更新成功',
            EN: 'updateSuccess'
        },
        backList: {
            CN: '返回项目列表',
            EN: 'backList'
        },
        setTeam: {
            CN: '设置团队',
            EN: 'setTeam'
        },
        createTask: {
            CN: '创建任务',
            EN: 'Create task'
        },
        createPlan: {
            CN: '创建计划',
            EN: 'Create plan'
        },
        doSome: {
            CN: '您可以做以下操作',
            EN: 'doSome'
        },
        draftCreateSuccess: {
            CN: '草稿保存成功，您可以在“工作台”查看',
            EN: 'Successfully saved the draft, you can view it in the Workbench'
        },

        tip: {
            CN: '提示',
            EN: 'tip'
        },
        editProject: {
            CN: '编辑项目',
            EN: 'editProject'
        },
        infoDetail: {
            CN: '详情信息',
            EN: 'infoDetail'
        },
        confirm: {
            CN: '保存',
            EN: 'confirm'
        },
        saveDraft: {
            CN: '保存草稿',
            EN: 'saveDraft'
        },
        close: {
            CN: '关闭',
            EN: 'close'
        },
        closePage: {
            CN: '关闭页面',
            EN: 'closePage'
        }
    };

    return { i18n: languageObj };
});
