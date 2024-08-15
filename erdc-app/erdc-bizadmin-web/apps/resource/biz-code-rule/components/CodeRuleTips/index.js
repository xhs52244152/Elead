define([
    'text!' + ELMP.resource('biz-code-rule/components/CodeRuleTips/index.html'),
    'css!' + ELMP.resource('biz-code-rule/components/CodeRuleTips/style.css')
], (template) => {
    const FamKit = require('fam:kit');
    return {
        name: 'CodeRuleTips',
        template,
        props: {
            defaultValue: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-code-rule/locale/index.js'),
                searchValue: '',
                tipData: []
            };
        },
        watch: {
            searchValue: {
                deep: true,
                immediate: true,
                handler(nv) {
                    if (!nv) {
                        this.tipData = FamKit.deepClone(this.defaultData);
                    } else {
                        this.tipData = FamKit.deepClone(this.defaultData).filter((item) => {
                            item.isShow = true;
                            return item.title.includes(nv);
                        });
                    }
                }
            }
        },
        computed: {
            defaultData() {
                return [
                    {
                        title: this.i18n.text,
                        value: 'text',
                        color: '#FFA39E',
                        isShow: true
                    },
                    {
                        title: this.i18n.date,
                        value: 'date',
                        color: '#FFBB98',
                        isShow: true
                    },
                    {
                        title: this.i18n.variable,
                        value: 'variable',
                        color: '#ADF1C7',
                        isShow: true
                    },
                    {
                        title: this.i18n.sequenceChars,
                        value: 'codeChar',
                        color: '#f5f5f5',
                        isShow: true
                    }
                ]
            },
        },
        mounted() {
            this.searchValue = this.defaultValue;
        },
        methods: {
            style(color) {
                return `background-color: ${color};`;
            },
            onShow(item) {
                this.$set(item, 'isShow', !item.isShow);
            }
        }
    };
});
