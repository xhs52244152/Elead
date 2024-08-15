define([
    'text!' + ELMP.func('erdc-change/components/ChangeNotice/index.html'),
    ELMP.func('erdc-change/utils.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    ELMP.func('erdc-change/config/viewConfig.js'),
    ELMP.func('erdc-change/components/RelatedObject/mixin.js')
], function (template, utils, cbbUtils, viewCfg, mixin) {
    const ErdcKit = require('erdc-kit');

    return {
        name: 'ChangeNotice',
        template: template,
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionButton: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionButton/index.js')),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            readonly: {
                type: Boolean,
                default: () => {
                    return false;
                }
            },
            isShow: {
                type: Boolean,
                default: () => {
                    return true;
                }
            },
            title: {
                type: String,
                default: '变更通告'
            },
            typeName: {
                type: String,
                default: 'PR'
            },
            containerRef: String,
            probOid: String,
            prefixRoute: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-change/locale/index.js'),
                panelUnfold: true,
                addList: [], // 新增数据
                tableData: [], // 表格显示数据
                pageData: [], // page 接口查询的数据
                selectedData: [] // 选中的数据
            };
        },
        mixins: [mixin],
        computed: {
            oid() {
                return this.$route.query.oid || this.probOid;
            },
            createTaskOid() {
                return this.$route.query.createTaskOid;
            },
            computedPrefixRoute() {
                return this.prefixRoute || this.$route.meta.prefixRoute;
            },
            className() {
                return this.$route.query.pid?.split(':')?.[1] || '';
            },
            columns() {
                const {
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    // version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                } = this.commonColumnsMap;
                return [
                    checkbox,
                    seq,
                    icon,
                    identifierNo,
                    name,
                    this.commonColumnsMap['lifecycleStatus.status'],
                    // version,
                    containerRef,
                    createBy,
                    updateBy,
                    createTime,
                    updateTime
                ];
            },
            actionConfig() {
                return {
                    name: 'CHANGE_REQUEST_WF_ORDER_MENU',
                    objectOid: '',
                    containerOid: this.$store.state.space?.context?.oid || '',
                    className: this.$route.meta.className
                };
            }
        },
        created() {},
        watch: {
            '$route'(route) {
                // 防止与下面的监听重复
                if (!route?.query?.routeRefresh && route?.name === 'workflowActivator') {
                    this.getTableList(this.oid);
                }
            },
            //取路由刷新的新名称
            '$route.query.routeRefresh': {
                immediate: true,
                handler(nv) {
                    if (nv) this.getTableList(this.oid);
                }
            },
            'oid': {
                immediate: true,
                handler(nv) {
                    if (nv) this.getTableList(nv);
                }
            },
            'pageData': {
                immediate: true,
                handler(nv) {
                    if (nv) {
                        this.tableData = nv;
                    }
                }
            }
        },
        methods: {
            refreshTable() {
                this.$refs.famViewTable.refreshTable();
            },
            beforeSubmit() {},
            submit(data) {
                if (!data.length) {
                    // return next();
                    return;
                }
                this.addList = data;
                this.tableData = [...this.tableData, ...data];
            },
            async getTableList(relationshipRef) {
                this.pageData = await this.changeProcessTableGetList({
                    className: viewCfg.otherClassNameMap.changeProcessLink,
                    tableKey: 'ChangeRequestQueryChangeOrderView',
                    relationshipRef,
                    deleteNoPermissionData: false
                });
            },
            getData() {
                return new Promise((resolve) => {
                    const data = this.tableData.filter((item) => item.isCreated);
                    resolve(data);
                });
            },
            handleCreate() {
                const route = JSON.stringify(_.pick(this.$route, ['name', 'params', 'query', 'path']));
                this.$router.replace({
                    // name: '/portal/productData/changeEcnCreate',
                    path: `${this.computedPrefixRoute}/change/ecnCreate`,
                    query: {
                        containerRef: this.containerRef,
                        type: 'flow',
                        probOid: this.oid || '',
                        route
                    }
                });
            },
            handlerRemove() {
                const { i18n, selectedData } = this;
                if (!selectedData || !selectedData.length) {
                    this.$message({
                        type: 'warning',
                        message: i18n.selectTip
                    });
                    return;
                }
                // 已绑定的数据
                const deleteIds = selectedData.filter((item) => !item.isCreated).map((item) => item.oid);
                // 新增数据
                const filterData = selectedData.filter((item) => item.isCreated).map((item) => item.oid);

                this.$confirm(i18n.deleteBatchTip, i18n.deleteTip, {
                    type: 'warning',
                    confirmButtonText: i18n.confirm,
                    cancelButtonText: i18n.cancel
                }).then(() => {
                    if (filterData.length) {
                        const indicesToRemove = function (array) {
                            return array.reduce((acc, obj, index) => {
                                if (filterData.find((bObj) => bObj === obj.oid)) {
                                    acc.push(index);
                                }
                                return acc;
                            }, []);
                        };
                        // 从a数组中移除与b数组中共享的对象
                        indicesToRemove(this.tableData)
                            .sort((a, b) => b - a)
                            .forEach((index) => this.tableData.splice(index, 1));
                    }
                    if (deleteIds.length) {
                        const className = deleteIds[0].split(':')[1];
                        this.$famHttp({
                            url: '/fam/deleteByIds',
                            method: 'delete',
                            params: {},
                            data: {
                                oidList: deleteIds,
                                className
                            }
                        }).then(() => {
                            this.$message({
                                type: 'success',
                                message: i18n.deleteSuccess,
                                showClose: true
                            });
                            this.getTableList(this.oid);
                        });
                    }
                });
            },
            handleGoDetail(data) {
                //流程查看详情,需添加返回按钮
                cbbUtils.goToDetail(
                    data,
                    { query: { backButton: true }, skipMode: 'replace' },
                    utils.getClassNameKey(data)
                );
            },
            // 复选框选中数据
            checkboxChange({ records = [] }) {
                this.selectedData = records;
            },
            // 复选框全选数据
            checkboxAll({ records = [] }) {
                this.selectedData = records;
            },
            getIconStyle(row) {
                const style = utils.getIconClass(row.attrRawList, row?.idKey);
                style.verticalAlign = 'text-bottom';
                style.fontSize = '16px';

                return style;
            },
            getIcon(row) {
                return (
                    row.attrRawList?.find((item) =>
                        [`${viewCfg.ecnChangeTableView.className}#icon`, 'icon'].includes(item.attrName)
                    )?.value || row.icon
                );
            },
            // 功能按钮点击事件
            actionClick(type = {}, data = {}) {
                let eventClick = {
                    CHANGE_REQUEST_WF_ORDER_MENU_CREATE: this.handleCreate, //流程-变更通告-创建
                    CHANGE_REQUEST_WF_ORDER_MENU_REMOVE: this.handlerRemove ///流程-变更通告-移除
                };
                eventClick?.[type.name] && eventClick?.[type.name](data);
            }
        }
    };
});
