define([
    'text!' + ELMP.resource('erdc-components/FamUserGroupTree/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('erdc-components/FamUserGroupTree/style.css')
], function (template, ErdcKit) {
    const store = require('fam:store');

    return {
        template,
        props: {
            isShowCount: {
                type: Boolean,
                default: false
            },
            noCountLevel: {
                type: Array,
                default: () => {
                    return [];
                }
            }
        },
        data() {
            return {
                tree: [],
                treeType: 'search',
                loading: true,
                treeHeight: '100%',
                defaultExpandedKeys: [],
                searchStr: '',
                treeData: [],
                treeDataClone: []
            };
        },
        watch: {
            searchStr(nv) {
                this.$refs.componentTreeSearch.filter(nv);
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init(val) {
                // val值存在代表编辑，编辑完后需要再次高亮到当前的选项，无需默认选择第一个
                this.loading = true;
                this.fetchTreeDataByLayer()
                    .then((data) => {
                        let treeData = data?.data || [];
                        this.treeData = treeData;
                        this.initIcons(treeData);
                        this.treeDataClone = ErdcKit.deepClone(treeData);
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
                                    if (!item?.idKey?.includes('Application')) {
                                        userGroupNode = item;
                                        break;
                                    }
                                    // 如果有子项，则加入队列
                                    if (item.childList && item.childList.length > 0) {
                                        queue.unshift(...item.childList); // 这里使用unshift ，不用push，因为要先把第一个以及其子孙先遍历完，再遍历后面的
                                    }
                                }
                                if (userGroupNode) {
                                    if (val) {
                                        userGroupNode = _.isObject(val)
                                            ? val
                                            : this.$refs['componentTreeSearch']?.getNode(val);
                                    }
                                    this.onNodeClick(userGroupNode?.data || userGroupNode);
                                    this.defaultExpandedKeys = [userGroupNode?.key];
                                    setTimeout(() => {
                                        this.$refs['componentTreeSearch']?.setCurrentKey(userGroupNode?.key);
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
                    this.treeHeight = `calc(100vh - ${this.$refs.header.clientHeight + 147}px)`;
                }
            },
            fetchTreeDataByLayer(params = {}) {
                params = Object.assign(
                    {
                        className: store.getters.className('Group'), // 实体类名
                        isGetLinkCount: true, // 需要统计人数
                        filterThreeMember: !this.$store?.state?.app?.threeMemberEnv
                    },
                    params
                );
                return this.$famHttp({
                    url: `/fam/listAllTree`,
                    headers: {
                        'App-Name': 'ALL'
                    },
                    data: params,
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
                if (node.data) {
                    this.onNodeClick(node.data);
                }
            },
            // 刷新数据，全量
            refreshTree(data) {
                this.init(data);
            },
            onNodeClick(...args) {
                // 如果点击的是应用，则不做任何处理
                if (!args[0]?.idKey?.includes('Application')) {
                    this.$emit('nodeClick', ...args);
                }
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.name.indexOf(value) !== -1;
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
            // 关键词搜索
            // fnSearch() {
            //     // 如果搜索文本为空，则获取树状展示
            //     if (this.searchStr) {
            //         this.loading = true;
            //         this.treeData = [];
            //         this.treeType = 'search';
            //         this.$famHttp({
            //             url: '/fam/search',
            //             method: 'post',
            //             data: {
            //                 className: 'erd.cloud.foundation.principal.entity.Group',
            //                 pageIndex: 1,
            //                 pageSize: 100,
            //                 conditionDtoList: [
            //                     {
            //                         attrName: 'nameI18nJson', // 根据名称来搜索
            //                         oper: 'LIKE',
            //                         value1: this.searchStr
            //                     }
            //                 ]
            //             }
            //         })
            //             .then((res) => {
            //
            //                 let rawDataArr = res?.data?.records || [];
            //                 let orgData = rawDataArr.map((item) => {
            //                     let extractRaw = {};
            //                     let attrRawList = item.attrRawList || [];
            //                     delete item.attrRawList;
            //                     if (attrRawList && attrRawList.length > 0) {
            //                         extractRaw = FamKit.deserializeArray(attrRawList, {
            //                             valueMap: {
            //                                 nameI18nJson({ displayName = '', value, oid }) {
            //                                     // 国际化处理
            //                                     let lan = utils.getLanguageBySystem();
            //                                     let lanValue = value
            //                                         ? { CN: value.zh_cn || value.value, EN: value.en_us || value.value }
            //                                         : '';
            //                                     return lanValue[lan] || '';
            //                                 },
            //                                 parentRef({ displayName = '', value, oid }) {
            //                                     return oid;
            //                                 }
            //                             }
            //                         });
            //                         item.displayName = item.name = extractRaw.nameI18nJson;
            //                         item.parentKey = extractRaw.parentRef;
            //                         item.key = extractRaw.oid;
            //                     }
            //                     return { ...item, ...extractRaw };
            //                 });
            //                 this.treeData = orgData || [];
            //                 this.$nextTick(() => {
            //                     // 设置第一个节点选中
            //                     if (this.treeData && this.treeData.length > 0) {
            //                         this.onNodeClick(this.treeData[0]);
            //                         setTimeout(() => {
            //                             this.$refs['componentTreeSearch']?.setCurrentKey(this.treeData[0].key);
            //                         }, 200);
            //                     }
            //                 });
            //
            //             })
            //             .finally(() => (this.loading = false));
            //     } else {
            //         this.init();
            //     }
            // }
        }
    };
});
