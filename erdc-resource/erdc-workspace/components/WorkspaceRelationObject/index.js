define([
    'text!' + ELMP.func('erdc-workspace/components/WorkspaceRelationObject/index.html'),
    ELMP.func('erdc-workspace/config/viewConfig.js'),
    ELMP.func('erdc-workspace/config/operateAction.js'),
    ELMP.resource('erdc-pdm-components/CoDesignConfig/index.js'),
    'css!' + ELMP.func('erdc-workspace/components/WorkspaceRelationObject/index.css')
], function (template, viewConfig, operateAction, coDesignConfig) {
    const ErdcKit = require('erdc-kit');
    // 判断codesign环境
    const { isDesktop, getCodesignWorkSpaceList, fileStatus, iterationInfoState } = coDesignConfig;

    return {
        name: 'WorkspaceRelationObject',
        template,
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldown: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldown/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-workspace/locale/index.js'),
                tableLoading: false, // operateAction.js 调用修改
                self: null,
                coDesignList: []
            };
        },
        props: {
            vm: Object
        },
        watch: {
            // /fam/attr  接口完成后获取加载表单参数并渲染table 否则会报错
            checkpointRef: {
                handler(val) {
                    if (val) {
                        this.refreshData();
                    }
                },
                immediate: true
            }
        },
        mounted() {
            this.self = this;
            // codesign环境下，调用此方法获取相关对象数据
            getCodesignWorkSpaceList.call(this);
        },
        computed: {
            oid() {
                return this.vm?.containerOid || '';
            },
            containerRef() {
                return this.$store.state.space?.context?.oid || '';
            },
            checkpointRef() {
                return this.vm?.sourceData?.checkpointRef ? this.vm?.sourceData?.checkpointRef?.oid : '';
            },
            viewTableConfig() {
                return {
                    // 视图表格定义的内部名称
                    tableKey: 'WorkspaceRelationObjectView',
                    tableConfig: {
                        vm: this,
                        actionCustomParams: {
                            inTable: true,
                            isBatch: true
                        },
                        tableRequestConfig: {
                            // 更多配置参考axios官网
                            data: {
                                relationshipRef: this.checkpointRef,
                                addCheckoutCondition: false,
                                addTypeCondition: false,
                                lastestVersion: false
                            },
                            transformResponse: [
                                (data) => {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    let resData = data;
                                    try {
                                        const parseData = data && JSON.parse(data);
                                        const records = parseData?.data?.records || [];
                                        parseData.data.records = [...this.coDesignList, ...records];
                                        resData = parseData;
                                    } catch (error) {
                                        console.error(error);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                isDefaultBtnType: true,
                                name: isDesktop
                                    ? coDesignConfig.codesignWorkspaceRelationObjViewTableMap.toolBarActionName
                                    : viewConfig.workspaceRelationObjViewTableMap.toolBarActionName, //操作按钮的内部名称
                                containerOid: this.$store.state.space?.context?.oid || '', //上下文估计要带到路径上
                                className: viewConfig.workspaceRelationObjViewTableMap.className,
                                // 跳过平台校验
                                skipValidator: true
                            }
                            // beforeValidatorQuery: {
                            //     data: {
                            //         multiSelect:
                            //             this.$refs?.famViewTable
                            //                 ?.fnGetCurrentSelection()
                            //                 ?.map((item) => item.relationOid) || []
                            //     }
                            // }
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                        },
                        pagination: {
                            showPagination: false
                        },
                        addSeq: true,
                        addCheckbox: true,
                        addIcon: true,
                        addOperationCol: isDesktop, // 是否显示操作列
                        slotsField: isDesktop
                            ? [
                                  {
                                      prop: 'icon',
                                      type: 'default'
                                  },
                                  {
                                      prop: iterationInfoState,
                                      type: 'default'
                                  },
                                  {
                                      prop: 'operation',
                                      type: 'default'
                                  }
                              ]
                            : [
                                  {
                                      prop: 'icon',
                                      type: 'default'
                                  }
                              ],

                        fieldLinkConfig: {
                            fieldLink: true,
                            fieldLinkName: 'name', // 超链接字段名(如果slotsField里面有当前字段，会先取自定义的slots)
                            linkClick: (row) => {
                                // 超链接事件
                                this.handleNoClick(row);
                            }
                        }
                    }
                };
            },
            // codesign环境
            iterationInfoState() {
                return iterationInfoState;
            },
            // codesign环境
            slotName() {
                return {
                    iterationInfoState: `column:default:${iterationInfoState}:content`
                };
            }
        },
        methods: {
            // codesign环境
            getFileStatus(status) {
                return fileStatus(status);
            },
            getActionConfig() {
                return {
                    name: coDesignConfig.codesignWorkspaceRelationObjOper.rowActionName,
                    // objectOid: row.oid,
                    className: viewConfig.workspaceViewTableMap.className
                };
            },
            handlerData(data, callback) {
                const tableData = ErdcKit.deepClone(data) || [];
                _.each(tableData, (item) => {
                    const idKey = item?.idKey || item?.oid?.split(':')[0];
                    const attrRawList = item?.attrRawList || [];
                    const [row] = attrRawList.splice(
                        _.findIndex(attrRawList, (item) => new RegExp(`${idKey}#icon$`).test(item?.attrName)),
                        1
                    );
                    attrRawList.splice(attrRawList.length, 0, row);
                });
                callback(tableData);
            },
            // 在页签列表渲染前调用更新版本接口
            refreshData() {
                operateAction.handleRelationObjRefrsh.call(this, [], null, () => {});
            },
            rowDataClassName(row) {
                return row.relationOid.split(':')[1] || '';
            },
            handleNoClick(row) {
                if (!row.attrRawList) return;
                let status = row.attrRawList.find(
                    (item) => item.attrName === 'erd.cloud.core.vc.ItemRevision#lifecycleStatus.status'
                );
                let className = this.rowDataClassName(row);
                const { prefixRoute, resourceKey } = this.$route?.meta || {};

                let editPath = '';
                let detailPath = '';
                switch (className) {
                    case 'erd.cloud.pdm.part.entity.EtPart':
                        editPath = `${prefixRoute.split(resourceKey)[0]}erdc-part/part/edit`;
                        detailPath = `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`;
                        break;
                    case 'erd.cloud.pdm.epm.entity.EpmDocument':
                        editPath = `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/edit`;
                        detailPath = `${prefixRoute.split(resourceKey)[0]}erdc-epm-document/epmDocument/detail`;
                        break;
                    default:
                        break;
                }

                if (status && status.value === 'DRAFT') {
                    this.$router.push({
                        path: editPath,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            workspaceOid: this.$route.query.oid,
                            oid: row[className + '#oid'],
                            origin: 'list'
                        }
                    });
                } else {
                    this.$router.push({
                        path: detailPath,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: row[className + '#oid']
                        }
                    });
                }
            }
        }
    };
});
