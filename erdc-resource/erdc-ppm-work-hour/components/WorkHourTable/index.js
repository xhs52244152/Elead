define([
    'text!' + ELMP.func('erdc-ppm-work-hour/components/WorkHourTable/index.html'),
    'erdcloud.kit',
    ELMP.func('erdc-ppm-work-hour/app/store/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.func('erdc-ppm-work-hour/views/style.css')
], function (template, ErdcKit, store, commonHttp) {
    return {
        template,
        props: {
            status: {
                type: String,
                validate(val) {
                    return ['readonly', 'editable'].includes(val);
                },
                default: 'editable'
            },
            week: {
                type: Array,
                default() {
                    return [];
                }
            },
            dialogConfig: {
                type: Object,
                default() {
                    return {
                        props: {},
                        listeners: {}
                    };
                }
            },
            data: {
                type: Array,
                default() {
                    return [];
                }
            },
            workHourClassName: String,
            typeReference: {
                type: Object,
                default: () => {
                    return {
                        key: '',
                        id: ''
                    };
                }
            },
            readonly: {
                type: Boolean,
                default: false
            }
        },
        components: {
            FamAdvancedTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamAdvancedTable/index.js')),
            FamAssociationObject: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAssociationObject/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-work-hour/locale/index.js'),
                i18nMappingObj: {
                    name: this.getI18nByKey('name'), // 名称
                    opt: this.getI18nByKey('opt'), // 操作
                    registerDuration: this.getI18nByKey('registerDuration'), // 登记时长
                    amount: this.getI18nByKey('amount'), // 合计
                    savedSuccess: this.getI18nByKey('savedSuccess'), // 保存成功
                    confirm: this.getI18nByKey('confirm'), // 确定
                    cancel: this.getI18nByKey('cancel'), // 取消
                    desc: this.getI18nByKey('desc'), // 描述
                    durationTips: this.getI18nByKey('durationTips'), // 请填写登记时长
                    dataSizeTips: this.getI18nByKey('dataSizeTips'), // 数据不能小于等于0
                    decimalTips: this.getI18nByKey('decimalTips'), // 小数点后最多一位
                    deleteTips: this.getI18nByKey('deleteTips'), // 确定删除吗
                    delete: this.getI18nByKey('delete'), // 删除
                    deleteSuccess: this.getI18nByKey('deleteSuccess'), // 删除成功
                    hour: this.getI18nByKey('hour'), // 小时
                    workReadonlyTitle: this.getI18nByKey('workReadonlyTitle'), // 该日期工时已提交审批，不允许操作
                    belongProject: this.getI18nByKey('belongProject')
                },
                formData: {
                    dataHour: 0,
                    dataDesc: ''
                },
                formInstanceKey: Date.now(),
                showDialog: false,
                vm: null,
                timeEnterPanelVisible: false,
                currentRow: {},
                currentField: '',
                panelX: 0,
                panelY: 0,
                isModified: false,
                singleSaving: false,
                placeholder: '<span class="ppm-work-hour-table-line"></span>',
                selectedProjectOid: '',
                urlConfig: {},
                tableKey: 'taskView'
            };
        },
        computed: {
            className() {
                return store.state.classNameMapping.workHour;
            },
            taskClassName() {
                return `${store.state.classNameMapping.task}#`;
            },
            // 增加对象列头配置
            leftTableColumns() {
                return [
                    {
                        minWidth: '40',
                        width: '40',
                        type: 'checkbox',
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo',
                        title: this.i18n.code, //编码
                        width: 140
                    },
                    {
                        prop: 'name',
                        title: this.i18n.name, //名称
                        width: 200
                    },
                    {
                        prop: 'typeReference',
                        width: 80,
                        title: this.i18n.type //类型
                    },
                    {
                        prop: 'lifecycleStatus.status',
                        width: 80,
                        title: this.i18n.status //状态
                    },
                    {
                        prop: 'projectRef',
                        width: 220,
                        title: this.i18n.belongProject //所属项目
                    }
                ];
            },
            allColumns() {
                let { i18nMappingObj, workHourClassName } = this;
                let columns = [
                    {
                        label: i18nMappingObj.name,
                        attrName: 'name',
                        width: 400,
                        editRender: null
                    },
                    {
                        label: i18nMappingObj.belongProject,
                        attrName: 'projectName',
                        width: 120,
                        hide: workHourClassName !== 'erd.cloud.ppm.timesheet.entity.TaskTimesheet',
                        editRender: null
                    },
                    ...this.weekDayColumns
                ];
                if (!this.readonly)
                    columns.push({
                        label: i18nMappingObj.opt,
                        attrName: 'operation',
                        width: 100
                    });
                return columns;
            },
            weekDayColumns() {
                let result = this.week.map((day, index) => {
                    return {
                        attrName: `attr_${index}`,
                        weekDay: day.weekDay,
                        date: day.dateName,
                        time: day.date,
                        type: 'workhour',
                        editRender: {}
                    };
                });
                return result;
            },
            slotsNameList() {
                return this.slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            slotsField() {
                let headerSlotsField = [];
                let contentSlotsField = [];
                let footerSlotsField = [];

                this.week.map((day, index) => {
                    headerSlotsField.push({
                        prop: `attr_${index}`,
                        type: 'header'
                    });

                    contentSlotsField.push({
                        prop: `attr_${index}`,
                        type: 'default'
                    });

                    footerSlotsField.push({
                        prop: `attr_${index}`,
                        type: 'footer'
                    });
                });

                let others = [
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];

                return [...headerSlotsField, ...contentSlotsField, ...footerSlotsField, ...others];
            },
            viewTableConfig() {
                const _this = this;
                const { getFooterData } = this;
                return {
                    tableBaseConfig: {
                        showOverflow: true,
                        maxLine: 6,
                        stripe: false,
                        showFooter: true,
                        footerMethod: getFooterData
                        // editConfig: { trigger: 'click', mode: 'cell', showUpdateStatus: true }
                    },
                    // 视图的高级表格配置，使用继承方式，参考高级表格用法
                    toolbarConfig: {
                        // 工具栏
                        showConfigCol: false, // 是否显示配置列，默认显示
                        showMoreSearch: false, // 是否显示高级搜索，默认显示
                        showRefresh: false,
                        fuzzySearch: {
                            show: false // 是否显示普通模糊搜索，默认显示
                        },
                        basicFilter: {
                            show: false
                        }
                    },
                    addSeq: false,
                    fieldLinkConfig: {
                        fieldLink: false
                    },
                    pagination: {
                        showPagination: false
                    },
                    slotsField: _this.slotsField,
                    columns: _this.allColumns
                };
            },
            formConfig() {
                let { i18nMappingObj } = this;
                const formConfig = [
                    {
                        field: 'dataHour',
                        component: 'ErdInput',
                        label: i18nMappingObj.registerDuration,
                        required: true,
                        col: 24,
                        validators: [
                            {
                                validator: (rule, value, callback) => {
                                    if (_.isString(value) && !value.trim()) {
                                        callback(new Error(i18nMappingObj.durationTips));
                                    } else if (value <= 0) {
                                        callback(new Error(i18nMappingObj.dataSizeTips));
                                    } else if (
                                        value?.toString().indexOf('.') > -1 &&
                                        Number(value).toFixed(1) !== value?.toString()
                                    ) {
                                        callback(new Error(i18nMappingObj.decimalTips));
                                    } else {
                                        callback();
                                    }
                                },
                                trigger: ['change', 'blur']
                            }
                        ],
                        slots: {
                            component: 'workHourAppend'
                        }
                    },
                    {
                        field: 'dataDesc',
                        component: 'ErdInput',
                        label: i18nMappingObj.desc,
                        required: true,
                        col: 24,
                        props: {
                            type: 'textarea',
                            showWordLimit: true,
                            maxlength: 500,
                            autosize: { minRows: 3, maxRows: 5 }
                        }
                    }
                ];
                return formConfig;
            }
        },
        watch: {
            data: {
                immediate: true,
                handler() {
                    this.renderTableData();
                }
            }
        },
        created() {
            this.vm = this;
            this.selectedProjectOid = this.$route.query?.pid || '';
        },
        mounted() {
            window.addEventListener(
                'scroll',
                () => {
                    this.timeEnterPanelVisible = false;
                },
                true
            );
        },
        methods: {
            getActionConfig(row) {
                return {
                    name: 'PPM_TIMESHEET_REGISTRATION_OPERATE_MENU',
                    objectOid: row.dataOid,
                    className: this.className
                };
            },
            onRowMenuClick({ name }, scope) {
                let { splitItem, removeItem } = this;
                switch (name) {
                    case 'PPM_TIMESHEET_REGISTRATION_SPLIT':
                        splitItem(scope);
                        break;
                    case 'PPM_TIMESHEET_REGISTRATION_DELETE':
                        removeItem(scope.row);
                        break;
                    default:
                }
            },
            refreshLeftTable() {
                // 这里有的搜索条件是复制计划列表的请求参数
                if (this.workHourClassName === 'erd.cloud.ppm.timesheet.entity.TaskTimesheet') {
                    this.urlConfig = {
                        data: {
                            conditionDtoList: [
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#projectRef',
                                    oper: 'EQ',
                                    value1: this.selectedProjectOid
                                },
                                {
                                    attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                                    oper: 'NE',
                                    logicalOperator: 'AND',
                                    sortOrder: 0,
                                    isCondition: true,
                                    value1: 'CROPPED',
                                    children: []
                                },
                                {
                                    logicalOperator: 'AND',
                                    sortOrder: 1,
                                    isCondition: false,
                                    children: [
                                        {
                                            logicalOperator: 'AND',
                                            sortOrder: 0,
                                            isCondition: false,
                                            children: [
                                                {
                                                    attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                                                    oper: 'EQ',
                                                    logicalOperator: 'AND',
                                                    sortOrder: 0,
                                                    isCondition: true,
                                                    value1: 'DRAFT',
                                                    children: []
                                                },
                                                {
                                                    attrName: 'erd.cloud.ppm.plan.entity.Task#ownedByRef',
                                                    oper: 'CURRENT_USER',
                                                    logicalOperator: 'AND',
                                                    sortOrder: 1,
                                                    isCondition: true,
                                                    children: []
                                                }
                                            ]
                                        },
                                        {
                                            logicalOperator: 'OR',
                                            sortOrder: 1,
                                            isCondition: false,
                                            children: [
                                                {
                                                    attrName: 'erd.cloud.ppm.plan.entity.Task#lifecycleStatus.status',
                                                    oper: 'NE',
                                                    logicalOperator: 'AND',
                                                    sortOrder: 0,
                                                    isCondition: true,
                                                    value1: 'DRAFT',
                                                    children: []
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            deleteNoPermissionData: true
                        }
                    };
                } else {
                    this.urlConfig = {};
                }
            },
            renderTableData() {
                // 根据目前绑定的data数据刷新
                ErdcKit.deferredUntilTrue(
                    () => {
                        return this.$refs.table;
                    },
                    () => {
                        this.$refs.table.tableData = [];
                        this.data.forEach((item) => {
                            this.$refs.table.tableData.push(JSON.parse(JSON.stringify(item)));
                        });
                    }
                );
            },
            getTableData() {
                return this.$refs.table.tableData || [];
            },
            getIsModified() {
                return this.isModified;
            },
            setIsModified(value = false) {
                this.isModified = value;
            },
            getTimeDisplayName(scope) {
                let { i18nMappingObj } = this;
                let attrName = scope.column.field;
                let workHour = scope.row[attrName]?.workHour || '';
                let displayName = workHour === '' ? this.placeholder : `${workHour} ${i18nMappingObj.hour}`;
                return displayName;
            },
            addObject() {
                this.showDialog = true;
                this.selectedProjectOid = '';
            },
            beforeDialogConfirm(data, next) {
                data.forEach((item) => {
                    let newObj = {
                        name: item.name,
                        dataOid: item.oid,
                        dataId: Date.now(),
                        isOrigin: false,
                        projectName: item.projectRef
                    };
                    this.week.forEach((day, index) => {
                        newObj[`attr_${index}`] = {
                            workHour: '',
                            description: '',
                            dayOfWeek: index + 1
                        };
                    });
                    this.$refs.table.tableData.push(newObj);

                    this.isModified = true;
                });

                next();
            },
            getFooterData({ data }) {
                const { placeholder, i18nMappingObj } = this;
                let result = [];
                // 任务工时下所属项目传个空进去,所属项目列是不需要再表格脚步展示的
                if (this.workHourClassName !== 'erd.cloud.ppm.timesheet.entity.TaskTimesheet') {
                    result = [i18nMappingObj.amount].concat([...new Array(this.week.length)].map(() => placeholder));
                } else {
                    result = [i18nMappingObj.amount, ''].concat(
                        [...new Array(this.week.length)].map(() => placeholder)
                    );
                }
                data.forEach((row) => {
                    this.week.forEach((day, index) => {
                        let attrName = `attr_${index}`;
                        let idx = index + 1;
                        if (this.workHourClassName === 'erd.cloud.ppm.timesheet.entity.TaskTimesheet') {
                            idx = index + 2;
                        }
                        result[idx] = result[idx] === placeholder ? 0 : result[idx];
                        result[idx] = (result[idx] * 10 + Number(row[attrName]?.workHour || '') * 10) / 10;
                    });
                });

                result = [
                    result.map((item) => {
                        if (!_.isNumber(item)) return item;
                        if (item > 0) return `${item} ${i18nMappingObj.hour}`;
                        else return placeholder;
                    })
                ];

                return result;
            },
            changeValue() {
                this.$refs.form.submit(({ valid }) => {
                    if (!valid) {
                        return;
                    } else {
                        let { currentRow, currentField } = this;
                        let data = currentRow[currentField];
                        if (data.workHour !== this.formData.dataHour || data.description !== this.formData.dataDesc) {
                            currentRow[`dirty_${currentField}`] = true;
                            this.isModified = true;
                        }

                        // 执行单个保存
                        this.singleSave(data, currentRow, this.formData).then(() => {
                            this.$refs.table?.getTableInstance('vxeTable')?.instance?.updateFooter();
                            this.closeTimeEnterPanel();
                        });
                    }
                });
            },
            // 单个保存
            singleSave(data, row, formData) {
                this.singleSaving = true;
                const { className, typeReference, weekDayColumns } = this;
                const isUpdate = !!data.oid;
                const typeOid = `OR:${typeReference.key}:${typeReference.id}`;
                // 组装参数
                let attr = {
                    startTime: weekDayColumns[data.dayOfWeek - 1].time,
                    workHour: formData.dataHour,
                    description: formData.dataDesc,
                    contextRef: row.dataOid,
                    typeReference: typeOid
                };

                let attrRawList = [
                    ...Object.keys(attr).map((key) => {
                        return {
                            attrName: key,
                            value: attr[key]
                        };
                    })
                ];

                let requestData = {
                    appName: '',
                    associationField: '',
                    attrRawList,
                    className,
                    typeReference: typeOid,
                    oid: isUpdate ? data.oid : void 0
                };

                return new Promise((resolve, reject) => {
                    let { i18nMappingObj } = this;
                    let request = isUpdate ? commonHttp.commonUpdate : commonHttp.commonCreate;
                    request({ data: requestData })
                        .then((resp) => {
                            if (!isUpdate) data.oid = resp.data;
                            data.workHour = formData.dataHour;
                            data.description = formData.dataDesc;
                            this.$message.success(i18nMappingObj.savedSuccess);
                            resolve(resp);
                        })
                        .catch(reject)
                        .finally(() => {
                            this.singleSaving = false;
                        });
                });
            },
            onShowTimeEnterPanel($event, row, column) {
                let attrName = column.field;
                let workHour = row[attrName]?.workHour || '';
                // 如果只是查看并且没有值，则不弹出框
                if (!workHour && this.readonly) return;
                // 测试元素位移
                let { left, top } = $event.target.getBoundingClientRect();
                this.panelX = left + 16;
                this.panelY = top - 4;
                this.closeTimeEnterPanel();

                // 新日期需要设置一下初始值
                row[column.field] = row[column.field] || {
                    workHour: '',
                    description: '',
                    dayOfWeek: +column.field.split('_')[1] + 1
                };
                this.currentRow = row;
                this.currentField = column.field;
                this.formData.dataHour = row[column.field].workHour;
                this.formData.dataDesc = row[column.field].description;

                this.$nextTick(() => {
                    // 展开面板
                    this.timeEnterPanelVisible = true;
                });
            },
            closeTimeEnterPanel() {
                this.timeEnterPanelVisible = false;
                this.formInstanceKey = Date.now();
            },
            splitItem({ row, $rowIndex }) {
                let newRow = {
                    ...row,
                    dataId: Date.now(),
                    isOrigin: false
                };

                Object.keys(row).forEach((key) => {
                    if (key.search('attr_') === 0) {
                        let index = key.split('_')[1];
                        newRow[key] = {
                            workHour: '',
                            description: '',
                            dayOfWeek: +index + 1
                        };
                    }
                });

                this.$refs.table.tableData.splice($rowIndex + 1, 0, newRow);
                this.isModified = true;
            },
            removeItem(row) {
                let { i18nMappingObj } = this;
                this.$confirm(i18nMappingObj.deleteTips, i18nMappingObj.delete, {
                    distinguishCancelAndClose: true,
                    confirmButtonText: i18nMappingObj.confirm,
                    cancelButtonText: i18nMappingObj.cancel,
                    type: 'warning'
                }).then(() => {
                    // 如果是空行，则前端删除，否则调接口
                    let isEmptyRow = true;
                    let oidList = [];
                    this.week.forEach((day, index) => {
                        let oid = row[`attr_${index}`]?.oid;
                        if (oid) {
                            isEmptyRow = false;
                            oidList.push(oid);
                        }
                    });

                    let filterTableData = () => {
                        this.$refs.table.tableData = this.$refs.table?.tableData?.filter((item) => {
                            return item !== row;
                        });
                        this.isModified = true;
                        this.$message.success(i18nMappingObj.deleteSuccess);
                    };

                    if (isEmptyRow) {
                        filterTableData();
                    } else {
                        commonHttp
                            .deleteByIds({
                                data: {
                                    catagory: 'DELETE',
                                    className: this.className,
                                    oidList
                                }
                            })
                            .then(filterTableData);
                    }
                });
            },
            onBlur() {
                let val = this.formData.dataHour;
                if (val > 24) this.formData.dataHour = 24;
                else if (val && val <= 0) this.formData.dataHour = 0.1;
            },
            isDirty() {
                // return row[`dirty_${column.field}`];
                return false;
            },
            getFooterDisplayName(scope) {
                return scope.items[scope.$columnIndex];
            }
        },
        beforeDestroy() {
            window.removeEventListener('scroll', () => {});
        }
    };
});
