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
        createSuccess: { CN: '创建成功', EN: 'create success' }, 
        updateSuccess: { CN: '更新成功', EN: 'update success' }, 
        saveSuccess: { CN: '保存成功', EN: 'save Success' }, 
        confirm: { CN: '确定', EN: 'Confirm' }, 
        delete: { CN: '删除', EN: 'Delete' }, 
        setSuccess: { CN: '设置成功', EN: 'set success' }, 
        checkData: { CN: '请勾选数据', EN: 'Please check the data box'},
        baselineComparison: { CN: '基线对比', EN: 'Baseline comparison' },
        pleaseDelData: { CN: '请选择要删除的数据!', EN: 'Please select the data to be deleted!' }, 
        removeTip: { CN: '您确认要移除吗', EN: 'Are you sure you want to remove it' }, 
        addComparisonObject: { CN: '增加比较对象', EN: 'Add Comparison Object' },
        baseline: { CN: '基线', EN: 'baseline' },
        status: { CN: '状态', EN: 'status' },
        upToThree: { CN: '请不要超过基线对比上限，基线对比上限条数为3！', EN: 'Check up to 3 data items at a time' },
        addObjectSuccess: { CN: '增加对象成功', EN: 'Adding object succeeded' },
    }; 
 
    return { i18n: languageObj }; 
}); 
