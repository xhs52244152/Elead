define('account-rule-table-html', [], () => {
    return `
    <div id="account_rule_table">
        <fam-erd-table
            ref="ruleTable"
            style="margin-top: 12px"
            show-overflow
            border
            :custom-valid="true"
            :edit-config="editConfig"
            :max-height="tableHeight"
            :data="tableData"
            :column="columns"
            :column-config="{ resizable: true }"
            @edit-actived="editActived"
        >
            <template #column:default:name="{data}">
                <span v-if="!data.row[data.column.property]">请输入名称</span>
                <span v-else>{{data.row[data.column.property]}}</span>
            </template>
            <template #column:edit:name="{data}">
                <erd-input ref="nameInput" v-model="data.row[data.column.property]" autofocus></erd-input>
            </template>

            <template #column:default:del_flag="{data}">
                <span v-if="!data.row.del_flag">请选择状态</span>
                <span v-else>{{data.row.statusName}}</span>
            </template>
            <template #column:edit:del_flag="{data}">
                <erd-select
                    ref="statusTableSelect"
                    v-model="data.row.del_flag"
                    popper-class="vxe-table--ignore-clear"
                    @change="(value)=>(changeField(value, data.row))"
                >
                    <erd-option
                        v-for="item in selectOption"
                        :key="item.value"
                        :value="item.value"
                        :label="item.displayName"
                    ></erd-option>
                </erd-select>
            </template>

            <template #column:default:RegEx="{data}">
                <span v-if="!data.row.RegEx">请选择规则</span>
                <span v-else>{{data.row.ruleDisplayName}}</span>
            </template>
            <template #column:edit:RegEx="{data}">
                <div v-if="data.row.fileId === 'length'" class="flex align-items-center">
                    <erd-input
                        ref="ruleTableSelect"
                        v-model.number="data.row.minLength"
                        @blur="(value) => onBlur(value, data.row)"
                        @input="(value) => onInput(value, data.row)"
                    >
                    </erd-input>
                    <span class="plr-4">-</span>
                    <erd-input
                        v-model.number="data.row.maxLength"
                        @blur="(value) => onBlur(value, data.row)"
                        @input="(value) => onInput(value, data.row)"
                    >
                    </erd-input>
                </div>
                <erd-ex-select
                    v-else
                    ref="ruleTableSelect"
                    v-model="data.row.RegEx"
                    popper-class="vxe-table--ignore-clear"
                    :options="options"
                    :default-props="defaultProps"
                    @change="(value)=>(ruleChange(value, data.row))"
                ></erd-ex-select>
            </template>

            <template #column:default:err="{data}">
                <span v-if="!data.row[data.column.property]">请输入错误信息</span>
                <span v-else>{{data.row[data.column.property]}}</span>
            </template>
            <template #column:edit:err="{data}">
                <erd-input ref="ruleTableInput" v-model="data.row.err" autofocus></erd-input>
            </template>

            <template #column:default:desc="{data}">
                <span v-if="!data.row[data.column.property]">请输入描述</span>
                <span v-else>{{data.row[data.column.property]}}</span>
            </template>
            <template #column:edit:desc="{data}">
                <erd-input ref="descInput" v-model="data.row[data.column.property]" autofocus></erd-input>
            </template>
        </fam-erd-table>
    </div>
    `;
});

