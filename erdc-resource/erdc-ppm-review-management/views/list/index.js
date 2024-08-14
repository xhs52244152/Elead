define([
    'text!' + ELMP.func('erdc-ppm-review-management/views/list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.func('erdc-ppm-review-management/components/mixins/common-mixin.js'),
    ELMP.resource('ppm-https/common-http.js'),
    ELMP.resource('ppm-utils/index.js'),
    'css!' + ELMP.func('erdc-ppm-review-management/views/list/style.css')
], function (template, store, commonActions, commonMixin, commonHttp, utils) {
    const ErdcKit = require('erdcloud.kit');
    const _ = require('underscore');
    return {
        template,
        props: {},
        mixins: [commonMixin],
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.func('erdc-ppm-review-management/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    tip: this.getI18nByKey('tip'),
                    success: this.getI18nByKey('success'),
                    confirmDelete: this.getI18nByKey('confirmDelete'),
                    deleteTip: this.getI18nByKey('deleteTip'),
                    warningInfo: this.getI18nByKey('warningInfo'),
                    group: this.getI18nByKey('group'),
                    notGroup: this.getI18nByKey('notGroup')
                },
                showDialog: false,
                checkData: [],
                tabListData: [],
                vm: null,
                editableAttrs: [],
                formDialogTitle: '',
                groupAttrName: 'notGroup',
                groupOptions: [],
                groupNameField: 'erd.cloud.ppm.review.entity.ReviewObject#identifierNo',
                tableRef: 'managementList'
            };
        },
        created() {
            this.vm = this;
            this.getTabList();
        },
        activated() {
            this.refresh();
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ManagementDialog: ErdcKit.asyncComponent(
                ELMP.func('erdc-ppm-review-management/components/managementDialog/index.js')
            ),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        computed: {
            slotsField() {
                return [
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'operation',
                        type: 'default'
                    },
                    {
                        prop: this.groupNameField,
                        type: 'default'
                    }
                ];
            },
            oid() {
                return this.$route.query.pid;
            },
            productLineRefOid() {
                console.log(store.state.projectInfo.productLineRef);
                return store.state.projectInfo.productLineRef;
            },
            routeName() {
                return this.$route.name || '';
            },
            className() {
                return store.state.classNameMapping.reviewManagement;
            },
            flowOverFlag() {
                const key =
                    this.$route.query?.processDefinitionKey ||
                    this.$route.query?.taskDefKey ||
                    (this.$route.name === 'workflowActivator' ? 'Activator' : 'Draft');
                return key === 'Activator';
            },
            tableBaseConfig() {
                return this.groupAttrName === 'notGroup'
                    ? {
                          showOverflow: true
                      }
                    : {
                          'treeNode': this.groupNameField,
                          'treeConfig': {
                              hasChild: 'treeNode',
                              rowField: 'oid',
                              parentField: 'parentRef'
                          },
                          'row-id': 'oid',
                          'showOverflow': true
                      };
            },
            viewTableConfig() {
                let _this = this;
                let config = {
                    tableKey: 'ReviewObjectPageView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: _this.tableBaseConfig,
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {
                                conditionDtoList: [
                                    {
                                        attrName: 'erd.cloud.ppm.review.entity.ReviewObject#projectRef',
                                        oper: 'EQ',
                                        logicalOperator: 'AND',
                                        sortOrder: 1,
                                        isCondition: true,
                                        value1: _this.$route.query.pid
                                    }
                                ]
                            },
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    if (_this.groupAttrName !== 'notGroup') {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, _this.groupAttrName), (childs, key) => {
                                            resp.push({
                                                [this.groupNameField]: key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                isGroupRow: true,
                                                groupId: _this.groupAttrName + ':' + key,
                                                children: childs
                                            });
                                        });
                                        resData.data.records = resp;
                                    } else {
                                        resData.data.records = _this.transformData(resData.data.records);
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            // 工具栏
                            showConfigCol: true, // 是否显示配置列，默认显示
                            showMoreSearch: true, // 是否显示高级搜索，默认显示
                            showRefresh: true,
                            fuzzySearch: {
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'PPM_PROJECT_REVIEW_MGT_LIST_MENU',
                                containerOid: _this.oid,
                                objectOid: '',
                                className: _this.className
                            }
                        },
                        addSeq: true,
                        addOperationCol: true, // 是否显示操作列
                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: _this.slotsField
                    }
                };
                return config;
            },
            enableScrollLoad() {
                return true;
            }
        },
        methods: {
            actionClick() {},
            getActionConfig(row) {
                return {
                    name: 'PPM_PROJECT_REVIEW_MGT_OPERATE_MENU',
                    containerOid: this.oid,
                    objectOid: row.oid,
                    className: store.state.classNameMapping.reviewManagement
                };
            },
            onCommand() {},
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
            transformData(resData) {
                resData.map((data) => {
                    data?.attrRawList.some((el) => {
                        if (el.attrName.includes('configTab')) {
                            let tabs = el.value;
                            let submitTabsData = [];
                            this.tabListData.forEach((item) => {
                                if (tabs.includes(item.value)) {
                                    submitTabsData.push(item.displayName);
                                }
                            });
                            el.value = submitTabsData.join(',');
                            el.displayName = submitTabsData.join(',');
                        }
                    });
                });

                return resData;
            },
            getProcessId(row) {
                return new Promise((resolve) => {
                    commonHttp
                        .commonAttr({
                            data: {
                                oid: row.oid
                            }
                        })
                        .then((res) => {
                            let { oid: oidKey } =
                                _.find(res.data.rawData, {
                                    attrName: 'processRef'
                                }) || {};
                            resolve(oidKey);
                        });
                });
            },
            async handleDetail(row) {
                if (row.isGroupRow) return;
                utils.openProcessPage(this, row);
                // let processInstanceOId = await this.getProcessId(row);
                // this.$famHttp({
                //     url: '/bpm/process/history/' + row.oid,
                //     method: 'GET'
                // }).then((res) => {
                //     let [processInfo] = res?.data?.processInstances || [{}];
                //     const { activityId, processInfoTasks } = processInfo;
                //     const taskOId = processInfoTasks?.find((item) => item.taskKey === activityId)?.oid || '';
                //     this.$router.push({
                //         path: `/container/bpm-resource/workflowActivator/${processInstanceOId}`,
                //         query: {
                //             taskDefKey: processInfo.activityId,
                //             taskOId,
                //             readonly: false
                //         }
                //     });
                // });
            },
            refresh() {
                this.$refs?.managementList?.refreshTable?.('default');
            },
            renderTableCallback() {
                if (this.groupAttrName !== 'notGroup') {
                    utils.getGroupData({
                        ref: this.tableRef,
                        vm: this,
                        businessNameKey: this.groupNameField
                    });
                }
                let result = [];
                if (this.$refs[this.tableRef]) {
                    let tableInstance = this.$refs[this.tableRef].getTableInstance('advancedTable');
                    let columns = tableInstance.instance.columns.filter(
                        (item) => item.attrName && item.attrName !== 'operation'
                    );
                    result = columns.map((item) => {
                        return { label: item.label, attrName: item.attrName };
                    });
                    result.unshift({
                        label: this.i18nMappingObj.notGroup,
                        attrName: 'notGroup'
                    });
                }
                this.groupOptions = result;
            },
            downloadReport(url, fileName) {
                this.$famHttp({
                    url,
                    method: 'GET',
                    responseType: 'blob'
                }).then((resp) => {
                    const { data, headers } = resp || {};
                    let contentDisposition = headers['content-disposition'] || '';
                    !fileName && (fileName = contentDisposition.split('filename=')[1] || '');
                    const blob = new Blob([data], { type: headers['content-type'] });
                    let dom = document.createElement('a');
                    let url = window.URL.createObjectURL(blob);
                    dom.href = url;
                    dom.download = decodeURI(fileName);
                    dom.style.display = 'none';
                    document.body.appendChild(dom);
                    dom.click();
                    dom.parentNode.removeChild(dom);
                    window.URL.revokeObjectURL(url);
                });
            },
            afterSubmit() {
                this.refresh();
            },

            getSlotsName(slotsField) {
                return slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    ?.map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            }
        }
    };
});
