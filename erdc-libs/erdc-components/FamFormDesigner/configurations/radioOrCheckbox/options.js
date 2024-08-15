define([
    'text!' + ELMP.resource('erdc-components/FamFormDesigner/configurations/radioOrCheckbox/options.html'),
    ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js'),
    'css!' + ELMP.resource('erdc-components/FamFormDesigner/configurations/radioOrCheckbox/style.css')
], function (template, ConfigurationMixin) {
    const ErdcKit = require('erdcloud.kit');
    return {
        mixins: [ConfigurationMixin],
        // template: `
        //         <fam-dynamic-form-item
        //             field="props.row.referenceList"
        //             label-width="0"
        //         >
        //         <table class="table options-table">
        //             <thead>
        //                 <tr>
        //                     <th>{{ i18nMappingObj.name }}</th>
        //                     <th width="80">{{ i18nMappingObj.value }}</th>
        //                     <th width="20"></th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 <tr v-for="(item,index) in tableData">
        //                     <td>
        //                         <FamI18nbasics v-bind="i18nprops" v-model="item.name"></FamI18nbasics>
        //                     </td>
        //                     <td>
        //                         <erd-input v-model="item.value"></erd-input>
        //                     </td>
        //                     <td>
        //                         <erd-button type="icon" icon="erd-iconfont erd-icon-delete" @click="fnRemoveOption(index)"></erd-button>
        //                     </td>
        //                 </tr>
        //                 <tr>
        //                     <td colspan="3">
        //                         <erd-button style="width: 100%" icon="el-icon-plus" @click="fnAddOption">新增选项</erd-button>
        //                     </td>
        //                 </tr>
        //             </tbody>
        //         </table>
        //     </fam-dynamic-form-item>
        // `,
        template,
        inject: ['attributeList', 'designer'],
        props: {
            data: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    status: this.getI18nByKey('状态'),
                    optionLabel: this.getI18nByKey('选项'),
                    name: this.getI18nByKey('名称'),
                    value: this.getI18nByKey('数据值')
                }
            };
        },
        computed: {
            i18nprops() {
                return {
                    clearable: true
                };
            },
            isBoolean() {
                return (
                    (this.currentAttr && this.currentAttr.dataTypeDto?.name === 'java.lang.Boolean') ||
                    this.currentAttr?.dataTypeRefOid ===
                        'OR:erd.cloud.foundation.type.entity.DataTypeDefinition:27150207405816973' ||
                    this.currentAttr?.dataTypeRef ===
                        'OR:erd.cloud.foundation.type.entity.DataTypeDefinition:27150207405816973'
                );
            },
            currentAttr() {
                if (!_.isEmpty(this.data)) {
                    return this.data;
                }
                if (this.selected && this.selected.schema?.field) {
                    return _.find(this.attributeList, (attr) => {
                        return attr?.attrName === this.selected.schema?.field;
                    });
                } else {
                    return null;
                }
            },
            selected() {
                return this.designer?.selected;
            },
            tableData: {
                get() {
                    return this.schema?.props?.options || [];
                },
                set(val) {
                    const props = this.schema.props;
                    // props.options = val;
                    this.$set(props, 'options', val);
                    this.setSchemaValue('props', props);
                }
            }
        },
        watch: {
            isBoolean: {
                immediate: true,
                handler(isBoolean) {
                    if (isBoolean) {
                        this.tableData = _.map(this.tableData, (item) => {
                            item.value = !!item.value;
                            return item;
                        });
                    }
                }
            },
            data: {
                deep: true,
                immediate: true,
                handler(data) {
                    if (!_.isEmpty(data)) {
                        const component = data.componentName || '';
                        const props = this.schema.props;
                        if (ErdcKit.isSameComponentName(component, 'fam-radio')) {
                            this.$set(props, 'type', 'radio');
                        }
                        if (ErdcKit.isSameComponentName(component, 'fam-checkbox')) {
                            this.$set(props, 'type', 'checkbox');
                        }
                    }
                }
            }
        },
        created() {
            let defaultArr = this.schema?.props?.options || [];
            if (defaultArr && defaultArr.length > 0) {
                this.tableData = defaultArr;
            } else {
                // 默认插入一条数据
                if (this.isBoolean) {
                    this.tableData.push(
                        {
                            id: 1,
                            label: '选项1',
                            name: {
                                value: {
                                    value: '选项1'
                                }
                            },
                            value: true
                        },
                        {
                            id: 2,
                            label: '选项2',
                            name: {
                                value: {
                                    value: '选项2'
                                }
                            },
                            value: false
                        }
                    );
                } else {
                    this.tableData.push({
                        id: 1,
                        label: '选项1',
                        name: {
                            value: {
                                value: '选项1'
                            }
                        },
                        value: '1'
                    });
                }
            }
        },
        methods: {
            onChange(item) {
                if (this.isBoolean) {
                    // item.value = item.value !== 'false';
                    // this.schema.defaultValue = !!this.schema.defaultValue;
                }
            },
            fnRadioItem(val, idx) {
                this.schema.props.value = val.value;
                this.setSchemaValue('props', this.schema.props);
            },
            fnCheckItem(val, idx) {
                // let checkedList = this.tableData.filter(item => item.check);
                let checkedList = [];
                this.tableData.forEach((item) => {
                    if (item.check) {
                        checkedList.push(item.value);
                    }
                });
                this.schema.props.checkedList = checkedList;
                this.setSchemaValue('props', this.schema.props);
            },
            fnAddOption() {
                let length = this.tableData.length + 1;
                this.tableData.push({
                    id: length,
                    label: `选项${length}`,
                    name: {
                        value: {
                            value: `选项${length}`
                        }
                    },
                    value: this.isBoolean ? true : String(length)
                });
            },
            fnRemoveOption(index) {
                this.tableData.splice(index, 1);
            }
        }
    };
});
