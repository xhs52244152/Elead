/**
 * i18n国际化文件
 * **/
define([], function () {
    const languageObj = {
        globalSearch: { CN: '全局搜索', EN: 'Global search' },
        foundCount: { CN: '总共为你找到{records}个结果', EN: 'A total of {records} results were found for you' },
        conditionName: { CN: '条件名称', EN: 'Condition name' },
        saveConditions: { CN: '保存条件', EN: 'Save conditions' },
        inputSearchTip: {
            CN: '请输入编码、名称、描述的关键字进行搜索',
            EN: 'Please enter the keywords of code, name and description to search'
        },
        deleteTip: { CN: '删除该数据后，不可恢复！', EN: 'After deleting the data, it cannot be recovered!' },
        historicalFilters: { CN: '历史筛选', EN: 'Historical filters' },
        advancedFilter: { CN: '高级筛选条件', EN: 'Advanced filter criteria' },
        filterTip: { CN: '请输入高级筛选名称', EN: 'Please enter an advanced filter name' },
        filterExceedTip: { CN: '高级筛选名称不能超过100个字符', EN: 'Advanced filter name cannot exceed 100 characters' },
        addFilterTip: {
            CN: '暂无任何历史筛选记录，设置筛选条件后可保存添加历史筛选，点击历史筛选条件可将保存的筛选条件快速填充到高级筛选条件',
            EN: 'There are no historical filter records for the time being. After setting the filter criteria, you can save and add the history filter. Click the history filter condition to quickly populate the saved filter condition to the advanced filter condition.'
        },

    };

    return {
        i18n: languageObj
    };
});
