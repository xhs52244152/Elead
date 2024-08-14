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
        projectSettings: {
            CN: '项目设置',
            EN: 'Project Settings'
        },
        success: {
            CN: '保存成功',
            EN: 'Successfully saved'
        },
        preTaskConstraint: {
            CN: '前置任务约束',
            EN: 'Pre task constraints'
        },
        startLogicValid: {
            CN: '启动逻辑校验',
            EN: 'Start logic verification'
        },
        notStartLogicValid: {
            CN: '不启动逻辑校验',
            EN: 'Do not initiate logical verification'
        },
        milestonConstraint: {
            CN: '里程碑工期约束',
            EN: 'Milestone schedule constraint'
        },
        defDuraIsZero: {
            CN: '工期默认为零',
            EN: 'The default duration is zero'
        },
        defDuraNotZero: {
            CN: '工期默认不为零',
            EN: 'The default duration not zero'
        },
        fatherSonModel: {
            CN: '父子任务完成模式',
            EN: 'Father son task completion mode'
        },
        parentAutoComplete: {
            CN: '所有子任务完成后，父任务自动完成',
            EN: 'After all subtasks are completed, the parent task is automatically completed'
        },
        parentManuallyComplete: {
            CN: '所有子任务完成后，父任务手动完成',
            EN: 'After all subtasks are completed, the parent task is manually completed'
        },
        taskAssoVerifType: {
            CN: '任务关联校验类型',
            EN: 'Task association verification type'
        },
        strongVerify: {
            CN: '强校验',
            EN: 'Strong verification'
        },
        weekVerify: {
            CN: '弱校验',
            EN: 'Weak verification'
        },
        milestoneLightNotice: {
            CN: '里程碑亮灯提示',
            EN: 'Milestone Light Notice'
        },
        projectTaskLightNotice: {
            CN: '任务亮灯提示',
            EN: 'Project Task LightNotice'
        },
        completedBlackLight: {
            CN: '已完成提示黑灯',
            EN: 'Completed prompt with black light'
        },
        greenLight: {
            CN: '正常提示绿灯，当前距计划完成时间还有',
            EN: 'Normal green light prompt, currently there is still time to complete the plan'
        },
        orangeLight: {
            CN: '预警提示橙灯，当前距计划完成时间还有',
            EN: 'Warning orange light, there is still time to complete the plan'
        },
        redLight: {
            CN: '逾期提示红灯，当前超出计划完成时间',
            EN: 'Delay prompt red light, currently there is still time to complete the plan'
        },
        projectLight: {
            CN: '预警提示橙灯，实际进度落后计划进度超过',
            EN: 'Warning orange light, there is still time to complete the project'
        },
        projectRedLight: {
            CN: '逾期提示红灯，实际进度落后计划进度超过',
            EN: 'Delay prompt red light, currently there is still time to complete the project'
        },
        day: {
            CN: '天',
            EN: 'day'
        },
        percentage: {
            CN: '%',
            EN: 'percentage'
        },
        projectLightNotice: {
            CN: '项目亮灯提示',
            EN: 'day'
        }
    };

    return { i18n: languageObj };
});
