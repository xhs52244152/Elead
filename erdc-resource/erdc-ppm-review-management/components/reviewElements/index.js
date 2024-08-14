define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/reviewElements/index.html'),
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/reviewElements/style.css')
], function (ErdcKit, template, commonMixin, { i18nMappingObj }) {
    const subReviewComponent = {
        template,
        mixins: [commonMixin],
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
        inject: ['draftInfos'],
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    cutItem: this.getI18nByKey('cutItem'),
                    recoverItem: this.getI18nByKey('recoverItem'),
                    conclution: this.getI18nByKey('conclution'),
                    conclute: this.getI18nByKey('conclute'),
                    keyWord: this.getI18nByKey('keyWord')
                },
                className: 'erd.cloud.ppm.review.entity.WfReviewElement',
                dialogName: '',
                formDialogTitle: i18nMappingObj.viewReviewElements, // 查看评审要素
                oid: '',
                showDialog: false,
                formData: {},
                fileList: [],
                typeDictName: 'WfReviewElementConclusionType', // 类型数据字典查询标识
                reviewOptions: [],
                viewReview: true,
                layoutName: ''
            };
        },
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
                        prop: 'erd.cloud.ppm.review.entity.WfReviewElement#conclusion',
                        type: 'header'
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfReviewElement#conclusion',
                        type: 'default'
                    }
                ];
            },
            customSlotField() {
                return this.slotsField.filter((item) => item.prop !== 'icon');
            },
            enableScrollLoad() {
                return true;
            },
            defaultTableHeight() {
                return document.body.clientHeight - 243;
            },
            searchFlag() {
                return !this.$refs.reviewtable.$refs.FamAdvancedTable.searchStr;
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
            viewTableConfig() {
                const _this = this;
                let config = {
                    tableKey: 'WfReviewElementView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
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
                                        attrName: 'erd.cloud.ppm.review.entity.WfReviewElement#reviewObjectRef',
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
                                        let idkey = 'erd.cloud.ppm.review.entity.WfReviewElement#';
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
                                                businessData[0].reviewItems.reviewElementList
                                            ) {
                                                let qualityObjectiveList =
                                                    businessData[0].reviewItems.reviewElementList;
                                                let updatedRecords = qualityObjectiveList;

                                                // 重新映射记录
                                                let updatedRecordsMap = updatedRecords.map((item) => {
                                                    const obj = {};
                                                    if (item.createBy && item.updateBy) {
                                                        item.createBy = null;
                                                        item.updateBy = null;
                                                    }
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
                                        // console.log('file: index.js ==> line 28 ==> data ==> resData', resData);
                                    } catch (err) {
                                        console.log('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        headerRequestConfig: {
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                    } catch (err) {
                                        console.error('err===>', err);
                                    }
                                    if (
                                        _this.leafNode.highLightedActivities?.[0].toLocaleUpperCase() === 'SUBMITTALS'
                                    ) {
                                        // 结论设置为固定列 ISSUE2024042626412
                                        resData?.data?.headers?.forEach((item) => {
                                            if (
                                                ['erd.cloud.ppm.review.entity.WfReviewElement#conclusion'].includes(
                                                    item.attrName
                                                )
                                            ) {
                                                item.fixed = 'right';
                                            }
                                        });
                                    }

                                    return resData;
                                }
                            ]
                        },
                        addCheckbox: false, // 不显示复选框
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: _this.reviewActionFlag ? true : false, // 是否显示配置列，默认显示
                            showMoreSearch: false, // 是否显示高级搜索，默认显示
                            showRefresh: _this.reviewActionFlag ? true : false, //
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
                        useCodeConfig: true,
                        addOperationCol: !this.reviewActionFlag && !this.currentClickNode, // 是否显示操作列
                        pagination: {
                            // 分页
                            showPagination: false, // 是否显示分页
                            pageSize: 999
                        },
                        addSeq: true,
                        customColums: (columns) => {
                            // _.each(columns, (item) => {
                            //     // 删除fixed属性，拖动会导致样式问题
                            //     if (item.fixed) _this.$delete(item, 'fixed');
                            // });
                            return columns;
                        },
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.review.entity.WfReviewElement#identifierNo', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
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
            fnCallback(Data) {
                this.$emit('ready', { type: 'reviewElementList', reviewElementList: Data.data.records });
                // let { businessData } = this;
                // if (
                //     !(
                //         businessData.length &&
                //         businessData[0].reviewItems &&
                //         businessData[0].reviewItems.reviewElementList
                //     )
                // ) {
                //     let reviewElementList = Data.data.records;
                //     // businessData[0].reviewItems = {
                //     //     reviewElementList
                //     // };
                //     this.$emit('ready', { type: 'reviewElementList', reviewElementList: reviewElementList });
                // }
            },
            getScalableFlag(data) {
                let idkey = 'erd.cloud.ppm.review.entity.WfReviewElement#';
                let scalable = data['scalable'] || data[`${idkey}scalable`];
                return [true, '是'].includes(scalable);
            },
            getCroppedFlag(data) {
                let idkey = 'erd.cloud.ppm.review.entity.WfReviewElement#';
                let scalable = data['cropped'] || data[`${idkey}cropped`];
                return [true, '是'].includes(scalable);
            },
            getSlotsName(slotsField) {
                return slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            getWfReviewTypeOptions() {
                this.getWfReviewType().then((res) => {
                    this.reviewOptions = res || [];
                });
            },
            onDetail(row) {
                this.formData = JSON.parse(JSON.stringify(row));
                this.dialogName = this.className;
                // 提交节点使用创建布局
                if (!this.businessData[0]?.roleBObjectRef) {
                    this.layoutName = 'CREATE';
                } else {
                    this.layoutName = this.taskInfosRealtime.isCandidateUser ? 'CREATE' : 'DETAIL';
                }
                this.oid = row.oid;
                // if (!this.businessData[0]?.roleBObjectRef) {
                //     this.dialogName = row.typeName;
                // } else {
                //     this.dialogName = this.className;
                // }
                this.showDialog = true;
            },
            reviewClassName({ rowIndex }) {
                console.log('www', rowIndex);
                // if ([1,2, 3].includes(rowIndex)) {
                // return 'green';
                // }
            },
            handleStateChange(row) {
                let tableData = this.$refs.reviewtable.$refs.FamAdvancedTable.tableData;
                tableData.forEach((item) => {
                    item.attrRawList.forEach((ol) => {
                        if (
                            item.oid === row.oid &&
                            ol.attrName === 'erd.cloud.ppm.review.entity.WfReviewElement#conclusion'
                        ) {
                            this.$set(ol, 'value', row['erd.cloud.ppm.review.entity.WfReviewElement#conclusion']);
                            this.$set(ol, 'displayName', row['erd.cloud.ppm.review.entity.WfReviewElement#conclusion']);
                        }
                    });
                });

                this.$emit('ready', { type: 'reviewElementList', reviewElementList: tableData });
            },
            removeFile() {},
            uploadData() {},
            cutItem(row) {
                // 定义要添加的参数
                let params = {
                    attrName: 'cropped',
                    displayName: true,
                    value: true
                };
                // 获取表格数据的引用
                let tableData = this.$refs.reviewtable.$refs.FamAdvancedTable.tableData;
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
                if (!row['erd.cloud.ppm.review.entity.WfReviewElement#cropped']) {
                    this.$set(row, 'erd.cloud.ppm.review.entity.WfReviewElement#cropped', true);
                }
                let reviewElementList = this.setSourceData(row);
                this.$emit('ready', {
                    type: 'reviewElementList',
                    reviewElementList
                });
            },
            recoverItem(row) {
                // 获取表格数据的引用
                let tableData = this.$refs.reviewtable.$refs.FamAdvancedTable.tableData;
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
                if (row['erd.cloud.ppm.review.entity.WfReviewElement#cropped']) {
                    this.$set(row, 'erd.cloud.ppm.review.entity.WfReviewElement#cropped', false);
                }
                let reviewElementList = this.setSourceData(row);
                this.$emit('ready', {
                    type: 'reviewElementList',
                    reviewElementList
                });
            },
            // 高级表格搜索的时候深拷贝了sourceData，修改的数据没有赋值给sourceData，就会存在我搜完去对表格数据做处理，再去搜索的时候数据还是原来的值的问题
            setSourceData(row) {
                this.$refs.reviewtable.$refs.FamAdvancedTable.sourceData =
                    this.$refs.reviewtable.$refs.FamAdvancedTable.sourceData.map((item) => {
                        if (item.oid === row.oid) {
                            item = ErdcKit.deepClone(row);
                        }
                        // 因为后端会拿到这两个值去做处理，要设置成null
                        item.updateBy = null;
                        item.createBy = null;
                        return item;
                    });
                return this.$refs.reviewtable.$refs.FamAdvancedTable.sourceData;
            }
        }
    };
    return subReviewComponent;
});
