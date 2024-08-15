define([], function () {
    // 配置国际化key-value
    const languageObj = {
        createSuccess: { CN: '创建成功', EN: 'Create Success' },
        editorSuccess: { CN: '更新成功', EN: 'Update Success' },
        deleteSuccess: { CN: '删除成功', EN: 'Delete Success' },
        addSuccess: { CN: '增加成功', EN: 'Add Success' },
        removeSuccess: { CN: '移除成功', EN: 'Remove Success' },
        confirmDel: { CN: '确认删除', EN: 'Confirm Delete' },
        addMember: { CN: '创建用户', EN: 'Create User' },
        editMember: { CN: '编辑用户', EN: 'Edit User' },
        readonlyMember: { CN: '用户详情', EN: 'User Detail' },
        sure: { CN: '确认', EN: 'Sure' },
        ok: { CN: '确定', EN: 'OK' },
        cancel: { CN: '取消', EN: 'Cancel' },
        edit: { CN: '编辑', EN: 'Edit' },
        organization: { CN: '部门', EN: 'Organization' },
        role: { CN: '角色', EN: 'Role' },
        userGroup: { CN: '群组', EN: 'User Group' },
        create: { CN: '创建', EN: 'Create' },
        join: { CN: '加入', EN: 'Join' },
        add: { CN: '增加', EN: 'Add' },
        remove: { CN: '移除', EN: 'Remove' },
        removeOut: { CN: '移出', EN: 'Remove' },
        enable: { CN: '启用', EN: 'Enable' },
        disable: { CN: '禁用', EN: 'Disable' },
        dimission: { CN: '离职', EN: 'Dimission' },
        description: { CN: '描述', EN: 'Description' },
        name: { CN: '名称', EN: 'Name' },
        tips: { CN: '提示', EN: 'Tips' },
        newPassword: { CN: '新密码', EN: 'News Password' },
        resetSuccess: { CN: '重置成功', EN: 'Reset Success' },
        pleaseSelectData: { CN: '请选择数据', EN: 'Please select data' },
        // 部门
        removeMemberConfirm: {
            CN: '是否将用户移出当前部门及其存在的所有下级子部门？',
            EN: 'Do you want to move the user out of the current department and all its subordinate departments?'
        },
        removeCurrentOrg: { CN: '移出当前部门', EN: 'Move out of current department' },
        disabledMemberConfirm: { CN: '是否将选中的用户禁用？', EN: 'Disable the selected user?' },
        disabledMember: { CN: '禁用', EN: 'Disabled' },
        joinOrgTitle: { CN: '加入部门', EN: 'Join Department' },
        enabledMember: { CN: '是否要启用该用户？', EN: 'Do you want to enable this user?' },
        dimissionTips: { CN: '离职通知', EN: 'Dimission notice' },
        editOrg: { CN: '编辑部门', EN: 'Edit Organization' },
        addOrg: { CN: '创建部门', EN: 'Create Organization' },
        addOrganizationRole: { CN: '增加成员', EN: 'Add Members' },
        selectMember: { CN: '选择成员', EN: 'Select Members' },
        deleteMember: { CN: '是否要移除该成员？', EN: 'Do you want to remove this member?' },
        是否把用户离职: { CN: '是否把用户离职？', EN: 'Whether to resign the user?' },
        members: { CN: '成员', EN: 'Members' },
        infos: { CN: '信息', EN: 'Infos' },
        memberSearchPlaceholder: {
            CN: '姓名/登录账号/邮箱/工号/手机号',
            EN: 'User name/login account/email/job number/mobile phone number'
        },
        resetPassword: { CN: '重置密码', EN: 'Reset Password' },
        // 部门新增、编辑表单
        departmentNo: { CN: '部门编号', EN: 'Department Number' },
        parentDepartment: { CN: '上级部门', EN: 'Parent department' },
        departmentName: { CN: '名称', EN: 'Name' },
        departmentStatus: { CN: '状态', EN: 'Status' },
        teamLeader: { CN: '团队负责人', EN: 'Team Leader' },
        website: { CN: '网址', EN: 'Website' },
        postalAddress: { CN: '邮政地址', EN: 'Postal address' },
        pleaseInputName: { CN: '请输入名称', EN: 'Please input Name' },
        baseInfo: { CN: '基本信息', EN: 'Base Info' },
        正常: { CN: '正常', EN: 'Normal' },
        不正常: { CN: '不正常', EN: 'Abnormal' },
        //部门成员列
        workNumber: { CN: '工号', EN: 'Work number' },
        loginAccount: { CN: '账号', EN: 'Account' },
        chineseName: { CN: '中文名', EN: 'Chinese Name' },
        displayName: { CN: '姓名', EN: 'Name' },
        email: { CN: '邮箱', EN: 'Email' },
        mobile: { CN: '手机', EN: 'Mobile' },
        orgName: { CN: '部门', EN: 'Organization' },
        operation: { CN: '操作', EN: 'Operations' },
        // 部门成员功能
        disableSuccess: { CN: '禁用成功', EN: 'Disable successfully' },
        enabledSuccess: { CN: '启用成功', EN: 'Enabled successfully' },
        dimissionSuccess: { CN: '离职成功', EN: 'Dimission successfully' },
        joinSuccess: { CN: '加入成功', EN: 'Join successfully' },
        请选择交接人员: { CN: '请选择交接人员', EN: 'Please select the handover personnel' },
        请选择加入的成员: { CN: '请选择加入的成员', EN: 'Please select a member to join' },
        // 部门成员表单
        usersChineseName: { CN: '用户中文名', EN: 'users Chinese name' },
        englishName: { CN: '用户英文名', EN: 'English Name' },
        password: { CN: '登录密码', EN: 'Password' },
        emailAddress: { CN: '邮箱地址', EN: 'Email' },
        confidentiality: { CN: '密级', EN: 'Confidentiality level' },
        autograph: { CN: '签名', EN: 'Autograph' },
        请输入邮箱地址: { CN: '请输入邮箱地址', EN: 'Please enter the email address' },
        请输入正确的邮箱地址: { CN: '请输入正确的邮箱地址', EN: 'Please enter the correct email address' },
        请输入工号: { CN: '请输入工号', EN: 'Please enter the job number' },
        请输入正确的工号: { CN: '请输入正确的工号，仅支持英文、数字、"_"', EN: 'Please enter the correct work number, only English, numbers, "_"' },
        请输入账号: { CN: '请输入账号', EN: 'Please enter an account' },
        请输入正确的账号: {
            CN: '请输入正确的账号,仅支持英文、数字和下划线，且不能为纯数字',
            EN: 'Please enter the correct account number, which only supports English, numbers and underscores, and cannot be pure numbers'
        },
        请输入用户中文名: { CN: '请输入用户中文名', EN: 'Please enter the users Chinese name' },
        请输入正确的用户中文名: { CN: '请输入正确的用户中文名', EN: 'Please enter the correct user Chinese name' },
        请输入用户英文名: { CN: '请输入用户英文名', EN: 'Please enter the users English name' },
        请输入正确的用户英文名: {
            CN: '请输入正确的用户英文名,仅支持英文、下划线、空格和数字',
            EN: 'Please enter the correct user English name and number'
        },
        // 部门详情页
        teamMembers: { CN: '团队成员', EN: 'Team members' },
        principal: { CN: '参与者', EN: 'Principal' },
        type: { CN: '类型', EN: 'Type' },
        principalMobile: { CN: '电话', EN: 'Mobile' },
        roleName: { CN: '角色名称', EN: 'Role Name' },
        // 群组
        addGroup: { CN: '创建群组', EN: 'Create User Group' },
        editGroup: { CN: '编辑群组', EN: 'Edit User Group' },
        deleteGroupConfirm: { CN: '是否要删除群组？', EN: 'Do you want to delete the user group?' },
        addGroupParticipant: { CN: '增加参与者', EN: 'Add Participants' },
        removeParticipant: { CN: '确认移除该数据？', EN: 'Confirm removing the data?' },
        participantType: { CN: '参与者类型', EN: 'Participant Type' },
        department: { CN: '所属部门', EN: 'Department' },
        // 群组表单
        number: { CN: '编号', EN: 'Number' },
        identifierNo: { CN: '编码', EN: 'Identifier No.' },
        请输入名称: { CN: '请输入名称', EN: 'Please enter name' },
        请输入11位正确的手机号: { CN: '请输入11位正确的手机号', EN: 'Please enter 11 correct phone numbers.' },
        selectParticipant: { CN: '请选择参与者', EN: 'Please select a participant.' },
        cannotRemoveAdmin: {
            CN: '管理员账户不可禁用、离职',
            EN: 'An administrator account cannot be disabled or left.'
        },
        import: { CN: '导入', EN: 'Import' },
        export: { CN: '导出', EN: 'Export' },
        changedPasswordSuccessfully: {
            CN: '密码修改成功，请重新登录',
            EN: 'The password is changed successfully. Please log in again.'
        },
        oldPassword: { CN: '原密码', EN: 'Old password' },
        confirmPassword: { CN: '确认密码', EN: 'Confirm password' },
        passwordDifferent: {
            CN: '新密码与确认密码不一致',
            EN: 'The new password is different from the confirmed password.'
        },
        changePassword: { CN: '修改密码', EN: 'Change password' },
        deleteDepartmentTips: {
            CN: '删除该部门将同时删除所有子部门，是否继续要删除【{departmentName}】部门？',
            EN: 'Deleting this department will also delete all sub departments. Do you want to continue deleting the department [{departmentName}}]?'
        },
        selectedUsers: { CN: '已选人员', EN: 'Selected Users' },
        totals: { CN: '共', EN: 'Totals' },
        company: { CN: '个', EN: '' },
        pleaseFillInIdentifierNo: {
            CN: '请输入编码',
            EN: 'Please enter the identifier number'
        },
        identifierNoRule: { CN: '请输入大小写字母和数字、"_"、"."', EN: 'Please enter the letters and number, "_", "."' },
        exportLicense: { CN: '导出未授权', EN: 'Export Unauthorized' },
        licenseTips: { CN: 'license授权成功', EN: 'License authorization successful' },
        unlock: { CN: '解锁', EN: 'Unlock' },
        unlockSuccess: { CN: '解锁成功', EN: 'Unlock Success' }
    };

    return {
        i18n: languageObj
    };
});
