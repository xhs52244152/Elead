define([
    ELMP.resource('erdc-pdm-common-actions/components/CommonDialog/index.js'),
    'text!' + ELMP.resource('erdc-pdm-common-actions/components/RenameDialog/index.html'),
    ELMP.resource('erdc-pdm-app/store/index.js'),
    ELMP.resource('erdc-components/FamErdTable/index.js'),
    'erdcloud.i18n',
    ELMP.resource('erdc-pdm-common-actions/components/RenameDialog/locale/index.js')
], function (commonDialog, template, rootStore, FamErdTable, ErdcI18n, locale) {
    const i18n = ErdcI18n.wrap(locale);
    return {
        name: 'commonRenameDialog',
        template,
        components: {
            commonDialog,
            FamErdTable
        },
        props: {
            rowList: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            className: String,
            renameUrl: {
                type: String,
                default: '/fam/common/rename'
            },
            updateColumns: {
                type: Function
            },
            updateValidators: {
                type: Function
            },

            showCollect: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                searchValue: '',
                columns: [],
                validators: [],
                tableData: [],
                loading: false,
                i18nMap: i18n,
                selectedData: []
            };
        },
        mounted() {
            let validators = [
                {
                    rule: (data) => data.rename,
                    message: i18n.renamePlaceholder
                },
                {
                    rule: (data) => data.rename.length <= 100,
                    message: i18n.nameMax100Tip
                },
                {
                    rule: (data) => !this.isEpmRow(data) || data.newCadName,
                    message: i18n.newCadNamePlaceholder
                },
                {
                    rule: (data) => !this.isEpmRow(data) || data.newCadName.length <= 100,
                    message: i18n.cadNameMax100Tip
                }
            ];
            this.validators = _.isFunction(this.updateValidators) ? this.updateValidators(validators) : validators;
            let columns = [
                {
                    prop: 'checkbox',
                    type: 'checkbox',
                    width: 40,
                    align: 'center'
                },
                {
                    prop: 'seq',
                    type: 'seq',
                    title: ' ',
                    width: '48',
                    align: 'center' //多选框默认居中显示
                },
                {
                    prop: 'name',
                    title: i18n.oldName
                },
                {
                    prop: 'rename',
                    title: i18n.rename,
                    editRender: {}
                },
                {
                    prop: 'identifierNo',
                    title: i18n.number
                },
                {
                    prop: 'containerRef',
                    title: i18n.context
                },
                {
                    prop: 'folderRef',
                    title: i18n.folder
                },
                ...(this.isEpm
                    ? [
                          {
                              prop: 'cadName',
                              title: i18n.oldCadName
                          },
                          {
                              prop: 'newCadName',
                              title: i18n.newCadName,
                              editRender: { autofocus: 'input.el-input__inner' }
                          }
                      ]
                    : [])
            ];
            this.columns = _.isFunction(this.updateColumns) ? this.updateColumns(columns) : columns;
            this.filterCols = this.columns.filter(({ prop }) => !['checkbox', 'seq'].includes(prop));
            this.tableData = this.rowList.map(this.formatItem);
        },
        computed: {
            // 判断是否为模型对象
            isEpm() {
                return this.className === rootStore.state.tableViewMaping.epmDocument.className;
            },
            viewTable() {
                let searchKeys = ['identifierNo', 'oldName', 'name', 'cadName'];
                return !this.searchValue
                    ? this.tableData
                    : this.tableData.filter((item) =>
                          searchKeys.some((key) => item?.[key]?.includes?.(this.searchValue))
                      );
            }
        },
        methods: {
            batchModify() {
                if (!this.selectedData.length) return this.$message.info(i18n.checkItemTip);
                let self = this;
                require([ELMP.resource('erdc-pdm-common-actions/utils.js')], (utils) => {
                    utils.mountDialog({
                        template: `
                            <commonDialog
                                @confirm="success"
                                :title="i18nMap.modify"
                                width="800px"
                            >
                                    <div slot="content" class="el-form-item is-no-asterisk el-form-item--medium fam-dynamic-form__item">
                                        <label for="name" class="el-form-item__label" style="width: 12.5%;display: flex;justify-content: flex-end;" >
                                            <div class="el-form-item__label fam-dynamic-form__label fam-dynamic-form__label--right" >
                                                重命名
                                            </div>
                                        </label>

                                        <div class="el-form-item__content" style="margin-left: 12.5%;">
                                        <erd-input
                                            autofocus
                                            v-model.trim="rename"
                                            type="text"
                                            placeholder="请输入新名称"
                                        >
                                        </erd-input>
                                    </div>
                                    </div>
                            </commonDialog>
                        `,
                        components: {
                            commonDialog
                        },
                        data() {
                            return {
                                rename: '',
                                i18nMap: i18n
                            };
                        },
                        methods: {
                            success() {
                                self.selectedData.forEach((item) => (item.rename = this.rename));
                                this.close?.();
                            }
                        }
                    });
                });
            },
            formatItem(item) {
                let res = {
                    ...item
                };
                this.filterCols.forEach(({ prop }) => {
                    res[prop] = item[`${this.className}#${prop}`] || item[prop] || '';
                });
                res.oid = item.versionOid || item.oid;
                return res;
            },
            submit() {
                this.loading = true;
                const { renameUrl, tableData, className, isEpmRow, $message } = this;

                let hasNoError = tableData.every((item) =>
                    this.validators.every(({ rule, message }) => {
                        if (!rule(item)) {
                            $message.warning(message);
                            return false;
                        }
                        return true;
                    })
                );

                if (!hasNoError) {
                    this.loading = false;
                    return;
                }
                const data = tableData.map((item) => ({
                    name: item.rename,
                    oid: item.oid,
                    cadName: isEpmRow(item) ? item.newCadName + this.getSuffix(item.cadName) : undefined
                }));

                this.$famHttp({
                    url: renameUrl,
                    data,
                    className,
                    method: 'POST',
                    errorMessage: true
                })
                    .then((r) => {
                        if (r.success) {
                            $message.success('操作成功');
                            this.$refs.dialog?.close();
                            this.$emit('success');
                        }
                    })
                    .finally(() => {
                        this.loading = false;
                    });
            },
            handleCollect() {
                // 收集相关对象
                if (!this.selectedData.length) {
                    return this.$message.info(i18n.checkItemTip);
                }
                require([
                    ELMP.resource('erdc-pdm-common-actions/index.js'),
                    ELMP.resource('erdc-pdm-common-actions/utils.js')
                ], ({ collectObject }, utils) => {
                    let currentIds = this.tableData.map((item) => item.versionOid || item.oid);
                    collectObject(this.selectedData, this.className, (data) => {
                        // 去重
                        data.forEach((i) => {
                            if (!currentIds.includes(i.versionOid || i.oid)) {
                                this.tableData.push(this.formatItem(utils.coverDataFromAttrRowList(i)));
                            }
                        });
                    });
                });
            },
            getSuffix(name) {
                return name ? '.' + name.split('.')[name.split('.').length - 1] : '';
            },
            // 复选框选中单条数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框选中全部数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            // 单元格点击编辑
            activeCellMethod({ column, row }) {
                if (column.field === 'newCadName' || column.field === `${this.className}#newCadName`) {
                    return this.isEpmRow(row);
                } else {
                    return true;
                }
            },
            isEpmRow(row) {
                return row.idKey
                    ? row.idKey === rootStore.state.tableViewMaping.epmDocument.className
                    : (row.versionOid || row.oid)?.includes?.(
                          rootStore.state.tableViewMaping.epmDocument.className + '#'
                      );
            },
            // 自动聚焦
            editActived({ column }) {
                if (column.property === 'rename') {
                    this.$nextTick(() => {
                        this.$refs.renameInput?.focus();
                    });
                } else if (column.property === 'newCadName') {
                    this.$nextTick(() => {
                        this.$refs.newCadNameInput?.focus();
                    });
                }
            }
        }
    };
});
