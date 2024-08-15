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
        基本信息: {
            CN: '基本信息',
            EN: 'Basic Information'
        },
        版本号: {
            CN: '版本号',
            EN: 'Version number'
        },
        搜索提示: {
            CN: '请搜索租户名称、编码',
            EN: 'Search for tenant name and code'
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
        点击更换: {
            CN: '点击更换',
            EN: 'Click to replace'
        },
        搜索名称: {
            CN: '请搜索名称',
            EN: 'Please search by name'
        },
        编辑应用: {
            CN: '编辑应用',
            EN: 'Edit the application'
        },
        应用详情: {
            CN: '应用详情',
            EN: 'Application Details'
        },
        修改应用成功: {
            CN: '应用修改成功！',
            EN: 'Application modification successful!'
        },
        修改应用失败: {
            CN: '应用修改失败！',
            EN: 'Application modification failed!'
        },
        关联租户: {
            CN: '关联租户',
            EN: 'Associated Tenant'
        },
        编辑服务: {
            CN: '编辑服务',
            EN: 'Edit the service'
        },
        服务详情: {
            CN: '服务详情',
            EN: 'Service Details'
        },
        修改服务成功: {
            CN: '服务修改成功！',
            EN: 'Service modification successful!'
        },
        修改服务失败: {
            CN: '服务修改失败！',
            EN: 'Service modification failed!'
        },
        标识: {
            CN: '标识',
            EN: 'Identification'
        },
        所属应用: {
            CN: '所属应用',
            EN: 'Application of ownership'
        },
        上下文路径: {
            CN: '上下文路径',
            EN: 'Context path'
        },
        sortName: {
            CN: '排序',
            EN: 'Sort'
        }
    };

    return { i18n: languageObj };
});
