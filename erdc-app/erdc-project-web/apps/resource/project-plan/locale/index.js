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
        objectRef: {
            CN: '所属任务',
            EN: 'Belonging task'
        },
        pleaseSelectData: {
            CN: '请先勾选数据',
            EN: 'Please select the data first'
        },
        deleteTipsInfo: {
            CN: '是否删除计划？',
            EN: 'Do you want to delete the plan?'
        },
        whetherDeleteDelivery: {
            CN: '是否删除交付件？',
            EN: 'Whether to delete deliverables?'
        },
        whetherDeleteTemplate: {
            CN: '是否删除模板文件？',
            EN: 'Whether to delete the template file?'
        },
        deleteConfirm: {
            CN: '确认删除',
            EN: 'confirm delete'
        },
        pleaseEnter: {
            CN: '请输入',
            EN: 'please Input'
        },
        pleaseSelect: {
            CN: '请选择',
            EN: 'please Select'
        },
        pleaseUpload: {
            CN: '请上传',
            EN: 'please Upload'
        },
        delete: {
            CN: '删除',
            EN: 'delete'
        },
        confirm: {
            CN: '确定',
            EN: 'confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        enable: {
            CN: '是',
            EN: 'yes'
        },
        disable: {
            CN: '否',
            EN: 'no'
        },
        deleteSuccess: {
            CN: '删除成功',
            EN: 'delete success'
        },
        dataMoveSuccess: {
            CN: '数据移动成功',
            EN: 'Data movement successful'
        },
        downgradTips: {
            CN: '是父节点的第一个子节点，无法再降级',
            EN: 'It is the first child node of the parent node and cannot be downgraded again'
        },
        downgradSamePlanTips: {
            CN: '与前一个节点不在同一个计划集，无法再降级',
            EN: 'Cannot downgrade as it is not in the same plan set as the previous node'
        },
        upgradTips: {
            CN: '已是一级节点，无法再升级',
            EN: 'It is already a first level node and cannot be upgraded again'
        },
        moveUpTips: {
            CN: '当前节点为第一个节点，无法再上移',
            EN: 'The current node is the first node and cannot be moved up again'
        },
        moveDownTips: {
            CN: '当前节点为最后一个节点，无法再下移',
            EN: 'The current node is the last node and cannot be moved down again'
        },
        moveUp: {
            CN: '上移',
            EN: 'move up'
        },
        moveDown: {
            CN: '下移',
            EN: 'move down'
        },
        upgradation: {
            CN: '升级',
            EN: 'upgradation'
        },
        downgrading: {
            CN: '降级',
            EN: 'downgrading'
        },
        remove: {
            CN: '移除',
            EN: 'remove'
        },
        tips: {
            CN: '提示',
            EN: 'tips'
        },
        deleteData: {
            CN: '是否移除所选数据?',
            EN: 'Do you want to remove the selected data？'
        },
        addFiles: {
            CN: '批量上传',
            EN: 'batch upload'
        },
        save: {
            CN: '保存',
            EN: 'Save'
        },
        add: {
            CN: '增加',
            EN: 'Add'
        },
        create: {
            CN: '创建',
            EN: 'Create'
        },
        modify: {
            CN: '修改',
            EN: 'Modify'
        },
        cut: {
            CN: '裁剪',
            EN: 'Cut'
        },
        frozenColumn: {
            CN: '锁定列',
            EN: 'Frozen Column'
        },
        critical: {
            CN: '关键路径',
            EN: 'Critical'
        },
        zoomIn: {
            CN: '放大',
            EN: 'Zoom In'
        },
        zoomOut: {
            CN: '缩小',
            EN: 'Zoom Out'
        },
        UnSelectTips: {
            CN: '请选择数据',
            EN: 'Please Select Data'
        },
        ExpandOne: {
            CN: '展开一级',
            EN: 'Expand Level 1'
        },
        ExpandTwo: {
            CN: '展开二级',
            EN: 'Expand Level 2'
        },
        ExpandThree: {
            CN: '展开三级',
            EN: 'Expand Level 3'
        },
        ExpandAll: {
            CN: '展开全部',
            EN: 'Expand all'
        },
        level: {
            CN: '层级',
            EN: 'Level'
        },
        batchEdit: {
            CN: '批量编辑',
            EN: 'Batch edit'
        },
        editSuccess: {
            CN: '编辑成功',
            EN: 'Successfully edited'
        },
        setTaskStatus: {
            CN: '设置任务状态',
            EN: 'Set task status'
        },
        setStateSuccess: {
            CN: '设置任务状态成功',
            EN: 'Set state success'
        },
        batchSetStateInfo: {
            CN: '只能批量设置状态相同的计划',
            EN: 'Only plans with the same status can be set in batches'
        },
        updateSuccess: {
            CN: '更新成功',
            EN: 'Update successfully'
        },
        editTitle: {
            CN: '编辑任务',
            EN: 'Editing task'
        },
        updateError: {
            CN: '更新失败',
            EN: 'Update failure'
        },
        disassociation: {
            CN: '断开关联',
            EN: 'disassociation'
        },
        copySuccess: {
            CN: '复制成功',
            EN: 'Copy success'
        },
        limit64: {
            CN: '最大长度为64位',
            EN: 'Maximum length is 64 bits'
        },
        durationTips: {
            CN: '只能输入数字且只能保留两位小数',
            EN: 'Only numbers can be entered and only two decimal places can be retained'
        },
        decimalTips: {
            CN: '小数点后最多一位',
            EN: 'Maximum of one decimal place'
        },
        controls: {
            CN: '操作',
            EN: 'operation'
        },
        whetherDelete: {
            CN: '是否删除关联?',
            EN: 'Delete association or not?'
        },
        deleteAssociation: {
            CN: '移除关联',
            EN: 'Remove association'
        },
        edit: {
            CN: '编辑',
            EN: 'edit'
        },
        clickUpload: {
            CN: '点击上传',
            EN: 'Click upload'
        },
        createDoc: {
            CN: '创建文档',
            EN: 'Create document'
        },
        attach: {
            CN: '附件',
            EN: 'Attachment'
        },
        docClassification: {
            CN: '文档分类',
            EN: 'Document classification'
        },
        folder: {
            CN: '所属文件夹',
            EN: 'Folder'
        },
        masterFile: {
            CN: '主文件',
            EN: 'masterFile'
        },
        docCreatedSuccessfully: {
            CN: '文档创建成功',
            EN: 'Document created successfully'
        },
        removeDocTips: {
            CN: '请选择要移除的文档',
            EN: 'Please select the document to remove'
        },
        docUpdateSuccessful: {
            CN: '文档修改成功',
            EN: 'Document modification successful'
        },
        upload: {
            CN: '上传',
            EN: 'Upload'
        },
        download: {
            CN: '下载',
            EN: 'Download'
        },
        update: {
            CN: '更新',
            EN: 'Update'
        },
        preview: {
            CN: '预览',
            EN: 'Preview'
        },
        source: {
            CN: '来源',
            EN: 'Source'
        },
        deliveryName: {
            CN: '交付件名称',
            EN: 'Delivery Name'
        },
        code: {
            CN: '编码',
            EN: 'Code'
        },
        status: {
            CN: '状态',
            EN: 'Status'
        },
        template: {
            CN: '模板',
            EN: 'Template'
        },
        deliveryTemplate: {
            CN: '交付件模板',
            EN: 'Delivery template'
        },
        deliveryTemplateUploaded: {
            CN: '交付件模板上传成功',
            EN: 'The deliverable template is successfully uploaded'
        },
        deliveryTemplateRemoved: {
            CN: '交付件模板移除成功',
            EN: 'The deliverable template was removed successfully'
        },
        version: {
            CN: '版本',
            EN: 'Version'
        },
        product: {
            CN: '产品',
            EN: 'Product'
        },
        saveSuccessful: {
            CN: '保存成功',
            EN: 'Save successful'
        },
        securityLabel: {
            CN: '密级',
            EN: 'Security label'
        },
        mainContent: {
            CN: '主内容',
            EN: 'Main content'
        },
        uploadSuccessful: {
            CN: '上传成功',
            EN: 'Upload successful'
        },
        pleaseEnterName: {
            CN: '请输入名称',
            EN: 'Please enter a name'
        },
        checkMaxOne: {
            CN: '最多勾选一个',
            EN: 'Check at most one'
        },
        notSupportPreview: {
            CN: '暂不支持预览该文件',
            EN: 'Previewing the file is not supported'
        },
        notSavedToEdit: {
            CN: '该任务未保存，不可编辑',
            EN: 'This task has not been saved and cannot be edited'
        },
        nameEmptyTips: {
            CN: '名称不能为空',
            EN: 'Name can not empty'
        },
        assignmentsEmptyTips: {
            CN: '资源角色不能为空',
            EN: 'Assignments can not empty'
        },
        plansetTips: {
            CN: '当前模式下不可编辑，请切换至对应计划集',
            EN: 'Cannot be edited in current mode, please switch to the corresponding plan set'
        },
        notSavedToAssignVal: {
            CN: '未保存，无法批量赋值',
            EN: 'not saved, unable to batch assign values'
        },
        notSavedToSetStatus: {
            CN: '未保存，无法设置状态',
            EN: 'not saved, unable to set status'
        },
        createSubTask: {
            CN: '创建子任务',
            EN: 'Create SubTask'
        },
        parentTask: {
            CN: '所属父任务',
            EN: 'Parent Task'
        },
        plan: {
            CN: '计划',
            EN: 'Plan'
        },
        columnConf: {
            CN: '列配置',
            EN: 'Column Configuration'
        },
        actualEndTips: {
            CN: '实际结束时间必须大于实际开始时间',
            EN: 'The actual end time must be greater than the actual start time'
        },
        actualStartTips: {
            CN: '实际开始时间必须小于实际结束时间',
            EN: 'The actual start time must be less than the actual end time'
        },
        nameMaxTips: {
            CN: '任务名称不能超过64个字符',
            EN: 'The task name cannot exceed 64 characters'
        },
        manual: {
            CN: '手动',
            EN: 'Manual'
        },
        auto: {
            CN: '自动',
            EN: 'Auto'
        },
        continueAdd: {
            CN: '继续增加',
            EN: 'Continue to increase'
        },
        selectPlanset: {
            CN: '请选择计划集',
            EN: 'Please select a plan set'
        },
        addPreTask: {
            CN: '增加前置任务',
            EN: 'Add Predecessor Tasks'
        },
        editPreTask: {
            CN: '编辑前置任务',
            EN: 'Edit Predecessors'
        },
        planset: {
            CN: '计划集',
            EN: 'Plan set'
        },
        taskName: {
            CN: '任务名称',
            EN: 'Task name'
        },
        selectTaskTips: {
            CN: '请选择任务',
            EN: 'Please select task'
        },
        type: {
            CN: '类型',
            EN: 'Type'
        },
        constraintType: {
            CN: '约束类型',
            EN: 'Constraint type'
        },
        intervalDay: {
            CN: '间隔天数',
            EN: 'Interval days'
        },
        constraintField: {
            CN: '约束条件字段',
            EN: 'Constraint field'
        },
        delayTime: {
            CN: '延隔天数',
            EN: 'Delay day'
        },
        addSuccess: {
            CN: '添加成功',
            EN: 'Add successfully'
        },
        viewFrontAndBackTask: {
            CN: '查看前后置任务',
            EN: 'View front and back tasks'
        },
        predecessors: {
            CN: '前置任务',
            EN: 'Predecessors'
        },
        postTask: {
            CN: '后置任务',
            EN: 'Post task'
        },
        pleaseEnterKeyword: {
            CN: '请输入关键词',
            EN: 'Please enter keyword'
        },
        projectTemplateImport: {
            CN: '从项目模板导入',
            EN: 'Import from the project template'
        },
        pleaseEnterSearch: {
            CN: '请输入搜索内容',
            EN: 'Please enter your search'
        },
        selectImportTask: {
            CN: '选择导入任务',
            EN: 'Select import task'
        },
        baseInfo: {
            CN: '基本信息',
            EN: 'Base information'
        },
        projectTemplate: {
            CN: '项目模板',
            EN: 'Project template'
        },
        pleaseSelectProjectTemplate: {
            CN: '请选择项目模板',
            EN: 'Please select the project template'
        },
        pleaseSelectProject: {
            CN: '请先选择项目',
            EN: 'Please select the projec'
        },
        pleaseSelectParentTask: {
            CN: '请选择所属父任务',
            EN: 'Please select the parent task'
        },
        createTask: {
            CN: '创建任务',
            EN: 'Create task'
        },
        createPlan: {
            CN: '创建计划',
            EN: 'Create plan'
        },
        durationCheckTips: {
            CN: '工期只能是正数，且只能保留1位小数！',
            EN: 'The duration can only be positive, and can only keep 1 decimal place!'
        },
        selectResourceRole: {
            CN: '请选择资源角色',
            EN: 'Select a resource role'
        },
        PlanCreationSuccess: {
            CN: '计划创建成功',
            EN: 'Plan creation success'
        },
        pleaseEnterDeliverableName: {
            CN: '请输入交付物名称',
            EN: 'Please enter a deliverable name'
        },
        saveSuccess: {
            CN: '保存成功！',
            EN: 'Save successfully'
        },
        whetherDeleteDeliverables: {
            CN: '是否删除交付物？',
            EN: 'Whether to delete the deliverables?'
        },
        addDeliverables: {
            CN: '增加交付件',
            EN: 'Add deliverables'
        },
        templateReference: {
            CN: '模板引用',
            EN: 'Template reference'
        },
        createDeliverables: {
            CN: '创建交付件',
            EN: 'Create deliverables'
        },
        optionalObject: {
            CN: '可选对象',
            EN: 'Optional object'
        },
        selectedObject: {
            CN: '已选对象',
            EN: 'Selected object'
        },
        deleteAll: {
            CN: '全部删除',
            EN: 'Delete All'
        },
        name: {
            CN: '名称',
            EN: 'Name'
        },
        lifeCycle: {
            CN: '生命周期',
            EN: 'Life cycle'
        },
        affiliatedProject: {
            CN: '所属项目',
            EN: 'Affiliated project'
        },
        context: {
            CN: '上下文',
            EN: 'Context'
        },
        uninvolved: {
            CN: '不涉及',
            EN: 'Uninvolved'
        },
        actualWorkingHours: {
            CN: '实际工时',
            EN: 'Actual working hours'
        },
        estimatedWorkingHours: {
            CN: '预估工时',
            EN: 'Estimated working hours'
        },
        duration: {
            CN: '工期',
            EN: 'Duration'
        },
        finishingRate: {
            CN: '完成率',
            EN: 'Finishing rate'
        },
        positiveNumberCheckTips: {
            CN: '只能是正数，且只能保留1位小数！',
            EN: 'can only be a positive number, and can only keep 1 decimal place!'
        },
        finishingRateCheckTips: {
            CN: '请输入0-100范围的完成率',
            EN: 'Please enter a completion rate in the 0-100 range'
        },
        planEditSuccess: {
            CN: '计划编辑成功',
            EN: 'Plan edit success'
        },
        detailedInfo: {
            CN: '详细信息',
            EN: 'Detailed information'
        },
        deliverable: {
            CN: '交付物',
            EN: 'Deliverable'
        },
        subTask: {
            CN: '子任务',
            EN: 'Subtask'
        },
        frontToBackTask: {
            CN: '前后置任务',
            EN: 'Front-to-back task'
        },
        relevancy: {
            CN: '关联',
            EN: 'Relevancy'
        },
        associated: {
            CN: '被关联',
            EN: 'Associated'
        },
        workHourRecord: {
            CN: '工时记录',
            EN: 'Work hour record'
        },
        processRecord: {
            CN: '流程记录',
            EN: 'Process record'
        },
        responsiblePerson: {
            CN: '责任人',
            EN: 'Responsible person'
        },
        scheduledStartTime: {
            CN: '计划开始时间',
            EN: 'Scheduled start time'
        },
        scheduledEndTime: {
            CN: '计划结束时间',
            EN: 'Scheduled end time'
        },
        delayTimeCheckTips: {
            CN: '延搁时间只能输入非负整数',
            EN: 'The delay time can only be entered as a non-negative integer'
        },
        pleaseSelectAppropriateData: {
            CN: '请选择相应的数据！',
            EN: 'Please select the appropriate data!'
        },
        whetherRemovePreTask: {
            CN: '是否移除前置任务',
            EN: 'Whether to remove a pre-task'
        },
        confirmRemoval: {
            CN: '确认移除',
            EN: 'Confirm removal'
        },
        removedSuccess: {
            CN: '移除成功',
            EN: 'Removed successfully'
        },
        treeStructure: {
            CN: '树结构',
            EN: 'Tree structure'
        },
        ganttChart: {
            CN: '甘特图',
            EN: 'Gantt chart'
        },
        sddSubtask: {
            CN: '增加子任务',
            EN: 'Add subtask'
        },
        whetherMoveSubtask: {
            CN: '是否移动子任务？',
            EN: 'Do you want to move subtasks?'
        },
        confirmMove: {
            CN: '确认移动',
            EN: 'Confirm move'
        },
        moveSuccess: {
            CN: '移动成功',
            EN: 'Successful move'
        },
        task: {
            CN: '任务',
            EN: 'Task'
        },
        whetherRemoveTask: {
            CN: '是否移除任务？',
            EN: 'Do you want to remove the task?'
        },
        pleaseSelectAssociatePlan: {
            CN: '请选择关联计划',
            EN: 'Please select an associate plan'
        },
        addAssociatePlan: {
            CN: '增加关联任务',
            EN: 'Add accociate plan'
        },
        editAssociatePlan: {
            CN: '编辑关联任务',
            EN: 'Edit accociate plan'
        },
        day: {
            CN: '天',
            EN: 'day'
        },
        addedSuccess: {
            CN: '增加成功',
            EN: 'Added success'
        },
        lifeCycleState: {
            CN: '生命周期状态',
            EN: 'Life cycle state'
        },
        participant: {
            CN: '参与人',
            EN: 'participant'
        },
        resourceRole: {
            CN: '资源角色',
            EN: 'Resource role'
        },
        nonTailoring: {
            CN: '不可裁剪',
            EN: 'Non-tailoring'
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
        deleteOrNot: {
            CN: '是否删除',
            EN: 'Delete or not'
        },
        phaseTaskCheckTips: {
            CN: '是阶段任务，不可作为子任务',
            EN: 'It is a phase task and cannot be used as a subtask'
        },
        movedCheckTips: {
            CN: '为第一个节点，无法再上移',
            EN: 'It is the first node and cannot be moved up'
        },
        movedCheckSamePlanTips: {
            CN: '与前一个节点不在同一个计划集，无法再上移',
            EN: 'Cannot move up as it is not in the same plan set as the previous node'
        },
        downCheckTips: {
            CN: '为最后一个节点，无法下移',
            EN: 'It is the last node and cannot be moved down'
        },
        downCheckSamePlanTips: {
            CN: '与下一个节点不在同一个计划集，无法再下移',
            EN: 'It is the last node and cannot be moved down'
        },
        newTask: {
            CN: '<新增任务>',
            EN: '< New Task >'
        },
        taskNotSaved: {
            CN: '该任务未保存，无法查看',
            EN: 'The task is not saved and cannot be viewed'
        },
        deselectData: {
            CN: '请取消勾选未保存的数据',
            EN: 'Please deselect unsaved data'
        },
        editTask: {
            CN: '编辑任务',
            EN: 'Editing task'
        },
        responsiblePeople: {
            CN: '负责人',
            EN: 'Responsible people'
        },
        inputDurationTips: {
            CN: '请填写间隔工期',
            EN: 'Please fill in the interval duration'
        },
        projName: {
            CN: '项目名称',
            EN: 'Project name'
        },
        createPhaseTask: {
            CN: '创建阶段任务',
            EN: 'Creation phase task'
        },
        createPhase: {
            CN: '创建阶段',
            EN: 'Create phase'
        },
        importSuccess: {
            CN: '导入成功',
            EN: 'Import success'
        },
        pleaseSelectPlanSet: {
            CN: '请先选择计划集',
            EN: 'Please select the plan set first'
        },
        advancedFilter: {
            CN: '高级筛选',
            EN: 'Advanced filter'
        },
        refresh: {
            CN: '刷新',
            EN: 'refresh'
        },
        fieldSet: {
            CN: '字段设置',
            EN: 'Field settings'
        },
        pleaseUploadDeliverable: {
            CN: '请至少上传一个交付件',
            EN: 'Please upload at least one deliverable'
        },
        reviewType: {
            CN: '评审类型',
            EN: 'Review type'
        },
        reviewPoints: {
            CN: '评审点',
            EN: 'Review points'
        }
    };

    return { i18n: languageObj };
});
