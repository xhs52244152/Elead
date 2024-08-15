define([
    'text!' + ELMP.resource('erdc-permission-components/TypeTreeSelect/index.html'),
    'css!' + ELMP.resource('erdc-permission-components/TypeTreeSelect/style.css')
], function (template) {
    return {
        template,
        props: {
            defaultValue: {
                type: Object,
                default: () => {
                    return null;
                }
            },
            disabled: {
                type: Boolean,
                default: false
            },
            appName: String,
            isBasics: Boolean,
            customGetTypeData: Function,
            typeNodeKey: {
                type: String,
                default: 'oid'
            },
            typeTreeProps: {
                type: Object,
                default: () => {
                    return {
                        label: 'displayName',
                        children: 'children',
                        isLeaf: 'leaf',
                        disabled: 'disabled'
                    };
                }
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('erdc-permission-components/locale/index.js'),
                // 国际化页面引用对象 getI18nByKey方法全局已经注册不需要再自己写
                i18nMappingObj: {
                    pleaseSelect: this.getI18nByKey('请选择')
                },
                // selectedValue: {
                //     name: '',
                //     displayName: '',
                //     id: ''
                // },
                typeTreeData: [],
                defaultDisplayData: []
            };
        },
        computed: {
            selectedValue: {
                get() {
                    return this.defaultValue;
                },
                set(selected) {
                    this.$emit('handler-change-type-select', selected ? {
                        name: selected?.typeName,
                        displayName: selected?.displayName,
                        id: selected?.oid,
                        appName: selected?.appName
                    } : null);
                }
            }
        },
        created() {
            this.getTypeData();
        },
        mounted() {
            // this.$nextTick(() => {
            //     this.defaultDisplayData = [this.defaultValue];
            //     let defaultValue =
            //         this.defaultValue && Object.keys(this.defaultValue).length ? this.defaultValue : null;
            //     this.selectedValue = defaultValue;
            // });
        },
        methods: {
            getTypeData() {
                if (_.isFunction(this.customGetTypeData)) return this.customGetTypeData(this);
                this.$famHttp({
                    url: '/fam/access/getAccessControlledType',
                    method: 'get',
                    headers: {
                        'App-Name': 'ALL'
                    }
                }).then((res) => {
                    this.typeTreeData = res.data.map((item, index) => {
                        if (!item.id) {
                            item.id = `rootNodex-${index}`;
                        }
                        return item;
                    });
                    // 紧急处理MPM项目无法配置权限问题的暂时处理方案 待后续方案优化
                    // if (this.appName) {
                    //     const findTree = function (treeList, children, key, appName, isBasics) {
                    //         for (let i = 0; i < treeList.length; i++) {
                    //             const item = treeList[i];
                    //             if (item[key] !== appName && item[key] !== 'plat' && !isBasics) {
                    //                 treeList.splice(i, 1);
                    //                 i = i - 1;
                    //             } else if (item[children]?.length) {
                    //                 findTree(item[children], children, key, appName, isBasics);
                    //             }
                    //         }
                    //     };
                    //     findTree(this.typeTreeData, 'children', 'appName', this.appName, this.isBasics);
                    // }
                });
            },
            // changeSelectNode(selected, node) {
            //     this.$emit('handler-change-type-select', {
            //         name: selected.typeName,
            //         displayName: selected.displayName,
            //         id: selected.oid
            //     });
            // },
            handlerClearSelections() {
                this.$emit('handler-change-type-select', {
                    name: '',
                    displayName: '',
                    id: ''
                });
                // 搜索栏清除v-model的值
                this.selectedValue = null;
            },
            clearTypeSelections() {
                this.selectedValue = null;
            }
        }
    };
});
