define([
    'text!' + ELMP.resource('erdc-permission-components/PermissionTitle/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/PermissionTitle/style.css')
], function (template) {
    return {
        template,
        props: {
            editable: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            currentName: {
                type: String,
                default: ''
            },
            defaultCurrentLevel: {
                type: String,
                default: ''
            },
            selectOptions: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            isShowReturnback: {
                type: Boolean,
                default: true
            },
            isShowReadBtn: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    back: this.getI18nByKey('返回'),
                    viewPermission: this.getI18nByKey('查看访问权限'),
                    viewPermissionTips: this.getI18nByKey('查询条件提示')
                },
                // optionsList: [],
                currentLevel: ''
                // currentName: ''
            };
        },
        computed: {
            isEditShow: {
                get() {
                    return this.editable;
                },
                set(val) {
                    this.$emit('change-edit-permission', val);
                }
            },
            selectedLabel() {
                return this.selectOptions.find((s) => s.id === this.currentLevel)?.label || '';
            }
        },
        watch: {
            defaultCurrentLevel: {
                handler(val) {
                    this.currentLevel = val;
                },
                immediate: true
            }
        },
        methods: {
            cancelReadPermission() {
                this.isEditShow = true;
            },
            handlerReadPermission() {
                this.isEditShow = false;
            },
            handlerChangeSiteOrg(val) {
                const selectedItem = this.selectOptions.find((item) => {
                    return item.id === val;
                });
                if (selectedItem) {
                    this.$emit('change-organization', {
                        id: selectedItem.id,
                        oid: selectedItem.oid,
                        name: selectedItem.name
                    });
                }
            }
        },
        components: {}
    };
});
