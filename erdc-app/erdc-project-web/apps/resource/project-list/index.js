define([
    'erdcloud.kit',
    'text!' + ELMP.resource('project-list/index.html'),
    ELMP.resource('ppm-store/index.js'),
    ELMP.resource('ppm-utils/index.js'),
    'erdcloud.store',
    'css!' + ELMP.resource('project-space/style.css'),
    'css!' + ELMP.resource('ppm-style/global.css'),
    'css!' + ELMP.resource('project-list/style.css')
], function (ErdcKit, template, store, utils, ErdcStore) {
    return {
        template,
        props: {
            showOperate: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                groupName: 'notGroup',
                layout: 'list',
                options: [
                    {
                        value: 'list',
                        label: '列表'
                    }
                    // {
                    //     value: 'board',
                    //     label: '看板'
                    // }
                ],
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('project-space/locale/index.js'),
                i18nMappingObj: {
                    projectStatusTitle: this.getI18nByKey('projectStatusTitle'),
                    permanentlyDeleted: this.getI18nByKey('permanentlyDeleted'),
                    tip: this.getI18nByKey('tip'),
                    success: this.getI18nByKey('success'),
                    confirm: this.getI18nByKey('confirm'),
                    cancel: this.getI18nByKey('cancel'),
                    group: this.getI18nByKey('group'),
                    notGroup: this.getI18nByKey('notGroup'),
                    operationSuccess: this.getI18nByKey('operationSuccess')
                },
                formData: {},
                visible: true,
                stateVisible: false,
                status: null,
                param: {
                    orderBy: 'identifierNo',
                    deleteNoPermissionData: true
                },
                currentRow: {},
                groupOptions: [],
                selectList: [],
                viewTableHeight: document.documentElement.clientHeight - 228,
                exportVisible: false,
                requestConfig: {},
                businessName: '',
                showSetStateDialog: false,
                actionKey: 'PPM_WORKBENCH_PROJECT_LIST_MENU',
                tableKey: 'workbenchProjectView'
            };
        },
        beforeMount() {
            if (this.$route?.meta?.resourceCode === 'projectProject') {
                this.actionKey = 'PPM_PROJECT_LIST_MENU';
                this.tableKey = 'projectView';
            }
        },
        created() {},
        computed: {
            vm() {
                return this;
            },
            showSecondaryMenu() {
                return this.$route.path.includes('container');
            },
            className() {
                return store.state.classNameMapping.project;
            },
            containerRef() {
                let projectInfo = store.state.projectInfo;
                return `OR:${projectInfo?.containerRef?.key}:${projectInfo?.containerRef?.id}`;
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
                        prop: 'erd.cloud.ppm.project.entity.Project#completionRate', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.project.entity.Project#projectProgressDisplay',
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.project.entity.Project#projectManager', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    },
                    {
                        prop: 'erd.cloud.ppm.project.entity.Project#name', // 注意：视图表格的attrName是类型+属性名的，因为不同类型可能存在同样的属性，不能截取
                        type: 'default' // 显示字段内容插槽
                    }
                ];
            },
            outerRootResource() {
                return {
                    children: [
                        {
                            oid: 'temp-list',
                            displayName: '项目列表',
                            key: 'temp-list',
                            identifierNo: 'projectProject',
                            href: '/project-list',
                            isShow: true
                        }
                    ]
                };
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
                    tableKey: _this.tableKey,

                    viewMenu: {
                        // 表格视图菜单导航栏组件配置
                        dataKey: 'data.tableViewVos'
                    },
                    saveAs: false, // 是否显示另存为
                    tableConfig: {
                        vm: _this,
                        tableBaseConfig: {
                            treeNode: _this.groupName === 'notGroup' ? '' : 'erd.cloud.ppm.project.entity.Project#name',
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
                                                if (
                                                    attr.attrName ===
                                                    'erd.cloud.ppm.project.entity.Project#projectManager'
                                                ) {
                                                    item['code'] = resData.data.relationObjMap?.[attr.oid]?.code || '';
                                                }
                                                if (
                                                    attr.attrName ===
                                                    'erd.cloud.ppm.project.entity.Project#completionRate'
                                                ) {
                                                    item['erd.cloud.ppm.project.entity.Project#completionRate'] =
                                                        attr.value || 0;
                                                }
                                            });
                                        });
                                        let resp = [];
                                        _.each(_.groupBy(result, _this.groupName), (childs, key) => {
                                            key = key !== 'undefined' ? key : '--';
                                            resp.push({
                                                'erd.cloud.ppm.project.entity.Project#name': key + `(${childs.length})`,
                                                //  用来判断是否是分组行
                                                'isGroupRow': true,
                                                'groupId': _this.groupName + ':' + key,
                                                'children': childs
                                            });
                                        });
                                        resData.data.records = resp;
                                    } else {
                                        let result = resData.data.records;
                                        _.each(result, (item) => {
                                            _.each(item.attrRawList, (attr) => {
                                                item[attr.attrName] = attr.displayName || '';
                                                if (
                                                    attr.attrName ===
                                                    'erd.cloud.ppm.project.entity.Project#projectManager'
                                                ) {
                                                    item['code'] = resData.data.relationObjMap?.[attr.oid]?.code || '';
                                                }
                                                if (
                                                    attr.attrName ===
                                                    'erd.cloud.ppm.project.entity.Project#completionRate'
                                                ) {
                                                    attr.displayName = attr.value || 0;
                                                }
                                            });
                                        });
                                        resData.data.records = result;
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
                                name: _this.actionKey,
                                containerOid: '',
                                className: store.state.classNameMapping.project
                            }
                        },
                        tableBaseEvent: {
                            'checkbox-all': this.selectAllEvent, // 复选框全选
                            'checkbox-change': this.selectChangeEvent, // 复选框勾选事件
                            'radio-change': this.radioChangeEvent // 单选按钮改变事件
                        },
                        columnWidths: {
                            // 设置列宽，配置>接口返回>默认
                            // operation: window.LS.get('lang_current') === 'en_us' ? 100 : 70
                        },

                        fieldLinkConfig: {
                            fieldLink: false
                        },
                        slotsField: this.slotsField
                    }
                };
                return config;
            },
            enableScrollLoad() {
                return true;
            }
        },
        methods: {
            getState(row) {
                let { value: state } =
                    row?.attrRawList?.find(
                        (item) => item.attrName === 'erd.cloud.ppm.project.entity.Project#lifecycleStatus.status'
                    ) || {};
                return state;
            },
            handleDetail(row) {
                if (row.isGroupRow) return;

                if (this.getState(row) === 'DRAFT') {
                    this.handleEdit(row);
                } else {
                    // utils.openDetail(row);
                    // 工作台跳转项目空间（跨应用）
                    if (ErdcStore.state.route.resources.identifierNo === 'erdc-portal-web') {
                        let projectOid =
                            row.attrRawList.find((item) => item.attrName === 'erd.cloud.ppm.project.entity.Project#oid')
                                ?.value || '';
                        let query = {
                            pid: projectOid
                        };
                        const appName = 'erdc-project-web';
                        const targetPath = '/space/project-space/projectInfo';
                        // path组装query参数
                        let url = `/erdc-app/${appName}/index.html#${ErdcKit.joinUrl(targetPath, query)}`;
                        window.open(url, appName);
                    } else {
                        // 项目列表跳转空间
                        this.$router.push({
                            path: '/space/project-space/projectInfo',
                            query: {
                                pid: row.oid,
                                title: row['erd.cloud.ppm.project.entity.Project#name']
                            }
                        });
                    }
                }
            },
            // 项目进度亮灯提示、颜色  isColor代表返回颜色
            projectScheduleTip(val, isColor) {
                let data = val.find(
                    (item) => item.attrName === 'erd.cloud.ppm.project.entity.Project#projectProgressDisplay'
                );
                if (isColor) {
                    // data.value存在代表开启项目亮灯配置开关
                    return data?.value ? data?.displayName : 'none';
                }
                return data?.tooltip || '';
            },
            getCompletionRate(row, percentSign = '') {
                let percentKey = 'erd.cloud.ppm.project.entity.Project#completionRate';
                let percent = row[percentKey] ? (+row[percentKey]).toFixed(1) : 0;
                return percentSign ? percent + percentSign : percent / 100;
            },
            getActionConfig(row) {
                return {
                    name: 'PPM_OPERATE_MENU',
                    objectOid: row.oid,
                    className: store.state.classNameMapping.project
                };
            },
            extendDisabledValidate(item) {
                // 项目列表页面  行操作中基线对比禁用
                if (item.name === 'PPM_BASELINE_PROJECT_COMPARE' && this.tableKey === 'projectView') {
                    return item.name === 'PPM_BASELINE_PROJECT_COMPARE' && this.tableKey === 'projectView';
                }
                return !item.enabled;
            },
            selectAllEvent(data) {
                this.groupName === 'notGroup'
                    ? (this.selectList = data.records)
                    : (this.selectList = data.records.filter((item) => !item.isGroupRow));
            },
            // 复选框改变
            selectChangeEvent(data) {
                this.groupName === 'notGroup'
                    ? (this.selectList = data.records)
                    : (this.selectList = data.records.filter((item) => !item.isGroupRow));
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
                        businessNameKey: 'erd.cloud.ppm.project.entity.Project#name'
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
            fnEditor() {
                this.$refs['famViewTable'].$refs['FamAdvancedTable'];
            },
            handleGroup() {
                this.refresh();
            },
            refresh() {
                this.$refs.famViewTable?.refreshTable('default');
            },
            handleEdit(row) {
                this.$router.push({
                    path: '/container/project-space/edit',
                    query: {
                        pid: row.oid,
                        status: row['erd.cloud.ppm.project.entity.Project#lifecycleStatus.status'],
                        title: `编辑 ${row['erd.cloud.ppm.project.entity.Project#name']} 项目`
                    }
                });
            },
            handleExport() {
                this.exportVisible = true;
                const classNameAttr = this.className.split('.');
                const classNameKey = ErdcKit.pascalize(classNameAttr[classNameAttr.length - 1]);
                this.businessName = classNameKey + 'Export';
                this.requestConfig = this.$refs?.famViewTable?.getTableInstance('advancedTable', 'requestConfig');
            },
            handlerDialogSuccess() {
                this.exportVisible = false;
            }
        },
        activated() {
            this.refresh();
        },
        components: {
            FamViewTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamViewTable/index.js')),
            ErdTable: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamErdTable/index.js')),
            FamActionPulldowm: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamActionPulldowm/index.js')),
            SvgCircle: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SvgCircle/index.js')),
            SetState: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SetState/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            ExportDialog: ErdcKit.asyncComponent(ELMP.resource('common-page/components/ExportDialog/index.js')),
            ImportDialog: ErdcKit.asyncComponent(ELMP.resource('common-page/components/ImportDialog/index.js')),
            FamSecondaryMenu: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamSecondaryMenu/index.js')),

            SimpleSelect: ErdcKit.asyncComponent(ELMP.resource('ppm-component/ppm-components/SimpleSelect/index.js'))
        }
    };
});
