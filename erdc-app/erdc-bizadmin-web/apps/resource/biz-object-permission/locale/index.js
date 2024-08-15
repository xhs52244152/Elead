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
        类型: {
            CN: '类型',
            EN: 'Type'
        },
        状态: {
            CN: '状态',
            EN: 'State'
        },
        请选择: {
            CN: '请选择',
            EN: 'Please select'
        },
        请输入: {
            CN: '请输入',
            EN: 'Search Keyword'
        },
        继承父级: {
            CN: '继承父级',
            EN: 'Inherit the parent'
        },
        查看访问权限: {
            CN: '查看访问权限',
            EN: 'Viewing Access Permissions'
        },
        查询条件提示: {
            CN: '输入查询条件，查看您想要的类型/状态的权限',
            EN: 'Enter the query criteria to view the type/status of permissions you want'
        },
        更多操作: {
            CN: '更多操作',
            EN: 'More Operations'
        },
        操作: {
            CN: '操作',
            EN: 'Operations'
        },
        返回: {
            CN: '返回',
            EN: 'Back'
        },
        创建: {
            CN: '创建',
            EN: 'Create'
        },
        确定: {
            CN: '确定',
            EN: 'OK'
        },
        取消: {
            CN: '取消',
            EN: 'Cancel'
        },
        搜索: {
            CN: '搜索',
            EN: 'Search'
        },
        上下文: {
            CN: '上下文',
            EN: 'Context'
        },
        参与者: {
            CN: '参与者',
            EN: 'Participants'
        },
        权限: {
            CN: '权限',
            EN: 'Permission'
        },
        授予权限: {
            CN: '授予权限',
            EN: 'Grant permission'
        },
        拒绝权限: {
            CN: '拒绝权限',
            EN: 'Denial of permission'
        },
        绝对拒绝权限: {
            CN: '绝对拒绝权限',
            EN: 'Absolute denial of permission'
        },
        无权限: {
            CN: '无权限',
            EN: 'No permission'
        },
        编辑: {
            CN: '编辑',
            EN: 'Edit'
        },
        删除: {
            CN: '删除',
            EN: 'Delete'
        },
        确认删除: {
            CN: '确认删除',
            EN: 'Confirm deletion'
        },
        删除确认提示: {
            CN: '此操作将永久删除该数据, 是否继续?',
            EN: 'This operation will permanently delete the data. Do you want to continue?'
        },
        删除成功: {
            CN: '删除成功',
            EN: 'Successfully deleted!'
        },
        基本信息: {
            CN: '基本信息',
            EN: 'Basic Information'
        },
        设置权限: {
            CN: '设置权限',
            EN: 'Setting Permissions'
        },
        编辑对象权限: {
            CN: '编辑对象权限',
            EN: 'Edit object permissions'
        },
        创建对象权限: {
            CN: '创建对象权限',
            EN: 'Permission to create Objects'
        },
        请设置有效条件: {
            CN: '请设置有效条件',
            EN: 'Please set valid conditions'
        },
        设置权限提示: {
            CN: '权限判断级别：绝对拒绝（含静、动态权限） > 拒绝（仅含静态权限） > 授予；    静态权限：默认授予用户的权限；    动态权限：用户参与任务流、工作流而动态获得的权限；',
            EN: 'Permission judgment level: absolute refusal (including static and dynamic permission) &gt; Reject (static permission only) &gt; To confer; Static permissions: permissions granted to users by default. Dynamic permissions: users participate in the task flow, workflow and obtain the permissions dynamically;'
        },
        请选择删除: {
            CN: '请选择要删除的行！',
            EN: 'Please select the row you want to delete!'
        },
        全部无权限: {
            CN: '至少设置一条有效权限！',
            EN: 'Set at least one valid permission!'
        }
    };

    return { i18n: languageObj };
});
