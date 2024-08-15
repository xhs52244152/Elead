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
        请输入: { CN: '请输入', EN: 'Place Enter' },
        名称: { CN: '名称', EN: 'Name' },
        内部名称: { CN: '内部名称', EN: 'Inner Name' },
        显示名称: { CN: '显示名称', EN: 'Show Name' },
        描述: { CN: '描述', EN: 'Description' },
        模板来源: { CN: '模板来源', EN: 'Template Source' },
        布局类型: { CN: '布局类型', EN: 'Layout Type' },
        状态: { CN: '状态', EN: 'Status' },
        操作: { CN: '操作', EN: 'operation' },
        删除: { CN: '删除', EN: 'Delete' },
        编辑: { CN: '编辑', EN: 'Edit' },
        停用: { CN: '停用', EN: 'Disable' },
        启用: { CN: '启用', EN: 'Enabled' },
        创建: { CN: '创建', EN: 'Create' },
        更多: { CN: '更多', EN: 'More' },
        确定: { CN: '确定', EN: 'Confirm' },
        清空条件: { CN: '清空条件', EN: 'Clear Conditions' },
        取消: { CN: '取消', EN: 'Cancel' },
        配置规则: { CN: '配置规则', EN: 'Configuration Rule' },
        配置成功: { CN: '配置成功', EN: 'Configuration Rule Success' },
        上移: { CN: '上移', EN: 'Move up' },
        下移: { CN: '下移', EN: 'Move down' },
        确认删除: { CN: '确认删除', EN: 'Confirm remove' },
        删除成功: { CN: '删除成功', EN: 'Remove Successfully' },
        删除失败: { CN: '删除失败', EN: 'Remove failure' },
        更新成功: { CN: '更新成功', EN: 'Update successfully' },
        新增成功: { CN: '新增成功', EN: 'Add success' },
        拷贝到本类型: { CN: '拷贝到本类型', EN: 'Copy to this type' },
        确认拷贝: { CN: '确认拷贝', EN: 'Confirm Copy' },
        拷贝布局: { CN: '确认拷贝该布局？', EN: 'Confirm The Copy Of This Layout?' },
        nonCurrentTenant: { CN: '非当前租户数据禁止操作', EN: 'Non-current tenant data cannot be performed' },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
        inheritLayout: { CN: '继承布局', EN: 'Inherit Layout' },
        customLayout: { CN: '自定义布局', EN: 'Custom Layout' },
        exportChild: { CN: '导出子类', EN: 'Export child'},
        exportSelf: { CN: '导出本类', EN: 'Export oneself class'}
    };

    return {
        i18n: languageObj
    };
});
