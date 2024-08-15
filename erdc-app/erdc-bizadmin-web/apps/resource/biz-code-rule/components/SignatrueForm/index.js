define([
    'text!' + ELMP.resource('biz-code-rule/components/SignatrueForm/index.html'),
    ELMP.resource('biz-code-rule/ruleConfig.js'),
    'css!' + ELMP.resource('biz-code-rule/components/SignatrueForm/style.css')
], (template, ruleConfig) => {

    return {
        name: 'SignatrueForm',
        template,
        props: {
            codeRuleData: {
                type: Object,
                default() {
                    return {};
                }
            },
            /**
             * featureCode 特征码
             * code 编码
             */
            type: {
                type: String,
                default: 'featureCode'
            },
            codeRuleDefault: {
                type: Object,
                default() {
                    return null;
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                propsData: {
                    children: 'children',
                    label: 'name',
                    value: 'value'
                },
                codeRuleTable: [],
                featureCode: ''
            };
        },
        watch: {},
        computed: {
            sequenceChars() {
                return this.codeRuleData.sequenceChars;
            },
            ruleId() {
                return this.codeRuleData.oid;
            },
            serialCode() {
                return this.codeRuleTable.find(item => {
                    return item.key === 'SERIAL_NUM'
                })?.valueCode
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.codeRuleTable = ruleConfig.ruleConfigArr(this.codeRuleData?.patternDesc);
                this.codeRuleTable.forEach((item) => {
                    if (item.key === 'VARIABLE') {
                        this.$set(item, 'valueCode', '');
                        if (this.codeRuleDefault) {
                            this.$set(item, 'valueCode', this.codeRuleDefault?.[item.value] || '');
                            this.getCode(item);
                        }
                        this.getTreeData(item);
                    } else if (item.key === 'SERIAL_NUM') {
                        const value = item.value.split('');
                        const displayName =
                            this.type === 'code'
                                ? value.join('')
                                : value
                                      .map((ite, index) => {
                                          if (index === value.length - 1) {
                                              return 1;
                                          }
                                          return 0;
                                      })
                                      .join('');
                        this.$set(item, 'valueCode', displayName);
                    } else {
                        this.$set(item, 'valueCode', item.value);
                    }
                    this.featureCodeFn();
                });
            },
            style(color) {
                return `background-color: ${color}`;
            },
            getTreeData(item) {
                if (!this.ruleId) {
                    return;
                }
                this.$famHttp({
                    url: '/fam/code/getValueList',
                    data: {
                        ruleId: this.ruleId,
                        varName: item?.value || ''
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.$set(item, 'treeData', data);
                    if (Array.isArray(data) && !data.length) {
                        this.$set(item, 'treeData', null);
                    }
                });
            },
            fillDate(time) {
                const date = new Date();
                let yyyy = date.getFullYear(); // 年
                let yy = yyyy.toString().split('').slice(2).join('');
                let M = this.getM(date.getMonth() + 1); // 月
                let MM = this.fillTime(M); // 月
                let dd = this.fillTime(date.getDate()); // 日
                let HH = this.fillTime(date.getHours()); // 时

                const dateMap = {
                    yyyy,
                    yy,
                    yyyyMM: `${yyyy}${MM}`,
                    yyyyM: `${yyyy}${M}`,
                    yyMM: `${yy}${MM}`,
                    yyM: `${yy}${M}`,
                    yyyyMMdd: `${yyyy}${MM}${dd}`,
                    yyyyMdd: `${yyyy}${M}${dd}`,
                    yyMMdd: `${yy}${MM}${dd}`,
                    yyMdd: `${yy}${M}${dd}`,
                    yyyyMMddHH: `${yyyy}${MM}${dd}${HH}`
                };

                return dateMap[time] || '_ _ _ _';
            },
            fillTime(number) {
                if (Number(number) < 10) {
                    return '0' + number;
                }
                return number;
            },
            getM(M) {
                if (Number(M) < 10) {
                    return M;
                }
                const mMap = {
                    10: 'A',
                    11: 'B',
                    12: 'C'
                };
                return mMap[Number(M)];
            },
            getCode(item) {
                this.$famHttp({
                    url: '/fam/code/getCodeByValue',
                    data: {
                        ruleId: this.ruleId,
                        varName: item.value,
                        value: item.valueCode
                    }
                })
                    .then((resp) => {
                        const { data } = resp;
                        this.$set(item, 'featureCodeValue', data);
                        this.featureCodeFn();
                    })
                    .catch((error) => {
                        // this.$message({
                        //     type: 'error',
                        //     message: error?.data?.message || error,
                        //     showClose: true
                        // });
                    });
            },
            featureCodeFn() {
                let featureCode = this.codeRuleTable.map((item) => {
                    if (item.key === 'CONSTANT') {
                        return item.value;
                    }
                    if (item.key === 'SERIAL_NUM') {
                        return '#SN#';
                    }
                    if (item.key === 'DATE') {
                        return this.fillDate(item.value);
                    }
                    if (item.key === 'VARIABLE') {
                        return item.featureCodeValue || '';
                    }
                });
                this.featureCode = featureCode.join('');
            },
            submit() {
                return new Promise((resolve, reject) => {
                    let data = {};
                    if (this.type === 'code') {
                        this.codeRuleTable.forEach((item) => {
                            if (item.key === 'VARIABLE') {
                                data[item.value] = item?.valueCode || '';
                            }
                        });
                    } else {
                        data = {
                            featureCode: this.featureCode,
                            serialCode: this.serialCode
                        };
                    }
                    if (!this.serialCode && this.type !== 'code') {
                        reject(new Error(this.i18n.codeRequired));
                    } else {
                        resolve(data);
                    }
                });
            },
            onInput(data, item) {
                const reg = new RegExp('[^' + this.sequenceChars + ']', 'g');
                this.$set(item, 'valueCode', data.replace(reg, ''));
            },
            onChange(selectData, item) {
                this.getCode(item);
            }
        }
    };
});
