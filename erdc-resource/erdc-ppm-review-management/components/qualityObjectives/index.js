define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/qualityObjectives/index.html'),
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/qualityObjectives/index.css')
], function (ErdcKit, template, commonMixin, { i18nMappingObj }) {
    const subReviewComponent = {
        template,
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
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    cutItem: this.getI18nByKey('cutItem'),
                    recoverItem: this.getI18nByKey('recoverItem'),
                    conclute: this.getI18nByKey('conclute')
                },
                className: 'erd.cloud.ppm.review.entity.WfQualityObjective',
                value: 'ExpandOne',
                formDialogTitle: i18nMappingObj.viewQualityObjectives, // 查看质量目标
                oid: '',
                formData: {},
                columns: [],
                fileList: [],
                showDialog: false,
                dialogName: '',
                typeDictName: 'WfReviewElementConclusionType', // 类型数据字典查询标识
                reviewOptions: [],
                viewReview: true,
                layoutName: ''
            };
        },
        mixins: [commonMixin],
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            LibraryDialog: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/reviewElements/component/libraryDialog/index.js')
            )
        },
        created() {
            this.getWfReviewTypeOptions();
        },
        computed: {
            vm() {
                return this;
            },
            enableScrollLoad() {
                return true;
            },
            searchFlag() {
                return !this.$refs.reviewQuatable.$refs.FamAdvancedTable.searchStr;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'operation',
                        type: 'default', // 显示字段内容插槽
                        fixed: 'right',
                        width: 270,
                        showOverflow: false,
                        minWidth: 270
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfQualityObjective#conclusion',
                        type: 'header'
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfQualityObjective#conclusion',
                        type: 'default'
                    },
                    {
                        prop: 'icon',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfQualityObjective#actualValue',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.review.entity.WfQualityObjective#achievementStatus',
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
            defaultTableHeight() {
                return document.body.clientHeight - 242;
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
                return !['TECHNICALREVIEW', 'DRAW_UP', 'DRAWUP', 'Draft', 'DCPREVIEW'].includes(key);
            },

            viewTableConfig() {
                const _this = this;
                let oid = _this.formInfo ? _this.formInfo : 'OR:erd.cloud.ppm.review.entity.ReviewObject:-1';
                let config = {
                    tableKey: 'WfQualityObjectiveView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        useCodeConfig: true,
                        tableBaseConfig: {
                            'maxLine': _this.zoomFlag ? 'none' : 5,
                            'treeNode': 'erd.cloud.ppm.review.entity.WfQualityObjective#name',
                            'treeConfig': {
                                hasChildField: 'hasChild',
                                rowField: 'oid',
                                parentField: 'parentRef'
                            },
                            'row-id': 'oid',
                            'showOverflow': true,
                            'rowClassName'(data) {
                                let deletedStr = _this.getCroppedFlag(data.row) ? 'fam-erd-table__row--deleted' : '';
                                return deletedStr;
                            }
                        },

                        tableRequestConfig: {
                            url: `/ppm/review/wfQualityObjective/listTree?reviewObjectOid=${oid}`, // 表格数据接口
                            method: 'GET',
                            // 更多配置参考axios官网
                            data: {},
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        let { businessData } = _this;
                                        let records = _this.transformData(resData.data || []);

                                        resData.data = {
                                            childrenList: resData.data || [],
                                            records
                                        };

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
                                                businessData[0].reviewItems.qualityObjectiveList
                                            ) {
                                                let qualityObjectiveList =
                                                    businessData[0].reviewItems.qualityObjectiveList;
                                                let updatedRecords = qualityObjectiveList;
                                                let updatedRecordsMap = _this.transformData(updatedRecords || []);
                                                resData.data = {
                                                    childrenList: updatedRecords || [],
                                                    records: updatedRecordsMap
                                                };
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
                            // 工具栏
                            showConfigCol: _this.reviewActionFlag ? true : false, // 是否显示配置列，默认显示
                            showMoreSearch: false, // 是否显示高级搜索，默认显示
                            showRefresh: _this.reviewActionFlag ? true : false,
                            fuzzySearch: {
                                placeholder: '请输入关键词搜索',
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
                        addSeq: true,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.review.entity.WfQualityObjective#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
                        slotsField: this.slotsField,
                        addOperationCol: !this.reviewActionFlag && !this.currentClickNode,
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
            getSlotsName(slotsField) {
                return slotsField?.map((ite) => {
                    return `column:${ite.type}:${ite.prop}:content`;
                });
            },
            getScalableFlag(data) {
                let idkey = 'erd.cloud.ppm.review.entity.WfQualityObjective#';
                let scalable = data['scalable'] || data[`${idkey}scalable`];
                return [true, '是'].includes(scalable);
            },
            getCroppedFlag(data) {
                let idkey = 'erd.cloud.ppm.review.entity.WfQualityObjective#';
                let scalable = data['cropped'] || data[`${idkey}cropped`];
                return [true, '是'].includes(scalable);
            },
            // 通过递归对数据进行重新赋值
            transformData(obj) {
                let arr = [];
                let idkey = 'erd.cloud.ppm.review.entity.WfQualityObjective#';
                obj.map((item) => {
                    let attrData = item;
                    if (item.createBy && item.updateBy) {
                        item.createBy = null;
                        item.updateBy = null;
                    }
                    item.attrRawList.forEach((item) => {
                        if (item.attrName !== 'createBy' && item.attrName !== 'updateBy') {
                            if (!item.attrName.includes(idkey)) {
                                attrData[`${idkey}${item.attrName}`] = item.displayName;
                            } else {
                                attrData[item.attrName] = item.displayName;
                            }
                        }
                    });
                    if (item.children) {
                        attrData.children = this.transformData(item.children);
                    }
                    arr.push(attrData);
                });
                return arr;
            },
            getHandleChange(objData, row) {
                objData.forEach((item) => {
                    item.attrRawList.forEach((ol) => {
                        if (
                            item.oid === row.oid &&
                            ol.attrName === 'erd.cloud.ppm.review.entity.WfQualityObjective#conclusion'
                        ) {
                            this.$set(ol, 'value', row['erd.cloud.ppm.review.entity.WfQualityObjective#conclusion']);
                            this.$set(
                                ol,
                                'displayName',
                                row['erd.cloud.ppm.review.entity.WfQualityObjective#conclusion']
                            );
                        }
                    });
                    if (item.children) {
                        item.children = this.getHandleChange(item.children, row);
                    }
                });
                return objData;
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
                // 判断流程是否发起，没发起则用之前的className
                // if (!this.businessData[0]?.roleBObjectRef) {
                //     this.dialogName =
                //         row.attrRawList.find((item) => item.attrName.indexOf('typeName') > -1)?.value ||
                //         'erd.cloud.cbb.review.entity.QualityObjective';
                // } else {
                //     this.dialogName = this.className;
                // }

                this.showDialog = true;
            },
            fnCallback(Data) {
                // console.log('%%%333', businessData);
                // console.log('%%%1113', Data);
                this.$emit('ready', { type: 'qualityObjectiveList', qualityObjectiveList: Data.data.records });
                // let { businessData } = this;
                // if (!(businessData[0].reviewItems && businessData[0].reviewItems.qualityObjectiveList)) {
                //     let qualityObjectiveList = Data.data;
                //     this.$emit('ready', { type: 'qualityObjectiveList', qualityObjectiveList: qualityObjectiveList });
                // }
            },
            handleStateChange(row) {
                // 实际值
                const actualValueIndex = row.attrRawList.findIndex(
                    (item) => item.attrName === 'erd.cloud.ppm.review.entity.WfQualityObjective#actualValue'
                );
                const actualValue = row['erd.cloud.ppm.review.entity.WfQualityObjective#actualValue'];
                this.$set(row.attrRawList, actualValueIndex, {
                    ...row.attrRawList[actualValueIndex],
                    value: actualValue,
                    displayName: actualValue,
                    tooltip: actualValue
                });
                // 达成情况
                const achievementStatusIndex = row.attrRawList.findIndex(
                    (item) => item.attrName === 'erd.cloud.ppm.review.entity.WfQualityObjective#achievementStatus'
                );
                const achievementStatus = row['erd.cloud.ppm.review.entity.WfQualityObjective#achievementStatus'];
                this.$set(row.attrRawList, achievementStatusIndex, {
                    ...row.attrRawList[achievementStatusIndex],
                    value: achievementStatus,
                    displayName: achievementStatus,
                    tooltip: achievementStatus
                });
                let tableData = this.$refs.reviewQuatable.$refs.FamAdvancedTable.tableData;
                if (tableData.length) {
                    tableData = this.getHandleChange(tableData, row);
                }
                this.$emit('ready', { type: 'qualityObjectiveList', qualityObjectiveList: tableData });
            },
            reviewCallback() {
                setTimeout(() => {
                    this.setAllTreeExpand();
                }, 0);
                this.columns = this.getcolumns();
            },
            getWfReviewTypeOptions() {
                this.getWfReviewType().then((res) => {
                    this.reviewOptions = res || [];
                });
            },
            getcolumns() {
                let columns = [];
                if (this.$refs.reviewQuatable) {
                    let tableInstance = this.$refs.reviewQuatable.getTableInstance('advancedTable');
                    columns = tableInstance.instance.columns.filter(
                        (item) => item.attrName && item.attrName !== 'operation'
                    );
                }
                return columns;
            },
            removeFile() {},
            setAllTreeExpand() {
                let tableInstance = this.$refs.reviewQuatable.getTableInstance('vxeTable');
                tableInstance.instance.setAllTreeExpand(true);
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
                let tableData = this.$refs.reviewQuatable.$refs.FamAdvancedTable.tableData;
                tableData.map((item) => {
                    if (item.createBy && item.updateBy) {
                        item.createBy = null;
                        item.updateBy = null;
                    }
                });
                row.attrRawList.push(params);
                if (!row['cropped']) {
                    this.$set(row, 'cropped', true);
                }
                if (!row['erd.cloud.ppm.review.entity.WfQualityObjective#cropped']) {
                    this.$set(row, 'erd.cloud.ppm.review.entity.WfQualityObjective#cropped', true);
                }
                let qualityObjectiveList = this.setSourceData(row);
                this.$emit('ready', { type: 'qualityObjectiveList', qualityObjectiveList });
                if (row.children && row.children.length > 0) {
                    row.children.forEach((item) => {
                        this.cutItem(item);
                    });
                }
            },
            recoverItem(row) {
                // 获取表格数据的引用
                let tableData = this.$refs.reviewQuatable.$refs.FamAdvancedTable.tableData;
                row.attrRawList.forEach((item) => {
                    if (item.attrName.includes('cropped')) {
                        this.$set(item, 'value', false);
                        this.$set(item, 'displayName', false);
                    }
                });
                if (row['cropped']) {
                    this.$set(row, 'cropped', false);
                }
                if (row['erd.cloud.ppm.review.entity.WfQualityObjective#cropped']) {
                    this.$set(row, 'erd.cloud.ppm.review.entity.WfQualityObjective#cropped', false);
                }
                let qualityObjectiveList = this.setSourceData(row);
                this.$emit('ready', { type: 'qualityObjectiveList', qualityObjectiveList });
                if (row.children && row.children.length > 0) {
                    row.children.forEach((item) => {
                        this.recoverItem(item);
                    });
                }
            },
            setSourceData(row) {
                this.changeSourceData(row);
                return this.$refs.reviewQuatable.$refs.FamAdvancedTable.sourceData;
            },
            changeSourceData(row, data) {
                data = data || this.$refs.reviewQuatable.$refs.FamAdvancedTable.sourceData;
                for (let i = 0; i < data.length; i++) {
                    let item = data[i];
                    if (item.oid === row.oid) {
                        row.createBy = null;
                        row.updateBy = null;
                        data.splice(i, 1, row);
                    }
                    item.createBy = null;
                    item.updateBy = null;
                    this.changeSourceData(row, item.children || []);
                }
                return data;
            }
        }
    };
    return subReviewComponent;
});
