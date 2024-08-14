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
            EN: 'Create project'
        },
        createSuccess: {
            CN: '创建成功',
            EN: 'Create success'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        copySuccess: {
            CN: '复制成功',
            EN: 'Copy success'
        },
        updateSuccess: {
            CN: '更新成功',
            EN: 'Update success'
        },
        backList: {
            CN: '返回列表',
            EN: 'Back list'
        },
        lookDetail: {
            CN: '查看详情',
            EN: 'Look detail'
        },
        continueCreating: {
            CN: '继续创建',
            EN: 'Continue creating'
        },
        doSome: {
            CN: '您可以做以下操作',
            EN: 'Do Some'
        },
        tip: {
            CN: '提示',
            EN: 'tip'
        },
        editProject: {
            CN: '编辑项目',
            EN: 'Edit project'
        },
        infoDetail: {
            CN: '详情信息',
            EN: 'Info detail'
        },
        relatedObjects: {
            CN: '相关项目',
            EN: 'Related objects'
        },
        deleteSuccess: {
            CN: '移除成功',
            EN: 'Delete success'
        },
        parentProject: {
            CN: '父项目',
            EN: 'Parent Project'
        },
        childProject: {
            CN: '子项目',
            EN: 'Child Project'
        },
        confirm: {
            CN: '保存',
            EN: 'confirm'
        },
        saveDraft: {
            CN: '保存草稿',
            EN: 'Save draft'
        },
        draft: {
            CN: '草稿',
            EN: 'DRAFT'
        },
        close: {
            CN: '关闭',
            EN: 'close'
        },
        saveTemplate: {
            CN: '另存为模板',
            EN: 'Save template'
        },
        copyProject: {
            CN: '复制项目',
            EN: 'Copy project'
        },
        baseInfo: {
            CN: '基本信息',
            EN: 'Base info'
        },
        projectName: {
            CN: '名称',
            EN: 'Name'
        },
        projectNumber: {
            CN: '编码',
            EN: 'Number'
        },
        projectType: {
            CN: '类型',
            EN: 'Type'
        },
        projectModule: {
            CN: '模板',
            EN: 'Module'
        },
        enterName: {
            CN: '请输入名称',
            EN: 'Please enter a name'
        },
        projectTemplateName: {
            CN: '项目模板名称',
            EN: 'Project template name'
        },
        projectTemplateNumber: {
            CN: '项目模板编码',
            EN: 'Project template number'
        },
        selectproject: {
            CN: '请选择项目类型',
            EN: 'Please select project type'
        },
        selectModule: {
            CN: '请选择项目模板',
            EN: 'Please select project module'
        },
        projectStatusTitle: {
            CN: '设置项目状态',
            EN: 'Set project status'
        },
        permanentlyDeleted: {
            CN: '此操作将永久删除, 是否继续?',
            EN: 'This operation will be permanently deleted. Do you want to continue?'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        hoursTip: {
            CN: '工时只能是正数，且只能保留1位小数',
            EN: 'Work hours can only be positive and can only retain 1 decimal place'
        },
        durationTip: {
            CN: '工期只能是正数，且只能保留1位小数',
            EN: 'Duration can only be positive and can only retain 1 decimal place'
        },
        edit: {
            CN: '编辑',
            EN: 'edit'
        },
        operate: {
            CN: '操作',
            EN: 'operate'
        },
        draftCreateSuccess: {
            CN: '草稿创建成功',
            EN: 'Draft created successfully'
        },
        projectCreateSuccess: {
            CN: '项目创建成功',
            EN: 'Project created successfully'
        },
        projectCopySuccess: {
            CN: '项目复制成功',
            EN: 'Project copy successfully'
        },
        draftEditSuccess: {
            CN: '草稿编辑成功',
            EN: 'Draft edit successfully'
        },
        projectEditSuccess: {
            CN: '项目编辑成功',
            EN: 'Project edit successfully'
        },
        relatedProject: {
            CN: '相关项目',
            EN: 'Related project'
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
        copy: {
            CN: '副本',
            EN: 'Copy'
        },
        project: {
            CN: '项目',
            EN: 'Project'
        },
        saveTemplateSuccess: {
            CN: '另存为模板成功',
            EN: 'Successfully saved as template'
        },
        pleaseEnterKeywordSearch: {
            CN: '请输入关键词搜索',
            EN: 'Please enter keyword to search'
        },
        plan: {
            CN: '计划',
            EN: 'Plan'
        },
        team: {
            CN: '团队',
            EN: 'Team'
        },
        document: {
            CN: '文件夹',
            EN: 'Document'
        },
        delivery: {
            CN: '交付物',
            EN: 'Delivery'
        }
    };

    return { i18n: languageObj };
});
