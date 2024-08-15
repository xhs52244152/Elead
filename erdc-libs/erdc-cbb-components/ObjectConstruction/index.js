/**
 * @description 对象结构组件
 */
define([
    'text!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/index.html'),
    ELMP.resource('erdc-cbb-components/ObjectConstruction/store.js'),
    ELMP.resource('erdc-cbb-components/utils/index.js'),
    'css!' + ELMP.resource('erdc-cbb-components/ObjectConstruction/index.css')
], function (template, store, utils) {
    const ErdcKit = require('erdc-kit');
    const EventBus = require('EventBus');
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('ObjectConstruction', store);
    const TreeUtil = require('TreeUtil');

    return {
        name: 'ObjectConstruction',
        template,
        components: {
            // 容器组件
            FamResizableContainer: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamResizableContainer/index.js')
            ),
            // 标题组件
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            // 结构顶板操作组件
            ConstructionOperation: ErdcKit.asyncComponent(
                ELMP.resource('erdc-cbb-components/ObjectConstruction/components/ConstructionOperation/index.js')
            ),
            // 右侧tab组件
            AdvancedTabs: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/AdvancedTabs/index.js')),
            ComponentWidthLabel: ErdcKit.asyncComponent(
                ELMP.resource('erdc-components/FamAdvancedTable/FamFieldComponents/ComponentWidthLabel/index.js')
            ),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js'))
        },
        props: {
            // 通用页面父组件的实例
            vm: [Object],
            needBomView: {
                type: Boolean,
                default: true
            },
            customTabsConfig: {
                type: Object,
                default() {
                    return {};
                }
            },
            leftTitle: String,
            className: String,
            setTabs: Function,
            setTabPaneProps: Function,
            linkAttrName: {
                type: String,
                default: 'usageRef'
            },
            // 自定义参数appName
            appName: String
        },
        data() {
            return {
                i18nPath: ELMP.resource('erdc-cbb-components/ObjectConstruction/locale/index.js'),
                // 输入框的keyword
                keyword: '',
                // 节点信息
                info: {},
                activeName: '',
                // 根节点数据
                rootData: {},
                resolve: [],
                node: [],
                tagName: '',
                displayData: [],
                level: 0,
                objectViewOption: [],
                isShowTag: true,
                tableData: [],
                // AdvancedTabs初始化完成
                initAdvancedTabs: false,
                vueInstance: null,
                // 是否为根节点
                isRoot: true,
                finish: false
            };
        },
        computed: {
            getOid() {
                return this.vm?.containerOid;
            },
            getClassName() {
                return this.className || this.getOid?.split(':')?.[1] || this.vm?.className;
            },
            dataAppName() {
                return this.appName || utils.getAppNameByResource();
            },
            levelConfig() {
                return {
                    level: '0',
                    options: [
                        {
                            value: '1',
                            label: this.i18n['展开一级']
                        },
                        {
                            value: '2',
                            label: this.i18n['展开二级']
                        },
                        {
                            value: '3',
                            label: this.i18n['展开三级']
                        },
                        {
                            value: '0',
                            label: this.i18n['展开所有']
                        }
                    ],
                    label: this.i18n['层级'],
                    placeholder: this.i18n['请选择层级'],
                    showComponent: 'erd-ex-select'
                };
            },
            // 能否初始化tabs页签
            canInitSetTabs() {
                return this.initAdvancedTabs && !_.isEmpty(this.i18n) && this.getClassName;
            },
            // 左侧标题
            dataLeftTitle() {
                return this.leftTitle || this.i18n['BOM结构树'];
            },
            // 右侧页头标题
            rightTitle() {
                return this.info?.caption || '';
            },
            // 对象图标
            icon() {
                return this.info?.icon || '';
            },
            tabsConfig() {
                let { customTabsConfig, isRoot, refreshNode } = this;
                let config = {
                    // 组件名称作为键，这样可以传递去匹配各自组件需要的属性
                    ConstructionObjectAttrInfo: {
                        props: {
                            formId: 'DETAIL',
                            oid: this.getOid,
                            className: this.getClassName,
                            isRoot
                        },
                        event: {
                            tabClick: function () {},
                            refreshNode
                        }
                    },
                    ConstructionVisualization: {
                        props: {
                            showTools: false
                        },
                        event: {
                            tabClick: function () {}
                        }
                    },
                    ConstructionList: {
                        props: {
                            oid: this.getOid,
                            className: this.getClassName,
                            ref: 'ConstructionList',
                            needBomView: this.needBomView,
                            info: this.info,
                            rootData: this.rootData,
                            getParentInfo: this.getParentInfo,
                            vm: this.vm,
                            showData: this.displayData
                        },
                        event: {
                            tabClick: function () {},
                            refresh: this.refreshTree,
                            refreshNode: this.refreshNode,
                            refreshObjectView: this.getObjectView,
                            setTagName: this.handleSetTagName
                        }
                    },
                    InUse: {
                        props: {
                            oid: this.getOid,
                            className: this.getClassName
                        },
                        event: {
                            tabClick: function () {},
                            refresh: this.refreshTree
                        }
                    },
                    // 爱科赛博需求:暂时注释
                    // ConstructionEffectiveness: {
                    //     props: {
                    //         oid: this.getOid,
                    //         className: this.getClassName
                    //     },
                    //     event: {
                    //         tabClick: function () {}
                    //     }
                    // },
                    ConstructionBomView: {
                        props: {
                            className: this.getClassName,
                            vm: this.vm
                        },
                        event: {
                            tabClick: function () {}
                        }
                    }
                };

                Object.keys(config).forEach((key) => {
                    if (customTabsConfig[key]) {
                        config[key] = {
                            props: {
                                ...config[key].props,
                                ...customTabsConfig[key].props
                            },
                            event: {
                                ...config[key].event,
                                ...customTabsConfig[key].event
                            }
                        };
                    }
                });

                return config;
            }
        },
        created() {
            this.vueInstance = this;
        },
        mounted() {
            this.$nextTick(() => {
                document.querySelector('#pane-structure').style.padding = '0';
            });
            this.$store.dispatch('ObjectConstruction/getPreferenceView');
            // 刷新树结构
            EventBus.on('refresh:structure', (vet, data) => {
                this.refreshTree(data);
            });
        },
        watch: {
            'info': {
                handler(newVal) {
                    this.$emit('info-change', newVal);
                    // 改变tab的属性
                    _.isFunction(this.setTabPaneProps)
                        ? this.setTabPaneProps(newVal)
                        : this.defaultSetTabPaneProps(newVal);
                },
                deep: true
            },
            // 这里其实只需要执行一次就够了,多次执行会出现问题的,所以加个变量控制下把
            'vm.formData': {
                handler(newVal) {
                    if (newVal && newVal.vid && newVal.masterRef && !this.finish) {
                        if (this.needBomView) {
                            this.getObjectView(newVal);
                        } else {
                            this.refreshTree();
                        }
                        this.finish = true;
                    }
                },
                deep: true,
                immediate: true
            },
            'canInitSetTabs': {
                handler(nv) {
                    if (nv) {
                        _.isFunction(this.setTabs) ? this.setTabs() : this.defaultSetTabs();
                    }
                },
                immediate: true
            }
        },
        methods: {
            // 刷新根节点方法
            // refresh(oid) {
            //     this.vm.refresh(oid);
            //     // // 刷新对象详情
            //     this.vm.getAttr(oid).then((res) => {
            //         let data = Object.assign(
            //             ErdcKit.deserializeAttr(res?.rawData, {
            //                 // 需要单独处理得属性
            //                 valueMap: {
            //                     'status'({ displayName, value }) {
            //                         return {
            //                             displayName,
            //                             value
            //                         };
            //                     },
            //                     'containerRef'({ displayName, oid }) {
            //                         return {
            //                             displayName,
            //                             oid
            //                         };
            //                     }
            //                 }
            //             }),
            //             res
            //         );
            //         this.getRefreshNode(data);
            //         // this.refreshTree(data);
            //         this.setTabPaneProps(data);
            //     });
            // },
            getTreeInstance() {
                return this.$refs.constructionTree;
            },
            // 局部更新某个节点,没有检入检出逻辑了,就全都局部刷新就行
            refreshNode(data) {
                this.getRefreshNode(data);
            },
            // 设置要更新得节点得新信息
            getRefreshNode(data) {
                // 还是得刷新整颗树,因为有可能根节点重复的情况
                this.getTreeData(this.rootData?.oid, data.id, () => {
                    this.handleNodeClick(data);
                });
            },
            // 刷新整颗树
            refreshTree(data) {
                // 刷新树结构
                this.getTreeData(data?.oid || this.rootData?.oid);
            },
            defaultSetTabs() {
                this.$store.commit('AdvancedTabs/SET_TABS', {
                    className: this.getClassName,
                    data: {
                        // tabs的配置
                        activeName: 'substructure',
                        // tabs属性
                        attrs: {},
                        // tabs事件
                        event: {
                            'tab-click': () => {}
                        },
                        // tab列表
                        tabList: [
                            {
                                label: this.i18n['属性'],
                                name: 'AttrInfo',
                                component: {
                                    componentName: 'ConstructionObjectAttrInfo',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.resource(
                                            'erdc-cbb-components/ObjectConstruction/components/ConstructionObjectAttrInfo/index.js'
                                        )
                                    )
                                },
                                attrs: {
                                    disabled: false,
                                    lazy: true
                                }
                            },
                            {
                                label: this.i18n['可视化'],
                                name: 'Visualization',
                                component: {
                                    componentName: 'ConstructionVisualization',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.resource('erdc-cbb-components/Visualization/index.js')
                                    )
                                },
                                attrs: {
                                    disabled: false,
                                    lazy: true
                                },
                                props: {
                                    showTools: false
                                }
                            },
                            {
                                label: this.i18n['结构'],
                                name: 'substructure',
                                component: {
                                    componentName: 'ConstructionList',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.resource(
                                            'erdc-cbb-components/ObjectConstruction/components/ConstructionList/index.js'
                                        )
                                    )
                                },
                                attrs: {
                                    disabled: false,
                                    lazy: true
                                }
                            },
                            {
                                label: this.i18n['被使用'],
                                name: 'InUse',
                                component: {
                                    componentName: 'InUse',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.func('erdc-part/components/PartInUse/index.js')
                                    )
                                },
                                attrs: {
                                    disabled: false,
                                    lazy: true
                                }
                            },
                            // 爱科赛博需求:暂时注释
                            // {
                            //     label: this.i18n['有效性'],
                            //     name: 'effectiveness',
                            //     component: {
                            //         componentName: 'ConstructionEffectiveness',
                            //         componentUrl: ErdcKit.asyncComponent(
                            //             ELMP.resource('erdc-pdm-components/Effectiveness/index.js')
                            //         )
                            //     },
                            //     attrs: {
                            //         disabled: false,
                            //         lazy: true
                            //     }
                            // },
                            {
                                label: this.i18n['BOM视图'],
                                name: 'bomView',
                                component: {
                                    componentName: 'ConstructionBomView',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.resource('erdc-pdm-components/BomView/index.js')
                                    )
                                },
                                attrs: {
                                    disabled: false,
                                    lazy: true
                                }
                            }
                        ]
                    }
                });
            },
            fetchTreeLevel(parentOid) {
                let data = { ...this.getRequestParams(), ...{ parentOid } };
                let url = this.needBomView
                    ? `/part/bom/query/${this.levelConfig.level}`
                    : `/fam/struct/queryChildByLevel/${this.levelConfig.level}`;
                return this.$famHttp({
                    url,
                    data,
                    appName: this.dataAppName,
                    className: this.getClassName,
                    method: 'POST'
                });
            },
            getTreeData(oid, chooseId, callback) {
                let parentOid = this.getOid;
                this.fetchTreeLevel(oid || parentOid).then((resp) => {
                    // 加载根节点
                    let afterChangeData = [];
                    this.info = Object.assign(
                        ErdcKit.deserializeAttr(resp?.data?.rawData, {
                            // 需要单独处理得属性
                            valueMap: {
                                'status'({ displayName, value }) {
                                    return {
                                        displayName,
                                        value
                                    };
                                },
                                'lifecycleStatus.status'({ displayName, value }) {
                                    return {
                                        displayName,
                                        value
                                    };
                                },
                                'containerRef'({ displayName, oid }) {
                                    return {
                                        displayName,
                                        oid
                                    };
                                }
                            }
                        }),
                        resp.data
                    );
                    // 兼容部件,文档,模型三种对象
                    let usageRef = resp.data?.rawData?.[this.linkAttrName]?.value;
                    // id用oid切割+唯一的行号进行拼接:为了解决重复子项
                    let id = resp.data?.rawData?.oid?.value.split(':')[2] + usageRef;
                    this.$set(this.info, 'id', id);
                    this.rootData = ErdcKit.deepClone(this.info);
                    afterChangeData.push(this.rootData);
                    this.$nextTick(() => {
                        // 设置默认展开的根节点
                        // this.defaultExpandedKeys = [this.info?.oid]
                        ErdcKit.deferredUntilTrue(
                            () => this.$refs.constructionTree?.$refs.tree,
                            () => {
                                this.$refs.constructionTree.$refs.tree.setCurrentKey(chooseId || this.info?.id);
                            }
                        );
                    });
                    this.changeRowData(resp?.data);
                    this.tableData = [resp.data];
                    callback && _.isFunction(callback) && callback();
                });
            },
            getRequestParams() {
                let { needBomView } = this;
                if (!needBomView) return {};

                let view = this.$refs.ConstructionOperation?.viewConfig?.view || this.objectViewOption[0]?.value || '';
                let viewOid = '';

                this.currentView = this.objectViewOption.find((item) => item.value == view) || {};

                viewOid = this.currentView.viewOid || '';
                return { viewOid };
            },
            // 递归处理children
            changeRowData(data) {
                this.$set(data, 'leaf', data.leaf);
                // 兼容部件,文档,模型三种对象
                let usageRef = data?.rawData?.[this.linkAttrName]?.value;
                // id用oid切割+唯一的行号进行拼接:为了解决重复子项
                let id = data?.rawData?.oid?.value.split(':')[2] + usageRef;
                this.$set(data, 'id', id);
                let arrMap = {};
                arrMap = ErdcKit.deserializeAttr(data?.rawData, {
                    // 需要单独处理得属性
                    valueMap: {
                        'status'({ displayName, value }) {
                            return {
                                displayName,
                                value
                            };
                        },
                        'containerRef'({ displayName, oid }) {
                            return {
                                displayName,
                                oid
                            };
                        },
                        'lifecycleStatus.status'({ displayName, value }) {
                            return {
                                displayName,
                                value
                            };
                        }
                    }
                });
                Object.keys(arrMap).forEach((key) => {
                    this.$set(data, key, arrMap[key]);
                });

                if (data.children && !_.isEmpty(data.children)) {
                    data.children.forEach((v) => {
                        this.changeRowData(v);
                    });
                }
            },
            // 获取根节点对象的视图
            getObjectView({ masterRef, vid }) {
                let data = {
                    className: this.getClassName,
                    parentOid: masterRef,
                    branchVid: vid
                };
                this.$store.dispatch('ObjectConstruction/getObjectView', data).then((res) => {
                    if (_.isArray(res)) res = res.slice(-1)?.[0];
                    if (res.code == 200) {
                        // 一个视图对应一个bomView,change后都是用bomView去请求,后端通过bomView就可以获取视图
                        this.objectViewOption = res.data.map((item) => {
                            return {
                                // 视图显示名称
                                label: item?.viewDto?.displayName,
                                // bomViewOid
                                value: item?.oid,
                                // 视图内部名称
                                name: item?.viewDto?.name,
                                // 视图oid
                                viewOid: item?.viewDto?.oid
                            };
                        });
                    } else {
                        this.objectViewOption = [];
                    }
                    this.getTreeData();
                });
            },
            defaultSetTabPaneProps(data) {
                for (const key in this.tabsConfig) {
                    if (Object.hasOwnProperty.call(this.tabsConfig, key)) {
                        this.$set(this.tabsConfig[key]['props'], 'oid', data?.oid || data?.childOid);
                        this.$set(
                            this.tabsConfig[key]['props'],
                            'className',
                            data?.oid?.split(':')[1] || data?.childOid?.split(':')[1]
                        );
                        this.$set(this.tabsConfig[key]['props'], 'rootData', this.rootData);
                        this.$set(this.tabsConfig[key]['props'], 'info', data);
                    }
                    if (key == 'ConstructionList') {
                        this.$set(this.tabsConfig[key]['props'], 'defaultView', this.getOperationViewOid());
                    }
                }
            },
            // 获取选中的视图的viewoid(viewoid才是唯一的,可以用来匹配列表视图的)
            getOperationViewOid() {
                return this.$refs.ConstructionOperation?.viewConfig?.options?.find((item) => {
                    return item.value == this.$refs.ConstructionOperation.viewConfig.view;
                })?.viewOid;
            },
            handleSetTagName(data) {
                if (data != null) {
                    this.isShowTag = true;
                    this.tagName = data ? this.i18n['精确'] : this.i18n['非精确'];
                } else {
                    this.isShowTag = false;
                }
            },
            // 点击节点触发得事件
            handleNodeClick(data, node) {
                if (!data.accessToView) {
                    return;
                }
                this.info = data;
                this.isRoot = node ? node.level === 1 : true;
                // this.displayData = [];
            },
            handleSearch(keyword) {
                return this.$refs.constructionTree.filter(keyword);
            },
            // 搜索
            handleFilterNode(value, data) {
                if (!value) return true;
                return data?.caption?.trim().toLowerCase().indexOf(value?.trim().toLowerCase()) !== -1;
            },
            // 跳转详情
            handleDetail(data) {
                utils.goToDetail(data, {
                    query: {
                        activeName: 'structure'
                    }
                });
                // let className = data.oid.split(':')[1];
                // let classNameMap = {
                //     // 部件
                //     'erd.cloud.pdm.part.entity.EtPart': this.handleToPartDetail
                // };
                // classNameMap[className](data, className);
            },
            // handleToPartDetail(data) {
            //     const { prefixRoute, resourceKey } = this.$route?.meta || {};
            //     this.$router.push({
            //         path: `${prefixRoute.split(resourceKey)[0]}erdc-part/part/detail`,
            //         query: {
            //             ..._.pick(this.$route.query, (value, key) => {
            //                 return ['pid', 'typeOid'].includes(key) && value;
            //             }),
            //             oid: data.oid
            //         }
            //     });
            // },
            handleLevelChange() {
                this.getTreeData();
            },
            handleReset() {
                this.levelConfig.level = '0';
                this.keyword = '';
                this.refreshTree(this.rootData.oid);
            },
            getIconClass(row) {
                return utils.getIconClass(row);
            },
            // 往某个节点插入数据(显示)
            appendToNode(data) {
                this.$nextTick(() => {
                    let node = {};
                    // 俩种替代关系
                    let replaceArr = [
                        'erd.cloud.pdm.part.entity.EtPartAlternateLink',
                        'erd.cloud.pdm.part.entity.EtPartSubstituteLink'
                    ];
                    node = this.$refs.constructionTree.getNode(this.info.id);
                    // 先移除再显示,防止重复
                    if (!_.isEmpty(this.displayData)) {
                        this.displayData = this.displayData.filter((item) => {
                            if (item.parentOid == node.data.oid) {
                                this.$refs.constructionTree.remove(item, node.data.id);
                            }
                            return item.parentOid != node.data.oid;
                        });
                    }
                    // 显示出的其他对象都禁用,只有替代部件可以点击
                    let list = [];
                    list = data.map((item) => {
                        return {
                            ...item,
                            // 加上父级id,知道是属于哪个父的
                            parentOid: this.info?.oid,
                            disabled: !replaceArr.includes(item.idkey),
                            // 是否为替换部件的标识
                            isReplacePart: replaceArr.includes(item.idkey),
                            isDisplay: true,
                            // 防止相同子节点重复出现问题
                            id: item.id + parseInt(Math.random() * 1000)
                        };
                    });
                    // 添加操作
                    list.forEach((item) => {
                        this.displayData.push(item);
                        this.$refs.constructionTree.append(item, node.data.id);
                    });
                });
            },
            // 隐藏
            removeNode() {
                this.$nextTick(() => {
                    let node = {};
                    node = this.$refs.constructionTree.getNode(this.info.id);
                    // 通过父节点去过滤
                    this.displayData = this.displayData.filter((item) => {
                        if (item.parentOid == node.data.oid) {
                            this.$refs.constructionTree.remove(item, node.data.id);
                        }
                        return item.parentOid != node.data.oid;
                    });
                });
            },
            // 获取替换前和替换后的信息
            getParentInfo() {
                let node = {};
                node = this.$refs.constructionTree.getNode(this.info.id);
                return node?.parent?.data;
            },
            //获取整个树的数据
            getTileTreeData() {
                let data = TreeUtil.flattenTree2Array([this.rootData]).map((item) => {
                    return {
                        oid: item?.rawData?.oid?.value
                    };
                });
                return data;
            }
        }
    };
});
