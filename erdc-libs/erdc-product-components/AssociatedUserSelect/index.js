define([
    'erdcloud.kit',
    'text!' + ELMP.resource('erdc-product-components/AssociatedUserSelect/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-product-components/AssociatedUserSelect/style.css')
], function (ErdcKit, template, utils) {
    return {
        template,
        components: {
            FamDynamicForm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamDynamicForm/index.js')),
            FamMemberSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamMemberSelect/index.js'))
        },
        props: {
            typeDefVoList: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                i18nMappingObj: {},
                selectedMemberList: [],
                defaultMemebr: [],
                formData: {},
                showType: ['USER']
            };
        },
        computed: {
            dynamicFormData() {
                return [
                    {
                        field: 'typeOid',
                        component: 'custom-select',
                        label: this.i18n['type'],
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if ((_.isArray(value) && !value.length) || !value) {
                                        callback(new Error(`${this.i18n.pleaseSelect}${this.i18n.type}`));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        props: {
                            clearable: true,
                            filterable: true,
                            placeholder: this.i18n.pleaseSelect,
                            props: {
                                disabled: 'disabled'
                            },
                            row: {
                                componentName: 'constant-select',
                                viewProperty: 'displayName',
                                valueProperty: 'typeOid',
                                referenceList: this.typeDefVoList
                            }
                        },
                        col: 24
                    },
                    {
                        field: 'members',
                        label: this.i18nMappingObj.selectMember,
                        required: true,
                        validators: [
                            {
                                trigger: ['blur', 'change'],
                                validator: (rule, value, callback) => {
                                    if ((_.isArray(value) && !value.length) || !value) {
                                        callback(new Error(`${this.i18n.please}${this.i18nMappingObj.selectMember}`));
                                    } else {
                                        callback();
                                    }
                                }
                            }
                        ],
                        slots: {
                            component: 'memberComponent'
                        },
                        col: 24
                    }
                ];
            }
        },
        methods: {
            // 选中用户
            changeMember(memberIds, members) {
                this.selectedMemberList = members || [];
            },

            // 提供方法给父级获取当前选中用户
            getSelectedMember() {
                return this.selectedMemberList || [];
            }
        }
    };
});
