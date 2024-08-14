define([
    'text!' + ELMP.resource('ppm-component/ppm-components/ChooseSubjectDialog/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-https/common-http.js'),
    'css!' + ELMP.resource('ppm-component/ppm-components/ChooseSubjectDialog/style.css')
], function (template, ErdcKit, ppmStore, commonHttp) {
    return {
        template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            visible: {
                type: Boolean,
                default: false
            },
            className: {
                type: String,
                default: 'erd.cloud.ppm.budget.entity.BudgetLink' // 关联科目的className
            },
            // 关联的OID（如预算或者预算模板OID）
            relationOid: {
                type: String,
                default: ''
            },
            // 父科目的OID（可为空，视为根节点）
            parentSubjectOid: {
                type: String,
                default: ''
            },
            // 获取父节点的配置
            findParentConfig: {
                type: Object,
                default() {
                    return {
                        rootData: [], // 根数据
                        childField: 'children', // 子节点的字段名称
                        oidField: 'erd.cloud.ppm.budget.entity.BudgetLink#oid' // oid的字段名
                    };
                }
            }
        },
        data() {
            return {
                // 启用国际化
                i18nPath: ELMP.resource('ppm-component/ppm-components/ChooseSubjectDialog/locale/index.js'),
                unfold1: true,
                unfold2: true,
                selectData: []
            };
        },
        computed: {
            dialogVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            // 预算科目
            subjectClassName() {
                return ppmStore?.state?.classNameMapping?.budgetSubject;
            },
            innerTitle() {
                return this.title || this.i18n['addSubject'];
            },
            // 父节点路径名称
            parentPathName() {
                if (!this.parentSubjectOid || !this.findParentConfig.rootData) {
                    return '';
                }
                // 获取父节点路径数据
                let parentPaths = this.deepGetParentPath(this.findParentConfig.rootData, this.parentSubjectOid);
                // 父节点路径名称
                return parentPaths.map((r) => r[`${this.subjectClassName}#name`]).join('/');
            },
            viewTableConfig() {
                let config = {
                    tableKey: 'AddSubjectView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true // 隐藏视图
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: this,
                        searchParamsKey: 'searchKey', // 模糊搜索参数传递key
                        firstLoad: true, // 进入页面就执行查询
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            url: '/ppm/view/table/page', // 表格数据接口
                            params: {}, // 路径参数
                            data: {
                                tableKey: 'AddSubjectView',
                                orderBy: 'identifierNo',
                                sortBy: 'asc',
                                className: this.subjectClassName
                            }, // body参数
                            method: 'post' // 请求方法（默认get）
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                width: '200px'
                            },
                            basicFilter: {
                                show: false
                            }
                        },

                        tableBaseConfig: {
                            // 表格UI的配置(使用驼峰命名)，使用的是vxe表格，可参考官网API（https://vxetable.cn/）
                            rowConfig: {
                                isCurrent: true,
                                isHover: true
                            },
                            align: 'left', // 全局文本对齐方式
                            columnConfig: {
                                resizable: true // 是否允许调整列宽
                            },
                            showOverflow: true // 溢出隐藏显示省略号
                        },
                        tableBaseEvent: {
                            'checkbox-all': this.selectChangeEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        }
                    }
                };
                return config;
            }
        },
        methods: {
            selectChangeEvent(data) {
                this.selectData = data.records;
            },
            /**
             * 递归获取父节点路径
             * @param {Array} dataArr 数据
             * @param {String} targetOid 目标oid
             * @param {Number} deepLevel 递归层级（节点的层级）
             * @param {Object} obj 实时的父节点路径信息，以及是否找到的标识
             * @returns
             */
            deepGetParentPath(dataArr, targetOid, deepLevel = 0, obj = { parentPaths: [], isEnd: false }) {
                if (obj.isEnd) {
                    return obj.parentPaths;
                }
                dataArr.forEach((r) => {
                    // 未结束时，才做处理
                    if (!obj.isEnd) {
                        obj.parentPaths = obj.parentPaths.slice(0, deepLevel); // 截取
                        obj.parentPaths[deepLevel] = r;
                        // 已找到
                        if (r[this.findParentConfig.oidField] === targetOid) {
                            obj.isEnd = true;
                        }
                        // 是否有子节点
                        else if (r[this.findParentConfig.childField] && r[this.findParentConfig.childField].length) {
                            this.deepGetParentPath(r[this.findParentConfig.childField], targetOid, deepLevel + 1, obj);
                        }
                    }
                });
                return obj.parentPaths;
            },
            // 确定
            async handleConfirm() {
                if (!this.selectData.length) {
                    this.$message({
                        message: this.i18n['pleaseSelectData'], // 请选择数据
                        type: 'warning'
                    });
                    return;
                }
                let rawDataVoList = this.selectData.map((row) => {
                    return {
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef', // 预算或者预算模板等oid
                                value: this.relationOid
                            },
                            {
                                attrName: 'roleBObjectRef', // 被选择的科目OID
                                value: row.oid
                            },
                            {
                                attrName: 'parentRef', // 关联的父科目OID
                                value: this.parentSubjectOid
                            }
                        ],
                        className: this.className
                    };
                });
                let res = await commonHttp.saveOrUpdate({
                    data: {
                        className: this.className,
                        rawDataVoList
                    }
                });
                if (!res.success) {
                    return;
                }
                this.$message({
                    message: this.i18n['saveSuccess'], // 保存成功
                    type: 'success'
                });
                this.$emit('success', this.selectData, res.data || {});
                this.handleCancel();
            },
            handleCancel() {
                this.dialogVisible = false;
            }
        }
    };
});
