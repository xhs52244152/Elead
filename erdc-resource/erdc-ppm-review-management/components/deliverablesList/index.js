define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/deliverablesList/index.html'),
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js')
], function (ErdcKit, template, commonMixin, { i18nMappingObj }) {
    const subReviewComponent = {
        template,
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    cutItem: this.getI18nByKey('cutItem'),
                    recoverItem: this.getI18nByKey('recoverItem'),
                    conclute: this.getI18nByKey('conclute'),
                    keyWord: this.getI18nByKey('keyWord')
                },
                typeDictName: 'WfReviewElementConclusionType', // 类型数据字典查询标识
                reviewOptions: [],
                formDialogTitle: i18nMappingObj.viewDeliveryList, // 查看交付件清单
                fileList: [],
                formData: {},
                className: 'erd.cloud.ppm.review.entity.WfDeliveryList',
                oid: '',
                dialogName: '',
                showDialog: false,
                viewReview: true,
                layoutName: ''
            };
        },
        props: {
            formInfo: {
                type: String,
                default: ''
            },
            leafNode: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            zoomFlag: {
                type: Boolean,
                default: false
            },
            submissionFlag: {
                type: Boolean,
                default: false
            },
            businessData: {
                type: Array,
                default: () => {
                    return [];
                }
            },
            currentClickNode: String
        },
        mixins: [commonMixin],
        created() {
            this.getWfReviewTypeOptions();
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            LibraryDialog: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/reviewElements/component/libraryDialog/index.js')
            )
        },
        computed: {
            vm() {
                return this;
            },
            enableScrollLoad() {
                return true;
            },
            searchFlag() {
                return !this.$refs.deliverREDtable.$refs.FamAdvancedTable.searchStr;
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
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfDeliveryList#conclusion',
                        type: 'header'
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfDeliveryList#conclusion',
                        type: 'default'
                    }
                ];
            },
            customSlotField() {
                return this.slotsField.filter((item) => item.prop !== 'icon');
            },
            submitReviewFlag() {
                const key = (
                    this.$route.query?.taskDefKey ||
                    (this.leafNode.highLightedActivities && this.leafNode?.highLightedActivities[0]) ||
                    ''
                ).toLocaleUpperCase();
                return ['SUBMITTALS', 'SELF_CHECK', 'SELFCHECK'].includes(key);
            },
            reviewActionFlag() {
                let key = !this.currentClickNode
                    ? this.$route.query?.processDefinitionKey ||
                      this.$route.query?.taskDefKey ||
                      (this.leafNode.highLightedActivities && this.leafNode?.highLightedActivities[0])
                    : 'Draft';
                if (!key) {
                    key = this.$route.name === 'workflowActivator' ? 'Activator' : 'Draft';
                } else if (key !== 'Draft') {
                    key = key.toLocaleUpperCase();
                }
                return !['TECHNICALREVIEW', 'DCPREVIEW', 'DRAW_UP', 'DRAWUP', 'Draft'].includes(key);
            },
            defaultTableHeight() {
                return document.body.clientHeight - 243;
            },
            viewTableConfig() {
                const _this = this;
                let config = {
                    tableKey: 'WfDeliveryListView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        useCodeConfig: true,
                        tableBaseConfig: {
                            maxLine: _this.zoomFlag ? 'none' : 5,
                            rowClassName(data) {
                                let deletedStr = _this.getCroppedFlag(data.row) ? 'fam-erd-table__row--deleted' : '';
                                return deletedStr;
                            }
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: {
                                className: _this.className,
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.ppm.review.entity.WfDeliveryList#reviewObjectRef',
                                        oper: 'EQ',
                                        logicalOperator: 'AND',
                                        sortOrder: 1,
                                        isCondition: true,
                                        value1: _this.formInfo
                                            ? _this.formInfo
                                            : 'OR:erd.cloud.ppm.review.entity.ReviewObject:-1'
                                    }
                                ]
                            },
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        let { businessData } = _this;
                                        let idkey = 'erd.cloud.ppm.review.entity.WfDeliveryList#';
                                        let key =
                                            _this.$route.query?.processDefinitionKey || _this.$route.query?.taskDefKey;
                                        if (
                                            ['TechnicalReview', 'DcpReview'].includes(key) ||
                                            (_this.zoomFlag && _this.searchFlag) ||
                                            (_this.submissionFlag && _this.searchFlag)
                                        ) {
                                            if (
                                                businessData[0] &&
                                                businessData[0]?.reviewItems &&
                                                businessData[0].reviewItems.deliveryList
                                            ) {
                                                let qualityObjectiveList = businessData[0].reviewItems.deliveryList;
                                                let updatedRecords = qualityObjectiveList;

                                                // 重新映射记录
                                                let updatedRecordsMap = updatedRecords.map((item) => {
                                                    if (item.createBy && item.updateBy) {
                                                        item.createBy = null;
                                                        item.updateBy = null;
                                                    }
                                                    const obj = {};
                                                    item.attrRawList.forEach((ite) => {
                                                        if (
                                                            ite.attrName !== 'createBy' &&
                                                            ite.attrName !== 'updateBy'
                                                        ) {
                                                            if (!ite.attrName.includes(idkey)) {
                                                                obj[`${idkey}${ite.attrName}`] = ite.displayName;
                                                            } else {
                                                                obj[`${ite.attrName}`] = ite.displayName;
                                                            }
                                                        }
                                                    });
                                                    return {
                                                        ...item,
                                                        ...obj
                                                    };
                                                });
                                                resData.data.records = updatedRecordsMap;
                                            }
                                        }
                                    } catch (err) {
                                        console.log('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        addCheckbox: false, // 不显示复选框
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                placeholder: _this.i18nMappingObj.keyWord,
                                show: true, // 是否显示普通模糊搜索，默认显示
                                isLocalSearch: true
                            },
                            moreOperateList: []
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                        },
                        pagination: {
                            // 分页
                            showPagination: false, // 是否显示分页
                            pageSize: 999
                        },

                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.review.entity.WfDeliveryList#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
                        addOperationCol: !this.reviewActionFlag && !this.currentClickNode,
                        slotsField: this.slotsField,
                        isFilterAble: false
                    }
                };
                return config;
            },
            nodeProcess() {
                return this.processInfosRealTime?.nodeMap?.node?.highLightedActivities[0];
            }
        },
        methods: {
            queryLayoutParams() {
                return {
                    objectOid: this.oid || '',
                    name: 'DETAIL',
                    attrRawList: [
                        // {
                        //     attrName: 'layoutSelector',
                        //     value: 'DETAIL'
                        // }
                    ]
                };
            },
            fnCallback(Data) {
                this.$emit('ready', { type: 'deliveryList', deliveryList: Data.data.records });
                // let { businessData } = this;
                // if (!(businessData.length && businessData[0].reviewItems && businessData[0].reviewItems.deliveryList)) {
                //     let deliveryList = Data.data.records;
                //     // businessData[0].reviewItems = {
                //     //     reviewElementList
                //     // };
                //     this.$emit('ready', { type: 'deliveryList', deliveryList: deliveryList });
                // }
            },
            getScalableFlag(data) {
                let idkey = 'erd.cloud.ppm.review.entity.WfDeliveryList#';
                let scalable = data['scalable'] || data[`${idkey}scalable`];
                return [true, '是'].includes(scalable);
            },
            getSlotsName(slotsField) {
                return slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            getCroppedFlag(data) {
                let idkey = 'erd.cloud.ppm.review.entity.WfDeliveryList#';
                let scalable = data['cropped'] || data[`${idkey}cropped`];
                return [true, '是'].includes(scalable);
            },
            getWfReviewTypeOptions() {
                this.getWfReviewType().then((res) => {
                    this.reviewOptions = res || [];
                });
            },
            handleStateChange(row) {
                let tableData = this.$refs.deliverREDtable.$refs.FamAdvancedTable.tableData;
                tableData.forEach((item) => {
                    item.attrRawList.forEach((ol) => {
                        if (
                            item.oid === row.oid &&
                            ol.attrName === 'erd.cloud.ppm.review.entity.WfDeliveryList#conclusion'
                        ) {
                            this.$set(ol, 'value', row['erd.cloud.ppm.review.entity.WfDeliveryList#conclusion']);
                            this.$set(ol, 'displayName', row['erd.cloud.ppm.review.entity.WfDeliveryList#conclusion']);
                        }
                    });
                });
                this.$emit('ready', { type: 'deliveryList', deliveryList: tableData });
            },
            onDetail(row) {
                this.formData = JSON.parse(JSON.stringify(row));
                // this.oid = row.oid;
                // if (!this.businessData[0]?.roleBObjectRef) {
                //     this.dialogName = row.typeName;
                // } else {
                //     this.dialogName = this.className;
                // }
                this.dialogName = this.className;
                // 提交节点使用创建布局
                if (!this.businessData[0]?.roleBObjectRef) {
                    this.layoutName = 'CREATE';
                } else {
                    this.layoutName = this.taskInfosRealtime.isCandidateUser ? 'CREATE' : 'DETAIL';
                }
                this.oid = row.oid;
                this.showDialog = true;
            },
            getActionConfig(row) {
                if (row.cropped) {
                    return {
                        name: 'PPM_PROJECT_REVIEW_PROCESS_REVIEW_ITEM_RECOVER_MENU',
                        objectOid: '',
                        className: this.className
                    };
                } else {
                    return {
                        name: 'PPM_PROJECT_REVIEW_PROCESS_REVIEW_ITEM_CROPPED_MENU',
                        objectOid: '',
                        className: this.className
                    };
                }
            },
            cutItem(row) {
                // 定义要添加的参数
                let params = {
                    attrName: 'cropped',
                    displayName: true,
                    value: true
                };
                // 获取表格数据的引用
                let tableData = this.$refs.deliverREDtable.$refs.FamAdvancedTable.tableData;
                tableData.map((item) => {
                    if (item.createBy && item.updateBy) {
                        item.createBy = null;
                        item.updateBy = null;
                    }
                });
                let updatedRow = tableData.find((item) => item.oid === row.oid);
                updatedRow.attrRawList.push(params);
                if (!row['cropped']) {
                    this.$set(row, 'cropped', true);
                }
                if (!row['erd.cloud.ppm.review.entity.WfDeliveryList#cropped']) {
                    this.$set(row, 'erd.cloud.ppm.review.entity.WfDeliveryList#cropped', true);
                }
                let deliveryList = this.setSourceData(row);
                this.$emit('ready', { type: 'deliveryList', deliveryList });
            },
            recoverItem(row) {
                // 获取表格数据的引用
                let tableData = this.$refs.deliverREDtable.$refs.FamAdvancedTable.tableData;
                let rowData = tableData.find((item) => item.oid === row.oid);
                rowData.attrRawList.forEach((item) => {
                    if (item.attrName.includes('cropped')) {
                        this.$set(item, 'value', false);
                        this.$set(item, 'displayName', false);
                    }
                });
                if (row['cropped']) {
                    this.$set(row, 'cropped', false);
                }
                if (row['erd.cloud.ppm.review.entity.WfDeliveryList#cropped']) {
                    this.$set(row, 'erd.cloud.ppm.review.entity.WfDeliveryList#cropped', false);
                }
                let deliveryList = this.setSourceData(row);
                this.$emit('ready', { type: 'deliveryList', deliveryList });
            },
            setSourceData(row) {
                this.$refs.deliverREDtable.$refs.FamAdvancedTable.sourceData =
                    this.$refs.deliverREDtable.$refs.FamAdvancedTable.sourceData.map((item) => {
                        if (item.oid === row.oid) {
                            item = ErdcKit.deepClone(row);
                        }
                        item.createBy = null;
                        item.updateBy = null;
                        return item;
                    });
                return this.$refs.deliverREDtable.$refs.FamAdvancedTable.sourceData;
            }
        }
    };
    return subReviewComponent;
});
