//  此组件适用于业务管理-重量级团队和产品信息模块

define([
    'text!' + ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/AddElements/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/AddElements/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        props: {
            title: {
                typeof: String,
                default: '增加评审要素'
            },
            showAlementsDialog: {
                typeof: Boolean,
                default: false
            },
            visible: {
                type: Boolean,
                default: false
            },
            currentSelectTreeData: {
                type: Object,
                default: {}
            },
            // className: {
            //     type: String,
            //     default: ''
            // },
            oid: String
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-ppm-review-config/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    addSuccess: this.getI18nByKey('addSuccess'),
                    pleaseSelectAddData: this.getI18nByKey('pleaseSelectAddData')
                },
                checkData: [],
                viewTableHeight: 464,
                reviewId: '',
                showDialog: false,
                reviewPointToElementLink: store.state.classNameMapping.ReviewPointToElementLink
            };
        },
        created() {},
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.cbb.review.entity.ReviewElement#content',
                        type: 'default'
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.ReviewLibrary;
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: 'ReviewPointAddElementView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableBaseConfig: { showOverflow: true },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {},
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: '',
                                containerOid: '',
                                className: _this.className
                            }
                        },

                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent, // 复选框全选
                            'checkbox-change': _this.selectChangeEvent // 复选框勾选事件
                        },
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            // fieldLinkName: 'name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.showDetail(row);
                            }
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            }
        },
        methods: {
            showDetail(val) {
                this.reviewId = val.oid;
                this.showDialog = true;
            },
            actionClick() {},

            handleConfirm() {
                let rawDataVoList = this.checkData.map((item) => {
                    return {
                        action: 'CREATE',
                        attrRawList: [
                            {
                                attrName: 'roleAObjectRef',
                                value: this.currentSelectTreeData.oid
                            },
                            {
                                attrName: 'roleBObjectRef',
                                value: item.oid
                            }
                        ],
                        className: this.reviewPointToElementLink
                    };
                });

                let params = {
                    action: 'CREATE',
                    className: this.reviewPointToElementLink,
                    rawDataVoList
                };
                if (!rawDataVoList.length) {
                    return this.$message({
                        type: 'info',
                        message: this.i18nMappingObj['pleaseSelectAddData']
                    });
                }
                this.$famHttp({
                    url: '/element/saveOrUpdate',
                    method: 'POST',
                    data: params
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['addSuccess']
                        });
                        this.$emit('submit-success', '');
                        this.innerVisible = false;
                    }
                });
            },
            selectAllEvent(data) {
                this.checkData = data.records;
            },
            selectChangeEvent(data) {
                this.checkData = data.records;
            },
            handleCancel() {
                this.innerVisible = false;
            },
            // 回显数据处理
            echoData(val, cb) {
                let data = ErdcKit.deserializeAttr(val, {
                    valueMap: {
                        responsibilityRoleRef: (e, data) => {
                            return data['responsibilityRoleRef']?.oid || '';
                        },
                        reviewRoleRef: (e, data) => {
                            return data['reviewRoleRef']?.oid || '';
                        }
                    }
                });

                cb(data);
            }
        },
        components: {
            LibraryDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-library/component/libraryDialog/index.js')
            )
        }
    };
});
