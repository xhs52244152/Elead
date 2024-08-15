define([
    'text!' + ELMP.resource('biz-bpm/portal-proxy/components/AgentProcessConfiguration/index.html'),
    'css!' + ELMP.resource('biz-bpm/portal-proxy/components/AgentProcessConfiguration/style.css')
], (template) => {
    const ErdcKit = require('erdc-kit');

    return {
        template,
        components: {
            ResizableContainer: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamResizableContainer/index.js'))
        },
        props: {
            rowEcho: {
                type: Object,
                default: () => {
                    return {};
                }
            },
            value: {
                type: [Array, Object, String],
                default: () => {
                    return [];
                }
            },
            defaultSelect: {
                type: Array,
                default() {
                    return [];
                }
            },
            valueKey: {
                type: String,
                default: 'masterRef'
            },
            type: {
                type: String,
                default: 'create'
            }
        },
        data() {
            return {
                i18nLocalePath: ELMP.resource('biz-bpm/portal-proxy/locale/index.js'),
                i18nMappingObj: this.getI18nKeys([
                    '可选流程',
                    '请输入搜索内容',
                    '请选择流程',
                    '已选流程',
                    '请拖动调整排序',
                    '全部',
                    '流程类型'
                ]),
                selectData: [],
                allColumnsList: [],
                optionalQuantity: 0,
                searchValue: '',
                treeHeight: '384px',
                treeData: [],
                defaultProps: {
                    children: 'childList',
                    label: 'displayName',
                    isLeaf: 'leaf'
                }
                // memoryDefaultSelect: ErdcKit.deepClone(this.defaultSelect)
            };
        },
        computed: {
            memoryDefaultSelect() {
                return ErdcKit.deepClone(this.defaultSelect);
            },
            selectedQuantity() {
                return this.selectData.length;
            },
            defaultSelected() {
                const selects = this.memoryDefaultSelect.map((item) => item[this.valueKey]);
                let defaultSelect = [
                    ...this.memoryDefaultSelect,
                    ...this.selectData.filter((item) => !selects.includes(item[this.valueKey]))
                ];
                defaultSelect = _.map(defaultSelect, (item) => {
                    return this.type === 'detail' ? { ...item, isDisable: true } : item;
                });
                return defaultSelect;
            }
        },
        watch: {
            searchValue(nv) {
                this.$refs.tree.filter(nv);
            }
        },
        mounted() {
            this.getTreeData();
        },
        methods: {
            /**
             * 获取可选流程树
             */
            getTreeData() {
                this.$famHttp({
                    url: '/bpm/listAllTree',
                    appName: 'ALL',
                    params: {
                        className: this.$store.getters.className('processCategory')
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.treeData = [
                        {
                            oid: '-1',
                            displayName: this.i18nMappingObj['全部']
                        },
                        ...data
                    ];
                    this.treeData.forEach((item) => {
                        item.icon && (item.icon = ErdcKit.imgUrlCreator(item.icon));
                    });
                    setTimeout(() => {
                        this.$nextTick(() => {
                            this.defaultClickNode();
                        });
                    }, 50);
                });
            },
            /**
             * 默认选中全部
             */
            defaultClickNode() {
                this.$refs.tree?.setCurrentKey(this.treeData[0].oid);
                this.$nextTick(() => {
                    document.querySelector('.agent-tree .el-tree-node__content')?.click();
                });
            },
            nodeClick(data) {
                if (data.oid) {
                    this.getAgentProcess(data.oid);
                    this.memoryDefaultSelect = ErdcKit.deepClone(this.selectData);
                }
            },
            /**
             * 获取流程
             * @param {*} oid
             */
            getAgentProcess(oid) {
                this.$famHttp({
                    url: '/bpm/search',
                    method: 'POST',
                    appName: 'ALL',
                    data: {
                        className: this.$store.getters.className('processDef'),
                        pageIndex: 1,
                        pageSize: 10000,
                        conditionDtoList:
                            oid === '-1'
                                ? undefined
                                : [
                                      {
                                          attrName: 'categoryRef',
                                          oper: 'EQ',
                                          value1: oid
                                      }
                                  ]
                    }
                }).then((resp) => {
                    const { data } = resp;
                    this.optionalQuantity = this.optionalQuantity || data?.total || 0;

                    const { records } = data;

                    const defaultSelects = this.memoryDefaultSelect.map((item) => item[this.valueKey]);
                    this.allColumnsList = records.map((item) => {
                        let obj = {
                            ...ErdcKit.deserializeArray(item?.attrRawList || [], { valueKey: 'value' }),
                            isDisable: this.type === 'detail' ? true : false,
                            masterRef: item.masterRef || ''
                        };
                        if (defaultSelects.includes(obj[this.valueKey])) {
                            obj.isSelected = true;
                        } else {
                            obj.isSelected = false;
                        }
                        return obj;
                    });
                });
            },
            /**
             * 供外部使用，获取当前已选择的值
             */
            getSetResult() {
                return {
                    allColumns: this.allColumnsList,
                    selectData: this.selectData,
                    ...this.$refs?.transferProxy?.getSetResult()
                };
            },
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                return data.displayName && data.displayName.indexOf(value) !== -1;
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            }
        }
    };
});
