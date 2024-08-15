define([
    ELMP.resource('biz-bpm/editor/PropertiesPanelMixin.js'),
    'text!' + ELMP.resource('biz-bpm/editor/components/EditableTable/template.html'),
    'css!' + ELMP.resource('biz-bpm/editor/components/EditableTable/style.css'),
    'erdcloud.kit',
    'underscore'
], function (PropertiesPanelMixin, template) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');

    return {
        name: 'EditableTable',
        mixins: [PropertiesPanelMixin],
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            data: {
                type: Array,
                default() {
                    return [];
                }
            },
            column: {
                type: Array,
                default() {
                    return [];
                }
            },
            rules: {
                type: Object,
                default() {
                    return {};
                }
            },
            keyField: {
                type: String,
                default: 'id'
            },
            editConfig: {
                type: Object,
                default() {
                    return {};
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/editor/locale/index.js'),
                i18nMappingObj: this.getI18nKeys(['remove']),
                innerEditConfig: _.extend(
                    {
                        enabled: !this.readonly,
                        trigger: 'click',
                        mode: 'cell',
                        icon: 'vxe-icon-edit',
                        showStatus: true,
                        showUpdateStatus: true,
                        showInsertStatus: true
                    },
                    this.editConfig
                )
            };
        },
        computed: {
            tableData: {
                get() {
                    return this.data;
                },
                set(data) {
                    this.$emit('update:data', data);
                }
            },
            $table() {
                return this.$refs.table.getTableInstance('vxeTable').instance;
            }
        },
        methods: {
            canEdit(row, column) {
                if (typeof column.params?.canEdit === 'function') {
                    return column.params.canEdit({ row, column });
                }
                return true;
            },
            addRow(row) {
                this.$refs.table
                    .validateTable(row)
                    .then((errorMap) => {
                        if (!errorMap) {
                            let data = ErdcKit.deepClone(this.tableData);
                            data.push(row);
                            this.tableData = data;
                            this.$nextTick(() => {
                                this.$table.setEditRow(row);
                            });
                        }
                    })
                    .catch((errors) => {
                        errors.forEach((err) => {
                            console.error(err);
                        });
                    });
            },
            onEditActive() {
                this.$nextTick(() => {
                    this.$el.querySelector('input') && this.$el.querySelector('input').focus();
                });
            },
            onEditClosed({ row, column }) {
                this.$emit('row-change', { row, column });
            },
            setEditRow(row) {
                this.$table.setEditRow(row);
            },
            removeRow(row, rowIndex) {
                this.tableData.splice(rowIndex, 1);
                this.$nextTick(() => {
                    this.$table.validate(true);
                });
            },
            validate(fullValidate) {
                return this.$table.validate(fullValidate).catch((errMap) => errMap);
            },
            validateField(row, column) {
                return this.$refs.table.validTableRow(row, column.field);
            }
        }
    };
});
