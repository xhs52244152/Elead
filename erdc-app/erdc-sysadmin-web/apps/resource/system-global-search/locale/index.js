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
        globalSearchModel: { CN: '全局搜索模型', EN: 'Global search model' },
        globalSearchModelTip: {
            CN: '全局搜索模型配置结果即用户在全局搜索框下拉可选的模型。',
            EN: 'The result of the global search model configuration is that the user drops down the optional model in the global search box.'
        },
        optionalModel: { CN: '可选模型', EN: 'Optional model' },
        globalSearchView: { CN: '全局搜索视图', EN: 'Global search View' },
        globalSearchViewTip1: {
            CN: '在全局搜索时，系统查询用户所选类型在此处关联的视图表格中的默认视图的数据，',
            EN: 'During a global search, the system queries data for the default view of the type selected by the user in the view table associated here'
        },
        globalSearchViewTip2: {
            CN: '当用户选择查询的类型有子类型时，同步卷积查询子类型关联的视图表格。',
            EN: 'When the user selects that the type of the query has a subtype, the view table associated with the convolution query subtype is synchronized'
        },
        notFoundView: { CN: '未找到视图表格，去', EN: 'View table not found, go' },
        createViewTable: { CN: '创建视图表格', EN: 'Create a view table' },
        deleteLeafTip: {
            CN: '删除此类型同步解除关联的全局搜索的视图，是否继续？',
            EN: 'Delete the view of a global search disassociated with this type of synchronization, do you want to continue?'
        },
        deleteParentTip: {
            CN: '删除此类型会同时移除所有子类，并取消关联他们已关联的视图，是否继续删除？',
            EN: 'Deleting this type removes all subclasses at the same time and disassociates their associated views. Do you want to continue deleting?'
        },
        dragToAdjustOrder: { CN: '拖动调整顺序', EN: 'Drag to adjust order' },
        noModelTip: { CN: '请至少选择一个模型', EN: 'Please select at least one model' },
        unassociatedView: { CN: '未关联视图', EN: 'Unassociated view' }
    };

    return {
        i18n: languageObj
    };
});
