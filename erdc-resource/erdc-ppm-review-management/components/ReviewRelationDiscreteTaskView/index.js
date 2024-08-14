define([
    'text!' + ELMP.func('erdc-ppm-review-management/components/ReviewRelationDiscreteTaskView/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    ELMP.resource('ppm-utils/index.js')
], function (template, store, commonMixin, commonHttp, { i18nMappingObj }, globalUtils) {
    const subReviewComponent = {
        template,
        props: {
            oid: {
                type: String,
                default: ''
            },
            projectId: {
                type: String,
                default: ''
            },
            leafNode: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            formData: Object,
            currentClickNode: String
        },
        data() {
            return {
                reViewClass: store.state.classNameMapping.DiscreteTask,
                nameField: 'erd.cloud.ppm.plan.entity.DiscreteTask#name'
            };
        },
        mixins: [commonMixin],
        computed: {
            urlConfig() {
                return {
                    data: {
                        deleteNoPermissionData: true,
                        conditionDtoList: [
                            {
                                logicalOperator: 'AND',
                                sortOrder: 0,
                                isCondition: false,
                                children: [
                                    {
                                        attrName: 'erd.cloud.ppm.plan.entity.DiscreteTask#ownedByRef',
                                        oper: 'CURRENT_USER',
                                        logicalOperator: 'AND',
                                        sortOrder: 0,
                                        isCondition: true
                                    },
                                    {
                                        attrName: 'erd.cloud.ppm.plan.entity.DiscreteTask#responsiblePeople',
                                        oper: 'RESPONSIBLE_CURRENT_USER',
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
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.reviewManagement;
            },
            vm() {
                return this;
            },
            defaultTableHeight() {
                return document.body.clientHeight - 243;
            },
            viewTableConfig() {
                const self = this;
                const key = (
                    !this.currentClickNode
                        ? this.$route.query?.taskDefKey ||
                          (this.leafNode.highLightedActivities && this.leafNode?.highLightedActivities[0]) ||
                          ''
                        : ''
                ).toLocaleUpperCase();
                let config = {
                    tableKey: 'ReviewRelationDiscreteTaskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: self,
                        useCodeConfig: true,
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: {
                                relationshipRef: self.oid
                            },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        console.log('file: index.js ==> line 28 ==> data ==> resData', resData);
                                    } catch (err) {
                                        console.log('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true, // 是否显示配置列，默认显示
                            showMoreSearch: false, // 是否显示高级搜索，默认显示
                            showRefresh: true,
                            fuzzySearch: {
                                placeholder: '',
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            moreOperateList: [],
                            actionConfig: {
                                name:
                                    ['SUBMITTALS', 'SELF_CHECK', 'SELFCHECK', 'DRAW_UP', 'DRAWUP'].includes(key) &&
                                    this.taskInfosRealtime.assignee === this.$store.state.app.user.id
                                        ? 'PPM_PROJECT_REVIEW_PROCESS_DISCRETE_TASK_LIST_MENU'
                                        : '',
                                containerOid: self.projectId,
                                objectOid: self.oid,
                                className: self.className
                            }
                            // mainBtn: ['SelfCheck', 'Submittals'].includes(self.$route.query?.taskDefKey)
                            //     ? self.mainBtn()
                            //     : ''
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                        },
                        pagination: {
                            // 分页
                            showPagination: false, // 是否显示分页
                            pageSize: 999
                        },
                        addOperationCol: ['SUBMITTALS', 'SELF_CHECK', 'SELFCHECK'].includes(key),
                        addSeq: true,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.plan.entity.DiscreteTask#identifierNo', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            }
        },
        methods: {
            mainBtn() {
                let self = this;
                let Btn = {
                    label: i18nMappingObj.addSupervise,
                    onclick() {
                        self.handleCreate();
                    }
                };
                return Btn;
            },
            getActionConfig() {
                return {
                    name: 'PPM_PROJECT_REVIEW_PROCESS_DISCRETE_TASK_OPERATE_MENU',
                    objectOid: this.oid,
                    className: this.className
                };
            },
            onDetail(row) {
                let oid =
                    _.find(row.attrRawList, { attrName: 'erd.cloud.ppm.plan.entity.DiscreteTask#oid' })?.value ||
                    row.oid;
                // 督办任务的查看详情
                globalUtils.openDiscreteTaskPage(
                    'detail',
                    {
                        query: {
                            pid: this.projectId,
                            oid: oid,
                            handleTaskTitle: row[this.nameField]
                        }
                    },
                    {}
                );
            },
            actionClick(data) {
                // console.log('%c [  ]-150', 'font-size:13px; background:pink; color:#bf2c9f;', data);
            },
            getSlotsName(slotsField) {
                return slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    ?.map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            handleAdd() {
                this.showDialog = true;
            },
            beforeSubmit(data, next) {
                let { createLink, oid } = this;
                let _this = this;
                let selectedOids = data.map((item) => item.oid);
                createLink(oid, selectedOids).then(() => {
                    _this.$refs?.DiscreteTasktable?.refreshTable();
                    next();
                });
            },
            removeItem(items) {
                commonHttp.deleteByIds({ data: items }).then(() => {
                    this.$refs.DiscreteTasktable.refreshTable();
                });
            },
            refresh() {
                this.$refs.DiscreteTasktable.refreshTable('default');
            }
        }
    };
    return subReviewComponent;
});
