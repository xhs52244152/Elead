define([
    'text!' + ELMP.resource('erdc-type-components/PropertyDefineTree/index.html'),
    'erdc-kit',
    'EventBus',
    'css!' + ELMP.resource('erdc-type-components/PropertyDefineTree/style.css')
], function (template, utils) {
    const famHttp = require('fam:http');
    const ErdcKit = require('erdcloud.kit');
    const store = require('fam:store');

    return {
        template,
        components: {
            FamTypeButtons: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/FamTypeButtons/index.js')),
            BasicInforConfig: ErdcKit.asyncComponent(ELMP.resource('erdc-type-components/BasicInforConfig/index.js')),
            FamImport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamImport/index.js')),
            FamExport: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamExport/index.js'))
        },
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
                i18nLocalePath: ELMP.resource('erdc-type-components/PropertyDefineTree/locale/index.js'),
                i18nMappingObj: {
                    searchKeyword: this.getI18nByKey('搜索关键字'),
                    create: this.getI18nByKey('创建'),
                    moreActions: this.getI18nByKey('更多操作'),
                    attrdef: this.getI18nByKey('创建特征属性'),
                    propertyDef: this.getI18nByKey('featureAttributes'),
                    featureDef: this.getI18nByKey('featureAttributes'),
                    propertyDefCollection: this.getI18nByKey('特征属性集合')
                },
                buttons: [
                    {
                        displayName: '创建',
                        type: 'primary',
                        icon: 'el-icon-edit',
                        handleClick: this.onCreate
                    },
                    {
                        displayName: '全量导出',
                        type: 'primary',
                        handleClick: this.onExport
                    }
                ],
                typeName: '',
                treeData: [
                    {
                        name: '属性定义集合',
                        leaf: 'true',
                        childList: []
                    }
                ],
                searchValue: '',
                defaultProps: {
                    children: 'childList',
                    label: 'name',
                    isLeaf: 'leaf',
                    disabled: function (data) {
                        return data.level == '0';
                    }
                },
                basicInforConfigVisible: false,
                defaultCheckedKeys: [],
                defaultExpandedKeys: [],
                importVisible: false,
                exportVisible: false,
                importRequestConfig: {},
                exportRequestConfig: {}
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
            }
        },
        mounted() {
            this.getListTree();
        },
        methods: {
            getListTree(oid) {
                const param = {
                    params: {
                        className: store.getters.className('PropertyDefinition')
                    }
                };
                this.searchValue = '';
                famHttp
                    .get('/fam/listAllTree', param)
                    .then((resp) => {
                        const data = resp.data || [];
                        this.treeData[0].childList = data.filter((item) => item.displayName);
                        // this.treeData = data.filter(item=>(item.displayName))
                        let selectData = {};
                        let expandData = {};
                        for (const element of data) {
                            if (element.childList && element.childList.length) {
                                if (oid) {
                                    element.childList.forEach((item) => {
                                        if (item.oid === oid) {
                                            selectData = item;
                                            expandData = element;
                                        }
                                    });
                                } else {
                                    selectData = element.childList[0];
                                    expandData = element;
                                    break;
                                }
                            }
                        }
                        this.defaultExpandedKeys.push(expandData.key);
                        this.defaultCheckedKeys.push(selectData.key);

                        if (oid) {
                            this.$nextTick(() => {
                                this.$refs.tree?.setCurrentKey(selectData.key);
                            });
                        } else {
                            this.$nextTick(() => {
                                setTimeout(() => {
                                    this.$refs.tree?.setCurrentKey(selectData.key);
                                    this.$nextTick(() => {
                                        document.querySelector('.tree-list .is-current').firstChild.click();
                                    });
                                }, 100);
                            });
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            },
            onCreate() {
                this.basicInforConfigVisible = true;
            },

            onCheck(...args) {
                if (args[0].oid) {
                    this.$emit('node-type-click', ...args);
                }
            },
            search() {
                utils.debounceFn(() => {}, 300);
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.name?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            onSubmit() {
                this.getListTree();
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
            },
            onImport() {
                this.importRequestConfig = {
                    data: {
                        businessName: 'PropertyDefinitionImport',
                        tableSearchDto: {
                            className: this.$store.getters.className('PropertyDefinition')
                        }
                    }
                };
                this.importVisible = true;
            },
            onExport() {
                this.exportRequestConfig = {
                    data: {
                        businessName: 'PropertyDefinitionExport',
                        tableSearchDto: {
                            className: this.$store.getters.className('PropertyDefinition')
                        }
                    }
                };
                this.exportVisible = true;
            },
            onExportFn(data) {
                const { typeName, key } = data;
                const serviceName = key.split('_')[0];
                this.exportRequestConfig = {
                    data: {
                        tableSearchDto: {
                            className: this.$store.getters.className('PropertyDefinition')
                        },
                        customParams: {
                            typeName,
                            serviceName,
                            isTree: true
                        }
                    }
                };
                this.exportVisible = true;
            },
            importSuccess() {
                this.getListTree();
            }
        }
    };
});
