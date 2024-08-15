define('password-rule-table-html', [], () => {
    return `
    <div id="password_rule_table">
        <erd-button
            v-if="!readonly"
            type="primary"
            @click="onCreate"
            >创建</erd-button
        >
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
                <erd-ex-select
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

            <template #column:default:oper="{data}">
                <erd-button type="text" @click="onDelete(data)">删除</erd-button>
            </template>
        </fam-erd-table>
    </div>
    `;
});

define(['erdcloud.kit', 'password-rule-table-html'], function (ErdcKit, template) {
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
                    tableData: JSON.parse(JSON.stringify(_.isEmpty(this.data) ? [] : this.data)),
                    options: [
                        {
                            value: '^\\S{8,16}$',
                            displayName: '长度不小于8且不得大于16'
                        },
                        {
                            value: '[a-z]+',
                            displayName: '英文小写a-z'
                        },
                        {
                            value: '[A-Z]+',
                            displayName: '英文大写A-Z'
                        },
                        {
                            value: '[!$%@#&*]+',
                            displayName: '特殊字符!$%@#&*'
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
                                editRender: {},
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
                            },
                            {
                                prop: 'oper',
                                title: '操作',
                                fixed: 'right',
                                minWidth: '100'
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
                    this.tableData &&
                        this.tableData.forEach((data) => {
                            this.$set(data, 'statusName', data.del_flag);
                            this.selectOption.forEach((item) => {
                                if (item.value === data.del_flag) {
                                    this.$set(data, 'statusName', item.displayName);
                                }
                            });

                            let nameArr = [];
                            this.options.forEach((item) => {
                                if (Array.isArray(data.RegEx) && data.RegEx.includes(item[this.defaultProps.value])) {
                                    nameArr.push(item[this.defaultProps.label]);
                                }
                            });
                            this.$set(data, 'ruleDisplayName', data.RegEx);
                            if (nameArr.length) {
                                this.$set(data, 'ruleDisplayName', nameArr.join('、'));
                            }
                        });
                },
                // 刷新表格
                reloadTable() {
                    // this.pagination.pageIndex = 1;
                    this.$nextTick(() => {
                        const $table = this.$refs['ruleTable']?.$refs.xTable;
                        setTimeout(() => {
                            $table?.updateData();
                        }, 0);
                    });
                },
                onCreate() {
                    this.tableData.unshift({
                        id: this.randomId(),
                        name: '',
                        RegEx: '',
                        del_flag: '',
                        err: '',
                        desc: '',
                        errLang: '',
                        editFlag: true
                    });
                    this.reloadTable();
                },
                onDelete(data) {
                    const { $rowIndex } = data;
                    this.$confirm('是否删除该规则?', '确认删除', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.tableData.splice($rowIndex, 1);
                        this.reloadTable();
                    });
                },

                // 生成随机数id
                randomId() {
                    return Math.round(Math.random() * 10000000000000000);
                },
                onDisable() {},
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
                            this.$refs.statusTableSelect?.toggleMenu();
                            this.$refs.statusTableSelect?.focus();
                        });
                    }
                    if (column.property === 'RegEx') {
                        this.$nextTick(() => {
                            this.$refs.ruleTableSelect?.$refs['erd-select'].toggleMenu();
                            this.$refs.ruleTableSelect?.$refs['erd-select'].focus();
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
                                const newAttr = ['name', 'RegEx', 'del_flag', 'err', 'desc', 'errLang'];
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
                }
            }
        });
    };
});
