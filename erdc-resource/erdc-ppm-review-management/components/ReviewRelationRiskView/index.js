define([
    'text!' + ELMP.func('erdc-ppm-review-management/components/ReviewRelationRiskView/index.html'),
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
            formData: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            currentClickNode: String
        },

        data() {
            return {
                reViewClass: store.state.classNameMapping.risk
            };
        },
        created() {
            // console.log('yyyrew', this.formData);
        },
        mixins: [commonMixin],
        computed: {
            urlConfig() {
                return {
                    data: {
                        deleteNoPermissionData: true,
                        conditionDtoList: [
                            {
                                attrName: this.reViewClass + '#projectRef',
                                oper: 'EQ',
                                value1: this.projectId
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
                        type: 'default'
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
                    tableKey: 'ReviewRelationRiskView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        useCodeConfig: true,
                        tableBaseConfig: {
                            maxLine: 5
                        },
                        vm: self,
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
                                    } catch (err) {
                                        console.error('err===>', err);
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
                            actionConfig: {
                                name:
                                    ['SUBMITTALS', 'SELF_CHECK', 'SELFCHECK', 'DRAW_UP', 'DRAWUP'].includes(key) &&
                                    this.taskInfosRealtime.assignee === this.$store.state.app.user.id
                                        ? 'PPM_PROJECT_REVIEW_PROCESS_RISK_LIST_MENU'
                                        : '',
                                containerOid: self.projectId,
                                objectOid: self.oid,
                                className: self.className
                            },
                            moreOperateList: []
                            // mainBtn: ['SelfCheck', 'Submittals'].includes(self.$route.query?.taskDefKey)
                            //     ? self.mainBtn()
                            //     : ''
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                        },
                        addOperationCol: ['SUBMITTALS', 'SELF_CHECK', 'SELFCHECK'].includes(key),
                        pagination: {
                            // 分页
                            showPagination: false, // 是否显示分页
                            pageSize: 999
                        },
                        addSeq: true,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.risk.entity.Risk#identifierNo', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
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
            onDetail(row) {
                let oid = _.find(row.attrRawList, { attrName: 'erd.cloud.ppm.risk.entity.Risk#oid' })?.value || row.oid;
                let routeConfig = {
                    path: '/space/erdc-ppm-risk/detail',
                    params: {
                        oid: oid
                    },
                    query: {
                        pid: this.projectId,
                        oid: oid,
                        title: row['erd.cloud.ppm.risk.entity.Risk#name']
                    }
                };
                globalUtils.openPage({
                    routeConfig,
                    appName: 'erdc-project-web'
                });
            },
            actionClick() {},
            getActionConfig() {
                return {
                    name: 'PPM_PROJECT_REVIEW_PROCESS_ISSUE_OPERATE_MENU',
                    objectOid: this.oid,
                    className: this.className
                };
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
                    _this.$refs?.reviewRisktable?.refreshTable();
                    next();
                });
            },
            removeItem(items) {
                commonHttp
                    .deleteByIds({
                        data: {
                            catagory: 'DELETE',
                            className: items.idKey,
                            oidList: [items.oid]
                        }
                    })
                    .then(() => {
                        this.$message.success(i18nMappingObj.deleteSuccessful);
                        this.refresh();
                    });
            },
            refresh() {
                this.$refs.reviewRisktable.refreshTable('default');
            }
        }
    };
    return subReviewComponent;
});
