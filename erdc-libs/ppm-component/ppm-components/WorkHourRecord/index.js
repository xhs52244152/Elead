define([
    'erdcloud.kit',
    ELMP.func('erdc-ppm-work-hour/app/store/index.js'),
    'text!' + ELMP.resource('ppm-component/ppm-components/WorkHourRecord/index.html'),
    'css!' + ELMP.resource('ppm-component/ppm-components/WorkHourRecord/style.css')
], function (ErdcKit, store, template) {
    return {
        template,
        props: {
            oid: String,
            tableKey: String,
            className: String,
            topMenuActionName: String,
            optMenuActionName: String,
            workHourClassName: String
        },
        components: {
            ContractionPanel: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamContractionPanel/index.js')),
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js'))
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('ppm-component/ppm-components/WorkHourRecord/locale/index.js'),
                i18nMappingObj: {
                    estimatedHour: this.getI18nByKey('estimatedHour'), // 预计工时
                    registeredHour: this.getI18nByKey('registeredHour'), // 已登记工时
                    remainingWork: this.getI18nByKey('remainingWork'), // 剩余工时
                    workDeviation: this.getI18nByKey('workDeviation'), // 工时偏差
                    workHourInfo: this.getI18nByKey('workHourInfo'), // 工时信息
                    memberWorkHourInfo: this.getI18nByKey('memberWorkHourInfo') // 成员工时信息
                },
                panelUnfolds: {
                    baseInfo: true,
                    memberInfo: true
                },
                baseInfoData: {
                    workload: '',
                    registeredWork: '',
                    remainWork: '',
                    estimatedDeviation: ''
                },
                customFormData: {},
                vm: null,
                workHourTypeOid: ''
            };
        },
        computed: {
            slotsNameList() {
                return this.slotsField?.map((ite) => {
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
                        prop: 'operation',
                        type: 'default'
                    }
                ];
            },
            baseInfoFormConfig() {
                let { i18nMappingObj } = this;
                const formConfig = [
                    {
                        field: 'workload',
                        component: 'ErdInput',
                        label: i18nMappingObj.estimatedHour,
                        required: true,
                        col: 12
                    },
                    {
                        field: 'registeredWork',
                        component: 'ErdInput',
                        label: i18nMappingObj.registeredHour,
                        required: true,
                        col: 12
                    },
                    {
                        field: 'remainWork',
                        component: 'ErdInput',
                        label: i18nMappingObj.remainingWork,
                        required: true,
                        col: 12
                    },
                    {
                        field: 'estimatedDeviation',
                        component: 'ErdInput',
                        label: i18nMappingObj.workDeviation,
                        required: true,
                        col: 12
                    }
                ];
                return formConfig;
            },
            viewTableConfig() {
                let { tableKey, className, workHourClassName, oid, topMenuActionName } = this;
                return {
                    tableKey,
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: this,
                        tableBaseConfig: {
                            showOverflow: true
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {
                                className: workHourClassName,
                                conditionDtoList: [
                                    {
                                        attrName: `${store.state.classNameMapping.workHour}#contextRef`,
                                        oper: 'EQ',
                                        logicalOperator: 'AND',
                                        isCondition: true,
                                        value1: oid,
                                        sortOrder: 2
                                    }
                                ]
                            },
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
                                name: topMenuActionName,
                                containerOid: '',
                                isDefaultBtnType: true,
                                className,
                                objectOid: oid
                            },
                            moreOperateList: []
                        },

                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        pagination: {
                            showPagination: false
                        },
                        slotsField: this.slotsField
                    }
                };
            }
        },
        created() {
            this.vm = this;
            this.findAccessTypes();
            this.refreshForm(this.oid);
        },
        watch: {
            oid: {
                handler(val) {
                    // 切换基线要刷新当前表格数据
                    if (val) {
                        this.refresh();
                    }
                }
            }
        },
        methods: {
            refresh() {
                this.refreshForm(this.oid);
                this.$refs.table.refreshTable('default');
            },
            getActionConfig(row) {
                return {
                    name: this.optMenuActionName,
                    objectOid: row.oid,
                    className: this.className
                };
            },
            refreshForm(oid) {
                oid = oid || this.oid;
                return new Promise((resolve, reject) => {
                    require([ELMP.resource('ppm-https/common-http.js')], (http) => {
                        http.commonAttr({
                            data: {
                                oid
                            }
                        })
                            .then((resp) => {
                                let rawData = resp.data?.rawData || {};
                                let workloadInfo = rawData.workloadInfo?.value;
                                this.baseInfoData = {
                                    workload: `${workloadInfo.workload}小时`,
                                    workProgress: '0.00%',
                                    remainWork: `${workloadInfo.remainWork}小时`,
                                    registeredWork: `${workloadInfo.registeredWork}小时`,
                                    estimatedDeviation: `${workloadInfo.estimatedDeviation}小时`
                                };

                                let identifierNo = rawData.identifierNo?.displayName || rawData.identifierNo.value;
                                let name = rawData.name?.displayName || rawData.name.value;

                                this.customFormData = {
                                    caption: `${name}; ${identifierNo}`,
                                    workload: workloadInfo.workload,
                                    remainWork: workloadInfo.remainWork,
                                    contextRef: this.oid,
                                    typeOid: this.workHourTypeOid
                                };

                                resolve(this.customFormData);
                            })
                            .catch(() => {
                                reject();
                            });
                    });
                });
            },
            findAccessTypes() {
                let { workHourClassName } = this;
                return new Promise((resolve) => {
                    require([ELMP.resource('ppm-https/common-http.js')], (http) => {
                        http.findAccessTypes({
                            params: {
                                typeName: store.state.classNameMapping.workHour,
                                containerRef: '',
                                subTypeEnum: 'LEAF_NODE',
                                accessControl: false
                            }
                        }).then((resp) => {
                            resp?.data?.forEach((item) => {
                                if (item.typeName === workHourClassName) {
                                    this.workHourTypeOid = item.typeOid;
                                }
                            });
                            resolve();
                        });
                    });
                });
            }
        }
    };
});
