define([
    'text!' + ELMP.func('erdc-ppm-work-hour/views/work-hour-list/index.html'),
    ELMP.func('erdc-ppm-work-hour/app/store/index.js'),
    'css!' + ELMP.resource('ppm-style/global.css'),
    'css!' + ELMP.func('erdc-ppm-work-hour/views/style.css')
], function (template, store) {
    const ErdcKit = require('erdcloud.kit');
    return {
        template,
        data() {
            return {
                i18nLocalePath: ELMP.func('erdc-ppm-work-hour/locale/index.js'),
                i18nMappingObj: {
                    pleaseSelectData: this.getI18nByKey('pleaseSelectData'),
                    deleteTipsInfo: this.getI18nByKey('deleteTipsInfo'),
                    deleteConfirm: this.getI18nByKey('deleteConfirm'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    deleteSuccess: this.getI18nByKey('deleteSuccess'),
                    notGroup: this.getI18nByKey('notGroup'),
                    group: this.getI18nByKey('group'),
                    kanban: this.getI18nByKey('kanban'),
                    list: this.getI18nByKey('list'),
                    tree: this.getI18nByKey('tree'),
                    layout: this.getI18nByKey('layout')
                },
                checkData: [],
                group: 'notGroup',
                groupOptions: []
            };
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        },
        computed: {
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
                        prop: 'erd.cloud.ppm.timesheet.entity.Timesheet#name',
                        type: 'default'
                    },
                    {
                        prop: 'erd.cloud.ppm.timesheet.entity.Timesheet#planInfo.completionRate',
                        type: 'default'
                    }
                ];
            },
            className() {
                return store.state.classNameMapping.workHour;
            },
            sceneName() {
                return this.$route.meta.sceneName || '';
            },
            routeName() {
                return this.$route.name || '';
            },
            viewTableConfig() {
                const _this = this;
                return {
                    tableKey: 'TimesheetView',
                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        addOperationCol: false,
                        tableBaseConfig: {
                            showOverflow: true,
                            treeNode: 'erd.cloud.ppm.timesheet.entity.Timesheet#dailyTitle',
                            treeConfig: {
                                hasChild: 'treeNode',
                                rowField: 'oid',
                                parentField: 'parentRef'
                            }
                        },
                        tableRequestConfig: {
                            url: '/ppm/view/table/page',
                            data: {},
                            // 更多配置参考axios官网
                            transformResponse: [
                                function (data) {
                                    let resData = JSON.parse(data);
                                    if (_this.group !== 'notGroup') {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, _this.group), (childs, key) => {
                                            resp.push({
                                                'erd.cloud.ppm.timesheet.entity.Timesheet#dailyTitle':
                                                    key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                'isGroupRow': true,
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
                                show: false // 是否显示普通模糊搜索，默认显示
                            },
                            basicFilter: {
                                show: true
                            },
                            actionConfig: {
                                name: 'PPM_TIMESHEET_LIST_MENU',
                                className: _this.className,
                                isDefaultBtnType: true
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
            },
            enableScrollLoad() {
                return true;
            }
        },
        methods: {
            renderTableCallback() {
                let result = [];
                // 更新分组选项
                if (this.$refs.table) {
                    let tableInstance = this.$refs.table.getTableInstance('advancedTable');
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
            getActionConfig(row) {
                return {
                    name: 'PPM_REQUIRE_OPERATE_MENU',
                    objectOid: row.oid,
                    className: this.className
                };
            },
            refresh() {
                this.$refs.table.refreshTable('default');
            },
            selectAllEvent(data) {
                this.checkData = data;
            },
            selectChangeEvent(data) {
                this.checkData = data;
            },
            openDetail(row) {
                this.$router.push({
                    name: `${this.sceneName}Detail`,
                    params: {
                        oid: row.oid
                    }
                });
            }
        }
    };
});
