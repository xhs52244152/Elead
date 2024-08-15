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
        '创建': { CN: '创建', EN: 'Create' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '更多操作': { CN: '更多操作', EN: 'More Actions' },
        '删除': { CN: '删除', EN: 'Delete' },
        '导出数据': { CN: '导出数据', EN: 'Export' },
        '基本信息': { CN: '基本信息', EN: 'Basic information' },
        '编辑基本信息配置': { CN: '编辑基本信息配置', EN: 'Edit basic information configuration' },
        '是': { CN: '是', EN: 'Yes' },
        '否': { CN: '否', EN: 'No' },
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },

        '请输入': { CN: '请输入', EN: 'Please Enter' },
        '请选择': { CN: '请选择', EN: 'Please Select' },
        '类型': { CN: '类型', EN: 'Type' },

        '更多': { CN: '更多', EN: 'More' },
        '名称': { CN: '名称', EN: ' Name' },
        '上下文': { CN: '上下文', EN: 'Context' },
        '所在位置': { CN: '所在位置', EN: 'Position' },

        '确认': { CN: '确认', EN: 'Confirm' },
        '删除成功': { CN: '删除成功', EN: 'Successfully Delete' },
        '删除失败': { CN: '删除失败', EN: 'Delete Failed' },
        '确认移除': { CN: '确认移除', EN: 'Confirm remove' },
        '更新成功': { CN: '更新成功', EN: 'Update successfully' },
        '创建成功': { CN: '创建成功', EN: 'Create successfully' },
        '是否放弃属性的创建？': { CN: '是否放弃属性的创建？', EN: 'Discard creation of attribute?' },
        '是否放弃属性的编辑？': { CN: '是否放弃属性的编辑？', EN: 'Discard editing of attribute?' },
        '放弃创建': { CN: '放弃创建文件夹', EN: 'Discard Creation' },
        '放弃编辑': { CN: '放弃编辑文件夹', EN: 'Discard Editor' },

        '编码': { CN: '编码', EN: 'Code' },
        '密级有效期': { CN: '密级有效期', EN: 'Password Validity Period' },
        '安全密级': { CN: '安全密级', EN: 'Security Level' },
        '移动成功': { CN: '移动成功', EN: 'Moved successfully' },

        isAddDomain: {
            CN: '是否访问控制',
            EN: 'Whether access control'
        },
        isAddDomainTips: {
            CN: '创建文件夹时，<br>如果父文件夹有访问控制，新建子文件夹才可选择是否访问控制；<br>如果父文件夹无访问控制，新建子文件夹也不能访问控制；',
            EN: 'When creating a folder, <br>if the parent folder has access control, you can select access control only when creating a subfolder. <br>If the parent folder does not have access control, the new subfolder cannot have access control either.'
        },
        yesDomain: {
            CN: '是（支持权限配置）',
            EN: 'Yes (Support permission configuration)'
        },
        noDomain: {
            CN: '否（当前文件夹及所有其子文件夹都不支持权限配置）',
            EN: 'No (The current folder and all its subfolders do not support permission configuration)'
        },
    };

    return {
        i18n: languageObj
    };
});
