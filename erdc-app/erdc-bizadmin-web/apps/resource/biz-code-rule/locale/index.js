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
        'editSpecification': { CN: '编辑变量说明', EN: 'Edit variable specification' },
        'setCharacter': { CN: '设置流水码字符集', EN: 'Set the pipeline character set' },
        'sequenceCharsTips': { CN: '当流水码递增规则为最大位递增规则和最小位递增规则时，流水码字符集必须是数字和字母的集合且包含全部数字', EN: 'When the flow code increment rule is maximum bit increment rule and minimum bit increment rule, the flow code character set must be a set of numbers and letters and contain all numbers.' },
        'inputTips': { CN: '请输入大小写字母、数字、"_"、"."、"-"', EN: 'Please enter upper and lower case letters, numbers, "_", ".", "-"' },
        'number': { CN: '数字', EN: 'number' },
        'capitalLetter': { CN: '大写字母', EN: 'Capital letter' },
        'lowercaseLetter': { CN: '小写字母', EN: 'Lowercase letter' },
        'support': { CN: '支持', EN: 'Support' },
        'exclude': { CN: '排除', EN: 'Exclude' },
        'inputFlowCode': { CN: '请填写流水码', EN: 'Please fill in the flow code' },
        'enterInterfaceAddress': { CN: '请输入接口地址', EN: 'Please enter the interface address' },
        'customConfigTips': { CN: '变量说明中不允许数组', EN: 'Arrays are not allowed in variable declarations' },
        'JSONFormatTips': { CN: '请输入正确格式的JSON数据', EN: 'Please enter the JSON data in the correct format' },
        'setPipelining': { CN: '设置流水码', EN: 'Set pipelining' },
        'editCodeRule': { CN: '编辑编码规则', EN: 'Edit coding rule' },
        'createCodeRules': { CN: '创建编码规则', EN: 'Create coding rules' },
        'codeRuleManagement': { CN: '编码规则管理', EN: 'Coding rule management' },
        'enterNameOrCode': { CN: '请输入名称或编码', EN: 'Please enter a name or code' },
        'currentSequenceChars': { CN: '当前流水码', EN: 'Current pipeline code' },
        'sequenceChars': { CN: '流水码', EN: 'Sequence chars' },
        'editSuccessfully': { CN: '编辑成功', EN: 'Edit successfully' },
        'createSuccessfully': { CN: '创建成功', EN: 'Create successfully' },
        'deleteSequenceChars': { CN: '确认删除流水码', EN: 'Confirm to delete pipeline code' },
        'confirmDeletion': { CN: '确认删除', EN: 'Confirm deletion' },
        'sequenceCharsSetSuccessfully': { CN: '流水码设置成功', EN: 'The pipeline code is set successfully' },
        'rule': { CN: '规则', EN: 'Rule' },
        'config': { CN: '配置', EN: 'Config' },
        'variableConversionConfig': { CN: '变量转换配置', EN: 'Variable conversion configuration' },
        'variableConversion': { CN: '变量转换', EN: 'Variable conversion' },
        'date': { CN: '日期', EN: 'Date' },
        'constant': { CN: '常量', EN: 'Constant' },
        'sequenceCode': { CN: '序列码', EN: 'Sequence code' },
        'variable': { CN: '变量', EN: 'Variable' },
        'dpreviewate': { CN: '预览', EN: 'Preview' },
        'noCariablesConfig': { CN: '没有变量可配置', EN: 'There are no variables to configure' },
        'scene': { CN: '场景', EN: 'Scene' },
        'sceneTips': { CN: '如果调用方的数据为编码，生成编码的时候想转为对应的中文或者任何对应的值', EN: "If the caller's data is encoded, the encoding is generated to convert to the corresponding Chinese or any corresponding value." },
        'simpleMapping': { CN: '简单映射', EN: "Simple mapping" },
        'scripting': { CN: '脚本(javascript)', EN: "Scripting (javascript)" },
        'optionalVariable': { CN: '可选变量（*标识改变量已配置）', EN: "Optional variable (* indicates that the change is configured)" },
        'mappingRelationship': { CN: '映射关系', EN: "Mapping relationship" },
        'configureVariableConversion': { CN: '请配置正确的变量转换', EN: "Configure the correct variable conversion" },
        'confirmChange': { CN: '确认修改', EN: 'confirm the change' },
        'clickView': { CN: '点击查看', EN: 'Click to view' },
        'detailsHelp': { CN: '详情帮助', EN: 'Details help' },
        'variableConversionHelp': { CN: '变量转换帮助', EN: 'Variable conversion help' },
        'textTips': { CN: '任意字符,不包括双引号(");并且不能有汉字', EN: 'Any character, excluding double quotation marks ("); And no Chinese characters' },
        'yyyy': { CN: '年', EN: 'Year' },
        'yy': { CN: '年(末尾两位)', EN: 'Year (last two digits)' },
        'MM': { CN: '月', EN: 'Month' },
        'M': { CN: '月(1-9，A，B，C)', EN: 'Month(1-9,A,B,C)' },
        'dd': { CN: '日', EN: 'data' },
        'HH': { CN: '时', EN: 'hour' },
        'variableTips1': { CN: '只能是 字母、数字或下划线的任意组合，中间用.隔开', EN: 'The value can be any combination of letters, digits, or underscores. partition' },
        'variableTips2': { CN: '第一个字符不能是数字,不能包含汉字', EN: 'The first character cannot be a number or contain Chinese characters' },
        'example': { CN: '例子', EN: 'Example' },
        'text': { CN: '文本', EN: 'Text' },
        'character': { CN: '字符集', EN: 'Character' },
        'characterTips': { CN: '字符类型至少选中一项', EN: 'Character Type At least one item is selected' },
        'serialPolicyCodesTips': { CN: '当流水码递增规则为最大位递增规则和最小位递增规则时，流水码字符集必须是数字和字母的集合且包含全部数字', EN: 'When the flow code increment rule is maximum bit increment rule and minimum bit increment rule, the flow code character set must be a set of numbers and letters and contain all numbers.' },
        'selectPipelinedRule': { CN: '请选择流水码规则', EN: 'Please select a pipelined rule' },
        'codeRequired': { CN: '流水码必填', EN: 'The flow code is required' },
        'codeRule': { CN: '编码规则', EN: 'Code rule' },
        'codeRuleTips': { CN: '请点击每个编码段选择后提交生成编码', EN: 'Please click on each encoding segment to select and then submit the generated encoding' },
        'enterFeatureCode': { CN: '请输入特征码', EN: 'Please enter the feature code' },
        'createFeatureCode': { CN: '创建特征码', EN: 'Create feature code' },
        'featureCode': { CN: '特征码', EN: 'Feature code' },
        'featureCodeTips': { CN: '特征码为带入变量后的编码规则，统一编码规则由于不同的变量值可能有多个特征码。#SN# Serial Number 流水码', EN: 'The feature code is the coding rule after the variable is brought in. The unified coding rule may have multiple feature codes due to different variable values. #SN# Serial Number Process code' },
        'sequenceCharsCanInputTips': { CN: '流水码允许输入 {Tips} 字符集', EN: 'Pipeliner allows {Tips} character set' },
        'createTime': { CN: '创建时间', EN: 'Create time' },
        'editTime': { CN: '编辑时间', EN: 'Edit time' },
        'deleteCodeRule': { CN: '确认删除编码规则', EN: 'Confirm to delete the encoding rule' },
    }

    return {
        i18n: languageObj
    }
})
