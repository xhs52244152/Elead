define([
    'text!' + ELMP.resource('erdc-ppm-review-config/components/reviewElements/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-review-config/components/reviewElements/style.css')
], function (template, ErdcKit, store) {
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
                i18nLocalePath: ELMP.resource('erdc-ppm-review-config/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    success: this.getI18nByKey('success'),
                    moveTip: this.getI18nByKey('moveTip'),
                    deleteTip: this.getI18nByKey('deleteTip'),

                    moveTo: this.getI18nByKey('moveTo'),
                    remove: this.getI18nByKey('remove'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    add: this.getI18nByKey('add'),
                    searchTips: this.getI18nByKey('searchTips'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    batchSetCropping: this.getI18nByKey('batchSetCropping'),
                    addReviewElements: this.getI18nByKey('addReviewElements'),
                    viewReviewElements: this.getI18nByKey('viewReviewElements'),
                    confirmRemove: this.getI18nByKey('confirmRemove'),
                    removeSuccess: this.getI18nByKey('removeSuccess'),
                    IsRemove: this.getI18nByKey('IsRemove')
                },
                selectList: [],
                reviewId: '', // 评审要素id，查看评审要素详情用到
                showCroppDialog: false,
                showAlementsDialog: false,
                showDialog: false, // 查看评审要素详情
                tableData: [],
                tableMaxHeight: 380, // 表格高度
                heightDiff: 238,
                defaultTableHeight: 380
            };
        },
        created() {
            this.getHeight();
        },
        computed: {
            ReviewLibraryClassName() {
                return store.state.classNameMapping.ReviewLibrary;
            },

            className() {
                return store.state.classNameMapping.ReviewPointToElementLink;
            },
            vm() {
                return this;
            },
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                }
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.foundation.principal.entity.User#code', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    .map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: 'ReviewPointToElementLinkView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableRequestConfig: {
                            url: '/element/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: {
                                relationshipRef: this.treeDetail.oid
                            }
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'CBB_REVIEW_ELEMENT_LINK_LIST_MENU',
                                containerOid: '',
                                className: this.className
                            }
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.cbb.review.entity.ReviewElement#identifierNo', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.showDetail(row);
                            }
                        },
                        // 分页
                        pagination: {
                            showPagination: false // 是否显示分页
                        },
                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent, // 复选框全选
                            'checkbox-change': _this.selectChangeEvent // 复选框勾选事件
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            }
        },
        watch: {
            treeDetail(val) {
                if (val && val.oid) {
                    this.refresh();
                }
            }
        },
        methods: {
            showDetail(val) {
                this.reviewId = val.relationOid;
                this.showDialog = true;
            },
            getHeight() {
                //获取浏览器高度并计算得到表格所用高度。 减去表 格外的高度
                let height = document.documentElement.clientHeight - this.heightDiff;
                this.tableMaxHeight = height || this.defaultTableHeight;
            },
            selectAllEvent(data) {
                this.selectList = data.records;
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.selectList = data.records;
            },
            actionClick() {
                // console.log('%c [  ]-150', 'font-size:13px; background:pink; color:#bf2c9f;', data);
                // this.showCroppDialog = true;
            },
            onCommand() {
                // console.log(data, row);
            },
            afterSubmit() {
                this.refresh();
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
            },
            getActionConfig(row) {
                return {
                    name: 'CBB_REVIEW_ELEMENT_LINK_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            refresh() {
                this.$refs.reviewElements.refreshTable('default');
            },
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),

            FamErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            CroppingDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/Cropping/index.js')
            ),
            AddElementsDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/AddElements/index.js')
            ),
            LibraryDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-library/component/libraryDialog/index.js')
            )
        }
    };
});
