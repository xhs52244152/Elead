define([], function () {
    const languageObj = {
        effectData: {
            CN: '影响数据',
            EN: 'Effect data'
        },
        projectInfo: {
            CN: '项目信息',
            EN: 'Project info'
        },
        plan: {
            CN: '计划',
            EN: 'Plan'
        },
        require: {
            CN: '需求',
            EN: 'Require'
        },
        risk: {
            CN: '风险',
            EN: 'Risk'
        },
        issue: {
            CN: '问题',
            EN: 'Issue'
        },
        projectBaseInfo: {
            CN: '项目基本信息',
            EN: 'Project base info'
        },
        projectCode: {
            CN: '项目编码',
            EN: 'Project code'
        },
        projectName: {
            CN: '项目名称',
            EN: 'Project name'
        },
        projectType: {
            CN: '项目类型',
            EN: 'Project type'
        },
        projectManager: {
            CN: '项目经理',
            EN: 'Project manager'
        },
        changeCategory: {
            CN: '变更类别',
            EN: 'Change category'
        },
        changeReasons: {
            CN: '变更原因',
            EN: 'Change reasons'
        },
        changeReasonsPlaceholder: {
            CN: '请详细说明变更背景，变更目的',
            EN: 'Please specify the background and purpose of the change'
        },
        changeMeasure: {
            CN: '变更影响及对策',
            EN: 'Change impact and countermeasure'
        },
        changeMeasurePlaceholder: {
            CN: '请详细说明变更影响及对策',
            EN: 'Please specify the impact of the change and countermeasures'
        },
        planChange: {
            CN: '计划变更',
            EN: 'Plan change'
        },
        handleTask: {
            CN: '督办任务',
            EN: 'Handle task'
        },
        projectPlan: {
            CN: '项目计划',
            EN: 'Project plan'
        },
        confirm: {
            CN: '确定',
            EN: 'Confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'Cancel'
        },
        removeConfirm: {
            CN: '确认移除',
            EN: 'Confirm removal'
        },
        removeOrNot: {
            CN: '是否移除该数据？',
            EN: 'Do you want to remove this data?'
        },
        yes: {
            CN: '是',
            EN: 'Yes'
        },
        no: {
            CN: '否',
            EN: 'No'
        },
        slecetRemoveTask: {
            CN: '请选择要移除的任务',
            EN: 'Select the task you want to remove'
        },
        operation: {
            CN: '操作',
            EN: 'Operation'
        },
        cut: {
            CN: '裁剪',
            EN: 'Cut'
        },
        createSubTask: {
            CN: '创建子任务',
            EN: 'Create subtask'
        },
        selectDate: {
            CN: '选择日期',
            EN: 'Select date'
        },
        changeInfo: {
            CN: '变更信息',
            EN: 'Change information'
        },
        create: {
            CN: '创建',
            EN: 'Create'
        },
        add: {
            CN: '添加',
            EN: 'Add'
        },
        remove: {
            CN: '移除',
            EN: 'Remove'
        },
        verifyTips: {
            CN: '唯一校验性失败',
            EN: 'Uniqueness verification failure'
        },
        addedSuccessfully: {
            CN: '添加成功',
            EN: 'Added successfully'
        },
        checkDataTips: {
            CN: '请先勾选数据',
            EN: 'Please check the data first'
        },
        removedSuccessfully: {
            CN: '移除成功',
            EN: 'Removal successful'
        },
        planRequired: {
            CN: '计划存在必填项未填写',
            EN: 'The required fields in the plan are not filled in'
        },
        beforeChange: {
            CN: '变更前',
            EN: 'Before change'
        },
        afterChange: {
            CN: '变更后',
            EN: 'After change'
        },
        name: {
            CN: '名称',
            EN: 'Name'
        },
        notGroup: {
            CN: '不分组',
            EN: 'Not group'
        },
        group: {
            CN: '分组',
            EN: 'Grouping'
        },
        viewDetails: {
            CN: '查看详情',
            EN: 'View details'
        },
        description: {
            CN: '描述',
            EN: 'description'
        },
        underChange: {
            CN: '变更中',
            EN: 'Under change'
        },
        participants: {
            CN: '参与者',
            EN: 'Participants'
        },
        participantsType: {
            CN: '参与者类型',
            EN: 'Participants type'
        },
        workNumber: {
            CN: '工号',
            EN: 'Work number'
        },
        login: {
            CN: '登录帐号',
            EN: 'login'
        },
        mobilePhone: {
            CN: '手机',
            EN: 'Mobile phone'
        },
        email: {
            CN: '邮箱',
            EN: 'Email'
        },
        department: {
            CN: '部门',
            EN: 'Department'
        },
        addMember: {
            CN: '增加成员',
            EN: 'Add member'
        },
        user: {
            CN: '用户',
            EN: 'User'
        },
        role: {
            CN: '角色',
            EN: 'Role'
        },
        addErrorTips: {
            CN: '角色[{principalName}]为所属父角色，不能重复添加',
            EN: 'The role [{principalName}] belongs to the parent role and cannot be added repeatedly'
        },
        addRepeatTips: {
            CN: '[{principalName}]已添加，不能重复添加',
            EN: '[{principalName}] added, cannot be added again'
        },
        addMembers: {
            CN: '添加成员',
            EN: 'Add members'
        },
        setResponsible: {
            CN: '设置主责人',
            EN: 'Set the main responsible person'
        },
        cancelDelete: {
            CN: '取消删除',
            EN: 'Cancel delete'
        },
        delete: {
            CN: '删除',
            EN: 'Delete'
        },
        teamInfo: {
            CN: '团队信息',
            EN: 'Team info'
        },
        responsible: {
            CN: '主责任人',
            EN: 'Responsible'
        },
        cancelResponsible: {
            CN: '取消主责任人',
            EN: 'Cancel responsible'
        },
        pleaseEnterKeywords: {
            CN: '请输入关键字',
            EN: 'Please enter keywords'
        },
        createChange: {
            CN: '创建变更',
            EN: 'Create Change'
        },
        changeType: {
            CN: '变更类别',
            EN: 'Change Type'
        },
        changeContent: {
            CN: '变更内容',
            EN: 'Change Content'
        },
        selectChangeType: {
            CN: '请选择变更类型',
            EN: 'Please select the type of change'
        },
        selectChangeContent: {
            CN: '请选择变更内容',
            EN: 'Please select what you want to change'
        },
        codingRepeated: {
            CN: '计划已添加，不能重复添加',
            EN: 'The schedule has already been added and cannot be added repeatedly'
        }
    };
    return { i18n: languageObj };
});
