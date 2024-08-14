define([
    'text!' + ELMP.resource('erdc-ppm-products/components/RelativeTeam/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-ppm-products/components/RelativeTeam/style.css')
], function (template, ErdcKit, store, utils) {
    return {
        template,
        props: {
            oid: String,
            treeDetail: {
                type: Object,
                default: {}
            }
        },
        data() {
            return {
                searchVal: '',
                i18nLocalePath: ELMP.resource('erdc-ppm-products/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    moveTip: this.getI18nByKey('moveTip'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    addAssociatedTeams: this.getI18nByKey('addAssociatedTeams'),
                    addAssociatedReplaceTeams: this.getI18nByKey('addAssociatedReplaceTeams'),

                    moveTo: this.getI18nByKey('moveTo'),
                    remove: this.getI18nByKey('remove'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    associate: this.getI18nByKey('associate'),
                    searchTips: this.getI18nByKey('searchTips'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData')
                },
                selectList: [],
                showMoveDialog: false,
                tableData: [],
                tableMaxHeight: 380, // 表格高度
                heightDiff: 236,
                defaultTableHeight: 350,
                column: [
                    // {
                    //     minWidth: '40',
                    //     width: '40',
                    //     type: 'checkbox',
                    //     align: 'center'
                    // },
                    {
                        attrName: 'seq',
                        prop: 'seq',
                        title: ' ',
                        minWidth: '48',
                        width: '48',
                        type: 'seq',
                        align: 'center'
                    },
                    {
                        prop: 'identifierNo', // 列数据字段key
                        title: '团队编码', // 列头部标题
                        minWidth: '200', // 列宽度
                        width: '200'
                    },
                    {
                        prop: 'displayName', // 列数据字段key
                        title: '团队名称', // 列头部标题
                        minWidth: '200', // 列宽度
                        width: '200'
                    },
                    {
                        prop: 'description', // 列数据字段key
                        title: '描述', // 列头部标题
                        minWidth: '', // 列宽度
                        width: ''
                    },
                    {
                        prop: 'operation', // 列数据字段key
                        title: '操作', // 列头部标题
                        minWidth: '80', // 列宽度
                        width: '80'
                    }
                ]
            };
        },
        created() {
            // this.getTableData();
            this.getHeight();
        },
        computed: {
            className() {
                return store.state.classNameMapping.businessProductInfo;
            },

            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            }
        },
        watch: {
            oid: {
                handler(nVal) {
                    if (nVal) {
                        setTimeout(() => {
                            this.getTableData();
                        }, 300);
                    }
                },
                immediate: true
            }
        },
        methods: {
            getHeight() {
                //获取浏览器高度并计算得到表格所用高度。 减去表 格外的高度
                let height = document.documentElement.clientHeight - this.heightDiff;
                this.tableMaxHeight = height || this.defaultTableHeight;
            },
            fnCallback() {},
            fnEditor() {
                this.$refs['relativeTeam'].$refs['FamAdvancedTable'];
            },
            selectAllEvent(data) {
                this.selectList = data.records;
            },
            getTableData() {
                this.$famHttp({
                    url: '/cbb/productInfo/getPathTeamByOid',
                    method: 'GET',
                    params: {
                        oid: this.oid,
                        className: this.className
                    }
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.tableData = resp.data || [];
                        // this.refreshTable();
                    }
                });
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
            },
            handleAdd() {
                this.showMoveDialog = true;
            },
            afterSubmit() {
                this.getTableData();
            },
            handleRemove(val) {
                let removeData = [];
                if (this.selectList.length) {
                    this.selectList.forEach((item) => {
                        removeData.push({
                            // attrName: 'teamRef',
                            oid: item.oid
                        });
                    });
                } else if (val && val.oid) {
                    removeData = [
                        {
                            // attrName: 'teamRef',
                            oid: val.oid
                        }
                    ];
                } else {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj['pleaseSelectData']
                    });
                }

                this.$confirm(this.i18nMappingObj['confirmDelete'], this.i18nMappingObj['deleteTip'], {
                    confirmButtonText: this.i18nMappingObj['confirm'],
                    cancelButtonText: this.i18nMappingObj['cancel'],
                    type: 'warning'
                })
                    .then(() => {
                        this.$famHttp({
                            url: '/cbb/productInfo/addOrRemoveTeam',
                            method: 'POST',
                            data: {
                                relationList: removeData,
                                oid: this.oid,
                                action: 'DELETE',
                                className: this.className
                            }
                        }).then((resp) => {
                            if (resp.code === '200') {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj['success']
                                });
                                this.getTableData();
                            }
                        });
                    })
                    .catch(() => {
                        this.$message({
                            type: 'info',
                            message: this.i18nMappingObj['cancel']
                        });
                    });
            },
            onInput: function () {
                utils.debounceFn(() => {
                    this.getTableData();
                }, 300);
            },
            handleJump(val) {
                this.$router.push({ path: '/erdc-ppm-heavy-team', query: val.row });
            },
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            MoveDialog: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components//MoveDialog/index.js'))
        }
    };
});
