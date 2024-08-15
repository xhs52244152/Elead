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
        操作: { CN: '操作', EN: 'Operation' },
        请输入描述: { CN: '请输入描述', EN: 'Please Enter Desc' },
        保存: { CN: '保存', EN: 'Save' },
        取消: { CN: '取消', EN: 'Cancel' },
        描述: { CN: '描述', EN: 'Description' },
        编码: { CN: '编码', EN: 'Code' },
        状态: { CN: '状态', EN: 'Status' },
        启用: { CN: '启用', EN: 'Enable' },
        禁用: { CN: '禁用', EN: 'Disable' },
        模板: { CN: '模板', EN: 'Template' },
        免打扰设置: { CN: '免打扰设置', EN: 'Do Not Disturb' },
        名称: { CN: '名称', EN: 'Title' },
        语法: { CN: '语法', EN: 'grammar' },
        语言: { CN: '语言', EN: 'Language' },
        版本: { CN: '版本', EN: 'Version' },
        版本描述: { CN: '版本描述', EN: 'Version Desc' },
        发送类型: { CN: '发送类型', EN: 'Send Type' },
        升级版本描述: { CN: '升级版本描述', EN: 'Upgrade Desc' },
        应用: { CN: '应用', EN: 'Application' },
        免打扰时间: { CN: '免打扰时间', EN: 'DND Time' },
        开始时间: { CN: '开始时间', EN: 'Start Time' },
        结束时间: { CN: '结束时间', EN: 'End Time' },
        至: { CN: '至', EN: 'To' },
        上下文类型: { CN: '上下文类型', EN: 'Context Type' },
        系统级别: { CN: '系统级别', EN: 'System' },
        项目级别: { CN: '项目级别', EN: 'Project' },
        用户级别: { CN: '用户级别', EN: 'User' },
        删除: { CN: '删除', EN: 'delete' },
        标题: { CN: '标题', EN: 'Title' },
        提示: { CN: '提示', EN: 'Tips' },
        确定: { CN: '确定', EN: 'Ok' },
        编辑: { CN: '编辑', EN: 'Edit' },
        成功: { CN: '成功', EN: 'Success' },
        返回: { CN: '返回', EN: 'Back' },
        创建: { CN: '创建', EN: 'Create' },
        升级: { CN: '升级', EN: 'Upgrade' },
        复制: { CN: '复制', EN: 'Copy' },
        更多操作: { CN: '更多操作', EN: 'More Action' },
        更多: { CN: '更多', EN: 'More' },
        内容对应的参数格式如下: { CN: '内容对应的参数格式如下', EN: 'The format of the parameters is as follows' },
        导出所有模板: { CN: '导出所有模板', EN: 'Export All Tmpl' },
        导出使用中的模板: { CN: '导出使用中的模板', EN: 'Export Use Tmpl' },
        导出未使用中的模板: { CN: '导出未使用中的模板', EN: 'Export UnUse Tmpl' },
        导入: { CN: '导入', EN: 'Import' },
        导出: { CN: '导出', EN: 'Export' },
        是否删除该配置: { CN: '是否删除该配置?', EN: 'Whether to delete the Config?' },
        统一通知导入: { CN: '统一通知导入', EN: 'Notify Import' },
        上传: { CN: '上传', EN: 'upload' },
        下载: { CN: '下载', EN: 'download' },
        导入方式: { CN: '导入方式', EN: 'Import Mode' },
        HalfCoverDetail: {
            CN: '半覆盖 : 在原有基础上修改新增',
            EN: 'Half-cover: modified and added on the original basis'
        },
        半覆盖: { CN: '半覆盖', EN: 'Half-cover' },
        不覆盖: { CN: '不覆盖', EN: 'NoCover' },
        NoCoverDetail: {
            CN: '不覆盖 : 不影响原有基础进行新增',
            EN: 'Not overwritten: The original foundation is not affected to be added'
        },
        全覆盖: { CN: '全覆盖', EN: 'Full coverage' },
        FullCoverDetail: {
            CN: '全覆盖 : 清空原有模板并保存新的模板',
            EN: 'Full coverage: deletes the original template and saves the new one'
        },
        导入成功: { CN: '导入成功', EN: 'Import Success' },
        导入失败: { CN: '导入失败', EN: 'Import Error' },
        发送类型管理: { CN: '发送类型管理', EN: 'Send Type Manage' },
        请输入关键字: { CN: '请输入关键字', EN: 'Please Input Keywords' },
        请输入名称: { CN: '请输入名称', EN: 'Please Input Name' },
        请输入编码: { CN: '请输入编码', EN: 'Please Input Code' },
        请输入标题: { CN: '请输入标题', EN: 'Please Input Title' },
        请输入内容: { CN: '请输入内容', EN: 'Please Input Content' },
        请输入参数JSON: { CN: '请输入参数JSON', EN: 'Please Input Param JSON' },
        内容: { CN: '内容', EN: 'Content' },
        参数: { CN: '参数JSON', EN: 'Param JSON' },
        searchTips: { CN: '请输入名称、编码', EN: 'Please Input Name、Code' },
        参数需要为JSON格式: { CN: '参数需要为JSON格式', EN: 'Params Is Not JSON' },
        请按格式填写模板: {
            CN: '请按格式填写模板，若没有模板请先下载',
            EN: 'Please fill in the template in the format. If there is no template, please download it first'
        },
        exportTips: { CN: '请先勾选需要导出的模板', EN: 'Please check the template to export first' }
    };

    return {
        i18n: languageObj
    };
});
