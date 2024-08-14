define([
    'text!' + ELMP.resource('erdc-ppm-review-config/components/qualityObjectives/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-review-config/components/qualityObjectives/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        props: {
            treeDetail: {
                type: Object,
                default: {}
            }
        },
        data() {
            return {
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
                    confirmInvali: this.getI18nByKey('confirmInvali'),
                    confirmInvalidation: this.getI18nByKey('confirmInvalidation'),
                    confirmValidation: this.getI18nByKey('confirmValidation'),
                    confirmMoveTip: this.getI18nByKey('confirmMoveTip'),
                    confirmMove: this.getI18nByKey('confirmMove'),
                    createSuccess: this.getI18nByKey('createSuccess'),
                    editSuccess: this.getI18nByKey('editSuccess'),
                    batchSetCropping: this.getI18nByKey('batchSetCropping'),
                    viewQualityObjectives: this.getI18nByKey('viewQualityObjectives'),
                    createQualityObjectives: this.getI18nByKey('createQualityObjectives'),
                    editingQualityObjectives: this.getI18nByKey('editingQualityObjectives'),
                    createChildNodes: this.getI18nByKey('createChildNodes'),
                    createPeerNodes: this.getI18nByKey('createPeerNodes')
                },
                selectList: [],
                showFormDialog: false,
                showCroppDialog: false,
                tableData: [],
                checkData: [],
                columns: [],
                tableMaxHeight: 380, // 表格高度
                heightDiff: 286,
                defaultTableHeight: 350,
                value: 'ExpandAll',
                formDialogTitle: '',
                oid: '',
                layoutName: 'DETAIL',
                parentRefId: 'OR:erd.cloud.cbb.review.entity.QualityObjective:-1'
            };
        },
        created() {
            this.getHeight();
        },
        computed: {
            className() {
                return store.state.classNameMapping.QualityObjective;
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
            tableKey() {
                return 'ReviewQualityObjectiveView';
            },
            actionConfigKey() {
                return 'CBB_REVIEW_QUALITY_LIST_MENU';
            },
            moreBtnKey() {
                return 'CBB_REVIEW_QUALITY_OPERATE_MENU';
            },
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'operation',
                        type: 'default'
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
                    tableKey: this.tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        pagination: {
                            // 隐藏分页
                            showPagination: false
                        },
                        tableBaseConfig: {
                            treeNode: 'erd.cloud.cbb.review.entity.QualityObjective#name',
                            treeConfig: {
                                hasChildField: 'hasChild',
                                rowField: 'oid',
                                lazy: false,
                                parentField: 'parentRef',
                                transform: false
                            },
                            checkboxConfig: {
                                checkStrictly: false,
                                showHeader: true
                            }
                        },
                        tableRequestConfig: {
                            url: '/element/qualityObjective/listTree',
                            method: 'GET',
                            params: {
                                reviewPointOid: this.treeDetail.oid
                            },
                            transformResponse: [
                                (data) => {
                                    let resData = JSON.parse(data);
                                    let records = _this.transformData(resData.data || []);
                                    resData.data = {
                                        childrenList: resData.data || [],
                                        records
                                    };
                                    return resData;
                                }
                            ]
                        },
                        toolbarConfig: {
                            fuzzySearch: {
                                show: true, // 是否显示普通模糊搜索，默认显示
                                searchCondition: ['name'],
                                isLocalSearch: true
                            },
                            actionConfig: {
                                name: _this.actionConfigKey,
                                containerOid: '',
                                className: _this.className
                            }
                        },
                        fieldLinkConfig: {
                            fieldLink: true,
                            fieldLinkName: 'erd.cloud.cbb.review.entity.QualityObjective#name',
                            linkClick: (row) => {
                                this.openDetail(row);
                            }
                        },

                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent // 复选框勾选事件
                        },
                        slotsField: this.slotsField,
                        isFilterAble: false
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
            getActionConfig(row) {
                return {
                    name: this.moreBtnKey,
                    objectOid: row.oid,
                    className: this.className
                };
            },
            // 通过递归对数据进行重新赋值
            transformData(obj) {
                let arr = [];
                obj.map((item) => {
                    let attrData = item;
                    item.attrRawList.forEach((item) => {
                        attrData[item.attrName] = item.displayName;
                    });
                    if (item.children) {
                        attrData.children = this.transformData(item.children);
                    }
                    arr.push(attrData);
                });
                return arr;
            },
            openDetail(val) {
                this.showFormDialog = true;
                this.formDialogTitle = this.i18nMappingObj['viewQualityObjectives'];
                this.layoutName = 'DETAIL';
                this.oid = val.oid;
            },
            edit(id) {
                this.showFormDialog = true;
                this.oid = id;
                this.formDialogTitle = this.i18nMappingObj['editingQualityObjectives'];
                this.layoutName = 'UPDATE';
            },
            setAllTreeExpand() {
                let tableInstance = this.$refs.qualityTreeTable.getTableInstance('vxeTable');
                tableInstance.instance.setAllTreeExpand(true);
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
            // 设置move
            setMove(data, val) {
                this.$famHttp({
                    url: '/element/qualityObjective/move',
                    method: 'put',
                    className: this.className,
                    params: {
                        moveDirection: val,
                        qualityObjectiveOid: data.oid
                    }
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.$message({
                            type: 'success',
                            message: this.i18nMappingObj['success']
                        });
                        this.refresh();
                    }
                });
            },
            // 刷新表格
            refresh() {
                this.$refs.qualityTreeTable?.refreshTable();
            },
            afterSubmit() {
                this.refresh();
            },
            beforeSubmit(data, next) {
                data?.attrRawList.push({
                    attrName: 'reviewPointRef',
                    value: this.treeDetail.oid
                });
                // data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                data.action = 'CREATE';
                let tip = this.i18nMappingObj['createSuccess'];
                if (data.oid) {
                    data.action = 'UPDATE';
                    tip = this.i18nMappingObj['editSuccess'];
                } else {
                    data.attrRawList.push({
                        attrName: 'status',
                        value: 'VALID'
                    });
                    data.attrRawList.push({
                        attrName: 'parentRef',
                        value: this.parentRefId
                    });
                }
                next(data, tip);
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
            handleCancel() {
                this.innerVisible = false;
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            CroppingDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/reviewElements/components/Cropping/index.js')
            ),

            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            DialogForm: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-config/components/qualityObjectives/components/DialogForm/index.js')
            )
        }
    };
});
