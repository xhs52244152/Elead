define([
    'erdcloud.kit',
    'text!' + ELMP.func('erdc-ppm-review-management/components/qualityRecord/index.html'),
    ELMP.func('erdc-ppm-review-management/locale/index.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/components/qualityRecord/index.css')
], function (ErdcKit, template, { i18nMappingObj }) {
    const subReviewComponent = {
        template,
        props: {
            formInfo: {
                type: String,
                default: ''
            }
        },
        data() {
            return {
                formDialogTitle: i18nMappingObj.viewQualityObjectives, // 查看质量目标
                formData: {},
                className: 'erd.cloud.ppm.review.entity.WfQualityObjective',
                oid: '',
                showDialog: false,
                viewReview: true
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            LibraryDialog: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/reviewElements/component/libraryDialog/index.js')
            )
        },
        computed: {
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
                    }
                ];
            },
            defaultTableHeight() {
                return document.body.clientHeight - 243;
            },
            viewTableConfig() {
                const _this = this;
                let oid = _this.formInfo ? _this.formInfo : 'OR:erd.cloud.ppm.review.entity.ReviewObject:-1';
                let config = {
                    tableKey: 'WfQualityObjectiveView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos',
                        hiddenNavBar: true
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        tableBaseConfig: {
                            'maxLine': 5,
                            'treeNode': 'erd.cloud.ppm.review.entity.WfQualityObjective#name',
                            'treeConfig': {
                                hasChildField: 'hasChild',
                                rowField: 'oid',
                                parentField: 'parentRef'
                            },
                            'row-id': 'oid',
                            'showOverflow': true
                        },
                        tableRequestConfig: {
                            url: `/ppm/review/wfQualityObjective/listTree?reviewObjectOid=${oid}`, // 表格数据接口
                            method: 'GET',
                            data: {},
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        resData = data && JSON.parse(data);
                                        let records = _this.transformData(resData.data || []);
                                        //  s  console.log('###', records);
                                        resData.data = {
                                            childrenList: resData.data || [],
                                            records
                                        };
                                    } catch (err) {
                                        console.log('err===>', err);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true, // 是否显示配置列，默认显示
                            showMoreSearch: false, // 是否显示高级搜索，默认显示
                            showRefresh: true,
                            fuzzySearch: {
                                placeholder: '',
                                show: true // 是否显示普通模糊搜索，默认显示
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
                        addOperationCol: false,
                        fieldLinkConfig: {
                            fieldLink: true,
                            // 是否添加列超链接
                            fieldLinkName: 'erd.cloud.ppm.review.entity.WfQualityObjective#name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.onDetail(row);
                            }
                        },
                        slotsField: this.slotsField
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
                return slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    ?.map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            onDetail(row) {
                this.formData = JSON.parse(JSON.stringify(row));
                this.oid = row.oid;
                this.showDialog = true;
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
            }
        }
    };
    return subReviewComponent;
});
