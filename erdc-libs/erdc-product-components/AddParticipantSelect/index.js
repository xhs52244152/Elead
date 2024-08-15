define([
    'erdcloud.kit',
    'text!' + ELMP.resource('erdc-product-components/AddParticipantSelect/index.html'),
    'css!' + ELMP.resource('erdc-product-components/AddParticipantSelect/style.css')
], function (ErdcKit, template) {
    return {
        template,
        props: {
            visible: Boolean,
            labelVisible: {
                type: Boolean,
                default: true
            },
            leftSpan: {
                type: Number,
                default() {
                    return 3;
                }
            },
            rightSpan: {
                type: Number,
                default() {
                    return 21;
                }
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            allTableData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            userDefaultValue: {
                type: [Array, Object, String],
                default() {
                    return [];
                }
            },
            multiple: Boolean,
            appName: String,
            autoHeight: Boolean,
            threeMemberEnv: {
                type: Boolean,
                default: undefined
            }
        },
        components: {
            // 基础表格
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamParticipantSelect: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamParticipantSelect/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: this.getI18nKeys(['principal']),
                participantVal: {}
            };
        },
        computed: {
            innerQueryParams() {
                return {
                    ...this.queryParams,
                    data: {
                        roleType: 'Erd-202200000003',
                        appName: this.appName,
                        ...this.queryParams?.data
                    }
                };
            },
            roleName() {
                return this.currentRoleName || '';
            }
            // participantVal: {
            //     get() {
            //         return this.allTableData;
            //     },
            //     set(value) {
            //         this.$emit('update:allTableData', value);
            //     }
            // }
        },
        watch: {
            allTableData: {
                deep: true,
                immediate: true,
                handler(newValue, oldValue) {
                    // if (newValue.type && newValue.type !== oldValue?.type) {
                    this.$set(this.participantVal, 'type', newValue.type);
                    this.$set(this.participantVal, 'value', newValue.value);
                    // }
                }
            }
        },
        methods: {
            fnGetFormData() {
                return {
                    participantType: this.participantVal?.type, // 参与者类型
                    selectVal: this.participantVal?.value // 参与者
                };
            }
        }
    };
});
