define([
    'text!' + ELMP.resource('erdc-ppm-review-library/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('erdc-ppm-review-library/views/list/style.css')
], function (template, store) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        props: {
            showOperate: {
                type: Boolean,
                default: true
            },
            tableKey: {
                type: String,
                default: 'ReviewElementView'
            }
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('erdc-ppm-review-library/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    featureLibrary: this.getI18nByKey('featureLibrary'),
                    tip: this.getI18nByKey('tip'),
                    createdSuccessfully: this.getI18nByKey('createdSuccessfully'),
                    editSuccessfully: this.getI18nByKey('editSuccessfully'),
                    viewReviewElements: this.getI18nByKey('viewReviewElements'),
                    editReviewElements: this.getI18nByKey('editReviewElements'),
                    createReviewElements: this.getI18nByKey('createReviewElements'),
                    success: this.getI18nByKey('success'),
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    saveDraft: this.getI18nByKey('saveDraft'),
                    draftStatusNotEdited: this.getI18nByKey('draftStatusNotEdited')
                },
                showDialog: false,
                checkData: [],
                oid: '',
                classFamName: 'fam', // 此处批量编辑 fam/type/component/enumDataList接口需要调用fam的，接口不需要转换成ppm
                editableAttrs: ['status', 'identifierNo'],
                formDialogTitle: '创建评审要素',
                layoutName: 'CREATE'
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            LibraryDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-ppm-review-library/component/libraryDialog/index.js')
            )
        },
        computed: {
            vm() {
                return this;
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
                    tableKey: this.tableKey,
                    viewTableTitle: this.i18nMappingObj['featureLibrary'],
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: { showOverflow: true },
                        tableRequestConfig: {
                            url: '/element/view/table/page',
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
                                name: 'CBB_REVIEW_ELEMENT_LIST_MENU',
                                containerOid: '',
                                className: _this.className
                            }
                        },

                        tableBaseEvent: {
                            'checkbox-all': _this.selectAllEvent, // 复选框全选
                            'checkbox-change': _this.selectChangeEvent // 复选框勾选事件
                        },
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            }
        },
        methods: {
            getState(row) {
                let { value: state } =
                    row?.attrRawList?.find(
                        (item) => item.attrName === 'erd.cloud.cbb.review.entity.ReviewElement#status'
                    ) || {};
                return state;
            },
            getActionConfig(row) {
                return {
                    name: 'CBB_REVIEW_ELEMENT_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            handleDetail(row) {
                this.showDialog = true;
                this.oid = row.oid;
                this.formDialogTitle = this.i18nMappingObj['viewReviewElements'];
                this.layoutName = 'DETAIL';
            },
            edit(id) {
                this.showDialog = true;
                this.oid = id;
                this.formDialogTitle = this.i18nMappingObj['editReviewElements'];
                this.layoutName = 'UPDATE';
            },
            refresh() {
                this.$refs.libraryList.refreshTable('default');
            },
            beforeSubmit(data, next, draft) {
                data?.attrRawList.some((el) => {
                    if (el.attrName === 'status') {
                        el.value = draft ? el.value : 'RELEASE';
                    }
                });

                data.attrRawList = _.filter(data.attrRawList, (item) => item.value);
                data.action = 'CREATE';
                let tip = this.i18nMappingObj['createdSuccessfully'];
                if (data.oid) {
                    data.action = 'UPDATE';
                    tip = this.i18nMappingObj['editSuccessfully'];
                } else {
                    let statusObj = {
                        attrName: 'status',
                        value: draft ? 'DRAFT' : 'RELEASE'
                    };
                    data.attrRawList.push(statusObj);
                }
                next(data, draft, tip);
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
            selectAllEvent(data) {
                this.checkData = data.records;
            },
            selectChangeEvent(data) {
                this.checkData = data.records;
            }
        }
    };
});
