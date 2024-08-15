define([
    'text!' + ELMP.resource('erdc-type-components/DataTypeTree/index.html'),
    'erdc-kit',
    'EventBus',
    'css!' + ELMP.resource('erdc-type-components/DataTypeTree/style.css')
], function (template, utils, EventBus) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-type-components/DataTypeTree/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    searchKeyword: this.getI18nByKey('搜索关键字'),
                    componentManagement: this.getI18nByKey('组件管理'),
                    moreActions: this.getI18nByKey('更多操作'),
                    completeImport: this.getI18nByKey('全量导入'),
                    completeExport: this.getI18nByKey('全量导出'),
                    dataType: this.getI18nByKey('数据类型'),
                    dataTypeManagement: this.getI18nByKey('数据类型管理')
                },
                searchValue: '',
                buttons: [
                    {
                        displayName: '组织管理',
                        type: 'primary',
                        handleClick: this.onOrgmanagement
                    },
                    {
                        displayName: '全量导出',
                        type: 'primary',
                        handleClick: this.onExportAll
                    }
                ],
                treeList: [],
                treeTypeData: [],
                treeComData: [],
                basicsListData: [],
                ComponentManagementVisible: false,
                defaultProps: {
                    label: 'displayName',
                    children: 'children'
                },
                defaultExpandedKeys: [],
                defaultCheckedKeys: [],
                selectKey: '',
                NewEditComponentVisible: false,
                componentType: 'create',
                oid: '',
                componentTitle: '创建组件'
            };
        },
        watch: {
            searchValue(n) {
                this.$refs.tree.filter(n);
            }
        },
        computed: {
            innerVisible: {
                get() {
                    return this.visible;
                },
                set(val) {
                    this.$emit('update:visible', val);
                    // this.visible = val
                }
            },
            treeData: {
                get() {
                    return [
                        {
                            displayName: this.i18nMappingObj.dataTypeManagement,
                            key: 'dataType',
                            dataType: 'dataTypeDefinition',
                            children: this.treeTypeData
                        },
                        {
                            displayName: this.i18nMappingObj.componentManagement,
                            key: 'component',
                            dataType: 'component',
                            children: this.treeComData
                        }
                    ];
                },
                set() {}
            }
        },
        mounted() {
            this.getTreeList();
        },
        methods: {
            // search(){
            //     this.treeList = this.basicsListData.filter(item=>(item.displayName.includes(this.searchValue)))
            // },
            onOrgManagement() {
                this.ComponentManagementVisible = true;
            },
            onCommand(type) {
                if (type === 'import') {
                    this.onImportAll();
                }
                if (type === 'export') {
                    this.onExportAll();
                }
            },
            onExportAll() {},
            onImportAll() {},
            // onCheck(...args){
            //     this.treeList.forEach(item=>{
            //         item.active = 0
            //     })
            //     this.basicsListData.forEach(item=>{
            //         item.active = 0
            //         if(item.oid == args[0].oid) {
            //             item.active = 1
            //         }
            //     })
            //
            //     args[0].active = 1
            //     this.$emit('node-type-click', ...args);
            // },
            onCheck(...args) {
                if (args[1].level != 1) {
                    this.$emit('node-type-click', ...args);
                    this.selectKey = args[1].key;
                } else {
                    this.$nextTick(() => {
                        this.$refs.tree?.setCurrentKey(this.selectKey);
                    });
                }
            },
            getTreeList(oid) {
                this.initTree(oid);
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            async initTree(oid) {
                let selectData = {};
                this.treeTypeData = await this.getTreeDataApi('erd.cloud.foundation.type.entity.DataTypeDefinition')
                    .then((resp) => {
                        let data = resp.data || [];
                        _.each(data, (item) => {
                            item.dataType = 'dataTypeDefinition';
                            item.show = false;
                        });
                        return data;
                    })
                    .catch((error) => {
                        throw new Error(error);
                    });
                let component = await this.getTreeDataApi('erd.cloud.foundation.layout.entity.Component')
                    .then((resp) => {
                        let data = resp.data || [];
                        _.each(data, (item) => {
                            item.dataType = 'component';
                            item.show = false;
                        });
                        return data;
                    })
                    .catch((error) => {
                        throw new Error(error);
                    });
                this.treeComData = component;

                if (oid) {
                    component.forEach((item) => {
                        if (item.oid === oid) {
                            selectData = item;
                        }
                    });
                    this.defaultExpandedKeys.push(selectData.key);
                    this.$nextTick(() => {
                        this.$refs.tree?.setCurrentKey(selectData.key);
                        this.$emit('onclick', selectData);
                    });
                } else {
                    this.defaultExpandedKeys.push(this.treeData[0].key);
                    this.$nextTick(() => {
                        this.$refs.tree?.setCurrentKey(component[0].key);
                        this.$nextTick(() => {
                            const firstCatogary = document.querySelector('.dataTypeTree .tree-list').firstChild;
                            firstCatogary.querySelector('.el-tree-node').click();
                        });
                    });
                }
            },
            getTreeDataApi(data) {
                return this.$famHttp({
                    url: '/fam/listByKey',
                    params: {
                        className: data,
                        showAll: true
                    },
                    method: 'GET'
                });
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            onCreate() {
                this.NewEditComponentVisible = true;
                this.componentTitle = '创建组件';
            }
        },
        components: {
            FamTypeButtons: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/FamTypeButtons/index.js')),
            // 类型管理，数据类型-组件管理详情
            ComponentManagement: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/ComponentManagement/index.js')
            ),
            NewEditComponent: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/NewEditComponent/index.js'))
        }
    };
});
