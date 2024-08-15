define([
    'text!' + ELMP.resource('system-operation-menu/components/UsageScenarioTree/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-operation-menu/components/UsageScenarioTree/style.css')
], function (template, ErdcKit) {
    const FamKit = require('fam:kit');

    return {
        template,
        components: {
            FamInfoTitle: FamKit.asyncComponent(ELMP.resource('erdc-components/FamInfo/FamInfoTitle.js'))
        },
        data() {
            return {
                // 国际化locale文件地址
                i18nLocalePath: ELMP.resource('system-operation-menu/locale/index.js'),
                // // 国际化页面引用对象
                i18nMappingObj: {
                    usageScenario: this.getI18nByKey('usageScenario')
                },
                loading: true,
                treeHeight: '100%',
                defaultExpandedKeys: [],
                keyword: '',
                treeData: []
            };
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                // val值存在代表编辑，编辑完后需要再次高亮到当前的选项，无需默认选择第一个
                this.loading = true;
                this.fetchTreeDataByLayer()
                    .then((data) => {
                        let treeData = data?.data || [];
                        this.initIcons(treeData);
                        this.treeData = treeData;
                        this.$nextTick(() => {
                            // 设置第一个节点选中
                            if (treeData && treeData.length > 0) {
                                let userGroupNode = '';
                                // 遍历树，找到最前的一个群组默认选中
                                let queue = [...treeData];
                                // 队列中有数据，则一直遍历
                                while (queue.length) {
                                    const item = queue.shift(); // 每次遍历获取并且去除
                                    // 逻辑处理（找到不是应用的项，则跳出循环）
                                    if (!item?.idKey?.includes('Application') && item.category !== undefined) {
                                        userGroupNode = item;
                                        break;
                                    }
                                    // 如果有子项，则加入队列
                                    if (item.childList && item.childList.length > 0) {
                                        queue.unshift(...item.childList); // 这里使用unshift ，不用push，因为要先把第一个以及其子孙先遍历完，再遍历后面的
                                    }
                                }
                                if (userGroupNode) {
                                    this.onNodeClick(userGroupNode);
                                    this.defaultExpandedKeys = [userGroupNode?.oid];
                                    setTimeout(() => {
                                        this.$refs['componentTreeSearch']?.setCurrentKey(userGroupNode?.oid);
                                    }, 200);
                                }
                            }
                        });
                    })
                    .catch((err) => {
                        // this.$message({
                        //     message: err?.data?.message || err?.data || err,
                        //     type: 'error',
                        //     showClose: true
                        // });
                    })
                    .finally(() => {
                        this.loading = false;
                    });
                if (this.$refs.header.clientHeight) {
                    this.treeHeight = `calc(100vh - 168px)`;
                }
            },
            fetchTreeDataByLayer(params = {}) {
                return this.$famHttp({
                    url: `/fam/menuaction/module/listAllTree`,
                    params: { className: 'erd.cloud.foundation.core.menu.entity.MenuModule', keyword: this.keyword },
                    method: 'get'
                });
            },
            // 刷新某个树节点
            refreshNode(key) {
                // 获取当前节点，key可以在@node-click和:load绑定函数的回调参数node用变量存储后有需要刷新的地方取node.key
                let node = this.$refs['componentTreeSearch'].getNode(key);
                //  设置未进行懒加载状态
                node.loaded = false;
                // 重新展开节点就会间接重新触发load达到刷新效果
                node.expand();
                if (node?.data) {
                    this.onNodeClick(node.data);
                }
            },
            // 刷新数据，全量
            refreshTree(data) {
                this.init(data);
            },
            onNodeClick(...args) {
                // 如果点击的是应用，则不做任何处理
                if (!args[0]?.idKey?.includes('Application') && args[0].category !== undefined) {
                    this.$emit('nodeClick', ...args);
                }
            },
            initIcons(applications) {
                if (applications) {
                    applications.forEach((app) => {
                        app.icon && (app.icon = ErdcKit.imgUrlCreator(app.icon));
                    });
                }
            },
            isApplication(data) {
                return data.idKey === this.$store.getters.className('Application');
            }
        }
    };
});
