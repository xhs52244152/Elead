define([
    'text!' + ELMP.resource('common-page/components/DetailInfoTop/index.html'),
    'css!' + ELMP.resource('common-page/components/DetailInfoTop/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        props: {
            classNameKey: {
                type: String,
                default: ''
            },
            className: {
                type: String,
                default: ''
            },
            showSpecialAttr: {
                type: Boolean,
                default: false
            },
            formShowType: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            icon: String,
            showBackButton: Boolean,
            detailInfo: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            keyAttrs: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            vm: {
                type: Object,
                default() {
                    return {};
                }
            },
            containerOid: {
                type: String,
                default: ''
            },
            /**
             * @description 操作按鈕自定义参数
             */
            actionParams: Object
        },
        components: {
            FamActionPulldown: FamKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js')),
            FamPageTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamPageTitle/index.js'))
        },
        data() {
            return {};
        },
        computed: {
            defaultBtnConfig() {
                return {
                    label: '操作',
                    type: 'primary'
                };
            },
            specialTags() {
                // TODO 实际应用场景联调
                return [
                    {
                        name: '前端问题',
                        color: 'red'
                    },
                    {
                        name: '前端问题2',
                        color: '#ccc'
                    }
                ];
            },
            // keyAttrs() {
            //     // TODO 实际应用场景联调 最多只能展示4个
            //     return [
            //         {
            //             name: '张三',
            //             icon: '',
            //             label: '负责人'
            //         },
            //         {
            //             name: '待执行',
            //             icon: '',
            //             label: '状态'
            //         }
            //     ];
            // },
            actionConfig() {
                return {
                    name: this.classNameKey,
                    className: this.className,
                    objectOid: this.detailInfo.oid || this.detailInfo.pid || this.containerOid
                };
            }
        },
        watch: {},
        mounted() {},
        methods: {
            onCommand(btnInfo = {}, rowData = {}) {
                this.$emit('title-opeartion-btn-click', btnInfo, rowData);
            },
            calcTagStyle(tag) {
                return {
                    color: tag.color,
                    borderColor: tag.color
                };
            },
            onBack() {
                this.$emit('back');
            }
        }
    };
});
