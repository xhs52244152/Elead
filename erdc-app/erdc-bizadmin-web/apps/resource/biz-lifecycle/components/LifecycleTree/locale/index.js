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
        '请输入': { CN: '请输入', EN: 'Please enter' },
        '更新成功': { CN: '更新成功', EN: 'Update successful' },
        '新增成功': { CN: '新增成功', EN: 'Create successful' },
        '更新失败': { CN: '更新失败', EN: 'Update failed' },
        '新增失败': { CN: '新增失败', EN: 'Create failure' },
        '生命周期': { CN: '生命周期', EN: 'Lifecycle' },
        '更多操作': { CN: '更多操作', EN: 'More actions' },
        '导入': { CN: '导入', EN: 'Import' },
        '导出': { CN: '导出', EN: 'Export' },
        '状态管理': { CN: '状态管理', EN: 'State-management' },
        exporting: {
            CN: '系统正在导出，请到<a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">工作台-操作记录-我的导出页面</a>查看',
            EN: 'The system is exporting, check on the <a href="/erdc-app/erdc-portal-web/index.html#/biz-import-export/myImportExport?activeTabName=taskTabPanelExport" target="erdc-portal-web">workbench > Operation Record</a> page.'
        },
    }

    return {
        i18n: languageObj
    }
})
