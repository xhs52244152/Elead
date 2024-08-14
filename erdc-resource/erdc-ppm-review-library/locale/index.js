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
        confirm: {
            CN: '发布',
            EN: 'confirm'
        },
        edit: {
            CN: '编辑',
            EN: 'edit'
        },
        saveDraft: {
            CN: '保存草稿',
            EN: 'save draft'
        },
        // 此处的Draft是为了做国际化处理，语言为英文下，接口状态返回Draft
        Draft: {
            CN: '草稿',
            EN: 'Draft'
        },
        draftStatusNotEdited: {
            CN: '草稿状态不能批量编辑',
            EN: 'Draft status cannot be batch edited'
        },
        cancel: {
            CN: '取消',
            EN: 'cancel'
        },
        featureLibrary: {
            CN: '要素库',
            EN: 'Feature Library'
        },
        tip: {
            CN: '提示',
            EN: 'tip'
        },
        success: {
            CN: '成功',
            EN: 'success'
        },
        createdSuccessfully: {
            CN: '创建成功',
            EN: 'Created successfully'
        },
        editSuccessfully: {
            CN: '编辑成功',
            EN: 'Edit successfully'
        },
        viewReviewElements: {
            CN: '查看评审要素',
            EN: 'View Review Elements'
        },
        editReviewElements: {
            CN: '编辑评审要素',
            EN: 'Edit Review Elements'
        },
        createReviewElements: {
            CN: '创建评审要素',
            EN: 'Create Review Elements'
        },
        pleaseSelectData: {
            CN: '请选择数据',
            EN: 'Please select the data'
        },
        confirmDelete: {
            CN: '确认删除该数据？',
            EN: 'Are you sure to delete this data?'
        },
        deleteTip: {
            CN: '确认删除',
            EN: 'confirm delete'
        }
    };

    return { i18n: languageObj };
});
