/**
 * i18n国际化文件
 * **/
define([], function() {
    /**
     * 国际化key建议 短文本统一用中文作为key  长文本用英文作key utf-8 编码 作用方便页面引入与维护
     * 书写规则 扩展后面追加对应语言key
     * key --> {CN:'',EN:'' ,'more-lan':''}
     * **/

    // 配置国际化key-value
    const languageObj = {
        goBack: { CN: '返回', EN: 'Go back' },
        flowChart: {CN: '流程图', EN: 'Flow chart'},
        flowDiagram: {CN: '流程图解', EN: 'Flow diagram'},
        saveDraft: { CN: '存为草稿', EN: 'Save as draft' },
        basicInfo: { CN: '基本信息', EN: 'Basic Infos' },
        businessObject: { CN: '业务对象', EN: 'Business Object' },
        approverConfiguration: { CN: '处理人配置', EN: 'Appointment Approver' },
        informantConfiguration: { CN: '知会人配置', EN: 'Informant configuration' },
        attachment: { CN: '附件', EN: 'Attachment' },
        uploadAttachment: { CN: '上传附件', EN: 'Upload Attachment(s)' },
        launcherSuccess: { CN: '流程发起成功', EN: 'Process initiation successful' },
        launcherFail: { CN: '流程发起失败', EN: 'Process initiation failed' },
        draftSaveSuccess: { CN: '流程草稿保存成功', EN: 'Process draft saved successfully' },
        draftSaveFail: { CN: '流程草稿保存失败', EN: 'Process draft saving failed' },
        pleaseEnterProcessName: { CN: '请输入流程名称', EN: 'Please enter in the process name' },
        inform: { CN: '知会', EN: 'Inform' }
    }

    return {
        i18n: languageObj
    }
})
