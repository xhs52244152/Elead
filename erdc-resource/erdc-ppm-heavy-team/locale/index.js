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
        heavyTitle: {
            CN: '重量级团队',
            EN: 'Heavy title'
        },
        deleteData: {
            CN: '确认删除该数据？',
            EN: 'Are you sure to delete this data?'
        },
        confirm: {
            CN: '确定',
            EN: 'confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        deleteWork: {
            CN: '删除工作项会同步删除子工作项',
            EN: 'Deleting work items will synchronize the deletion of sub work items'
        },
        deleteTip: {
            CN: '确认删除',
            EN: 'confirm delete'
        },
        moveTip: {
            CN: '提示：移动工作项会同步移动子工作项和已应用的实例',
            EN: 'Tip: Moving work items will synchronize the movement of sub work items and applied instances'
        },
        invalidWorkTip: {
            CN: '失效工作项会同步失效子工作项',
            EN: 'Invalid work items will synchronize with invalid child work items'
        },
        publishWorkTip: {
            CN: '发布工作项会同步发布子工作项',
            EN: 'Publishing work items will synchronize publishing sub work items'
        },

        confirmDelete: {
            CN: '确认删除该数据？',
            EN: 'Are you sure to delete this data?'
        },
        confirmInvali: {
            CN: '确认失效',
            EN: 'Confirm invalidation'
        },
        confirmPublishdata: {
            CN: '确认发布',
            EN: 'Confirm publish?'
        },
        tip: {
            CN: '提示',
            EN: 'tip'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        draftSuccess: {
            CN: '草稿创建成功',
            EN: 'Draft created successfully'
        },
        createdSuccessfully: {
            CN: '创建成功',
            EN: 'Created successfully'
        },
        editSuccessfully: {
            CN: '编辑成功',
            EN: 'Edit successfully'
        },
        editHeavyweightTeam: {
            CN: '编辑重量级团队',
            EN: 'Edit heavyweight team'
        },
        createHeavyweightTeam: {
            CN: '创建重量级团队',
            EN: 'Create heavyweight team'
        },

        confirmInvalidation: {
            CN: '确认失效该数据？',
            EN: 'Confirm invalidation of this data?'
        },
        confirmPublish: {
            CN: '确认发布该数据？',
            EN: 'Confirm publish of this data?'
        },
        confirmCancel: {
            CN: '确认取消',
            EN: 'Confirm to cancel the main responsibility'
        },
        continue: {
            CN: '此操作将取消主责任人，是否继续？',
            EN: 'This action will cancel the main responsible person, whether or not to continue?'
        },
        searchTips: {
            CN: '请输入',
            EN: 'Please input'
        },
        pleaseSelectData: {
            CN: '请选择要移除的数据',
            EN: 'Please select the data to remove'
        },
        add: {
            CN: '增加角色',
            EN: 'Add'
        },
        addMember: {
            CN: '增加成员',
            EN: 'addMember'
        },
        lookUser: {
            CN: '查看用户',
            EN: 'Look member'
        },
        mainResponsible: {
            CN: '主责任人',
            EN: 'Main responsible person'
        },
        remove: {
            CN: '移除',
            EN: 'remove'
        },
        operate: {
            CN: '操作',
            EN: 'operate'
        },
        more: {
            CN: '更多',
            EN: 'more'
        },
        onlyShowRole: {
            CN: '仅展示角色',
            EN: 'only Show Role'
        },
        groupInfo: {
            CN: '群组信息',
            EN: 'Group information'
        },
        userInfo: {
            CN: '用户信息',
            EN: 'user information'
        },

        keys: { CN: '请输入关键字', EN: 'Please enter the keywords' },
        role: { CN: '增加角色', EN: 'Add role' },
        member: { CN: '增加成员', EN: 'Add member' },
        selectRole: { CN: '选择角色', EN: 'Select role' },
        selectMember: { CN: '选择成员', EN: 'Select member' },
        responsible: { CN: '设为主责任人', EN: 'Set up primarily responsible' },
        cancelResponsible: { CN: '取消主责任人', EN: 'Cancel the main responsible person' },

        请先选择数据: { CN: '请先选择数据', EN: 'Please select data first' },
        deleteSelectData: { CN: '是否要移除当前所选数据吗？', EN: 'Whether to remove the selected data?' },
        deleteRole: { CN: '是否要移除该角色？', EN: 'Whether to remove the roles?' },
        deleteMember: { CN: '是否要移除该成员？', EN: 'Whether to remove the members?' },
        deleteAllMember: {
            CN: '存在子类角色，是否移除所有成员？',
            EN: 'There are subclass roles, do you want to remove all members?'
        },
        提示: { CN: '提示', EN: 'Tips' },

        participants: { CN: '参与者', EN: 'Participants' },
        participantsType: { CN: '参与者类型', EN: 'Participants type' },
        workNumber: { CN: '工号', EN: 'Work number' },
        login: { CN: '登录帐号', EN: 'login' },
        mobile: { CN: '手机', EN: 'Mobile phone' },
        email: { CN: '邮箱', EN: 'Email' },
        department: { CN: '部门', EN: 'Department' },

        // 操作提示信息
        successfullyRemoved: { CN: '移除成员成功', EN: 'Successfully removed member' },
        successfullySet: { CN: '设置责任人成功', EN: 'Successfully set responsible person' },
        successfullyCancel: { CN: '取消责任人成功', EN: 'Successfully cancel responsible person' },
        successfullyAdd: { CN: '增加成员成功', EN: 'Successfully added members' },
        successful: { CN: '操作成功', EN: 'Operation Successful' }
    };

    return { i18n: languageObj };
});
