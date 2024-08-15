define([
    'text!' + ELMP.resource('erdc-type-components/TypeSetIcon/index.html'),
    'css!' + ELMP.resource('erdc-type-components/TypeSetIcon/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        components: {
            FamRuleEngine: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamRuleEngine/index.js'))
        },
        props: {
            oid: {
                type: String,
                default: ''
            },
            title: {
                type: String,
                default: ''
            },
            rowData: {
                type: Object,
                default: () => ({})
            },
            openType: {
                type: String,
                default: ''
            },
            defaultIcon: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            isUpdate() {
                return this.openType === 'edit';
            },
            ruleConditionDtoList() {
                return this.rowData.ruleConditionDtoList || [];
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/TypeSetIcon/locale/index.js'),
                i18nMappingObj: {
                    configIconRule: this.getI18nByKey('配置图标规则'),
                    icon: this.getI18nByKey('图标'),
                    iconConfig: this.getI18nByKey('图标配置'),
                    iconColor: this.getI18nByKey('图标颜色'),
                    ruleConfig: this.getI18nByKey('规则配置'),
                    confirm: this.getI18nByKey('确定'),
                    clearConditions: this.getI18nByKey('清空条件'),
                    cancel: this.getI18nByKey('取消'),
                    updateSuccess: this.getI18nByKey('更新成功'),
                    addSuccess: this.getI18nByKey('新增成功')
                },
                loading: false,
                typeData: {},
                className: 'erd.cloud.foundation.type.entity.ConstantDefinition',
                holderRef: 'OR:erd.cloud.foundation.type.entity.PropertyDefinition:27150207405821892',
                iconExpanded: true,
                ruleExpanded: true,
                icon: '',
                iconColor: 'rgba(0, 0, 0, 0.85)',
                iconColorList: []
            };
        },
        created() {
            if (this.isUpdate) {
                let iconInfo = {};
                if (this.isJSON(this.rowData.value)) {
                    iconInfo = JSON.parse(this.rowData.value);
                    this.icon = iconInfo.iconClass;
                    this.iconColor = iconInfo?.iconStyle?.color;
                }
            } else {
                this.icon = this.defaultIcon;
            }
            this.getIconColorList();
        },
        methods: {
            getIconColorList() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/objectIconColor',
                    method: 'get'
                }).then((res) => {
                    const iconColorList = res?.data || [];
                    this.iconColorList = iconColorList.filter((item) => item.status === 1).slice(0, 8);
                });
            },
            changeColor(value) {
                this.iconColor = value;
            },
            submit() {
                const conditionsList = this.$refs.famRuleEngine.getRuleEngineParams();
                if (!conditionsList) return;
                let ruleEngineParams = {
                    attrRawList: [
                        {
                            attrName: 'name',
                            value: 'icon'
                        },
                        {
                            attrName: 'holderRef',
                            value: this.holderRef
                        },
                        {
                            attrName: 'typeReference',
                            value: this.oid
                        }
                    ],
                    className: this.className,
                    associationField: 'holderRef',
                    relationList: conditionsList
                };
                if (this.isUpdate && this.rowData?.oid) {
                    ruleEngineParams.oid = this.rowData.oid;
                }
                if (ruleEngineParams) {
                    const iconJson = {
                        iconClass: this.icon,
                        iconStyle: {
                            color: this.iconColor
                        }
                    };
                    ruleEngineParams.attrRawList.push({
                        attrName: 'value',
                        value: JSON.stringify(iconJson)
                    });
                    this.loading = true;
                    this.$famHttp({
                        url: `/fam/${this.isUpdate ? 'update' : 'create'}`,
                        data: ruleEngineParams,
                        method: 'post'
                    })
                        .then((response) => {
                            const { success, message } = response;
                            if (success) {
                                this.$message.success(
                                    this.i18nMappingObj[this.isUpdate ? 'updateSuccess' : 'addSuccess']
                                );
                                this.$emit('onsubmit');
                                this.cancel();
                            } else {
                                this.$message.error(message);
                            }
                            this.loading = false;
                        })
                        .catch(() => {
                            this.loading = false;
                        });
                    this.ruleConfigVisible = false;
                }
            },
            clearAllConditions() {
                this.$refs.famRuleEngine.clearAllConditions();
            },
            cancel() {
                this.$emit('update:visible', false);
            },
            isJSON(str) {
                if (typeof str == 'string') {
                    try {
                        let obj = JSON.parse(str);
                        if (typeof obj == 'object' && obj) {
                            return true;
                        } else {
                            return false;
                        }
                    } catch (e) {
                        return false;
                    }
                }
            }
        }
    };
});
