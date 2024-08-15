define([
    'text!' + ELMP.resource('erdc-type-components/UnitMeasureTree/index.html'),
    'erdc-kit',
    'EventBus',
    'css!' + ELMP.resource('erdc-type-components/UnitMeasureTree/style.css')
], function (template) {
    const ErdcKit = require('erdcloud.kit');

    return {
        template,
        props: {},
        data() {
            return {
                visible: false,
                i18nLocalePath: ELMP.resource('erdc-type-components/UnitMeasureTree/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    searchKeyword: this.getI18nByKey('搜索关键字'),
                    create: this.getI18nByKey('创建'),
                    moreActions: this.getI18nByKey('更多操作'),
                    completeImport: this.getI18nByKey('全量导入'),
                    completeExport: this.getI18nByKey('全量导出'),
                    measureUnit: this.getI18nByKey('测量单位'),
                    createMeasureUnit: this.getI18nByKey('创建测量单位'),
                    unitMeasureSet: this.getI18nByKey('测量单位集合')
                },
                searchValue: '',
                treeList: [],
                basicsListData: [],
                treeChildData: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'children'
                },
                defaultExpandedKeys: [],
                selectKey: ''
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
            lan() {
                const lan = this.$store.state.i18n?.lang || 'zh_cn';
                this.treeData[0].name = this.i18nMappingObj['propertyDefCollection'];
                return lan;
            },
            treeData() {
                return [
                    {
                        displayName: this.i18nMappingObj.unitMeasureSet,
                        key: 'unitMeasureSet',
                        children: this.treeChildData
                    }
                ];
            }
        },
        mounted() {
            this.getListTree();
        },
        methods: {
            getListTree(Data) {
                const { oid } = Data || '';
                const paramData = {
                    className: 'erd.cloud.foundation.units.entity.QuantityOfMeasure'
                };
                this.$famHttp({
                    url: '/fam/listByKey',
                    data: paramData,
                    method: 'get'
                })
                    .then((resp) => {
                        let { data } = resp;
                        data = data.map((item, index) => {
                            item.active = 0;
                            if (index == 0) {
                                item.active = 1;
                            }
                            return item;
                        });
                        let selectData = {};
                        this.basicsListData = data;
                        this.treeChildData = data.map((item) => ({ ...item, show: false }));
                        if (oid) {
                            selectData = data.filter((item) => item.oid == oid)[0];
                            this.defaultExpandedKeys.push(selectData.key);
                            this.$nextTick(() => {
                                this.$refs.tree?.setCurrentKey(selectData.key);
                                this.$emit('onclick', selectData);
                            });
                        } else {
                            let times = 0;
                            const recursionFn = () => {
                                times++;
                                setTimeout(() => {
                                    if (times > 100) {
                                        return;
                                    }
                                    const firstNode = document.querySelector(
                                        '.unit-measure-tree .el-tree-node .el-tree-node__children .el-tree-node'
                                    );
                                    if (firstNode) {
                                        firstNode?.click();
                                    } else {
                                        recursionFn();
                                    }
                                }, 200);
                            };
                            recursionFn();
                        }
                    })
                    .finally(() => {
                        this.$refs.tree.filter(this.searchValue);
                    });
            },
            // search() {
            //     this.treeList = this.basicsListData.filter(item => (item.displayName?.includes(this.searchValue)))
            // },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            onCreate() {
                this.visible = true;
            },
            onCommand(val) {
                if (val == 'import') {
                    this.importAll();
                } else if (val == 'export') {
                    this.exportAll();
                }
            },
            importAll() {},
            exportAll() {},
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
            refreshList() {
                this.getListTree();
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            }
        },
        components: {
            UnitMeasureNewEdit: ErdcKit.asyncComponent(
                ELMP.resource('erdc-type-components/UnitMeasureNewEdit/index.js')
            )
        }
    };
});
