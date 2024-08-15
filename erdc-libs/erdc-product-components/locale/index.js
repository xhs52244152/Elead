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
        '新增': { CN: '新增', EN: 'Add' },
        '转至最新': { CN: '转至最新', EN: 'Turn to the latest' },
        '更多操作': { CN: '更多操作', EN: 'More actions' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '删除': { CN: '删除', EN: 'Delete' },
        '增加': { CN: '增加', EN: 'Add' },
        '操作': { CN: '操作', EN: 'Detail' },
        '保存': { CN: '保存', EN: 'Save' },
        '信息': { CN: '信息', EN: 'Info' },
        '仪表盘': { CN: '仪表盘', EN: 'Dashboard' },
        '文件夹': { CN: '文件夹', EN: 'Folder' },
        '部件': { CN: '部件', EN: 'Parts' },
        '文档': { CN: '文档', EN: 'Doc' },
        '图文档': { CN: '图文档', EN: 'Epm' },
        '团队': { CN: '团队', EN: 'Team' },
        '变更管理': { CN: '变更管理', EN: 'Change management' },
        '工作区': { CN: '工作区', EN: 'Workspace' },
        '基线': { CN: '基线', EN: 'Baseline' },

        // 产品
        '创建产品': { CN: '创建产品', EN: 'Create product' },
        'noLayoutTips': {
            CN: '无可用的布局，请确认已配置的布局规则是否满足',
            EN: 'No layout is available. Check whether the configured layout rules meet the requirements'
        },

        '编辑产品': { CN: '编辑产品', EN: 'Edit product' },
        '类型': { CN: '类型', EN: 'Type' },
        '模板': { CN: '模板', EN: 'Template' },
        '说明': { CN: '说明', EN: 'Description' },
        '属性': { CN: '属性', EN: 'Attribute' },
        '相关对象': { CN: '相关对象', EN: 'Related objects' },
        '模块': { CN: 'TAB模块', EN: 'TAB module' },
        '增加TAB模块': { CN: '增加TAB模块', EN: 'To increase the TAB module' },
        '内部名称': { CN: '内部名称', EN: 'Internal name' },
        '名称': { CN: '名称', EN: 'Name' },
        '更新时间': { CN: '更新时间', EN: 'Update Time' },
        '创建时间': { CN: '创建时间', EN: 'Create Time' },
        '状态': { CN: '状态', EN: 'Status' },
        '组织': { CN: '组织', EN: 'Organization' },
        '修改者': { CN: '修改者', EN: 'Modifier' },
        '创建者': { CN: '创建者', EN: 'Creator' },
        '所有者': { CN: '所有者', EN: 'owner' },
        '开始时间': { CN: '开始时间', EN: 'Start Time' },
        '结束时间': { CN: '结束时间', EN: 'End Time' },

        '增加成功': { CN: '增加成功', EN: 'Successfully Delete' },
        '确认删除': { CN: '确认删除', EN: 'Confirm Delete' },
        '确认删除该数据': { CN: '确认删除该数据？', EN: 'Confirm deletion of this data?' },
        '删除成功': { CN: '删除成功', EN: 'Successfully Delete' },
        '删除失败': { CN: '删除失败', EN: 'Delete Failed' },
        '移除成功': { CN: '移除成功', EN: 'Successfully Remove' },
        '移除失败': { CN: '移除失败', EN: 'Remove Failed' },
        '创建': { CN: '创建', EN: 'Create' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },

        //  团队
        '请输入关键字': { CN: '请输入关键字', EN: 'Please enter the keywords' },
        '增加角色': { CN: '增加角色', EN: 'Add role' },
        '增加成员': { CN: '增加成员', EN: 'Add member' },
        '选择角色': { CN: '选择角色', EN: 'Select role' },
        '选择成员': { CN: '选择成员', EN: 'Select member' },
        '移除': { CN: '移除', EN: 'Remove' },
        '设为主责任人': { CN: '设为主责任人', EN: 'Set up primarily responsible' },
        '取消主责任人': { CN: '取消主责任人', EN: 'Cancel the main responsible person' },
        'searchTips': { CN: '请输入参与者、工号或邮箱', EN: 'Please enter participant, job ID or email address' },

        '请先选择数据': { CN: '请先选择数据', EN: 'Please select data first' },
        '是否要移除当前所选数据吗？': { CN: '是否要移除当前所选数据吗？', EN: 'Whether to remove the selected data?' },
        '是否要移除该角色？': { CN: '是否要移除该角色？', EN: 'Whether to remove the roles?' },
        '是否要移除该成员？': { CN: '是否要移除该成员？', EN: 'Whether to remove the members?' },
        '存在子类角色': {
            CN: '存在子类角色，是否移除所有成员？',
            EN: 'There are subclass roles, do you want to remove all members?'
        },
        '提示': { CN: '提示', EN: 'Tips' },

        '请输入': { CN: '请输入', EN: 'Place Enter' },
        '请选择': { CN: '请选择', EN: 'Place Select' },

        '参与者': { CN: '参与者', EN: 'Participants' },
        '参与者类型': { CN: '参与者类型', EN: 'Participants type' },
        '工号': { CN: '工号', EN: 'Work number' },
        '登录号': { CN: '登录帐号', EN: 'login' },
        '手机': { CN: '手机', EN: 'Mobile phone' },
        '邮箱': { CN: '邮箱', EN: 'Email' },
        '部门': { CN: '部门', EN: 'Department' },
        '关联用户': { CN: '关联用户', EN: 'associated User' },
        '添加成员': { CN: '添加成员', EN: 'Add Members' },

        '确认取消': { CN: '确认取消', EN: 'Confirm to cancel the main responsibility' },
        '此操作将取消主责任人，是否继续？': {
            CN: '此操作将取消主责任人，是否继续？',
            EN: 'This action will cancel the main responsible person, whether or not to continue?'
        },

        // 关联用户
        '加入成功': { CN: '加入成功', EN: 'Join successfully' },
        '请选择加入的成员': { CN: '请选择加入的成员', EN: 'Please select a member to join' },
        'searchPlaceholder': {
            CN: '姓名/登录账号/邮箱/工号/手机号',
            EN: 'User name/login account/email/job number/mobile phone number'
        },
        '请勾选要移除的数据': { CN: '请勾选要移除的数据', EN: 'Select the data you want to remove' },
        '是否移除所选用户？': { CN: '是否移除所选用户？', EN: 'Whether to remove the user?' },

        // 操作提示信息
        '移除成员成功': { CN: '移除成员成功', EN: 'Successfully removed member' },
        '设置责任人成功': { CN: '设置责任人成功', EN: 'Successfully set responsible person' },
        '取消责任人成功': { CN: '取消责任人成功', EN: 'Successfully cancel responsible person' },
        '增加成员成功': { CN: '增加成员成功', EN: 'Successfully added members' },
        '操作成功': { CN: '操作成功', EN: 'Operation Successful' },

        // 创建产品
        '放弃创建': { CN: '放弃创建', EN: 'Give up to create' },
        '放弃编辑': { CN: '放弃编辑', EN: 'Give up to edit' },
        '是否放弃创建': { CN: '是否放弃创建', EN: 'Whether to give up to create' },
        '是否放弃编辑': { CN: '是否放弃编辑', EN: 'Whether to give up to edit' },
        '更新成功': { CN: '更新成功', EN: 'Update Successfully' },
        '创建成功': { CN: '创建成功', EN: 'Create Successfully' },

        //另存为模板
        '保存模板成功': { CN: '模板保存成功！', EN: 'Template saved successfully!' },
        '保存模板失败': { CN: '模板保存失败！', EN: 'Template saving failed!' },
        '另存为模板': { CN: '另存为模板', EN: 'Save as a template' },
        '发起流程': { CN: '发起流程', EN: 'Launch process' },

        '另存为模板配置': { CN: '另存为模板配置', EN: 'Save as Template Configuration' },
        '权限': { CN: '权限', EN: 'Authority' },
        'saveAsTips': {
            CN: '请根据需要配置另存为模板需要保存的数据',
            EN: 'Please configure the data that needs to be saved as a template as needed'
        },
        'name': { CN: '名称', EN: 'name' },
        'enterTemplateNameTip': { CN: '请输入模板名称', EN: 'Please enter a template name' },
        'descriptionI18nJson': { CN: '描述', EN: 'Describe' },
        'inheritFeatures': { CN: '继承特性', EN: 'Inherit Features' },

        // 收藏，取消收藏
        '收藏': { CN: '收藏', EN: 'Collect' },
        '取消收藏': { CN: '取消收藏', EN: 'Cancel Collect' },
        'principal': { CN: '参与者', EN: 'Principal' },
        'roleName': { CN: '角色名称', EN: 'Role Name' },
        'viewUsers': { CN: '查看用户', EN: 'View Users' },
        'onlyShowRole': { CN: '仅展示角色', EN: 'Only show role' },
        'groupInformation': { CN: '群组信息', EN: 'Group Information' },
        'usersInformation': { CN: '用户信息', EN: 'Users Information' },
        'group': { CN: '群组', EN: 'Group' },
        'memberReplacement': { CN: '成员替换', EN: 'Member Replacement' },
        'memberReplacementColumnTips': {
            CN: '仅非新增的人员、群组支持置换',
            EN: 'Only effective personnel and groups can be replaced.'
        },
        'memberReplacementTips': {
            CN:
                '置换当前角色的人员包括以下操作，确定后将应用场景置换：\n' +
                '1. 移除，将原有角色的人员移除；\n' +
                '2. 新增，在原有角色新增人员；\n' +
                '3. 置换，角色中的某个人员置换为单个或多个人员或角色中的某个群组置换为其它单个或多个群组，或单个或多个人；',
            EN:
                'The personnel who replace the current role include the following operations, and once confirmed, the application scenario will be replaced:\n' +
                '1. Remove, remove personnel from the original role;\n' +
                '2. Add new personnel to the original role;\n' +
                '3. Replacement, where a person in a role is replaced with a single or multiple person, or a group in a role is replaced with another single or multiple groups, or a single or multiple person;'
        },
        'memberReplaceSuccess': {
            CN: '人员置换成功',
            EN: 'Members Replaced successfully'
        },
        selectMember: { CN: '选择成员', EN: 'Select Members ' },
        responsible: { CN: '主责任人 ', EN: 'Principal responsible person ' },
        setLevelSuccess: { CN: '设置等级成功', EN: 'Level setting successful'},
        permissionDomain: { CN: '权限域', EN: 'Permission domain'},
        searchKeyword: { CN: '搜索关键字', EN: 'Search keyword' },
    }

    return {
        i18n: languageObj
    };
});
