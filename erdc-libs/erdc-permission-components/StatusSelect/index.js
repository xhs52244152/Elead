define([
    'text!' + ELMP.resource('erdc-permission-components/StatusSelect/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/StatusSelect/style.css')
], function (template) {
    return {
        template,
        props: {
            defaultValue: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    pleaseSelect: this.getI18nByKey('请选择')
                },
                optionsList: [],
                selectedValue: ''
            };
        },
        watch: {
            defaultValue: {
                immediate: true,
                handler(defaultValue) {
                    this.selectedValue = defaultValue || '';
                }
            }
        },
        created() {
            this.initData();
        },
        methods: {
            initData() {
                this.$famHttp({
                    url: '/fam/listByKey',
                    method: 'get',
                    data: {
                        className: 'erd.cloud.foundation.lifecycle.entity.LifecycleState'
                    }
                }).then((res) => {
                    if (res.code === '200') {
                        this.optionsList = res.data || [];
                    }
                });
            },
            handlerChangeStatus(val) {
                let selectedItem = {};
                if (val) {
                    selectedItem = this.optionsList.find((item) => {
                        return item.id === val;
                    });
                }
                this.$emit('handler-change-status-select', {
                    name: selectedItem.key || '',
                    displayName: selectedItem.displayName || '',
                    id: selectedItem.id || ''
                });
            },
            clearStatusSelections() {
                this.selectedValue = '';
            }
        }
    };
});
