define([
    'text!' + ELMP.resource('biz-code-rule/components/CodeRuleConfig/index.html'),
    'vuedraggable',
    ELMP.resource('biz-code-rule/ruleConfig.js'),
    'css!' + ELMP.resource('biz-code-rule/components/CodeRuleConfig/style.css')
], (template, VueDraggable, ruleConfig) => {
    const FamKit = require('fam:kit');

    return {
        name: 'CodeRuleConfig',
        template,
        components: {
            VueDraggable,
            VariableTranConfig: FamKit.asyncComponent(
                ELMP.resource('biz-code-rule/components/VariableTranConfig/index.js')
            ),
            CodeRuleTips: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/CodeRuleTips/index.js')),
            VariableTran: FamKit.asyncComponent(ELMP.resource('biz-code-rule/components/VariableTran/index.js'))
        },
        props: {
            value: {
                type: String,
                default: ''
            },
            // 变量类型
            type: {
                type: String,
                default: 'CUSTOM'
            },
            // CUSTOM类型 自定义配置时的下拉数据
            customData: {
                type: [Object],
                default() {
                    return {};
                }
            },
            // INTERFACE类型 接口下拉数据
            interfaceData: {
                type: Object,
                default() {
                    return null;
                }
            },
            // TYPE_ATTRIBUTE类型 关联对象
            typeOid: {
                type: [Object, String],
                default: null
            },
            // 变量转换(需要传入转码之前的数据)
            featureScript: {
                type: Object,
                default() {
                    return {};
                }
            },
            patternDesc: {
                type: [Array, String],
                default() {
                    return [
                        {
                            type: 'SERIAL_NUM',
                            value: ''
                        }
                    ];
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                codeRuleConfigArr: [],
                currentDragRule: {},
                deepCloneCodeRuleConfigArr: [],
                codeRuleData: [],
                variableTranConfigVisible: false,
                codeRuleTipsVisible: false,
                variableTranVisible: false,
                defaultVariable: '',
                treeData: [],
                featureScriptConfig: {},
                configWidth: '100%'
            };
        },
        watch: {
            type: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (this.type === 'INTERFACE') {
                        this.getTreeData();
                    }
                }
            },
            typeOid: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.getTreeData();
                    }
                }
            },
            featureScriptConfig(nv) {
                this.$emit('feature-script-change', nv);
            },
            codeRuleConfigArr: {
                deep: true,
                handler(nv) {
                    const codeRuleConfig = FamKit.deepClone(nv).map((item) => {
                        delete item.active;
                        delete item.activeSemicircle;
                        return item;
                    });
                    this.$emit('code-rule-config-change', codeRuleConfig);
                }
            },
            featureScript: {
                deep: true,
                immediate: true,
                handler(nv) {
                    this.featureScriptConfig = FamKit.deepClone(this.featureScript);
                }
            },
            patternDesc: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (_.isArray(nv)) {
                        this.codeRuleConfigArr = ruleConfig.ruleConfigArr(nv, this.featureScript);
                    }
                }
            }
        },
        computed: {
            selectData() {
                const selectData = this.codeRuleConfigArr
                    .filter((item) => item.key === 'VARIABLE' && !_.isEmpty(item.value))
                    .map((item) => {
                        return item.value;
                    });
                return _.uniq(selectData);
            },
            customSelectData() {
                let newCustom = {};
                function custom(obj, key = '') {
                    for (let i in obj) {
                        const name = key ? key + '.' + i : i;
                        if (_.isString(obj[i]) || _.isNumber(obj[i])) {
                            newCustom = {
                                ...newCustom,
                                [name]: obj[i]
                            };
                        } else if (Array.isArray(obj[i])) {
                            const newObj = {};
                            for (let j = 0; j < obj[i].length; j++) {
                                newObj[name + '[' + j + ']'] = obj[i][j];
                            }
                            custom(newObj, '');
                        } else {
                            custom(obj[i], name);
                        }
                    }
                }
                custom(this.customData);
                return newCustom;
            },
            variableData() {
                let treeData = [];
                const dataMap = {
                    CUSTOM: this.customSelectData,
                    TYPE_ATTRIBUTE: this.codeRuleData,
                    INTERFACE: this.interfaceData
                };
                const data = dataMap[this.type];

                treeData = _.keys(data)
                    .sort()
                    .map((key) => {
                        return {
                            displayName: key + '(' + data[key] + ')',
                            attrName: key
                        };
                    });
                return treeData;
            },
            codeRuleArr() {
                return ruleConfig.rules();
            },
            codeRule() {
                const codeRule = this.codeRuleConfigArr
                    .map((item) => {
                        if (_.isEmpty(item.value)) {
                            return '';
                        }
                        if (item.key === 'CONSTANT') {
                            return `"${item.value}"`;
                        }
                        if (item.key === 'VARIABLE') {
                            return `{${item.value}}`;
                        }
                        return item.value;
                    })
                    .join('');

                this.$emit('change', codeRule, this.codeRuleConfigArr);
                return codeRule;
            },
            codeRuleTest() {
                const codeRuleTest = this.codeRuleConfigArr
                    .map((item) => {
                        if (_.isEmpty(item.value)) {
                            return null;
                        }
                        if (item.key === 'CONSTANT') {
                            return {
                                color: item.color,
                                displayName: item.value
                            };
                        }
                        if (item.key === 'VARIABLE') {
                            return {
                                color: item.color,
                                displayName: item.value
                            };
                        }
                        if (item.key === 'SERIAL_NUM') {
                            const value = item.value.split('');
                            const displayName = value
                                .map((ite, index) => {
                                    if (index === value.length - 1) {
                                        return 1;
                                    }
                                    return 0;
                                })
                                .join('');
                            return {
                                color: item.color,
                                displayName
                            };
                        }
                        if (item.key === 'DATE') {
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
                            return {
                                color: item.color,
                                displayName: dateMap[item.value]
                            };
                        }
                    })
                    .filter((item) => item);
                return codeRuleTest;
            },
            codeRuleTipsValue() {
                return this.codeRuleConfigArr.find((item) => item.active)?.name || '';
            }
        },
        mounted() {},
        methods: {
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
            getTreeData() {
                if (this.type === 'TYPE_ATTRIBUTE' && this.typeOid) {
                    this.$famHttp({
                        url: 'fam/type/attribute/getAttrForCode',
                        data: {
                            typeId: this.typeOid
                        }
                    })
                        .then((resp) => {
                            const { data } = resp;
                            this.codeRuleData = data.varDesc;
                            this.codeRuleConfigArr.forEach((item) => {
                                if (item.key === 'VARIABLE') {
                                    if (!Object.keys(this.codeRuleData).includes(item.value)) {
                                        this.$set(item, 'value', '');
                                    }
                                }
                            });
                        })
                        .catch((error) => {
                            // this.$message({
                            //     type: error,
                            //     message: error?.data?.massage || error,
                            //     showClose: true
                            // });
                        });
                }
            },
            style(item) {
                return `background-color: ${item.color}; border-color: ${item.borderColor}`;
            },
            showSemicircle(length, index) {
                return !(length === 1 || index === length - 1);
            },
            onChoose(e) {
                this.currentDragRule = FamKit.deepClone(this.codeRuleArr[e.oldIndex]);
                this.deepCloneCodeRuleConfigArr = FamKit.deepClone(this.codeRuleConfigArr);
            },
            couldInto() {
                const flag = !this.deepCloneCodeRuleConfigArr.find(
                    (item) => this.currentDragRule?.key === 'DATE' && item.key === this.currentDragRule?.key
                );
                return flag;
            },
            onEnd(e) {
                const index = e.newIndex;
                const isAddDate = this.couldInto();
                if (isAddDate) {
                    this.deepCloneCodeRuleConfigArr.splice(index, 0, this.currentDragRule);
                }
                this.codeRuleConfigArr = [];
                this.codeRuleConfigArr = FamKit.deepClone(this.deepCloneCodeRuleConfigArr);
            },
            inputText(data, item) {
                this.$set(item, 'value', data.replace(/["\u4e00-\u9fa5]/g, ''));
            },
            inputCodeChar(data, item) {
                this.$set(item, 'value', data.replace(/[^n]/g, ''));
            },
            onClose(data, index) {
                this.codeRuleConfigArr.splice(index, 1);
            },
            variableChange(data, item) {
                // 系统内获取的时候，使用内部名称
                // item.value = data.attrName;
                this.$set(item, 'featureScript', this.featureScriptConfig[data]);
            },
            itemAvtive(data, index) {
                this.codeRuleConfigArr.forEach((item) => {
                    this.$set(item, 'active', false);
                    this.$set(item, 'activeSemicircle', false);
                });
                this.$set(data, 'active', true);
                this.$set(data, 'activeSemicircle', true);
                this.codeRuleConfigArr[index - 1] &&
                    this.$set(this.codeRuleConfigArr[index - 1], 'activeSemicircle', true);
            },
            darpEnd(e) {
                let data = null;
                let newIndex;
                this.codeRuleConfigArr.forEach((item, index) => {
                    if (item.active) {
                        data = item;
                        newIndex = index;
                    }
                    this.$set(item, 'activeSemicircle', false);
                });
                if (!data) {
                    return;
                }
                this.$set(data, 'activeSemicircle', true);
                this.codeRuleConfigArr[newIndex - 1] &&
                    this.$set(this.codeRuleConfigArr[newIndex - 1], 'activeSemicircle', true);
            },
            variableTranConfig() {
                if (_.isEmpty(this.selectData)) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.noCariablesConfig,
                        showClose: true
                    });
                }
                const selectData = this.codeRuleConfigArr.find((item) => item.active && item.key === 'VARIABLE');
                if (!_.isEmpty(selectData) && !_.isEmpty(selectData.value)) {
                    this.defaultVariable = selectData.value;
                } else {
                    this.defaultVariable = this.selectData[0];
                }
                this.variableTranConfigVisible = true;
            },
            featureScriptSubmit() {
                this.$refs.variableTranConfig.submit().then((data) => {
                    if (!_.isEmpty(data)) {
                        const variableMap = _.keys(data);
                        let featureScriptConfig = {};
                        this.codeRuleConfigArr.forEach((item) => {
                            if (!_.isObject(item.value) && variableMap.includes(item.value)) {
                                this.$set(item, 'featureScript', data);
                            }

                            if (!_.isEmpty(item.featureScript)) {
                                featureScriptConfig = {
                                    ...featureScriptConfig,
                                    ...item.featureScript
                                };
                            }
                        });
                        // 遍历重新获取 featureScriptConfig
                        this.featureScriptConfig = {
                            ...this.featureScriptConfig,
                            ...featureScriptConfig
                        };
                        this.variableTranConfigVisible = false;
                    }
                });
            }
        }
    };
});
