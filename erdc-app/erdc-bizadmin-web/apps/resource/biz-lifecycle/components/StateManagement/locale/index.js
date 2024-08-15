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
        '确定': { CN: '确定', EN: 'Confirm' },
        '取消': { CN: '取消', EN: 'Cancel' },
        '状态管理': { CN: '状态管理', EN: 'State management' },
        '请输入内部名称或名称关键字': { CN: '请输入内部名称或名称关键字', EN: 'Please enter an internal name or name keyword' },
        '创建': { CN: '创建', EN: 'Create' },
        '导入': { CN: '导入', EN: 'Import' },
        '导出': { CN: '导出', EN: 'Export' },
        '已启用': { CN: '已启用', EN: 'Enabled' },
        '已停用': { CN: '已停用', EN: 'Disabled' },
        '编辑': { CN: '编辑', EN: 'Edit' },
        '启用': { CN: '启用', EN: 'Enable' },
        '停用': { CN: '停用', EN: 'Disable' },

        '内部名称': { CN: '内部名称', EN: 'Name' },
        '名称': { CN: '名称', EN: 'Display name' },
        '描述': { CN: '描述', EN: 'Description' },
        '应用': { CN: '应用', EN: 'Application' },
        '状态': { CN: '状态', EN: 'State' },
        '操作': { CN: '操作', EN: 'Operation' },
        '获取head失败': { CN: '获取head失败', EN: 'Failed to get a head' },
        '获取列表失败': { CN: '获取列表失败', EN: 'Failed to get the list' },
        '创建状态': { CN: '创建状态', EN: 'Create State' },
        '编辑状态': { CN: '编辑状态', EN: 'Edit state' },
        '停用成功': { CN: '停用成功', EN: 'Stop success' },
        '启用成功': { CN: '启用成功', EN: 'To enable successful' },
        '停用失败': { CN: '停用失败', EN: 'Stop using failure' },
        '启用失败': { CN: '启用失败', EN: 'Enable the failure' },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
    }

    return {
        i18n: languageObj
    }
})
