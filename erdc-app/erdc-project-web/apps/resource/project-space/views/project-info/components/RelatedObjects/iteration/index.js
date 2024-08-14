define([ELMP.resource('project-space/views/project-info/components/RelatedObjects/mixins/common-mixin.js')], function (
    commonMixin
) {
    return {
        props: {
            oid: String
        },
        template: `
        <div>
            <fam-view-table ref="table" :view-table-config="viewTableConfig">
                <template v-for="slot in getSlotsName(slotsField)" v-slot:[slot]="{scope}">
                    <div v-if="slot === 'column:default:operation:content'">
                        <erd-button type="text" @click="removeItem([scope.row])">移除</erd-button>
                    </div>
                </template>
            </fam-view-table>
        </div>
        `,
        mixins: [commonMixin],
        data() {
            return {
                className: 'erd.cloud.ppm.project.entity.Project',
                // 选择项目面板显示状态
                selectProjectConfig: {
                    visible: false
                }
            };
        },
        computed: {
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            viewTableConfig() {
                let { oid } = this;
                let config = {
                    tableKey: 'projectParentLinkForm',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
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
                                placeholder: '请输入关键词搜索',
                                show: true // 是否显示普通模糊搜索，默认显示
                            },
                            mainBtn: {
                                // 主要操作按钮
                                label: '创建',
                                class: '',
                                icon: '',
                                onclick: () => {}
                            },
                            secondaryBtn: [
                                {
                                    label: '取消',
                                    onclick: () => {}
                                }
                            ],
                            moreOperateList: []
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
            // 移除父项
            removeItem(items) {
                this.deleteByIds(items).then(() => {
                    this.$refs.table.refreshTable();
                });
            }
        }
    };
});
