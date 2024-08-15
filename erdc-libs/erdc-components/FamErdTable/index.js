/**
 * # 基础表格组件
 vue组件components引入
 # 组件声明
 components: {
 // 基础表格
 FamErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
 },
 # 页面调用
 <fam-erd-table ...></fam-erd-table> 参考fam_demo示例
 *
 * **/
define([
    'text!' + ELMP.resource('erdc-components/FamErdTable/index.html'),
    ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/mixins/fieldTypeMapping.js'),
    'TreeUtil',
    'css!' + ELMP.resource('erdc-components/FamErdTable/style.css'),
    'underscore'
], function (template, fieldTypeMapping, TreeUtil) {
    const _ = require('underscore');
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        mixins: [fieldTypeMapping],
        props: {
            // 视图表格key
            tableKey: {
                type: String,
                default: ''
            },
            column: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            columnComponentProps: {
                type: Object,
                default() {
                    return {};
                }
            },
            maxLine: {
                type: Number | String,
                default: null
            },
            isEmbedTable: {
                type: Boolean,
                default() {
                    return typeof this.maxLine === 'number' ? true : false;
                }
            },
            // 是否为折叠表格，用于修改样式
            isFoldTable: {
                type: Boolean,
                default: false
            },
            // 表格风格，普通(normal-table)、嵌套(embed-table)、穿梭框嵌套(embed-transfer-table)
            tableStyle: {
                type: String,
                default: 'normal-table',
                validator(val) {
                    return ['normal-table', 'embed-table', 'embed-transfer-table'].includes(val);
                }
            },
            editRules: {
                type: Object,
                default() {
                    return {};
                }
            },
            tooltipConfig: {
                type: Object,
                default() {
                    return {
                        enterable: true,
                        contentMethod: (data) => {
                            const { column, type } = data;
                            if (type !== 'header') {
                                return null;
                            }
                            for (let item of this.column) {
                                if (
                                    ![item.attrName, item.prop].includes(column.field) ||
                                    item.toolTipsAble ||
                                    item.tips
                                ) {
                                    return null;
                                }
                                if (item._showHeaderOverflow) {
                                    return column.title || null;
                                }
                            }
                            return column.title || null;
                        }
                    };
                }
            },
            autoResize: {
                type: Boolean,
                default: true
            },
            border: {
                type: Boolean,
                default: true
            },
            stripe: {
                type: Boolean,
                default: false
            },
            showOverflow: {
                type: [Boolean, String],
                default: true
            },
            rowConfig: {
                type: Object,
                default() {
                    return {
                        isHover: true
                    };
                }
            },
            rowClassName: [String, Function],
            // 默认情况下，滚动表格会取消表格编辑状态；此配置项可屏蔽该逻辑
            keepEditActivatedWhileScrolling: Boolean
        },
        data: function () {
            return {
                filterOper: ['IS_NULL', 'IS_NOT_NULL'], // 特殊的过滤操作，不用显示表单组件
                isConfirm: false,
                // =======动态国际化
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamErdTable/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    nodata: this.getI18nByKey('暂无数据'),
                    confirm: this.getI18nByKey('确认'),
                    cancel: this.getI18nByKey('取消'),
                    enter: this.getI18nByKey('请输入'),
                    clearAll: this.getI18nByKey('清除所有列筛选'),
                    clearCurrent: this.getI18nByKey('清除当前列筛选'),
                    selectAll: this.getI18nByKey('全选'),
                    errormsg: this.getI18nByKey('筛选条件不能为空'),
                    asc: this.getI18nByKey('升序'),
                    desc: this.getI18nByKey('降序')
                },
                currentRadioRow: null,

                // vxe-table refs对象
                $table: {},
                // 控制筛选框显示隐藏
                visibleMap: {},

                // checkBox
                checkAll: false,
                isIndeterminate: false,
                showColumn: true,
                allExpanded: false,
                fixedWidthProps: ['checkbox', 'radio', 'seq', 'icon'],

                /* 编辑表格 start */
                // 排序缓存
                sortMap: {},
                title: '',
                titleMap: {},
                icon: 'erd-iconfont erd-icon-edit',
                /* 编辑表格 end */
                emptyImgSrc: ELMP.resource('erdc-assets/images/empty.svg'),
                // 筛选器缓存
                filterCache: {
                    cache: false,
                    operVal: '',
                    value: ''
                },
                /* 校验未通过原因 */
                invalidMessages: {},
                vxeColumn: []
            };
        },
        //  计算属性
        computed: {
            // 过滤表格数据
            getTableData: function () {
                let data = this.$attrs['data']?.filter((item) => item?.show ?? true);
                if (this.attrTreeConfig) {
                    data = TreeUtil.flattenTree2Array(data, {
                        childrenField: this.attrTreeConfig?.childrenField
                    });
                }
                return data;
            },
            columnConfig() {
                return this.$attrs['column-config'] || { resizable: true };
            },

            rowHeight() {
                const eleRowHeight =
                    getComputedStyle(document.documentElement).getPropertyValue('--famTableRowHeight') || 1;
                return parseInt(eleRowHeight);
            },
            maxHeight() {
                if (this.maxLine) {
                    return (this.maxLine + 1) * this.rowHeight + 16;
                }
                return this.$attrs['max-height'] || this.$attrs['maxHeight'];
            },
            minHeight() {
                // 多表格: 单行高度, 单表格: 单行高度＋暂无数据图标高度
                return this.isEmbedTable ? this.rowHeight : this.rowHeight + 140;
            },
            height() {
                // 有maxHeight时删除height 避免最大高度属性失效
                if (!this.maxHeight) {
                    return this.$attrs.height;
                }
            },
            showNoDataImg() {
                return !this.isEmbedTable;
            },
            noBorderTable() {
                return ['embed-table', 'embed-transfer-table'].includes(this.tableStyle);
            },
            attrTreeConfig() {
                return this.$attrs?.['tree-config'] || this.$attrs?.['treeConfig'] || null;
            },
            treeConfig() {
                let treeConfig = this.attrTreeConfig;
                if (treeConfig) {
                    treeConfig = {
                        iconOpen: 'erd-iconfont erd-icon-arrow-down',
                        iconClose: 'erd-iconfont erd-icon-arrow-right',
                        indent: 12,
                        ...treeConfig
                    };
                }
                return treeConfig;
            },
            editConfig() {
                const outerEditConfig = this.$attrs['edit-config'] || this.$attrs.editConfig || {};
                return {
                    ...outerEditConfig,
                    beforeEditMethod: this.beforeEditMethod,
                    icon: this.icon
                };
            },
            validateRules() {
                return this.column?.reduce((prev, column) => {
                    if (column.required !== null && column.required) {
                        const columnRules = prev[column.prop] || [];

                        if (!columnRules.find((rule) => rule.required)) {
                            columnRules.push({
                                required: true,
                                message: this.i18nMappingObj.enter + column.title
                            });
                        }
                        return {
                            ...prev,
                            [column.prop]: columnRules
                        };
                    }
                    return prev;
                }, this.editRules || {});
            }
        },
        // 监听
        watch: {
            column: {
                immediate: true,
                handler(column) {
                    if (column) {
                        column?.forEach((item) => {
                            this.titleMap[item.prop] = item.title;
                        });

                        this.setVxeColumn();
                        // 筛选器显示隐藏对象重置
                        this.getVisibleMap();

                        // 表头重新渲染
                        this.$nextTick(() => {
                            this.updateHeader();
                        });
                    }
                }
            },
            getTableData() {
                this.$nextTick(() => {
                    this.setHeaderOverflow(this.vxeColumn);
                });
            },
            'treeConfig.expandAll': {
                immediate: true,
                handler(expandAll) {
                    this.allExpanded = !!expandAll;
                }
            }
        },
        mounted: function () {
            // 赋值xtable $refs到当前组件
            this.$table = this.$refs?.xTable || {};
            // 取消vxe自带的提示
            /*this.$table.$nextTick(()=>{
                  $(this.$table.$el).find('.vxe-cell--sort i,.vxe-cell--filter i').attr('title','')
                })*/
            /* 编辑表格 start */
            this.column?.forEach((item) => {
                this.titleMap[item.prop] = item.title;
            });
            /* 编辑表格 end */
        },
        updated() {
            this.$nextTick(() => {
                this.setHeaderOverflow(this.vxeColumn);
            });
        },
        methods: {
            setVxeColumn() {
                let vxeColumn = ErdcKit.deepClone(this.column);
                if (this.tableKey) {
                    let totalWidth = 0;
                    let excludeColWidth = 0;
                    let dynamicWidth = 0;
                    const widthReg = /^(([1-9]\d*(\.\d{1,2})?)|(0\.(([1-9]\d?)|(\d[1-9]))))$/;

                    // 计算总宽度 和 视图配置的显示字段宽度
                    vxeColumn.forEach((item) => {
                        let itemWidth = item.width || item.minWidth;
                        itemWidth = parseInt(itemWidth) ? parseInt(itemWidth) : 100;

                        if (widthReg.test(itemWidth)) {
                            totalWidth += Number(itemWidth);
                            if (item.extraCol || item.isFixedWidth) {
                                excludeColWidth += Number(itemWidth);
                            } else {
                                dynamicWidth += Number(itemWidth);
                            }
                        }
                    });
                    const tableWidth = this.$table?.$el?.clientWidth;
                    if (tableWidth) {
                        vxeColumn.forEach((item) => {
                            this.titleMap[item.prop] = item.title;
                            let itemWidth = item.width || item.minWidth;
                            itemWidth = parseInt(itemWidth) ? parseInt(itemWidth) : 100;
                            if (tableWidth > totalWidth && widthReg.test(itemWidth)) {
                                if (!item.extraCol && !item.isFixedWidth) {
                                    item.width = parseInt(
                                        (tableWidth - excludeColWidth) * (Number(itemWidth) / dynamicWidth)
                                    );
                                }
                            }
                        });
                    }
                }
                this.vxeColumn = vxeColumn;
            },
            resizableChange(...args) {
                this.$emit('resizable-change', ...args);
                this.$nextTick(() => {
                    this.setHeaderOverflow(this.vxeColumn);
                });
            },
            formatEmpty({ cellValue }) {
                if (!cellValue) return '-';
                return cellValue;
            },
            mousewheel() {
                const editRecord = this.$refs.xTable.getEditRecord();
                if (!_.isEmpty(editRecord) && !this.keepEditActivatedWhileScrolling) {
                    this.$refs.xTable.clearActived();
                }
            },
            /**
             * 获取基础表格中的实例
             * @param { String } tableType 必填，表格的类型 vxeTable
             * @param { String } type 选填，输出数据的类型
             * @returns
             */
            getTableInstance(tableType, type) {
                if (!tableType) {
                    return null;
                }
                const tables = {
                    vxeTable: {
                        instance: this.$refs?.xTable || {},
                        column: this.column || []
                    }
                };

                return type ? tables[tableType][type] : tables[tableType];
            },
            // 空数据 '-' 显示
            nullData(data, column) {
                if (typeof data !== 'object' || data === null) return data;
                data = _.each(data, (item) => {
                    _.each(column, (col) => {
                        if (col.prop) {
                            item[col.prop] = !item[col.prop] ? '-' : item[col.prop];
                        }
                    });
                    if (item.children) {
                        this.nullData(item.children, column);
                    }
                });
                return data;
            },

            // 编辑表格
            tableCellClassName(data) {
                const { row, column } = data;
                const classNames = [
                    row[`erd_table-editIcon-${row.id}-${column.property}`] ? 'erd_table-editIcon' : '',
                    row[`erd_table-validerror-${row.id}-${column.property}`] ? 'erd_table-valid-error' : '',
                    row.editFlag ? ' newEditFlag' : '',
                    this.$refs.xTable.isEditByRow(row) && row[`erd_table-editCell-${column.property}-${row.id}`]
                        ? 'erd_table-editCell'
                        : ''
                ];
                if (
                    !column.type &&
                    !this.getScopedSlots('default', column.property, column) &&
                    [null, undefined, ''].includes(row[column.property])
                ) {
                    classNames.push('empty-col');
                }
                return classNames.join(' ');
            },
            // 点击编辑
            editActived(data) {
                const { row, column } = data;

                this.$set(row, `erd_table-editIcon-${row.id}-${column.property}`, true);

                _.keys(row).forEach((item) => {
                    if (column.property === item) {
                        this.$set(row, `erd_table-editCell-${column.property}-${row.id}`, true);
                    } else {
                        this.$set(row, `erd_table-editCell-${column.property}-${row.id}`, false);
                    }
                });
                this.$emit('edit-actived', data);
            },
            beforeEditMethod(data) {
                // 判断使用的地方是否有传入 beforeEditMethod ，如果有则先执行传入的beforeEditMethod，再执行必填校验逻辑
                const beforeEditMethodFn = this.$attrs?.['edit-config']?.beforeEditMethod || null;
                let beforeEditMethodFlag = true;
                if (beforeEditMethodFn && _.isFunction(beforeEditMethodFn)) {
                    beforeEditMethodFlag = beforeEditMethodFn(data);
                }
                return !(!beforeEditMethodFlag || this.preventEdit);
            },
            handleEditClosed(data) {
                let self = this;
                this.preventEdit = true;
                const { row, column } = data;
                if (this._preventValidate) {
                    return false;
                }
                if (Object.keys(this.validateRules).length > 0 && this.validateRules[data.column.field]) {
                    this.validTableRow(row)
                        .catch(() => {
                            self._preventValidate = true;
                            this.$nextTick(() => {
                                const editRecord = self.$refs.xTable.getEditRecord() || {};

                                self.$refs.xTable
                                    .setEditRow(editRecord.row || row, (editRecord.column || column).field)
                                    .finally(() => {
                                        self._preventValidate = false;
                                    });
                            });
                            // console.log(errorMsgs)
                        })
                        .finally(() => {
                            this.$emit('edit-closed', data);
                            delete self.preventEdit;
                        });
                } else {
                    this.$emit('edit-closed', data);
                    delete self.preventEdit;
                }
            },
            validateTable() {
                return this.validTable();
            },
            // 全局校验事件
            validTable() {
                let validateErrors = [];
                return Promise.all(
                    this.getTableData.map((i) => {
                        return this.validTableRow(i).catch((error) => {
                            error = _.isArray(error) ? error : [error];
                            validateErrors = validateErrors.concat(error);
                        });
                    })
                ).then(() => {
                    if (validateErrors.length) {
                        this.$refs.xTable.setEditCell(validateErrors[0].row, validateErrors[0].field);
                        return Promise.reject(validateErrors);
                    }
                    return Promise.resolve();
                });
            },
            validateRowField(rules, row, field) {
                return Promise.allSettled(
                    rules.map((rule) => {
                        return new Promise((resolve, reject) => {
                            let validator = rule.validator;
                            if (!validator && rule.required) {
                                const hasValue = _.isObject(row[field]) ? row[field]?.value : row[field];
                                if (hasValue) {
                                    resolve();
                                } else {
                                    const error = new Error(
                                        rule.message || `${this.i18nMappingObj.enter} - ${this.titleMap[field]}`
                                    );
                                    error.field = field;
                                    reject(error);
                                }
                                return;
                            }
                            if (validator && typeof validator === 'function') {
                                validator(rule, row[field], (isValid, error) => {
                                    isValid = isValid === undefined ? true : isValid;
                                    const valid = isValid instanceof Error ? false : !!isValid;
                                    const err =
                                        isValid instanceof Error ? isValid : error || new Error('数据校验未通过');

                                    if (valid) {
                                        resolve();
                                    } else {
                                        err.field = field;
                                        reject(err);
                                    }
                                })
                                    ?.then(() => resolve())
                                    ?.catch((err) => {
                                        err.field = field;
                                        reject(err);
                                    });
                            }
                        });
                    })
                ).then((args) => {
                    return args.filter((item) => item.status === 'rejected').map((item) => item.reason);
                });
            },
            // 单行校验
            validTableRow(row, _field = '') {
                return new Promise((resolve, reject) => {
                    if (_.isEmpty(this.validateRules)) {
                        resolve();
                        return;
                    }

                    let rowErrors = [];
                    ErdcKit.runQueueAsync(
                        Object.keys(this.validateRules).filter((item) => (_field ? item === _field : true)),
                        (field, index, next) => {
                            const rules = this.validateRules[field] || [];
                            if (Object.hasOwn(row, field)) {
                                this.validateRowField(rules, row, field)
                                    .then((fieldErrors) => {
                                        if (fieldErrors.length) {
                                            this.$set(
                                                this.invalidMessages,
                                                `${row.id}_${field}`,
                                                fieldErrors[0]?.message
                                            );
                                            this.$set(row, `erd_table-validerror-${row.id}-${field}`, true);
                                            this.$set(row, `erd_table-editIcon-${row.id}-${field}`, true);
                                            rowErrors = [...rowErrors, ...fieldErrors];
                                            this.$nextTick(() => {
                                                this.$emit('erd-validate-error', { row, erros: fieldErrors });
                                            });
                                        } else {
                                            this.$set(row, `erd_table-validerror-${row.id}-${field}`, false);
                                            this.$set(row, `erd_table-editIcon-${row.id}-${field}`, false);
                                        }
                                    })
                                    .finally(() => {
                                        next();
                                    });
                            } else {
                                next();
                            }
                        },
                        () => {
                            rowErrors.length ? reject(rowErrors) : resolve();
                        }
                    );
                });
            },
            // 编辑表格

            /**
             * 获取slot是否存在 兼容组件应用与页面渲染大小写问题
             * type - 插槽类型
             * prop - key
             * **/
            getScopedSlots: function (type, prop, column) {
                if (!prop) return;
                return (
                    this.$scopedSlots[`column:${type}:${prop}`] ||
                    this.$scopedSlots[`column:${type}:${prop.toLowerCase()}`] ||
                    (column && column.slots && column.slots[type])
                );
            },

            // 获取slot名称 兼容大小写
            getSlotName: function (type, prop, column) {
                let name = '';
                // 取prop
                if (this.$scopedSlots[`column:${type}:${prop}`]) {
                    name = `column:${type}:${prop}`;
                } else if (this.$scopedSlots[`column:${type}:${prop.toLowerCase()}`]) {
                    // 取prop小写
                    name = `column:${type}:${prop.toLowerCase()}`;
                } else if (column && column.slots && column.slots[type]) {
                    return column.slots[type];
                }
                return name;
            },

            // 更新表头
            updateHeader: function () {
                this.showColumn = false;
                this.$nextTick(() => {
                    this.showColumn = true;
                    this.$nextTick(() => {
                        this.setHeaderOverflow(this.vxeColumn);
                    });
                });
            },
            setHeaderOverflow(columns) {
                columns?.forEach((column) => {
                    if (column.children && column.children.length) {
                        this.setHeaderOverflow(column.children);
                    } else if (this.$refs.xTable) {
                        const columnId = this.$refs.xTable.getColumnByField(column.prop)?.id;
                        let showHeaderOverflow =
                            column.props?.showHeaderOverflow || column.props?.['show-header-overflow'];
                        if (!showHeaderOverflow && showHeaderOverflow !== false) {
                            showHeaderOverflow = true;
                        }
                        if (columnId) {
                            const $headerCell = this.$el.querySelector(
                                `.vxe-header--column.${columnId} .vxe-cell--title`
                            );

                            if ($headerCell) {
                                showHeaderOverflow = $headerCell.scrollWidth > $headerCell.clientWidth || true;
                            }
                        }
                        this.$set(column, '_showHeaderOverflow', showHeaderOverflow);
                    }
                });
            },

            // 自定义排序
            sortEvent: function (type, item) {
                let obj = {
                    field: item.prop || '', // == prop
                    order: type, // 排序方式
                    property: item.prop || '' // == prop
                };
                // 是否组合排序
                const multiple = this.$attrs['sort-config']?.multiple || false;
                if (type) {
                    // 旧排序
                    let oldOrder = this.sortMap[item.prop]?.order || null;
                    // 如果是单独排序
                    if (!multiple) {
                        this.sortMap = {};
                    }
                    //
                    this.sortMap[item.prop] = obj;
                    // 如果当前已有排序 第二次点击同一个排序
                    if (oldOrder && oldOrder == type) {
                        this.sortMap[item.prop] = null;
                    }
                }

                let sortList = [];
                Object.keys(this.sortMap).forEach((key) => {
                    if (this.sortMap[key]) {
                        sortList.push(this.sortMap[key]);
                    }
                });
                //
                // 表头重新渲染
                this.updateHeader();
                // 返回给页面
                this.$listeners?.['sort-change']?.(sortList);
            },

            // 清空排序
            clearSort: function () {
                this.sortMap = {};
                // 返回给页面
                this.$listeners?.['sort-change']?.([]);
                // 表头重新渲染
                this.updateHeader();
            },

            // 给筛选器图标添加高亮
            isCurrentActive: function (item) {
                // 字符串以及数组
                return (
                    this.visibleMap[item.prop].visible ||
                    item.isCurrentActive ||
                    !this.isShowFilterComponent(item?.filter?.componentName, item?.filter?.operVal)
                );
            },

            // 获取所有需要添加筛选器的字段
            getVisibleMap: function () {
                let obj = {};
                this.column?.forEach((item) => {
                    if (item.filter) {
                        obj[item.prop] = { visible: false };
                    }
                });
                this.visibleMap = obj;
            },

            // 筛选器显示
            showFilterEvent(item) {
                let { filter = {} } = item;
                if (filter.operationList?.length === 1) {
                    filter.operVal = filter.operationList[0].value ?? '';
                }

                if (!filter.operVal && ![false, 0].includes(filter.operVal) && filter.operationList) {
                    if (filter.operationList.some((item) => item.value === 'EQ')) {
                        this.$set(filter, 'operVal', 'EQ');
                    } else if (filter.operationList[0]) {
                        this.$set(filter, 'operVal', filter.operationList[0].value);
                    }
                }
                this.filterCache = {
                    cache: true,
                    operVal: filter.operVal,
                    value: filter.value,
                    value1: filter.value1 || []
                };
            },

            // 筛选器显示隐藏
            togglePopShow: function (item, type) {
                const { prop } = item;
                const { visible } = this.visibleMap[prop];
                if (type === 'clear') {
                    this.$set(item, 'isCurrentActive', false);
                }
                setTimeout(() => {
                    this.visibleMap[prop] = { visible: !visible };
                    const keys = 'popContral-' + prop;
                    // popover table Fixde导致的重复问题
                    this.$nextTick(() => {
                        this.$refs?.[keys]?.forEach((VueComponent, i) => {
                            if (i !== 0) {
                                $(VueComponent.$refs.popper.__vue__.$el).hide();
                            }
                        });
                    });
                }, 0);
            },

            // 表格左右滚动收起高级筛选面板
            tableScroll(...args) {
                let { isX = false, type, prop } = args[0];
                if (isX && type === 'body') {
                    window.requestAnimationFrame(() => {
                        _.each(this.visibleMap, (value, key) => {
                            if (value.visible) {
                                prop = key;
                            }
                        });
                        if (prop) {
                            this.togglePopShow(args[0]);
                        }
                    });
                }
            },

            // 筛选器点击确认取消
            updateFilterVisible: function (type, item) {
                // 数据为空
                if (
                    type === 'confirm' &&
                    this.isShowFilterComponent(item?.filter?.componentName, item?.filter?.operVal)
                ) {
                    let isNull = [item.filter.value, item.filter.value1, item.filter.value2].includes('');
                    this.$set(item, 'isCurrentActive', true);
                    if (isNull) {
                        return this.$message({
                            message: this.i18nMappingObj.errormsg,
                            type: 'warning'
                        });
                    }
                }
                if (typeof item.filter._value1 !== 'undefined' || typeof item.filter._value2 !== 'undefined') {
                    item.filter.value1 = [item.filter._value1, item.filter._value2].filter((i) => i !== undefined);
                }
                if (!this.isShowFilterComponent(item?.filter?.componentName, item?.filter?.operVal)) {
                    item.filter.value = '';
                }
                // 页面回调
                item.filter?.submit?.({ type, item });
                this.filterCache.cache = false;
                // 隐藏面板
                this.togglePopShow(item);
            },

            // 清除组件的值 搜索[filterInput] 多选[filterCheckbox] 单选[filterSelect]
            clearVal: function (type, item) {
                // 清除缓存
                this.filterCache.cache = false;
                // filterCheckbox 数组类型清除
                if (type == 'filterCheckbox') {
                    item.filter.value = [];
                    this.checkAll = false;
                    this.isIndeterminate = false;
                } else if (type === 'dynamicFilter') {
                    // 动态组件过滤
                    item.filter.value = undefined;
                    item.filter.operVal = '';
                    if (ErdcKit.isSameComponentName(item.componentName, 'erd-input-number')) {
                        // 动态组件过滤
                        item.filter.value = undefined;
                    }
                } else {
                    // 其他字符串类型清除
                    item.filter.value = '';
                }
            },

            // 筛选清除
            clearFilter: function ({ type, item }) {
                // 清除组件数据
                this.vxeColumn?.forEach((res) => {
                    if (res.filter && Object.keys(res.filter).length) {
                        // 单个清除
                        if (type == 1 && item.prop == res.prop) {
                            this.clearVal(res.filter.type, res);
                        } else if (type == 2) {
                            // 批量清除
                            this.clearVal(res.filter.type, res);
                        }
                    }
                });
                // 页面调用 自定义的筛选要用户自行清除
                this.$listeners?.['clear-filter']?.({ type, item });
                // 隐藏菜单
                this.togglePopShow(item, 'clear');
            },

            // 全选
            handleCheckAllChange: function (value, item) {
                item.filter.value = value ? item.filter?.options.map((item) => item.name) : [];
                this.isIndeterminate = false;
            },
            // 单个勾选
            handleCheckedChange: function (value, item) {
                let checkedCount = value.length;
                this.checkAll = checkedCount === item.filter?.options?.length;
                this.isIndeterminate = checkedCount > 0 && checkedCount < item.filter.options.length;
            },

            // 选择筛选器选择
            filterSelect: function (data, item) {
                // 赋值
                item.filter.value = data.name;
                // 隐藏菜单
                this.togglePopShow(item);
                // 页面回调
                item.filter?.submit?.({ type: 'confirm', item });
            },
            // 根据组件名，映射需要显示的组件
            showComponent(compName) {
                return this.fnComponentHandle(compName).showComponent;
            },
            isShowFilterComponent(compName, operVal) {
                return this.fnOperatorHandle({ operator: operVal, value: '' });
            },
            // 动态渲染组件额外配置
            additionalConfiguration(data) {
                let props = this.generateAdditionalProp(data);
                if (data.componentJson) {
                    try {
                        props = Object.assign(JSON.parse(data.componentJson).props || {}, props);
                    } catch (e) {
                        // do nothing
                    }
                }
                if (ErdcKit.isSameComponentName(data.componentName, 'fam-participant-select')) {
                    props.threeMemberEnv = props.threeMemberNev ?? false;
                }
                const outterProps = this.columnComponentProps?.[data.attrName] || {};
                return Object.assign({}, props, outterProps);
            },
            setAllTreeExpand() {
                this.allExpanded = !this.allExpanded;
                this.$refs.xTable.setAllTreeExpand(this.allExpanded);
                this.$emit('all-expand-toggle', this.allExpanded);
                this.$nextTick(() => {
                    this.$emit('all-expand-toggled', this.allExpanded);
                });
            },
            innerRowClassName(data) {
                const { row } = data;
                const xTable = this.$refs.xTable;
                const checkboxRecords = (xTable?.getCheckboxRecords && xTable.getCheckboxRecords()) || [];

                const childList =
                    row[this.treeConfig?.childrenField] || row[this.treeConfig?.children] || row.children || [];

                const classNames = [
                    row[this.treeConfig?.hasChildField] || !_.isEmpty(childList) ? 'is-parent' : 'is-leaf'
                ];

                if (typeof this.rowClassName === 'function') {
                    classNames.push(this.rowClassName(data));
                } else if (this.rowClassName) {
                    classNames.push(this.rowClassName);
                }
                if (row === this.currentRadioRow) {
                    classNames.push('is-current-row');
                }
                if (checkboxRecords.includes(row)) {
                    classNames.push('is-checked');
                }
                return classNames.filter(Boolean).join(' ');
            },
            isCustomDate(item) {
                return ErdcKit.isSameComponentName(
                    this.fnComponentHandle(item.componentName)?.showComponent,
                    'CustomDateTime'
                );
            },
            handleRadioChange({ row }) {
                this.currentRadioRow = row;
            },
            handleChange(row, value, data) {
                this.$set(row, 'defaultValue', data);
            }
        }
    };
});
