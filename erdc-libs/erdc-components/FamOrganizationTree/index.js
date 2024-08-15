define([
    'text!' + ELMP.resource('erdc-components/FamOrganizationTree/template.html'),
    'erdcloud.i18n',
    ELMP.resource('erdc-components/FamOrganizationTree/locale/index.js'),
    'css!' + ELMP.resource('erdc-components/FamOrganizationTree/style.css'),
    ELMP.resource('erdc-app/api/organization.js')
], function (template, i18n, i18nData) {
    const FamKit = require('fam:kit');
    const api = require(ELMP.resource('erdc-app/api/organization.js'));
    const store = require('fam:store');
    const i18nLocal = i18n.wrap(i18nData);
    let lockedOrgObject = null;
    return {
        template,
        props: {
            showCount: {
                type: Boolean,
                default: true
            },
            lockOrg: Boolean
        },
        data() {
            return {
                // 国际化locale文件地址
                tree: [],
                treeType: 'lazy',
                loading: false,
                treeHeight: '100%',
                defaultExpandedKeys: [],
                specialOrg: [],
                searchStr: '',
                treeData: [],
                i18nMappingObj: {}
            };
        },
        mounted() {
            this.specialOrg = store.getters.specialConstName('specialOrganization');
            this.$nextTick(() => {
                if (this.$refs.header.clientHeight) {
                    this.treeHeight = `calc(100% - ${this.$refs.header.clientHeight + 12}px)`;
                }
            });
        },
        methods: {
            init(currentKey) {
                this.treeType = 'lazy';
                this.loading = true;
                this.fetchOrgByLayer()
                    .then((data) => {
                        let treeData = data?.data || [];
                        this.tree = treeData;
                        this.$nextTick(() => {
                            // 设置第一个节点选中
                            if (treeData && treeData.length > 0) {
                                // 表格更新取当前树节点
                                let key = treeData[0].key;
                                let node = this.$refs.orgComponentTree.getNode(key);
                                node.expanded = false; //收起当前节点
                                node.loaded = false;
                                this.defaultExpandedKeys = [treeData[0].key];
                                setTimeout(() => {
                                    this.$refs['orgComponentTree']?.setCurrentKey(currentKey);
                                }, 500);
                            }
                        });
                    })
                    .finally(() => (this.loading = false));
            },
            loadOrganization({ data: nodeData }, resolve) {
                this.fetchOrgByLayer(nodeData ? { parentKey: nodeData.key } : {}).then((data) => {
                    let treeData = data?.data || [];
                    // 把已离职，已禁用，未分配部门抽离，重新排序放到最后
                    let specialOrgArr = [];
                    let entityOrg = [];
                    let lockOrg = [];
                    treeData.forEach((item) => {
                        if (this.specialOrg.indexOf(item.identifierNo) != -1) {
                            specialOrgArr.push(item);
                        } else {
                            entityOrg.push(item);
                        }
                    });
                    if (specialOrgArr.length && this.lockOrg) {
                        let lockUsersCount = 0;
                        this.$famHttp({
                            type: 'get',
                            url: '/fam/user/list/lock'
                        })
                            .then((resp) => {
                                if (resp && resp.success) {
                                    lockUsersCount = resp.data.length;
                                }
                            })
                            .then(() => {
                                lockedOrgObject = {
                                    parentKey: nodeData.oid,
                                    displayName: i18nLocal.t('Locked'),
                                    appName: 'plat',
                                    addSub: true,
                                    edit: true,
                                    delete: true,
                                    leaf: true,
                                    level: 0,
                                    linkCount: lockUsersCount,
                                    disabled: false,
                                    identifierNo: 'ORG999999',
                                    status: 'true',
                                    key: 'ORG999999',
                                    principalTarget: 'ORG',
                                    name: i18nLocal.t('Locked'),
                                    isShare: false
                                };
                                lockOrg.push(lockedOrgObject);
                                treeData = [...entityOrg, ...specialOrgArr, ...lockOrg];
                                resolve(treeData);
                            });
                    } else {
                        treeData = [...entityOrg, ...specialOrgArr, ...lockOrg];
                        resolve(treeData);
                    }
                    if (!nodeData) {
                        this.$nextTick(() => {
                            this.onNodeClick(treeData[0]);
                            this.defaultExpandedKeys = [treeData[0].key];
                            this.$refs['orgComponentTree']?.setCurrentKey(treeData[0].key);
                        });
                    }
                });
            },
            fetchOrgByLayer(params = {}) {
                params.isGetLinkCount = false; // 需要统计部门人员数据返回
                return api.fetchOrganizationListByParentKey(params);
            },
            // 刷新某个树节点
            refreshNode(key, parentKey) {
                // 获取当前节点，key可以在@node-click和:load绑定函数的回调参数node用变量存储后有需要刷新的地方取node.key
                let refreshKey = parentKey != -1 && parentKey ? parentKey : key;

                let node =
                    this.$refs[this.treeType == 'search' ? 'orgComponentTreeSearch' : 'orgComponentTree'].getNode(
                        refreshKey
                    );
                //  设置未进行懒加载状态
                node.loaded = false;
                // 重新展开节点就会间接重新触发load达到刷新效果
                node.expand();
                if (node.data) {
                    this.onNodeClick(node?.data);
                }
            },
            // 刷新树
            refreshTree() {
                this.init();
            },
            // 更新树
            updateTree(val, type) {
                let currentKey = val.parentKey ? val.parentKey : val.key;
                if (type) currentKey = val.parentKey;
                if (type === 'add' || type == 'updatedTree') currentKey = val.key;
                this.init(currentKey);
            },
            onNodeClick(...args) {
                this.$emit('nodeClick', ...args);
            },
            // 关键词搜索
            fnSearch() {
                // 如果搜索文本为空，则获取树状展示
                if (this.searchStr) {
                    this.loading = true;
                    this.treeData = [];
                    this.treeType = 'search';
                    this.$famHttp({
                        url: '/fam/search',
                        method: 'post',
                        data: {
                            className: store.getters.className('organization'),
                            pageIndex: 1,
                            pageSize: 100,
                            conditionDtoList: [
                                {
                                    attrName: 'nameI18nJson', // 根据名称来搜索
                                    oper: 'LIKE',
                                    value1: this.searchStr
                                }
                            ]
                        }
                    })
                        .then((res) => {
                            let rawDataArr = res?.data?.records || [];
                            let orgData = rawDataArr.map((item) => {
                                let extractRaw = {};
                                let attrRawList = item.attrRawList || [];
                                delete item.attrRawList;
                                if (attrRawList && attrRawList.length > 0) {
                                    extractRaw = FamKit.deserializeArray(attrRawList, {
                                        valueMap: {
                                            parentRef({ oid }) {
                                                return oid;
                                            }
                                        }
                                    });
                                    extractRaw.name = FamKit.translateI18n(extractRaw.nameI18nJson.value);
                                    item.displayName = item.name = FamKit.translateI18n(extractRaw.nameI18nJson.value);
                                    item.parentKey = extractRaw.parentRef;
                                    item.key = extractRaw.oid;
                                }
                                return { ...item, ...extractRaw };
                            });
                            if (lockedOrgObject && lockedOrgObject.displayName.indexOf(this.searchStr) > -1) {
                                orgData.push(lockedOrgObject);
                            }
                            this.treeData = orgData || [];
                            this.$nextTick(() => {
                                // 设置第一个节点选中
                                if (this.treeData && this.treeData.length > 0) {
                                    this.onNodeClick(this.treeData[0]);
                                    setTimeout(() => {
                                        this.$refs['orgComponentTreeSearch']?.setCurrentKey(this.treeData[0].key);
                                    }, 200);
                                }
                            });
                        })
                        .finally(() => (this.loading = false));
                } else {
                    this.init();
                }
            }
        },
        destroyed() {
            lockedOrgObject = null;
        }
    };
});
