define([
    'text!' + ELMP.resource('biz-code-rule/components/SequenceChars/index.html'),
    'vuedraggable',
    'css!' + ELMP.resource('biz-code-rule/components/SequenceChars/style.css')
], (template, VueDraggable) => {
    const NUMBERCODE = '0123456789',
        UPPERCASECODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        LOWERCASECODE = 'abcdefghijklmnopqrstuvwxyz';
    return {
        name: 'SequenceChars',
        template,
        components: {
            VueDraggable
        },
        props: {
            sequenceChars: {
                type: String,
                default: 'N|89'
            },
            serialPolicyCode: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                charTypes: [
                    {
                        id: 'N',
                        name: '数字',
                        type: 'numberCode',
                        isChecked: false
                    },
                    {
                        id: 'A',
                        name: '大写字母',
                        type: 'upperCaseCode',
                        isChecked: false
                    },
                    {
                        id: 'a',
                        name: '小写字母',
                        type: 'lowerCaseCode',
                        isChecked: false
                    }
                ],
                numberCode: [],
                upperCaseCode: [],
                lowerCaseCode: []
            };
        },
        watch: {
            // seqChars(nv) {
            //     const charTypes = _.reduce(nv.split('|')[0].split('')).map(key => {
            //         return this.charTypes.find(item => item.id === key)
            //     })
            //     this.charTypes = charTypes;
            // }
        },
        computed: {
            charArr() {
                const charArr = [...this.numberCode, ...this.upperCaseCode, ...this.lowerCaseCode];
                return charArr;
            },
            seqChars: {
                get() {
                    const sequenceCharsType = this.charTypes
                        .filter((item) => item.isChecked)
                        .map((item) => item.id)
                        .join('');
                    const sequenceCharsN = sequenceCharsType.includes('N')
                        ? this.numberCode
                              .filter((item) => !item.isChecked)
                              .map((item) => item.name)
                              .join('')
                        : '';
                    const sequenceCharsA = sequenceCharsType.includes('A')
                        ? this.upperCaseCode
                              .filter((item) => !item.isChecked)
                              .map((item) => item.name)
                              .join('')
                        : '';
                    const sequenceCharsa = sequenceCharsType.includes('a')
                        ? this.lowerCaseCode
                              .filter((item) => !item.isChecked)
                              .map((item) => item.name)
                              .join('')
                        : '';
                    const sequenceChars = sequenceCharsN + sequenceCharsA + sequenceCharsa;
                    return `${sequenceCharsType}|${sequenceChars}`;
                },
                set(val) {
                    // this.$emit('update:sequenceChars', val);
                }
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            sortChar() {
                const sequenceChars = this.sequenceChars.split('|')[0].split('');
                const selectChars = _.compact(
                    sequenceChars.map((key) => {
                        return this.charTypes.find((item) => item.id === key);
                    })
                );
                const unSelectCharts = _.compact(
                    this.charTypes.filter((item) => {
                        return !sequenceChars.includes(item.id);
                    })
                );
                this.charTypes = [...selectChars, ...unSelectCharts];
            },
            init() {
                const sequenceChars = this.sequenceChars.split('|');
                this.numberCode = this.initChars(NUMBERCODE, 'N');
                this.upperCaseCode = this.initChars(UPPERCASECODE, 'A');
                this.lowerCaseCode = this.initChars(LOWERCASECODE, 'a');
                this.charTypes.forEach((item) => {
                    if (sequenceChars[0].includes(item.id)) {
                        item.isChecked = true;
                    }
                });
                this.sortChar();
            },
            initChars(data, type) {
                const sequenceChars = this.sequenceChars.split('|');
                return data.split('').map((item) => {
                    let isChecked = false;
                    if (sequenceChars[0].includes(type) && (!sequenceChars[1] || !sequenceChars[1].includes(item))) {
                        isChecked = true;
                    }
                    return {
                        name: item,
                        isChecked
                    };
                });
            },
            onClickType(data) {
                const isCheckedAll = !this[data.type].find((item) => !item.isChecked);
                if (this.seqChars.split('|')[0].length <= 1 && isCheckedAll) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.characterTips,
                        showClose: true
                    });
                }
                this[data.type].forEach((item) => {
                    item.isChecked = !isCheckedAll;
                });
                data.isChecked = !isCheckedAll;
            },
            onClickChar(data) {
                if (this.charArr.filter((item) => item.isChecked).length <= 1 && data.isChecked) {
                    return this.$message({
                        type: 'error',
                        message: this.i18n.characterTips,
                        showClose: true
                    });
                }
                data.isChecked = !data.isChecked;
                let type;
                if (NUMBERCODE.includes(data.name)) {
                    type = 'N';
                } else if (UPPERCASECODE.includes(data.name)) {
                    type = 'A';
                } else {
                    type = 'a';
                }
                this.charTypes.forEach((item) => {
                    const isChecked = !!this[item.type].find((item) => item.isChecked);
                    if (item.id === type) {
                        item.isChecked = isChecked;
                    }
                });
            },
            submit() {
                return new Promise((resolve, reject) => {
                    if (this.seqChars) {
                        const serialPolicyCodes = ['MAX_BIT_INCREMENT', 'MIN_BIT_INCREMENT'];
                        const seqType = this.seqChars.split('|')[0];
                        const seqChar = this.seqChars.split('|')[1];
                        // 判断是否包含数字类型，并且包含所有数字
                        const nunmberReg = /[0-9]/g;
                        const isNumberAll = seqType.includes('N') && !nunmberReg.test(seqChar);
                        const isChar = seqType.includes('a') || seqType.includes('A');
                        if (serialPolicyCodes.includes(this.serialPolicyCode) && (!isChar || !isNumberAll)) {
                            this.$message({
                                type: 'warning',
                                message: this.i18n.serialPolicyCodesTips,
                                showClose: true
                            });
                            reject();
                        } else {
                            resolve(this.seqChars);
                        }
                    } else {
                        reject(new Error(this.i18n.selectPipelinedRule));
                    }
                });
            }
        }
    };
});
