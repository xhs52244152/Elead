define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/components/CompareTree/index.html'),
    'erdc-kit',
    ELMP.resource('erdc-pdm-app/store/index.js'),
    'dayjs'
], function (template, ErdcKit, store, dayjs) {
    return {
        props: {
            // 和对象类型相关的各个标题
            titleConfig: {
                type: Object,
                default() {
                    return {
                        title: '结构树',
                        changeBntTitle: '更改比较对象'
                    };
                }
            },

            // 树形表格数据
            rootData: {
                type: Array,
                default() {
                    return [];
                }
            },

            className: String,

            needBomView: Boolean,

            defaultView: String
        },
        template,
        components: {
            ObjectSelectDialog: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectSelectDialog/index.js')
            ),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ObjectConstruction/locale/index.js'),
                keyword: '',
                selectProjectConfig: {
                    visible: false
                },
                treeData: [],
                viewOid: '',
                defaultProps: {
                    label: 'displayName',
                    value: 'oid',
                    key: 'name'
                },
                bomViewOptions: [],
                dialogOpen: false
            };
        },
        computed: {
            tableKey() {
                let { className } = this;
                let { tableViewMaping } = store.state;

                const config = {
                    [tableViewMaping.part.className]: 'viewPart',
                    [tableViewMaping.document.className]: 'CompareDocumentView',
                    [tableViewMaping.epmDocument.className]: 'CompareEpmView'
                };

                return config[className] || '';
            },
            extendFilterConditions() {
                let { needBomView } = this;
                if (needBomView) {
                    return [
                        {
                            label: '视图',
                            attrName: 'View',
                            componentName: 'CustomVirtualSelect',
                            defaultSelectFirst: true,
                            componentJson: JSON.stringify({
                                props: {
                                    defaultSelectFirst: true,
                                    row: {
                                        componentName: 'CustomVirtualSelect',
                                        requestConfig: {
                                            method: 'GET',
                                            url: '/fam/view/effective',
                                            data: {
                                                className: 'erd.cloud.pdm.part.view.entity.View'
                                            },
                                            valueProperty: 'oid',
                                            viewProperty: 'displayName'
                                        }
                                    }
                                }
                            })
                        }
                    ];
                } else {
                    return [];
                }
            },
            pageUrl() {
                return this.needBomView ? '/part/findPartByPage' : void 0;
            }
        },
        watch: {
            rootData: {
                immediate: true,
                handler(nv, ov) {
                    this.treeData = nv;
                    if (_.isEmpty(this.treeData)) return;
                    // 设置默认选中
                    this.$nextTick(() => {
                        let nodeKey = this.treeData[0]?.nodeKey;
                        let tree = this.getTreeInstance();
                        if (this.treeData[0]?.oid) {
                            tree.setCurrentNode(tree.getNode(nodeKey)?.data);
                            this.$emit('set-default', this.treeData[0]);
                        }

                        // bomview
                        if (this.needBomView && nv[0] && !nv[0].isEmpty) {
                            this.fetchBOMView(this.treeData[0])
                                .then((resp) => {
                                    if (resp.data.length < 1) {
                                        // 该部件不存在bomview
                                        this.treeData[0].hasNoBomView = 'no_bom';
                                        return;
                                    }

                                    this.bomViewOptions = resp.data.map((item) => {
                                        return {
                                            // 视图显示名称
                                            displayName: item?.viewDto?.displayName,
                                            // 视图oid
                                            oid: item?.viewDto?.oid,
                                            // 视图内部名称
                                            name: item?.viewDto?.name,
                                            // bomViewOid
                                            bomViewOid: item.oid,
                                            createTime: item.createTime
                                        };
                                    });

                                    // 创建时间最早的视图
                                    let earliestView = this.bomViewOptions.sort((next, pre) => {
                                        let preDate = dayjs(pre.createTime);
                                        let nextDate = dayjs(next.createTime);
                                        return preDate.isBefore(nextDate) ? 1 : preDate.isSame(nextDate) ? 0 : -1;
                                    })[0];

                                    // 设置默认选中
                                    if (nv[0].defaultViewOid && !nv[0].isSelected) {
                                        // 切换对象提供的视图
                                        this.viewOid = nv[0].defaultViewOid || this.viewOid;
                                        // 增加标识，避免默认值多次使用
                                        nv[0].isSelected = true;
                                    } else if (this.defaultView)
                                        // 页面初始提供的视图（例如BOM视图页面）
                                        this.viewOid =
                                            this.viewOid ||
                                            this.bomViewOptions.find(
                                                (item) =>
                                                    item.name === this.defaultView || item.oid === this.defaultView
                                            )?.oid ||
                                            this.bomViewOptions[0].oid;
                                    else this.viewOid = this.viewOid || earliestView.oid || '';
                                })
                                .catch(() => {
                                    // 该部件不存在bomview
                                    this.treeData[0].hasNoBomView = 'no_bom';
                                });
                        }
                    });
                }
            }
        },
        mounted() {
            this.$nextTick(() => {
                this.$refs.scrollbar?.$el
                    ?.querySelector('.el-scrollbar__wrap')
                    .addEventListener('scroll', this.onScroll);
            });
        },
        destroy() {
            this.$refs.scrollbar?.$el
                ?.querySelector('.el-scrollbar__wrap')
                .removeEventListener('scroll', this.onScroll);
        },
        methods: {
            onNodeClick(row) {
                if (row.disabled) return false;
                this.$emit('click', ...arguments);
            },
            onNodeExpand(row) {
                if (row.disabled) return false;
                this.$emit('expand', ...arguments);
            },
            onNodeCollapse() {
                this.$emit('collapse', ...arguments);
            },
            onChangeView() {
                this.$emit('change-view', ...arguments);
            },
            onScroll() {
                // 搜索状态不用同步滚动
                if (!_.isEmpty(this.keyword)) return;
                // 获取滚动距离
                let scrollTop = this.$refs.scrollbar?.$el?.querySelector('.el-scrollbar__wrap').scrollTop;
                this.$emit('scroll', scrollTop);
            },
            onLoad(node, resolve) {
                if (node.level === 0) resolve(node?.data);
                else if (node?.data?.children) {
                    resolve(node.data.children);
                } else {
                    this.$emit('load', ...arguments);
                }
            },
            openSingleObjSelect() {
                this.dialogOpen = true;
                ErdcKit.deferredUntilTrue(
                    () => this.$refs.objectSelectDialog,
                    () => {
                        // 无视图就不用设置初始值
                        let values = this.viewOid
                            ? {
                                  View: this.viewOid
                              }
                            : {};
                        this.$refs.objectSelectDialog
                            .openSelect({
                                multiple: false,
                                value: values
                            })
                            .then(({ selection, conditions }) => {
                                // 可能是link数据，需要调整oid
                                selection.oid = selection.versionOid || selection.oid;
                                if (this.needBomView) {
                                    // 处理默认视图
                                    selection.defaultViewOid = conditions.find(
                                        (item) => item.attrName === 'View'
                                    )?.value1;
                                }
                                // 更改比较对象
                                this.$emit('change-object', selection);
                            });
                    }
                );
            },
            getTreeInstance() {
                return this.$refs.tree;
            },
            getCurrentNode() {
                return this.getTreeInstance().getCurrentNode() || {};
            },
            getRootData() {
                return { ...this.treeData[0], children: null };
            },
            setChildren(node, children) {
                if (node?.data) node.data.children = children;
            },
            setScrollTop(scrollTop) {
                // 搜索状态不用同步滚动
                if (!_.isEmpty(this.keyword)) return;
                let scrollContext = this.$refs.scrollbar?.$el?.querySelector('.el-scrollbar__wrap');
                scrollContext.scrollTop = scrollTop;
            },
            setKeyword(val) {
                this.keyword = val;
            },
            setViewOid(val) {
                this.viewOid = val;
            },
            onKeywordChange(keyword) {
                // 全部展开处理，未展开的好像搜不到
                this.$refs.tree.expandChild();
                return this.filter(keyword);
            },
            filterMethod(val, data, node) {
                if (!val) return true;
                else if (_.isObject(val)) {
                    switch (val.type) {
                        case 'diff':
                            // 仅显示不同，保底留一个根节点
                            return (
                                !data.hasForEach ||
                                data.isEmpty ||
                                data.anotherTreeKey.search('EMPTY') > -1 ||
                                node.level === 1
                            );
                        default:
                    }
                } else {
                    return data.caption.toLowerCase().indexOf(val.toLowerCase()) !== -1 || node.level === 1;
                }
            },
            filter(data) {
                return this.$refs.tree.filter(data);
            },
            handleParams(params) {
                if (this.needBomView) {
                    return {
                        ...params,
                        conditionDtoList: [
                            {
                                attrName: 'erd.cloud.pdm.part.entity.EtPartMaster#typeReference',
                                oper: 'EQ',
                                value1: params.conditionDtoList[0].value1,
                                logicalOperator: 'AND',
                                isCondition: true
                            },
                            {
                                attrName: 'erd.cloud.pdm.part.entity.EtPartMaster#viewRef',
                                oper: 'EQ',
                                value1: params.conditionDtoList[1].value1,
                                logicalOperator: 'AND',
                                isCondition: true
                            }
                        ]
                    };
                } else {
                    return params;
                }
            },
            fetchBOMView(data) {
                let params = {
                    className: this.className,
                    parentOid: data.masterRef,
                    branchVid: data.vid
                };

                return this.$famHttp({
                    url: '/part/bom/getPartBomView',
                    method: 'POST',
                    data: params
                });
            }
        }
    };
});
