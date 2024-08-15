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
        新增: {
            CN: '创建',
            EN: 'Create'
        },
        编辑: {
            CN: '编辑',
            EN: 'Edit'
        },
        名称: {
            CN: '名称',
            EN: 'Name'
        },
        编码: {
            CN: '编码',
            EN: 'Number'
        },
        状态: {
            CN: '状态',
            EN: 'Status'
        },
        开始时间: {
            CN: '开始时间',
            EN: 'Start Time'
        },
        结束时间: {
            CN: '结束时间',
            EN: 'End Time'
        },
        是否共享: {
            CN: '是否共享',
            EN: 'Share or not'
        },
        描述: {
            CN: '描述',
            EN: 'Description'
        },
        操作: {
            CN: '操作',
            EN: 'Operation'
        },
        是: {
            CN: '是',
            EN: 'Yes'
        },
        否: {
            CN: '否',
            EN: 'No'
        },
        禁用: {
            CN: '禁用',
            EN: 'Disable'
        },
        启用: {
            CN: '启用',
            EN: 'Enable'
        },
        停用: {
            CN: '停用',
            EN: 'Disable'
        },
        点击更换: {
            CN: '点击更换',
            EN: 'Click to replace'
        },
        输入描述: {
            CN: '请输入描述',
            EN: 'Please enter a description.'
        },
        确定: {
            CN: '确定',
            EN: 'Ok'
        },
        取消: {
            CN: '取消',
            EN: 'Cancel'
        },
        搜索提示: {
            CN: '请搜索租户名称、编码',
            EN: 'Search for tenant name and code'
        },
        应用维护: {
            CN: '应用维护',
            EN: 'Application edit'
        },
        增加应用: {
            CN: '增加应用',
            EN: 'Adding Applications'
        },
        选择应用: {
            CN: '请选择应用',
            EN: 'Please select Application'
        },
        移除: {
            CN: '移除',
            EN: 'Remove'
        },
        版本号: {
            CN: '版本号',
            EN: 'Version number'
        },
        创建租户: {
            CN: '创建租户',
            EN: 'Creating a Tenant'
        },
        租户详情: {
            CN: '租户详情',
            EN: 'Tenant Details'
        },
        详情: {
            CN: '详情',
            EN: 'Details'
        },
        编辑租户: {
            CN: '编辑租户',
            EN: 'Edit the tenant'
        },
        基本信息: {
            CN: '基本信息',
            EN: 'Basic Information'
        },
        已维护的应用: {
            CN: '已维护的应用',
            EN: 'Applications that have been maintained'
        },
        创建成功: {
            CN: '租户创建成功！',
            EN: 'The tenant is created successfully!'
        },
        编辑成功: {
            CN: '租户编辑成功！',
            EN: 'Tenant editing success!'
        },
        启用成功: {
            CN: '租户启用成功！',
            EN: 'The tenant enabled successfully!'
        },
        停用成功: {
            CN: '租户停用成功！',
            EN: 'The tenant is disabled successfully!'
        },
        创建失败: {
            CN: '租户创建失败！',
            EN: 'The tenant is created failed!'
        },
        编辑失败: {
            CN: '租户编辑失败！',
            EN: 'Tenant editing success!'
        },
        请输入: {
            CN: '请输入',
            EN: 'Please enter'
        },
        请选择: {
            CN: '请选择',
            EN: 'Please select'
        },
        添加应用成功: {
            CN: '添加应用成功！',
            EN: 'Application added successfully!'
        },
        添加应用失败: {
            CN: '添加应用失败！',
            EN: 'Application added failed!'
        },
        删除应用成功: {
            CN: '移除应用成功！',
            EN: 'Application deleted successfully!'
        },
        请选择应用: {
            CN: '请选择需要移除的应用！',
            EN: 'Please select the application you want to remove!'
        },
        请输入编码: {
            CN: '请输入编码',
            EN: 'Please enter the number'
        },
        编码格式错误: {
            CN: '请输入大小写字母数字、"_"、"."',
            EN: 'Please enter upper and lower case alphanumeric, "_", "."'
        }
    };

    return { i18n: languageObj };
});
