define(['erdcloud.kit'], function () {
    const ErdcKit = require('erdcloud.kit');
    return {
        /*html*/
        template: `
            <div id="fam-configuration-ctt">
                <erd-tabs v-model="activeTab">
                    <erd-tab-pane :label="i18nMappingObj.methodDefinition" name="functions"></erd-tab-pane>
                    <erd-tab-pane :label="i18nMappingObj.variableDefinition" name="variables"></erd-tab-pane>
                </erd-tabs>
                <div v-if="!readonly" class="flex justify-end pb-xl mt-n-16">
                    <erd-button @click="handleCreate">{{i18nMappingObj.create}}</erd-button>
                </div>
                <ErdTable
                    ref="erdTable"
                    v-if="isTable"
                    :row-config="{isCurrent: true, isHover: true, useKey: true, keyField: 'id' }"
                    :column-config="{ resizable: true }"
                    :edit-config="{ enabled: !readonly, trigger: 'click', mode: 'cell', beforeEditMethod: beforeEditMethod }"
                    :data="tableData"
                    :column="column"
                    :cell-class-name="tableCellClassName"
                    align="left"
                    auto-resize
                    show-overflow
                    border
                    @edit-actived="handleEditActived"
                    @edit-closed="handleEditClosed"
                >
                    <template #column-header="{ data }">
                        <div>
                            <span v-if="data.header.column.editRender && data.header.column.editRender.required" style="color: #f04134">*</span>
                            <erd-icon v-if="data.header.column.editRender" class="text-sm" icon="edit"></erd-icon>
                            <span>{{ data.header.column.title }}</span>
                            <erd-tooltip
                                v-if="data.header.column.editRender && data.header.column.editRender.tooltip"
                                :content="data.header.column.editRender.tooltip"
                                placement="top"
                            >
                                <erd-icon style="color: #567ffd;" class="pointer" icon="help"></erd-icon>
                            </erd-tooltip>
                        </div>
                    </template>
                    <template #input-edit="{ data }">
                        <erd-input
                            :ref="data.column.property + '-input'"
                            v-model="data.row[data.column.property]"
                            :key="data.column.property + '-input'"
                            :maxlength="100"
                            :placeholder="i18nMappingObj.pleaseEnter"
                            @input="(value)=>(handleInput(value, data))"
                        >
                        </erd-input>
                        <erd-tooltip
                            ref="validateTooltips"
                            :value="!!data.row[\`validerror-\${data.row.id}-\${data.column.property}\`]"
                            :key="data.column.property + '-tooltip'"
                            effect="dark"
                            placement="top-end"
                            popper-class="error-tooltip"
                            manual
                        >
                            <div slot="content">{{data.row[\`validerror-\${data.row.id}-\${data.column.property}\`]}}</div>
                            <span class="tooltip"></span>
                        </erd-tooltip>
                    </template>
                    <template #select-edit="{ data }">
                        <erd-select 
                            v-if="data.column.editRender"
                            :ref="data.column.property + '-select'"
                            v-model="data.row[data.column.property]"
                            popper-class="vxe-table--ignore-clear"
                            class="w-100p"
                        >
                            <erd-option
                                v-for="item in getColumnOptions(data.column)"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            ></erd-option>
                        </erd-select>
                    </template>
                    <template #select-static-text="{ data }">
                        {{ translateOption(data) }}
                    </template>
                    <template #oper-column="{ data }">
                        <el-button 
                            v-if="activeTab === 'functions'"
                            type="text" 
                            @click="handleEdit(data)"
                        >{{i18nMappingObj.edit}}</el-button>
                        <el-button 
                            v-if="!readonly"
                            type="text" 
                            @click="handleDelete(data.row, data.rowIndex)"
                        >{{i18nMappingObj.delete}}</el-button>
                    </template>
                </ErdTable>
                
                <erd-ex-dialog
                    :visible.sync="dialogVisible"
                    :title="i18nMappingObj.editSourceCode"
                    size="large"
                >
                   <FamMonacoEditor
                        v-if="dialogVisible"
                        ref="famMonacoEditor"
                        :data="currentFunctionContent"
                        :editorConfig="monacoEditorConfig"
                        :minHeight="550"
                    ></FamMonacoEditor>
                    <template v-if="!readonly" #footer>
                        <erd-button 
                            type="primary" 
                            @click="handleFunctionContentSave"
                        >{{ i18nMappingObj.confirm }}</erd-button>
                        <erd-button 
                            @click="dialogVisible = false"
                        >{{ i18nMappingObj.cancel }}</erd-button>
                    </template>
                </erd-ex-dialog>
            </div>
        `,
        components: {
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamMonacoEditor: ErdcKit.asyncComponent(ELMP.resource(`erdc-components/FamMonacoEditor/index.js`))
        },
        props: {
            customizeConfiguration: {
                type: Object,
                default() {
                    return {};
                }
            },
            readonly: Boolean
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-components/FamFormDesigner/locale/index.js'),
                i18nMappingObj: {
                    'methodDefinition': this.getI18nByKey('methodDefinition'),
                    'variableDefinition': this.getI18nByKey('variableDefinition'),
                    'edit': this.getI18nByKey('edit'),
                    'delete': this.getI18nByKey('delete'),
                    'create': this.getI18nByKey('create'),
                    'description': this.getI18nByKey('描述'),
                    'operation': this.getI18nByKey('操作'),
                    'internalName': this.getI18nByKey('内部名称'),
                    'disabled': this.getI18nByKey('是否禁用'),
                    'nameRule': this.getI18nByKey('nameRule'),
                    'pleaseEnter': this.getI18nByKey('请输入'),
                    'editSourceCode': this.getI18nByKey('editSourceCode'),
                    'yes': this.getI18nByKey('是'),
                    'no': this.getI18nByKey('否'),
                    'confirm': this.getI18nByKey('确定'),
                    'cancel': this.getI18nByKey('取消'),
                    'invalidFunction': this.getI18nByKey('invalidFunction'),
                    'confirm-delete-method': this.getI18nByKey('confirm-delete-method'),
                    'confirm-delete-variable': this.getI18nByKey('confirm-delete-variable'),
                    'alert': this.getI18nByKey('alert')
                },
                activeTab: null,
                dialogVisible: false,
                currentFunction: null
            };
        },
        computed: {
            isTable() {
                return ['functions', 'variables'].includes(this.activeTab);
            },
            column() {
                return this.originColumn.filter((i) => {
                    return this.activeTab === 'variables' || !['getter', 'setter'].includes(i.prop);
                });
            },
            originColumn() {
                const that = this;
                return [
                    {
                        prop: 'name',
                        title: this.i18nMappingObj.internalName,
                        minWidth: 200,
                        editRender: {
                            required: true,
                            tooltip: this.i18nMappingObj.nameRule
                        },
                        slots: {
                            edit: 'input-edit',
                            header: 'column-header'
                        }
                    },
                    {
                        prop: 'description',
                        title: this.i18nMappingObj.description,
                        minWidth: 200,
                        editRender: {},
                        className: 'editIcon',
                        slots: {
                            edit: 'input-edit',
                            header: 'column-header'
                        }
                    },
                    {
                        prop: 'getter',
                        title: 'Getter',
                        width: 200,
                        editRender: {
                            options: function () {
                                return that.functionData.map((item) => ({ label: item.name, value: item.name }));
                            }
                        },
                        className: 'editIcon',
                        slots: {
                            default: 'select-static-text',
                            header: 'column-header',
                            edit: 'select-edit'
                        }
                    },
                    {
                        prop: 'setter',
                        title: 'Setter',
                        width: 200,
                        editRender: {
                            options: function () {
                                return that.functionData.map((item) => ({ label: item.name, value: item.name }));
                            }
                        },
                        className: 'editIcon',
                        slots: {
                            default: 'select-static-text',
                            header: 'column-header',
                            edit: 'select-edit'
                        }
                    },
                    {
                        prop: 'disabled',
                        title: this.i18nMappingObj.disabled,
                        width: 100,
                        editRender: {
                            options: [
                                { label: '否', value: false },
                                { label: '是', value: true }
                            ]
                        },
                        className: 'editIcon',
                        slots: {
                            default: 'select-static-text',
                            header: 'column-header',
                            edit: 'select-edit'
                        }
                    },
                    {
                        prop: 'oper',
                        title: this.i18nMappingObj.operation,
                        width: 86,
                        fixed: 'right',
                        slots: {
                            default: 'oper-column'
                        }
                    }
                ];
            },
            functionData: {
                get() {
                    return this.customizeConfiguration?.functions || [];
                },
                set(value) {
                    this.$emit('update:customizeConfiguration', {
                        ...this.customizeConfiguration,
                        functions: value
                    });
                }
            },
            variableData: {
                get() {
                    return this.customizeConfiguration?.variables || [];
                },
                set(value) {
                    this.$emit('update:customizeConfiguration', {
                        ...this.customizeConfiguration,
                        variables: value
                    });
                }
            },
            tableData: {
                get() {
                    return (this.activeTab === 'functions' ? this.functionData : this.variableData) || [];
                },
                set(value) {
                    if (this.activeTab === 'functions') {
                        this.functionData = value;
                    } else {
                        this.variableData = value;
                    }
                }
            },
            validateRules() {
                const that = this;
                return {
                    name: [
                        {
                            required: true
                        },
                        {
                            validator: that.nameFormatValidator,
                            message: this.i18nMappingObj.nameRule
                        }
                    ]
                };
            },
            nameFormatValidator() {
                const that = this;
                return function (value, rule) {
                    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(value)) {
                        return new Error(rule?.message);
                    }
                    if (that.tableData.filter((item) => item.name === value).length > 1) {
                        return new Error(that.i18nMappingObj.nameRule);
                    }
                };
            },
            currentFunctionContent() {
                return (
                    this.currentFunction?.content ||
                    [
                        '// 当前上下文通常是<高级表单组件>，必须使用 return 返回业务方法体',
                        '',
                        '// 全局可以使用 useVariable 方法注入变量，variable1 即变量定义的名。例如：',
                        "// const [ variable1, setVariable1 ] = useVariable('variable1');",
                        "// const method1 = useMethod('method1');",
                        '',
                        `/**`,
                        ` * @description ${this.currentFunction?.description || ''}`,
                        ` */`,
                        `return function ${this.currentFunction?.name || 'method'}() {`,
                        '    // 此层上下文通常是高级表单应用组件（例如父组件），在此处完成业务开发',
                        '};',
                        ''
                    ].join('\n')
                );
            },
            monacoEditorConfig() {
                return {
                    language: 'javascript',
                    automaticLayout: true,
                    autoSurround: true,
                    fontSize: 14,
                    contextmenu: false
                };
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.activeTab = 'functions';
            });
        },
        methods: {
            handleCreate() {
                let newRow = null;
                if (this.activeTab === 'functions') {
                    const functions = this.customizeConfiguration.functions || [];
                    const newRow = {
                        id: new Date().getTime().toString(36),
                        name: '',
                        disabled: false,
                        content: '',
                        description: ''
                    };
                    functions.push(newRow);
                    this.$set(this.customizeConfiguration, 'functions', functions);
                } else {
                    const variables = this.customizeConfiguration.variables || [];
                    newRow = {
                        id: new Date().getTime().toString(36),
                        name: '',
                        disabled: false,
                        content: '',
                        description: '',
                        getter: '',
                        setter: ''
                    };
                    variables.push(newRow);
                    this.$set(this.customizeConfiguration, 'variables', variables);
                }
                this.$nextTick(() => {
                    if (this.$refs.erdTable) {
                        this.$refs.erdTable.$refs.xTable.setEditRow(newRow);
                        this.$nextTick(() => {
                            this.$refs.erdTable.$refs.xTable.scrollToRow(newRow);
                        });
                    }
                });
            },
            handleDelete(row, index) {
                const message = this.activeTab === 'functions' ? 'confirm-delete-method' : 'confirm-delete-variable';
                this.$confirm(this.i18nMappingObj[message], this.i18nMappingObj.alert, {
                    type: 'warning'
                }).then(() => {
                    this.customizeConfiguration[this.activeTab].splice(index, 1);
                });
            },
            handleInput(value, data) {
                const { row, column } = data;
                this.$set(row, column.property, value.trim());
            },
            handleEditActived({ row, column }) {
                this.$set(row, `editIcon-${row.id}-${column.property}`, true);
                if (this.validateRules[column.property]?.length && !row[`validerror-${row.id}-${column.property}`]) {
                    this.$set(row, `validerror-${row.id}-${column.property}`, false);
                }

                this.$nextTick(() => {
                    if (this.$refs[column.property + '-input']) {
                        this.$refs[column.property + '-input'].focus();
                    } else if (this.$refs[column.property + '-select']) {
                        this.$refs[column.property + '-select'].toggleMenu();
                    }
                });
            },
            handleEditClosed({ row, column }) {
                this.validateRow(row, column);
            },
            tableCellClassName({ row, column }) {
                const classNames = [
                    row[`editIcon-${row.id}-${column.property}`] ? 'editIcon' : null,
                    row[`validerror-${row.id}-${column.property}`] ? 'erd-table-valid-error' : null,
                    row.editFlag ? 'newEditFlag' : '',
                    this.$refs.erdTable.$refs.xTable.isEditByRow(row) && row[`editCell-${column.property}`]
                        ? 'editCell'
                        : null
                ];
                return classNames.filter((item) => item).join(' ');
            },
            beforeEditMethod({ row, column }) {
                let flag = true;

                let hasEditCell = false;
                const findEdit = (data) => {
                    data.forEach((item) => {
                        const isEditCell = this.$refs.erdTable.$refs.xTable.isEditByRow(item);
                        if (isEditCell) {
                            hasEditCell = true;
                        } else if (item.children && item.children.length) {
                            findEdit(item.children);
                        }
                    });
                };
                findEdit(this.tableData);

                if (!hasEditCell) {
                    row.property = column.property;
                }

                if (Object.prototype.hasOwnProperty.call(row, `validerror-${row.id}-${row.property}`)) {
                    this.validateRow(row, column);
                }

                if (flag) {
                    row.property = column.property;
                }
                return flag;
            },
            validateRow(row, column) {
                const validators = this.validateRules[column.property] || [];
                let errorMessage = null;
                validators.forEach((rule) => {
                    if (errorMessage) {
                        return;
                    }
                    if (rule.required && !row[column.property]) {
                        errorMessage = rule.message || this.i18nMappingObj.pleaseEnter;
                    }
                    if (rule.validator) {
                        errorMessage = rule.validator(row[column.property], rule)?.message;
                    }
                });
                if (validators.length) {
                    this.$set(row, `validerror-${row.id}-${column.property}`, errorMessage || false);
                }
            },
            getColumnOptions(column) {
                const options = column.editRender?.options || [];
                if (typeof options === 'function') {
                    return options();
                }
                return options;
            },
            translateOption(data) {
                const options = this.getColumnOptions(data.column);
                const option = options.find((item) => item.value === data.row[data.column.property]);
                return option?.label || data.row[data.column.property] || '--';
            },
            handleEdit({ row }) {
                this.currentFunction = row;
                this.dialogVisible = true;
            },
            handleFunctionContentSave() {
                this.currentFunction.content = this.$refs.famMonacoEditor.getValue();
                this.dialogVisible = false;
            },
            getInvalidRow(rows) {
                rows.forEach((row) => {
                    this.originColumn.forEach((column) => {
                        this.validateRow(row, { property: column.prop });
                    });
                });
                return rows.find((row) => {
                    return Object.keys(row).some((key) => {
                        return key.startsWith('validerror-') && row[key];
                    });
                });
            },
            submit(callback) {
                const mapRow = (row) => ({
                    id: row.id,
                    name: row.name,
                    disabled: row.disabled,
                    content: row.content,
                    description: row.description,
                    getter: row.getter,
                    setter: row.setter
                });
                const invalidFunction = this.getInvalidRow(this.functionData);
                const invalidVariable = this.getInvalidRow(this.variableData);

                const focusToInvalidRow = (activeTab, row) => {
                    this.activeTab = activeTab;
                    this.$nextTick(() => {
                        this.$nextTick(() => {
                            this.$refs.erdTable.$refs.xTable.setEditRow(row);
                            this.$refs.erdTable.$refs.xTable.scrollToRow(row);
                        });
                    });
                };

                if (invalidFunction) {
                    focusToInvalidRow('functions', invalidFunction);
                } else if (invalidVariable) {
                    focusToInvalidRow('variables', invalidVariable);
                } else {
                    callback({
                        functions: this.functionData.map(mapRow),
                        variables: this.variableData.map(mapRow)
                    });
                }
            }
        }
    };
});
