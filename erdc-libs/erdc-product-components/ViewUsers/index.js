/* 
    ViewUsers: FamKit.asyncComponent(ELMP.resource('erdc-product-components/ViewUsers/index.js')),

    <view-users
	:team-oid="teamOid"
	v-if="dialogVisible"
   :role-refer="roleRef"
	:visible.sync="dialogVisible"
	:title="dialogTitle">
   </view-users>
*/

define([
    'text!' + ELMP.resource('erdc-product-components/ViewUsers/index.html'),
    'erdc-kit',
    'underscore',
    'css!' + ELMP.resource('erdc-product-components/ViewUsers/style.css')
], function (template, utils) {
    const FamKit = require('fam:kit');
    const _ = require('underscore');
    const store = require('fam:store');

    return {
        template,
        components: {
            // 基础表格
            ErdTable: FamKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js'))
        },
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            // 标题
            title: {
                type: String,
                default: () => {
                    return '';
                }
            },
            queryParams: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            // 当前选中行数据
            currentRow: {
                type: Object,
                default: () => {
                    return {};
                }
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-product-components/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    cancel: this.getI18nByKey('取消'),
                    confirm: this.getI18nByKey('确定'),
                    groupInformation: this.getI18nByKey('groupInformation'),
                    usersInformation: this.getI18nByKey('usersInformation'),
                    group: this.getI18nByKey('group'),
                    // 表头
                    participants: this.getI18nByKey('参与者'),
                    workNumber: this.getI18nByKey('工号'),
                    login: this.getI18nByKey('登录号'),
                    phone: this.getI18nByKey('手机'),
                    email: this.getI18nByKey('邮箱'),
                    department: this.getI18nByKey('部门')
                },
                unfoldGroup: true,
                unfoldUsers: true,
                tableData: [],
                pagination: {
                    pageIndex: 1,
                    pageSize: 20,
                    total: 0
                }
            };
        },
        watch: {},

        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            columns: {
                get() {
                    return [
                        {
                            title: ' ',
                            prop: 'seq',
                            type: 'seq',
                            align: 'center',
                            width: '48'
                        },
                        {
                            prop: 'displayName', // 参与者
                            width: '210',
                            title: this.i18nMappingObj?.['participants']
                        },
                        {
                            prop: 'code', // 工号
                            title: this.i18nMappingObj?.['workNumber']
                        },
                        {
                            prop: 'name', // 登录号
                            title: this.i18nMappingObj?.['login']
                        },
                        {
                            prop: 'mobile', // 手机
                            title: this.i18nMappingObj?.['phone']
                        },
                        {
                            prop: 'email', // 邮箱
                            title: this.i18nMappingObj?.['email']
                        },
                        {
                            prop: 'orgName', // 部门
                            title: this.i18nMappingObj?.['department']
                        }
                    ];
                },
                set(val) {}
            },
            selectProps() {
                let queryParams = this.queryParams;
                queryParams.data.isGetVirtualGroup = false;
                let roleCompName = 'custom-virtual-group-select';
                let roleComponentConf = this.fnComponentHandle(roleCompName, true, queryParams);
                return {
                    multiple: false,
                    clearable: true,
                    filterable: true,
                    collapseTags: this.collapseTags || false,
                    row: {
                        componentName: roleCompName,
                        requestConfig: roleComponentConf.componentConfigs || ''
                    }
                };
            }
        },
        mounted() {
            this.getUsersTableData();
        },
        methods: {
            getUsersTableData() {
                this.$famHttp({
                    url: '/fam/user/page/byGroup',
                    data: {
                        groupIds: [this.currentRow.roleBObjectRef.split(':')[2]],
                        isGetDisable: true,
                        current: this.pagination.pageIndex,
                        size: this.pagination.pageSize
                    },
                    method: 'POST'
                }).then((resp) => {
                    this.tableData = resp.data?.records || [];
                    this.pagination.total = +resp.data?.total || 0;
                });
            },
            handlePageChange(val) {
                this.pagination.pageIndex = val;
                this.getUsersTableData();
            },
            handleSizeChange(val) {
                this.pagination.pageSize = val;
                this.pagination.pageIndex = 1;
                this.getUsersTableData();
            },
            Submit() {
                var visible = !this.innerVisible;
                this.innerVisible = visible;
                this.$emit('update:visible', visible);
            },

            // 取消
            onCancel() {
                this.innerVisible = false;
            }
        }
    };
});
