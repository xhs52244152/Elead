define([ELMP.resource('erdc-components/FamFormDesigner/configurations/_mixin.js')], function (ConfigurationMixin) {
    return {
        mixins: [ConfigurationMixin],
        inject: ['designer'],
        template: `
                <fam-dynamic-form-item
                    field="props.row.referenceList"
                    :label-width="labelWidth"
                >
                <table class="table options-table" style="width: 100%;">
                    <thead>
                        <tr>
                            <th>{{ i18nMappingObj.name }}</th>
                            <th :width="isFormDesigner ? 80 : 0">{{ i18nMappingObj.value }}</th>
                            <th width="20"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, index) in tableData">
                            <td>
                                <FamI18nbasics v-bind="i18nprops" v-model="item.name"></FamI18nbasics>
                            </td>
                            <td>
                                <erd-input v-model="item.value"></erd-input>
                            </td>
                            <td>
                                <erd-button type="icon" icon="erd-iconfont erd-icon-delete" @click="fnRemoveOption(index)"></erd-button>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="3">
                                <erd-button style="width: 100%" icon="el-icon-plus" @click="fnAddOption">新增选项</erd-button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </fam-dynamic-form-item>
        `,
        data() {
            return {
                tableData: [],
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    optionLabel: this.getI18nByKey('选项'),
                    name: this.getI18nByKey('名称'),
                    value: this.getI18nByKey('数据值')
                }
            };
        },
        watch: {
            tableData: {
                deep: true,
                handler(nv) {
                    if (this.schema?.props) {
                        if (this.schema.props?.row === undefined) {
                            this.$set(this.schema.props, 'row', {});
                        }
                        this.$set(this.schema.props.row, 'referenceList', nv);
                        this.setSchemaValue('props', this.schema.props);
                    }
                }
            },
            schema() {
                this.setTableData();
            }
        },
        computed: {
            i18nprops() {
                return {
                    clearable: true
                };
            },
            isFormDesigner() {
                return !!this.designer;
            }
        },
        created() {
            this.setTableData();
        },
        methods: {
            setTableData() {
                let defaultArr = this.schema.props?.row?.['referenceList'] || [];
                if (defaultArr?.length) {
                    this.tableData = defaultArr;
                } else {
                    // 默认插入一条数据
                    this.tableData.push({
                        id: 1,
                        name: {
                            value: {
                                value: '选项1'
                            }
                        },
                        value: '1'
                    });
                }
            },
            fnAddOption() {
                let length = this.tableData.length + 1;
                this.tableData.push({
                    id: length,
                    name: {
                        value: {
                            value: `选项${length}`
                        }
                    },
                    value: String(length)
                });
            },
            fnRemoveOption(index) {
                this.tableData.splice(index, 1);
            }
        }
    };
});
