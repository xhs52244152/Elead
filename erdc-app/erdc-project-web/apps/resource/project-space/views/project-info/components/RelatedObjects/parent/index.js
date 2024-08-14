define([
    ELMP.resource('project-space/views/project-info/components/RelatedObjects/mixins/common-mixin.js'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js')
], function (commonMixin, ErdcKit, store) {
    return {
        props: {
            oid: String
        },
        template: `
        <div>
            <fam-view-table ref="table" 
            :is-adaptive-height="false" 
            :default-table-height="200" 
            @action-click="actionClick" 
            :view-table-config="viewTableConfig">
                <template v-for="slot in getSlotsName(slotsField)" v-slot:[slot]="{scope}">
                    <div
                        class="completion_rate"
                        v-if="slot === 'column:default:erd.cloud.ppm.project.entity.Project#completionRate:content' && !scope.row.isGroupRow"
                    >
                        <svg-circle :rate="getCompletionRate(scope.row)"></svg-circle>
                        <span class="completion_rate_num">{{getCompletionRate(scope.row, '%') }}</span>
                        <!-- <span>--</span> -->
                    </div>
                    <div v-if="slot === 'column:default:operation:content'">
                        <fam-action-pulldowm
                            :is-operation="true"
                            :action-config="getActionConfig(scope.row)"
                            :action-data="scope.row"
                            @click="onCommand"
                        ></fam-action-pulldowm>
                    </div>
                </template>
            </fam-view-table>

            <!-- 选择项目面板 -->
            <fam-object-select-dialog
                ref="objectSelectDialog"
                title="选择项目"
                :extendParams="extendParams"
                :visible.sync="selectProjectConfig.visible"
                :className="className">
            </fam-object-select-dialog>
        </div>
        `,
        mixins: [commonMixin],
        components: {
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/views/project-info/locale/index.js'),
                className: 'erd.cloud.ppm.project.entity.Project',
                // 选择项目面板显示状态
                selectProjectConfig: {
                    visible: false
                },
                parentTableData: []
            };
        },
        computed: {
            extendParams() {
                let params = {
                    deleteNoPermissionData: false,
                    conditionDtoList: [
                        {
                            logicalOperator: 'AND',
                            sortOrder: 0,
                            isCondition: true,
                            attrName: 'erd.cloud.ppm.project.entity.Project#oid',
                            oper: 'NE',
                            value1: this.oid
                        },
                        {
                            attrName: 'erd.cloud.ppm.project.entity.Project#member',
                            isCondition: true,
                            logicalOperator: 'AND',
                            oper: 'MEMBER_CURRENT_USER',
                            sortOrder: 0
                        },
                        {
                            attrName: 'erd.cloud.ppm.project.entity.Project#lifecycleStatus.status',
                            isCondition: true,
                            logicalOperator: 'AND',
                            oper: 'NE',
                            sortOrder: 0,
                            value1: 'DRAFT'
                        }
                    ]
                };
                return params;
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
                    },
                    {
                        prop: 'erd.cloud.ppm.project.entity.Project#completionRate', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            viewTableConfig() {
                const _this = this;
                let { oid } = this;
                let config = {
                    tableKey: 'projectParentLinkForm',
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
                            data: { relationshipRef: oid },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        _this.parentTableData = resData?.data?.records || [];
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                placeholder: this.i18n.pleaseEnterKeywordSearch,
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            actionConfig: {
                                name: 'PPM_PARENT_PROJECT_CREATE_MENU',
                                containerOid: '',
                                isDefaultBtnType: true,
                                className: store.state.classNameMapping.project,
                                objectOid: oid
                            },

                            secondaryBtn: [],
                            moreOperateList: []
                        },
                        pagination: {
                            showPagination: false
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.project.entity.Project#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
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
            getActionConfig() {
                return {
                    name: 'PPM_CHILD_PROJECT_RELATION_LIST_OP_MENU',
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
                if (_this.parentTableData.length) {
                    _this.$message({
                        type: 'info',
                        message: '该项目已存在父项目，请移除后增加',
                        showClose: true
                    });
                    return;
                }
                this.$refs.objectSelectDialog
                    .openSelect({
                        multiple: false
                    })
                    .then((data) => {
                        createLink(data.oid, [oid]).then(() => {
                            _this.$refs?.table?.refreshTable();
                        });
                    });
            },
            // 功能按钮点击事件
            actionClick(type, row) {
                const eventClick = {
                    // 创建
                    PARENT_PROJECT_CREATE_MENU: this.handleAdd
                };
                eventClick?.[type.name] && eventClick?.[type.name](row);
            },
            // 移除父项
            removeItem(items) {
                this.deleteByIds([items]).then(() => {
                    this.$refs.table.refreshTable();
                });
            }
        }
    };
});
