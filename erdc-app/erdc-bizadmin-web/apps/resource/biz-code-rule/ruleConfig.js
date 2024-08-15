define([], () => {
    const FamKit = require('fam:kit');
    /**
     * 常量 CONSTANT
     * 变量 VARIABLE
     * 时间格式 DATE
     * 序列码 SERIAL_NUM
     */
    const ruleConfigItem = {
        CONSTANT: {
            id: 'CONSTANT',
            filed: 'CONSTANT',
            value: '',
            key: 'CONSTANT',
            name: FamKit.translateI18n({
                zh_cn: '文本',
                en_us: 'Text'
            }),
            placeholder: FamKit.translateI18n({
                zh_cn: '任意字符,不包括双引号(");并且不能有汉字',
                en_us: 'Any character, excluding double quotation marks ("); And no Chinese characters'
            }),
            color: '#EFFDF4',
            borderColor: '#ADF1C7'
        },
        DATE: {
            id: 'DATE',
            filed: 'DATE',
            value: '',
            key: 'DATE',
            name: FamKit.translateI18n({
                zh_cn: '日期',
                en_us: 'Date'
            }),
            color: '#E6F7FF',
            borderColor: '#91D5FF',
            placeholder: FamKit.translateI18n({
                zh_cn: '请选择日期',
                en_us: 'Please select a date'
            }),
            options: [
                {
                    id: '1',
                    label: FamKit.translateI18n({
                        zh_cn: '年',
                        en_us: 'year'
                    }),
                    children: [
                        {
                            key: 'yyyy',
                            value: 'yyyy',
                            label: 'yyyy'
                        },
                        {
                            key: 'yy',
                            value: 'yy',
                            label: 'yy'
                        }
                    ]
                },
                {
                    id: '2',
                    label: FamKit.translateI18n({
                        zh_cn: '年月',
                        en_us: 'Month, Years'
                    }),
                    children: [
                        {
                            key: 'yyyyMM',
                            value: 'yyyyMM',
                            label: 'yyyyMM'
                        },
                        {
                            key: 'yyyyM',
                            value: 'yyyyM',
                            label: 'yyyyM'
                        },
                        {
                            key: 'yyMM',
                            value: 'yyMM',
                            label: 'yyMM'
                        },
                        {
                            key: 'yyM',
                            value: 'yyM',
                            label: 'yyM'
                        }
                    ]
                },
                {
                    id: '3',
                    label: FamKit.translateI18n({
                        zh_cn: '年月日',
                        en_us: 'date, Year month'
                    }),
                    children: [
                        {
                            key: 'yyyyMMdd',
                            value: 'yyyyMMdd',
                            label: 'yyyyMMdd'
                        },
                        {
                            key: 'yyyyMdd',
                            value: 'yyyyMdd',
                            label: 'yyyyMdd'
                        },
                        {
                            key: 'yyMMdd',
                            value: 'yyMMdd',
                            label: 'yyMMdd'
                        },
                        {
                            key: 'yyMdd',
                            value: 'yyMdd',
                            label: 'yyMdd'
                        }
                    ]
                },
                {
                    id: '4',
                    label: FamKit.translateI18n({
                        zh_cn: '年月日时',
                        en_us: 'Year, month and day'
                    }),
                    children: [
                        {
                            key: 'yyyyMMddHH',
                            value: 'yyyyMMddHH',
                            label: 'yyyyMMddHH'
                        }
                    ]
                }
            ]
        },
        VARIABLE: {
            id: 'VARIABLE',
            filed: 'VARIABLE',
            value: '',
            key: 'VARIABLE',
            name: FamKit.translateI18n({
                zh_cn: '变量',
                en_us: 'Variable'
            }),
            placeholder: FamKit.translateI18n({
                zh_cn: '请选择变量',
                en_us: 'Please select a variable'
            }),
            color: '#FFF2E8',
            borderColor: '#FFBB96'
        },
        SERIAL_NUM: {
            id: 'SERIAL_NUM',
            filed: 'SERIAL_NUM',
            value: '',
            key: 'SERIAL_NUM',
            name: FamKit.translateI18n({
                zh_cn: '流水码',
                en_us: 'Pipeline code'
            }),
            placeholder: FamKit.translateI18n({
                zh_cn: '请输入流水码（用n表示）',
                en_us: 'Please enter the pipeline code (represented by n)'
            }),
            color: '#ECECEC',
            borderColor: '#D9D9D9'
        }
    };
    /**
     *
     * @param { Array } arr 需要的规则配置
     * @returns
     */
    const rules = function (arr = ['CONSTANT', 'DATE', 'VARIABLE']) {
        return arr.map((item) => {
            return ruleConfigItem[item];
        });
    };

    const ruleConfigArr = function (rules = [], featureScript = {}) {
        return rules.map((item) => {
            const featureScriptKeys = Object.keys(featureScript);
            let obj = {
                ...ruleConfigItem[item.type],
                value: item.value || ''
            };
            if (featureScriptKeys.includes(item.value)) {
                obj.featureScript = featureScript[item.value];
            }
            return obj;
        });
    };

    return {
        rules,
        ruleConfigArr
    };
});
