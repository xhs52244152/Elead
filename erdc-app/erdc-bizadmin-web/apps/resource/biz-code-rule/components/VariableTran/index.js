define([
    'text!' + ELMP.resource('biz-code-rule/components/VariableTran/index.html'),
    'css!' + ELMP.resource('biz-code-rule/components/VariableTran/style.css')
], (template) => {
    return {
        name: 'VariableTran',
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                mapValue: '1|苹果' + '\n' + '2|橘子',
                javascriptValue:
                    '// value variable is fixed' +
                    '\n' +
                    "if(value == '1'){" +
                    '\n' +
                    "return '苹果';" +
                    '\n' +
                    "}else if(value == '2'){'" +
                    '\n' +
                    "return '橘子';" +
                    '\n' +
                    '}'
            };
        }
    };
});
