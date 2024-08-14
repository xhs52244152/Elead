define(['erdcloud.i18n'], function (i18n) {
    const languageObj = {
        objectRef: {
            CN: '所属任务',
            EN: 'Belonging task'
        },
        code: {
            CN: '编码',
            EN: 'Code'
        },
        name: {
            CN: '名称',
            EN: 'Name'
        },
        state: {
            CN: '状态',
            EN: 'State'
        },
        businessObject: {
            CN: '业务对象',
            EN: 'Business object'
        },
        conclution: {
            CN: '请选择结论并填入描述！',
            EN: 'Please select a conclusion and fill the description!'
        },
        businessForm: {
            CN: '业务表单',
            EN: 'Business Forms'
        },
        notAllowed: {
            CN: '数据初始化未完成，不允许提交',
            EN: 'Data initialization incomplete, submission not allowed'
        },
        budgetInformation: {
            CN: '预算信息',
            EN: 'Budget Information'
        },
        budgetInfoDelNotEmpty: {
            CN: '您选择的预算数据可能已全部被删除，请确认！',
            EN: 'The budget data you have selected may have been completely deleted, please confirm!'
        },
        budgetInfoNotEmpty: {
            CN: '预算信息不能为空！',
            EN: 'Budget information cannot be empty!'
        },
        addSubjectTree: {
            CN: '添加科目树',
            EN: 'Add subject tree'
        },
        yes: {
            CN: '是',
            EN: 'Yes'
        },
        no: {
            CN: '否',
            EN: 'No'
        },
        confirm: {
            CN: '确定',
            EN: 'Confirm'
        },
        cancel: {
            CN: '取消',
            EN: 'Cancel'
        },
        bpmIncrease: {
            CN: '添加',
            EN: 'Add'
        },
        bpmRemove: {
            CN: '移除',
            EN: 'Remove'
        },
        removalSuccess: {
            CN: '移除成功',
            EN: 'Removal successful'
        },
        unableToAddFolder: {
            CN: '不能添加文件夹',
            EN: 'Unable to add folder'
        },
        uniquenessVerificationFailed: {
            CN: '唯一性校验失败',
            EN: 'Uniqueness verification failed'
        },
        operation: {
            CN: '操作',
            EN: 'Operation'
        },
        preview: {
            CN: '预览',
            EN: 'Preview'
        },
        download: {
            CN: '下载',
            EN: 'Download'
        },
        addDocument: {
            CN: '增加文档',
            EN: 'Add document'
        },
        deliveryInfo: {
            CN: '交付件信息',
            EN: 'Delivery info'
        },
        processTips: {
            CN: '业务表单数据不能为空',
            EN: 'Business form data cannot be empty'
        },
        documentList: {
            CN: '文档列表',
            EN: 'document list'
        },
        checkTips: {
            CN: '存在已检出的文档，无法添加',
            EN: 'There are documents that have been checked out and cannot be added'
        },
        existsTips: {
            CN: '[{identifierNos}]已存在，请勿重复添加',
            EN: '[{identifierNos}] already exists, please do not add it again'
        },
        workTips: {
            CN: '存在状态为非正在工作的文档，无法添加',
            EN: 'There is a document in a non working status that cannot be added'
        },
        businessFormTips: {
            CN: '业务表单不合法',
            EN: 'The business form is illegal'
        }
    };

    return { i18n: languageObj, i18nMappingObj: i18n.wrap({ i18n: languageObj }) };
});
