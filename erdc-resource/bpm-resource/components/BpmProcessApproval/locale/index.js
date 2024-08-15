define([], function () {
    const languageObj = {
        'routing': { CN: '路由选择', EN: 'Routing' },
        'opinions': { CN: '处理意见', EN: 'Opinions' },
        'pleaseFillInOpinions': { CN: '请填写处理意见后提交', EN: 'Please fill in the handling opinion and submit it' },
        'inform': { CN: '知会', EN: 'Inform' },
        'handlerConfig': { CN: '临时处理人配置', EN: 'Handler configuration' },
        'addHandler': { CN: '加签', EN: 'Add handler' },
        'subHandler': { CN: '减签', EN: 'Reduce handler' },
        'skipNode': { CN: '跳至节点', EN: 'Skip node' },
        'skipNodeHandler': { CN: '跳至节点审批人', EN: 'Skip node handler' },
        'prompt': { CN: '提示', EN: 'Prompt' },
        'pleaseSelectAddHandler': { CN: '请选择加签人员', EN: 'Please select new processing personnel' },
        'pleaseSelectSubHandler': { CN: '请选择减签人员', EN: 'Please select to reduce processing personnel' },
        'addHandlerConfirm': { CN: '此操作将增加选中处理人, 是否继续?', EN: 'This operation will add the selected handler. Do you want to continue?' },
        'subHandlerConfirm': { CN: '此操作将移除选中处理人, 是否继续?', EN: 'This operation will remove the selected handler. Do you want to continue?' }
    }

    return {
        i18n: languageObj
    }
})
