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
        confirm: {
            CN: '保存',
            EN: 'confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        success: {
            CN: '保存成功',
            EN: 'Successfully saved'
        },
        projectStatus: {
            CN: '项目状态',
            EN: 'Project Status'
        },
        taskStatus: {
            CN: '任务状态',
            EN: 'Task Status'
        },
        taskLevel: {
            CN: '任务层级',
            EN: 'Task hierarchy'
        },
        changeManagement: {
            CN: '变更配置项管理',
            EN: 'Change configuration item management'
        },
        changeManage: {
            CN: '变更管理',
            EN: 'Change management'
        },
        allowChangeTaskState: {
            CN: '影响数据可自动刷新任务状态',
            EN: 'Impact Data automatically refreshes the task status'
        }
    };

    return { i18n: languageObj };
});
