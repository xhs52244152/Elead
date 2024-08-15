/*
角色选择控件
*/
define([
    'text!' + ELMP.resource('erdc-components/FamUserSelect/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamUserSelect/style.css')
], function (template, utils) {
    const famHttp = require('fam:http');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 选中的角色
            users: {
                type: Array,
                default: () => {
                    return [];
                }
            },

            // 角色下拉信息
            usersInfo: {
                type: Array,
                default: () => {
                    return [];
                }
            },

            // 角色选择控件的配置参数
            configInfo: {
                type: Object,
                default: () => {
                    /**
                     * Boolean
                     * multiple: 多选
                     * filterable: 可搜索
                     * collapseTags: 显示折叠
                     *
                     * String
                     * disabled: 不可选的数据中对应的参数
                     */
                    return {};
                }
            },

            // className
            className: {
                type: String,
                required: true,
                default: () => {
                    return '';
                }
            },
            valueKey: {
                type: String,
                default() {
                    return 'oid';
                }
            },
            labelKey: {
                type: String,
                default() {
                    return 'displayName';
                }
            },
            placeholder: {
                type: String,
                default() {
                    return '';
                }
            }
        },
        data() {
            return {
                options: [],
                defaultOption: [],
                showBox: true,
                selectUser: []
            };
        },
        computed: {
            placeholderText() {
                return this.placeholder || utils.setTextBySysLanguage({ CN: '请选择', EN: 'Please select' });
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            seleceUserDetail: function () {
                const selectUserArr =
                    this.defaultOption &&
                    this.defaultOption.filter((item) => this.selectUser.includes(item[this.valueKey]));
                return selectUserArr;
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.selectUser = this.users;
                this.getRoleData();
            },
            getRoleData(selectVal) {
                if (this.className) {
                    const data = {
                        params: {
                            className: this.className,
                            keyword: selectVal
                        }
                    };
                    famHttp.get('/fam/listByKey', data).then((resp) => {
                        let dataResp = JSON.parse(JSON.stringify(resp.data || []));
                        this.defaultOption = dataResp;
                        this.options = dataResp;
                    });
                }
            },
            handleSelect(val) {
                this.selectUser = val;
                this.$emit('input', this.selectUser);
                this.$emit('onselect', this.selectUser);
            },
            searchDone(value) {
                utils.debounceFn(() => {
                    const defaultOption = this.defaultOption;
                    this.options = defaultOption.filter((item) => {
                        if (
                            (item[this.labelKey] && item[this.labelKey].includes(value)) ||
                            (item.appName && item.appName == value)
                        ) {
                            return item;
                        }
                    });
                    if (!value) {
                        this.options = defaultOption;
                    }
                    // this.getRoleData(value)
                }, 300);
            }
        },
        components: {}
    };
});
