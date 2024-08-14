define([
    'text!' + ELMP.resource('erdc-ppm-review-config/views/list/index.html'),
    'erdcloud.kit',
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-review-config/views/list/style.css')
], function (template, ErdcKit, store) {
    return {
        template,
        data() {
            return {
                tabList: [
                    {
                        name: 'basicInformation',
                        mateName: 'basicInformation',
                        isShow: true,
                        components: [
                            {
                                className: 'erd.cloud.cbb.review.entity.ReviewPoint',
                                refName: 'basicInformation',
                                detail: 'TypeManageBasicInfo',
                                detailUrl: '/element/attr'
                            }
                        ]
                    },
                    {
                        name: 'reviewElements',
                        mateName: 'REVIEW_ELEMENT',
                        isShow: true,
                        components: [
                            {
                                className: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                                refName: 'reviewElements',
                                detail: 'ReviewElements'
                            }
                        ]
                    },
                    {
                        name: 'deliverables',
                        mateName: 'DELIVERY_LIST',
                        isShow: true,
                        components: [
                            {
                                className: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                                refName: 'deliverables',
                                detail: 'Deliverables'
                            }
                        ]
                    },
                    {
                        name: 'qualityObjectives',
                        mateName: 'QUALITY_OBJECTIVE',
                        isShow: false,
                        components: [
                            {
                                className: 'erd.cloud.cbb.pbi.entity.HeavyTeam',
                                refName: 'qualityObjectives',
                                detail: 'QualityObjectives'
                            }
                        ]
                    }
                ],
                i18nLocalePath: ELMP.resource('erdc-ppm-review-config/locale/index.js'),
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    confirmInvalidation: this.getI18nByKey('confirmInvalidation'),
                    confirmInvali: this.getI18nByKey('confirmInvali'),
                    confirmPublish: this.getI18nByKey('confirmPublish'),
                    confirmPublishData: this.getI18nByKey('confirmPublishData'),
                    publishWorkTip: this.getI18nByKey('publishWorkTip'),

                    configTitle: this.getI18nByKey('configTitle'),

                    createSuccess: this.getI18nByKey('createSuccess'),
                    editSuccess: this.getI18nByKey('editSuccess'),
                    editingReviewPoints: this.getI18nByKey('editingReviewPoints'),
                    createReviewPoints: this.getI18nByKey('createReviewPoints'),
                    createReviewType: this.getI18nByKey('createReviewType'),
                    editReviewType: this.getI18nByKey('editReviewType'),

                    invalidWorkTip: this.getI18nByKey('invalidWorkTip'),
                    success: this.getI18nByKey('success'),
                    deleteWork: this.getI18nByKey('deleteWork')
                },
                left: {
                    width: '280px',
                    minWidth: 200,
                    maxWidth: '50%'
                },
                ruleCode: 'ReviewElementRule',
                formDialogTitle: '创建评审类型',
                showFormDialog: false,
                treeDetail: {},
                oid: '',
                layoutName: 'CREATE',
                currentOid: '',
                showTab: false,
                currentSelectTreeData: {},
                currentReviewType: {}, // 当前树层级的对象类型
                tabListData: [], // 创建一级评审树tab页签数据
                showTabList: [], // 树的一级(不包括一级)以下显示tab页签
                formClassName: store.state.classNameMapping.ReviewCategory // 评审点的className
            };
        },
        created() {
            this.getTabList();
        },
        computed: {
            className() {
                // 评审大类(一级)的className
                return store.state.classNameMapping.ReviewCategory;
            }
        },
        methods: {
            setDefaultVal(val, type) {
                this.currentSelectTreeData = val;
                // 树的一级和其他级className不同
                if (!val) {
                    this.formClassName = store.state.classNameMapping.ReviewCategory;
                } else {
                    if (val.level === -1) {
                        this.showTab = false;
                        this.formClassName =
                            type === 'handleEdit'
                                ? store.state.classNameMapping.ReviewCategory
                                : store.state.classNameMapping.ReviewPoint;
                    } else {
                        this.showTab = true;
                        this.formClassName = store.state.classNameMapping.ReviewPoint;
                    }
                }
            },
            handleNodeClick(val) {
                this.$nextTick(() => {
                    this.treeDetail = val;
                    this.currentSelectTreeData = val;
                    this.setDefaultVal(val, 'handleEdit');
                    if (val.level !== -1) {
                        this.filterTab(val);
                    }
                });
            },
            // 获取要显示的tab页签进行过滤显示
            filterTab() {
                this.$famHttp({
                    url: '/element/reviewPoint/getConfigTab',
                    method: 'GET',
                    className: this.className,
                    params: { oid: this.treeDetail['oid'] }
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.showTabList = resp.data;
                        this.showTabList.unshift('basicInformation');
                        this.tabList.forEach((item) => {
                            if (this.showTabList.includes(item.mateName)) {
                                item.isShow = true;
                            } else {
                                item.isShow = false;
                            }
                        });
                    }
                });
            },
            handleOperate(type, data) {
                this.setDefaultVal(data, type?.methodsName);
                // 获取当下树层级详情(主要是获取当前评审类型)
                this.getTreeDetail(data);
                const eventClick = {
                    handleDelete: this.handleDelete, // 删除
                    handleCreate: this.handleCreate, // 创建
                    handleEdit: this.handleEdit // 编辑
                };
                setTimeout(() => {
                    eventClick?.[type.methodsName] && eventClick?.[type.methodsName](data);
                }, 300);
            },
            getTabList() {
                this.$famHttp({
                    url: '/fam/dictionary/tree/reviewTabPageOption',
                    method: 'GET'
                }).then((resp) => {
                    if (resp.code === '200') {
                        this.tabListData = resp.data;
                    }
                });
            },
            getTreeDetail(val = { level: -1 }) {
                if (val?.level === -1) {
                    this.currentReviewType = val;
                } else {
                    this.$famHttp({
                        url: '/element/attr',
                        method: 'GET',
                        className: this.className,
                        params: { oid: val.oid }
                    }).then((resp) => {
                        if (resp.code === '200') {
                            let data = resp.data?.rawData || [];
                            this.currentReviewType =
                                _.find(data, (item) => item.attrName === 'reviewCategoryRef') || {};
                        }
                    });
                }
            },
            handleDelete(val) {
                this.$alert(
                    `<div><p style="display: flex;color: #000000d9"><i style="color: #e6a23c; padding-right: 8px; font-size: 24px;" class="el-icon-warning"></i>${this.i18nMappingObj['confirmDelete']}</p> </div>`,

                    this.i18nMappingObj['deleteTip'],
                    {
                        showCancelButton: true,
                        dangerouslyUseHTMLString: true
                    }
                )
                    .then(() => {
                        this.$famHttp({
                            url: '/element/delete',
                            method: 'DELETE',
                            className: this.className,
                            params: {
                                oid: val.oid
                            }
                        }).then((resp) => {
                            if (resp.code === '200') {
                                this.$message({
                                    type: 'success',
                                    message: this.i18nMappingObj['success']
                                });
                                this.$refs.reviewConfigTree?.getListTree();
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
            transformData(data, type) {
                // 评审大类
                if (type === store.state.classNameMapping.ReviewCategory) {
                    let relationList = [];
                    data?.attrRawList.some((el) => {
                        if (el.attrName === 'configTab') {
                            let tabs = el.value;
                            let submitTabsData = [];

                            this.tabListData.forEach((item) => {
                                if (tabs.includes(item.value)) {
                                    submitTabsData.push(item.value);
                                }
                            });
                            el.value = submitTabsData.join(',');
                        }
                        if (el.attrName === 'reviewType') {
                            el.value = data.oid ? el.value : el.value.value;
                        }
                        if (el.attrName === 'productInfo') {
                            if (el.value && el.value.length) {
                                let productLine = el.value;
                                relationList = productLine.map((item) => {
                                    return {
                                        action: 'CREATE',
                                        className: 'erd.cloud.cbb.review.entity.ReviewCategoryProductLink',
                                        attrRawList: [
                                            {
                                                attrName: 'roleBObjectRef',
                                                value: item
                                            }
                                        ]
                                    };
                                });
                            }
                        }
                    });
                    data['associationField'] = 'roleAObjectRef';
                    data['relationList'] = relationList;

                    data.attrRawList = _.filter(
                        data.attrRawList,
                        (item) => item.value !== null && item.attrName !== 'productInfo'
                    );
                    return data;
                } else {
                    data?.attrRawList.some((el) => {
                        if (el.attrName === 'reviewCategoryRef') {
                            el.value = this.currentReviewType.oid;
                        }
                        // if (el.attrName === 'responsibilityRoleRef' && data.oid) {
                        //     el.value = 'OR:' + el['value'].key + ':' + el['value'].id;
                        // }
                    });
                    let parentId = 'OR:erd.cloud.cbb.review.entity.ReviewPoint:-1';
                    if (this.currentSelectTreeData.level !== -1) {
                        if (data.oid) parentId = this.currentSelectTreeData.parentKey;
                        else parentId = this.currentSelectTreeData.oid;
                    }
                    let currentParent = {
                        attrName: 'parentRef',
                        value: parentId
                    };
                    data.attrRawList.push(currentParent);
                    // data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                    return data;
                }
            },
            beforeSubmit(data, next, draft) {
                let submitData = this.transformData(data, this.formClassName);
                submitData.className = this.formClassName;
                let tip = this.i18nMappingObj['createSuccess'];
                submitData.action = 'CREATE';
                if (submitData.oid) {
                    tip = this.i18nMappingObj['editSuccess'];
                    submitData.action = 'UPDATE';
                }
                next(submitData, draft, tip);
            },
            afterSubmit(val) {
                this.$refs.reviewConfigTree?.getListTree(val?.data);
                this.$refs.reviewConfigDetail?.refreshBasic();
            },
            // 回显数据处理
            echoData(val, cb) {
                let data = ErdcKit.deserializeAttr(val, {
                    valueMap: {
                        configTab: (e) => {
                            let tabs = e.value?.split(',') || [];
                            let submitTabsData = [];
                            this.tabListData.forEach((item) => {
                                if (tabs.includes(item.value)) {
                                    submitTabsData.push(item.value);
                                }
                            });
                            return submitTabsData;
                        },
                        reviewCategoryRef: (e) => {
                            return e.displayName || '';
                        },
                        responsibilityRoleRef: (e) => {
                            return e.oid || '';
                        }
                    }
                });

                cb(data);
            },
            handleEdit(val) {
                // 获取当下树层级详情(主要是获取当前评审类型)
                this.getTreeDetail(val);
                val.parentKey = this.currentSelectTreeData.parentKey;
                this.currentSelectTreeData = val || {};
                this.oid = val.oid;
                this.showFormDialog = true;
                this.layoutName = 'UPDATE';
                if (this.formClassName === store.state.classNameMapping.ReviewPoint) {
                    this.formDialogTitle = this.i18nMappingObj['editingReviewPoints'];
                } else {
                    this.formDialogTitle = this.i18nMappingObj['editReviewType'];
                }
                this.currentOid = val.oid;
            },
            handleCreate(val) {
                this.layoutName = 'CREATE';
                this.oid = '';
                this.currentOid = val?.oid || '';
                this.showFormDialog = true;

                if (this.formClassName === store.state.classNameMapping.ReviewPoint) {
                    this.formDialogTitle = this.i18nMappingObj['createReviewPoints'];
                    this.ruleCode = 'ReviewPointRule';
                } else {
                    this.formDialogTitle = this.i18nMappingObj['createReviewType'];
                    this.ruleCode = 'ReviewCatoryRule';
                }
            }
        },
        components: {
            SystemTree: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SystemDefineTree/index.js')),
            SystemDefineDetail: ErdcKit.asyncComponent(
                ELMP.resource('ppm-component/ppm-components/SystemDefineDetail/index.js')
            ),
            DialogForm: ErdcKit.asyncComponent(ELMP.resource('erdc-ppm-review-config/components/DialogForm/index.js')),
            // 拖拽布局
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        }
    };
});
