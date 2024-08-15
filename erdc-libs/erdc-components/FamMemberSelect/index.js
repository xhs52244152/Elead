define([
    'axios',
    'text!' + ELMP.resource('erdc-components/FamMemberSelect/index.html'),
    ELMP.resource('erdc-components/FamUserMixin.js'),
    'erdc-kit',
    ELMP.resource('erdc-components/EmitterMixin.js'),
    'css!' + ELMP.resource('erdc-components/FamMemberSelect/style.css')
], function (axios, template, FamUserMixin, utils, EmitterMixin) {
    const FamKit = require('fam:kit');
    const CancelToken = axios.CancelToken;

    return {
        template,
        mixins: [EmitterMixin, FamUserMixin],
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            customUrl: {
                type: String,
                default: () => {
                    return '';
                }
            },
            // 是否多选
            multiple: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 是否查询时效的人员信息
            isgetdisable: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },

            // 搜索范围 1-全部[all] 2-群组[group] 3-容器[container]
            searchScop: {
                type: String,
                default: () => {
                    return 'all';
                }
            },

            // 查询其他参数
            params: {
                type: Object,
                default: () => {
                    return {
                        groupId: '', // 群组id
                        orgId: '' // 组织id
                    };
                }
            },

            // 绑定的值
            value: {
                type: Array | String,
                default() {
                    return this.multiple ? [] : '';
                }
            },

            // 默认值 编辑返显使用
            defaultValue: {
                type: [Array, Object, String],
                default: () => {
                    return [];
                }
            },

            // 表格高度
            tableHeight: {
                type: String | Number,
                default: () => {
                    return 244;
                }
            },

            // 表格宽度 如果设置宽度表格为自适应
            tableWidth: {
                type: String | Number,
                default: () => {
                    return 0;
                }
            },

            // 是否固定表格高度
            fixedHeight: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 是否展开表格
            openTable: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },

            // 是否显示输入字数统计
            showWordLimit: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            disabled: {
                type: Boolean,
                default: false
            },
            clearable: {
                type: Boolean,
                default: true
            },
            popperClass: String,
            autofocus: Boolean,
            containerOid: {
                type: String,
                default: ''
            },
            disabledArray: {
                type: Array,
                default() {
                    return [];
                }
            }
        },

        data: function () {
            return {
                // 动态国际化 必须在data里面设置
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-components/FamMemberSelect/locale/index.js'),
                // 国际化页面引用对象
                i18nMappingObj: {
                    placeholder_1: this.getI18nByKey('placeholder_1'),
                    placeholder_2: this.getI18nByKey('placeholder_2'),
                    name: this.getI18nByKey('姓名'),
                    no: this.getI18nByKey('工号'),
                    department: this.getI18nByKey('部门'),
                    copyMsg: this.getI18nByKey('copyMsg'),
                    errorMsg: this.getI18nByKey('errorMsg'),
                    notFind: this.getI18nByKey('notFind'),
                    nodata: this.getI18nByKey('暂无数据'),
                    userNoFound: this.getI18nByKey('未找到用户'),
                    showAll: this.getI18nByKey('展示已经勾选的数据'),
                    copySuccess: this.getI18nByKey('复制内容成功'),
                    copyFailure: this.getI18nByKey('复制内容失败')
                },
                type: 1, // 组件类型 1-单人选择 2-多人选择
                inputValue: '',
                tableData: [],
                allTableData: [],
                visiblePou: false,
                loading: false,
                innerColumn: [],
                // 单选使用 选择的数据
                selectRow: {},
                // 多选勾选的数据
                records: [],
                // 输入框偏移量
                paddingLeft: 0,
                // 是否展示错误规则tips
                showTooltip: false,
                // 判断是否在粘贴状态 用来阻止粘贴触发input事件
                pasteing: false,
                // 搜索错误信息
                errorMsg: '',
                // 表格展开触发模式
                trigger: 'click',
                isFocus: false,
                // 输入框类型
                inputType: 'text',
                // 输入框宽度 用于定位表格自适应宽度
                inputWidth: 0,
                isFirst: true,
                // 表格面板出现位置
                placement: 'bottom-start',
                isCellClick: false
            };
        },
        //  计算属性
        computed: {
            recordsComputed: function () {
                // 多选 + 勾选对象监听
                if (this.type == 2 && this.records) {
                    this.$nextTick(() => {
                        const input = $(this.$refs?.searchInput?.$el).find('input');
                        const selectBox = $(this.$refs?.selectBox);
                        const covertextarea = $(this.$refs?.covertextarea);
                        // 表格默认展示窗口
                        const POPU = $(this.$refs?.['Popu-famMemberSelect']?.$el).find('.box_manual');
                        let boxW = selectBox?.innerWidth() || 0;
                        let boxH = selectBox?.innerHeight() || 0;
                        let inputCss = {
                            'padding-left': boxW ? boxW + 10 : 8
                        };
                        // 非数字显示
                        if (!this.showWordLimit) {
                            inputCss['padding-left'] = 8;
                            inputCss['margin-top'] = boxH ? boxH + 6 : 0;
                            // 覆盖高度的盒子
                            covertextarea.css({ height: boxH ? boxH + 32 + 10 : 0 });
                        }
                        // 输入框偏移定位
                        $(input).css(inputCss);
                        // 常显table弹窗定位&&非数字显示
                        if (this.openTable && !this.showWordLimit) {
                            POPU.css({
                                top: boxH ? boxH + 32 + 18 : 40
                            });
                        }
                    });
                }
                return true;
            },

            // 多选单选转类型
            multipleComputed: function () {
                this.type = this.multiple ? 2 : 1;
                const hasCheckbox = this.column.filter((item) => item.prop == 'checkbox');
                // 多选添加勾选
                if (this.type == 2) {
                    if (!hasCheckbox.length) {
                        // 多选添加column
                        this.column.unshift({
                            prop: 'checkbox', // 列数据字段key
                            type: 'checkbox', // 特定类型 复选框[checkbox] 单选框[radio]
                            minWidth: '48', // 列宽度
                            width: '48',
                            align: 'center',
                            fixed: '' // 是否固定列
                        });
                    }
                } else {
                    this.column = this.column.filter((item) => item.prop !== 'checkbox');
                }
                // 外部自定义表格宽度
                if (this.getTableWidth) {
                    this.column = this.column.map((item) => {
                        if (item.prop == 'orgName') {
                            item.minWidth = '';
                            item.width = '';
                        }
                        return item;
                    });
                }
            },

            getTableWidth: function () {
                let width = Number(this.tableWidth) || 0;
                // 定位表格 && 未设置自定义宽度自动取输入框宽度
                if (!this.openTable && !this.tableWidth) {
                    width = this.inputWidth || 480;
                }
                return width;
            },

            isEmpty() {
                return _.isEmpty(this.value);
            },
            innerDefaultValue: {
                get() {
                    return this.defaultValue;
                },
                set(defaultValue) {
                    this.$emit('update:defaultValue', defaultValue);
                }
            },
            column: {
                get() {
                    return [
                        {
                            prop: 'displayName',
                            title: this.i18n['姓名'],
                            minWidth: '87',
                            width: '87',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'code',
                            title: this.i18n['工号'],
                            minWidth: '87',
                            width: '87',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'name',
                            title: this.i18n.loginAccount,
                            minWidth: '87',
                            width: '87',
                            sort: false,
                            fixed: ''
                        },
                        {
                            prop: 'orgName', // 列数据字段key
                            title: this.i18n['部门'], // 列头部标题
                            minWidth: '240', // 列宽度
                            width: '240',
                            sort: false, // 是否需要排序
                            fixed: '' // 是否固定列
                        }
                    ];
                },
                set(column) {
                    this.innerColumn = column;
                }
            }
        },
        // 监听
        watch: {
            // 已勾选的数据-- 可更新表格数据
            innerDefaultValue() {
                this.$nextTick(() => {
                    this.initData();
                });
            },
            tableData: {
                immediate: true,
                handler(tableData) {
                    this.setCachedUsers(_.indexBy(tableData, 'oid'));
                    this.initTablePanelAppears(tableData.length ? (tableData.length + 1) * 36 : 0);

                    this.allTableData = tableData.reduce((allTableData, item) => {
                        if (!allTableData.some((ite) => ite.oid === item.oid)) {
                            return allTableData.concat(item);
                        }
                        return allTableData;
                    }, FamKit.deepClone(this.allTableData));
                }
            },
            isFocus() {
                // fix: 双击过快时，滚动条会回到顶部。原因未知
                const $table = this.$refs.erdTable?.getTableInstance('vxeTable').instance;
                const scrollData = $table?.getScroll();
                setTimeout(() => {
                    $table?.scrollTo(scrollData.scrollLeft, scrollData.scrollTop);
                }, 200);
            },
            value: {
                immediate: true,
                deep: true,
                handler(newVal, oldVal) {
                    // 只有在旧数据中有数据时才重新调用清空方法
                    if (_.isEmpty(newVal) && !_.isEmpty(oldVal) && !this.isCellClick) {
                        this.clearInput();
                    }
                    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                        this.initData(newVal);
                    }
                    this.isCellClick = false;
                }
            }
        },
        created: function () {
            // 表格默认展开
            if (this.openTable) {
                this.trigger = 'manual';
                this.visiblePou = true;
                this.column = this.column.map((item) => {
                    if (item.prop === 'orgName') {
                        item.minWidth = '';
                        item.width = '';
                    }
                    return item;
                });
            }
        },
        mounted: function () {
            // 监听输入框复制粘贴动作
            if (this.type == 2) {
                this.$nextTick(() => {
                    const input = this.$refs?.searchInput?.$el?.querySelector('input');

                    if (!input.length) return;
                    this.inputElement = input;
                    this.inputWidth = $(input).parents('.searchInputWapper').outerWidth() || 0;
                    this.onInputCopy = () => {
                        // 仅仅勾选了数据情况下自定义复制的内容
                        if (this.records.length) {
                            let text = this.records.map((item) => item.name).join(';');
                            utils
                                .copyTxt(text)
                                .then(() => {
                                    this.$message({
                                        message: this.i18nMappingObj.copySuccess,
                                        type: 'success',
                                        showClose: true
                                    });
                                })
                                .catch(() => {
                                    this.$message({
                                        message: this.i18nMappingObj.copyFailure,
                                        type: 'error',
                                        showClose: true
                                    });
                                });
                        }
                    };
                    this.onKeydown = (e) => {
                        if (e.keyCode == '13') {
                            setTimeout(() => {
                                const firstData = this.tableData[0] ? [this.tableData[0]] : [];
                                if (firstData.length) {
                                    // 勾选表格
                                    this.setCheckboxRow(firstData, true);
                                    // 直接赋值数据转换标签
                                    this.getSelectRecord(true, firstData, true);
                                }
                            }, 300);
                        }
                    };
                    // 复制
                    input.addEventListener('copy', this.onInputCopy);
                    this.pasteData = (e) => {
                        // 如果输入框已经有数据了
                        if (this.inputValue) {
                            return this.searchInput(this.inputValue, 'search');
                        }
                        e.stopPropagation();
                        this.pasteing = true;
                        setTimeout(() => {
                            this.pasteing = false;
                        }, 10);
                        if (!e.clipboardData) {
                            return;
                        }
                        let paste = (e.clipboardData || window.clipboardData).getData('text');
                        // 分割所有带特殊字符的字符串
                        const reg = /[\n\s+,，；;|^&*!$_+=~`]/g;
                        let arr = paste.split(reg);
                        // 去空
                        arr = arr.filter((item) => item);
                        // 未分割出数据 或者不满足逗号分号规则
                        if (!arr.length || (arr.length > 0 && paste.search(/[;]/g) == -1)) {
                            // arr.length大于1才需要进行逗号分割
                            if (arr.length > 1) return (this.showTooltip = true);
                        }
                        // 批量请求数据
                        this.searchInput(arr.join(';'), 'pasteing');
                    };
                    this.inputElement.addEventListener('paste', this.pasteData, false);
                    // 回车事件
                    input.addEventListener('keydown', this.onKeydown);
                });
            }

            // 有绑定值初始化数据
            this.$nextTick(() => {
                this.initData();
            });
        },
        beforeDestroy() {
            this.inputElement?.removeEventListener('paste', this.pasteData, false);
            this.inputElement?.removeEventListener('keydown', this.onKeydown, false);
            this.inputElement?.removeEventListener('copy', this.onInputCopy, false);
        },
        methods: {
            // 初始化表格面板出现位置
            initTablePanelAppears(height) {
                let { top = 0 } = this.$refs['Popu-famMemberSelect']?.$el?.getBoundingClientRect() || {};
                if (document.documentElement.clientHeight - top < height) {
                    this.placement === 'bottom-start' && (this.placement = 'top-start');
                } else {
                    this.placement === 'top-start' && (this.placement = 'bottom-start');
                }
                if (this.visiblePou) {
                    this.visiblePou = !this.visiblePou;
                    this.$nextTick(() => {
                        this.visiblePou = !this.visiblePou;
                    });
                }
            },
            getInputWidth() {
                this.inputWidth = this.$refs?.searchInputWapper?.clientWidth || 0;
            },
            // 点击数字展示已经勾选的数据
            showDetail: function () {
                this.tableData = JSON.parse(JSON.stringify(this.records));
                // 设置勾选
                this.setCheckboxRow(this.tableData, true);
                // 展开表格
                if (!this.openTable) {
                    this.togglePopShow(true);
                }
            },

            // 多选设置勾选
            setCheckboxRow: function (arr, type = true) {
                this.$nextTick(() => {
                    const idArr = arr.map((item) => item.id);
                    const selectArr = this.tableData.filter((item) => idArr.includes(item.id));
                    const $table = this.$refs['erdTable']?.$table;
                    $table?.setCheckboxRow(selectArr, type);
                    $table?.updateData();
                });
            },
            // 初始化数据
            initData: function (value) {
                let defaultValue = FamKit.deepClone(value || this.innerDefaultValue);
                if (Object.prototype.toString.call(defaultValue) === '[object Object]') {
                    defaultValue = [defaultValue];
                }

                if (value && typeof value === 'string') {
                    if (this.cachedUsers && this.cachedUsers[value]) {
                        this.tableData = [this.cachedUsers[value]];
                        this.records = [this.cachedUsers[value]];
                        this.inputValue = this.cachedUsers[value].displayName || this.cachedUsers[value].name || value;
                        return;
                    }
                    this.fetchAndSetData(value).then((object) => {
                        this.tableData = [object];
                        this.records = [object];
                        this.inputValue = object.displayName || object.name || value;
                    });
                }

                // 有传初始值
                if (
                    defaultValue &&
                    defaultValue.length &&
                    Object.prototype.toString.call(defaultValue) === '[object Array]'
                ) {
                    const listArr = FamKit.deepClone(_.filter(defaultValue, (item) => !!item)).map((item) => {
                        if (!_.isObject(item)) {
                            return this.allTableData.find((ite) => ite.oid === item);
                        }
                        return item;
                    });
                    const inputValue = this.inputValue || '';
                    // 赋值表格数据
                    if (this.isFirst && !inputValue.trim()) {
                        this.tableData = listArr;
                    }

                    // 更新value值
                    if (this.type == 1) {
                        // 单选
                        this.$emit('input', listArr[0]?.oid || '', listArr[0]);
                        this.$emit('change', listArr[0]?.oid || '', listArr[0]);
                    } else if (this.type == 2) {
                        // 多选
                        this.$emit(
                            'input',
                            listArr.map((item) => item?.oid),
                            listArr
                        );
                    }

                    // 单选
                    if (this.type == 1) {
                        this.selectRow = listArr[0] || {};
                        let inputValue = this.selectRow?.displayName || this.selectRow?.name || '';
                        inputValue =
                            inputValue && this.selectRow?.code
                                ? inputValue + ' (' + this.selectRow?.code + ')'
                                : inputValue;
                        this.inputValue = inputValue;
                    } else if (this.type == 2) {
                        // 多选
                        // 赋值标签
                        this.records = listArr;
                        // 勾选表格 初始化表格对象需要一定时间 第一次需要加个延时
                        setTimeout(() => {
                            this.setCheckboxRow(this.records);
                        }, 300);
                    }
                } else {
                    // 清空数据
                    this.records = [];
                    this.tableData = [];
                }
            },

            // 提供给外部使用的当前选择的数据
            onChange: function (data = {}) {
                let value = '';
                // 更新绑定的值
                if (this.type == 1) {
                    value = data.oid;
                } else if (this.type == 2) {
                    // 多选
                    value = data.map((item) => item?.oid);
                }
                this.$emit('input', value, data);
                this.$emit('change', value, data);

                this.dispatch(
                    'el-form-item',
                    'el.form.input',
                    this.isEmpty
                        ? null
                        : Object.prototype.toString.call(this.value) === '[object Array]'
                          ? this.value.join()
                          : this.value
                );
                this.dispatch(
                    'el-form-item',
                    'el.form.change',
                    this.isEmpty
                        ? null
                        : Object.prototype.toString.call(this.value) === '[object Array]'
                          ? this.value.join()
                          : this.value
                );
                this.$nextTick(() => {
                    this.focusInput();
                });
            },

            // 清空
            clearInput: function () {
                // 清空已选数据 - 单选
                if (this.type == 1) {
                    this.selectRow = {};
                    this.$emit('change', null);
                }
                // 多选&&value为空清理已勾选的
                if (this.type == 2 && this.inputValue == '') {
                    this.getSelectRecord(false, this.records);
                    this.tableData = [];
                }
                // 清理value
                this.inputValue = '';
                // 清理表格数据
                this.tableData = [];
                // 清理错误提醒标记
                this.showTooltip = false;
                // 同步清空数据
                this.$emit('input', this.multiple ? [] : '', null);
                this.innerDefaultValue = undefined;
                // 关窗
                if (this.visiblePou && !this.openTable) {
                    this.togglePopShow(false);
                }
            },

            // 离焦
            onInputBlur: _.throttle(function () {
                this.isFocus = false;

                this.dispatch(
                    'el-form-item',
                    'el.form.blur',
                    this.isEmpty
                        ? null
                        : Object.prototype.toString.call(this.value) === '[object Array]'
                          ? this.value.join(',')
                          : this.value
                );

                // 单选 取消输入要还原数据
                let selectName = this.selectRow?.displayName || this.selectRow?.name || '';
                selectName =
                    selectName && this.selectRow?.code ? selectName + ' (' + this.selectRow?.code + ')' : selectName;
                if (this.type == 1 && selectName) {
                    this.inputValue = selectName;
                }
            }, 150),

            onInputFocus: function () {
                this.isFocus = true;
                this.$emit('focus');
                if (this.type == 1 || !this.records.length) return;
                /*
                this.$message({
                    showClose: true,
                    message: this.i18nMappingObj.copyMsg
                })
                */
            },

            focusInput: _.throttle(function () {
                this.$refs.searchInput.focus();
            }, 150),

            // 筛选器显示隐藏
            togglePopShow: function (show) {
                // 内部插入展开模式不处理
                if (this.openTable) return;
                this.visiblePou = false;
                setTimeout(() => {
                    this.visiblePou = show ?? !this.visiblePou;
                }, 0);
            },

            // 行点击
            cellClick: function ({ row }) {
                this.isFirst = false;
                this.isCellClick = true;
                // 仅单选生效
                if (this.type == 1) {
                    let inputValue = row?.displayName || row?.name || '';
                    inputValue = inputValue && row?.code ? inputValue + ' (' + row?.code + ')' : inputValue;
                    this.inputValue = inputValue;
                    this.selectRow = row;
                    this.togglePopShow(false);
                    this.onChange(row);
                }
                // 多选勾选数据后输入内容清空
                if (this.type == 2 && this.records.length) {
                    this.inputValue = '';
                }
            },

            // 获取数据
            fetchDataList: function (val) {
                // 查群组
                // if (this.searchScop == 'group') {
                //     url = this.customUrl ? this.customUrl : '/fam/user/list';
                //     params = this.params;
                // }
                const urlConfig = {
                    all: {
                        url: '/fam/user/list/all',
                        method: this.customUrl ? 'get' : 'post',
                        data: {
                            isGetDisable: this.isgetdisable,
                            keywords: String(val) || '',
                            size: 100
                        }
                    },
                    group: {
                        url: this.customUrl ? this.customUrl : '/fam/user/list',
                        method: this.customUrl ? 'get' : 'post',
                        data: {
                            ...this.params,
                            isGetDisable: this.isgetdisable,
                            keywords: String(val) || '',
                            size: 100
                        }
                    },
                    container: {
                        url: '/fam/team/getUsersByContainer',
                        method: 'get',
                        params: {
                            containerOid: this.containerOid || this.$store?.state?.space?.context?.oid || '',
                            userSearchKey: encodeURIComponent(val) || '',
                            ...this.params
                        }
                    }
                };
                // 如果没有data，默认使用all的配置
                let dataConfig = urlConfig[this.searchScop] || urlConfig['all'];
                return this.$famHttp({
                    cancelToken: new CancelToken((cancel) => {
                        this.fetchDataListCancel = cancel;
                    }),
                    ...dataConfig
                });
            },

            // 转换数据
            convertData: function (data = []) {
                return data.map((item) => {
                    return _.isString(item)
                        ? _.clone(this.cachedUsers[item])
                        : {
                              oid: item.oid,
                              id: item.id,
                              email: item.email || '',
                              mobile: item.mobile || '',
                              code: item.code,
                              orgName: item.orgName || '',
                              name: item.name,
                              displayName: item.displayName
                          };
                });
            },

            /**
             * 搜索
             * type -- search[输入搜素] pasteing[粘贴]
             * **/
            searchInput: _.debounce(function (val = '', type) {
                // 清除错误信息
                this.errorMsg = '';

                // 阻止粘贴自动触发的搜索 以及空数据搜索
                if (this.pasteing && type != 'pasteing') return;

                // 隐藏错误提示
                this.showTooltip = false;

                // 输入空数据清空表格
                if (!this.inputValue && type != 'pasteing') {
                    return (this.tableData = []);
                }
                if (this.loading) {
                    this.fetchDataListCancel && this.fetchDataListCancel();
                }
                this.loading = true;
                this.fetchDataList(val)
                    .then((res) => {
                        // 容器团队搜索的时候，没有userInfoList这一层
                        let list = res.data?.userInfoList || res?.data || [];
                        this.customUrl && (list = res?.data || []);
                        // const listArr = this.convertData(list)
                        const listArr = JSON.parse(JSON.stringify(list));
                        // 数据未匹配完整
                        const message = res?.data?.resultMessage || '';
                        if (message) {
                            // 清空表格用于展示错误信息
                            this.tableData = [];
                            // 错误信息
                            this.errorMsg = message.replace(/未找到以下用户：/gi, '');
                            // 返回的部分数据
                            if (list.length) {
                                // 直接赋值数据转换标签
                                this.getSelectRecord(true, listArr);
                            }
                        } else {
                            // 普通场景
                            this.tableData = listArr;
                        }

                        // 多选勾选有数据
                        if (this.type == 2 && this.records.length) {
                            this.$nextTick(() => {
                                // 勾选
                                this.setCheckboxRow(this.records);
                            });
                        }
                    })
                    .catch((error) => {
                        const message = error?.data?.message || '';
                        this.errorMsg = message;
                    })
                    .finally(() => {
                        // 非初始化第一次加载 搜索展示面板
                        if (this.inputValue && !this.visiblePou) {
                            this.togglePopShow(true);
                        }
                        this.loading = false;
                    });
            }, 200),

            // 获取勾选的数据 unshift是否前面插入
            getSelectRecord: function (checked, data, unshift = false) {
                // 勾选
                if (checked) {
                    // 合并数据
                    let arr = [...this.records, ...data];
                    if (unshift) {
                        arr = [...data, ...this.records];
                    }
                    // 去重
                    const newArr = utils.uniqBy(arr, 'id');
                    this.records = newArr.map((item) => ({ ...item, _X_ROW_KEY: null }));
                } else {
                    // 取消勾选
                    this.records = this.records.filter((item) => !data.map((el) => el.id).includes(item.id));
                }
                this.onChange(this.records);
            },
            // 多选 - 全选
            selectAllEvent: function (data) {
                // 取消输入的数据
                this.inputValue = '';
                const { checked } = data;
                // 全部取消去当前表格数据
                this.$nextTick().then(() => {
                    const records = checked ? this.$refs['erdTable'].$table.getCheckboxRecords() : this.tableData;
                    this.getSelectRecord(checked, records);
                });
            },
            // 多选 - 勾选
            selectChangeEvent: function (data) {
                if (this.type == 2) {
                    const { row } = data;
                    const { checked } = data;
                    this.$nextTick().then(() => {
                        this.getSelectRecord(checked, [row]);
                    });
                }
            },

            // 删除当前选择
            removeSelect: function (id, index) {
                if (this.disabled) return;
                // 表格取消勾选
                this.setCheckboxRow([this.records[index]], false);
                const row = this.records[index];
                // 过滤删除的数据
                this.records = this.records.filter((item) => item.id !== id);
                // 页面回调
                this.onChange(this.records);
                this.$emit('remove-tag', id, row);
            },
            checkMethod({ row }) {
                return !this.disabledArray?.includes(row.oid);
            }
        }
    };
});
