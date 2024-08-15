/**
 * @description 对象结构组件
 */
define([
    'text!' + ELMP.func('erdc-document/components/PdmObjectConstruction/index.html'),
    ELMP.func('erdc-document/components/PdmObjectConstruction/store.js'),
    'css!' + ELMP.func('erdc-document/components/PdmObjectConstruction/index.css')
], function (template, store) {
    const EventBus = require('EventBus');
    const ErdcKit = require('erdc-kit');
    const ErdcStore = require('erdcloud.store');
    ErdcStore.registerModule('PdmObjectConstruction', store);

    return {
        name: 'PdmObjectConstruction',
        template,
        components: {
            // 标题组件
            FormPageTitle: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/FormPageTitle/index.js')),
            // 结构顶板操作组件
            PdmConstructionOperation: ErdcKit.asyncComponent(
                ELMP.func('erdc-document/components/PdmObjectConstruction/components/PdmConstructionOperation/index.js')
            ),
            FamIcon: ErdcKit.asyncComponent(ELMP.resource('erdc-components/FamIcon/index.js')),
            ObjectConstruction: ErdcKit.asyncComponent(ELMP.resource('erdc-cbb-components/ObjectConstruction/index.js'))
        },
        props: {
            // 通用页面父组件的实例
            vm: [Object]
        },
        data() {
            return {
                i18nPath: ELMP.func('erdc-document/locale/index.js'),
                // 节点信息
                info: {},
                // tab框的配置
                tabsConfig: {},
                resolve: [],
                node: []
            };
        },
        computed: {
            getLinkAttrName() {
                return 'usageLinkOid';
            },
            getOid() {
                return this?.vm?.oid || this.vm?.containerOid || '';
            },
            getClassName() {
                return this.getOid?.split(':')[1] || '';
            },
            // 是否文档结构
            isDocument() {
                return this.getClassName == 'erd.cloud.cbb.doc.entity.EtDocument';
            },
            // 左侧页头标题
            leftTitle() {
                return this.isDocument ? this.i18n['文档结构树'] : this.i18n['模型结构树'];
            },
            // 右侧页头标题
            rightTitle() {
                return this.info?.caption || '';
            },
            // 右侧页头tag页签
            tagName() {
                return this.info?.['lifecycleStatus.status']?.displayName || '';
            },
            // 对象图标
            icon() {
                return this.info?.icon || '';
            }
        },
        created() {
            this.tabsConfig = {
                ConstructionVisualization: {
                    props: {
                        // 图档
                        showTools: !this.isDocument
                    },
                    event: {
                        tabClick: function () {}
                    }
                },
                ConstructionList: {
                    props: {
                        needBomView: false
                    },
                    event: {
                        tabClick: function () {},
                        refresh: this.refresh,
                        refreshNode: this.refreshNode
                    }
                }
            };
        },
        mounted() {
            this.$nextTick(() => {
                document.querySelector('#pane-structure').style.padding = '0';
            });
            // 刷新树结构
            EventBus.on('refresh:structure', (vet, data) => {
                // 这里refresh:structure同时被部件和模型复用到了, 但是另外两个又不能调下面的/struct/queryChildByLevel接口, 所以在这里判断一下
                if (this.className === 'erd.cloud.cbb.doc.entity.EtDocument') {
                    this.refreshTree(data);
                }
            });
        },
        methods: {
            updateInfo(info) {
                this.info = info;
            },
            // 刷新根节点方法
            refresh(oid) {
                this.vm.refresh(oid);
                // // 刷新对象详情
                this.vm.getAttr(oid).then((res) => {
                    let data = Object.assign(
                        ErdcKit.deserializeAttr(res?.rawData, {
                            // 需要单独处理得属性
                            valueMap: {
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
                        res
                    );

                    this.$router.replace({
                        path: this.$route.path,
                        query: {
                            ..._.pick(this.$route.query, (value, key) => {
                                return ['pid', 'typeOid'].includes(key) && value;
                            }),
                            oid: data.oid
                        }
                    });
                });
            },
            // 局部更新某个节点
            refreshNode(res) {
                // 刷新对象详情
                let data = Object.assign(
                    ErdcKit.deserializeAttr(res?.rawData, {
                        // 需要单独处理得属性
                        valueMap: {
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
                    res
                );
                this.$refs.ObjectConstruction.getRefreshNode(data);
            },
            // 设置要更新得节点得新信息
            getRefreshNode(data) {
                let objectConstruction = this.$refs.ObjectConstruction || this.$children[0];
                let constructionTree = objectConstruction.getTreeInstance();
                let currentNode = constructionTree.getAllNodes().find((v) => {
                    return v.data.oid == this.info.oid;
                });
                // 改变数据
                this.$set(currentNode.data, 'iterationInfo.state', data['iterationInfo.state']);
                this.$set(currentNode.data, 'oid', data['oid']);
                this.$set(currentNode.data, 'leaf', data['leaf']);
                this.$set(currentNode.data, 'icon', data['icon']);
                this.$set(currentNode, 'isLeaf', data['leaf']);
                this.$set(currentNode.data, 'label', data['caption']);
                this.$set(currentNode.data, 'caption', data['caption']);
                if (currentNode) {
                    currentNode.loaded = false;
                    currentNode.expand(); // 主动
                    constructionTree.setCurrentKey(currentNode.data.oid);
                    this.info = data;
                }
            },
            refreshTree(data) {
                this.node.childNodes = [];
                this.loadNode(this.node, this.resolve, data);
            },
            setTabs() {
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
                                        ELMP.func(
                                            'erdc-document/components/PdmObjectConstruction/components/PdmObjectAttrInfo/index.js'
                                        )
                                    )
                                },
                                attrs: {
                                    disabled: false,
                                    lazy: true
                                }
                            },
                            // 模型才需要这个tab页
                            ...(this.getClassName == 'erd.cloud.pdm.epm.entity.EpmDocument'
                                ? [
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
                                              disabled: this.getClassName !== 'erd.cloud.pdm.epm.entity.EpmDocument',
                                              lazy: true
                                          },
                                          props: {
                                              showTools: true
                                          }
                                      }
                                  ]
                                : []),
                            {
                                label: this.i18n['结构'],
                                name: 'substructure',
                                component: {
                                    componentName: 'ConstructionList',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.func(
                                            'erdc-document/components/PdmObjectConstruction/components/PdmConstruction/index.js'
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
                                name: 'inUse',
                                component: {
                                    componentName: 'InUse',
                                    componentUrl: ErdcKit.asyncComponent(
                                        ELMP.resource('erdc-cbb-components/InUse/index.js')
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
            }
        }
    };
});
