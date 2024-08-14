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
        edit: {
            CN: '编辑',
            EN: 'edit'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        createMilestones: {
            CN: '创建里程碑',
            EN: 'create milestones'
        },
        success: {
            CN: '保存成功',
            EN: 'Successfully saved'
        },
        confirmCutting: {
            CN: '确认裁剪',
            EN: 'Confirm cutting'
        },
        taskTailoring: {
            CN: '任务裁剪',
            EN: 'Task tailoring'
        },
        cutSuccess: {
            CN: '裁剪成功',
            EN: 'Cut successfully'
        },
        checkData: {
            CN: '请勾选数据',
            EN: 'Please check the data box'
        },
        noData: {
            CN: '暂无数据',
            EN: 'No data'
        },
        plan: {
            CN: '计划',
            EN: 'Plan'
        },
        redLight: {
            CN: '红灯逾期',
            EN: 'Red light warning'
        },
        Completed: {
            CN: '已完成',
            EN: 'Completed'
        },
        greenLight: {
            CN: '绿灯正常',
            EN: 'Green light warning'
        },
        orangeLight: {
            CN: '橙灯预警',
            EN: 'Orange light warning'
        },
        greyLight: {
            CN: '未开始',
            EN: 'Not started'
        },
        milestoneList: {
            CN: '里程碑列表',
            EN: 'Milestone checklist'
        },
        milestoneView: {
            CN: '里程碑视图',
            EN: 'Milestone view'
        }
    };

    return { i18n: languageObj };
});
