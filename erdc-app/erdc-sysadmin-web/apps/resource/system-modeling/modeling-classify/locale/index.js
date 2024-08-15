define([], function() {
    const languageObj = {
        displayName: { CN: '显示名称', EN: 'Display Name' },
        internalName: { CN: '内部名称', EN: 'Internal name' },
        code: { CN: '编码', EN: 'Code' },
        definingInformation: { CN: '定义信息', EN: 'Defining Information' },
        basicInformation: { CN: '基本信息', EN: 'Basic information' },
        classifyDefinition: { CN: '分类定义', EN: 'Classify definition' },
        pleaseEnterKeywords: { CN: '请输入关键字', EN: 'Please enter keywords' },
        createClassify: { CN: '创建分类', EN: 'Create Classify' },
        editClassify: { CN: '编辑分类', EN: 'Edit Classify' },
        codeTip: { CN: '定义编码规则时, 该分类为编码规则变量所对应的变量值', EN: 'When an encoding rule is defined, the classification is the value of the variable corresponding to the coding rule variable.' },
    };

    return {
        i18n: languageObj
    };
});
