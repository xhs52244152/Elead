define([
    ELMP.resource('erdc-pdm-common-actions/components/CommonDialog/index.js'),
    'text!' + ELMP.resource('erdc-pdm-common-actions/components/SetStateDialog/index.html'),
    ELMP.resource('erdc-pdm-app/store/index.js'),
    ELMP.resource('erdc-components/FamErdTable/index.js'),
    'erdcloud.i18n',
    ELMP.resource('erdc-pdm-common-actions/components/SetStateDialog/locale/index.js')
], function (commonDialog, template, rootStore, FamErdTable, ErdcI18n, locale) {
    const i18n = ErdcI18n.wrap(locale);
    return {
        name: 'commonSetStateDialog',
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
            setStateUrl: {
                type: String,
                default: '/change/common/batchResetState'
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
                selectedData: [],
                stateListMap: {}
            };
        },
        mounted() {
            let validators = [
                {
                    rule: (data) => data.state,
                    message: i18n.statePlaceholder
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
                    prop: 'identifierNo', // 属性key
                    title: i18n.number // 属性名称
                },
                {
                    prop: `name`, // 属性key
                    title: i18n.name // 属性名称
                },
                {
                    prop: 'lifecycleStatus.status', // 属性key
                    title: i18n.currentState, // 属性名称
                    originProp: 'lifecycleStatus.status',
                    width: '140'
                },
                {
                    prop: 'state', // 属性key
                    title: i18n.lifecycleState, // 属性名称
                    width: '140',
                    editRender: {}
                }
            ];
            this.columns = _.isFunction(this.updateColumns) ? this.updateColumns(columns) : columns;
            this.filterCols = this.columns.filter(({ prop }) => !['checkbox', 'seq'].includes(prop));
            this.tableData = this.rowList.map(this.formatItem);

            this.loadStateList();
        },
        computed: {
            viewTable() {
                let searchKeys = ['identifierNo', 'name'];
                return !this.searchValue
                    ? this.tableData
                    : this.tableData.filter((item) =>
                          searchKeys.some((key) => item?.[key]?.includes?.(this.searchValue))
                      );
            }
        },
        methods: {
            loadStateList() {
                let map = {};
                this.tableData.forEach((row) => {
                    let id = this.getId(row),
                        idKey = id?.split?.(':')?.[1] || '';
                    if (id && this.stateListMap[id]) {
                        return;
                    }
                    if (id && idKey) {
                        map[idKey] = map[idKey] || [];
                        map[idKey].push(id);
                    }
                });

                Object.keys(map).forEach((className) => {
                    let branchIdList = map[className];
                    this.$famHttp({
                        url: '/document/common/template/states',
                        data: {
                            branchIdList,
                            className,
                            successionType: 'SET_STATE'
                        },
                        method: 'POST'
                    }).then((res) => {
                        Object.keys(res.data).forEach((id) => {
                            this.stateListMap[id] = res.data[id];
                        });
                    });
                });
            },
            batchModify() {
                if (!this.selectedData.length) return this.$message.info(i18n.checkItemTip);
                if (
                    this.selectedData.some((item, index) => {
                        let _index = index,
                            flag = false;
                        while (flag || _index > this.selectedData.length - 1) {
                            _index++;
                            let idKey = this.getId(item)?.split(':')?.[1],
                                nextIdKey = this.getId(this.selectedData[_index])?.split(':')?.[1];
                            if (idKey && nextIdKey && idKey !== nextIdKey) {
                                // 存在超过一种的数据类型
                                flag = true;
                            }
                        }
                        return flag;
                    })
                ) {
                    return this.$message.info(i18n.disallowMultiType);
                }
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
                                                生命周期状态
                                            </div>
                                        </label>

                                        <div class="el-form-item__content" style="margin-left: 12.5%;">
                                        <custom-select
                                            v-model="state"
                                            :row="{
                                                componentName: 'constant-select',
                                                clearNoData: true,
                                                viewProperty: 'displayName',
                                                valueProperty: 'name',
                                                referenceList: stateList
                                            }"
                                        ></custom-select>
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
                                state: '',
                                i18nMap: i18n,
                                stateList: self.selectedData.reduce((res, item, index) => {
                                    let itemStateList = self.stateListMap?.[self.getId(item) || ''] || [];
                                    if (!index) {
                                        return itemStateList;
                                    }
                                    return res.filter((resItem) =>
                                        itemStateList.find((stateItem) => stateItem.name === resItem.name)
                                    );
                                }, [])
                            };
                        },
                        methods: {
                            success() {
                                self.selectedData.forEach((item) => (item.state = this.state));
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
                const { setStateUrl, tableData, className, $message } = this;

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
                const resetVoList = tableData.map((item) => ({
                    oid: item.oid,
                    stateName: item.state
                }));

                this.$famHttp({
                    url: setStateUrl,
                    data: {
                        resetVoList,
                        className
                    },
                    className,
                    method: 'POST'
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

                        this.loadStateList();
                    });
                });
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
                return true;
            },
            editActived({ column, row }) {
                if (column.property === 'state') {
                    this.$nextTick(() => {
                        this.$refs.customSelectRef?.focus();
                    });
                }
            },
            getId(row) {
                return row?.versionOid || row.relationOid || row.oid;
            },
            getStatusDisplayName(row) {
                let { stateListMap, getId } = this;
                return (stateListMap[getId(row)] || []).find((item) => item.name === row.state)?.displayName || '';
            }
        }
    };
});
