define([], function () {
    const languageObj = {
        confirm: {
            CN: '确定',
            EN: 'Confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'Cancel'
        },
        deleteAll: {
            CN: '全部删除',
            EN: 'Delete all'
        },
        searchTips: {
            CN: '请输入搜索内容',
            EN: 'Please enter search content'
        },
        association: {
            CN: '关联对象',
            EN: 'Association'
        },
        operate: {
            CN: '操作',
            EN: 'operate'
        },
        NullPrompt: {
            CN: '请选择对象',
            EN: 'Please select an object'
        },
        loading: { CN: '正在加载中，请稍候...', EN: 'Loading...' },
        loadMore: { CN: '加载更多...', EN: 'Load More' },
        loadCompleted: { CN: '没有更多数据', EN: 'No more data' }
    };

    return { i18n: languageObj };
});
