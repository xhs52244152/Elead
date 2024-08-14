define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-my-document/index.html'),
    ELMP.resource('ppm-utils/index.js'),
    ELMP.resource('ppm-component/ppm-common-actions/index.js'),
    ELMP.resource('ppm-store/index.js'),
    'css!' + ELMP.resource('project-space/style.css'),
    'css!' + ELMP.resource('ppm-style/global.css')
], function (ErdcKit, template, utils, commonActions, store) {
    return {
        template,
        data() {
            return {
                groupName: 'notGroup',
                formData: {},
                visible: true,
                param: {
                    orderBy: 'updateTime',
                    deleteNoPermissionData: true
                },
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/locale/index.js'),
                i18nMappingObj: {
                    group: this.getI18nByKey('group'),
                    notGroup: this.getI18nByKey('notGroup')
                },
                groupOptions: [],
                viewTableHeight: document.documentElement.clientHeight - 228
            };
        },
        created() {},
        computed: {
            documentClassName() {
                return store.state.classNameMapping.document;
            },
            vm() {
                return this;
            },
            slotsField() {
                return [
                    // 自定义插槽的字段和类型（这里定义的类型和字段，需要在html中写对应的插槽内容，插槽命名规则 #column:类型:字段名:content）
                    {
                        prop: 'icon',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'operation',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.cbb.doc.entity.EtDocument#name', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            slotsNameList() {
                return this.slotsField
                    ?.filter((item) => item.prop !== 'icon')
                    ?.map((ite) => {
                        return `column:${ite.type}:${ite.prop}:content`;
                    });
            },
            treeDefaultConfig() {
                if (this.groupName == 'notGroup') {
                    return null;
                } else {
                    return {
                        hasChild: 'treeNode',
                        rowField: 'oid',
                        parentField: 'parentRef'
                    };
                }
            },
            viewTableConfig() {
                const _this = this;
                let config = {
                    tableKey: 'myProjectDocuments',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: {
                            treeNode: _this.groupName === 'notGroup' ? '' : 'erd.cloud.cbb.doc.entity.EtDocument#name',
                            treeConfig: _this.treeDefaultConfig,
                            showOverflow: true
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page', // 表格数据接口
                            // 更多配置参考axios官网
                            data: this.param,
                            transformResponse: [
                                function (data) {
                                    // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
                                    // 对接收的 data 进行任意转换处理
                                    // 对列表项目经理code进行数据处理
                                    let resData = JSON.parse(data);
                                    if (_this.groupName !== 'notGroup') {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, _this.groupName), (childs, key) => {
                                            key = key !== 'undefined' ? key : '--';
                                            resp.push({
                                                'erd.cloud.cbb.doc.entity.EtDocument#name': key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                'isGroupRow': true,
                                                'groupId': _this.groupName + ':' + key,
                                                'children': childs
                                            });
                                        });
                                        resData.data.records = resp;
                                    }
                                    return resData;
                                }
                            ]
                        },
                        // 视图的高级表格配置，使用继承方式，参考高级表格用法
                        toolbarConfig: {
                            fuzzySearch: {
                                placeholder: '请输入关键词搜索',
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            // 基础筛选
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'WORKBENCH_PROJECT_DOC_LIST',
                                containerOid: '',
                                className: _this.documentClassName
                            }
                        },
                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent, // 复选框勾选事件
                            'radio-change': this.radioChangeEvent // 单选按钮改变事件
                        },

                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            }
        },
        methods: {
            handleDetail(row) {
                if (row.isGroupRow) return;
                this.$router.push({
                    path: '/project-my-document/document/detail',
                    query: {
                        pid: this.$route.query.pid,
                        oid: row.oid,
                        title: row.name,
                        folderOid: this.folderListDetailRef?.folderObject?.oid
                    }
                });
            },
            getActionConfig(row) {
                return {
                    name: 'WORKBENCH_PROJECT_DOC_OPERATE',
                    objectOid: row.oid,
                    className: this.documentClassName
                };
            },
            fnCallback() {
                /**
                 * 由于平台改成了下拉加载更多导致分组数据没有重新组合，
                 * 开始的思路是在transformResponse把旧分组和新分组数据分开，
                 * 如果下一页没有新的分组就会返回一个[],就会导致接口把所有数据全部加载出来。
                 * 所以只能在表格加载完之后再重新组装分组数据
                 * */
                if (this.groupName !== 'notGroup') {
                    utils.getGroupData({
                        ref: 'famViewTable',
                        vm: this,
                        businessNameKey: 'erd.cloud.cbb.doc.entity.EtDocument#name'
                    });
                }
                let result = [];
                if (this.$refs.famViewTable) {
                    let tableInstance = this.$refs.famViewTable.getTableInstance('advancedTable');
                    let columns = tableInstance.instance.columns.filter(
                        (item) => item.attrName && item.attrName !== 'operation'
                    );
                    result = columns.map((item) => {
                        return { label: item.label, value: item.attrName };
                    });
                    result.unshift({
                        label: this.i18nMappingObj.notGroup,
                        value: 'notGroup'
                    });
                }
                this.groupOptions = result;
            },
            handleGroup() {
                this.refresh();
            },
            refresh() {
                this.$refs.famViewTable?.refreshTable('default');
            }
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js')),
            FamFilePreview: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamFilePreview/index.js'))
        }
    };
});
