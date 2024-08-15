define([
    'text!' + ELMP.resource('system-queue/components/QueueTree/index.html'),
    'erdc-kit',
    'css!' + ELMP.resource('system-queue/components/QueueTree/style.css')
], function (template, ErdcKit) {
    return {
        template,
        props: {
            // 显示隐藏
            visible: {
                type: Boolean,
                default: () => {
                    return false;
                }
            }
        },
        components: {},
        data() {
            return {
                i18nLocalePath: ELMP.resource('system-queue/locale/index.js'),
                searchValue: '',
                treeList: [],
                defaultProps: {
                    label: 'displayName',
                    children: 'serviceInfoList'
                },
                defaultExpandedKeys: [],
                treeLoading: false
            };
        },
        watch: {
            searchValue(val) {
                this.$refs.tree.filter(val);
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
            }
        },
        mounted() {
            this.getTreeList();
        },
        methods: {
            /**
             * 刷新树列表
             * @param {*} oid 新增/修改的vid,用于回显选中当前树节点
             */
            refresh(oid) {
                this.getTreeList(oid);
            },
            /**
             * 获取树列表
             * @param {*} oid
             */
            getTreeList(oid) {
                this.treeLoading = true;
                this.$famHttp({
                    url: '/fam/core/common/getAppServerTree',
                    method: 'get',
                    params: {
                        isJobNode: true
                    }
                })
                    .then((resp) => {
                        const { data } = resp || [];
                        this.treeList = [
                            {
                                displayName: '全部',
                                oid: '-1',
                                serviceInfoList: [...data]
                            }
                        ];
                        this.initIcons(data);
                        let selectData = {};
                        let expandData = {};
                        const findExpandData = (dataList, oid) => {
                            if (!oid) {
                                selectData = this.treeList[0];
                                return;
                            }
                            dataList.find((item) => {
                                if (item.oid === oid) {
                                    selectData = item;
                                    expandData = item;
                                }
                                if (item?.serviceInfoList?.length) {
                                    findExpandData(item.serviceInfoList, oid);
                                }
                            });
                        };
                        findExpandData(data, oid);
                        this.defaultExpandedKeys.push([expandData.oid]);
                        this.$nextTick(() => {
                            this.onCheck(selectData, this.$refs.tree.getNode(selectData));
                        });
                    })
                    .catch((error) => {
                        console.error(error);
                    })
                    .finally(() => {
                        this.treeLoading = false;
                    });
            },
            /**
             * 搜索过滤
             * @param {*} value
             * @param {*} data
             * @returns
             */
            filterSearch(value, data) {
                if (!value) {
                    return true;
                }
                // 不区分英文字母大小写
                let newVal = data?.displayName?.toUpperCase() || '';
                return newVal.indexOf(value.toUpperCase()) !== -1;
            },
            /**
             * 查看详情
             * @param  {...any} arg
             */
            onCheck(data, node) {
                let appNames = [];
                if (node.level === 2) {
                    appNames = data?.serviceInfoList.map((item) => {
                        return item.identifierNo;
                    });
                } else {
                    appNames = [data.identifierNo];
                }
                appNames = _.compact(appNames);
                this.$emit('onsubmit', { ...data, appNames });
            },
            mouseenter(scope) {
                const { data } = scope;
                this.$set(data, 'show', true);
            },
            mouseleave(scope) {
                const { data } = scope;
                this.$set(data, 'show', false);
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
