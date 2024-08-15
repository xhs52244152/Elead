define([
    'text!' + ELMP.resource('erdc-version-view/components/Form/index.html'),
    ELMP.resource('erdc-version-view/util.js')
], function (template, util) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'VersionViewForm',
        template,
        props: {
            // 内部名称
            className: String,
            // 表单id
            formId: String,
            // 回显oid
            oid: String,
            // 回显数据
            blockData: Object
        },
        components: {
            FamAdvancedForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedForm/index.js'))
        },
        data() {
            return {
                formData: {
                    parentRef: null,
                    supportedClass: null
                },
                parentRefDisplayName: '',
                supportedClassDisplayName: '',
                parentRefData: [],
                supportedClassData: [],
                parentRefTreeProps: {
                    children: 'children',
                    label: 'displayName',
                    value: 'oid',
                    disabled: 'disabled'
                },
                supportedClassTreeProps: {
                    children: 'children',
                    label: 'displayName',
                    value: 'typeName',
                    disabled: 'disabled'
                },
                modelMapper: {
                    description: (data, value) => {
                        return value?.displayName;
                    },
                    displayNameStr: (data, value) => {
                        return value?.displayName;
                    }
                }
            };
        },
        computed: {
            schemaMapper() {
                return {
                    name: function (schema) {
                        schema.validators = [
                            ...schema.validators,
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if (/[^a-zA-Z0-9_]+/.test(value)) {
                                        callback(new Error('请输入字母、数字或"_"'));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ];
                    }
                };
            },
            queryLayoutParams() {
                let name = this.formId || 'CREATE';
                return {
                    name
                    // attrRawList: [
                    //     {
                    //         attrName: 'layoutSelector',
                    //         value: name
                    //     }
                    // ]
                };
            }
        },
        mounted() {
            const _this = this;
            _this.getParentView();
            _this.getType();
        },
        methods: {
            handleBlockData() {
                const _this = this;
                _this.supportedClassDisplayName = _this.blockData?.supportedName;
                _this.formData.parentRef = _this.blockData?.parentRef;
                _this.formData.supportedClass = _this.blockData?.supportedClass;
                _this.parentRefDisplayName =
                    _this.parentRefData?.find((v) => v.oid == _this.blockData?.parentRef)?.displayName || '无';
            },
            // 获取父视图
            getParentView() {
                const _this = this;
                this.$famHttp({
                    url: '/fam/view/effective',
                    data: { className: _this.className },
                    method: 'GET'
                }).then((res) => {
                    let { success, data } = res || {};
                    if (success) {
                        util.flatPropertyValues(data);
                        // 移除会引起冲突的children属性
                        data.forEach((d) => {
                            d.childOids = d.children;
                            delete d.children;
                        });
                        _this.parentRefData = data;
                        if (_this.formId == 'UPDATE') {
                            _this.handleBlockData();
                        }
                    }
                });
            },
            // 获取类型
            getType() {
                const _this = this;
                this.$famHttp({
                    url: '/fam/view/manageables',
                    data: { className: _this.className },
                    method: 'GET'
                }).then((res) => {
                    let { success, data } = res || {};
                    if (success) {
                        _this.supportedClassData = [data];
                    }
                });
            }
        }
    };
});
