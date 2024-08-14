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
        confirmDelete: {
            CN: '确认删除',
            EN: 'Confirm deletion'
        },
        confirm: {
            CN: '确定',
            EN: 'Confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        checkData: {
            CN: '请勾选数据',
            EN: 'Please check the data box'
        },
        draft: {
            CN: '草稿',
            EN: 'DRAFT'
        },
        edit: {
            CN: '编辑',
            EN: 'Edit'
        },
        setStatus: {
            CN: '设置状态',
            EN: 'set status'
        },
        developing: {
            CN: '开发中',
            EN: 'developing'
        },
        onlySetStatus: {
            CN: '只能批量设置状态相同的计划',
            EN: 'Only plans with the same status can be set in batches'
        },
        isDelete: {
            CN: '是否删除该数据？',
            EN: 'Do you want to delete it?'
        },
        replicatingSuccess: {
            CN: '复制成功',
            EN: 'Replicating Success'
        },
        deleteSuccess: {
            CN: '删除成功',
            EN: 'Delete Success'
        },
        moveSuccess: {
            CN: '移动成功',
            EN: 'Move Success'
        },
        processInitiated: {
            CN: '只有状态相同才能发起流程',
            EN: 'Only with the same status can the process be initiated'
        },
        noFoundInformation: {
            CN: '未查到关联流程信息',
            EN: 'No associated process information found'
        },
        ImportSuccessful: {
            CN: '导入成功',
            EN: 'Import successful'
        },
        exportSuccessful: {
            CN: '导出成功',
            EN: 'Export successful'
        },
        systemExporting: {
            CN: '系统正在导出',
            EN: 'System exporting'
        },
        successfullySaved: {
            CN: '保存成功',
            EN: 'successfullySaved'
        },
        successfullyCreated: {
            CN: '创建成功',
            EN: 'successfully Created'
        },
        download: {
            CN: '下载',
            EN: 'download'
        },
        view: {
            CN: '查看',
            EN: 'view'
        },
        bulkEdit: {
            CN: '批量编辑',
            EN: 'bulk edit'
        },
        applicationCoding: {
            CN: '应用编码',
            EN: 'Application coding'
        },
        coding: {
            CN: '编码',
            EN: 'coding'
        },
        detailedInfo: {
            CN: '详细信息',
            EN: 'Detailed information'
        },
        responsiblePeople: {
            CN: '负责人',
            EN: 'Responsible people'
        },
        status: {
            CN: '状态',
            EN: 'Status'
        },
        scheduledStartTime: {
            CN: '预计开始时间',
            EN: 'Scheduled start time'
        },
        scheduledEndTime: {
            CN: '预计结束时间',
            EN: 'Scheduled end time'
        },
        workHourRecord: {
            CN: '工时记录',
            EN: 'Work hour record'
        },
        processRecord: {
            CN: '流程记录',
            EN: 'Process record'
        },
        project: {
            CN: '项目',
            EN: 'Project'
        },
        template: {
            CN: '模板',
            EN: 'Template'
        },
        pleaseSelectData: {
            CN: '请先勾选数据',
            EN: 'Please select the data first'
        },
        synchronizedResponsible: {
            CN: '责任人同步成功',
            EN: 'The responsible person is synchronized successfully'
        },
        createSubTask: {
            CN: '创建子任务',
            EN: 'Create SubTask'
        },
        parentTask: {
            CN: '所属父任务',
            EN: 'Parent Task'
        },
        taskExecutedSuccess: {
            CN: '任务执行成功',
            EN: 'Task executed successfully'
        },
        wantPerformOperation: {
            CN: '是否执行此操作?',
            EN: 'Do you want to perform this operation?'
        },
        tip: {
            CN: '提示',
            EN: 'Tip'
        },
        toImportAndExportView: {
            CN: '前往我的“导入导出”中查看',
            EN: 'Go to My "Import and Export" to see'
        },
        removeTips: {
            CN: '是否移除？',
            EN: 'Do you want to remove it ?'
        },
        isRemove: {
            CN: '是否移除该数据？',
            EN: 'Do you want to remove it?'
        },
        removeSuccess: {
            CN: '移除成功',
            EN: 'Remove Successfully'
        },
        associatedTaskCheck: {
            CN: '关联任务约束时间校验',
            EN: 'Associated task constraint time check'
        },
        pleaseSwitchSelectBaseline: {
            CN: '请切换到基线数据后再进行基线比较。',
            EN: 'Please switch to baseline data before baseline comparison.'
        },
        baselineComparison: {
            CN: '基线对比',
            EN: 'Baseline comparison'
        },
        moveFile: {
            CN: '移动文件',
            EN: 'Move file'
        },
        changeErrorTips: {
            CN: '当前状态不能发起变更',
            EN: 'The current status cannot initiate changes'
        },
        projectChanged: {
            CN: '项目属性变更',
            EN: 'Project properties are changeds'
        },
        planChanges: {
            CN: '计划变更',
            EN: 'Plan Changes'
        },
        teamChanges: {
            CN: '团队变更',
            EN: 'Team changes'
        },
        context: {
            CN: '上下文',
            EN: 'Context'
        },
        belongProject: {
            CN: '所属项目',
            EN: 'belongProject'
        },
        projectModule: {
            CN: '项目模板',
            EN: 'projectModule'
        },
        moveTo: {
            CN: '移动至',
            EN: 'Move to'
        }
    };

    return { i18n: languageObj, i18nMappingObj: i18n.wrap({ i18n: languageObj }) };
});
