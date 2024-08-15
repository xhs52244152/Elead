// icon选择组件
define([
    'text!' + ELMP.resource('erdc-components/FamIconSelect/template.html'),
    'css!' + ELMP.resource('erdc-components/FamIconSelect/style.css')
], function (template) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            iconShow: FamKit.asyncComponent(ELMP.resource('erdc-components/FamIconSelect/components/iconShow.js')),
            iconMenu: FamKit.asyncComponent(ELMP.resource('erdc-components/FamIconSelect/components/iconMenu.js'))
        },
        props: {
            value: {
                type: [String, Array],
                default: () => {
                    return '';
                }
            },
            // 是否有提示
            visibleTips: {
                type: Boolean,
                default: false
            },
            // 提示内容
            tips: {
                type: String,
                default: () => {
                    return '图标大小16px X 16px';
                }
            },
            // 是否显示选择图标按钮
            visibleBtn: {
                type: Boolean,
                default: false
            },
            // 按钮名称
            btnName: {
                type: String,
                default: '更改图标'
            },
            clearable: {
                type: Boolean,
                default: true
            },
            readonly: {
                type: Boolean,
                default: false
            },
            parentComp: {
                type: String,
                default: ''
            },
            iconColor: {
                type: String,
                default: 'rgba(0, 0, 0, 0.85)'
            }
        },
        data() {
            return {
                iconClass: 'erd-iconfont erd-icon-triangle-left',
                dialogTableVisible: false,
                dialogVisible: false
            };
        },
        computed: {
            valueClass: {
                get() {
                    return this.value;
                },
                set(val) {
                    this.$emit('input', val);
                }
            }
        },
        mounted() {},
        methods: {
            setIcon(val) {
                this.$emit('input', val);
                this.dialogVisible = false;
            },
            openDialog() {
                this.dialogVisible = true;
            }
        }
    };
});