define(['erdcloud.kit', 'account-rule-table-html'], function (ErdcKit, template) {
    const DEFAULTDATA = [
        {
            fileId: 'length',
            name: '长度限制设置',
            del_flag: '1',
            RegEx: '',
            err: '',
            desc: ''
        },
        {
            fileId: 'lowerCase',
            name: '必须包含小写字母',
            del_flag: '1',
            RegEx: '',
            err: '',
            desc: ''
        },
        {
            fileId: 'upperCase',
            name: '必须包含大写字母',
            del_flag: '1',
            RegEx: '',
            err: '',
            desc: ''
        },
        {
            fileId: 'number',
            name: '必须包含数字',
            del_flag: '1',
            RegEx: '',
            err: '',
            desc: ''
        }
    ];
    return function (fileId, callback) {
        callback({
            template,
            props: {
                data: {
                    type: Array | Object,
                    default() {
                        return [];
                    }
                },
                readonly: Boolean
            },
            components: {
                // 基础表格
                FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
            },
            data() {
                return {
                    tableHeight: '400px',
                    selectOption: [
                        {
                            displayName: '禁用',
                            value: '0'
                        },
                        {
                            displayName: '启用',
                            value: '1'
                        }
                    ],
                    lan: this.$store.state.i18n?.lang || 'zh_cn',
                    tableData: [],
                    options: [
                        {
                            value: '[a-z]+',
                            displayName: '英文小写a-z'
                        },
                        {
                            value: '[A-Z]+',
                            displayName: '英文大写A-Z'
                        },
                        {
                            value: '[0-9]+',
                            displayName: '数字0-9'
                        }
                    ],
                    defaultProps: {
                        value: 'value',
                        label: 'displayName',
                        key: 'value'
                    }
                };
            },
            watch: {},
            computed: {
                columns: {
                    get() {
                        return [
                            {
                                title: ' ',
                                prop: 'seq',
                                type: 'seq',
                                align: 'center',
                                width: '48'
                            },
                            {
                                prop: 'name',
                                title: '校验名称',
                                minWidth: '220'
                            },
                            {
                                prop: 'del_flag',
                                title: '状态',
                                editRender: {},
                                minWidth: '220'
                            },
                            {
                                prop: 'RegEx',
                                title: '规则',
                                editRender: {},
                                minWidth: '220'
                            },
                            {
                                prop: 'err',
                                title: '错误信息',
                                editRender: {},
                                minWidth: '220'
                            },
                            {
                                prop: 'desc',
                                title: '描述',
                                editRender: {},
                                minWidth: '220'
                            }
                        ];
                    },
                    set(val) {}
                },
                editConfig() {
                    return this.readonly ? {} : { trigger: 'click', mode: 'cell' };
                }
            },
            mounted() {
                this.init();
            },
            methods: {
                init() {
                    const dataArr = _.isArray(this.data) ? this.data : [this.data];
                    this.tableData = DEFAULTDATA.map((item) => {
                        const rule = (dataArr || []).find((ite) => ite.fileId === item.fileId);
                        return {
                            ...item,
                            ...rule
                        };
                    });

                    this.tableData &&
                        this.tableData.forEach((data) => {
                            this.$set(data, 'statusName', data.del_flag);
                            this.selectOption.forEach((item) => {
                                if (item.value === data.del_flag) {
                                    this.$set(data, 'statusName', item.displayName);
                                }
                            });

                            let nameDes = this.options.find((item) => data.RegEx === item.value)?.displayName;
                            if (data.fileId === 'length') {
                                nameDes = `长度不小于${data.minLength}且不得大于${data.maxLength}`;
                            }
                            this.$set(data, 'ruleDisplayName', nameDes || data.RegEx);
                        });
                },

                changeField(value, data) {
                    this.selectOption.forEach((item) => {
                        if (item.value === value) {
                            this.$set(data, 'statusName', item.displayName);
                        }
                    });
                },
                editActived({ row, column }) {
                    if (column.property === 'del_flag') {
                        this.$nextTick(() => {
                            this.$refs.statusTableSelect?.focus();
                        });
                    }
                    if (column.property === 'RegEx') {
                        this.$nextTick(() => {
                            this.$refs.ruleTableSelect?.focus();
                        });
                    }
                    if (column.property === 'err') {
                        this.$nextTick(() => {
                            this.$refs.ruleTableInput?.focus();
                        });
                    }
                    if (column.property === 'name') {
                        this.$nextTick(() => {
                            this.$refs.nameInput?.focus();
                        });
                    }
                    if (column.property === 'desc') {
                        this.$nextTick(() => {
                            this.$refs.descInput?.focus();
                        });
                    }
                },
                ruleChange(value, data) {
                    let nameArr = [];
                    this.options.forEach((item) => {
                        if (value.includes(item[this.defaultProps.value])) {
                            nameArr.push(item[this.defaultProps.label]);
                        }
                    });
                    this.$set(data, 'ruleDisplayName', nameArr.join('、'));
                },
                submit() {
                    return new Promise((resolve, reject) => {
                        if (this.tableData) {
                            const tableData = this.tableData.map((item) => {
                                let obj = {};
                                const newAttr = [
                                    'name',
                                    'RegEx',
                                    'del_flag',
                                    'err',
                                    'desc',
                                    'errLang',
                                    'fileId',
                                    'minLength',
                                    'maxLength'
                                ];
                                Object.keys(item).forEach((key) => {
                                    if (newAttr.includes(key)) {
                                        obj[key] = item[key];
                                    }
                                });
                                return obj;
                            });
                            resolve(tableData);
                        } else {
                            reject(new Error('请填入正确的信息'));
                        }
                    });
                },
                onInput(value, row) {
                    const reg = /[^0-9]/gi;
                    const minLength = _.isString(row.minLength) ? row.minLength.replace(reg, '') : row.minLength;
                    const maxLength = _.isString(row.maxLength) ? row.maxLength.replace(reg, '') : row.maxLength;
                    this.$set(row, 'minLength', minLength);
                    this.$set(row, 'maxLength', maxLength);
                },
                onBlur(value, row) {
                    this.$set(row, 'minLength', row.minLength >= 4 ? row.minLength : 4);
                    this.$set(
                        row,
                        'maxLength',
                        !row.maxLength || row.maxLength >= row.minLength ? row.maxLength : row.minLength
                    );
                    this.$set(row, 'RegEx', `^\\S{${row.minLength},${row.maxLength || row.minLength}}$`);
                    this.$set(
                        row,
                        'ruleDisplayName',
                        `长度不小于${row.minLength}且不得大于${row.maxLength || row.minLength}`
                    );
                }
            }
        });
    };
});
