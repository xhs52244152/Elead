/*

 */
define([
    'text!' + ELMP.resource('biz-dict/components/DictMobileNode/index.html'),
    'fam:http',
    'css!' + ELMP.resource('biz-dict/components/DictMobileNode/style.css')
], function (template) {
    const famHttp = require('fam:http');
    const FamKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        props: {
            // 显示隐藏
            visible: Boolean,

            // 标题
            title: String,

            dataList: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                // =======动态国际化 必须在data里面设置 ======= //
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('biz-dict/components/DictMobileNode/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    confirmDelete: this.getI18nByKey('确认删除'),
                    confirmCancel: this.getI18nByKey('确认取消'),
                    confirm: this.getI18nByKey('确定'),
                    cancel: this.getI18nByKey('取消'),
                    moveToNode: this.getI18nByKey('移动至节点'),
                    moveToOtherNodes: this.getI18nByKey('移动到其他节点')
                },
                // targetVal: '',
                formData: {
                    targetVal: ''
                }
            };
        },
        watch: {
            dataList: function (n, o) {
                this.dataList = n;
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            data() {
                return [
                    {
                        field: 'targetVal',
                        component: 'erd-tree-select',
                        label: this.i18nMappingObj['moveToNode'],
                        required: true,
                        props: {
                            'filterable': true,
                            'clearable': false,
                            'node-key': 'id',
                            'data': this.dataList,
                            'default-expand-all': true,
                            'props': {
                                label: 'displayName',
                                children: 'children',
                                disabled: 'disabled'
                            }
                        },
                        // listeners: {
                        //     change: (value) => {
                        //         this.$set(this.formData, 'targetVal', value);
                        //     }
                        // },
                        col: 24
                    }
                ];
            }
        },
        mounted() {},
        methods: {
            formChange() {},
            onSubmit() {
                this.submit();
            },
            submit() {
                const _this = this;
                const { dynamicForm } = this.$refs;
                return new Promise((resolve, reject) => {
                    dynamicForm
                        .submit()
                        .then(({ valid }) => {
                            if (valid) {
                                // 选中时拿到的是对象, 传值需要取id
                                this.formData.targetVal = this.formData.targetVal?.id || '';
                                const serializeData = dynamicForm.serialize();

                                this.$emit('onsubmit', serializeData);
                                this.formData.targetVal = '';
                                _this.toogleShow();
                            } else {
                                reject(new Error('请选择移动至节点'));
                            }
                        })
                        .catch(reject);
                });
            },
            toogleShow() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            }
        },
        components: {}
    };
});
