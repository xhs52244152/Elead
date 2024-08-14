define([
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'text!' + ELMP.resource('requirement-list/components/AssProject/index.html'),
    'css!' + ELMP.resource('requirement-list/components/AssProject/index.css')
], function (ErdcKit, store, utils, template) {
    return {
        template,
        props: {
            value: String,
            // 是否在流程中
            isProcess: {
                type: Boolean,
                default: false
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamObjectSelectDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamObjectSelectDialog/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                className: 'erd.cloud.ppm.project.entity.Project',
                // 选择项目面板显示状态
                selectProjectConfig: {
                    visible: false
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('requirement-list/locale/index.js'),
                i18nMappingObj: {
                    deleteSuccess: this.getI18nByKey('deleteSuccess')
                },
                extendParams: {
                    conditionDtoList: [
                        {
                            attrName: 'erd.cloud.ppm.project.entity.Project#lifecycleStatus.status',
                            oper: 'NOT_IN',
                            logicalOperator: 'AND',
                            sortOrder: 0,
                            isCondition: true,
                            value1: 'DRAFT,CLOSED'
                        },
                        {
                            logicalOperator: 'AND',
                            sortOrder: 1,
                            isCondition: false,
                            children: [
                                {
                                    attrName: 'erd.cloud.ppm.project.entity.Project#currentUser',
                                    oper: 'BELONG_ADMIN',
                                    logicalOperator: 'AND',
                                    sortOrder: 0,
                                    isCondition: true
                                },
                                {
                                    attrName: 'erd.cloud.ppm.project.entity.Project#member',
                                    oper: 'MEMBER_CURRENT_USER',
                                    logicalOperator: 'OR',
                                    sortOrder: 1,
                                    isCondition: true
                                }
                            ]
                        }
                    ]
                }
            };
        },
        computed: {
            oid() {
                return this.value;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            viewTableConfig() {
                const _this = this;
                let { oid } = this;
                let requestData = {
                    relationshipRef: oid
                };
                // 如果是基线就要传baselined为空字符串
                if (this.$route.query.baselined) {
                    requestData.baselined = '';
                }
                let config = {
                    tableKey: 'ReqAssignProjView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: requestData,
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        // console.log('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                placeholder: '请输入关键词搜索',
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: !this.isProcess ? 'PPM_CHILD_PROJECT_OP_MENU' : false,
                                containerOid: '',
                                isDefaultBtnType: true,
                                className: store.state.classNameMapping.project,
                                objectOid: this.oid
                            },
                            moreOperateList: []
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                        },

                        addOperationCol: !_this.isProcess,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.project.entity.Project#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
                        slotsField: this.slotsField,
                        pagination: {
                            // 分页
                            showPagination: false // 是否显示分页
                        }
                    }
                };
                return config;
            }
        },
        methods: {
            getActionConfig() {
                return {
                    name: 'PPM_CHILD_PROJECT_LIST_OP_MENU',
                    objectOid: this.oid,
                    className: this.className
                };
            },
            onCommand({ name }, row) {
                const eventClick = {
                    CHILD_PROJECT_DELETE_MENU: this.removeItem
                };
                eventClick[name] && eventClick[name](row);
            },
            handleAdd() {
                let { createLink, oid } = this;
                let _this = this;
                this.$refs.objectSelectDialog
                    .openSelect({
                        multiple: true
                    })
                    .then((data) => {
                        if (!data.length) return;
                        let selectedOids = data.map((item) => item.oid);
                        createLink(selectedOids, oid).then(() => {
                            _this.$refs?.table?.refreshTable();
                        });
                    });
            },
            handleBatchDelete() {
                let _this = this;
                // 获取勾选数据
                let multipleSelection = _this.$refs?.table?.fnGetCurrentSelection() || [];
                this.deleteByIds(multipleSelection).then(() => {
                    _this.$refs?.table?.refreshTable();
                });
            },
            // 功能按钮点击事件
            actionClick(type, row) {
                const eventClick = {
                    // 创建
                    CHILD_PROJECT_CREATE_MENU: this.handleAdd,
                    CHILD_PROJECT_DELETE_MENU: this.handleBatchDelete
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 移除子项
            removeItem(items) {
                this.deleteByIds([items]).then(() => {
                    this.$refs.table.refreshTable();
                });
            },
            /**
             * 创建父项目、子项目关系
             * @param {Array[String]} parentRefs
             * @param {String} childrenRef
             */
            createLink(parentRefs = [], childrenRef) {
                const _this = this;
                return new Promise((resolve) => {
                    let rawDataVoList = parentRefs.map((parent) => {
                        return {
                            attrRawList: [
                                {
                                    attrName: 'roleAObjectRef',
                                    value: parent
                                },
                                {
                                    attrName: 'roleBObjectRef',
                                    value: childrenRef
                                }
                            ]
                        };
                    });
                    // 加该参数的原因是“项目-需求详情”和“需求池-需求详情”中均可新增所属项目，但是前端传参都一样，后端无法知道从哪个操作界面进入
                    if (window.__currentAppName__ === 'erdc-requirement-web') {
                        rawDataVoList[0].attrRawList.push({
                            attrName: 'container',
                            value: 'requirementPool'
                        });
                    }
                    _this.$loading();
                    this.$famHttp({
                        url: '/ppm/saveOrUpdate',
                        method: 'POST',
                        data: {
                            className: 'erd.cloud.ppm.require.entity.RequirementAssignLink',
                            rawDataVoList
                        }
                    })
                        .then((resp) => {
                            _this.$message.success('操作成功');
                            resolve(resp);
                        })
                        .catch(() => {})
                        .finally(() => {
                            _this.$loading().close();
                        });
                });
            },
            // 通用删除
            deleteByIds(items) {
                return new Promise((resolve, reject) => {
                    if (!items || items.length < 1) {
                        this.$message.info('未勾选数据');
                        reject();
                        return false;
                    }
                    this.$confirm('是否移除所选数据?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    })
                        .then(() => {
                            // 获取linkOid
                            let oidList = items.map((item) => {
                                return item.oid;
                            });

                            let className = items[0]?.idKey;

                            this.$famHttp({
                                url: '/base/deleteByIds',
                                method: 'DELETE',
                                params: {},
                                data: {
                                    category: 'DELETE',
                                    className,
                                    oidList
                                }
                            })
                                .then((resp) => {
                                    this.$message({
                                        type: 'success',
                                        message: this.i18nMappingObj['deleteSuccess'],
                                        showClose: true
                                    });
                                    resolve(resp);
                                })
                                .catch(() => {});
                        })
                        .catch(() => {
                            this.$message({
                                type: 'info',
                                message: '已取消移除'
                            });
                        });
                });
            },
            /**
             * 详情跳转
             */
            onDetail(row) {
                let routeConfig = {
                    path: '/space/project-space/projectInfo',
                    query: {
                        pid: row['erd.cloud.ppm.project.entity.Project#oid']
                    }
                };
                utils.openPage({ routeConfig, appName: 'erdc-project-web' });
            },
            getSlotsName(slotsField) {
                return slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            }
        }
    };
});
